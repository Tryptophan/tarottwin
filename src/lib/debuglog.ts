import type { AppState } from './storage'

const MAX = 300

interface Entry {
  t: string
  tag: string
  msg: string
}

const entries: Entry[] = []

/** Adds a line to the in-memory debug log (the last 300 lines are kept). */
export function log(tag: string, msg: string) {
  entries.push({ t: new Date().toISOString(), tag, msg })
  if (entries.length > MAX) entries.shift()
}

export function getLog(): readonly Entry[] {
  return entries
}

let installed = false

/** Records uncaught errors and unhandled promise rejections. Safe to call more than once. */
export function installDebugCapture() {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('error', (e) => log('error', `${e.message} (${e.filename}:${e.lineno})`))
  window.addEventListener('unhandledrejection', (e) => log('error', `unhandled rejection: ${String(e.reason)}`))
}

const mask = (s: string | undefined) => (s ? `${s.slice(0, 4)}…(${s.length})` : s)

/**
 * App state with every secret masked: the report is meant to be pasted to someone, and the bond
 * secrets and device secret are what keep relays and strangers out of your bonds.
 */
export function redactState(s: AppState) {
  return {
    ...s,
    userSecret: mask(s.userSecret),
    friends: Object.fromEntries(
      Object.entries(s.friends).map(([id, f]) => [id, { ...f, secret: mask(f.secret), joinVia: mask(f.joinVia), pub: mask(f.pub) }]),
    ),
    inviteSecret: mask(s.inviteSecret),
    revoked: s.revoked.map((r) => mask(r)!),
  }
}

export interface DebugInfo {
  state: AppState
  relays?: { connected: number; total: number }
}

export function buildDebugReport({ state, relays }: DebugInfo, now = new Date()): string {
  const env = {
    time: now.toISOString(),
    url: typeof location === 'undefined' ? '' : location.href.replace(/#.*/, '#…'),
    userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    online: typeof navigator === 'undefined' ? undefined : navigator.onLine,
    relays,
  }
  const lines = entries.map((e) => `${e.t} [${e.tag}] ${e.msg}`)
  return [
    '# Tarot Twin debug report',
    '(secrets are masked)',
    '',
    '## Environment',
    JSON.stringify(env, null, 2),
    '',
    '## State',
    JSON.stringify(redactState(state), null, 2),
    '',
    `## Log (${lines.length} lines)`,
    lines.join('\n') || '(empty)',
    '',
  ].join('\n')
}
