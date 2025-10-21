import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const schemaId = searchParams.get('schema_id');
  const tableId = searchParams.get('table_id');

  try {
    // Get all business data
    const { data: allBusinessData, error: bdError } = await supabase
      .from('BusinessData')
      .select('*')
      .order('creation_date', { ascending: false });

    if (bdError) {
      return NextResponse.json({ error: bdError.message }, { status: 500 });
    }

    // Get schema info if provided
    let schemaInfo = null;
    if (schemaId) {
      const { data: schema, error: schemaError } = await supabase
        .from('VirtualSchema')
        .select('*')
        .eq('id', Number(schemaId))
        .single();

      if (!schemaError && schema) {
        // Get all tables for this schema
        const { data: tables, error: tablesError } = await supabase
          .from('VirtualTableSchema')
          .select('*')
          .eq('virtual_schema_id', Number(schemaId));

        schemaInfo = {
          schema,
          tables: tables || []
        };
      }
    }

    // Get table info if provided
    let tableInfo = null;
    if (tableId) {
      const { data: table, error: tableError } = await supabase
        .from('VirtualTableSchema')
        .select('*')
        .eq('id', Number(tableId))
        .single();

      if (!tableError && table) {
        const { data: fields, error: fieldsError } = await supabase
          .from('VirtualFieldSchema')
          .select('*')
          .eq('virtual_table_schema_id', Number(tableId));

        tableInfo = {
          table,
          fields: fields || []
        };
      }
    }

    // Filter business data if table ID provided
    const filteredData = tableId 
      ? allBusinessData?.filter(record => record.virtual_table_schema_id === Number(tableId))
      : allBusinessData;

    return NextResponse.json({
      totalRecords: allBusinessData?.length || 0,
      filteredRecords: filteredData?.length || 0,
      businessData: filteredData || [],
      allBusinessData: allBusinessData || [],
      schemaInfo,
      tableInfo,
      summary: {
        message: tableId 
          ? `Found ${filteredData?.length || 0} records for table ID ${tableId}`
          : `Found ${allBusinessData?.length || 0} total records`,
        tableIdsInData: [...new Set(allBusinessData?.map(r => r.virtual_table_schema_id) || [])]
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Unknown error',
      stack: error.stack 
    }, { status: 500 });
  }
}

