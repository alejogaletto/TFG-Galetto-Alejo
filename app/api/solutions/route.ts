import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { Solution } from '@/lib/types';

const supabase = createClient();

// Create a new solution
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Solution;
    const { 
      user_id, 
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

    const { data, error } = await supabase
      .from('Solution')
      .insert([{ 
        user_id, 
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

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/solutions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get all solutions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const is_template = searchParams.get('is_template');
    const template_type = searchParams.get('template_type');
    const includeComponents = searchParams.get('includeComponents') === 'true';

    let query = supabase.from('Solution').select('*');

    // Apply filters
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
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
