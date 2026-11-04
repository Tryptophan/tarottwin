import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCountdown, msUntilNextUtcDay, utcDate } from '../lib/dates'
import { useAppState } from '../lib/storage'
import { twinRows } from '../lib/twinList'
import { t } from '../i18n'

/** Twin readings with each bond: ready to read, or a countdown to the next one once today's is done. */
export default function TwinReadings() {
  const { friends, history } = useAppState()
  // one clock for every row; the day rolling over turns finished rows back into ready ones
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const rows = twinRows(friends, history, utcDate(now))
  return (
    <section className="home-twins">
      <h2>{t.twinReadings.title}</h2>
      {rows.length === 0 ? (
        <p className="muted">{t.twinReadings.emptyBefore}<Link to="/bonds">{t.nav.bonds}</Link>{t.twinReadings.emptyAfter}</p>
      ) : (
        <ul className="bond-list">
          {rows.map((r) => (
            <li key={r.id}>
              <Link to={`/twin/${r.id}`} className="bond-item">
                <strong>{r.name}</strong>
                <span className="muted bond-meta">
                  {r.done ? <>{t.twinReadings.nextIn} <time>{formatCountdown(msUntilNextUtcDay(now))}</time></> : t.twinReadings.ready}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
