import { createBrowserClient, createServerClient } from "@/lib/supabase-client"

/**
 * Get the base URL for the application based on environment
 * Priority: NEXT_PUBLIC_VERCEL_URL (production) > NEXT_PUBLIC_SITE_URL > localhost
 */
export function getBaseUrl(): string {
  // In browser, use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Server-side: check for Vercel deployment
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  
  // Fallback to configured site URL or localhost
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

/**
 * Get the current user ID from Supabase Auth (client-side)
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = createBrowserClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user.id
  } catch (error) {
    console.error("Error getting current user ID:", error)
    return null
  }
}

/**
 * Get the current user ID from Supabase Auth (server-side)
 * @returns User ID or null if not authenticated
 */
export async function getServerUserId(): Promise<string | null> {
  try {
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user.id
  } catch (error) {
    console.error("Error getting server user ID:", error)
    return null
  }
}

/**
 * Get the current user from Supabase Auth (client-side)
 * @returns Full user object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const supabase = createBrowserClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Check if user is authenticated (client-side)
 * @returns boolean indicating if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId()
  return userId !== null
}

