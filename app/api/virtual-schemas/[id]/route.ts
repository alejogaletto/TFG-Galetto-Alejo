
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { VirtualSchema } from '@/lib/types';

const supabase = createClient();

// Get a single virtual schema by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('VirtualSchema').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Virtual schema not found' }, { status: 404 });
  return NextResponse.json(data);
}

// Update a virtual schema by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, description, configs } = await req.json() as VirtualSchema;
  const { data, error } = await supabase.from('VirtualSchema').update({ name, description, configs }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Delete a virtual schema by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // With ON DELETE CASCADE, deleting the schema will remove tables and fields
  const { error } = await supabase.from('VirtualSchema').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
