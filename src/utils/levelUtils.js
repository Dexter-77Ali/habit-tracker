export const LEVELS = [
  { level: 1,  title: 'Noob',              minXP: 0,         maxXP: 99,         icon: '/icons/015-account.png' },
  { level: 2,  title: 'Script Kiddie',      minXP: 100,       maxXP: 499,        icon: '/icons/063-terminal.png' },
  { level: 3,  title: 'Hacker',             minXP: 500,       maxXP: 1499,       icon: '/icons/002-hacker.png' },
  { level: 4,  title: 'Cracker',            minXP: 1500,      maxXP: 3999,       icon: '/icons/007-hack.png' },
  { level: 5,  title: 'Phreaker',           minXP: 4000,      maxXP: 9999,       icon: '/icons/077-phishing.png' },
  { level: 6,  title: 'Cyber Punk',         minXP: 10000,     maxXP: 24999,      icon: '/icons/142-cyber.png' },
  { level: 7,  title: 'Netrunner',          minXP: 25000,     maxXP: 44999,      icon: '/icons/072-cyber-eye.png' },
  { level: 8,  title: 'White Hat',          minXP: 45000,     maxXP: 69999,      icon: '/icons/069-white-hat.png' },
  { level: 9,  title: 'Black Hat',          minXP: 70000,     maxXP: 99999,      icon: '/icons/130-black-hat.png' },
  { level: 10, title: 'Ghost',              minXP: 100000,    maxXP: 149999,     icon: '/icons/118-anonymous.png' },
  { level: 11, title: 'Zero Day',           minXP: 150000,    maxXP: 219999,     icon: '/icons/009-cyber-attack.png' },
  { level: 12, title: 'Botmaster',          minXP: 220000,    maxXP: 299999,     icon: '/icons/068-botnet.png' },
  { level: 13, title: 'Cryptkeeper',        minXP: 300000,    maxXP: 399999,     icon: '/icons/086-encryption.png' },
  { level: 14, title: 'Shadowbroker',       minXP: 400000,    maxXP: 549999,     icon: '/icons/014-incognito.png' },
  { level: 15, title: 'Digital Wraith',     minXP: 550000,    maxXP: 749999,     icon: '/icons/029-skull.png' },
  { level: 16, title: 'Daemon Lord',        minXP: 750000,    maxXP: 999999,     icon: '/icons/166-bot.png' },
  { level: 17, title: 'Kernel Panic',       minXP: 1000000,   maxXP: 1499999,    icon: '/icons/153-error.png' },
  { level: 18, title: 'Root',               minXP: 1500000,   maxXP: Infinity,   icon: '/icons/001-rootkit.png' },
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
  return LEVELS[current.level]
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
