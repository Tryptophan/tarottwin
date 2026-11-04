import { useMemo } from 'react'
import type { Card } from '../data/cards'
import { sigilSvg } from '../lib/sigil'

/** The Tarot Twin logo in a starfield, used where the real art can't load. See lib/sigil.ts. */
export function CardSigil({ card }: { card: Card }) {
  const html = useMemo(() => sigilSvg(card), [card])
  return <span className="sigil-wrap" dangerouslySetInnerHTML={{ __html: html }} />
}
