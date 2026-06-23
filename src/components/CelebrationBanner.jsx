import { useEffect } from 'react'

export default function CelebrationBanner({ message, onDismiss }) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div className="celebration-overlay" role="alert" aria-live="polite">
      <div className="celebration-banner">
        <div className="celebration-confetti" aria-hidden="true">
          {['🎊', '⭐', '🎉', '✨', '🏆'].map((c, i) => (
            <span key={i} className={`confetti-piece confetti-piece--${i + 1}`}>{c}</span>
          ))}
        </div>
        <p className="celebration-message">{message}</p>
        <button className="btn btn-ghost celebration-dismiss" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  )
}
