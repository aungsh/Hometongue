import { useEffect, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { navigate } from '../router.js'
import { useApp } from '../state/AppState.jsx'
import { isRealConversation, journeyStage, weekDays, weekSummary } from '../lib/logic.js'
import { plural, relativeDay } from '../lib/format.js'
import { DIALECTS, OUTCOMES, PEOPLE, STAGES, outcomeById } from '../data/catalog.js'
import { getMission } from '../data/missions.js'
import WeekChart from '../components/WeekChart.jsx'
import Pixel from '../components/Pixel.jsx'
import Tile from '../components/Tile.jsx'

const OUTCOME_TONE = { natural: 'jade', awkward: 'red', forgot: 'blue', 'no-chance': 'ink' }

function Journey({ total }) {
  const { index, next, toNext } = journeyStage(total, STAGES)
  return (
    <section className="card tile-card stack stack--sm" aria-labelledby="journey-title">
      <h2 className="section-title" id="journey-title">
        From understanding to speaking
      </h2>
      <ol className="ladder">
        {STAGES.map((stage, i) => (
          <li key={stage.name} className={i < index ? 'is-done' : i === index ? 'is-current' : undefined}>
            <Tile glyph={stage.glyph} size="sm" tone="accent" down={i > index} className="ladder__tile" />
            <div>
              <p className="ladder__name">
                {stage.name}
                {i === index && <span className="pill">You’re here</span>}
              </p>
              {i === index && <p className="ladder__blurb">{stage.blurb}</p>}
            </div>
            <span className="ladder__min">{stage.min === 0 ? 'Start' : `${stage.min}+`}</span>
          </li>
        ))}
      </ol>
      <p className="journey__next">
        {next
          ? `${plural(toNext, 'more real conversation')} to reach ${next.name}`
          : 'You’ve reached the top. Keep the language alive!'}
      </p>
    </section>
  )
}

function PrototypeControls() {
  const { dispatch, showToast } = useApp()
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return undefined
    const timer = setTimeout(() => setConfirming(false), 4000)
    return () => clearTimeout(timer)
  }, [confirming])

  const loadSample = () => {
    dispatch({ type: 'loadSample', now: new Date() })
    showToast('Sample week loaded')
  }

  const reset = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    dispatch({ type: 'reset' })
    navigate('/onboarding', { replace: true })
  }

  return (
    <section className="card controls" aria-labelledby="controls-title">
      <h2 className="section-title" id="controls-title">
        <FlaskConical size={16} aria-hidden="true" />
        Prototype controls
      </h2>
      <p className="muted">For demos and testing. Everything stays in this browser.</p>
      <div className="controls__row">
        <button type="button" className="btn btn--secondary btn--small" onClick={loadSample}>
          Load a sample week
        </button>
        <button
          type="button"
          className={`btn btn--small ${confirming ? 'btn--danger' : 'btn--secondary'}`}
          onClick={reset}
        >
          {confirming ? 'Tap again to reset' : 'Reset prototype'}
        </button>
      </div>
    </section>
  )
}

export default function Progress() {
  const { state } = useApp()
  const now = new Date()
  const real = state.history.filter((h) => isRealConversation(h.outcome))
  const week = weekSummary(state.history, state.practices, now)
  const outcomes = OUTCOMES.map((o) => ({ ...o, count: state.history.filter((h) => h.outcome === o.id).length }))
  const people = Object.values(PEOPLE).map((p) => ({ ...p, count: real.filter((h) => h.person === p.id).length }))
  const recent = state.history.slice(-6).reverse()

  return (
    <div className="screen screen--tab">
      <h1 className="title">Your progress</h1>

      <section className="card tile-card hero" aria-label="Real conversations">
        <p className="hero__label">Real conversations</p>
        <p className="hero__value">{real.length}</p>
        <p className="muted">
          {week.conversations} this week · {plural(state.history.length, 'check-in')} in total
        </p>
        {real.length === 0 && (
          <a className="btn btn--primary btn--small" href="#/today">
            Go to today’s mission
          </a>
        )}
      </section>

      <Journey total={real.length} />

      <section className="card tile-card stack stack--sm" aria-labelledby="week-title">
        <h2 className="section-title" id="week-title">
          Real conversations this week
        </h2>
        <WeekChart days={weekDays(state.history, now)} />
      </section>

      <section className="card tile-card stack stack--sm" aria-labelledby="mix-title">
        <h2 className="section-title" id="mix-title">
          How your check-ins went
        </h2>
        <ul className="rows">
          {outcomes.map((o) => (
            <li key={o.id} className={o.count === 0 ? 'is-zero' : undefined}>
              <Tile glyph={o.glyph} size="xs" tone={OUTCOME_TONE[o.id]} />
              <span>{o.label}</span>
              <b>{o.count}</b>
            </li>
          ))}
        </ul>
        <p className="fineprint">Natural and awkward both count as real conversations.</p>
      </section>

      <section className="card tile-card stack stack--sm" aria-labelledby="people-title">
        <h2 className="section-title" id="people-title">
          Who you’ve talked with
        </h2>
        <ul className="rows">
          {people.map((p) => (
            <li key={p.id} className={p.count === 0 ? 'is-zero' : undefined}>
              <Pixel sprite={p.sprite} scale={2} />
              <span>{p.name}</span>
              <b>{p.count}</b>
            </li>
          ))}
        </ul>
      </section>

      <section className="stack stack--sm" aria-labelledby="recent-title">
        <h2 className="section-title" id="recent-title">
          Recent check-ins
        </h2>
        {recent.length === 0 ? (
          <p className="empty">No check-ins yet. Your first one is a mission away.</p>
        ) : (
          <ul className="log">
            {recent.map((h) => {
              const outcome = outcomeById(h.outcome)
              return (
                <li key={h.id} className="log__item tile-card">
                  <Tile glyph={outcome.glyph} size="sm" tone={OUTCOME_TONE[outcome.id]} />
                  <div>
                    <p className="log__title">{getMission(h.person, h.dialect).title}</p>
                    <p className="log__meta">
                      {outcome.label} · {DIALECTS[h.dialect].name} · {relativeDay(new Date(h.at), now)}
                    </p>
                    {h.note && <p className="log__note">“{h.note}”</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <PrototypeControls />
    </div>
  )
}
