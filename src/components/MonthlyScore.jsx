import { getDateKey } from '../utils/dateUtils'
import { calculateDailyXP } from '../utils/scoreUtils'

export default function MonthlyScore({ monthEarned, monthMax, monthComplete, monthDates, logs, habits, tasks = [], onNavigateDate, streakFreezes = {} }) {
  const today = getDateKey()
  const percent = monthMax > 0 ? Math.round((monthEarned / monthMax) * 100) : 0

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const calendarCells = []
  for (let i = 0; i < startDow; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateKey = getDateKey(new Date(year, month, d))
    calendarCells.push(dateKey)
  }

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className={`card month-card ${monthComplete ? 'card--complete' : ''}`}>
      <div className="card-header">
        <h3>This Month</h3>
        <span className="score-xp">
          <strong>{monthEarned.toLocaleString()}</strong> / {monthMax.toLocaleString()} XP
        </span>
      </div>

      <div className="month-calendar">
        <div className="month-calendar-header">
          {dayLabels.map((d) => (
            <span key={d} className="month-cal-day-label">{d}</span>
          ))}
        </div>
        <div className="month-calendar-grid">
          {calendarCells.map((dateKey, i) => {
            if (!dateKey) {
              return <div key={`empty-${i}`} className="month-cal-cell month-cal-cell--empty" />
            }
            const isFuture = dateKey > today
            const frozen = !!streakFreezes[dateKey]
            const { earned, max } = calculateDailyXP(logs, habits, dateKey, tasks)
            const ratio = max > 0 ? earned / max : 0
            let level = 0
            if (!isFuture && max > 0) {
              if (ratio >= 1) level = 4
              else if (ratio >= 0.75) level = 3
              else if (ratio >= 0.5) level = 2
              else if (ratio > 0) level = 1
            }
            const dayNum = parseInt(dateKey.split('-')[2], 10)
            return (
              <div
                key={dateKey}
                className={`month-cal-cell month-cal-cell--level-${level} ${isFuture ? 'month-cal-cell--future' : ''} ${dateKey === today ? 'month-cal-cell--today' : ''} ${frozen ? 'month-cal-cell--frozen' : ''}`}
                title={frozen ? `${dateKey}: Frozen ❄️` : `${dateKey}: ${earned}/${max} XP`}
                onClick={!isFuture && onNavigateDate ? () => onNavigateDate(dateKey) : undefined}
                style={!isFuture && onNavigateDate ? { cursor: 'pointer' } : undefined}
              >
                {frozen ? '❄' : dayNum}
              </div>
            )
          })}
        </div>
      </div>

      <div className="progress-track">
        <div
          className={`progress-fill ${monthComplete ? 'progress-fill--complete' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="day-progress-footer">
        <span className="progress-percent">{percent}% of month</span>
        {monthComplete && <span className="complete-text">Perfect month! 🌟</span>}
      </div>
    </div>
  )
}
