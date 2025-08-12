
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { Form } from '@/lib/types';

const supabase = createClient();

// Get a single form by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { data, error } = await supabase.from('Form').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  return NextResponse.json(data);
}

// Update a form by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, description, configs, is_active } = await req.json() as Form;
  const { data, error } = await supabase.from('Form').update({ name, description, configs, is_active }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Delete a form by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  // Delete dependent rows first to satisfy FK constraints
  const deleteFields = await supabase.from('FormField').delete().eq('form_id', id)
  if (deleteFields.error) return NextResponse.json({ error: deleteFields.error.message }, { status: 500 })

  const deleteConnections = await supabase.from('DataConnection').delete().eq('form_id', id)
  if (deleteConnections.error) return NextResponse.json({ error: deleteConnections.error.message }, { status: 500 })

  const { error } = await supabase.from('Form').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

// Expanded: get a form with its fields
export async function HEAD(req: NextRequest, { params }: { params: { id: string } }) {
  // no-op for robots; keep default behavior
  return new NextResponse(null, { status: 200 })
}

// GET /api/forms/[id]?includeFields=true
export async function OPTIONS(req: NextRequest, ctx: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('includeFields') !== 'true') {
    return new NextResponse(null, { status: 204 })
  }

  const { id } = ctx.params
  const formRes = await supabase.from('Form').select('*').eq('id', id).single()
  if (formRes.error || !formRes.data) {
    return NextResponse.json({ error: formRes.error?.message || 'Form not found' }, { status: 404 })
  }
  const fieldsRes = await supabase
    .from('FormField')
    .select('*')
    .eq('form_id', id)
    .order('position', { ascending: true })

  if (fieldsRes.error) {
    return NextResponse.json({ error: fieldsRes.error.message }, { status: 500 })
  }

  return NextResponse.json({ ...formRes.data, fields: fieldsRes.data || [] })
}
