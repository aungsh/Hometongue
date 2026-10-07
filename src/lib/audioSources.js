import manifest from '../data/audioManifest.json'

// Where to find a clip, and what to do when there isn't one.
// A "source" is { src } (an audio file) and/or { speech } (read aloud by the phone's own voice).

// Browsers name voices differently, so Cantonese is matched against several language tags.
const CANTONESE_TAGS = ['zh-HK', 'yue-HK', 'yue', 'zh-yue']
const COACH_TAGS = ['en-SG', 'en-GB', 'en-AU', 'en-IN', 'en-US', 'en']

/**
 * The best clip for one line of a mission.
 * `line` is 0-based. Only Cantonese may fall back to the phone's voice: a phone has no
 * Hokkien or Teochew voice, and reading those in Mandarin would teach the wrong sounds.
 */
export function phraseSource(dialectId, missionId, line, text, manifestData = manifest) {
  const src = manifestData.phrases[`${dialectId}/${missionId}-${line + 1}`] ?? null
  const speech = dialectId === 'cantonese' ? { text, langs: CANTONESE_TAGS } : null
  return { src, speech }
}

/** The coach's clip for a line id, falling back to the phone's voice. */
export function coachSource(id, text, manifestData = manifest) {
  return { src: manifestData.coach[id] ?? null, speech: { text, langs: COACH_TAGS } }
}

/** Picks the first installed voice that matches the language tags, in priority order. */
export function pickVoice(voices, langs) {
  const normal = (tag) => tag.replace('_', '-').toLowerCase()
  for (const lang of langs) {
    const wanted = normal(lang)
    const found = voices.find((voice) => {
      const have = normal(voice.lang)
      return have === wanted || have.startsWith(`${wanted}-`)
    })
    if (found) return found
  }
  return null
}
