import { useState } from 'react'
import { navigate } from '../../router.js'
import { useApp, useMission } from '../../state/AppState.jsx'
import { OUTCOMES } from '../../data/catalog.js'
import AppScreen from '../../components/AppScreen.jsx'
import Tile from '../../components/Tile.jsx'

// Ink colours for the outcome tiles: 顺 smooth, 尬 awkward, 忘 forgot, 等 wait for next time.
const OUTCOME_TONE = { natural: 'jade', awkward: 'red', forgot: 'blue', 'no-chance': 'ink' }

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export default function Reflect() {
  const { dispatch } = useApp()
  const { mission, dialect } = useMission()
  const [outcome, setOutcome] = useState(null)
  const [note, setNote] = useState('')

  const save = () => {
    dispatch({ type: 'reflect', outcome, note: note.trim(), at: new Date().toISOString(), id: newId() })
    navigate('/mission/done', { replace: true })
  }

  return (
    <AppScreen
      app="reflect"
      footer={
        <button type="button" className="btn btn--primary btn--block" disabled={!outcome} onClick={save}>
          Save reflection
        </button>
      }
    >
      <div className="stack stack--xs">
        <h1 className="title">How did it go?</h1>
        <p className="muted">Be honest. Every answer keeps your streak going.</p>
      </div>

      <fieldset className="outcomes">
        <legend className="sr-only">How the conversation went</legend>
        {OUTCOMES.map((o) => (
          <label key={o.id} className="outcome tile-card">
            <input
              type="radio"
              name="outcome"
              value={o.id}
              checked={outcome === o.id}
              onChange={() => setOutcome(o.id)}
            />
            <Tile glyph={o.glyph} size="md" tone={OUTCOME_TONE[o.id]} />
            <span className="outcome__label">{o.label}</span>
            <span className="outcome__detail">{o.detail}</span>
          </label>
        ))}
      </fieldset>

      <label className="field field--diary">
        <span className="field__label">
          Anything worth remembering? <span className="muted">(optional)</span>
        </span>
        <textarea
          rows={3}
          maxLength={280}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`e.g. ${mission.partner} smiled and replied in ${dialect.name}!`}
        />
      </label>
    </AppScreen>
  )
}
