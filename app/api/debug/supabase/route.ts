import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "present" : "missing"

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("User").select("*").limit(1)
    return NextResponse.json({
      env: { url, anon },
      queryUserTable: { ok: !error, error: error?.message ?? null, rows: data?.length ?? 0 },
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        env: { url, anon },
        error: String(e?.message || e),
      },
      { status: 500 },
    )
  }
}


