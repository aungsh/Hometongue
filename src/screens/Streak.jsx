import { Flame, UserPlus } from 'lucide-react'
import { shareOrCopy } from '@/lib/share.js'
import { useApp } from '../state/AppState.jsx'
import { computeStreak, weekDays } from '../lib/logic.js'
import { WEEKDAY_GLYPHS } from '../data/catalog.js'
import Tile from '../components/Tile.jsx'

const FULL_DAY = new Intl.DateTimeFormat('en-SG', { weekday: 'long' })

function dotClass(day) {
  return [day.checkedIn && 'is-checked', day.isToday && 'is-today', day.isFuture && 'is-future']
    .filter(Boolean)
    .join(' ')
}

function streakMessage(streak, checkedInToday) {
  if (streak === 0) return 'Reflect on any mission to start your streak.'
  if (checkedInToday) return 'You’ve checked in today. Nice.'
  return 'Check in today to keep it going.'
}

export default function Streak() {
  const { state, showToast } = useApp()
  const now = new Date()
  const streak = computeStreak(state.history, now)
  const days = weekDays(state.history, now)
  const checkedInToday = days.some((d) => d.isToday && d.checkedIn)

  const invite = async () => {
    const result = await shareOrCopy({
      text: 'I’m learning to speak dialect with Hometongue, one small conversation a day. Join me?',
      url: window.location.origin,
    })
    if (result === 'copied') showToast('Invite copied. Paste it to a friend!')
    if (result === 'failed') showToast('Couldn’t share from this browser')
  }

  return (
    <div className="screen screen--tab">
      <h1 className="title">Your streak</h1>

      <section className="card tile-card streak" aria-label="Your streak">
        <div className="streak__top">
          <span className="streak__flame">
            <Flame size={28} aria-hidden="true" />
          </span>
          <div>
            <p className="streak__value">
              {streak} <span>day streak</span>
            </p>
            <p className="muted">{streakMessage(streak, checkedInToday)}</p>
          </div>
        </div>
        <ol className="week-tiles" aria-label="Check-ins this week">
          {days.map((d, i) => (
            <li
              key={d.key}
              className={dotClass(d)}
              aria-label={`${FULL_DAY.format(d.date)}: ${d.checkedIn ? 'checked in' : d.isFuture ? 'upcoming' : 'no check-in'}`}
            >
              <Tile glyph={WEEKDAY_GLYPHS[i]} size="sm" tone={d.checkedIn ? 'accent' : 'ink'} down={d.isFuture} />
              <span className="week-tiles__mark" aria-hidden="true">
                {d.isToday ? 'Today' : d.checkedIn ? '✓' : ''}
              </span>
            </li>
          ))}
        </ol>
        <p className="fineprint">Any reflection keeps your streak, even “No opportunity”.</p>
      </section>

      <section className="card tile-card stack stack--sm" aria-labelledby="invite-title">
        <h2 className="section-title" id="invite-title">
          Learn together
        </h2>
        <p className="muted">
          Everyone’s streak is their own, kept on their own phone. Send the app to a friend or cousin who also
          understands more than they speak.
        </p>
        <button type="button" className="btn btn--secondary btn--small" onClick={invite}>
          <UserPlus size={16} aria-hidden="true" />
          Invite a friend
        </button>
      </section>

      <p className="footnote">No rankings here. Just you and your own small steps.</p>
    </div>
  )
}
