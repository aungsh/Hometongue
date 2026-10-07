import { useRef, useState } from 'react'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import { useNavigate } from '@/lib/useNavigate.js'
import { backupFileName, exportBackup, parseBackup } from '@/lib/backup.js'
import { COACH_NAME } from '@/data/coach.js'
import { useApp } from '../state/AppState.jsx'
import { DIALECTS, PEOPLE } from '../data/catalog.js'
import { DialectPicker, PersonPicker } from '../components/Pickers.jsx'

/** Save progress to a file, or load one back. Replacing progress always asks first. */
function YourData() {
  const navigate = useNavigate()
  const { state, dispatch, showToast } = useApp()
  const fileInput = useRef(null)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(null) // a parsed backup waiting for confirmation

  const download = () => {
    const blob = new Blob([exportBackup(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName()
    link.click()
    URL.revokeObjectURL(url)
    showToast('Backup saved to your downloads')
  }

  const choose = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // so choosing the same file again still fires
    if (!file) return
    setError(null)
    const result = parseBackup(await file.text())
    if (result.ok) setPending(result.state)
    else setError(result.reason)
  }

  const replace = () => {
    dispatch({ type: 'hydrate', state: pending })
    showToast('Progress restored')
    navigate('/today', { replace: true })
  }

  return (
    <section className="stack stack--sm" aria-labelledby="data-title">
      <h2 className="section-title" id="data-title">
        Your data
      </h2>
      <p className="muted">
        There are no accounts. Your progress lives in this browser only, so save a backup before changing phones or
        clearing your browser.
      </p>
      <div className="controls__row">
        <button type="button" className="btn btn--secondary btn--small" onClick={download}>
          <Download size={16} aria-hidden="true" />
          Save a backup
        </button>
        <button type="button" className="btn btn--secondary btn--small" onClick={() => fileInput.current?.click()}>
          <Upload size={16} aria-hidden="true" />
          Load a backup
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={choose} />
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {pending && (
        <div className="confirm tile-card" role="alertdialog" aria-label="Replace progress?">
          <p>
            This backup has {pending.history.length} check-ins. Loading it <b>replaces</b> the progress on this device.
          </p>
          <div className="controls__row">
            <button type="button" className="btn btn--danger btn--small" onClick={replace}>
              Replace my progress
            </button>
            <button type="button" className="btn btn--secondary btn--small" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

/** Change dialect or person after onboarding. Progress on each mission is kept. */
export default function Setup() {
  const navigate = useNavigate()
  const { state, dispatch, showToast } = useApp()
  const [dialect, setDialect] = useState(state.profile.dialect)
  const [person, setPerson] = useState(state.profile.person)
  const changed = dialect !== state.profile.dialect || person !== state.profile.person

  const save = () => {
    dispatch({ type: 'setDialect', dialect })
    dispatch({ type: 'setPerson', person })
    showToast(`Now practising ${DIALECTS[dialect].name} with ${PEOPLE[person].name}`)
    navigate('/today', { replace: true })
  }

  return (
    <div className="screen" data-dialect={dialect}>
      <header className="bar-head">
        <button type="button" className="icon-btn" onClick={() => navigate('/today')} aria-label="Back">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="title title--sm">Your setup</h1>
      </header>
      <main className="stack">
        <section className="stack stack--sm">
          <h2 className="section-title">Dialect</h2>
          <DialectPicker value={dialect} onChange={setDialect} />
        </section>
        <section className="stack stack--sm">
          <h2 className="section-title">Who you want to talk with</h2>
          <PersonPicker value={person} onChange={setPerson} />
        </section>
        <p className="fineprint">Your progress on every mission is kept when you switch.</p>

        <label className="switch-row tile-card">
          <span>
            <span className="switch-row__title">Coach voice</span>
            <span className="switch-row__detail">
              {COACH_NAME} speaks her lines aloud. She’s always shown as text too.
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            checked={state.coachVoiceOn}
            onChange={(e) => dispatch({ type: 'setCoachVoice', on: e.target.checked })}
          />
        </label>

        <YourData />
      </main>
      <div className="cta-bar">
        <button type="button" className="btn btn--primary btn--block" disabled={!changed} onClick={save}>
          Save changes
        </button>
      </div>
    </div>
  )
}
