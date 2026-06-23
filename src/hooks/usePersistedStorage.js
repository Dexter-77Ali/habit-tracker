import { useState, useEffect, useRef } from 'react'
import { get, set } from 'idb-keyval'

let saveTimestamp = null
const saveListeners = new Set()

function notifySave() {
  saveTimestamp = Date.now()
  saveListeners.forEach((fn) => fn(saveTimestamp))
}

export function useSaveIndicator() {
  const [lastSaved, setLastSaved] = useState(saveTimestamp)

  useEffect(() => {
    const handler = (ts) => setLastSaved(ts)
    saveListeners.add(handler)
    return () => saveListeners.delete(handler)
  }, [])

  return lastSaved
}

export function usePersistedStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const initializedFromIdb = useRef(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (initializedFromIdb.current) return

    const localItem = window.localStorage.getItem(key)
    if (localItem !== null) {
      initializedFromIdb.current = true
      set(key, JSON.parse(localItem)).catch(() => {})
      return
    }

    get(key).then((idbValue) => {
      initializedFromIdb.current = true
      if (idbValue !== undefined) {
        setStoredValue(idbValue)
      }
    }).catch(() => {
      initializedFromIdb.current = true
    })
  }, [key])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // quota exceeded or private browsing
    }

    set(key, storedValue).then(() => {
      notifySave()
    }).catch(() => {})
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
