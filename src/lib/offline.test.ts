import { describe, expect, it } from 'vitest'
import { DECK } from '../data/cards'
import type { FoilManifest } from '../gl/types'
import { assetPaths } from './offline'

describe('assetPaths', () => {
  it('lists a flat card per deck entry even without the manifest', () => {
    const p = assetPaths(null)
    expect(p).toHaveLength(DECK.length)
    expect(p).toContain('cards/major-00-the-fool.webp')
  })
  it('adds each card art + foil map and the back, without duplicates', () => {
    const m = {
      aspect: 0.58, artAspect: 0.57,
      back: { art: 'foil/back/art.webp', fx: 'foil/back/fx.webp', normal: 'foil/back/art.webp' },
      cards: { 'cups-01': { art: 'foil/cups-01/art.webp', foil: 'foil/cups-01/foil.webp' } },
    } as unknown as FoilManifest
    const p = assetPaths(m)
    expect(p).toContain('foil/cups-01/art.webp')
    expect(p).toContain('foil/cups-01/foil.webp')
    expect(p.filter((x) => x === 'foil/back/art.webp')).toHaveLength(1)
    expect(new Set(p).size).toBe(p.length)
  })
})
