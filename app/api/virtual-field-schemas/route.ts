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
