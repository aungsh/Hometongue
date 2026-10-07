import { useState } from 'react'
import { Flame, UserPlus } from 'lucide-react'
import { useApp } from '../state/AppState.jsx'
import { computeStreak, weekDays, weekSummary } from '../lib/logic.js'
import { plural } from '../lib/format.js'
import { DIALECTS, WEEKDAY_GLYPHS } from '../data/catalog.js'
import { FRIENDS } from '../data/friends.js'
import Pixel from '../components/Pixel.jsx'
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

export default function Friends() {
  const { state, dispatch, showToast } = useApp()
  const [nudged, setNudged] = useState({})
  const now = new Date()
  const streak = computeStreak(state.history, now)
  const days = weekDays(state.history, now)
  const checkedInToday = days.some((d) => d.isToday && d.checkedIn)
  const week = weekSummary(state.history, state.practices, now)
  const myDialect = state.profile.dialect

  const cheer = (friend) => {
    const cheered = Boolean(state.cheered[friend.id])
    dispatch({ type: 'toggleCheer', friendId: friend.id })
    if (!cheered) showToast(`You cheered ${friend.name} on 👏`)
  }

  const nudge = (friend) => {
    setNudged((n) => ({ ...n, [friend.id]: true }))
    showToast(`Sent ${friend.name} a gentle nudge`)
  }

  return (
    <div className="screen screen--tab">
      <h1 className="title">Friends & streaks</h1>

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

      <section className="stack stack--sm">
        <div className="section-head">
          <h2 className="section-title">Your circle</h2>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => showToast('Invites aren’t live in this prototype')}
          >
            <UserPlus size={16} aria-hidden="true" />
            Invite
          </button>
        </div>

        <ul className="card tile-card friends">
          <li className="friend friend--you" data-dialect={myDialect}>
            <span className="avatar" aria-hidden="true">
              <Pixel sprite="you" scale={2} motion="bob" />
            </span>
            <div className="friend__body">
              <p className="friend__name">
                You <span className="tag">{DIALECTS[myDialect].name}</span>
              </p>
              <p className="friend__activity">{plural(week.conversations, 'real conversation')} this week</p>
            </div>
            <span className="friend__streak" aria-label={`${streak}-day streak`}>
              <Flame size={14} aria-hidden="true" />
              {streak}
            </span>
          </li>

          {FRIENDS.map((friend) => {
            const cheered = Boolean(state.cheered[friend.id])
            return (
              <li key={friend.id} className="friend" data-dialect={friend.dialect}>
                <span className="avatar" aria-hidden="true">
                  <Pixel sprite={friend.sprite} scale={2} motion={friend.quiet ? 'still' : 'bob'} />
                </span>
                <div className="friend__body">
                  <p className="friend__name">
                    {friend.name} <span className="tag">{DIALECTS[friend.dialect].name}</span>
                  </p>
                  <p className="friend__activity">
                    {friend.activity}
                    {friend.when && ` · ${friend.when}`}
                  </p>
                </div>
                <div className="friend__side">
                  <span className="friend__streak" aria-label={`${friend.streak}-day streak`}>
                    <Flame size={14} aria-hidden="true" />
                    {friend.streak}
                  </span>
                  {friend.quiet ? (
                    <button
                      type="button"
                      className="btn btn--secondary btn--small"
                      disabled={nudged[friend.id]}
                      onClick={() => nudge(friend)}
                    >
                      {nudged[friend.id] ? 'Nudged' : 'Nudge'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`btn btn--small ${cheered ? 'btn--soft' : 'btn--secondary'}`}
                      aria-pressed={cheered}
                      onClick={() => cheer(friend)}
                    >
                      {cheered ? 'Cheered' : 'Cheer'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="footnote">No rankings here. Just friends keeping each other going.</p>
    </div>
  )
}
