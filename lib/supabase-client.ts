import { createClient as createSupabaseServerClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createServerClient as createSSRServerClient } from "@supabase/ssr"

// Returns a Supabase client appropriate for the current runtime
export const createClient = () => {
  if (typeof window === "undefined") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceRoleKey)) {
      throw new Error(
        "Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY are set.",
      )
    }

    // Prefer service role on the server if available to bypass RLS for trusted operations
    const keyToUse = supabaseServiceRoleKey || supabaseAnonKey!
    return createSupabaseServerClient(supabaseUrl, keyToUse)
  }

  // Client-side: use Next.js auth helpers client
  return createClientComponentClient()
}

/**
 * Create a Supabase client for browser-side auth operations
 * This client respects RLS and uses the anon key
 * Safe to use in client components (handles SSR automatically)
 */
export const createBrowserClient = () => {
  return createClientComponentClient()
}

/**
 * Create a Supabase client for server-side operations with admin privileges
 * Use with caution - bypasses Row Level Security
 */
export const createServerAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase service role credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
    )
  }

  return createSupabaseServerClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Create a Supabase client for server-side operations with user context
 * Respects RLS using the anon key
 */
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
  }

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Create a Supabase client for API routes with RLS authentication
 * This client respects Row Level Security policies and uses the authenticated user's session
 * Use this in API routes to automatically filter data based on the logged-in user
 */
export const createRLSClient = async () => {
  // Import cookies dynamically to avoid making the entire module server-only
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
  }

  return createSSRServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Cookie setting can fail during SSR - safe to ignore
          }
        },
      },
    }
  )
}
