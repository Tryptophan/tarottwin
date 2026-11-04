import type { Element } from '../data/cards'
import { t } from '../i18n'

export type Relation = 'same' | 'allied' | 'opposed' | 'neutral'
export type Tone = 'harmonious' | 'challenging' | 'balanced'

const ALLIES: ReadonlyArray<readonly [Element, Element]> = [
  ['fire', 'air'],
  ['water', 'earth'],
]
const OPPOSITES: ReadonlyArray<readonly [Element, Element]> = [
  ['fire', 'water'],
  ['air', 'earth'],
]

const matches = (pairs: ReadonlyArray<readonly [Element, Element]>, a: Element, b: Element) =>
  pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))

/** Elemental dignity between two elements. Symmetric. */
export function relation(a: Element, b: Element): Relation {
  if (a === b) return 'same'
  if (matches(ALLIES, a, b)) return 'allied'
  if (matches(OPPOSITES, a, b)) return 'opposed'
  return 'neutral'
}

const SCORE: Record<Relation, number> = { same: 1, allied: 1, opposed: -1, neutral: 0 }

/**
 * Overall tone. The you↔friend relation counts double; the bridge↔each-side
 * relations elaborate it.
 */
export function overallTone(main: Relation, bridgeA: Relation, bridgeB: Relation): Tone {
  const score = SCORE[main] * 2 + SCORE[bridgeA] + SCORE[bridgeB]
  return score > 0 ? 'harmonious' : score < 0 ? 'challenging' : 'balanced'
}

export const RELATION_LABEL: Record<Relation, string> = t.dignity.relation
