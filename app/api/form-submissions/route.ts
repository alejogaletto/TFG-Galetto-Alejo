import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

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
        await appendToGoogleSheet(form.user_id, form.configs.googleSheetsConfig.spreadsheetId, form.configs.googleSheetsConfig.sheetName, form_data)
      }
    } catch (gsErr) {
      console.error('Google Sheets append failed:', gsErr)
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
    // Get the data connection ID for this form
    const { data: dataConnection, error: connError } = await supabase
      .from('DataConnection')
      .select('id')
      .eq('form_id', form_id)
      .single();

    if (connError || !dataConnection) {
      console.error('Error fetching data connection:', connError);
      return await storeInFormSubmission(form_id, form_data);
    }

    // Get field mappings for this data connection
    const { data: fieldMappings, error: mappingError } = await supabase
      .from('FieldMapping')
      .select('form_field_id, virtual_field_schema_id')
      .eq('data_connection_id', dataConnection.id);

    if (mappingError) {
      console.error('Error fetching field mappings:', mappingError);
      // Fallback to generic storage
      return await storeInFormSubmission(form_id, form_data);
    }

    // Map form data to database fields
    const mappedData: any = {};
    
    if (fieldMappings && fieldMappings.length > 0) {
      // Use field mappings to structure data
      for (const mapping of fieldMappings) {
        const formFieldId = mapping.form_field_id;
        const virtualFieldId = mapping.virtual_field_schema_id;
        
        // Find the corresponding value in form_data
        if (form_data[formFieldId] !== undefined) {
          mappedData[`field_${virtualFieldId}`] = form_data[formFieldId];
        }
      }
      
      // Also store the original form data for reference
      mappedData.original_form_data = form_data;
    } else {
      // No mappings, store as-is
      mappedData.raw_data = form_data;
    }

    // Store in BusinessData
    const { data, error } = await supabase
      .from('BusinessData')
      .insert([{
        user_id: 1, // TODO: Get from session
        virtual_table_schema_id,
        data_json: mappedData
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Data stored in database',
      data_id: data[0].id,
      storage_type: 'business_data'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error storing in BusinessData:', error);
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
async function appendToGoogleSheet(user_id: number, spreadsheetId: string, sheetName: string, form_data: any) {
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

    const headers = Object.keys(form_data)
    const values = [headers.map((h) => form_data[h])]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    })
  } catch (e) {
    console.error('appendToGoogleSheet error:', e)
  }
}
