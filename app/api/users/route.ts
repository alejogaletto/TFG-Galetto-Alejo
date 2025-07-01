
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { User } from '@/lib/types';

const supabase = createClient();

// Create a new user
export async function POST(req: NextRequest) {
  const { email, password, name, configs } = await req.json() as User;
  const { data, error } = await supabase.from('User').insert([{ email, password, name, configs }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all users
export async function GET() {
  const { data, error } = await supabase.from('User').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
