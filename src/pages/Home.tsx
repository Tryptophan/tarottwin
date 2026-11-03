import { useCallback, useEffect, useMemo, useState } from 'react'
import { TarotCard } from '../components/TarotCard'
import { CardInspect } from '../components/CardInspect'
import Countdown from '../components/Countdown'
import { update, useAppState, withUnlocked } from '../lib/storage'
import { dailyCard } from '../lib/reading'
import { utcDate } from '../lib/dates'
import type { Card } from '../data/cards'

const SKEY = 'tarottwin:revealed'
const stamp = (userId: string, date: string) => `${userId}|${date}`

export default function Home() {
  const { userId, name } = useAppState()
  const [date, setDate] = useState(() => utcDate())
  const [revealed, setRevealed] = useState(() => sessionStorage.getItem(SKEY) === stamp(userId, utcDate()))
  const [sheet, setSheet] = useState<Card | null>(null)
  const card = useMemo(() => dailyCard(userId, date), [userId, date])
  const isRevealed = revealed && sessionStorage.getItem(SKEY) === stamp(userId, date)
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
            try { sessionStorage.setItem(SKEY, stamp(userId, date)) } catch { /* ignore */ }
            setRevealed(true)
          }}
          onInspect={() => setSheet(card)}
        />
      </div>
      {!isRevealed && <p className="muted">Tap the card to reveal</p>}
      <Countdown onZero={onZero} hidden={!isRevealed} />
      <CardInspect card={sheet} onClose={() => setSheet(null)} />
    </main>
  )
}
