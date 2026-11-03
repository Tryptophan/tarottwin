import { Link } from 'react-router-dom'
import { utcDate } from '../lib/dates'
import { sharedStreak, streak } from '../lib/streak'
import { useAppState } from '../lib/storage'

export default function Bonds() {
  const { friends, history } = useAppState()
  const today = utcDate()
  const list = Object.values(friends).sort((a, b) => (history[b.id]?.[0]?.date ?? '').localeCompare(history[a.id]?.[0]?.date ?? '') || a.name.localeCompare(b.name))
  return (
    <main className="page bonds">
      <div className="bonds-head">
        <h1>Bonds</h1>
        <Link className="btn btn-gold" to="/twin">Invite</Link>
      </div>
      {list.length === 0 ? (
        <p className="muted">No bonds yet. Invite a friend to start one.</p>
      ) : (
        <ul className="bond-list">
          {list.map((f) => {
            const h = history[f.id] ?? []
            const mine = h.map((e) => e.date)
            const run = f.theirDates ? sharedStreak(mine, f.theirDates, today) : streak(h, today)
            const readToday = mine.includes(today)
            const safe = f.theirDates ? readToday && f.theirDates.includes(today) : readToday
            const theirsToday = f.theirDates?.includes(today)
                        return (
              <li key={f.id}>
                <Link to={readToday ? `/bonds/${f.id}` : `/twin/${f.id}`} className="bond-item">
                  <strong>{f.name}</strong>
                  <span className="muted bond-meta">
                    {h[0] ? `Last ${h[0].date}` : 'No readings yet'}
                    {run > 0 && (
                      <span className="streak" title={safe ? `${run}-day streak` : `${run}-day streak: read today to keep it`}>
                        {' · '}<span className={safe ? undefined : 'flame-fading'}>🔥</span> {run}
                      </span>
                    )}
                    {f.syncedAt === undefined ? ' · waiting to sync' : theirsToday ? ' · read today' : ' · not yet today'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
