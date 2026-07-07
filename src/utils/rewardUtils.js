import { getDateKey, getWeekDates } from './dateUtils'

export const TIERS = [
  { key: 'bronze',  label: 'Bronze',  color: '#cd7f32' },
  { key: 'silver',  label: 'Silver',  color: '#c0c0c0' },
  { key: 'gold',    label: 'Gold',    color: '#ffd700' },
  { key: 'diamond', label: 'Diamond', color: '#7df9ff' },
]

// Badge families: each has 4 tier thresholds (bronze/silver/gold/diamond).
// value(profile, streak, stats) returns the metric; earned tiers = every threshold reached.
export const BADGE_FAMILIES = [
  { id: 'streak',     name: 'Streak',       icon: '/icons/043-hacker-activity.png', unit: 'day streak',         thresholds: [7, 30, 100, 365],              value: (p, s) => s },
  { id: 'xp',         name: 'XP Hoarder',   icon: '💎',                             unit: 'all-time XP',        thresholds: [1000, 10000, 100000, 1000000], value: (p) => p.allTimeXP },
  { id: 'days',       name: 'Perfect Days', icon: '🩸',                             unit: 'perfect days',       thresholds: [1, 30, 100, 365],              value: (p) => p.completedDays },
  { id: 'tasks',      name: 'Task Slayer',  icon: '/icons/007-hack.png',            unit: 'tasks done',         thresholds: [10, 50, 200, 1000],            value: (p, s, st) => st.tasksCompleted || 0 },
  { id: 'habits',     name: 'Collector',    icon: '/icons/125-growth-hacking.png',  unit: 'habits created',     thresholds: [3, 8, 15, 25],                 value: (p, s, st) => st.totalHabits || 0 },
  { id: 'challenges', name: 'Challenger',   icon: '/icons/140-attack.png',          unit: 'challenges done',    thresholds: [5, 20, 50, 200],               value: (p, s, st) => st.challengesCompleted || 0 },
  { id: 'firewall',   name: 'Firewall',     icon: '/icons/171-firewall.png',        unit: 'badge tiers earned', thresholds: [3, 8, 14, 20],                 value: (p, s, st) => st.badgeCount || 0 },
]

// Flat earned list: one entry per earned tier, id like 'streak_gold'.
// Kept flat so the celebration badgeCount trigger keeps working unchanged.
export function getEarnedBadges(profile, streak, stats = {}) {
  const earned = []
  for (const fam of BADGE_FAMILIES) {
    let v = 0
    try { v = fam.value(profile, streak, stats) } catch { v = 0 }
    fam.thresholds.forEach((t, i) => {
      if (v >= t) earned.push({
        id: `${fam.id}_${TIERS[i].key}`,
        name: `${fam.name} ${TIERS[i].label}`,
        icon: fam.icon,
        tier: TIERS[i].key,
        description: `${t.toLocaleString()} ${fam.unit}`,
      })
    })
  }
  return earned
}

// Per-family progress for the shelf UI: highest earned tier + next threshold.
export function getBadgeProgress(profile, streak, stats = {}) {
  return BADGE_FAMILIES.map(fam => {
    let v = 0
    try { v = fam.value(profile, streak, stats) } catch { v = 0 }
    let tierIndex = -1
    fam.thresholds.forEach((t, i) => { if (v >= t) tierIndex = i })
    return {
      ...fam,
      value: v,
      tierIndex,
      tier: tierIndex >= 0 ? TIERS[tierIndex] : null,
      next: tierIndex < 3 ? fam.thresholds[tierIndex + 1] : null,
    }
  })
}

// Total unlockable tier-badges (28 = 7 families x 4 tiers), used for the shelf count.
export const TOTAL_BADGES = BADGE_FAMILIES.length * TIERS.length

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
