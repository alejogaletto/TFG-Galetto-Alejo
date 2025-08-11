
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { User } from '@/lib/types';
import { hashPassword } from '@/lib/password';

const supabase = createClient();

// Create a new user
export async function POST(req: NextRequest) {
  const { email, password, name, configs } = await req.json() as User & { password: string };

  const passwordHash = await hashPassword(password || '');

  const { data, error } = await supabase
    .from('User')
    .insert([{ email, password: passwordHash, name, configs }])
    .select('id, name, email, configs, creation_date');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Get all users
export async function GET() {
  const { data, error } = await supabase.from('User').select('id, name, email, configs, creation_date');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
