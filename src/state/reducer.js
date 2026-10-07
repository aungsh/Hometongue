import { dayKey, isRealConversation } from '../lib/logic.js'
import { sampleWeek } from '../data/sample.js'

const VERSION = 1

export const initialState = {
  v: VERSION,
  profile: { dialect: null, person: null },
  // Mission progress per person + dialect: { learned, practised, accepted, when, completedAt }
  progress: {},
  // Reflections: { id, at, person, dialect, outcome, note }
  history: [],
  // Practice takes: { at, person, dialect }
  practices: [],
  cheered: {},
  feedbackOn: true,
}

const missionKey = ({ person, dialect }) => `${person}:${dialect}`

export function currentEntry(state) {
  return state.progress[missionKey(state.profile)]
}

function updateEntry(state, changes) {
  const key = missionKey(state.profile)
  return { ...state, progress: { ...state.progress, [key]: { ...state.progress[key], ...changes } } }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'setDialect':
      return { ...state, profile: { ...state.profile, dialect: action.dialect } }
    case 'setPerson':
      return { ...state, profile: { ...state.profile, person: action.person } }
    case 'markLearned':
      return updateEntry(state, { learned: true })
    case 'logPractice': {
      const { person, dialect } = state.profile
      return { ...state, practices: [...state.practices, { at: action.at, person, dialect }] }
    }
    case 'finishPractice':
      return updateEntry(state, { practised: true })
    case 'acceptChallenge':
      return updateEntry(state, { accepted: true, when: action.when })
    case 'reflect': {
      const { person, dialect } = state.profile
      const entry = { id: action.id, at: action.at, person, dialect, outcome: action.outcome, note: action.note }
      const logged = { ...state, history: [...state.history, entry] }
      // Forgot / no opportunity keep the mission open; a real conversation completes it.
      return isRealConversation(action.outcome)
        ? updateEntry(logged, { accepted: true, completedAt: action.at, lastOutcome: action.outcome })
        : updateEntry(logged, { accepted: true, lastOutcome: action.outcome })
    }
    case 'toggleCheer':
      return { ...state, cheered: { ...state.cheered, [action.friendId]: !state.cheered[action.friendId] } }
    case 'setFeedback':
      return { ...state, feedbackOn: action.on }
    case 'loadSample': {
      const today = dayKey(action.now)
      const isToday = (entry) => dayKey(new Date(entry.at)) === today
      const sample = sampleWeek(action.now, state.profile.dialect ?? 'hokkien')
      return {
        ...state,
        history: [...sample.history, ...state.history.filter(isToday)],
        practices: [...sample.practices, ...state.practices.filter(isToday)],
      }
    }
    case 'reset':
      return initialState
    default:
      return state
  }
}

/** On a new day, missions completed on earlier days start again. Open challenges stay open. */
export function rollover(state, now) {
  const today = dayKey(now)
  const progress = Object.fromEntries(
    Object.entries(state.progress).filter(
      ([, entry]) => !entry.completedAt || dayKey(new Date(entry.completedAt)) === today,
    ),
  )
  return { ...state, progress }
}

/** Rebuilds state from saved JSON. Anything unreadable or from another version starts fresh. */
export function restore(raw, now) {
  try {
    const saved = JSON.parse(raw)
    if (!saved || saved.v !== VERSION) return initialState
    return rollover({ ...initialState, ...saved }, now)
  } catch {
    return initialState
  }
}
