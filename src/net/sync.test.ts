import { describe, expect, it, vi } from 'vitest'
import { decrypt, encrypt, randomHex, topicTag } from '../lib/crypto'
import { sharedStreak } from '../lib/streak'
import {
  withFriend, withJoin, withReading, withRemote, withoutFriend,
  type AppState, type HistoryEntry,
} from '../lib/storage'
import { signEvent, verifyEvent, type NostrEvent } from './nostr'
import { bondPayload, startSync, type Pool, type Store } from './sync'

const ALICE = 'aaaaaaaaaaaaaaaaaaaa'
const BOB = 'bbbbbbbbbbbbbbbbbbbb'
const CARA = 'cccccccccccccccccccc'

const person = (userId: string, name: string): AppState => ({
  userId, userSecret: randomHex(32), inviteSecret: randomHex(16), revoked: [], name, onboarded: true, friends: {}, history: {}, unlocked: [],
})

/** `joiner` opens `inviter`'s permanent link: a bond with a fresh secret, waiting for the inviter to answer. */
const opens = (joiner: AppState, inviter: AppState): AppState =>
  withFriend(joiner, inviter.userId, inviter.name, randomHex(16), inviter.inviteSecret)
const reading = (date: string): HistoryEntry => ({ date, mine: 'm', theirs: 't', bridge: 'b' })

function makeStore(init: AppState): Store & { set(fn: (s: AppState) => AppState): void } {
  let s = init
  const ls = new Set<() => void>()
  const store = {
    get: () => s,
    update(fn: (s: AppState) => AppState) {
      const n = fn(s)
      if (n === s) return
      s = n
      ls.forEach((l) => l())
    },
    subscribe(fn: () => void) {
      ls.add(fn)
      return () => ls.delete(fn)
    },
  }
  return { ...store, set: store.update }
}

/** An in-memory relay with replaceable-event semantics: one event per (author, topic), newest wins. */
class Hub {
  stored = new Map<string, NostrEvent>()
  subs = new Set<{ tag: string; cb: (ev: NostrEvent) => void }>()
  clock = 1_000
  put(ev: NostrEvent) {
    const tag = ev.tags[0][1]
    const key = `${ev.pubkey}|${tag}`
    const old = this.stored.get(key)
    if (old && old.created_at >= ev.created_at) return
    this.stored.set(key, ev)
    this.subs.forEach((s) => s.tag === tag && void verifyEvent(ev).then((ok) => ok && s.cb(ev)))
  }
}

class FakePool implements Pool {
  published = 0
  unsubscribed: string[] = []
  private mine = new Set<{ tag: string; cb: (ev: NostrEvent) => void }>()
  private hub: Hub
  constructor(hub: Hub) {
    this.hub = hub
  }
  subscribe(tag: string, cb: (ev: NostrEvent) => void) {
    const sub = { tag, cb }
    this.mine.add(sub)
    this.hub.subs.add(sub)
    // a relay replays what it stored to a new subscriber
    this.hub.stored.forEach((ev) => ev.tags[0][1] === tag && void verifyEvent(ev).then((ok) => ok && cb(ev)))
  }
  unsubscribe(tag: string) {
    this.unsubscribed.push(tag)
    this.mine.forEach((s) => {
      if (s.tag === tag) {
        this.mine.delete(s)
        this.hub.subs.delete(s)
      }
    })
  }
  async publish(tag: string, sk: Uint8Array, content: string) {
    this.published++
    this.hub.put(await signEvent(sk, tag, content, ++this.hub.clock))
  }
}

const TODAY = '2026-11-03'
const settle = () => new Promise((r) => setTimeout(r, 40))
const dates = (s: AppState, id: string) => s.history[id].map((e) => e.date)

function pair() {
  const a = makeStore(person(ALICE, 'Alice'))
  const b = makeStore(opens(person(BOB, 'Bob'), a.get()))
  return { a, b }
}

describe('relay sync between two devices', () => {
  it('turns an opened link into a bond on the inviter without any setup, and swaps names', async () => {
    const { a, b } = pair()
    const link = a.get().inviteSecret
    const hub = new Hub()
    expect(a.get().friends).toEqual({})
    const stops = [startSync(a, new FakePool(hub)), startSync(b, new FakePool(hub))]
    await vi.waitFor(() => expect(a.get().friends[BOB]?.name).toBe('Bob'))
    expect(a.get().friends[BOB].secret).toBe(b.get().friends[ALICE].secret) // the secret Bob made
    await vi.waitFor(() => expect(a.get().friends[BOB].syncedAt).toBeDefined())
    await vi.waitFor(() => expect(b.get().friends[ALICE].syncedAt).toBeDefined())
    expect(b.get().friends[ALICE].joinVia).toBeUndefined() // answered: Bob stops sending the request
    expect(a.get().inviteSecret).toBe(link) // the link is permanent
    expect(b.get().friends[ALICE].pub).not.toBe(a.get().friends[BOB].pub)
    stops.forEach((f) => f())
  })

  it('still works when the inviter is offline while the friend joins', async () => {
    const { a, b } = pair()
    const hub = new Hub()
    const stopB = startSync(b, new FakePool(hub))
    await vi.waitFor(() => expect(hub.stored.size).toBe(2)) // Bob's state and his join request
    stopB() // Bob goes offline; the relay keeps both events
    const stopA = startSync(a, new FakePool(hub)) // Alice opens the app later
    await vi.waitFor(() => expect(a.get().friends[BOB]?.name).toBe('Bob'))
    await vi.waitFor(() => expect(a.get().friends[BOB].syncedAt).toBeDefined())
    stopA()
  })

  it('lets many friends use the same link, each on their own private bond', async () => {
    const a = makeStore(person(ALICE, 'Alice'))
    const b = makeStore(opens(person(BOB, 'Bob'), a.get()))
    const c = makeStore(opens(person(CARA, 'Cara'), a.get()))
    const hub = new Hub()
    const stops = [startSync(a, new FakePool(hub)), startSync(b, new FakePool(hub)), startSync(c, new FakePool(hub))]
    await vi.waitFor(() => expect(Object.keys(a.get().friends).sort()).toEqual([BOB, CARA]))
    await vi.waitFor(() => expect(a.get().friends[BOB].syncedAt && a.get().friends[CARA].syncedAt).toBeTruthy())
    expect(a.get().friends[BOB].secret).not.toBe(a.get().friends[CARA].secret)
    b.set((s) => withReading(s, ALICE, reading(TODAY)))
    await vi.waitFor(() => expect(a.get().friends[BOB].theirDates).toEqual([TODAY]))
    await settle()
    expect(a.get().friends[CARA].theirDates).toEqual([]) // Bob's dates never reach Cara's bond
    expect(Object.keys(b.get().friends)).toEqual([ALICE]) // and Bob and Cara do not learn of each other
    stops.forEach((f) => f())
  })

  it('syncs Twin reading dates both ways and gives the same shared streak', async () => {
    const { a, b } = pair()
    const hub = new Hub()
    const stops = [startSync(a, new FakePool(hub)), startSync(b, new FakePool(hub))]
    await vi.waitFor(() => expect(a.get().friends[BOB]).toBeDefined())
    await vi.waitFor(() => expect(b.get().friends[ALICE].syncedAt).toBeDefined())

    for (const d of ['2026-11-01', '2026-11-02']) {
      a.set((s) => withReading(s, BOB, reading(d)))
      b.set((s) => withReading(s, ALICE, reading(d)))
    }
    a.set((s) => withReading(s, BOB, reading(TODAY))) // Alice has read today, Bob has not yet

    await vi.waitFor(() => expect(b.get().friends[ALICE].theirDates).toEqual([TODAY, '2026-11-02', '2026-11-01']))
    await vi.waitFor(() => expect(a.get().friends[BOB].theirDates).toEqual(['2026-11-02', '2026-11-01']))
    expect(sharedStreak(dates(a.get(), BOB), a.get().friends[BOB].theirDates!, TODAY)).toBe(2) // today not over: still alive
    expect(sharedStreak(dates(b.get(), ALICE), b.get().friends[ALICE].theirDates!, TODAY)).toBe(2)

    b.set((s) => withReading(s, ALICE, reading(TODAY)))
    await vi.waitFor(() => expect(a.get().friends[BOB].theirDates).toContain(TODAY))
    expect(sharedStreak(dates(a.get(), BOB), a.get().friends[BOB].theirDates!, TODAY)).toBe(3)
    stops.forEach((f) => f())
  })

  it('propagates a rename without a new link', async () => {
    const { a, b } = pair()
    const hub = new Hub()
    const stops = [startSync(a, new FakePool(hub)), startSync(b, new FakePool(hub))]
    await vi.waitFor(() => expect(a.get().friends[BOB]?.name).toBe('Bob'))
    await vi.waitFor(() => expect(a.get().friends[BOB].syncedAt).toBeDefined())
    b.set((s) => ({ ...s, name: 'Robert' }))
    await vi.waitFor(() => expect(a.get().friends[BOB].name).toBe('Robert'))
    stops.forEach((f) => f())
  })

  it('delivers an update published while the friend was offline once they open the app', async () => {
    const { a, b } = pair()
    const hub = new Hub()
    const stopA = startSync(a, new FakePool(hub))
    const stopB = startSync(b, new FakePool(hub))
    await vi.waitFor(() => expect(b.get().friends[ALICE].syncedAt).toBeDefined())
    stopB() // Bob closes the app
    a.set((s) => withReading(s, BOB, reading('2026-11-02')))
    a.set((s) => ({ ...s, name: 'Alice B.' }))
    await vi.waitFor(() => expect(b.get().friends[ALICE].name).toBe('Alice')) // not yet
    const stopB2 = startSync(b, new FakePool(hub)) // Bob returns
    await vi.waitFor(() => expect(b.get().friends[ALICE].name).toBe('Alice B.'))
    expect(b.get().friends[ALICE].theirDates).toEqual(['2026-11-02'])
    stopA()
    stopB2()
  })

  it('only publishes when something changed', async () => {
    const { a, b } = pair()
    const hub = new Hub()
    const pool = new FakePool(hub)
    const stop = startSync(a, pool)
    const stopB = startSync(b, new FakePool(hub))
    await vi.waitFor(() => expect(a.get().friends[BOB]?.syncedAt).toBeDefined())
    await settle()
    const before = pool.published
    a.set((s) => ({ ...s, unlocked: ['x'] })) // collection changes are not synced
    a.set((s) => ({ ...s }))
    await settle()
    expect(pool.published).toBe(before)
    a.set((s) => withReading(s, BOB, reading(TODAY)))
    await vi.waitFor(() => expect(pool.published).toBe(before + 1))
    stop()
    stopB()
  })

  it('syncs only the name and Twin dates, never the collection or solo draws, and relays only see ciphertext', async () => {
    const { a, b } = pair()
    a.set((s) => ({ ...s, unlocked: ['the-fool', 'the-tower'] }))
    expect(Object.keys(bondPayload(a.get(), BOB)).sort()).toEqual(['dates', 'id', 'name'])
    const hub = new Hub()
    const stops = [startSync(a, new FakePool(hub)), startSync(b, new FakePool(hub))]
    await vi.waitFor(() => expect(a.get().friends[BOB]?.syncedAt).toBeDefined())
    await vi.waitFor(() => expect(b.get().friends[ALICE].syncedAt).toBeDefined())
    const bond = a.get().friends[BOB].secret
    const tag = await topicTag(bond)
    const onBond = [...hub.stored.values()].filter((ev) => ev.tags[0][1] === tag)
    expect(onBond).toHaveLength(2) // one per person
    for (const ev of onBond) {
      expect(ev.content).not.toContain('Alice')
      expect(ev.content).not.toContain('the-fool')
      expect(Object.keys(JSON.parse((await decrypt(bond, ev.content))!)).sort()).toEqual(['at', 'dates', 'id', 'name'])
    }
    for (const ev of hub.stored.values()) expect(ev.content).not.toContain('Bob')
    stops.forEach((f) => f())
  })

  it('stops listening to a deleted friend and does not take them back from the stored join request', async () => {
    const { a, b } = pair()
    const hub = new Hub()
    const pool = new FakePool(hub)
    let stopA = startSync(a, pool)
    const stopB = startSync(b, new FakePool(hub))
    await vi.waitFor(() => expect(a.get().friends[BOB]?.syncedAt).toBeDefined())
    const tag = await topicTag(a.get().friends[BOB].secret)
    a.set((s) => withoutFriend(s, BOB))
    await vi.waitFor(() => expect(pool.unsubscribed).toContain(tag))
    stopA()
    stopB()
    // Alice reopens the app: Bob's join request is still on the relay
    stopA = startSync(a, new FakePool(hub))
    await settle()
    expect(a.get().friends).toEqual({})
    stopA()
  })

  it('ends up on one bond when both people open each other\'s links at once', async () => {
    const a0 = person(ALICE, 'Alice')
    const b0 = person(BOB, 'Bob')
    const a = makeStore(opens(a0, b0))
    const b = makeStore(opens(b0, a0))
    expect(a.get().friends[BOB].secret).not.toBe(b.get().friends[ALICE].secret)
    const hub = new Hub()
    const stops = [startSync(a, new FakePool(hub)), startSync(b, new FakePool(hub))]
    await vi.waitFor(() => expect(a.get().friends[BOB].secret).toBe(b.get().friends[ALICE].secret))
    await vi.waitFor(() => expect(a.get().friends[BOB].syncedAt).toBeDefined())
    await vi.waitFor(() => expect(b.get().friends[ALICE].syncedAt).toBeDefined())
    a.set((s) => withReading(s, BOB, reading(TODAY)))
    await vi.waitFor(() => expect(b.get().friends[ALICE].theirDates).toEqual([TODAY]))
    stops.forEach((f) => f())
  })

  it('ignores junk and strangers on your inbox and bond topics', async () => {
    const { a } = pair()
    const hub = new Hub()
    const stop = startSync(a, new FakePool(hub))
    const inbox = await topicTag(`inbox|${a.get().inviteSecret}`)
    await vi.waitFor(() => expect(hub.subs.size).toBe(1))
    const sk = new Uint8Array(32).fill(7)
    hub.put(await signEvent(sk, inbox, 'garbage', ++hub.clock)) // not encrypted with your invite secret
    // someone who guessed nothing: a join request sealed with another key
    hub.put(await signEvent(sk, inbox, await encrypt('wrong-secret', JSON.stringify({ id: BOB, name: 'Mallory', bond: randomHex(16) })), ++hub.clock))
    const good = await signEvent(sk, inbox, 'x', ++hub.clock)
    expect(await verifyEvent({ ...good, content: 'y' })).toBe(false) // tampering is caught before the app sees it
    await settle()
    expect(a.get().friends).toEqual({})
    stop()
  })
})

describe('withJoin', () => {
  const bond = 'b'.repeat(32)
  const join = (over: Partial<{ id: string; name: string; bond: string }> = {}) => ({ id: BOB, name: 'Bob', bond, ...over })

  it('adds the friend with the bond secret they made', () => {
    const s = withJoin(person(ALICE, 'Alice'), join())
    expect(s.friends[BOB]).toMatchObject({ name: 'Bob', secret: bond })
    expect(s.friends[BOB].joinVia).toBeUndefined() // the inviter has nothing left to answer
  })

  it('rejects malformed requests, yourself and deleted bonds', () => {
    const s = person(ALICE, 'Alice')
    expect(withJoin(s, join({ id: ALICE }))).toBe(s)
    expect(withJoin(s, join({ id: 'nope' }))).toBe(s)
    expect(withJoin(s, join({ bond: 'short' }))).toBe(s)
    const deleted = { ...s, revoked: [bond] }
    expect(withJoin(deleted, join())).toBe(deleted)
  })

  it('does not let a request replace a friend you already have', () => {
    const s1 = withJoin(person(ALICE, 'Alice'), join())
    expect(withJoin(s1, join({ bond: 'c'.repeat(32), name: 'Mallory' }))).toBe(s1)
  })

  it('on a simultaneous join the smaller secret wins, but only before the bond has been answered', () => {
    const mine = 'c'.repeat(32)
    const waiting = opens(person(ALICE, 'Alice'), person(BOB, 'Bob'))
    const w = { ...waiting, friends: { [BOB]: { ...waiting.friends[BOB], secret: mine } } }
    expect(withJoin(w, join()).friends[BOB].secret).toBe(bond) // 'b…' < 'c…': adopt theirs
    expect(withJoin(w, join({ bond: 'd'.repeat(32) }))).toBe(w) // theirs is larger: keep mine
    const answered = { ...w, friends: { [BOB]: { ...w.friends[BOB], syncedAt: 5 } } }
    expect(withJoin(answered, join())).toBe(answered)
  })
})

describe('withRemote', () => {
  const secret = 's'.repeat(32)
  const remote = (over: Partial<{ id: string; name: string; dates: string[]; at: number }> = {}) =>
    ({ id: BOB, name: 'Bob', dates: ['2026-11-02'], at: 10, ...over })
  const bonded = () => withFriend(person(ALICE, 'Alice'), BOB, 'Bob', secret, 'via')

  it('applies state from the bond, remembers the sender key and marks the join request answered', () => {
    const s = withRemote(bonded(), secret, remote(), 'pubB')
    expect(s.friends[BOB]).toMatchObject({ name: 'Bob', pub: 'pubB', theirDates: ['2026-11-02'], syncedAt: 10 })
    expect(s.friends[BOB].joinVia).toBeUndefined()
  })

  it('ignores a different key on the same bond, and unknown topics', () => {
    const s1 = withRemote(bonded(), secret, remote(), 'pubB')
    expect(withRemote(s1, secret, remote({ at: 11 }), 'pubC')).toBe(s1)
    expect(withRemote(bonded(), 'other', remote(), 'pubB').friends[BOB].syncedAt).toBeUndefined()
  })

  it('ignores older and duplicate events, so out-of-order delivery cannot roll state back', () => {
    const s1 = withRemote(bonded(), secret, remote({ at: 10, name: 'New' }), 'pubB')
    expect(withRemote(s1, secret, remote({ at: 9, name: 'Old' }), 'pubB')).toBe(s1)
    expect(withRemote(s1, secret, remote({ at: 10 }), 'pubB')).toBe(s1)
    expect(withRemote(s1, secret, remote({ at: 11, name: 'Newer' }), 'pubB').friends[BOB].name).toBe('Newer')
  })

  it('rejects malformed payloads, your own id and a different person on the bond', () => {
    const s = bonded()
    expect(withRemote(s, secret, remote({ id: ALICE }), 'p')).toBe(s)
    expect(withRemote(s, secret, remote({ id: CARA, name: 'Mallory' }), 'p')).toBe(s)
    expect(withRemote(s, secret, remote({ id: 'nope' }), 'p')).toBe(s)
    expect(withRemote(s, secret, remote({ at: NaN }), 'p')).toBe(s)
    expect(withRemote(s, secret, { ...remote(), dates: 'x' as unknown as string[] }, 'p')).toBe(s)
  })

  it('cleans dates and names from the other side, and keeps the old name when theirs is empty', () => {
    const s = withRemote(bonded(), secret, remote({ name: ' ' + 'x'.repeat(60), dates: ['2026-11-02', 'bad', '2026-11-02', '2026-11-03'] }), 'p')
    expect(s.friends[BOB].theirDates).toEqual(['2026-11-03', '2026-11-02'])
    expect(s.friends[BOB].name).toHaveLength(40)
    expect(withRemote(bonded(), secret, remote({ name: '  ' }), 'p').friends[BOB].name).toBe('Bob')
  })
})
