import { useCallback, useEffect, useRef, useState } from 'react'
import type { Card } from '../data/cards'
import { FoilRenderer } from '../gl/renderer'
import type { CardTextures } from '../gl/types'
import { loadCardTextures, loadSmallFace, peekTextures } from '../gl/cardFace'
import { finishFor, loadManifest, lowPower } from '../lib/foil'
import { Sparkles } from './Sparkles'
import { TarotCardFallback } from './TarotCardFallback'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  card: Card
  revealed: boolean
  onReveal?: () => void
  onInspect?: () => void
  label?: string
  size?: Size
}

const FLIP_MS = 700
// the canvas is 125% of the card box (see styles), so 0.8 draws the card at box size with room to tilt
const CARD_SCALE = 0.8
const MAX_TILT = 0.5
const OFFSCREEN_DISPOSE_MS = 2000

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

export function TarotCard(props: Props) {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (props.size === 'sm') return props.revealed ? <TarotCardSmall {...props} /> : <TarotCardFallback {...props} />
  if (reduced) return <TarotCardFallback {...props} />
  return <TarotCardGL {...props} />
}

/** Loading placeholder in the card's shape: a small spinner (a static ring under reduced motion). */
function Loading({ size, aspect, label, onClick, aria }: { size: Size; aspect: number; label?: string; onClick?: () => void; aria: string }) {
  return (
    <div className={`tcard-wrap tcard-${size}`}>
      <div className="tcard-gl tcard-loading" style={{ aspectRatio: String(aspect) }} role="button" tabIndex={0} aria-label={aria} aria-busy="true"
        onClick={onClick} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick?.())}>
        <span className="tcard-spinner" />
      </div>
      {label && <span className="tcard-label">{label}</span>}
    </div>
  )
}

const DEFAULT_ASPECT = 0.5795
const GL_TIMEOUT_MS = 10_000

/** Thumbnail: the composed 2D face, loaded lazily when scrolled into view. No WebGL context. */
function TarotCardSmall({ card, onInspect, label }: Props) {
  const hostRef = useRef<HTMLSpanElement>(null)
  const holder = useRef<HTMLSpanElement>(null)
  const [seen, setSeen] = useState(false)
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')

  useEffect(() => {
    const el = hostRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return setSeen(true)
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!seen) return
    let dead = false
    if (peekTextures(card.id)) return
    loadManifest()
      .then((m) => (m ? loadSmallFace(m, card) : Promise.reject(new Error('no manifest'))))
      .then((src) => {
        if (dead || !holder.current) return
        const c = document.createElement('canvas')
        c.width = src.width
        c.height = src.height
        c.getContext('2d')!.drawImage(src, 0, 0)
        c.className = 'tcard-small-canvas'
        holder.current.replaceChildren(c)
        setState('ready')
      })
      .catch(() => !dead && setState('failed'))
    return () => { dead = true }
  }, [seen, card])

  if (state === 'failed') return <TarotCardFallback card={card} revealed onInspect={onInspect} label={label} size="sm" />
  return (
    <span className="tcard-host" ref={hostRef}>
      <div className="tcard-wrap tcard-sm">
        <button type="button" className={`tcard-small${state === 'ready' ? '' : ' tcard-loading'}`} style={{ aspectRatio: String(DEFAULT_ASPECT) }}
          aria-label={`${card.name}. Tap for details`} onClick={() => onInspect?.()}>
          <span ref={holder} className="tcard-small-holder" />
          {state !== 'ready' && <span className="tcard-spinner" />}
        </button>
        {label && <span className="tcard-label">{label}</span>}
      </div>
    </span>
  )
}

function TarotCardGL(props: Props) {
  const { card, revealed, onReveal, onInspect, label, size = 'md' } = props
  const hostRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [textures, setTextures] = useState<CardTextures | null>(() => peekTextures(card.id))
  const [failed, setFailed] = useState(false)
  const [visible, setVisible] = useState(true)
  const [active, setActive] = useState(() => peekTextures(card.id) !== null) // WebGL canvas mounted
  const [burst, setBurst] = useState(0)
  const [drawn, setDrawn] = useState(false)
  const flatRef = useRef<HTMLCanvasElement>(null)

  const revealedRef = useRef(revealed)
  revealedRef.current = revealed
  const cbs = useRef({ onReveal, onInspect })
  cbs.current = { onReveal, onInspect }
  const flipStart = useRef<number | null>(null)
  const prevRevealed = useRef(revealed)
  const activeRef = useRef(false)
  const pendingFlip = useRef(false)
  activeRef.current = active

  // lazy texture load
  useEffect(() => {
    let dead = false
    if (peekTextures(card.id)) return
    loadManifest()
      .then((m) => (m ? loadCardTextures(m, card) : Promise.reject(new Error('no manifest'))))
      .then((t) => !dead && setTextures(t))
      .catch(() => !dead && setFailed(true))
    return () => {
      dead = true
    }
  }, [card.id])

  // WebGL gets 10 s from when the card is on screen to draw its first frame, else the flat card takes over
  useEffect(() => {
    if (drawn || failed || !visible) return
    const t = window.setTimeout(() => setFailed(true), GL_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [drawn, failed, visible])

  // a new canvas (after the context was released offscreen) starts blank again
  useEffect(() => {
    if (!active) setDrawn(false)
  }, [active])

  // visibility: pause when offscreen, release the context after a while
  useEffect(() => {
    const el = hostRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!textures || failed) return
    if (visible) {
      setActive(true)
      return
    }
    const t = window.setTimeout(() => setActive(false), OFFSCREEN_DISPOSE_MS)
    return () => window.clearTimeout(t)
  }, [visible, textures, failed])

  // reveal trigger
  useEffect(() => {
    if (revealed && !prevRevealed.current) {
      if (activeRef.current) {
        flipStart.current = performance.now()
        setBurst((b) => b + 1)
        if ('vibrate' in navigator) navigator.vibrate(15)
      } else pendingFlip.current = true // tapped while loading: flip once ready
    }
    if (!revealed) {
      flipStart.current = null
      pendingFlip.current = false
    }
    prevRevealed.current = revealed
  }, [revealed])

  // a flat copy of the face, shown until the first WebGL frame (the inspector opens with the card already there)
  useEffect(() => {
    const c = flatRef.current
    if (!c || !textures || !active) return
    const { art, frame } = { art: textures.front.art, frame: textures.frame.image }
    if (!(art instanceof HTMLCanvasElement) || !(frame instanceof HTMLCanvasElement)) return
    c.width = art.width
    c.height = art.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(art, 0, 0)
    ctx.drawImage(frame, 0, 0)
  }, [textures, active])

  // renderer + loop
  useEffect(() => {
    if (!active || !textures) return
    let stop: (() => void) | undefined
    let raf1 = 0
    let t1 = 0
    const boot = (): (() => void) | undefined => {
    const canvas = canvasRef.current
    if (!canvas) return
    let renderer: FoilRenderer
    try {
      renderer = new FoilRenderer(canvas)
      renderer.setTextures(textures)
    } catch {
      setFailed(true)
      setActive(false)
      return
    }
    if (pendingFlip.current && revealedRef.current) {
      pendingFlip.current = false
      flipStart.current = performance.now()
      setBurst((b) => b + 1)
      if ('vibrate' in navigator) navigator.vibrate(15)
    }
    const supersample = !lowPower()
    const finish = finishFor(card)
    const seed = [...card.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7)
    const start = performance.now()
    const cur = { x: 0, y: 0 }
    let raf = 0
    let last = start
    let lastInteract = start - 5000
    let pointer: { id: number; x0: number; y0: number; t0: number; moved: number } | null = null
    const target = { x: 0, y: 0 }

    const setTarget = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      target.x = clamp(-nx * 1.1, -MAX_TILT, MAX_TILT)
      target.y = clamp(ny * 0.9, -MAX_TILT, MAX_TILT)
    }
    const down = (e: PointerEvent) => {
      pointer = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: 0 }
      canvas.setPointerCapture?.(e.pointerId)
      lastInteract = performance.now()
      setTarget(e)
    }
    const move = (e: PointerEvent) => {
      if (!pointer || pointer.id !== e.pointerId) return
      pointer.moved = Math.max(pointer.moved, Math.hypot(e.clientX - pointer.x0, e.clientY - pointer.y0))
      lastInteract = performance.now()
      setTarget(e)
    }
    const up = (e: PointerEvent) => {
      if (!pointer || pointer.id !== e.pointerId) return
      const tap = e.type === 'pointerup' && performance.now() - pointer.t0 < 250 && pointer.moved < 8
      pointer = null
      target.x = 0
      target.y = 0
      lastInteract = performance.now()
      if (!tap) return
      if (revealedRef.current) cbs.current.onInspect?.()
      else cbs.current.onReveal?.()
    }
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)

    let first = true
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (document.hidden) return
      const dt = clamp((now - last) / 1000, 0, 0.05)
      last = now
      const time = (now - start) / 1000
      if (!pointer && now - lastInteract > 1500) {
        target.x = 0.14 * Math.sin(time * 0.7)
        target.y = 0.09 * Math.sin(time * 0.53 + 1)
      }
      const k = 1 - Math.exp(-dt * 6)
      cur.x += (target.x - cur.x) * k
      cur.y += (target.y - cur.y) * k
      // face-down is yaw pi (the back, upright); face-up is yaw 0
      let base = revealedRef.current ? 0 : Math.PI
      let lift = 0
      const fs = flipStart.current
      if (revealedRef.current && fs !== null) {
        const p = clamp((now - fs) / FLIP_MS, 0, 1)
        base = Math.PI * Math.pow(1 - p, 3)
        lift = 0.05 * Math.sin(Math.PI * p)
        if (p >= 1) flipStart.current = null
      }
      if (first) { first = false; setDrawn(true) }
      renderer.draw({ yaw: base + cur.x, pitch: cur.y, time, cardScale: CARD_SCALE + lift, finish, supersample, seed })
    }
    const visibleNow = () => {
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    frame(performance.now()) // paint synchronously: the first frame is on screen with the view
    visibleNow()
    document.addEventListener('visibilitychange', visibleNow)
    const onLost = (e: Event) => {
      e.preventDefault()
      setFailed(true)
    }
    canvas.addEventListener('webglcontextlost', onLost)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', visibleNow)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      renderer.dispose()
    }
    }
    if (revealedRef.current && flipStart.current === null && !pendingFlip.current) {
      // the flat face is already on screen: set WebGL up after the first paint
      raf1 = requestAnimationFrame(() => { t1 = window.setTimeout(() => { stop = boot() }, 0) })
    } else stop = boot()
    return () => {
      cancelAnimationFrame(raf1)
      window.clearTimeout(t1)
      stop?.()
    }
  }, [active, textures, card])

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    if (revealedRef.current) cbs.current.onInspect?.()
    else cbs.current.onReveal?.()
  }, [])

  const showGl = active && !failed && textures
  const aria = revealed ? `${card.name}. Tap for details` : `Face-down card${label ? ` for ${label}` : ''}. Tap to reveal`

  return (
    <span className="tcard-host" ref={hostRef}>
      {showGl ? (
        <div className={`tcard-wrap tcard-${size}`}>
          <div className="tcard-gl" style={{ aspectRatio: String(textures.aspect) }}>
            {revealed && !drawn && <canvas ref={flatRef} className="tcard-flat" aria-hidden="true" />}
            <canvas ref={canvasRef} className="tcard-gl-canvas" role="button" tabIndex={0} aria-label={aria} onKeyDown={onKey} />
            {!drawn && !revealed && <div className="tcard-gl-loading" aria-busy="true"><span className="tcard-spinner" /></div>}
            <Sparkles burst={burst} />
          </div>
          {label && <span className="tcard-label">{label}</span>}
        </div>
      ) : failed ? (
        <TarotCardFallback {...props} />
      ) : (
        <Loading size={size} aspect={textures?.aspect ?? DEFAULT_ASPECT} label={label} aria={aria}
          onClick={revealed ? undefined : () => cbs.current.onReveal?.()} />
      )}
    </span>
  )
}
