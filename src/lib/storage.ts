import { useSyncExternalStore } from 'react'
import { randomHex } from './crypto'
import { t } from '../i18n'
import type { OracleEntry } from './oracle'
import type { Print } from './print'
import { STUBBED, stubState } from './stub'

export interface Friend {
  id: string
  name: string
  addedAt: string
  /** shared bond secret (made by whoever opened the other's invite link): derives the relay topic and the encryption key */
  secret: string
  /** set on the side that opened the link until the other side has answered: the inviter's invite secret */
  joinVia?: string
  /** relay public key of the friend's bond, bound to the first event seen on the topic */
  pub?: string
  /** UTC dates the friend completed a Twin reading with you, as last synced */
  theirDates?: string[]
  /** `at` of the newest synced event, so older ones arriving late are ignored */
  syncedAt?: number
}

/** What someone drops in your invite inbox after opening your link (decrypted). */
export interface JoinRequest {
  id: string
  name: string
  /** the bond secret they made for the two of you */
  bond: string
}

/** What a friend publishes about themselves (decrypted). */
export interface RemoteState {
  id: string
  name: string
  dates: string[]
  at: number
}

export interface HistoryEntry {
  /** UTC date, YYYY-MM-DD */
  date: string
  mine: string
  theirs: string
  bridge: string
}

export interface AppState {
  userId: string
  /** random per-device secret; signing keys for every bond derive from it */
  userSecret: string
  name: string
  /** false until the user has completed first-run onboarding */
  onboarded: boolean
  friends: Record<string, Friend>
  /** permanent: goes in your invite link and QR, and opens your inbox on the relays */
  inviteSecret: string
  /** bond secrets of friends you deleted, so a join request still on a relay can't bring them back */
  revoked: string[]
  history: Record<string, HistoryEntry[]>
  /** ids of the cards unlocked so far (daily or in a Twin reading): the Collection unlocks them */
  unlocked: string[]
  /** every print pulled so far, by card id (daily or in a Twin reading); the Collection counts them */
  prints: Record<string, Print[]>
  /** yes/no readings, newest first: the journal, and the last one starts the 6-hour wait */
  oracle: OracleEntry[]
}

// stubbed mode (npm run dev:stubbed) keeps to its own key so a real profile is never touched
const KEY = STUBBED ? 'tarottwin:stub' : 'tarottwin:v1'

export function generateUserId(): string {
  const bytes = new Uint8Array(10)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function fresh(): AppState {
  return { userId: generateUserId(), userSecret: randomHex(32), name: '', onboarded: false, friends: {}, inviteSecret: randomHex(16), revoked: [], history: {}, unlocked: [], prints: {}, oracle: [] }
}

export function loadState(): AppState {
  if (STUBBED) {
    const stub = stubState()
    persist(stub)
    return stub
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>
      if (typeof parsed.userId === 'string' && parsed.userId) {
        // bonds from before relay sync have no shared secret and can never sync: drop them
        const friends = Object.fromEntries(Object.entries(parsed.friends ?? {}).filter(([, f]) => typeof f?.secret === 'string'))
        const history = Object.fromEntries(Object.entries(parsed.history ?? {}).filter(([id]) => id in friends))
        // older saves have no list: everything already read in a pair reading counts as pulled (dropped bonds still count)
        const unlocked = parsed.unlocked ?? [...new Set(Object.values(parsed.history ?? {}).flat().flatMap((e) => [e.mine, e.theirs, e.bridge]))]
        const state: AppState = {
          ...fresh(), ...parsed, userId: parsed.userId, userSecret: parsed.userSecret || randomHex(32),
          inviteSecret: parsed.inviteSecret || randomHex(16), revoked: parsed.revoked ?? [], friends, history, unlocked, prints: parsed.prints ?? {}, oracle: Array.isArray(parsed.oracle) ? parsed.oracle : [],
        }
        // write the migration back, or freshly made secrets would change on every load
        if (!parsed.userSecret || !parsed.inviteSecret) persist(state)
        return state
      }
    }
  } catch {
    /* corrupt or unavailable storage: fall through to a fresh profile */
  }
  const state = fresh()
  persist(state)
  return state
}

function persist(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or blocked; in-memory state still works */
  }
}

// ---- pure updaters ----

export function withName(s: AppState, name: string): AppState {
  return { ...s, name: name.trim(), onboarded: true }
}

export function withFriend(s: AppState, id: string, name: string, secret: string, joinVia?: string, now = new Date()): AppState {
  const existing = s.friends[id]
  const cleaned = name.trim() || existing?.name || t.common.stranger
  return {
    ...s,
    friends: {
      ...s.friends,
      [id]: { ...existing, id, name: cleaned, secret: existing?.secret ?? secret, joinVia: existing ? existing.joinVia : joinVia, addedAt: existing?.addedAt ?? now.toISOString() },
    },
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Someone opened your invite link and left a join request in your inbox. They become a bond with
 * the secret they made. Ignored when it is not valid, from yourself, for a bond you deleted, or from
 * someone you already have, with one exception: if you both opened each other's links at once there
 * are two bonds, and the one with the smaller secret wins on both sides so they end up on one topic.
 */
export function withJoin(s: AppState, j: JoinRequest, now = new Date()): AppState {
  if (!/^[0-9a-f]{20}$/.test(j.id) || j.id === s.userId || !/^[0-9a-f]{32}$/.test(j.bond) || s.revoked.includes(j.bond)) return s
  const name = typeof j.name === 'string' ? j.name.trim().slice(0, 40) : ''
  const existing = s.friends[j.id]
  if (!existing) return withFriend(s, j.id, name, j.bond, undefined, now)
  if (existing.joinVia && existing.syncedAt === undefined && j.bond < existing.secret) {
    const { pub: _pub, theirDates: _dates, syncedAt: _at, ...rest } = existing
    return { ...s, friends: { ...s.friends, [j.id]: { ...rest, secret: j.bond } } }
  }
  return s
}

/**
 * Applies a friend's synced state arriving on the topic of their bond. The first sender's key is
 * remembered, and events from any other key, or older than the newest one seen, are ignored.
 * Returns the same state when the event should be ignored.
 */
export function withRemote(s: AppState, secret: string, r: RemoteState, pub: string): AppState {
  if (!/^[0-9a-f]{20}$/.test(r.id) || r.id === s.userId || !Array.isArray(r.dates) || !Number.isFinite(r.at)) return s
  const friend = Object.values(s.friends).find((f) => f.secret === secret)
  if (!friend || friend.id !== r.id || (friend.pub && friend.pub !== pub) || (friend.syncedAt ?? 0) >= r.at) return s
  const dates = [...new Set(r.dates.filter((d) => typeof d === 'string' && DATE_RE.test(d)))].sort().reverse().slice(0, 120)
  const name = typeof r.name === 'string' ? r.name.trim().slice(0, 40) : ''
  // they have answered: the join request no longer needs to be sent
  const { joinVia: _via, ...rest } = friend
  return { ...s, friends: { ...s.friends, [friend.id]: { ...rest, name: name || friend.name, pub, theirDates: dates, syncedAt: r.at } } }
}

export function withReading(s: AppState, friendId: string, entry: HistoryEntry): AppState {
  const list = (s.history[friendId] ?? []).filter((e) => e.date !== entry.date)
  list.push(entry)
  list.sort((a, b) => b.date.localeCompare(a.date))
  return withUnlocked({ ...s, history: { ...s.history, [friendId]: list } }, entry.mine, entry.theirs, entry.bridge)
}

/** Adds cards to the Collection. Returns the same state when nothing is new. */
export function withUnlocked(s: AppState, ...ids: string[]): AppState {
  const fresh = ids.filter((id) => !s.unlocked.includes(id))
  return fresh.length ? { ...s, unlocked: [...s.unlocked, ...new Set(fresh)] } : s
}

/** Records pulled prints (card id + print). A print already held (same serial and rarity) is not counted twice. */
export function withPrints(s: AppState, ...pulled: Array<[string, Print]>): AppState {
  let prints = s.prints
  for (const [id, p] of pulled) {
    const have = prints[id] ?? []
    if (have.some((h) => h.serial === p.serial && h.rarity === p.rarity)) continue
    prints = { ...prints, [id]: [...have, p] }
  }
  return prints === s.prints ? s : { ...s, prints }
}

/** Adds a yes/no reading to the journal (one per 6-hour window; a repeat for the same window is ignored). */
export function withOracle(s: AppState, e: OracleEntry): AppState {
  if (s.oracle.some((o) => o.at === e.at)) return s
  return { ...s, oracle: [e, ...s.oracle].sort((a, b) => b.at - a.at).slice(0, 200) }
}

export function withoutFriend(s: AppState, id: string): AppState {
  const friends = { ...s.friends }
  const history = { ...s.history }
  const secret = friends[id]?.secret
  delete friends[id]
  delete history[id]
  return { ...s, friends, history, revoked: secret ? [...s.revoked, secret] : s.revoked }
}

// ---- tiny external store ----

let current: AppState | null = null
const listeners = new Set<() => void>()

function get(): AppState {
  return (current ??= loadState())
}

export const getState = get

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function update(fn: (s: AppState) => AppState) {
  const next = fn(get())
  if (next === current) return
  current = next
  persist(next)
  listeners.forEach((l) => l())
}

export function resetAll() {
  try { localStorage.removeItem('tarottwin:revealed'); localStorage.removeItem('tarottwin:twinsteps') } catch { /* ignore */ }
  current = fresh()
  persist(current)
  listeners.forEach((l) => l())
}

/** Test helper: drop the cache so the next read hits localStorage again. */
export function _resetCache() {
  current = null
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    get,
  )
}
