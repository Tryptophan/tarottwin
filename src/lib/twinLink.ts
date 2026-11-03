const ID_RE = /^[0-9a-f]{20}$/

export function isValidId(id: string): boolean {
  return ID_RE.test(id)
}

export function buildTwinLink(id: string, name: string): string {
  return `${location.origin}${location.pathname}#/twin/${id}?n=${encodeURIComponent(name)}`
}

/** Accepts a full URL (or bare hash) containing `#/twin/<id>` with optional `?n=`. */
export function parseTwinLink(text: string): { id: string; name: string } | null {
  const m = /#\/twin\/([^/?#\s]+)(?:\?([^#\s]*))?/.exec(text.trim())
  if (!m) return null
  const id = m[1].toLowerCase()
  if (!ID_RE.test(id)) return null
  let name = ''
  try {
    name = new URLSearchParams(m[2] ?? '').get('n') ?? ''
  } catch {
    /* ignore */
  }
  return { id, name: name.trim().slice(0, 40) }
}
