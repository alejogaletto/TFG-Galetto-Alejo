"use client"

import { useState, useEffect } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
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
import { NotificationIcon } from "@/components/notifications/notification-icon"
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

export default function SolutionsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewSolutionDialog, setShowNewSolutionDialog] = useState(false)
  const [newSolutionName, setNewSolutionName] = useState("")
  const [newSolutionDescription, setNewSolutionDescription] = useState("")
  const [templates, setTemplates] = useState<any[]>([])
  const [existingSolutions, setExistingSolutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [solutionToDelete, setSolutionToDelete] = useState<any | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Icon mapping helper
  const getIconComponent = (iconName: string, size = "h-8 w-8") => {
    const iconMap: Record<string, any> = {
      users: <Users className={size} />,
      package: <Package className={size} />,
      "bar-chart-3": <BarChart3 className={size} />,
      headphones: <Headphones className={size} />,
      "shopping-cart": <ShoppingCart className={size} />,
      calendar: <Calendar className={size} />,
    }
    return iconMap[iconName] || <Package className={size} />
  }

  // Fetch templates and user solutions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get user from localStorage (in production, use proper auth)
        const userStr = localStorage.getItem("user")
        const user = userStr ? JSON.parse(userStr) : null
        const currentUserId = user?.id || 1 // Fallback to 1 for demo
        setUserId(currentUserId)

        // Fetch templates
        const templatesRes = await fetch("/api/solutions?is_template=true")
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setTemplates(
            templatesData.map((t: any) => ({
              ...t,
              icon: getIconComponent(t.icon),
              features: t.configs?.features || [],
            }))
          )
        }

        // Fetch user's solutions
        const solutionsRes = await fetch(`/api/solutions?user_id=${currentUserId}&is_template=false`)
        if (solutionsRes.ok) {
          const solutionsData = await solutionsRes.json()
          setExistingSolutions(
            solutionsData.map((s: any) => ({
              ...s,
              icon: getIconComponent(s.icon, "h-5 w-5"),
              lastModified: s.modification_date || s.creation_date,
              type: s.template_type,
            }))
          )
        }
      } catch (error) {
        console.error("Error fetching solutions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const createNewSolutionFromScratch = async () => {
    if (!newSolutionName.trim() || !userId) return

    try {
      // Create a new solution from scratch
      const response = await fetch("/api/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: newSolutionName,
          description: newSolutionDescription,
          status: "draft",
          is_template: false,
        }),
      })

      if (response.ok) {
        const newSolution = await response.json()
        setShowNewSolutionDialog(false)
        setNewSolutionName("")
        setNewSolutionDescription("")
        // Redirect to the advanced builder for custom solution creation
        router.push(
          `/dashboard/solutions/builder/advanced?id=${newSolution.id}&name=${encodeURIComponent(newSolutionName)}&description=${encodeURIComponent(newSolutionDescription)}&new=true`
        )
      } else {
        alert("Error creating solution")
      }
    } catch (error) {
      console.error("Error creating solution:", error)
      alert("Error creating solution")
    }
  }

  const createSolutionFromTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.id.toString() === templateId.toString())
    if (!template || !userId) return

    try {
      // Instantiate a solution from a template
      const response = await fetch(`/api/solutions/${template.id}/instantiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: `${template.name}`,
          description: template.description,
        }),
      })

      if (response.ok) {
        const newSolution = await response.json()
        setShowNewSolutionDialog(false)
        // Redirect to the setup wizard to configure the solution
        router.push(`/dashboard/solutions/setup?id=${newSolution.id}&template=${template.template_type || templateId}`)
      } else {
        alert("Error creating solution from template")
      }
    } catch (error) {
      console.error("Error creating solution from template:", error)
      alert("Error creating solution from template")
    }
  }

  const filteredSolutions = existingSolutions.filter((solution) =>
    solution.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const openDeleteDialog = (solution: any) => {
    setSolutionToDelete(solution)
    setShowDeleteDialog(true)
    setDeleteError(null)
  }

  const handleDeleteSolution = async () => {
    if (!solutionToDelete) return

    try {
      setIsDeleting(true)
      setDeleteError(null)
      const response = await fetch(`/api/solutions/${solutionToDelete.id}`, { method: "DELETE" })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "No se pudo eliminar la solución")
      }
      setExistingSolutions((prev) => prev.filter((sol) => sol.id !== solutionToDelete.id))
      setShowDeleteDialog(false)
      setSolutionToDelete(null)
    } catch (error) {
      console.error("Error deleting solution:", error)
      setDeleteError(error instanceof Error ? error.message : "Error eliminando la solución")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header Principal */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2 font-semibold" href="#">
          <span className="font-bold">AutomatePyme</span>
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
          <NotificationIcon />
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
                                    {template.features.slice(0, 3).map((feature: string) => (
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
                            placeholder="Ej: Mi Panel Personalizado"
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
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Soluciones</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{existingSolutions.length}</div>
                  <p className="text-xs text-muted-foreground">Tus soluciones</p>
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
                  <p className="text-xs text-muted-foreground">En uso</p>
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
          )}

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

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSolutions.length === 0 ? (
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
                  <Card 
                    key={solution.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/dashboard/solutions/${solution.id}`)}
                  >
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Settings className="mr-2 h-4 w-4" />
                              Configurar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeleteDialog(solution)
                              }}
                            >
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

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open)
          if (!open) {
            setSolutionToDelete(null)
            setDeleteError(null)
            setIsDeleting(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar solución?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente{" "}
              <span className="font-semibold">{solutionToDelete?.name || "esta solución"}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false)
                setSolutionToDelete(null)
                setDeleteError(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSolution}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
