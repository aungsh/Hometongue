'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { askCoach } from '@/lib/coachApi.js'
import { useCoachStatus } from '@/lib/useCoachApi.js'
import { computeStreak, isRealConversation } from '@/lib/logic.js'
import { useApp, useMission } from '@/state/AppState.jsx'
import { COACH_NAME } from '@/data/coach.js'
import CoachSay from './CoachSay.jsx'

const ERRORS = {
  slow: 'Aiyo, too many questions already. Take a breather and ask again in a few minutes.',
  unavailable: 'Sorry, Auntie can’t answer right now. Try again in a bit.',
}

/** A question box for the AI coach. It only appears when the server has the coach set up. */
export default function AskAuntie() {
  const { state } = useApp()
  const { missionId, dialect, person } = useMission()
  const status = useCoachStatus()
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [answer, setAnswer] = useState(null) // { text, src } | { error }

  if (!status.enabled) return null

  const submit = async (event) => {
    event.preventDefault()
    const text = question.trim()
    if (!text || busy) return
    setBusy(true)
    setAnswer(null)
    const now = new Date()
    const reply = await askCoach({
      kind: 'ask',
      question: text,
      dialect: dialect.id,
      person: person.id,
      missionId,
      streak: computeStreak(state.history, now),
      total: state.history.filter((h) => isRealConversation(h.outcome)).length,
      voice: state.coachVoiceOn && status.voice,
    })
    setAnswer(reply)
    setBusy(false)
  }

  return (
    <section className="ask stack stack--sm" aria-labelledby="ask-title">
      <h2 className="section-title" id="ask-title">
        Ask {COACH_NAME}
      </h2>
      <form className="ask__form" onSubmit={submit}>
        <label className="sr-only" htmlFor="ask-input">
          Your question for {COACH_NAME}
        </label>
        <input
          id="ask-input"
          type="text"
          maxLength={200}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. when should I say this?"
          autoComplete="off"
        />
        <button type="submit" className="btn btn--primary btn--small" disabled={busy || !question.trim()}>
          <Send size={16} aria-hidden="true" />
          Ask
        </button>
      </form>
      <p className="fineprint">
        Your question is sent to an AI service so Auntie can reply. Please don’t include personal details. She only
        knows this mission, so leave anything else to the native speakers in your family.
      </p>
      {busy && <CoachSay pending />}
      {answer?.text && <CoachSay live={answer} autoPlay />}
      {answer?.error && (
        <p className="form-error" role="alert">
          {ERRORS[answer.error]}
        </p>
      )}
    </section>
  )
}
