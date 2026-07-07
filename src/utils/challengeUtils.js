import { isHabitScheduled } from './scoreUtils'

function seededRng(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function hashDateKey(dateKey) {
  let h = 0
  for (let i = 0; i < dateKey.length; i++) {
    h = ((h << 5) - h + dateKey.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const CHALLENGE_TEMPLATES = [
  { id: 'complete_n', gen: (rng, habits) => {
    const n = Math.min(habits.length, Math.max(2, Math.floor(rng() * habits.length) + 1))
    return { type: 'complete_n', label: `Complete ${n} habit${n > 1 ? 's' : ''}`, target: n, xp: 20 }
  }},
  { id: 'earn_xp', gen: (rng, habits) => {
    const maxXp = habits.reduce((s, h) => s + h.xp, 0)
    const target = Math.max(10, Math.floor(maxXp * (0.3 + rng() * 0.4) / 10) * 10)
    return { type: 'earn_xp', label: `Earn ${target} XP from habits`, target, xp: 20 }
  }},
  { id: 'complete_all', gen: () => {
    return { type: 'complete_all', label: 'Complete ALL habits today', target: null, xp: 30 }
  }},
  { id: 'complete_group', gen: (rng, _habits, groups) => {
    if (!groups.length) return null
    const g = groups[Math.floor(rng() * groups.length)]
    return { type: 'complete_group', label: `Complete all "${g.name}" habits`, target: g.id, xp: 25 }
  }},
  { id: 'streak_keep', gen: () => {
    return { type: 'streak_keep', label: 'Keep your streak alive', target: null, xp: 15 }
  }},
]

export function generateDailyChallenges(habits, groups, dateKey) {
  const scheduled = habits.filter(h => h.createdAt <= dateKey && isHabitScheduled(h, dateKey))
  if (scheduled.length === 0) return []

  const rng = seededRng(hashDateKey(dateKey))
  const pool = CHALLENGE_TEMPLATES.map(t => t.gen(rng, scheduled, groups)).filter(Boolean)
  const shuffled = pool.sort(() => rng() - 0.5)
  return shuffled.slice(0, 3).map((c, i) => ({ ...c, id: `${dateKey}_${i}` }))
}

export function checkChallengeComplete(challenge, habits, logs, dateKey, groups) {
  const dayLog = logs[dateKey] || {}
  const scheduled = habits.filter(h => h.createdAt <= dateKey && isHabitScheduled(h, dateKey))

  switch (challenge.type) {
    case 'complete_n': {
      const done = scheduled.filter(h => dayLog[h.id]).length
      return done >= challenge.target
    }
    case 'earn_xp': {
      const xp = scheduled.reduce((s, h) => s + (dayLog[h.id] ? h.xp : 0), 0)
      return xp >= challenge.target
    }
    case 'complete_all':
      return scheduled.length > 0 && scheduled.every(h => dayLog[h.id])
    case 'complete_group': {
      const groupHabits = scheduled.filter(h => h.groupId === challenge.target)
      return groupHabits.length > 0 && groupHabits.every(h => dayLog[h.id])
    }
    case 'streak_keep': {
      const done = scheduled.filter(h => dayLog[h.id]).length
      return done >= Math.ceil(scheduled.length * 0.5)
    }
    default:
      return false
  }
}
