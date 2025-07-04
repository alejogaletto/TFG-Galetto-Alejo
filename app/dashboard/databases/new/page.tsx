"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Database, Info, Lightbulb, Plus, Settings, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewDatabasePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [progress, setProgress] = useState(25)
  const [databaseType, setDatabaseType] = useState("blank")
  const [databaseName, setDatabaseName] = useState("")
  const [databaseDescription, setDatabaseDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false)
  const [showAddTableDialog, setShowAddTableDialog] = useState(false)
  const [selectedTableIndex, setSelectedTableIndex] = useState(0)

  // New field state
  const [newField, setNewField] = useState({
    name: "",
    type: "text",
    required: false,
    unique: false,
    description: "",
  })

  // New table state
  const [newTable, setNewTable] = useState({
    name: "",
    description: "",
  })

  // Tables state
  const [tables, setTables] = useState([
    {
      name: "Main Table",
      description: "Primary data table",
      fields: [
        { name: "ID", type: "id", required: true, unique: true, description: "Auto-generated identifier" },
        { name: "Name", type: "text", required: true, unique: false, description: "Name field" },
        { name: "Created At", type: "datetime", required: true, unique: false, description: "Creation timestamp" },
      ],
    },
  ])

  const handleNext = () => {
    const nextStep = step + 1
    setStep(nextStep)
    setProgress(nextStep * 25)
  }

  const handleBack = () => {
    const prevStep = step - 1
    setStep(prevStep)
    setProgress(prevStep * 25)
  }

  const handleCreateDatabase = () => {
    setIsCreating(true)
    // Simulate database creation
    setTimeout(() => {
      router.push("/dashboard/database-builder")
    }, 1500)
  }

  const handleAddField = () => {
    if (!newField.name.trim()) return

    const updatedTables = [...tables]
    updatedTables[selectedTableIndex].fields.push({
      name: newField.name,
      type: newField.type,
      required: newField.required,
      unique: newField.unique,
      description: newField.description,
    })

    setTables(updatedTables)
    setNewField({
      name: "",
      type: "text",
      required: false,
      unique: false,
      description: "",
    })
    setShowAddFieldDialog(false)
  }

  const handleAddTable = () => {
    if (!newTable.name.trim()) return

    setTables([
      ...tables,
      {
        name: newTable.name,
        description: newTable.description,
        fields: [
          { name: "ID", type: "id", required: true, unique: true, description: "Auto-generated identifier" },
          { name: "Created At", type: "datetime", required: true, unique: false, description: "Creation timestamp" },
        ],
      },
    ])

    setNewTable({
      name: "",
      description: "",
    })
    setShowAddTableDialog(false)
  }

  const handleRemoveField = (tableIndex, fieldIndex) => {
    // Don't allow removing ID field
    if (fieldIndex === 0) return

    const updatedTables = [...tables]
    updatedTables[tableIndex].fields.splice(fieldIndex, 1)
    setTables(updatedTables)
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

  const templates = [
    {
      id: "customers",
      name: "Clientes",
      description: "Almacenar y gestionar información de clientes",
      fields: ["Name", "Email", "Phone", "Address", "Created At"],
      icon: "👥",
    },
    {
      id: "products",
      name: "Productos",
      description: "Rastrea tu inventario y detalles de productos",
      fields: ["Name", "SKU", "Price", "Stock", "Category", "Description"],
      icon: "📦",
    },
    {
      id: "orders",
      name: "Pedidos",
      description: "Gestiona pedidos y transacciones de clientes",
      fields: ["Order ID", "Customer", "Products", "Total", "Status", "Date"],
      icon: "🛒",
    },
    {
      id: "tasks",
      name: "Tareas",
      description: "Rastrea tareas y gestión de proyectos",
      fields: ["Title", "Description", "Status", "Assignee", "Due Date"],
      icon: "✅",
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/databases" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Bases de Datos</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="advanced-mode" className="text-sm">
              Modo Avanzado
            </Label>
            <Switch id="advanced-mode" checked={advancedMode} onCheckedChange={setAdvancedMode} />
          </div>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Crear Nueva Base de Datos</h1>
            <p className="text-muted-foreground">
              Configuremos una nueva base de datos para tu negocio. Te guiaremos paso a paso en el proceso.
            </p>
          </div>

          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span className={step >= 1 ? "font-medium text-primary" : ""}>Elegir Plantilla</span>
              <span className={step >= 2 ? "font-medium text-primary" : ""}>Información Básica</span>
              <span className={step >= 3 ? "font-medium text-primary" : ""}>Estructura</span>
              <span className={step >= 4 ? "font-medium text-primary" : ""}>Revisar</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Comienza con una plantilla para ahorrar tiempo, o crea una base de datos en blanco si prefieres
                  construir desde cero.
                </p>
              </div>

              <RadioGroup value={databaseType} onValueChange={setDatabaseType} className="grid gap-4">
                <div
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:border-primary/50 ${databaseType === "blank" ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setDatabaseType("blank")}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium">Base de Datos en Blanco</div>
                      <div className="text-sm text-muted-foreground">
                        Comienza desde cero y construye tu propia estructura
                      </div>
                    </div>
                  </div>
                  <RadioGroupItem value="blank" id="blank" className="h-5 w-5" />
                </div>

                <div
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-not-allowed opacity-60 ${databaseType === "ai" ? "border-primary bg-primary/5" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium">Base de Datos con IA</div>
                      <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 hover:bg-blue-50">
                        Próximamente
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Describe lo que necesitas y lo construiremos para ti (En desarrollo)
                      </div>
                      <Badge variant="outline" className="mt-1 bg-purple-50 text-purple-700 hover:bg-purple-50">
                        Recomendado
                      </Badge>
                    </div>
                  </div>
                  <RadioGroupItem value="ai" id="ai" className="h-5 w-5" disabled />
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-3">O elige de una plantilla:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`flex flex-col rounded-lg border p-4 cursor-pointer hover:border-primary/50 ${databaseType === template.id ? "border-primary bg-primary/5" : ""}`}
                        onClick={() => setDatabaseType(template.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{template.icon}</div>
                            <div className="font-medium">{template.name}</div>
                          </div>
                          <RadioGroupItem value={template.id} id={template.id} className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground mb-1">Incluye campos:</div>
                          <div className="flex flex-wrap gap-1">
                            {template.fields.slice(0, 3).map((field, index) => (
                              <Badge key={index} variant="outline" className="bg-muted/50">
                                {field}
                              </Badge>
                            ))}
                            {template.fields.length > 3 && (
                              <Badge variant="outline" className="bg-muted/50">
                                +{template.fields.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RadioGroup>

              <div className="flex justify-end mt-8">
                <Button onClick={handleNext}>Continuar</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription>
                    Dale un nombre y descripción a tu base de datos para ayudarte a identificarla después.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Base de Datos</Label>
                    <Input
                      id="name"
                      placeholder="ej. Base de Datos de Clientes"
                      value={databaseName}
                      onChange={(e) => setDatabaseName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Esto se mostrará en tu panel y se usará para identificar esta base de datos.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (Opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe para qué se usará esta base de datos..."
                      value={databaseDescription}
                      onChange={(e) => setDatabaseDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {advancedMode && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Configuraciones Avanzadas</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="public" className="cursor-pointer">
                              Hacer base de datos pública
                            </Label>
                            <Switch id="public" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Las bases de datos públicas pueden ser accedidas por cualquiera con el enlace.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="versioning" className="cursor-pointer">
                              Habilitar versionado
                            </Label>
                            <Switch id="versioning" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Rastrea cambios en tu base de datos a lo largo del tiempo.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="storage">Ubicación de Almacenamiento</Label>
                          <Select defaultValue="cloud">
                            <SelectTrigger id="storage">
                              <SelectValue placeholder="Seleccionar ubicación de almacenamiento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cloud">Almacenamiento en la Nube (Predeterminado)</SelectItem>
                              <SelectItem value="local">Almacenamiento Local</SelectItem>
                              <SelectItem value="custom">Servidor Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleBack}>
                  Atrás
                </Button>
                <Button onClick={handleNext} disabled={!databaseName.trim()}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {databaseType === "ai" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Describe tu Base de Datos</CardTitle>
                    <CardDescription>
                      Dinos qué tipo de datos quieres almacenar, y crearemos la estructura para ti.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Necesito una base de datos para rastrear mi inventario con nombres de productos, cantidades, precios, proveedores y categorías..."
                      rows={6}
                      className="mb-4"
                    />
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md">
                      <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        Sé específico sobre qué campos necesitas, relaciones entre datos, y cualquier requerimiento
                        especial. Mientras más detalles proporciones, mejor podremos estructurar tu base de datos.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : databaseType === "blank" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Estructura de la Base de Datos</CardTitle>
                    <CardDescription>Define las tablas y campos para tu base de datos.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tables.map((table, tableIndex) => (
                        <div key={tableIndex} className="border rounded-md p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              <h3 className="font-medium">{table.name}</h3>
                            </div>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3.5 w-3.5 mr-1.5" />
                              Configurar
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {table.fields.map((field, fieldIndex) => (
                              <div key={fieldIndex} className="flex items-center justify-between border-b pb-2">
                                <span className="text-sm font-medium">{field.name}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{field.type}</Badge>
                                  {fieldIndex > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleRemoveField(tableIndex, fieldIndex)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => {
                                setSelectedTableIndex(tableIndex)
                                setShowAddFieldDialog(true)
                              }}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Agregar Campo
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setShowAddTableDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Otra Tabla
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Estructura de Plantilla</CardTitle>
                    <CardDescription>
                      Revisa y personaliza la estructura de tu {templates.find((t) => t.id === databaseType)?.name} base
                      de datos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <h3 className="font-medium">{templates.find((t) => t.id === databaseType)?.name}</h3>
                          </div>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3.5 w-3.5 mr-1.5" />
                            Personalizar
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {templates
                            .find((t) => t.id === databaseType)
                            ?.fields.map((field, index) => (
                              <div key={index} className="flex items-center justify-between border-b pb-2">
                                <span className="text-sm">{field}</span>
                                <Badge variant="outline">
                                  {index === 0 ? "ID" : index % 3 === 1 ? "Text" : index % 3 === 2 ? "Number" : "Date"}
                                </Badge>
                              </div>
                            ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              setSelectedTableIndex(0)
                              setShowAddFieldDialog(true)
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Agregar Campo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleBack}>
                  Atrás
                </Button>
                <Button onClick={handleNext}>Continuar</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revisar y Crear</CardTitle>
                  <CardDescription>Revisa la configuración de tu base de datos antes de crearla.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Nombre de la Base de Datos</h3>
                        <p>{databaseName || "Base de Datos Sin Título"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Tipo</h3>
                        <p className="capitalize">
                          {databaseType === "blank"
                            ? "Base de Datos en Blanco"
                            : databaseType === "ai"
                              ? "Base de Datos Generada por IA"
                              : templates.find((t) => t.id === databaseType)?.name + " Plantilla"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
                      <p>{databaseDescription || "No se proporcionó descripción."}</p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">Resumen de Estructura</h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">{tables.length}</span> tabla(s) con un total de{" "}
                          <span className="font-medium">
                            {tables.reduce((total, table) => total + table.fields.length, 0)}
                          </span>{" "}
                          campos
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {tables.map((table, index) => (
                            <Badge key={index} variant="outline" className="bg-muted/50">
                              {table.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">¿Qué sigue?</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Tu base de datos será creada con la estructura que definiste</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            Serás llevado al constructor de base de datos donde puedes personalizarla más
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            Puedes conectar formularios y flujos de trabajo a tu base de datos
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Atrás
                  </Button>
                  <Button onClick={handleCreateDatabase} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creando...
                      </>
                    ) : (
                      "Crear Base de Datos"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>

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
            <Button onClick={handleAddField} disabled={!newField.name.trim()}>
              Agregar Campo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Tu nueva tabla incluirá automáticamente campos ID y Fecha de Creación. Puedes agregar más campos después
                de crear la tabla.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTableDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTable} disabled={!newTable.name.trim()}>
              Agregar Tabla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
