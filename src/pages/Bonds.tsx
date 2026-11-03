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
      <h1>Bonds</h1>
      {list.length === 0 ? (
        <p className="muted">No bonds yet. Share your invite from the Twin tab.</p>
      ) : (
        <ul className="bond-list">
          {list.map((f) => {
            const h = history[f.id] ?? []
            const mine = h.map((e) => e.date)
            const run = f.theirDates ? sharedStreak(mine, f.theirDates, today) : streak(h, today)
            const theirsToday = f.theirDates?.includes(today)
            return (
              <li key={f.id}>
                <Link to={`/bonds/${f.id}`} className="bond-item">
                  <strong>{f.name}</strong>
                  <span className="muted bond-meta">
                    {h[0] ? `Last ${h[0].date}` : 'No readings yet'}
                    {run > 0 && <span className="streak" title={`${run}-day streak`}> · 🔥 {run}</span>}
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
