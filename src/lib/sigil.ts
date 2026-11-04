import type { Card } from '../data/cards'
import { seededRng } from './rng'

/**
 * The picture used when a card's real art isn't available (e.g. offline before it was saved):
 * the Tarot Twin logo (public/favicon.svg, without its dark tile) in a purple starfield.
 * Drawn in code so it needs no file; the stars are seeded by card id so each card's sky differs a little.
 */
export const SIGIL_W = 200
export const SIGIL_H = 323 // the art window's aspect (about 0.62)

const LIME = '#c6d65f'

const LOGO =
  '<g transform="rotate(-14 24 34)"><rect x="12" y="13" width="24" height="38" rx="4" fill="#3d1c59" stroke="#7d5c9a" stroke-width="1.5"/>' +
  '<path d="M24 25l1.8 4.2 4.2 1.8-4.2 1.8L24 37l-1.8-4.2-4.2-1.8 4.2-1.8z" fill="#b19dc2"/></g>' +
  '<g transform="rotate(14 40 34)"><rect x="28" y="13" width="24" height="38" rx="4" fill="#5d3a7a" stroke="#c6d65f" stroke-width="1.8"/>' +
  '<path d="M40 25l1.8 4.2 4.2 1.8-4.2 1.8L40 37l-1.8-4.2-4.2-1.8 4.2-1.8z" fill="#c6d65f"/></g>'

/** The picture as a standalone SVG document (width/height set so it also loads as an <img>). */
export function sigilSvg(card: Card): string {
  const r = seededRng(card.id)
  const stars = Array.from({ length: 26 }, (_, i) => {
    const x = 10 + r() * (SIGIL_W - 20)
    const y = 10 + r() * (SIGIL_H - 20)
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.7 + r() * 1.5).toFixed(1)}" fill="${i % 5 === 0 ? LIME : '#eadef4'}" opacity="0.8"/>`
  }).join('')
  const id = `sg-${card.id}`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="sigil" viewBox="0 0 ${SIGIL_W} ${SIGIL_H}" width="${SIGIL_W * 3}" height="${SIGIL_H * 3}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${card.name}">` +
    `<defs><radialGradient id="${id}" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#5d3a7a"/><stop offset="1" stop-color="#220f35"/></radialGradient></defs>` +
    `<rect width="${SIGIL_W}" height="${SIGIL_H}" fill="url(#${id})"/>` +
    stars +
    `<g transform="translate(100 161) scale(2.8) translate(-32 -32)">${LOGO}</g>` +
    `</svg>`
  )
}
