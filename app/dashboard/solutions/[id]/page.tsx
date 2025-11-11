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

  // Dynamic solution state
  const [solution, setSolution] = useState<any>(null)
  const [canvasComponents, setCanvasComponents] = useState<any[]>([])
  const [componentsData, setComponentsData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  // Actualizar la función formatCurrency para usar pesos argentinos
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Fetch solution and its data
  useEffect(() => {
    const fetchSolution = async () => {
      if (!solutionId) return

      try {
        setLoading(true)
        
        // Fetch solution with components
        const response = await fetch(`/api/solutions/${solutionId}?includeComponents=true`)
        if (!response.ok) {
          throw new Error('Solution not found')
        }
        
        const data = await response.json()
        setSolution(data)

        // Check if it's inventory type and redirect
        if (data.template_type === 'inventario' || data.template_type === 'inventory') {
          router.push(`/dashboard/solutions/${solutionId}/inventory`)
          return
        }

        // Load canvas from configs
        if (data.configs?.canvas) {
          setCanvasComponents(data.configs.canvas)
          
          // Fetch actual data for each component
          await fetchComponentsData(data.configs.canvas)
        }
      } catch (error) {
        console.error('Error loading solution:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSolution()
  }, [solutionId, router])

  // Fetch data for components
  const fetchComponentsData = async (components: any[]) => {
    const dataMap: Record<string, any> = {}

    for (const component of components) {
      if (component.config.tableId) {
        try {
          // Fetch from BusinessData
          const res = await fetch(`/api/business-data?virtual_table_schema_id=${component.config.tableId}`)
          if (res.ok) {
            const data = await res.json()
            dataMap[component.id] = data
          }
        } catch (error) {
          console.error(`Error fetching data for component ${component.id}:`, error)
        }
      }
    }

    setComponentsData(dataMap)
  }

  // Remove hardcoded demo data - solutions should load their own data
  // Actualizar los valores en los datos de leads
  const [leads, setLeads] = useState<any[]>([])

  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [automatedTasks, setAutomatedTasks] = useState<any[]>([])

  const getIcon = (iconName: string) => {
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

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
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

  const getActivityIcon = (type: string) => {
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

  const executeAutomatedTask = (taskId: number) => {
    console.log(`Ejecutando tarea automática ${taskId}`)
    setAutomatedTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  // Render component with real data
  const renderComponentWithData = (component: any, data: any) => {
    switch (component.type) {
      case "stat-card":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{component.config.title}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.length > 0 ? 'registros totales' : 'Sin datos'}
              </p>
            </CardContent>
          </Card>
        )

      case "data-table":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {component.config.columns?.map((col: any) => {
                      const colKey = typeof col === 'string' ? col : col.key
                      const colLabel = typeof col === 'string' ? col : col.label || col.key
                      return <TableHead key={colKey}>{colLabel}</TableHead>
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data || []).slice(0, 10).map((row: any, idx: number) => (
                    <TableRow key={idx}>
                      {component.config.columns?.map((col: any) => {
                        const colKey = typeof col === 'string' ? col : col.key
                        const value = row.data_json?.[colKey]
                        const format = typeof col === 'object' ? col.format : null
                        const colType = typeof col === 'object' ? col.type : null
                        const stageColors = typeof col === 'object' ? col.stageColors : null
                        
                        let displayValue = value || '-'
                        
                        // Badge rendering for stage column
                        if (colType === 'badge' && stageColors && value) {
                          const stageConfig = stageColors[value]
                          if (stageConfig) {
                            const colorMap: Record<string, string> = {
                              blue: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
                              purple: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
                              yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
                              orange: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
                              green: 'bg-green-100 text-green-800 hover:bg-green-100',
                              red: 'bg-red-100 text-red-800 hover:bg-red-100',
                            }
                            return (
                              <TableCell key={colKey}>
                                <Badge className={colorMap[stageConfig.color] || 'bg-gray-100 text-gray-800'}>
                                  {stageConfig.label}
                                </Badge>
                              </TableCell>
                            )
                          }
                        }
                        
                        // Currency formatting
                        if (format === 'currency' && typeof value === 'number') {
                          displayValue = new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(value)
                        } 
                        // Date formatting
                        else if (format === 'date' && value) {
                          displayValue = new Date(value).toLocaleDateString()
                        }
                        
                        return (
                          <TableCell key={colKey}>
                            {displayValue}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      case "chart-bar":
      case "chart-pie":
      case "chart-line":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Gráfico con {data?.length || 0} datos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "progress-bar":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={data?.length || 0} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                {data?.length || 0}%
              </p>
            </CardContent>
          </Card>
        )

      case "activity-timeline":
        const activities = (data || []).slice(0, component.config.maxItems || 10)
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay actividades recientes
                  </p>
                ) : (
                  activities.map((activity: any, idx: number) => {
                    const activityData = activity.data_json
                    const activityTypeIcons: Record<string, any> = {
                      call: <Phone className="h-4 w-4" />,
                      email: <Mail className="h-4 w-4" />,
                      meeting: <Users className="h-4 w-4" />,
                      task: <CheckCircle className="h-4 w-4" />,
                      note: <FileText className="h-4 w-4" />,
                    }
                    const activityTypeColors: Record<string, string> = {
                      call: 'bg-blue-100 text-blue-600',
                      email: 'bg-purple-100 text-purple-600',
                      meeting: 'bg-green-100 text-green-600',
                      task: 'bg-orange-100 text-orange-600',
                      note: 'bg-gray-100 text-gray-600',
                    }
                    const statusColors: Record<string, string> = {
                      completed: 'text-green-600',
                      planned: 'text-orange-600',
                      cancelled: 'text-red-600',
                    }
                    
                    return (
                      <div key={idx} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                        <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${activityTypeColors[activityData?.type] || 'bg-gray-100'}`}>
                          {activityTypeIcons[activityData?.type] || <Activity className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">{activityData?.description || 'Sin descripción'}</p>
                            {activityData?.status && (
                              <Badge variant="outline" className={statusColors[activityData.status] || ''}>
                                {activityData.status === 'completed' ? 'Completado' : 
                                 activityData.status === 'planned' ? 'Planeado' : 
                                 activityData.status}
                              </Badge>
                            )}
                          </div>
                          {component.config.showRelatedTo && activityData?.related_to && (
                            <p className="text-xs text-muted-foreground">
                              Relacionado: {activityData.related_to}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {activityData?.date && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(activityData.date).toLocaleDateString()}
                              </span>
                            )}
                            {component.config.showAssignedTo && activityData?.assigned_to && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {activityData.assigned_to}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )

      case "contact-card-list":
        const contacts = (data || [])
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay contactos
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {contacts.map((contact: any, idx: number) => {
                    const contactData = contact.data_json
                    const initials = contactData?.name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || '?'
                    
                    const statusColors: Record<string, string> = {
                      active: 'bg-green-100 text-green-800',
                      inactive: 'bg-gray-100 text-gray-800',
                      prospect: 'bg-blue-100 text-blue-800',
                    }
                    
                    return (
                      <div key={idx} className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{contactData?.name || 'Sin nombre'}</p>
                            {contactData?.status && (
                              <Badge className={`${statusColors[contactData.status] || 'bg-gray-100'} text-xs`}>
                                {contactData.status === 'active' ? 'Activo' : 
                                 contactData.status === 'prospect' ? 'Prospecto' : 
                                 contactData.status}
                              </Badge>
                            )}
                          </div>
                          {contactData?.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Building className="h-3 w-3" />
                              {contactData.company}
                            </p>
                          )}
                          <div className="space-y-0.5">
                            {contactData?.email && (
                              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{contactData.email}</span>
                              </p>
                            )}
                            {contactData?.phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contactData.phone}
                              </p>
                            )}
                          </div>
                          {contactData?.tags && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {contactData.tags.split(',').slice(0, 2).map((tag: string, tidx: number) => (
                                <Badge key={tidx} variant="outline" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">
                {component.config.title || 'Componente'}
              </p>
            </CardContent>
          </Card>
        )
    }
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando solución...</p>
        </div>
      </div>
    )
  }

  // Solution should always be loaded from API, no fallback needed
  const displaySolution = solution || { name: 'Solución', icon: 'package' }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/solutions" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Soluciones</span>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">{getIcon(displaySolution.icon)}</div>
            <div>
              <h1 className="font-semibold">{displaySolution.name}</h1>
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
        {/* Render custom canvas if available, otherwise show default CRM view */}
        {canvasComponents.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{displaySolution.name}</h2>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/solutions/builder/advanced?id=${solutionId}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Panel
                </Link>
              </Button>
            </div>
            
            <div className="grid gap-4 grid-cols-4">
              {canvasComponents.map((component) => (
                <div 
                  key={component.id} 
                  className={`col-span-${component.size?.width || 1}`}
                  style={{ gridColumn: `span ${component.size?.width || 1}` }}
                >
                  {renderComponentWithData(component, componentsData[component.id])}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Empty state - solution needs to be configured */}
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Solución sin configurar</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Esta solución aún no tiene componentes configurados. Usa el editor para agregar tarjetas, tablas, gráficos y más.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/solutions/builder/advanced?id=${solutionId}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Configurar Solución
                  </Link>
                </Button>
            </CardContent>
          </Card>
          </>
        )}
      </main>
    </div>
  )
}
