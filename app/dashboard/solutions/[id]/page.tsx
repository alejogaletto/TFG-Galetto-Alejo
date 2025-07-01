"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Settings,
  FileText,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  Clock,
  Calendar,
  DollarSign,
  BarChart3,
  Target,
  Zap,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Play,
  MoreVertical,
  Phone,
  Mail,
  Building,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search,
  Download,
  Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SolutionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const solutionId = params?.id

  // Detectar el tipo de solución basado en el ID o datos
  useEffect(() => {
    // Simulamos la detección del tipo de solución
    // En una implementación real, esto vendría de la base de datos
    const solutionType = getSolutionType(solutionId)

    if (solutionType === "inventario") {
      router.push(`/dashboard/solutions/${solutionId}/inventory`)
      return
    }
    // Si es CRM o no se especifica, continúa con la vista actual
  }, [solutionId, router])

  // Función para determinar el tipo de solución
  const getSolutionType = (id) => {
    // Simulamos diferentes tipos basados en el ID
    // En producción esto vendría de la base de datos
    const solutionTypes = {
      "1": "crm",
      "2": "inventario",
      "3": "crm",
      "4": "inventario",
      inventario: "inventario",
      inventory: "inventario",
    }

    return solutionTypes[id] || "crm"
  }

  // Actualizar la función formatCurrency para usar pesos argentinos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Actualizar los valores monetarios en los datos simulados del CRM para reflejar pesos argentinos
  const [solution, setSolution] = useState({
    id: solutionId,
    name: "Sistema CRM",
    description: "Gestión completa de relaciones con clientes",
    category: "ventas",
    icon: "users",
    status: "activo",
    created: "2024-01-15",
    lastModified: "2024-01-20",
    stats: {
      totalLeads: 245,
      activeLeads: 89,
      convertedLeads: 67,
      totalRevenue: 12500000, // 12.5 millones de pesos
      conversionRate: 27.3,
      avgDealSize: 186500, // 186,500 pesos
      monthlyGrowth: 12.5,
    },
  })

  // Actualizar los valores en los datos de leads
  const [leads, setLeads] = useState([
    {
      id: 1,
      name: "María González",
      email: "maria.gonzalez@empresa.com",
      phone: "+54 11 1234-5678",
      company: "Tech Solutions SRL",
      status: "calificado",
      source: "Sitio Web",
      value: 250000, // 250,000 pesos
      probability: 75,
      lastActivity: "2024-01-25",
      assignedTo: "Carlos Ruiz",
      notes: "Interesada en plan premium, reunión programada para el viernes",
    },
    {
      id: 2,
      name: "Juan Pérez",
      email: "juan.perez@startup.com.ar",
      phone: "+54 11 2345-6789",
      company: "StartupTech",
      status: "nuevo",
      source: "LinkedIn",
      value: 120000, // 120,000 pesos
      probability: 25,
      lastActivity: "2024-01-24",
      assignedTo: "Ana López",
      notes: "Primer contacto, enviar información del producto",
    },
    {
      id: 3,
      name: "Carmen Rodríguez",
      email: "carmen@consulting.com.ar",
      phone: "+54 11 3456-7890",
      company: "Consulting Pro",
      status: "negociacion",
      source: "Referido",
      value: 450000, // 450,000 pesos
      probability: 85,
      lastActivity: "2024-01-25",
      assignedTo: "Carlos Ruiz",
      notes: "Negociando términos del contrato, muy interesada",
    },
    {
      id: 4,
      name: "Roberto Silva",
      email: "roberto.silva@corp.com.ar",
      phone: "+54 11 4567-8901",
      company: "Corporate Inc",
      status: "perdido",
      source: "Email Marketing",
      value: 320000, // 320,000 pesos
      probability: 0,
      lastActivity: "2024-01-20",
      assignedTo: "Ana López",
      notes: "Decidió ir con la competencia por precio",
    },
    {
      id: 5,
      name: "Laura Martín",
      email: "laura.martin@digital.com.ar",
      phone: "+54 11 5678-9012",
      company: "Digital Agency",
      status: "ganado",
      source: "Google Ads",
      value: 180000, // 180,000 pesos
      probability: 100,
      lastActivity: "2024-01-23",
      assignedTo: "Carlos Ruiz",
      notes: "Contrato firmado, implementación en febrero",
    },
    {
      id: 6,
      name: "David López",
      email: "david@ecommerce.com.ar",
      phone: "+54 11 6789-0123",
      company: "E-commerce Plus",
      status: "seguimiento",
      source: "Sitio Web",
      value: 210000, // 210,000 pesos
      probability: 45,
      lastActivity: "2024-01-22",
      assignedTo: "Ana López",
      notes: "Esperando aprobación del presupuesto interno",
    },
  ])

  // Actividades recientes
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: "llamada",
      description: "Llamada con María González - Tech Solutions SL",
      user: "Carlos Ruiz",
      timestamp: "2024-01-25 14:30",
      status: "completada",
    },
    {
      id: 2,
      type: "email",
      description: "Email enviado a Juan Pérez con información del producto",
      user: "Ana López",
      timestamp: "2024-01-25 11:15",
      status: "enviado",
    },
    {
      id: 3,
      type: "reunion",
      description: "Reunión programada con Carmen Rodríguez para el 26/01",
      user: "Carlos Ruiz",
      timestamp: "2024-01-25 09:45",
      status: "programada",
    },
    {
      id: 4,
      type: "nota",
      description: "Nota agregada al lead de Laura Martín",
      user: "Carlos Ruiz",
      timestamp: "2024-01-24 16:20",
      status: "completada",
    },
    {
      id: 5,
      type: "tarea",
      description: "Seguimiento programado para David López",
      user: "Ana López",
      timestamp: "2024-01-24 13:10",
      status: "pendiente",
    },
  ])

  // Tareas automáticas pendientes
  const [automatedTasks, setAutomatedTasks] = useState([
    {
      id: 1,
      title: "Enviar email de seguimiento a Juan Pérez",
      description: "Lead sin actividad por 3 días",
      priority: "alta",
      dueDate: "2024-01-26",
      assignedTo: "Ana López",
      leadId: 2,
    },
    {
      id: 2,
      title: "Llamar a David López para seguimiento",
      description: "Lead en estado de seguimiento por 5 días",
      priority: "media",
      dueDate: "2024-01-27",
      assignedTo: "Ana López",
      leadId: 6,
    },
    {
      id: 3,
      title: "Preparar propuesta para Carmen Rodríguez",
      description: "Lead en negociación, alta probabilidad",
      priority: "alta",
      dueDate: "2024-01-26",
      assignedTo: "Carlos Ruiz",
      leadId: 3,
    },
  ])

  const getIcon = (iconName) => {
    switch (iconName) {
      case "users":
        return <Users className="h-6 w-6" />
      case "package":
        return <Package className="h-6 w-6" />
      case "shopping-cart":
        return <ShoppingCart className="h-6 w-6" />
      case "message-square":
        return <MessageSquare className="h-6 w-6" />
      case "clock":
        return <Clock className="h-6 w-6" />
      case "calendar":
        return <Calendar className="h-6 w-6" />
      case "dollar-sign":
        return <DollarSign className="h-6 w-6" />
      case "bar-chart":
        return <BarChart3 className="h-6 w-6" />
      case "target":
        return <Target className="h-6 w-6" />
      case "zap":
        return <Zap className="h-6 w-6" />
      default:
        return <Package className="h-6 w-6" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "nuevo":
        return "bg-blue-100 text-blue-800"
      case "calificado":
        return "bg-green-100 text-green-800"
      case "negociacion":
        return "bg-yellow-100 text-yellow-800"
      case "ganado":
        return "bg-emerald-100 text-emerald-800"
      case "perdido":
        return "bg-red-100 text-red-800"
      case "seguimiento":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "nuevo":
        return <AlertCircle className="h-4 w-4" />
      case "calificado":
        return <CheckCircle className="h-4 w-4" />
      case "negociacion":
        return <Clock className="h-4 w-4" />
      case "ganado":
        return <CheckCircle className="h-4 w-4" />
      case "perdido":
        return <XCircle className="h-4 w-4" />
      case "seguimiento":
        return <Eye className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "baja":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "llamada":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "reunion":
        return <Calendar className="h-4 w-4" />
      case "nota":
        return <FileText className="h-4 w-4" />
      case "tarea":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const executeAutomatedTask = (taskId) => {
    console.log(`Ejecutando tarea automática ${taskId}`)
    setAutomatedTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/solutions" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Soluciones</span>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">{getIcon(solution.icon)}</div>
            <div>
              <h1 className="font-semibold">{solution.name}</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/solutions/builder?id=${solutionId}`}>
              <Settings className="mr-2 h-4 w-4" />
              Configurar
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Público
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Exportar Datos
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Estadísticas Principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{solution.stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{solution.stats.monthlyGrowth}% este mes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Activos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{solution.stats.activeLeads}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((solution.stats.activeLeads / solution.stats.totalLeads) * 100)}% del total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{solution.stats.conversionRate}%</div>
              <Progress value={solution.stats.conversionRate} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(solution.stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Promedio: {formatCurrency(solution.stats.avgDealSize)} por deal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido Principal */}
        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads">Gestión de Leads</TabsTrigger>
            <TabsTrigger value="automation">Automatización</TabsTrigger>
            <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestión de Leads</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar leads..." className="pl-8 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Lead
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Leads</CardTitle>
                <CardDescription>Gestiona todos tus leads y oportunidades de venta</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Probabilidad</TableHead>
                      <TableHead>Asignado a</TableHead>
                      <TableHead>Última Actividad</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                              <AvatarFallback>
                                {lead.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{lead.name}</div>
                              <div className="text-sm text-muted-foreground">{lead.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {lead.company}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status)}>
                            {getStatusIcon(lead.status)}
                            <span className="ml-1 capitalize">{lead.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(lead.value)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={lead.probability} className="w-16" />
                            <span className="text-sm">{lead.probability}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{lead.assignedTo}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{lead.lastActivity}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="mr-2 h-4 w-4" />
                                Llamar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Programar Reunión
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Automatización y Tareas</h2>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Automatización
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Tareas Automáticas Pendientes
                  </CardTitle>
                  <CardDescription>Tareas generadas automáticamente basadas en reglas de negocio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {automatedTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)} variant="outline">
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>📅 {task.dueDate}</span>
                          <span>👤 {task.assignedTo}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => executeAutomatedTask(task.id)}>
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Reglas de Automatización Activas
                  </CardTitle>
                  <CardDescription>Configuraciones automáticas que se ejecutan en segundo plano</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">Seguimiento automático de leads</h4>
                      <p className="text-sm text-muted-foreground">Envía recordatorio si no hay actividad en 3 días</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activa</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">Asignación automática de leads</h4>
                      <p className="text-sm text-muted-foreground">Distribuye leads nuevos entre el equipo de ventas</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activa</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">Notificaciones de oportunidades</h4>
                      <p className="text-sm text-muted-foreground">Alerta cuando un lead alcanza alta probabilidad</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activa</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Actividad Reciente</h2>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Timeline de Actividades</CardTitle>
                <CardDescription>Todas las interacciones y actividades del equipo de ventas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{activity.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>👤 {activity.user}</span>
                          <span>🕒 {activity.timestamp}</span>
                          <Badge
                            variant="outline"
                            className={
                              activity.status === "completada"
                                ? "text-green-600"
                                : activity.status === "pendiente"
                                  ? "text-yellow-600"
                                  : "text-blue-600"
                            }
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Analíticas del CRM</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Último mes
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Reporte
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Leads por Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nuevos</span>
                      <span className="font-medium">45 (18%)</span>
                    </div>
                    <Progress value={18} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Calificados</span>
                      <span className="font-medium">67 (27%)</span>
                    </div>
                    <Progress value={27} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">En Negociación</span>
                      <span className="font-medium">34 (14%)</span>
                    </div>
                    <Progress value={14} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ganados</span>
                      <span className="font-medium">67 (27%)</span>
                    </div>
                    <Progress value={27} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Perdidos</span>
                      <span className="font-medium">32 (13%)</span>
                    </div>
                    <Progress value={13} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento del Equipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>CR</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Carlos Ruiz</p>
                          <p className="text-xs text-muted-foreground">Senior Sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(4500000)}</p>
                        <p className="text-xs text-muted-foreground">23 leads</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>AL</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Ana López</p>
                          <p className="text-xs text-muted-foreground">Sales Representative</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(3200000)}</p>
                        <p className="text-xs text-muted-foreground">18 leads</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
