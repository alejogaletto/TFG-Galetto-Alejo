import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const workflowId = parseInt(params.id);
  
  if (isNaN(workflowId)) {
    return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const lightweight = searchParams.get('lightweight') === 'true';

  const workflowSelect = lightweight ? 'id, name, user_id' : '*';
  const stepSelect = lightweight ? 'id, type, position' : '*';

  // Fetch the workflow
  const workflowRes = await supabase
    .from('Workflow')
    .select(workflowSelect)
    .eq('id', workflowId)
    .single();

  if (workflowRes.error) {
    return NextResponse.json({ error: workflowRes.error.message }, { status: 500 });
  }

  if (!workflowRes.data) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  // Fetch workflow steps for this workflow
  const stepsRes = await supabase
    .from('WorkflowStep')
    .select(stepSelect)
    .eq('workflow_id', workflowId)
    .order('position');

  if (stepsRes.error) {
    return NextResponse.json({ error: stepsRes.error.message }, { status: 500 });
  }

  // Return workflow with steps
  return NextResponse.json({
    ...workflowRes.data,
    steps: stepsRes.data || []
  });
}
