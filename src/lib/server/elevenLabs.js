// ElevenLabs text-to-speech. Used by the coach API route and by scripts/generate-coach-audio.mjs.
// Server-side only: it needs the secret key.

export const DEFAULT_FORMAT = 'mp3_44100_64'

/** Reads the voice settings, or null when ElevenLabs isn't set up (it needs a key and a voice id). */
export function speechConfig(env = process.env) {
  const key = env.ELEVENLABS_API_KEY?.trim()
  const voiceId = env.ELEVENLABS_VOICE_ID?.trim()
  if (!key || !voiceId) return null
  const speed = Number.parseFloat(env.ELEVENLABS_SPEED ?? '')
  return {
    key,
    voiceId,
    model: env.ELEVENLABS_MODEL?.trim() || undefined, // leave unset to use ElevenLabs' default model
    speed: Number.isFinite(speed) ? Math.min(1.2, Math.max(0.7, speed)) : undefined,
  }
}

/**
 * Speaks `text` and returns the mp3 bytes. Throws an Error whose `status` is ElevenLabs' HTTP status.
 * `fetchImpl` and `signal` are injectable for tests and timeouts.
 */
export async function synthesize(text, { key, voiceId, model, speed }, { fetchImpl = fetch, signal } = {}) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${DEFAULT_FORMAT}`
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, ...(model ? { model_id: model } : {}), ...(speed ? { speed } : {}) }),
    signal,
  })
  if (!response.ok) {
    const error = new Error(`ElevenLabs answered ${response.status}`)
    error.status = response.status
    error.detail = (await response.text().catch(() => '')).slice(0, 300)
    throw error
  }
  return Buffer.from(await response.arrayBuffer())
}
