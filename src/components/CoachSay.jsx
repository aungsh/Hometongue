'use client'

import { useEffect } from 'react'
import { useApp } from '@/state/AppState.jsx'
import { COACH_NAME, pickCoachLine } from '@/data/coach.js'
import { coachSource } from '@/lib/audioSources.js'
import { useCanPlay, usePlayback } from '@/lib/usePlayback.js'
import { PlayButton } from './AudioButton.jsx'
import Pixel from './Pixel.jsx'

/**
 * The coach says something. Either a scripted line for a `category` (see data/coach.js), or a
 * `live` reply from the AI coach ({ text, src }). While a live reply is `pending` she shows
 * that she's thinking. The text is always shown; the voice follows the "Coach voice" setting.
 * `autoPlay` speaks it once when it appears, which browsers only allow after a tap on the page.
 */
export default function CoachSay({ category, seed, live = null, pending = false, autoPlay = false, className = '' }) {
  const { state } = useApp()
  const scripted = !live && category ? pickCoachLine(category, seed) : null
  const line = live ? { id: `live-${live.text.length}-${live.text.slice(0, 12)}`, text: live.text } : scripted
  const source = line ? { ...coachSource(line.id, line.text), ...(live?.src ? { src: live.src } : {}) } : null
  const canPlay = useCanPlay(source)
  const { playing, play, toggle } = usePlayback()
  const voiceOn = state.coachVoiceOn
  const lineId = line?.id

  useEffect(() => {
    if (autoPlay && voiceOn && canPlay && !pending && source) play(source)
    // Speak when the line (or whether it can be spoken) changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId, autoPlay, voiceOn, canPlay, pending])

  if (!line && !pending) return null

  return (
    <aside className={`coach tile-card ${className}`.trim()} aria-label={`${COACH_NAME} says`}>
      <Pixel sprite="auntie" scale={3} motion={playing || pending ? 'talk' : 'bob'} />
      <div className="coach__body">
        <p className="coach__name">{COACH_NAME}</p>
        <p className="coach__text" aria-live="polite">
          {pending ? 'Hmm, let me think…' : line.text}
        </p>
      </div>
      {!pending && (
        <PlayButton
          playing={playing !== null}
          disabled={!canPlay}
          onClick={() => toggle(source)}
          label={canPlay ? `Hear ${COACH_NAME}` : `${COACH_NAME} has no voice on this device`}
        />
      )}
    </aside>
  )
}
