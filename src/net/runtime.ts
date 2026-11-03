import { useSyncExternalStore } from 'react'
import { getState, subscribe, update } from '../lib/storage'
import { RelayPool } from './nostr'
import { NOSTR_RELAYS } from './relays'
import { startSync } from './sync'

export interface RelayStatus {
  connected: number
  total: number
}

let status: RelayStatus = { connected: 0, total: NOSTR_RELAYS.length }
const listeners = new Set<() => void>()

/** Opens the relay connections and keeps bonds synced for the life of the page. */
export function startRelaySync(): () => void {
  const pool: RelayPool = new RelayPool(NOSTR_RELAYS, () => {
    status = { connected: pool.connected, total: pool.total }
    listeners.forEach((l) => l())
  })
  const stop = startSync({ get: getState, update, subscribe }, pool)
  const wake = () => {
    if (document.visibilityState === 'visible') pool.resume()
  }
  const online = () => pool.resume()
  document.addEventListener('visibilitychange', wake)
  window.addEventListener('online', online)
  return () => {
    stop()
    pool.stop()
    document.removeEventListener('visibilitychange', wake)
    window.removeEventListener('online', online)
  }
}

export function useRelayStatus(): RelayStatus {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => status,
  )
}
