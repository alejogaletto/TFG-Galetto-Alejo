"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase-client"
import { User, Session } from "@supabase/supabase-js"

interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

/**
 * Hook for managing authentication state in client components
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, signOut } = useAuth()
 * 
 *   if (loading) return <div>Loading...</div>
 *   if (!user) return <div>Please log in</div>
 * 
 *   return <button onClick={signOut}>Sign Out</button>
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (error) {
        console.error("Error loading session:", error)
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Refresh the page data when auth state changes
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.refreshSession()
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
    } catch (error) {
      console.error("Error refreshing session:", error)
    }
  }

  return {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  }
}

/**
 * Hook that ensures user is authenticated, redirects to login if not
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user, loading } = useRequireAuth()
 * 
 *   if (loading) return <div>Loading...</div>
 * 
 *   return <div>Protected content for {user.email}</div>
 * }
 * ```
 */
export function useRequireAuth(): UseAuthReturn {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push("/login")
    }
  }, [auth.loading, auth.user, router])

  return auth
}

