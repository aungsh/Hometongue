import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@/lib/useNavigate.js'
import { useMission } from '../state/AppState.jsx'
import { MISSION_APPS } from '../data/catalog.js'
import Scene from '../components/Scene.jsx'
import Tile, { Seal } from '../components/Tile.jsx'

const STATUS_TEXT = { done: 'Done', retry: 'Try again when you can' }

/** The mission's home: four apps (Learn, Practise, Challenge, Reflect) to open in any order. */
export default function MissionHub() {
  const navigate = useNavigate()
  const { mission, dialect, partnerSprite, entry, apps, suggested } = useMission()
  if (!mission || !dialect) return null
  const opener = mission.lines[0]

  return (
    <div className="screen screen--hub">
      <header className="bar-head bar-head--hub">
        <button type="button" className="icon-btn" onClick={() => navigate('/today')} aria-label="Back to Today">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <p className="bar-head__title">Mission</p>
        <span className="tag">{dialect.name}</span>
      </header>

      <Scene
        className="hub-scene"
        height={176}
        cast={[
          { sprite: 'you', motion: 'talk', at: '24%' },
          { sprite: partnerSprite, motion: 'wave', at: '60%', flip: true },
        ]}
      >
        <span className="pixel-bubble hub-scene__bubble" aria-hidden="true">
          {opener.say}
        </span>
      </Scene>

      <div className="stack stack--xs">
        <p className="eyebrow">
          {dialect.name} · {mission.minutes} min
        </p>
        <h1 className="title">{mission.title}</h1>
        <p className="muted">{mission.scenario}</p>
      </div>

      {entry?.completedAt && (
        <div className="hub-done tile-card">
          <Seal glyph="完" />
          <div>
            <p className="hub-done__title">Mission complete</p>
            <p className="muted">You had a real conversation today. Open any app to keep practising.</p>
          </div>
        </div>
      )}

      <ul className="app-grid" aria-label="Mission apps">
        {MISSION_APPS.map((app) => {
          const status = apps[app.id]
          const isNext = suggested === app.id
          return (
            <li key={app.id}>
              <Link href={`/mission/${app.id}`} className={`app-tile tile-card${isNext ? ' is-next' : ''}`}>
                {isNext && <span className="app-tile__ribbon">Up next</span>}
                {status === 'done' && <Seal glyph="完" className="app-tile__seal" />}
                <Tile glyph={app.glyph} size="lg" tone="accent" />
                <span className="app-tile__name">{app.name}</span>
                <span className="app-tile__sub">{app.sub}</span>
                <span className={`app-tile__status app-tile__status--${status}`}>
                  {STATUS_TEXT[status] ?? app.blurb}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <p className="footnote">Open any app, in any order. There’s no wrong way round.</p>
    </div>
  )
}
