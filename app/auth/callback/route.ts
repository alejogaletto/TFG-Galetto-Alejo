import { NextRequest, NextResponse } from "next/server"
import { createRLSClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    // Exchange the OAuth code for a session
    // This will automatically set the session cookies
    const supabase = await createRLSClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth code exchange error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
    }

    // Check if user needs onboarding
    const user = data.user
    if (user) {
      const hasCompanyName = user.user_metadata?.company_name

      // Check if profile exists in User table
      const { data: profile } = await supabase
        .from("User")
        .select("id")
        .eq("id", user.id)
        .single()

      // Create profile if it doesn't exist
      if (!profile) {
        try {
          await supabase
            .from("User")
            .insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || 'User',
              password: '', // OAuth users don't have passwords
              configs: { companyName: user.user_metadata?.company_name }
            })
        } catch (insertError) {
          console.error('Profile creation error:', insertError)
          // Don't block the flow if profile creation fails
        }
      }

      // Redirect based on onboarding status
      if (!hasCompanyName) {
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
      }
    }
  }
  
  // Session is set and user is ready - go to dashboard
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
