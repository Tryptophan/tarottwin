import { useState } from 'react'
import { Logo } from '../components/Logo'
import { update, withName } from '../lib/storage'
import { t } from '../i18n'

export default function Onboarding() {
  const [name, setName] = useState('')
  const go = (n: string) => update((s) => withName(s, n))
  return (
    <main className="page onboarding">
      <Logo size={96} />
      <h1>Tarot Twin</h1>
      <p className="muted">{t.onboarding.tagline}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) go(name.trim())
        }}
      >
        <input id="name" aria-label={t.onboarding.namePlaceholder} className="input" value={name} maxLength={40} autoFocus required
          onChange={(e) => setName(e.target.value)} placeholder={t.onboarding.namePlaceholder} />
        <div className="row">
          <button type="submit" className="btn btn-gold" disabled={!name.trim()}>{t.onboarding.begin}</button>
        </div>
      </form>
    </main>
  )
}
