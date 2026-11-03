import type { Card } from '../data/cards'
import { seededRng } from './rng'

export const RARITIES = ['COMMON', 'HOLO', 'GOLD', 'GALAXY'] as const
export type Rarity = (typeof RARITIES)[number]

/** One printed copy of a card: its serial in the edition run and its rarity. */
export interface Print {
  serial: number
  rarity: Rarity
}

/** Copies per edition run: serials go 001 to 100. */
export const RUN_SIZE = 100

const ODDS: ReadonlyArray<readonly [Rarity, number]> = [
  ['COMMON', 0.6],
  ['HOLO', 0.25],
  ['GOLD', 0.11],
  ['GALAXY', 0.04],
]

/** The foilsmith finish each rarity is printed in (u_finish): standard, holo, gold, galaxy. */
export const RARITY_FINISH: Record<Rarity, number> = { COMMON: 5, HOLO: 0, GOLD: 2, GALAXY: 3 }

/**
 * The print of a drawn card. `seed` names the reading it was drawn in (owner ID + UTC date, or the sorted
 * pair for the bridge), so both sides of a reading see the same serial and rarity. Deterministic.
 */
export function printFor(seed: string, card: Card): Print {
  const rng = seededRng(`print|${seed}|${card.id}`)
  const serial = 1 + Math.floor(rng() * RUN_SIZE)
  let roll = rng()
  let rarity: Rarity = 'COMMON'
  for (const [r, p] of ODDS) {
    rarity = r
    if (roll < p) break
    roll -= p
  }
  return { serial, rarity }
}

/** Seeds of the readings a card can be drawn in. */
export const dailySeed = (userId: string, date: string) => `daily|${userId}|${date}`
export const bridgeSeed = (idA: string, idB: string, date: string) => {
  const [lo, hi] = [idA, idB].sort()
  return `bridge|${lo}|${hi}|${date}`
}

/** The serial line printed on the card, e.g. `006-GOLD`. */
export const printTag = (p: Print) => `${String(p.serial).padStart(3, '0')}-${p.rarity}`

/** Cache key of a card face: the same card printed differently has a different face. */
export const faceKey = (card: Card, print?: Print) => (print ? `${card.id}|${printTag(print)}` : card.id)
