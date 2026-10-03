import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

type AuthState = {
  profile: Profile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<Profile>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)
const demoAllowed = import.meta.env.DEV && !supabase

async function fetchProfile(userId: string): Promise<Profile> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,role')
    .eq('id', userId)
    .single()
  if (error || !data || !['student', 'admin'].includes(data.role)) {
    throw new Error('Your account profile could not be loaded. Contact your administrator.')
  }
  return data as Profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      if (demoAllowed) {
        const saved = sessionStorage.getItem('college-reviewer-demo-profile')
        if (saved) setProfile(JSON.parse(saved) as Profile)
      } else {
        setError('Supabase is not configured for this deployment.')
      }
      setLoading(false)
      return
    }

    let active = true
    void supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (sessionError) throw sessionError
      const next = data.session ? await fetchProfile(data.session.user.id) : null
      if (active) setProfile(next)
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Authentication failed.')
    }).finally(() => { if (active) setLoading(false) })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      if (!session) { setProfile(null); return }
      // Schedule the profile query after the Auth callback returns.
      setTimeout(() => {
        void fetchProfile(session.user.id).then((next) => {
          if (active) { setProfile(next); setError(null) }
        }).catch((cause: unknown) => {
          if (active) {
            setProfile(null)
            setError(cause instanceof Error ? cause.message : 'Profile loading failed.')
          }
        })
      }, 0)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  async function signIn(email: string, password: string): Promise<Profile> {
    if (!supabase) {
      if (!demoAllowed) throw new Error('Supabase is not configured.')
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'student'
      const next: Profile = {
        id: role === 'admin' ? 'admin-demo' : 'student-demo',
        email,
        full_name: role === 'admin' ? 'Demo Admin' : 'Demo Student',
        role,
      }
      setProfile(next)
      sessionStorage.setItem('college-reviewer-demo-profile', JSON.stringify(next))
      return next
    }
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError
    if (!data.user) throw new Error('Sign-in succeeded without a user.')
    const next = await fetchProfile(data.user.id)
    setProfile(next)
    setError(null)
    return next
  }

  async function signOut() {
    if (supabase) {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
    }
    sessionStorage.removeItem('college-reviewer-demo-profile')
    setProfile(null)
  }

  return <AuthContext.Provider value={{ profile, loading, error, signIn, signOut }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
