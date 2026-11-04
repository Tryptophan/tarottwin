import { useLayoutEffect, useRef, useState } from 'react'
import { downloadForOffline, useOffline } from '../lib/offline'
import { INSTALL_STEPS, promptInstall, useInstallWay } from '../lib/pwa'
import { buildDebugReport } from '../lib/debuglog'
import { getState } from '../lib/storage'
import { useRelayStatus } from '../net/runtime'
import { resetAll, update, useAppState, withName } from '../lib/storage'
import { LANG, LANGS, LOCALES, setLang, t, type Lang } from '../i18n'

/** Install-as-app: a real button where the browser offers one, otherwise the steps for this browser. */
function InstallApp() {
  const way = useInstallWay()
  if (way === 'none') return null
  return (
    <div className="settings-block">
      <label>{t.common.install}</label>
      {way === 'prompt' ? (
        <div className="row">
          <span className="muted">{t.settings.installBody}</span>
          <button className="btn btn-ghost" onClick={() => void promptInstall()}>{t.common.install}</button>
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
      <h1>{t.settings.title}</h1>
      <div className="settings-block">
        <label htmlFor="lang">{t.settings.language}</label>
        <select id="lang" className="input" value={LANG} onChange={(e) => setLang(e.target.value as Lang)}>
          {LANGS.map((l) => <option key={l} value={l}>{LOCALES[l].native}</option>)}
        </select>
      </div>
      <form className="settings-block" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) update((s) => withName(s, draft)) }}>
        <label htmlFor="nm">{t.settings.yourName}</label>
        <div className="row">
          <input id="nm" className="input" value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} />
          <button className="btn btn-gold" type="submit" disabled={!draft.trim() || draft.trim() === name}>{t.common.save}</button>
        </div>
      </form>
      <div className="settings-block">
        <label>{t.settings.yourId}</label>
        <div className="row">
          <FitId id={userId} />
          <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(userId); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
            {copied ? t.common.copied : t.common.copy}
          </button>
        </div>
      </div>
      <div className="settings-block">
        <label>{t.settings.offline}</label>
        <div className="row">
          <span className="muted">
            {offline.status === 'ready' ? t.settings.offlineReady
              : offline.status === 'running' ? t.settings.offlineSaving(Math.round((offline.done / Math.max(1, offline.total)) * 100))
              : offline.status === 'error' ? t.settings.offlineError
              : t.settings.offlineIdle}
          </span>
          {offline.status !== 'ready' && offline.status !== 'running' && (
            <button className="btn btn-ghost" onClick={() => void downloadForOffline()}>{t.common.save}</button>
          )}
        </div>
      </div>
      <InstallApp />
      <div className="settings-block">
        <label>{t.settings.sync}</label>
        <p className="muted">{t.settings.syncBody(relays.total, relays.connected)}</p>
        <div className="row">
          <span>{t.settings.debugInfo}</span>
          <button className="btn btn-ghost" onClick={async () => {
            try {
              await navigator.clipboard.writeText(buildDebugReport({ state: getState(), relays }))
              setDebugCopied('ok')
            } catch {
              setDebugCopied('fail')
            }
            setTimeout(() => setDebugCopied(null), 2000)
          }}>
            {debugCopied === 'ok' ? t.common.copied : debugCopied === 'fail' ? t.common.couldNotCopy : t.common.copy}
          </button>
        </div>
      </div>
      <div className="settings-block">
        <label>{t.settings.danger}</label>
        <p className="muted">{t.settings.dangerBody}</p>
        <button className="btn btn-ghost" onClick={() => {
          if (confirm(t.settings.confirmDeleteAll)) { resetAll(); location.hash = '#/' }
        }}>{t.settings.deleteAll}</button>
      </div>
    </main>
  )
}
