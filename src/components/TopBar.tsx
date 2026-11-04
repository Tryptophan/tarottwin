import { useState } from 'react'
import { Link } from 'react-router-dom'
import { INSTALL_STEPS, promptInstall, useInstallWay } from '../lib/pwa'
import { Logo } from './Logo'
import { t } from '../i18n'

export default function TopBar() {
  const way = useInstallWay()
  const [steps, setSteps] = useState<string | null>(null)

  const install = () => {
    if (way === 'prompt') void promptInstall()
    else if (way !== 'none') setSteps(INSTALL_STEPS[way])
  }

  return (
    <>
      <header className="topbar">
        <Link to="/" className="topbar-brand" aria-label={t.topbar.homeAria}>
          <Logo size={34} />
          <span>Tarot Twin</span>
        </Link>
        {way !== 'none' && (
          <button type="button" className="btn btn-ghost btn-sm topbar-install" onClick={install}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
            </svg>
            {t.common.install}
          </button>
        )}
      </header>
      {steps && (
        <div className="sheet-backdrop" onClick={() => setSteps(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={t.topbar.installTitle}
            onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grab" />
            <h2 className="sheet-title">{t.topbar.installTitle}</h2>
            <p>{steps}</p>
            <button type="button" className="btn btn-gold btn-block" onClick={() => setSteps(null)}>{t.common.gotIt}</button>
          </div>
        </div>
      )}
    </>
  )
}
