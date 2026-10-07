import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'

const PLAY_MS = 1800

/**
 * Placeholder audio. It animates for a moment instead of playing anything:
 * native-speaker recordings would be wired in here.
 */
export default function AudioButton({ label, text }) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return undefined
    const timer = setTimeout(() => setPlaying(false), PLAY_MS)
    return () => clearTimeout(timer)
  }, [playing])

  return (
    <button
      type="button"
      className={`audio-btn${text ? ' audio-btn--text' : ''}${playing ? ' is-playing' : ''}`}
      aria-label={label}
      onClick={() => setPlaying(true)}
    >
      {playing ? (
        <span className="eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : (
        <Volume2 size={18} aria-hidden="true" />
      )}
      {text && <span aria-hidden="true">{playing ? 'Playing…' : text}</span>}
    </button>
  )
}
