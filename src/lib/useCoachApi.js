'use client'

import { useEffect, useState } from 'react'
import { askCoach, coachStatus } from './coachApi.js'

const INITIAL = { loaded: false, enabled: false, voice: false }
const inflight = new Map() // key → promise, so React's double effects (and re-renders) ask once

/** Whether the server has the AI coach set up. `loaded` is false until we know. */
export function useCoachStatus() {
  const [status, setStatus] = useState(INITIAL)
  useEffect(() => {
    let live = true
    coachStatus().then((value) => live && setStatus(value))
    return () => {
      live = false
    }
  }, [])
  return status
}

/**
 * Asks the coach once for `key` (for example a check-in's id) and returns { pending, reply }.
 * `reply` is { text, src } or null if the coach isn't set up or couldn't answer, in which case
 * the screen falls back to its scripted line. A null `key` asks nothing.
 */
export function useCoachReply(key, buildPayload) {
  const status = useCoachStatus()
  const [result, setResult] = useState({ key: null, reply: null })

  useEffect(() => {
    if (!key || !status.loaded || !status.enabled) return undefined
    let live = true
    if (!inflight.has(key)) inflight.set(key, askCoach(buildPayload(status)))
    inflight.get(key).then((reply) => live && setResult({ key, reply: reply.text ? reply : null }))
    return () => {
      live = false
    }
    // buildPayload is a new function every render; `key` identifies the question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, status.loaded, status.enabled])

  const settled = result.key === key
  return {
    pending: Boolean(key) && (!status.loaded || (status.enabled && !settled)),
    reply: settled ? result.reply : null,
  }
}
