import { describe, expect, it } from 'vitest'
import { buildDebugReport, getLog, log, redactState } from './debuglog'
import { withFriend, type AppState } from './storage'

const state = (): AppState => {
  const s: AppState = { userId: 'aaaaaaaaaaaaaaaaaaaa', userSecret: 'u'.repeat(64), inviteSecret: 'i'.repeat(32), revoked: ['r'.repeat(32)], name: 'Ann', onboarded: true, friends: {}, history: {}, unlocked: ['the-fool'], prints: {}, oracle: [] }
  return withFriend(s, 'bbbbbbbbbbbbbbbbbbbb', 'Bob', 'f'.repeat(32), 'v'.repeat(32))
}

describe('debug report', () => {
  it('contains state, relay status and logs, with every secret masked', () => {
    log('test', 'something happened')
    const report = buildDebugReport({ state: state(), relays: { connected: 2, total: 5 } }, new Date('2026-11-03T00:00:00Z'))
    expect(report).toContain('2026-11-03T00:00:00.000Z')
    expect(report).toContain('"connected": 2')
    expect(report).toContain('[test] something happened')
    expect(report).toContain('"name": "Ann"')
    expect(report).toContain('the-fool')
    expect(report).toContain('bbbbbbbbbbbbbbbbbbbb')
    expect(report).not.toContain('u'.repeat(64))
    expect(report).not.toContain('f'.repeat(32))
    expect(report).not.toContain('i'.repeat(32))
    expect(report).not.toContain('r'.repeat(32))
    expect(report).not.toContain('v'.repeat(32))
  })
  it('redacts without mutating the real state', () => {
    const s = state()
    const r = redactState(s)
    expect(r.userSecret).toBe('uuuu…(64)')
    expect(s.userSecret).toBe('u'.repeat(64))
  })
  it('keeps only the most recent lines', () => {
    for (let i = 0; i < 400; i++) log('flood', String(i))
    expect(getLog().length).toBe(300)
    expect(getLog().at(-1)?.msg).toBe('399')
  })
})
