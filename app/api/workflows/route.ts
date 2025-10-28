
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { getServerUserId } from '@/lib/auth-helpers';
import { Workflow } from '@/lib/types';

const supabase = createClient();

// Create a new workflow
export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, configs, is_active } = await req.json() as Partial<Workflow>;
  
  // Always use the authenticated user's ID
  const { data, error } = await supabase
    .from('Workflow')
    .insert([{ user_id: userId, name, description, configs, is_active }])
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all workflows for the current user
export async function GET(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeSteps = searchParams.get('includeSteps') === 'true';

  if (includeSteps) {
    // Fetch workflows with their steps (filtered by user)
    const { data: workflows, error: workflowsError } = await supabase
      .from('Workflow')
      .select('*')
      .eq('user_id', userId)
      .order('id');

    if (workflowsError) return NextResponse.json({ error: workflowsError.message }, { status: 500 });

    if (!workflows || workflows.length === 0) {
      return NextResponse.json([]);
    }

    const workflowIds = workflows.map(w => w.id);

    // Fetch workflow steps only for user's workflows
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

  // Default: fetch workflows without steps (filtered by user)
  const { data, error } = await supabase
    .from('Workflow')
    .select('*')
    .eq('user_id', userId);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
