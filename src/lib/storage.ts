import { useSyncExternalStore } from 'react'

export interface Friend {
  id: string
  name: string
  addedAt: string
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
  name: string
  /** false until the user has completed first-run onboarding */
  onboarded: boolean
  friends: Record<string, Friend>
  history: Record<string, HistoryEntry[]>
  /** ids of the cards unlocked so far (daily or in a Twin reading): the Collection unlocks them */
  unlocked: string[]
}

const KEY = 'tarottwin:v1'

export function generateUserId(): string {
  const bytes = new Uint8Array(10)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function fresh(): AppState {
  return { userId: generateUserId(), name: '', onboarded: false, friends: {}, history: {}, unlocked: [] }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>
      if (typeof parsed.userId === 'string' && parsed.userId) {
        const history = parsed.history ?? {}
        // older saves have no list: everything already read in a pair reading counts as pulled
        const unlocked = parsed.unlocked ?? [...new Set(Object.values(history).flat().flatMap((e) => [e.mine, e.theirs, e.bridge]))]
        return { ...fresh(), ...parsed, userId: parsed.userId, friends: parsed.friends ?? {}, history, unlocked }
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

export function withFriend(s: AppState, id: string, name: string, now = new Date()): AppState {
  const existing = s.friends[id]
  const cleaned = name.trim() || existing?.name || 'Stranger'
  return {
    ...s,
    friends: { ...s.friends, [id]: { id, name: cleaned, addedAt: existing?.addedAt ?? now.toISOString() } },
  }
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

export function withoutFriend(s: AppState, id: string): AppState {
  const friends = { ...s.friends }
  const history = { ...s.history }
  delete friends[id]
  delete history[id]
  return { ...s, friends, history }
}

// ---- tiny external store ----

let current: AppState | null = null
const listeners = new Set<() => void>()

function get(): AppState {
  return (current ??= loadState())
}

export function update(fn: (s: AppState) => AppState) {
  const next = fn(get())
  if (next === current) return
  current = next
  persist(next)
  listeners.forEach((l) => l())
}

export function resetAll() {
  try { sessionStorage.removeItem('tarottwin:revealed') } catch { /* ignore */ }
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
