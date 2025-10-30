import { NextRequest, NextResponse } from "next/server"
import { createRLSClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  
  console.log('[OAuth Callback] Starting callback handler')
  console.log('[OAuth Callback] Origin:', origin)
  console.log('[OAuth Callback] Code present:', !!code)
  
  if (!code) {
    console.error('[OAuth Callback] No code provided in callback')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  try {
    // Exchange the OAuth code for a session
    console.log('[OAuth Callback] Exchanging code for session...')
    const supabase = await createRLSClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[OAuth Callback] Code exchange error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
    }

    const user = data.user
    if (!user) {
      console.error('[OAuth Callback] No user in session data')
      return NextResponse.redirect(`${origin}/login?error=no_user`)
    }

    console.log('[OAuth Callback] Session created for user:', user.id)
    console.log('[OAuth Callback] User email:', user.email)
    console.log('[OAuth Callback] User metadata:', JSON.stringify(user.user_metadata))

    // Check if user needs onboarding
    const hasCompanyName = user.user_metadata?.company_name
    console.log('[OAuth Callback] Has company name:', !!hasCompanyName)

    // Check if profile exists in User table
    console.log('[OAuth Callback] Checking for existing profile...')
    const { data: profile, error: profileError } = await supabase
      .from("User")
      .select("id")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('[OAuth Callback] Profile query error:', profileError)
    }

    // Create profile if it doesn't exist
    if (!profile) {
      console.log('[OAuth Callback] No profile found, creating new profile...')
      try {
        const newProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || 'User',
          password: null, // OAuth users don't have passwords
          configs: { companyName: user.user_metadata?.company_name }
        }
        
        const { error: insertError } = await supabase
          .from("User")
          .insert(newProfile)

        if (insertError) {
          console.error('[OAuth Callback] Profile creation error:', insertError.message)
          // Don't block the flow if profile creation fails
        } else {
          console.log('[OAuth Callback] Profile created successfully')
        }
      } catch (insertError) {
        console.error('[OAuth Callback] Profile creation exception:', insertError)
      }
    } else {
      console.log('[OAuth Callback] Existing profile found')
    }

    // Redirect based on onboarding status
    if (!hasCompanyName) {
      console.log('[OAuth Callback] Redirecting to onboarding (no company name)')
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    console.log('[OAuth Callback] Redirecting to dashboard')
    return NextResponse.redirect(`${origin}/dashboard`)

  } catch (error: any) {
    console.error('[OAuth Callback] Unexpected error:', error.message || error)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }
}
