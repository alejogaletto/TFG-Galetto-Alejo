import { createClient } from '@/lib/supabase-client';
import { workflowExecutionService, WorkflowContext } from '@/lib/workflow-execution-service';

const supabase = createClient();

export interface TriggerResult {
  triggered: number;
  results: Array<{
    workflowId: number;
    workflowName: string;
    success: boolean;
    executionId?: number;
    error?: string;
  }>;
}

/**
 * Service to detect and execute workflow triggers
 */
export class WorkflowTriggerService {
  /**
   * Get all active workflows triggered by a specific form
   */
  async getTriggersForForm(formId: number): Promise<any[]> {
    console.log(`🔍 [WorkflowTrigger] Searching for triggers for form ID: ${formId}`);
    
    const { data, error } = await supabase
      .from('WorkflowTrigger')
      .select(`
        *,
        workflow:Workflow!inner(*)
      `)
      .eq('trigger_type', 'form_submission')
      .eq('trigger_source_id', formId)
      .eq('workflow.is_active', true);

    if (error) {
      console.error('❌ [WorkflowTrigger] Error fetching form triggers:', error);
      return [];
    }

    console.log(`✅ [WorkflowTrigger] Found ${data?.length || 0} active workflow(s) for form ${formId}`);
    if (data && data.length > 0) {
      data.forEach((trigger, index) => {
        console.log(`   ${index + 1}. Workflow ID: ${trigger.workflow.id}, Name: "${trigger.workflow.name}", Active: ${trigger.workflow.is_active}`);
      });
    }

    return data || [];
  }

  /**
   * Get all active workflows triggered by a specific database table
   */
  async getTriggersForTable(
    tableId: number,
    operation: 'create' | 'update' | 'delete'
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('WorkflowTrigger')
      .select(`
        *,
        workflow:Workflow!inner(*)
      `)
      .eq('trigger_type', 'database_change')
      .eq('trigger_source_id', tableId)
      .eq('workflow.is_active', true);

    if (error) {
      console.error('Error fetching database triggers:', error);
      return [];
    }

    // Filter by operation if specified in trigger config
    const filtered = (data || []).filter((trigger) => {
      const config = trigger.trigger_config || {};
      const operations = config.operations || ['create', 'update', 'delete'];
      return operations.includes(operation);
    });

    return filtered;
  }

  /**
   * Execute all workflows triggered by a form submission
   */
  async executeFormSubmissionTriggers(
    formId: number,
    submissionData: any,
    submissionId?: number
  ): Promise<TriggerResult> {
    console.log(`\n🚀 [WorkflowTrigger] Form submission trigger fired for form ID: ${formId}`);
    console.log(`📝 [WorkflowTrigger] Submission data keys:`, Object.keys(submissionData));
    
    const triggers = await this.getTriggersForForm(formId);
    
    if (triggers.length === 0) {
      console.log(`⚠️ [WorkflowTrigger] No active workflows found for form ${formId}`);
      return { triggered: 0, results: [] };
    }

    // Build context from form data
    const context: WorkflowContext = {
      ...submissionData,
      form_id: formId,
      submission_id: submissionId,
      operation: 'create',
      trigger_type: 'form_submission'
    };

    console.log(`🎯 [WorkflowTrigger] Executing ${triggers.length} workflow(s)...`);

    // Execute all triggered workflows
    const results = await Promise.all(
      triggers.map(async (trigger) => {
        try {
          const workflow = trigger.workflow;
          console.log(`\n▶️ [WorkflowTrigger] Starting workflow ${workflow.id}: "${workflow.name}"`);
          
          const result = await workflowExecutionService.executeWorkflow(
            workflow.id,
            context
          );

          console.log(`${result.success ? '✅' : '❌'} [WorkflowTrigger] Workflow ${workflow.id} ${result.success ? 'completed' : 'failed'}`);

          return {
            workflowId: workflow.id,
            workflowName: workflow.name || 'Unnamed Workflow',
            success: result.success,
            executionId: result.executionId,
            error: result.error
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ [WorkflowTrigger] Workflow ${trigger.workflow.id} exception:`, errorMsg);
          return {
            workflowId: trigger.workflow.id,
            workflowName: trigger.workflow.name || 'Unnamed Workflow',
            success: false,
            error: errorMsg
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 [WorkflowTrigger] Summary: ${successCount}/${results.length} workflows succeeded`);

    return {
      triggered: triggers.length,
      results
    };
  }

  /**
   * Execute all workflows triggered by a database change
   */
  async executeDatabaseChangeTriggers(
    tableId: number,
    operation: 'create' | 'update' | 'delete',
    recordData: any,
    recordId?: number
  ): Promise<TriggerResult> {
    const triggers = await this.getTriggersForTable(tableId, operation);
    
    if (triggers.length === 0) {
      return { triggered: 0, results: [] };
    }

    // Build context from database record
    const context: WorkflowContext = {
      ...recordData,
      table_id: tableId,
      record_id: recordId,
      operation,
      trigger_type: 'database_change'
    };

    // Execute all triggered workflows
    const results = await Promise.all(
      triggers.map(async (trigger) => {
        try {
          const workflow = trigger.workflow;
          const result = await workflowExecutionService.executeWorkflow(
            workflow.id,
            context
          );

          return {
            workflowId: workflow.id,
            workflowName: workflow.name || 'Unnamed Workflow',
            success: result.success,
            executionId: result.executionId,
            error: result.error
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          return {
            workflowId: trigger.workflow.id,
            workflowName: trigger.workflow.name || 'Unnamed Workflow',
            success: false,
            error: errorMsg
          };
        }
      })
    );

    return {
      triggered: triggers.length,
      results
    };
  }

  /**
   * Create a new workflow trigger
   */
  async createTrigger(
    workflowId: number,
    triggerType: 'form_submission' | 'database_change',
    sourceId: number,
    config?: any
  ): Promise<any> {
    const { data, error } = await supabase
      .from('WorkflowTrigger')
      .insert([{
        workflow_id: workflowId,
        trigger_type: triggerType,
        trigger_source_id: sourceId,
        trigger_config: config || {}
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create trigger: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a workflow trigger
   */
  async deleteTrigger(triggerId: number): Promise<void> {
    const { error } = await supabase
      .from('WorkflowTrigger')
      .delete()
      .eq('id', triggerId);

    if (error) {
      throw new Error(`Failed to delete trigger: ${error.message}`);
    }
  }

  /**
   * Get all triggers for a workflow
   */
  async getTriggersForWorkflow(workflowId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('WorkflowTrigger')
      .select('*')
      .eq('workflow_id', workflowId);

    if (error) {
      console.error('Error fetching workflow triggers:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Delete all triggers for a workflow
   */
  async deleteTriggersForWorkflow(workflowId: number): Promise<void> {
    const { error } = await supabase
      .from('WorkflowTrigger')
      .delete()
      .eq('workflow_id', workflowId);

    if (error) {
      throw new Error(`Failed to delete workflow triggers: ${error.message}`);
    }
  }
}

// Export singleton instance
export const workflowTriggerService = new WorkflowTriggerService();

