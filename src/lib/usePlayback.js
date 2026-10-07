'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { pickVoice } from './audioSources.js'

// Plays one thing at a time across the whole app: starting a clip stops whatever was playing.

let active = null // { stop(): void }

const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function stopPlayback() {
  active?.stop()
  active = null
}

/** Resolves when the clip ends, is stopped, or can't play. Never rejects. */
export function playSource({ src, speech }, { voices = speechSupported() ? window.speechSynthesis.getVoices() : [] } = {}) {
  stopPlayback()
  return new Promise((resolve) => {
    let done = false
    const handle = { stop: () => {} }
    const finish = () => {
      if (done) return
      done = true
      if (active === handle) active = null
      resolve()
    }

    const speak = () => {
      const voice = speech && speechSupported() ? pickVoice(voices, speech.langs) : null
      if (!voice) {
        finish()
        return
      }
      const utterance = new SpeechSynthesisUtterance(speech.text)
      utterance.voice = voice
      utterance.lang = voice.lang
      utterance.rate = 0.92
      utterance.onend = finish
      utterance.onerror = finish
      handle.stop = () => {
        window.speechSynthesis.cancel()
        finish()
      }
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }

    active = handle
    if (!src) {
      speak()
      return
    }
    const audio = new Audio(src)
    handle.stop = () => {
      audio.pause()
      finish()
    }
    let fellBack = false
    const fallBack = () => {
      if (done || fellBack) return
      fellBack = true
      speak()
    }
    audio.addEventListener('ended', finish)
    // A missing or broken file falls back to the phone's voice, if there is one.
    audio.addEventListener('error', fallBack)
    audio.play().catch((error) => {
      // NotSupportedError: the file is missing or unreadable. Anything else (such as the
      // browser blocking autoplay before a tap) just means there is no sound.
      if (error?.name === 'NotSupportedError') fallBack()
      else finish()
    })
  })
}

/** True once the phone has a voice for one of these language tags. Updates as voices load. */
export function useVoiceFor(langs) {
  const [available, setAvailable] = useState(false)
  const key = langs?.join(',') ?? ''

  useEffect(() => {
    if (!langs || !speechSupported()) {
      setAvailable(false)
      return undefined
    }
    const synth = window.speechSynthesis
    const check = () => setAvailable(pickVoice(synth.getVoices(), langs) !== null)
    check()
    synth.addEventListener('voiceschanged', check)
    return () => synth.removeEventListener('voiceschanged', check)
    // `key` stands in for the `langs` array, which is a new object on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return available
}

/** Whether a source has anything to play on this device. */
export function useCanPlay(source) {
  const voiceReady = useVoiceFor(source?.src ? null : source?.speech?.langs)
  return Boolean(source?.src) || voiceReady
}

/**
 * Play/stop state for buttons. `playing` is the key of whatever this component started
 * and is still going, so one component can drive several buttons.
 */
export function usePlayback() {
  const [playing, setPlaying] = useState(null)
  const token = useRef(0)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      stopPlayback()
    }
  }, [])

  const play = useCallback(async (source, key = 'main') => {
    const mine = ++token.current
    setPlaying(key)
    await playSource(source)
    if (mounted.current && token.current === mine) setPlaying(null)
  }, [])

  const stop = useCallback(() => {
    token.current += 1
    stopPlayback()
    setPlaying(null)
  }, [])

  const toggle = useCallback(
    (source, key = 'main') => {
      if (playing === key) stop()
      else play(source, key)
    },
    [playing, play, stop],
  )

  return { playing, play, stop, toggle }
}
