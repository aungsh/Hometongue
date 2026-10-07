import { dayKey, isRealConversation } from '../lib/logic.js'
import { sampleWeek } from '../data/sample.js'

const VERSION = 1

export const initialState = {
  v: VERSION,
  profile: { dialect: null, person: null },
  // Mission progress per person + dialect + mission: { learned, practised, accepted, when, completedAt }
  progress: {},
  // Reflections: { id, at, person, dialect, missionId, outcome, note }
  history: [],
  // Practice takes: { at, person, dialect }
  practices: [],
  // Coach reactions after practice takes.
  feedbackOn: true,
  // Whether the coach's lines are spoken aloud (they are always shown as text).
  coachVoiceOn: true,
}

const missionKey = ({ person, dialect }, missionId) => `${person}:${dialect}:${missionId}`

/** Where today's mission (`missionId`) is up to for the chosen person and dialect. */
export function currentEntry(state, missionId) {
  return state.progress[missionKey(state.profile, missionId)]
}

function updateEntry(state, missionId, changes) {
  const key = missionKey(state.profile, missionId)
  return { ...state, progress: { ...state.progress, [key]: { ...state.progress[key], ...changes } } }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'setDialect':
      return { ...state, profile: { ...state.profile, dialect: action.dialect } }
    case 'setPerson':
      return { ...state, profile: { ...state.profile, person: action.person } }
    case 'markLearned':
      return updateEntry(state, action.missionId, { learned: true })
    case 'logPractice': {
      const { person, dialect } = state.profile
      return { ...state, practices: [...state.practices, { at: action.at, person, dialect }] }
    }
    case 'finishPractice':
      return updateEntry(state, action.missionId, { practised: true })
    case 'acceptChallenge':
      return updateEntry(state, action.missionId, { accepted: true, when: action.when })
    case 'reflect': {
      const { person, dialect } = state.profile
      const entry = {
        id: action.id,
        at: action.at,
        person,
        dialect,
        missionId: action.missionId,
        outcome: action.outcome,
        note: action.note,
      }
      const logged = { ...state, history: [...state.history, entry] }
      // Forgot / no opportunity keep the mission open; a real conversation completes it.
      return isRealConversation(action.outcome)
        ? updateEntry(logged, action.missionId, {
            accepted: true,
            completedAt: action.at,
            lastOutcome: action.outcome,
          })
        : updateEntry(logged, action.missionId, { accepted: true, lastOutcome: action.outcome })
    }
    case 'setFeedback':
      return { ...state, feedbackOn: action.on }
    case 'setCoachVoice':
      return { ...state, coachVoiceOn: action.on }
    case 'hydrate':
      // Replaces everything with saved or imported state (already checked by restore()).
      return action.state
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
