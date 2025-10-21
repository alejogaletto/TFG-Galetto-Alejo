import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const formId = searchParams.get('form_id');

  if (!formId) {
    return NextResponse.json({ error: 'form_id is required' }, { status: 400 });
  }

  // Get the form
  const { data: form, error: formError } = await supabase
    .from('Form')
    .select('*')
    .eq('id', Number(formId))
    .single();

  if (formError) {
    return NextResponse.json({ error: formError.message }, { status: 500 });
  }

  // Get all data connections for this form
  const { data: dataConnections, error: dcError } = await supabase
    .from('DataConnection')
    .select('*')
    .eq('form_id', Number(formId));

  if (dcError) {
    return NextResponse.json({ error: dcError.message }, { status: 500 });
  }

  // Get all field mappings for each data connection
  const mappingsPromises = dataConnections?.map(async (dc) => {
    const { data: mappings, error: mappingsError } = await supabase
      .from('FieldMapping')
      .select('*')
      .eq('data_connection_id', dc.id);
    
    return {
      data_connection_id: dc.id,
      mappings: mappings || [],
      error: mappingsError
    };
  }) || [];

  const allMappings = await Promise.all(mappingsPromises);

  // Get all form fields
  const { data: formFields, error: fieldsError } = await supabase
    .from('FormField')
    .select('*')
    .eq('form_id', Number(formId))
    .order('position');

  return NextResponse.json({
    form: {
      id: form.id,
      name: form.name,
      configs: form.configs
    },
    dataConnections,
    fieldMappings: allMappings,
    formFields: formFields?.map(f => ({
      id: f.id,
      label: f.label,
      type: f.type,
      position: f.position
    }))
  }, { status: 200 });
}

