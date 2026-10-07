import { describe, expect, it } from 'vitest'
import { backupFileName, exportBackup, parseBackup } from './backup.js'
import { initialState, reducer } from '../state/reducer.js'

const NOW = new Date(2026, 9, 7, 15, 0)
const AT = NOW.toISOString()

const used = [
  { type: 'setDialect', dialect: 'teochew' },
  { type: 'setPerson', person: 'hawker' },
  { type: 'logPractice', at: AT },
  { type: 'reflect', outcome: 'awkward', note: 'ok', at: AT, id: 'r1' },
].reduce(reducer, initialState)

const tamper = (change) => {
  const file = JSON.parse(exportBackup(used, NOW))
  change(file)
  return JSON.stringify(file)
}

describe('backup round trip', () => {
  it('restores exactly what was exported', () => {
    const result = parseBackup(exportBackup(used, NOW), NOW)
    expect(result.ok).toBe(true)
    expect(result.state.history).toEqual(used.history)
    expect(result.state.practices).toEqual(used.practices)
    expect(result.state.profile).toEqual({ dialect: 'teochew', person: 'hawker' })
  })

  it('names the file after the day', () => {
    expect(backupFileName(new Date('2026-10-07T03:00:00Z'))).toBe('hometongue-progress-2026-10-07.json')
  })
})

describe('refusing bad files', () => {
  it.each([
    ['not json', 'nope'],
    ['json that is not a backup', '{"hello":1}'],
    ['an array', '[]'],
    ['another app’s file', tamper((f) => (f.app = 'other'))],
    ['a future version', tamper((f) => (f.state.v = 2))],
    ['an unknown dialect', tamper((f) => (f.state.profile.dialect = 'klingon'))],
    ['a reflection with an unknown person', tamper((f) => (f.state.history[0].person = 'stranger'))],
    ['a reflection with an unknown outcome', tamper((f) => (f.state.history[0].outcome = 'wow'))],
    ['a reflection with a broken date', tamper((f) => (f.state.history[0].at = 'yesterday-ish'))],
    ['history that is not a list', tamper((f) => (f.state.history = {}))],
    ['progress for an unknown mission', tamper((f) => (f.state.progress['x:y'] = {}))],
  ])('%s', (_name, text) => {
    const result = parseBackup(text, NOW)
    expect(result.ok).toBe(false)
    expect(result.reason).toBeTruthy()
  })

  it('refuses enormous files', () => {
    expect(parseBackup(' '.repeat(3_000_000), NOW).ok).toBe(false)
  })
})
