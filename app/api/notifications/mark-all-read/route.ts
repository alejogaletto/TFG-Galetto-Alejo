import { NextRequest, NextResponse } from 'next/server';
import { createRLSClient } from '@/lib/supabase-client';

/**
 * Mark all notifications as read for the current user
 * PUT /api/notifications/mark-all-read
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createRLSClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update all unread notifications for this user
    const { error } = await supabase
      .from('Notification')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/notifications/mark-all-read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

