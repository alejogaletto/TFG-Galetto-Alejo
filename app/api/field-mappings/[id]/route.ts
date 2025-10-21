
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { FieldMapping } from '@/lib/types';

const supabase = createClient();

// Get a single field mapping by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('FieldMapping').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Field mapping not found' }, { status: 404 });
  return NextResponse.json(data);
}

// Update a field mapping by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data_connection_id, form_field_id, virtual_field_schema_id, changes } = await req.json() as FieldMapping;
  const { data, error } = await supabase.from('FieldMapping').update({ data_connection_id, form_field_id, virtual_field_schema_id, changes }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Delete a field mapping by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('FieldMapping').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
