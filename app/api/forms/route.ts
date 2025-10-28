
import { NextRequest, NextResponse } from 'next/server';
import { createRLSClient } from '@/lib/supabase-client';
import { Form } from '@/lib/types';
import { notificationService } from '@/lib/notification-service';

// Create a new form
export async function POST(req: NextRequest) {
  const supabase = await createRLSClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, configs, is_active } = await req.json() as Partial<Form>;
  
  // RLS policy will verify user_id matches auth.uid()
  const { data, error } = await supabase
    .from('Form')
    .insert([{ user_id: user.id, name, description, configs, is_active }])
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create notification for form creation (best-effort, non-blocking)
  if (data && data.length > 0) {
    try {
      await notificationService.createNotification({
        userId: user.id,
        type: 'form_created',
        title: 'Nuevo formulario creado',
        message: `Se ha creado el formulario "${name || 'Sin nombre'}"`,
        metadata: {
          form_id: data[0].id,
          form_name: name
        }
      });
    } catch (notifErr) {
      console.error('Failed to create form notification:', notifErr);
      // do not fail the main operation
    }
  }
  
  return NextResponse.json(data, { status: 201 });
}

// Get all forms for the current user (RLS auto-filters)
export async function GET() {
  const supabase = await createRLSClient();

  // No manual filtering needed - RLS handles it automatically
  const { data, error } = await supabase
    .from('Form')
    .select('*');
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
