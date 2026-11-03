import { describe, expect, it } from 'vitest'
import { buildInviteLink, parseInviteLink } from './twinLink'

const ID = '0123456789abcdef0123'
const SECRET = '0123456789abcdef0123456789abcdef'

describe('invite link', () => {
  it('round-trips', () => {
    const link = buildInviteLink(ID, 'Zoë & Co', SECRET)
    expect(link).toContain(`#/join/${SECRET}?i=${ID}&n=`)
    expect(parseInviteLink(link)).toEqual({ id: ID, name: 'Zoë & Co', secret: SECRET })
  })
  it('parses without name', () => {
    expect(parseInviteLink(`https://x.io/app/#/join/${SECRET}?i=${ID}`)).toEqual({ id: ID, name: '', secret: SECRET })
  })
  it('parses surrounded by whitespace', () => {
    expect(parseInviteLink(`  https://x.io/#/join/${SECRET}?i=${ID}&n=Al  \n`)).toEqual({ id: ID, name: 'Al', secret: SECRET })
  })
  it('rejects bad secrets, bad ids, missing ids and junk', () => {
    expect(parseInviteLink(`#/join/nothex?i=${ID}`)).toBeNull()
    expect(parseInviteLink(`#/join/${SECRET}00?i=${ID}`)).toBeNull()
    expect(parseInviteLink(`#/join/${SECRET}?i=nothex`)).toBeNull()
    expect(parseInviteLink(`#/join/${SECRET}`)).toBeNull()
    expect(parseInviteLink('hello')).toBeNull()
    expect(parseInviteLink(`https://x.io/#/twin/${ID}`)).toBeNull()
  })
})
