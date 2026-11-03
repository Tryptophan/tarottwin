import { schnorr } from '@noble/curves/secp256k1.js'
import { fromHex, sha256, toHex } from '../lib/crypto'
import { log } from '../lib/debuglog'

/** Parameterized replaceable (NIP-33): relays keep only the latest event per author + d tag. */
export const KIND = 30_078

export interface NostrEvent {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

/** One websocket that redials with backoff. */
class Wire {
  readonly url: string
  private on: { open(): void; close(): void; message(data: string): void }
  open = false
  private ws: WebSocket | null = null
  private tries = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private dead = false

  constructor(url: string, on: { open(): void; close(): void; message(data: string): void }) {
    this.url = url
    this.on = on
    this.connect()
  }

  private connect() {
    if (this.dead) return
    let ws: WebSocket
    try {
      ws = new WebSocket(this.url)
    } catch {
      return this.retry()
    }
    this.ws = ws
    ws.onopen = () => {
      this.tries = 0
      this.open = true
      log('relay', `open ${this.url}`)
      this.on.open()
    }
    ws.onmessage = (e) => {
      if (typeof e.data === 'string') this.on.message(e.data)
    }
    ws.onclose = () => {
      const was = this.open
      this.open = false
      this.ws = null
      log('relay', `${was ? 'closed' : 'failed'} ${this.url}`)
      if (was) this.on.close()
      this.retry()
    }
  }

  private retry() {
    if (this.dead || this.timer) return
    this.timer = setTimeout(() => {
      this.timer = null
      this.connect()
    }, Math.min(60_000, 2_000 * 2 ** this.tries++))
  }

  send(msg: unknown) {
    if (this.open) this.ws?.send(JSON.stringify(msg))
  }

  /** Drop the socket (it may be dead while claiming to be open) and dial again now. */
  kick() {
    if (this.dead) return
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.tries = 0
    const ws = this.ws
    if (ws) {
      ws.onopen = ws.onmessage = ws.onclose = null
      ws.close()
      this.ws = null
    }
    if (this.open) {
      this.open = false
      this.on.close()
    }
    this.connect()
  }

  stop() {
    this.dead = true
    if (this.timer) clearTimeout(this.timer)
    const ws = this.ws
    if (ws) {
      ws.onopen = ws.onmessage = ws.onclose = null
      ws.close()
    }
    this.ws = null
    this.open = false
  }
}

const subId = (tag: string) => `tt${tag.slice(0, 16)}`

export async function signEvent(sk: Uint8Array, tag: string, content: string, createdAt: number): Promise<NostrEvent> {
  const pubkey = toHex(schnorr.getPublicKey(sk))
  const tags = [['d', tag]]
  const id = await sha256(JSON.stringify([0, pubkey, createdAt, KIND, tags, content]))
  return { id: toHex(id), pubkey, created_at: createdAt, kind: KIND, tags, content, sig: toHex(schnorr.sign(id, sk)) }
}

export async function verifyEvent(ev: NostrEvent): Promise<boolean> {
  try {
    const id = await sha256(JSON.stringify([0, ev.pubkey, ev.created_at, ev.kind, ev.tags, ev.content]))
    return toHex(id) === ev.id && schnorr.verify(fromHex(ev.sig), id, fromHex(ev.pubkey))
  } catch {
    return false
  }
}

/**
 * Talks to several public relays at once: every event goes to all of them, subscriptions
 * are opened on all of them, and duplicates are dropped by event id. The latest event per
 * topic is kept and resent whenever a relay (re)connects, so anything published while
 * offline goes out as soon as there is a connection.
 */
export class RelayPool {
  private wires: Wire[]
  private onStatus: () => void
  private subs = new Map<string, (ev: NostrEvent) => void>()
  private latest = new Map<string, NostrEvent>()
  private lastCreated = new Map<string, number>()
  private seen = new Set<string>()

  constructor(urls: string[], onStatus: () => void) {
    this.onStatus = onStatus
    this.wires = urls.map((url) => {
      const wire: Wire = new Wire(url, {
        open: () => {
          this.subs.forEach((_, tag) => this.req(tag, wire))
          this.latest.forEach((ev) => wire.send(['EVENT', ev]))
          this.onStatus()
        },
        close: () => this.onStatus(),
        message: (d) => this.onMessage(d),
      })
      return wire
    })
  }

  get connected() {
    return this.wires.filter((w) => w.open).length
  }

  get total() {
    return this.wires.length
  }

  private req(tag: string, only: Wire) {
    only.send(['REQ', subId(tag), { kinds: [KIND], '#d': [tag] }])
  }

  subscribe(tag: string, cb: (ev: NostrEvent) => void) {
    if (this.subs.has(tag)) return
    this.subs.set(tag, cb)
    this.wires.forEach((w) => this.req(tag, w))
  }

  unsubscribe(tag: string) {
    this.latest.delete(tag)
    if (!this.subs.delete(tag)) return
    this.wires.forEach((w) => w.send(['CLOSE', subId(tag)]))
  }

  async publish(tag: string, sk: Uint8Array, content: string) {
    // replaceable events are ordered by created_at: make each one strictly newer than the last
    const at = Math.max(Math.floor(Date.now() / 1000), (this.lastCreated.get(tag) ?? 0) + 1)
    this.lastCreated.set(tag, at)
    const ev = await signEvent(sk, tag, content, at)
    log('publish', `topic ${tag.slice(0, 8)} at ${at} to ${this.connected}/${this.total} relays`)
    this.latest.set(tag, ev)
    this.wires.forEach((w) => w.send(['EVENT', ev]))
  }

  /** Redial everything now, e.g. when the device comes back online. */
  resume() {
    this.wires.forEach((w) => w.kick())
  }

  stop() {
    this.wires.forEach((w) => w.stop())
    this.subs.clear()
    this.latest.clear()
  }

  private onMessage(raw: string) {
    let m: unknown
    try {
      m = JSON.parse(raw)
    } catch {
      return
    }
    if (!Array.isArray(m) || m[0] !== 'EVENT') return
    const ev = m[2] as NostrEvent
    if (!ev || typeof ev.id !== 'string' || ev.kind !== KIND || this.seen.has(ev.id)) return
    const tag = ev.tags?.find((t) => t[0] === 'd')?.[1]
    const cb = tag ? this.subs.get(tag) : undefined
    if (!cb || m[1] !== subId(tag!)) return
    this.seen.add(ev.id)
    if (this.seen.size > 2000) this.seen.delete(this.seen.values().next().value!)
    void verifyEvent(ev).then((ok) => {
      if (!ok) return log('recv', `bad signature on topic ${tag!.slice(0, 8)}`)
      log('recv', `topic ${tag!.slice(0, 8)} from ${ev.pubkey.slice(0, 8)} at ${ev.created_at}`)
      cb(ev)
    })
  }
}
