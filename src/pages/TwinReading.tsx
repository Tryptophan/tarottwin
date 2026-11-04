import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TarotCard } from '../components/TarotCard'
import { CardInspect } from '../components/CardInspect'
import Countdown from '../components/Countdown'
import DignityChips from '../components/DignityChips'
import { update, useAppState, withPrints, withReading, withUnlocked } from '../lib/storage'
import { streakBefore, twinProse } from '../lib/prose'
import { pairReading } from '../lib/reading'
import { utcDate } from '../lib/dates'
import { bridgeSeed, dailySeed, printFor, type Print } from '../lib/print'
import { isValidId } from '../lib/twinLink'
import type { Card } from '../data/cards'
import { t } from '../i18n'

export default function TwinReading() {
  const { id = '' } = useParams()
  const { userId, name, friends } = useAppState()
  const valid = isValidId(id)
  const own = id === userId

  const r = t.reading
  if (!valid) return <main className="page"><h1>{r.invalidTitle}</h1><p className="muted">{r.invalidTwin}</p><Link className="btn btn-ghost" to="/twin">{t.common.back}</Link></main>
  if (own) return <main className="page"><h1>{r.selfTitle}</h1><p className="muted">{r.selfTwin}</p><Link className="btn btn-ghost" to="/twin">{t.common.back}</Link></main>
  if (!friends[id]) return <main className="page"><h1>{r.notBondTitle}</h1><p className="muted">{r.notBondBody}</p><Link className="btn btn-ghost" to="/twin">{t.common.back}</Link></main>
  const friendName = friends[id].name
  return <Reading key={id} friendId={id} friendName={friendName} myId={userId} myName={name} />
}

const STEPS_KEY = 'tarottwin:twinsteps'
const stepsId = (myId: string, friendId: string, date: string) => `${myId}|${friendId}|${date}`

function loadStep(id: string): number {
  try {
    const [k, n] = (localStorage.getItem(STEPS_KEY) ?? '').split('=')
    return k === id ? Math.min(3, Math.max(0, Number(n) || 0)) : 0
  } catch { return 0 }
}

function Reading({ friendId, friendName, myId, myName }: { friendId: string; friendName: string; myId: string; myName: string }) {
  const { history, friends } = useAppState()
  const [date, setDate] = useState(() => utcDate())
  const [step, setStep] = useState(() => {
    const done = (history[friendId] ?? []).some((e) => e.date === utcDate())
    return done ? 3 : loadStep(stepsId(myId, friendId, utcDate()))
  })
  const [sheet, setSheet] = useState<Card | null>(null)
  const r = useMemo(() => pairReading(myId, friendId, date), [myId, friendId, date])
  const prints = useMemo<Print[]>(() => [
    printFor(dailySeed(myId, date), r.mine),
    printFor(dailySeed(friendId, date), r.theirs),
    printFor(bridgeSeed(myId, friendId, date), r.bridge),
  ], [myId, friendId, date, r])

  useEffect(() => {
    if (step === 3) {
      update((s) => withReading(s, friendId, { date, mine: r.mine.id, theirs: r.theirs.id, bridge: r.bridge.id }))
    }
  }, [step, friendId, date, r])

  // each card revealed is unlocked in the Collection
  useEffect(() => {
    const ids = [r.mine.id, r.theirs.id, r.bridge.id].slice(0, step)
    if (ids.length) update((s) => withPrints(withUnlocked(s, ...ids), ...ids.map((id, i): [string, Print] => [id, prints[i]])))
  }, [step, r, prints])

  useEffect(() => {
    try { localStorage.setItem(STEPS_KEY, `${stepsId(myId, friendId, date)}=${step}`) } catch { /* ignore */ }
  }, [step, myId, friendId, date])

  const run = streakBefore((history[friendId] ?? []).map((e) => e.date), date, friends[friendId]?.theirDates)
  const text = useMemo(() => twinProse(r, date, run), [r, date, run])

  const onZero = useCallback(() => { setDate(utcDate()); setStep(0) }, [])
  const reveal = (n: number) => () => setStep((s) => Math.max(s, n + 1))
  const me = myName || t.common.you
  const cards: [Card, string][] = [[r.mine, me], [r.theirs, friendName], [r.bridge, t.reading.bridge]]

  return (
    <main className="page reading">
      <h1>{t.reading.pairTitle(me, friendName)}</h1>
      <p className="muted">{date}</p>
      <div className="reading-cards">
        {cards.map(([card, label], i) => (
          <div key={i} className={`reading-slot${i > step ? ' reading-locked' : ''}`}>
            <TarotCard card={card} print={prints[i]} revealed={step > i} size="md" label={label}
              onReveal={i === step ? reveal(i) : undefined}
              onInspect={() => setSheet(card)} />
          </div>
        ))}
      </div>
      {step < 3 && <p className="muted" style={{ textAlign: 'center' }}>{t.reading.tapToReveal([t.reading.revealYou, friendName, t.reading.revealBridge][step])}</p>}
      {step === 3 && <p className="prose">{text}</p>}
      {step === 3 && (
        <DignityChips mine={r.mine} theirs={r.theirs} bridge={r.bridge} youFriend={r.youFriend}
          youBridge={r.youBridge} friendBridge={r.friendBridge} tone={r.tone}
          myName={me} friendName={friendName} />
      )}
      <Countdown label={t.reading.nextIn} onZero={onZero} hidden={step < 3} />
      <CardInspect card={sheet} print={sheet ? prints[[r.mine, r.theirs, r.bridge].indexOf(sheet)] : undefined} onClose={() => setSheet(null)} />
    </main>
  )
}
