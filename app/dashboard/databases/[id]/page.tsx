"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Database, 
  Plus, 
  Settings, 
  Edit, 
  Trash, 
  Eye,
  Save,
  MoreHorizontal,
  Type,
  Hash,
  Mail,
  Check,
  Calendar,
  Key,
  Braces,
  FileText
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface VirtualFieldSchema {
  id: number
  name: string
  type: string
  properties: any
}

interface VirtualTableSchema {
  id: number
  name: string
  description: string
  configs: any
  fields: VirtualFieldSchema[]
}

interface VirtualSchema {
  id: number
  name: string
  description: string
  configs: any
  tables: VirtualTableSchema[]
}

export default function DatabasePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [database, setDatabase] = useState<VirtualSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [editedName, setEditedName] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  
  // Sidebar resize state
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // State for adding/editing tables and fields
  const [showAddTableDialog, setShowAddTableDialog] = useState(false)
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false)
  const [showEditTableDialog, setShowEditTableDialog] = useState(false)
  const [showEditFieldDialog, setShowEditFieldDialog] = useState(false)
  const [selectedFieldForEdit, setSelectedFieldForEdit] = useState<VirtualFieldSchema | null>(null)
  const [selectedTableForEdit, setSelectedTableForEdit] = useState<VirtualTableSchema | null>(null)
  
  // Form state for new table
  const [newTable, setNewTable] = useState({
    name: "",
    description: ""
  })
  
  // Form state for new field
  const [newField, setNewField] = useState({
    name: "",
    type: "text",
    required: false,
    unique: false,
    description: ""
  })

  // Business data state
  const [businessData, setBusinessData] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [selectedTable, setSelectedTable] = useState<VirtualTableSchema | null>(null)
  const [showDataDialog, setShowDataDialog] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [recordFormData, setRecordFormData] = useState<Record<string, any>>({})
  const [showDeleteDatabaseDialog, setShowDeleteDatabaseDialog] = useState(false)
  const [isDeletingDatabase, setIsDeletingDatabase] = useState(false)
  const [deleteDatabaseError, setDeleteDatabaseError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchDatabase(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (database) {
      setEditedName(database.name)
      setEditedDescription(database.description || "")
    }
  }, [database])

  useEffect(() => {
    if (database) {
      const nameChanged = editedName !== database.name
      const descriptionChanged = editedDescription !== (database.description || "")
      setHasUnsavedChanges(nameChanged || descriptionChanged)
    }
  }, [editedName, editedDescription, database])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const fetchDatabase = async (id: string) => {
    try {
      setLoading(true)
      console.log('Fetching database with ID:', id) // Debug log
      
      // Use the dedicated tree endpoint to get schema with nested tables and fields
      const response = await fetch(`/api/virtual-schemas/${id}/tree`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response not ok:', response.status, errorText) // Debug log
        throw new Error(`Failed to fetch database: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Fetched database data:', data) // Debug log
      console.log('Tables count:', data.tables?.length || 0) // Debug log
      console.log('Total fields count:', data.tables?.reduce((acc: number, table: any) => acc + (table.fields?.length || 0), 0) || 0) // Debug log
      
      setDatabase(data)
      
      // Set the first table as selected for data tab
      if (data.tables && data.tables.length > 0) {
        setSelectedTable(data.tables[0])
      }
    } catch (err) {
      console.error('Error fetching database:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const fetchBusinessData = async (tableId: number) => {
    try {
      setLoadingData(true)
      console.log('🔍 Fetching business data for table ID:', tableId)
      
      // Fetch data filtered by table ID
      const response = await fetch(`/api/business-data?virtual_table_schema_id=${tableId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch business data')
      }
      
      const tableData = await response.json()
      console.log('📊 Business data received:', tableData)
      console.log('📊 Number of records:', tableData.length)
      
      setBusinessData(tableData)
    } catch (error) {
      console.error('❌ Error fetching business data:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (selectedTable && activeTab === 'data') {
      fetchBusinessData(selectedTable.id)
    }
  }, [selectedTable, activeTab])

  // Sidebar resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = e.clientX
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  // CRUD functions for tables
  const createTable = async () => {
    if (!database || !newTable.name.trim()) return
    
    try {
      const response = await fetch('/api/virtual-table-schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTable.name,
          virtual_schema_id: database.id,
          configs: {
            description: newTable.description,
            fields_count: 0,
            created_via: 'database_builder'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create table')
      }

      const createdTable = await response.json()
      
      // Refresh database data
      await fetchDatabase(params.id as string)
      
      // Reset form and close dialog
      setNewTable({ name: "", description: "" })
      setShowAddTableDialog(false)
      
      toast({
        title: "Tabla creada",
        description: `La tabla "${newTable.name}" ha sido creada exitosamente`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la tabla",
        variant: "destructive",
      })
    }
  }

  const updateTable = async (tableId: number, updates: Partial<VirtualTableSchema>) => {
    if (!database) return
    
    try {
      const response = await fetch(`/api/virtual-table-schemas/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update table')
      }

      // Refresh database data
      await fetchDatabase(params.id as string)
      
      setShowEditTableDialog(false)
      setSelectedTableForEdit(null)
      
      toast({
        title: "Tabla actualizada",
        description: "La tabla ha sido actualizada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la tabla",
        variant: "destructive",
      })
    }
  }

  const deleteTable = async (tableId: number) => {
    if (!database) return
    
    try {
      const response = await fetch(`/api/virtual-table-schemas/${tableId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete table')
      }

      // Refresh database data
      await fetchDatabase(params.id as string)
      
      toast({
        title: "Tabla eliminada",
        description: "La tabla ha sido eliminada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tabla",
        variant: "destructive",
      })
    }
  }

  // CRUD functions for fields
  const createField = async () => {
    if (!selectedTable || !newField.name.trim()) return
    
    try {
      const response = await fetch('/api/virtual-field-schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newField.name,
          type: newField.type,
          virtual_table_schema_id: selectedTable.id,
          properties: {
            required: newField.required,
            unique: newField.unique,
            description: newField.description,
            created_via: 'database_builder'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create field')
      }

      // Refresh database data
      await fetchDatabase(params.id as string)
      
      // Reset form and close dialog
      setNewField({
        name: "",
        type: "text",
        required: false,
        unique: false,
        description: ""
      })
      setShowAddFieldDialog(false)
      setSelectedTable(null)
      
      toast({
        title: "Campo creado",
        description: `El campo "${newField.name}" ha sido creado exitosamente`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el campo",
        variant: "destructive",
      })
    }
  }

  const updateField = async (fieldId: number, updates: Partial<VirtualFieldSchema>) => {
    if (!database) return
    
    try {
      const response = await fetch(`/api/virtual-field-schemas/${fieldId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update field')
      }

      // Refresh database data
      await fetchDatabase(params.id as string)
      
      setShowEditFieldDialog(false)
      setSelectedFieldForEdit(null)
      
      toast({
        title: "Campo actualizado",
        description: "El campo ha sido actualizado exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el campo",
        variant: "destructive",
      })
    }
  }

  const deleteField = async (fieldId: number) => {
    if (!database) return
    
    try {
      const response = await fetch(`/api/virtual-field-schemas/${fieldId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete field')
      }

      // Refresh database data
      await fetchDatabase(params.id as string)
      
      toast({
        title: "Campo eliminado",
        description: "El campo ha sido eliminado exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el campo",
        variant: "destructive",
      })
    }
  }

  // Save database metadata
  const saveDatabase = async () => {
    if (!database) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/virtual-schemas/${database.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedName,
          description: editedDescription,
          configs: database.configs
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update database')
      }

      // Update local state
      setDatabase({
        ...database,
        name: editedName,
        description: editedDescription
      })
      
      setHasUnsavedChanges(false)
      
      toast({
        title: "Cambios guardados",
        description: "La base de datos ha sido actualizada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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

  // Delete entire database
  const deleteDatabase = async () => {
    if (!database) return
    
    try {
      setIsDeletingDatabase(true)
      setDeleteDatabaseError(null)
      const response = await fetch(`/api/virtual-schemas/${database.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to delete database')
      }

      toast({
        title: "Base de datos eliminada",
        description: `La base de datos "${database.name}" ha sido eliminada exitosamente`,
      })
      
      setShowDeleteDatabaseDialog(false)
      // Redirect to databases list
      router.push('/dashboard/databases')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar la base de datos'
      setDeleteDatabaseError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsDeletingDatabase(false)
    }
  }

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />
      case 'number':
        return <Hash className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'boolean':
        return <Check className="h-4 w-4" />
      case 'datetime':
      case 'date':
        return <Calendar className="h-4 w-4" />
      case 'id':
        return <Key className="h-4 w-4" />
      case 'json':
        return <Braces className="h-4 w-4" />
      case 'file':
        return <FileText className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  const dataTypes = [
    { value: "text", label: "Texto" },
    { value: "number", label: "Número" },
    { value: "email", label: "Email" },
    { value: "boolean", label: "Sí/No" },
    { value: "datetime", label: "Fecha y Hora" },
    { value: "date", label: "Fecha" },
    { value: "id", label: "ID" },
    { value: "file", label: "Archivo" },
    { value: "url", label: "URL" },
    { value: "phone", label: "Teléfono" },
    { value: "select", label: "Lista Desplegable" },
  ]

  // Business data CRUD operations
  const openDataDialog = (record: any = null) => {
    if (record) {
      setEditingRecord(record)
      setRecordFormData(record.data_json || {})
    } else {
      setEditingRecord(null)
      // Initialize form with default values for each field
      const initialData: Record<string, any> = {}
      selectedTable?.fields?.forEach((field) => {
        if (field.type === 'boolean') {
          initialData[field.name] = false
        } else if (field.type === 'number') {
          initialData[field.name] = 0
        } else {
          initialData[field.name] = ''
        }
      })
      setRecordFormData(initialData)
    }
    setShowDataDialog(true)
  }

  const saveBusinessData = async () => {
    if (!selectedTable) return
    
    try {
      const url = editingRecord 
        ? `/api/business-data/${editingRecord.id}` 
        : '/api/business-data'
      
      const method = editingRecord ? 'PUT' : 'POST'
      
      const body = editingRecord
        ? { data_json: recordFormData }
        : {
            user_id: 1, // TODO: Get from auth context
            virtual_table_schema_id: selectedTable.id,
            data_json: recordFormData
          }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editingRecord ? 'update' : 'create'} record`)
      }

      toast({
        title: editingRecord ? "Registro actualizado" : "Registro creado",
        description: `El registro ha sido ${editingRecord ? 'actualizado' : 'creado'} exitosamente`,
      })
      
      setShowDataDialog(false)
      setEditingRecord(null)
      setRecordFormData({})
      
      // Refresh data
      fetchBusinessData(selectedTable.id)
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${editingRecord ? 'actualizar' : 'crear'} el registro`,
        variant: "destructive",
      })
    }
  }

  const deleteBusinessData = async (recordId: number) => {
    try {
      const response = await fetch(`/api/business-data/${recordId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete record')
      }

      toast({
        title: "Registro eliminado",
        description: "El registro ha sido eliminado exitosamente",
      })
      
      // Refresh data
      if (selectedTable) {
        fetchBusinessData(selectedTable.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/dashboard/databases" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Volver a Bases de Datos</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando base de datos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !database) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/dashboard/databases" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Volver a Bases de Datos</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {error || 'Base de datos no encontrada'}</p>
            <Link href="/dashboard/databases">
              <Button>Volver a Bases de Datos</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <button 
          onClick={() => handleNavigation('/dashboard/databases')}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Bases de Datos</span>
        </button>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link className="text-sm font-medium" href="/dashboard">
            Panel
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/forms">
            Formularios
          </Link>
          <Link className="text-sm font-medium text-primary" href="/dashboard/databases">
            Bases de Datos
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/workflows">
            Flujos de Trabajo
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Vista Previa
          </Button>
          <Button 
            size="sm"
            onClick={saveDatabase}
            disabled={!hasUnsavedChanges || isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside 
          ref={sidebarRef}
          className="flex-col border-r bg-muted/40 md:flex overflow-auto relative"
          style={{ width: `${sidebarWidth}px`, minWidth: '200px', maxWidth: '500px' }}
        >
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2 text-sm">Tablas</h2>
            <div className="space-y-2">
              {database.tables?.map((table) => (
                <div
                  key={table.id}
                  className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Database className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{table.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTableForEdit(table)
                          setShowEditTableDialog(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteTable(table.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowAddTableDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Tabla
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <h2 className="font-semibold mb-2 text-sm">Configuración de la Base de Datos</h2>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="db-name" className="text-xs">Nombre de la Base de Datos</Label>
                <Input 
                  id="db-name" 
                  value={editedName} 
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="db-description" className="text-xs">Descripción</Label>
                <Textarea
                  id="db-description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <h3 className="font-medium mb-2 text-sm">Formularios Conectados</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="w-full" disabled={true}>
                  <Plus className="h-4 w-4 mr-2" />
                  Conectar Nuevo Formulario (Próximamente)
                </Button>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Próximamente
                </Badge>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Resize Handle */}
        <div
          className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors relative group"
          onMouseDown={(e) => {
            e.preventDefault()
            setIsResizing(true)
          }}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/10" />
        </div>

        <main className="flex flex-1 flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="border-b">
              <div className="flex items-center px-4 py-2">
                <h1 className="text-lg font-medium">{database.name}</h1>
                <div className="ml-auto flex items-center gap-2">
                  <TabsList>
                    <TabsTrigger value="overview">Vista General</TabsTrigger>
                    <TabsTrigger value="structure">Estructura</TabsTrigger>
                    <TabsTrigger value="data">Datos</TabsTrigger>
                    <TabsTrigger value="relations">Relaciones</TabsTrigger>
                  </TabsList>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setDeleteDatabaseError(null)
                      setShowDeleteDatabaseDialog(true)
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar Base de Datos
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="overview" className="flex-1 p-4">
              <div className="mx-auto max-w-[900px]">
                <Card>
                  <CardHeader>
                    <CardTitle>Vista General de la Base de Datos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{database.tables?.length || 0}</div>
                        <div className="text-sm text-muted-foreground">Tablas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {database.tables?.reduce((total, table) => total + (table.fields?.length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Campos Totales</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {database.configs?.created_via === 'database_builder' ? 'Sí' : 'No'}
                        </div>
                        <div className="text-sm text-muted-foreground">Creada con Constructor</div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Tablas Disponibles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {database.tables?.map((table) => (
                          <Card key={table.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{table.name}</h4>
                              <Badge variant="outline">{table.fields?.length || 0} campos</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {table.description || 'Sin descripción'}
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTable(table)
                                  setActiveTab("structure")
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                              <Button 
                                variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTableForEdit(table)
                                setShowEditTableDialog(true)
                              }}
                            >
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="structure" className="flex-1 p-4">
              <div className="mx-auto max-w-[900px]">
                <Card>
                  <CardHeader>
                    <CardTitle>Estructura de la Base de Datos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {database.tables?.map((table) => (
                      <div key={table.id} className="mb-6 last:mb-0">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium">{table.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{table.fields?.length || 0} campos</Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTable(table)
                                setShowAddFieldDialog(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Campo
                            </Button>
                          </div>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[180px]">Nombre</TableHead>
                              <TableHead className="w-[120px]">Tipo</TableHead>
                              <TableHead className="w-[100px]">Requerido</TableHead>
                              <TableHead className="w-[100px]">Único</TableHead>
                              <TableHead>Descripción</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {table.fields?.map((field) => (
                              <TableRow key={field.id}>
                                <TableCell className="font-medium">
                                  {field.properties?.is_primary && <Key className="h-3 w-3 inline mr-1 text-amber-500" />}
                                  {field.name}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {getDataTypeIcon(field.type)}
                                    <span className="capitalize">{field.type}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {field.properties?.required ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {field.properties?.unique ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>{field.properties?.description || 'Sin descripción'}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedFieldForEdit(field)
                                          setShowEditFieldDialog(true)
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={() => deleteField(field.id)}
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Eliminar
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="data" className="flex-1 p-4">
              <div className="mx-auto max-w-full">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>Datos de la Base de Datos</CardTitle>
                      {selectedTable && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Tabla: {selectedTable.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {database?.tables && database.tables.length > 1 && (
                        <Select
                          value={selectedTable?.id.toString()}
                          onValueChange={(value) => {
                            const table = database.tables?.find(t => t.id === parseInt(value))
                            if (table) setSelectedTable(table)
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Seleccionar tabla" />
                          </SelectTrigger>
                          <SelectContent>
                            {database.tables.map((table) => (
                              <SelectItem key={table.id} value={table.id.toString()}>
                                {table.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button 
                        size="sm"
                        onClick={() => openDataDialog()}
                        disabled={!selectedTable || !selectedTable.fields || selectedTable.fields.length === 0}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Registro
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!selectedTable || !selectedTable.fields || selectedTable.fields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Esta tabla no tiene campos definidos</p>
                        <p className="text-sm">Agrega campos a la tabla para comenzar a almacenar datos</p>
                      </div>
                    ) : loadingData ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Cargando datos...</p>
                      </div>
                    ) : businessData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay registros en esta tabla</p>
                        <p className="text-sm">Agrega tu primer registro para comenzar</p>
                        <Button 
                          className="mt-4"
                          onClick={() => openDataDialog()}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Primer Registro
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">ID</TableHead>
                              <TableHead className="w-[180px]">Created At</TableHead>
                              {selectedTable.fields
                                .filter((field) => field.name.toLowerCase() !== 'id' && field.name.toLowerCase() !== 'created at' && field.name.toLowerCase() !== 'created_at')
                                .map((field) => (
                                  <TableHead key={field.id}>{field.name}</TableHead>
                                ))}
                              <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {businessData.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell className="font-mono text-sm">{record.id}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(record.creation_date).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </TableCell>
                                {selectedTable.fields
                                  ?.filter((field) => field.name.toLowerCase() !== 'id' && field.name.toLowerCase() !== 'created at' && field.name.toLowerCase() !== 'created_at')
                                  .map((field) => (
                                    <TableCell key={field.id}>
                                      {field.type === 'boolean' 
                                        ? (record.data_json[field.name] ? '✓' : '✗')
                                        : record.data_json[field.name]?.toString() || '-'
                                      }
                                    </TableCell>
                                  ))}
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openDataDialog(record)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={() => {
                                          if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                                            deleteBusinessData(record.id)
                                          }
                                        }}
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Eliminar
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="relations" className="flex-1 p-4">
              <div className="mx-auto max-w-[900px]">
                <Card>
                  <CardHeader>
                    <CardTitle>Relaciones de la Base de Datos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Las relaciones entre tablas se mostrarán aquí</p>
                      <p className="text-sm">cuando se implemente la funcionalidad de relaciones</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Add Table Dialog */}
      <Dialog open={showAddTableDialog} onOpenChange={setShowAddTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Tabla</DialogTitle>
            <DialogDescription>Crea una nueva tabla para tu base de datos.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="table-name">Nombre de la Tabla</Label>
              <Input
                id="table-name"
                value={newTable.name}
                onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                placeholder="ej. Productos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-description">Descripción (Opcional)</Label>
              <Textarea
                id="table-description"
                value={newTable.description}
                onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                placeholder="¿Qué tipo de datos almacenará esta tabla?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTableDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createTable} disabled={!newTable.name.trim()}>
              Agregar Tabla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={showEditTableDialog} onOpenChange={setShowEditTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tabla</DialogTitle>
            <DialogDescription>Modifica la información de la tabla.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-table-name">Nombre de la Tabla</Label>
              <Input
                id="edit-table-name"
                value={selectedTableForEdit?.name || ""}
                onChange={(e) => setSelectedTableForEdit(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="ej. Productos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-table-description">Descripción</Label>
              <Textarea
                id="edit-table-description"
                value={selectedTableForEdit?.description || ""}
                onChange={(e) => setSelectedTableForEdit(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="¿Qué tipo de datos almacenará esta tabla?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTableDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedTableForEdit && updateTable(selectedTableForEdit.id, selectedTableForEdit)}
              disabled={!selectedTableForEdit?.name?.trim()}
            >
              Actualizar Tabla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Field Dialog */}
      <Dialog open={showAddFieldDialog} onOpenChange={setShowAddFieldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Campo</DialogTitle>
            <DialogDescription>Define las propiedades para tu nuevo campo de base de datos.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">Nombre del Campo</Label>
                <Input
                  id="field-name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  placeholder="ej. direccion_email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-type">Tipo de Dato</Label>
                <Select value={newField.type} onValueChange={(value) => setNewField({ ...newField, type: value })}>
                  <SelectTrigger id="field-type">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-description">Descripción (Opcional)</Label>
              <Textarea
                id="field-description"
                value={newField.description}
                onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                placeholder="¿Para qué se usa este campo?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-required"
                  checked={newField.required}
                  onCheckedChange={(checked) => setNewField({ ...newField, required: checked === true })}
                />
                <Label htmlFor="field-required">Campo Requerido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-unique"
                  checked={newField.unique}
                  onCheckedChange={(checked) => setNewField({ ...newField, unique: checked === true })}
                />
                <Label htmlFor="field-unique">Solo Valores Únicos</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFieldDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createField} disabled={!newField.name.trim()}>
              Agregar Campo
            </Button>
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

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa: {database?.name}</DialogTitle>
            <DialogDescription>
              Previsualización de la estructura de datos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {database?.tables?.map((table) => (
              <div key={table.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">{table.name}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {table.fields?.map((field) => (
                        <TableHead key={field.id}>{field.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {table.fields?.map((field) => (
                        <TableCell key={field.id} className="text-muted-foreground">
                          {field.type === 'text' && 'Texto de ejemplo'}
                          {field.type === 'number' && '123'}
                          {field.type === 'email' && 'ejemplo@email.com'}
                          {field.type === 'boolean' && 'Sí'}
                          {field.type === 'datetime' && '2024-01-01 12:00'}
                          {field.type === 'date' && '2024-01-01'}
                          {field.type === 'id' && '1'}
                          {!['text', 'number', 'email', 'boolean', 'datetime', 'date', 'id'].includes(field.type) && '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Record Dialog */}
      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Editar Registro' : 'Agregar Nuevo Registro'}</DialogTitle>
            <DialogDescription>
              {editingRecord 
                ? 'Modifica los valores del registro' 
                : 'Completa los campos para crear un nuevo registro'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedTable?.fields
              ?.filter((field) => {
                const fieldName = field.name.toLowerCase()
                return fieldName !== 'id' && 
                       fieldName !== 'created_at' && 
                       fieldName !== 'created at' &&
                       fieldName !== 'createdat'
              })
              .map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={`field-${field.id}`}>
                  {field.name}
                  {field.properties?.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.type === 'boolean' ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={recordFormData[field.name] || false}
                      onCheckedChange={(checked) => 
                        setRecordFormData({ ...recordFormData, [field.name]: checked })
                      }
                    />
                    <Label htmlFor={`field-${field.id}`} className="text-sm font-normal">
                      {field.properties?.description || field.name}
                    </Label>
                  </div>
                ) : field.type === 'number' ? (
                  <Input
                    id={`field-${field.id}`}
                    type="number"
                    value={recordFormData[field.name] || ''}
                    onChange={(e) => 
                      setRecordFormData({ ...recordFormData, [field.name]: parseFloat(e.target.value) || 0 })
                    }
                    placeholder={field.properties?.description || `Ingrese ${field.name}`}
                  />
                ) : field.type === 'datetime' ? (
                  <Input
                    id={`field-${field.id}`}
                    type="datetime-local"
                    value={recordFormData[field.name] || ''}
                    onChange={(e) => 
                      setRecordFormData({ ...recordFormData, [field.name]: e.target.value })
                    }
                  />
                ) : field.type === 'date' ? (
                  <Input
                    id={`field-${field.id}`}
                    type="date"
                    value={recordFormData[field.name] || ''}
                    onChange={(e) => 
                      setRecordFormData({ ...recordFormData, [field.name]: e.target.value })
                    }
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={recordFormData[field.name] || ''}
                    onValueChange={(value) => 
                      setRecordFormData({ ...recordFormData, [field.name]: value })
                    }
                  >
                    <SelectTrigger id={`field-${field.id}`}>
                      <SelectValue placeholder="Seleccionar opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opcion1">Opción 1</SelectItem>
                      <SelectItem value="opcion2">Opción 2</SelectItem>
                      <SelectItem value="opcion3">Opción 3</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`field-${field.id}`}
                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
                    value={recordFormData[field.name] || ''}
                    onChange={(e) => 
                      setRecordFormData({ ...recordFormData, [field.name]: e.target.value })
                    }
                    placeholder={field.properties?.description || `Ingrese ${field.name}`}
                  />
                )}
                {field.properties?.description && (
                  <p className="text-xs text-muted-foreground">{field.properties.description}</p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDataDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveBusinessData}>
              {editingRecord ? 'Actualizar' : 'Crear'} Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Field Dialog */}
      <Dialog open={showEditFieldDialog} onOpenChange={setShowEditFieldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Campo</DialogTitle>
            <DialogDescription>Modifica las propiedades del campo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-field-name">Nombre del Campo</Label>
                <Input
                  id="edit-field-name"
                  value={selectedFieldForEdit?.name || ""}
                  onChange={(e) => setSelectedFieldForEdit(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="ej. direccion_email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-field-type">Tipo de Dato</Label>
                <Select 
                  value={selectedFieldForEdit?.type || "text"} 
                  onValueChange={(value) => setSelectedFieldForEdit(prev => prev ? { ...prev, type: value } : null)}
                >
                  <SelectTrigger id="edit-field-type">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-field-description">Descripción</Label>
              <Textarea
                id="edit-field-description"
                value={selectedFieldForEdit?.properties?.description || ""}
                onChange={(e) => setSelectedFieldForEdit(prev => prev ? { 
                  ...prev, 
                  properties: { ...prev.properties, description: e.target.value }
                } : null)}
                placeholder="¿Para qué se usa este campo?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-field-required"
                  checked={selectedFieldForEdit?.properties?.required || false}
                  onCheckedChange={(checked) => setSelectedFieldForEdit(prev => prev ? { 
                    ...prev, 
                    properties: { ...prev.properties, required: checked === true }
                  } : null)}
                />
                <Label htmlFor="edit-field-required">Campo Requerido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-field-unique"
                  checked={selectedFieldForEdit?.properties?.unique || false}
                  onCheckedChange={(checked) => setSelectedFieldForEdit(prev => prev ? { 
                    ...prev, 
                    properties: { ...prev.properties, unique: checked === true }
                  } : null)}
                />
                <Label htmlFor="edit-field-unique">Solo Valores Únicos</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFieldDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedFieldForEdit && updateField(selectedFieldForEdit.id, selectedFieldForEdit)}
              disabled={!selectedFieldForEdit?.name?.trim()}
            >
              Actualizar Campo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDeleteDatabaseDialog}
        onOpenChange={(open) => {
          setShowDeleteDatabaseDialog(open)
          if (!open) {
            setDeleteDatabaseError(null)
            setIsDeletingDatabase(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar base de datos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente{" "}
              <span className="font-semibold">{database?.name || "esta base de datos"}</span> y todos sus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteDatabaseError && (
            <p className="text-sm text-destructive">{deleteDatabaseError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDatabaseDialog(false)
                setDeleteDatabaseError(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDatabase}
              disabled={isDeletingDatabase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingDatabase ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
