import { schnorr } from '@noble/curves/secp256k1.js'
import { bondSigningKey, decrypt, encrypt, toHex, topicTag } from '../lib/crypto'
import type { AppState, JoinRequest, RemoteState } from '../lib/storage'
import { withJoin, withRemote } from '../lib/storage'
import { log } from '../lib/debuglog'
import type { NostrEvent } from './nostr'

export interface Store {
  get(): AppState
  update(fn: (s: AppState) => AppState): void
  subscribe(fn: () => void): () => void
}

/** The part of RelayPool the sync loop uses (tests swap in an in-memory one). */
export interface Pool {
  subscribe(tag: string, cb: (ev: NostrEvent) => void): void
  unsubscribe(tag: string): void
  publish(tag: string, sk: Uint8Array, content: string): Promise<void>
}

/** How many days of Twin readings a bond publishes. */
const MAX_DATES = 90

interface Keys {
  tag: string
  sk: Uint8Array
  pub: string
}

/** Everything that is synced for one bond: name and the dates of finished Twin readings. Nothing from solo draws. */
export function bondPayload(s: AppState, friendId: string): Omit<RemoteState, 'at'> {
  const dates = (s.history[friendId] ?? []).map((e) => e.date)
  return { id: s.userId, name: s.name, dates: [...new Set(dates)].sort().reverse().slice(0, MAX_DATES) }
}

/**
 * Keeps your relay topics in step with your state:
 * - every friend has a bond topic, where you publish your name and Twin dates and read theirs;
 * - your permanent invite inbox is watched for people who opened your link (they become bonds);
 * - a bond you started by opening someone's link keeps a join request in their inbox until they answer.
 * Returns a stop function.
 */
export function startSync(store: Store, pool: Pool, now: () => number = Date.now): () => void {
  const keys = new Map<string, Promise<Keys>>()
  const subscribed = new Map<string, string>() // topic key -> tag
  const joining = new Map<string, string>() // bond secret -> inbox tag its join request was sent to
  const sent = new Map<string, { json: string; at: number }>()
  let running = false
  let again = false
  let stopped = false

  const keysFor = (userSecret: string, secret: string) => {
    const k = `${userSecret}|${secret}`
    let p = keys.get(k)
    if (!p) {
      p = (async () => {
        const sk = await bondSigningKey(userSecret, secret)
        return { sk, tag: await topicTag(secret), pub: toHex(schnorr.getPublicKey(sk)) }
      })()
      keys.set(k, p)
    }
    return p
  }

  async function open<T>(secret: string, ev: NostrEvent): Promise<T | null> {
    const plain = await decrypt(secret, ev.content)
    if (plain === null) {
      log('sync', `undecryptable event on topic ${ev.tags[0]?.[1]?.slice(0, 8)}`)
      return null
    }
    try {
      const v = JSON.parse(plain) as T
      return v && typeof v === 'object' ? v : null
    } catch {
      return null
    }
  }

  async function onBondEvent(secret: string, myPub: string, ev: NostrEvent) {
    if (stopped || ev.pubkey === myPub) return
    const r = await open<RemoteState>(secret, ev)
    if (!r) return
    const before = store.get()
    store.update((s) => withRemote(s, secret, r, ev.pubkey))
    log('sync', store.get() === before ? `ignored event from ${r.id}` : `applied event from ${r.id}`)
  }

  async function onInboxEvent(inviteSecret: string, ev: NostrEvent) {
    if (stopped) return
    const j = await open<JoinRequest>(inviteSecret, ev)
    if (!j) return
    const before = store.get()
    store.update((s) => withJoin(s, j))
    log('sync', store.get() === before ? `ignored join request from ${j.id}` : `new bond with ${j.id}`)
  }

  async function publishIfChanged(sentKey: string, k: Keys, encKey: string, body: object) {
    const json = JSON.stringify(body)
    const prev = sent.get(sentKey)
    if (prev?.json === json) return
    // strictly increasing so a newer state always supersedes an older one
    const at = Math.max(now(), (prev?.at ?? 0) + 1)
    sent.set(sentKey, { json, at })
    await pool.publish(k.tag, k.sk, await encrypt(encKey, JSON.stringify({ ...body, at })))
  }

  async function pass() {
    const s = store.get()
    const wanted = new Set<string>()
    const subscribe = (key: string, tag: string, cb: (ev: NostrEvent) => void) => {
      wanted.add(key)
      if (subscribed.has(key)) return
      subscribed.set(key, tag)
      pool.subscribe(tag, cb)
    }

    // your permanent inbox
    const inbox = await keysFor(s.userSecret, `inbox|${s.inviteSecret}`)
    if (stopped) return
    subscribe(`inbox|${s.inviteSecret}`, inbox.tag, (ev) => void onInboxEvent(s.inviteSecret, ev))

    // bonds
    const live = new Set<string>()
    for (const f of Object.values(s.friends)) {
      live.add(f.secret)
      const k = await keysFor(s.userSecret, f.secret)
      if (stopped) return
      subscribe(`bond|${f.secret}`, k.tag, (ev) => void onBondEvent(f.secret, k.pub, ev))
      await publishIfChanged(`bond|${f.secret}`, k, f.secret, bondPayload(s, f.id))
      // opened their link and they have not answered yet: keep the join request on their inbox
      if (f.joinVia) {
        const jk = await keysFor(s.userSecret, `inbox|${f.joinVia}`)
        joining.set(f.secret, jk.tag)
        await publishIfChanged(`join|${f.secret}`, jk, f.joinVia, { id: s.userId, name: s.name, bond: f.secret } satisfies JoinRequest)
      }
    }

    for (const [key, tag] of subscribed) {
      if (!wanted.has(key)) {
        pool.unsubscribe(tag)
        subscribed.delete(key)
        sent.delete(key)
      }
    }
    for (const [bond, tag] of joining) {
      const f = Object.values(s.friends).find((x) => x.secret === bond)
      if (!f?.joinVia) {
        pool.unsubscribe(tag) // answered or removed: stop resending it
        joining.delete(bond)
        sent.delete(`join|${bond}`)
      }
    }
    for (const key of sent.keys()) {
      if (key.startsWith('bond|') && !live.has(key.slice(5))) sent.delete(key)
    }
  }

  async function run() {
    if (running) {
      again = true
      return
    }
    running = true
    try {
      do {
        again = false
        await pass()
      } while (again && !stopped)
    } finally {
      running = false
    }
  }

  const unsub = store.subscribe(() => void run())
  void run()
  return () => {
    stopped = true
    unsub()
    subscribed.forEach((tag) => pool.unsubscribe(tag))
    joining.forEach((tag) => pool.unsubscribe(tag))
    subscribed.clear()
    joining.clear()
  }
}
