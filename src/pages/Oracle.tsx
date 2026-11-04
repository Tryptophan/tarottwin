import { useEffect, useMemo, useState } from 'react'
import { TarotCard } from '../components/TarotCard'
import { CardInspect } from '../components/CardInspect'
import { CARD_BY_ID } from '../data/cards'
import { formatCountdown } from '../lib/dates'
import {
  MAX_QUESTION, POSITIONS, VERDICT_LABEL, cleanQuestion, drawOracle, msUntilNextWindow, oracleProse, oracleSeed, toEntry, windowStart,
} from '../lib/oracle'
import { canShareImages, shareOracle } from '../lib/oracleImage'
import { printFor, type Print } from '../lib/print'
import { update, useAppState, withOracle, withPrints, withUnlocked } from '../lib/storage'
import { t } from '../i18n'

export default function Oracle() {
  const { userId, oracle } = useAppState()
  const [now, setNow] = useState(() => Date.now())
  const [question, setQuestion] = useState('')
  const [step, setStep] = useState(3)
  const [sheet, setSheet] = useState<number | null>(null)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // a new window opens: the last answer is put away
  const current = oracle.find((e) => e.at === windowStart(now)) ?? null
  const reading = useMemo(() => (current ? drawOracle(userId, current.question, current.at) : null), [userId, current])
  const text = useMemo(() => (reading && current ? oracleProse(reading, current.question) : ''), [reading, current])
  const prints = useMemo<Print[]>(
    () => (reading && current ? reading.cards.map((d) => printFor(oracleSeed(userId, current.question, current.at), d.card)) : []),
    [userId, reading, current],
  )
  // each card revealed is unlocked in the Collection, with its print
  useEffect(() => {
    if (!reading || step === 0) return
    const shown = reading.cards.slice(0, Math.min(step, 3))
    update((s) => withPrints(withUnlocked(s, ...shown.map((d) => d.card.id)), ...shown.map((d, i): [string, Print] => [d.card.id, prints[i]])))
  }, [reading, prints, step])
  const q = cleanQuestion(question)

  const ask = () => {
    if (!q || current) return
    const at = Date.now()
    const r = drawOracle(userId, q, at)
    setStep(0)
    update((s) => withOracle(s, toEntry(q, r, at)))
    setQuestion('')
  }
  const share = async (e: typeof oracle[number]) => {
    setSharing(true)
    try { await shareOracle(userId, e) } catch { /* nothing to do: the user can try again */ } finally { setSharing(false) }
  }

  return (
    <main className="page oracle">
      <h1>{t.oracle.title}</h1>
      {!current && (
        <form className="oracle-ask" onSubmit={(e) => { e.preventDefault(); ask() }}>
          <p className="muted">{t.oracle.intro}</p>
          <textarea className="textarea" rows={3} maxLength={MAX_QUESTION} value={question}
            placeholder={t.oracle.placeholder} aria-label={t.oracle.questionAria} onChange={(e) => setQuestion(e.target.value)} />
          <p className="muted oracle-count">{q.length}/{MAX_QUESTION}</p>
          <button className="btn btn-gold btn-block" type="submit" disabled={!q}>{t.oracle.ask}</button>
        </form>
      )}
      {current && reading && (
        <>
          <p className="prose oracle-q">“{current.question}”</p>
          <div className="reading-cards">
            {reading.cards.map((d, i) => (
              <div key={i} className={`reading-slot${i > step ? ' reading-locked' : ''}`}>
                <div className={d.reversed && step > i ? 'oracle-rev' : undefined}>
                  <TarotCard card={d.card} print={prints[i]} revealed={step > i} size="md"
                    onReveal={i === step ? () => setStep((s) => Math.max(s, i + 1)) : undefined}
                    onInspect={() => setSheet(i)} />
                </div>
                <span className="tcard-label">{POSITIONS[i]}{d.reversed && step > i ? ` · ${t.oracle.reversed}` : ''}</span>
              </div>
            ))}
          </div>
          {step < 3 && <p className="muted" style={{ textAlign: 'center' }}>{t.oracle.tapToReveal(t.oracle.revealPositions[step])}</p>}
          {step >= 3 && (
            <>
              <p className="prose">{text}</p>
              <p className={`oracle-verdict oracle-${reading.verdict}`}>{VERDICT_LABEL[reading.verdict]}</p>
              {canShareImages() && <button className="btn btn-ghost btn-block" disabled={sharing} onClick={() => void share(current)}>{t.oracle.shareImage}</button>}
            </>
          )}
          <p className="countdown">{t.oracle.askAgainIn} <time>{formatCountdown(msUntilNextWindow(now))}</time></p>
        </>
      )}
      {oracle.length > 0 && (
        <section className="oracle-journal">
          <h2>{t.oracle.journal}</h2>
          <ul className="bond-list">
            {oracle.map((e) => (
              <li key={e.at} className="oracle-entry">
                <div>
                  <strong>“{e.question}”</strong>
                  <div className="muted">
                    {VERDICT_LABEL[e.verdict]} · {new Date(e.at).toISOString().slice(0, 10)} {String(new Date(e.at).getUTCHours()).padStart(2, '0')}:00 UTC
                  </div>
                  <div className="muted">{e.cards.map((c) => `${CARD_BY_ID.get(c.id)?.name ?? c.id}${c.reversed ? ` ${t.oracle.reversedShort}` : ''}`).join(' · ')}</div>
                </div>
                {canShareImages() && <button className="btn btn-ghost btn-sm" disabled={sharing} onClick={() => void share(e)}>{t.oracle.share}</button>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <CardInspect card={sheet === null ? null : reading?.cards[sheet].card ?? null} print={sheet === null ? undefined : prints[sheet]} onClose={() => setSheet(null)} />
    </main>
  )
}
