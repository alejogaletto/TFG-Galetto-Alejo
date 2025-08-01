"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  GitBranch,
  Play,
  Pause,
  Settings,
  MoreHorizontal,
  Clock,
  Users,
  BarChart3,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Zap,
  Mail,
  Database,
  Cloud,
  CreditCard,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function WorkflowsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Mock data for workflows
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: "Notificación de Nuevo Cliente",
      description: "Envía email automático cuando se registra un nuevo cliente",
      status: "active",
      trigger: "form_submission",
      lastRun: "hace 2 horas",
      executions: 156,
      successRate: 98,
      created: "2024-01-15",
      actions: ["email", "database"],
    },
    {
      id: 2,
      name: "Procesamiento de Pedidos",
      description: "Automatiza el flujo de procesamiento de pedidos",
      status: "active",
      trigger: "database_update",
      lastRun: "hace 30 minutos",
      executions: 89,
      successRate: 95,
      created: "2024-01-10",
      actions: ["email", "webhook", "database"],
    },
    {
      id: 3,
      name: "Recordatorio de Seguimiento",
      description: "Envía recordatorios para seguimiento de leads",
      status: "paused",
      trigger: "schedule",
      lastRun: "hace 1 día",
      executions: 234,
      successRate: 92,
      created: "2024-01-05",
      actions: ["email", "slack"],
    },
    {
      id: 4,
      name: "Backup Automático",
      description: "Respalda datos importantes diariamente",
      status: "active",
      trigger: "schedule",
      lastRun: "hace 6 horas",
      executions: 45,
      successRate: 100,
      created: "2024-01-20",
      actions: ["database", "cloud_storage"],
    },
  ])

  // Mock data for integrations
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: "Gmail",
      description: "Envío de emails automáticos",
      category: "email",
      status: "connected",
      lastSync: "hace 1 hora",
      icon: <Mail className="h-5 w-5" />,
      color: "text-red-500",
      usedInWorkflows: 3,
    },
    {
      id: 2,
      name: "Google Drive",
      description: "Almacenamiento en la nube",
      category: "storage",
      status: "connected",
      lastSync: "hace 30 minutos",
      icon: <Cloud className="h-5 w-5" />,
      color: "text-blue-500",
      usedInWorkflows: 1,
    },
    {
      id: 3,
      name: "Slack",
      description: "Notificaciones de equipo",
      category: "communication",
      status: "connected",
      lastSync: "hace 15 minutos",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "text-purple-500",
      usedInWorkflows: 2,
    },
    {
      id: 4,
      name: "Stripe",
      description: "Procesamiento de pagos",
      category: "payments",
      status: "error",
      lastSync: "hace 2 días",
      icon: <CreditCard className="h-5 w-5" />,
      color: "text-indigo-500",
      usedInWorkflows: 0,
    },
  ])

  // Available services to connect
  const availableServices = [
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Marketing por email y automatización",
      category: "email",
      icon: <Mail className="h-6 w-6" />,
      color: "text-yellow-500",
      authType: "api_key",
      popular: true,
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "CRM y automatización de marketing",
      category: "crm",
      icon: <Users className="h-6 w-6" />,
      color: "text-orange-500",
      authType: "oauth",
      popular: true,
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Conecta miles de aplicaciones",
      category: "automation",
      icon: <Zap className="h-6 w-6" />,
      color: "text-orange-400",
      authType: "webhook",
      popular: true,
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Almacenamiento y sincronización",
      category: "storage",
      icon: <Cloud className="h-6 w-6" />,
      color: "text-blue-600",
      authType: "oauth",
      popular: false,
    },
    {
      id: "twilio",
      name: "Twilio",
      description: "SMS y comunicaciones",
      category: "communication",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "text-red-600",
      authType: "api_key",
      popular: false,
    },
    {
      id: "airtable",
      name: "Airtable",
      description: "Base de datos colaborativa",
      category: "database",
      icon: <Database className="h-6 w-6" />,
      color: "text-yellow-600",
      authType: "api_key",
      popular: false,
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "error":
        return <XCircle className="h-4 w-4" />
      case "connected":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTriggerIcon = (trigger) => {
    switch (trigger) {
      case "form_submission":
        return <FileText className="h-4 w-4" />
      case "database_update":
        return <Database className="h-4 w-4" />
      case "schedule":
        return <Clock className="h-4 w-4" />
      case "webhook":
        return <Zap className="h-4 w-4" />
      default:
        return <GitBranch className="h-4 w-4" />
    }
  }

  const connectService = (serviceId) => {
    router.push(`/dashboard/workflows/integrations/connect/${serviceId}`)
  }

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || workflow.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2 font-semibold" href="#">
          <span className="font-bold">AutomateSMB</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link className="text-sm font-medium" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/forms">
            Formularios
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/databases">
            Bases de Datos
          </Link>
          <Link className="text-sm font-medium text-primary" href="/dashboard/workflows">
            Flujos de Trabajo
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/solutions">
            Soluciones
          </Link>
        </nav>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
          <nav className="grid gap-2 p-4">
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard"
            >
              <BarChart3 className="h-4 w-4" />
              Panel
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/forms"
            >
              <FileText className="h-4 w-4" />
              Formularios
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/databases"
            >
              <Database className="h-4 w-4" />
              Bases de Datos
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary transition-all bg-muted"
              href="/dashboard/workflows"
            >
              <GitBranch className="h-4 w-4" />
              Flujos de Trabajo
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/solutions"
            >
              <Users className="h-4 w-4" />
              Soluciones
            </Link>
          </nav>
        </aside>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg md:text-2xl">Flujos de Trabajo</h1>
            <Button onClick={() => router.push("/dashboard/workflows/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Flujo de Trabajo
            </Button>
          </div>

          <Tabs defaultValue="workflows" className="space-y-4">
            <TabsList>
              <TabsTrigger value="workflows">Workflows ({workflows.length})</TabsTrigger>
              <TabsTrigger value="integrations">Integraciones ({integrations.length})</TabsTrigger>
              <TabsTrigger value="explore">Explorar Servicios</TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Estado
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedStatus("all")}>Todos</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("active")}>Activos</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("paused")}>Pausados</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("error")}>Con Errores</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid gap-4">
                {filteredWorkflows.map((workflow) => (
                  <Card key={workflow.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">{getTriggerIcon(workflow.trigger)}</div>
                          <div>
                            <CardTitle className="text-lg">{workflow.name}</CardTitle>
                            <CardDescription>{workflow.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(workflow.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(workflow.status)}
                              <span className="capitalize">{workflow.status}</span>
                            </div>
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {workflow.status === "active" ? (
                                  <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pausar
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Activar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Última Ejecución</div>
                          <div className="font-medium">{workflow.lastRun}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Ejecuciones</div>
                          <div className="font-medium">{workflow.executions}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
                          <div className="font-medium">{workflow.successRate}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Creado</div>
                          <div className="font-medium">{workflow.created}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredWorkflows.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay workflows</h3>
                    <p className="text-muted-foreground mb-4 text-center">
                      {searchQuery
                        ? "No se encontraron workflows que coincidan con tu búsqueda"
                        : "Crea tu primer workflow para automatizar procesos"}
                    </p>
                    <Button onClick={() => router.push("/dashboard/workflows/new")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primer Workflow
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <div className="grid gap-4">
                {integrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-muted rounded-lg ${integration.color}`}>{integration.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <CardDescription>{integration.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(integration.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(integration.status)}
                              <span className="capitalize">
                                {integration.status === "connected" ? "Conectado" : integration.status}
                              </span>
                            </div>
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Configurar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Probar Conexión
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Desconectar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Última Sincronización</div>
                          <div className="font-medium">{integration.lastSync}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Usado en Workflows</div>
                          <div className="font-medium">{integration.usedInWorkflows}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Categoría</div>
                          <div className="font-medium capitalize">{integration.category}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {integrations.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay integraciones</h3>
                    <p className="text-muted-foreground mb-4 text-center">
                      Conecta servicios externos para ampliar las capacidades de tus workflows
                    </p>
                    <Button onClick={() => router.push("/dashboard/workflows/integrations")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Conectar Primer Servicio
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="explore" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {availableServices.map((service) => (
                    <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 bg-muted rounded-lg ${service.color}`}>{service.icon}</div>
                            <div>
                              <CardTitle className="text-base">{service.name}</CardTitle>
                              <CardDescription className="text-sm">{service.description}</CardDescription>
                            </div>
                          </div>
                          {service.popular && <Badge className="bg-blue-100 text-blue-800">Popular</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Autenticación</div>
                            <div className="font-medium capitalize">{service.authType.replace("_", " ")}</div>
                          </div>
                          <Button size="sm" onClick={() => connectService(service.id)}>
                            Conectar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Zap className="h-8 w-8 text-muted-foreground mb-3" />
                    <h3 className="font-medium mb-2">¿No encuentras tu servicio?</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Configura integraciones personalizadas con webhooks o APIs genéricas
                    </p>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Integración Personalizada
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
