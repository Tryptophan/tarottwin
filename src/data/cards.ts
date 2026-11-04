import { deck as EN } from '../i18n/en'
import { L } from '../i18n'

export type Element = 'fire' | 'water' | 'air' | 'earth'
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles'
export type Arcana = 'major' | 'minor'

export interface Card {
  /** Stable slug, also the art filename: e.g. `major-00-the-fool`, `wands-01` */
  id: string
  name: string
  arcana: Arcana
  suit: Suit | null
  /** Major: 0–21. Minor: 1–14 (11 Page, 12 Knight, 13 Queen, 14 King). */
  number: number
  element: Element
  /** The meaning printed on the card, in the reader's language. */
  upright: string
  /** Short phrases from the meaning that the reading prose draws from. */
  keywords: readonly string[]
}

export const SUIT_ELEMENT: Record<Suit, Element> = {
  wands: 'fire',
  cups: 'water',
  swords: 'air',
  pentacles: 'earth',
}

const SUITS: readonly Suit[] = ['wands', 'cups', 'swords', 'pentacles']

const pad = (n: number) => String(n).padStart(2, '0')
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Traditional elements of the majors, 0 (The Fool) to 21 (The World). */
const MAJOR_ELEMENTS: readonly Element[] = [
  'air', 'air', 'water', 'earth', 'fire', 'earth', 'air', 'water', 'fire', 'earth', 'fire',
  'air', 'water', 'water', 'fire', 'earth', 'fire', 'air', 'water', 'fire', 'fire', 'earth',
]

// ids come from the English names, so they never change with the language
const majorCards: Card[] = MAJOR_ELEMENTS.map((element, number) => {
  const [name, upright, keywords] = L.deck.majors[number]
  return { id: `major-${pad(number)}-${slug(EN.majors[number][0])}`, name, arcana: 'major', suit: null, number, element, upright, keywords }
})

const minorCards: Card[] = SUITS.flatMap((suit) =>
  L.deck.minors[suit].map(([name, upright, keywords], i) => ({
    id: `${suit}-${pad(i + 1)}`,
    name,
    arcana: 'minor' as const,
    suit,
    number: i + 1,
    element: SUIT_ELEMENT[suit],
    upright,
    keywords,
  })),
)

/** All 78 cards in canonical order: 22 majors, then wands, cups, swords, pentacles. */
export const DECK: readonly Card[] = [...majorCards, ...minorCards]

export const CARD_BY_ID: ReadonlyMap<string, Card> = new Map(DECK.map((c) => [c.id, c]))
