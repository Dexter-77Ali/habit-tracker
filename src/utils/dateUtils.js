/** Returns "YYYY-MM-DD" for the given Date (defaults to today) */
export function getDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Returns a Date from a "YYYY-MM-DD" key (local time, no UTC offset bug) */
export function dateFromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 0=Sun,1=Mon,...,6=Sat — returns true if the date is Sat or Sun */
export function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Returns array of date-key strings for Mon–Fri (or Mon–Sun) of the
 * ISO week containing `referenceDate`.
 */
export function getWeekDates(referenceDate = new Date(), includeWeekends = false) {
  const day = referenceDate.getDay() // 0=Sun
  // shift so Monday=0
  const diffToMon = (day === 0 ? -6 : 1 - day)
  const monday = new Date(referenceDate)
  monday.setDate(referenceDate.getDate() + diffToMon)

  const days = includeWeekends ? 7 : 5
  const dates = []
  for (let i = 0; i < days; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(getDateKey(d))
  }
  return dates
}

/**
 * Returns array of date-key strings from the 1st of the month up to today.
 */
export function getMonthDates(referenceDate = new Date(), includeWeekends = false) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const today = getDateKey(referenceDate)
  const dates = []
  const cursor = new Date(year, month, 1)
  while (getDateKey(cursor) <= today) {
    if (includeWeekends || !isWeekend(cursor)) {
      dates.push(getDateKey(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

/** Short weekday label Mon/Tue/… */
export function shortDay(dateKey) {
  return dateFromKey(dateKey).toLocaleDateString('en-US', { weekday: 'short' })
}

/** Formatted date like "Saturday, May 30" */
export function formatFullDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}
