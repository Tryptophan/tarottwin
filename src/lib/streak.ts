import type { HistoryEntry } from './storage'

const DAY = 86_400_000
const dayNum = (date: string) => Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY)

/**
 * Consecutive UTC days with a pair reading, counted back from the most recent one.
 * Still alive only if that reading is from today or yesterday (today is not over yet);
 * otherwise the streak is broken and this returns 0.
 */
export function streak(history: readonly HistoryEntry[], today: string): number {
  const days = [...new Set(history.map((e) => dayNum(e.date)))].sort((a, b) => b - a)
  if (days.length === 0 || dayNum(today) - days[0] > 1) return 0
  let n = 1
  while (n < days.length && days[n - 1] - days[n] === 1) n++
  return n
}
