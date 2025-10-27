
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { BusinessData } from '@/lib/types';
import { workflowTriggerService } from '@/lib/workflow-trigger-service';

const supabase = createClient();

// Get a single business data by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('BusinessData').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Business data not found' }, { status: 404 });
  return NextResponse.json(data);
}

// Update a business data by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data_json } = await req.json() as BusinessData;
  
  // Get existing record to find table ID
  const { data: existing } = await supabase.from('BusinessData').select('virtual_table_schema_id').eq('id', id).single();
  
  const { data, error } = await supabase.from('BusinessData').update({ data_json, modification_date: new Date() }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Trigger workflows for database change (best-effort, non-blocking)
  if (data && data.length > 0 && existing?.virtual_table_schema_id) {
    try {
      await workflowTriggerService.executeDatabaseChangeTriggers(
        existing.virtual_table_schema_id,
        'update',
        data_json,
        parseInt(id)
      );
    } catch (workflowErr) {
      console.error('Workflow trigger execution failed:', workflowErr);
      // do not fail the main operation
    }
  }
  
  return NextResponse.json(data);
}

// Delete a business data by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Get existing record before deletion for workflow triggers
  const { data: existing } = await supabase.from('BusinessData').select('virtual_table_schema_id, data_json').eq('id', id).single();
  
  const { data, error } = await supabase.from('BusinessData').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Trigger workflows for database change (best-effort, non-blocking)
  if (existing?.virtual_table_schema_id) {
    try {
      await workflowTriggerService.executeDatabaseChangeTriggers(
        existing.virtual_table_schema_id,
        'delete',
        existing.data_json || {},
        parseInt(id)
      );
    } catch (workflowErr) {
      console.error('Workflow trigger execution failed:', workflowErr);
      // do not fail the main operation
    }
  }
  
  return new NextResponse(null, { status: 204 });
}
