import { describe, expect, it } from 'vitest'
import { DECK } from '../data/cards'
import { bridgeCard, dailyCard, pairReading } from './reading'
import { seededRng } from './rng'

const ids = (n: number) => {
  const r = seededRng('ids')
  return Array.from({ length: n }, () => Math.floor(r() * 2 ** 40).toString(16))
}

describe('dailyCard', () => {
  it('is deterministic', () => {
    expect(dailyCard('abc', '2025-01-01')).toBe(dailyCard('abc', '2025-01-01'))
  })
  it('varies across dates and ids', () => {
    const byDate = new Set(Array.from({ length: 60 }, (_, i) => dailyCard('abc', `2025-01-${i}`).id))
    const byId = new Set(ids(60).map((id) => dailyCard(id, '2025-01-01').id))
    expect(byDate.size).toBeGreaterThan(20)
    expect(byId.size).toBeGreaterThan(20)
  })
})

describe('pairReading', () => {
  const list = ids(40)
  const dates = ['2025-01-01', '2025-06-15', '2026-11-03']
  it('is symmetric', () => {
    for (let i = 0; i < list.length - 1; i++) for (const d of dates) {
      const a = pairReading(list[i], list[i + 1], d)
      const b = pairReading(list[i + 1], list[i], d)
      expect(a.bridge).toBe(b.bridge)
      expect(a.mine).toBe(b.theirs)
      expect(a.theirs).toBe(b.mine)
      expect(a.youFriend).toBe(b.youFriend)
      expect(a.youBridge).toBe(b.friendBridge)
      expect(a.friendBridge).toBe(b.youBridge)
      expect(a.tone).toBe(b.tone)
      expect(a.date).toBe(d)
    }
  })
  it('bridge is distinct from both daily cards', () => {
    for (let i = 0; i < list.length; i++) for (const d of dates) {
      const r = pairReading(list[i], list[(i * 7 + 3) % list.length], d)
      expect(r.bridge.id).not.toBe(r.mine.id)
      expect(r.bridge.id).not.toBe(r.theirs.id)
    }
  })
  it('handles identical ids and bridge excludes given cards', () => {
    const r = pairReading('same', 'same', '2025-01-01')
    expect(r.mine).toBe(r.theirs)
    expect(r.bridge).not.toBe(r.mine)
    const ex = DECK.slice(0, 77)
    expect(bridgeCard('a', 'b', '2025-01-01', ex)).toBe(DECK[77])
  })
})
