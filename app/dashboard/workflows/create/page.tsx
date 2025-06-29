"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Plus,
  Save,
  Settings,
  Clock,
  AlertCircle,
  Trash,
  Pencil,
  Play,
  Zap,
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
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null)
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([])
  const [showStepConfig, setShowStepConfig] = useState<number | null>(null)
  const [draggedAction, setDraggedAction] = useState<string | null>(null)
  const [isDrawingLine, setIsDrawingLine] = useState(false)
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null)
  const [lineEnd, setLineEnd] = useState<{ x: number; y: number } | null>(null)
  const [connections, setConnections] = useState<{ from: number; to: number }[]>([])
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const workflowEngine = WorkflowEngine.getInstance()
  const integrationsEngine = IntegrationsEngine.getInstance()

  useEffect(() => {
    workflowEngine.loadWorkflows()
    integrationsEngine.loadIntegrations()
  }, [])

  const templates = [
    {
      id: "form-to-database",
      name: "Formulario a Base de Datos",
      description: "Guarda envíos de formularios en una base de datos",
      icon: <FileText className="h-10 w-10 text-primary" />,
      steps: 3,
      complexity: "Principiante",
    },
    {
      id: "customer-onboarding",
      name: "Incorporación de Clientes",
      description: "Automatiza el proceso de bienvenida al cliente",
      icon: <Mail className="h-10 w-10 text-primary" />,
      steps: 4,
      complexity: "Intermedio",
    },
    {
      id: "approval-process",
      name: "Proceso de Aprobación",
      description: "Crea un flujo de trabajo de aprobación de múltiples pasos",
      icon: <Check className="h-10 w-10 text-primary" />,
      steps: 5,
      complexity: "Avanzado",
    },
    {
      id: "scheduled-report",
      name: "Reporte Programado",
      description: "Genera y envía reportes según programación",
      icon: <Calendar className="h-10 w-10 text-primary" />,
      steps: 3,
      complexity: "Intermedio",
    },
    {
      id: "data-sync",
      name: "Sincronización de Base de Datos",
      description: "Mantén dos bases de datos sincronizadas",
      icon: <Database className="h-10 w-10 text-primary" />,
      steps: 4,
      complexity: "Avanzado",
    },
    {
      id: "blank",
      name: "Flujo de Trabajo en Blanco",
      description: "Comenzar desde cero",
      icon: <Plus className="h-10 w-10 text-primary" />,
      steps: 0,
      complexity: "Cualquiera",
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
        description: "Envía una notificación por correo",
        icon: <Mail className="h-6 w-6 text-primary" />,
        category: "Notificaciones",
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
      integration,
      action,
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
    if (step === 3) {
      handleSaveWorkflow()
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const isNextDisabled = () => {
    if (step === 1) return !selectedTemplate
    if (step === 2) return !workflowName
    if (step === 3) return workflowSteps.length === 0
    return false
  }

  const handleSaveWorkflow = async () => {
    if (!workflowName || workflowSteps.length === 0) {
      toast({
        title: "Error",
        description: "El workflow debe tener un nombre y al menos un paso",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const workflow: Workflow = {
        id: `workflow_${Date.now()}`,
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
        title: "¡Éxito!",
        description: `Workflow "${workflowName}" creado exitosamente`,
      })

      router.push("/dashboard/workflows")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el workflow",
        variant: "destructive",
      })
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
      const testWorkflow: Workflow = {
        id: `test_${Date.now()}`,
        name: workflowName || "Test Workflow",
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
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const execution = await workflowEngine.executeWorkflow(testWorkflow.id, { test: true })

      toast({
        title: "Prueba completada",
        description: `Workflow ejecutado con estado: ${execution.status}`,
      })
    } catch (error) {
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

  const renderStepConfig = () => {
    const step = workflowSteps.find((s) => s.id === showStepConfig)
    if (!step) return null

    const action = actions.find((a) => a.id === step.actionId)

    return (
      <Dialog open={showStepConfig !== null} onOpenChange={() => setShowStepConfig(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar {step.name}</DialogTitle>
            <DialogDescription>Configura los detalles para este paso del flujo de trabajo</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {step.actionId === "send-email" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Para</Label>
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
                  <Label htmlFor="subject">Asunto</Label>
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
                  <Label htmlFor="body">Cuerpo</Label>
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
                <div className="text-xs text-muted-foreground">
                  Usa variables como {`{{nombre}}`} o {`{{email}}`} para datos dinámicos
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
                    <span className="text-lg">{action.integration.icon}</span>
                    <span className="font-medium">{action.integration.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.action.description}</p>
                </div>

                {action.action.inputs.map((input) => (
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
                          {input.options.map((option) => (
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Crear Nuevo Flujo de Trabajo</h1>
            <p className="text-muted-foreground">Automatiza los procesos de tu negocio con unos simples pasos</p>
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
                  <div
                    ref={canvasRef}
                    className="relative h-[500px] rounded-lg border bg-muted/20 overflow-hidden"
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
                                              <span className="text-xs">{action.integration.icon}</span>
                                              <span className="font-medium">{action.integration.name}</span>
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
                      <div className="flex h-full items-center justify-center">
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

              {renderStepConfig()}
            </div>
          )}

          <div className="mt-8 flex justify-between">
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
                  {isSaving ? "Guardando..." : "Crear Flujo de Trabajo"}
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
        </div>
      </main>
    </div>
  )
}
