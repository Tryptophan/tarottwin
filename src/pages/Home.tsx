import { useCallback, useEffect, useMemo, useState } from 'react'
import { TarotCard } from '../components/TarotCard'
import { CardInspect } from '../components/CardInspect'
import Countdown from '../components/Countdown'
import TwinReadings from '../components/TwinReadings'
import { update, useAppState, withUnlocked } from '../lib/storage'
import { dailyProse, streakBefore } from '../lib/prose'
import { dailyCard } from '../lib/reading'
import { utcDate } from '../lib/dates'
import type { Card } from '../data/cards'

const SKEY = 'tarottwin:revealed'
const stamp = (userId: string, date: string) => `${userId}|${date}`

export default function Home() {
  const { userId, name, friends, history } = useAppState()
  const [date, setDate] = useState(() => utcDate())
  const [revealed, setRevealed] = useState(() => localStorage.getItem(SKEY) === stamp(userId, utcDate()))
  const [sheet, setSheet] = useState<Card | null>(null)
  const card = useMemo(() => dailyCard(userId, date), [userId, date])
  const isRevealed = revealed && localStorage.getItem(SKEY) === stamp(userId, date)
  const run = useMemo(
    () => Math.max(0, ...Object.values(friends).map((f) => streakBefore((history[f.id] ?? []).map((e) => e.date), date, f.theirDates))),
    [friends, history, date],
  )
  const onZero = useCallback(() => setDate(utcDate()), [])
  // pulling the daily card unlocks it in the Collection
  useEffect(() => {
    if (isRevealed) update((s) => withUnlocked(s, card.id))
  }, [isRevealed, card.id])
  return (
    <main className="page home">
      <h1>Today's card</h1>
      <p className="muted">{name}, {date}</p>
      <div className="home-card">
        <TarotCard
          card={card}
          revealed={isRevealed}
          size="lg"
          label={name}
          onReveal={() => {
            try { localStorage.setItem(SKEY, stamp(userId, date)) } catch { /* ignore */ }
            setRevealed(true)
          }}
          onInspect={() => setSheet(card)}
        />
      </div>
      {!isRevealed && <p className="muted" style={{ textAlign: 'center' }}>Tap the card to reveal</p>}
      {isRevealed && <p className="prose">{dailyProse(card, date, run)}</p>}
      <Countdown onZero={onZero} hidden={!isRevealed} />
      <TwinReadings />
      <CardInspect card={sheet} onClose={() => setSheet(null)} />
    </main>
  )
}
