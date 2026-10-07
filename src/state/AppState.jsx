'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { reducer, initialState, restore, currentEntry } from './reducer.js'
import { appStatus, nextStep, suggestedApp, todaysMissionId } from '../lib/logic.js'
import { DIALECTS, PEOPLE } from '../data/catalog.js'
import { getMission, missionIds } from '../data/missions.js'

// Everything lives in this browser's localStorage: no backend, no accounts.
export const STORAGE_KEY = 'hometongue:v1'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Saved progress is read after mount: the server render has no localStorage, and
  // reading it during the first render would make the browser's markup differ from the server's.
  const [ready, setReady] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let raw = null
    try {
      raw = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      // Storage blocked: start fresh and keep working in memory.
    }
    dispatch({ type: 'hydrate', state: restore(raw, new Date()) })
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage blocked (e.g. private mode): progress lasts until the tab closes.
    }
  }, [state, ready])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const showToast = useCallback((text) => setToast({ text, id: Date.now() }), [])
  const value = useMemo(() => ({ state, dispatch, ready, toast, showToast }), [state, ready, toast, showToast])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}

/** Today's mission for the chosen dialect and person, plus where it's up to. */
export function useMission() {
  const { state } = useApp()
  const { dialect, person } = state.profile
  const missionId = todaysMissionId(missionIds(person), state.history, state.profile, new Date())
  const entry = currentEntry(state, missionId)
  return {
    missionId,
    mission: getMission(person, dialect, missionId),
    dialect: DIALECTS[dialect],
    person: PEOPLE[person],
    partnerSprite: PEOPLE[person].sprite,
    entry,
    step: nextStep(entry),
    apps: appStatus(entry),
    suggested: suggestedApp(entry),
  }
}
