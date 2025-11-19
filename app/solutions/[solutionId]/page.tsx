"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Loader2,
  Plus,
  Trash2,
  Save,
  X,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import type { ColumnConfiguration, DropdownOption } from "@/lib/types"
import { KanbanBoard } from "@/components/crm/kanban-board"
import { ContactCardList } from "@/components/crm/contact-card-list"
import { ActivityTimeline } from "@/components/crm/activity-timeline"
import { DealProgress } from "@/components/crm/deal-progress"

export default function SolutionPublicView({ params }: { params: Promise<{ solutionId: string }> }) {
  const router = useRouter()
  const [solutionId, setSolutionId] = useState<string | null>(null)
  const [solution, setSolution] = useState<any | null>(null)
  const [canvasComponents, setCanvasComponents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  // Unwrap params Promise
  useEffect(() => {
    params.then((p) => setSolutionId(p.solutionId))
  }, [params])

  // Check authentication and load solution
  useEffect(() => {
    if (!solutionId) return

    const checkAuthAndLoad = async () => {
      setIsLoading(true)
      try {
        // Check if user is logged in
        const userStr = localStorage.getItem("user")
        if (!userStr) {
          // Redirect to login
          router.push(`/login?redirect=/solutions/${solutionId}`)
          return
        }

        const user = JSON.parse(userStr)
        setUserId(user.id)

        // Load solution
        const response = await fetch(`/api/solutions/${solutionId}?includeComponents=true`)
        if (!response.ok) {
          throw new Error('Solution not found')
        }

        const solutionData = await response.json()
        setSolution(solutionData)
        setIsOwner(solutionData.user_id === user.id)

        // Load canvas configuration
        if (solutionData.configs?.canvas) {
          setCanvasComponents(solutionData.configs.canvas)
        }
      } catch (error) {
        console.error('Error loading solution:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar la solución",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLoad()
  }, [solutionId, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!solution) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/dashboard/solutions" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Volver a Soluciones</span>
          </Link>
        </header>
        <div className="container max-w-3xl mx-auto py-12 px-4 md:px-6">
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-500">Solución No Encontrada</CardTitle>
              <p className="text-muted-foreground">La solución que buscas no existe o no tienes acceso a ella.</p>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/solutions" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{solution.name}</h1>
          {solution.description && (
            <p className="text-sm text-muted-foreground">{solution.description}</p>
          )}
        </div>
        {isOwner && (
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <Link href={`/dashboard/solutions/builder/advanced?id=${solutionId}`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Diseño
            </Link>
          </Button>
        )}
      </header>

      {/* Canvas Content */}
      <main className="flex-1 p-6">
        <div className={`${
          canvasComponents.length > 0 ? "grid grid-cols-4 gap-4" : "flex items-center justify-center min-h-[400px]"
        }`}>
          {canvasComponents.length > 0 ? (
            canvasComponents.map((component) => (
              <div
                key={component.id}
                style={{
                  gridColumn: `span ${component.size.width}`,
                  gridRow: `span ${component.size.height}`,
                }}
              >
                <ComponentRenderer component={component} userId={userId} />
              </div>
            ))
          ) : (
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Esta solución aún no tiene componentes configurados.
                  </p>
                  {isOwner && (
                    <Button asChild>
                      <Link href={`/dashboard/solutions/builder/advanced?id=${solutionId}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Configurar Solución
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

// Component Renderer - renders each component with real data and interactions
function ComponentRenderer({ component, userId }: { component: any; userId: number | null }) {
  const config = component.config || {}

  switch (component.type) {
    case "stat-card":
      return <StatCardComponent config={config} />
    case "data-table":
      return <DataTableComponent config={config} userId={userId} />
    case "form-embed":
      return <FormEmbedComponent config={config} userId={userId} />
    case "quick-input":
      return <QuickInputComponent config={config} userId={userId} />
    case "data-entry-form":
      return <DataEntryFormComponent config={config} userId={userId} />
    case "chart-bar":
    case "chart-pie":
    case "chart-line":
      return <ChartPlaceholderComponent config={config} type={component.type} />
    // CRM Components
    case "kanban-board":
      return <KanbanBoard tableId={config.tableId} config={config} />
    case "contact-card-list":
      return <ContactCardList tableId={config.tableId} config={config} />
    case "activity-timeline":
      return <ActivityTimeline tableId={config.tableId} config={config} />
    case "deal-progress":
      return <DealProgress dealId={config.dealId} tableId={config.tableId} config={config} />
    default:
      return <GenericComponentPlaceholder config={config} type={component.type} />
  }
}

// Stat Card Component - displays metrics from data
function StatCardComponent({ config }: { config: any }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!config.tableId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/business-data?virtual_table_schema_id=${config.tableId}`)
        if (response.ok) {
          const records = await response.json()
          setData({ count: records.length })
        }
      } catch (error) {
        console.error('Error fetching stat data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [config.tableId])

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{config.title || "Métrica"}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <div className="text-2xl font-bold">{data?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Total de registros</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Data Table Component - interactive table with CRUD operations
function DataTableComponent({ config, userId }: { config: any; userId: number | null }) {
  const [data, setData] = useState<any[]>([])
  const [fields, setFields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editedData, setEditedData] = useState<any>({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newRowData, setNewRowData] = useState<any>({})

  const columnConfigs: ColumnConfiguration[] = config.columnConfigs || []
  // Filter columns: include columns that don't have visible=false
  // This includes columns with visible=true and columns without a visible property
  const visibleColumns = columnConfigs.filter(col => col.visible !== false)
  
  // Fallback: if no columnConfigs are provided, create columns from fetched fields
  const fallbackColumns =
    fields.map((field: any) => ({
      field: field.name,
      label: field.properties?.label || field.name,
      type: field.type || 'text',
      editable: false,
      visible: true,
      options: field.properties?.options || [],
    }))
  
  // Use fallback columns only if no visible columns are configured
  const usingFallbackColumns = visibleColumns.length === 0 && fallbackColumns.length > 0
  const displayColumns = usingFallbackColumns ? fallbackColumns : visibleColumns
  
  const visibleColumnFields = visibleColumns.map(col => col.field).join(',')

  useEffect(() => {
    console.group(`[DataTableComponent] ${config.title || 'Table'}`)
    console.log('tableId:', config.tableId)
    console.log('columnConfigs:', columnConfigs)
    console.log('visibleColumns:', visibleColumns)
    console.log('fields:', fields)
    console.log('fallbackColumns:', fallbackColumns)
    console.log('usingFallbackColumns:', usingFallbackColumns)
    console.log('displayColumns:', displayColumns)
    console.log('displayColumns.length:', displayColumns.length)
    console.groupEnd()
  }, [config.title, config.tableId, columnConfigs, visibleColumns, fields, fallbackColumns, usingFallbackColumns, displayColumns])

  useEffect(() => {
    fetchData()
    fetchFields()
  }, [config.tableId])

  const fetchData = async () => {
    if (!config.tableId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/business-data?virtual_table_schema_id=${config.tableId}`)
      if (response.ok) {
        const records = await response.json()
        setData(records)
        console.info('[DataTableComponent] Data fetched', {
          tableId: config.tableId,
          count: records.length,
        })
      }
    } catch (error) {
      console.error('Error fetching table data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFields = async () => {
    if (!config.tableId) return

    try {
      const response = await fetch(`/api/virtual-field-schemas?virtual_table_schema_id=${config.tableId}`)
      if (response.ok) {
        const fieldsData = await response.json()
        setFields(fieldsData)
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    }
  }

  const handleEdit = (row: any) => {
    setEditingRow(row.id)
    setEditedData(row.data_json)
  }

  const handleSave = async (rowId: number) => {
    try {
      const response = await fetch(`/api/business-data/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_json: editedData }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Registro actualizado correctamente",
        })
        fetchData()
        setEditingRow(null)
      }
    } catch (error) {
      console.error('Error updating row:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (rowId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return

    try {
      const response = await fetch(`/api/business-data/${rowId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Registro eliminado correctamente",
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting row:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      })
    }
  }

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/business-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          virtual_table_schema_id: config.tableId,
          data_json: newRowData,
        }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Registro creado correctamente",
        })
        fetchData()
        setShowAddDialog(false)
        setNewRowData({})
      }
    } catch (error) {
      console.error('Error creating row:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el registro",
        variant: "destructive",
      })
    }
  }

  const renderCell = (row: any, column: ColumnConfiguration) => {
    const value = row.data_json?.[column.field]
    const isEditing = editingRow === row.id && column.editable

    if (isEditing) {
      if (column.type === 'dropdown' && column.options) {
        return (
          <Select
            value={editedData[column.field] || value}
            onValueChange={(val) => setEditedData({ ...editedData, [column.field]: val })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {column.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
      return (
        <Input
          value={editedData[column.field] ?? value ?? ''}
          onChange={(e) => setEditedData({ ...editedData, [column.field]: e.target.value })}
          className="h-8"
        />
      )
    }

    // Display value
    if (column.type === 'dropdown' && column.options) {
      const option = column.options.find(opt => opt.value === value)
      if (option) {
        const colorMap: Record<string, string> = {
          red: 'bg-red-100 text-red-800',
          yellow: 'bg-yellow-100 text-yellow-800',
          green: 'bg-green-100 text-green-800',
          blue: 'bg-blue-100 text-blue-800',
          purple: 'bg-purple-100 text-purple-800',
          gray: 'bg-gray-100 text-gray-800',
        }
        return (
          <Badge className={colorMap[option.color || 'gray']}>
            {option.label}
          </Badge>
        )
      }
    }

    return <span>{value ?? '-'}</span>
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  // Show a message if no columns are configured
  if (displayColumns.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">{config.title || "Tabla de Datos"}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">⚠️ No hay columnas configuradas</p>
            <p className="text-xs">Esperando configuración de columnas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">{config.title || "Tabla de Datos"}</CardTitle>
          {config.allowCreate !== false && (
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Nuevo
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  {displayColumns.map((col) => (
                    <TableHead key={col.field}>{col.label}</TableHead>
                  ))}
                  {(config.allowEdit !== false || config.allowDelete !== false) && (
                    <TableHead>Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={displayColumns.length + 1} className="text-center text-muted-foreground">
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id}>
                      {displayColumns.map((col) => (
                        <TableCell key={col.field}>
                          {renderCell(row, col)}
                        </TableCell>
                      ))}
                      {(config.allowEdit !== false || config.allowDelete !== false) && (
                        <TableCell>
                          <div className="flex gap-1">
                            {config.allowEdit !== false && (
                              editingRow === row.id ? (
                                <>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleSave(row.id)}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingRow(null)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(row)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )
                            )}
                            {config.allowDelete !== false && (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDelete(row.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Registro</DialogTitle>
            <DialogDescription>Completa los campos para crear un nuevo registro</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {displayColumns.map((col) => (
              <div key={col.field}>
                <Label>{col.label}</Label>
                {col.type === 'dropdown' && col.options ? (
                  <Select
                    value={newRowData[col.field] || ''}
                    onValueChange={(val) => setNewRowData({ ...newRowData, [col.field]: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {col.options.map((opt: DropdownOption) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={newRowData[col.field] || ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [col.field]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Form Embed Component - renders a form that submits to BusinessData
function FormEmbedComponent({ config, userId }: { config: any; userId: number | null }) {
  const [form, setForm] = useState<any | null>(null)
  const [fields, setFields] = useState<any[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchForm = async () => {
      if (!config.formId) {
        setLoading(false)
        return
      }

      try {
        const [formRes, fieldsRes] = await Promise.all([
          fetch(`/api/forms/${config.formId}`),
          fetch(`/api/form-fields?form_id=${config.formId}`),
        ])

        if (formRes.ok) {
          setForm(await formRes.json())
        }
        if (fieldsRes.ok) {
          const fieldsData = await fieldsRes.json()
          setFields(fieldsData || [])
        }
      } catch (error) {
        console.error('Error fetching form:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [config.formId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Submit directly to BusinessData if tableId is configured
      if (config.tableId) {
        const response = await fetch('/api/business-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            virtual_table_schema_id: config.tableId,
            data_json: formData,
          }),
        })

        if (response.ok) {
          setSubmitted(true)
          setFormData({})
          toast({
            title: "Éxito",
            description: config.successMessage || "¡Datos guardados exitosamente!",
          })
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "No se pudo enviar el formulario",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!form) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Formulario no configurado</p>
        </CardContent>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-center">
          <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-medium">{config.successMessage || "¡Gracias!"}</p>
          <Button size="sm" className="mt-4" onClick={() => setSubmitted(false)}>
            Enviar otro
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">{config.title || form.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((field) => (
            <div key={field.id}>
              <Label className="text-xs">{field.label}</Label>
              <Input
                value={formData[field.label] || ''}
                onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                placeholder={field.configs?.placeholder}
                className="h-8"
              />
            </div>
          ))}
          <Button type="submit" className="w-full h-8" disabled={submitting}>
            {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : config.submitButtonText || "Enviar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Quick Input Component - rapid single-row data entry
function QuickInputComponent({ config, userId }: { config: any; userId: number | null }) {
  const [inputValue, setInputValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!inputValue.trim() || !config.tableId) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/business-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          virtual_table_schema_id: config.tableId,
          data_json: { value: inputValue },
        }),
      })

      if (response.ok) {
        setInputValue('')
        toast({
          title: "Éxito",
          description: "Registro agregado",
        })
      }
    } catch (error) {
      console.error('Error adding record:', error)
      toast({
        title: "Error",
        description: "No se pudo agregar el registro",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">{config.title || "Entrada Rápida"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Agregar..."
            className="h-8"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button size="sm" className="h-8" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Data Entry Form Component - multi-field form for data entry
function DataEntryFormComponent({ config, userId }: { config: any; userId: number | null }) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [fields, setFields] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchFields = async () => {
      if (!config.tableId) return

      try {
        const response = await fetch(`/api/virtual-field-schemas?virtual_table_schema_id=${config.tableId}`)
        if (response.ok) {
          const fieldsData = await response.json()
          setFields(fieldsData.slice(0, 4)) // Limit to 4 fields
        }
      } catch (error) {
        console.error('Error fetching fields:', error)
      }
    }

    fetchFields()
  }, [config.tableId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/business-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          virtual_table_schema_id: config.tableId,
          data_json: formData,
        }),
      })

      if (response.ok) {
        setFormData({})
        toast({
          title: "Éxito",
          description: "Registro creado correctamente",
        })
      }
    } catch (error) {
      console.error('Error creating record:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el registro",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">{config.title || "Nuevo Registro"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {fields.map((field) => (
              <div key={field.id}>
                <Label className="text-xs">{field.name}</Label>
                <Input
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="h-8"
                />
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full h-8" disabled={submitting}>
            {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : config.submitButtonText || "Guardar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Chart Placeholder Component
function ChartPlaceholderComponent({ config, type }: { config: any; type: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">{config.title || "Gráfico"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 bg-muted rounded flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Gráfico - {type}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Generic Component Placeholder
function GenericComponentPlaceholder({ config, type }: { config: any; type: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">{config.title || type}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">Componente: {type}</p>
      </CardContent>
    </Card>
  )
}

