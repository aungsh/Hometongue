import { useRef, useState } from 'react'
import { Lightbulb, Mic, RotateCcw, Square } from 'lucide-react'
import { useNavigate } from '@/lib/useNavigate.js'
import { COACH_NAME } from '@/data/coach.js'
import { phraseSource } from '@/lib/audioSources.js'
import { MIC_MESSAGES, useRecorder } from '@/lib/useRecorder.js'
import { useCanPlay, usePlayback } from '@/lib/usePlayback.js'
import { useApp, useMission } from '../../state/AppState.jsx'
import AppScreen from '../../components/AppScreen.jsx'
import { PlayButton } from '../../components/AudioButton.jsx'
import CoachSay from '../../components/CoachSay.jsx'
import Pixel from '../../components/Pixel.jsx'

const BARS = Array.from({ length: 20 }, (_, i) => ({
  delay: `${(i * 137) % 900}ms`,
  peak: 0.3 + ((i * 53) % 65) / 100,
}))

// How the learner felt about their own take. The coach answers each differently.
const RATINGS = [
  { id: 'shiok', label: 'Shiok', detail: 'Sounded good' },
  { id: 'canlah', label: 'Can lah', detail: 'Getting there' },
  { id: 'aiyo', label: 'Aiyo', detail: 'Need another go' },
]

const clock = (seconds) => `0:${String(seconds).padStart(2, '0')}`

export default function Practise() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { mission, missionId, dialect, person } = useMission()
  const yourLines = mission.lines.filter((line) => line.from === 'you')
  const [lineIndex, setLineIndex] = useState(0)
  const [takes, setTakes] = useState(0) // takes of the current line
  const [anyTake, setAnyTake] = useState(false) // any take at all, on any line
  const [rating, setRating] = useState(null)
  const [unrecorded, setUnrecorded] = useState(false) // said it aloud without the mic
  const line = yourLines[lineIndex]

  const onTake = () => {
    setTakes((n) => n + 1)
    setAnyTake(true)
    setRating(null)
    setUnrecorded(false)
    dispatch({ type: 'logPractice', at: new Date().toISOString() })
  }
  const recorder = useRecorder({ onTake })
  const { status, problem, take, seconds } = recorder
  const recording = status === 'recording'
  const busy = status !== 'idle'

  const nativeSource = phraseSource(dialect.id, missionId, mission.lines.indexOf(line), line.zh)
  const canHearNative = useCanPlay(nativeSource)
  const { playing, play, stop } = usePlayback()
  // Every button goes through here so a running "native, then mine" never carries on after another tap.
  const run = useRef(0)
  const start = (source, key) => {
    run.current += 1
    play(source, key)
  }
  const halt = () => {
    run.current += 1
    stop()
  }
  const toggle = (source, key) => (playing === key ? halt() : start(source, key))
  const compare = async () => {
    const id = ++run.current
    await play(nativeSource, 'native')
    if (run.current === id && take) await play({ src: take.url }, 'mine')
  }

  const hasResult = takes > 0 && !busy && (take !== null || unrecorded)

  const startRecording = () => {
    halt()
    recorder.start()
  }
  const chooseLine = (index) => {
    halt()
    recorder.forgetTake()
    recorder.clearProblem()
    setLineIndex(index)
    setTakes(0)
    setRating(null)
    setUnrecorded(false)
  }
  const skipMic = () => {
    recorder.clearProblem()
    setUnrecorded(true)
    setTakes((n) => n + 1)
    setAnyTake(true)
    setRating(null)
    dispatch({ type: 'logPractice', at: new Date().toISOString() })
  }

  // Practice is optional: leaving without a take doesn't mark the app as done.
  const finish = () => {
    if (anyTake) dispatch({ type: 'finishPractice', missionId })
    navigate('/mission')
  }

  const micLabel = recording
    ? `Recording… ${clock(seconds)}  ·  tap to stop`
    : status === 'starting'
      ? 'Asking for your mic…'
      : hasResult
        ? 'Tap to record again'
        : 'Tap to record'

  return (
    <AppScreen
      app="practise"
      footer={
        <button type="button" className="btn btn--primary btn--block" onClick={finish} disabled={busy}>
          {anyTake ? 'Done practising' : 'Back to mission'}
        </button>
      }
    >
      <div className="stack stack--xs">
        <h1 className="title">Practise out loud</h1>
        <p className="muted">
          Record yourself, then compare with the real thing. Your voice stays on this device: it is never uploaded, and
          it’s gone when you leave this screen.
        </p>
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
        <PlayButton
          playing={playing === 'listen'}
          disabled={!canHearNative}
          onClick={() => toggle(nativeSource, 'listen')}
          label={canHearNative ? 'Listen first' : 'Listen first (no recording yet)'}
          text="Listen first"
        />
        {!canHearNative && <p className="fineprint">No {dialect.name} recording for this line yet.</p>}
      </section>

      <section className="mic-area tile-card" aria-label="Recorder">
        <div className="mic-area__stage">
          <Pixel sprite="you" scale={4} motion={recording ? 'talk' : 'still'} />
          <div className={`wave${recording ? ' is-live' : ''}`} aria-hidden="true">
            {BARS.map((bar, i) => (
              <span key={i} style={{ '--delay': bar.delay, '--peak': bar.peak }} />
            ))}
          </div>
        </div>
        <button
          type="button"
          className={`mic mic--${recording ? 'recording' : status === 'starting' ? 'processing' : 'idle'}`}
          onClick={recording ? recorder.stop : startRecording}
          disabled={status === 'starting'}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
        >
          {recording ? (
            <Square size={26} fill="currentColor" aria-hidden="true" />
          ) : (
            <Mic size={32} aria-hidden="true" />
          )}
        </button>
        <p className="mic-area__label" aria-live="polite">
          {micLabel}
        </p>
        {problem && (
          <div className="mic-problem" role="alert">
            <p>{MIC_MESSAGES[problem]}</p>
            {problem !== 'short' && (
              <button type="button" className="btn btn--secondary btn--small" onClick={skipMic}>
                I’ll say it out loud without recording
              </button>
            )}
          </div>
        )}
      </section>

      {hasResult && (
        <section className="result tile-card" aria-label="Your take">
          <p className="result__title">{take ? 'Your take' : 'Nice. You said it out loud.'}</p>
          {take ? (
            <div className="result__actions">
              <PlayButton
                playing={playing === 'mine'}
                onClick={() => toggle({ src: take.url }, 'mine')}
                label="Play my take"
                text="My take"
              />
              {canHearNative && (
                <>
                  <PlayButton
                    playing={playing === 'native'}
                    onClick={() => toggle(nativeSource, 'native')}
                    label="Play the real one"
                    text="The real one"
                  />
                  <button type="button" className="btn btn--secondary btn--small" onClick={compare}>
                    Real one, then mine
                  </button>
                </>
              )}
            </div>
          ) : (
            <p className="result__text">No recording this time, so there’s nothing to play back. Go again when you can.</p>
          )}

          <fieldset className="rate">
            <legend className="result__text">How did it sound to you?</legend>
            <div className="rate__options">
              {RATINGS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="rate__option"
                  aria-pressed={rating === r.id}
                  onClick={() => setRating(r.id)}
                >
                  <b>{r.label}</b>
                  <span>{r.detail}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <button type="button" className="btn btn--secondary btn--small" onClick={startRecording}>
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </button>
        </section>
      )}

      {hasResult && rating && state.feedbackOn && (
        <>
          <CoachSay category={rating} seed={`${line.say}:${takes}`} autoPlay />
          <p className="tip tile-card">
            <Lightbulb size={16} aria-hidden="true" />
            <span>{mission.tips[(takes - 1) % mission.tips.length]}</span>
          </p>
        </>
      )}

      <label className="switch-row tile-card">
        <span>
          <span className="switch-row__title">Coach reactions</span>
          <span className="switch-row__detail">
            {COACH_NAME} answers after you rate your take. Turn off to just practise.
          </span>
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
