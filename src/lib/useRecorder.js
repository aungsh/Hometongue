'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Records from the microphone with the browser's MediaRecorder.
// The audio stays in memory on this device: it is never uploaded or saved.

export const MAX_TAKE_MS = 10_000
export const MIN_TAKE_MS = 600

// Safari records MP4, Chrome and Firefox record WebM or Ogg: take the first the browser supports.
const TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus']

export function pickRecordingType(isTypeSupported) {
  return TYPES.find((type) => isTypeSupported(type)) ?? ''
}

/** Turns what getUserMedia threw into one of the MIC_MESSAGES keys. */
export function micProblem(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'denied'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'no-mic'
    case 'NotReadableError':
    case 'AbortError':
      return 'busy'
    default:
      return 'failed'
  }
}

export const MIC_MESSAGES = {
  denied: 'The mic is blocked for this site. Allow it in your browser’s site settings, then tap the mic again.',
  'no-mic': 'No microphone found on this device.',
  busy: 'Your mic is being used by another app. Close it and try again.',
  insecure: 'Browsers only allow the mic on secure (https) pages, or on localhost.',
  unsupported: 'This browser can’t record audio. Try the latest Chrome, Edge, Firefox or Safari.',
  short: 'That was too short to hear. Hold on a little longer, then tap stop.',
  failed: 'Something went wrong with the recording. Please try again.',
}

/**
 * `take` is { url, ms } for the latest recording. `onTake` runs each time a new take is ready.
 * `problem` is a key of MIC_MESSAGES, or null.
 */
export function useRecorder({ onTake } = {}) {
  const [status, setStatus] = useState('idle') // idle | starting | recording
  const [problem, setProblem] = useState(null)
  const [take, setTake] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const live = useRef({ recorder: null, stream: null, timer: null, cancelled: false })
  const urlRef = useRef(null)
  const onTakeRef = useRef(onTake)

  useEffect(() => {
    onTakeRef.current = onTake
  })

  const release = useCallback(() => {
    const session = live.current
    clearInterval(session.timer)
    session.stream?.getTracks().forEach((track) => track.stop())
    session.stream = null
    session.timer = null
  }, [])

  const forgetTake = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = null
    setTake(null)
  }, [])

  useEffect(() => {
    const session = live.current
    session.cancelled = false
    return () => {
      session.cancelled = true
      if (session.recorder?.state === 'recording') session.recorder.stop()
      release()
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [release])

  const stop = useCallback(() => {
    const { recorder } = live.current
    if (recorder?.state === 'recording') recorder.stop()
  }, [])

  const start = useCallback(async () => {
    if (status !== 'idle') return
    setProblem(null)
    if (!window.isSecureContext) return setProblem('insecure')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return setProblem('unsupported')

    const session = live.current
    setStatus('starting')
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    } catch (error) {
      setProblem(micProblem(error))
      setStatus('idle')
      return
    }
    if (session.cancelled) {
      stream.getTracks().forEach((track) => track.stop())
      return
    }

    const type = pickRecordingType((t) => MediaRecorder.isTypeSupported(t))
    let recorder
    try {
      recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined)
    } catch {
      stream.getTracks().forEach((track) => track.stop())
      setProblem('unsupported')
      setStatus('idle')
      return
    }

    const chunks = []
    const began = Date.now()
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.onstop = () => {
      release()
      if (session.cancelled) return
      const ms = Date.now() - began
      const blob = new Blob(chunks, { type: recorder.mimeType || type || 'audio/webm' })
      setStatus('idle')
      if (ms < MIN_TAKE_MS || blob.size === 0) {
        setProblem(ms < MIN_TAKE_MS ? 'short' : 'failed')
        return
      }
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = URL.createObjectURL(blob)
      setTake({ url: urlRef.current, ms })
      onTakeRef.current?.()
    }
    recorder.onerror = () => {
      release()
      setProblem('failed')
      setStatus('idle')
    }

    session.recorder = recorder
    session.stream = stream
    recorder.start()
    setSeconds(0)
    setStatus('recording')
    session.timer = setInterval(() => {
      const elapsed = Date.now() - began
      setSeconds(Math.floor(elapsed / 1000))
      if (elapsed >= MAX_TAKE_MS) stop()
    }, 200)
  }, [status, release, stop])

  return { status, problem, take, seconds, start, stop, forgetTake, clearProblem: () => setProblem(null) }
}
