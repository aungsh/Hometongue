'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AppProvider, useApp } from '@/state/AppState.jsx'
import { redirectFor } from '@/lib/routes.js'
import { useNavigate } from '@/lib/useNavigate.js'
import TabBar, { TAB_PATHS } from '@/components/TabBar.jsx'
import Toast from '@/components/Toast.jsx'

function Shell({ children }) {
  const path = usePathname()
  const navigate = useNavigate()
  const { state, ready } = useApp()
  const redirect = ready ? redirectFor(path, state.profile) : null

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect, navigate])

  // Nothing is drawn until saved progress has loaded, so server and browser markup match.
  const show = ready && !redirect

  return (
    <div className="app" data-dialect={state.profile.dialect ?? undefined}>
      {show && children}
      {show && TAB_PATHS.includes(path) && <TabBar path={path} />}
      <Toast />
    </div>
  )
}

export default function AppLayout({ children }) {
  return (
    <AppProvider>
      <Shell>{children}</Shell>
    </AppProvider>
  )
}
