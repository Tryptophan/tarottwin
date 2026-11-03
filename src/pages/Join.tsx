import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { randomHex } from '../lib/crypto'
import { update, useAppState, withFriend } from '../lib/storage'
import { parseInviteLink } from '../lib/twinLink'

/**
 * Opening an invite link: you make a private bond secret for the two of you and are bonded right away.
 * The inviter's device finds out through their invite inbox on the relays, and then answers.
 */
export default function Join() {
  const { secret = '' } = useParams()
  const [params] = useSearchParams()
  const { userId, friends, inviteSecret } = useAppState()
  const nav = useNavigate()
  const invite = parseInviteLink(`#/join/${secret}?i=${params.get('i') ?? ''}&n=${encodeURIComponent(params.get('n') ?? '')}`)
  const own = !!invite && (invite.id === userId || invite.secret === inviteSecret)
  const known = !!invite && friends[invite.id]

  useEffect(() => {
    if (!invite || own || known) return
    update((s) => withFriend(s, invite.id, invite.name, randomHex(16), invite.secret))
    nav(`/twin/${invite.id}`, { replace: true })
  }, [invite, own, known, nav])

  if (!invite) return <main className="page"><h1>Invalid link</h1><p className="muted">This invite link is not valid.</p><Link className="btn btn-ghost" to="/twin">Back</Link></main>
  if (own) return <main className="page"><h1>That's you</h1><p className="muted">This is your own invite. Send it to a friend instead.</p><Link className="btn btn-ghost" to="/twin">Back</Link></main>
  if (known) return <Navigate to={`/twin/${invite.id}`} replace />
  return <main className="page"><p className="muted">Joining…</p></main>
}
