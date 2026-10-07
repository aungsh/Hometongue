import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { navigate } from '../router.js'
import { useApp } from '../state/AppState.jsx'
import { DIALECTS, PEOPLE } from '../data/catalog.js'
import { DialectPicker, PersonPicker } from '../components/Pickers.jsx'

/** Change dialect or person after onboarding. Progress on each mission is kept. */
export default function Setup() {
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
      </main>
      <div className="cta-bar">
        <button type="button" className="btn btn--primary btn--block" disabled={!changed} onClick={save}>
          Save changes
        </button>
      </div>
    </div>
  )
}
