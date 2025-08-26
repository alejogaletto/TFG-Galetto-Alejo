
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { VirtualTableSchema } from '@/lib/types';

const supabase = createClient();

// Create a new virtual table schema
export async function POST(req: NextRequest) {
  const { name, virtual_schema_id, configs } = await req.json() as VirtualTableSchema;
  const { data, error } = await supabase.from('VirtualTableSchema').insert([{ name, virtual_schema_id, configs }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: 'Failed to create virtual table schema' }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}

// Get all virtual table schemas
export async function GET() {
  const { data, error } = await supabase.from('VirtualTableSchema').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
