"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Database, Plus, Search, Package, Loader2, Home, FileText, Workflow, BarChart3, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface VirtualSchema {
  id: number
  name: string
  description: string
  configs: any
  created_at: string
  tables?: VirtualTableSchema[]
}

interface VirtualTableSchema {
  id: number
  name: string
  fields?: VirtualFieldSchema[]
}

interface VirtualFieldSchema {
  id: number
  name: string
  type: string
  properties?: {
    required?: boolean
    unique?: boolean
    description?: string
  }
}

export default function DatabasesPage() {
  const [databases, setDatabases] = useState<VirtualSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showSchemaPreview, setShowSchemaPreview] = useState(false)
  const [selectedDatabase, setSelectedDatabase] = useState<VirtualSchema | null>(null)

  useEffect(() => {
    fetchDatabases()
  }, [])

  const fetchDatabases = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/virtual-schemas?includeTree=true')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch databases: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDatabases(data)
    } catch (err) {
      console.error('Error fetching databases:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getTotalFields = (tables: VirtualTableSchema[] = []) => {
    return tables.reduce((total, table) => total + (table.fields?.length || 0), 0)
  }

  const getDatabaseType = (configs: any) => {
    if (configs?.created_via === 'database_builder') {
      return { label: 'Constructor', variant: 'default' as const }
    }
    return { label: 'Manual', variant: 'secondary' as const }
  }

  const filteredDatabases = databases.filter(db => {
    const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         db.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'personal') return matchesSearch && !db.configs?.shared
    if (activeTab === 'shared') return matchesSearch && db.configs?.shared
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
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
        </header>
        <div className="flex flex-1">
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all bg-muted text-primary text-sm"
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
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
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p>Cargando bases de datos...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col">
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
        </header>
        <div className="flex flex-1">
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all bg-muted text-primary text-sm"
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
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
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <Button onClick={fetchDatabases}>Reintentar</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
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
      </header>
      <div className="flex flex-1">
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
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all bg-muted text-primary text-sm"
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
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg md:text-2xl">Bases de Datos</h1>
            <Link href="/dashboard/databases/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Base de Datos
              </Button>
            </Link>
          </div>
          
          <div className="border rounded-lg">
            <div className="p-4 flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar bases de datos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">Todas ({filteredDatabases.length})</TabsTrigger>
                  <TabsTrigger value="personal">Personales</TabsTrigger>
                  <TabsTrigger value="shared">Compartidas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="border-t">
              {filteredDatabases.length === 0 ? (
                <div className="p-8 text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm ? 'No se encontraron bases de datos' : 'No hay bases de datos'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Crea tu primera base de datos para comenzar'
                    }
                  </p>
                  {!searchTerm && (
                    <Link href="/dashboard/databases/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Primera Base de Datos
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredDatabases.map((db) => {
                    const dbType = getDatabaseType(db.configs)
                    return (
                      <Card key={db.id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle>{db.name}</CardTitle>
                          <CardDescription>
                            {db.description || 'Sin descripción'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="text-sm font-medium">Tablas</div>
                              <div className="text-2xl font-bold">{db.tables?.length || 0}</div>
                            </div>
                            <div className="flex h-8 items-center">
                              <Badge variant={dbType.variant}>
                                {dbType.label}
                              </Badge>
                            </div>
                          </div>
                          {db.tables && db.tables.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium">Campos Totales</div>
                              <div className="text-lg font-semibold">{getTotalFields(db.tables)}</div>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between mt-auto">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedDatabase(db)
                              setShowSchemaPreview(true)
                            }}
                          >
                            Ver Esquema
                          </Button>
                          <Link href={`/dashboard/databases/${db.id}`}>
                            <Button size="sm">Abrir</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    )
                  })}
                  
                  <Link href="/dashboard/databases/new" className="block">
                    <Card className="flex flex-col items-center justify-center p-6 h-full hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="rounded-full bg-muted p-3">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="mt-3 font-medium">Crear Nueva Base de Datos</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        Comienza a construir una nueva base de datos para tu negocio
                      </p>
                      <Button className="mt-4" variant="outline">
                        Crear Base de Datos
                      </Button>
                    </Card>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Schema Preview Dialog */}
      <Dialog open={showSchemaPreview} onOpenChange={setShowSchemaPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDatabase?.name}</DialogTitle>
            <DialogDescription>
              {selectedDatabase?.description || 'Sin descripción'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {selectedDatabase?.tables && selectedDatabase.tables.length > 0 ? (
              selectedDatabase.tables.map((table) => (
                <div key={table.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{table.name}</h3>
                    </div>
                    <Badge variant="outline">{table.fields?.length || 0} campos</Badge>
                  </div>
                  {table.fields && table.fields.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Requerido</TableHead>
                          <TableHead>Único</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.fields.map((field) => (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium">{field.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {field.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {field.properties?.required ? '✓' : '—'}
                            </TableCell>
                            <TableCell>
                              {field.properties?.unique ? '✓' : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay campos definidos</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No hay tablas en esta base de datos</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
