import { NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"

function getBaseUrl(req: Request): string {
  const url = new URL(req.url)
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host
  return `${proto}://${host}`
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 })
  }

  const redirectUri = `${getBaseUrl(req)}/api/auth/google/callback`
  const oauth2Client = new OAuth2Client({ clientId, clientSecret, redirectUri })

  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "openid",
    "email",
    "profile",
  ]

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  })

  return NextResponse.redirect(authUrl)
}


