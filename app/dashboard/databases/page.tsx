"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Database, Plus, Search, Package, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

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
}

export default function DatabasesPage() {
  const [databases, setDatabases] = useState<VirtualSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

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
          </nav>
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
            <nav className="grid gap-2 p-4">
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                href="/dashboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Panel
              </Link>
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                href="/dashboard/forms"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Formularios
              </Link>
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary transition-all bg-muted"
                href="/dashboard/databases"
              >
                <Database className="h-4 w-4" />
                Bases de Datos
              </Link>
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                href="/dashboard/workflows"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                Flujos de Trabajo
              </Link>
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                href="/dashboard/solutions"
              >
                <Package className="h-4 w-4" />
                Soluciones
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
          </nav>
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
            <nav className="grid gap-2 p-4">
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                href="/dashboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Panel
              </Link>
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                href="/dashboard/forms"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Formularios
              </Link>
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary transition-all bg-muted"
                href="/dashboard/databases"
              >
                <Database className="h-4 w-4" />
                Bases de Datos
              </Link>
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                href="/dashboard/workflows"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                Flujos de Trabajo
              </Link>
              <Link
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                href="/dashboard/solutions"
              >
                <Package className="h-4 w-4" />
                Soluciones
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
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
          <nav className="grid gap-2 p-4">
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Panel
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/forms"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Formularios
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary transition-all bg-muted"
              href="/dashboard/databases"
            >
              <Database className="h-4 w-4" />
              Bases de Datos
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/workflows"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              Flujos de Trabajo
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/solutions"
            >
              <Package className="h-4 w-4" />
              Soluciones
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
                          <Button variant="outline" size="sm">
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
    </div>
  )
}
