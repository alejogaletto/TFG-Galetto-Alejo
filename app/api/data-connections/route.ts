
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { DataConnection } from '@/lib/types';

const supabase = createClient();

// Create a new data connection
export async function POST(req: NextRequest) {
  const { form_id, virtual_schema_id, virtual_table_schema_id, configs } = await req.json() as DataConnection & { virtual_schema_id?: number };
  
  // Check if a data connection already exists for this form
  const { data: existing } = await supabase
    .from('DataConnection')
    .select('*')
    .eq('form_id', form_id)
    .single();

  if (existing) {
    // Update existing connection
    const { data, error } = await supabase
      .from('DataConnection')
      .update({ virtual_schema_id, virtual_table_schema_id, configs })
      .eq('id', existing.id)
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data[0], { status: 200 });
  }

  // Create new connection
  const { data, error } = await supabase
    .from('DataConnection')
    .insert([{ form_id, virtual_schema_id, virtual_table_schema_id, configs }])
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}

// Get data connections (optionally filter by form_id)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const formId = searchParams.get('form_id');

  let query = supabase.from('DataConnection').select('*');
  
  if (formId) {
    query = query.eq('form_id', Number(formId));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // If querying by form_id, return single object or null
  if (formId) {
    return NextResponse.json(data?.[0] || null);
  }
  
  return NextResponse.json(data);
}
