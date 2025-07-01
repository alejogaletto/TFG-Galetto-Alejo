
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { DataConnection } from '@/lib/types';

const supabase = createClient();

// Create a new data connection
export async function POST(req: NextRequest) {
  const { form_id, virtual_table_schema_id } = await req.json() as DataConnection;
  const { data, error } = await supabase.from('DataConnection').insert([{ form_id, virtual_table_schema_id }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all data connections
export async function GET() {
  const { data, error } = await supabase.from('DataConnection').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
