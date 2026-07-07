import { useEffect } from 'react'

export default function CelebrationBanner({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div className="celebration-toast" role="alert" aria-live="polite">
      <div className="celebration-toast-accent" />
      <div className="celebration-toast-content">
        <span className="celebration-toast-icon">&gt;</span>
        <p className="celebration-toast-message">{message}</p>
      </div>
      <button className="celebration-toast-close" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}
