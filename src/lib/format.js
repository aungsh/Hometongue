import { addDays } from './logic.js'

const SHORT_DATE = new Intl.DateTimeFormat('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })
const DAY_MS = 24 * 60 * 60 * 1000

/** "Today", "Yesterday", or a short date like "Mon, 28 Sep". */
export function relativeDay(date, now) {
  const daysAgo = Math.round((addDays(now, 0) - addDays(date, 0)) / DAY_MS)
  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  return SHORT_DATE.format(date)
}

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`
