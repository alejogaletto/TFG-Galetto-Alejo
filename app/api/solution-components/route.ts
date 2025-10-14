import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { SolutionComponent } from '@/lib/types';

const supabase = createClient();

// Create a new solution component
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SolutionComponent;
    const { solution_id, component_type, component_id, configs } = body;

    // Validate required fields
    if (!solution_id || !component_type || !component_id) {
      return NextResponse.json(
        { error: 'solution_id, component_type, and component_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('SolutionComponent')
      .insert([{ solution_id, component_type, component_id, configs }])
      .select();

    if (error) {
      console.error('Error creating solution component:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/solution-components:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get solution components
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const solution_id = searchParams.get('solution_id');
    const component_type = searchParams.get('component_type');

    let query = supabase.from('SolutionComponent').select('*');

    if (solution_id) {
      query = query.eq('solution_id', solution_id);
    }
    if (component_type) {
      query = query.eq('component_type', component_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching solution components:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/solution-components:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a solution component
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Component ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('SolutionComponent')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting solution component:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Component deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/solution-components:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
