
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { getServerUserId } from '@/lib/auth-helpers';
import { VirtualSchema } from '@/lib/types';

const supabase = createClient();

// Create a new virtual schema
export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, configs } = await req.json() as Partial<VirtualSchema>;
  
  // Always use the authenticated user's ID
  const { data, error } = await supabase
    .from('VirtualSchema')
    .insert([{ user_id: userId, name, description, configs }])
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: 'Failed to create virtual schema' }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}

// Get all virtual schemas for the current user
export async function GET(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url)
  const includeTree = searchParams.get('includeTree') === 'true'

  // Always filter by authenticated user's ID
  let vsQuery = supabase
    .from('VirtualSchema')
    .select('*')
    .eq('user_id', userId)

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
