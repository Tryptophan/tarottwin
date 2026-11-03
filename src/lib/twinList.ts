import type { Friend, HistoryEntry } from './storage'

export interface TwinRow {
  id: string
  name: string
  /** true once the twin reading for today is done: it is on cooldown until the UTC day rolls over */
  done: boolean
}

/** One row per bond: readings that are ready first, then the ones on cooldown, each by name. */
export function twinRows(friends: Record<string, Friend>, history: Record<string, HistoryEntry[]>, today: string): TwinRow[] {
  return Object.values(friends)
    .map((f) => ({ id: f.id, name: f.name, done: (history[f.id] ?? []).some((e) => e.date === today) }))
    .sort((a, b) => Number(a.done) - Number(b.done) || a.name.localeCompare(b.name))
}
