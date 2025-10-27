import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createServerClient()
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("OAuth callback error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
    }

    // Check if user needs to complete onboarding
    if (data.user) {
      const hasCompanyName = data.user.user_metadata?.company_name
      
      if (!hasCompanyName) {
        // New OAuth user needs to complete profile
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
      }

      // Check if profile exists in User table, create if not
      try {
        const { data: profile } = await supabase
          .from("User")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (!profile) {
          // Create profile in User table
          await supabase.from("User").insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
            configs: { companyName: data.user.user_metadata?.company_name },
          })
        }
      } catch (profileError) {
        console.error("Profile check/creation error:", profileError)
        // Don't block login if profile creation fails
      }
    }
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}

