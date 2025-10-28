
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { getServerUserId } from '@/lib/auth-helpers';
import { BusinessData } from '@/lib/types';
import { workflowTriggerService } from '@/lib/workflow-trigger-service';

const supabase = createClient();

// Create a new business data
export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { virtual_table_schema_id, data_json } = await req.json() as Partial<BusinessData>;
  
  // Always use the authenticated user's ID
  const { data, error } = await supabase
    .from('BusinessData')
    .insert([{ user_id: userId, virtual_table_schema_id, data_json }])
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

// Get all business data for the current user (with optional filtering)
export async function GET(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tableId = searchParams.get('virtual_table_schema_id');
  
  // Always filter by authenticated user's ID
  let query = supabase
    .from('BusinessData')
    .select('*')
    .eq('user_id', userId);
  
  if (tableId) {
    query = query.eq('virtual_table_schema_id', Number(tableId));
  }
  
  const { data, error } = await query.order('creation_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
