"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Database,
  FileText,
  Lightbulb,
  Mail,
  MessageSquare,
  Plus,
  Save,
  Settings,
  Clock,
  AlertCircle,
  Trash,
  Pencil,
  Play,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { WorkflowEngine, type Workflow } from "@/lib/workflow-engine"
import { IntegrationsEngine } from "@/lib/integrations-engine"

export default function CreateWorkflowPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // Check if we're in edit mode
  const isEditMode = searchParams.get('edit') === 'true'
  const workflowData = isEditMode ? JSON.parse(decodeURIComponent(searchParams.get('workflow') || '{}')) : null
  
  const [step, setStep] = useState(isEditMode ? 3 : 1) // Start at step 3 (canvas) if editing
  const [workflowName, setWorkflowName] = useState(workflowData?.name || "")
  const [workflowDescription, setWorkflowDescription] = useState(workflowData?.description || "")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null)
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([])
  const [showStepConfig, setShowStepConfig] = useState<number | null>(null)
  const [draggedAction, setDraggedAction] = useState<string | null>(null)
  const [isDrawingLine, setIsDrawingLine] = useState(false)
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null)
  const [lineEnd, setLineEnd] = useState<{ x: number; y: number } | null>(null)
  const [connections, setConnections] = useState<{ from: number; to: number }[]>([])
  const [isActive, setIsActive] = useState(workflowData?.isActive ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Trigger configuration state
  const [workflowTriggers, setWorkflowTriggers] = useState<Array<{
    type: 'form_submission' | 'database_change';
    sourceId: number;
    sourceName: string;
    config?: any;
  }>>([])
  const [availableForms, setAvailableForms] = useState<any[]>([])
  const [availableTables, setAvailableTables] = useState<any[]>([])
  const [showAddTrigger, setShowAddTrigger] = useState(false)
  const [newTriggerType, setNewTriggerType] = useState<'form_submission' | 'database_change'>('form_submission')
  const [newTriggerSourceId, setNewTriggerSourceId] = useState<number | null>(null)
  const [newTriggerOperations, setNewTriggerOperations] = useState<string[]>(['create', 'update', 'delete'])

  const workflowEngine = WorkflowEngine.getInstance()
  const integrationsEngine = IntegrationsEngine.getInstance()

  useEffect(() => {
    workflowEngine.loadWorkflows()
    integrationsEngine.loadIntegrations()
    
    // Load forms and tables for trigger configuration
    const loadTriggersData = async () => {
      try {
        // Load forms
        const formsResponse = await fetch('/api/forms')
        if (formsResponse.ok) {
          const formsData = await formsResponse.json()
          setAvailableForms(formsData)
        }
        
        // Load tables
        const tablesResponse = await fetch('/api/virtual-table-schemas')
        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json()
          setAvailableTables(tablesData)
        }
      } catch (error) {
        console.error('Error loading triggers data:', error)
      }
    }
    
    loadTriggersData()
  }, [])
  
  // Load workflow triggers when forms and tables are loaded (for edit mode)
  useEffect(() => {
    if (isEditMode && workflowData?.id && availableForms.length > 0 && availableTables.length > 0) {
      loadWorkflowTriggers(workflowData.id)
    }
  }, [availableForms, availableTables, isEditMode, workflowData?.id])

  // Load workflow data when in edit mode
  useEffect(() => {
    if (isEditMode && workflowData) {
      // Convert workflow steps to canvas format
      const canvasSteps = workflowData.steps.map((step: any, index: number) => ({
        id: step.id,
        type: step.type,
        actionId: step.actionType,
        name: step.name,
        description: step.description,
        icon: getActionIcon(step.actionType),
        position: step.position || { x: 50, y: 50 + (index * 130) },
        config: step.config,
      }))
      
      setWorkflowSteps(canvasSteps)
      setConnections(workflowData.connections.map((conn: any) => ({
        from: parseInt(conn.from),
        to: parseInt(conn.to)
      })))
    }
  }, [isEditMode, workflowData?.id]) // Only depend on workflow ID, not the entire workflowData object
  
  // Load triggers for a workflow
  const loadWorkflowTriggers = async (workflowId: number) => {
    try {
      const response = await fetch(`/api/workflow-triggers?workflow_id=${workflowId}`)
      if (response.ok) {
        const triggers = await response.json()
        
        // Convert database triggers to UI format
        const uiTriggers = triggers.map((trigger: any) => {
          const sourceName = trigger.trigger_type === 'form_submission'
            ? availableForms.find(f => f.id === trigger.trigger_source_id)?.name || 'Unknown Form'
            : availableTables.find(t => t.id === trigger.trigger_source_id)?.name || 'Unknown Table'
          
          return {
            type: trigger.trigger_type,
            sourceId: trigger.trigger_source_id,
            sourceName,
            config: trigger.trigger_config
          }
        })
        
        setWorkflowTriggers(uiTriggers)
      }
    } catch (error) {
      console.error('Error loading workflow triggers:', error)
    }
  }

  const getActionIcon = useCallback((actionType: string) => {
    switch (actionType) {
      case "send-email":
        return <Mail className="h-6 w-6 text-primary" />
      case "send-whatsapp":
        return <MessageSquare className="h-6 w-6 text-primary" />
      case "webhook-call":
        return <Zap className="h-6 w-6 text-primary" />
      case "transform-data":
        return <Settings className="h-6 w-6 text-primary" />
      case "approval-request":
        return <Check className="h-6 w-6 text-primary" />
      case "update-database":
        return <Database className="h-6 w-6 text-primary" />
      case "delay":
        return <Clock className="h-6 w-6 text-primary" />
      case "condition":
        return <Check className="h-6 w-6 text-primary" />
      case "notification":
        return <AlertCircle className="h-6 w-6 text-primary" />
      default:
        return <Zap className="h-6 w-6 text-primary" />
    }
  }, [])

  const templates = [
    {
      id: "form-to-database",
      name: "Formulario a Base de Datos",
      description: "Guarda envíos de formularios en una base de datos",
      icon: <FileText className="h-10 w-10 text-primary" />,
      steps: 3,
      complexity: "Principiante",
      workflowSteps: [
        {
          id: Date.now(),
          type: "trigger",
          actionId: "form-submission",
          name: "Envío de Formulario",
          description: "Se activa cuando se envía un formulario",
          icon: <FileText className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 50 },
          config: {},
        },
        {
          id: Date.now() + 1,
          type: "action",
          actionId: "update-database",
          name: "Actualizar Base de Datos",
          description: "Crea o actualiza registros de base de datos",
          icon: <Database className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 180 },
          config: {},
        },
        {
          id: Date.now() + 2,
          type: "action",
          actionId: "send-email",
          name: "Enviar Correo",
          description: "Envía una notificación por correo",
          icon: <Mail className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 310 },
          config: {},
        },
      ],
      connections: [
        { from: Date.now(), to: Date.now() + 1 },
        { from: Date.now() + 1, to: Date.now() + 2 },
      ],
    },
    {
      id: "customer-onboarding",
      name: "Incorporación de Clientes",
      description: "Automatiza el proceso de bienvenida al cliente",
      icon: <Mail className="h-10 w-10 text-primary" />,
      steps: 4,
      complexity: "Intermedio",
      workflowSteps: [
        {
          id: Date.now(),
          type: "trigger",
          actionId: "form-submission",
          name: "Registro de Cliente",
          description: "Se activa cuando un cliente se registra",
          icon: <FileText className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 50 },
          config: {},
        },
        {
          id: Date.now() + 1,
          type: "action",
          actionId: "update-database",
          name: "Crear Perfil de Cliente",
          description: "Crea el perfil del cliente en la base de datos",
          icon: <Database className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 180 },
          config: {},
        },
        {
          id: Date.now() + 2,
          type: "action",
          actionId: "send-email",
          name: "Email de Bienvenida",
          description: "Envía email de bienvenida al cliente",
          icon: <Mail className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 310 },
          config: {},
        },
        {
          id: Date.now() + 3,
          type: "action",
          actionId: "delay",
          name: "Esperar 24 horas",
          description: "Espera 24 horas antes del siguiente paso",
          icon: <Clock className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 440 },
          config: {},
        },
      ],
      connections: [
        { from: Date.now(), to: Date.now() + 1 },
        { from: Date.now() + 1, to: Date.now() + 2 },
        { from: Date.now() + 2, to: Date.now() + 3 },
      ],
    },
    {
      id: "approval-process",
      name: "Proceso de Aprobación",
      description: "Crea un flujo de trabajo de aprobación de múltiples pasos",
      icon: <Check className="h-10 w-10 text-primary" />,
      steps: 5,
      complexity: "Avanzado",
      workflowSteps: [
        {
          id: Date.now(),
          type: "trigger",
          actionId: "manual",
          name: "Solicitud de Aprobación",
          description: "Se activa manualmente para solicitar aprobación",
          icon: <ArrowRight className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 50 },
          config: {},
        },
        {
          id: Date.now() + 1,
          type: "action",
          actionId: "send-email",
          name: "Notificar Supervisor",
          description: "Envía notificación al supervisor",
          icon: <Mail className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 180 },
          config: {},
        },
        {
          id: Date.now() + 2,
          type: "action",
          actionId: "condition",
          name: "Verificar Aprobación",
          description: "Verifica si la solicitud fue aprobada",
          icon: <Check className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 310 },
          config: {},
        },
        {
          id: Date.now() + 3,
          type: "action",
          actionId: "update-database",
          name: "Actualizar Estado",
          description: "Actualiza el estado en la base de datos",
          icon: <Database className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 440 },
          config: {},
        },
        {
          id: Date.now() + 4,
          type: "action",
          actionId: "send-email",
          name: "Confirmación Final",
          description: "Envía confirmación del resultado",
          icon: <Mail className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 570 },
          config: {},
        },
      ],
      connections: [
        { from: Date.now(), to: Date.now() + 1 },
        { from: Date.now() + 1, to: Date.now() + 2 },
        { from: Date.now() + 2, to: Date.now() + 3 },
        { from: Date.now() + 3, to: Date.now() + 4 },
      ],
    },
    {
      id: "scheduled-report",
      name: "Reporte Programado",
      description: "Genera y envía reportes según programación",
      icon: <Calendar className="h-10 w-10 text-primary" />,
      steps: 3,
      complexity: "Intermedio",
      workflowSteps: [
        {
          id: Date.now(),
          type: "trigger",
          actionId: "schedule",
          name: "Programación Diaria",
          description: "Se activa diariamente a las 9:00 AM",
          icon: <Calendar className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 50 },
          config: { frequency: "daily", time: "09:00" },
        },
        {
          id: Date.now() + 1,
          type: "action",
          actionId: "update-database",
          name: "Generar Reporte",
          description: "Genera el reporte desde la base de datos",
          icon: <Database className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 180 },
          config: {},
        },
        {
          id: Date.now() + 2,
          type: "action",
          actionId: "send-email",
          name: "Enviar Reporte",
          description: "Envía el reporte por correo",
          icon: <Mail className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 310 },
          config: {},
        },
      ],
      connections: [
        { from: Date.now(), to: Date.now() + 1 },
        { from: Date.now() + 1, to: Date.now() + 2 },
      ],
    },
    {
      id: "data-sync",
      name: "Sincronización de Base de Datos",
      description: "Mantén dos bases de datos sincronizadas",
      icon: <Database className="h-10 w-10 text-primary" />,
      steps: 4,
      complexity: "Avanzado",
      workflowSteps: [
        {
          id: Date.now(),
          type: "trigger",
          actionId: "database-change",
          name: "Cambio en Base de Datos",
          description: "Se activa cuando cambian los datos",
          icon: <Database className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 50 },
          config: {},
        },
        {
          id: Date.now() + 1,
          type: "action",
          actionId: "condition",
          name: "Verificar Tipo de Cambio",
          description: "Verifica qué tipo de cambio ocurrió",
          icon: <Check className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 180 },
          config: {},
        },
        {
          id: Date.now() + 2,
          type: "action",
          actionId: "update-database",
          name: "Sincronizar Datos",
          description: "Sincroniza los datos con la segunda base",
          icon: <Database className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 310 },
          config: {},
        },
        {
          id: Date.now() + 3,
          type: "action",
          actionId: "notification",
          name: "Notificar Sincronización",
          description: "Envía notificación de sincronización exitosa",
          icon: <AlertCircle className="h-6 w-6 text-primary" />,
          position: { x: 50, y: 440 },
          config: {},
        },
      ],
      connections: [
        { from: Date.now(), to: Date.now() + 1 },
        { from: Date.now() + 1, to: Date.now() + 2 },
        { from: Date.now() + 2, to: Date.now() + 3 },
      ],
    },
    {
      id: "blank",
      name: "Flujo de Trabajo en Blanco",
      description: "Comenzar desde cero",
      icon: <Plus className="h-10 w-10 text-primary" />,
      steps: 0,
      complexity: "Cualquiera",
      workflowSteps: [],
      connections: [],
    },
  ]

  const triggers = [
    {
      id: "form-submission",
      name: "Envío de Formulario",
      description: "Se activa cuando se envía un formulario",
      icon: <FileText className="h-8 w-8 text-primary" />,
      category: "Formularios",
    },
    {
      id: "schedule",
      name: "Programación",
      description: "Se activa en horarios específicos",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      category: "Tiempo",
    },
    {
      id: "database-change",
      name: "Cambio en Base de Datos",
      description: "Se activa cuando cambian los datos",
      icon: <Database className="h-8 w-8 text-primary" />,
      category: "Datos",
    },
    {
      id: "manual",
      name: "Activador Manual",
      description: "Se activa manualmente con un botón",
      icon: <ArrowRight className="h-8 w-8 text-primary" />,
      category: "Manual",
    },
  ]

  // Combinar acciones básicas con acciones de integraciones
  const getAvailableActions = () => {
    const basicActions = [
      {
        id: "send-email",
        name: "Enviar Correo",
        description: "Envía una notificación por correo electrónico",
        icon: <Mail className="h-6 w-6 text-primary" />,
        category: "Comunicación",
        type: "basic",
      },
      {
        id: "send-whatsapp",
        name: "Enviar WhatsApp",
        description: "Envía un mensaje por WhatsApp",
        icon: <MessageSquare className="h-6 w-6 text-primary" />,
        category: "Comunicación",
        type: "basic",
      },
      {
        id: "webhook-call",
        name: "Llamada Webhook",
        description: "Realiza una llamada HTTP a una URL externa",
        icon: <Zap className="h-6 w-6 text-primary" />,
        category: "Integración",
        type: "basic",
      },
      {
        id: "transform-data",
        name: "Transformar Datos",
        description: "Transforma y procesa datos entre pasos",
        icon: <Settings className="h-6 w-6 text-primary" />,
        category: "Datos",
        type: "basic",
      },
      {
        id: "approval-request",
        name: "Solicitar Aprobación",
        description: "Envía una solicitud de aprobación a un usuario",
        icon: <Check className="h-6 w-6 text-primary" />,
        category: "Aprobación",
        type: "basic",
      },
      {
        id: "update-database",
        name: "Actualizar Base de Datos",
        description: "Crea o actualiza registros de base de datos",
        icon: <Database className="h-6 w-6 text-primary" />,
        category: "Datos",
        type: "basic",
      },
      {
        id: "delay",
        name: "Retraso",
        description: "Espera por un tiempo específico",
        icon: <Clock className="h-6 w-6 text-primary" />,
        category: "Flujo",
        type: "basic",
      },
      {
        id: "condition",
        name: "Condición",
        description: "Ramifica basado en condiciones",
        icon: <Check className="h-6 w-6 text-primary" />,
        category: "Flujo",
        type: "basic",
      },
      {
        id: "notification",
        name: "Enviar Notificación",
        description: "Envía notificación en la aplicación",
        icon: <AlertCircle className="h-6 w-6 text-primary" />,
        category: "Notificaciones",
        type: "basic",
      },
    ]

    // Agregar acciones de integraciones
    const integrationActions = integrationsEngine.getAvailableActions().map(({ integration, action }) => ({
      id: `${integration.id}_${action.id}`,
      name: `${integration.name}: ${action.name}`,
      description: action.description,
      icon: <Zap className="h-6 w-6 text-primary" />,
      category: "Integraciones",
      type: "integration",
      integrationId: integration.id,
      actionId: action.id,
      integration: integration as any,
      action: action as any,
    }))

    return [...basicActions, ...integrationActions]
  }

  const actions = getAvailableActions()

  const forms = [
    { id: "customer-feedback", name: "Retroalimentación del Cliente" },
    { id: "contact-form", name: "Formulario de Contacto" },
    { id: "support-request", name: "Solicitud de Soporte" },
    { id: "job-application", name: "Solicitud de Empleo" },
  ]

  const databases = [
    { id: "customers", name: "Clientes" },
    { id: "orders", name: "Pedidos" },
    { id: "products", name: "Productos" },
    { id: "employees", name: "Empleados" },
  ]

  const handleNext = () => {
    if (step === 1 && selectedTemplate) {
      // Load template steps when moving from step 1 to step 2
      const template = templates.find(t => t.id === selectedTemplate)
      if (template && template.workflowSteps) {
        // Generate unique IDs for template steps to avoid conflicts
        const templateSteps = template.workflowSteps.map((step, index) => ({
          ...step,
          id: Date.now() + index,
        }))
        
        // Create a mapping from old IDs to new IDs
        const idMapping = new Map()
        template.workflowSteps.forEach((originalStep, index) => {
          idMapping.set(originalStep.id, templateSteps[index].id)
        })
        
        // Generate connections with new IDs
        const templateConnections = template.connections.map(conn => ({
          from: idMapping.get(conn.from),
          to: idMapping.get(conn.to),
        })).filter(conn => conn.from && conn.to) // Filter out invalid connections
        
        setWorkflowSteps(templateSteps)
        setConnections(templateConnections)
      }
    }
    
    if (step === 3) {
      handleSaveWorkflow()
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }
  
  // Trigger management functions
  const handleAddTrigger = () => {
    if (!newTriggerSourceId) return
    
    const sourceName = newTriggerType === 'form_submission' 
      ? availableForms.find(f => f.id === newTriggerSourceId)?.name || 'Unknown Form'
      : availableTables.find(t => t.id === newTriggerSourceId)?.name || 'Unknown Table'
    
    const config = newTriggerType === 'database_change' 
      ? { operations: newTriggerOperations }
      : {}
    
    setWorkflowTriggers([...workflowTriggers, {
      type: newTriggerType,
      sourceId: newTriggerSourceId,
      sourceName,
      config
    }])
    
    setShowAddTrigger(false)
    setNewTriggerSourceId(null)
    setNewTriggerOperations(['create', 'update', 'delete'])
  }
  
  const handleRemoveTrigger = (index: number) => {
    setWorkflowTriggers(workflowTriggers.filter((_, i) => i !== index))
  }

  const isNextDisabled = () => {
    if (step === 1) return !selectedTemplate
    if (step === 2) return !workflowName
    if (step === 3) return workflowSteps.length === 0
    return false
  }

  const handleSaveWorkflow = async (temporary = false) => {
    if (!workflowName || workflowSteps.length === 0) {
      toast({
        title: "Error",
        description: "El workflow debe tener un nombre y al menos un paso",
        variant: "destructive",
      })
      return null
    }

    setIsSaving(true)

    try {
      // Save workflow to database
      const workflowPayload = {
        user_id: 1, // TODO: Get from session
        name: workflowName,
        description: workflowDescription,
        is_active: isActive,
        configs: {
          steps: workflowSteps.map((step) => ({
            id: step.id.toString(),
            type: step.type,
            actionType: step.actionId,
            name: step.name,
            description: step.description,
            config: step.config || {},
            position: step.position,
          })),
          connections: connections.map((conn) => ({
            from: conn.from.toString(),
            to: conn.to.toString(),
          })),
        }
      }
      
      let workflowId: number
      let savedWorkflow: any
      
      // Determine if we're creating or updating
      if (isEditMode && workflowData?.id) {
        // EDIT MODE: Update existing workflow
        console.log(`🔄 Updating existing workflow ID: ${workflowData.id}`)
        workflowId = workflowData.id
        
        const workflowResponse = await fetch(`/api/workflows/${workflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflowPayload)
        })
        
        if (!workflowResponse.ok) {
          throw new Error('Failed to update workflow')
        }
        
        savedWorkflow = await workflowResponse.json()
        
        // Delete existing steps
        await fetch(`/api/workflow-steps?workflow_id=${workflowId}`, {
          method: 'DELETE'
        })
        
        // Delete existing triggers
        await fetch(`/api/workflow-triggers?workflow_id=${workflowId}`, {
          method: 'DELETE'
        })
        
      } else {
        // CREATE MODE: Create new workflow
        console.log(`✨ Creating new workflow`)
        const workflowResponse = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflowPayload)
        })
        
        if (!workflowResponse.ok) {
          throw new Error('Failed to create workflow')
        }
        
        savedWorkflow = await workflowResponse.json()
        workflowId = Array.isArray(savedWorkflow) ? savedWorkflow[0].id : savedWorkflow.id
      }
      
      // Save workflow steps to database (same for both create and update)
      for (let i = 0; i < workflowSteps.length; i++) {
        const step = workflowSteps[i]
        await fetch('/api/workflow-steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflow_id: workflowId,
            type: step.actionId,
            position: i,
            configs: step.config || {}
          })
        })
      }
      
      // Save triggers (same for both create and update)
      for (const trigger of workflowTriggers) {
        await fetch('/api/workflow-triggers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflow_id: workflowId,
            trigger_type: trigger.type,
            trigger_source_id: trigger.sourceId,
            trigger_config: trigger.config || {}
          })
        })
      }
      
      // If temporary save (for testing), return the workflow
      if (temporary) {
        return { id: workflowId, ...savedWorkflow }
      }
      
      // Also save to localStorage for backward compatibility
      const workflow: Workflow = {
        id: workflowId.toString(),
        name: workflowName,
        description: workflowDescription,
        steps: workflowSteps.map((step) => ({
          id: step.id.toString(),
          type: step.type,
          actionType: step.actionId,
          name: step.name,
          description: step.description,
          config: step.config || {},
          position: step.position,
        })),
        connections: connections.map((conn) => ({
          from: conn.from.toString(),
          to: conn.to.toString(),
        })),
        isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      workflowEngine.saveWorkflow(workflow)

      toast({
        title: isEditMode ? "✅ Workflow actualizado" : "✅ Workflow creado",
        description: `El workflow "${workflowName}" se ha ${isEditMode ? 'actualizado' : 'guardado'} correctamente`,
      })

      setTimeout(() => {
        router.push("/dashboard/workflows")
      }, 1500)
      
      return { id: workflowId, ...savedWorkflow }
    } catch (error) {
      console.error('Error saving workflow:', error)
      toast({
        title: "Error",
        description: isEditMode ? "No se pudo actualizar el workflow" : "No se pudo crear el workflow",
        variant: "destructive",
      })
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestWorkflow = async () => {
    if (workflowSteps.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un paso para probar el workflow",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('🧪 Testing workflow...')
      
      // If workflow is already saved (edit mode), use its ID
      let workflowId = isEditMode && workflowData?.id ? workflowData.id : null
      
      // If not saved yet, do a temporary save
      if (!workflowId) {
        console.log('💾 Workflow not saved yet, saving temporarily for test...')
        const tempWorkflow = await handleSaveWorkflow(true)
        if (!tempWorkflow) {
          throw new Error('Failed to save workflow for testing')
        }
        workflowId = tempWorkflow.id
      }

      console.log(`🚀 Executing workflow ${workflowId} with test data...`)

      // Execute the workflow with test data
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id: workflowId,
          trigger_data: {
            test: true,
            name: 'Usuario de Prueba',
            email: 'test@example.com',
            mensaje: 'Este es un test del workflow',
            phone: '555-1234',
            company: 'Empresa de Prueba'
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✅ Prueba exitosa",
          description: `Workflow ejecutado correctamente. Revisa los logs en la consola del servidor.`,
        })
        console.log('✅ Workflow execution successful!')
        console.log('📋 Execution logs:', result.logs)
      } else {
        toast({
          title: "❌ Prueba fallida",
          description: result.error || "Error desconocido",
          variant: "destructive"
        })
        console.error('❌ Workflow execution failed:', result.error)
        if (result.logs) {
          console.log('📋 Execution logs:', result.logs)
        }
      }
    } catch (error) {
      console.error('❌ Test workflow error:', error)
      toast({
        title: "Error en la prueba",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (actionId: string) => {
    setDraggedAction(actionId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedAction) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const action = actions.find((a) => a.id === draggedAction) || triggers.find((t) => t.id === draggedAction)

    if (action) {
      const newStep = {
        id: Date.now(),
        type: triggers.some((t) => t.id === draggedAction) ? "trigger" : "action",
        actionId: draggedAction,
        name: action.name,
        description: action.description,
        icon: action.icon,
        position: { x, y },
        config: {},
      }

      setWorkflowSteps([...workflowSteps, newStep])
      setShowStepConfig(newStep.id)
    }

    setDraggedAction(null)
  }

  const handleStepDragStart = (e: React.DragEvent, stepId: number) => {
    e.stopPropagation()
    const step = workflowSteps.find((s) => s.id === stepId)
    if (!step) return

    e.dataTransfer.setData("application/json", JSON.stringify({ type: "move-step", stepId }))
  }

  const handleStepDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleStepDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"))
      if (data.type === "move-step") {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setWorkflowSteps(
          workflowSteps.map((step) => (step.id === data.stepId ? { ...step, position: { x, y } } : step)),
        )
      }
    } catch (err) {
      // Not a valid JSON or not our data
    }
  }

  const startConnection = (stepId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const step = workflowSteps.find((s) => s.id === stepId)
    if (!step) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    setIsDrawingLine(true)
    setLineStart({
      x: step.position.x + 150,
      y: step.position.y + 50,
    })
    setLineEnd({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const moveConnection = (e: React.MouseEvent) => {
    if (!isDrawingLine || !lineStart) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    setLineEnd({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const endConnection = (targetStepId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDrawingLine || !lineStart) return

    const sourceStep = workflowSteps.find(
      (s) => s.position.x + 150 === lineStart?.x && s.position.y + 50 === lineStart?.y,
    )

    if (sourceStep && sourceStep.id !== targetStepId) {
      setConnections([...connections, { from: sourceStep.id, to: targetStepId }])
    }

    setIsDrawingLine(false)
    setLineStart(null)
    setLineEnd(null)
  }

  const cancelConnection = () => {
    setIsDrawingLine(false)
    setLineStart(null)
    setLineEnd(null)
  }

  const removeStep = (stepId: number) => {
    setWorkflowSteps(workflowSteps.filter((step) => step.id !== stepId))
    setConnections(connections.filter((conn) => conn.from !== stepId && conn.to !== stepId))
    if (showStepConfig === stepId) {
      setShowStepConfig(null)
    }
  }

  const updateWorkflowStep = (id: number, updates: any) => {
    setWorkflowSteps(workflowSteps.map((step) => (step.id === id ? { ...step, ...updates } : step)))
  }

  // Canvas zoom and sizing functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.3))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  // Calculate canvas size based on workflow steps
  const calculateCanvasSize = () => {
    if (workflowSteps.length === 0) {
      return { width: 800, height: 600 }
    }

    // Find the maximum Y position and add padding
    const maxY = Math.max(...workflowSteps.map(step => step.position.y))
    const minY = Math.min(...workflowSteps.map(step => step.position.y))
    
    // Calculate required height (maxY + step height + padding)
    const requiredHeight = Math.max(600, maxY + 200)
    const requiredWidth = Math.max(800, 400) // Ensure minimum width

    return { width: requiredWidth, height: requiredHeight }
  }

  // Update canvas size when workflow steps change
  useEffect(() => {
    const newSize = calculateCanvasSize()
    setCanvasSize(newSize)
  }, [workflowSteps])

  const renderStepConfig = () => {
    const step = workflowSteps.find((s) => s.id === showStepConfig)
    if (!step) return null

    const action = actions.find((a) => a.id === step.actionId)

    return (
      <Dialog open={showStepConfig !== null} onOpenChange={() => setShowStepConfig(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Configurar {step.name}</DialogTitle>
            <DialogDescription>Configura los detalles para este paso del flujo de trabajo</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 overflow-y-auto">
            {step.actionId === "send-email" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Para *</Label>
                  <Input
                    id="recipient"
                    placeholder="recipient@example.com"
                    defaultValue={step.config.recipient || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, recipient: e.target.value },
                      })
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template">Plantilla (Opcional)</Label>
                  <Select
                    defaultValue={step.config.template || "none"}
                    onValueChange={(value) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, template: value === "none" ? "" : value },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin plantilla</SelectItem>
                      <SelectItem value="welcome">Bienvenida</SelectItem>
                      <SelectItem value="notification">Notificación</SelectItem>
                      <SelectItem value="reminder">Recordatorio</SelectItem>
                      <SelectItem value="approval">Solicitud de Aprobación</SelectItem>
                      <SelectItem value="report">Reporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto *</Label>
                  <Input
                    id="subject"
                    placeholder="Asunto del correo"
                    defaultValue={step.config.subject || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, subject: e.target.value },
                      })
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="body">Cuerpo del Mensaje *</Label>
                  <Textarea
                    id="body"
                    placeholder="Contenido del correo"
                    rows={5}
                    defaultValue={step.config.body || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, body: e.target.value },
                      })
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from">De (Opcional)</Label>
                  <Input
                    id="from"
                    placeholder="sender@company.com"
                    defaultValue={step.config.from || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, from: e.target.value },
                      })
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cc">CC (Opcional)</Label>
                  <Input
                    id="cc"
                    placeholder="cc@example.com"
                    defaultValue={step.config.cc || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, cc: e.target.value },
                      })
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bcc">BCC (Opcional)</Label>
                  <Input
                    id="bcc"
                    placeholder="bcc@example.com"
                    defaultValue={step.config.bcc || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, bcc: e.target.value },
                      })
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    defaultValue={step.config.priority || "normal"}
                    onValueChange={(value) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, priority: value },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div><strong>Variables disponibles:</strong></div>
                  <div>• {`{{nombre}}`} - Nombre del usuario</div>
                  <div>• {`{{email}}`} - Email del usuario</div>
                  <div>• {`{{date}}`} - Fecha actual</div>
                  <div>• {`{{time}}`} - Hora actual</div>
                  <div>• {`{{company}}`} - Nombre de la empresa</div>
                  <div>• {`{{formData.campo}}`} - Datos del formulario</div>
                </div>
              </div>
            )}

            {step.actionId === "send-whatsapp" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Número de Teléfono</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1234567890"
                    defaultValue={step.config.phoneNumber || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, phoneNumber: e.target.value },
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Mensaje de WhatsApp"
                    rows={4}
                    defaultValue={step.config.message || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, message: e.target.value },
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Plantilla (Opcional)</Label>
                  <Select
                    defaultValue={step.config.template || "none"}
                    onValueChange={(value) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, template: value === "none" ? "" : value },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin plantilla</SelectItem>
                      <SelectItem value="welcome">Bienvenida</SelectItem>
                      <SelectItem value="reminder">Recordatorio</SelectItem>
                      <SelectItem value="notification">Notificación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground">
                  Usa variables como {`{{nombre}}`} o {`{{telefono}}`} para datos dinámicos
                </div>
              </div>
            )}

            {step.actionId === "webhook-call" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    placeholder="https://api.example.com/webhook"
                    defaultValue={step.config.url || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, url: e.target.value },
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Método HTTP</Label>
                  <Select
                    defaultValue={step.config.method || "POST"}
                    onValueChange={(value) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, method: value },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headers">Headers (JSON)</Label>
                  <Textarea
                    id="headers"
                    placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                    rows={3}
                    defaultValue={step.config.headers ? JSON.stringify(step.config.headers, null, 2) : ""}
                    onChange={(e) => {
                      try {
                        const headers = e.target.value ? JSON.parse(e.target.value) : {}
                        updateWorkflowStep(step.id, {
                          config: { ...step.config, headers },
                        })
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Body (JSON)</Label>
                  <Textarea
                    id="body"
                    placeholder='{"key": "value", "data": "{{formData}}"}'
                    rows={4}
                    defaultValue={step.config.body ? JSON.stringify(step.config.body, null, 2) : ""}
                    onChange={(e) => {
                      try {
                        const body = e.target.value ? JSON.parse(e.target.value) : {}
                        updateWorkflowStep(step.id, {
                          config: { ...step.config, body },
                        })
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Usa variables como {`{{formData}}`} o {`{{userId}}`} para datos dinámicos
                </div>
              </div>
            )}

            {step.actionId === "transform-data" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inputField">Campo de Entrada</Label>
                  <Input
                    id="inputField"
                    placeholder="nombre"
                    defaultValue={step.config.inputField || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, inputField: e.target.value },
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outputField">Campo de Salida</Label>
                  <Input
                    id="outputField"
                    placeholder="nombreCompleto"
                    defaultValue={step.config.outputField || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, outputField: e.target.value },
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transformation">Tipo de Transformación</Label>
                  <Select
                    defaultValue={step.config.transformation || "uppercase"}
                    onValueChange={(value) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, transformation: value },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona transformación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uppercase">Mayúsculas</SelectItem>
                      <SelectItem value="lowercase">Minúsculas</SelectItem>
                      <SelectItem value="trim">Eliminar espacios</SelectItem>
                      <SelectItem value="format">Formatear</SelectItem>
                      <SelectItem value="concat">Concatenar</SelectItem>
                      <SelectItem value="split">Dividir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mapping">Mapeo (JSON)</Label>
                  <Textarea
                    id="mapping"
                    placeholder='{"prefix": "Sr./Sra.", "suffix": ""}'
                    rows={3}
                    defaultValue={step.config.mapping ? JSON.stringify(step.config.mapping, null, 2) : ""}
                    onChange={(e) => {
                      try {
                        const mapping = e.target.value ? JSON.parse(e.target.value) : {}
                        updateWorkflowStep(step.id, {
                          config: { ...step.config, mapping },
                        })
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Define reglas de transformación para procesar los datos
                </div>
              </div>
            )}

            {step.actionId === "approval-request" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="approver">Aprobador</Label>
                  <Input
                    id="approver"
                    placeholder="supervisor@empresa.com"
                    defaultValue={step.config.approver || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, approver: e.target.value },
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje de Solicitud</Label>
                  <Textarea
                    id="message"
                    placeholder="Por favor aprueba esta solicitud..."
                    rows={4}
                    defaultValue={step.config.message || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, message: e.target.value },
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    defaultValue={step.config.priority || "normal"}
                    onValueChange={(value) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, priority: value },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (horas)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    placeholder="24"
                    defaultValue={step.config.timeout || ""}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, timeout: parseInt(e.target.value) || 24 },
                      })
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  El sistema enviará recordatorios automáticos si no se aprueba en el tiempo especificado
                </div>
              </div>
            )}

            {step.actionId === "schedule" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frecuencia</Label>
                  <Select
                    defaultValue={step.config.frequency || "daily"}
                    onValueChange={(value) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, frequency: value },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    defaultValue={step.config.time || "09:00"}
                    onChange={(e) => {
                      updateWorkflowStep(step.id, {
                        config: { ...step.config, time: e.target.value },
                      })
                    }}
                  />
                </div>
              </div>
            )}

            {/* Configuración para acciones de integraciones */}
            {action && action.type === "integration" && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{(action as any).integration.icon}</span>
                    <span className="font-medium">{(action as any).integration.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{(action as any).action.description}</p>
                </div>

                {(action as any).action.inputs.map((input: any) => (
                  <div key={input.id} className="space-y-2">
                    <Label htmlFor={input.id}>
                      {input.name}
                      {input.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    {input.type === "select" && input.options ? (
                      <Select
                        defaultValue={step.config[input.id] || ""}
                        onValueChange={(value) => {
                          updateWorkflowStep(step.id, {
                            config: { ...step.config, [input.id]: value },
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecciona ${input.name.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {input.options.map((option: any) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : input.type === "text" && input.id.includes("body") ? (
                      <Textarea
                        id={input.id}
                        placeholder={input.description}
                        rows={3}
                        defaultValue={step.config[input.id] || ""}
                        onChange={(e) => {
                          updateWorkflowStep(step.id, {
                            config: { ...step.config, [input.id]: e.target.value },
                          })
                        }}
                      />
                    ) : (
                      <Input
                        id={input.id}
                        type={input.type}
                        placeholder={input.description}
                        defaultValue={step.config[input.id] || ""}
                        onChange={(e) => {
                          updateWorkflowStep(step.id, {
                            config: { ...step.config, [input.id]: e.target.value },
                          })
                        }}
                      />
                    )}

                    <p className="text-xs text-muted-foreground">{input.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar más configuraciones para otros tipos de pasos */}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStepConfig(null)}>
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Agrupar acciones por categoría
  const actionsByCategory = actions.reduce(
    (acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = []
      }
      acc[action.category].push(action)
      return acc
    },
    {} as Record<string, typeof actions>,
  )

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2" href="/dashboard/workflows">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Flujos de Trabajo</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {step === 3 && (
            <>
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border rounded-md">
                <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.3}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleResetZoom}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="px-2 py-1 text-xs text-muted-foreground border-l">
                  {Math.round(zoomLevel * 100)}%
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleTestWorkflow}>
                <Play className="mr-2 h-4 w-4" />
                Probar
              </Button>
              <div className="flex items-center space-x-2">
                <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="active" className="text-sm">
                  Activo
                </Label>
              </div>
            </>
          )}
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Crear Nuevo Flujo de Trabajo</h1>
            <p className="text-muted-foreground">Automatiza los procesos de tu negocio con unos simples pasos</p>
          </div>

          {/* Navigation Buttons */}
          <div className="mb-6 flex justify-between items-center">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/dashboard/workflows">Cancelar</Link>
              </Button>
            )}

            <Button onClick={handleNext} disabled={isNextDisabled() || isSaving}>
              {step === 3 ? (
                <>
                  {isSaving ? "Guardando..." : isEditMode ? "Actualizar Workflow" : "Crear Flujo de Trabajo"}
                  <Save className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  1
                </div>
                <div className={`mx-2 h-1 w-16 ${step > 1 ? "bg-primary" : "bg-muted"}`}></div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  2
                </div>
                <div className={`mx-2 h-1 w-16 ${step > 2 ? "bg-primary" : "bg-muted"}`}></div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  3
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Paso {step} de 3</div>
            </div>
          </div>

          {/* Resto del contenido de los pasos permanece igual */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Elige una Plantilla</h2>
                <p className="text-muted-foreground">Comienza con una plantilla o crea desde cero</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:border-primary flex flex-col ${selectedTemplate === template.id ? "border-2 border-primary" : ""}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="rounded-full bg-primary/10 p-2">{template.icon}</div>
                        {selectedTemplate === template.id && (
                          <div className="rounded-full bg-primary p-1">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-2">{template.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="pt-0 mt-auto">
                      <div className="flex w-full justify-between items-center text-sm text-muted-foreground">
                        <span className="flex-shrink-0">
                          {template.steps} {template.steps === 1 ? "paso" : "pasos"}
                        </span>
                        <span className="flex-shrink-0">{template.complexity}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {selectedTemplate && selectedTemplate !== "blank" && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Detalles de la Plantilla</h3>
                      <p className="text-sm text-muted-foreground">
                        Esta plantilla creará un flujo de trabajo con pasos preconfigurados. Puedes personalizarlo
                        después de la creación.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Información Básica</h2>
                <p className="text-muted-foreground">Nombra y describe tu flujo de trabajo</p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workflow-name">Nombre del Flujo de Trabajo</Label>
                      <Input
                        id="workflow-name"
                        placeholder="Ingresa el nombre del flujo de trabajo"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workflow-description">Descripción (opcional)</Label>
                      <Textarea
                        id="workflow-description"
                        placeholder="Describe qué hace este flujo de trabajo"
                        value={workflowDescription}
                        onChange={(e) => setWorkflowDescription(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select defaultValue="automation">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automation">Automatización</SelectItem>
                          <SelectItem value="data">Procesamiento de Datos</SelectItem>
                          <SelectItem value="notification">Notificaciones</SelectItem>
                          <SelectItem value="integration">Integración</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Triggers / Desencadenantes</CardTitle>
                  <CardDescription>
                    Configura qué eventos activarán este workflow automáticamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workflowTriggers.length > 0 ? (
                    <div className="space-y-2">
                      {workflowTriggers.map((trigger, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            {trigger.type === 'form_submission' ? (
                              <FileText className="h-5 w-5 text-primary" />
                            ) : (
                              <Database className="h-5 w-5 text-primary" />
                            )}
                            <div>
                              <div className="font-medium">{trigger.sourceName}</div>
                              <div className="text-sm text-muted-foreground">
                                {trigger.type === 'form_submission' 
                                  ? 'Cuando se envía el formulario' 
                                  : `Cambios en la base de datos (${trigger.config?.operations?.join(', ')})`}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTrigger(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                      <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">
                        No hay triggers configurados. Añade un trigger para que este workflow se ejecute automáticamente.
                      </p>
                    </div>
                  )}
                  
                  <Button variant="outline" className="w-full" onClick={() => setShowAddTrigger(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Trigger
                  </Button>
                </CardContent>
              </Card>

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Consejos de Nomenclatura</h3>
                    <p className="text-sm text-muted-foreground">
                      Usa nombres claros y descriptivos que expliquen qué hace el flujo de trabajo. Buenos ejemplos:
                      "Proceso de Incorporación de Clientes" o "Flujo de Aprobación de Facturas".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Diseña tu Flujo de Trabajo</h2>
                <p className="text-muted-foreground">Arrastra y suelta acciones para construir tu flujo de trabajo</p>
              </div>

              <div className="flex gap-4">
                <div className="w-64 shrink-0 space-y-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Activadores</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 px-3">
                      <div className="space-y-2">
                        {triggers.map((trigger) => (
                          <div
                            key={trigger.id}
                            className="flex cursor-grab items-center gap-2 rounded-md border bg-card p-2 text-sm"
                            draggable
                            onDragStart={() => handleDragStart(trigger.id)}
                          >
                            <div className="rounded-md bg-primary/10 p-1">{trigger.icon}</div>
                            <div>
                              <div className="font-medium">{trigger.name}</div>
                              <div className="text-xs text-muted-foreground">{trigger.category}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mostrar acciones agrupadas por categoría */}
                  {Object.entries(actionsByCategory).map(([category, categoryActions]) => (
                    <Card key={category}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">{category}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-0 px-3">
                        <div className="space-y-2">
                          {categoryActions.map((action) => (
                            <div
                              key={action.id}
                              className="flex cursor-grab items-center gap-2 rounded-md border bg-card p-2 text-sm"
                              draggable
                              onDragStart={() => handleDragStart(action.id)}
                            >
                              <div className="rounded-md bg-primary/10 p-1">{action.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{action.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{action.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium">Consejos</h3>
                        <ul className="mt-1 text-xs text-muted-foreground space-y-1">
                          <li>Arrastra elementos de la barra lateral al lienzo</li>
                          <li>Conecta pasos arrastrando de un paso a otro</li>
                          <li>Haz clic en un paso para configurarlo</li>
                          <li>Arrastra pasos para reposicionarlos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="border rounded-lg bg-muted/20 overflow-auto max-h-[80vh]">
                  <div
                    ref={canvasRef}
                      className="relative bg-white"
                      style={{
                        width: `${canvasSize.width}px`,
                        height: `${canvasSize.height}px`,
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top left',
                        minWidth: '100%',
                        minHeight: '100%',
                      }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={cancelConnection}
                    onMouseMove={moveConnection}
                  >
                    {/* Workflow steps */}
                    {workflowSteps.map((step) => (
                      <div
                        key={step.id}
                        className="absolute cursor-move"
                        style={{
                          left: `${step.position.x}px`,
                          top: `${step.position.y}px`,
                          zIndex: 10,
                        }}
                        draggable
                        onDragStart={(e) => handleStepDragStart(e, step.id)}
                        onDragOver={handleStepDragOver}
                        onDrop={(e) => handleStepDrop(e)}
                      >
                        <div
                          className="w-[300px] rounded-md border bg-card shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowStepConfig(step.id)
                          }}
                        >
                          <div className="flex items-start justify-between p-3">
                            <div className="flex items-start gap-3">
                              <div className="rounded-md bg-primary/10 p-2">{step.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{step.name}</div>
                                <div className="text-xs text-muted-foreground">{step.description}</div>

                                {/* Show configuration summary if available */}
                                {step.config && Object.keys(step.config).length > 0 && (
                                  <div className="mt-2 text-xs">
                                    {step.actionId === "send-email" && (
                                      <div className="rounded-md bg-muted/50 p-1.5">
                                        <div>Para: {step.config.recipient || "No configurado"}</div>
                                        <div>Asunto: {step.config.subject || "No configurado"}</div>
                                      </div>
                                    )}

                                    {step.actionId === "schedule" && (
                                      <div className="rounded-md bg-muted/50 p-1.5">
                                        <div>
                                          Frecuencia:{" "}
                                          {step.config.frequency === "hourly"
                                            ? "Cada hora"
                                            : step.config.frequency === "daily"
                                              ? "Diario"
                                              : step.config.frequency === "weekly"
                                                ? "Semanal"
                                                : step.config.frequency === "monthly"
                                                  ? "Mensual"
                                                  : "No configurado"}
                                        </div>
                                        <div>Hora: {step.config.time || "09:00"}</div>
                                      </div>
                                    )}

                                    {/* Mostrar configuración de integraciones */}
                                    {(() => {
                                      const action = actions.find((a) => a.id === step.actionId)
                                      if (action && action.type === "integration") {
                                        return (
                                          <div className="rounded-md bg-muted/50 p-1.5">
                                            <div className="flex items-center gap-1 mb-1">
                                              <span className="text-xs">{(action as any).integration.icon}</span>
                                              <span className="font-medium">{(action as any).integration.name}</span>
                                            </div>
                                            {Object.entries(step.config)
                                              .slice(0, 2)
                                              .map(([key, value]) => (
                                                <div key={key} className="text-xs">
                                                  <span className="capitalize">{key}:</span>{" "}
                                                  {String(value) || "No configurado"}
                                                </div>
                                              ))}
                                          </div>
                                        )
                                      }
                                      return null
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowStepConfig(step.id)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeStep(step.id)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Connection points */}
                          <div className="flex justify-center pb-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 rounded-full bg-transparent"
                              onMouseDown={(e) => startConnection(step.id, e)}
                              onMouseUp={(e) => endConnection(step.id, e)}
                            >
                              <ArrowDown className="h-3 w-3 mr-1" />
                              Conectar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Connection lines */}
                    {connections.map((conn, index) => {
                      const fromStep = workflowSteps.find((s) => s.id === conn.from)
                      const toStep = workflowSteps.find((s) => s.id === conn.to)

                      if (!fromStep || !toStep) return null

                      const startX = fromStep.position.x + 150
                      const startY = fromStep.position.y + 100
                      const endX = toStep.position.x + 150
                      const endY = toStep.position.y

                      const midY = (startY + endY) / 2

                      return (
                        <svg
                          key={`conn-${index}`}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          style={{ zIndex: 5 }}
                        >
                          <path
                            d={`M ${startX},${startY} C ${startX},${midY} ${endX},${midY} ${endX},${endY}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="4"
                            className="text-primary"
                          />
                          <circle cx={endX} cy={endY} r="4" fill="currentColor" className="text-primary" />
                        </svg>
                      )
                    })}

                    {/* Drawing line when connecting */}
                    {isDrawingLine && lineStart && lineEnd && (
                      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                        <path
                          d={`M ${lineStart.x},${lineStart.y} C ${lineStart.x},${(lineStart.y + lineEnd.y) / 2} ${lineEnd.x},${(lineStart.y + lineEnd.y) / 2} ${lineEnd.x},${lineEnd.y}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="4"
                          className="text-primary"
                        />
                      </svg>
                    )}

                    {/* Empty state */}
                    {workflowSteps.length === 0 && (
                      <div className="flex h-full items-center justify-center" style={{ height: `${canvasSize.height}px` }}>
                        <div className="text-center">
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="mb-1 text-lg font-medium">Comienza a Construir tu Flujo de Trabajo</h3>
                          <p className="text-sm text-muted-foreground">
                            Arrastra activadores y acciones desde la barra lateral para comenzar
                          </p>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>

              {renderStepConfig()}
            </div>
          )}
        </div>
      </main>
      
      {/* Add Trigger Dialog */}
      <Dialog open={showAddTrigger} onOpenChange={setShowAddTrigger}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Añadir Trigger</DialogTitle>
            <DialogDescription>
              Selecciona qué evento activará este workflow automáticamente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 overflow-y-auto">
            <div className="space-y-2">
              <Label>Tipo de Trigger</Label>
              <Select value={newTriggerType} onValueChange={(value: any) => setNewTriggerType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form_submission">Envío de Formulario</SelectItem>
                  <SelectItem value="database_change">Cambio en Base de Datos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newTriggerType === 'form_submission' && (
              <div className="space-y-2">
                <Label>Seleccionar Formulario</Label>
                <Select value={newTriggerSourceId?.toString()} onValueChange={(value) => setNewTriggerSourceId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un formulario" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForms.map((form) => (
                      <SelectItem key={form.id} value={form.id.toString()}>
                        {form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {newTriggerType === 'database_change' && (
              <>
                <div className="space-y-2">
                  <Label>Seleccionar Tabla</Label>
                  <Select value={newTriggerSourceId?.toString()} onValueChange={(value) => setNewTriggerSourceId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una tabla" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables.map((table) => (
                        <SelectItem key={table.id} value={table.id.toString()}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Operaciones que activan el trigger</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="op-create"
                        checked={newTriggerOperations.includes('create')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTriggerOperations([...newTriggerOperations, 'create'])
                          } else {
                            setNewTriggerOperations(newTriggerOperations.filter(op => op !== 'create'))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="op-create" className="font-normal">Crear registro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="op-update"
                        checked={newTriggerOperations.includes('update')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTriggerOperations([...newTriggerOperations, 'update'])
                          } else {
                            setNewTriggerOperations(newTriggerOperations.filter(op => op !== 'update'))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="op-update" className="font-normal">Actualizar registro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="op-delete"
                        checked={newTriggerOperations.includes('delete')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTriggerOperations([...newTriggerOperations, 'delete'])
                          } else {
                            setNewTriggerOperations(newTriggerOperations.filter(op => op !== 'delete'))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="op-delete" className="font-normal">Eliminar registro</Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTrigger(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTrigger} disabled={!newTriggerSourceId}>
              Añadir Trigger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
