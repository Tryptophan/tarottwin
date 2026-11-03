/**
 * Public Nostr relays used for bond sync. Each bond event is written to all of them and read
 * from all of them, so any one being down or dropping an event is fine.
 * Same set gooseboard checked on 2026-10-26: each delivered a test message between two clients.
 */
export const NOSTR_RELAYS: string[] = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://nostr.mom',
  'wss://relay.nostr.net',
]
