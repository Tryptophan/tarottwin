import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QrCode from '../components/QrCode'
import Scanner from '../components/Scanner'
import { useAppState } from '../lib/storage'
import { buildTwinLink, parseTwinLink } from '../lib/twinLink'

export default function Twin() {
  const { userId, name } = useAppState()
  const nav = useNavigate()
  const [tab, setTab] = useState<'qr' | 'scan'>('qr')
  const [paste, setPaste] = useState('')
  const [err, setErr] = useState('')
  const link = buildTwinLink(userId, name)

  const open = (text: string) => {
    const p = parseTwinLink(text)
    if (!p) {
      setErr('That does not look like a Tarot Twin link.')
      return
    }
    nav(`/twin/${p.id}?n=${encodeURIComponent(p.name)}`)
  }

  return (
    <main className="page twin">
      <h1>Twin</h1>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'qr'} className={`tab${tab === 'qr' ? ' tab-active' : ''}`} onClick={() => setTab('qr')}>My QR</button>
        <button role="tab" aria-selected={tab === 'scan'} className={`tab${tab === 'scan' ? ' tab-active' : ''}`} onClick={() => setTab('scan')}>Scan</button>
      </div>
      {tab === 'qr' ? (
        <section className="twin-qr">
          <QrCode text={link} />
          <p className="muted">Let your friend scan this, then scan theirs.</p>
          <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(link)}>Copy link</button>
        </section>
      ) : (
        <section className="twin-scan">
          <Scanner onResult={open} />
          <form className="row" onSubmit={(e) => { e.preventDefault(); open(paste) }}>
            <input className="input" value={paste} placeholder="Or paste a link" aria-label="Paste link"
              onChange={(e) => { setPaste(e.target.value); setErr('') }} />
            <button className="btn btn-gold" type="submit" disabled={!paste.trim()}>Go</button>
          </form>
          {err && <p className="scan-error" role="alert">{err}</p>}
        </section>
      )}
    </main>
  )
}
