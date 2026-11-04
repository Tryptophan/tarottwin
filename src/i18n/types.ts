import type { Element, Suit } from '../data/cards'
import type { Relation, Tone } from '../lib/dignity'
import type { Verdict } from '../lib/oracle'
import type { Messages } from './en'

export type { Messages }

/** One card's localized text: its name, the meaning printed on the card, and the keywords the prose draws from. */
export type CardText = readonly [name: string, upright: string, keywords: readonly string[]]

export interface DeckText {
  /** The 22 majors, 0 (The Fool) to 21 (The World). */
  majors: readonly CardText[]
  /** Per suit, 14 cards: index 0 = Ace … 9 = Ten, 10 = Page, 11 = Knight, 12 = Queen, 13 = King. */
  minors: Record<Suit, readonly CardText[]>
}

/** Picks one item; every locale gets the same seeded stream, so draws stay deterministic. */
export type Pick = <T>(xs: readonly T[]) => T

/** What the prose needs of a card, in the reader's language. */
export interface ProseCard {
  name: string
  keywords: readonly string[]
  element: Element
}

/** Streak bucket: 0 = none, 1 = 1–2 days, 2 = 3–6 days, 3 = 7+ days. It is never named, only shades the lead-in. */
export type Bucket = 0 | 1 | 2 | 3

export interface ProseKit {
  /** The daily card's text, e.g. "The Fool brings innocence and a leap of faith. Today, let a clear idea take flight." */
  daily(card: ProseCard, bucket: Bucket, pick: Pick): string
  /**
   * A twin reading. `a` and `b` are already ordered by card id (not by who is looking), so both friends read the
   * same text. `rel` is the relation between a and b, `tone` the reading's overall tone.
   */
  twin(p: { a: ProseCard; b: ProseCard; bridge: ProseCard; rel: Relation; tone: Tone; bucket: Bucket }, pick: Pick): string
  /** The yes/no oracle: one clause per card (past, present, future), then a closing line for the verdict. */
  oracle(cards: ReadonlyArray<{ card: ProseCard; reversed: boolean }>, verdict: Verdict, pick: Pick): string
}

export interface Locale {
  /** BCP 47 tag for `<html lang>`, e.g. `pt-BR`. */
  tag: string
  /** The language's own name, for the picker: "Português (Brasil)". */
  native: string
  ui: Messages
  deck: DeckText
  prose: ProseKit
}
