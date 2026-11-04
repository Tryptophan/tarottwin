import { applyUpdate, useUpdateReady } from '../lib/pwa'
import { t } from '../i18n'

/** Offers the waiting new version, on every page. */
export function UpdateBanner() {
  if (!useUpdateReady()) return null
  return (
    <div className="update-banner" role="status">
      {t.banners.newVersion}
      <button type="button" className="btn btn-gold btn-sm" onClick={applyUpdate}>{t.banners.reload}</button>
    </div>
  )
}
