import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { reducer, initialState, restore, currentEntry } from './reducer.js'
import { appStatus, nextStep, suggestedApp } from '../lib/logic.js'
import { DIALECTS, PEOPLE } from '../data/catalog.js'
import { getMission } from '../data/missions.js'

// Everything lives in this browser's localStorage: no backend, no accounts.
const STORAGE_KEY = 'hometongue:v1'

const AppContext = createContext(null)

function loadSaved() {
  try {
    return restore(window.localStorage.getItem(STORAGE_KEY), new Date())
  } catch {
    return initialState
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadSaved)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage blocked (e.g. private mode): the prototype keeps working in memory.
    }
  }, [state])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const showToast = useCallback((text) => setToast({ text, id: Date.now() }), [])
  const value = useMemo(() => ({ state, dispatch, toast, showToast }), [state, toast, showToast])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}

/** Today's mission for the chosen dialect and person, plus where it's up to. */
export function useMission() {
  const { state } = useApp()
  const { dialect, person } = state.profile
  const entry = currentEntry(state)
  return {
    mission: getMission(person, dialect),
    dialect: DIALECTS[dialect],
    person: PEOPLE[person],
    partnerSprite: PEOPLE[person].sprite,
    entry,
    step: nextStep(entry),
    apps: appStatus(entry),
    suggested: suggestedApp(entry),
  }
}
