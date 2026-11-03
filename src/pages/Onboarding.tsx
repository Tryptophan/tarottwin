import { useState } from 'react'
import { Logo } from '../components/Logo'
import { update, withName } from '../lib/storage'

export default function Onboarding() {
  const [name, setName] = useState('')
  const go = (n: string) => update((s) => withName(s, n))
  return (
    <main className="page onboarding">
      <Logo size={96} />
      <h1>Tarot Twin</h1>
      <p className="muted">One card a day. A twin reading for two.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) go(name.trim())
        }}
      >
        <label htmlFor="name">What should friends call you?</label>
        <input id="name" className="input" value={name} maxLength={40} autoFocus required
          onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <div className="row">
          <button type="submit" className="btn btn-gold" disabled={!name.trim()}>Begin</button>
        </div>
      </form>
    </main>
  )
}
