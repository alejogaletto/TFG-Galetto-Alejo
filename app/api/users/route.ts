
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServerAdminClient } from '@/lib/supabase-client';
import { User } from '@/lib/types';
import { hashPassword, validatePassword } from '@/lib/password';

const supabase = createClient();

// Create a new user profile (linked to Supabase Auth user)
// This endpoint is for creating the User table record, not for authentication
export async function POST(req: NextRequest) {
  try {
    const { id, email, name, configs, password } = await req.json() as User & { password?: string };

    // If this is being called from the signup flow with Supabase Auth, id will be provided
    if (id) {
      // Create profile for existing auth user
      const { data, error } = await supabase
        .from('User')
        .insert([{ id, email, name, configs }])
        .select('id, name, email, configs, creation_date');
      
      if (error) {
        console.error('Profile creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data, { status: 201 });
    }

    // Legacy support: create both auth user and profile (for backward compatibility)
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Validate password
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
    }

    // Create Supabase Auth user using admin client
    const adminSupabase = createServerAdminClient();
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        company_name: configs?.companyName,
      },
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create user profile in User table
    const { data, error } = await supabase
      .from('User')
      .insert([{ id: authData.user.id, email, name, configs }])
      .select('id, name, email, configs, creation_date');
    
    if (error) {
      console.error('Profile creation error:', error);
      // Try to clean up the auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('User creation error:', err);
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}

// Get all users
export async function GET() {
  const { data, error } = await supabase.from('User').select('id, name, email, configs, creation_date');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
