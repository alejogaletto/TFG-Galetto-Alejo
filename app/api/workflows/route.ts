
import { NextRequest, NextResponse } from 'next/server';
import { createRLSClient } from '@/lib/supabase-client';
import { Workflow } from '@/lib/types';

// Create a new workflow
export async function POST(req: NextRequest) {
  const supabase = await createRLSClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, configs, is_active } = await req.json() as Partial<Workflow>;
  
  // RLS policy will verify user_id matches auth.uid()
  const { data, error } = await supabase
    .from('Workflow')
    .insert([{ user_id: user.id, name, description, configs, is_active }])
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all workflows for the current user (RLS auto-filters)
export async function GET(req: NextRequest) {
  const supabase = await createRLSClient();

  const { searchParams } = new URL(req.url);
  const includeSteps = searchParams.get('includeSteps') === 'true';

  if (includeSteps) {
    // Fetch workflows - RLS auto-filters to user's workflows
    const { data: workflows, error: workflowsError } = await supabase
      .from('Workflow')
      .select('*')
      .order('id');

    if (workflowsError) return NextResponse.json({ error: workflowsError.message }, { status: 500 });

    if (!workflows || workflows.length === 0) {
      return NextResponse.json([]);
    }

    const workflowIds = workflows.map(w => w.id);

    // Fetch workflow steps - RLS auto-filters to user's workflow steps
    const { data: allSteps, error: stepsError } = await supabase
      .from('WorkflowStep')
      .select('*')
      .in('workflow_id', workflowIds)
      .order('position');

    if (stepsError) return NextResponse.json({ error: stepsError.message }, { status: 500 });

    // Group steps by workflow_id
    const stepsByWorkflow = (allSteps || []).reduce((acc: any, step: any) => {
      if (!acc[step.workflow_id]) {
        acc[step.workflow_id] = [];
      }
      acc[step.workflow_id].push(step);
      return acc;
    }, {});

    // Attach steps to their respective workflows
    const workflowsWithSteps = workflows.map((workflow: any) => ({
      ...workflow,
      steps: stepsByWorkflow[workflow.id] || []
    }));

    return NextResponse.json(workflowsWithSteps);
  }

  // Default: fetch workflows without steps - RLS auto-filters
  const { data, error } = await supabase
    .from('Workflow')
    .select('*');
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
