import { ArrowRight, CircleCheck, Flame } from 'lucide-react'
import { navigate } from '../router.js'
import { useApp, useMission } from '../state/AppState.jsx'
import { computeStreak, isRealConversation, questProgress, weekSummary } from '../lib/logic.js'
import { MISSION_APPS, QUESTS, WHEN_OPTIONS, outcomeById } from '../data/catalog.js'
import Art from '../components/Art.jsx'
import Scene from '../components/Scene.jsx'
import Tile from '../components/Tile.jsx'

function greeting(now) {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/** What the mission card says and where its buttons go, for where the mission is up to. */
function cardContent({ mission, dialect, step, when, lastCheckIn }) {
  switch (step) {
    case 'learn':
      return {
        eyebrow: `Daily mission · ${mission.minutes} min`,
        text: mission.scenario,
        primary: { label: 'Open mission', to: '/mission' },
      }
    case 'practise':
    case 'challenge':
      return { eyebrow: 'In progress', text: mission.scenario, primary: { label: 'Continue mission', to: '/mission' } }
    case 'reflect': {
      const missed = lastCheckIn && !isRealConversation(lastCheckIn.outcome)
      return {
        eyebrow: when ? `Out in the wild · ${when}` : 'Out in the wild',
        text: missed
          ? `Last check-in: ${outcomeById(lastCheckIn.outcome).label}. No stress. Try again when the moment comes.`
          : mission.challenge,
        primary: { label: 'How did it go?', to: '/mission/reflect' },
        secondary: { label: 'Open mission', to: '/mission' },
      }
    }
    default:
      return {
        eyebrow: 'Completed today',
        done: true,
        text: `You had a real conversation with ${mission.partnerRef} in ${dialect.name}. A new mission unlocks tomorrow.`,
        primary: { label: 'See my progress', to: '/progress' },
        secondary: { label: 'Open mission', to: '/mission' },
      }
  }
}

function MissionCard({ mission, dialect, entry, step, apps, lastCheckIn }) {
  const opener = mission.lines[0]
  const when = WHEN_OPTIONS.find((o) => o.id === entry?.when)?.label
  const content = cardContent({ mission, dialect, step, when, lastCheckIn })

  return (
    <article className="mission-card" aria-labelledby="mission-title">
      <Art variant="card" />
      <span className="mission-card__glyph" aria-hidden="true">
        {dialect.zh.charAt(0)}
      </span>
      <p className="mission-card__eyebrow">
        {content.done && <CircleCheck size={15} aria-hidden="true" />}
        {content.eyebrow}
      </p>
      <h2 className="mission-card__title" id="mission-title">
        {mission.title}
      </h2>
      <p className="mission-card__text">{content.text}</p>
      <div className="mission-card__phrase">
        <span className="mission-card__say">“{opener.say}”</span>
        <span className="mission-card__en">{opener.en}</span>
      </div>
      <ol className="mission-card__apps" aria-label="Mission apps">
        {MISSION_APPS.map((app) => {
          const done = apps[app.id] === 'done'
          return (
            <li key={app.id} className={done ? 'is-done' : undefined}>
              <Tile glyph={app.glyph} size="sm" tone="accent" down={!done} />
              {app.name}
              {done && <span className="sr-only"> (done)</span>}
            </li>
          )
        })}
      </ol>
      <div className="mission-card__actions">
        <button type="button" className="btn btn--on-accent btn--block" onClick={() => navigate(content.primary.to)}>
          {content.primary.label}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        {content.secondary && (
          <button
            type="button"
            className="btn btn--on-accent-ghost btn--block"
            onClick={() => navigate(content.secondary.to)}
          >
            {content.secondary.label}
          </button>
        )}
      </div>
    </article>
  )
}

export default function Today() {
  const { state } = useApp()
  const { mission, dialect, person, partnerSprite, entry, step, apps } = useMission()
  const now = new Date()
  const streak = computeStreak(state.history, now)
  const week = weekSummary(state.history, state.practices, now)
  const questsDone = questProgress(QUESTS, week).filter((q) => q.done).length
  const lastCheckIn = state.history.findLast((h) => h.person === person.id && h.dialect === dialect.id)

  return (
    <div className="screen screen--tab">
      <header className="today-head">
        <div>
          <p className="eyebrow">{greeting(now)}</p>
          <h1 className="title">Today’s mission</h1>
        </div>
        <a href="#/friends" className="streak-chip" aria-label={`${streak}-day streak. See friends and streaks`}>
          <Flame size={18} aria-hidden="true" />
          {streak}
        </a>
      </header>

      <button type="button" className="setup-chip" onClick={() => navigate('/setup')}>
        <span className="setup-chip__dot" aria-hidden="true" />
        <span>
          {dialect.name} · {person.name}
        </span>
        <span className="setup-chip__change">Change</span>
      </button>

      <Scene
        className="today-scene"
        height={124}
        cast={[
          { sprite: 'cat', motion: 'walk', at: '2%', walk: 16, scale: 3 },
          { sprite: 'you', motion: 'walk', at: '30%' },
          { sprite: partnerSprite, motion: 'wave', at: '62%' },
        ]}
      />

      <MissionCard
        mission={mission}
        dialect={dialect}
        entry={entry}
        step={step}
        apps={apps}
        lastCheckIn={lastCheckIn}
      />

      <section className="tiles" aria-label="This week">
        <a className="tile tile-card" href="#/progress">
          <span className="tile__label">Real conversations this week</span>
          <span className="tile__value">{week.conversations}</span>
        </a>
        <a className="tile tile-card" href="#/quests">
          <span className="tile__label">Weekly quests done</span>
          <span className="tile__value">
            {questsDone}
            <small>/{QUESTS.length}</small>
          </span>
        </a>
      </section>

      <section className="stack stack--sm">
        <h2 className="section-title">Coming up</h2>
        <ul className="upcoming">
          {mission.upcoming.map((title, i) => (
            <li key={title}>
              <Tile size="xs" down label="Not revealed yet" />
              <span>{title}</span>
              <span className="pill">{i === 0 ? 'Tomorrow' : 'Later this week'}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
