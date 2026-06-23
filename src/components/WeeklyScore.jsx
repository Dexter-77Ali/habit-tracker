import { shortDay, getDateKey } from '../utils/dateUtils'
import { isDayComplete, calculateDailyXP } from '../utils/scoreUtils'

export default function WeeklyScore({
  weekDates, weekEarned, weekMax, weekComplete,
  logs, habits, tasks = [],
  includeWeekends, onToggleWeekends,
}) {
  const today = getDateKey()
  const percent = weekMax > 0 ? Math.round((weekEarned / weekMax) * 100) : 0

  return (
    <div className={`card week-card ${weekComplete ? 'card--complete' : ''}`}>
      <div className="card-header">
        <h3>This Week</h3>
        <span className="score-xp">
          <strong>{weekEarned}</strong> / {weekMax} XP
        </span>
      </div>

      <div className="week-days">
        {weekDates.map((dateKey) => {
          const complete = isDayComplete(logs, habits, dateKey)
          const { earned, max } = calculateDailyXP(logs, habits, dateKey, tasks)
          const isFuture = dateKey > today
          const isToday = dateKey === today

          return (
            <div
              key={dateKey}
              className={`week-day ${complete ? 'week-day--complete' : ''} ${isFuture ? 'week-day--future' : ''} ${isToday ? 'week-day--today' : ''}`}
              title={`${dateKey}: ${earned}/${max} XP`}
            >
              <span className="week-day-label">{shortDay(dateKey)}</span>
              <span className="week-day-dot">
                {complete ? '✓' : isFuture ? '·' : earned > 0 ? '~' : '○'}
              </span>
              {!isFuture && max > 0 && (
                <span className="week-day-xp">{earned}</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="progress-track">
        <div
          className={`progress-fill ${weekComplete ? 'progress-fill--complete' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="week-footer">
        <span className="progress-percent">{percent}%</span>
        <label className="toggle-label">
          <input type="checkbox" checked={includeWeekends} onChange={onToggleWeekends} />
          Include weekends
        </label>
      </div>
    </div>
  )
}
