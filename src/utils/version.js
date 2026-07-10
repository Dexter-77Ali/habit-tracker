// Version compare for the in-app "Check for update" button.
// Release tags look like "v0.4.0"; @capacitor/app App.getInfo().version is "0.4.0".

export function parseVersion(v) {
  return String(v || '')
    .trim()
    .replace(/^v/i, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0)
}

/** True iff `latest` is a strictly newer version than `current`. */
export function isNewer(latest, current) {
  const a = parseVersion(latest)
  const b = parseVersion(current)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0
    const y = b[i] || 0
    if (x !== y) return x > y
  }
  return false
}

// Self-check: `node src/utils/version.js`. Guarded so it never runs in the browser bundle.
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('version.js')) {
  const assert = (c, m) => { if (!c) throw new Error('version self-check failed: ' + m) }
  assert(isNewer('v0.5.0', '0.4.0'), 'newer minor')
  assert(isNewer('v0.4.1', '0.4.0'), 'newer patch')
  assert(isNewer('1.0.0', '0.4.0'), 'newer major')
  assert(!isNewer('v0.4.0', '0.4.0'), 'equal is not newer')
  assert(!isNewer('v0.3.9', '0.4.0'), 'older is not newer')
  assert(!isNewer('0.4.0', 'v0.4.0'), 'v-prefix on current handled')
  console.log('version.js self-check passed')
}
