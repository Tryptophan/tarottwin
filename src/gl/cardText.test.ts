import { describe, expect, it } from 'vitest'
import { uniformLineSize, fitLine, fitWrapped, kindLabel, rankLabel, toRoman, wrapLines } from './cardText'

const m = (t: string, s: number) => t.length * s * 0.5

describe('cardText', () => {
  it('roman numerals', () => {
    expect([0, 1, 4, 9, 14, 19, 21].map(toRoman)).toEqual(['0', 'I', 'IV', 'IX', 'XIV', 'XIX', 'XXI'])
  })
  it('rank labels', () => {
    expect(rankLabel({ arcana: 'major', number: 14 })).toBe('XIV')
    expect(rankLabel({ arcana: 'minor', number: 1 })).toBe('Ace')
    expect(rankLabel({ arcana: 'minor', number: 7 })).toBe('7')
    expect(rankLabel({ arcana: 'minor', number: 11 })).toBe('Page')
    expect(rankLabel({ arcana: 'minor', number: 14 })).toBe('King')
  })
  it('kind labels', () => {
    expect(kindLabel({ arcana: 'major', suit: null })).toBe('Major Arcana')
    expect(kindLabel({ arcana: 'minor', suit: 'cups' })).toBe('Cups')
  })
  it('wraps greedily', () => {
    expect(wrapLines('aa bb cc dd', 10, 30, m)).toEqual(['aa bb', 'cc dd'])
    expect(wrapLines('', 10, 30, m)).toEqual([])
  })
  it('fits by shrinking, then truncates', () => {
    const r = fitWrapped('aa bb cc dd ee ff', 100, 1, 20, 8, m)
    expect(r.lines.length).toBe(1)
    expect(r.size).toBeLessThan(20)
    const t = fitWrapped('word '.repeat(60), 100, 2, 20, 8, m)
    expect(t.size).toBe(8)
    expect(t.lines.length).toBe(2)
    expect(t.lines[1].endsWith('…')).toBe(true)
  })
  it('fitLine', () => {
    expect(fitLine('abcd', 100, 40, 10, m)).toBe(40)
    expect(fitLine('abcdefghij', 100, 40, 10, m)).toBe(20)
    expect(fitLine('x'.repeat(100), 10, 40, 10, m)).toBe(10)
  })
})

import { uniformSize } from './cardText'
describe('uniformSize', () => {
  const measure = (t: string, s: number) => t.length * s * 0.5
  it('fits every text at one size', () => {
    const texts = ['short', 'a much longer line of text that needs several lines to fit']
    const size = uniformSize(texts, 200, 100, 1.2, 40, 10, measure)
    const lh = Math.round(size * 1.2)
    for (const t of texts) expect(wrapLines(t, size, 200, measure).length * lh).toBeLessThanOrEqual(100)
    // and one px larger would not fit the longest
    const lh2 = Math.round((size + 1) * 1.2)
    expect(wrapLines(texts[1], size + 1, 200, measure).length * lh2).toBeGreaterThan(100)
  })
  it('bottoms out at the minimum', () => expect(uniformSize(['x '.repeat(500)], 100, 10, 1.2, 40, 12, measure)).toBe(12))
})

describe('uniformLineSize', () => {
  const m = (t: string, sz: number) => t.length * sz * 0.5
  it('is set by the longest text', () => {
    expect(uniformLineSize(['ab', 'abcdefghij'], 100, 40, 10, m)).toBe(20)
  })
  it('caps at maxSize and floors at minSize', () => {
    expect(uniformLineSize(['a'], 100, 30, 10, m)).toBe(30)
    expect(uniformLineSize(['x'.repeat(200)], 10, 30, 12, m)).toBe(12)
  })
})
