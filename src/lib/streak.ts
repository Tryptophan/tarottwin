import type { HistoryEntry } from './storage'

const DAY = 86_400_000
const dayNum = (date: string) => Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY)

/**
 * Consecutive UTC days with a pair reading, counted back from the most recent one.
 * Still alive only if that reading is from today or yesterday (today is not over yet);
 * otherwise the streak is broken and this returns 0.
 */
export function streak(history: readonly HistoryEntry[], today: string): number {
  return streakOfDates(history.map((e) => e.date), today)
}

/** Streak of days both people completed a Twin reading together: only dates in both lists count. */
export function sharedStreak(mine: readonly string[], theirs: readonly string[], today: string): number {
  const t = new Set(theirs)
  return streakOfDates(mine.filter((d) => t.has(d)), today)
}

export function streakOfDates(dates: readonly string[], today: string): number {
  const days = [...new Set(dates.map(dayNum))].sort((a, b) => b - a)
  if (days.length === 0 || dayNum(today) - days[0] > 1) return 0
  let n = 1
  while (n < days.length && days[n - 1] - days[n] === 1) n++
  return n
}
