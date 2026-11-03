import { describe, expect, it } from 'vitest'
import { DECK, SUIT_ELEMENT, type Suit } from './cards'

describe('deck', () => {
  it('has 78 cards with unique ids', () => {
    expect(DECK).toHaveLength(78)
    expect(new Set(DECK.map((c) => c.id)).size).toBe(78)
  })
  it('has 22 majors numbered 0-21', () => {
    const m = DECK.filter((c) => c.arcana === 'major')
    expect(m.map((c) => c.number).sort((a, b) => a - b)).toEqual(Array.from({ length: 22 }, (_, i) => i))
  })
  it('has 56 minors, 14 per suit, with element mapping', () => {
    expect(DECK.filter((c) => c.arcana === 'minor')).toHaveLength(56)
    const expected: Record<Suit, string> = { wands: 'fire', cups: 'water', swords: 'air', pentacles: 'earth' }
    for (const suit of Object.keys(expected) as Suit[]) {
      const cs = DECK.filter((c) => c.suit === suit)
      expect(cs).toHaveLength(14)
      expect(cs.map((c) => c.number).sort((a, b) => a - b)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1))
      expect(SUIT_ELEMENT[suit]).toBe(expected[suit])
      cs.forEach((c) => expect(c.element).toBe(expected[suit]))
    }
  })
  it('has non-empty text and well-formed ids', () => {
    const re = /^(major-\d\d-[a-z0-9-]+|(wands|cups|swords|pentacles)-\d\d)$/
    for (const c of DECK) {
      expect(c.name.trim()).not.toBe('')
      expect(c.upright.trim()).not.toBe('')
      expect(c.id).toMatch(re)
    }
  })
})
