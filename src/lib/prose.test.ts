import { describe, expect, it } from 'vitest'
import { DECK } from '../data/cards'
import { pairReading } from './reading'
import { dailyProse, streakBefore, twinProse } from './prose'

describe('prose', () => {
  const r = pairReading('a'.repeat(8), 'b'.repeat(8), '2026-01-01')
  const rev = pairReading('b'.repeat(8), 'a'.repeat(8), '2026-01-01')
  it('is identical for both friends', () => {
    expect(twinProse(r, r.date, 2)).toBe(twinProse(rev, rev.date, 2))
  })
  it('varies with streak lead but stays deterministic', () => {
    expect(twinProse(r, r.date, 0)).toBe(twinProse(r, r.date, 0))
    expect(twinProse(r, r.date, 0)).not.toBe(twinProse(r, r.date, 9))
  })
  it('never mentions the streak and is well formed for every card', () => {
    for (const c of DECK) {
      const t = dailyProse(c, '2026-01-01', 5)
      expect(t).not.toMatch(/streak|undefined|\{/i)
      expect(t.endsWith('.')).toBe(true)
    }
  })
  it('streakBefore ignores today', () => {
    expect(streakBefore(['2026-01-01', '2025-12-31', '2025-12-30'], '2026-01-01')).toBe(2)
    expect(streakBefore(['2026-01-01'], '2026-01-01')).toBe(0)
  })
})
