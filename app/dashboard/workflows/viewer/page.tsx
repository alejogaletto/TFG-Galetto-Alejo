"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  Edit,
  Copy,
  Trash,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { WorkflowEngine, type Workflow } from "@/lib/workflow-engine"

export default function WorkflowViewerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const canvasRef = useRef<HTMLDivElement>(null)

  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [activeTab, setActiveTab] = useState("visual")

  const workflowEngine = WorkflowEngine.getInstance()
  const workflowId = searchParams.get("id")

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId)
    }
  }, [workflowId])

  const loadWorkflow = (id: string) => {
    try {
      workflowEngine.loadWorkflows()
      const workflowData = workflowEngine.getWorkflow(id)

      if (workflowData) {
        setWorkflow(workflowData)
      } else {
        toast({
          title: "Error",
          description: "Workflow no encontrado",
          variant: "destructive",
        })
        router.push("/dashboard/workflows")
      }
    } catch (error) {
      console.error("Error loading workflow:", error)
      toast({
        title: "Error",
        description: "Error al cargar el workflow",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecuteWorkflow = async () => {
    if (!workflow) return

    setIsExecuting(true)
    try {
      const execution = await workflowEngine.executeWorkflow(workflow.id, {
        manual: true,
        timestamp: new Date(),
      })

      toast({
        title: "Workflow ejecutado",
        description: `Estado: ${execution.status === "completed" ? "Completado" : execution.status === "failed" ? "Fallido" : "En curso"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleToggleActive = () => {
    if (!workflow) return

    const updatedWorkflow = {
      ...workflow,
      isActive: !workflow.isActive,
      updatedAt: new Date(),
    }

    workflowEngine.saveWorkflow(updatedWorkflow)
    setWorkflow(updatedWorkflow)

    toast({
      title: workflow.isActive ? "Workflow desactivado" : "Workflow activado",
      description: workflow.isActive
        ? "El workflow ya no se ejecutará automáticamente"
        : "El workflow se ejecutará según su programación",
    })
  }

  const handleDuplicateWorkflow = () => {
    if (!workflow) return

    const duplicatedWorkflow: Workflow = {
      ...workflow,
      id: `workflow_${Date.now()}`,
      name: `${workflow.name} (Copia)`,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    workflowEngine.saveWorkflow(duplicatedWorkflow)

    toast({
      title: "Workflow duplicado",
      description: "Se ha creado una copia del workflow",
    })

    router.push(`/dashboard/workflows/viewer?id=${duplicatedWorkflow.id}`)
  }

  const handleDeleteWorkflow = () => {
    if (!workflow) return

    workflowEngine.deleteWorkflow(workflow.id)

    toast({
      title: "Workflow eliminado",
      description: "El workflow ha sido eliminado exitosamente",
    })

    router.push("/dashboard/workflows")
  }

  const resetZoom = () => {
    setZoom(100)
  }

  const zoomIn = () => {
    setZoom(Math.min(zoom + 25, 200))
  }

  const zoomOut = () => {
    setZoom(Math.max(zoom - 25, 25))
  }

  const getStepIcon = (step: any) => {
    switch (step.actionType) {
      case "send-email":
        return "📧"
      case "update-database":
        return "🗄️"
      case "delay":
        return "⏰"
      case "condition":
        return "🔀"
      case "form-submission":
        return "📝"
      case "schedule":
        return "📅"
      case "database-change":
        return "🔄"
      case "manual":
        return "👆"
      default:
        return "⚙️"
    }
  }

  const getStepColor = (step: any) => {
    if (step.type === "trigger") {
      return "bg-gray-100 border-gray-300 text-gray-800"
    } else {
      switch (step.actionType) {
        case "send-email":
          return "bg-gray-50 border-gray-200 text-gray-700"
        case "update-database":
          return "bg-gray-100 border-gray-300 text-gray-800"
        case "delay":
          return "bg-gray-50 border-gray-200 text-gray-700"
        case "condition":
          return "bg-gray-100 border-gray-300 text-gray-800"
        default:
          return "bg-white border-gray-200 text-gray-700"
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
        </main>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/dashboard/workflows" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Volver a Flujos de Trabajo</span>
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Workflow no encontrado</h2>
            <p className="text-muted-foreground mb-4">El workflow que buscas no existe o fue eliminado.</p>
            <Button asChild>
              <Link href="/dashboard/workflows">Volver a Workflows</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/workflows" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Flujos de Trabajo</span>
        </Link>

        <div className="flex items-center gap-2 ml-4">
          <h1 className="font-semibold">{workflow.name}</h1>
          <Badge variant={workflow.isActive ? "default" : "secondary"}>
            {workflow.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExecuteWorkflow} disabled={isExecuting}>
            <Play className="mr-2 h-4 w-4" />
            {isExecuting ? "Ejecutando..." : "Ejecutar"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleToggleActive}>
            {workflow.isActive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activar
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/workflows/create?edit=${workflow.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicateWorkflow}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Compartir
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDeleteWorkflow}>
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex flex-1">
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-6 py-2">
              <TabsList>
                <TabsTrigger value="visual">Vista Visual</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="executions">Ejecuciones</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="visual" className="flex-1 p-0">
              <div className="flex h-full">
                {/* Canvas principal */}
                <div className="flex-1 relative">
                  <div
                    ref={canvasRef}
                    className={`relative h-full overflow-auto ${showGrid ? "bg-grid-pattern" : "bg-muted/20"}`}
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {/* Workflow steps */}
                    {workflow.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`absolute cursor-pointer transition-all ${
                          selectedStep === step.id ? "ring-2 ring-gray-400" : ""
                        }`}
                        style={{
                          left: `${step.position?.x || index * 350 + 50}px`,
                          top: `${step.position?.y || 100}px`,
                          zIndex: 10,
                        }}
                        onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                      >
                        <Card className={`w-[300px] ${getStepColor(step)} hover:shadow-md transition-shadow`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{getStepIcon(step)}</span>
                                <div>
                                  <CardTitle className="text-sm">{step.name}</CardTitle>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {step.type === "trigger" ? "Activador" : "Acción"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-xs">{step.description}</CardDescription>

                            {/* Mostrar configuración si está disponible */}
                            {step.config && Object.keys(step.config).length > 0 && (
                              <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                                {step.actionType === "send-email" && (
                                  <>
                                    <div>
                                      <strong>Para:</strong> {step.config.recipient || "No configurado"}
                                    </div>
                                    <div>
                                      <strong>Asunto:</strong> {step.config.subject || "No configurado"}
                                    </div>
                                  </>
                                )}
                                {step.actionType === "update-database" && (
                                  <>
                                    <div>
                                      <strong>Base de datos:</strong> {step.config.databaseName || "No configurado"}
                                    </div>
                                    <div>
                                      <strong>Acción:</strong> {step.config.action || "No configurado"}
                                    </div>
                                  </>
                                )}
                                {step.actionType === "delay" && (
                                  <div>
                                    <strong>Duración:</strong> {step.config.duration || "No configurado"}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}

                    {/* Connection lines */}
                    {showConnections &&
                      workflow.connections.map((conn, index) => {
                        const fromStep = workflow.steps.find((s) => s.id === conn.from)
                        const toStep = workflow.steps.find((s) => s.id === conn.to)

                        if (!fromStep || !toStep) return null

                        const fromIndex = workflow.steps.findIndex((s) => s.id === conn.from)
                        const toIndex = workflow.steps.findIndex((s) => s.id === conn.to)

                        const startX = (fromStep.position?.x || fromIndex * 350 + 50) + 150
                        const startY = (fromStep.position?.y || 100) + 120
                        const endX = (toStep.position?.x || toIndex * 350 + 50) + 150
                        const endY = toStep.position?.y || 100

                        const midY = (startY + endY) / 2

                        return (
                          <svg
                            key={`conn-${index}`}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{ zIndex: 5 }}
                          >
                            <defs>
                              <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                              >
                                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-gray-400" />
                              </marker>
                            </defs>
                            <path
                              d={`M ${startX},${startY} C ${startX},${midY} ${endX},${midY} ${endX},${endY}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-gray-400"
                              markerEnd="url(#arrowhead)"
                            />
                          </svg>
                        )
                      })}

                    {/* Empty state */}
                    {workflow.steps.length === 0 && (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <h3 className="mb-1 text-lg font-medium">Workflow Vacío</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Este workflow no tiene pasos configurados
                          </p>
                          <Button asChild>
                            <Link href={`/dashboard/workflows/create?edit=${workflow.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar Workflow
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel lateral de controles */}
                <div className="w-64 border-l bg-muted/30 p-4 space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Controles de Vista</h3>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Zoom: {zoom}%</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={zoomOut}>
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <Slider
                            value={[zoom]}
                            onValueChange={(value) => setZoom(value[0])}
                            max={200}
                            min={25}
                            step={25}
                            className="flex-1"
                          />
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={zoomIn}>
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-1" onClick={resetZoom}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restablecer
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-grid" className="text-sm">
                          Mostrar cuadrícula
                        </Label>
                        <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-connections" className="text-sm">
                          Mostrar conexiones
                        </Label>
                        <Switch id="show-connections" checked={showConnections} onCheckedChange={setShowConnections} />
                      </div>
                    </div>
                  </div>

                  {selectedStep && (
                    <div>
                      <h3 className="font-medium mb-2">Paso Seleccionado</h3>
                      {(() => {
                        const step = workflow.steps.find((s) => s.id === selectedStep)
                        if (!step) return null

                        return (
                          <Card className="text-sm">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div>
                                  <strong>Nombre:</strong> {step.name}
                                </div>
                                <div>
                                  <strong>Tipo:</strong> {step.type === "trigger" ? "Activador" : "Acción"}
                                </div>
                                <div>
                                  <strong>Descripción:</strong> {step.description}
                                </div>
                                {step.config && Object.keys(step.config).length > 0 && (
                                  <div>
                                    <strong>Configuración:</strong>
                                    <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                                      {JSON.stringify(step.config, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })()}
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium mb-2">Estadísticas</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total de pasos:</span>
                        <span>{workflow.steps.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Activadores:</span>
                        <span>{workflow.steps.filter((s) => s.type === "trigger").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Acciones:</span>
                        <span>{workflow.steps.filter((s) => s.type === "action").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conexiones:</span>
                        <span>{workflow.connections.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Workflow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Nombre</Label>
                        <p className="text-sm text-muted-foreground">{workflow.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Estado</Label>
                        <Badge variant={workflow.isActive ? "default" : "secondary"} className="ml-2">
                          {workflow.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Creado</Label>
                        <p className="text-sm text-muted-foreground">{workflow.createdAt.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Última modificación</Label>
                        <p className="text-sm text-muted-foreground">{workflow.updatedAt.toLocaleString()}</p>
                      </div>
                    </div>
                    {workflow.description && (
                      <div>
                        <Label className="text-sm font-medium">Descripción</Label>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pasos del Workflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{step.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {step.type === "trigger" ? "Activador" : "Acción"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                            {step.config && Object.keys(step.config).length > 0 && (
                              <div className="text-xs">
                                <strong>Configuración:</strong>
                                <div className="mt-1 p-2 bg-muted rounded">
                                  {Object.entries(step.config).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="capitalize">{key}:</span>
                                      <span>{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="executions" className="p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Ejecuciones</CardTitle>
                    <CardDescription>Registro de todas las ejecuciones de este workflow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay ejecuciones registradas para este workflow</p>
                      <Button className="mt-4" onClick={handleExecuteWorkflow} disabled={isExecuting}>
                        <Play className="mr-2 h-4 w-4" />
                        Ejecutar Workflow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
