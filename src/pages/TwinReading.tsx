import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { TarotCard } from '../components/TarotCard'
import { CardInspect } from '../components/CardInspect'
import Countdown from '../components/Countdown'
import DignityChips from '../components/DignityChips'
import { update, useAppState, withFriend, withReading, withUnlocked } from '../lib/storage'
import { pairReading } from '../lib/reading'
import { utcDate } from '../lib/dates'
import { isValidId } from '../lib/twinLink'
import type { Card } from '../data/cards'

export default function TwinReading() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const nameParam = params.get('n') ?? ''
  const { userId, name, friends } = useAppState()
  const valid = isValidId(id)
  const own = id === userId

  useEffect(() => {
    if (valid && !own) update((s) => withFriend(s, id, nameParam))
  }, [valid, own, id, nameParam])

  if (!valid) return <main className="page"><h1>Invalid link</h1><p className="muted">This Twin link is not valid.</p><Link className="btn btn-ghost" to="/twin">Back</Link></main>
  if (own) return <main className="page"><h1>That's you</h1><p className="muted">This is your own code. Scan a friend's instead.</p><Link className="btn btn-ghost" to="/twin">Back</Link></main>
  const friendName = friends[id]?.name ?? (nameParam.trim() || 'Friend')
  return <Reading key={id} friendId={id} friendName={friendName} myId={userId} myName={name} />
}

function Reading({ friendId, friendName, myId, myName }: { friendId: string; friendName: string; myId: string; myName: string }) {
  const [date, setDate] = useState(() => utcDate())
  const [step, setStep] = useState(0)
  const [sheet, setSheet] = useState<Card | null>(null)
  const r = useMemo(() => pairReading(myId, friendId, date), [myId, friendId, date])

  useEffect(() => {
    if (step === 3) {
      update((s) => withReading(s, friendId, { date, mine: r.mine.id, theirs: r.theirs.id, bridge: r.bridge.id }))
    }
  }, [step, friendId, date, r])

  // each card revealed is unlocked in the Collection
  useEffect(() => {
    const ids = [r.mine.id, r.theirs.id, r.bridge.id].slice(0, step)
    if (ids.length) update((s) => withUnlocked(s, ...ids))
  }, [step, r])

  const onZero = useCallback(() => { setDate(utcDate()); setStep(0) }, [])
  const reveal = (n: number) => () => setStep((s) => Math.max(s, n + 1))
  const cards: [Card, string][] = [[r.mine, myName || 'You'], [r.theirs, friendName], [r.bridge, 'Bridge']]

  return (
    <main className="page reading">
      <h1>{myName || 'You'} &amp; {friendName}</h1>
      <p className="muted">{date}</p>
      <div className="reading-cards">
        {cards.map(([card, label], i) => (
          <div key={i} className={`reading-slot${i > step ? ' reading-locked' : ''}`}>
            <TarotCard card={card} revealed={step > i} size="md" label={label}
              onReveal={i === step ? reveal(i) : undefined}
              onInspect={() => setSheet(card)} />
          </div>
        ))}
      </div>
      {step < 3 && <p className="muted" style={{ textAlign: 'center' }}>Tap to reveal: {['you', friendName, 'the bridge'][step]}</p>}
      {step === 3 && (
        <DignityChips mine={r.mine} theirs={r.theirs} bridge={r.bridge} youFriend={r.youFriend}
          youBridge={r.youBridge} friendBridge={r.friendBridge} tone={r.tone}
          myName={myName || 'You'} friendName={friendName} />
      )}
      <p className="muted note">{friendName} should scan your QR too to see the same reading.</p>
      <Countdown label="Next reading in" onZero={onZero} hidden={step < 3} />
      <CardInspect card={sheet} onClose={() => setSheet(null)} />
    </main>
  )
}
