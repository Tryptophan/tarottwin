import type { Card } from '../data/cards'
import { bitmap } from '../lib/foil'
import { DECK } from '../data/cards'
import { uniformLineSize, uniformSize, wrapLines } from './cardText'
import type { CardTextures, FoilManifest, RawPixels } from './types'

// ---- the name strip, in the printed title band's colours of the original cards
const STRIP_BG = '#c9b7af' // sampled from the printed title band in the original scans
const STRIP_INK = '#1a0d0b'

// ---- palette
const PAPER = '#efe4cf'
const PAPER_LIGHT = '#f7efdd'
const VIOLET_DARK = '#3d1c59'
const VIOLET = '#5d3a7a'
const INK = '#2b1640'
const GOLD = '#b8964a'

// ---- layout, in pixels of the 600-wide card
export const CARD_W = 600
const RADIUS = 36
const MARGIN = 40
const ART_TOP = 44
const ART_H_FRAC = 0.8
const GAP = 16
const MIN_BOX_H = 130
const BAR_FRAC = 0.085 // strip height as a fraction of the art window's
const MIN_BAR_H = 44
const BOX_RADIUS = 10
const BOX_PAD = 20
const FONT = "Jost, system-ui, -apple-system, 'Segoe UI', sans-serif"

interface Rect { x: number; y: number; w: number; h: number }
export interface Layout { w: number; h: number; art: Rect; bar: Rect; box: Rect }

export function layoutFor(aspect: number, artAspect: number): Layout {
  const w = CARD_W
  const h = Math.round(w / aspect)
  let ah = Math.min(Math.round(h * ART_H_FRAC), Math.floor((h - ART_TOP - MARGIN - GAP - MIN_BOX_H) / (1 + BAR_FRAC)))
  let aw = Math.round(ah * artAspect)
  if (aw > w - 2 * MARGIN) {
    aw = w - 2 * MARGIN
    ah = Math.round(aw / artAspect)
  }
  const art = { x: Math.round((w - aw) / 2), y: ART_TOP, w: aw, h: ah }
  const bar = { x: art.x, y: art.y + ah, w: aw, h: Math.max(MIN_BAR_H, Math.round(ah * BAR_FRAC)) }
  const by = bar.y + bar.h + GAP
  const box = { x: MARGIN, y: by, w: w - 2 * MARGIN, h: h - MARGIN - by }
  return { w, h, art, bar, box }
}

/** Let the browser handle pending input (e.g. a navigation tap) between heavy synchronous steps. */
const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0))

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function rr(ctx: CanvasRenderingContext2D, r: Rect, rad: number, inset = 0) {
  ctx.roundRect(r.x + inset, r.y + inset, r.w - 2 * inset, r.h - 2 * inset, Math.max(0, rad - inset))
}

function silhouette(ctx: CanvasRenderingContext2D, l: Layout) {
  ctx.beginPath()
  rr(ctx, { x: 0, y: 0, w: l.w, h: l.h }, RADIUS)
  ctx.clip()
}

/** The paper: the whole card minus the art window. */
function paperPath(ctx: CanvasRenderingContext2D, l: Layout) {
  ctx.beginPath()
  rr(ctx, { x: 0, y: 0, w: l.w, h: l.h }, RADIUS)
  ctx.roundRect(l.art.x, l.art.y, l.art.w, l.art.h, 6)
}

async function ensureFonts() {
  try {
    await Promise.all([document.fonts.load(`600 40px Jost`), document.fonts.load(`italic 400 30px Jost`)])
  } catch { /* system font fallback */ }
}

const NAME_SPACING = 2
const nameSizeCache = new Map<string, number>()
/** One size for every card's name: the largest at which the longest name fits the strip on one line. */
function nameSize(width: number, maxSize: number, measure: (t: string, s: number) => number): number {
  const key = `${width}x${maxSize}`
  let v = nameSizeCache.get(key)
  if (v === undefined) {
    v = uniformLineSize(DECK.map((c) => c.name.toUpperCase()), width, maxSize, 14, measure)
    nameSizeCache.set(key, v)
  }
  return v
}

const LINE_H = 1.28
const sizeCache = new Map<string, number>()
/** One font size for every card's meaning: the largest at which the longest still fits its box. */
function flavorSize(width: number, height: number, measure: (t: string, s: number) => number): number {
  const key = `${width}x${height}`
  let s = sizeCache.get(key)
  if (s === undefined) {
    s = uniformSize(DECK.map((c) => c.upright), width, height, LINE_H, 40, 14, measure)
    sizeCache.set(key, s)
  }
  return s
}

function drawFrame(l: Layout, card: Card): HTMLCanvasElement {
  const c = canvas(l.w, l.h)
  const ctx = c.getContext('2d')!
  silhouette(ctx, l)
  // paper
  paperPath(ctx, l)
  const g = ctx.createLinearGradient(0, 0, 0, l.h)
  g.addColorStop(0, '#f3e9d5')
  g.addColorStop(1, '#e8dbc2')
  ctx.fillStyle = g
  ctx.fill('evenodd')
  // thin inner lines on the border
  ctx.beginPath()
  rr(ctx, { x: 0, y: 0, w: l.w, h: l.h }, RADIUS, 13)
  ctx.lineWidth = 2.5
  ctx.strokeStyle = VIOLET
  ctx.stroke()
  ctx.beginPath()
  rr(ctx, { x: 0, y: 0, w: l.w, h: l.h }, RADIUS, 19)
  ctx.lineWidth = 1
  ctx.strokeStyle = GOLD
  ctx.stroke()
  // art window rim
  const a = { x: l.art.x, y: l.art.y, w: l.art.w, h: l.art.h + l.bar.h }
  ctx.lineWidth = 6
  ctx.strokeStyle = VIOLET_DARK
  ctx.strokeRect(a.x - 3, a.y - 3, a.w + 6, a.h + 6)
  ctx.lineWidth = 1.5
  ctx.strokeStyle = GOLD
  ctx.strokeRect(a.x - 7.5, a.y - 7.5, a.w + 15, a.h + 15)

  // name strip: flat, in the printed band's colours, a thin rule on top
  const b = l.bar
  ctx.fillStyle = STRIP_BG
  ctx.fillRect(b.x, b.y, b.w, b.h)
  ctx.fillStyle = STRIP_INK
  ctx.fillRect(b.x, b.y, b.w, 2)
  const nm = (t: string, sz: number) => {
    ctx.font = `600 ${sz}px ${FONT}`
    if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${NAME_SPACING}px`
    return ctx.measureText(t).width
  }
  const ns = nameSize(b.w - 32, Math.round(b.h * 0.58), nm)
  nm('', ns)
  ctx.fillStyle = STRIP_INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(card.name.toUpperCase(), b.x + b.w / 2 + NAME_SPACING / 2, b.y + b.h / 2 + 1)
  if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px'

  // meaning box
  const x = l.box
  ctx.beginPath()
  rr(ctx, x, BOX_RADIUS)
  ctx.fillStyle = PAPER_LIGHT
  ctx.fill()
  ctx.save()
  ctx.beginPath()
  rr(ctx, x, BOX_RADIUS)
  ctx.clip()
  ctx.beginPath()
  ctx.rect(x.x - 60, x.y - 60, x.w + 120, x.h + 120)
  rr(ctx, x, BOX_RADIUS)
  ctx.shadowColor = 'rgba(70,40,20,0.5)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 3
  ctx.fillStyle = '#000'
  ctx.fill('evenodd')
  ctx.restore()
  ctx.lineWidth = 4
  ctx.strokeStyle = GOLD
  ctx.beginPath()
  rr(ctx, x, BOX_RADIUS, 2)
  ctx.stroke()
  ctx.lineWidth = 1
  ctx.strokeStyle = VIOLET
  ctx.beginPath()
  rr(ctx, x, BOX_RADIUS, 8)
  ctx.stroke()
  // text
  const tw = x.w - 2 * BOX_PAD
  const m2 = (t: string, s: number) => {
    ctx.font = `italic 400 ${s}px ${FONT}`
    return ctx.measureText(t).width
  }
  const size = flavorSize(tw, x.h - 2 * BOX_PAD, m2)
  const lh = Math.round(size * LINE_H)
  const lines = wrapLines(card.upright, size, tw, m2)
  const total = lh * lines.length
  ctx.font = `italic 400 ${size}px ${FONT}`
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((ln, i) => ctx.fillText(ln, x.x + x.w / 2, x.y + x.h / 2 - total / 2 + lh * (i + 0.5)))
  return c
}

/** Opaque map: R = 255 on the metal (paper border, rims), 0 elsewhere. */
function drawFrameFoil(l: Layout): HTMLCanvasElement {
  const c = canvas(l.w, l.h)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, l.w, l.h)
  silhouette(ctx, l)
  paperPath(ctx, l)
  ctx.fillStyle = '#fff'
  ctx.fill('evenodd')
  ctx.fillStyle = '#000'
  ctx.fillRect(l.bar.x, l.bar.y, l.bar.w, l.bar.h)
  for (const [r, rad] of [[l.box, BOX_RADIUS]] as Array<[Rect, number]>) {
    ctx.beginPath()
    rr(ctx, r, rad, 4)
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#fff'
    ctx.beginPath()
    rr(ctx, r, rad, 1.5)
    ctx.stroke()
  }
  return c
}

function drawArt(l: Layout, art: ImageBitmap): HTMLCanvasElement {
  const c = canvas(l.w, l.h)
  const ctx = c.getContext('2d')!
  silhouette(ctx, l)
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, l.w, l.h)
  ctx.imageSmoothingQuality = 'high'
  // a hair of overdraw under the window rim so no cream shows through
  ctx.drawImage(art, l.art.x, l.art.y, l.art.w, l.art.h)
  return c
}

/** fx: R = foil inside the art window, B = 255 inside the window (art window), G = A = 0. */
function buildFx(l: Layout, foil: ImageBitmap): RawPixels {
  const w = l.art.w
  const h = l.art.h
  const tmp = canvas(w, h)
  const tc = tmp.getContext('2d', { willReadFrequently: true })!
  tc.fillStyle = '#000'
  tc.fillRect(0, 0, w, h)
  tc.drawImage(foil, 0, 0, w, h)
  const src = tc.getImageData(0, 0, w, h).data
  const data = new Uint8Array(l.w * l.h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4
      const d = ((l.art.y + y) * l.w + l.art.x + x) * 4
      data[d] = src[s]
      data[d + 2] = 255
    }
  }
  return { data, width: l.w, height: l.h }
}

function flatNormal(): RawPixels {
  const data = new Uint8Array(8 * 8 * 4)
  for (let i = 0; i < 64; i++) data.set([128, 128, 255, 255], i * 4)
  return { data, width: 8, height: 8 }
}

export interface FaceLayers { layout: Layout; art: HTMLCanvasElement; frame: HTMLCanvasElement }
interface Entry { layers: Promise<FaceLayers>; fx?: Promise<RawPixels>; ready?: CardTextures }

const LRU_MAX = 6
const faces = new Map<string, Entry>()

function entry(m: FoilManifest, card: Card): Entry {
  const hit = faces.get(card.id)
  if (hit) {
    faces.delete(card.id)
    faces.set(card.id, hit)
    return hit
  }
  const c = m.cards[card.id]
  if (!c) throw new Error(`no foil entry for ${card.id}`)
  const layout = layoutFor(m.aspect, m.artAspect || 0.6)
  const layers = Promise.all([bitmap(c.art, true), ensureFonts()]).then(async ([art]) => {
    const artCanvas = drawArt(layout, art)
    await yieldToMain()
    return { layout, art: artCanvas, frame: drawFrame(layout, card) }
  })
  const e: Entry = { layers }
  layers.catch(() => faces.delete(card.id))
  faces.set(card.id, e)
  // the oldest faces drop out; their GPU textures belong to the renderer that uploaded them
  while (faces.size > LRU_MAX) faces.delete(faces.keys().next().value as string)
  return e
}

/** The 2D layers only (what the DOM fallback needs). */
export function loadFaceLayers(m: FoilManifest, card: Card): Promise<FaceLayers> {
  return entry(m, card).layers
}

/** Flattened face (art under frame) as a data URL, for the DOM fallback. */
export async function faceDataUrl(m: FoilManifest, card: Card): Promise<string> {
  const { layout, art, frame } = await loadFaceLayers(m, card)
  const c = canvas(layout.w, layout.h)
  const ctx = c.getContext('2d')!
  ctx.drawImage(art, 0, 0)
  ctx.drawImage(frame, 0, 0)
  return c.toDataURL('image/webp', 0.92)
}

/** Textures already composed for a card, if any, so a second view (the inspector) opens with no loading. */
export function peekTextures(cardId: string): CardTextures | null {
  return faces.get(cardId)?.ready ?? null
}

/** The back image is an opaque rectangle; clip it to the front's rounded silhouette so no corners show. */
let backCache: Promise<HTMLCanvasElement> | null = null
function roundedBack(path: string): Promise<HTMLCanvasElement> {
  backCache ??= bitmap(path, false).then((bmp) => {
    const c = canvas(bmp.width, bmp.height)
    const ctx = c.getContext('2d')!
    ctx.beginPath()
    ctx.roundRect(0, 0, bmp.width, bmp.height, (RADIUS / CARD_W) * bmp.width)
    ctx.clip()
    ctx.drawImage(bmp, 0, 0)
    return c
  })
  return backCache
}

export async function loadCardTextures(m: FoilManifest, card: Card): Promise<CardTextures> {
  const e = entry(m, card)
  if (e.ready) return e.ready
  const layers = await e.layers
  e.fx ??= bitmap(m.cards[card.id].foil, false).then(async (f) => { await yieldToMain(); return buildFx(layers.layout, f) })
  const [fx, bart, bfx] = await Promise.all([e.fx, roundedBack(m.back.art), bitmap(m.back.fx, false)])
  await yieldToMain()
  e.ready = {
    aspect: m.aspect,
    front: { art: layers.art, fx, normal: flatNormal() },
    frame: { image: layers.frame, foil: drawFrameFoil(layers.layout) },
    back: { art: bart, fx: bfx, normal: flatNormal() },
  }
  return e.ready
}

const SMALL_W = 220
const SMALL_MAX = 120
const small = new Map<string, HTMLCanvasElement>()

/** A small flattened face (art under frame) for thumbnails; cached, so a grid of 78 stays cheap. */
export async function loadSmallFace(m: FoilManifest, card: Card): Promise<HTMLCanvasElement> {
  const hit = small.get(card.id)
  if (hit) {
    small.delete(card.id)
    small.set(card.id, hit)
    return hit
  }
  const { layout, art, frame } = await loadFaceLayers(m, card)
  const c = canvas(SMALL_W, Math.round((SMALL_W * layout.h) / layout.w))
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(art, 0, 0, c.width, c.height)
  ctx.drawImage(frame, 0, 0, c.width, c.height)
  small.set(card.id, c)
  while (small.size > SMALL_MAX) small.delete(small.keys().next().value as string)
  return c
}
