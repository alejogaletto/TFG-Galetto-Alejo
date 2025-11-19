
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { VirtualSchema } from '@/lib/types';

const supabase = createClient();

// Get a single virtual schema by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('VirtualSchema').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Virtual schema not found' }, { status: 404 });
  return NextResponse.json(data);
}

// Update a virtual schema by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, description, configs } = await req.json() as VirtualSchema;
  const { data, error } = await supabase.from('VirtualSchema').update({ name, description, configs }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Delete a virtual schema by ID with manual cascading cleanup
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Load related table IDs
    const { data: tables, error: tablesError } = await supabase
      .from('VirtualTableSchema')
      .select('id')
      .eq('virtual_schema_id', id);
    if (tablesError) throw tablesError;
    const tableIds = tables?.map((table) => table.id) ?? [];

    // Load related field IDs
    let fieldIds: number[] = [];
    if (tableIds.length > 0) {
      const { data: fields, error: fieldsError } = await supabase
        .from('VirtualFieldSchema')
        .select('id')
        .in('virtual_table_schema_id', tableIds);
      if (fieldsError) throw fieldsError;
      fieldIds = fields?.map((field) => field.id) ?? [];
    }

    // Delete field mappings referencing the fields
    if (fieldIds.length > 0) {
      const { error: fieldMappingError } = await supabase
        .from('FieldMapping')
        .delete()
        .in('virtual_field_schema_id', fieldIds);
      if (fieldMappingError) throw fieldMappingError;
    }

    // Collect related data connections (by schema and tables)
    const { data: schemaConnections, error: schemaConnectionsError } = await supabase
      .from('DataConnection')
      .select('id')
      .eq('virtual_schema_id', id);
    if (schemaConnectionsError) throw schemaConnectionsError;

    let tableConnections: { id: number }[] = [];
    if (tableIds.length > 0) {
      const { data, error } = await supabase
        .from('DataConnection')
        .select('id')
        .in('virtual_table_schema_id', tableIds);
      if (error) throw error;
      tableConnections = data ?? [];
    }

    const dataConnectionIds = Array.from(
      new Set([
        ...(schemaConnections?.map((conn) => conn.id) ?? []),
        ...(tableConnections?.map((conn) => conn.id) ?? []),
      ]),
    );

    if (dataConnectionIds.length > 0) {
      const { error: fieldMappingByConnectionError } = await supabase
        .from('FieldMapping')
        .delete()
        .in('data_connection_id', dataConnectionIds);
      if (fieldMappingByConnectionError) throw fieldMappingByConnectionError;
    }

    // Delete data connections
    if (dataConnectionIds.length > 0) {
      const { error: dataConnectionError } = await supabase
        .from('DataConnection')
        .delete()
        .in('id', dataConnectionIds);
      if (dataConnectionError) throw dataConnectionError;
    }

    // Delete business data rows tied to tables
    if (tableIds.length > 0) {
      const { error: businessDataError } = await supabase
        .from('BusinessData')
        .delete()
        .in('virtual_table_schema_id', tableIds);
      if (businessDataError) throw businessDataError;
    }

    // Delete virtual fields and tables
    if (fieldIds.length > 0) {
      const { error: fieldsDeleteError } = await supabase
        .from('VirtualFieldSchema')
        .delete()
        .in('id', fieldIds);
      if (fieldsDeleteError) throw fieldsDeleteError;
    }

    if (tableIds.length > 0) {
      const { error: tablesDeleteError } = await supabase
        .from('VirtualTableSchema')
        .delete()
        .in('id', tableIds);
      if (tablesDeleteError) throw tablesDeleteError;
    }

    // Finally delete the schema
    const { error: schemaDeleteError } = await supabase
      .from('VirtualSchema')
      .delete()
      .eq('id', id);
    if (schemaDeleteError) throw schemaDeleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const message = error?.message || 'Error eliminando base de datos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
