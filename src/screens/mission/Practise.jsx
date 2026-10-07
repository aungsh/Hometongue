import { useEffect, useRef, useState } from 'react'
import { Check, Lightbulb, Mic, RotateCcw, Square } from 'lucide-react'
import { navigate } from '../../router.js'
import { useApp, useMission } from '../../state/AppState.jsx'
import AppScreen from '../../components/AppScreen.jsx'
import AudioButton from '../../components/AudioButton.jsx'
import Pixel from '../../components/Pixel.jsx'

// Simulated recording: no microphone access, nothing is captured or analysed.
const RECORD_MS = 4000
const PROCESS_MS = 900
const BARS = Array.from({ length: 20 }, (_, i) => ({
  delay: `${(i * 137) % 900}ms`,
  peak: 0.3 + ((i * 53) % 65) / 100,
}))
const HEADLINES = ['Nice first take!', 'Sounding more natural!', 'You’ve got this!']

function TakeResult({ feedbackOn, takes, tips, onRetry }) {
  const ref = useRef(null)

  // Bring each new result into view; it usually lands below the fold on a phone.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' })
  }, [takes])

  return (
    <div className="result tile-card" ref={ref}>
      {feedbackOn ? (
        <>
          <p className="result__title">{HEADLINES[Math.min(takes, HEADLINES.length) - 1]}</p>
          <ul className="result__checks">
            <li>
              <Check size={14} strokeWidth={3} aria-hidden="true" /> Clear
            </li>
            <li>
              <Check size={14} strokeWidth={3} aria-hidden="true" /> Good pace
            </li>
            <li className="is-tip">
              <Lightbulb size={14} aria-hidden="true" /> Tone tip
            </li>
          </ul>
          <p className="result__text">{tips[(takes - 1) % tips.length]}</p>
        </>
      ) : (
        <>
          <p className="result__title">Take done 🎙️</p>
          <p className="result__text">No scores, just practice. Play it back or go again.</p>
        </>
      )}
      <div className="result__actions">
        <AudioButton text="Play my take" label="Play my take (placeholder)" />
        <button type="button" className="btn btn--secondary btn--small" onClick={onRetry}>
          <RotateCcw size={16} aria-hidden="true" />
          Try again
        </button>
      </div>
      {feedbackOn && <p className="fineprint">Simulated feedback for this prototype. No audio is analysed.</p>}
    </div>
  )
}

export default function Practise() {
  const { state, dispatch } = useApp()
  const { mission, dialect } = useMission()
  const yourLines = mission.lines.filter((line) => line.from === 'you')
  const [lineIndex, setLineIndex] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | recording | processing | result
  const [seconds, setSeconds] = useState(0)
  const [takes, setTakes] = useState(0)
  const line = yourLines[lineIndex]
  const busy = phase === 'recording' || phase === 'processing'

  const start = () => {
    setSeconds(0)
    setPhase('recording')
  }
  const stop = () => {
    setPhase('processing')
    dispatch({ type: 'logPractice', at: new Date().toISOString() })
  }

  useEffect(() => {
    if (phase !== 'recording') return undefined
    const began = Date.now()
    const tick = setInterval(() => setSeconds(Math.floor((Date.now() - began) / 1000)), 250)
    const autoStop = setTimeout(stop, RECORD_MS)
    return () => {
      clearInterval(tick)
      clearTimeout(autoStop)
    }
    // `stop` only uses stable setters, so the one captured here never goes stale.
  }, [phase])

  useEffect(() => {
    if (phase !== 'processing') return undefined
    const timer = setTimeout(() => {
      setTakes((n) => n + 1)
      setPhase('result')
    }, PROCESS_MS)
    return () => clearTimeout(timer)
  }, [phase])

  const chooseLine = (index) => {
    setLineIndex(index)
    setPhase('idle')
    setTakes(0)
  }

  // Practice is optional: leaving without a take doesn't mark the app as done.
  const finish = () => {
    if (takes > 0) dispatch({ type: 'finishPractice' })
    navigate('/mission')
  }

  const micLabel = {
    idle: 'Tap to record',
    recording: `Recording… 0:0${seconds}  ·  tap to stop`,
    processing: state.feedbackOn ? 'Listening back…' : 'Wrapping up…',
    result: 'Tap to record again',
  }[phase]

  return (
    <AppScreen
      app="practise"
      footer={
        <button type="button" className="btn btn--primary btn--block" onClick={finish} disabled={busy}>
          {takes > 0 ? 'Done practising' : 'Back to mission'}
        </button>
      }
    >
      <div className="stack stack--xs">
        <h1 className="title">Practise out loud</h1>
        <p className="muted">Just you and your phone. Nothing is recorded or sent anywhere.</p>
      </div>

      {yourLines.length > 1 && (
        <div className="segmented" role="group" aria-label="Line to practise">
          {yourLines.map((l, i) => (
            <button
              key={l.say}
              type="button"
              aria-pressed={i === lineIndex}
              disabled={busy}
              onClick={() => chooseLine(i)}
            >
              {i === 0 ? 'Your opener' : 'Your reply'}
            </button>
          ))}
        </div>
      )}

      <section className="practice-card tile-card" aria-label="Phrase to practise">
        <p className="phrase-say">{line.say}</p>
        <p className="phrase-zh" lang={dialect.lang}>
          {line.zh}
        </p>
        <p className="phrase-en">{line.en}</p>
        <AudioButton text="Listen first" label="Listen first (placeholder audio)" />
      </section>

      <section className="mic-area tile-card" aria-label="Recorder">
        <div className="mic-area__stage">
          <Pixel sprite="you" scale={4} motion={phase === 'recording' ? 'talk' : 'still'} />
          <div className={`wave${phase === 'recording' ? ' is-live' : ''}`} aria-hidden="true">
            {BARS.map((bar, i) => (
              <span key={i} style={{ '--delay': bar.delay, '--peak': bar.peak }} />
            ))}
          </div>
        </div>
        <button
          type="button"
          className={`mic mic--${phase}`}
          onClick={phase === 'recording' ? stop : start}
          disabled={phase === 'processing'}
          aria-label={phase === 'recording' ? 'Stop recording' : 'Start recording'}
        >
          {phase === 'recording' ? (
            <Square size={26} fill="currentColor" aria-hidden="true" />
          ) : (
            <Mic size={32} aria-hidden="true" />
          )}
        </button>
        <p className="mic-area__label" aria-live="polite">
          {micLabel}
        </p>
      </section>

      {phase === 'result' && (
        <TakeResult feedbackOn={state.feedbackOn} takes={takes} tips={mission.tips} onRetry={start} />
      )}

      <label className="switch-row tile-card">
        <span>
          <span className="switch-row__title">Gentle feedback</span>
          <span className="switch-row__detail">Simulated tips after each take. Turn off to just practise.</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          className="switch"
          checked={state.feedbackOn}
          onChange={(e) => dispatch({ type: 'setFeedback', on: e.target.checked })}
        />
      </label>
    </AppScreen>
  )
}
