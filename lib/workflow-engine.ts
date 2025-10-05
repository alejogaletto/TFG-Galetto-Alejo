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
          case "send-whatsapp":
            await this.executeSendWhatsApp(step, execution)
            break
          case "webhook-call":
            await this.executeWebhookCall(step, execution)
            break
          case "transform-data":
            await this.executeTransformData(step, execution)
            break
          case "approval-request":
            await this.executeApprovalRequest(step, execution)
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
    const { recipient, subject, body, template, from, cc, bcc, priority, attachments } = step.config

    try {
      // Validate required fields
      if (!recipient) {
        throw new Error("Recipient is required")
      }
      if (!subject) {
        throw new Error("Subject is required")
      }
      if (!body && !template) {
        throw new Error("Body or template is required")
      }

      execution.logs.push(`Enviando email a: ${recipient}`)
      execution.logs.push(`Asunto: ${subject}`)

      // Process template if specified
      let emailBody = body
      let emailSubject = subject

      if (template) {
        execution.logs.push(`Usando plantilla: ${template}`)
        const templateResult = this.processEmailTemplate(template, execution.context)
        emailBody = templateResult.body
        emailSubject = templateResult.subject || subject
      }

      // Process variables in body and subject
      emailBody = this.processVariables(emailBody, execution.context)
      emailSubject = this.processVariables(emailSubject, execution.context)

      // Prepare email options
      const emailOptions = {
        to: recipient,
        subject: emailSubject,
        text: emailBody,
        html: this.convertToHtml(emailBody),
        from: from || process.env.SMTP_FROM,
        cc: cc,
        bcc: bcc,
        priority: priority || "normal",
        attachments: attachments || []
      }

      // Send email via API
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailOptions)
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        execution.logs.push("Email enviado exitosamente")
        execution.context[`email_${step.id}_sent`] = true
        execution.context[`email_${step.id}_recipient`] = recipient
      } else {
        throw new Error(result.error || "Failed to send email")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      execution.logs.push(`Error enviando email: ${errorMessage}`)
      throw error
    }
  }

  private async executeSendWhatsApp(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    const { phoneNumber, message, template } = step.config

    // Simulate WhatsApp sending
    execution.logs.push(`Enviando WhatsApp a: ${phoneNumber}`)
    execution.logs.push(`Mensaje: ${message}`)
    if (template) {
      execution.logs.push(`Usando plantilla: ${template}`)
    }

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    execution.logs.push("Mensaje de WhatsApp enviado exitosamente")
  }

  private async executeWebhookCall(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    const { url, method, headers, body, timeout } = step.config

    // Simulate webhook call
    execution.logs.push(`Realizando llamada ${method} a: ${url}`)
    if (headers) {
      execution.logs.push(`Headers: ${JSON.stringify(headers)}`)
    }
    if (body) {
      execution.logs.push(`Body: ${JSON.stringify(body)}`)
    }

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    execution.logs.push("Llamada webhook completada exitosamente")
  }

  private async executeTransformData(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    const { inputField, outputField, transformation, mapping } = step.config

    // Simulate data transformation
    execution.logs.push(`Transformando datos de: ${inputField} a ${outputField}`)
    execution.logs.push(`Tipo de transformación: ${transformation}`)
    if (mapping) {
      execution.logs.push(`Mapeo aplicado: ${JSON.stringify(mapping)}`)
    }

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    execution.logs.push("Transformación de datos completada exitosamente")
  }

  private async executeApprovalRequest(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    const { approver, message, timeout, priority } = step.config

    // Simulate approval request
    execution.logs.push(`Enviando solicitud de aprobación a: ${approver}`)
    execution.logs.push(`Mensaje: ${message}`)
    if (priority) {
      execution.logs.push(`Prioridad: ${priority}`)
    }
    if (timeout) {
      execution.logs.push(`Timeout: ${timeout} horas`)
    }

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    execution.logs.push("Solicitud de aprobación enviada exitosamente")
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

  // Email processing helpers
  private processEmailTemplate(templateName: string, context: Record<string, any>): { body: string; subject?: string } {
    const templates = {
      welcome: {
        subject: "¡Bienvenido a {{company}}!",
        body: `Hola {{name}},\n\n¡Bienvenido a {{company}}!\n\nGracias por registrarte. Estamos emocionados de tenerte a bordo.\n\nSaludos,\nEl equipo de {{company}}`
      },
      notification: {
        subject: "Notificación: {{title}}",
        body: `Hola {{name}},\n\n{{message}}\n\nFecha: {{date}}\n\nSaludos,\n{{company}}`
      },
      reminder: {
        subject: "Recordatorio: {{title}}",
        body: `Hola {{name}},\n\nEste es un recordatorio sobre: {{title}}\n\n{{message}}\n\nPor favor, {{action}} antes del {{deadline}}.\n\nSaludos,\n{{company}}`
      },
      approval: {
        subject: "Solicitud de Aprobación: {{title}}",
        body: `Hola {{approver}},\n\nSe requiere tu aprobación para: {{title}}\n\nDetalles: {{details}}\n\nPor favor, revisa y aprueba esta solicitud.\n\nSaludos,\n{{company}}`
      },
      report: {
        subject: "Reporte: {{reportName}}",
        body: `Hola {{name}},\n\nAdjunto encontrarás el reporte: {{reportName}}\n\nPeríodo: {{period}}\n\nResumen: {{summary}}\n\nSaludos,\n{{company}}`
      }
    }

    const template = templates[templateName as keyof typeof templates]
    if (!template) {
      throw new Error(`Template '${templateName}' not found`)
    }

    return {
      body: this.processVariables(template.body, context),
      subject: template.subject ? this.processVariables(template.subject, context) : undefined
    }
  }

  private processVariables(text: string, context: Record<string, any>): string {
    if (!text) return text

    return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const trimmedVariable = variable.trim()
      
      // Handle nested properties (e.g., user.name)
      const value = this.getNestedProperty(context, trimmedVariable)
      
      if (value !== undefined) {
        return String(value)
      }
      
      // Handle special variables
      switch (trimmedVariable) {
        case 'date':
          return new Date().toLocaleDateString('es-ES')
        case 'time':
          return new Date().toLocaleTimeString('es-ES')
        case 'datetime':
          return new Date().toLocaleString('es-ES')
        case 'company':
          return 'AutomateSMB'
        default:
          return match // Return original if not found
      }
    })
  }

  private getNestedProperty(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  private convertToHtml(text: string): string {
    if (!text) return text

    // Convert line breaks to HTML
    let html = text.replace(/\n/g, '<br>')
    
    // Convert URLs to links
    html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    
    // Convert email addresses to mailto links
    html = html.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>')
    
    // Wrap in basic HTML structure
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        ${html}
      </div>
    `
  }
}
