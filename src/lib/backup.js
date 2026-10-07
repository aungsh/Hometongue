import { DIALECTS, OUTCOMES, PEOPLE } from '../data/catalog.js'
import { restore } from '../state/reducer.js'

// Save progress to a file and load it back, so nothing is lost when switching phones or
// clearing the browser. There are no accounts: the file is the backup.

const APP = 'hometongue'
const MAX_BYTES = 2_000_000

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)
const validDate = (value) => typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
const knownDialect = (id) => Object.hasOwn(DIALECTS, id)
const knownPerson = (id) => Object.hasOwn(PEOPLE, id)
const knownOutcome = (id) => OUTCOMES.some((o) => o.id === id)

function validState(state) {
  if (!isObject(state) || state.v !== 1) return false
  const { profile } = state
  if (!isObject(profile)) return false
  if (profile.dialect !== null && !knownDialect(profile.dialect)) return false
  if (profile.person !== null && !knownPerson(profile.person)) return false
  if (!Array.isArray(state.history) || !Array.isArray(state.practices) || !isObject(state.progress)) return false

  const validHistory = state.history.every(
    (h) =>
      isObject(h) &&
      typeof h.id === 'string' &&
      validDate(h.at) &&
      knownPerson(h.person) &&
      knownDialect(h.dialect) &&
      knownOutcome(h.outcome) &&
      typeof h.note === 'string',
  )
  const validPractices = state.practices.every(
    (p) => isObject(p) && validDate(p.at) && knownPerson(p.person) && knownDialect(p.dialect),
  )
  const validProgress = Object.entries(state.progress).every(([key, entry]) => {
    const [person, dialect] = key.split(':')
    return knownPerson(person) && knownDialect(dialect) && isObject(entry)
  })
  return validHistory && validPractices && validProgress
}

/** The text of a backup file for this state. */
export function exportBackup(state, now = new Date()) {
  return JSON.stringify({ app: APP, exportedAt: now.toISOString(), state }, null, 2)
}

export const backupFileName = (now = new Date()) =>
  `hometongue-progress-${now.toISOString().slice(0, 10)}.json`

/**
 * Reads a backup file's text. Returns { ok: true, state } or { ok: false, reason }.
 * Anything unexpected is refused outright, so a bad file can never leave the app half-loaded.
 */
export function parseBackup(text, now = new Date()) {
  if (typeof text !== 'string' || text.length > MAX_BYTES) return { ok: false, reason: 'That file is too big to be a backup.' }
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'That doesn’t look like a Hometongue backup file.' }
  }
  if (!isObject(data) || data.app !== APP || !validState(data.state)) {
    return { ok: false, reason: 'That doesn’t look like a Hometongue backup file.' }
  }
  return { ok: true, state: restore(JSON.stringify(data.state), now) }
}
