import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

const supabase = createClient()

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formId = Number(params.id)
    if (!formId) return NextResponse.json({ error: "Invalid form id" }, { status: 400 })

    const { fields } = await req.json().catch(() => ({}))
    if (!Array.isArray(fields)) return NextResponse.json({ error: "Missing fields array" }, { status: 400 })

    // Remove existing fields for the form
    const { error: delError } = await supabase.from("FormField").delete().eq("form_id", formId)
    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })

    if (fields.length === 0) return NextResponse.json({ success: true, inserted: 0 })

    // Prepare insert rows
    const rows = fields.map((f: any, idx: number) => ({
      form_id: formId,
      type: String(f.type || "text"),
      label: String(f.label || `Campo ${idx + 1}`),
      position: Number(f.position ?? idx),
      configs: {
        placeholder: f.placeholder ?? "",
        required: !!f.required,
        helpText: f.helpText ?? "",
        options: f.options ?? [],
        rows: f.rows ?? 3,
        dbField: f.dbField ?? null,
      },
    }))

    const { data, error } = await supabase.from("FormField").insert(rows).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, inserted: data?.length || 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}


