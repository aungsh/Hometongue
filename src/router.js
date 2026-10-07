import { useSyncExternalStore } from 'react'

// A tiny hash router: routes live in the URL hash (#/today), so the browser and
// phone back buttons work and the build runs from any static host or folder.

const subscribe = (onChange) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const currentPath = () => window.location.hash.replace(/^#/, '') || '/'

/** The current route path, e.g. '/mission/learn'. Re-renders on navigation. */
export function useRoute() {
  return useSyncExternalStore(subscribe, currentPath)
}

/** Go to a route. `replace` swaps the current history entry instead of adding one. */
export function navigate(path, { replace = false } = {}) {
  if (replace) window.location.replace(`#${path}`)
  else window.location.hash = path
}
