import { NextRequest, NextResponse } from 'next/server';
import { createRLSClient } from '@/lib/supabase-client';
import { Solution } from '@/lib/types';
import { notificationService } from '@/lib/notification-service';

// Create a new solution
export async function POST(req: NextRequest) {
  try {
    const supabase = await createRLSClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as Partial<Solution>;
    const { 
      name, 
      description, 
      template_type, 
      is_template, 
      template_id, 
      status, 
      icon, 
      color, 
      category, 
      configs 
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // RLS policy will verify user_id matches auth.uid()
    const { data, error } = await supabase
      .from('Solution')
      .insert([{ 
        user_id: user.id, 
        name, 
        description, 
        template_type, 
        is_template: is_template || false, 
        template_id, 
        status: status || 'active', 
        icon, 
        color, 
        category, 
        configs 
      }])
      .select();

    if (error) {
      console.error('Error creating solution:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create notification for solution creation (best-effort, non-blocking)
    try {
      await notificationService.createNotification({
        userId: user.id,
        type: 'solution_deployed',
        title: 'Nueva solución creada',
        message: `Se ha creado la solución "${name}"`,
        metadata: {
          solution_id: data[0].id,
          solution_name: name,
          template_type: template_type
        }
      });
    } catch (notifErr) {
      console.error('Failed to create solution notification:', notifErr);
      // do not fail the main operation
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/solutions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get all solutions for the current user (RLS auto-filters)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createRLSClient();

    const { searchParams } = new URL(req.url);
    const is_template = searchParams.get('is_template');
    const template_type = searchParams.get('template_type');
    const includeComponents = searchParams.get('includeComponents') === 'true';

    // No manual filtering - RLS handles it automatically
    let query = supabase
      .from('Solution')
      .select('*');

    // Apply additional filters
    if (is_template !== null) {
      query = query.eq('is_template', is_template === 'true');
    }
    if (template_type) {
      query = query.eq('template_type', template_type);
    }

    // Order by creation date, newest first
    query = query.order('creation_date', { ascending: false });

    const { data: solutions, error } = await query;

    if (error) {
      console.error('Error fetching solutions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optionally include components
    if (includeComponents && solutions) {
      const solutionsWithComponents = await Promise.all(
        solutions.map(async (solution) => {
          const { data: components } = await supabase
            .from('SolutionComponent')
            .select('*')
            .eq('solution_id', solution.id);
          
          return {
            ...solution,
            components: components || []
          };
        })
      );
      return NextResponse.json(solutionsWithComponents, { status: 200 });
    }

    return NextResponse.json(solutions || [], { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/solutions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
