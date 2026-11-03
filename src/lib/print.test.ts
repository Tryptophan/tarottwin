import { describe, expect, it } from 'vitest'
import { DECK } from '../data/cards'
import { bridgeSeed, dailySeed, faceKey, printFor, printTag, RUN_SIZE } from './print'

describe('printFor', () => {
  it('is deterministic and in range', () => {
    const a = printFor(dailySeed('u1', '2026-01-01'), DECK[0])
    expect(printFor(dailySeed('u1', '2026-01-01'), DECK[0])).toEqual(a)
    for (const c of DECK) {
      const p = printFor('x', c)
      expect(p.serial).toBeGreaterThanOrEqual(1)
      expect(p.serial).toBeLessThanOrEqual(RUN_SIZE)
    }
  })
  it('formats the serial with its rarity', () => {
    expect(printTag({ serial: 6, rarity: 'GOLD' })).toBe('006-GOLD')
    expect(faceKey(DECK[0], { serial: 6, rarity: 'GOLD' })).toBe(`${DECK[0].id}|006-GOLD`)
    expect(faceKey(DECK[0])).toBe(DECK[0].id)
  })
  it('bridge seed is symmetric', () => {
    expect(bridgeSeed('a', 'b', 'd')).toBe(bridgeSeed('b', 'a', 'd'))
  })
  it('hands out every rarity over many draws, commons most', () => {
    const n: Record<string, number> = {}
    for (let i = 0; i < 2000; i++) { const r = printFor(`s${i}`, DECK[0]).rarity; n[r] = (n[r] ?? 0) + 1 }
    expect(Object.keys(n).sort()).toEqual(['COMMON', 'GALAXY', 'GOLD', 'HOLO'])
    expect(n.COMMON).toBeGreaterThan(n.HOLO)
    expect(n.HOLO).toBeGreaterThan(n.GALAXY)
  })
})
