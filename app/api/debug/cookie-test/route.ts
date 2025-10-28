import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Look for Supabase auth cookies
  const authCookies = allCookies.filter(c => 
    c.name.includes('supabase') || 
    c.name.includes('auth') ||
    c.name.includes('sb-')
  );
  
  return NextResponse.json({
    total_cookies: allCookies.length,
    auth_related_cookies: authCookies.length,
    cookie_names: authCookies.map(c => c.name),
    diagnosis: authCookies.length === 0 
      ? 'NO Supabase cookies found - OAuth not storing cookies properly' 
      : 'Cookies exist but createRLSClient is not reading them correctly'
  });
}

