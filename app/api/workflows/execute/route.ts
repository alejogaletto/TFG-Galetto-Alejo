import { NextRequest, NextResponse } from 'next/server';
import { workflowExecutionService, WorkflowContext } from '@/lib/workflow-execution-service';

/**
 * Execute a workflow with provided context
 * POST /api/workflows/execute
 */
export async function POST(req: NextRequest) {
  try {
    const { workflow_id, context } = await req.json();

    // Validate required fields
    if (!workflow_id) {
      return NextResponse.json(
        { error: 'workflow_id is required' },
        { status: 400 }
      );
    }

    if (!context || typeof context !== 'object') {
      return NextResponse.json(
        { error: 'context must be an object' },
        { status: 400 }
      );
    }

    // Execute the workflow
    const result = await workflowExecutionService.executeWorkflow(
      workflow_id,
      context as WorkflowContext
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to execute workflow',
        success: false
      },
      { status: 500 }
    );
  }
}

