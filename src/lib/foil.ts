import type { Card } from '../data/cards'
import type { FoilManifest } from '../gl/types'
import { RARITY_FINISH, type Print } from './print'

import { siteRoot } from '../i18n'

/**
 * Where the shared files (card art, foil maps, icons) live. The build's base is relative ('./'), and the language
 * pages sit one folder down (`/pt/`), so it resolves against the site root rather than the page.
 */
const BASE = import.meta.env.BASE_URL === './' && typeof location !== 'undefined' ? siteRoot(location.pathname) : import.meta.env.BASE_URL
export const assetUrl = (p: string) => `${BASE}${p}`

let manifestPromise: Promise<FoilManifest | null> | null = null

export function loadManifest(): Promise<FoilManifest | null> {
  manifestPromise ??= fetch(assetUrl('foil/manifest.json'))
    .then((r) => (r.ok ? (r.json() as Promise<FoilManifest>) : null))
    .then((m) => (m && m.cards && m.back && m.aspect ? m : null))
    .catch(() => null)
  return manifestPromise
}

/** A printed card takes its rarity's finish; a card with no print (the Collection) is holo. */
export function finishFor(_card: Card, print?: Print): number {
  return print ? RARITY_FINISH[print.rarity] : 0
}

const LRU_MAX = 24
const cache = new Map<string, Promise<ImageBitmap>>()

/** Decoded bitmaps, cached by path. fx maps keep their alpha as data (no premultiply). */
export function bitmap(path: string, premultiply: boolean): Promise<ImageBitmap> {
  const key = `${premultiply ? 'p' : 'n'}:${path}`
  const hit = cache.get(key)
  if (hit) {
    cache.delete(key)
    cache.set(key, hit)
    return hit
  }
  const p = fetch(assetUrl(path))
    .then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${path}`)
      return r.blob()
    })
    .then((b) => createImageBitmap(b, { premultiplyAlpha: premultiply ? 'premultiply' : 'none', colorSpaceConversion: 'none' }))
  p.catch(() => cache.delete(key))
  cache.set(key, p)
  while (cache.size > LRU_MAX) cache.delete(cache.keys().next().value as string)
  return p
}

export function lowPower(): boolean {
  return (window.devicePixelRatio || 1) > 2 || (navigator.hardwareConcurrency ?? 8) <= 4
}
