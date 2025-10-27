
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { BusinessData } from '@/lib/types';
import { workflowTriggerService } from '@/lib/workflow-trigger-service';

const supabase = createClient();

// Create a new business data
export async function POST(req: NextRequest) {
  const { user_id, virtual_table_schema_id, data_json } = await req.json() as BusinessData;
  const { data, error } = await supabase.from('BusinessData').insert([{ user_id, virtual_table_schema_id, data_json }]).select();
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

// Get all business data (with optional filtering)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tableId = searchParams.get('virtual_table_schema_id');
  const schemaId = searchParams.get('virtual_schema_id');
  
  let query = supabase.from('BusinessData').select('*');
  
  if (tableId) {
    query = query.eq('virtual_table_schema_id', Number(tableId));
  }
  
  // Note: BusinessData doesn't have a direct schema_id field, 
  // so if schemaId is provided, we need to join with VirtualTableSchema
  // For now, we'll just filter by table_id if provided
  
  const { data, error } = await query.order('creation_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
