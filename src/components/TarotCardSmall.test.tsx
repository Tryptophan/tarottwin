import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DECK } from '../data/cards'

// Today's card is opened full-size on Home first, so its textures are already cached
// when the Collection grid draws its thumbnail.
vi.mock('../gl/cardFace', () => ({
  peekTextures: () => ({ aspect: 0.58 }),
  loadCardTextures: vi.fn(),
  loadSmallFace: vi.fn(async () => {
    const c = document.createElement('canvas')
    c.width = 220
    c.height = 380
    return c
  }),
}))
vi.mock('../lib/foil', () => ({
  loadManifest: vi.fn(async () => ({ cards: {} })),
  finishFor: vi.fn(),
  lowPower: () => false,
}))
vi.mock('../gl/renderer', () => ({ FoilRenderer: class {} }))

import { TarotCard } from './TarotCard'

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// jsdom has no 2D canvas
HTMLCanvasElement.prototype.getContext = (() => ({ drawImage() {} })) as unknown as HTMLCanvasElement['getContext']

let host: HTMLDivElement | null = null
afterEach(() => {
  host?.remove()
  host = null
})

describe('Collection thumbnail', () => {
  it('draws its face, and stops showing the spinner, even when the full-size textures are already cached', async () => {
    host = document.createElement('div')
    document.body.append(host)
    await act(async () => {
      createRoot(host!).render(<TarotCard card={DECK[0]} revealed size="sm" />)
    })
    await vi.waitFor(() => expect(host!.querySelector('canvas.tcard-small-canvas')).not.toBeNull())
    expect(host!.querySelector('.tcard-spinner')).toBeNull()
    expect(host!.querySelector('.tcard-loading')).toBeNull()
  })
})
