import { useState, useEffect, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Native (APK): Google OAuth returns via deep link com.hussien.lifetracker://auth-callback?code=...
    let urlListener
    if (Capacitor.isNativePlatform()) {
      urlListener = CapApp.addListener('appUrlOpen', async ({ url }) => {
        const code = new URL(url).searchParams.get('code')
        if (code) {
          await supabase.auth.exchangeCodeForSession(code)
          Browser.close().catch(() => {}) // no-op on Android, closes tab on iOS
        }
      })
    }

    return () => {
      subscription.unsubscribe()
      urlListener?.then?.(l => l.remove())
    }
  }, [])

  const signUp = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return error
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      // Google blocks OAuth inside WebViews — open the system browser, return via deep link
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'com.hussien.lifetracker://auth-callback', skipBrowserRedirect: true },
      })
      if (error) return error
      await Browser.open({ url: data.url })
      return null
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { user, loading, signUp, signIn, signInWithGoogle, signOut }
}
