import type { Card } from '../data/cards'

export function toRoman(n: number): string {
  if (n <= 0) return '0'
  const t: Array<[number, string]> = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let out = ''
  let r = n
  for (const [v, s] of t) while (r >= v) { out += s; r -= v }
  return out
}

const COURT: Record<number, string> = { 1: 'Ace', 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' }

/** Major: roman numeral (0, I..XXI). Minor: Ace, 2..10, Page, Knight, Queen, King. */
export function rankLabel(card: Pick<Card, 'arcana' | 'number'>): string {
  if (card.arcana === 'major') return toRoman(card.number)
  return COURT[card.number] ?? String(card.number)
}

export function kindLabel(card: Pick<Card, 'arcana' | 'suit'>): string {
  if (card.arcana === 'major' || !card.suit) return 'Major Arcana'
  return card.suit[0].toUpperCase() + card.suit.slice(1)
}

export type Measure = (text: string, size: number) => number

/** Greedy word wrap. A single word wider than maxWidth stays on its own line. */
export function wrapLines(text: string, size: number, maxWidth: number, measure: Measure): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (cur && measure(next, size) > maxWidth) {
      lines.push(cur)
      cur = w
    } else cur = next
  }
  if (cur) lines.push(cur)
  return lines
}

/** Largest font size (step 1) in [minSize, maxSize] where the text wraps to at most maxLines. */
export function fitWrapped(
  text: string, maxWidth: number, maxLines: number, maxSize: number, minSize: number, measure: Measure,
): { size: number; lines: string[] } {
  for (let s = maxSize; s >= minSize; s--) {
    const lines = wrapLines(text, s, maxWidth, measure)
    if (lines.length <= maxLines) return { size: s, lines }
  }
  const lines = wrapLines(text, minSize, maxWidth, measure).slice(0, maxLines)
  if (lines.length) lines[lines.length - 1] = lines[lines.length - 1].replace(/[\s.,;:!?]*$/, '') + '…'
  return { size: minSize, lines }
}

/** Largest size in [minSize, maxSize] at which the text fits on one line. */
export function fitLine(text: string, maxWidth: number, maxSize: number, minSize: number, measure: Measure): number {
  for (let s = maxSize; s > minSize; s--) if (measure(text, s) <= maxWidth) return s
  return minSize
}

/**
 * The largest single font size (step 1) in [minSize, maxSize] at which EVERY text wraps to a block no
 * taller than maxHeight (line height = size * lineHeight). Using one size keeps all cards consistent.
 */
export function uniformSize(
  texts: readonly string[], maxWidth: number, maxHeight: number, lineHeight: number,
  maxSize: number, minSize: number, measure: Measure,
): number {
  for (let s = maxSize; s > minSize; s--) {
    const lh = Math.round(s * lineHeight)
    if (texts.every((t) => wrapLines(t, s, maxWidth, measure).length * lh <= maxHeight)) return s
  }
  return minSize
}

/** One single-line size for every text: the largest in [minSize, maxSize] at which the widest still fits. */
export function uniformLineSize(texts: readonly string[], maxWidth: number, maxSize: number, minSize: number, measure: Measure): number {
  return texts.reduce((m, t) => Math.min(m, fitLine(t, maxWidth, maxSize, minSize, measure)), maxSize)
}
