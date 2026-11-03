import { Link } from 'react-router-dom'
import { utcDate } from '../lib/dates'
import { streak } from '../lib/streak'
import { useAppState } from '../lib/storage'

export default function Bonds() {
  const { friends, history } = useAppState()
  const today = utcDate()
  const list = Object.values(friends).sort((a, b) => (history[b.id]?.[0]?.date ?? '').localeCompare(history[a.id]?.[0]?.date ?? '') || a.name.localeCompare(b.name))
  return (
    <main className="page bonds">
      <h1>Bonds</h1>
      {list.length === 0 ? (
        <p className="muted">No bonds yet. Scan a friend on the Twin tab.</p>
      ) : (
        <ul className="bond-list">
          {list.map((f) => {
            const h = history[f.id] ?? []
            const run = streak(h, today)
            return (
              <li key={f.id}>
                <Link to={`/bonds/${f.id}`} className="bond-item">
                  <strong>{f.name}</strong>
                  {h[0] && <span className="muted bond-meta">{`Last ${h[0].date}`}{run > 0 && <span className="streak" title={`${run}-day streak`}> · 🔥 {run}</span>}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
