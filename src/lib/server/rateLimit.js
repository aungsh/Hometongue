// A small in-memory limiter. Serverless hosts run several copies of the app, each with its own
// memory, so this slows down abuse but can't stop it: also set a spending limit with your AI provider.

/**
 * `limit` requests per `windowMs` for each key. `now` is injectable for tests.
 * Returns { allowed, retryAfterSeconds }.
 */
export function createLimiter({ limit, windowMs, now = () => Date.now(), maxKeys = 5000 }) {
  const hits = new Map() // key → timestamps inside the window

  return function check(key) {
    const t = now()
    const recent = (hits.get(key) ?? []).filter((time) => t - time < windowMs)
    if (recent.length >= limit) {
      hits.set(key, recent)
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - t) / 1000)) }
    }
    recent.push(t)
    // Forget keys we haven't seen for a while so memory can't grow without bound.
    if (!hits.has(key) && hits.size >= maxKeys) {
      for (const [k, times] of hits) if (times.every((time) => t - time >= windowMs)) hits.delete(k)
      if (hits.size >= maxKeys) hits.clear()
    }
    hits.set(key, recent)
    return { allowed: true, retryAfterSeconds: 0 }
  }
}
