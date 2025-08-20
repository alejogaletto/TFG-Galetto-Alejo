"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface VirtualFieldSchema {
  id: number
  name: string
  type: string
  configs: any
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
  const { toast } = useToast()
  const [database, setDatabase] = useState<VirtualSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (params.id) {
      fetchDatabase(params.id as string)
    }
  }, [params.id])

  const fetchDatabase = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/virtual-schemas/${id}?includeTree=true`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch database: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDatabase(data)
    } catch (err) {
      console.error('Error fetching database:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
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
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Vista Previa
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-[250px] flex-col border-r bg-muted/40 md:flex overflow-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2">Tablas</h2>
            <div className="space-y-2">
              {database.tables?.map((table) => (
                <div
                  key={table.id}
                  className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
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
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Tabla
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <h2 className="font-semibold mb-2">Configuración de la Base de Datos</h2>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="db-name">Nombre de la Base de Datos</Label>
                <Input id="db-name" value={database.name} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="db-description">Descripción</Label>
                <Textarea
                  id="db-description"
                  value={database.description || ''}
                  readOnly
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <h3 className="font-medium mb-2">Formularios Conectados</h3>
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

        <main className="flex flex-1 flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="border-b">
              <div className="flex items-center px-4 py-2">
                <h1 className="text-lg font-medium">{database.name}</h1>
                <TabsList className="ml-auto">
                  <TabsTrigger value="overview">Vista General</TabsTrigger>
                  <TabsTrigger value="structure">Estructura</TabsTrigger>
                  <TabsTrigger value="data">Datos</TabsTrigger>
                  <TabsTrigger value="relations">Relaciones</TabsTrigger>
                </TabsList>
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
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                              <Button variant="outline" size="sm">
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
                          <Badge variant="outline">{table.fields?.length || 0} campos</Badge>
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
                                  {field.configs?.is_primary && <Key className="h-3 w-3 inline mr-1 text-amber-500" />}
                                  {field.name}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {getDataTypeIcon(field.type)}
                                    <span className="capitalize">{field.type}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {field.configs?.required ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {field.configs?.unique ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>{field.configs?.description || 'Sin descripción'}</TableCell>
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
                                      <DropdownMenuItem className="text-destructive">
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
              <div className="mx-auto max-w-[900px]">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos de la Base de Datos</CardTitle>
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
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Los datos se mostrarán aquí cuando se conecten formularios</p>
                      <p className="text-sm">o cuando se implemente la funcionalidad de datos</p>
                    </div>
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
    </div>
  )
}
