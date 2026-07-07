import { useState, useEffect, useRef } from 'react'
import { get, set } from 'idb-keyval'
import { syncPush } from './useSync'

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
  const idbTimer = useRef(null)

  useEffect(() => {
    if (initializedFromIdb.current) return

    const localItem = window.localStorage.getItem(key)
    if (localItem !== null) {
      initializedFromIdb.current = true
      // storedValue already holds the parsed value (or initialValue if the entry was
      // corrupt); re-parsing localItem here would throw synchronously past the .catch.
      set(key, storedValue).catch(() => {})
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
      const json = JSON.stringify(storedValue)
      window.localStorage.setItem(key, json)
      syncPush(key, storedValue)
    } catch {
      // quota exceeded or private browsing
    }

    clearTimeout(idbTimer.current)
    idbTimer.current = setTimeout(() => {
      set(key, storedValue).then(() => {
        notifySave()
      }).catch(() => {})
    }, 300)
  }, [key, storedValue])

  useEffect(() => {
    const handler = (e) => {
      if (e.detail.key === key) setStoredValue(e.detail.value)
    }
    window.addEventListener('ht-sync-update', handler)
    return () => window.removeEventListener('ht-sync-update', handler)
  }, [key])

  return [storedValue, setStoredValue]
}
