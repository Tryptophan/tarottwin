const ID_RE = /^[0-9a-f]{20}$/
const SECRET_RE = /^[0-9a-f]{32}$/

export function isValidId(id: string): boolean {
  return ID_RE.test(id)
}

export interface Invite {
  id: string
  name: string
  secret: string
}

/** The secret is the whole bond: it stays in the hash, which never leaves the browser. */
export function buildInviteLink(id: string, name: string, secret: string): string {
  return `${location.origin}${location.pathname}#/join/${secret}?i=${id}&n=${encodeURIComponent(name)}`
}

/** Accepts a full URL (or bare hash) containing `#/join/<secret>?i=<id>&n=<name>`. */
export function parseInviteLink(text: string): Invite | null {
  const m = /#\/join\/([^/?#\s]+)(?:\?([^#\s]*))?/.exec(text.trim())
  if (!m) return null
  const secret = m[1].toLowerCase()
  if (!SECRET_RE.test(secret)) return null
  let id = '', name = ''
  try {
    const q = new URLSearchParams(m[2] ?? '')
    id = (q.get('i') ?? '').toLowerCase()
    name = q.get('n') ?? ''
  } catch {
    return null
  }
  if (!ID_RE.test(id)) return null
  return { id, name: name.trim().slice(0, 40), secret }
}
