import { useEffect } from 'react'

// message: string, or { text, epic:true } for milestone celebrations (confetti, longer stay)
export default function CelebrationBanner({ message, onDismiss }) {
  const epic = typeof message === 'object' && message?.epic
  const text = typeof message === 'object' ? message?.text : message

  useEffect(() => {
    const timer = setTimeout(onDismiss, epic ? 7000 : 4000)
    return () => clearTimeout(timer)
  }, [message, onDismiss, epic])

  return (
    <div className={`celebration-toast ${epic ? 'celebration-toast--epic' : ''}`} role="alert" aria-live="polite">
      {epic && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i} className={`confetti-bit confetti-bit--${i % 6}`} />)}
        </div>
      )}
      <div className="celebration-toast-accent" />
      <div className="celebration-toast-content">
        <span className="celebration-toast-icon">&gt;</span>
        <p className="celebration-toast-message">{text}</p>
      </div>
      <button className="celebration-toast-close" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}
