import { useLayoutEffect, useRef, useState } from 'react'
import { downloadForOffline, useOffline } from '../lib/offline'
import { INSTALL_STEPS, promptInstall, useInstallWay } from '../lib/pwa'
import { buildDebugReport } from '../lib/debuglog'
import { getState } from '../lib/storage'
import { useRelayStatus } from '../net/runtime'
import { resetAll, update, useAppState, withName } from '../lib/storage'

/** Install-as-app: a real button where the browser offers one, otherwise the steps for this browser. */
function InstallApp() {
  const way = useInstallWay()
  if (way === 'none') return null
  return (
    <div className="settings-block">
      <label>Install</label>
      {way === 'prompt' ? (
        <div className="row">
          <span className="muted">Add Tarot Twin to your home screen to open it like an app, even offline.</span>
          <button className="btn btn-ghost" onClick={() => void promptInstall()}>Install</button>
        </div>
      ) : (
        <p className="muted">{INSTALL_STEPS[way]}</p>
      )}
    </div>
  )
}

/** Your full ID, or `abcdef…1234` when the full one does not fit the row. */
function FitId({ id }: { id: string }) {
  const ref = useRef<HTMLElement>(null)
  const [short, setShort] = useState(false)
  const [tick, setTick] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (el && !short && el.scrollWidth > el.clientWidth) setShort(true)
  }, [short, tick, id])
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => { setShort(false); setTick((t) => t + 1) })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return <code ref={ref} className="settings-id">{short ? `${id.slice(0, 6)}…${id.slice(-4)}` : id}</code>
}

export default function Settings() {
  const { userId, name } = useAppState()
  const [draft, setDraft] = useState(name)
  const [copied, setCopied] = useState(false)
  const [debugCopied, setDebugCopied] = useState<'ok' | 'fail' | null>(null)
  const offline = useOffline()
  const relays = useRelayStatus()
  return (
    <main className="page settings">
      <h1>Settings</h1>
      <form className="settings-block" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) update((s) => withName(s, draft)) }}>
        <label htmlFor="nm">Your name</label>
        <div className="row">
          <input id="nm" className="input" value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} />
          <button className="btn btn-gold" type="submit" disabled={!draft.trim() || draft.trim() === name}>Save</button>
        </div>
      </form>
      <div className="settings-block">
        <label>Your ID</label>
        <div className="row">
          <FitId id={userId} />
          <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(userId); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="settings-block">
        <label>Offline</label>
        <div className="row">
          <span className="muted">
            {offline.status === 'ready' ? 'All cards are saved on this device.'
              : offline.status === 'running' ? `Saving cards… ${Math.round((offline.done / Math.max(1, offline.total)) * 100)}%`
              : offline.status === 'error' ? 'Some cards could not be saved.'
              : 'Save every card so the app works without a connection.'}
          </span>
          {offline.status !== 'ready' && offline.status !== 'running' && (
            <button className="btn btn-ghost" onClick={() => void downloadForOffline()}>Save</button>
          )}
        </div>
      </div>
      <InstallApp />
      <div className="settings-block">
        <label>Sync</label>
        <p className="muted">Names and Twin reading dates sync with friends through {relays.total} public relays, end-to-end encrypted. {relays.connected} connected.</p>
        <div className="row">
          <span>Debug info</span>
          <button className="btn btn-ghost" onClick={async () => {
            try {
              await navigator.clipboard.writeText(buildDebugReport({ state: getState(), relays }))
              setDebugCopied('ok')
            } catch {
              setDebugCopied('fail')
            }
            setTimeout(() => setDebugCopied(null), 2000)
          }}>
            {debugCopied === 'ok' ? 'Copied' : debugCopied === 'fail' ? 'Could not copy' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="settings-block">
        <label>Danger zone</label>
        <p className="muted">Deleting all data removes your friends and history and creates a new ID. Friends will see you as a new person, and your daily cards will change. This cannot be undone.</p>
        <button className="btn btn-ghost" onClick={() => {
          if (confirm('Delete all data and reset your ID? This cannot be undone.')) { resetAll(); location.hash = '#/' }
        }}>Delete all data / reset ID</button>
      </div>
    </main>
  )
}
