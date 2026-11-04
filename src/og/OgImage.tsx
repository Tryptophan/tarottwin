import { useLayoutEffect, useRef } from 'react'
import { CARD_BY_ID } from '../data/cards'
import { TarotCard } from '../components/TarotCard'
import { Logo } from '../components/Logo'
import { LANG } from '../i18n'
import { SEO } from '../i18n/seo'
import type { Print } from '../lib/print'
import './og.css'

/**
 * The 1200x630 link-preview image, in the current language (`?lang=`). Not part of the app: `scripts/gen-og.mjs`
 * opens it in headless Chrome and saves a screenshot per language to `public/og/<lang>.png`.
 */
const FAN: ReadonlyArray<{ id: string; print: Print; rot: number; x: number; y: number }> = [
  { id: 'major-00-the-fool', print: { serial: 1, rarity: 'COMMON' }, rot: -13, x: 0, y: 40 },
  { id: 'major-02-the-high-priestess', print: { serial: 2, rarity: 'HOLO' }, rot: -4, x: 128, y: 8 },
  { id: 'major-10-wheel-of-fortune', print: { serial: 10, rarity: 'GOLD' }, rot: 5, x: 256, y: 8 },
  { id: 'major-01-the-magician', print: { serial: 1, rarity: 'GALAXY' }, rot: 14, x: 384, y: 40 },
]

/** Width the headline may take before the cards begin. */
const HEAD_W = 480

export default function OgImage() {
  const seo = SEO[LANG]
  const head = useRef<HTMLHeadingElement>(null)
  // each headline line stays on one row: step the size down until the widest fits
  useLayoutEffect(() => {
    const el = head.current
    if (!el) return
    for (let px = 72; px >= 40; px -= 2) {
      el.style.fontSize = `${px}px`
      if (el.scrollWidth <= HEAD_W) break
    }
  })
  return (
    <div className={`og og-${LANG}`}>
      <div className="og-copy">
        <div className="og-brand"><Logo size={44} /><span>Tarot Twin</span></div>
        <h1 ref={head} className="og-head">{seo.ogHeadline.split('\n').map((l, i) => <span key={i}>{l}</span>)}</h1>
        <p className="og-sub">{seo.ogSub}</p>
        <p className="og-url">tarottwin.com</p>
      </div>
      <div className="og-fan">
        {FAN.map((f) => (
          <div key={f.id} className="og-card" style={{ transform: `translate(${f.x}px, ${f.y}px) rotate(${f.rot}deg)` }}>
            <TarotCard card={CARD_BY_ID.get(f.id)!} print={f.print} revealed size="lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
