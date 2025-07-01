
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { BusinessData } from '@/lib/types';

const supabase = createClient();

// Create a new business data
export async function POST(req: NextRequest) {
  const { user_id, virtual_table_schema_id, data_json } = await req.json() as BusinessData;
  const { data, error } = await supabase.from('BusinessData').insert([{ user_id, virtual_table_schema_id, data_json }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all business data
export async function GET() {
  const { data, error } = await supabase.from('BusinessData').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
