import { useEffect, useRef, useState } from 'react'
import type { Card } from '../data/cards'
import { faceDataUrl } from '../gl/cardFace'
import { assetUrl, loadManifest } from '../lib/foil'
import { printTag, type Print } from '../lib/print'
import { CardSigil } from './CardSigil'
import { Sparkles } from './Sparkles'

type Size = 'sm' | 'md' | 'lg' | 'xl'

/** The same back as the foil card: public/foil/back/art.webp. */
function CardBack() {
  return <img className="card-back-art" src={assetUrl('foil/back/art.webp')} alt="" draggable={false} />
}

export function TarotCardFallback({
  card, print, revealed, onReveal, onInspect, label, size = 'md',
}: {
  card: Card
  print?: Print
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
      .then((m) => (m ? faceDataUrl(m, card, print) : null))
      .then((u) => !dead && setFaceUrl(u))
      .catch(() => {})
    return () => { dead = true }
  }, [card, print && printTag(print)])

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
