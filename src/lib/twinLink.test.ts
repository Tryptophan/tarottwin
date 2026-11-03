import { describe, expect, it } from 'vitest'
import { buildTwinLink, parseTwinLink } from './twinLink'

const ID = '0123456789abcdef0123'

describe('twinLink', () => {
  it('round-trips', () => {
    const link = buildTwinLink(ID, 'Zoë & Co')
    expect(link).toContain(`#/twin/${ID}?n=`)
    expect(parseTwinLink(link)).toEqual({ id: ID, name: 'Zoë & Co' })
  })
  it('parses without name', () => {
    expect(parseTwinLink(`https://x.io/app/#/twin/${ID}`)).toEqual({ id: ID, name: '' })
  })
  it('parses surrounded by whitespace', () => {
    expect(parseTwinLink(`  https://x.io/#/twin/${ID}?n=Al  \n`)).toEqual({ id: ID, name: 'Al' })
  })
  it('rejects bad ids and junk', () => {
    expect(parseTwinLink('#/twin/nothex')).toBeNull()
    expect(parseTwinLink(`#/twin/${ID}00`)).toBeNull()
    expect(parseTwinLink('hello')).toBeNull()
    expect(parseTwinLink(`https://x.io/#/bonds/${ID}`)).toBeNull()
  })
})
