'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useCanPlay, usePlayback } from '@/lib/usePlayback.js'

/** The speaker button itself. Shows a moving equaliser while `playing`. */
export function PlayButton({ playing, disabled, onClick, label, text }) {
  return (
    <button
      type="button"
      className={`audio-btn${text ? ' audio-btn--text' : ''}${playing ? ' is-playing' : ''}`}
      aria-label={label}
      aria-pressed={playing}
      disabled={disabled}
      onClick={onClick}
    >
      {playing ? (
        <span className="eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : disabled ? (
        <VolumeX size={18} aria-hidden="true" />
      ) : (
        <Volume2 size={18} aria-hidden="true" />
      )}
      {text && <span aria-hidden="true">{playing ? 'Playing…' : text}</span>}
    </button>
  )
}

/**
 * Plays a clip: `source` is { src, speech } from lib/audioSources.js.
 * With nothing to play on this device the button is disabled rather than pretending.
 */
export default function AudioButton({ source, label, text }) {
  const { playing, toggle } = usePlayback()
  const canPlay = useCanPlay(source)
  return (
    <PlayButton
      playing={playing !== null}
      disabled={!canPlay}
      onClick={() => toggle(source)}
      label={canPlay ? label : `${label} (no recording yet)`}
      text={text}
    />
  )
}
