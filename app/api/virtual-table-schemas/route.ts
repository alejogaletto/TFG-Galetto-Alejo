
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { VirtualTableSchema } from '@/lib/types';

const supabase = createClient();

// Create a new virtual table schema
export async function POST(req: NextRequest) {
  const { virtual_schema_id, name, description, configs } = await req.json() as VirtualTableSchema;
  const { data, error } = await supabase.from('VirtualTableSchema').insert([{ virtual_schema_id, name, description, configs }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all virtual table schemas
export async function GET() {
  const { data, error } = await supabase.from('VirtualTableSchema').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
