import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

// Create a solution instance from a template
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: template_id } = params;
    const { user_id, name, description } = await req.json();

    // Validate required fields
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Get the template solution
    const { data: template, error: templateError } = await supabase
      .from('Solution')
      .select('*')
      .eq('id', template_id)
      .eq('is_template', true)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create a new solution instance based on the template
    const { data: newSolution, error: solutionError } = await supabase
      .from('Solution')
      .insert([{
        user_id,
        name: name || `${template.name} - Instance`,
        description: description || template.description,
        template_type: template.template_type,
        is_template: false,
        template_id: parseInt(template_id),
        status: 'draft',
        icon: template.icon,
        color: template.color,
        category: template.category,
        configs: template.configs
      }])
      .select()
      .single();

    if (solutionError || !newSolution) {
      console.error('Error creating solution instance:', solutionError);
      return NextResponse.json({ error: 'Failed to create solution instance' }, { status: 500 });
    }

    // Get template components
    const { data: templateComponents, error: componentsError } = await supabase
      .from('SolutionComponent')
      .select('*')
      .eq('solution_id', template_id);

    if (!componentsError && templateComponents && templateComponents.length > 0) {
      // Copy components to the new solution (as references, not duplicates)
      const newComponents = templateComponents.map(comp => ({
        solution_id: newSolution.id,
        component_type: comp.component_type,
        component_id: comp.component_id,
        configs: comp.configs
      }));

      await supabase
        .from('SolutionComponent')
        .insert(newComponents);
    }

    // Return the new solution with its components
    const { data: components } = await supabase
      .from('SolutionComponent')
      .select('*')
      .eq('solution_id', newSolution.id);

    return NextResponse.json({
      ...newSolution,
      components: components || []
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/solutions/[id]/instantiate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
