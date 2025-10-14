"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  Check,
  Eye,
  FileText,
  Key,
  Mail,
  Plus,
  Save,
  Settings,
  Trash,
  Type,
  Hash,
  Braces,
  Minus,
  MoreHorizontal,
  Edit,
  Pencil,
  Database,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

function DatabaseBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const databaseId = searchParams.get('id')
  
  const [loading, setLoading] = useState(true)
  const [database, setDatabase] = useState<any>(null)
  const [databaseName, setDatabaseName] = useState("")
  const [databaseDescription, setDatabaseDescription] = useState("")
  const [activeTab, setActiveTab] = useState("structure")
  const [showPreview, setShowPreview] = useState(false)
  const [showAddField, setShowAddField] = useState(false)
  const [showAddRelation, setShowAddRelation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newField, setNewField] = useState({
    name: "",
    type: "text",
    required: false,
    unique: false,
    defaultValue: "",
    description: "",
  })

  const [tables, setTables] = useState<any[]>([])

  const [relations, setRelations] = useState([
    {
      id: 1,
      name: "customer_orders",
      sourceTable: "Customers",
      sourceField: "id",
      targetTable: "Orders",
      targetField: "customer_id",
      type: "one-to-many",
    },
  ])

  useEffect(() => {
    if (databaseId) {
      fetchDatabase(databaseId)
    } else {
      setLoading(false)
      toast({
        title: "Error",
        description: "No se proporcionó un ID de base de datos",
        variant: "destructive",
      })
      router.push('/dashboard/databases')
    }
  }, [databaseId])

  const fetchDatabase = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/virtual-schemas/${id}/tree`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch database')
      }
      
      const data = await response.json()
      setDatabase(data)
      setDatabaseName(data.name)
      setDatabaseDescription(data.description || '')
      setTables(data.tables || [])
    } catch (error) {
      console.error('Error fetching database:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar la base de datos",
        variant: "destructive",
      })
      router.push('/dashboard/databases')
    } finally {
      setLoading(false)
    }
  }

  const saveDatabase = async () => {
    if (!database) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/virtual-schemas/${database.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: databaseName,
          description: databaseDescription,
          configs: database.configs
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save database')
      }

      toast({
        title: "Base de datos guardada",
        description: "Los cambios han sido guardados exitosamente",
      })
      
      // Redirect back to database detail page
      router.push(`/dashboard/databases/${database.id}`)
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

  const dataTypes = [
    { value: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
    { value: "number", label: "Number", icon: <Hash className="h-4 w-4" /> },
    { value: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
    { value: "boolean", label: "Boolean", icon: <Check className="h-4 w-4" /> },
    { value: "datetime", label: "Date/Time", icon: <Calendar className="h-4 w-4" /> },
    { value: "id", label: "ID", icon: <Key className="h-4 w-4" /> },
    { value: "json", label: "JSON", icon: <Braces className="h-4 w-4" /> },
    { value: "file", label: "File", icon: <FileText className="h-4 w-4" /> },
  ]

  const relationTypes = [
    { value: "one-to-one", label: "One-to-One" },
    { value: "one-to-many", label: "One-to-Many" },
    { value: "many-to-many", label: "Many-to-Many" },
  ]

  const addField = async () => {
    const currentTable = tables[0]
    if (!currentTable) return

    try {
      const response = await fetch('/api/virtual-field-schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newField.name,
          type: newField.type,
          virtual_table_schema_id: currentTable.id,
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

      toast({
        title: "Campo creado",
        description: `El campo "${newField.name}" ha sido creado exitosamente`,
      })

      // Refresh database data
      if (databaseId) {
        await fetchDatabase(databaseId)
      }

      setNewField({
        name: "",
        type: "text",
        required: false,
        unique: false,
        defaultValue: "",
        description: "",
      })

      setShowAddField(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el campo",
        variant: "destructive",
      })
    }
  }

  const removeField = async (fieldId: number) => {
    try {
      const response = await fetch(`/api/virtual-field-schemas/${fieldId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete field')
      }

      toast({
        title: "Campo eliminado",
        description: "El campo ha sido eliminado exitosamente",
      })

      // Refresh database data
      if (databaseId) {
        await fetchDatabase(databaseId)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el campo",
        variant: "destructive",
      })
    }
  }

  const addRelation = (relation: any) => {
    const newId = relations.length > 0 ? Math.max(...relations.map((rel) => rel.id)) + 1 : 1
    setRelations([...relations, { ...relation, id: newId }])
    setShowAddRelation(false)
  }

  const removeRelation = (relationId: any) => {
    setRelations(relations.filter((relation) => relation.id !== relationId))
  }

  const getDataTypeIcon = (type: any) => {
    const dataType = dataTypes.find((dt) => dt.value === type)
    return dataType ? dataType.icon : <Type className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando base de datos...</p>
        </div>
      </div>
    )
  }

  if (!database) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Base de datos no encontrada</p>
          <Button onClick={() => router.push('/dashboard/databases')}>
            Volver a Bases de Datos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/databases" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Bases de Datos</span>
        </Link>
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
          <Link className="text-sm font-medium" href="/dashboard/solutions">
            Soluciones
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>{databaseName}</DialogTitle>
                <DialogDescription>{databaseDescription}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Tabs defaultValue="customers">
                  <TabsList>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                  </TabsList>
                  <TabsContent value="customers" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell>Juan Pérez</TableCell>
                          <TableCell>juan@example.es</TableCell>
                          <TableCell>666-123-456</TableCell>
                          <TableCell>2023-05-12</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>2</TableCell>
                          <TableCell>Ana García</TableCell>
                          <TableCell>ana@example.es</TableCell>
                          <TableCell>666-987-654</TableCell>
                          <TableCell>2023-06-23</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>3</TableCell>
                          <TableCell>Carlos López</TableCell>
                          <TableCell>carlos@example.es</TableCell>
                          <TableCell>666-456-789</TableCell>
                          <TableCell>2023-07-15</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="orders" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Customer ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>$125.00</TableCell>
                          <TableCell>Completed</TableCell>
                          <TableCell>2023-05-15</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>2</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>$85.50</TableCell>
                          <TableCell>Shipped</TableCell>
                          <TableCell>2023-06-28</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>3</TableCell>
                          <TableCell>2</TableCell>
                          <TableCell>$220.75</TableCell>
                          <TableCell>Processing</TableCell>
                          <TableCell>2023-07-18</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={saveDatabase} disabled={isSaving || loading}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-[250px] flex-col border-r bg-muted/40 md:flex overflow-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2">Tablas</h2>
            <div className="space-y-2">
              {tables.map((table, index) => (
                <div
                  key={table.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${index === 0 ? "bg-muted" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>{table.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4">
            <h2 className="font-semibold mb-2">Configuración de la Base de Datos</h2>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="db-name">Nombre de la Base de Datos</Label>
                <Input id="db-name" value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="db-description">Descripción</Label>
                <Textarea
                  id="db-description"
                  value={databaseDescription}
                  onChange={(e) => setDatabaseDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <h3 className="font-medium mb-2">Formularios Conectados</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Customer Feedback</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Contact Form</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="w-full mt-2" disabled={true}>
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
        <main className="flex flex-1 flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="border-b">
              <div className="flex items-center px-4 py-2">
                <h1 className="text-lg font-medium">{tables[0]?.name || 'Sin tabla'}</h1>
                <TabsList className="ml-auto">
                  <TabsTrigger value="structure">Estructura</TabsTrigger>
                  <TabsTrigger value="relations">Relaciones</TabsTrigger>
                  <TabsTrigger value="data">Datos de Ejemplo</TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="structure" className="flex-1 p-4">
              <div className="mx-auto max-w-[900px]">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Estructura de la Tabla</CardTitle>
                    <Dialog open={showAddField} onOpenChange={setShowAddField}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Campo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Nuevo Campo</DialogTitle>
                          <DialogDescription>
                            Define las propiedades para tu nuevo campo de base de datos.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="field-name">Nombre del Campo</Label>
                              <Input
                                id="field-name"
                                value={newField.name}
                                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                placeholder="e.g. first_name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="field-type">Tipo de Dato</Label>
                              <Select
                                value={newField.type}
                                onValueChange={(value) => setNewField({ ...newField, type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {dataTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center">
                                        {type.icon}
                                        <span className="ml-2">{type.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="field-description">Descripción</Label>
                            <Textarea
                              id="field-description"
                              value={newField.description}
                              onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                              placeholder="Describe el propósito de este campo"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="field-required"
                                checked={newField.required}
                                onCheckedChange={(checked) => setNewField({ ...newField, required: checked === true })}
                              />
                              <Label htmlFor="field-required">Requerido</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="field-unique"
                                checked={newField.unique}
                                onCheckedChange={(checked) => setNewField({ ...newField, unique: checked === true })}
                              />
                              <Label htmlFor="field-unique">Único</Label>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="field-default">Valor Predeterminado (Opcional)</Label>
                            <Input
                              id="field-default"
                              value={newField.defaultValue}
                              onChange={(e) => setNewField({ ...newField, defaultValue: e.target.value })}
                              placeholder="Default value if none provided"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddField(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={addField}>Agregar Campo</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
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
                        {tables[0]?.fields?.map((field: any) => (
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
                                <Minus className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {field.properties?.unique ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Minus className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>{field.properties?.description || '-'}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => removeField(field.id)}
                                    disabled={field.properties?.is_primary}
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="relations" className="flex-1 p-4">
              <div className="mx-auto max-w-[900px]">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Relaciones de Tabla</CardTitle>
                    <Dialog open={showAddRelation} onOpenChange={setShowAddRelation}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Relación
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Nueva Relación</DialogTitle>
                          <DialogDescription>Define una relación entre dos tablas.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="relation-name">Nombre de la Relación</Label>
                            <Input id="relation-name" placeholder="ej. pedidos_clientes" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="source-table">Tabla Origen</Label>
                              <Select defaultValue="Customers">
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tabla" />
                                </SelectTrigger>
                                <SelectContent>
                                  {tables.map((table) => (
                                    <SelectItem key={table.id} value={table.name}>
                                      {table.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="source-field">Campo Origen</Label>
                              <Select defaultValue="id">
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar campo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="id">id</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="target-table">Tabla Destino</Label>
                              <Select defaultValue="Orders">
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tabla" />
                                </SelectTrigger>
                                <SelectContent>
                                  {tables.map((table) => (
                                    <SelectItem key={table.id} value={table.name}>
                                      {table.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="target-field">Campo Destino</Label>
                              <Select defaultValue="customer_id">
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar campo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="customer_id">customer_id</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="relation-type">Tipo de Relación</Label>
                            <Select defaultValue="one-to-many">
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {relationTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddRelation(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={() =>
                              addRelation({
                                name: "customer_orders",
                                sourceTable: "Customers",
                                sourceField: "id",
                                targetTable: "Orders",
                                targetField: "customer_id",
                                type: "one-to-many",
                              })
                            }
                          >
                            Agregar Relación
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relations.map((relation) => (
                          <TableRow key={relation.id}>
                            <TableCell className="font-medium">{relation.name}</TableCell>
                            <TableCell>
                              {relation.sourceTable}.{relation.sourceField}
                            </TableCell>
                            <TableCell>
                              {relation.targetTable}.{relation.targetField}
                            </TableCell>
                            <TableCell>{relation.type}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeRelation(relation.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="data" className="flex-1 p-4">
              <div className="mx-auto max-w-[900px]">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Datos de Ejemplo</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button size="sm" disabled={true}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Registro (Próximamente)
                      </Button>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Próximamente
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell>Juan Pérez</TableCell>
                          <TableCell>juan@example.es</TableCell>
                          <TableCell>666-123-456</TableCell>
                          <TableCell>2023-05-12</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>2</TableCell>
                          <TableCell>Ana García</TableCell>
                          <TableCell>ana@example.es</TableCell>
                          <TableCell>666-987-654</TableCell>
                          <TableCell>2023-06-23</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>3</TableCell>
                          <TableCell>Carlos López</TableCell>
                          <TableCell>carlos@example.es</TableCell>
                          <TableCell>666-456-789</TableCell>
                          <TableCell>2023-07-15</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
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

export default function DatabaseBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    }>
      <DatabaseBuilderContent />
    </Suspense>
  )
}
