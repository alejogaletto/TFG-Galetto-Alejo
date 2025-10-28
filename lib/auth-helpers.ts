import { createBrowserClient, createServerClient } from "@/lib/supabase-client"

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

