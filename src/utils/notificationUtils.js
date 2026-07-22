import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const REMINDER_ID = 77
const NUDGE_ID = 78
const HABIT_ID_BASE = 1000 // per-habit reminder ids live at >= 1000, 4 slots per habit

export const canNotify = () => Capacitor.isNativePlatform()

const TIME_RE = /^\d{1,2}:\d{2}$/

// Stable numeric id for habit+slot so rescheduling replaces instead of piling up.
// ponytail: 31-hash % 1e6 — collision odds tiny, worst case one habit's slot overwrites another's.
function habitNotifId(habitId, slot) {
  let h = 0
  for (let i = 0; i < habitId.length; i++) h = (h * 31 + habitId.charCodeAt(i)) | 0
  return HABIT_ID_BASE + (Math.abs(h) % 1_000_000) * 4 + slot
}

/** Per-habit reminders: habit.reminderTimes = ["07:00","19:30"] (max 4). Cancels stale, reschedules all. */
export async function scheduleHabitReminders(habits) {
  if (!canNotify()) return
  const { display } = await LocalNotifications.requestPermissions()
  if (display !== 'granted') return
  try {
    const pending = await LocalNotifications.getPending()
    const stale = (pending.notifications || []).filter((n) => n.id >= HABIT_ID_BASE)
    if (stale.length) await LocalNotifications.cancel({ notifications: stale.map((n) => ({ id: n.id })) })
  } catch { /* nothing pending */ }
  const notifications = []
  for (const habit of habits || []) {
    const times = (habit.reminderTimes || []).filter((t) => TIME_RE.test(t)).slice(0, 4)
    times.forEach((t, slot) => {
      const [hour, minute] = t.split(':').map(Number)
      notifications.push({
        id: habitNotifId(habit.id, slot),
        title: habit.name,
        body: 'Time for this habit — keep the chain going ⚡',
        schedule: { on: { hour, minute }, allowWhileIdle: true }, // repeats daily
      })
    })
  }
  if (notifications.length) await LocalNotifications.schedule({ notifications })
}

/** Evening re-nudge: one daily sweep reminder for still-open habits. time "HH:MM" | null to disable. */
export async function scheduleEveningNudge(time) {
  if (!canNotify()) return
  try {
    await LocalNotifications.cancel({ notifications: [{ id: NUDGE_ID }] })
  } catch { /* nothing scheduled yet */ }
  if (!time || !TIME_RE.test(time)) return
  const { display } = await LocalNotifications.requestPermissions()
  if (display !== 'granted') return
  const [hour, minute] = time.split(':').map(Number)
  await LocalNotifications.schedule({
    notifications: [{
      id: NUDGE_ID,
      title: 'Life Tracker',
      body: 'Evening sweep — any habits still open? Finish the day strong 🔥',
      schedule: { on: { hour, minute }, allowWhileIdle: true },
    }],
  })
}

// time: "HH:MM" string or null to disable. Reschedules idempotently.
export async function scheduleDailyReminder(time) {
  if (!canNotify()) return
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
  } catch { /* nothing scheduled yet */ }
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return // guard: settings value can come from imported JSON
  const { display } = await LocalNotifications.requestPermissions()
  if (display !== 'granted') return
  const [hour, minute] = time.split(':').map(Number)
  await LocalNotifications.schedule({
    notifications: [{
      id: REMINDER_ID,
      title: 'Life Tracker',
      body: 'Time to check your habits — keep the streak alive ⚡',
      schedule: { on: { hour, minute }, allowWhileIdle: true }, // repeats daily
    }],
  })
}
