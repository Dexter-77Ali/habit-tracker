import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const REMINDER_ID = 77

export const canNotify = () => Capacitor.isNativePlatform()

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
