// Pure progress logic: streaks, weekly numbers, quests and mission steps.
// Everything works on the device's local calendar so "today" matches the user's day.

export const REAL_OUTCOMES = ['natural', 'awkward']
export const isRealConversation = (outcome) => REAL_OUTCOMES.includes(outcome)

const pad = (n) => String(n).padStart(2, '0')

/** 'YYYY-MM-DD' for the local calendar day of `date`. */
export function dayKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Midnight, `days` days after (or before) the local day of `date`. */
export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Monday 00:00 of the week containing `date`. Weeks run Monday to Sunday. */
export function startOfWeek(date) {
  const daysSinceMonday = (date.getDay() + 6) % 7
  return addDays(date, -daysSinceMonday)
}

const dayOf = (entry) => dayKey(new Date(entry.at))

/**
 * Consecutive days with at least one reflection (any outcome), ending today,
 * or ending yesterday if there is no check-in yet today.
 */
export function computeStreak(history, now) {
  const days = new Set(history.map(dayOf))
  let cursor = addDays(now, days.has(dayKey(now)) ? 0 : -1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

function inWeekOf(now) {
  const start = startOfWeek(now)
  const end = addDays(start, 7)
  return (entry) => {
    const time = new Date(entry.at)
    return time >= start && time < end
  }
}

/** This week's numbers, which the weekly quests are measured against. */
export function weekSummary(history, practices, now) {
  const inWeek = inWeekOf(now)
  const reflections = history.filter(inWeek)
  const real = reflections.filter((entry) => isRealConversation(entry.outcome))
  return {
    conversations: real.length,
    people: new Set(real.map((entry) => entry.person)).size,
    practices: practices.filter(inWeek).length,
    checkInDays: new Set(reflections.map(dayOf)).size,
  }
}

export function questProgress(quests, summary) {
  return quests.map((quest) => {
    const raw = summary[quest.metric] ?? 0
    return { ...quest, value: Math.min(raw, quest.target), done: raw >= quest.target }
  })
}

/** Where a mission is up to: learn → practise → challenge → reflect → done. */
export function nextStep(entry) {
  const e = entry ?? {}
  if (e.completedAt) return 'done'
  if (e.accepted) return 'reflect'
  if (e.practised) return 'challenge'
  if (e.learned) return 'practise'
  return 'learn'
}

/** The stage reached for a number of real conversations. `stages` ascend by `min`. */
export function journeyStage(count, stages) {
  let index = 0
  stages.forEach((stage, i) => {
    if (count >= stage.min) index = i
  })
  const next = stages[index + 1] ?? null
  return { index, stage: stages[index], next, toNext: next ? next.min - count : 0 }
}

/** Monday to Sunday of the current week, with conversations and check-ins per day. */
export function weekDays(history, now) {
  const start = startOfWeek(now)
  const todayKey = dayKey(now)
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i)
    const key = dayKey(date)
    const sameDay = history.filter((entry) => dayOf(entry) === key)
    return {
      key,
      date,
      isToday: key === todayKey,
      isFuture: key > todayKey,
      conversations: sameDay.filter((entry) => isRealConversation(entry.outcome)).length,
      checkedIn: sameDay.length > 0,
    }
  })
}

/** Done / to-do for each of the mission's four apps, which can be opened in any order. */
export function appStatus(entry) {
  const e = entry ?? {}
  const missed = Boolean(e.lastOutcome) && !isRealConversation(e.lastOutcome)
  return {
    learn: e.learned ? 'done' : 'todo',
    practise: e.practised ? 'done' : 'todo',
    challenge: e.accepted ? 'done' : 'todo',
    reflect: e.completedAt ? 'done' : missed ? 'retry' : 'todo',
  }
}

/** The app to suggest: Reflect once the challenge is out in the world, otherwise the first one not done. */
export function suggestedApp(entry) {
  const e = entry ?? {}
  if (e.completedAt) return null
  if (e.accepted) return 'reflect'
  if (!e.learned) return 'learn'
  if (!e.practised) return 'practise'
  return 'challenge'
}

/**
 * Which mission is today's. A person's missions run in order and move on one day after you
 * complete one: the count is how many earlier days had a real conversation with that person in
 * that dialect. Forgetting or finding no chance keeps the same mission open, and completing it
 * today keeps it on screen (as done) until tomorrow. After the last mission the list starts over.
 */
export function todaysMissionId(ids, history, { person, dialect }, now) {
  if (!Array.isArray(ids) || ids.length === 0) return null
  const today = dayKey(now)
  const completedDays = new Set(
    history
      .filter((h) => h.person === person && h.dialect === dialect && isRealConversation(h.outcome))
      .map(dayOf)
      .filter((day) => day < today),
  )
  return ids[completedDays.size % ids.length]
}
