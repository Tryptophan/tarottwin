import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Card } from '../data/cards'
import { TarotCard } from './TarotCard'
import { holdOverlay } from '../gl/renderer'
import { RARITIES, type Print, type Rarity } from '../lib/print'

/**
 * Full-screen view of a revealed card (its details are printed on the card). It owns a history entry,
 * so the phone's back gesture closes it instead of leaving the page.
 */
const label = (r: Rarity) => r[0] + r.slice(1).toLowerCase()

/**
 * `print` is the copy drawn in a reading. In the Collection, pass `owned` instead (every print pulled of this card):
 * a button per rarity switches between them, and the rarities not owned are disabled.
 */
export function CardInspect({ card, print, owned, onClose, locked = false }: { card: Card | null; print?: Print; owned?: Print[]; onClose: () => void; locked?: boolean }) {
  const backRef = useRef<HTMLButtonElement>(null)
  const pushed = useRef(false)
  const pending = useRef<number | undefined>(undefined)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const open = card !== null
  const [faceUp, setFaceUp] = useState(true)
  const [pick, setPick] = useState<Rarity | null>(null)
  // the latest pull of each rarity; the rarest one owned is shown first
  const byRarity = (r: Rarity) => owned?.filter((p) => p.rarity === r).at(-1)
  const rarest = [...RARITIES].reverse().find((r) => byRarity(r))
  const shown = owned ? byRarity(pick ?? rarest ?? 'COMMON') : print
  useEffect(() => { setFaceUp(true); setPick(null) }, [card?.id])

  useEffect(() => {
    if (!open) return
    const release = holdOverlay()
    window.clearTimeout(pending.current) // StrictMode re-run: keep the entry we already pushed
    if (!pushed.current) {
      history.pushState({ ...(history.state ?? {}), inspect: true }, '')
      pushed.current = true
    }
    const prev = document.activeElement as HTMLElement | null
    backRef.current?.focus()
    const onPop = () => {
      pushed.current = false
      onCloseRef.current()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    function close() {
      if (pushed.current) history.back() // popstate then closes us
      else onCloseRef.current()
    }
    closeFn.current = close
    window.addEventListener('popstate', onPop)
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      release()
      window.removeEventListener('popstate', onPop)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      prev?.focus?.()
      // closed by the parent (not by back): drop our entry, unless this is only a StrictMode re-run
      pending.current = window.setTimeout(() => {
        if (pushed.current) {
          pushed.current = false
          if (history.state?.inspect) history.back()
        }
      }, 0)
    }
  }, [open])

  const closeFn = useRef<() => void>(() => {})
  const close = useCallback(() => closeFn.current(), [])

  if (!card) return null
  return createPortal(
    <div className="inspect" role="dialog" aria-modal="true" aria-label={card.name}
      onClick={(e) => e.target === e.currentTarget && close()}>
      <button ref={backRef} type="button" className="inspect-back" aria-label="Back" onClick={close}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
      </button>
      <div className={`inspect-stage tcard-xl${locked ? ' tcard-locked' : ''}`} onClick={(e) => e.target === e.currentTarget && close()}>
        <TarotCard card={card} print={shown} revealed={faceUp} size="xl" onReveal={() => setFaceUp(true)} onInspect={() => setFaceUp(false)} />
      </div>
      {owned && (
        <div className="inspect-finishes" role="radiogroup" aria-label="Rarity">
          {RARITIES.map((r) => {
            const n = owned.filter((p) => p.rarity === r).length
            return (
              <button key={r} type="button" role="radio" aria-checked={shown?.rarity === r} disabled={n === 0}
                className={shown?.rarity === r ? 'on' : ''} onClick={() => setPick(r)}>
                {label(r)}{n > 0 && ` ×${n}`}
              </button>
            )
          })}
        </div>
      )}
    </div>,
    document.body,
  )
}
