import { describe, it, expect } from 'vitest'
import {
  appStatus,
  suggestedApp,
  todaysMissionId,
  dayKey,
  startOfWeek,
  computeStreak,
  weekSummary,
  questProgress,
  nextStep,
  journeyStage,
  weekDays,
} from './logic.js'

// Thursday 1 Oct 2026, 3pm local time. Its week runs Mon 28 Sep – Sun 4 Oct.
const NOW = new Date(2026, 9, 1, 15, 0)
const at = (month, day, hour = 12) => new Date(2026, month - 1, day, hour).toISOString()
const reflection = (when, outcome, person = 'grandparents') => ({
  id: `${when}-${outcome}`,
  at: when,
  person,
  dialect: 'hokkien',
  outcome,
  note: '',
})

describe('dayKey', () => {
  it('uses the local calendar day, not the UTC one', () => {
    expect(dayKey(new Date(2026, 0, 5, 0, 30))).toBe('2026-01-05')
    expect(dayKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})

describe('startOfWeek', () => {
  it('returns Monday at midnight for a mid-week day', () => {
    const start = startOfWeek(NOW)
    expect(dayKey(start)).toBe('2026-09-28')
    expect([start.getHours(), start.getMinutes()]).toEqual([0, 0])
  })

  it('treats Sunday as the end of the week, not the start', () => {
    expect(dayKey(startOfWeek(new Date(2026, 9, 4, 10)))).toBe('2026-09-28')
  })
})

describe('computeStreak', () => {
  it('is 0 with no check-ins', () => {
    expect(computeStreak([], NOW)).toBe(0)
  })

  it('counts consecutive check-in days ending today, whatever the outcome', () => {
    const history = [
      reflection(at(10, 1), 'natural'),
      reflection(at(9, 30), 'no-chance'),
      reflection(at(9, 29), 'forgot'),
    ]
    expect(computeStreak(history, NOW)).toBe(3)
  })

  it("keeps yesterday's streak alive before today's check-in", () => {
    const history = [reflection(at(9, 30), 'awkward'), reflection(at(9, 29), 'natural')]
    expect(computeStreak(history, NOW)).toBe(2)
  })

  it('stops counting at the first missed day', () => {
    const history = [reflection(at(10, 1), 'natural'), reflection(at(9, 29), 'natural')]
    expect(computeStreak(history, NOW)).toBe(1)
  })

  it('counts several check-ins on the same day once', () => {
    const history = [reflection(at(10, 1, 9), 'forgot'), reflection(at(10, 1, 18), 'natural')]
    expect(computeStreak(history, NOW)).toBe(1)
  })

  it('is 0 once a whole day has been missed', () => {
    expect(computeStreak([reflection(at(9, 29), 'natural')], NOW)).toBe(0)
  })
})

describe('weekSummary', () => {
  const history = [
    reflection(at(9, 27), 'natural', 'hawker'), // previous week's Sunday
    reflection(at(9, 28), 'natural', 'grandparents'),
    reflection(at(9, 29), 'awkward', 'hawker'),
    reflection(at(9, 29, 20), 'forgot', 'neighbours'),
    reflection(at(10, 1), 'no-chance', 'relatives'),
  ]
  const practices = [{ at: at(9, 27) }, { at: at(9, 28) }, { at: at(10, 1) }]
  const summary = weekSummary(history, practices, NOW)

  it('counts only natural and awkward reflections from this week as real conversations', () => {
    expect(summary.conversations).toBe(2)
  })

  it('counts the different people from real conversations only', () => {
    expect(summary.people).toBe(2)
  })

  it('counts days with any reflection as check-in days', () => {
    expect(summary.checkInDays).toBe(3)
  })

  it("counts only this week's practice takes", () => {
    expect(summary.practices).toBe(2)
  })
})

describe('questProgress', () => {
  const quests = [
    { id: 'talk', metric: 'conversations', target: 3 },
    { id: 'people', metric: 'people', target: 2 },
  ]

  it('reports progress against each target and marks reached quests done', () => {
    const result = questProgress(quests, { conversations: 1, people: 2 })
    expect(result.map((q) => [q.id, q.value, q.done])).toEqual([
      ['talk', 1, false],
      ['people', 2, true],
    ])
  })

  it('caps the shown value at the target', () => {
    expect(questProgress(quests, { conversations: 5, people: 0 })[0].value).toBe(3)
  })
})

describe('nextStep', () => {
  it.each([
    [undefined, 'learn'],
    [{ learned: true }, 'practise'],
    [{ learned: true, practised: true }, 'challenge'],
    [{ learned: true, practised: true, accepted: true }, 'reflect'],
    [{ learned: true, practised: true, accepted: true, completedAt: at(10, 1) }, 'done'],
    [{ completedAt: at(10, 1) }, 'done'],
  ])('%o → %s', (entry, step) => {
    expect(nextStep(entry)).toBe(step)
  })
})

describe('appStatus', () => {
  it('marks each mission app from its own progress, whatever the order', () => {
    expect(appStatus({ practised: true, accepted: true })).toEqual({
      learn: 'todo',
      practise: 'done',
      challenge: 'done',
      reflect: 'todo',
    })
  })

  it('treats a missing entry as nothing done yet', () => {
    expect(appStatus(undefined)).toEqual({ learn: 'todo', practise: 'todo', challenge: 'todo', reflect: 'todo' })
  })

  it('marks Reflect done once a real conversation is logged', () => {
    expect(appStatus({ completedAt: at(10, 1), lastOutcome: 'awkward' }).reflect).toBe('done')
  })

  it('invites another go at Reflect after forgetting the phrase or having no chance', () => {
    expect(appStatus({ accepted: true, lastOutcome: 'forgot' }).reflect).toBe('retry')
    expect(appStatus({ accepted: true, lastOutcome: 'no-chance' }).reflect).toBe('retry')
  })
})

describe('suggestedApp', () => {
  it.each([
    [undefined, 'learn'],
    [{ learned: true }, 'practise'],
    [{ practised: true }, 'learn'],
    [{ learned: true, practised: true }, 'challenge'],
    [{ accepted: true }, 'reflect'],
    [{ completedAt: at(10, 1) }, null],
  ])('%o → %s', (entry, app) => {
    expect(suggestedApp(entry)).toBe(app)
  })
})

describe('journeyStage', () => {
  const stages = [
    { min: 0, name: 'Listener' },
    { min: 1, name: 'First words' },
    { min: 5, name: 'Regular' },
  ]

  it('places a count in the highest stage it has reached', () => {
    expect(journeyStage(4, stages).stage.name).toBe('First words')
  })

  it('treats reaching the exact threshold as entering the stage', () => {
    expect(journeyStage(5, stages).stage.name).toBe('Regular')
  })

  it('says how many more conversations reach the next stage', () => {
    const result = journeyStage(2, stages)
    expect([result.next.name, result.toNext]).toEqual(['Regular', 3])
  })

  it('has no next stage at the top', () => {
    const result = journeyStage(9, stages)
    expect([result.stage.name, result.next, result.toNext]).toEqual(['Regular', null, 0])
  })
})

describe('weekDays', () => {
  const history = [
    reflection(at(9, 29), 'awkward'),
    reflection(at(9, 29, 19), 'forgot'),
    reflection(at(10, 1), 'natural'),
  ]
  const days = weekDays(history, NOW)

  it('lists Monday to Sunday of the current week', () => {
    expect(days.map((d) => d.key)).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ])
  })

  it('flags today and marks the days after it as future', () => {
    expect(days.map((d) => (d.isToday ? 'T' : d.isFuture ? 'F' : '-')).join('')).toBe('---TFFF')
  })

  it('counts real conversations and any check-ins per day', () => {
    expect(days.map((d) => d.conversations)).toEqual([0, 1, 0, 1, 0, 0, 0])
    expect(days.map((d) => d.checkedIn)).toEqual([false, true, false, true, false, false, false])
  })
})

describe('todaysMissionId', () => {
  const ids = ['a', 'b', 'c']
  const who = { person: 'hawker', dialect: 'hokkien' }
  const NOW = new Date(2026, 9, 7, 15, 0)
  const entry = (daysAgo, outcome = 'natural', over = {}) => ({
    at: new Date(2026, 9, 7 - daysAgo, 12).toISOString(),
    person: 'hawker',
    dialect: 'hokkien',
    outcome,
    ...over,
  })

  it('starts on the first mission', () => {
    expect(todaysMissionId(ids, [], who, NOW)).toBe('a')
  })

  it('stays on the same mission for the rest of the day you complete it', () => {
    expect(todaysMissionId(ids, [entry(0)], who, NOW)).toBe('a')
  })

  it('moves on the day after a real conversation', () => {
    expect(todaysMissionId(ids, [entry(1)], who, NOW)).toBe('b')
    expect(todaysMissionId(ids, [entry(1, 'awkward')], who, NOW)).toBe('b')
  })

  it('does not move on after forgetting or having no chance', () => {
    expect(todaysMissionId(ids, [entry(1, 'forgot'), entry(2, 'no-chance')], who, NOW)).toBe('a')
  })

  it('counts a day once however many conversations it had', () => {
    expect(todaysMissionId(ids, [entry(1), entry(1)], who, NOW)).toBe('b')
  })

  it('only counts this person and dialect', () => {
    const others = [entry(1, 'natural', { person: 'grandparents' }), entry(2, 'natural', { dialect: 'teochew' })]
    expect(todaysMissionId(ids, others, who, NOW)).toBe('a')
  })

  it('starts over after the last mission', () => {
    expect(todaysMissionId(ids, [entry(1), entry(2), entry(3)], who, NOW)).toBe('a')
    expect(todaysMissionId(ids, [entry(1), entry(2), entry(3), entry(4)], who, NOW)).toBe('b')
  })
})
