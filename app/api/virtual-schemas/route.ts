
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { VirtualSchema } from '@/lib/types';

const supabase = createClient();

// Create a new virtual schema
export async function POST(req: NextRequest) {
  const { user_id, name, description, configs } = await req.json() as VirtualSchema;
  const { data, error } = await supabase.from('VirtualSchema').insert([{ user_id, name, description, configs }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all virtual schemas
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')
  const includeTree = searchParams.get('includeTree') === 'true'

  let vsQuery = supabase.from('VirtualSchema').select('*')
  if (userId) {
    vsQuery = vsQuery.eq('user_id', Number(userId))
  }

  const { data: schemas, error } = await vsQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!includeTree || !schemas?.length) return NextResponse.json(schemas)

  const schemaIds = schemas.map((s: any) => s.id)
  const { data: tables, error: tErr } = await supabase
    .from('VirtualTableSchema')
    .select('*')
    .in('virtual_schema_id', schemaIds)
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 })

  const tableIds = (tables || []).map((t: any) => t.id)
  const { data: fields, error: fErr } = await supabase
    .from('VirtualFieldSchema')
    .select('*')
    .in('virtual_table_schema_id', tableIds.length ? tableIds : [-1])
  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 500 })

  const tableIdToFields: Record<number, any[]> = {}
  ;(fields || []).forEach((vf: any) => {
    tableIdToFields[vf.virtual_table_schema_id] = tableIdToFields[vf.virtual_table_schema_id] || []
    tableIdToFields[vf.virtual_table_schema_id].push(vf)
  })

  const schemaIdToTables: Record<number, any[]> = {}
  ;(tables || []).forEach((vt: any) => {
    const withFields = { ...vt, fields: tableIdToFields[vt.id] || [] }
    schemaIdToTables[vt.virtual_schema_id] = schemaIdToTables[vt.virtual_schema_id] || []
    schemaIdToTables[vt.virtual_schema_id].push(withFields)
  })

  const result = schemas.map((s: any) => ({ ...s, tables: schemaIdToTables[s.id] || [] }))
  return NextResponse.json(result)
}
