
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
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeSteps = searchParams.get('includeSteps') === 'true';

  if (includeSteps) {
    // Fetch workflows with their steps
    const { data: workflows, error: workflowsError } = await supabase
      .from('Workflow')
      .select('*')
      .order('id');

    if (workflowsError) return NextResponse.json({ error: workflowsError.message }, { status: 500 });

    // Fetch all workflow steps for all workflows
    const { data: allSteps, error: stepsError } = await supabase
      .from('WorkflowStep')
      .select('*')
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
    const workflowsWithSteps = (workflows || []).map((workflow: any) => ({
      ...workflow,
      steps: stepsByWorkflow[workflow.id] || []
    }));

    return NextResponse.json(workflowsWithSteps);
  }

  // Default: fetch workflows without steps
  const { data, error } = await supabase.from('Workflow').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
