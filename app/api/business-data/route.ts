
import { NextRequest, NextResponse } from 'next/server';
import { createRLSClient } from '@/lib/supabase-client';
import { BusinessData } from '@/lib/types';
import { workflowTriggerService } from '@/lib/workflow-trigger-service';

// Create a new business data
export async function POST(req: NextRequest) {
  const supabase = await createRLSClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { virtual_table_schema_id, data_json } = await req.json() as Partial<BusinessData>;
  
  // RLS policy will verify user_id matches auth.uid()
  const { data, error } = await supabase
    .from('BusinessData')
    .insert([{ user_id: user.id, virtual_table_schema_id, data_json }])
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Trigger workflows for database change (best-effort, non-blocking)
  if (data && data.length > 0 && virtual_table_schema_id) {
    try {
      await workflowTriggerService.executeDatabaseChangeTriggers(
        virtual_table_schema_id,
        'create',
        data_json,
        data[0].id
      );
    } catch (workflowErr) {
      console.error('Workflow trigger execution failed:', workflowErr);
      // do not fail the main operation
    }
  }
  
  return NextResponse.json(data, { status: 201 });
}

// Get all business data for the current user (RLS auto-filters)
export async function GET(req: NextRequest) {
  const supabase = await createRLSClient();

  const { searchParams } = new URL(req.url);
  const tableId = searchParams.get('virtual_table_schema_id');
  
  // No manual filtering - RLS handles it automatically
  let query = supabase
    .from('BusinessData')
    .select('*');
  
  if (tableId) {
    query = query.eq('virtual_table_schema_id', Number(tableId));
  }
  
  const { data, error } = await query.order('creation_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
