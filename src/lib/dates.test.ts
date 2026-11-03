import { describe, expect, it } from 'vitest'
import { formatCountdown, msUntilNextUtcDay, utcDate } from './dates'

describe('dates', () => {
  it('utcDate uses UTC', () => {
    expect(utcDate(new Date('2025-03-09T23:59:59.999Z'))).toBe('2025-03-09')
    expect(utcDate(new Date('2025-03-10T00:00:00.000Z'))).toBe('2025-03-10')
  })
  it('msUntilNextUtcDay', () => {
    expect(msUntilNextUtcDay(new Date('2025-03-09T23:59:59.999Z'))).toBe(1)
    expect(msUntilNextUtcDay(new Date('2025-03-10T00:00:00.000Z'))).toBe(86_400_000)
    expect(msUntilNextUtcDay(new Date('2025-12-31T12:00:00Z'))).toBe(12 * 3600_000)
  })
  it('formatCountdown', () => {
    expect(formatCountdown(0)).toBe('00:00:00')
    expect(formatCountdown(-5000)).toBe('00:00:00')
    expect(formatCountdown(999)).toBe('00:00:00')
    expect(formatCountdown(1000)).toBe('00:00:01')
    expect(formatCountdown(3_661_000)).toBe('01:01:01')
    expect(formatCountdown(86_399_000)).toBe('23:59:59')
  })
})
