import { useSyncExternalStore } from 'react'
import { DECK } from '../data/cards'
import type { FoilManifest } from '../gl/types'
import { assetUrl, loadManifest } from './foil'

/**
 * Makes the installed app work completely offline: the app itself is precached by the service worker,
 * and this downloads every card image into the same caches the worker serves them from
 * (see vite.config.ts: 'card-art' for images, 'card-manifest' for the card list).
 */
export const ART_CACHE = 'card-art'
export const MANIFEST_CACHE = 'card-manifest'
const DONE_KEY = 'tarottwin:offline'
const CONCURRENCY = 6

export type OfflineState =
  | { status: 'idle' }
  | { status: 'running'; done: number; total: number }
  | { status: 'ready' }
  | { status: 'error' }

/** Every file that makes up the cards, as paths relative to the site root. */
export function assetPaths(m: FoilManifest | null): string[] {
  const paths = new Set<string>()
  for (const c of DECK) paths.add(`cards/${c.id}.webp`) // the flat fallback card
  if (m) {
    for (const e of Object.values(m.cards)) {
      paths.add(e.art)
      paths.add(e.foil)
    }
    for (const p of Object.values(m.back)) paths.add(p)
  }
  return [...paths]
}

let state: OfflineState = readDone() ? { status: 'ready' } : { status: 'idle' }
const listeners = new Set<() => void>()
const set = (s: OfflineState) => {
  state = s
  listeners.forEach((l) => l())
}

function readDone() {
  try {
    return localStorage.getItem(DONE_KEY) === '1'
  } catch {
    return false
  }
}

async function put(cache: Cache, url: string) {
  if (await cache.match(url)) return
  for (let attempt = 0; ; attempt++) {
    try {
      await cache.add(new Request(url, { cache: 'reload' }))
      return
    } catch (e) {
      if (attempt >= 2) throw e
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
    }
  }
}

let running: Promise<void> | null = null

/** Downloads every card image (once; safe to call again). Resumes where it left off after a failure. */
export function downloadForOffline(): Promise<void> {
  if (!('caches' in window)) return Promise.resolve()
  running ??= (async () => {
    try {
      const wasReady = state.status === 'ready'
      if (!wasReady) set({ status: 'running', done: 0, total: 1 })
      const m = await loadManifest()
      if (!m) throw new Error('card list unavailable')
      const art = await caches.open(ART_CACHE)
      await put(await caches.open(MANIFEST_CACHE), assetUrl('foil/manifest.json'))
      const urls = assetPaths(m).map(assetUrl)
      // only what is not saved yet: an app that is already complete just confirms it, without a banner
      const have = await Promise.all(urls.map((u) => art.match(u).then(Boolean)))
      const queue = urls.filter((_, i) => !have[i])
      const total = queue.length
      let done = 0
      if (total) set({ status: 'running', done, total })
      await Promise.all(
        Array.from({ length: CONCURRENCY }, async () => {
          for (let u = queue.shift(); u !== undefined; u = queue.shift()) {
            await put(art, u)
            set({ status: 'running', done: ++done, total })
          }
        }),
      )
      try {
        localStorage.setItem(DONE_KEY, '1')
      } catch {
        /* still cached; it just checks again next launch */
      }
      set({ status: 'ready' })
    } catch {
      set({ status: 'error' })
    } finally {
      running = null
    }
  })()
  return running
}

export const useOffline = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => void listeners.delete(l)
    },
    () => state,
  )
