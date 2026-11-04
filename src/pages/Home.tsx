import { useCallback, useEffect, useMemo, useState } from 'react'
import { TarotCard } from '../components/TarotCard'
import { CardInspect } from '../components/CardInspect'
import Countdown from '../components/Countdown'
import TwinReadings from '../components/TwinReadings'
import { update, useAppState, withPrints, withUnlocked } from '../lib/storage'
import { dailyProse, streakBefore } from '../lib/prose'
import { dailyCard } from '../lib/reading'
import { utcDate } from '../lib/dates'
import { dailySeed, printFor } from '../lib/print'
import type { Card } from '../data/cards'
import { t } from '../i18n'

const SKEY = 'tarottwin:revealed'
const stamp = (userId: string, date: string) => `${userId}|${date}`

export default function Home() {
  const { userId, name, friends, history } = useAppState()
  const [date, setDate] = useState(() => utcDate())
  const [revealed, setRevealed] = useState(() => localStorage.getItem(SKEY) === stamp(userId, utcDate()))
  const [sheet, setSheet] = useState<Card | null>(null)
  const card = useMemo(() => dailyCard(userId, date), [userId, date])
  const print = useMemo(() => printFor(dailySeed(userId, date), card), [userId, date, card])
  const isRevealed = revealed && localStorage.getItem(SKEY) === stamp(userId, date)
  const run = useMemo(
    () => Math.max(0, ...Object.values(friends).map((f) => streakBefore((history[f.id] ?? []).map((e) => e.date), date, f.theirDates))),
    [friends, history, date],
  )
  const onZero = useCallback(() => setDate(utcDate()), [])
  // pulling the daily card unlocks it in the Collection
  useEffect(() => {
    if (isRevealed) update((s) => withPrints(withUnlocked(s, card.id), [card.id, print]))
  }, [isRevealed, card.id, print])
  return (
    <main className="page home">
      <h1>{t.home.title}</h1>
      <p className="muted">{name}, {date}</p>
      <div className="home-card">
        <TarotCard
          card={card}
          print={print}
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
      {!isRevealed && <p className="muted" style={{ textAlign: 'center' }}>{t.home.tapToReveal}</p>}
      {isRevealed && <p className="prose">{dailyProse(card, date, run)}</p>}
      <Countdown onZero={onZero} hidden={!isRevealed} />
      <TwinReadings />
      <CardInspect card={sheet} print={print} onClose={() => setSheet(null)} />
    </main>
  )
}
