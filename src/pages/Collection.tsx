import { useMemo, useState } from 'react'
import { CardInspect } from '../components/CardInspect'
import { TarotCard } from '../components/TarotCard'
import { DECK, type Card } from '../data/cards'
import { unlockAll } from '../lib/debug'
import { useAppState } from '../lib/storage'
import { t } from '../i18n'

const FILTERS = [
  { key: 'all', label: t.collection.all },
  { key: 'major', label: t.collection.major },
  { key: 'wands', label: t.collection.suits.wands },
  { key: 'cups', label: t.collection.suits.cups },
  { key: 'swords', label: t.collection.suits.swords },
  { key: 'pentacles', label: t.collection.suits.pentacles },
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
      <h1>{t.collection.title}{debug && <span className="debug-tag">{t.collection.allUnlocked}</span>}</h1>
      <p className="muted">{t.collection.count(count, DECK.length)}</p>
      <div className="filter-row" aria-label={t.collection.filterAria}>
        <button type="button" aria-pressed={onlyUnlocked}
          className={`chip filter-chip filter-unlocked${onlyUnlocked ? ' filter-on' : ''}`} onClick={() => setOnlyUnlocked((v) => !v)}>
          {t.collection.unlocked}
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
          {onlyUnlocked ? t.collection.emptyLocked : t.collection.noMatch}
        </p>
      )}
      <div className="collection-grid">
        {cards.map((c) => (
          <span key={c.id} className={`collection-tile${isLocked(c) ? ' tcard-locked' : ''}`}>
            <TarotCard card={c} revealed size="sm" onInspect={() => setSheet(c)} />
            {(prints[c.id]?.length ?? 0) > 0 && <span className="collection-count" aria-label={t.collection.owned(prints[c.id].length)}>×{prints[c.id].length}</span>}
          </span>
        ))}
      </div>
      <CardInspect card={sheet} owned={sheet ? prints[sheet.id] ?? [] : undefined} onClose={() => setSheet(null)} locked={sheet ? isLocked(sheet) : false} />
    </main>
  )
}
