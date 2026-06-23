import { getDateKey, isWeekend, dateFromKey } from './dateUtils'

/**
 * Checks if a habit is scheduled for the given date based on its frequency.
 */
export function isHabitScheduled(habit, dateKey) {
  const frequency = habit.frequency || 'daily'
  if (frequency === 'daily') return true

  const dateObj = dateFromKey(dateKey)

  switch (frequency) {
    case 'weekdays':
      return !isWeekend(dateObj)
    case '3x-week': {
      const day = dateObj.getDay()
      return day === 1 || day === 3 || day === 5
    }
    case 'every-other-day': {
      const created = dateFromKey(habit.createdAt)
      const diff = Math.floor((dateObj - created) / (1000 * 60 * 60 * 24))
      return diff % 2 === 0
    }
    case 'custom': {
      const days = habit.frequencyDays || []
      return days.includes(dateObj.getDay())
    }
    default:
      return true
  }
}

/**
 * Returns XP breakdown for a given date key.
 * habits use the logs map; tasks use their completedAt field.
 * Only counts habits that are scheduled for the given date (per frequency).
 */
export function calculateDailyXP(logs, habits, dateKey, tasks = []) {
  const dayLog = logs[dateKey] || {}

  let habitEarned = 0
  let habitMax = 0
  habits.forEach((h) => {
    if (h.createdAt <= dateKey && isHabitScheduled(h, dateKey)) {
      habitMax += h.xp
      if (dayLog[h.id]) habitEarned += h.xp
    }
  })

  let taskEarned = 0
  tasks.forEach((t) => {
    if (t.completed && t.completedAt === dateKey) {
      taskEarned += t.xp
    }
  })

  return {
    habitEarned,
    habitMax,
    taskEarned,
    earned: habitEarned + taskEarned,
    max: habitMax + taskEarned,
    totalEarned: habitEarned + taskEarned,
    totalMax: habitMax,
  }
}

export function isDayComplete(logs, habits, dateKey) {
  const dayLog = logs[dateKey] || {}
  let earned = 0
  let max = 0
  habits.forEach((h) => {
    if (h.createdAt <= dateKey && isHabitScheduled(h, dateKey)) {
      max += h.xp
      if (dayLog[h.id]) earned += h.xp
    }
  })
  return max > 0 && earned === max
}

export function aggregateXP(logs, habits, dateKeys, tasks = []) {
  let earned = 0
  let max = 0
  let taskEarned = 0
  dateKeys.forEach((key) => {
    const day = calculateDailyXP(logs, habits, key, tasks)
    earned += day.habitEarned
    max += day.habitMax
    taskEarned += day.taskEarned
  })
  return { earned: earned + taskEarned, max: max + taskEarned, habitEarned: earned, habitMax: max, taskEarned }
}

export function calculateStreak(logs, habits, includeWeekends = false, streakFreezes = {}) {
  if (!habits.length) return 0
  let streak = 0
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - 1)

  for (let i = 0; i < 365; i++) {
    const key = getDateKey(cursor)
    const weekend = isWeekend(cursor)

    if (!includeWeekends && weekend) {
      cursor.setDate(cursor.getDate() - 1)
      continue
    }

    if (streakFreezes[key]) {
      cursor.setDate(cursor.getDate() - 1)
      continue
    }

    if (isDayComplete(logs, habits, key)) {
      streak++
    } else {
      break
    }
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function getTriggerCelebration(prev, next) {
  if (!prev.dayComplete && next.dayComplete) {
    return 'Perfect day! All habits done! 🎉'
  }
  if (!prev.weekComplete && next.weekComplete) {
    return 'Flawless week! You crushed it! 🏆'
  }
  if (!prev.monthComplete && next.monthComplete) {
    return 'Unstoppable month! You\'re on fire! 🌟'
  }
  const milestones = [7, 14, 30, 60, 100]
  if (next.streak !== prev.streak) {
    const hit = milestones.find((m) => prev.streak < m && next.streak >= m)
    if (hit) return `${hit}-day streak! Keep the momentum! 🔥`
  }
  if (next.level > prev.level && next.levelTitle) {
    return `Level up! You are now: ${next.levelTitle} ${next.levelIcon || ''}`
  }
  if (next.newBadge) {
    return `Badge unlocked: ${next.newBadge} 🏅`
  }
  return null
}
