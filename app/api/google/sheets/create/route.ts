import { NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") || ""
  const accessMatch = (cookieHeader.match(/(?:^|;\s*)g_acc=([^;]+)/) || [])[1]
  const refreshMatch = (cookieHeader.match(/(?:^|;\s*)g_ref=([^;]+)/) || [])[1]
  let accessToken = accessMatch ? decodeURIComponent(accessMatch) : ""

  if (!accessToken && !refreshMatch) {
    return NextResponse.json({ error: "Not connected to Google" }, { status: 401 })
  }

  try {
    // Use access token directly; if expired, browser likely refreshed earlier via callback flow
    const body = await req.json().catch(() => ({}))
    const title = body?.title || `AutomateSMB Form ${new Date().toLocaleDateString()}`

    async function createWithToken(token: string) {
      return fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ properties: { title } }),
      })
    }

    let createRes: Response | null = accessToken ? await createWithToken(accessToken) : null

    if ((!createRes || createRes.status === 401) && refreshMatch) {
      const clientId = process.env.GOOGLE_CLIENT_ID
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET
      if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 })
      }
      const oauth2 = new OAuth2Client({ clientId, clientSecret })
      oauth2.setCredentials({ refresh_token: decodeURIComponent(refreshMatch) })
      const refreshed = await oauth2.getAccessToken()
      const newToken = refreshed?.token
      if (!newToken) {
        return NextResponse.json({ error: "Failed to refresh access token" }, { status: 401 })
      }
      accessToken = newToken
      createRes = await createWithToken(accessToken)
    }

    if (!createRes) {
      return NextResponse.json({ error: "No response from Google" }, { status: 502 })
    }
    if (!createRes.ok) {
      const err = await createRes.text()
      return NextResponse.json({ error: "Failed to create spreadsheet", details: err }, { status: 502 })
    }
    const json = await createRes.json()
    const spreadsheetId = json?.spreadsheetId
    const firstSheetName = json?.sheets?.[0]?.properties?.title || "Sheet1"

    return NextResponse.json({ spreadsheetId, sheetName: firstSheetName, url: json?.spreadsheetUrl })
  } catch (e: any) {
    return NextResponse.json({ error: "Unexpected error", message: e?.message }, { status: 500 })
  }
}


