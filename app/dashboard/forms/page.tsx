"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Copy,
  Edit,
  FileText,
  MoreHorizontal,
  Plus,
  Trash,
  Database,
  GitBranch,
  FileSpreadsheet,
  FileTextIcon as FileText2,
  Mail,
  Webhook,
  Package,
  Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

export default function FormsPage() {
  const router = useRouter()
  const [forms, setForms] = useState([
    {
      id: 1,
      name: "Retroalimentación del Cliente",
      submissions: 45,
      created: "hace 2 días",
      status: "active",
      connections: ["database", "email"],
      databaseName: "Clientes",
    },
    {
      id: 2,
      name: "Incorporación de Empleados",
      submissions: 12,
      created: "hace 5 días",
      status: "active",
      connections: ["database", "workflow"],
      databaseName: "Empleados",
    },
    {
      id: 3,
      name: "Solicitud de Proyecto",
      submissions: 28,
      created: "hace 1 semana",
      status: "active",
      connections: ["database"],
      databaseName: "Proyectos",
    },
    {
      id: 4,
      name: "Ticket de Soporte IT",
      submissions: 67,
      created: "hace 2 semanas",
      status: "active",
      connections: ["database", "email", "workflow"],
      databaseName: "Soporte",
    },
    {
      id: 5,
      name: "Registro de Evento",
      submissions: 0,
      created: "hace 3 semanas",
      status: "draft",
      connections: [],
    },
  ])

  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({
    name: "",
    description: "",
    template: "blank",
    database: "customers",
    enableNotifications: true,
    enableWorkflow: false,
    enableCaptcha: true,
    googleSheets: false,
    googleDocs: false,
  })

  const formTemplates = [
    { id: "blank", name: "Formulario en Blanco", description: "Comienza con un formulario completamente en blanco" },
    { id: "contact", name: "Formulario de Contacto", description: "Recopila información de contacto" },
    { id: "feedback", name: "Formulario de Comentarios", description: "Recopila comentarios de clientes" },
    { id: "registration", name: "Formulario de Registro", description: "Registra usuarios para eventos" },
    { id: "order", name: "Formulario de Pedido", description: "Procesa pedidos de clientes" },
    { id: "support", name: "Ticket de Soporte", description: "Maneja solicitudes de soporte" },
  ]

  const addNewForm = () => {
    try {
      const newId = forms.length > 0 ? Math.max(...forms.map((form) => form.id)) + 1 : 1
      const newFormData = {
        id: newId,
        name: newForm.name || "Untitled Form",
        description: newForm.description || "",
        submissions: 0,
        created: "Ahora mismo",
        status: "draft",
        connections: newForm.database ? ["database"] : [],
        template: newForm.template || "blank",
        enableNotifications: newForm.enableNotifications,
        enableWorkflow: newForm.enableWorkflow,
        enableCaptcha: newForm.enableCaptcha,
        googleSheets: newForm.googleSheets,
        googleDocs: newForm.googleDocs,
        databaseName: newForm.database ? newForm.database.charAt(0).toUpperCase() + newForm.database.slice(1) : null,
      }

      // Add email connection if notifications are enabled
      if (newForm.enableNotifications) {
        newFormData.connections.push("email")
      }

      // Add workflow connection if workflows are enabled
      if (newForm.enableWorkflow) {
        newFormData.connections.push("workflow")
      }

      setForms([...forms, newFormData])
      setNewForm({
        name: "",
        description: "",
        template: "blank",
        database: "customers",
        enableNotifications: true,
        enableWorkflow: false,
        enableCaptcha: true,
        googleSheets: false,
        googleDocs: false,
      })
      setShowNewForm(false)

      // Use router.push instead of direct window.location manipulation
      router.push(`/dashboard/form-builder/${newId}`)
    } catch (error) {
      console.error("Error creating form:", error)
      // Fallback to a simpler navigation if the router fails
      window.location.href = `/dashboard/form-builder/new?template=${newForm.template || "blank"}`
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2 font-semibold" href="#">
          <span className="font-bold">AutomateSMB</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link className="text-sm font-medium" href="/dashboard">
            Panel de Control
          </Link>
          <Link className="text-sm font-medium text-primary" href="/dashboard/forms">
            Formularios
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/databases">
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
              Panel de Control
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary transition-all bg-muted"
              href="/dashboard/forms"
            >
              <FileText className="h-4 w-4" />
              Formularios
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/form-submissions"
            >
              <FileText className="h-4 w-4" />
              Envíos de Formulario
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/form-analytics"
            >
              <FileText className="h-4 w-4" />
              Analítica de Formularios
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/databases"
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
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
              </svg>
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
            <h1 className="font-semibold text-lg md:text-2xl">Formularios</h1>
            <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Formulario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Formulario</DialogTitle>
                  <DialogDescription>
                    Crea un nuevo formulario para recopilar información de tus usuarios.
                  </DialogDescription>
                </DialogHeader>

                {/* Add a Tabs component to create a multi-step form creation process */}
                <Tabs defaultValue="basic" className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Información Básica</TabsTrigger>
                    <TabsTrigger value="template">Plantilla</TabsTrigger>
                    <TabsTrigger value="customize">Personalizar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="py-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="form-name">Nombre del Formulario</Label>
                        <Input
                          id="form-name"
                          placeholder="ej. Encuesta de Cliente"
                          value={newForm.name}
                          onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="form-description">Descripción (Opcional)</Label>
                        <Textarea
                          id="form-description"
                          placeholder="Describe el propósito de este formulario"
                          value={newForm.description}
                          onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="template" className="py-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="form-template">Comenzar con una Plantilla</Label>
                        <Select
                          value={newForm.template}
                          onValueChange={(value) => setNewForm({ ...newForm, template: value })}
                        >
                          <SelectTrigger id="form-template">
                            <SelectValue placeholder="Selecciona una plantilla" />
                          </SelectTrigger>
                          <SelectContent>
                            {formTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formTemplates.find((t) => t.id === newForm.template)?.description}
                        </p>
                      </div>

                      {/* Template preview */}
                      <div className="border rounded-md p-4 mt-2">
                        <h4 className="text-sm font-medium mb-2">Vista Previa de Plantilla</h4>
                        <div className="space-y-3">
                          {newForm.template === "blank" ? (
                            <p className="text-sm text-muted-foreground">
                              Esta plantilla no tiene campos predefinidos.
                            </p>
                          ) : newForm.template === "contact" ? (
                            <>
                              <div className="space-y-1">
                                <Label>Nombre Completo</Label>
                                <Input disabled placeholder="Ingresa tu nombre completo" />
                              </div>
                              <div className="space-y-1">
                                <Label>Dirección de Email</Label>
                                <Input disabled placeholder="Ingresa tu dirección de email" />
                              </div>
                              <div className="space-y-1">
                                <Label>Mensaje</Label>
                                <Textarea disabled placeholder="Ingresa tu mensaje" />
                              </div>
                            </>
                          ) : newForm.template === "feedback" ? (
                            <>
                              <div className="space-y-1">
                                <Label>Nombre</Label>
                                <Input disabled placeholder="Ingresa tu nombre" />
                              </div>
                              <div className="space-y-1">
                                <Label>Calificación</Label>
                                <Select disabled>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu calificación" />
                                  </SelectTrigger>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label>Comentarios</Label>
                                <Textarea disabled placeholder="Por favor comparte tus comentarios" />
                              </div>
                            </>
                          ) : newForm.template === "order" ? (
                            <>
                              <div className="space-y-1">
                                <Label>Nombre del Cliente</Label>
                                <Input disabled placeholder="Ingresa tu nombre completo" />
                              </div>
                              <div className="space-y-1">
                                <Label>Producto</Label>
                                <Select disabled>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un producto" />
                                  </SelectTrigger>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label>Cantidad</Label>
                                <Input disabled type="number" placeholder="Ingresa la cantidad" />
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Selecciona una plantilla para ver una vista previa.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="customize" className="py-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Conexión a Base de Datos</Label>
                          <Switch
                            defaultChecked
                            id="db-connection"
                            checked={true}
                            onCheckedChange={(checked) =>
                              setNewForm({ ...newForm, database: checked ? "customers" : "" })
                            }
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Almacena los envíos del formulario en tu base de datos
                        </p>

                        <div className="mt-4">
                          <Label htmlFor="database-select">Seleccionar Base de Datos</Label>
                          <Select
                            defaultValue="customers"
                            value={newForm.database}
                            onValueChange={(value) => setNewForm({ ...newForm, database: value })}
                            disabled={!newForm.database}
                          >
                            <SelectTrigger id="database-select">
                              <SelectValue placeholder="Seleccionar base de datos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customers">Clientes</SelectItem>
                              <SelectItem value="employees">Empleados</SelectItem>
                              <SelectItem value="projects">Proyectos</SelectItem>
                              <SelectItem value="orders">Pedidos</SelectItem>
                              <SelectItem value="products">Productos</SelectItem>
                              <SelectItem value="new">Crear Nueva Base de Datos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="space-y-2">
                        <Label>Integraciones Externas</Label>
                        <p className="text-sm text-muted-foreground">Conecta tu formulario a servicios externos</p>

                        <div className="flex items-center space-x-2 mt-4">
                          <Checkbox
                            id="google-sheets"
                            checked={newForm.googleSheets}
                            onCheckedChange={(checked) => setNewForm({ ...newForm, googleSheets: !!checked })}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="google-sheets" className="text-sm font-medium flex items-center">
                              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                              Google Sheets
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Guarda los envíos del formulario en una hoja de Google
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mt-4">
                          <Checkbox
                            id="google-docs"
                            checked={newForm.googleDocs}
                            onCheckedChange={(checked) => setNewForm({ ...newForm, googleDocs: !!checked })}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="google-docs" className="text-sm font-medium flex items-center">
                              <FileText2 className="h-4 w-4 mr-2 text-blue-600" />
                              Google Docs
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Genera documentos a partir de los envíos del formulario
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mt-4">
                          <Checkbox id="webhook" checked={false} disabled />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="webhook" className="text-sm font-medium flex items-center">
                              <Webhook className="h-4 w-4 mr-2 text-purple-600" />
                              Webhook (Próximamente)
                            </Label>
                            <p className="text-sm text-muted-foreground">Envía datos a endpoints personalizados</p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="space-y-2">
                        <Label>Personalización de Campos</Label>
                        <p className="text-sm text-muted-foreground">
                          Puedes agregar, eliminar o editar campos en el constructor de formularios después de la
                          creación.
                        </p>

                        <div className="border rounded-md p-3 mt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                Campos Estimados:{" "}
                                {newForm.template === "blank"
                                  ? "0"
                                  : newForm.template === "contact"
                                    ? "4"
                                    : newForm.template === "feedback"
                                      ? "4"
                                      : newForm.template === "registration"
                                        ? "5"
                                        : newForm.template === "order"
                                          ? "5"
                                          : newForm.template === "support"
                                            ? "5"
                                            : "0"}
                              </span>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Personalizable
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="space-y-2">
                        <Label>Opciones Adicionales</Label>

                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id="email-notifications"
                            defaultChecked
                            checked={newForm.enableNotifications}
                            onCheckedChange={(checked) => setNewForm({ ...newForm, enableNotifications: !!checked })}
                          />
                          <Label htmlFor="email-notifications" className="text-sm flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-blue-600" />
                            Habilitar notificaciones por email
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id="workflow-trigger"
                            checked={newForm.enableWorkflow}
                            onCheckedChange={(checked) => setNewForm({ ...newForm, enableWorkflow: !!checked })}
                          />
                          <Label htmlFor="workflow-trigger" className="text-sm flex items-center">
                            <GitBranch className="h-4 w-4 mr-2 text-amber-600" />
                            Activar flujo de trabajo al enviar
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id="captcha"
                            defaultChecked
                            checked={newForm.enableCaptcha}
                            onCheckedChange={(checked) => setNewForm({ ...newForm, enableCaptcha: !!checked })}
                          />
                          <Label htmlFor="captcha" className="text-sm">
                            Habilitar protección CAPTCHA
                          </Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setShowNewForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addNewForm} disabled={!newForm.name}>
                    Crear y Personalizar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="border rounded-lg">
            <div className="p-4 flex items-center gap-4">
              <Input placeholder="Buscar formularios..." className="max-w-sm" />
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="active">Activos</TabsTrigger>
                  <TabsTrigger value="draft">Borrador</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {forms.map((form) => (
                  <Card key={form.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle>{form.name}</CardTitle>
                        <CardDescription>Creado {form.created}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link
                              href={`/dashboard/form-builder/${form.id}`}
                              onClick={(e) => {
                                e.preventDefault()
                                router.push(`/dashboard/form-builder/${form.id}`)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="text-sm font-medium">Envíos</div>
                          <div className="text-2xl font-bold">{form.submissions}</div>
                        </div>
                        <div className="flex h-8 items-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              form.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {form.status === "active" ? "Activo" : "Borrador"}
                          </span>
                        </div>
                      </div>

                      {form.connections.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {form.connections.includes("database") && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-50">
                              <Database className="h-3 w-3 mr-1" />
                              {form.databaseName || "Base de Datos"}
                            </Badge>
                          )}
                          {form.connections.includes("email") && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-50"
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Badge>
                          )}
                          {form.connections.includes("workflow") && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-50">
                              <GitBranch className="h-3 w-3 mr-1" />
                              Flujo de Trabajo
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between mt-auto">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/forms/${form.id}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Formulario
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          router.push(`/dashboard/form-builder/${form.id}`)
                        }}
                      >
                        Editar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                <Card className="flex flex-col items-center justify-center p-6 h-full">
                  <div className="rounded-full bg-muted p-3">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 font-medium">Crear Nuevo Formulario</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Comienza a construir un nuevo formulario para tu negocio
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => setShowNewForm(true)}>
                    Crear Formulario
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
