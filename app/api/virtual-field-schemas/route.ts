
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { VirtualFieldSchema } from '@/lib/types';

const supabase = createClient();

// Create a new virtual field schema
export async function POST(req: NextRequest) {
  const { virtual_table_schema_id, name, type, properties } = await req.json() as VirtualFieldSchema;
  const { data, error } = await supabase.from('VirtualFieldSchema').insert([{ virtual_table_schema_id, name, type, properties }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all virtual field schemas
export async function GET() {
  const { data, error } = await supabase.from('VirtualFieldSchema').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
