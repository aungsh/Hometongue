/**
 * Where to send someone instead of `path`, or null to show it.
 * First-time visitors are walked through onboarding; finished users skip it.
 */
export function redirectFor(path, { dialect, person }) {
  const inOnboarding = path.startsWith('/onboarding')
  if (!dialect || !person) {
    if (!inOnboarding) return dialect ? '/onboarding/person' : '/onboarding'
    if (path === '/onboarding/person' && !dialect) return '/onboarding/dialect'
    return null
  }
  return inOnboarding ? '/today' : null
}
