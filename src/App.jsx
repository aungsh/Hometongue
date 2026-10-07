import { useEffect } from 'react'
import { useRoute, navigate } from './router.js'
import { AppProvider, useApp } from './state/AppState.jsx'
import TabBar, { TAB_PATHS } from './components/TabBar.jsx'
import Toast from './components/Toast.jsx'
import Welcome from './screens/Welcome.jsx'
import { OnboardingDialect, OnboardingPerson } from './screens/Onboarding.jsx'
import Setup from './screens/Setup.jsx'
import Today from './screens/Today.jsx'
import MissionHub from './screens/MissionHub.jsx'
import Learn from './screens/mission/Learn.jsx'
import Practise from './screens/mission/Practise.jsx'
import Challenge from './screens/mission/Challenge.jsx'
import Reflect from './screens/mission/Reflect.jsx'
import Done from './screens/mission/Done.jsx'
import Quests from './screens/Quests.jsx'
import Friends from './screens/Friends.jsx'
import Progress from './screens/Progress.jsx'

const ROUTES = {
  '/onboarding': Welcome,
  '/onboarding/dialect': OnboardingDialect,
  '/onboarding/person': OnboardingPerson,
  '/setup': Setup,
  '/today': Today,
  '/mission': MissionHub,
  '/mission/learn': Learn,
  '/mission/practise': Practise,
  '/mission/challenge': Challenge,
  '/mission/reflect': Reflect,
  '/mission/done': Done,
  '/quests': Quests,
  '/friends': Friends,
  '/progress': Progress,
}

/** Where to send a path instead (onboarding first, unknown paths home), or null to show it. */
function redirectFor(path, { dialect, person }) {
  const inOnboarding = path.startsWith('/onboarding')
  if (!dialect || !person) {
    if (!inOnboarding || !ROUTES[path]) return dialect ? '/onboarding/person' : '/onboarding'
    if (path === '/onboarding/person' && !dialect) return '/onboarding/dialect'
    return null
  }
  if (inOnboarding || !ROUTES[path]) return '/today'
  return null
}

function Shell() {
  const path = useRoute()
  const { state } = useApp()
  const redirect = redirectFor(path, state.profile)
  const Screen = redirect ? null : ROUTES[path]

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  return (
    <div className="app" data-dialect={state.profile.dialect ?? undefined}>
      {Screen && <Screen key={path} />}
      {Screen && TAB_PATHS.includes(path) && <TabBar path={path} />}
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
