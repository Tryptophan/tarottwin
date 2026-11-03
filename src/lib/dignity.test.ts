import { describe, expect, it } from 'vitest'
import type { Element } from '../data/cards'
import { overallTone, relation } from './dignity'

const EL: Element[] = ['fire', 'water', 'air', 'earth']

describe('relation', () => {
  it('is symmetric for all pairs', () => {
    for (const a of EL) for (const b of EL) expect(relation(a, b)).toBe(relation(b, a))
  })
  it('classifies pairs', () => {
    for (const e of EL) expect(relation(e, e)).toBe('same')
    expect(relation('fire', 'air')).toBe('allied')
    expect(relation('water', 'earth')).toBe('allied')
    expect(relation('fire', 'water')).toBe('opposed')
    expect(relation('air', 'earth')).toBe('opposed')
    expect(relation('fire', 'earth')).toBe('neutral')
    expect(relation('water', 'air')).toBe('neutral')
  })
})

describe('overallTone', () => {
  it('cases', () => {
    expect(overallTone('same', 'same', 'same')).toBe('harmonious')
    expect(overallTone('allied', 'opposed', 'neutral')).toBe('harmonious') // 2-1
  })
  it('balanced and challenging', () => {
    expect(overallTone('opposed', 'allied', 'allied')).toBe('balanced')
    expect(overallTone('neutral', 'neutral', 'neutral')).toBe('balanced')
    expect(overallTone('neutral', 'allied', 'opposed')).toBe('balanced')
    expect(overallTone('opposed', 'neutral', 'allied')).toBe('challenging')
    expect(overallTone('opposed', 'opposed', 'opposed')).toBe('challenging')
    expect(overallTone('neutral', 'opposed', 'neutral')).toBe('challenging')
    expect(overallTone('neutral', 'same', 'neutral')).toBe('harmonious')
  })
})
