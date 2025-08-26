
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { VirtualFieldSchema } from '@/lib/types';

const supabase = createClient();

// Create a new virtual field schema
export async function POST(req: NextRequest) {
  const { name, type, virtual_table_schema_id, properties } = await req.json() as VirtualFieldSchema;
  const { data, error } = await supabase.from('VirtualFieldSchema').insert([{ name, type, virtual_table_schema_id, properties }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: 'Failed to create virtual field schema' }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}

// Get all virtual field schemas
export async function GET() {
  const { data, error } = await supabase.from('VirtualFieldSchema').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
