import { addDays } from '../lib/logic.js'

// A believable past week for demos: a mix of outcomes and people, one check-in per day.
const PLAN = [
  { daysAgo: 6, person: 'grandparents', outcome: 'natural', note: 'Ah Ma laughed and answered me in dialect!' },
  { daysAgo: 5, person: 'hawker', outcome: 'awkward', note: 'Uncle replied in Mandarin, but I still got my kopi.' },
  { daysAgo: 4, person: 'hawker', outcome: 'no-chance', note: '' },
  { daysAgo: 3, person: 'grandparents', outcome: 'forgot', note: 'Blanked halfway. Peeked at the pocket card after.' },
  { daysAgo: 2, person: 'neighbours', outcome: 'natural', note: 'Ah Pek chatted for ten minutes about the old kampung.' },
  { daysAgo: 1, person: 'relatives', outcome: 'awkward', note: 'Auntie was surprised, in a good way.' },
]
const PRACTICE_DAYS = [6, 6, 5, 3, 3, 2, 1]

export function sampleWeek(now, dialect) {
  const at = (daysAgo, hour) => {
    const date = addDays(now, -daysAgo)
    date.setHours(hour)
    return date.toISOString()
  }
  const personOn = (daysAgo) => PLAN.find((p) => p.daysAgo === daysAgo)?.person ?? 'grandparents'

  return {
    history: PLAN.map((p, i) => ({
      id: `sample-${i}`,
      at: at(p.daysAgo, 19),
      person: p.person,
      dialect,
      outcome: p.outcome,
      note: p.note,
    })),
    practices: PRACTICE_DAYS.map((daysAgo, i) => ({ at: at(daysAgo, 12 + (i % 3)), person: personOn(daysAgo), dialect })),
  }
}
