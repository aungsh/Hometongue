import { Volume2 } from 'lucide-react'
import { useNavigate } from '@/lib/useNavigate.js'
import { useApp, useMission } from '../../state/AppState.jsx'
import AppScreen from '../../components/AppScreen.jsx'
import Bubble from '../../components/Bubble.jsx'
import AskAuntie from '../../components/AskAuntie.jsx'
import CoachSay from '../../components/CoachSay.jsx'
import { phraseSource } from '@/lib/audioSources.js'
import Tile from '../../components/Tile.jsx'

function audioHint(dialect, recorded, total) {
  if (recorded === total) return 'Tap the speaker on any line to listen.'
  if (dialect.id === 'cantonese') {
    return 'Tap a speaker to listen. Lines without a recording use your phone’s Cantonese voice, if it has one.'
  }
  if (recorded === 0) return `No ${dialect.name} recordings yet, so the speakers are switched off.`
  return 'Some lines don’t have a recording yet. Those speakers are switched off.'
}

/** Phrasebook: the mission's mini conversation with audio, a coach intro and a culture note. */
export default function Learn() {
  const navigate = useNavigate()
  const { dispatch } = useApp()
  const { mission, missionId, dialect, person, partnerSprite } = useMission()
  if (!mission || !dialect || !person) return null
  const sources = mission.lines.map((line, i) => phraseSource(dialect.id, missionId, i, line.zh))
  const recorded = sources.filter((source) => source.src).length

  const done = () => {
    dispatch({ type: 'markLearned', missionId })
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

      <CoachSay category="learn" seed={`${person.id}:${dialect.id}`} />

      <div className="dialogue">
        {mission.lines.map((line, i) => (
          <Bubble
            key={line.say}
            line={line}
            source={sources[i]}
            partner={mission.partner}
            partnerSprite={partnerSprite}
            lang={dialect.lang}
          />
        ))}
      </div>
      <p className="hint">
        <Volume2 size={14} aria-hidden="true" />
        {audioHint(dialect, recorded, sources.length)}
      </p>

      <aside className="note tile-card">
        <Tile glyph="礼" size="md" tone="jade" />
        <div>
          <p className="note__title">Culture note</p>
          <p>{mission.culture}</p>
        </div>
      </aside>

      <AskAuntie />

      <p className="fineprint">
        Phrases are pending native-speaker review. “Say it like” spellings are approximate.
      </p>
    </AppScreen>
  )
}
