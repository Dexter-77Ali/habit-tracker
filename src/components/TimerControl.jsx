import { useState, useEffect } from 'react'
import { sessionMs, compactDuration, clockDuration } from '../utils/timeUtils'

/**
 * Per-item start/stop timer control.
 * running=false: play button + compact "spent today" badge (when > 0).
 * running=true:  stop button + live h:mm:ss ticker (accumulated + current session).
 */
export default function TimerControl({ running, startedAt, spentMs = 0, onToggle, disabled }) {
  if (disabled) {
    // read-only (past day): show recorded time, no button
    return spentMs > 0 ? <span className="timer-wrap"><span className="timer-badge">{compactDuration(spentMs)}</span></span> : null
  }
  return (
    <span className="timer-wrap">
      <button
        className={`timer-btn ${running ? 'timer-btn--on' : ''}`}
        onClick={onToggle}
        aria-label={running ? 'Stop timer' : 'Start timer'}
        title={running ? 'Stop timer' : 'Start timer'}
      >
        {running ? <StopIcon /> : <PlayIcon />}
      </button>
      {running ? (
        <LiveTicker startedAt={startedAt} spentMs={spentMs} />
      ) : (
        spentMs > 0 && <span className="timer-badge">{compactDuration(spentMs)}</span>
      )}
    </span>
  )
}

// Self-ticking so only this span re-renders each second, not the whole list.
function LiveTicker({ startedAt, spentMs }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="timer-badge timer-badge--live">{clockDuration(spentMs + sessionMs(startedAt))}</span>
}

function PlayIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2.5 1.5l8 4.5-8 4.5z" />
    </svg>
  )
}
function StopIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="2" width="8" height="8" rx="1" />
    </svg>
  )
}
