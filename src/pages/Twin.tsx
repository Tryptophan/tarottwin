import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QrCode from '../components/QrCode'
import Scanner from '../components/Scanner'
import { useAppState } from '../lib/storage'
import { buildInviteLink, parseInviteLink } from '../lib/twinLink'

export default function Twin() {
  const { userId, name, inviteSecret, friends } = useAppState()
  const nav = useNavigate()
  const [tab, setTab] = useState<'qr' | 'scan'>('qr')
  const [paste, setPaste] = useState('')
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)
  const link = buildInviteLink(userId, name, inviteSecret)
  // QR only: a friend who scans it while it is on screen opens the Twin reading here too.
  // Once the link has been shared or copied, a new bond can't be told apart from a QR scan, so don't auto-open.
  const knownAtMount = useRef(new Set(Object.keys(friends)))
  const linkShared = useRef(false)
  useEffect(() => {
    if (tab !== 'qr' || linkShared.current) return
    const joined = Object.keys(friends).find((id) => !knownAtMount.current.has(id))
    if (joined) nav(`/twin/${joined}`)
  }, [friends, tab, nav])

  const open = (text: string) => {
    const p = parseInviteLink(text)
    if (!p) {
      setErr('That does not look like a Tarot Twin invite.')
      return
    }
    nav(`/join/${p.secret}?i=${p.id}&n=${encodeURIComponent(p.name)}`)
  }
  const share = () => {
    linkShared.current = true
    if (navigator.share) void navigator.share({ title: 'Tarot Twin', text: `${name} invited you to be Twins`, url: link }).catch(() => {})
    else void copy()
  }
  const copy = async () => {
    linkShared.current = true
    await navigator.clipboard?.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="page twin">
      <h1>Twin</h1>
      <p className="muted">A twin reading pairs your daily card with a friend's and adds a bridge card. New every day.</p>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'qr'} className={`tab${tab === 'qr' ? ' tab-active' : ''}`} onClick={() => setTab('qr')}>Invite</button>
        <button role="tab" aria-selected={tab === 'scan'} className={`tab${tab === 'scan' ? ' tab-active' : ''}`} onClick={() => setTab('scan')}>Scan</button>
      </div>
      {tab === 'qr' ? (
        <section className="twin-qr">
          <QrCode text={link} />
          <p className="muted">Have your friend scan this or open the link.</p>
          <div className="invite-actions">
            <button className="btn btn-gold" onClick={share}>Share link</button>
            <button className="btn btn-ghost" onClick={() => void copy()}>{copied ? 'Copied' : 'Copy link'}</button>
          </div>
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
