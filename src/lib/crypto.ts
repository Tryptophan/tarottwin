const enc = new TextEncoder()
const dec = new TextDecoder()

export const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')

export function fromHex(h: string): Uint8Array {
  const out = new Uint8Array(h.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16)
  return out
}

export const sha256 = async (s: string | Uint8Array): Promise<Uint8Array> =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', typeof s === 'string' ? enc.encode(s) : (s as BufferSource)))

/** `bytes` random bytes as hex. */
export function randomHex(bytes: number): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)))
}

const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b))
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

async function aesKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', (await sha256(`tarottwin-enc|${secret}`)) as BufferSource, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

/** AES-GCM with a key derived from the bond secret; output is base64(iv ‖ ciphertext). */
export async function encrypt(secret: string, plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(secret), enc.encode(plain)))
  const out = new Uint8Array(iv.length + ct.length)
  out.set(iv)
  out.set(ct, iv.length)
  return b64(out)
}

/** Returns null when the data is malformed or was not encrypted with this secret. */
export async function decrypt(secret: string, data: string): Promise<string | null> {
  try {
    const raw = unb64(data)
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.slice(0, 12) }, await aesKey(secret), raw.slice(12))
    return dec.decode(pt)
  } catch {
    return null
  }
}

/** Relay topic for a bond: only holders of the secret can compute it. */
export async function topicTag(secret: string): Promise<string> {
  return toHex(await sha256(`tarottwin-topic|${secret}`))
}

/**
 * Per-bond signing key: derived from the device's secret and the bond secret, so one
 * person's different bonds can't be linked together by their public key on a relay.
 */
export async function bondSigningKey(userSecret: string, bondSecret: string): Promise<Uint8Array> {
  return sha256(`tarottwin-sign|${userSecret}|${bondSecret}`)
}
