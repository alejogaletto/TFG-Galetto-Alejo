// Tipos para el sistema de integraciones
export interface Integration {
  id: string
  name: string
  description: string
  category: string
  icon: string
  status: "connected" | "disconnected" | "error" | "expired"
  authType: "oauth" | "api_key" | "webhook"
  config: Record<string, any>
  actions: IntegrationAction[]
  connectedAt?: Date
  lastSync?: Date
  error?: string
}

export interface IntegrationAction {
  id: string
  name: string
  description: string
  inputs: ActionInput[]
  outputs: ActionOutput[]
}

export interface ActionInput {
  id: string
  name: string
  type: "text" | "email" | "file" | "select" | "number" | "boolean"
  required: boolean
  description: string
  options?: string[]
}

export interface ActionOutput {
  id: string
  name: string
  type: string
  description: string
}

export interface IntegrationTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  authType: "oauth" | "api_key" | "webhook"
  setupSteps: string[]
  actions: IntegrationAction[]
  popular: boolean
}

// Motor de gestión de integraciones
export class IntegrationsEngine {
  private static instance: IntegrationsEngine
  private integrations: Map<string, Integration> = new Map()
  private templates: IntegrationTemplate[] = []

  private constructor() {
    this.initializeTemplates()
  }

  static getInstance(): IntegrationsEngine {
    if (!IntegrationsEngine.instance) {
      IntegrationsEngine.instance = new IntegrationsEngine()
    }
    return IntegrationsEngine.instance
  }

  private initializeTemplates() {
    this.templates = [
      // Email Services
      {
        id: "gmail",
        name: "Gmail",
        description: "Envía correos electrónicos a través de Gmail",
        category: "email",
        icon: "📧",
        authType: "oauth",
        setupSteps: [
          "Autoriza el acceso a tu cuenta de Gmail",
          "Configura los permisos de envío",
          "Prueba la conexión",
        ],
        actions: [
          {
            id: "send_email",
            name: "Enviar Correo",
            description: "Envía un correo electrónico",
            inputs: [
              {
                id: "to",
                name: "Para",
                type: "email",
                required: true,
                description: "Dirección de correo del destinatario",
              },
              { id: "subject", name: "Asunto", type: "text", required: true, description: "Asunto del correo" },
              { id: "body", name: "Cuerpo", type: "text", required: true, description: "Contenido del correo" },
              { id: "cc", name: "CC", type: "email", required: false, description: "Copia del correo" },
            ],
            outputs: [
              {
                id: "message_id",
                name: "ID del Mensaje",
                type: "string",
                description: "Identificador único del mensaje enviado",
              },
            ],
          },
        ],
        popular: true,
      },
      {
        id: "mailchimp",
        name: "Mailchimp",
        description: "Gestiona listas de correo y campañas",
        category: "email",
        icon: "🐵",
        authType: "api_key",
        setupSteps: ["Obtén tu API key de Mailchimp", "Ingresa la API key", "Selecciona tu audiencia"],
        actions: [
          {
            id: "add_subscriber",
            name: "Agregar Suscriptor",
            description: "Agrega un contacto a una lista",
            inputs: [
              { id: "email", name: "Email", type: "email", required: true, description: "Correo del suscriptor" },
              { id: "first_name", name: "Nombre", type: "text", required: false, description: "Nombre del suscriptor" },
              {
                id: "last_name",
                name: "Apellido",
                type: "text",
                required: false,
                description: "Apellido del suscriptor",
              },
              { id: "list_id", name: "Lista", type: "select", required: true, description: "Lista de destino" },
            ],
            outputs: [
              {
                id: "subscriber_id",
                name: "ID del Suscriptor",
                type: "string",
                description: "ID único del suscriptor",
              },
            ],
          },
        ],
        popular: true,
      },

      // Storage Services
      {
        id: "google_drive",
        name: "Google Drive",
        description: "Almacena y gestiona archivos en Google Drive",
        category: "storage",
        icon: "📁",
        authType: "oauth",
        setupSteps: [
          "Autoriza el acceso a Google Drive",
          "Selecciona las carpetas de trabajo",
          "Configura permisos de archivos",
        ],
        actions: [
          {
            id: "upload_file",
            name: "Subir Archivo",
            description: "Sube un archivo a Google Drive",
            inputs: [
              { id: "file", name: "Archivo", type: "file", required: true, description: "Archivo a subir" },
              { id: "folder_id", name: "Carpeta", type: "select", required: false, description: "Carpeta de destino" },
              { id: "name", name: "Nombre", type: "text", required: false, description: "Nombre del archivo" },
            ],
            outputs: [
              { id: "file_id", name: "ID del Archivo", type: "string", description: "ID único del archivo" },
              { id: "file_url", name: "URL del Archivo", type: "string", description: "URL de acceso al archivo" },
            ],
          },
        ],
        popular: true,
      },
      {
        id: "dropbox",
        name: "Dropbox",
        description: "Sincroniza archivos con Dropbox",
        category: "storage",
        icon: "📦",
        authType: "oauth",
        setupSteps: [
          "Conecta tu cuenta de Dropbox",
          "Autoriza permisos de archivos",
          "Configura carpetas de sincronización",
        ],
        actions: [
          {
            id: "upload_file",
            name: "Subir Archivo",
            description: "Sube un archivo a Dropbox",
            inputs: [
              { id: "file", name: "Archivo", type: "file", required: true, description: "Archivo a subir" },
              { id: "path", name: "Ruta", type: "text", required: true, description: "Ruta de destino" },
            ],
            outputs: [
              { id: "file_path", name: "Ruta del Archivo", type: "string", description: "Ruta completa del archivo" },
            ],
          },
        ],
        popular: false,
      },

      // Payment Services
      {
        id: "stripe",
        name: "Stripe",
        description: "Procesa pagos y gestiona suscripciones",
        category: "payment",
        icon: "💳",
        authType: "api_key",
        setupSteps: ["Obtén tus claves de API de Stripe", "Configura webhooks", "Prueba pagos en modo sandbox"],
        actions: [
          {
            id: "create_payment",
            name: "Crear Pago",
            description: "Crea un enlace de pago",
            inputs: [
              { id: "amount", name: "Monto", type: "number", required: true, description: "Monto en centavos" },
              {
                id: "currency",
                name: "Moneda",
                type: "select",
                required: true,
                description: "Código de moneda",
                options: ["USD", "EUR", "MXN"],
              },
              {
                id: "description",
                name: "Descripción",
                type: "text",
                required: false,
                description: "Descripción del pago",
              },
            ],
            outputs: [
              { id: "payment_url", name: "URL de Pago", type: "string", description: "Enlace para realizar el pago" },
              { id: "payment_id", name: "ID del Pago", type: "string", description: "Identificador único del pago" },
            ],
          },
        ],
        popular: true,
      },

      // CRM Services
      {
        id: "hubspot",
        name: "HubSpot",
        description: "Gestiona contactos y oportunidades de venta",
        category: "crm",
        icon: "🎯",
        authType: "oauth",
        setupSteps: [
          "Conecta tu cuenta de HubSpot",
          "Autoriza acceso a contactos",
          "Configura propiedades personalizadas",
        ],
        actions: [
          {
            id: "create_contact",
            name: "Crear Contacto",
            description: "Crea un nuevo contacto en HubSpot",
            inputs: [
              { id: "email", name: "Email", type: "email", required: true, description: "Correo del contacto" },
              { id: "firstname", name: "Nombre", type: "text", required: false, description: "Nombre del contacto" },
              { id: "lastname", name: "Apellido", type: "text", required: false, description: "Apellido del contacto" },
              { id: "company", name: "Empresa", type: "text", required: false, description: "Empresa del contacto" },
            ],
            outputs: [
              { id: "contact_id", name: "ID del Contacto", type: "string", description: "ID único del contacto" },
            ],
          },
        ],
        popular: true,
      },

      // Communication Services
      {
        id: "slack",
        name: "Slack",
        description: "Envía mensajes y notificaciones a Slack",
        category: "communication",
        icon: "💬",
        authType: "oauth",
        setupSteps: [
          "Instala la app en tu workspace de Slack",
          "Autoriza permisos de mensajería",
          "Selecciona canales de destino",
        ],
        actions: [
          {
            id: "send_message",
            name: "Enviar Mensaje",
            description: "Envía un mensaje a un canal de Slack",
            inputs: [
              { id: "channel", name: "Canal", type: "select", required: true, description: "Canal de destino" },
              { id: "message", name: "Mensaje", type: "text", required: true, description: "Contenido del mensaje" },
              {
                id: "username",
                name: "Nombre de usuario",
                type: "text",
                required: false,
                description: "Nombre del bot",
              },
            ],
            outputs: [
              {
                id: "message_ts",
                name: "Timestamp del Mensaje",
                type: "string",
                description: "Identificador temporal del mensaje",
              },
            ],
          },
        ],
        popular: true,
      },

      // Analytics Services
      {
        id: "google_analytics",
        name: "Google Analytics",
        description: "Rastrea eventos y conversiones",
        category: "analytics",
        icon: "📊",
        authType: "oauth",
        setupSteps: [
          "Conecta tu cuenta de Google Analytics",
          "Selecciona la propiedad a usar",
          "Configura eventos personalizados",
        ],
        actions: [
          {
            id: "track_event",
            name: "Rastrear Evento",
            description: "Registra un evento personalizado",
            inputs: [
              {
                id: "event_name",
                name: "Nombre del Evento",
                type: "text",
                required: true,
                description: "Nombre del evento",
              },
              { id: "category", name: "Categoría", type: "text", required: false, description: "Categoría del evento" },
              { id: "value", name: "Valor", type: "number", required: false, description: "Valor numérico del evento" },
            ],
            outputs: [
              {
                id: "event_id",
                name: "ID del Evento",
                type: "string",
                description: "Identificador del evento registrado",
              },
            ],
          },
        ],
        popular: false,
      },
    ]
  }

  loadIntegrations(): void {
    try {
      const stored = localStorage.getItem("integrations")
      if (stored) {
        const data = JSON.parse(stored)
        this.integrations.clear()
        Object.entries(data).forEach(([id, integration]: [string, any]) => {
          this.integrations.set(id, {
            ...integration,
            connectedAt: integration.connectedAt ? new Date(integration.connectedAt) : undefined,
            lastSync: integration.lastSync ? new Date(integration.lastSync) : undefined,
          })
        })
      }
    } catch (error) {
      console.error("Error loading integrations:", error)
    }
  }

  saveIntegration(integration: Integration): void {
    this.integrations.set(integration.id, integration)
    this.persistIntegrations()
  }

  getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id)
  }

  getAllIntegrations(): Integration[] {
    return Array.from(this.integrations.values())
  }

  getIntegrationTemplates(): IntegrationTemplate[] {
    return this.templates
  }

  getTemplatesByCategory(category: string): IntegrationTemplate[] {
    return this.templates.filter((template) => template.category === category)
  }

  getPopularTemplates(): IntegrationTemplate[] {
    return this.templates.filter((template) => template.popular)
  }

  connectIntegration(templateId: string, config: Record<string, any>): Integration {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const integration: Integration = {
      id: `${templateId}_${Date.now()}`,
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      status: "connected",
      authType: template.authType,
      config,
      actions: template.actions,
      connectedAt: new Date(),
      lastSync: new Date(),
    }

    this.saveIntegration(integration)
    return integration
  }

  disconnectIntegration(id: string): void {
    this.integrations.delete(id)
    this.persistIntegrations()
  }

  updateIntegrationStatus(id: string, status: Integration["status"], error?: string): void {
    const integration = this.integrations.get(id)
    if (integration) {
      integration.status = status
      integration.error = error
      integration.lastSync = new Date()
      this.saveIntegration(integration)
    }
  }

  getAvailableActions(): { integration: Integration; action: IntegrationAction }[] {
    const actions: { integration: Integration; action: IntegrationAction }[] = []

    this.integrations.forEach((integration) => {
      if (integration.status === "connected") {
        integration.actions.forEach((action) => {
          actions.push({ integration, action })
        })
      }
    })

    return actions
  }

  private persistIntegrations(): void {
    try {
      const data = Object.fromEntries(this.integrations.entries())
      localStorage.setItem("integrations", JSON.stringify(data))
    } catch (error) {
      console.error("Error persisting integrations:", error)
    }
  }

  // Simular ejecución de acción de integración
  async executeAction(
    integrationId: string,
    actionId: string,
    inputs: Record<string, any>,
  ): Promise<Record<string, any>> {
    const integration = this.integrations.get(integrationId)
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`)
    }

    const action = integration.actions.find((a) => a.id === actionId)
    if (!action) {
      throw new Error(`Action ${actionId} not found`)
    }

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simular respuesta basada en el tipo de acción
    switch (actionId) {
      case "send_email":
        return { message_id: `msg_${Date.now()}` }
      case "upload_file":
        return {
          file_id: `file_${Date.now()}`,
          file_url: `https://example.com/files/${Date.now()}`,
        }
      case "create_contact":
        return { contact_id: `contact_${Date.now()}` }
      case "add_subscriber":
        return { subscriber_id: `sub_${Date.now()}` }
      case "create_payment":
        return {
          payment_id: `pay_${Date.now()}`,
          payment_url: `https://checkout.stripe.com/pay/${Date.now()}`,
        }
      case "send_message":
        return { message_ts: `${Date.now()}.000` }
      case "track_event":
        return { event_id: `event_${Date.now()}` }
      default:
        return { success: true, timestamp: new Date().toISOString() }
    }
  }
}
