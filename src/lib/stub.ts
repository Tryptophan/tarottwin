import { CARD_BY_ID, DECK } from '../data/cards'
import { utcDate } from './dates'
import { bridgeSeed, dailySeed, printFor, RARITIES, RUN_SIZE, type Print } from './print'
import { pairReading } from './reading'
import type { AppState, Friend, HistoryEntry } from './storage'

/**
 * Stubbed data for trying every state of the app by hand: `npm run dev:stubbed`.
 * It uses its own storage key (your real profile is untouched), is rebuilt on every page load
 * with dates relative to today, and never connects to the relays.
 */
export const STUBBED = import.meta.env.VITE_STUBBED === 'true'

const DAY = 86_400_000
const hexId = (n: number) => n.toString(16).padStart(2, '0').repeat(10)
const hexSecret = (n: number) => n.toString(16).padStart(2, '0').repeat(16)

export const STUB_USER_ID = 'abcdef0123456789abcd'

interface Spec {
  name: string
  /** days ago (0 = today) on which you finished the twin reading */
  mine: number[]
  /** days ago on which they did, as last synced; undefined = never synced */
  theirs?: number[]
  /** the bond is brand new: you opened their link and they have not answered */
  waiting?: boolean
  /** what this bond is there to show */
  note: string
}

const run = (from: number, len: number) => Array.from({ length: len }, (_, i) => from + i)

/** Every bond state worth looking at. `note` says what each one is for. */
export const STUB_SPECS: Spec[] = [
  { name: 'Ada', mine: run(1, 4), theirs: run(0, 5), note: 'ready to read; she already read today, streak alive from yesterday' },
  { name: 'Bea', mine: run(0, 7), theirs: run(0, 7), note: 'done today: countdown; 7-day shared streak' },
  { name: 'Cal', mine: run(0, 3), theirs: run(1, 3), note: 'you read today, he has not yet; shared streak of 2 still alive' },
  { name: 'Dov', mine: [], waiting: true, note: 'brand new: waiting to sync, no readings' },
  { name: 'Eli', mine: [], theirs: [], note: 'synced, but no readings yet' },
  { name: 'Fay', mine: run(5, 6), theirs: run(5, 6), note: 'streak broken: last twin reading 5 days ago' },
  { name: 'Gus', mine: run(0, 45), theirs: run(0, 45), note: 'done today; long 45-day streak, lots of history' },
  { name: 'Hal', mine: [], theirs: run(0, 4), note: 'he reads every day, you have never read with him' },
  { name: 'Ingrid Maximilliana von Habsburg-Lothringen', mine: run(2, 2), theirs: run(2, 2), note: 'very long name; streak ended 2 days ago' },
  { name: 'Jo', mine: [0, 2, 4, 6], theirs: [0, 1, 2, 3, 4, 5, 6], note: 'you read every other day: shared streak of 1' },
]

/** A full profile with every state at once. Deterministic for a given `now`. */
export function stubState(now: Date = new Date()): AppState {
  const day = (ago: number) => utcDate(new Date(now.getTime() - ago * DAY))
  const friends: Record<string, Friend> = {}
  const history: Record<string, HistoryEntry[]> = {}
  STUB_SPECS.forEach((spec, i) => {
    const id = hexId(i + 1)
    friends[id] = {
      id,
      name: spec.name,
      addedAt: new Date(now.getTime() - (i + 3) * DAY).toISOString(),
      secret: hexSecret(i + 1),
      ...(spec.waiting
        ? { joinVia: hexSecret(200 + i) }
        : { pub: hexSecret(100 + i).repeat(2), syncedAt: 1_700_000_000 + i, theirDates: (spec.theirs ?? []).map(day) }),
    }
    history[id] = spec.mine
      .map(day)
      .sort()
      .reverse()
      .map((date) => {
        const r = pairReading(STUB_USER_ID, id, date)
        return { date, mine: r.mine.id, theirs: r.theirs.id, bridge: r.bridge.id }
      })
  })
  // some of the deck unlocked: every card from the readings, plus the rest
  const fromReadings = Object.values(history).flat().flatMap((e) => [e.mine, e.theirs, e.bridge])
  const spread = DECK.map((c) => c.id)
  // prints: those of the readings, plus a few extra pulls of the spread cards so the Collection shows counts
  const prints: Record<string, Print[]> = {}
  const add = (id: string, p: Print) => {
    const have = (prints[id] ??= [])
    if (!have.some((h) => h.serial === p.serial && h.rarity === p.rarity)) have.push(p)
  }
  for (const [fid, list] of Object.entries(history)) {
    for (const e of list) {
      add(e.mine, printFor(dailySeed(STUB_USER_ID, e.date), CARD_BY_ID.get(e.mine)!))
      add(e.theirs, printFor(dailySeed(fid, e.date), CARD_BY_ID.get(e.theirs)!))
      add(e.bridge, printFor(bridgeSeed(STUB_USER_ID, fid, e.date), CARD_BY_ID.get(e.bridge)!))
    }
  }
  // every card in every rarity at least once, plus a second copy of some so the counts differ
  DECK.forEach((c, i) => {
    RARITIES.forEach((rarity, r) => add(c.id, { serial: 1 + ((i * 7 + r * 13) % RUN_SIZE), rarity }))
    if (i % 3 === 0) add(c.id, { serial: 100 - (i % RUN_SIZE), rarity: RARITIES[i % RARITIES.length] })
  })
  return {
    userId: STUB_USER_ID,
    userSecret: hexSecret(250),
    inviteSecret: hexSecret(251),
    revoked: [],
    name: 'Stub Tester',
    onboarded: true,
    friends,
    history,
    unlocked: [...new Set([...fromReadings, ...spread])],
    prints,
  }
}
