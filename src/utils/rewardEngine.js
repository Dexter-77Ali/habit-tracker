// Variable-reward engine: crit rolls, combo bonuses, daily chest loot.
// All bonuses are recorded in ht_bonus_xp {date:{itemId:ms}} so un-toggling
// refunds exactly what was awarded.

export const CRIT_CHANCE = 0.15
export const STREAK_MILESTONES = [7, 14, 30, 50, 100, 365]

/** Returns crit multiplier (2|3|5) or 0 for no crit. ~70/25/5 split inside the 15%. */
export function rollCrit(rng = Math.random) {
  if (rng() >= CRIT_CHANCE) return 0
  const r = rng()
  return r < 0.7 ? 2 : r < 0.95 ? 3 : 5
}

/** Combo bonus for the (nBefore+1)th habit completed today: +10% per prior habit, capped +100%. */
export function comboBonus(baseXp, nBefore) {
  return Math.round(baseXp * Math.min(0.1 * nBefore, 1))
}

/** Current combo multiplier label for the UI (e.g. 1.3 when 3 habits already done). */
export function comboMult(nDone) {
  return 1 + Math.min(0.1 * nDone, 1)
}

/** Daily chest loot: mostly XP, sometimes a bonus streak freeze. */
export function rollChest(rng = Math.random) {
  const r = rng()
  if (r < 0.45) return { type: 'xp', amount: 25 + Math.floor(rng() * 4) * 25 } // 25/50/75/100
  if (r < 0.75) return { type: 'xp', amount: 150 }
  if (r < 0.92) return { type: 'freeze', amount: 1 }
  return { type: 'xp', amount: 300 } // jackpot
}

/** First milestone crossed moving prevStreak -> nextStreak, or 0. */
export function crossedMilestone(prevStreak, nextStreak) {
  return STREAK_MILESTONES.find((m) => prevStreak < m && nextStreak >= m) || 0
}

// Self-check: node src/utils/rewardEngine.js
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('rewardEngine.js')) {
  const assert = (c, m) => { if (!c) throw new Error('rewardEngine self-check failed: ' + m) }
  assert(rollCrit(() => 0.99) === 0, 'no crit above chance')
  assert(rollCrit((() => { const seq = [0.01, 0.5]; return () => seq.shift() })()) === 2, 'common crit = x2')
  assert(rollCrit((() => { const seq = [0.01, 0.96]; return () => seq.shift() })()) === 5, 'rare crit = x5')
  assert(comboBonus(30, 0) === 0, 'first habit no combo')
  assert(comboBonus(30, 3) === 9, '4th habit +30%')
  assert(comboBonus(30, 15) === 30, 'combo capped at +100%')
  assert(comboMult(5) === 1.5, 'mult label')
  assert(rollChest(() => 0.999).amount === 300, 'jackpot path')
  assert(rollChest((() => { const seq = [0.8, 0]; return () => seq.shift() })()).type === 'freeze', 'freeze path')
  assert(crossedMilestone(6, 7) === 7, 'hit 7')
  assert(crossedMilestone(7, 8) === 0, 'no re-fire')
  assert(crossedMilestone(20, 35) === 30, 'jump across 30')
  console.log('rewardEngine self-check passed')
}
