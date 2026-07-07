import { getDateKey, dateFromKey } from '../utils/dateUtils'
import { calculateDailyXP, isHabitScheduled } from '../utils/scoreUtils'

export default function AnalyticsPage({ habits, tasks, logs, tagColors, allTags, includeWeekends }) {
  const today = getDateKey()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const lastDay = new Date(year, month + 1, 0)
  const totalDays = lastDay.getDate()

  const monthDays = []
  for (let d = 1; d <= totalDays; d++) {
    monthDays.push(getDateKey(new Date(year, month, d)))
  }

  // Trend data: last 30 days of total XP
  const trendDays = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    trendDays.push(getDateKey(d))
  }
  const trendData = trendDays.map((dateKey) => {
    const xp = calculateDailyXP(logs, habits, dateKey, tasks)
    return { dateKey, earned: xp.earned, max: xp.max }
  })

  // Per-habit completion rates (last 30 days)
  const habitRates = habits.map(h => {
    let scheduled = 0, completed = 0
    trendDays.forEach(dk => {
      if (h.createdAt > dk) return
      if (!isHabitScheduled(h, dk)) return
      scheduled++
      if ((logs[dk] || {})[h.id]) completed++
    })
    const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0
    return { name: h.name, icon: h.icon, completed, scheduled, rate }
  }).sort((a, b) => b.rate - a.rate)

  // Weekly comparison
  const thisWeekDays = []
  const lastWeekDays = []
  const dayOfWeek = now.getDay()
  for (let i = 0; i <= dayOfWeek; i++) {
    const d = new Date(); d.setDate(d.getDate() - (dayOfWeek - i))
    thisWeekDays.push(getDateKey(d))
  }
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - dayOfWeek - 7 + i)
    lastWeekDays.push(getDateKey(d))
  }
  const thisWeekXP = thisWeekDays.reduce((s, dk) => s + calculateDailyXP(logs, habits, dk, tasks).earned, 0)
  const lastWeekXP = lastWeekDays.reduce((s, dk) => s + calculateDailyXP(logs, habits, dk, tasks).earned, 0)
  const weekDiff = lastWeekXP > 0 ? Math.round(((thisWeekXP - lastWeekXP) / lastWeekXP) * 100) : 0

  const getTagXPForDay = (tag, dateKey) => {
    const dayLog = logs[dateKey] || {}
    let earned = 0
    let max = 0

    habits.forEach((h) => {
      if (!(h.tags || []).includes(tag)) return
      if (h.createdAt > dateKey) return
      max += h.xp
      if (dayLog[h.id]) earned += h.xp
    })

    tasks.forEach((t) => {
      if (!(t.tags || []).includes(tag)) return
      if (t.completed && t.completedAt === dateKey) earned += t.xp
    })

    return { earned, max }
  }

  const tagStats = allTags.map((tag) => {
    let monthEarned = 0
    let monthMax = 0
    const habitCount = habits.filter((h) => (h.tags || []).includes(tag)).length
    const taskCount = tasks.filter((t) => (t.tags || []).includes(tag)).length

    const dailyData = monthDays.map((dateKey) => {
      const { earned, max } = getTagXPForDay(tag, dateKey)
      monthEarned += earned
      monthMax += max
      return { dateKey, earned, max }
    })

    return { tag, monthEarned, monthMax, habitCount, taskCount, dailyData, color: tagColors[tag] || '#888' }
  })

  const totalMonthXP = tagStats.reduce((sum, s) => sum + s.monthEarned, 0)
  const totalMonthMax = tagStats.reduce((sum, s) => sum + s.monthMax, 0)

  if (allTags.length === 0) {
    return (
      <div className="analytics-page">
        <h2 className="analytics-title">Analytics</h2>
        <TrendChart data={trendData} />

        <div className="analytics-section">
          <h3>Weekly Comparison</h3>
          <div className="week-comparison">
            <div className="week-stat"><span className="week-label">This week</span><span className="week-value">{thisWeekXP} XP</span></div>
            <div className="week-stat"><span className="week-label">Last week</span><span className="week-value">{lastWeekXP} XP</span></div>
            <span className={`week-diff ${weekDiff >= 0 ? 'week-diff--up' : 'week-diff--down'}`}>{weekDiff >= 0 ? '+' : ''}{weekDiff}%</span>
          </div>
        </div>

        {habitRates.length > 0 && (
          <div className="analytics-section">
            <h3>Habit Completion Rates — 30 Days</h3>
            <ul className="habit-rates-list">
              {habitRates.map(h => (
                <li key={h.name} className="habit-rate-item">
                  <span className="habit-rate-icon">{h.icon}</span>
                  <span className="habit-rate-name">{h.name}</span>
                  <div className="habit-rate-bar-track"><div className="habit-rate-bar-fill" style={{ width: `${h.rate}%` }} /></div>
                  <span className="habit-rate-pct">{h.rate}%</span>
                  <span className="habit-rate-count">{h.completed}/{h.scheduled}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="analytics-empty">
          <p>No tags found. Add tags to your habits and tasks to see category heatmaps.</p>
          <p>Edit a habit or task and type tags like "Cyber", "Health", "Admin" to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <h2 className="analytics-title">Category Analytics — {monthLabel}</h2>

      <TrendChart data={trendData} />

      <div className="analytics-section">
        <h3>Weekly Comparison</h3>
        <div className="week-comparison">
          <div className="week-stat">
            <span className="week-label">This week</span>
            <span className="week-value">{thisWeekXP} XP</span>
          </div>
          <div className="week-stat">
            <span className="week-label">Last week</span>
            <span className="week-value">{lastWeekXP} XP</span>
          </div>
          <span className={`week-diff ${weekDiff >= 0 ? 'week-diff--up' : 'week-diff--down'}`}>
            {weekDiff >= 0 ? '+' : ''}{weekDiff}%
          </span>
        </div>
      </div>

      {habitRates.length > 0 && (
        <div className="analytics-section">
          <h3>Habit Completion Rates — 30 Days</h3>
          <ul className="habit-rates-list">
            {habitRates.map(h => (
              <li key={h.name} className="habit-rate-item">
                <span className="habit-rate-icon">{h.icon}</span>
                <span className="habit-rate-name">{h.name}</span>
                <div className="habit-rate-bar-track">
                  <div className="habit-rate-bar-fill" style={{ width: `${h.rate}%` }} />
                </div>
                <span className="habit-rate-pct">{h.rate}%</span>
                <span className="habit-rate-count">{h.completed}/{h.scheduled}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="analytics-cards">
        {tagStats.map(({ tag, monthEarned, monthMax, habitCount, taskCount, color }) => (
          <div key={tag} className="analytics-card">
            <div className="analytics-card-header">
              <span className="analytics-card-dot" style={{ background: color }} />
              <span className="analytics-card-name">{tag}</span>
            </div>
            <div className="analytics-card-xp">{monthEarned} <span className="analytics-card-xp-max">/ {monthMax} XP</span></div>
            <div className="analytics-card-progress">
              <div className="analytics-card-progress-track">
                <div
                  className="analytics-card-progress-fill"
                  style={{ width: `${monthMax > 0 ? (monthEarned / monthMax) * 100 : 0}%`, background: color }}
                />
              </div>
            </div>
            <div className="analytics-card-counts">
              {habitCount > 0 && <span>{habitCount} habit{habitCount > 1 ? 's' : ''}</span>}
              {taskCount > 0 && <span>{taskCount} task{taskCount > 1 ? 's' : ''}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-section">
        <h3>Energy Balance</h3>
        {totalMonthXP === 0 && totalMonthMax > 0 ? (
          <p className="analytics-hint">Complete some tagged habits to see your energy balance here.</p>
        ) : totalMonthXP === 0 ? (
          <p className="analytics-hint">No activity yet this month.</p>
        ) : (
          <>
            <div className="balance-bar">
              {tagStats.filter((s) => s.monthEarned > 0).map(({ tag, monthEarned, color }) => {
                const pct = totalMonthXP > 0 ? (monthEarned / totalMonthXP) * 100 : 0
                return (
                  <div
                    key={tag}
                    className="balance-segment"
                    style={{ width: `${pct}%`, background: color }}
                    title={`${tag}: ${Math.round(pct)}%`}
                  />
                )
              })}
            </div>
            <div className="balance-legend">
              {tagStats.map(({ tag, monthEarned, color }) => {
                const pct = totalMonthXP > 0 ? Math.round((monthEarned / totalMonthXP) * 100) : 0
                const isLow = pct > 0 && pct < 10 && tagStats.filter((s) => s.monthEarned > 0).length > 2
                const isDark = monthEarned === 0
                return (
                  <span key={tag} className={`balance-legend-item ${isLow ? 'balance-legend-item--warning' : ''} ${isDark ? 'balance-legend-item--dark' : ''}`}>
                    <span className="balance-legend-dot" style={{ background: color }} />
                    {tag} ({pct}%)
                    {isLow && <span className="balance-warning"> !</span>}
                    {isDark && <span className="balance-warning"> dark</span>}
                  </span>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="analytics-section">
        <h3>Category Heatmaps</h3>
        <div className="tag-heatmaps">
          {tagStats.map(({ tag, dailyData, color }) => (
            <div key={tag} className="tag-heatmap-row">
              <div className="tag-heatmap-label">
                <span className="tag-heatmap-dot" style={{ background: color }} />
                <span>{tag}</span>
              </div>
              <div className="tag-heatmap-cells">
                {dailyData.map(({ dateKey, earned, max }) => {
                  const isFuture = dateKey > today
                  const ratio = max > 0 ? earned / max : (earned > 0 ? 1 : 0)
                  let opacity = 0.08
                  if (!isFuture && max > 0) {
                    if (ratio >= 1) opacity = 1
                    else if (ratio >= 0.75) opacity = 0.8
                    else if (ratio >= 0.5) opacity = 0.6
                    else if (ratio > 0) opacity = 0.35
                    else opacity = 0.15
                  }
                  return (
                    <div
                      key={dateKey}
                      className={`tag-heatmap-cell ${isFuture ? 'tag-heatmap-cell--future' : ''}`}
                      style={{ background: isFuture ? undefined : color, opacity: isFuture ? 0.08 : opacity }}
                      title={`${dateKey}: ${earned}${max > 0 ? '/' + max : ''} XP`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="analytics-heatmap-hint">Brighter = more of that day's possible XP earned. Dim = habit existed but wasn't completed.</p>
      </div>
    </div>
  )
}

function TrendChart({ data }) {
  const W = 700
  const H = 160
  const PAD_TOP = 20
  const PAD_BOTTOM = 30
  const PAD_LEFT = 40
  const PAD_RIGHT = 10
  const chartW = W - PAD_LEFT - PAD_RIGHT
  const chartH = H - PAD_TOP - PAD_BOTTOM

  const maxEarned = Math.max(...data.map((d) => d.earned), 1)
  const points = data.map((d, i) => {
    const x = PAD_LEFT + (i / (data.length - 1)) * chartW
    const y = PAD_TOP + chartH - (d.earned / maxEarned) * chartH
    return { x, y, ...d }
  })

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `${PAD_LEFT},${PAD_TOP + chartH} ${linePoints} ${PAD_LEFT + chartW},${PAD_TOP + chartH}`

  const yTicks = [0, Math.round(maxEarned / 2), maxEarned]

  return (
    <div className="analytics-section trend-chart-section">
      <h3>XP Trend — Last 30 Days</h3>
      <div className="trend-chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="trend-chart-svg" preserveAspectRatio="none">
          <polygon points={areaPoints} className="trend-area" />
          <polyline points={linePoints} className="trend-line" fill="none" />

          {yTicks.map((val) => {
            const y = PAD_TOP + chartH - (val / maxEarned) * chartH
            return (
              <g key={val}>
                <line x1={PAD_LEFT} y1={y} x2={PAD_LEFT + chartW} y2={y} className="trend-grid-line" />
                <text x={PAD_LEFT - 6} y={y + 4} className="trend-y-label" textAnchor="end">{val}</text>
              </g>
            )
          })}

          {points.filter((_, i) => i % 5 === 0 || i === data.length - 1).map((p, idx) => (
            <text key={idx} x={p.x} y={H - 6} className="trend-x-label" textAnchor="middle">
              {p.dateKey.slice(5)}
            </text>
          ))}

          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" className="trend-dot">
              <title>{p.dateKey}: {p.earned} XP</title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  )
}
