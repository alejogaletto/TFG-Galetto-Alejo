import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

const supabase = createClient()

// GET /api/virtual-schemas/[id]/tree
// Returns one VirtualSchema with nested VirtualTableSchemas and VirtualFieldSchemas
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const schemaId = Number(params.id)
  if (!schemaId || Number.isNaN(schemaId)) {
    return NextResponse.json({ error: "Invalid schema id" }, { status: 400 })
  }

  const searchParams = new URL(req.url).searchParams
  const lightweight = searchParams.get("lightweight") === "true"

  const schemaRes = await supabase.from("VirtualSchema").select("*").eq("id", schemaId).single()
  if (schemaRes.error) return NextResponse.json({ error: schemaRes.error.message }, { status: 500 })
  if (!schemaRes.data) return NextResponse.json({ error: "Virtual schema not found" }, { status: 404 })

  const tablesRes = await supabase
    .from("VirtualTableSchema")
    .select(lightweight ? "id,name,virtual_schema_id" : "*")
    .eq("virtual_schema_id", schemaId)

  if (tablesRes.error) return NextResponse.json({ error: tablesRes.error.message }, { status: 500 })

  const tableIds = (tablesRes.data || []).map((t: any) => t.id)
  const fieldsRes = await supabase
    .from("VirtualFieldSchema")
    .select(lightweight ? "id,name,virtual_table_schema_id" : "*")
    .in("virtual_table_schema_id", tableIds.length ? tableIds : [-1])

  if (fieldsRes.error) return NextResponse.json({ error: fieldsRes.error.message }, { status: 500 })

  const tableIdToFields: Record<number, any[]> = {}
  ;(fieldsRes.data || []).forEach((vf: any) => {
    tableIdToFields[vf.virtual_table_schema_id] = tableIdToFields[vf.virtual_table_schema_id] || []
    tableIdToFields[vf.virtual_table_schema_id].push(vf)
  })

  const tablesWithFields = (tablesRes.data || []).map((t: any) => ({ ...t, fields: tableIdToFields[t.id] || [] }))

  if (lightweight) {
    return NextResponse.json({ id: schemaRes.data.id, name: schemaRes.data.name, tables: tablesWithFields })
  }

  return NextResponse.json({ ...schemaRes.data, tables: tablesWithFields })
}


