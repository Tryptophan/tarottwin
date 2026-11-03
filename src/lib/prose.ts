import type { Card, Element } from '../data/cards'
import type { Relation, Tone } from './dignity'
import { seededRng } from './rng'
import { sharedStreak, streakOfDates } from './streak'

/**
 * Procedural reading text: short, mystical, and a pure function of the cards, their elemental
 * relations and a streak bucket, so it is identical for both friends all day.
 * The streak is never named; it only changes the lead-in of the last sentence.
 */

type Pick = <T>(xs: readonly T[]) => T

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

/** The card's keywords from its meaning: "Willpower, skill, turning intent into action." */
export function keywords(card: Card): string[] {
  return card.upright.replace(/\.$/, '').split(/,\s*/).map((k) => k.toLowerCase().replace(/^and\s+/, ''))
}

const EL = (e: Element) => e

const LEAD_TWIN = ['As new threads begin,', 'With a rhythm taking hold,', 'With your rhythm growing,', 'With so deep a rhythm between you,']
const LEAD_DAILY = ['Today,', 'As a rhythm takes hold,', 'With your rhythm growing,', 'With a rhythm so well worn,']
const bucket = (run: number) => (run <= 0 ? 0 : run < 3 ? 1 : run < 7 ? 2 : 3)

const REL: Record<Relation, readonly string[]> = {
  same: ['{a} answers {a}, doubling its strength', 'one current of {a} runs through you both'],
  allied: ['{a} and {b} feed one another', '{a} lends {b} its breath'],
  opposed: ['{a} and {b} pull against each other', '{a} and {b} strike sparks off one another'],
  neutral: ['{a} and {b} meet without friction', '{a} and {b} keep a courteous distance'],
}
const fill = (t: string, a: Element, b: Element) => t.replace(/\{a\}/g, EL(a)).replace(/\{b\}/g, EL(b))

const TONE: Record<Tone, readonly string[]> = {
  harmonious: ['the day favors you both', 'little will resist you together', 'what you start side by side will hold'],
  challenging: ['friction will be the day\'s teacher', 'honesty will matter more than ease', 'tread gently and listen twice'],
  balanced: ['the day tips whichever way you lean', 'neither pulls ahead, so choose together', 'steady attention will decide it'],
}

const ELEMENT_DAILY: Record<Element, readonly string[]> = {
  fire: ['act while the fire is warm', 'let your courage lead'],
  water: ['let feeling guide your steps', 'trust what you sense beneath the surface'],
  air: ['speak your thoughts plainly', 'let a clear idea take flight'],
  earth: ['build something small and lasting', 'keep your feet on steady ground'],
}

export function twinProse(
  p: { mine: Card; theirs: Card; bridge: Card; youFriend: Relation; tone: Tone },
  date: string,
  run: number,
): string {
  const [lo, hi] = [p.mine.id, p.theirs.id].sort()
  const pick = picker(`prose|${lo}|${hi}|${p.bridge.id}|${date}`)
  // the same text for both friends: order the pair by card id, not by who is looking
  const [a, b] = p.mine.id <= p.theirs.id ? [p.mine, p.theirs] : [p.theirs, p.mine]
  const ka = pick(keywords(a)), kb = pick(keywords(b)), kg = pick(keywords(p.bridge))
  const s1 = `${a.name} meets ${b.name}: ${ka} beside ${kb}, where ${fill(pick(REL[p.youFriend]), a.element, b.element)}.`
  const s2 = pick([
    `${p.bridge.name} arches between you, offering ${kg}.`,
    `Between you stands ${p.bridge.name}, a bridge of ${kg}.`,
    `${p.bridge.name} joins the two, carrying ${kg}.`,
  ])
  const s3 = `${LEAD_TWIN[bucket(run)]} ${pick(TONE[p.tone])}.`
  return `${s1} ${s2} ${s3}`
}

export function dailyProse(card: Card, date: string, run: number): string {
  const pick = picker(`prose|daily|${card.id}|${date}`)
  const kws = keywords(card)
  const k1 = pick(kws)
  const k2 = pick(kws.filter((k) => k !== k1).concat(k1))
  const s1 = k1 === k2 ? `${card.name} brings ${k1}.` : `${card.name} brings ${k1} and ${k2}.`
  return `${s1} ${LEAD_DAILY[bucket(run)]} ${pick(ELEMENT_DAILY[card.element])}.`
}
