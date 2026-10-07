import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { navigate } from '../router.js'
import { useApp } from '../state/AppState.jsx'
import { DialectPicker, PersonPicker } from '../components/Pickers.jsx'
import Tile from '../components/Tile.jsx'

function OnboardingHead({ step, backTo }) {
  return (
    <header className="onboarding-head">
      <button type="button" className="icon-btn" onClick={() => navigate(backTo)} aria-label="Back">
        <ArrowLeft size={22} aria-hidden="true" />
      </button>
      <span className="onboarding-head__count">Step {step} of 2</span>
      <span
        className="onboarding-head__tiles"
        role="progressbar"
        aria-label="Setup progress"
        aria-valuemin={0}
        aria-valuemax={2}
        aria-valuenow={step}
      >
        <Tile glyph="一" size="xs" tone="accent" />
        <Tile glyph="二" size="xs" tone="accent" down={step < 2} />
      </span>
    </header>
  )
}

export function OnboardingDialect() {
  const { state, dispatch } = useApp()
  const [dialect, setDialect] = useState(state.profile.dialect)

  const next = () => {
    dispatch({ type: 'setDialect', dialect })
    navigate('/onboarding/person')
  }

  return (
    <div className="screen screen--onboarding" data-dialect={dialect ?? undefined}>
      <OnboardingHead step={1} backTo="/onboarding" />
      <main className="stack">
        <div className="stack stack--xs">
          <h1 className="title">Which dialect do you want to speak?</h1>
          <p className="muted">Pick the one you hear most at home. You can switch anytime.</p>
        </div>
        <DialectPicker value={dialect} onChange={setDialect} />
      </main>
      <div className="cta-bar">
        <button type="button" className="btn btn--primary btn--block" disabled={!dialect} onClick={next}>
          Continue
        </button>
      </div>
    </div>
  )
}

export function OnboardingPerson() {
  const { state, dispatch } = useApp()
  const [person, setPerson] = useState(state.profile.person)

  const start = () => {
    dispatch({ type: 'setPerson', person })
    navigate('/today', { replace: true })
  }

  return (
    <div className="screen screen--onboarding">
      <OnboardingHead step={2} backTo="/onboarding/dialect" />
      <main className="stack">
        <div className="stack stack--xs">
          <h1 className="title">Who do you want to talk with?</h1>
          <p className="muted">Your daily missions are built around a real person in your life.</p>
        </div>
        <PersonPicker value={person} onChange={setPerson} />
      </main>
      <div className="cta-bar">
        <button type="button" className="btn btn--primary btn--block" disabled={!person} onClick={start}>
          Show my first mission
        </button>
      </div>
    </div>
  )
}
