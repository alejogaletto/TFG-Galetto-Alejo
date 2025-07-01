
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { WorkflowStep } from '@/lib/types';

const supabase = createClient();

// Create a new workflow step
export async function POST(req: NextRequest) {
  const { workflow_id, type, position, configs, external_services } = await req.json() as WorkflowStep;
  const { data, error } = await supabase.from('WorkflowStep').insert([{ workflow_id, type, position, configs, external_services }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all workflow steps
export async function GET() {
  const { data, error } = await supabase.from('WorkflowStep').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
