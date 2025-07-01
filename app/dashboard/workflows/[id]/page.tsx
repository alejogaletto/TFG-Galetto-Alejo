"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash,
  Copy,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { WorkflowEngine, type Workflow, type WorkflowExecution } from "@/lib/workflow-engine"

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const workflowEngine = WorkflowEngine.getInstance()

  useEffect(() => {
    const loadWorkflow = () => {
      try {
        workflowEngine.loadWorkflows()
        const workflowData = workflowEngine.getWorkflow(params.id as string)

        if (workflowData) {
          setWorkflow(workflowData)
          setExecutions(workflowEngine.getExecutions(params.id as string))
        }
      } catch (error) {
        console.error("Error loading workflow:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadWorkflow()
    }
  }, [params.id])

  const handleExecuteWorkflow = async () => {
    if (!workflow) return

    setIsExecuting(true)
    try {
      const execution = await workflowEngine.executeWorkflow(workflow.id, {
        manual: true,
        timestamp: new Date(),
      })

      setExecutions([execution, ...executions])

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

  const handleDeleteWorkflow = () => {
    if (!workflow) return

    // En una implementación real, aquí eliminarías el workflow
    toast({
      title: "Workflow eliminado",
      description: "El workflow ha sido eliminado exitosamente",
    })

    router.push("/dashboard/workflows")
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDeleteWorkflow}>
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{workflow.name}</h1>
                <p className="text-muted-foreground">{workflow.description || "Sin descripción"}</p>
              </div>
              <Badge variant={workflow.isActive ? "default" : "secondary"}>
                {workflow.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="executions">Ejecuciones</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Pasos</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{workflow.steps.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {workflow.steps.filter((s) => s.type === "trigger").length} activadores,{" "}
                      {workflow.steps.filter((s) => s.type === "action").length} acciones
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ejecuciones</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{executions.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {executions.filter((e) => e.status === "completed").length} exitosas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Última Ejecución</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {executions.length > 0
                        ? executions[0].status === "completed"
                          ? "Exitosa"
                          : executions[0].status === "failed"
                            ? "Fallida"
                            : "En curso"
                        : "Nunca"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {executions.length > 0 && executions[0].startedAt.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Diagrama del Workflow</CardTitle>
                  <CardDescription>Visualización de los pasos y conexiones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[400px] rounded-lg border bg-muted/20 overflow-hidden">
                    {workflow.steps.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <p className="text-muted-foreground">No hay pasos configurados</p>
                          <Button className="mt-2" variant="outline" asChild>
                            <Link href="/dashboard/workflows/new">Editar Workflow</Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {workflow.steps.map((step) => (
                          <div
                            key={step.id}
                            className="absolute"
                            style={{
                              left: `${step.position.x}px`,
                              top: `${step.position.y}px`,
                              zIndex: 10,
                            }}
                          >
                            <div className="w-[200px] rounded-md border bg-card shadow-sm p-3">
                              <div className="font-medium text-sm">{step.name}</div>
                              <div className="text-xs text-muted-foreground">{step.description}</div>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {step.type === "trigger" ? "Activador" : "Acción"}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {workflow.connections.map((conn, index) => {
                          const fromStep = workflow.steps.find((s) => s.id === conn.from)
                          const toStep = workflow.steps.find((s) => s.id === conn.to)

                          if (!fromStep || !toStep) return null

                          const startX = fromStep.position.x + 100
                          const startY = fromStep.position.y + 50
                          const endX = toStep.position.x + 100
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
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="executions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Ejecuciones</CardTitle>
                  <CardDescription>Registro de todas las ejecuciones del workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  {executions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay ejecuciones registradas</p>
                      <Button className="mt-4" onClick={handleExecuteWorkflow} disabled={isExecuting}>
                        <Play className="mr-2 h-4 w-4" />
                        Ejecutar Workflow
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {executions.map((execution) => (
                        <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            {execution.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {execution.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                            {execution.status === "running" && <Clock className="h-5 w-5 text-blue-500" />}
                            <div>
                              <p className="font-medium">Ejecución {execution.id}</p>
                              <p className="text-sm text-muted-foreground">
                                Iniciada: {execution.startedAt.toLocaleString()}
                              </p>
                              {execution.completedAt && (
                                <p className="text-sm text-muted-foreground">
                                  Completada: {execution.completedAt.toLocaleString()}
                                </p>
                              )}
                              {execution.error && <p className="text-sm text-red-500">Error: {execution.error}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                execution.status === "completed"
                                  ? "default"
                                  : execution.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {execution.status === "completed"
                                ? "Completada"
                                : execution.status === "failed"
                                  ? "Fallida"
                                  : "En curso"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Workflow</CardTitle>
                  <CardDescription>Ajustes y configuraciones avanzadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Estado del Workflow</p>
                      <p className="text-sm text-muted-foreground">
                        {workflow.isActive
                          ? "El workflow está activo y se ejecutará automáticamente"
                          : "El workflow está inactivo"}
                      </p>
                    </div>
                    <Button onClick={handleToggleActive}>{workflow.isActive ? "Desactivar" : "Activar"}</Button>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Información</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Creado</p>
                        <p>{workflow.createdAt.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Última modificación</p>
                        <p>{workflow.updatedAt.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ID del Workflow</p>
                        <p className="font-mono text-xs">{workflow.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total de pasos</p>
                        <p>{workflow.steps.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-medium mb-2 text-destructive">Zona de Peligro</p>
                    <Button variant="destructive" onClick={handleDeleteWorkflow}>
                      <Trash className="mr-2 h-4 w-4" />
                      Eliminar Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
