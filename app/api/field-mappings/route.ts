
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { FieldMapping } from '@/lib/types';

const supabase = createClient();

// Create a new field mapping
export async function POST(req: NextRequest) {
  const { data_connection_id, form_field_id, virtual_field_schema_id, changes } = await req.json() as FieldMapping;
  const { data, error } = await supabase.from('FieldMapping').insert([{ data_connection_id, form_field_id, virtual_field_schema_id, changes }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all field mappings
export async function GET() {
  const { data, error } = await supabase.from('FieldMapping').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
