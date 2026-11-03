import { describe, expect, it } from 'vitest'
import { twinRows } from './twinList'
import type { Friend, HistoryEntry } from './storage'

const f = (id: string, name: string): Friend => ({ id, name, addedAt: 'x', secret: 's' })
const e = (date: string): HistoryEntry => ({ date, mine: 'm', theirs: 't', bridge: 'b' })

describe('twinRows', () => {
  const friends = { a: f('a', 'Zed'), b: f('b', 'Amy'), c: f('c', 'Bo') }
  it('puts readings that are ready before the ones on cooldown, then sorts by name', () => {
    const rows = twinRows(friends, { b: [e('2026-11-03')], c: [e('2026-11-02')] }, '2026-11-03')
    expect(rows.map((r) => [r.name, r.done])).toEqual([['Bo', false], ['Zed', false], ['Amy', true]])
  })
  it('a reading from an earlier day is no longer on cooldown', () => {
    expect(twinRows(friends, { a: [e('2026-11-02')] }, '2026-11-03').every((r) => !r.done)).toBe(true)
  })
  it('is empty without bonds', () => {
    expect(twinRows({}, {}, '2026-11-03')).toEqual([])
  })
})
