import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// detectSessionInUrl: false — explicit reason (Apr 25, 2026):
// supabase-js v2's default `detectSessionInUrl: true` runs `_initialize()`
// from inside `createClient(...)` at module-import time — long before any
// React component mounts. For password-recovery URLs (#type=recovery&...),
// the SDK auto-parses the token, exchanges it for a session, fires the
// PASSWORD_RECOVERY event (with no listener attached yet), and scrubs the
// hash via history.replaceState BEFORE ProtectedRoute's useEffect can
// inspect window.location. Result: the founder's "the reset just brought
// me to my new account" bug — the recovery happened silently and the app
// rendered the home view instead of the reset modal.
//
// Fix: disable auto-detect. ProtectedRoute now reads the recovery hash
// SYNCHRONOUSLY at the top of its useEffect, then explicitly calls
// supabase.auth.exchangeCodeForSession(window.location.href) to consume
// the token under our control.
//
// flowType: 'pkce' — also recommended for security; the recovery URL
// uses a single-use code that's exchanged server-side rather than the
// older implicit flow that exposed access tokens in the URL hash.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
    flowType: 'pkce',
    // Persist + auto-refresh stay at their defaults (true). We only opt
    // out of automatic URL-hash session detection.
    persistSession: true,
    autoRefreshToken: true,
  },
})