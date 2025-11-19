"use client"

import { useState, useEffect } from "react"
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
  Home,
  Workflow,
  BarChart3,
  Settings,
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
import { Form as FormType } from "@/lib/types"
import { NotificationIcon } from "@/components/notifications/notification-icon"

export default function FormsPage() {
  const router = useRouter()
  const [forms, setForms] = useState<FormType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableDatabases, setAvailableDatabases] = useState<Array<{ id: number; name: string }>>([])
  const [googleConnected, setGoogleConnected] = useState(false)

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/forms');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setForms(data);
      } catch (error) {
        console.error("Error fetching forms:", error);
        setError("Error al cargar los formularios");
      } finally {
        setIsLoading(false)
      }
    };
    fetchForms();
  }, []);

  // Fetch existing databases for the dropdown
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const res = await fetch('/api/virtual-schemas')
        if (!res.ok) return
        const data = await res.json()
        const list = (Array.isArray(data) ? data : []).map((d: any) => ({ id: d.id, name: d.name }))
        setAvailableDatabases(list)
      } catch (e) {
        // silent fail for dropdown
      }
    }
    fetchDatabases()
  }, [])

  // Check Google OAuth connection status (cookies)
  useEffect(() => {
    const checkGoogle = async () => {
      try {
        const res = await fetch('/api/auth/google/status', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (typeof data.connected === 'boolean') setGoogleConnected(data.connected)
      } catch {}
    }
    checkGoogle()
  }, [])

  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({
    name: "",
    description: "",
    template: "blank",
    database: "",
    databaseId: null as number | null,
    enableNotifications: true,
    enableWorkflow: false,
    enableCaptcha: true,
    googleSheets: false,
    googleDocs: false,
    googleSheetsSpreadsheetId: "",
    googleSheetsSheetName: "",
  })

  const formTemplates = [
    { id: "blank", name: "Formulario en Blanco", description: "Comienza con un formulario completamente en blanco" },
    { id: "contact", name: "Formulario de Contacto", description: "Recopila información de contacto" },
    { id: "feedback", name: "Formulario de Comentarios", description: "Recopila comentarios de clientes" },
    { id: "registration", name: "Formulario de Registro", description: "Registra usuarios para eventos" },
    { id: "order", name: "Formulario de Pedido", description: "Procesa pedidos de clientes" },
    { id: "support", name: "Ticket de Soporte", description: "Maneja solicitudes de soporte" },
  ]

  const addNewForm = async () => {
    if (!newForm.name.trim()) {
      setError("El nombre del formulario es requerido");
      return;
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newForm.name.trim(),
          description: newForm.description.trim(),
          configs: { 
            template: newForm.template, 
            enableNotifications: newForm.enableNotifications, 
            enableWorkflow: newForm.enableWorkflow, 
            enableCaptcha: newForm.enableCaptcha, 
            googleSheets: newForm.googleSheets, 
            googleDocs: newForm.googleDocs, 
            database: newForm.database 
          },
          is_active: true,
          user_id: 1, // TODO: Replace with actual user ID from session
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const createdForm = await response.json();
      
      // Add the new form to the local state
      setForms((prevForms: FormType[]) => [...prevForms, createdForm[0]]);

      const formId = createdForm[0].id;

      // Create DataConnection if database was selected
      if (newForm.databaseId) {
        try {
          await fetch('/api/data-connections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              form_id: formId,
              virtual_schema_id: newForm.databaseId,
              virtual_table_schema_id: null, // Will be set in form builder
            }),
          });
        } catch (error) {
          console.error("Error creating data connection:", error);
          // Don't fail the form creation if data connection fails
        }
      }

      // Reset form state
      setNewForm({
        name: "",
        description: "",
        template: "blank",
        database: "",
        databaseId: null,
        enableNotifications: true,
        enableWorkflow: false,
        enableCaptcha: true,
        googleSheets: false,
        googleDocs: false,
        googleSheetsSpreadsheetId: "",
        googleSheetsSheetName: "",
      });
      
      // Close the dialog
      setShowNewForm(false);

      // Show success message (you can add a toast notification here)
      console.log("Formulario creado exitosamente:", createdForm[0].name);

      // Redirect to form builder
      router.push(`/dashboard/form-builder/${formId}`);
    } catch (error: any) {
      console.error("Error creating form:", error);
      setError(error?.message || "Error al crear el formulario");
      
      // Fallback to a simpler navigation if the router fails
      setTimeout(() => {
        window.location.href = `/dashboard/form-builder/new?template=${newForm.template || "blank"}`;
      }, 2000);
    } finally {
      setIsLoading(false)
    }
  };

  const deleteForm = async (id: number) => {
    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setForms((prevForms: FormType[]) => prevForms.filter((form: FormType) => form.id !== id));
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2 font-semibold" href="#">
          <span className="font-bold">AutomatePyme</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link className="text-sm font-medium" href="/dashboard">
            Panel
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
        <div className="ml-auto">
          <NotificationIcon />
        </div>
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
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all bg-muted text-primary text-sm"
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
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm"
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
              <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
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
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="form-description">Descripción (Opcional)</Label>
                        <Textarea
                          id="form-description"
                          placeholder="Describe el propósito de este formulario"
                          value={newForm.description}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewForm({ ...newForm, description: e.target.value })}
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
                          onValueChange={(value: string) => setNewForm({ ...newForm, template: value })}
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
                            id="db-connection"
                            checked={!!newForm.databaseId}
                            onCheckedChange={(checked) => {
                              setNewForm({
                                ...newForm,
                                databaseId: checked
                                  ? (newForm.databaseId || (availableDatabases[0]?.id || null))
                                  : null,
                                database: checked
                                  ? (newForm.database || (availableDatabases[0]?.name || ""))
                                  : "",
                              })
                            }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Almacena los envíos del formulario en tu base de datos
                        </p>

                        {newForm.databaseId !== null && (
                          <div className="mt-4">
                            <Label htmlFor="database-select">Seleccionar Base de Datos</Label>
                            <Select
                              value={newForm.databaseId?.toString() || ""}
                              onValueChange={(value: string) => {
                                if (value === "new") {
                                  // Open new database creation page in new tab
                                  window.open("/dashboard/databases/new", "_blank");
                                } else {
                                  const selectedDb = availableDatabases.find(db => db.id.toString() === value);
                                  setNewForm({ 
                                    ...newForm, 
                                    databaseId: Number(value),
                                    database: selectedDb?.name || ""
                                  });
                                }
                              }}
                            >
                              <SelectTrigger id="database-select">
                                <SelectValue placeholder="Seleccionar base de datos" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDatabases.map((db) => (
                                  <SelectItem key={db.id} value={db.id.toString()}>
                                    {db.name}
                                  </SelectItem>
                                ))}
                                <Separator className="my-2" />
                                <SelectItem value="new">
                                  <div className="flex items-center">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear Nueva Base de Datos
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
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

                        {newForm.googleSheets && (
                          <div className="grid gap-2 mt-3 p-3 border rounded-md">
                            <div className="grid gap-1">
                              <Label htmlFor="gs-spreadsheet">Spreadsheet ID</Label>
                              <Input
                                id="gs-spreadsheet"
                                placeholder="1AbCDEFgh..."
                                value={(newForm as any).googleSheetsSpreadsheetId || ""}
                                onChange={(e) => setNewForm({ ...newForm, googleSheetsSpreadsheetId: e.target.value as any })}
                              />
                            </div>
                            <div className="grid gap-1">
                              <Label htmlFor="gs-sheet">Sheet name</Label>
                              <Input
                                id="gs-sheet"
                                placeholder="Sheet1"
                                value={(newForm as any).googleSheetsSheetName || ""}
                                onChange={(e) => setNewForm({ ...newForm, googleSheetsSheetName: e.target.value as any })}
                              />
                            </div>
                            <div>
                              <Button
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/api/google/sheets/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newForm.name || 'Formulario' }) })
                                    if (!res.ok) {
                                      console.error('Failed to create sheet')
                                      return
                                    }
                                    const data = await res.json()
                                    setNewForm({
                                      ...newForm,
                                      googleSheetsSpreadsheetId: data.spreadsheetId,
                                      googleSheetsSheetName: data.sheetName,
                                    } as any)
                                  } catch (e) {
                                    console.error(e)
                                  }
                                }}
                              >
                                Crear hoja de Google
                              </Button>
                            </div>
                            {!googleConnected && (
                              <p className="text-xs text-muted-foreground">
                                Puedes configurar tus credenciales en tu{" "}
                                <Link href="/dashboard/profile?tab=google" className="underline">
                                  perfil
                                </Link>.
                              </p>
                            )}
                          </div>
                        )}

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

                        <div
                          className="flex items-center space-x-2 mt-4 opacity-50 cursor-not-allowed"
                          aria-disabled
                          title="Próximamente"
                        >
                          <Checkbox id="webhook" checked={false} disabled />
                          <div className="grid gap-1.5 leading-none border border-dashed rounded p-2 bg-muted w-full">
                            <Label htmlFor="webhook" className="text-sm font-medium flex items-center text-muted-foreground">
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
                  <Button onClick={addNewForm} disabled={isLoading || !newForm.name}>
                    {isLoading ? "Creando..." : "Crear y Personalizar"}
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
                {isLoading ? (
                  <div className="col-span-full text-center py-12">
                    <p>Cargando formularios...</p>
                  </div>
                ) : error ? (
                  <div className="col-span-full text-center py-12 text-red-500">
                    {error}
                  </div>
                ) : forms.length === 0 ? (
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
                ) : (
                  forms.map((form) => (
                    <Card key={form.id} className="flex flex-col">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                          <CardTitle>{form.name}</CardTitle>
                          <CardDescription>Creado {new Date(form.creation_date!).toLocaleDateString()}</CardDescription>
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
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteForm(form.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-sm font-medium">Estado</div>
                            <div className="text-2xl font-bold">{form.is_active ? "Activo" : "Borrador"}</div>
                          </div>
                          <div className="flex h-8 items-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                form.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {form.is_active ? "Activo" : "Borrador"}
                            </span>
                          </div>
                        </div>

                        {form.configs && form.configs.database && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-50">
                              <Database className="h-3 w-3 mr-1" />
                              {form.configs.database}
                            </Badge>
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
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
