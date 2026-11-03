import { beforeEach, describe, expect, it } from 'vitest'
import {
  _resetCache, loadState, withFriend, withName, withReading, withUnlocked, withoutFriend,
  type AppState, type HistoryEntry,
} from './storage'

const base = (): AppState => ({ userId: 'u', name: '', onboarded: false, friends: {}, history: {}, unlocked: [] })
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
    const s1 = withFriend(base(), 'f', ' Bob ', new Date('2025-01-01T00:00:00Z'))
    expect(s1.friends.f).toEqual({ id: 'f', name: 'Bob', addedAt: '2025-01-01T00:00:00.000Z' })
    const s2 = withFriend(s1, 'f', '  ', new Date('2026-01-01'))
    expect(s2.friends.f.name).toBe('Bob')
    expect(s2.friends.f.addedAt).toBe('2025-01-01T00:00:00.000Z')
    expect(withFriend(base(), 'g', '').friends.g.name).toBe('Stranger')
  })
  it('withReading upserts by date and sorts desc', () => {
    let s = withReading(base(), 'f', e('2025-01-02'))
    s = withReading(s, 'f', e('2025-01-03'))
    s = withReading(s, 'f', e('2025-01-01'))
    s = withReading(s, 'f', e('2025-01-02', 'new'))
    expect(s.history.f.map((x) => x.date)).toEqual(['2025-01-03', '2025-01-02', '2025-01-01'])
    expect(s.history.f[1].mine).toBe('new')
  })
  it('withoutFriend removes friend and history', () => {
    let s = withFriend(base(), 'f', 'Bob')
    s = withFriend(s, 'g', 'Cy')
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
