import { NextRequest, NextResponse } from 'next/server';
import { createRLSClient } from '@/lib/supabase-client';
import { Notification } from '@/lib/types';

/**
 * Get notifications for the current user
 * GET /api/notifications?type=form_submission&is_read=false&limit=10
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createRLSClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const is_read = searchParams.get('is_read');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query - filter by authenticated user
    let query = supabase
      .from('Notification')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    if (is_read !== null) {
      query = query.eq('is_read', is_read === 'true');
    }

    // Order by creation date (newest first) and apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      notifications: data as Notification[],
      total: count || 0,
      limit,
      offset
    }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

