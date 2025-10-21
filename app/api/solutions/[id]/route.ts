import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { Solution } from '@/lib/types';

const supabase = createClient();

// Get a single solution by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const includeComponents = searchParams.get('includeComponents') === 'true';

    const { data: solution, error } = await supabase
      .from('Solution')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !solution) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    // Optionally include components
    if (includeComponents) {
      const { data: components } = await supabase
        .from('SolutionComponent')
        .select('*')
        .eq('solution_id', id);

      return NextResponse.json({
        ...solution,
        components: components || []
      }, { status: 200 });
    }

    return NextResponse.json(solution, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/solutions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update a solution
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as Partial<Solution>;

    // Update modification_date
    const updateData = {
      ...body,
      modification_date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('Solution')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating solution:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    return NextResponse.json(data[0], { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/solutions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a solution
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the solution (SolutionComponents will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('Solution')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting solution:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Solution deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/solutions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
