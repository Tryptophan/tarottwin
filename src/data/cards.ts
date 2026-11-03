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
  upright: string
}

export const SUIT_ELEMENT: Record<Suit, Element> = {
  wands: 'fire',
  cups: 'water',
  swords: 'air',
  pentacles: 'earth',
}

const MAJORS: ReadonlyArray<readonly [string, Element, string]> = [
  ['The Fool', 'air', 'New beginnings, innocence, a leap of faith.'],
  ['The Magician', 'air', 'Willpower, skill, turning intent into action.'],
  ['The High Priestess', 'water', 'Intuition, mystery, inner knowing.'],
  ['The Empress', 'earth', 'Nurture, abundance, creative growth.'],
  ['The Emperor', 'fire', 'Structure, authority, steady leadership.'],
  ['The Hierophant', 'earth', 'Tradition, shared values, guidance.'],
  ['The Lovers', 'air', 'Union, alignment, meaningful choice.'],
  ['The Chariot', 'water', 'Drive, determination, victory through focus.'],
  ['Strength', 'fire', 'Courage, patience, gentle inner power.'],
  ['The Hermit', 'earth', 'Solitude, reflection, a guiding light within.'],
  ['Wheel of Fortune', 'fire', 'Cycles, luck, a turning point.'],
  ['Justice', 'air', 'Fairness, truth, accountability.'],
  ['The Hanged Man', 'water', 'Surrender, new perspective, a pause.'],
  ['Death', 'water', 'Endings, transformation, clearing the way.'],
  ['Temperance', 'fire', 'Balance, moderation, blending opposites.'],
  ['The Devil', 'earth', 'Attachment, temptation, shadow patterns.'],
  ['The Tower', 'fire', 'Sudden change, upheaval, revelation.'],
  ['The Star', 'air', 'Hope, renewal, quiet inspiration.'],
  ['The Moon', 'water', 'Illusion, dreams, the subconscious.'],
  ['The Sun', 'fire', 'Joy, vitality, clarity and success.'],
  ['Judgement', 'fire', 'Awakening, reckoning, answering a calling.'],
  ['The World', 'earth', 'Completion, wholeness, a cycle fulfilled.'],
]

/** Index 0 = Ace … 9 = Ten, 10 = Page, 11 = Knight, 12 = Queen, 13 = King */
const MINOR_MEANINGS: Record<Suit, readonly string[]> = {
  wands: [
    'A spark of inspiration and bold new energy.',
    'Planning, choices, and looking beyond the horizon.',
    'Expansion, foresight, and waiting for your ships to come in.',
    'Celebration, homecoming, and stable joy.',
    'Rivalry, competition, and scattered conflict.',
    'Victory, recognition, and public success.',
    'Defending your position with resolve.',
    'Swift movement, messages, and fast progress.',
    'Resilience, persistence, and one last push.',
    'Burden, overcommitment, and carrying too much.',
    'An eager explorer with fresh creative ideas.',
    'Passionate, adventurous, and impulsive pursuit.',
    'Warm, confident, and magnetic leadership.',
    'Visionary, bold leadership and charisma.',
  ],
  cups: [
    'New feelings, love, and emotional openness.',
    'Mutual attraction, partnership, and connection.',
    'Friendship, celebration, and shared joy.',
    'Apathy, contemplation, and reevaluating offers.',
    'Loss, regret, and grieving what was.',
    'Nostalgia, childhood memories, and kindness.',
    'Fantasy, wishful thinking, and many options.',
    'Walking away to seek something deeper.',
    'Contentment, a wish fulfilled, emotional satisfaction.',
    'Harmony, family, and lasting happiness.',
    'A tender messenger bringing creative or romantic news.',
    'Romantic, charming, and following the heart.',
    'Compassionate, intuitive, and emotionally wise.',
    'Emotional balance, diplomacy, and calm generosity.',
  ],
  swords: [
    'Clarity, a breakthrough, and the truth revealed.',
    'Stalemate, difficult choice, and avoided truth.',
    'Heartbreak, grief, and painful honesty.',
    'Rest, recovery, and quiet contemplation.',
    'Conflict, hollow victory, and tension.',
    'Moving on, transition, and calmer waters.',
    'Strategy, secrecy, and acting alone.',
    'Restriction, self-doubt, and feeling trapped.',
    'Anxiety, worry, and sleepless nights.',
    'Painful ending, rock bottom, and release.',
    'Curious, alert, and eager to learn.',
    'Fast, direct, and driven by ideas.',
    'Perceptive, independent, and clear-eyed.',
    'Intellect, authority, and fair judgment.',
  ],
  pentacles: [
    'A new opportunity, prosperity, and grounded beginnings.',
    'Juggling priorities and adapting to change.',
    'Teamwork, craft, and building something together.',
    'Security, saving, and holding on tightly.',
    'Hardship, lack, and feeling left out in the cold.',
    'Generosity, giving and receiving, and support.',
    'Patience, long-term investment, and waiting for the harvest.',
    'Diligence, mastery, and dedicated practice.',
    'Self-sufficiency, luxury, and well-earned comfort.',
    'Legacy, family wealth, and lasting security.',
    'Studious, practical, and open to new skills.',
    'Reliable, methodical, and steady effort.',
    'Nurturing, practical, and resourceful abundance.',
    'Prosperous, dependable, and generous provider.',
  ],
}

const MINOR_NAMES = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Page', 'Knight', 'Queen', 'King',
] as const

const SUITS: readonly Suit[] = ['wands', 'cups', 'swords', 'pentacles']

const pad = (n: number) => String(n).padStart(2, '0')
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const title = (s: string) => s[0].toUpperCase() + s.slice(1)

const majorCards: Card[] = MAJORS.map(([name, element, upright], number) => ({
  id: `major-${pad(number)}-${slug(name)}`,
  name,
  arcana: 'major',
  suit: null,
  number,
  element,
  upright,
}))

const minorCards: Card[] = SUITS.flatMap((suit) =>
  MINOR_NAMES.map((rank, i) => ({
    id: `${suit}-${pad(i + 1)}`,
    name: `${rank} of ${title(suit)}`,
    arcana: 'minor' as const,
    suit,
    number: i + 1,
    element: SUIT_ELEMENT[suit],
    upright: MINOR_MEANINGS[suit][i],
  })),
)

/** All 78 cards in canonical order: 22 majors, then wands, cups, swords, pentacles. */
export const DECK: readonly Card[] = [...majorCards, ...minorCards]

export const CARD_BY_ID: ReadonlyMap<string, Card> = new Map(DECK.map((c) => [c.id, c]))
