import type { Card } from '../data/cards'
import { RELATION_LABEL, type Relation, type Tone } from '../lib/dignity'
import { t } from '../i18n'
import { ElementIcon } from './ElementIcon'

const TONE_LABEL: Record<Tone, string> = t.dignity.tone

function Chip({ a, b, rel, big }: { a: Card; b: Card; rel: Relation; big?: boolean }) {
  return (
    <span className={`chip chip-${rel}${big ? ' chip-main' : ''}`}>
      <ElementIcon element={a.element} /> {RELATION_LABEL[rel]} <ElementIcon element={b.element} />
    </span>
  )
}

export interface DignityChipsProps {
  mine: Card
  theirs: Card
  bridge: Card
  youFriend: Relation
  youBridge: Relation
  friendBridge: Relation
  tone?: Tone
  myName?: string
  friendName?: string
}

export default function DignityChips(p: DignityChipsProps) {
  return (
    <div className="dignity">
      <div className="dignity-main">
        <Chip a={p.mine} b={p.theirs} rel={p.youFriend} big />
        {p.tone && <span className="tone">{TONE_LABEL[p.tone]}</span>}
      </div>
      <div className="dignity-sub">
        <span className="dignity-pair">
          {t.dignity.withBridge(p.myName ?? t.common.you)} <Chip a={p.mine} b={p.bridge} rel={p.youBridge} />
        </span>
        <span className="dignity-pair">
          {t.dignity.withBridge(p.friendName ?? t.common.friend)} <Chip a={p.theirs} b={p.bridge} rel={p.friendBridge} />
        </span>
      </div>
    </div>
  )
}
