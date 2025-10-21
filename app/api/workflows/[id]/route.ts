
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { Workflow } from '@/lib/types';

const supabase = createClient();

// Get a single workflow by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const includeSteps = searchParams.get('includeSteps') === 'true';

  if (includeSteps) {
    // Fetch workflow with its steps
    const { data: workflow, error: workflowError } = await supabase
      .from('Workflow')
      .select('*')
      .eq('id', id)
      .single();

    if (workflowError) return NextResponse.json({ error: workflowError.message }, { status: 500 });
    if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

    // Fetch workflow steps for this workflow
    const { data: steps, error: stepsError } = await supabase
      .from('WorkflowStep')
      .select('*')
      .eq('workflow_id', id)
      .order('position');

    if (stepsError) return NextResponse.json({ error: stepsError.message }, { status: 500 });

    // Return workflow with steps
    return NextResponse.json({
      ...workflow,
      steps: steps || []
    });
  }

  // Default: fetch workflow without steps
  const { data, error } = await supabase.from('Workflow').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  return NextResponse.json(data);
}

// Update a workflow by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, description, configs, is_active } = await req.json() as Workflow;
  const { data, error } = await supabase.from('Workflow').update({ name, description, configs, is_active }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Delete a workflow by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('Workflow').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
