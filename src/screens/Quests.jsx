import Link from 'next/link'
import { Check } from 'lucide-react'
import { useApp } from '../state/AppState.jsx'
import { addDays, questProgress, startOfWeek, weekSummary } from '../lib/logic.js'
import { QUESTS } from '../data/catalog.js'
import Tile from '../components/Tile.jsx'

const SHORT = new Intl.DateTimeFormat('en-SG', { day: 'numeric', month: 'short' })

/** Progress as a row of tiles: face up for each step reached, face down for the rest. */
function TileSlots({ quest }) {
  return (
    <span
      className="slots"
      role="progressbar"
      aria-label={quest.title}
      aria-valuemin={0}
      aria-valuemax={quest.target}
      aria-valuenow={quest.value}
    >
      {Array.from({ length: quest.target }, (_, i) => (
        <Tile key={i} glyph={quest.glyph} size="xs" tone={quest.done ? 'jade' : 'accent'} down={i >= quest.value} />
      ))}
    </span>
  )
}

export default function Quests() {
  const { state } = useApp()
  const now = new Date()
  const quests = questProgress(QUESTS, weekSummary(state.history, state.practices, now))
  const doneCount = quests.filter((q) => q.done).length
  const monday = startOfWeek(now)

  return (
    <div className="screen screen--tab">
      <header className="stack stack--xs">
        <p className="eyebrow">
          {SHORT.format(monday)} – {SHORT.format(addDays(monday, 6))} · resets Monday
        </p>
        <h1 className="title">Weekly quests</h1>
      </header>

      <section className="card tile-card quest-summary">
        <div>
          <p className="quest-summary__value">
            {doneCount} <span>of {quests.length}</span>
          </p>
          <p className="muted">quests complete this week</p>
        </div>
        <div className="quest-summary__hand" aria-hidden="true">
          {quests.map((q) => (
            <Tile key={q.id} glyph={q.glyph} size="sm" tone="jade" down={!q.done} />
          ))}
        </div>
      </section>

      <ul className="quest-list">
        {quests.map((q) => (
          <li key={q.id} className={`card tile-card quest${q.done ? ' is-done' : ''}`}>
            <Tile glyph={q.glyph} size="md" tone={q.done ? 'jade' : 'accent'} />
            <div className="quest__body">
              <div className="quest__row">
                <p className="quest__title">{q.title}</p>
                <span className="quest__count">
                  {q.done ? (
                    <>
                      <Check size={14} strokeWidth={3} aria-hidden="true" /> Done
                    </>
                  ) : (
                    `${q.value}/${q.target}`
                  )}
                </span>
              </div>
              <p className="quest__detail">{q.detail}</p>
              <TileSlots quest={q} />
              <p className="quest__reward">
                {q.done ? `${q.badgeName} badge earned` : `Earns the ${q.badgeName} badge`}
              </p>
              {q.link && !q.done && (
                <Link className="link" href={q.link.to}>
                  {q.link.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="footnote">Quests are gentle goals. Miss one and nothing is lost.</p>
    </div>
  )
}
