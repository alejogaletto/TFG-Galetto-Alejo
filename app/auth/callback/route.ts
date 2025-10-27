import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  // Supabase has already handled the OAuth via their callback URL
  // and set the session cookies. We just redirect to a page that
  // will check if the user needs onboarding.
  
  // Redirect to a page that will handle the onboarding check client-side
  return NextResponse.redirect(`${requestUrl.origin}/auth/success`)
}
