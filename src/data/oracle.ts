/**
 * Hand-tuned yes/no lean of every card, upright, from -2 (a firm no) to +2 (a firm yes).
 * Reversed, the lean flips. Same order as `DECK`: majors 0-21, then each suit Ace to King.
 */
const MAJOR: readonly number[] = [
  1, 2, 0, 2, 1, 1, 2, 2, 2, -1, 1, 1, -1, -1, 1, -2, -2, 2, -1, 2, 1, 2,
]
const MINOR: Record<string, readonly number[]> = {
  wands: [2, 1, 1, 2, -1, 2, 1, 1, 0, -1, 1, 1, 1, 1],
  cups: [2, 2, 2, -1, -2, 1, -1, -1, 2, 2, 1, 1, 1, 1],
  swords: [1, -1, -2, 0, -2, 1, -1, -2, -2, -2, 0, 0, 0, 1],
  pentacles: [2, 0, 1, -1, -2, 1, 0, 1, 2, 2, 1, 1, 1, 2],
}

/** Upright lean of a card by id (`major-07-the-chariot`, `cups-05`). */
export function leanOf(id: string): number {
  const major = /^major-(\d{2})-/.exec(id)
  if (major) return MAJOR[Number(major[1])] ?? 0
  const minor = /^([a-z]+)-(\d{2})$/.exec(id)
  return (minor && MINOR[minor[1]]?.[Number(minor[2]) - 1]) || 0
}
