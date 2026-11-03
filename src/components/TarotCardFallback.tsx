import { useEffect, useRef, useState } from 'react'
import type { Card } from '../data/cards'
import { faceDataUrl } from '../gl/cardFace'
import { loadManifest } from '../lib/foil'
import { CardSigil } from './CardSigil'
import { Sparkles } from './Sparkles'

type Size = 'sm' | 'md' | 'lg' | 'xl'

function CardBack() {
  return (
    <svg className="card-back-art" viewBox="0 0 200 300" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="cb-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#261038" />
          <stop offset="1" stopColor="#0d0517" />
        </radialGradient>
      </defs>
      <rect width="200" height="300" fill="url(#cb-bg)" />
      <rect x="10" y="10" width="180" height="280" rx="8" fill="none" stroke="#c6d65f" strokeWidth="1.5" />
      <rect x="17" y="17" width="166" height="266" rx="5" fill="none" stroke="#c6d65f" strokeOpacity="0.4" strokeWidth="0.8" />
      <circle cx="100" cy="150" r="58" fill="none" stroke="#c6d65f" strokeOpacity="0.6" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d="M-2 -62 L0 -80 L2 -62 Z" fill="#c6d65f" opacity="0.7" transform={`translate(100 150) rotate(${i * 22.5})`} />
      ))}
      <path d="M112 112 A40 40 0 1 0 112 188 A32 32 0 1 1 112 112 Z" fill="#c6d65f" />
      {[[135, 120, 5], [60, 100, 3], [70, 195, 4], [140, 190, 3], [45, 150, 2.5], [155, 150, 2.5]].map(([x, y, s], i) => (
        <path key={i} d={`M${x} ${y - s * 2} L${x + s * 0.5} ${y - s * 0.5} L${x + s * 2} ${y} L${x + s * 0.5} ${y + s * 0.5} L${x} ${y + s * 2} L${x - s * 0.5} ${y + s * 0.5} L${x - s * 2} ${y} L${x - s * 0.5} ${y - s * 0.5} Z`} fill="#eadef4" opacity="0.9" />
      ))}
      <g fill="#c6d65f" fontFamily="system-ui, Helvetica, Arial, sans-serif" fontWeight="bold" fontSize="15" letterSpacing="3" textAnchor="middle">
        <text x="101.5" y="255">TAROT TWIN</text>
        <text x="101.5" y="255" transform="rotate(180 100 150)">TAROT TWIN</text>
      </g>
      <path d="M25 30 h20 M155 30 h20 M25 270 h20 M155 270 h20" stroke="#c6d65f" strokeWidth="1.2" />
    </svg>
  )
}

export function TarotCardFallback({
  card, revealed, onReveal, onInspect, label, size = 'md',
}: {
  card: Card
  revealed: boolean
  onReveal?: () => void
  onInspect?: () => void
  label?: string
  size?: Size
}) {
  const [imgOk, setImgOk] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const [burst, setBurst] = useState(0)
  const [flashing, setFlashing] = useState(false)
  const [faceUrl, setFaceUrl] = useState<string | null>(null)
  const prev = useRef(revealed)

  useEffect(() => {
    let dead = false
    loadManifest()
      .then((m) => (m ? faceDataUrl(m, card) : null))
      .then((u) => !dead && setFaceUrl(u))
      .catch(() => {})
    return () => { dead = true }
  }, [card])

  useEffect(() => {
    let t: number | undefined
    if (revealed && !prev.current) {
      setBurst((b) => b + 1)
      setFlashing(true)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(15)
      t = window.setTimeout(() => setFlashing(false), 1000)
    }
    prev.current = revealed
    return () => window.clearTimeout(t)
  }, [revealed])

  const major = card.arcana === 'major'
  const handle = () => (revealed ? onInspect?.() : onReveal?.())
  const aria = revealed ? `${card.name}. Tap for details` : `Face-down card${label ? ` for ${label}` : ''}. Tap to reveal`
  const src = `${import.meta.env.BASE_URL}cards/${card.id}.webp`

  return (
    <div className={`tcard-wrap tcard-${size}`}>
      <button
        type="button"
        className={`tcard ${revealed ? 'is-revealed' : ''} ${major ? 'tcard-major' : 'tcard-minor'} ${flashing ? 'is-flashing' : ''}`}
        onClick={handle}
        aria-label={aria}
        aria-pressed={revealed}
      >
        <span className="tcard-inner">
          <span className="tcard-face tcard-back">
            <CardBack />
          </span>
          <span className={`tcard-face tcard-front${faceUrl ? ' is-face' : ''}`}>
            {faceUrl ? (
              <img src={faceUrl} alt="" className="tcard-face-img" draggable={false} />
            ) : (
            <span className="tcard-art">
              {!imgFailed && (
                <img
                  src={src}
                  alt=""
                  className={imgOk ? 'tcard-img is-loaded' : 'tcard-img'}
                  onLoad={() => setImgOk(true)}
                  onError={() => setImgFailed(true)}
                  draggable={false}
                />
              )}
              {!imgOk && <CardSigil card={card} />}
            </span>
            )}
            {!faceUrl && <span className="tcard-name">{card.name}</span>}
          </span>
        </span>
        <Sparkles burst={burst} />
      </button>
      {label && <span className="tcard-label">{label}</span>}
    </div>
  )
}
