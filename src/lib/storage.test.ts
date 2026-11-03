import { beforeEach, describe, expect, it } from 'vitest'
import {
  withPrints,
  _resetCache, loadState, withFriend, withName, withReading, withUnlocked, withoutFriend,
  type AppState, type HistoryEntry,
} from './storage'

const base = (): AppState => ({ userId: 'u', userSecret: 'us', inviteSecret: 'is', revoked: [], name: '', onboarded: false, friends: {}, history: {}, unlocked: [], prints: {}, oracle: [] })
const e = (date: string, mine = 'm'): HistoryEntry => ({ date, mine, theirs: 't', bridge: 'b' })

describe('updaters', () => {
  it('withName trims and onboards, without mutating', () => {
    const s = base()
    const n = withName(s, '  Ann ')
    expect(n.name).toBe('Ann')
    expect(n.onboarded).toBe(true)
    expect(s.name).toBe('')
  })
  it('withFriend adds, trims, defaults, preserves addedAt', () => {
    const s1 = withFriend(base(), 'f', ' Bob ', 'sec', undefined, new Date('2025-01-01T00:00:00Z'))
    expect(s1.friends.f).toEqual({ id: 'f', name: 'Bob', secret: 'sec', addedAt: '2025-01-01T00:00:00.000Z' })
    const s2 = withFriend(s1, 'f', '  ', 'other', 'via', new Date('2026-01-01'))
    expect(s2.friends.f.name).toBe('Bob')
    expect(s2.friends.f.addedAt).toBe('2025-01-01T00:00:00.000Z')
    expect(s2.friends.f.secret).toBe('sec') // an existing bond keeps its secret
    expect(withFriend(base(), 'g', '', 'x').friends.g.name).toBe('Stranger')
  })
  it('withReading upserts by date and sorts desc', () => {
    let s = withReading(base(), 'f', e('2025-01-02'))
    s = withReading(s, 'f', e('2025-01-03'))
    s = withReading(s, 'f', e('2025-01-01'))
    s = withReading(s, 'f', e('2025-01-02', 'new'))
    expect(s.history.f.map((x) => x.date)).toEqual(['2025-01-03', '2025-01-02', '2025-01-01'])
    expect(s.history.f[1].mine).toBe('new')
  })
  it('withoutFriend remembers the bond secret so a stored join request cannot bring the friend back', () => {
    const s = withoutFriend(withFriend(base(), 'f', 'Bob', 'sec'), 'f')
    expect(s.revoked).toEqual(['sec'])
    expect(withoutFriend(s, 'nobody').revoked).toEqual(['sec'])
  })
  it('withoutFriend removes friend and history', () => {
    let s = withFriend(base(), 'f', 'Bob', 'a')
    s = withFriend(s, 'g', 'Cy', 'b')
    s = withReading(s, 'f', e('2025-01-01'))
    const r = withoutFriend(s, 'f')
    expect(r.friends.f).toBeUndefined()
    expect(r.history.f).toBeUndefined()
    expect(r.friends.g).toBeDefined()
    expect(s.friends.f).toBeDefined()
  })
})

describe('loadState', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetCache()
  })
  it('persists a generated userId across calls', () => {
    const a = loadState()
    expect(a.userId).toMatch(/^[0-9a-f]{20}$/)
    expect(loadState().userId).toBe(a.userId)
    _resetCache()
    expect(loadState().userId).toBe(a.userId)
  })
  it('tolerates corrupt JSON', () => {
    localStorage.setItem('tarottwin:v1', '{not json')
    const s = loadState()
    expect(s.userId).toBeTruthy()
    expect(s.friends).toEqual({})
    expect(loadState().userId).toBe(s.userId)
  })
  it('gives every profile a device secret and drops bonds saved before relay sync', () => {
    const old = { id: '0123456789abcdef0123', name: 'Old', addedAt: 'x' }
    const kept = { id: 'aaaaaaaaaaaaaaaaaaaa', name: 'New', addedAt: 'x', secret: 's' }
    localStorage.setItem('tarottwin:v1', JSON.stringify({ userId: 'abc', friends: { [old.id]: old, [kept.id]: kept }, history: { [old.id]: [e('2025-01-01')], [kept.id]: [e('2025-01-02')] } }))
    const s = loadState()
    expect(s.userSecret).toMatch(/^[0-9a-f]{64}$/)
    expect(Object.keys(s.friends)).toEqual([kept.id])
    expect(Object.keys(s.history)).toEqual([kept.id])
    expect(s.inviteSecret).toMatch(/^[0-9a-f]{32}$/)
    expect(s.revoked).toEqual([])
    expect(loadState().userSecret).toBe(s.userSecret)
    expect(loadState().inviteSecret).toBe(s.inviteSecret) // the invite link never changes
  })
  it('fills defaults for partial stored state', () => {
    localStorage.setItem('tarottwin:v1', JSON.stringify({ userId: 'abc', name: 'Z' }))
    const s = loadState()
    expect(s).toMatchObject({ userId: 'abc', name: 'Z', friends: {}, history: {}, onboarded: false })
  })
})

describe('unlocked cards', () => {
  it('withUnlocked adds new ids once and keeps the same state when nothing is new', () => {
    const s = withUnlocked(base(), 'a', 'b', 'a')
    expect(s.unlocked).toEqual(['a', 'b'])
    expect(withUnlocked(s, 'b')).toBe(s)
  })
  it('a saved pair reading unlocks its three cards', () => {
    expect(withReading(base(), 'f', e('2025-01-02')).unlocked.sort()).toEqual(['b', 'm', 't'])
  })
  it('older saves get their unlocked list from history', () => {
    localStorage.setItem('tarottwin:v1', JSON.stringify({ userId: 'u', name: 'x', onboarded: true, friends: {}, history: { f: [e('2025-01-01', 'cups-01')] } }))
    _resetCache()
    expect(loadState().unlocked.sort()).toEqual(['b', 'cups-01', 't'])
  })
})

describe('pulled prints', () => {
  it('records each print once and keeps different ones', () => {
    const a = { serial: 6, rarity: 'GOLD' as const }
    let s = withPrints(base(), ['x', a])
    expect(withPrints(s, ['x', { ...a }])).toBe(s)
    s = withPrints(s, ['x', { serial: 7, rarity: 'GOLD' }], ['y', a])
    expect(s.prints.x).toHaveLength(2)
    expect(s.prints.y).toEqual([a])
  })
})
