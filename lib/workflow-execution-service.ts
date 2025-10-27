import { createClient } from '@/lib/supabase-client';
import { emailService } from '@/lib/email-service';

const supabase = createClient();

export interface WorkflowContext {
  [key: string]: any;
  // Common context properties
  submission_id?: number;
  record_id?: number;
  operation?: 'create' | 'update' | 'delete';
  form_id?: number;
  table_id?: number;
  user_id?: number;
}

export interface WorkflowExecutionResult {
  success: boolean;
  executionId: number;
  logs: string[];
  error?: string;
}

/**
 * Server-side workflow execution service
 * Executes workflows with proper context and logging
 */
export class WorkflowExecutionService {
  /**
   * Execute a workflow with given context
   */
  async executeWorkflow(
    workflowId: number,
    context: WorkflowContext
  ): Promise<WorkflowExecutionResult> {
    console.log(`\n🔄 [WorkflowExecution] Starting execution for workflow ID: ${workflowId}`);
    const logs: string[] = [];
    let executionId: number;

    try {
      // Get workflow details
      console.log(`📖 [WorkflowExecution] Fetching workflow ${workflowId} from database...`);
      const { data: workflow, error: workflowError } = await supabase
        .from('Workflow')
        .select('*')
        .eq('id', workflowId)
        .eq('is_active', true)
        .single();

      if (workflowError || !workflow) {
        console.error(`❌ [WorkflowExecution] Workflow ${workflowId} not found or inactive:`, workflowError);
        throw new Error(`Workflow ${workflowId} not found or inactive`);
      }

      console.log(`✅ [WorkflowExecution] Workflow loaded: "${workflow.name}" (Active: ${workflow.is_active})`);
      logs.push(`Starting workflow: ${workflow.name}`);

      // Create execution record
      const { data: execution, error: execError } = await supabase
        .from('WorkflowExecution')
        .insert([{
          workflow_id: workflowId,
          status: 'running',
          trigger_type: context.operation ? 'database_change' : 'form_submission',
          trigger_data: context,
          execution_logs: logs,
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (execError || !execution) {
        throw new Error('Failed to create execution record');
      }

      executionId = execution.id;

      // Get workflow steps
      console.log(`📋 [WorkflowExecution] Fetching steps for workflow ${workflowId}...`);
      const { data: steps, error: stepsError } = await supabase
        .from('WorkflowStep')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('position');

      if (stepsError) {
        console.error(`❌ [WorkflowExecution] Failed to fetch steps:`, stepsError);
        throw new Error('Failed to fetch workflow steps');
      }

      console.log(`✅ [WorkflowExecution] Found ${steps?.length || 0} step(s) to execute`);
      if (steps && steps.length > 0) {
        steps.forEach((step, index) => {
          console.log(`   ${index + 1}. Position ${step.position}: ${step.type}`);
        });
      }

      // Execute each step
      for (const step of steps || []) {
        console.log(`\n⚙️ [WorkflowExecution] Executing step ${step.position}: ${step.type}`);
        logs.push(`Executing step ${step.position}: ${step.type}`);
        
        try {
          await this.executeStep(step, context, logs);
          logs.push(`Step ${step.position} completed successfully`);
          console.log(`✅ [WorkflowExecution] Step ${step.position} completed successfully`);
        } catch (stepError) {
          const errorMsg = stepError instanceof Error ? stepError.message : 'Unknown error';
          logs.push(`Step ${step.position} failed: ${errorMsg}`);
          console.error(`❌ [WorkflowExecution] Step ${step.position} failed:`, errorMsg);
          throw stepError;
        }
      }

      // Mark as completed
      await supabase
        .from('WorkflowExecution')
        .update({
          status: 'completed',
          execution_logs: logs,
          completed_at: new Date().toISOString()
        })
        .eq('id', executionId);

      logs.push('Workflow completed successfully');

      return {
        success: true,
        executionId,
        logs
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logs.push(`Workflow failed: ${errorMessage}`);

      // Update execution record with error
      if (executionId!) {
        await supabase
          .from('WorkflowExecution')
          .update({
            status: 'failed',
            execution_logs: logs,
            error_message: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq('id', executionId);
      }

      return {
        success: false,
        executionId: executionId!,
        logs,
        error: errorMessage
      };
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: any,
    context: WorkflowContext,
    logs: string[]
  ): Promise<void> {
    const configs = step.configs || {};
    
    switch (step.type) {
      case 'send-email':
      case 'email':
        await this.executeSendEmailStep(configs, context, logs);
        break;
      
      case 'update-database':
      case 'database':
        await this.executeUpdateDatabaseStep(configs, context, logs);
        break;
      
      case 'condition':
        await this.executeConditionStep(configs, context, logs);
        break;
      
      case 'delay':
        await this.executeDelayStep(configs, logs);
        break;
      
      default:
        logs.push(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute email sending step
   */
  private async executeSendEmailStep(
    configs: any,
    context: WorkflowContext,
    logs: string[]
  ): Promise<void> {
    console.log(`📧 [EmailStep] Processing email step with configs:`, { 
      recipient: configs.recipient, 
      subject: configs.subject,
      hasBody: !!configs.body 
    });

    const { recipient, subject, body, template, from, cc, bcc, priority } = configs;

    if (!recipient) {
      console.error(`❌ [EmailStep] No recipient specified`);
      throw new Error('Email recipient is required');
    }

    // Process variables in recipient, subject, and body
    console.log(`🔄 [EmailStep] Processing variables in email fields...`);
    const processedRecipient = this.processVariables(recipient, context);
    const processedSubject = this.processVariables(subject, context);
    let processedBody = this.processVariables(body, context);

    console.log(`✅ [EmailStep] Variables processed:`);
    console.log(`   To: ${processedRecipient}`);
    console.log(`   Subject: ${processedSubject}`);

    // If template is specified, apply it
    if (template) {
      console.log(`📄 [EmailStep] Applying template: ${template}`);
      processedBody = this.applyEmailTemplate(template, context, processedBody);
    }

    logs.push(`Sending email to: ${processedRecipient}`);
    logs.push(`Subject: ${processedSubject}`);

    // Send email
    console.log(`📤 [EmailStep] Attempting to send email via SMTP...`);
    const success = await emailService.sendEmail({
      to: processedRecipient,
      subject: processedSubject,
      text: processedBody,
      html: this.convertToHtml(processedBody),
      from: from,
      cc: cc ? this.processVariables(cc, context) : undefined,
      bcc: bcc ? this.processVariables(bcc, context) : undefined,
      priority: priority || 'normal'
    });

    if (!success) {
      console.error(`❌ [EmailStep] Email sending failed`);
      throw new Error('Failed to send email');
    }

    console.log(`✅ [EmailStep] Email sent successfully to ${processedRecipient}`);
    logs.push('Email sent successfully');
  }

  /**
   * Execute database update step
   */
  private async executeUpdateDatabaseStep(
    configs: any,
    context: WorkflowContext,
    logs: string[]
  ): Promise<void> {
    const { action, databaseId, mappings, recordId, condition } = configs;

    if (!databaseId) {
      throw new Error('Database ID is required');
    }

    if (!action) {
      throw new Error('Database action is required');
    }

    logs.push(`Database action: ${action} on table ${databaseId}`);

    switch (action) {
      case 'create':
        await this.createDatabaseRecord(databaseId, mappings, context, logs);
        break;
      
      case 'update':
        await this.updateDatabaseRecord(databaseId, mappings, recordId, condition, context, logs);
        break;
      
      case 'delete':
        await this.deleteDatabaseRecord(databaseId, recordId, condition, context, logs);
        break;
      
      default:
        throw new Error(`Unknown database action: ${action}`);
    }
  }

  /**
   * Create a new database record
   */
  private async createDatabaseRecord(
    tableId: number,
    mappings: any[],
    context: WorkflowContext,
    logs: string[]
  ): Promise<void> {
    // Build data object from mappings
    const dataJson: any = {};

    if (mappings && mappings.length > 0) {
      for (const mapping of mappings) {
        const sourceField = mapping.source;
        const targetField = mapping.target;
        
        // Get value from context
        const value = context[sourceField];
        if (value !== undefined) {
          dataJson[targetField] = value;
        }
      }
    }

    logs.push(`Creating record with data: ${JSON.stringify(dataJson)}`);

    // Insert into BusinessData
    const { error } = await supabase
      .from('BusinessData')
      .insert([{
        user_id: context.user_id || 1,
        virtual_table_schema_id: tableId,
        data_json: dataJson
      }]);

    if (error) {
      throw new Error(`Failed to create record: ${error.message}`);
    }

    logs.push('Record created successfully');
  }

  /**
   * Update an existing database record
   */
  private async updateDatabaseRecord(
    tableId: number,
    mappings: any[],
    recordId: string | undefined,
    condition: any,
    context: WorkflowContext,
    logs: string[]
  ): Promise<void> {
    // Determine which record to update
    let targetRecordId: number;

    if (recordId) {
      // Use provided record ID (may contain variables)
      const processedRecordId = this.processVariables(recordId, context);
      targetRecordId = parseInt(processedRecordId);
    } else if (context.record_id) {
      // Use record ID from context
      targetRecordId = context.record_id;
    } else {
      throw new Error('No record ID specified for update');
    }

    // Build update data from mappings
    const dataJson: any = {};

    if (mappings && mappings.length > 0) {
      for (const mapping of mappings) {
        const sourceField = mapping.source;
        const targetField = mapping.target;
        
        const value = context[sourceField];
        if (value !== undefined) {
          dataJson[targetField] = value;
        }
      }
    }

    logs.push(`Updating record ${targetRecordId} with data: ${JSON.stringify(dataJson)}`);

    // Update in BusinessData
    const { error } = await supabase
      .from('BusinessData')
      .update({
        data_json: dataJson,
        modification_date: new Date().toISOString()
      })
      .eq('id', targetRecordId)
      .eq('virtual_table_schema_id', tableId);

    if (error) {
      throw new Error(`Failed to update record: ${error.message}`);
    }

    logs.push('Record updated successfully');
  }

  /**
   * Delete a database record
   */
  private async deleteDatabaseRecord(
    tableId: number,
    recordId: string | undefined,
    condition: any,
    context: WorkflowContext,
    logs: string[]
  ): Promise<void> {
    // Determine which record to delete
    let targetRecordId: number;

    if (recordId) {
      const processedRecordId = this.processVariables(recordId, context);
      targetRecordId = parseInt(processedRecordId);
    } else if (context.record_id) {
      targetRecordId = context.record_id;
    } else {
      throw new Error('No record ID specified for delete');
    }

    logs.push(`Deleting record ${targetRecordId}`);

    // Delete from BusinessData
    const { error } = await supabase
      .from('BusinessData')
      .delete()
      .eq('id', targetRecordId)
      .eq('virtual_table_schema_id', tableId);

    if (error) {
      throw new Error(`Failed to delete record: ${error.message}`);
    }

    logs.push('Record deleted successfully');
  }

  /**
   * Execute condition step
   */
  private async executeConditionStep(
    configs: any,
    context: WorkflowContext,
    logs: string[]
  ): Promise<void> {
    const { field, operator, value } = configs;

    if (!field || !operator) {
      throw new Error('Condition requires field and operator');
    }

    const contextValue = context[field];
    const comparisonValue = this.processVariables(value, context);

    let result = false;

    switch (operator) {
      case 'equals':
        result = contextValue == comparisonValue;
        break;
      case 'not_equals':
        result = contextValue != comparisonValue;
        break;
      case 'contains':
        result = String(contextValue).includes(String(comparisonValue));
        break;
      case 'greater_than':
        result = Number(contextValue) > Number(comparisonValue);
        break;
      case 'less_than':
        result = Number(contextValue) < Number(comparisonValue);
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    logs.push(`Condition: ${field} ${operator} ${comparisonValue} = ${result}`);
  }

  /**
   * Execute delay step
   */
  private async executeDelayStep(configs: any, logs: string[]): Promise<void> {
    const { duration, unit } = configs;
    logs.push(`Delay: ${duration} ${unit} (simulated in server execution)`);
    // Note: In production, this would use a job queue for actual delays
  }

  /**
   * Process variables in a string (e.g., {{field_name}})
   */
  private processVariables(text: string, context: WorkflowContext): string {
    if (!text) return text;

    return String(text).replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const trimmedVariable = variable.trim();
      
      // Handle nested properties (e.g., user.name)
      const value = this.getNestedProperty(context, trimmedVariable);
      
      if (value !== undefined && value !== null) {
        return String(value);
      }
      
      // Handle special variables
      switch (trimmedVariable) {
        case 'date':
          return new Date().toLocaleDateString('es-ES');
        case 'time':
          return new Date().toLocaleTimeString('es-ES');
        case 'datetime':
          return new Date().toLocaleString('es-ES');
        default:
          return match; // Return original if not found
      }
    });
  }

  /**
   * Get nested property from object
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Apply email template
   */
  private applyEmailTemplate(
    template: string,
    context: WorkflowContext,
    body: string
  ): string {
    // Simple template application
    // In a real system, you'd have more sophisticated templating
    return body;
  }

  /**
   * Convert plain text to HTML
   */
  private convertToHtml(text: string): string {
    if (!text) return text;

    // Convert line breaks to HTML
    let html = text.replace(/\n/g, '<br>');
    
    // Convert URLs to links
    html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Convert email addresses to mailto links
    html = html.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
    
    // Wrap in basic HTML structure
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        ${html}
      </div>
    `;
  }
}

// Export singleton instance
export const workflowExecutionService = new WorkflowExecutionService();

