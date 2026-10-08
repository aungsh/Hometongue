import { useState } from 'react'
import { Heart, ShieldCheck, Smile } from 'lucide-react'
import { useNavigate } from '@/lib/useNavigate.js'
import { useApp, useMission } from '../../state/AppState.jsx'
import { WHEN_OPTIONS } from '../../data/catalog.js'
import AppScreen from '../../components/AppScreen.jsx'
import AudioButton from '../../components/AudioButton.jsx'
import { phraseSource } from '@/lib/audioSources.js'

export default function Challenge() {
  const navigate = useNavigate()
  const { dispatch, showToast } = useApp()
  const { mission, missionId, dialect, entry } = useMission()
  const [when, setWhen] = useState(entry?.when ?? WHEN_OPTIONS[0].id)
  if (!mission || !dialect) return null
  const [opener, reply, followUp] = mission.lines

  const accept = () => {
    dispatch({ type: 'acceptChallenge', missionId, when })
    showToast('Challenge accepted! Your pocket card is saved.')
    navigate('/mission')
  }

  return (
    <AppScreen
      app="challenge"
      footer={
        <>
          <button type="button" className="btn btn--primary btn--block" onClick={accept}>
            {entry?.accepted ? 'Save my plan' : 'Accept challenge'}
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate('/mission/reflect')}>
            Already did it? Reflect now
          </button>
        </>
      }
    >
      <div className="stack stack--xs">
        <p className="eyebrow">Real-world challenge</p>
        <h1 className="title">Now try it for real</h1>
        <p className="lead">{mission.challenge}</p>
      </div>

      <article className="pocket tile-card" aria-label="Pocket card">
        <div className="pocket__top">
          <span className="eyebrow">Pocket card</span>
          <AudioButton source={phraseSource(dialect.id, missionId, 0, opener.zh)} label="Play the opener" />
        </div>
        <p className="phrase-say">{opener.say}</p>
        <p className="phrase-zh" lang={dialect.lang}>
          {opener.zh}
        </p>
        <p className="phrase-en">{opener.en}</p>
        <div className="pocket__tear" aria-hidden="true" />
        <dl className="pocket__more">
          <div>
            <dt>They might say</dt>
            <dd>
              <b>{reply.say}</b> {reply.en}
            </dd>
          </div>
          <div>
            <dt>You reply</dt>
            <dd>
              <b>{followUp.say}</b> {followUp.en}
            </dd>
          </div>
        </dl>
      </article>

      <ul className="reassure">
        <li>
          <span className="reassure__icon">
            <Heart size={16} aria-hidden="true" />
          </span>
          One line counts. Mixing in English is fine.
        </li>
        <li>
          <span className="reassure__icon">
            <Smile size={16} aria-hidden="true" />
          </span>
          People usually light up when you try.
        </li>
        <li>
          <span className="reassure__icon">
            <ShieldCheck size={16} aria-hidden="true" />
          </span>
          No chance today? Just tell us. Your streak is safe.
        </li>
      </ul>

      <fieldset className="when">
        <legend className="section-title">When’s your chance?</legend>
        <div className="chips">
          {WHEN_OPTIONS.map((option) => (
            <label key={option.id} className="chip">
              <input
                type="radio"
                name="when"
                value={option.id}
                checked={when === option.id}
                onChange={() => setWhen(option.id)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </AppScreen>
  )
}
