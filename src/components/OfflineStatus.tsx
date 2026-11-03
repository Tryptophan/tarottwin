import { useEffect, useState } from 'react'
import { downloadForOffline, useOffline } from '../lib/offline'

/** A pill while the cards are being saved for offline use, and briefly when that is done. */
export function OfflineStatus() {
  const s = useOffline()
  const [showReady, setShowReady] = useState(false)
  useEffect(() => {
    if (s.status !== 'running') return
    setShowReady(true)
  }, [s.status])
  useEffect(() => {
    if (s.status !== 'ready' || !showReady) return
    const t = setTimeout(() => setShowReady(false), 3000)
    return () => clearTimeout(t)
  }, [s.status, showReady])

  if (s.status === 'running') {
    const pct = Math.round((s.done / Math.max(1, s.total)) * 100)
    return (
      <div className="update-banner offline-pill" role="status">
        <span className="tcard-spinner" /> Saving cards for offline… {pct}%
      </div>
    )
  }
  if (s.status === 'error') {
    return (
      <div className="update-banner offline-pill" role="status">
        Couldn’t save every card for offline
        <button type="button" className="btn btn-gold btn-sm" onClick={() => void downloadForOffline()}>Retry</button>
      </div>
    )
  }
  if (s.status === 'ready' && showReady) {
    return <div className="update-banner offline-pill" role="status">Ready to use offline</div>
  }
  return null
}
