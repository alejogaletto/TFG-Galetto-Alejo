import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { workflowTriggerService } from '@/lib/workflow-trigger-service';

const supabase = createClient();

/**
 * Create a new workflow trigger
 * POST /api/workflow-triggers
 */
export async function POST(req: NextRequest) {
  try {
    const { workflow_id, trigger_type, trigger_source_id, trigger_config } = await req.json();

    // Validate required fields
    if (!workflow_id || !trigger_type || !trigger_source_id) {
      return NextResponse.json(
        { error: 'workflow_id, trigger_type, and trigger_source_id are required' },
        { status: 400 }
      );
    }

    // Validate trigger_type
    if (!['form_submission', 'database_change'].includes(trigger_type)) {
      return NextResponse.json(
        { error: 'trigger_type must be either form_submission or database_change' },
        { status: 400 }
      );
    }

    // Create the trigger
    const trigger = await workflowTriggerService.createTrigger(
      workflow_id,
      trigger_type,
      trigger_source_id,
      trigger_config
    );

    return NextResponse.json(trigger, { status: 201 });
  } catch (error: any) {
    console.error('Error creating workflow trigger:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create workflow trigger' },
      { status: 500 }
    );
  }
}

/**
 * Get workflow triggers
 * GET /api/workflow-triggers?workflow_id=1&trigger_type=form_submission&source_id=5
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('workflow_id');
    const triggerType = searchParams.get('trigger_type');
    const sourceId = searchParams.get('source_id');

    let query = supabase.from('WorkflowTrigger').select('*');

    // Apply filters
    if (workflowId) {
      query = query.eq('workflow_id', parseInt(workflowId));
    }

    if (triggerType) {
      query = query.eq('trigger_type', triggerType);
    }

    if (sourceId) {
      query = query.eq('trigger_source_id', parseInt(sourceId));
    }

    const { data, error } = await query.order('creation_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching workflow triggers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch workflow triggers' },
      { status: 500 }
    );
  }
}

/**
 * Delete all workflow triggers for a workflow
 * DELETE /api/workflow-triggers?workflow_id=1
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('workflow_id');
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflow_id is required' },
        { status: 400 }
      );
    }
    
    await workflowTriggerService.deleteTriggersForWorkflow(parseInt(workflowId));
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting workflow triggers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete workflow triggers' },
      { status: 500 }
    );
  }
}

