import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// pkce: required for the native (APK) Google OAuth deep-link code exchange; works on web too
export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce' } }) : null
