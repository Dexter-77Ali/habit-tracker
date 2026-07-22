// Time-tracking helpers for the per-item start/stop timer.
// Durations accumulate per day in ht_time_logs: { [dateKey]: { [itemId]: ms } }.

export const MAX_SESSION_MS = 12 * 60 * 60 * 1000 // runaway cap: forgot-to-stop sessions credit at most 12h

/** Elapsed ms of a running session, clamped to the cap; clock-skew (future start) counts as 0. */
export function sessionMs(startedAt, now = Date.now()) {
  const ms = now - startedAt
  if (ms <= 0) return 0
  return Math.min(ms, MAX_SESSION_MS)
}

/** Compact badge form: "45s" | "12m" | "1h 23m". */
export function compactDuration(ms) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

/** Live ticker form: "m:ss" | "h:mm:ss". */
export function clockDuration(ms) {
  const s = Math.floor(ms / 1000)
  const sec = String(s % 60).padStart(2, '0')
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}:${sec}`
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${sec}`
}

// Self-check: node src/utils/timeUtils.js (guard keeps it out of the browser bundle's execution)
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('timeUtils.js')) {
  const assert = (c, m) => { if (!c) throw new Error('timeUtils self-check failed: ' + m) }
  assert(compactDuration(45_000) === '45s', '45s')
  assert(compactDuration(12 * 60_000) === '12m', '12m')
  assert(compactDuration(83 * 60_000) === '1h 23m', '1h 23m')
  assert(clockDuration(83_000) === '1:23', 'm:ss')
  assert(clockDuration(3_723_000) === '1:02:03', 'h:mm:ss')
  assert(sessionMs(Date.now() - 1000) >= 900, '~1s session')
  assert(sessionMs(Date.now() - 13 * 3_600_000) === MAX_SESSION_MS, '12h cap')
  assert(sessionMs(Date.now() + 5000) === 0, 'future start = 0')
  console.log('timeUtils self-check passed')
}
