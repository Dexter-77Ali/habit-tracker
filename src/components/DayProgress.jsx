import { useState, useEffect, useRef } from 'react'
import { getDateKey, dateFromKey } from '../utils/dateUtils'

export default function DayProgress({ earned, max, dayComplete, habitEarned, taskEarned, viewedDate }) {
  const percent = max > 0 ? Math.round((earned / max) * 100) : 0
  const today = getDateKey()
  const isToday = !viewedDate || viewedDate === today

  let title = "Today's Progress"
  if (!isToday && viewedDate) {
    const d = dateFromKey(viewedDate)
    title = `Progress for ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  const [displayXP, setDisplayXP] = useState(earned)
  const prevEarned = useRef(earned)

  useEffect(() => {
    const from = prevEarned.current
    const to = earned
    prevEarned.current = to

    if (from === to) { setDisplayXP(to); return }

    const duration = 600
    const start = performance.now()
    let raf

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayXP(Math.round(from + (to - from) * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [earned])

  const size = 80
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className={`day-progress-card card ${dayComplete ? 'card--complete' : ''}`}>
      <div className="day-progress-header">
        <div className="day-progress-ring-wrap">
          <svg width={size} height={size} className="day-progress-ring" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="var(--surface-2)" strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke={dayComplete ? 'var(--success)' : 'var(--primary)'} strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="day-progress-ring-fill"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
            <text
              x="50%" y="50%"
              textAnchor="middle" dominantBaseline="central"
              className="day-progress-ring-text"
            >
              {percent}%
            </text>
          </svg>
        </div>
        <div className="day-progress-info">
          <h3>{title}</h3>
          <span className="day-progress-xp">
            <strong>{displayXP}</strong> / {max} XP
          </span>
          {dayComplete && <span className="complete-text">All done! ✓</span>}
        </div>
      </div>

      {(habitEarned > 0 || taskEarned > 0) && (
        <div className="xp-breakdown">
          <span className="xp-breakdown-item">Habits: {habitEarned} XP</span>
          {taskEarned > 0 && (
            <span className="xp-breakdown-item xp-breakdown-task">Tasks: {taskEarned} XP</span>
          )}
        </div>
      )}
    </div>
  )
}
