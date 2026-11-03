import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bondSigningKey, topicTag } from '../lib/crypto'
import { KIND, RelayPool, signEvent, type NostrEvent } from './nostr'

class FakeSocket {
  static all: FakeSocket[] = []
  sent: unknown[][] = []
  onopen: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  url: string
  constructor(url: string) {
    this.url = url
    FakeSocket.all.push(this)
  }
  send(d: string) {
    this.sent.push(JSON.parse(d))
  }
  close() {
    this.onclose?.()
  }
  open() {
    this.onopen?.()
  }
  receive(m: unknown) {
    this.onmessage?.({ data: JSON.stringify(m) })
  }
}

beforeEach(() => {
  FakeSocket.all = []
  vi.stubGlobal('WebSocket', FakeSocket)
})
afterEach(() => vi.unstubAllGlobals())

const flush = () => new Promise((r) => setTimeout(r, 20))

describe('RelayPool', () => {
  it('subscribes on every relay as soon as it connects, with a replaceable-event filter', async () => {
    const pool = new RelayPool(['wss://a', 'wss://b'], () => {})
    pool.subscribe('tag1', () => {})
    FakeSocket.all.forEach((s) => s.open())
    for (const s of FakeSocket.all) {
      expect(s.sent[0][0]).toBe('REQ')
      expect(s.sent[0][2]).toEqual({ kinds: [KIND], '#d': ['tag1'] })
    }
    expect(pool.connected).toBe(2)
    pool.stop()
  })

  it('keeps what you publish while offline and sends it when a relay connects', async () => {
    const pool = new RelayPool(['wss://a', 'wss://b'], () => {})
    const sk = await bondSigningKey('d', 'b')
    await pool.publish('tag1', sk, 'v1')
    await pool.publish('tag1', sk, 'v2') // replaces v1: only the latest is kept
    expect(FakeSocket.all.every((s) => s.sent.length === 0)).toBe(true)
    FakeSocket.all[0].open()
    const events = FakeSocket.all[0].sent.filter((m) => m[0] === 'EVENT').map((m) => m[1] as NostrEvent)
    expect(events).toHaveLength(1)
    expect(events[0].content).toBe('v2')
    expect(FakeSocket.all[1].sent).toHaveLength(0) // that relay is still down
    FakeSocket.all[1].open()
    expect(FakeSocket.all[1].sent.some((m) => m[0] === 'EVENT')).toBe(true)
    pool.stop()
  })

  it('makes each published event strictly newer than the last, even within one second', async () => {
    const pool = new RelayPool(['wss://a'], () => {})
    const sk = await bondSigningKey('d', 'b')
    FakeSocket.all[0].open()
    await pool.publish('t', sk, '1')
    await pool.publish('t', sk, '2')
    await pool.publish('t', sk, '3')
    const at = FakeSocket.all[0].sent.filter((m) => m[0] === 'EVENT').map((m) => (m[1] as NostrEvent).created_at)
    expect(at[1]).toBeGreaterThan(at[0])
    expect(at[2]).toBeGreaterThan(at[1])
    pool.stop()
  })

  it('delivers an event once even when every relay sends it, and drops bad signatures', async () => {
    const pool = new RelayPool(['wss://a', 'wss://b'], () => {})
    const got: NostrEvent[] = []
    const tag = await topicTag('secret')
    pool.subscribe(tag, (ev) => got.push(ev))
    FakeSocket.all.forEach((s) => s.open())
    const sk = await bondSigningKey('friend', 'secret')
    const ev = await signEvent(sk, tag, 'hello', 100)
    const sub = FakeSocket.all[0].sent[0][1]
    FakeSocket.all.forEach((s) => s.receive(['EVENT', sub, ev]))
    await flush()
    expect(got).toHaveLength(1)
    FakeSocket.all[0].receive(['EVENT', sub, { ...ev, id: 'f'.repeat(64), content: 'forged' }])
    await flush()
    expect(got).toHaveLength(1)
    pool.stop()
  })

  it('ignores events for topics it did not subscribe to and junk messages', async () => {
    const pool = new RelayPool(['wss://a'], () => {})
    const got: NostrEvent[] = []
    pool.subscribe('mine', (ev) => got.push(ev))
    const s = FakeSocket.all[0]
    s.open()
    const ev = await signEvent(await bondSigningKey('x', 'y'), 'other', 'c', 5)
    s.receive(['EVENT', s.sent[0][1], ev])
    s.onmessage?.({ data: 'not json' })
    s.receive(['NOTICE', 'hi'])
    s.receive(['EVENT', 'sub', null])
    await flush()
    expect(got).toHaveLength(0)
    pool.stop()
  })

  it('resubscribes after a reconnect and tells the app when relays drop', async () => {
    vi.useFakeTimers()
    const status = vi.fn()
    const pool = new RelayPool(['wss://a'], status)
    pool.subscribe('t', () => {})
    FakeSocket.all[0].open()
    expect(pool.connected).toBe(1)
    FakeSocket.all[0].close()
    expect(pool.connected).toBe(0)
    await vi.advanceTimersByTimeAsync(2_500)
    expect(FakeSocket.all).toHaveLength(2)
    FakeSocket.all[1].open()
    expect(FakeSocket.all[1].sent[0][0]).toBe('REQ')
    expect(status).toHaveBeenCalled()
    pool.stop()
    vi.useRealTimers()
  })

  it('stops resending something it published once it is retired, even on a topic it never subscribed to', async () => {
    const pool = new RelayPool(['wss://a'], () => {})
    await pool.publish('inbox-of-friend', await bondSigningKey('d', 'b'), 'join request')
    pool.unsubscribe('inbox-of-friend')
    FakeSocket.all[0].open()
    expect(FakeSocket.all[0].sent.filter((m) => m[0] === 'EVENT')).toHaveLength(0)
    pool.stop()
  })

  it('closes the subscription when asked', () => {
    const pool = new RelayPool(['wss://a'], () => {})
    pool.subscribe('t', () => {})
    FakeSocket.all[0].open()
    pool.unsubscribe('t')
    expect(FakeSocket.all[0].sent.at(-1)?.[0]).toBe('CLOSE')
    pool.stop()
  })
})
