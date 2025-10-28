import { NextResponse } from 'next/server';
import { createRLSClient } from '@/lib/supabase-client';

export async function GET() {
  const supabase = await createRLSClient();
  
  // Test 1: Can we get the user from session?
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Test 2: Try to fetch forms with RLS
  const { data: forms, error: formsError } = await supabase
    .from('Form')
    .select('*');
  
  // Test 3: Count total forms in DB (bypassing RLS for comparison)
  const { count: totalForms } = await supabase
    .from('Form')
    .select('*', { count: 'exact', head: true });
  
  return NextResponse.json({
    test1_session: {
      authenticated: !!user,
      user_id: user?.id,
      email: user?.email,
      error: userError?.message
    },
    test2_rls_filtered_forms: {
      success: !formsError,
      forms_visible_to_you: forms?.length || 0,
      forms_data: forms,
      error: formsError?.message
    },
    test3_total_forms_in_db: {
      total_count: totalForms
    },
    diagnosis: {
      session_working: !!user,
      rls_filtering: !!user && forms !== null,
      issue: !user 
        ? 'Session not working - cookies not being read' 
        : forms === null
        ? 'RLS blocking query'
        : forms.length === 0
        ? 'RLS working but no forms match your user_id'
        : 'Everything working correctly!'
    }
  }, { status: 200 });
}

