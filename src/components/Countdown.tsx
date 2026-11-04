import { useEffect, useState } from 'react'
import { formatCountdown, msUntilNextUtcDay } from '../lib/dates'
import { t } from '../i18n'

/** Ticks each second; calls onZero once when the UTC day rolls over. `hidden` only hides the text. */
export default function Countdown({ label = t.home.newCardIn, onZero, hidden = false }: { label?: string; onZero?: () => void; hidden?: boolean }) {
  const [ms, setMs] = useState(() => msUntilNextUtcDay())
  useEffect(() => {
    const t = setInterval(() => {
      const next = msUntilNextUtcDay()
      setMs((prev) => {
        if (next > prev + 1000) setTimeout(() => onZero?.(), 0)
        return next
      })
    }, 1000)
    return () => clearInterval(t)
  }, [onZero])
  if (hidden) return null // keeps ticking so the day still rolls over
  return (
    <p className="countdown">
      {label} <time>{formatCountdown(ms)}</time>
    </p>
  )
}
