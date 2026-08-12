import { getDateKey, getWeekDates } from './dateUtils'
import { calculateDailyXP, isDayComplete } from './scoreUtils'

// Weekly quest arc: 3 deterministic quests per week (same for every device —
// seeded by the Monday date key), auto-awarded when their target is reached.

export const QUEST_POOL = [
  { id: 'perfect3',  label: 'Complete every habit on 3 days',  target: 3,   xp: 100, metric: 'completeDays' },
  { id: 'perfect5',  label: 'Complete every habit on 5 days',  target: 5,   xp: 200, metric: 'completeDays' },
  { id: 'xp500',     label: 'Earn 500 XP this week',           target: 500, xp: 120, metric: 'weekXp' },
  { id: 'habits15',  label: 'Check off 15 habits',             target: 15,  xp: 90,  metric: 'habitChecks' },
  { id: 'tasks5',    label: 'Finish 5 tasks this week',        target: 5,   xp: 80,  metric: 'tasksDone' },
  { id: 'timer120',  label: 'Track 2h of focused time',        target: 120, xp: 100, metric: 'timerMinutes' },
]

/** Monday-of-this-week date key — the quest week identity. */
export function weekKey(d = new Date()) {
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return getDateKey(monday)
}

/** Deterministic 3-quest pick for a week key (LCG over a string hash). */
export function weeklyQuests(key) {
  let h = 0
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) | 0
  const pool = [...QUEST_POOL]
  const picked = []
  for (let i = 0; i < 3; i++) {
    h = (Math.imul(h, 1103515245) + 12345) | 0
    picked.push(pool.splice(Math.abs(h) % pool.length, 1)[0])
  }
  return picked
}

/** Progress metrics for the current week. */
export function questMetrics({ logs, habits, tasks, timeLogs, includeWeekends }) {
  const dates = getWeekDates(new Date(), includeWeekends)
  let completeDays = 0, weekXp = 0, habitChecks = 0, timerMs = 0
  for (const d of dates) {
    if (isDayComplete(logs, habits, d)) completeDays++
    weekXp += calculateDailyXP(logs, habits, d, tasks).earned
    habitChecks += Object.values(logs[d] || {}).filter(Boolean).length
    timerMs += Object.values(timeLogs?.[d] || {}).reduce((s, ms) => s + ms, 0)
  }
  const tasksDone = (tasks || []).filter((t) => t.completed && t.completedAt && dates.includes(t.completedAt)).length
  return { completeDays, weekXp, habitChecks, tasksDone, timerMinutes: Math.floor(timerMs / 60000) }
}

/** Self-check (runs in-browser via selfCheck() since node can't resolve the app's extensionless imports). */
export function questSelfCheck() {
  const assert = (c, m) => { if (!c) throw new Error('questUtils self-check failed: ' + m) }
  const k = weekKey(new Date(2026, 7, 12)) // Wed Aug 12 2026 -> Mon Aug 10
  assert(k === '2026-08-10', 'monday key, got ' + k)
  assert(weekKey(new Date(2026, 7, 10)) === '2026-08-10', 'monday maps to itself')
  assert(weekKey(new Date(2026, 7, 16)) === '2026-08-10', 'sunday maps back to monday')
  const q1 = weeklyQuests(k), q2 = weeklyQuests(k)
  assert(q1.length === 3, '3 quests')
  assert(q1.map((q) => q.id).join() === q2.map((q) => q.id).join(), 'deterministic')
  assert(new Set(q1.map((q) => q.id)).size === 3, 'no duplicates')
  return 'questUtils self-check passed'
}
