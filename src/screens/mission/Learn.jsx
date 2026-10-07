import { Volume2 } from 'lucide-react'
import { navigate } from '../../router.js'
import { useApp, useMission } from '../../state/AppState.jsx'
import AppScreen from '../../components/AppScreen.jsx'
import Bubble from '../../components/Bubble.jsx'
import Tile from '../../components/Tile.jsx'

/** Phrasebook: the mission's mini conversation, with placeholder audio and a culture note. */
export default function Learn() {
  const { dispatch } = useApp()
  const { mission, dialect, partnerSprite } = useMission()

  const done = () => {
    dispatch({ type: 'markLearned' })
    navigate('/mission')
  }

  return (
    <AppScreen
      app="learn"
      footer={
        <button type="button" className="btn btn--primary btn--block" onClick={done}>
          Done learning
        </button>
      }
    >
      <div className="stack stack--xs">
        <p className="eyebrow">
          {dialect.name} · {mission.minutes} min
        </p>
        <h1 className="title">{mission.title}</h1>
        <p className="muted">{mission.scenario}</p>
      </div>

      <div className="dialogue">
        {mission.lines.map((line) => (
          <Bubble
            key={line.say}
            line={line}
            partner={mission.partner}
            partnerSprite={partnerSprite}
            lang={dialect.lang}
          />
        ))}
      </div>
      <p className="hint">
        <Volume2 size={14} aria-hidden="true" />
        Audio is a placeholder for native-speaker recordings.
      </p>

      <aside className="note tile-card">
        <Tile glyph="礼" size="md" tone="jade" />
        <div>
          <p className="note__title">Culture note</p>
          <p>{mission.culture}</p>
        </div>
      </aside>

      <p className="fineprint">
        Prototype phrases, pending native-speaker review. “Say it like” spellings are approximate.
      </p>
    </AppScreen>
  )
}
