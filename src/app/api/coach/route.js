import { createLimiter } from '@/lib/server/rateLimit.js'
import { chat, llmConfig } from '@/lib/server/llm.js'
import { buildMessages, sanitizeReply, validateCoachRequest } from '@/lib/server/coachPrompt.js'
import { speechConfig, synthesize } from '@/lib/server/elevenLabs.js'

// The AI coach. The browser sends what happened (never a prompt); this builds the prompt from the
// app's own mission data, asks the model, and optionally speaks the reply with an ElevenLabs voice.
// Keys stay here on the server.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY = 4000
const LLM_TIMEOUT_MS = 15_000
const TTS_TIMEOUT_MS = 10_000

// Per visitor: 12 replies every 10 minutes. Per server copy: 1500 a day.
const perVisitor = createLimiter({ limit: 12, windowMs: 10 * 60 * 1000 })
const overall = createLimiter({ limit: 1500, windowMs: 24 * 60 * 60 * 1000 })

const json = (body, status = 200, headers = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

/** Only the app's own pages may call this, which stops other sites using it from a browser. */
function sameOrigin(request) {
  const origin = request.headers.get('origin')
  if (!origin) return true // same-origin GET/POST from some browsers omit it; non-browser tools are limited below
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

const visitorKey = (request) =>
  (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'

/** Tells the app whether the coach is set up, so it can hide the AI parts instead of faking them. */
export async function GET() {
  return json({ enabled: llmConfig() !== null, voice: speechConfig() !== null })
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403)
  const config = llmConfig()
  if (!config) return json({ error: 'not configured' }, 503)

  const text = await request.text()
  if (text.length > MAX_BODY) return json({ error: 'too large' }, 413)
  let body
  try {
    body = JSON.parse(text)
  } catch {
    return json({ error: 'bad request' }, 400)
  }
  const checked = validateCoachRequest(body)
  if (!checked.ok) return json({ error: 'bad request' }, 400)

  const mine = perVisitor(visitorKey(request))
  if (!mine.allowed) {
    return json({ error: 'slow down' }, 429, { 'Retry-After': String(mine.retryAfterSeconds) })
  }
  if (!overall('all').allowed) return json({ error: 'busy' }, 429, { 'Retry-After': '3600' })

  let reply
  try {
    const raw = await chat(config, buildMessages(checked.value), { signal: AbortSignal.timeout(LLM_TIMEOUT_MS) })
    reply = sanitizeReply(raw)
  } catch (error) {
    console.error('coach: model call failed', error?.status ?? error?.name ?? 'error')
    return json({ error: 'unavailable' }, 502)
  }
  if (!reply) return json({ error: 'unavailable' }, 502)

  let audio = null
  const speech = speechConfig()
  if (speech && checked.value.voice) {
    try {
      const mp3 = await synthesize(reply, speech, { signal: AbortSignal.timeout(TTS_TIMEOUT_MS) })
      audio = mp3.toString('base64')
    } catch (error) {
      // Text alone is still a good answer; the browser can read it aloud.
      console.error('coach: speech failed', error?.status ?? error?.name ?? 'error')
    }
  }
  return json({ text: reply, audio, mime: audio ? 'audio/mpeg' : null })
}
