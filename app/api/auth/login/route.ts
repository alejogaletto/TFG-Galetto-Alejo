import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

const supabase = createClient()

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("User")
      .select("id, name, email")
      .eq("email", email)
      .eq("password", password)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({ user: data }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 })
  }
}


