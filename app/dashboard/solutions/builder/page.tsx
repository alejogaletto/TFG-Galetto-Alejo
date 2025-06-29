"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  MoreHorizontal,
  FileText,
  Database,
  Workflow,
  Zap,
  Users,
  BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Plantillas de formularios prediseñadas
const formTemplates = [
  {
    id: "contact",
    name: "Formulario de Contacto",
    description: "Formulario básico para contacto con campos esenciales",
    category: "general",
    complexity: "simple",
    fields: ["Nombre", "Email", "Teléfono", "Mensaje"],
    icon: FileText,
  },
  {
    id: "lead",
    name: "Captura de Prospectos",
    description: "Formulario optimizado para generar leads de calidad",
    category: "ventas",
    complexity: "medio",
    fields: ["Nombre", "Email", "Empresa", "Cargo", "Teléfono", "Interés"],
    icon: Users,
  },
  {
    id: "feedback",
    name: "Retroalimentación",
    description: "Recopila opiniones y comentarios de clientes",
    category: "feedback",
    complexity: "medio",
    fields: ["Nombre", "Email", "Calificación", "Comentarios", "Recomendarías"],
    icon: BarChart3,
  },
  {
    id: "registration",
    name: "Registro de Eventos",
    description: "Formulario para registro en eventos y webinars",
    category: "eventos",
    complexity: "complejo",
    fields: ["Nombre", "Email", "Empresa", "Cargo", "Teléfono", "Preferencias Dietéticas"],
    icon: Users,
  },
  {
    id: "survey",
    name: "Encuesta de Satisfacción",
    description: "Encuesta completa para medir satisfacción del cliente",
    category: "feedback",
    complexity: "complejo",
    fields: ["Email", "Calificación General", "Calidad del Producto", "Atención al Cliente", "Comentarios"],
    icon: BarChart3,
  },
  {
    id: "support",
    name: "Ticket de Soporte",
    description: "Formulario para reportar problemas y solicitar ayuda",
    category: "soporte",
    complexity: "medio",
    fields: ["Nombre", "Email", "Tipo de Problema", "Prioridad", "Descripción"],
    icon: Settings,
  },
]

// Formularios existentes de ejemplo
const existingForms = [
  {
    id: "1",
    name: "Contacto Principal",
    description: "Formulario principal de contacto del sitio web",
    status: "activo",
    category: "general",
    fields: 4,
    submissions: 156,
    conversionRate: 12.5,
    createdAt: "2024-01-15",
    lastModified: "2024-01-20",
  },
  {
    id: "2",
    name: "Registro de Newsletter",
    description: "Suscripción a boletín informativo",
    status: "activo",
    category: "marketing",
    fields: 2,
    submissions: 89,
    conversionRate: 8.3,
    createdAt: "2024-01-10",
    lastModified: "2024-01-18",
  },
  {
    id: "3",
    name: "Solicitud de Demo",
    description: "Formulario para solicitar demostración del producto",
    status: "borrador",
    category: "ventas",
    fields: 6,
    submissions: 0,
    conversionRate: 0,
    createdAt: "2024-01-22",
    lastModified: "2024-01-22",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "activo":
      return "bg-green-100 text-green-800"
    case "borrador":
      return "bg-yellow-100 text-yellow-800"
    case "pausado":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "general":
      return "bg-blue-100 text-blue-800"
    case "ventas":
      return "bg-green-100 text-green-800"
    case "marketing":
      return "bg-purple-100 text-purple-800"
    case "feedback":
      return "bg-orange-100 text-orange-800"
    case "eventos":
      return "bg-pink-100 text-pink-800"
    case "soporte":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case "simple":
      return "bg-green-100 text-green-800"
    case "medio":
      return "bg-yellow-100 text-yellow-800"
    case "complejo":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function SolutionBuilderPage() {
  const [selectedTab, setSelectedTab] = useState("forms")
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [newFormData, setNewFormData] = useState({
    name: "",
    description: "",
    allowMultipleSubmissions: false,
    requireAuthentication: false,
    sendNotifications: true,
  })

  const handleCreateForm = () => {
    console.log("Creando formulario:", newFormData)
    setIsCreateFormOpen(false)
    setNewFormData({
      name: "",
      description: "",
      allowMultipleSubmissions: false,
      requireAuthentication: false,
      sendNotifications: true,
    })
  }

  const handleUseTemplate = (template: any) => {
    console.log("Usando plantilla:", template)
    // Aquí se redirigiría al form builder con la plantilla
  }

  const handleToggleStatus = (formId: string, currentStatus: string) => {
    const newStatus = currentStatus === "activo" ? "pausado" : "activo"
    console.log(`Cambiando estado del formulario ${formId} a ${newStatus}`)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/solutions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-lg">Constructor de Soluciones</h1>
            <p className="text-sm text-muted-foreground">Solución CRM Empresarial</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Vista Previa
          </Button>
          <Button size="sm">Guardar Cambios</Button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-[240px] flex-col border-r bg-muted/40 md:flex">
          <nav className="grid gap-2 p-4">
            <button
              onClick={() => setSelectedTab("forms")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                selectedTab === "forms" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Formularios</span>
            </button>
            <button
              onClick={() => setSelectedTab("databases")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                selectedTab === "databases" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Database className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Bases de Datos</span>
            </button>
            <button
              onClick={() => setSelectedTab("workflows")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                selectedTab === "workflows" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Workflow className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Flujos de Trabajo</span>
            </button>
            <button
              onClick={() => setSelectedTab("integrations")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                selectedTab === "integrations" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Zap className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Integraciones</span>
            </button>
          </nav>
        </aside>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {selectedTab === "forms" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Formularios</h2>
                  <p className="text-muted-foreground">Gestiona los formularios de tu solución CRM</p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Formulario
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Formulario</DialogTitle>
                        <DialogDescription>Crea un formulario personalizado desde cero</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nombre del Formulario</Label>
                          <Input
                            id="name"
                            value={newFormData.name}
                            onChange={(e) => setNewFormData({ ...newFormData, name: e.target.value })}
                            placeholder="Ej: Formulario de Contacto"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={newFormData.description}
                            onChange={(e) => setNewFormData({ ...newFormData, description: e.target.value })}
                            placeholder="Describe el propósito de este formulario"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="multiple">Permitir múltiples envíos</Label>
                            <Switch
                              id="multiple"
                              checked={newFormData.allowMultipleSubmissions}
                              onCheckedChange={(checked) =>
                                setNewFormData({ ...newFormData, allowMultipleSubmissions: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auth">Requerir autenticación</Label>
                            <Switch
                              id="auth"
                              checked={newFormData.requireAuthentication}
                              onCheckedChange={(checked) =>
                                setNewFormData({ ...newFormData, requireAuthentication: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="notifications">Enviar notificaciones</Label>
                            <Switch
                              id="notifications"
                              checked={newFormData.sendNotifications}
                              onCheckedChange={(checked) =>
                                setNewFormData({ ...newFormData, sendNotifications: checked })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateFormOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateForm}>Crear Formulario</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Tabs defaultValue="templates">
                <TabsList>
                  <TabsTrigger value="templates">Plantillas</TabsTrigger>
                  <TabsTrigger value="existing">Formularios Existentes</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {formTemplates.map((template) => {
                      const IconComponent = template.icon
                      return (
                        <Card key={template.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-5 w-5 text-primary" />
                                <CardTitle className="text-base">{template.name}</CardTitle>
                              </div>
                              <div className="flex gap-1">
                                <Badge variant="secondary" className={getCategoryColor(template.category)}>
                                  {template.category}
                                </Badge>
                                <Badge variant="outline" className={getComplexityColor(template.complexity)}>
                                  {template.complexity}
                                </Badge>
                              </div>
                            </div>
                            <CardDescription className="text-sm">{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium mb-2">Campos incluidos:</p>
                                <div className="flex flex-wrap gap-1">
                                  {template.fields.slice(0, 3).map((field, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {field}
                                    </Badge>
                                  ))}
                                  {template.fields.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{template.fields.length - 3} más
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button className="w-full" size="sm" onClick={() => handleUseTemplate(template)}>
                                Usar Plantilla
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="existing" className="space-y-4">
                  <div className="grid gap-4">
                    {existingForms.map((form) => (
                      <Card key={form.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-base">{form.name}</CardTitle>
                                <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                                <Badge variant="secondary" className={getCategoryColor(form.category)}>
                                  {form.category}
                                </Badge>
                              </div>
                              <CardDescription>{form.description}</CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Formulario
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/form-builder/${form.id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleStatus(form.id, form.status)}>
                                  {form.status === "activo" ? (
                                    <>
                                      <Pause className="mr-2 h-4 w-4" />
                                      Pausar
                                    </>
                                  ) : (
                                    <>
                                      <Play className="mr-2 h-4 w-4" />
                                      Activar
                                    </>
                                  )}
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
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium">{form.fields}</p>
                              <p className="text-muted-foreground">Campos</p>
                            </div>
                            <div>
                              <p className="font-medium">{form.submissions}</p>
                              <p className="text-muted-foreground">Envíos</p>
                            </div>
                            <div>
                              <p className="font-medium">{form.conversionRate}%</p>
                              <p className="text-muted-foreground">Conversión</p>
                            </div>
                            <div>
                              <p className="font-medium">{new Date(form.lastModified).toLocaleDateString()}</p>
                              <p className="text-muted-foreground">Modificado</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {selectedTab === "databases" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Bases de Datos</h2>
                  <p className="text-muted-foreground">Configura las bases de datos para tu solución</p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Base de Datos
                </Button>
              </div>
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Configuración de bases de datos próximamente</p>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "workflows" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Flujos de Trabajo</h2>
                  <p className="text-muted-foreground">Automatiza procesos con flujos de trabajo</p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Flujo de Trabajo
                </Button>
              </div>
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Constructor de flujos de trabajo próximamente</p>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "integrations" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Integraciones</h2>
                  <p className="text-muted-foreground">Conecta con servicios externos</p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Integración
                </Button>
              </div>
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Panel de integraciones próximamente</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
