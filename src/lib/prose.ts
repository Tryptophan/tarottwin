import type { Card } from '../data/cards'
import { L } from '../i18n'
import type { Bucket, Pick, ProseCard } from '../i18n/types'
import type { Relation, Tone } from './dignity'
import { seededRng } from './rng'
import { sharedStreak, streakOfDates } from './streak'

/**
 * Procedural reading text: short, mystical, and a pure function of the cards, their elemental
 * relations and a streak bucket, so it is identical for both friends all day.
 * The streak is never named; it only changes the lead-in of the last sentence.
 * The templates live in each locale's prose kit (`src/i18n`).
 */

const picker = (seed: string): Pick => {
  const rng = seededRng(seed)
  return (xs) => xs[Math.floor(rng() * xs.length)]
}

/** Streak up to (not including) `date`, so the text does not change when today's reading is saved. */
export function streakBefore(mine: readonly string[], date: string, theirs?: readonly string[]): number {
  const before = mine.filter((d) => d < date)
  if (!theirs) return streakOfDates(before, date)
  return sharedStreak(before, theirs.filter((d) => d < date), date)
}

/** The card's keywords, in the reader's language. */
export const keywords = (card: Card): readonly string[] => card.keywords

const bucket = (run: number): Bucket => (run <= 0 ? 0 : run < 3 ? 1 : run < 7 ? 2 : 3)
const proseCard = (c: Card): ProseCard => ({ name: c.name, keywords: c.keywords, element: c.element })

export function twinProse(
  p: { mine: Card; theirs: Card; bridge: Card; youFriend: Relation; tone: Tone },
  date: string,
  run: number,
): string {
  const [lo, hi] = [p.mine.id, p.theirs.id].sort()
  const pick = picker(`prose|${lo}|${hi}|${p.bridge.id}|${date}`)
  // the same text for both friends: order the pair by card id, not by who is looking
  const [a, b] = p.mine.id <= p.theirs.id ? [p.mine, p.theirs] : [p.theirs, p.mine]
  return L.prose.twin({ a: proseCard(a), b: proseCard(b), bridge: proseCard(p.bridge), rel: p.youFriend, tone: p.tone, bucket: bucket(run) }, pick)
}

export function dailyProse(card: Card, date: string, run: number): string {
  return L.prose.daily(proseCard(card), bucket(run), picker(`prose|daily|${card.id}|${date}`))
}
