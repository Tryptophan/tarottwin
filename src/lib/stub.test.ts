import { describe, expect, it } from 'vitest'
import { stubState, STUB_SPECS, STUB_USER_ID } from './stub'
import { isValidId } from './twinLink'
import { sharedStreak, streak } from './streak'
import { twinRows } from './twinList'
import { DECK } from '../data/cards'

const NOW = new Date('2026-11-03T12:00:00Z')
const TODAY = '2026-11-03'

describe('stubbed profile', () => {
  const s = stubState(NOW)
  const byName = (n: string) => Object.values(s.friends).find((f) => f.name === n)!
  const run = (n: string) => sharedStreak((s.history[byName(n).id] ?? []).map((e) => e.date), byName(n).theirDates ?? [], TODAY)

  it('is a valid profile: ids, secrets and cards', () => {
    expect(isValidId(s.userId)).toBe(true)
    expect(s.userId).toBe(STUB_USER_ID)
    expect(Object.keys(s.friends)).toHaveLength(STUB_SPECS.length)
    const secrets = Object.values(s.friends).map((f) => f.secret)
    expect(new Set(secrets).size).toBe(secrets.length)
    for (const f of Object.values(s.friends)) {
      expect(isValidId(f.id)).toBe(true)
      expect(f.secret).toMatch(/^[0-9a-f]{32}$/)
    }
    const ids = new Set(DECK.map((c) => c.id))
    for (const e of Object.values(s.history).flat()) [e.mine, e.theirs, e.bridge].forEach((c) => expect(ids.has(c)).toBe(true))
    s.unlocked.forEach((c) => expect(ids.has(c)).toBe(true))
    expect(s.unlocked.length).toBeGreaterThan(10)
    expect(s.unlocked.length).toBeLessThan(DECK.length)
  })

  it('is stable for a given day and moves with the date', () => {
    expect(stubState(NOW)).toEqual(s)
    expect(stubState(new Date('2026-11-10T01:00:00Z')).history[Object.keys(s.history)[0]][0].date).toBe('2026-11-09')
  })

  it('covers every state the app shows', () => {
    const rows = twinRows(s.friends, s.history, TODAY)
    expect(rows.some((r) => r.done)).toBe(true) // on cooldown
    expect(rows.some((r) => !r.done)).toBe(true) // ready
    expect(byName('Dov').joinVia).toBeDefined() // waiting to sync
    expect(byName('Dov').syncedAt).toBeUndefined()
    expect(byName('Eli').theirDates).toEqual([]) // synced, nothing yet
    expect(s.history[byName('Eli').id]).toEqual([])
    expect(byName('Ingrid Maximilliana von Habsburg-Lothringen').name.length).toBeGreaterThan(40) // long name
    expect(run('Ada')).toBe(4) // alive from yesterday, today not finished
    expect(run('Bea')).toBe(7)
    expect(run('Cal')).toBe(2) // he has not read today: only yesterday and the day before count, and it is still alive
    expect(run('Fay')).toBe(0) // broken
    expect(run('Gus')).toBe(45)
    expect(run('Hal')).toBe(0)
    expect(run('Jo')).toBe(1)
    expect(byName('Hal').theirDates).toContain(TODAY)
    expect(streak(s.history[byName('Gus').id], TODAY)).toBe(45)
  })
})
