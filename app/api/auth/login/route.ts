import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { verifyPassword } from "@/lib/password"

const supabase = createClient()

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const { data: userRecord, error } = await supabase
      .from("User")
      .select("id, name, email, password")
      .eq("email", email)
      .single()

    if (error || !userRecord) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ok = await verifyPassword(password, (userRecord as any).password)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const { password: _pw, ...safeUser } = userRecord as any
    return NextResponse.json({ user: safeUser }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 })
  }
}


