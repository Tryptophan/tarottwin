import { describe, expect, it } from 'vitest'
import { hashString, mulberry32, seededRng } from './rng'

describe('rng', () => {
  it('is deterministic', () => {
    const a = seededRng('x'), b = seededRng('x')
    for (let i = 0; i < 50; i++) expect(a()).toBe(b())
    expect(hashString('abc')).toEqual(hashString('abc'))
  })
  it('differs by seed', () => {
    expect(seededRng('x')()).not.toBe(seededRng('y')())
  })
  it('stays in [0,1)', () => {
    const r = mulberry32(12345)
    for (let i = 0; i < 10000; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
