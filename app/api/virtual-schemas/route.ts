
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
export async function GET() {
  const { data, error } = await supabase.from('VirtualSchema').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
