import { describe, expect, it } from 'vitest'
import { DECK } from '../data/cards'
import { leanOf } from '../data/oracle'
import { WINDOW_MS, cleanQuestion, drawOracle, msUntilNextWindow, normalizeQuestion, oracleProse, toEntry, verdictOf, windowStart } from './oracle'
import { _resetCache, getState, update, withOracle } from './storage'

describe('oracle', () => {
  it('has a lean for every card, within -2..2', () => {
    for (const c of DECK) {
      expect(Number.isInteger(leanOf(c.id))).toBe(true)
      expect(Math.abs(leanOf(c.id))).toBeLessThanOrEqual(2)
    }
    expect(leanOf('major-19-the-sun')).toBe(2)
    expect(leanOf('major-16-the-tower')).toBe(-2)
    expect(leanOf('cups-10')).toBe(2)
    expect(leanOf('swords-10')).toBe(-2)
  })
  it('windows are fixed 6h UTC slots', () => {
    const t = Date.parse('2025-03-09T17:59:59.999Z')
    expect(new Date(windowStart(t)).toISOString()).toBe('2025-03-09T12:00:00.000Z')
    expect(msUntilNextWindow(t)).toBe(1)
    expect(windowStart(Date.parse('2025-03-09T18:00:00Z'))).toBe(windowStart(t) + WINDOW_MS)
  })
  it('normalizes questions', () => {
    expect(normalizeQuestion('  Should I   GO?! ')).toBe('should i go')
    expect(cleanQuestion('x'.repeat(500))).toHaveLength(140)
  })
  it('is deterministic per user, question and window', () => {
    const t = Date.parse('2025-03-09T13:00:00Z')
    const a = drawOracle('u1', 'Should I go?', t)
    expect(drawOracle('u1', ' should i go ', t + 3600_000)).toEqual(a)
    expect(drawOracle('u1', 'should i go', t + WINDOW_MS)).not.toEqual(a)
    expect(new Set(a.cards.map((d) => d.card.id)).size).toBe(3)
  })
  it('verdict thresholds and spread of outcomes', () => {
    expect(verdictOf(2)).toBe('yes')
    expect(verdictOf(-2)).toBe('no')
    expect(verdictOf(1.5)).toBe('maybe')
    const seen = { yes: 0, no: 0, maybe: 0 }
    for (let i = 0; i < 600; i++) seen[drawOracle(`u${i}`, 'q', 0).verdict]++
    for (const v of Object.values(seen)) expect(v).toBeGreaterThan(100)
  })
  it('prose ends with a closing line and is stable', () => {
    const r = drawOracle('u1', 'will it rain', 0)
    expect(oracleProse(r, 'will it rain')).toBe(oracleProse(r, 'Will it rain?'))
    expect(oracleProse(r, 'will it rain')).toMatch(/\.$/)
  })
  it('journal keeps one entry per window', () => {
    localStorage.clear()
    _resetCache()
    const r = drawOracle('u1', 'q', 0)
    update((s) => withOracle(s, toEntry('q', r)))
    update((s) => withOracle(s, toEntry('other', r)))
    expect(getState().oracle).toHaveLength(1)
  })
})
