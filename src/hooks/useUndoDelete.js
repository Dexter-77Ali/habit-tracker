import { useState, useRef, useCallback } from 'react'

export function useUndoDelete() {
  const [pending, setPending] = useState(null)
  const timerRef = useRef(null)

  const scheduleDelete = useCallback((item, type, onConfirm) => {
    clearTimeout(timerRef.current)
    setPending({ item, type, onConfirm })
    timerRef.current = setTimeout(() => {
      onConfirm()
      setPending(null)
    }, 5000)
  }, [])

  const undo = useCallback(() => {
    clearTimeout(timerRef.current)
    setPending(null)
  }, [])

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current)
    if (pending) pending.onConfirm()
    setPending(null)
  }, [pending])

  return { pending, scheduleDelete, undo, dismiss }
}
