import { describe, expect, it } from 'vitest'
import { streak } from './streak'

const h = (...dates: string[]) => dates.map((date) => ({ date, mine: 'a', theirs: 'b', bridge: 'c' }))

describe('streak', () => {
  it('is 0 with no history', () => expect(streak([], '2026-11-03')).toBe(0))
  it('counts consecutive days ending today', () =>
    expect(streak(h('2026-11-03', '2026-11-02', '2026-11-01'), '2026-11-03')).toBe(3))
  it('stays alive when the last reading was yesterday', () =>
    expect(streak(h('2026-11-02', '2026-11-01'), '2026-11-03')).toBe(2))
  it('is broken after a missed day', () =>
    expect(streak(h('2026-11-01'), '2026-11-03')).toBe(0))
  it('stops at a gap', () =>
    expect(streak(h('2026-11-03', '2026-11-02', '2026-10-30'), '2026-11-03')).toBe(2))
  it('ignores duplicate dates and order', () =>
    expect(streak(h('2026-11-02', '2026-11-03', '2026-11-03'), '2026-11-03')).toBe(2))
  it('crosses month and year boundaries', () =>
    expect(streak(h('2027-01-01', '2026-12-31', '2026-12-30'), '2027-01-01')).toBe(3))
})
