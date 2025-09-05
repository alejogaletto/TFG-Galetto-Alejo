import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || ""
  const hasAccess = /(?:^|;\s*)g_acc=/.test(cookieHeader)
  const hasRefresh = /(?:^|;\s*)g_ref=/.test(cookieHeader)
  return NextResponse.json({ connected: hasAccess || hasRefresh })
}


