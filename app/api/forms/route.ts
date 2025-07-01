
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { Form } from '@/lib/types';

const supabase = createClient();

// Create a new form
export async function POST(req: NextRequest) {
  const { user_id, name, description, configs, is_active } = await req.json() as Form;
  const { data, error } = await supabase.from('Form').insert([{ user_id, name, description, configs, is_active }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all forms
export async function GET() {
  const { data, error } = await supabase.from('Form').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
