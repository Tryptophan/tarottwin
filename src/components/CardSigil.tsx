import { useMemo } from 'react'
import type { Card, Suit } from '../data/cards'
import { seededRng } from '../lib/rng'

const ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI']
const COURT: Record<number, string> = { 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' }

function SuitGlyph({ suit }: { suit: Suit }) {
  switch (suit) {
    case 'wands':
      return (
        <g>
          <path d="M-4 40 L4 40 L3 -20 L-3 -20 Z" />
          <path d="M0 -50 C-14 -32 -10 -22 0 -20 C10 -22 14 -32 0 -50 Z" />
          <path d="M-3 0 L-14 -8 M3 12 L14 4" fill="none" strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'cups':
      return (
        <g>
          <path d="M-26 -34 H26 C26 -6 12 8 0 8 C-12 8 -26 -6 -26 -34 Z" />
          <path d="M-3 8 H3 V30 H-3 Z M-16 40 H16 L10 30 H-10 Z" />
        </g>
      )
    case 'swords':
      return (
        <g>
          <path d="M0 -52 L7 -34 V20 H-7 V-34 Z" />
          <path d="M-22 20 H22 V27 H-22 Z M-3 27 H3 V44 H-3 Z" />
        </g>
      )
    default:
      return (
        <g>
          <circle r="34" fill="none" strokeWidth="4" />
          <path d="M0 -26 L7.5 -8 L26 -8 L11 4 L17 22 L0 11 L-17 22 L-11 4 L-26 -8 L-7.5 -8 Z" />
        </g>
      )
  }
}

function MajorSigil({ n }: { n: number }) {
  const kind = n % 3
  if (kind === 0)
    return (
      <g>
        <circle r="18" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M-2.5 -24 L0 -44 L2.5 -24 Z" transform={`rotate(${i * 30})`} />
        ))}
      </g>
    )
  if (kind === 1)
    return <path d="M12 -44 A34 34 0 1 0 12 44 A27 27 0 1 1 12 -44 Z" />
  return (
    <path d="M0 -46 L10 -14 L44 -14 L16 6 L27 40 L0 19 L-27 40 L-16 6 L-44 -14 L-10 -14 Z" />
  )
}

export function CardSigil({ card }: { card: Card }) {
  const dots = useMemo(() => {
    const r = seededRng(card.id)
    const pts = Array.from({ length: 14 }, () => ({ x: 12 + r() * 176, y: 14 + r() * 272, r: 0.8 + r() * 1.6 }))
    return pts
  }, [card.id])
  const major = card.arcana === 'major'
  const label = major ? ROMAN[card.number] ?? String(card.number) : COURT[card.number] ?? String(card.number)
  return (
    <svg className="sigil" viewBox="0 0 200 300" role="img" aria-label={card.name} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`sg-${card.id}`} cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#5d3a7a" />
          <stop offset="1" stopColor="#220f35" />
        </radialGradient>
      </defs>
      <rect width="200" height="300" fill={`url(#sg-${card.id})`} />
      <polyline
        points={dots.slice(0, 7).map((d) => `${d.x},${d.y}`).join(' ')}
        fill="none"
        stroke="#b19dc2"
        strokeOpacity="0.25"
        strokeWidth="0.8"
      />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={i % 4 === 0 ? '#c6d65f' : '#eadef4'} opacity="0.85" />
      ))}
      <circle cx="100" cy="135" r="62" fill="none" stroke="#c6d65f" strokeOpacity="0.5" strokeWidth="1.2" />
      <circle cx="100" cy="135" r="68" fill="none" stroke="#c6d65f" strokeOpacity="0.25" strokeWidth="0.8" strokeDasharray="2 5" />
      <g transform="translate(100 135) scale(1)" fill="#c6d65f" stroke="#c6d65f" opacity="0.95">
        {major ? <MajorSigil n={card.number} /> : <SuitGlyph suit={card.suit!} />}
      </g>
      <text x="100" y="240" textAnchor="middle" fontFamily="Jost, system-ui, sans-serif" fontSize={label.length > 4 ? 20 : 28} fill="#e3ecaa" letterSpacing="2">
        {label}
      </text>
      {!major && card.number <= 10 && (
        <text x="100" y="262" textAnchor="middle" fontFamily="Jost, system-ui, sans-serif" fontSize="11" fill="#b19dc2" letterSpacing="3">
          {card.suit!.toUpperCase()}
        </text>
      )}
    </svg>
  )
}
