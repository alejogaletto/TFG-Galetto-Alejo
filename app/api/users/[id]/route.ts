
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { User } from '@/lib/types';
import { hashPassword } from '@/lib/password';

const supabase = createClient();

// Get a single user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { data, error } = await supabase.from('User').select('id, name, email, configs, creation_date').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(data);
}

// Update a user by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, email, password, configs } = await req.json() as User & { password?: string };

  const updates: any = { name, email, configs };
  if (password) {
    updates.password = await hashPassword(password);
  }

  const { data, error } = await supabase
    .from('User')
    .update(updates)
    .eq('id', id)
    .select('id, name, email, configs, creation_date');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Delete a user by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { data, error } = await supabase.from('User').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
