import { NextRequest, NextResponse } from 'next/server';
import { workflowTriggerService } from '@/lib/workflow-trigger-service';

/**
 * Delete a workflow trigger
 * DELETE /api/workflow-triggers/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const triggerId = parseInt(id);

    if (isNaN(triggerId)) {
      return NextResponse.json(
        { error: 'Invalid trigger ID' },
        { status: 400 }
      );
    }

    await workflowTriggerService.deleteTrigger(triggerId);

    return NextResponse.json(
      { message: 'Trigger deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting workflow trigger:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete workflow trigger' },
      { status: 500 }
    );
  }
}

