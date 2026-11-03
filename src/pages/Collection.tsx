import { useMemo, useState } from 'react'
import { CardInspect } from '../components/CardInspect'
import { TarotCard } from '../components/TarotCard'
import { DECK, type Card } from '../data/cards'
import { unlockAll } from '../lib/debug'
import { useAppState } from '../lib/storage'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'major', label: 'Major' },
  { key: 'wands', label: 'Wands' },
  { key: 'cups', label: 'Cups' },
  { key: 'swords', label: 'Swords' },
  { key: 'pentacles', label: 'Pentacles' },
] as const
type Filter = (typeof FILTERS)[number]['key']

/** Every card in the deck. A card is lit once you have unlocked it; the rest are shadowed (but can still be inspected). */
export default function Collection() {
  const { unlocked, prints } = useAppState()
  const debug = unlockAll()
  const [filter, setFilter] = useState<Filter>('all')
  const [onlyUnlocked, setOnlyUnlocked] = useState(true)
  const [sheet, setSheet] = useState<Card | null>(null)
  const have = useMemo(() => new Set(unlocked), [unlocked])
  const isLocked = (c: Card) => !debug && !have.has(c.id)
  const cards = useMemo(
    () =>
      DECK.filter((c) => filter === 'all' || (filter === 'major' ? c.arcana === 'major' : c.suit === filter)).filter(
        (c) => !onlyUnlocked || debug || have.has(c.id),
      ),
    [filter, onlyUnlocked, debug, have],
  )
  const count = debug ? DECK.length : DECK.filter((c) => have.has(c.id)).length
  return (
    <main className="page collection">
      <h1>Collection{debug && <span className="debug-tag">all unlocked</span>}</h1>
      <p className="muted">{count} of {DECK.length} cards unlocked</p>
      <div className="filter-row" aria-label="Filter cards">
        <button type="button" aria-pressed={onlyUnlocked}
          className={`chip filter-chip filter-unlocked${onlyUnlocked ? ' filter-on' : ''}`} onClick={() => setOnlyUnlocked((v) => !v)}>
          Unlocked
        </button>
        <span className="filter-sep" aria-hidden="true" />
        {FILTERS.map((f) => (
          <button key={f.key} type="button" aria-pressed={filter === f.key}
            className={`chip filter-chip${filter === f.key ? ' filter-on' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      {cards.length === 0 && (
        <p className="muted collection-empty">
          {onlyUnlocked ? 'Nothing here yet. Pull your daily card or a Twin reading to unlock cards, or show the locked ones.' : 'No cards match.'}
        </p>
      )}
      <div className="collection-grid">
        {cards.map((c) => (
          <span key={c.id} className={`collection-tile${isLocked(c) ? ' tcard-locked' : ''}`}>
            <TarotCard card={c} revealed size="sm" onInspect={() => setSheet(c)} />
            {(prints[c.id]?.length ?? 0) > 0 && <span className="collection-count" aria-label={`${prints[c.id].length} owned`}>×{prints[c.id].length}</span>}
          </span>
        ))}
      </div>
      <CardInspect card={sheet} owned={sheet ? prints[sheet.id] ?? [] : undefined} onClose={() => setSheet(null)} locked={sheet ? isLocked(sheet) : false} />
    </main>
  )
}
