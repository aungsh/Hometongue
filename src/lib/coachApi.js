// The browser's side of /api/coach (see app/api/coach/route.js).

let statusPromise

/** { loaded, enabled, voice }: whether the server has the AI coach (and a voice for it) set up. */
export function coachStatus() {
  statusPromise ??= fetch('/api/coach')
    .then((response) => (response.ok ? response.json() : {}))
    .then((data) => ({ loaded: true, enabled: Boolean(data.enabled), voice: Boolean(data.voice) }))
    .catch(() => ({ loaded: true, enabled: false, voice: false }))
  return statusPromise
}

/**
 * Asks the coach. Resolves to { text, src } (src is playable audio or null),
 * or { error: 'slow' | 'unavailable' }. Never throws.
 */
export async function askCoach(payload) {
  try {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25_000),
    })
    if (response.status === 429) return { error: 'slow' }
    if (!response.ok) return { error: 'unavailable' }
    const data = await response.json()
    if (typeof data.text !== 'string' || !data.text) return { error: 'unavailable' }
    return { text: data.text, src: data.audio ? `data:${data.mime || 'audio/mpeg'};base64,${data.audio}` : null }
  } catch {
    return { error: 'unavailable' }
  }
}
