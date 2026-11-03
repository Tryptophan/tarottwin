import { useState } from 'react'
import { downloadForOffline, useOffline } from '../lib/offline'
import { resetAll, update, useAppState, withName } from '../lib/storage'

export default function Settings() {
  const { userId, name } = useAppState()
  const [draft, setDraft] = useState(name)
  const [copied, setCopied] = useState(false)
  const offline = useOffline()
  const short = `${userId.slice(0, 6)}…${userId.slice(-4)}`
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
          <code>{short}</code>
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
