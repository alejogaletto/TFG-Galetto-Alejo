
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { FormField } from '@/lib/types';

const supabase = createClient();

// Create a new form field
export async function POST(req: NextRequest) {
  const { form_id, type, label, position, configs } = await req.json() as FormField;
  const { data, error } = await supabase.from('FormField').insert([{ form_id, type, label, position, configs }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all form fields
export async function GET() {
  const { data, error } = await supabase.from('FormField').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
