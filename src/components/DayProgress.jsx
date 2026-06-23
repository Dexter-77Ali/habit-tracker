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

  return (
    <div className={`day-progress-card card ${dayComplete ? 'card--complete' : ''}`}>
      <div className="day-progress-header">
        <h3>{title}</h3>
        <span className="day-progress-xp">
          <strong>{earned}</strong> / {max} XP
        </span>
      </div>

      <div className="progress-track" aria-label={`${percent}% complete`}>
        <div
          className={`progress-fill ${dayComplete ? 'progress-fill--complete' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="day-progress-footer">
        <span className="progress-percent">{percent}%</span>
        {dayComplete && <span className="complete-text">All done! ✓</span>}
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
