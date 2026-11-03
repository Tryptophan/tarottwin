import { applyUpdate, useUpdateReady } from '../lib/pwa'

/** Offers the waiting new version, on every page. */
export function UpdateBanner() {
  if (!useUpdateReady()) return null
  return (
    <div className="update-banner" role="status">
      A new version of Tarot Twin is ready
      <button type="button" className="btn btn-gold btn-sm" onClick={applyUpdate}>Reload</button>
    </div>
  )
}
