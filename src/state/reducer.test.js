import { describe, it, expect } from 'vitest'
import { reducer, initialState, currentEntry, rollover, restore } from './reducer.js'
import { nextStep, dayKey } from '../lib/logic.js'

const NOW = new Date(2026, 9, 1, 15, 0)
const AT = NOW.toISOString()
const YESTERDAY = new Date(2026, 8, 30, 20, 0).toISOString()

const run = (state, ...actions) => actions.reduce(reducer, state)
const onboarded = () =>
  run(initialState, { type: 'setDialect', dialect: 'hokkien' }, { type: 'setPerson', person: 'grandparents' })
const step = (state) => nextStep(currentEntry(state))
const reflect = (outcome, at = AT, id = `r-${outcome}`) => ({ type: 'reflect', outcome, note: '', at, id })

describe('mission flow', () => {
  it('starts a new profile on the learn step', () => {
    expect(step(onboarded())).toBe('learn')
  })

  it('moves from learn to practise once the phrases are learned', () => {
    expect(step(run(onboarded(), { type: 'markLearned' }))).toBe('practise')
  })

  it('records a practice take without leaving the practise step', () => {
    const state = run(onboarded(), { type: 'markLearned' }, { type: 'logPractice', at: AT })
    expect(state.practices).toEqual([{ at: AT, person: 'grandparents', dialect: 'hokkien' }])
    expect(step(state)).toBe('practise')
  })

  it('lets you move on to the challenge without recording (practice is optional)', () => {
    expect(step(run(onboarded(), { type: 'markLearned' }, { type: 'finishPractice' }))).toBe('challenge')
  })

  it('waits for a reflection once the challenge is accepted, remembering when', () => {
    const state = run(onboarded(), { type: 'acceptChallenge', when: 'weekend' })
    expect(step(state)).toBe('reflect')
    expect(currentEntry(state).when).toBe('weekend')
  })
})

describe('reflecting', () => {
  it('logs a natural reflection with its note and completes the mission', () => {
    const state = run(onboarded(), { type: 'acceptChallenge', when: 'today' }, {
      type: 'reflect',
      outcome: 'natural',
      note: 'Ah Ma smiled',
      at: AT,
      id: 'r1',
    })
    expect(state.history).toEqual([
      { id: 'r1', at: AT, person: 'grandparents', dialect: 'hokkien', outcome: 'natural', note: 'Ah Ma smiled' },
    ])
    expect(step(state)).toBe('done')
  })

  it('completes the mission on an awkward reflection too', () => {
    expect(step(run(onboarded(), reflect('awkward')))).toBe('done')
  })

  it('keeps the mission open after forgetting the phrase', () => {
    const state = run(onboarded(), { type: 'acceptChallenge', when: 'today' }, reflect('forgot'))
    expect(state.history).toHaveLength(1)
    expect(step(state)).toBe('reflect')
  })

  it('keeps the mission open when there was no opportunity', () => {
    expect(step(run(onboarded(), reflect('no-chance')))).toBe('reflect')
  })

  it('remembers the latest outcome so Reflect can invite another try', () => {
    const state = run(onboarded(), reflect('forgot'), reflect('no-chance', AT, 'r2'))
    expect(currentEntry(state).lastOutcome).toBe('no-chance')
  })
})

describe('switching person', () => {
  it("gives the new person a fresh mission and keeps the old one's progress", () => {
    let state = run(onboarded(), { type: 'markLearned' }, { type: 'setPerson', person: 'hawker' })
    expect(step(state)).toBe('learn')
    state = reducer(state, { type: 'setPerson', person: 'grandparents' })
    expect(step(state)).toBe('practise')
  })
})

describe('rollover', () => {
  it('restarts a mission that was completed on an earlier day, keeping history', () => {
    const state = rollover(run(onboarded(), reflect('awkward', YESTERDAY)), NOW)
    expect(step(state)).toBe('learn')
    expect(state.history).toHaveLength(1)
  })

  it('leaves a mission completed today as done', () => {
    expect(step(rollover(run(onboarded(), reflect('natural')), NOW))).toBe('done')
  })

  it('keeps an accepted challenge from an earlier day open', () => {
    const state = rollover(run(onboarded(), { type: 'acceptChallenge', when: 'today' }, reflect('no-chance', YESTERDAY)), NOW)
    expect(step(state)).toBe('reflect')
  })
})

describe('restore', () => {
  it('brings back saved progress', () => {
    const saved = JSON.stringify(run(onboarded(), { type: 'markLearned' }))
    expect(step(restore(saved, NOW))).toBe('practise')
  })

  it.each([['not json'], ['{"v":999}'], [null], ['null']])('starts fresh from unusable saved data %s', (raw) => {
    expect(restore(raw, NOW)).toEqual(initialState)
  })
})

describe('cheering a friend', () => {
  it('toggles on and off', () => {
    const once = reducer(initialState, { type: 'toggleCheer', friendId: 'weiling' })
    expect(once.cheered.weiling).toBe(true)
    expect(reducer(once, { type: 'toggleCheer', friendId: 'weiling' }).cheered.weiling).toBeFalsy()
  })
})

describe('loading a sample week', () => {
  const todays = { id: 't', at: AT, person: 'grandparents', dialect: 'hokkien', outcome: 'natural', note: '' }
  const old = { id: 'old', at: new Date(2026, 8, 20, 12).toISOString(), person: 'hawker', dialect: 'hokkien', outcome: 'forgot', note: '' }
  const state = reducer(
    { ...onboarded(), history: [todays, old], practices: [{ at: AT, person: 'grandparents', dialect: 'hokkien' }] },
    { type: 'loadSample', now: NOW },
  )
  const sample = state.history.filter((h) => h.id !== 't')

  it("keeps today's own entries and replaces older ones", () => {
    expect(state.history).toContainEqual(todays)
    expect(state.history.some((h) => h.id === 'old')).toBe(false)
    expect(state.practices).toContainEqual({ at: AT, person: 'grandparents', dialect: 'hokkien' })
  })

  it('adds sample reflections only on earlier days, in the current dialect', () => {
    expect(sample.length).toBeGreaterThan(0)
    expect(sample.every((h) => dayKey(new Date(h.at)) < dayKey(NOW))).toBe(true)
    expect(sample.every((h) => h.dialect === 'hokkien')).toBe(true)
  })
})

describe('reset', () => {
  it('returns to onboarding with no history', () => {
    const state = reducer(run(onboarded(), reflect('natural')), { type: 'reset' })
    expect(state.profile).toEqual({ dialect: null, person: null })
    expect(state.history).toEqual([])
  })
})
