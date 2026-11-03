import { describe, expect, it } from 'vitest'
import { bondSigningKey, decrypt, encrypt, randomHex, topicTag } from './crypto'
import { signEvent, verifyEvent } from '../net/nostr'

describe('crypto', () => {
  it('round-trips and rejects the wrong secret or tampering', async () => {
    const s = randomHex(16)
    const c = await encrypt(s, '{"hello":"wörld"}')
    expect(await decrypt(s, c)).toBe('{"hello":"wörld"}')
    expect(await decrypt(randomHex(16), c)).toBeNull()
    expect(await decrypt(s, c.slice(0, -4) + 'AAAA')).toBeNull()
    expect(await decrypt(s, 'not base64 !!')).toBeNull()
  })
  it('does not reuse the iv', async () => {
    const s = randomHex(16)
    expect(await encrypt(s, 'x')).not.toBe(await encrypt(s, 'x'))
  })
  it('derives a stable topic that depends only on the secret', async () => {
    expect(await topicTag('a')).toBe(await topicTag('a'))
    expect(await topicTag('a')).not.toBe(await topicTag('b'))
    expect(await topicTag('a')).toMatch(/^[0-9a-f]{64}$/)
  })
  it('derives a different signing key per bond so bonds cannot be linked', async () => {
    const a = await bondSigningKey('device', 'bond1')
    expect(a).toEqual(await bondSigningKey('device', 'bond1'))
    expect(a).not.toEqual(await bondSigningKey('device', 'bond2'))
    expect(a).not.toEqual(await bondSigningKey('other', 'bond1'))
  })
})

describe('nostr events', () => {
  it('verifies a signed event and rejects any change to it', async () => {
    const sk = await bondSigningKey('d', 'b')
    const ev = await signEvent(sk, 'tag', 'payload', 1000)
    expect(ev.kind).toBe(30078)
    expect(ev.tags).toEqual([['d', 'tag']])
    expect(await verifyEvent(ev)).toBe(true)
    expect(await verifyEvent({ ...ev, content: 'other' })).toBe(false)
    expect(await verifyEvent({ ...ev, created_at: 1001 })).toBe(false)
    expect(await verifyEvent({ ...ev, sig: '00'.repeat(64) })).toBe(false)
    expect(await verifyEvent({ ...ev, pubkey: 'zz' })).toBe(false)
  })
})
