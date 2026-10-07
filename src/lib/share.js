// Sharing a finished conversation: the phone's share sheet where there is one, otherwise the clipboard.

/** The message to share after a real conversation. */
export function shareText({ dialectName, partnerRef, total, streak }) {
  const parts = [`I just spoke ${dialectName} with ${partnerRef}! 🎉`]
  parts.push(total === 1 ? 'My first real conversation on Hometongue.' : `${total} real conversations so far on Hometongue.`)
  if (streak >= 2) parts.push(`${streak}-day streak.`)
  return parts.join(' ')
}

/** Resolves to 'shared', 'copied', 'cancelled' or 'failed'. Never throws. */
export async function shareOrCopy({ text, url }) {
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ text, url })
      return 'shared'
    }
  } catch (error) {
    if (error?.name === 'AbortError') return 'cancelled'
    // Any other failure: try copying below.
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}
