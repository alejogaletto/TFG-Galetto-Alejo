import { NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"

function cookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production"
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds};${
    secure ? " Secure;" : ""
  }`
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 })

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${url.origin}/api/auth/google/callback`
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 })
  }

  const oauth2Client = new OAuth2Client({ clientId, clientSecret, redirectUri })
  try {
    const { tokens } = await oauth2Client.getToken(code)
    const res = NextResponse.redirect(`${url.origin}/dashboard/profile?tab=google&connected=1`)
    if (tokens.access_token) res.headers.append("Set-Cookie", cookie("g_acc", tokens.access_token, 3600))
    if (tokens.refresh_token) res.headers.append("Set-Cookie", cookie("g_ref", tokens.refresh_token, 60 * 60 * 24 * 30))
    if (tokens.expiry_date) {
      const secs = Math.max(0, Math.floor((tokens.expiry_date - Date.now()) / 1000))
      res.headers.append("Set-Cookie", cookie("g_exp", String(tokens.expiry_date), secs))
    }
    return res
  } catch (e: any) {
    return NextResponse.redirect(`${url.origin}/dashboard/profile?tab=google&error=${encodeURIComponent("oauth_failed")}`)
  }
}


