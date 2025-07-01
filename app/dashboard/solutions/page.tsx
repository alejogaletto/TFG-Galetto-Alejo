"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Package,
  BarChart3,
  FileText,
  Zap,
  Calendar,
  TrendingUp,
  Building,
  ShoppingCart,
  Headphones,
  Settings,
  Home,
  Database,
  Workflow,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SolutionsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewSolutionDialog, setShowNewSolutionDialog] = useState(false)
  const [newSolutionName, setNewSolutionName] = useState("")
  const [newSolutionDescription, setNewSolutionDescription] = useState("")

  // Plantillas predefinidas
  const templates = [
    {
      id: "crm",
      name: "CRM - Gestión de Clientes",
      description: "Sistema completo para gestionar leads, clientes y ventas",
      icon: <Users className="h-8 w-8" />,
      color: "bg-blue-500",
      features: ["Dashboard de ventas", "Gestión de leads", "Seguimiento de clientes", "Reportes"],
      category: "Ventas",
    },
    {
      id: "inventario",
      name: "Control de Inventario",
      description: "Gestiona tu inventario, stock y movimientos de productos",
      icon: <Package className="h-8 w-8" />,
      color: "bg-green-500",
      features: ["Control de stock", "Alertas de inventario", "Movimientos", "Reportes"],
      category: "Inventario",
    },
    {
      id: "analytics",
      name: "Dashboard Analítico",
      description: "Visualiza métricas y KPIs importantes de tu negocio",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "bg-purple-500",
      features: ["Gráficos interactivos", "KPIs en tiempo real", "Reportes", "Filtros avanzados"],
      category: "Analíticas",
    },
    {
      id: "helpdesk",
      name: "Mesa de Ayuda",
      description: "Sistema de tickets y soporte al cliente",
      icon: <Headphones className="h-8 w-8" />,
      color: "bg-orange-500",
      features: ["Gestión de tickets", "Chat en vivo", "Base de conocimiento", "SLA"],
      category: "Soporte",
    },
    {
      id: "ecommerce",
      name: "E-commerce Dashboard",
      description: "Panel de control para tienda online",
      icon: <ShoppingCart className="h-8 w-8" />,
      color: "bg-pink-500",
      features: ["Ventas online", "Productos", "Pedidos", "Clientes"],
      category: "E-commerce",
    },
    {
      id: "project",
      name: "Gestión de Proyectos",
      description: "Organiza tareas, equipos y proyectos",
      icon: <Calendar className="h-8 w-8" />,
      color: "bg-indigo-500",
      features: ["Kanban board", "Gantt charts", "Equipos", "Tiempo"],
      category: "Proyectos",
    },
  ]

  // Soluciones existentes del usuario
  const existingSolutions = [
    {
      id: "1",
      name: "CRM Ventas 2024",
      description: "Sistema de gestión de clientes y ventas",
      type: "crm",
      status: "active",
      lastModified: "2024-01-15",
      icon: <Users className="h-5 w-5" />,
      color: "bg-blue-500",
    },
    {
      id: "2",
      name: "Inventario Principal",
      description: "Control de stock y productos",
      type: "inventario",
      status: "active",
      lastModified: "2024-01-10",
      icon: <Package className="h-5 w-5" />,
      color: "bg-green-500",
    },
    {
      id: "3",
      name: "Dashboard Ejecutivo",
      description: "Métricas y KPIs principales",
      type: "analytics",
      status: "draft",
      lastModified: "2024-01-08",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "bg-purple-500",
    },
  ]

  const createNewSolutionFromScratch = () => {
    if (!newSolutionName.trim()) return

    // Redirigir al constructor avanzado con parámetros
    router.push(
      `/dashboard/solutions/builder/advanced?name=${encodeURIComponent(newSolutionName)}&description=${encodeURIComponent(newSolutionDescription)}&new=true`,
    )
  }

  const createSolutionFromTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    // Redirigir al constructor avanzado con plantilla
    router.push(
      `/dashboard/solutions/builder/advanced?template=${templateId}&name=${encodeURIComponent(template.name)}&new=true`,
    )
  }

  const filteredSolutions = existingSolutions.filter((solution) =>
    solution.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        {/* Sidebar */}
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
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary bg-muted text-primary text-sm"
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {/* Header de la página */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold md:text-2xl">Soluciones</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar soluciones..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={showNewSolutionDialog} onOpenChange={setShowNewSolutionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Solución
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Solución</DialogTitle>
                    <DialogDescription>
                      Elige una plantilla predefinida o crea una solución completamente personalizada
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="templates" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="templates">Plantillas</TabsTrigger>
                      <TabsTrigger value="scratch">Desde Cero</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates" className="space-y-4">
                      <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                        {templates.map((template) => (
                          <Card
                            key={template.id}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => createSolutionFromTemplate(template.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${template.color} text-white`}>{template.icon}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{template.name}</h3>
                                    <Badge variant="outline">{template.category}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {template.features.slice(0, 3).map((feature) => (
                                      <Badge key={feature} variant="secondary" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                    {template.features.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{template.features.length - 3} más
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="scratch" className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="solution-name">Nombre de la Solución</Label>
                          <Input
                            id="solution-name"
                            placeholder="Ej: Mi Dashboard Personalizado"
                            value={newSolutionName}
                            onChange={(e) => setNewSolutionName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="solution-description">Descripción (Opcional)</Label>
                          <Textarea
                            id="solution-description"
                            placeholder="Describe qué hará tu solución..."
                            value={newSolutionDescription}
                            onChange={(e) => setNewSolutionDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewSolutionDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={createNewSolutionFromScratch} disabled={!newSolutionName.trim()}>
                          <Zap className="mr-2 h-4 w-4" />
                          Crear Solución
                        </Button>
                      </DialogFooter>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Soluciones</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{existingSolutions.length}</div>
                <p className="text-xs text-muted-foreground">+2 este mes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {existingSolutions.filter((s) => s.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">100% operativas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plantillas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">Disponibles</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de soluciones existentes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mis Soluciones</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                </Button>
              </div>
            </div>

            {filteredSolutions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay soluciones</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm
                      ? "No se encontraron soluciones que coincidan con tu búsqueda"
                      : "Comienza creando tu primera solución personalizada"}
                  </p>
                  <Button onClick={() => setShowNewSolutionDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Solución
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSolutions.map((solution) => (
                  <Card key={solution.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${solution.color} text-white`}>{solution.icon}</div>
                          <div>
                            <CardTitle className="text-base">{solution.name}</CardTitle>
                            <CardDescription>{solution.description}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/solutions/${solution.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Solución
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/solutions/builder/advanced?id=${solution.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Configurar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span>Modificado: {new Date(solution.lastModified).toLocaleDateString()}</span>
                        <Badge variant={solution.status === "active" ? "default" : "secondary"}>
                          {solution.status === "active" ? "Activa" : "Borrador"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {solution.type}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
