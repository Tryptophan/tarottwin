import { DECK, type Card } from '../data/cards'
import { overallTone, relation, type Relation, type Tone } from './dignity'
import { seededRng } from './rng'

/** Daily card: seeded by user ID + UTC date. Deterministic. */
export function dailyCard(userId: string, date: string): Card {
  const rng = seededRng(`daily|${userId}|${date}`)
  return DECK[Math.floor(rng() * DECK.length)]
}

/**
 * Bridge card: seeded by both IDs (sorted, so symmetric) + date. Drawn from the
 * deck with the two daily cards removed so all three cards are distinct.
 */
export function bridgeCard(idA: string, idB: string, date: string, exclude: readonly Card[]): Card {
  const [lo, hi] = [idA, idB].sort()
  const rng = seededRng(`bridge|${lo}|${hi}|${date}`)
  const pool = DECK.filter((c) => !exclude.some((e) => e.id === c.id))
  return pool[Math.floor(rng() * pool.length)]
}

export interface PairReading {
  date: string
  mine: Card
  theirs: Card
  bridge: Card
  youFriend: Relation
  youBridge: Relation
  friendBridge: Relation
  tone: Tone
}

/** Reading from the perspective of `myId`. Both sides get the same cards. */
export function pairReading(myId: string, friendId: string, date: string): PairReading {
  const mine = dailyCard(myId, date)
  const theirs = dailyCard(friendId, date)
  const bridge = bridgeCard(myId, friendId, date, [mine, theirs])
  const youFriend = relation(mine.element, theirs.element)
  const youBridge = relation(mine.element, bridge.element)
  const friendBridge = relation(theirs.element, bridge.element)
  return {
    date, mine, theirs, bridge, youFriend, youBridge, friendBridge,
    tone: overallTone(youFriend, youBridge, friendBridge),
  }
}
