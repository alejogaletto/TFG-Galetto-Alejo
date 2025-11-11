"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
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
  FormInput,
  Edit3,
  PlusSquare,
  Loader2,
  GripVertical,
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
import { useToast } from "@/hooks/use-toast"

// Data Table Preview Component
function DataTablePreview({ component, dataSources }: { component: any, dataSources: any[] }) {
  const [data, setData] = useState<any[]>([])
  const [fields, setFields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newRowData, setNewRowData] = useState<any>({})
  
  const selectedDataSource = dataSources.find(ds => ds.id === component.config.dataSource)
  const tableId = component.config.dataSource?.replace('table-', '')
  
  useEffect(() => {
    fetchData()
    fetchFields()
  }, [component.config.dataSource])
  
  const fetchData = async () => {
    if (!tableId) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`/api/business-data?virtual_table_schema_id=${tableId}`)
      if (response.ok) {
        const records = await response.json()
        setData(records)
      }
    } catch (error) {
      console.error('Error fetching table data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchFields = async () => {
    if (!tableId) return
    
    try {
      const response = await fetch(`/api/virtual-field-schemas?virtual_table_schema_id=${tableId}`)
      if (response.ok) {
        const fieldsData = await response.json()
        setFields(fieldsData)
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    }
  }
  
  const handleAdd = async () => {
    try {
      const response = await fetch('/api/business-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          virtual_table_schema_id: tableId,
          data_json: newRowData,
        }),
      })
      
      if (response.ok) {
        fetchData()
        setShowAddDialog(false)
        setNewRowData({})
      }
    } catch (error) {
      console.error('Error creating row:', error)
    }
  }
  
  const visibleColumns = (component.config.columnConfigs || []).filter((col: any) => col.visible !== false)
  const displayColumns = visibleColumns.length > 0 ? visibleColumns : fields
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{component.config.title}</CardTitle>
            {selectedDataSource && (
              <p className="text-xs text-muted-foreground mt-1">
                Fuente: {selectedDataSource.name}
              </p>
            )}
          </div>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        {component.config.dataSource && selectedDataSource ? (
          <div className="max-h-[400px] overflow-auto">
            <UITable>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  {displayColumns.map((col: any) => (
                    <TableHead key={col.field || col.name} className="text-xs">
                      {col.label || col.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((row) => (
                    <TableRow key={row.id}>
                      {displayColumns.map((col: any) => (
                        <TableCell key={col.field || col.name} className="text-xs">
                          {row.data_json?.[col.field || col.name]?.toString() || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={displayColumns.length} className="text-center text-xs text-muted-foreground">
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </UITable>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-4">
            Selecciona una fuente de datos en la configuración
          </div>
        )}
      </CardContent>
      
      {/* Add Row Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Fila</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.id}>
                <Label className="text-xs">{field.name}</Label>
                <Input
                  value={newRowData[field.name] || ''}
                  onChange={(e) => setNewRowData({ ...newRowData, [field.name]: e.target.value })}
                  className="h-8"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default function AdvancedSolutionBuilder() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [solutionName, setSolutionName] = useState("Mi Solución Personalizada")
  const [solutionId, setSolutionId] = useState<string | null>(null)
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false)
  const [showComponentConfig, setShowComponentConfig] = useState(false)
  const [isNewSolution, setIsNewSolution] = useState(false)
  const [templateType, setTemplateType] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedState, setLastSavedState] = useState<string>("")
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [resizingComponent, setResizingComponent] = useState<string | null>(null)
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 })
  const [resizeStartSize, setResizeStartSize] = useState({ width: 1, height: 1 })

  // Inicializar desde parámetros URL
  useEffect(() => {
    const name = searchParams.get("name")
    const description = searchParams.get("description")
    const isNew = searchParams.get("new") === "true"
    const template = searchParams.get("template")
    const id = searchParams.get("id")

    if (name) setSolutionName(name)
    if (isNew) setIsNewSolution(true)
    if (template) setTemplateType(template)
    if (id) setSolutionId(id)
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
    {
      id: "form-embed",
      name: "Formulario Integrado",
      icon: <FileText className="h-5 w-5" />,
      category: "formularios",
      description: "Muestra un formulario completo dentro de la solución",
      configurable: ["formId", "tableId", "fieldMappings", "submitButton", "successMessage"],
    },
    {
      id: "quick-input",
      name: "Entrada Rápida",
      icon: <Edit3 className="h-5 w-5" />,
      category: "formularios",
      description: "Campos de entrada rápida para agregar registros",
      configurable: ["tableId", "fields", "submitButton"],
    },
    {
      id: "data-entry-form",
      name: "Formulario de Datos",
      icon: <FormInput className="h-5 w-5" />,
      category: "formularios",
      description: "Formulario multi-campo para entrada de datos",
      configurable: ["tableId", "fields", "layout", "validation"],
    },
    {
      id: "form-selector",
      name: "Selector de Formularios",
      icon: <PlusSquare className="h-5 w-5" />,
      category: "formularios",
      description: "Dropdown para seleccionar y mostrar formularios",
      configurable: ["forms", "defaultForm", "showDescription"],
    },
    // CRM Components (distributed in existing categories)
    {
      id: "kanban-board",
      name: "Kanban Board",
      icon: <Layers className="h-5 w-5" />,
      category: "datos",
      description: "Tablero Kanban para pipeline de ventas con drag & drop",
      configurable: ["tableId", "title", "columns", "allowCreate", "allowEdit", "showValue", "showProbability"],
    },
    {
      id: "contact-card-list",
      name: "Lista de Contactos",
      icon: <Users className="h-5 w-5" />,
      category: "datos",
      description: "Galería de contactos con búsqueda y filtros",
      configurable: ["tableId", "title", "allowCreate", "allowEdit", "allowDelete", "defaultView", "showSearch"],
    },
    {
      id: "activity-timeline",
      name: "Timeline de Actividades",
      icon: <Activity className="h-5 w-5" />,
      category: "datos",
      description: "Timeline cronológico de actividades e interacciones",
      configurable: ["tableId", "title", "allowCreate", "maxItems", "showRelatedTo", "showAssignedTo"],
    },
    {
      id: "deal-progress",
      name: "Progreso de Deal",
      icon: <TrendingUp className="h-5 w-5" />,
      category: "metricas",
      description: "Visualización de progreso y detalles de un deal",
      configurable: ["dealId", "tableId", "title", "showDetails", "allowStageUpdate", "showValue", "showProbability"],
    },
  ]

  // Fuentes de datos disponibles - ahora dinámicas
  const [dataSources, setDataSources] = useState<any[]>([])
  const [forms, setForms] = useState<any[]>([])
  const [formFields, setFormFields] = useState<Record<number, any[]>>({}) // Store fields by form ID
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real data sources, forms, and workflows
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get user from localStorage
        const userStr = localStorage.getItem("user")
        const user = userStr ? JSON.parse(userStr) : null
        const currentUserId = user?.id || 1
        setUserId(currentUserId)

        // Fetch Virtual Schemas with tables and fields
        const schemasRes = await fetch(`/api/virtual-schemas?user_id=${currentUserId}&includeTree=true`)
        if (schemasRes.ok) {
          const schemas = await schemasRes.json()
          
          // Transform to dataSources format
          const sources = schemas.flatMap((schema: any) => 
            (schema.tables || []).map((table: any) => ({
              id: `table-${table.id}`,
              name: table.name,
              type: 'database',
              schemaId: schema.id,
              tableId: table.id,
              fields: (table.fields || []).map((f: any) => f.name),
              description: table.description || schema.name
            }))
          )
          setDataSources(sources)
        }

        // Fetch Forms
        const formsRes = await fetch('/api/forms')
        if (formsRes.ok) {
          const formsData = await formsRes.json()
          setForms(formsData || [])
          
          // Fetch fields for each form
          const fieldsMap: Record<number, any[]> = {}
          for (const form of formsData || []) {
            try {
              const fieldsRes = await fetch(`/api/form-fields?form_id=${form.id}`)
              if (fieldsRes.ok) {
                const fields = await fieldsRes.json()
                fieldsMap[form.id] = fields || []
              }
            } catch (err) {
              console.error(`Error fetching fields for form ${form.id}:`, err)
            }
          }
          setFormFields(fieldsMap)
        }

        // Fetch Workflows
        const workflowsRes = await fetch('/api/workflows')
        if (workflowsRes.ok) {
          const workflowsData = await workflowsRes.json()
          setWorkflows(workflowsData || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Load saved solution if editing existing, or initialize with template if new
  useEffect(() => {
    const loadSolution = async () => {
      if (!solutionId) return

      try {
        const response = await fetch(`/api/solutions/${solutionId}?includeComponents=true`)
        if (response.ok) {
          const solution = await response.json()

          // If this is a new solution from a template, initialize with template components
          if (isNewSolution && templateType && !solution.configs?.canvas) {
            const initialComponents = getInitialComponents(templateType)
            setCanvasComponents(initialComponents)
            setHistory([initialComponents])
            setHistoryIndex(0)
          }
          // Otherwise, load existing canvas or keep empty
          else if (solution.configs?.canvas) {
            setCanvasComponents(solution.configs.canvas)
            setHistory([solution.configs.canvas])
            setHistoryIndex(0)
          } else {
            // Explicitly set empty canvas for existing solutions without components
            setCanvasComponents([])
            setHistory([[]])
            setHistoryIndex(0)
          }

          if (solution.name) setSolutionName(solution.name)
        }
      } catch (error) {
        console.error('Error loading solution:', error)
      }
    }

    loadSolution()
  }, [solutionId, isNewSolution, templateType])

  // Prevent navigation when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // Handle resize mouse events
  useEffect(() => {
    if (resizingComponent) {
      window.addEventListener('mousemove', handleResizeMove as any)
      window.addEventListener('mouseup', handleResizeEnd)
      return () => {
        window.removeEventListener('mousemove', handleResizeMove as any)
        window.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [resizingComponent, resizeStartPos, resizeStartSize])

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

  // Componentes en el canvas - inicializar vacío (se cargará desde la API si existe)
  const [canvasComponents, setCanvasComponents] = useState<any[]>([])

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

    // Check if dragging from any palette to canvas
    const isPaletteSource = source.droppableId.startsWith("component-palette")
    const isCanvasDestination = destination.droppableId === "canvas"

    // Si se arrastra desde cualquier paleta al canvas
    if (isPaletteSource && isCanvasDestination) {
      console.log("Dragging from palette to canvas")

      // Get the correct component based on the source tab
      let component;
      
      if (source.droppableId === "component-palette") {
        // From "all" tab - use direct index
        component = availableComponents[source.index]
      } else if (source.droppableId === "component-palette-formularios") {
        // From "forms" tab - filter by category
        const formComponents = availableComponents.filter((comp) => comp.category === "formularios")
        component = formComponents[source.index]
      } else if (source.droppableId === "component-palette-datos") {
        // From "data" tab - filter by category
        const dataComponents = availableComponents.filter((comp) => comp.category === "datos")
        component = dataComponents[source.index]
      } else if (source.droppableId === "component-palette-graficos") {
        // From "charts" tab - filter by category
        const chartComponents = availableComponents.filter((comp) => comp.category === "graficos")
        component = chartComponents[source.index]
      } else if (source.droppableId === "component-palette-metricas") {
        // From "metrics/others" tab - filter by category
        const metricComponents = availableComponents.filter(
          (comp) => comp.category === "metricas" || comp.category === "notificaciones" || comp.category === "controles"
        )
        component = metricComponents[source.index]
      }

      if (!component) {
        console.error("Component not found for index:", source.index, "from:", source.droppableId)
        return
      }

      console.log("Component to add:", component)

      const newComponent = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: component.id,
        position: { x: 0, y: canvasComponents.length },
        size: { width: 2, height: 1 },
        config: {
          title: component.name,
          dataSource: dataSources[0]?.id || "",
          tableId: null,
          formId: null,
          submitButtonText: 'Enviar',
          successMessage: '¡Datos guardados exitosamente!'
        },
      }

      console.log("New component:", newComponent)

      setCanvasComponents((prev: any) => {
        const updated = [...prev, newComponent]
        console.log("Updated canvas components:", updated)
        updateHistory(updated)
        setHasUnsavedChanges(true)
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
      setHasUnsavedChanges(true)
    }
  }

  const updateComponentConfig = (componentId: string, newConfig: any) => {
    setCanvasComponents((prev) => {
      const updated = prev.map((comp) => 
        comp.id === componentId ? { ...comp, config: { ...comp.config, ...newConfig } } : comp
      )
      updateHistory(updated)
      setHasUnsavedChanges(true)
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
    setHasUnsavedChanges(true)
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
      setHasUnsavedChanges(true)
    }
  }

  // Resize functionality
  const handleResizeStart = (componentId: string, startX: number, startY: number, currentWidth: number, currentHeight: number) => {
    setResizingComponent(componentId)
    setResizeStartPos({ x: startX, y: startY })
    setResizeStartSize({ width: currentWidth, height: currentHeight })
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingComponent) return
    
    const deltaX = e.clientX - resizeStartPos.x
    const deltaY = e.clientY - resizeStartPos.y
    
    // Calculate new width (1 column = ~250px)
    const newWidth = Math.max(1, Math.min(4, resizeStartSize.width + Math.round(deltaX / 250)))
    const newHeight = Math.max(1, resizeStartSize.height + Math.round(deltaY / 150))
    
    setCanvasComponents(prev => 
      prev.map(comp => 
        comp.id === resizingComponent 
          ? { ...comp, size: { width: newWidth, height: newHeight } }
          : comp
      )
    )
  }

  const handleResizeEnd = () => {
    if (resizingComponent) {
      setHasUnsavedChanges(true)
    }
    setResizingComponent(null)
  }

  // Save functionality
  const handleSave = async () => {
    if (!solutionId) {
      toast({
        title: "Error",
        description: "No se encontró el ID de la solución",
        variant: "destructive",
      })
      return
    }

    try {
      // 1. Save canvas layout to Solution.configs
      const layoutConfig = {
        canvas: canvasComponents,
        lastModified: new Date().toISOString()
      }

      const updateResponse = await fetch(`/api/solutions/${solutionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configs: layoutConfig,
          status: 'active'
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Error updating solution')
      }

      // 2. Delete existing solution components to avoid duplicates
      const existingComponents = await fetch(`/api/solution-components?solution_id=${solutionId}`)
      if (existingComponents.ok) {
        const existing = await existingComponents.json()
        for (const comp of existing) {
          await fetch(`/api/solution-components?id=${comp.id}`, {
            method: 'DELETE'
          })
        }
      }

      // 3. Create SolutionComponent links for each component with data source
      for (const component of canvasComponents) {
        const config = component.config as any
        if (config.tableId || config.formId || config.workflowId) {
          const componentType = config.tableId ? 'virtual_schema' : 
                              config.formId ? 'form' : 'workflow'
          const componentId = config.tableId || config.formId || config.workflowId

          await fetch('/api/solution-components', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              solution_id: parseInt(solutionId),
              component_type: componentType,
              component_id: parseInt(componentId),
              configs: {
                canvas_component_id: component.id,
                canvas_config: component.config
              }
            })
          })
        }
      }

      setHasUnsavedChanges(false)
      setLastSavedState(JSON.stringify(canvasComponents))
      toast({
        title: "Éxito",
        description: "Solución guardada exitosamente",
      })
      router.push(`/dashboard/solutions/${solutionId}`)
    } catch (error) {
      console.error('Error saving solution:', error)
      toast({
        title: "Error",
        description: "Error al guardar la solución",
        variant: "destructive",
      })
    }
  }

  // Handle navigation with unsaved changes
  const handleNavigation = (href: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(href)
      setShowUnsavedDialog(true)
    } else {
      router.push(href)
    }
  }

  const confirmNavigation = () => {
    if (pendingNavigation) {
      setHasUnsavedChanges(false)
      router.push(pendingNavigation)
    }
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
  }

  const cancelNavigation = () => {
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
  }

  // Preview mode toggle
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode)
    setSelectedCanvasComponent(null)
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
        return <DataTablePreview component={component} dataSources={dataSources} />

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

      case "form-embed":
        const selectedForm = forms.find(f => f.id === component.config.formId)
        const selectedFormFields = component.config.formId ? formFields[component.config.formId] || [] : []
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Formulario"}</CardTitle>
              {selectedForm && (
                <p className="text-xs text-muted-foreground mt-1">
                  Formulario: {selectedForm.name}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {component.config.formId && selectedForm ? (
                <div className="space-y-3">
                  {selectedFormFields.length > 0 ? (
                    <>
                      {selectedFormFields.map((field: any) => (
                        <div key={field.id}>
                          <Label className="text-xs">{field.label}</Label>
                          <Input 
                            placeholder={field.configs?.placeholder || ''} 
                            className="h-8"
                            disabled
                          />
                        </div>
                      ))}
                      <Button size="sm" className="w-full h-8">
                        {component.config.submitButtonText || "Enviar"}
                      </Button>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      Este formulario no tiene campos configurados
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4">
                  Selecciona un formulario en la configuración
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "quick-input":
        const quickInputDataSource = dataSources.find(ds => ds.id === component.config.dataSource)
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Entrada Rápida"}</CardTitle>
              {quickInputDataSource && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tabla: {quickInputDataSource.name}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Entrada rápida</Label>
                  <Input placeholder="Agregar..." className="h-8" />
                </div>
                <Button size="sm" className="h-8">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "data-entry-form":
        const dataEntryDataSource = dataSources.find(ds => ds.id === component.config.dataSource)
        const dataEntryFields = dataEntryDataSource?.fields.slice(0, 4) || []
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Nuevo Registro"}</CardTitle>
              {dataEntryDataSource && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tabla: {dataEntryDataSource.name}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {component.config.dataSource && dataEntryDataSource ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {dataEntryFields.map((field: string) => (
                      <div key={field}>
                        <Label className="text-xs capitalize">{field.replace('_', ' ')}</Label>
                        <Input className="h-8" />
                      </div>
                    ))}
                  </div>
                  <Button size="sm" className="w-full h-8">
                    {component.config.submitButtonText || "Guardar"}
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4">
                  Selecciona una fuente de datos
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "form-selector":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{component.config.title || "Seleccionar Formulario"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Select>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Selecciona un formulario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form1">Formulario de Contacto</SelectItem>
                    <SelectItem value="form2">Formulario de Registro</SelectItem>
                  </SelectContent>
                </Select>
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

    // Get fresh component from state on each render
    const component = canvasComponents.find((comp) => comp.id === selectedCanvasComponent)
    if (!component) {
      setSelectedCanvasComponent(null)
      return null
    }

    // Ensure config exists
    const config = component.config || {}

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="component-title">Título</Label>
          <Input
            key={`title-${component.id}`}
            id="component-title"
            value={config.title || ""}
            onChange={(e) => updateComponentConfig(component.id, { title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="data-source">Fuente de Datos</Label>
          <Select
            key={`datasource-${component.id}-${config.dataSource}`}
            value={config.dataSource || ""}
            onValueChange={(value) => {
              const selectedSource = dataSources.find(ds => ds.id === value)
              updateComponentConfig(component.id, { 
                dataSource: value,
                tableId: selectedSource?.tableId,
                schemaId: selectedSource?.schemaId
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar fuente de datos" />
            </SelectTrigger>
            <SelectContent>
              {dataSources.length > 0 ? (
                dataSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-xs text-muted-foreground">{source.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  No hay bases de datos disponibles
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Workflow selector for automation components */}
        {component.type === "workflow-trigger" && (
          <div>
            <Label htmlFor="workflow-select">Flujo de Trabajo</Label>
            <Select
              key={`workflow-select-${component.id}-${config.workflowId}`}
              value={config.workflowId?.toString() || ""}
              onValueChange={(value) => updateComponentConfig(component.id, { workflowId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar flujo" />
              </SelectTrigger>
              <SelectContent>
                {workflows.length > 0 ? (
                  workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>{workflow.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No hay flujos disponibles
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Configuration for form-embed component */}
        {component.type === "form-embed" && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="form-select">Formulario</Label>
              <Select
                key={`form-select-${component.id}-${config.formId}`}
                value={config.formId?.toString() || ""}
                onValueChange={(value) => updateComponentConfig(component.id, { formId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar formulario" />
                </SelectTrigger>
                <SelectContent>
                  {forms.length > 0 ? (
                    forms.map((form) => (
                      <SelectItem key={form.id} value={form.id.toString()}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{form.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No hay formularios disponibles
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="submit-button-text">Texto del Botón</Label>
              <Input
                key={`submit-button-${component.id}`}
                id="submit-button-text"
                value={config.submitButtonText || "Enviar"}
                onChange={(e) => updateComponentConfig(component.id, { submitButtonText: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="success-message">Mensaje de Éxito</Label>
              <Textarea
                key={`success-message-${component.id}`}
                id="success-message"
                value={config.successMessage || "¡Datos guardados exitosamente!"}
                onChange={(e) => updateComponentConfig(component.id, { successMessage: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Configuration for quick-input component */}
        {(component.type === "quick-input" || component.type === "data-entry-form") && (
          <div className="space-y-3">
            <div>
              <Label>Campos del Formulario</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Los campos se crearán automáticamente basados en la tabla seleccionada
              </p>
              {dataSources
                .find((ds) => ds.id === config.dataSource)
                ?.fields.slice(0, 5).map((field: string) => (
                  <div key={field} className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs capitalize">{field.replace("_", " ")}</span>
                  </div>
                ))}
            </div>
            <div>
              <Label htmlFor="submit-btn-text">Texto del Botón</Label>
              <Input
                key={`submit-btn-${component.id}`}
                id="submit-btn-text"
                value={config.submitButtonText || "Guardar"}
                onChange={(e) => updateComponentConfig(component.id, { submitButtonText: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Configuration for form-selector component */}
        {component.type === "form-selector" && (
          <div className="space-y-3">
            <div>
              <Label>Formularios Disponibles</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Los usuarios podrán seleccionar entre estos formularios
              </p>
              <div className="space-y-1">
                {forms.slice(0, 3).map((form) => (
                  <div key={form.id} className="flex items-center space-x-2 p-2 border rounded">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs">{form.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                key={`show-desc-${component.id}`}
                id="show-description"
                checked={config.showDescription || false}
                onCheckedChange={(checked) => updateComponentConfig(component.id, { showDescription: checked })}
              />
              <Label htmlFor="show-description" className="text-xs">Mostrar Descripción</Label>
            </div>
          </div>
        )}

        {component.type === "data-table" && (
          <div className="space-y-4">
            <div>
              <Label>Configuración de Columnas</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Configura las columnas que se mostrarán en la tabla
              </p>
              <div className="space-y-3 mt-2">
                {dataSources
                  .find((ds) => ds.id === config.dataSource)
                  ?.fields.map((field: string) => {
                    const columnConfig = (config.columnConfigs || []).find(
                      (col: any) => col.field === field
                    ) || { field, label: field, type: 'text', editable: false, visible: true }
                    
                    return (
                      <Card key={field} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                key={`visible-${field}-${component.id}`}
                                id={`visible-${field}`}
                                checked={columnConfig.visible !== false}
                                onCheckedChange={(checked) => {
                                  const configs = config.columnConfigs || []
                                  const otherConfigs = configs.filter((c: any) => c.field !== field)
                                  updateComponentConfig(component.id, { 
                                    columnConfigs: [...otherConfigs, { ...columnConfig, visible: checked }]
                                  })
                                }}
                              />
                              <Label htmlFor={`visible-${field}`} className="capitalize font-medium text-sm">
                                {field.replace("_", " ")}
                              </Label>
                            </div>
                          </div>
                          
                          {columnConfig.visible !== false && (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Tipo</Label>
                                  <Select
                                    key={`type-${field}-${component.id}`}
                                    value={columnConfig.type || 'text'}
                                    onValueChange={(value) => {
                                      const configs = config.columnConfigs || []
                                      const otherConfigs = configs.filter((c: any) => c.field !== field)
                                      updateComponentConfig(component.id, { 
                                        columnConfigs: [...otherConfigs, { ...columnConfig, type: value }]
                                      })
                                    }}
                                  >
                                    <SelectTrigger className="h-7 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Texto</SelectItem>
                                      <SelectItem value="number">Número</SelectItem>
                                      <SelectItem value="date">Fecha</SelectItem>
                                      <SelectItem value="dropdown">Dropdown</SelectItem>
                                      <SelectItem value="boolean">Booleano</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center space-x-2 pt-5">
                                  <Switch
                                    key={`editable-${field}-${component.id}`}
                                    id={`editable-${field}`}
                                    checked={columnConfig.editable || false}
                                    onCheckedChange={(checked) => {
                                      const configs = config.columnConfigs || []
                                      const otherConfigs = configs.filter((c: any) => c.field !== field)
                                      updateComponentConfig(component.id, { 
                                        columnConfigs: [...otherConfigs, { ...columnConfig, editable: checked }]
                                      })
                                    }}
                                  />
                                  <Label htmlFor={`editable-${field}`} className="text-xs">Editable</Label>
                                </div>
                              </div>

                              {columnConfig.type === 'dropdown' && (
                                <div>
                                  <Label className="text-xs">Opciones del Dropdown</Label>
                                  <div className="space-y-1 mt-1">
                                    {(columnConfig.options || []).map((opt: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-1">
                                        <Input 
                                          value={opt.label} 
                                          className="h-6 text-xs flex-1"
                                          placeholder="Etiqueta"
                                          onChange={(e) => {
                                            const configs = config.columnConfigs || []
                                            const otherConfigs = configs.filter((c: any) => c.field !== field)
                                            const newOptions = [...(columnConfig.options || [])]
                                            newOptions[idx] = { ...opt, label: e.target.value, value: e.target.value.toLowerCase() }
                                            updateComponentConfig(component.id, { 
                                              columnConfigs: [...otherConfigs, { ...columnConfig, options: newOptions }]
                                            })
                                          }}
                                        />
                                        <Select
                                          value={opt.color || 'gray'}
                                          onValueChange={(color) => {
                                            const configs = config.columnConfigs || []
                                            const otherConfigs = configs.filter((c: any) => c.field !== field)
                                            const newOptions = [...(columnConfig.options || [])]
                                            newOptions[idx] = { ...opt, color }
                                            updateComponentConfig(component.id, { 
                                              columnConfigs: [...otherConfigs, { ...columnConfig, options: newOptions }]
                                            })
                                          }}
                                        >
                                          <SelectTrigger className="h-6 w-20 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="gray">Gris</SelectItem>
                                            <SelectItem value="red">Rojo</SelectItem>
                                            <SelectItem value="yellow">Amarillo</SelectItem>
                                            <SelectItem value="green">Verde</SelectItem>
                                            <SelectItem value="blue">Azul</SelectItem>
                                            <SelectItem value="purple">Morado</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            const configs = config.columnConfigs || []
                                            const otherConfigs = configs.filter((c: any) => c.field !== field)
                                            const newOptions = (columnConfig.options || []).filter((_: any, i: number) => i !== idx)
                                            updateComponentConfig(component.id, { 
                                              columnConfigs: [...otherConfigs, { ...columnConfig, options: newOptions }]
                                            })
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-6 w-full text-xs"
                                      onClick={() => {
                                        const configs = config.columnConfigs || []
                                        const otherConfigs = configs.filter((c: any) => c.field !== field)
                                        const newOptions = [...(columnConfig.options || []), { value: '', label: '', color: 'gray' }]
                                        updateComponentConfig(component.id, { 
                                          columnConfigs: [...otherConfigs, { ...columnConfig, options: newOptions }]
                                        })
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Agregar Opción
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </Card>
                    )
                  })}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm">Opciones de Tabla</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  key={`allow-create-${component.id}`}
                  id="allow-create"
                  checked={config.allowCreate !== false}
                  onCheckedChange={(checked) => updateComponentConfig(component.id, { allowCreate: checked })}
                />
                <Label htmlFor="allow-create" className="text-xs">Permitir Crear</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  key={`allow-edit-${component.id}`}
                  id="allow-edit"
                  checked={config.allowEdit !== false}
                  onCheckedChange={(checked) => updateComponentConfig(component.id, { allowEdit: checked })}
                />
                <Label htmlFor="allow-edit" className="text-xs">Permitir Editar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  key={`allow-delete-${component.id}`}
                  id="allow-delete"
                  checked={config.allowDelete !== false}
                  onCheckedChange={(checked) => updateComponentConfig(component.id, { allowDelete: checked })}
                />
                <Label htmlFor="allow-delete" className="text-xs">Permitir Eliminar</Label>
              </div>
            </div>
          </div>
        )}

        {component.type === "stat-card" && (
          <>
            <div>
              <Label htmlFor="value-field">Campo de Valor</Label>
              <Select
                key={`value-field-${component.id}-${config.valueField}`}
                value={config.valueField || ""}
                onValueChange={(value) => updateComponentConfig(component.id, { valueField: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar campo" />
                </SelectTrigger>
                <SelectContent>
                  {dataSources
                    .find((ds) => ds.id === config.dataSource)
                    ?.fields.map((field: string) => (
                      <SelectItem key={field} value={field}>
                        {field.replace("_", " ")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                key={`show-trend-${component.id}`}
                id="show-trend"
                checked={config.showTrend || false}
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
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all bg-muted text-primary text-sm"
              href="/dashboard/solutions"
            >
              <Package className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Soluciones</span>
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
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleNavigation('/dashboard/solutions')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-lg flex items-center gap-2">
                    Constructor Avanzado de Soluciones
                    {hasUnsavedChanges && (
                      <Badge variant="destructive" className="text-xs">
                        Cambios sin guardar
                      </Badge>
                    )}
                  </h1>
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
              <Button variant="outline" size="sm" onClick={togglePreviewMode}>
                <Eye className="mr-2 h-4 w-4" />
                {previewMode ? "Editar" : "Vista Previa"}
              </Button>
              <Button size="sm" onClick={handleSave}>
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
                        <TabsList className="grid w-full grid-cols-5 gap-1">
                          <TabsTrigger value="all" className="text-xs px-1">
                            Todo
                          </TabsTrigger>
                          <TabsTrigger value="forms" className="text-xs px-1">
                            Forms
                          </TabsTrigger>
                          <TabsTrigger value="data" className="text-xs px-1">
                            Datos
                          </TabsTrigger>
                          <TabsTrigger value="charts" className="text-xs px-1">
                            Gráficos
                          </TabsTrigger>
                          <TabsTrigger value="metrics" className="text-xs px-1">
                            Otros
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

                        <TabsContent value="forms" className="mt-4">
                          <Droppable droppableId="component-palette-formularios">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {availableComponents
                                  .filter((comp) => comp.category === "formularios")
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

                        <TabsContent value="metrics" className="mt-4">
                          <Droppable droppableId="component-palette-metricas">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {availableComponents
                                  .filter((comp) => comp.category === "metricas" || comp.category === "notificaciones" || comp.category === "controles")
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
                                  {/* Drag Handle - specific area for dragging */}
                                  {!previewMode && (
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-move"
                                    >
                                      <div className="bg-primary/10 hover:bg-primary/20 rounded p-1">
                                        <GripVertical className="h-4 w-4 text-primary" />
                                      </div>
                                    </div>
                                  )}

                                  {/* Preview with resize handles inside */}
                                  <div key={`preview-${component.id}-${JSON.stringify(component.config)}`} className="h-full w-full relative">
                                    {renderComponentPreview(component)}
                                    
                                    {/* Resize handles - positioned on the preview */}
                                    {!previewMode && (
                                      <>
                                        <div
                                          className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-br"
                                          onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleResizeStart(component.id, e.clientX, e.clientY, component.size.width, component.size.height)
                                          }}
                                        />
                                        <div
                                          className="absolute top-1/2 right-0 w-2 h-8 -translate-y-1/2 bg-primary cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-l z-10"
                                          onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleResizeStart(component.id, e.clientX, e.clientY, component.size.width, component.size.height)
                                          }}
                                        />
                                        <div
                                          className="absolute bottom-0 left-1/2 h-2 w-8 -translate-x-1/2 bg-primary cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-t z-10"
                                          onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleResizeStart(component.id, e.clientX, e.clientY, component.size.width, component.size.height)
                                          }}
                                        />
                                      </>
                                    )}
                                  </div>

                                  {/* Controls - outside the preview but overlaid */}
                                  {!previewMode && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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

                        <TabsContent value="component" className="mt-4" key={selectedCanvasComponent}>
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
                                          {source.fields.slice(0, 3).map((field: string) => (
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
                            {selectedCanvasComponent && (() => {
                              const component = canvasComponents.find((comp) => comp.id === selectedCanvasComponent)
                              if (!component) return null
                              
                              return (
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                                  <div>
                                    <Label htmlFor="width">Ancho (columnas)</Label>
                                    <Select
                                      value={component.size.width.toString()}
                                      onValueChange={(val) => {
                                        setCanvasComponents(prev =>
                                          prev.map(c => c.id === component.id 
                                            ? { ...c, size: { ...c.size, width: parseInt(val) } }
                                            : c
                                          )
                                        )
                                        setHasUnsavedChanges(true)
                                      }}
                                    >
                                      <SelectTrigger id="width">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 (25%)</SelectItem>
                                        <SelectItem value="2">2 (50%)</SelectItem>
                                        <SelectItem value="3">3 (75%)</SelectItem>
                                        <SelectItem value="4">4 (100%)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="height">Alto (filas)</Label>
                                    <Input
                                      id="height"
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={component.size.height}
                                      onChange={(e) => {
                                        setCanvasComponents(prev =>
                                          prev.map(c => c.id === component.id 
                                            ? { ...c, size: { ...c.size, height: parseInt(e.target.value) || 1 } }
                                            : c
                                          )
                                        )
                                        setHasUnsavedChanges(true)
                                      }}
                                    />
                                  </div>
                                </div>
                              )
                            })()}

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

      {/* Unsaved Changes Dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Descartar cambios?</DialogTitle>
            <DialogDescription>
              Tienes cambios sin guardar. Si sales ahora, perderás estos cambios.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelNavigation}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmNavigation}>
              Descartar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
