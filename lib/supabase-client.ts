import { createClient as createSupabaseServerClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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
