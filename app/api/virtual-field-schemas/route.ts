import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get('virtual_table_schema_id');

    let query = supabase.from('VirtualFieldSchema').select('*');

    if (tableId) {
      query = query.eq('virtual_table_schema_id', tableId);
    }

    const { data, error } = await query.order('id', { ascending: true });

    if (error) {
      console.error('Error fetching virtual field schemas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/virtual-field-schemas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, virtual_table_schema_id, properties } = body || {};

    if (!name || !type || !virtual_table_schema_id) {
      return NextResponse.json({ error: 'name, type y virtual_table_schema_id son requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('VirtualFieldSchema')
      .insert([
        {
          name,
          type,
          virtual_table_schema_id,
          properties: properties || {}
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating virtual field schema:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/virtual-field-schemas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
