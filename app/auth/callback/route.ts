import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const supabase = createServerClient()

  // Supabase Auth already processed the OAuth via their redirect
  // We just need to check the session
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    console.error("OAuth session error:", error)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
  }

  // Check if user needs to complete onboarding
  if (session.user) {
    const hasCompanyName = session.user.user_metadata?.company_name

    if (!hasCompanyName) {
      // New OAuth user needs to complete profile
      return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
    }

    // Check if profile exists in User table, create if not
    try {
      const { data: profile } = await supabase
        .from("User")
        .select("id")
        .eq("id", session.user.id)
        .single()

      if (!profile) {
        // Create profile in User table
        await supabase.from("User").insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          configs: { companyName: session.user.user_metadata?.company_name },
        })
      }
    } catch (profileError) {
      console.error("Profile check/creation error:", profileError)
      // Don't block login if profile creation fails
    }
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}

