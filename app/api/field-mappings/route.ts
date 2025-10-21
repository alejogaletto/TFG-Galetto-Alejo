
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { FieldMapping } from '@/lib/types';

const supabase = createClient();

// Create or update field mappings (supports batch operations)
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Support both single mapping and batch mappings
  const mappings = Array.isArray(body) ? body : [body];
  
  if (mappings.length === 0) {
    return NextResponse.json({ error: 'No mappings provided' }, { status: 400 });
  }

  const data_connection_id = mappings[0].data_connection_id;
  
  if (!data_connection_id) {
    return NextResponse.json({ error: 'data_connection_id is required' }, { status: 400 });
  }

  // Delete existing mappings for this data connection
  await supabase
    .from('FieldMapping')
    .delete()
    .eq('data_connection_id', data_connection_id);

  // Insert new mappings
  const { data, error } = await supabase
    .from('FieldMapping')
    .insert(mappings)
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get field mappings (optionally filter by data_connection_id)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataConnectionId = searchParams.get('data_connection_id');

  let query = supabase.from('FieldMapping').select('*');
  
  if (dataConnectionId) {
    query = query.eq('data_connection_id', Number(dataConnectionId));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Delete field mappings
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataConnectionId = searchParams.get('data_connection_id');
  const id = searchParams.get('id');

  if (!dataConnectionId && !id) {
    return NextResponse.json({ error: 'Either data_connection_id or id is required' }, { status: 400 });
  }

  let query = supabase.from('FieldMapping').delete();
  
  if (id) {
    query = query.eq('id', Number(id));
  } else if (dataConnectionId) {
    query = query.eq('data_connection_id', Number(dataConnectionId));
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 200 });
}
