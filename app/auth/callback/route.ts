import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  
  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
  }

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error("OAuth session error:", error)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
  }

  const session = data.session

  // Set session cookies manually
  const cookieStore = await cookies()
  const maxAge = 60 * 60 * 24 * 7 // 7 days

  if (session.access_token) {
    cookieStore.set('sb-access-token', session.access_token, {
      maxAge,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  if (session.refresh_token) {
    cookieStore.set('sb-refresh-token', session.refresh_token, {
      maxAge,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  // Check if user needs to complete onboarding
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

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}

