import { useState, useEffect } from 'react'
import { sessionMs, clockDuration } from '../utils/timeUtils'
import { isHabitScheduled } from '../utils/scoreUtils'
import IconDisplay from './IconDisplay'

// "Now" strip: what matters this second — running timer, next habit, chest hint.
export default function NowBar({ activeTimer, habits, tasks, todayLog, today, dayComplete, chestReady, onToggleHabit, onStopTimer }) {
  const runningItem = activeTimer
    ? (activeTimer.type === 'habit' ? habits : tasks).find((i) => i.id === activeTimer.id)
    : null
  const nextHabit = habits.find((h) => isHabitScheduled(h, today) && h.createdAt <= today && !todayLog[h.id])

  if (!runningItem && !nextHabit && !chestReady) return null

  return (
    <div className="now-bar">
      <span className="now-label">NOW</span>
      {runningItem && (
        <span className="now-item now-item--timer">
          <IconDisplay icon={runningItem.icon} size={16} />
          <span className="now-name">{runningItem.name}</span>
          <Ticker startedAt={activeTimer.startedAt} />
          <button className="now-btn" onClick={onStopTimer} title="Stop timer">■ stop</button>
        </span>
      )}
      {!runningItem && nextHabit && (
        <span className="now-item">
          <span className="now-hint">Next up:</span>
          <IconDisplay icon={nextHabit.icon} size={16} />
          <span className="now-name">{nextHabit.name}</span>
          <button className="now-btn now-btn--go" onClick={() => onToggleHabit(nextHabit.id)} title="Mark done">✓ done</button>
        </span>
      )}
      {!runningItem && !nextHabit && chestReady && (
        <span className="now-item">🎁 Day complete — your chest is waiting below!</span>
      )}
      {dayComplete && (runningItem || nextHabit) && <span className="now-done">day ✓</span>}
    </div>
  )
}

function Ticker({ startedAt }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="now-ticker">{clockDuration(sessionMs(startedAt))}</span>
}
