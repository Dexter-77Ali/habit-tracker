import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SYNC_KEYS = [
  'ht_habits', 'ht_logs', 'ht_tasks', 'ht_rewards', 'ht_profile',
  'ht_settings', 'ht_groups', 'ht_tags_meta', 'ht_goals',
  'ht_streak_freezes', 'ht_challenges', 'ht_time_logs', 'ht_active_timer',
  // Pocket Tracker (financial — isolated from gamification keys)
  'ht_pocket_income', 'ht_pocket_expenses', 'ht_pocket_categories',
  'ht_pocket_goals', 'ht_pocket_ui',
]

// Shared state on window — survives HMR, accessible from any module
if (!window.__htSync) {
  window.__htSync = { user: null, ready: false, lastPushed: {}, timers: {} }
}
const S = window.__htSync

export function syncPush(key, value) {
  if (!S.ready || !S.user || !supabase) return
  if (!SYNC_KEYS.includes(key)) return

  const json = JSON.stringify(value)
  if (json === S.lastPushed[key]) return

  clearTimeout(S.timers[key])
  S.timers[key] = setTimeout(() => {
    S.lastPushed[key] = json
    supabase.from('user_data').upsert({
      user_id: S.user.id, key, value,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,key' }).then(() => {})
  }, 1000)
}

export function useSync(user) {
  useEffect(() => {
    S.user = user
    if (!user) S.ready = false
  }, [user])

  useEffect(() => {
    if (!user || !supabase) return
    S.ready = false

    supabase.from('user_data')
      .select('key, value')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) { S.ready = true; return }

        if (data?.length) {
          for (const row of data) {
            S.lastPushed[row.key] = JSON.stringify(row.value)
            localStorage.setItem(row.key, JSON.stringify(row.value))
            window.dispatchEvent(new CustomEvent('ht-sync-update', {
              detail: { key: row.key, value: row.value }
            }))
          }
        } else {
          for (const key of SYNC_KEYS) {
            try {
              const raw = localStorage.getItem(key)
              if (raw) {
                S.lastPushed[key] = raw
                supabase.from('user_data').upsert({
                  user_id: user.id, key, value: JSON.parse(raw),
                  updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,key' }).then(() => {})
              }
            } catch {}
          }
        }
        S.ready = true
      })

    const channel = supabase.channel(`sync-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const row = payload.new
        if (row?.key && row?.value !== undefined) {
          S.lastPushed[row.key] = JSON.stringify(row.value)
          localStorage.setItem(row.key, JSON.stringify(row.value))
          window.dispatchEvent(new CustomEvent('ht-sync-update', {
            detail: { key: row.key, value: row.value }
          }))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      Object.values(S.timers).forEach(clearTimeout)
    }
  }, [user?.id])
}
