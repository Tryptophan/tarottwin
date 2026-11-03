import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TarotCard } from '../components/TarotCard'
import { CardInspect } from '../components/CardInspect'
import DignityChips from '../components/DignityChips'
import { update, useAppState, withoutFriend } from '../lib/storage'
import { CARD_BY_ID, type Card } from '../data/cards'
import { overallTone, relation } from '../lib/dignity'

export default function BondDetail() {
  const { id = '' } = useParams()
  const { friends, history, name } = useAppState()
  const nav = useNavigate()
  const [sheet, setSheet] = useState<Card | null>(null)
  const friend = friends[id]
  if (!friend) return <main className="page"><h1>Not found</h1><Link className="btn btn-ghost" to="/bonds">Back</Link></main>
  const entries = history[id] ?? []
  return (
    <main className="page bond-detail">
      <p><Link to="/bonds">&larr; Bonds</Link></p>
      <h1>{friend.name}</h1>
      {entries.length === 0 && <p className="muted">No readings yet.</p>}
      {entries.map((e) => {
        const mine = CARD_BY_ID.get(e.mine), theirs = CARD_BY_ID.get(e.theirs), bridge = CARD_BY_ID.get(e.bridge)
        if (!mine || !theirs || !bridge) return null
        const yf = relation(mine.element, theirs.element)
        const yb = relation(mine.element, bridge.element)
        const fb = relation(theirs.element, bridge.element)
        return (
          <section key={e.date} className="bond-day">
            <h2>{e.date}</h2>
            <div className="bond-cards">
              {[mine, theirs, bridge].map((c, i) => (
                <TarotCard key={i} card={c} revealed size="sm" onInspect={() => setSheet(c)} />
              ))}
            </div>
            <DignityChips mine={mine} theirs={theirs} bridge={bridge} youFriend={yf} youBridge={yb}
              friendBridge={fb} tone={overallTone(yf, yb, fb)} myName={name || 'You'} friendName={friend.name} />
          </section>
        )
      })}
      <button className="btn btn-ghost" onClick={() => {
        if (confirm(`Delete ${friend.name} and all twin readings?`)) {
          update((s) => withoutFriend(s, id))
          nav('/bonds')
        }
      }}>Delete friend</button>
      <CardInspect card={sheet} onClose={() => setSheet(null)} />
    </main>
  )
}
