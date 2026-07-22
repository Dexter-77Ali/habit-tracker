import { Capacitor, registerPlugin } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { isHabitScheduled } from './scoreUtils'

// Home-screen widget bridge (Android only). The widget reads "widget_snapshot"
// from the CapacitorStorage SharedPreferences file; taps queue habit ids into
// "widget_pending_toggles" which the app drains on resume.

const WidgetBridge = registerPlugin('WidgetBridge')

export const canWidget = () => Capacitor.getPlatform() === 'android'

// RemoteViews can only render text — emoji icons pass through, image icons drop to a dot.
const widgetIcon = (icon) => (icon && !icon.startsWith('/') && !icon.startsWith('data:') ? icon : '•')

/** Write today's habits + streak for the widget and ask it to redraw. */
export async function writeWidgetSnapshot({ habits, todayLog, streak, today }) {
  if (!canWidget()) return
  const snapshot = {
    date: today,
    streak,
    habits: (habits || [])
      .filter((h) => isHabitScheduled(h, today))
      .slice(0, 6)
      .map((h) => ({ id: h.id, name: h.name, icon: widgetIcon(h.icon), done: !!todayLog[h.id] })),
  }
  try {
    await Preferences.set({ key: 'widget_snapshot', value: JSON.stringify(snapshot) })
    await WidgetBridge.refresh()
  } catch { /* widget not placed yet / plugin missing in dev */ }
}

/** Pull and clear the widget's queued check-offs. Returns habit ids (may repeat). */
export async function drainWidgetToggles() {
  if (!canWidget()) return []
  try {
    const { value } = await Preferences.get({ key: 'widget_pending_toggles' })
    if (!value) return []
    await Preferences.remove({ key: 'widget_pending_toggles' })
    const ids = JSON.parse(value)
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}
