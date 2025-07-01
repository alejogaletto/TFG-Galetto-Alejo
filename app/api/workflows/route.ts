
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { Workflow } from '@/lib/types';

const supabase = createClient();

// Create a new workflow
export async function POST(req: NextRequest) {
  const { user_id, name, description, configs, is_active } = await req.json() as Workflow;
  const { data, error } = await supabase.from('Workflow').insert([{ user_id, name, description, configs, is_active }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all workflows
export async function GET() {
  const { data, error } = await supabase.from('Workflow').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
