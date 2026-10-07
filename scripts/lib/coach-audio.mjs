// Helpers for scripts/generate-coach-audio.mjs. Pure, so they can be tested without a network.
import { createHash } from 'node:crypto'

/** Fingerprint of everything that changes the audio, so edited lines are regenerated. */
export function lineHash(text, settings) {
  return createHash('sha1')
    .update(JSON.stringify([text, settings.voiceId, settings.model ?? null, settings.speed ?? null]))
    .digest('hex')
    .slice(0, 12)
}

/**
 * Which lines need audio made. `lock` maps id → hash of what was last generated;
 * `hasFile(id)` says whether the clip is on disk.
 */
export function planGeneration(lines, lock, settings, { hasFile, force = false, only = null }) {
  return Object.entries(lines)
    .filter(([id]) => !only || id.startsWith(only))
    .map(([id, text]) => {
      const hash = lineHash(text, settings)
      const upToDate = hasFile(id) && lock[id] === hash
      return { id, text, hash, generate: force || !upToDate }
    })
}
