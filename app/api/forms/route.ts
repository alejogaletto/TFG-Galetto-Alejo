
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { getServerUserId } from '@/lib/auth-helpers';
import { Form } from '@/lib/types';

const supabase = createClient();

// Create a new form
export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, configs, is_active } = await req.json() as Partial<Form>;
  
  // Always use the authenticated user's ID, not from request body
  const { data, error } = await supabase
    .from('Form')
    .insert([{ user_id: userId, name, description, configs, is_active }])
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all forms for the current user
export async function GET() {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('Form')
    .select('*')
    .eq('user_id', userId);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
