import { getDateKey, getWeekDates } from './dateUtils'

export const BUILTIN_BADGES = [
  { id: 'badge_first_blood', name: 'First Blood',  icon: '🩸', description: 'Complete your first perfect day', condition: 'firstDay' },
  { id: 'badge_consistent', name: 'Consistent',     icon: '🔗', description: '7-day streak',                  condition: 'streak7' },
  { id: 'badge_addicted',   name: 'Addicted',       icon: '💉', description: '30-day streak',                 condition: 'streak30' },
  { id: 'badge_centurion',  name: 'Centurion',      icon: '🛡️', description: 'Reach 100 all-time XP',        condition: 'xp100' },
  { id: 'badge_1k',         name: '1K Club',        icon: '💎', description: 'Reach 1,000 all-time XP',       condition: 'xp1000' },
  { id: 'badge_legend',     name: 'Legend',          icon: '🏅', description: 'Reach 10,000 all-time XP',      condition: 'xp10000' },
]

export function getEarnedBadges(profile, streak) {
  const earned = []
  BUILTIN_BADGES.forEach((badge) => {
    let unlocked = false
    switch (badge.condition) {
      case 'firstDay':  unlocked = profile.completedDays >= 1; break
      case 'streak7':   unlocked = streak >= 7; break
      case 'streak30':  unlocked = streak >= 30; break
      case 'xp100':     unlocked = profile.allTimeXP >= 100; break
      case 'xp1000':    unlocked = profile.allTimeXP >= 1000; break
      case 'xp10000':   unlocked = profile.allTimeXP >= 10000; break
    }
    if (unlocked) earned.push(badge)
  })
  return earned
}

/**
 * Returns the period key used for tracking claims:
 * - daily:   "2026-05-30"
 * - weekly:  "2026-W22" (ISO week start Monday date key)
 * - monthly: "2026-05"
 */
export function getPeriodKey(scope, includeWeekends) {
  const now = new Date()
  if (scope === 'daily') return getDateKey(now)
  if (scope === 'weekly') {
    const weekDates = getWeekDates(now, includeWeekends)
    return weekDates[0] // Monday's date as key
  }
  if (scope === 'monthly') {
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }
  return getDateKey(now)
}

export function isRewardClaimable(reward, xpByScope, includeWeekends) {
  const periodKey = getPeriodKey(reward.scope, includeWeekends)
  const alreadyClaimed = (reward.claimedDates || []).includes(periodKey)

  if (alreadyClaimed) {
    if (!reward.repeatable) return { claimable: false, reason: 'claimed' }
    return { claimable: false, reason: 'claimed_this_period' }
  }

  if (!reward.repeatable && reward.claimedDates?.length > 0) {
    return { claimable: false, reason: 'one_time_done' }
  }

  const earned = xpByScope[reward.scope] || 0
  if (earned >= reward.xpThreshold) {
    return { claimable: true, reason: 'eligible' }
  }

  return { claimable: false, reason: 'not_enough_xp', current: earned, needed: reward.xpThreshold }
}
