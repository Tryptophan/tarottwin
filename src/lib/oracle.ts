import { DECK, type Card } from '../data/cards'
import { leanOf } from '../data/oracle'
import { keywords } from './prose'
import { seededRng } from './rng'

/** One yes/no reading every 6 hours, in fixed UTC windows (00, 06, 12, 18). */
export const WINDOW_MS = 6 * 3600_000
export const MAX_QUESTION = 140

export type Verdict = 'yes' | 'no' | 'maybe'
export const POSITIONS = ['Past', 'Present', 'Future'] as const
/** The future decides the most. */
const WEIGHTS = [1, 1.5, 2.5] as const

export interface Drawn {
  card: Card
  reversed: boolean
}

export interface OracleReading {
  /** start of the UTC window this was asked in (ms) */
  at: number
  cards: [Drawn, Drawn, Drawn]
  verdict: Verdict
  score: number
}

/** What is kept in the journal. */
export interface OracleEntry {
  at: number
  /** when it was asked (ms); older entries only have the window start */
  askedAt?: number
  question: string
  cards: Array<{ id: string; reversed: boolean }>
  verdict: Verdict
}

/** Seed of the prints (serial and rarity) of an oracle reading, for `printFor`. */
export const oracleSeed = (userId: string, question: string, at: number) => `oracle|${userId}|${normalizeQuestion(question)}|${windowStart(at)}`

export const windowStart = (now: number = Date.now()) => Math.floor(now / WINDOW_MS) * WINDOW_MS
export const msUntilNextWindow = (now: number = Date.now()) => windowStart(now) + WINDOW_MS - now

/** What the user typed, tidied for display: trimmed, whitespace collapsed, capped. */
export const cleanQuestion = (q: string) => q.replace(/\s+/g, ' ').trim().slice(0, MAX_QUESTION)

/** What is hashed: the same question in other casing, spacing or punctuation gives the same answer. */
export function normalizeQuestion(q: string): string {
  return cleanQuestion(q).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N} ]+/gu, '').replace(/ +/g, ' ').trim()
}

export const verdictOf = (score: number): Verdict => (score >= 2 ? 'yes' : score <= -2 ? 'no' : 'maybe')

export function drawOracle(userId: string, question: string, at: number): OracleReading {
  const rng = seededRng(`oracle|${userId}|${normalizeQuestion(question)}|${windowStart(at)}`)
  const pool = [...DECK]
  const cards = [0, 1, 2].map((): Drawn => {
    const card = pool.splice(Math.floor(rng() * pool.length), 1)[0]
    return { card, reversed: rng() < 0.5 }
  }) as [Drawn, Drawn, Drawn]
  const score = cards.reduce((t, d, i) => t + WEIGHTS[i] * leanOf(d.card.id) * (d.reversed ? -1 : 1), 0)
  return { at: windowStart(at), cards, verdict: verdictOf(score), score }
}

export function toEntry(question: string, r: OracleReading, askedAt: number = Date.now()): OracleEntry {
  return { at: r.at, askedAt, question: cleanQuestion(question), cards: r.cards.map((d) => ({ id: d.card.id, reversed: d.reversed })), verdict: r.verdict }
}

export const VERDICT_LABEL: Record<Verdict, string> = { yes: 'Likely yes', no: 'Likely no', maybe: 'Maybe' }

const LEAD = ['Behind you,', 'Before you,', 'Ahead,']
const TURN: Record<'up' | 'down', readonly string[]> = {
  up: ['{n} lends {k}', '{n} offers {k}', '{n} carries {k}'],
  down: ['{n}, turned over, clouds {k}', '{n} reversed holds {k} just out of reach', '{n}, upended, bends {k} inward'],
}
const CLOSE: Record<Verdict, readonly string[]> = {
  yes: ['The omens lean toward yes.', 'The veil parts, and it opens toward yes.', 'The stars lean your way.'],
  no: ['The omens lean toward no.', 'The veil stays drawn, and it closes toward no.', 'The stars turn their faces away.'],
  maybe: ['The omens will not settle.', 'The veil trembles and the answer stays unwritten.', 'The stars hold their breath.'],
}

/** Mystical text for a reading: one clause per card, then a closing line. Deterministic. */
export function oracleProse(r: OracleReading, question: string): string {
  const pick = <T,>(xs: readonly T[], rng: () => number) => xs[Math.floor(rng() * xs.length)]
  const rng = seededRng(`oracle-prose|${normalizeQuestion(question)}|${r.at}|${r.cards.map((d) => d.card.id).join(',')}`)
  const parts = r.cards.map((d, i) => {
    const t = pick(TURN[d.reversed ? 'down' : 'up'], rng).replace('{n}', d.card.name).replace('{k}', pick(keywords(d.card), rng))
    return `${LEAD[i]} ${t}.`
  })
  return `${parts.join(' ')} ${pick(CLOSE[r.verdict], rng)}`
}
