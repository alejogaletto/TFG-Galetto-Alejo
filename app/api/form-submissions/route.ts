import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { workflowTriggerService } from '@/lib/workflow-trigger-service';

const supabase = createClient();

// Submit form data
export async function POST(req: NextRequest) {
  try {
    const { form_id, form_data } = await req.json();
    
    if (!form_id || !form_data) {
      return NextResponse.json({ error: 'Form ID and form data are required' }, { status: 400 });
    }

    // Get form details to check database connection
    const { data: form, error: formError } = await supabase
      .from('Form')
      .select('*, configs')
      .eq('id', form_id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Check if form has database connection
    const { data: dataConnection, error: connectionError } = await supabase
      .from('DataConnection')
      .select('*, virtual_table_schema_id')
      .eq('form_id', form_id)
      .order('creation_date', { ascending: false })
      .limit(1)
      .single();

    let storageResponse
    if (dataConnection && !connectionError) {
      storageResponse = await storeInBusinessData(form_id, form_data, dataConnection.virtual_table_schema_id)
    } else {
      storageResponse = await storeInFormSubmission(form_id, form_data)
    }

    // Google Sheets integration (best-effort, non-blocking)
    try {
      if (form.configs?.googleSheets && form.configs?.googleSheetsConfig?.spreadsheetId && form.configs?.googleSheetsConfig?.sheetName) {
        await appendToGoogleSheet(
          form.user_id,
          form.id,
          form.configs.googleSheetsConfig.spreadsheetId,
          form.configs.googleSheetsConfig.sheetName,
          form_data,
        )
      }
    } catch (gsErr) {
      console.error('Google Sheets append failed:', gsErr)
      // do not fail the main storage
    }

    // Trigger workflows associated with this form (best-effort, non-blocking)
    try {
      console.log(`\n🔔 [FormSubmission] Triggering workflows for form ${form_id}...`);
      const triggerResult = await workflowTriggerService.executeFormSubmissionTriggers(
        form_id,
        form_data,
        undefined // Submission ID - could be extracted from response if needed
      );
      console.log(`✅ [FormSubmission] Workflow trigger complete: ${triggerResult.triggered} workflow(s) triggered`);
      if (triggerResult.results.length > 0) {
        triggerResult.results.forEach((result) => {
          console.log(`   - ${result.workflowName}: ${result.success ? '✅ Success' : '❌ Failed'}`);
          if (result.error) {
            console.log(`     Error: ${result.error}`);
          }
        });
      }
    } catch (workflowErr) {
      console.error('❌ [FormSubmission] Workflow trigger execution failed:', workflowErr);
      // do not fail the main storage
    }

    return storageResponse

  } catch (error: any) {
    console.error('Error processing form submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get form submissions
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const form_id = searchParams.get('form_id');

  try {
    if (form_id) {
      // Get submissions for a specific form
      const { data, error } = await supabase
        .from('FormSubmission')
        .select('*')
        .eq('form_id', form_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Get all submissions
      const { data, error } = await supabase
        .from('FormSubmission')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Error fetching form submissions:', error);
    return NextResponse.json({ error: 'Error fetching submissions' }, { status: 500 });
  }
}

// Store data in BusinessData with field mapping
async function storeInBusinessData(form_id: number, form_data: any, virtual_table_schema_id: number) {
  try {
    console.log('📊 Storing in BusinessData:', { form_id, virtual_table_schema_id, form_data });

    // Get the data connection ID for this form
    const { data: dataConnection, error: connError } = await supabase
      .from('DataConnection')
      .select('id, virtual_schema_id, virtual_table_schema_id')
      .eq('form_id', form_id)
      .single();

    if (connError || !dataConnection) {
      console.error('❌ Error fetching data connection:', connError);
      return await storeInFormSubmission(form_id, form_data);
    }

    console.log('✅ Found data connection:', dataConnection);

    // Use the table ID from the data connection if available
    const actualTableId = dataConnection.virtual_table_schema_id || virtual_table_schema_id;
    
    if (!actualTableId) {
      console.error('❌ No virtual_table_schema_id found in DataConnection or parameters');
      return await storeInFormSubmission(form_id, form_data);
    }
    
    console.log('📍 Using table ID:', actualTableId);

    // Get field mappings for this data connection
    const { data: fieldMappings, error: mappingError } = await supabase
      .from('FieldMapping')
      .select('form_field_id, virtual_field_schema_id')
      .eq('data_connection_id', dataConnection.id);

    if (mappingError) {
      console.error('❌ Error fetching field mappings:', mappingError);
      return await storeInFormSubmission(form_id, form_data);
    }

    console.log('📋 Field mappings:', fieldMappings);

    // Get virtual field details to map to field names
    const virtualFieldIds = fieldMappings?.map(m => m.virtual_field_schema_id) || [];
    const { data: virtualFields, error: fieldsError } = await supabase
      .from('VirtualFieldSchema')
      .select('id, name, type')
      .in('id', virtualFieldIds.length > 0 ? virtualFieldIds : [-1]);

    if (fieldsError) {
      console.error('❌ Error fetching virtual fields:', fieldsError);
    }

    console.log('🏷️ Virtual fields:', virtualFields);

    // Map form data to database field names
    const mappedData: any = {};
    
    if (fieldMappings && fieldMappings.length > 0 && virtualFields) {
      // Use field mappings to structure data with proper field names
      for (const mapping of fieldMappings) {
        const formFieldId = mapping.form_field_id;
        const virtualFieldId = mapping.virtual_field_schema_id;
        const virtualField = virtualFields.find(vf => vf.id === virtualFieldId);
        
        // Find the corresponding value in form_data
        if (form_data[formFieldId] !== undefined && virtualField) {
          // Use the actual field name from the virtual schema
          mappedData[virtualField.name] = form_data[formFieldId];
          console.log(`✅ Mapped field: ${virtualField.name} = ${form_data[formFieldId]}`);
        }
      }
    } else {
      console.warn('⚠️ No field mappings found, storing raw data');
      mappedData.raw_data = form_data;
    }

    console.log('💾 Final mapped data to store:', mappedData);

    // Store in BusinessData
    const { data, error } = await supabase
      .from('BusinessData')
      .insert([{
        user_id: 1, // TODO: Get from session
        virtual_table_schema_id: actualTableId,
        data_json: mappedData
      }])
      .select();

    if (error) {
      console.error('❌ Error inserting into BusinessData:', error);
      throw error;
    }

    console.log('✅ Successfully stored in BusinessData:', data[0]);

    // Also store in FormSubmission for backup
    await storeInFormSubmission(form_id, form_data);

    return NextResponse.json({ 
      success: true, 
      message: 'Data stored in database',
      data_id: data[0].id,
      storage_type: 'business_data',
      mapped_fields: Object.keys(mappedData).length
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error storing in BusinessData:', error);
    // Fallback to generic storage
    return await storeInFormSubmission(form_id, form_data);
  }
}

// Store data in generic FormSubmission table
async function storeInFormSubmission(form_id: number, form_data: any) {
  try {
    const { data, error } = await supabase
      .from('FormSubmission')
      .insert([{
        form_id,
        submission_data: form_data,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Data stored in form submissions',
      submission_id: data[0].id,
      storage_type: 'form_submission'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error storing in FormSubmission:', error);
    return NextResponse.json({ error: 'Failed to store submission' }, { status: 500 });
  }
}

// Append to Google Sheets using user's service account credentials
async function appendToGoogleSheet(user_id: number, form_id: number, spreadsheetId: string, sheetName: string, form_data: any) {
  try {
    // Load user to get per-user credentials
    const { data: user, error } = await supabase.from('User').select('configs').eq('id', user_id).single()
    if (error || !user) return
    const email = user.configs?.google?.serviceAccountEmail
    const pem = user.configs?.google?.serviceAccountKey
    if (!email || !pem) return

    const { google } = await import('googleapis')
    const jwt = new google.auth.JWT({
      email,
      key: pem,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    const sheets = google.sheets({ version: 'v4', auth: jwt })

    // 1) Build deterministic column order using form fields (labels)
    const { data: fields, error: fieldsError } = await supabase
      .from('FormField')
      .select('id,label,position')
      .eq('form_id', form_id)
      .order('position', { ascending: true })

    if (fieldsError || !fields) return

    const orderedFields = fields.map((f: any) => ({ id: f.id, label: f.label || `Field ${f.id}` }))
    const headerLabels = orderedFields.map((f: any) => f.label)
    const rowValues = orderedFields.map((f: any) => form_data[f.id] ?? '')

    // 2) Ensure header row exists; if empty sheet, write headers first
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
      majorDimension: 'ROWS'
    })
    const hasHeader = Array.isArray(getRes.data.values) && getRes.data.values.length > 0

    if (!hasHeader) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [headerLabels] }
      })
    }

    // 3) Append the new row in the same column order
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [rowValues] }
    })
  } catch (e) {
    console.error('appendToGoogleSheet error:', e)
  }
}
