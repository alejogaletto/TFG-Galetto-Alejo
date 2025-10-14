"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Settings,
  Eye,
  Save,
  Undo,
  Redo,
  Copy,
  Trash2,
  Grid,
  BarChart3,
  Table,
  PieChart,
  LineChart,
  Users,
  Package,
  Database,
  Filter,
  Zap,
  Bell,
  TrendingUp,
  Activity,
  Layers,
  AlertTriangle,
  Home,
  FileText,
  Workflow,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdvancedSolutionBuilder() {
  const searchParams = useSearchParams()
  const [solutionName, setSolutionName] = useState("Mi Solución Personalizada")
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false)
  const [showComponentConfig, setShowComponentConfig] = useState(false)
  const [isNewSolution, setIsNewSolution] = useState(false)
  const [templateType, setTemplateType] = useState("")

  // Inicializar desde parámetros URL
  useEffect(() => {
    const name = searchParams.get("name")
    const description = searchParams.get("description")
    const isNew = searchParams.get("new") === "true"
    const template = searchParams.get("template")

    if (name) setSolutionName(name)
    if (isNew) setIsNewSolution(true)
    if (template) setTemplateType(template)
  }, [searchParams])

  // Componentes disponibles para arrastrar
  const availableComponents = [
    {
      id: "stat-card",
      name: "Tarjeta de Estadística",
      icon: <BarChart3 className="h-5 w-5" />,
      category: "metricas",
      description: "Muestra una métrica clave con valor y tendencia",
      configurable: ["title", "value", "dataSource", "icon", "color", "trend"],
    },
    {
      id: "data-table",
      name: "Tabla de Datos",
      icon: <Table className="h-5 w-5" />,
      category: "datos",
      description: "Tabla completa con datos de base de datos",
      configurable: ["dataSource", "columns", "filters", "pagination", "actions"],
    },
    {
      id: "chart-bar",
      name: "Gráfico de Barras",
      icon: <BarChart3 className="h-5 w-5" />,
      category: "graficos",
      description: "Gráfico de barras para comparar datos",
      configurable: ["dataSource", "xAxis", "yAxis", "colors", "legend"],
    },
    {
      id: "chart-pie",
      name: "Gráfico Circular",
      icon: <PieChart className="h-5 w-5" />,
      category: "graficos",
      description: "Gráfico circular para mostrar proporciones",
      configurable: ["dataSource", "labelField", "valueField", "colors"],
    },
    {
      id: "chart-line",
      name: "Gráfico de Líneas",
      icon: <LineChart className="h-5 w-5" />,
      category: "graficos",
      description: "Gráfico de líneas para mostrar tendencias",
      configurable: ["dataSource", "xAxis", "yAxis", "colors", "smooth"],
    },
    {
      id: "progress-bar",
      name: "Barra de Progreso",
      icon: <TrendingUp className="h-5 w-5" />,
      category: "metricas",
      description: "Barra de progreso con porcentaje",
      configurable: ["title", "value", "maxValue", "color", "showPercentage"],
    },
    {
      id: "alert-list",
      name: "Lista de Alertas",
      icon: <Bell className="h-5 w-5" />,
      category: "notificaciones",
      description: "Lista de alertas y notificaciones",
      configurable: ["dataSource", "priorityField", "titleField", "descriptionField"],
    },
    {
      id: "activity-feed",
      name: "Feed de Actividad",
      icon: <Activity className="h-5 w-5" />,
      category: "datos",
      description: "Timeline de actividades recientes",
      configurable: ["dataSource", "typeField", "timestampField", "userField"],
    },
    {
      id: "user-list",
      name: "Lista de Usuarios",
      icon: <Users className="h-5 w-5" />,
      category: "datos",
      description: "Lista de usuarios con avatares",
      configurable: ["dataSource", "nameField", "emailField", "avatarField", "roleField"],
    },
    {
      id: "filter-panel",
      name: "Panel de Filtros",
      icon: <Filter className="h-5 w-5" />,
      category: "controles",
      description: "Panel de filtros para datos",
      configurable: ["filters", "layout", "defaultValues"],
    },
  ]

  // Fuentes de datos disponibles
  const dataSources = [
    {
      id: "customers",
      name: "Clientes",
      type: "database",
      table: "customers",
      fields: ["id", "name", "email", "phone", "company", "status", "created_at", "value"],
      description: "Base de datos de clientes del CRM",
    },
    {
      id: "products",
      name: "Productos",
      type: "database",
      table: "products",
      fields: ["id", "sku", "name", "category", "brand", "price", "stock", "min_stock", "location"],
      description: "Inventario de productos",
    },
    {
      id: "orders",
      name: "Pedidos",
      type: "database",
      table: "orders",
      fields: ["id", "customer_id", "total", "status", "created_at", "items"],
      description: "Pedidos y ventas",
    },
    {
      id: "activities",
      name: "Actividades",
      type: "database",
      table: "activities",
      fields: ["id", "type", "description", "user", "timestamp", "reference"],
      description: "Log de actividades del sistema",
    },
    {
      id: "analytics",
      name: "Analíticas",
      type: "api",
      endpoint: "/api/analytics",
      fields: ["metric", "value", "period", "change"],
      description: "Datos de analíticas y métricas",
    },
  ]

  // Función para obtener componentes iniciales según la plantilla
  const getInitialComponents = (template: string) => {
    switch (template) {
      case "crm":
        return [
          {
            id: "comp-1",
            type: "stat-card",
            position: { x: 0, y: 0 },
            size: { width: 1, height: 1 },
            config: {
              title: "Total de Leads",
              dataSource: "customers",
              valueField: "count",
              icon: "users",
              color: "blue",
              showTrend: true,
            },
          },
          {
            id: "comp-2",
            type: "stat-card",
            position: { x: 1, y: 0 },
            size: { width: 1, height: 1 },
            config: {
              title: "Conversiones",
              dataSource: "customers",
              valueField: "conversions",
              icon: "trending-up",
              color: "green",
              showTrend: true,
            },
          },
          {
            id: "comp-3",
            type: "data-table",
            position: { x: 0, y: 1 },
            size: { width: 4, height: 2 },
            config: {
              title: "Lista de Leads",
              dataSource: "customers",
              columns: ["name", "email", "company", "status", "value"],
              showActions: true,
              pagination: true,
            },
          },
        ]
      case "inventario":
        return [
          {
            id: "comp-1",
            type: "stat-card",
            position: { x: 0, y: 0 },
            size: { width: 1, height: 1 },
            config: {
              title: "Total Productos",
              dataSource: "products",
              valueField: "count",
              icon: "package",
              color: "blue",
              showTrend: true,
            },
          },
          {
            id: "comp-2",
            type: "stat-card",
            position: { x: 1, y: 0 },
            size: { width: 1, height: 1 },
            config: {
              title: "Stock Bajo",
              dataSource: "products",
              valueField: "low_stock_count",
              icon: "alert-triangle",
              color: "red",
              showTrend: false,
            },
          },
          {
            id: "comp-3",
            type: "data-table",
            position: { x: 0, y: 1 },
            size: { width: 4, height: 2 },
            config: {
              title: "Inventario",
              dataSource: "products",
              columns: ["sku", "name", "category", "stock", "min_stock", "location"],
              showActions: true,
              pagination: true,
            },
          },
        ]
      default:
        return []
    }
  }

  // Componentes en el canvas - inicializar con plantilla
  const [canvasComponents, setCanvasComponents] = useState(() => {
    return getInitialComponents(templateType)
  })

  const [selectedCanvasComponent, setSelectedCanvasComponent] = useState(null)

  // Configuración del componente seleccionado
  const [componentConfig, setComponentConfig] = useState({})

  // History for undo/redo
  const [history, setHistory] = useState<any[]>([getInitialComponents(templateType)])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Update history whenever canvasComponents changes
  const updateHistory = (newComponents: any[]) => {
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newComponents)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCanvasComponents(history[newIndex])
    }
  }

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCanvasComponents(history[newIndex])
    }
  }

  // Check if undo/redo is available
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Función mejorada para manejar el drag and drop
  const handleDragEnd = (result: any) => {
    console.log("Drag end result:", result)

    if (!result.destination) {
      console.log("No destination, drag cancelled")
      return
    }

    const { source, destination } = result

    // Si se arrastra desde la paleta al canvas
    if (source.droppableId === "component-palette" && destination.droppableId === "canvas") {
      console.log("Dragging from palette to canvas")

      const component = availableComponents[source.index]
      console.log("Component to add:", component)

      const newComponent = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: component.id,
        position: { x: 0, y: canvasComponents.length },
        size: { width: 2, height: 1 },
        config: {
          title: component.name,
          dataSource: dataSources[0]?.id || "customers",
        },
      }

      console.log("New component:", newComponent)

      setCanvasComponents((prev: any) => {
        const updated = [...prev, newComponent]
        console.log("Updated canvas components:", updated)
        updateHistory(updated)
        return updated
      })
    }

    // Si se reordena dentro del canvas
    if (source.droppableId === "canvas" && destination.droppableId === "canvas") {
      console.log("Reordering within canvas")

      const items = Array.from(canvasComponents)
      const [reorderedItem] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reorderedItem)

      setCanvasComponents(items)
      updateHistory(items)
    }
  }

  const updateComponentConfig = (componentId: string, newConfig: any) => {
    setCanvasComponents((prev) => {
      const updated = prev.map((comp) => 
        comp.id === componentId ? { ...comp, config: { ...comp.config, ...newConfig } } : comp
      )
      updateHistory(updated)
      return updated
    })
  }

  const removeComponent = (componentId: string) => {
    setCanvasComponents((prev) => {
      const updated = prev.filter((comp) => comp.id !== componentId)
      updateHistory(updated)
      return updated
    })
    setSelectedCanvasComponent(null)
  }

  const duplicateComponent = (componentId: string) => {
    const component = canvasComponents.find((comp) => comp.id === componentId)
    if (component) {
      const newComponent = {
        ...component,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: { ...component.position, y: component.position.y + 1 },
      }
      const updated = [...canvasComponents, newComponent]
      setCanvasComponents(updated)
      updateHistory(updated)
    }
  }

  const renderComponentPreview = (component: any) => {
    switch (component.type) {
      case "stat-card":
        return (
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{component.config.title}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
            </CardContent>
          </Card>
        )

      case "data-table":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <UITable>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nombre</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs">Juan Pérez</TableCell>
                    <TableCell className="text-xs">juan@example.com</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        Activo
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">María García</TableCell>
                    <TableCell className="text-xs">maria@example.com</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        Activo
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </UITable>
            </CardContent>
          </Card>
        )

      case "chart-bar":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Gráfico de Barras"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded flex items-end justify-center gap-2 p-4">
                <div className="bg-blue-500 w-6 h-16 rounded-t"></div>
                <div className="bg-blue-500 w-6 h-20 rounded-t"></div>
                <div className="bg-blue-500 w-6 h-12 rounded-t"></div>
                <div className="bg-blue-500 w-6 h-24 rounded-t"></div>
              </div>
            </CardContent>
          </Card>
        )

      case "chart-pie":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Gráfico Circular"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-8 border-blue-500 border-t-green-500 border-r-yellow-500 border-b-red-500"></div>
              </div>
            </CardContent>
          </Card>
        )

      case "chart-line":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Gráfico de Líneas"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded flex items-center justify-center">
                <svg className="w-full h-full p-4" viewBox="0 0 100 50">
                  <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="0,40 20,30 40,35 60,20 80,25 100,15" />
                </svg>
              </div>
            </CardContent>
          </Card>
        )

      case "progress-bar":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Progreso"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completado</span>
                  <span>75%</span>
                </div>
                <Progress value={75} />
              </div>
            </CardContent>
          </Card>
        )

      case "alert-list":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Alertas"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-xs">Stock bajo en productos</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <Bell className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs">Pedido pendiente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "activity-feed":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Actividad Reciente"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Usuario creado - hace 2 min</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Pedido procesado - hace 5 min</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Stock actualizado - hace 10 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "user-list":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Usuarios"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    JP
                  </div>
                  <span className="text-xs">Juan Pérez</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    MG
                  </div>
                  <span className="text-xs">María García</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "filter-panel":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Filtros"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Estado</Label>
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Fecha</Label>
                  <Input type="date" className="h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Componente</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  const renderConfigPanel = () => {
    if (!selectedCanvasComponent) return null

    const component = canvasComponents.find((comp) => comp.id === selectedCanvasComponent)
    if (!component) return null

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="component-title">Título</Label>
          <Input
            id="component-title"
            value={component.config.title || ""}
            onChange={(e) => updateComponentConfig(component.id, { title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="data-source">Fuente de Datos</Label>
          <Select
            value={component.config.dataSource || ""}
            onValueChange={(value) => updateComponentConfig(component.id, { dataSource: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar fuente de datos" />
            </SelectTrigger>
            <SelectContent>
              {dataSources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-xs text-muted-foreground">{source.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {component.type === "data-table" && (
          <div>
            <Label>Columnas a Mostrar</Label>
            <div className="space-y-2 mt-2">
              {dataSources
                .find((ds) => ds.id === component.config.dataSource)
                ?.fields.map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Switch
                      id={`field-${field}`}
                      checked={component.config.columns?.includes(field) || false}
                      onCheckedChange={(checked) => {
                        const currentColumns = component.config.columns || []
                        const newColumns = checked
                          ? [...currentColumns, field]
                          : currentColumns.filter((col) => col !== field)
                        updateComponentConfig(component.id, { columns: newColumns })
                      }}
                    />
                    <Label htmlFor={`field-${field}`} className="capitalize">
                      {field.replace("_", " ")}
                    </Label>
                  </div>
                ))}
            </div>
          </div>
        )}

        {component.type === "stat-card" && (
          <>
            <div>
              <Label htmlFor="value-field">Campo de Valor</Label>
              <Select
                value={component.config.valueField || ""}
                onValueChange={(value) => updateComponentConfig(component.id, { valueField: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar campo" />
                </SelectTrigger>
                <SelectContent>
                  {dataSources
                    .find((ds) => ds.id === component.config.dataSource)
                    ?.fields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field.replace("_", " ")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-trend"
                checked={component.config.showTrend || false}
                onCheckedChange={(checked) => updateComponentConfig(component.id, { showTrend: checked })}
              />
              <Label htmlFor="show-trend">Mostrar Tendencia</Label>
            </div>
          </>
        )}

        <Separator />

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => duplicateComponent(component.id)}>
            <Copy className="h-3 w-3 mr-1" />
            Duplicar
          </Button>
          <Button size="sm" variant="outline" onClick={() => removeComponent(component.id)}>
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        </div>
      </div>
    )
  }

  // Debug: mostrar estado actual
  console.log("Current canvas components:", canvasComponents)

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header Principal */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2 font-semibold" href="#">
          <span className="font-bold">AutomateSMB</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link className="text-sm font-medium" href="/dashboard">
            Panel
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/forms">
            Formularios
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/databases">
            Bases de Datos
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/workflows">
            Flujos de Trabajo
          </Link>
          <Link className="text-sm font-medium text-primary" href="/dashboard/solutions">
            Soluciones
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/profile">
              <Settings className="mr-2 h-4 w-4" />
              Mi Perfil
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Principal */}
        <aside className="hidden w-[220px] flex-col border-r bg-muted/40 md:flex">
          <nav className="grid gap-2 p-4">
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
              href="/dashboard"
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Panel</span>
            </Link>
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
              href="/dashboard/forms"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Formularios</span>
            </Link>
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
              href="/dashboard/databases"
            >
              <Database className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Bases de Datos</span>
            </Link>
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
              href="/dashboard/workflows"
            >
              <Workflow className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Flujos de Trabajo</span>
            </Link>
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary bg-muted text-sm"
              href="/dashboard/solutions"
            >
              <Package className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Soluciones</span>
            </Link>
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
              href="/dashboard/analytics"
            >
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Analíticas</span>
            </Link>
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
              href="/dashboard/profile"
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Mi Perfil</span>
            </Link>
          </nav>
        </aside>

        {/* Contenido Principal */}
        <div className="flex flex-1 flex-col">
          {/* Header del Constructor */}
          <header className="sticky top-16 z-20 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/solutions">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-lg">Constructor Avanzado de Soluciones</h1>
                  {isNewSolution && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Nueva Solución
                    </Badge>
                  )}
                  {templateType && (
                    <Badge variant="outline" className="capitalize">
                      {templateType}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{solutionName}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
              >
                <Undo className="mr-2 h-4 w-4" />
                Deshacer
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
              >
                <Redo className="mr-2 h-4 w-4" />
                Rehacer
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                <Eye className="mr-2 h-4 w-4" />
                {previewMode ? "Editar" : "Vista Previa"}
              </Button>
              <Button size="sm">
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            </div>
          </header>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-1">
              {/* Panel Izquierdo - Componentes */}
              {!previewMode && (
                <aside className="w-[300px] border-r bg-muted/40 flex flex-col">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold mb-2">Componentes</h2>
                    <Input placeholder="Buscar componentes..." className="mb-3" />
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <Tabs defaultValue="all">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="all" className="text-xs">
                            Todo
                          </TabsTrigger>
                          <TabsTrigger value="metrics" className="text-xs">
                            Métricas
                          </TabsTrigger>
                          <TabsTrigger value="data" className="text-xs">
                            Datos
                          </TabsTrigger>
                          <TabsTrigger value="charts" className="text-xs">
                            Gráficos
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-4">
                          <Droppable droppableId="component-palette">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`space-y-2 ${snapshot.isDraggingOver ? "bg-muted/50" : ""}`}
                              >
                                {availableComponents.map((component, index) => (
                                  <Draggable key={component.id} draggableId={component.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-3 border rounded-lg cursor-move hover:bg-accent transition-colors ${
                                          snapshot.isDragging ? "shadow-lg bg-background border-primary" : ""
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                                            {component.icon}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm">{component.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {component.description}
                                            </p>
                                            <Badge variant="outline" className="mt-2 text-xs">
                                              {component.category}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </TabsContent>

                        <TabsContent value="metrics" className="mt-4">
                          <Droppable droppableId="component-palette-metricas">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {availableComponents
                                  .filter((comp) => comp.category === "metricas")
                                  .map((component, index) => (
                                    <Draggable key={component.id} draggableId={component.id} index={index}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`p-3 border rounded-lg cursor-move hover:bg-accent transition-colors ${
                                            snapshot.isDragging ? "shadow-lg" : ""
                                          }`}
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                                              {component.icon}
                                            </div>
                                            <div>
                                              <h3 className="font-medium text-sm">{component.name}</h3>
                                              <p className="text-xs text-muted-foreground">{component.description}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </TabsContent>

                        <TabsContent value="data" className="mt-4">
                          <Droppable droppableId="component-palette-datos">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {availableComponents
                                  .filter((comp) => comp.category === "datos")
                                  .map((component, index) => (
                                    <Draggable key={component.id} draggableId={component.id} index={index}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`p-3 border rounded-lg cursor-move hover:bg-accent transition-colors ${
                                            snapshot.isDragging ? "shadow-lg" : ""
                                          }`}
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                                              {component.icon}
                                            </div>
                                            <div>
                                              <h3 className="font-medium text-sm">{component.name}</h3>
                                              <p className="text-xs text-muted-foreground">{component.description}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </TabsContent>

                        <TabsContent value="charts" className="mt-4">
                          <Droppable droppableId="component-palette-graficos">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {availableComponents
                                  .filter((comp) => comp.category === "graficos")
                                  .map((component, index) => (
                                    <Draggable key={component.id} draggableId={component.id} index={index}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`p-3 border rounded-lg cursor-move hover:bg-accent transition-colors ${
                                            snapshot.isDragging ? "shadow-lg" : ""
                                          }`}
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                                              {component.icon}
                                            </div>
                                            <div>
                                              <h3 className="font-medium text-sm">{component.name}</h3>
                                              <p className="text-xs text-muted-foreground">{component.description}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </ScrollArea>
                </aside>
              )}

              {/* Canvas Principal */}
              <main className="flex-1 flex flex-col">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Input
                        value={solutionName}
                        onChange={(e) => setSolutionName(e.target.value)}
                        className="font-semibold text-lg border-none p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Grid className="mr-2 h-4 w-4" />
                        Cuadrícula
                      </Button>
                      <Button variant="outline" size="sm">
                        <Layers className="mr-2 h-4 w-4" />
                        Capas
                      </Button>
                      <div className="text-sm text-muted-foreground">Componentes: {canvasComponents.length}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 bg-muted/20">
                  <Droppable droppableId="canvas">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[600px] ${
                          canvasComponents.length > 0 ? "grid grid-cols-4 gap-4" : "flex items-center justify-center"
                        } ${snapshot.isDraggingOver ? "bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg" : ""}`}
                      >
                        {canvasComponents.length > 0 ? (
                          canvasComponents.map((component, index) => (
                            <Draggable key={component.id} draggableId={component.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative group ${snapshot.isDragging ? "z-50" : ""} ${
                                    selectedCanvasComponent === component.id ? "ring-2 ring-primary" : ""
                                  }`}
                                  style={{
                                    gridColumn: `span ${component.size.width}`,
                                    gridRow: `span ${component.size.height}`,
                                    ...provided.draggableProps.style,
                                  }}
                                  onClick={() => setSelectedCanvasComponent(component.id as any)}
                                >
                                  {renderComponentPreview(component)}

                                  {/* Controles del componente */}
                                  {!previewMode && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedCanvasComponent(component.id as any)
                                            setShowComponentConfig(true)
                                          }}
                                        >
                                          <Settings className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            duplicateComponent(component.id)
                                          }}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            removeComponent(component.id)
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          /* Área de drop cuando está vacía */
                          <div className="col-span-4 flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                            <div className="text-center">
                              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <h3 className="text-lg font-medium mb-2">Comienza a construir tu solución</h3>
                              <p className="text-muted-foreground mb-4">
                                Arrastra componentes desde el panel izquierdo para crear tu dashboard personalizado
                              </p>
                              <Button variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Componente
                              </Button>
                            </div>
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </main>

              {/* Panel Derecho - Configuración */}
              {!previewMode && (
                <aside className="w-[320px] border-l bg-background flex flex-col">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold">Configuración</h2>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <Tabs defaultValue="component">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="component" className="text-xs">
                            Componente
                          </TabsTrigger>
                          <TabsTrigger value="data" className="text-xs">
                            Datos
                          </TabsTrigger>
                          <TabsTrigger value="style" className="text-xs">
                            Estilo
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="component" className="mt-4">
                          {selectedCanvasComponent ? (
                            renderConfigPanel()
                          ) : (
                            <div className="text-center py-8">
                              <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-muted-foreground">Selecciona un componente para configurarlo</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="data" className="mt-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-2">Fuentes de Datos Disponibles</h3>
                              <div className="space-y-2">
                                {dataSources.map((source) => (
                                  <Card key={source.id} className="p-3">
                                    <div className="flex items-start gap-3">
                                      <Database className="h-5 w-5 text-primary mt-0.5" />
                                      <div className="flex-1">
                                        <h4 className="font-medium text-sm">{source.name}</h4>
                                        <p className="text-xs text-muted-foreground mb-2">{source.description}</p>
                                        <div className="flex flex-wrap gap-1">
                                          {source.fields.slice(0, 3).map((field) => (
                                            <Badge key={field} variant="outline" className="text-xs">
                                              {field}
                                            </Badge>
                                          ))}
                                          {source.fields.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                              +{source.fields.length - 3} más
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <Button className="w-full" onClick={() => setShowDataSourceDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Fuente de Datos
                              </Button>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="style" className="mt-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="theme">Tema</Label>
                              <Select defaultValue="light">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="light">Claro</SelectItem>
                                  <SelectItem value="dark">Oscuro</SelectItem>
                                  <SelectItem value="auto">Automático</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="primary-color">Color Primario</Label>
                              <div className="flex gap-2 mt-2">
                                {["blue", "green", "purple", "red", "orange"].map((color) => (
                                  <div
                                    key={color}
                                    className={`w-8 h-8 rounded-full cursor-pointer border-2 bg-${color}-500`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="layout">Diseño</Label>
                              <Select defaultValue="grid">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="grid">Cuadrícula</SelectItem>
                                  <SelectItem value="flex">Flexible</SelectItem>
                                  <SelectItem value="masonry">Mosaico</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="responsive" defaultChecked />
                              <Label htmlFor="responsive">Diseño Responsivo</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="animations" defaultChecked />
                              <Label htmlFor="animations">Animaciones</Label>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </ScrollArea>
                </aside>
              )}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Dialog para configurar fuente de datos */}
      <Dialog open={showDataSourceDialog} onOpenChange={setShowDataSourceDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Fuente de Datos</DialogTitle>
            <DialogDescription>Conecta una nueva fuente de datos para usar en tus componentes</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source-name">Nombre</Label>
                <Input id="source-name" placeholder="Ej: Ventas 2024" />
              </div>
              <div>
                <Label htmlFor="source-type">Tipo</Label>
                <Select defaultValue="database">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">Base de Datos</SelectItem>
                    <SelectItem value="api">API REST</SelectItem>
                    <SelectItem value="csv">Archivo CSV</SelectItem>
                    <SelectItem value="json">Archivo JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="connection-string">Cadena de Conexión</Label>
              <Input id="connection-string" placeholder="postgresql://user:pass@host:port/db" />
            </div>
            <div>
              <Label htmlFor="query">Consulta SQL / Endpoint</Label>
              <Textarea id="query" placeholder="SELECT * FROM customers WHERE status = 'active'" rows={3} />
            </div>
            <div>
              <Button variant="outline" className="w-full bg-transparent">
                <Zap className="mr-2 h-4 w-4" />
                Probar Conexión
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDataSourceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowDataSourceDialog(false)}>Agregar Fuente de Datos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para configuración avanzada de componente */}
      <Dialog open={showComponentConfig} onOpenChange={setShowComponentConfig}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Configuración Avanzada del Componente</DialogTitle>
            <DialogDescription>Configura las propiedades avanzadas de tu componente</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="data">Datos</TabsTrigger>
                <TabsTrigger value="style">Estilo</TabsTrigger>
                <TabsTrigger value="behavior">Comportamiento</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comp-title">Título</Label>
                    <Input id="comp-title" placeholder="Título del componente" />
                  </div>
                  <div>
                    <Label htmlFor="comp-subtitle">Subtítulo</Label>
                    <Input id="comp-subtitle" placeholder="Subtítulo opcional" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="comp-description">Descripción</Label>
                  <Textarea id="comp-description" placeholder="Descripción del componente" />
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                <div>
                  <Label>Fuente de Datos</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filtros</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Input placeholder="Campo" />
                      <Select>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Operador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Igual a</SelectItem>
                          <SelectItem value="contains">Contiene</SelectItem>
                          <SelectItem value="greater">Mayor que</SelectItem>
                          <SelectItem value="less">Menor que</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Valor" />
                      <Button size="sm" variant="outline">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ancho</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Ancho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 columna</SelectItem>
                        <SelectItem value="2">2 columnas</SelectItem>
                        <SelectItem value="3">3 columnas</SelectItem>
                        <SelectItem value="4">4 columnas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Alto</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Alto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 fila</SelectItem>
                        <SelectItem value="2">2 filas</SelectItem>
                        <SelectItem value="3">3 filas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Color de Fondo</Label>
                  <div className="flex gap-2 mt-2">
                    {["white", "gray-50", "blue-50", "green-50", "yellow-50"].map((color) => (
                      <div key={color} className={`w-8 h-8 rounded border-2 cursor-pointer bg-${color}`} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-refresh" />
                  <Label htmlFor="auto-refresh">Actualización Automática</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="clickable" />
                  <Label htmlFor="clickable">Clickeable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="exportable" />
                  <Label htmlFor="exportable">Exportable</Label>
                </div>
                <div>
                  <Label htmlFor="refresh-interval">Intervalo de Actualización (segundos)</Label>
                  <Input id="refresh-interval" type="number" placeholder="30" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComponentConfig(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowComponentConfig(false)}>Aplicar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
