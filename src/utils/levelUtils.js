export const LEVELS = [
  { level: 1,  title: 'Noob',              minXP: 0,       maxXP: 99,       icon: '🐣' },
  { level: 2,  title: 'Script Kiddie',      minXP: 100,     maxXP: 499,      icon: '👶' },
  { level: 3,  title: 'Hacker',             minXP: 500,     maxXP: 1499,     icon: '💻' },
  { level: 4,  title: 'Cracker',            minXP: 1500,    maxXP: 3999,     icon: '🔓' },
  { level: 5,  title: 'Phreaker',           minXP: 4000,    maxXP: 9999,     icon: '📡' },
  { level: 6,  title: 'Cyber Punk',         minXP: 10000,   maxXP: 24999,    icon: '🤖' },
  { level: 7,  title: 'Netrunner',          minXP: 25000,   maxXP: 59999,    icon: '🌐' },
  { level: 8,  title: 'Ghost in the Shell', minXP: 60000,   maxXP: 149999,   icon: '👻' },
  { level: 9,  title: 'Zero Day',           minXP: 150000,  maxXP: 399999,   icon: '🕳️' },
  { level: 10, title: 'Root',               minXP: 400000,  maxXP: Infinity, icon: '👑' },
]

export function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getNextLevel(xp) {
  const current = getLevel(xp)
  if (current.level >= LEVELS.length) return null
  return LEVELS[current.level] // next index = current.level (since 1-based)
}

export function getLevelProgress(xp) {
  const current = getLevel(xp)
  const next = getNextLevel(xp)
  if (!next) return { current, next: null, progress: 100, xpInLevel: 0, xpNeeded: 0 }

  const xpInLevel = xp - current.minXP
  const xpNeeded = next.minXP - current.minXP
  const progress = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  return { current, next, progress, xpInLevel, xpNeeded }
}
