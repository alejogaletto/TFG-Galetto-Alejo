import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a single supabase client for the entire session
export const createClient = () => {
  return createClientComponentClient()
}
