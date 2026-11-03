/** Today's date in UTC as YYYY-MM-DD. All readings use this, so everyone shares a day boundary. */
export function utcDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** Milliseconds until the next 00:00 UTC. */
export function msUntilNextUtcDay(now: Date = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  return next - now.getTime()
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(h)}:${p(m)}:${p(s)}`
}
