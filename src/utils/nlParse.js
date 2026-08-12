// Natural-language quick add: "gym 7am mon/wed #health p1 tomorrow"
// Pure string parsing — no app imports so `node src/utils/nlParse.js` runs the self-check.

const DAY_NAMES = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
const PRIORITY_WORDS = { p1: 'high', p2: 'medium', p3: 'low', '!high': 'high', '!medium': 'medium', '!low': 'low' }

const pad = (n) => String(n).padStart(2, '0')
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/**
 * mode 'habit': extracts tags, frequency(+days), reminder time.
 * mode 'task':  extracts tags, priority, due date.
 * Returns { name, tags, ...fields, chips } — chips = human labels for the live preview.
 */
export function parseQuickAdd(input, { mode = 'habit', now = new Date() } = {}) {
  let rest = ` ${input.trim()} `
  const out = { tags: [] }
  const chips = []
  const eat = (re, fn) => {
    rest = rest.replace(re, (...m) => { fn(...m); return ' ' })
  }

  // #tags
  eat(/\s#([\w-]+)(?=\s)/g, (_, tag) => { out.tags.push(tag.toLowerCase()); chips.push(`#${tag.toLowerCase()}`) })

  // time "7:30", "7:30pm", "19:00", "7am" — bare integers are never times (stay in the name)
  const applyTime = (h, min, ap) => {
    let hour = parseInt(h, 10)
    if (ap?.toLowerCase() === 'pm' && hour < 12) hour += 12
    if (ap?.toLowerCase() === 'am' && hour === 12) hour = 0
    if (hour > 23) return
    const t = `${pad(hour)}:${min || '00'}`
    if (mode === 'habit') { out.reminderTimes = [t]; chips.push(`🔔 ${t}`) }
  }
  if (mode === 'habit') {
    eat(/\s(\d{1,2}):(\d{2})(am|pm)?(?=\s)/gi, (_, h, min, ap) => applyTime(h, min, ap))
    eat(/\s(\d{1,2})(am|pm)(?=\s)/gi, (_, h, ap) => applyTime(h, null, ap))
  }

  if (mode === 'habit') {
    // day lists "mon/wed/fri" or single days; keywords
    eat(/\s(daily|weekdays|every other day)(?=\s)/gi, (_, word) => {
      out.frequency = word.toLowerCase() === 'every other day' ? 'every-other-day' : word.toLowerCase()
      chips.push(out.frequency)
    })
    eat(/\s((?:sun|mon|tue|wed|thu|fri|sat)(?:\/(?:sun|mon|tue|wed|thu|fri|sat))*)(?=\s)/gi, (_, list) => {
      const days = [...new Set(list.toLowerCase().split('/').map((d) => DAY_NAMES[d]))].sort()
      out.frequency = 'custom'
      out.frequencyDays = days
      chips.push(list.toLowerCase())
    })
  }

  if (mode === 'task') {
    eat(/\s(p1|p2|p3|!high|!medium|!low)(?=\s)/gi, (_, p) => {
      out.priority = PRIORITY_WORDS[p.toLowerCase()]
      chips.push(`priority ${out.priority}`)
    })
    eat(/\s(today|tomorrow)(?=\s)/gi, (_, word) => {
      const d = new Date(now)
      if (word.toLowerCase() === 'tomorrow') d.setDate(d.getDate() + 1)
      out.dueDate = dateKey(d)
      chips.push(`due ${word.toLowerCase()}`)
    })
    eat(/\s(?:due\s+)?(?:next\s+)?(sun|mon|tue|wed|thu|fri|sat)(?=\s)/gi, (_, day) => {
      const target = DAY_NAMES[day.toLowerCase()]
      const d = new Date(now)
      const delta = ((target - d.getDay()) + 7) % 7 || 7 // next occurrence, never today
      d.setDate(d.getDate() + delta)
      out.dueDate = dateKey(d)
      chips.push(`due ${day.toLowerCase()} (${out.dueDate})`)
    })
  }

  out.name = rest.replace(/\s+/g, ' ').trim()
  out.chips = chips
  return out
}

// Self-check: node src/utils/nlParse.js
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('nlParse.js')) {
  const assert = (c, m) => { if (!c) throw new Error('nlParse self-check failed: ' + m) }
  const now = new Date(2026, 7, 12) // Wed Aug 12 2026

  const h = parseQuickAdd('gym 7am mon/wed #health', { mode: 'habit', now })
  assert(h.name === 'gym', 'habit name, got "' + h.name + '"')
  assert(h.reminderTimes?.[0] === '07:00', 'time parsed')
  assert(h.frequency === 'custom' && h.frequencyDays.join() === '1,3', 'days parsed')
  assert(h.tags.join() === 'health', 'tag parsed')

  const h2 = parseQuickAdd('read 20 pages daily 9:30pm', { mode: 'habit', now })
  assert(h2.name === 'read 20 pages', 'bare number kept in name, got "' + h2.name + '"')
  assert(h2.frequency === 'daily', 'daily keyword')
  assert(h2.reminderTimes?.[0] === '21:30', 'pm time')

  const t = parseQuickAdd('ship report tomorrow p1 #work', { mode: 'task', now })
  assert(t.name === 'ship report', 'task name')
  assert(t.dueDate === '2026-08-13', 'tomorrow date, got ' + t.dueDate)
  assert(t.priority === 'high', 'p1 = high')

  const t2 = parseQuickAdd('call plumber fri', { mode: 'task', now })
  assert(t2.dueDate === '2026-08-14', 'next fri from wed, got ' + t2.dueDate)
  const t3 = parseQuickAdd('review wed', { mode: 'task', now })
  assert(t3.dueDate === '2026-08-19', 'wed on wed = next week, got ' + t3.dueDate)

  const plain = parseQuickAdd('just a plain habit', { mode: 'habit', now })
  assert(plain.name === 'just a plain habit' && plain.chips.length === 0, 'plain input untouched')
  console.log('nlParse self-check passed')
}
