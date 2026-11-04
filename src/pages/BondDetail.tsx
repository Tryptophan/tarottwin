import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TarotCard } from '../components/TarotCard'
import { CardInspect } from '../components/CardInspect'
import DignityChips from '../components/DignityChips'
import { update, useAppState, withoutFriend } from '../lib/storage'
import { streakBefore, twinProse } from '../lib/prose'
import { CARD_BY_ID, type Card } from '../data/cards'
import { overallTone, relation } from '../lib/dignity'
import { bridgeSeed, dailySeed, printFor, type Print } from '../lib/print'
import { t } from '../i18n'

export default function BondDetail() {
  const { id = '' } = useParams()
  const { userId, friends, history, name } = useAppState()
  const nav = useNavigate()
  const [sheet, setSheet] = useState<{ card: Card; print: Print } | null>(null)
  const friend = friends[id]
  if (!friend) return <main className="page"><h1>{t.bond.notFound}</h1><Link className="btn btn-ghost" to="/bonds">{t.common.back}</Link></main>
  const entries = history[id] ?? []
  return (
    <main className="page bond-detail">
      <p><Link to="/bonds">&larr; {t.nav.bonds}</Link></p>
      <h1>{friend.name}</h1>
      {entries.length === 0 && <p className="muted">{t.bond.noReadings}</p>}
      {entries.map((e) => {
        const mine = CARD_BY_ID.get(e.mine), theirs = CARD_BY_ID.get(e.theirs), bridge = CARD_BY_ID.get(e.bridge)
        if (!mine || !theirs || !bridge) return null
        const yf = relation(mine.element, theirs.element)
        const yb = relation(mine.element, bridge.element)
        const fb = relation(theirs.element, bridge.element)
        const prints = [
          printFor(dailySeed(userId, e.date), mine),
          printFor(dailySeed(id, e.date), theirs),
          printFor(bridgeSeed(userId, id, e.date), bridge),
        ]
        return (
          <section key={e.date} className="bond-day">
            <h2>{e.date}</h2>
            <div className="bond-cards">
              {[mine, theirs, bridge].map((c, i) => (
                <TarotCard key={i} card={c} print={prints[i]} revealed size="sm" onInspect={() => setSheet({ card: c, print: prints[i] })} />
              ))}
            </div>
            <p className="prose">{twinProse(
              { mine, theirs, bridge, youFriend: yf, tone: overallTone(yf, yb, fb) },
              e.date,
              streakBefore(entries.map((x) => x.date), e.date, friend.theirDates),
            )}</p>
            <DignityChips mine={mine} theirs={theirs} bridge={bridge} youFriend={yf} youBridge={yb}
              friendBridge={fb} tone={overallTone(yf, yb, fb)} myName={name || t.common.you} friendName={friend.name} />
          </section>
        )
      })}
      <button className="btn btn-ghost" onClick={() => {
        if (confirm(t.bond.confirmDelete(friend.name))) {
          update((s) => withoutFriend(s, id))
          nav('/bonds')
        }
      }}>{t.bond.delete}</button>
      <CardInspect card={sheet?.card ?? null} print={sheet?.print} onClose={() => setSheet(null)} />
    </main>
  )
}
