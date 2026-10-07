'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

/** Returns `navigate(path, { replace })`. `replace` swaps the current history entry. */
export function useNavigate() {
  const router = useRouter()
  return useCallback(
    (path, { replace = false } = {}) => (replace ? router.replace(path) : router.push(path)),
    [router],
  )
}
