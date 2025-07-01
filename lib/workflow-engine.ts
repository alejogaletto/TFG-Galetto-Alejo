// Tipos para el motor de workflows
export interface WorkflowStep {
  id: string
  type: "trigger" | "action"
  actionType: string
  name: string
  description: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export interface WorkflowConnection {
  from: string
  to: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  connections: WorkflowConnection[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: "running" | "completed" | "failed"
  startedAt: Date
  completedAt?: Date
  error?: string
  logs: string[]
  context: Record<string, any>
}

// Motor de ejecución de workflows
export class WorkflowEngine {
  private static instance: WorkflowEngine
  private workflows: Map<string, Workflow> = new Map()
  private executions: Map<string, WorkflowExecution[]> = new Map()

  private constructor() {}

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine()
    }
    return WorkflowEngine.instance
  }

  loadWorkflows(): void {
    try {
      const stored = localStorage.getItem("workflows")
      if (stored) {
        const data = JSON.parse(stored)
        this.workflows.clear()
        Object.entries(data).forEach(([id, workflow]: [string, any]) => {
          this.workflows.set(id, {
            ...workflow,
            createdAt: new Date(workflow.createdAt),
            updatedAt: new Date(workflow.updatedAt),
          })
        })
      }

      const storedExecutions = localStorage.getItem("workflow-executions")
      if (storedExecutions) {
        const data = JSON.parse(storedExecutions)
        this.executions.clear()
        Object.entries(data).forEach(([workflowId, executions]: [string, any]) => {
          this.executions.set(
            workflowId,
            executions.map((exec: any) => ({
              ...exec,
              startedAt: new Date(exec.startedAt),
              completedAt: exec.completedAt ? new Date(exec.completedAt) : undefined,
            })),
          )
        })
      }
    } catch (error) {
      console.error("Error loading workflows:", error)
    }
  }

  saveWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow)
    this.persistWorkflows()
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id)
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
  }

  getExecutions(workflowId: string): WorkflowExecution[] {
    return this.executions.get(workflowId) || []
  }

  async executeWorkflow(workflowId: string, context: Record<string, any> = {}): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      status: "running",
      startedAt: new Date(),
      logs: [],
      context,
    }

    // Add to executions
    const workflowExecutions = this.executions.get(workflowId) || []
    workflowExecutions.unshift(execution)
    this.executions.set(workflowId, workflowExecutions)

    try {
      execution.logs.push(`Iniciando ejecución del workflow: ${workflow.name}`)

      // Execute each step
      for (const step of workflow.steps) {
        execution.logs.push(`Ejecutando paso: ${step.name}`)

        switch (step.actionType) {
          case "send-email":
            await this.executeSendEmail(step, execution)
            break
          case "delay":
            await this.executeDelay(step, execution)
            break
          case "update-database":
            await this.executeUpdateDatabase(step, execution)
            break
          case "condition":
            await this.executeCondition(step, execution)
            break
          default:
            execution.logs.push(`Tipo de acción no soportado: ${step.actionType}`)
        }
      }

      execution.status = "completed"
      execution.completedAt = new Date()
      execution.logs.push("Workflow completado exitosamente")
    } catch (error) {
      execution.status = "failed"
      execution.completedAt = new Date()
      execution.error = error instanceof Error ? error.message : "Error desconocido"
      execution.logs.push(`Error: ${execution.error}`)
    }

    this.persistExecutions()
    return execution
  }

  private async executeSendEmail(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    const { recipient, subject, body } = step.config

    // Simulate email sending
    execution.logs.push(`Enviando email a: ${recipient}`)
    execution.logs.push(`Asunto: ${subject}`)

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    execution.logs.push("Email enviado exitosamente")
  }

  private async executeDelay(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    const { duration, unit } = step.config
    const milliseconds = this.convertToMilliseconds(duration, unit)

    execution.logs.push(`Esperando ${duration} ${unit}`)
    await new Promise((resolve) => setTimeout(resolve, Math.min(milliseconds, 5000))) // Max 5 seconds for demo
    execution.logs.push("Espera completada")
  }

  private async executeUpdateDatabase(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    const { database, action } = step.config

    execution.logs.push(`Actualizando base de datos: ${database}`)
    execution.logs.push(`Acción: ${action}`)

    // Simulate database operation
    await new Promise((resolve) => setTimeout(resolve, 500))

    execution.logs.push("Base de datos actualizada exitosamente")
  }

  private async executeCondition(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    const { field, operator, value } = step.config

    execution.logs.push(`Evaluando condición: ${field} ${operator} ${value}`)

    // Simulate condition evaluation
    const result = Math.random() > 0.5 // Random result for demo
    execution.logs.push(`Resultado de la condición: ${result ? "Verdadero" : "Falso"}`)
  }

  private convertToMilliseconds(duration: number, unit: string): number {
    switch (unit) {
      case "minutes":
        return duration * 60 * 1000
      case "hours":
        return duration * 60 * 60 * 1000
      case "days":
        return duration * 24 * 60 * 60 * 1000
      default:
        return duration * 1000
    }
  }

  private persistWorkflows(): void {
    try {
      const data = Object.fromEntries(this.workflows.entries())
      localStorage.setItem("workflows", JSON.stringify(data))
    } catch (error) {
      console.error("Error persisting workflows:", error)
    }
  }

  private persistExecutions(): void {
    try {
      const data = Object.fromEntries(this.executions.entries())
      localStorage.setItem("workflow-executions", JSON.stringify(data))
    } catch (error) {
      console.error("Error persisting executions:", error)
    }
  }

  deleteWorkflow(id: string): void {
    this.workflows.delete(id)
    this.executions.delete(id)
    this.persistWorkflows()
    this.persistExecutions()
  }
}
