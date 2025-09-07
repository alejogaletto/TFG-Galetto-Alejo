"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Eye,
  FileText,
  LayoutGrid,
  List,
  ListChecks,
  Mail,
  Minus,
  Phone,
  Plus,
  Save,
  Settings,
  Trash,
  Type,
  User,
  Copy,
  Database,
  AlertCircle,
  FileSpreadsheet,
  FileTextIcon as FileText2,
  Webhook,
  HelpCircle,
  RefreshCw,
  Layers,
  Shield,
  ArrowRight,
  Pencil,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock database data - in a real app, this would come from an API call
const databaseTemplates: Record<string, any> = {
  customers: {
    id: "customers",
    name: "Customers",
    description: "Customer information database",
    tables: [
      {
        id: 1,
        name: "Customers",
        description: "Store customer information",
        fields: [
          { id: 1, name: "id", type: "id", required: true, unique: true, isPrimary: true },
          { id: 2, name: "name", type: "text", required: true, unique: false },
          { id: 3, name: "email", type: "email", required: true, unique: true },
          { id: 4, name: "phone", type: "text", required: false, unique: false },
          { id: 5, name: "created_at", type: "datetime", required: true, unique: false },
        ],
      },
    ],
  },
  products: {
    id: "products",
    name: "Products",
    description: "Product catalog database",
    tables: [
      {
        id: 1,
        name: "Products",
        description: "Store product information",
        fields: [
          { id: 1, name: "id", type: "id", required: true, unique: true, isPrimary: true },
          { id: 2, name: "name", type: "text", required: true, unique: true },
          { id: 3, name: "description", type: "text", required: false, unique: false },
          { id: 4, name: "price", type: "number", required: true, unique: false },
          { id: 5, name: "category", type: "text", required: true, unique: false },
          { id: 6, name: "in_stock", type: "boolean", required: true, unique: false },
        ],
      },
    ],
  },
  orders: {
    id: "orders",
    name: "Orders",
    description: "Customer orders database",
    tables: [
      {
        id: 1,
        name: "Orders",
        description: "Store order information",
        fields: [
          { id: 1, name: "id", type: "id", required: true, unique: true, isPrimary: true },
          { id: 2, name: "customer_id", type: "number", required: true, unique: false },
          { id: 3, name: "order_date", type: "datetime", required: true, unique: false },
          { id: 4, name: "status", type: "text", required: true, unique: false },
          { id: 5, name: "total", type: "number", required: true, unique: false },
        ],
      },
      {
        id: 2,
        name: "OrderItems",
        description: "Store order line items",
        fields: [
          { id: 1, name: "id", type: "id", required: true, unique: true, isPrimary: true },
          { id: 2, name: "order_id", type: "number", required: true, unique: false },
          { id: 3, name: "product_id", type: "number", required: true, unique: false },
          { id: 4, name: "quantity", type: "number", required: true, unique: false },
          { id: 5, name: "price", type: "number", required: true, unique: false },
        ],
      },
    ],
  },
  employees: {
    id: "employees",
    name: "Employees",
    description: "Employee information database",
    tables: [
      {
        id: 1,
        name: "Employees",
        description: "Store employee information",
        fields: [
          { id: 1, name: "id", type: "id", required: true, unique: true, isPrimary: true },
          { id: 2, name: "first_name", type: "text", required: true, unique: false },
          { id: 3, name: "last_name", type: "text", required: true, unique: false },
          { id: 4, name: "email", type: "email", required: true, unique: true },
          { id: 5, name: "position", type: "text", required: true, unique: false },
          { id: 6, name: "department", type: "text", required: true, unique: false },
          { id: 7, name: "hire_date", type: "datetime", required: true, unique: false },
        ],
      },
    ],
  },
}

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params?.id

  const [formTitle, setFormTitle] = useState("Nuevo Formulario")
  const [formDescription, setFormDescription] = useState("Recopila información de tus clientes")
  const [activeTab, setActiveTab] = useState("design")
  const [showFieldSettings, setShowFieldSettings] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElement, setDraggedElement] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const dropAreaRef = useRef(null)

  // Database connection state
  const [connectedDatabase, setConnectedDatabase] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [showDatabaseConnect, setShowDatabaseConnect] = useState(false)
  const [autoMapFields, setAutoMapFields] = useState(true)
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({})

  // Integration options
  const [integrations, setIntegrations] = useState({
    googleSheets: false,
    googleDocs: false,
    webhook: false,
  })

  // Default form elements
  const [formElements, setFormElements] = useState<any[]>([])

  // Template definitions
  const templates: Record<string, any[]> = {
    blank: [],
    contact: [
      {
        id: 1,
        type: "text",
        label: "Nombre Completo",
        placeholder: "Ingresa tu nombre completo",
        required: true,
        helpText: "Por favor ingresa tu nombre legal como aparece en tu identificación",
        validation: "none",
        dbField: "name",
      },
      {
        id: 2,
        type: "email",
        label: "Dirección de Email",
        placeholder: "Ingresa tu dirección de email",
        required: true,
        helpText: "Nunca compartiremos tu email con nadie más",
        validation: "email",
        dbField: "email",
      },
      {
        id: 3,
        type: "phone",
        label: "Número de Teléfono",
        placeholder: "Ingresa tu número de teléfono",
        required: false,
        helpText: "Incluye código de país si es internacional",
        validation: "phone",
        dbField: "phone",
      },
      {
        id: 4,
        type: "textarea",
        label: "Mensaje",
        placeholder: "Ingresa tu mensaje",
        required: false,
        helpText: "Por favor proporciona tanto detalle como sea posible",
        rows: 4,
      },
    ],
    feedback: [
      {
        id: 1,
        type: "text",
        label: "Nombre",
        placeholder: "Ingresa tu nombre",
        required: false,
        helpText: "",
        validation: "none",
        dbField: "name",
      },
      {
        id: 2,
        type: "email",
        label: "Dirección de Email",
        placeholder: "Ingresa tu dirección de email",
        required: true,
        helpText: "",
        validation: "email",
        dbField: "email",
      },
      {
        id: 3,
        type: "select",
        label: "Calificación",
        placeholder: "Selecciona tu calificación",
        required: true,
        helpText: "¿Cómo calificarías tu experiencia?",
        options: ["Excelente", "Bueno", "Promedio", "Malo", "Muy Malo"],
      },
      {
        id: 4,
        type: "textarea",
        label: "Comentarios",
        placeholder: "Por favor comparte tus comentarios",
        required: true,
        helpText: "Dinos qué te gustó o cómo podemos mejorar",
        rows: 4,
      },
    ],
    registration: [
      {
        id: 1,
        type: "text",
        label: "Nombre Completo",
        placeholder: "Ingresa tu nombre completo",
        required: true,
        helpText: "",
        validation: "none",
        dbField: "name",
      },
      {
        id: 2,
        type: "email",
        label: "Dirección de Email",
        placeholder: "Ingresa tu dirección de email",
        required: true,
        helpText: "Enviaremos confirmación a este email",
        validation: "email",
        dbField: "email",
      },
      {
        id: 3,
        type: "phone",
        label: "Número de Teléfono",
        placeholder: "Ingresa tu número de teléfono",
        required: true,
        helpText: "",
        validation: "phone",
        dbField: "phone",
      },
      {
        id: 4,
        type: "select",
        label: "Evento",
        placeholder: "Selecciona un evento",
        required: true,
        helpText: "¿Para qué evento te estás registrando?",
        options: ["Conferencia 2023", "Taller: Técnicas Avanzadas", "Evento de Networking", "Lanzamiento de Producto"],
      },
      {
        id: 5,
        type: "checkbox",
        label: "Acepto los términos y condiciones",
        required: true,
        helpText: "",
      },
    ],
  }

  // Initialize form based on template when component mounts
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        if (formId === "new") {
          // New form - no need to load anything
          setIsLoading(false)
          return
        }

        // Fetch the actual form data from the API
        const response = await fetch(`/api/forms/${formId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const formData = await response.json()
        
        // Set form title and description
        setFormTitle(formData.name || "Nuevo Formulario")
        setFormDescription(formData.description || "Recopila información de tus clientes")
        
        // Check if the form has a template configuration
        if (formData.configs && formData.configs.template) {
          const templateId = formData.configs.template as keyof typeof templates
          
          // Apply the template if it exists
          if (templates[templateId]) {
            setFormElements(templates[templateId])
            console.log(`Applied template: ${templateId}`, templates[templateId])
          } else {
            console.warn(`Template ${templateId} not found, starting with blank form`)
            setFormElements([])
          }
          
          // Set database connection if configured
          if (formData.configs.database) {
            const dbKey = formData.configs.database as keyof typeof databaseTemplates
            setConnectedDatabase(dbKey)
            // Try to find a suitable table for the database
            const db = databaseTemplates[dbKey]
            if (db && db.tables.length > 0) {
              setSelectedTable(db.tables[0].name)
            }
          }
          
          // Set other configurations
          if (formData.configs.enableNotifications !== undefined) {
            // Handle notifications if needed
          }
          
          if (formData.configs.enableWorkflow !== undefined) {
            // Handle workflow if needed
          }
          
          if (formData.configs.enableCaptcha !== undefined) {
            // Handle captcha if needed
          }
          
          if (formData.configs.googleSheets !== undefined) {
            setIntegrations(prev => ({ ...prev, googleSheets: !!formData.configs.googleSheets }))
          }
          
          if (formData.configs.googleDocs !== undefined) {
            setIntegrations(prev => ({ ...prev, googleDocs: !!formData.configs.googleDocs }))
          }
        } else {
          // No template specified, start with blank form
          console.log("No template specified, starting with blank form")
          setFormElements([])
        }
        
        // If we have form fields from the database, load them instead of template
        if (formData.fields && formData.fields.length > 0) {
          // Convert FormField objects to form elements
          const loadedElements = formData.fields.map((field: any, index: number) => ({
            id: field.id || index + 1,
            type: field.type || "text",
            label: field.label || `Campo ${index + 1}`,
            placeholder: field.configs?.placeholder || "",
            required: field.configs?.required || false,
            helpText: field.configs?.helpText || "",
            options: field.configs?.options || [],
            rows: field.configs?.rows || 3,
            dbField: field.configs?.dbField || null,
          }))
          
          setFormElements(loadedElements)
          console.log("Loaded form fields from database:", loadedElements)
        }
        
      } catch (error) {
        console.error("Error fetching form data:", error)
        // Fallback to blank form
        setFormElements([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFormData()
  }, [formId])

  // Add a loading state to handle initial rendering
  const [isLoading, setIsLoading] = useState(true)

  // Add this useEffect to handle loading state
  useEffect(() => {
    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const fieldTypes = [
    { type: "text", label: "Texto", icon: <Type className="h-4 w-4" /> },
    { type: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
    { type: "number", label: "Número", icon: <ListChecks className="h-4 w-4" /> },
    { type: "phone", label: "Teléfono", icon: <Phone className="h-4 w-4" /> },
    { type: "textarea", label: "Área de Texto", icon: <List className="h-4 w-4" /> },
    { type: "checkbox", label: "Casilla", icon: <Check className="h-4 w-4" /> },
    { type: "select", label: "Lista", icon: <ChevronDown className="h-4 w-4" /> },
    { type: "radio", label: "Opción", icon: <Circle className="h-4 w-4" /> },
    { type: "date", label: "Fecha", icon: <Calendar className="h-4 w-4" /> },
    { type: "name", label: "Nombre", icon: <User className="h-4 w-4" /> },
  ]

  // Function to connect to a database
  const handleConnectToDatabase = () => {
    if (!connectedDatabase || !selectedTable) return

    // Create field mappings based on field types if autoMapFields is enabled
    if (autoMapFields) {
      const db = databaseTemplates[connectedDatabase]
      const tableData = db.tables.find((t: any) => t.name === selectedTable)

      if (tableData && tableData.fields) {
        const newMappings: Record<string, string> = {}

        // Try to automatically map form fields to database fields
        formElements.forEach((element) => {
          // Find a matching database field based on type and name similarity
          const matchingField = tableData.fields.find((field: any) => {
            // Skip ID fields
            if (field.type === "id") return false

            // Match types
            const typeMatches =
              (element.type === "text" && field.type === "text") ||
              (element.type === "email" && field.type === "email") ||
              (element.type === "number" && field.type === "number") ||
              (element.type === "phone" && field.type === "text") ||
              (element.type === "checkbox" && field.type === "boolean") ||
              (element.type === "date" && field.type === "datetime")

            // Check if field names are similar
            const elementName = element.label.toLowerCase()
            const fieldName = field.name.toLowerCase()

            return (
              typeMatches &&
              (fieldName.includes(elementName) ||
                elementName.includes(fieldName) ||
                (elementName.includes("name") && fieldName.includes("name")) ||
                (elementName.includes("email") && fieldName.includes("email")) ||
                (elementName.includes("phone") && fieldName.includes("phone")))
            )
          })

          if (matchingField) {
            newMappings[element.id] = matchingField.name
          }
        })

        setFieldMappings(newMappings)
      }
    }

    setShowDatabaseConnect(false)
  }

  const handleDragStart = (e: any, type: any) => {
    setIsDragging(true)
    setDraggedElement(type)
  }

  const handleDragOver = (e: any) => {
    e.preventDefault()
    if (dropAreaRef.current) {
      (dropAreaRef.current as any).classList.add("bg-muted")
    }
  }

  const handleDragLeave = () => {
    if (dropAreaRef.current) {
      (dropAreaRef.current as any).classList.remove("bg-muted")
    }
  }

  const handleDrop = (e: any) => {
    e.preventDefault()
    setIsDragging(false)
    if (dropAreaRef.current) {
      (dropAreaRef.current as any).classList.remove("bg-muted")
    }

    if (draggedElement) {
      addFormElement(draggedElement)
    }
  }

  const addFormElement = (type: any) => {
    const newId = formElements.length > 0 ? Math.max(...formElements.map((el) => el.id)) + 1 : 1

    const newElement: any = {
      id: newId,
      type,
      label: `Nuevo Campo de ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      placeholder: `Ingresa ${type}`,
      required: false,
      helpText: "",
    }

    // Add type-specific properties
    if (type === "select" || type === "radio") {
      newElement.options = ["Opción 1", "Opción 2", "Opción 3"]
    } else if (type === "textarea") {
      newElement.rows = 3
    } else if (type === "checkbox") {
      newElement.label = "Nueva Opción de Casilla"
    }

    setFormElements([...formElements, newElement])
    setShowWelcome(false)
  }

  const removeFormElement = (id: any) => {
    setFormElements(formElements.filter((element) => element.id !== id))
    setShowFieldSettings(null)

    // Remove any field mappings for this element
    const newMappings = { ...fieldMappings }
    delete newMappings[id]
    setFieldMappings(newMappings)
  }

  const updateFormElement = (id: any, updates: any) => {
    setFormElements(formElements.map((element) => (element.id === id ? { ...element, ...updates } : element)))
  }

  const moveFormElement = (id: any, direction: any) => {
    const index = formElements.findIndex((element) => element.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === formElements.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? index - 1 : index + 1
    const newElements = [...formElements]
    const element = newElements[index]
    newElements.splice(index, 1)
    newElements.splice(newIndex, 0, element)

    setFormElements(newElements)
  }

  const duplicateFormElement = (id: any) => {
    const element = formElements.find((element) => element.id === id)
    if (!element) return

    const newId = Math.max(...formElements.map((el) => el.id)) + 1
    const newElement = { ...element, id: newId, label: `${element.label} (Copy)` }

    setFormElements([...formElements, newElement])
  }

  const renderFormElement = (element: any) => {
    if (!element || !element.type) {
      return <div className="p-2 text-muted-foreground">Invalid field configuration</div>
    }

    try {
      switch (element.type) {
        case "text":
        case "email":
        case "number":
        case "phone":
        case "name":
          return (
            <Input
              id={`element-${element.id}`}
              type={element.type === "name" ? "text" : element.type}
              placeholder={element.placeholder || `Ingresa ${element.type}`}
            />
          )
        case "textarea":
          return (
            <Textarea
              id={`element-${element.id}`}
              placeholder={element.placeholder || "Ingresa texto"}
              rows={element.rows || 3}
            />
          )
        case "select":
          return (
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={element.placeholder || "Selecciona una opción"} />
              </SelectTrigger>
              <SelectContent>
                {(element.options || ["Opción 1", "Opción 2", "Opción 3"]).map((option: any, i: number) => (
                  <SelectItem key={i} value={String(option).toLowerCase().replace(/\s+/g, "-") || `option-${i}`}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        case "checkbox":
          return (
            <div className="flex items-center space-x-2">
              <Checkbox id={`element-${element.id}`} />
            </div>
          )
        case "radio":
          return (
            <RadioGroup defaultValue="option-1">
              {(element.options || ["Opción 1", "Opción 2", "Opción 3"]).map((option: any, i: number) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={`option-${i + 1}`} id={`option-${i + 1}-${element.id}`} />
                  <Label htmlFor={`option-${i + 1}-${element.id}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )
        case "date":
          return <Input id={`element-${element.id}`} type="date" />
        default:
          return <Input id={`element-${element.id}`} placeholder={element.placeholder || "Ingresa valor"} />
      }
    } catch (error) {
      console.error("Error rendering form element:", error)
      return <div className="p-2 text-destructive">Error rendering field</div>
    }
  }

  const renderDatabaseTag = (element: any) => {
    if (!connectedDatabase || !selectedTable || !fieldMappings[element.id]) return null

    const mappedField = fieldMappings[element.id]

    return (
      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-50">
        <Database className="h-3 w-3 mr-1" />
        {mappedField}
      </Badge>
    )
  }

  const renderFieldSettings = (element: any) => {
    if (!element) return null

    return (
      <div className="space-y-4 p-4 border rounded-md bg-muted/30">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Configuración del Campo</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowFieldSettings(null)}>
            Cerrar
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`field-label-${element.id}`}>Etiqueta</Label>
          <Input
            id={`field-label-${element.id}`}
            value={element.label}
            onChange={(e) => updateFormElement(element.id, { label: e.target.value })}
          />
        </div>

        {["text", "email", "number", "phone", "textarea", "select", "name"].includes(element.type) && (
          <div className="space-y-2">
            <Label htmlFor={`field-placeholder-${element.id}`}>Texto de Ejemplo</Label>
            <Input
              id={`field-placeholder-${element.id}`}
              value={element.placeholder}
              onChange={(e) => updateFormElement(element.id, { placeholder: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`field-help-${element.id}`}>Texto de Ayuda</Label>
          <Input
            id={`field-help-${element.id}`}
            value={element.helpText || ""}
            onChange={(e) => updateFormElement(element.id, { helpText: e.target.value })}
            placeholder="Información adicional sobre este campo"
          />
        </div>

        {element.type === "textarea" && (
          <div className="space-y-2">
            <Label htmlFor={`field-rows-${element.id}`}>Filas</Label>
            <Input
              id={`field-rows-${element.id}`}
              type="number"
              min="2"
              max="10"
              value={element.rows || 3}
              onChange={(e) => updateFormElement(element.id, { rows: Number.parseInt(e.target.value) })}
            />
          </div>
        )}

        {["select", "radio"].includes(element.type) && element.options && (
          <div className="space-y-2">
            <Label>Opciones</Label>
            <div className="space-y-2">
              {element.options.map((option: any, i: number) => (
                <div key={i} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...element.options]
                      newOptions[i] = e.target.value
                      updateFormElement(element.id, { options: newOptions })
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newOptions = element.options.filter((_: any, index: any) => index !== i)
                      updateFormElement(element.id, { options: newOptions })
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(element.options || []), `Option ${(element.options?.length || 0) + 1}`]
                  updateFormElement(element.id, { options: newOptions })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Opción
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`field-required-${element.id}`}
            checked={element.required}
            onCheckedChange={(checked) => updateFormElement(element.id, { required: checked })}
          />
          <Label htmlFor={`field-required-${element.id}`}>Campo obligatorio</Label>
        </div>

        {connectedDatabase && selectedTable && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Mapeo de Base de Datos
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Mapea este campo del formulario a un campo de la base de datos para guardar los datos
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={fieldMappings[element.id] || "not-mapped"}
              onValueChange={(value) => {
                const newMappings = { ...fieldMappings }
                if (value !== "not-mapped") {
                  newMappings[element.id] = value
                } else {
                  delete newMappings[element.id]
                }
                setFieldMappings(newMappings)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona campo de base de datos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-mapped">Sin mapear</SelectItem>
                {databaseTemplates[connectedDatabase]?.tables
                  .find((t: any) => t.name === selectedTable)
                  ?.fields.filter((f: any) => f.type !== "id") // Filter out ID fields
                  .map((field: any) => (
                    <SelectItem key={field.id} value={field.name}>
                      {field.name} ({field.type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="pt-2 flex justify-between">
          <Button variant="destructive" size="sm" onClick={() => removeFormElement(element.id)}>
            <Trash className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => duplicateFormElement(element.id)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderDatabaseConnection = () => {
    if (!connectedDatabase || !selectedTable) {
      return (
        <div className="p-4 border rounded-md bg-muted/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Conexión de Base de Datos</h3>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
              No Conectado
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Connect your form to a database to store submissions directly in your database tables. This enables you to
            easily collect, organize, and analyze your form data.
          </p>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowDatabaseConnect(true)}>
              <Database className="h-4 w-4 mr-2" />
              Conectar Base de Datos
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="p-4 border rounded-md bg-blue-50/30 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-700">Conexión de Base de Datos</h3>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Conectado
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-blue-700">Base de Datos Conectada</Label>
            <div className="flex items-center gap-2 mt-1">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{databaseTemplates[connectedDatabase]?.name}</span>
            </div>
          </div>

          <div>
            <Label className="text-sm text-blue-700">Tabla Conectada</Label>
            <div className="flex items-center gap-2 mt-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{selectedTable}</span>
            </div>
          </div>
        </div>

        {Object.keys(fieldMappings).length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-blue-700">Mapeo de Campos</Label>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowDatabaseConnect(true)}>
                <Pencil className="h-3 w-3 mr-1" />
                Editar Mapeos
              </Button>
            </div>
            <div className="bg-white/50 rounded-md p-2 text-sm">
              {Object.entries(fieldMappings).map(([formFieldId, dbField]) => {
                const formField = formElements.find((el) => el.id === Number.parseInt(formFieldId))
                if (!formField) return null
                return (
                  <div key={formFieldId} className="flex items-center justify-between py-1 border-b last:border-0">
                    <span>{formField.label}</span>
                    <div className="flex items-center">
                      <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                      <Badge variant="outline" className="bg-blue-50">
                        {dbField}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Conexión
          </Button>
        </div>
      </div>
    )
  }

  // Add this function to render external integrations
  const renderExternalIntegrations = () => {
    return (
      <div className="p-4 border rounded-md bg-green-50/30 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-700">Integraciones Externas</h3>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
            Disponible
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="google-sheets-integration"
              checked={integrations.googleSheets}
              onCheckedChange={(checked) => setIntegrations({ ...integrations, googleSheets: !!checked })}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="google-sheets-integration" className="text-sm font-medium flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Google Sheets
              </Label>
              <p className="text-sm text-muted-foreground">Guardar envíos del formulario en Google Sheets</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="google-docs-integration"
              checked={integrations.googleDocs}
              onCheckedChange={(checked) => setIntegrations({ ...integrations, googleDocs: !!checked })}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="google-docs-integration" className="text-sm font-medium flex items-center">
                <FileText2 className="h-4 w-4 mr-2 text-blue-600" />
                Google Docs
              </Label>
              <p className="text-sm text-muted-foreground">Generar documentos desde envíos del formulario</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="webhook-integration"
              checked={integrations.webhook}
              onCheckedChange={(checked) => setIntegrations({ ...integrations, webhook: !!checked })}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="webhook-integration" className="text-sm font-medium flex items-center">
                <Webhook className="h-4 w-4 mr-2 text-purple-600" />
                Webhook
              </Label>
              <p className="text-sm text-muted-foreground">Enviar datos a endpoints personalizados</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Integraciones
          </Button>
        </div>
      </div>
    )
  }

  // Modify the beginning of the return statement to handle loading
  return (
    <div className="flex min-h-screen w-full flex-col">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <p>Loading form builder...</p>
        </div>
      ) : (
        <>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <Link href="/dashboard/forms" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Volver a Formularios</span>
            </Link>
            <div className="flex items-center gap-2">
              {connectedDatabase && selectedTable && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  <Database className="h-3 w-3 mr-1" />
                  Conectado a {databaseTemplates[connectedDatabase]?.name}
                </Badge>
              )}
            </div>
            <nav className="hidden flex-1 items-center gap-6 md:flex">
              <Link className="text-sm font-medium" href="/dashboard">
                Dashboard
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
            <div className="ml-auto flex items-center gap-2">
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Vista Previa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{formTitle}</DialogTitle>
                    <DialogDescription>{formDescription}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {formElements.map((element) => (
                      <div key={element.id} className="space-y-2">
                        <Label htmlFor={`preview-${element.id}`}>
                          {element.label}
                          {element.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {renderFormElement(element)}
                        {element.helpText && <p className="text-sm text-muted-foreground">{element.helpText}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="py-2">
                    {connectedDatabase && selectedTable && (
                      <div className="flex items-center gap-2 mb-4">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">
                          Este formulario guardará datos en tu base de datos conectada{" "}
                          {databaseTemplates[connectedDatabase]?.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit">Enviar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/forms/${formId || "customer-feedback"}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Formulario Público
                </Link>
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    const payload = {
                      fields: formElements.map((el, idx) => ({
                        type: el.type,
                        label: el.label,
                        position: idx,
                        placeholder: el.placeholder,
                        required: el.required,
                        helpText: el.helpText,
                        options: el.options,
                        rows: el.rows,
                        dbField: el.dbField,
                      })),
                    }
                    const res = await fetch(`/api/forms/${formId}/publish-fields`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    })
                    if (!res.ok) {
                      console.error('Publish failed')
                      return
                    }
                  } catch (e) {
                    console.error(e)
                  }
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            </div>
          </header>
          <div className="flex flex-1">
            <aside className="w-[250px] flex-col border-r bg-muted/40 md:flex overflow-auto">
              <div className="p-4 border-b">
                <h2 className="font-semibold mb-2">Elementos del Formulario</h2>
                <div className="grid grid-cols-2 gap-2">
                  {fieldTypes.map((field) => (
                    <div
                      key={field.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, field.type)}
                      className="flex items-center gap-2 p-2 border rounded-md cursor-move hover:bg-muted transition-colors"
                    >
                      {field.icon}
                      <span className="text-sm">{field.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-b">
                <h2 className="font-semibold mb-2">Elementos de Diseño</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, "section")}
                    className="flex items-center gap-2 p-2 border rounded-md cursor-move hover:bg-muted transition-colors"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="text-sm">Sección</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, "separator")}
                    className="flex items-center gap-2 p-2 border rounded-md cursor-move hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                    <span className="text-sm">Divisor</span>
                  </div>
                </div>
              </div>
              {showFieldSettings !== null && (
                <div className="p-4">{renderFieldSettings(formElements.find((el) => el.id === showFieldSettings))}</div>
              )}
            </aside>
            <main className="flex flex-1 flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <div className="border-b">
                  <div className="flex items-center px-4 py-2">
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="max-w-[300px] border-none text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    />
                    <TabsList className="ml-auto">
                      <TabsTrigger value="design">Diseño</TabsTrigger>
                      <TabsTrigger value="settings">Configuración</TabsTrigger>
                      <TabsTrigger value="integrations">Integraciones</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                <TabsContent value="design" className="flex-1 p-4">
                  <div className="mx-auto max-w-[800px]">
                    {showWelcome && formElements.length === 0 && (
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Comenzar</AlertTitle>
                        <AlertDescription>
                          Arrastra y suelta elementos del formulario desde la barra lateral para comenzar a construir tu
                          formulario, o elige de las opciones rápidas de abajo.
                        </AlertDescription>
                      </Alert>
                    )}

                    {renderDatabaseConnection()}

                    <Card>
                      <CardContent
                        className="p-6"
                        ref={dropAreaRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {isDragging && formElements.length === 0 && (
                          <div className="border-2 border-dashed rounded-md p-8 flex items-center justify-center">
                            <p className="text-muted-foreground">Suelta aquí para agregar un nuevo campo</p>
                          </div>
                        )}

                        {formElements.map((element, index) => (
                          <div key={element.id} className="mb-6 relative group">
                            <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveFormElement(element.id, "up")}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveFormElement(element.id, "down")}
                                disabled={index === formElements.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setShowFieldSettings(element.id)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Editar Configuración
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => duplicateFormElement(element.id)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateFormElement(element.id, { required: !element.required })}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    {element.required ? "Hacer Opcional" : "Hacer Obligatorio"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => removeFormElement(element.id)}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div
                              className="space-y-2 p-4 border rounded-md hover:border-primary/50 transition-colors cursor-pointer"
                              onClick={() => setShowFieldSettings(element.id)}
                            >
                              <div className="flex items-center">
                                <Label htmlFor={`element-${element.id}`}>
                                  {element.label}
                                  {element.required && <span className="text-destructive ml-1">*</span>}
                                </Label>
                                {renderDatabaseTag(element)}
                              </div>
                              {renderFormElement(element)}
                              {element.helpText && <p className="text-sm text-muted-foreground">{element.helpText}</p>}
                            </div>
                          </div>
                        ))}

                        {formElements.length === 0 && !isDragging && (
                          <div className="border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center">
                            <FileText className="h-8 w-8 mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">Arrastra y suelta elementos del formulario aquí</p>
                            <p className="text-xs text-muted-foreground mb-4">o elige de las opciones rápidas</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              <Button variant="outline" size="sm" onClick={() => addFormElement("text")}>
                                <Type className="h-4 w-4 mr-2" />
                                Texto
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => addFormElement("email")}>
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => addFormElement("select")}>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                Lista
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => addFormElement("textarea")}>
                                <List className="h-4 w-4 mr-2" />
                                Área de Texto
                              </Button>
                            </div>
                          </div>
                        )}

                        {formElements.length > 0 && (
                          <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={() => addFormElement("text")}>
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Campo
                            </Button>
                            <Button>Enviar</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="p-4">
                  <div className="mx-auto max-w-[800px]">
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="form-name">Nombre del Formulario</Label>
                          <Input id="form-name" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="form-description">Descripción</Label>
                          <Textarea
                            id="form-description"
                            placeholder="Ingresa una descripción para tu formulario"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                          />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label htmlFor="success-message">Mensaje de Éxito</Label>
                          <Textarea
                            id="success-message"
                            placeholder="Mensaje a mostrar después de un envío exitoso"
                            defaultValue="¡Gracias por tu envío!"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="redirect-url">URL de Redirección (Opcional)</Label>
                          <Input id="redirect-url" placeholder="https://example.com/thank-you" />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label>Notificaciones del Formulario</Label>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Notificaciones por Email</p>
                              <p className="text-sm text-muted-foreground">
                                Recibir email cuando se envíe el formulario
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="pt-2">
                            <Input
                              placeholder="Dirección de email para notificaciones"
                              defaultValue="admin@example.com"
                            />
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label>Estilo del Formulario</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="primary-color">Color Primario</Label>
                              <div className="flex">
                                <Input
                                  id="primary-color"
                                  type="color"
                                  defaultValue="#0f172a"
                                  className="w-12 p-1 h-10"
                                />
                                <Input defaultValue="#0f172a" className="flex-1 ml-2" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="font-family">Familia de Fuente</Label>
                              <Select defaultValue="inter">
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar fuente" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="inter">Inter</SelectItem>
                                  <SelectItem value="roboto">Roboto</SelectItem>
                                  <SelectItem value="opensans">Open Sans</SelectItem>
                                  <SelectItem value="lato">Lato</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <Separator />

                        {/* Database Connection Section */}
                        <div className="space-y-2">
                          <Label className="text-lg">Database Connection</Label>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Connect to Database</p>
                              <p className="text-sm text-muted-foreground">Store form submissions in your database</p>
                            </div>
                            <Switch
                              checked={!!connectedDatabase}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  setConnectedDatabase(null)
                                  setSelectedTable(null)
                                  setFieldMappings({})
                                } else {
                                  setShowDatabaseConnect(true)
                                }
                              }}
                            />
                          </div>

                          {connectedDatabase && (
                            <div className="p-4 mt-2 border rounded-md bg-blue-50/30">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Database className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">{databaseTemplates[connectedDatabase]?.name}</span>
                                </div>
                                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                  Connected
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-3">
                                Your form is connected to the <span className="font-medium">{selectedTable}</span> table
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <span className="text-blue-700 font-medium">{Object.keys(fieldMappings).length}</span>{" "}
                                  fields mapped
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => setShowDatabaseConnect(true)}
                                >
                                  Configure
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />
                        <div className="space-y-2">
                          <Label>Form Security</Label>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                <p className="text-sm font-medium">CAPTCHA Protection</p>
                              </div>
                              <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5 flex items-center gap-2">
                                <Layers className="h-4 w-4 text-amber-600" />
                                <p className="text-sm font-medium">Rate Limiting</p>
                              </div>
                              <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5 flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-blue-600" />
                                <p className="text-sm font-medium">Submission Limit</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch />
                                <Input type="number" className="w-20" defaultValue="100" min="1" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="integrations" className="p-4">
                  <div className="mx-auto max-w-[800px]">
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        {renderExternalIntegrations()}

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-md font-medium">Google Sheets Integration</h3>
                          <p className="text-sm text-muted-foreground">Map form fields to Google Sheets columns</p>

                          {integrations.googleSheets &&
                            formElements.map((element) => (
                              <div
                                key={`mapping-${element.id}`}
                                className="flex items-center gap-4 p-3 border rounded-md"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{element.label}</p>
                                  <p className="text-xs text-muted-foreground">{element.type} field</p>
                                </div>
                                <div className="flex-1">
                                  <Select defaultValue={`field_${element.id}`}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Map to column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={`field_${element.id}`}>
                                        {element.type === "text" && "Name"}
                                        {element.type === "email" && "Email Address"}
                                        {element.type === "select" && "Category"}
                                        {element.type === "textarea" && "Description"}
                                        {!["text", "email", "select", "textarea"].includes(element.type) && "Field"}
                                      </SelectItem>
                                      <SelectItem value="custom">Custom Column</SelectItem>
                                      <SelectItem value="none">Don't Map</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}

                          {!integrations.googleSheets && (
                            <div className="p-4 border border-dashed rounded-md text-center">
                              <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-muted-foreground">Enable Google Sheets integration to map fields</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setIntegrations({ ...integrations, googleSheets: true })}
                              >
                                Enable Integration
                              </Button>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-md font-medium">Webhook Integration</h3>
                          <p className="text-sm text-muted-foreground">Send data to custom endpoints</p>

                          {integrations.webhook ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="webhook-url">Webhook URL</Label>
                                <Input id="webhook-url" placeholder="https://example.com/webhook" />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="data-format">Data Format</Label>
                                <Select defaultValue="json">
                                  <SelectTrigger id="data-format">
                                    <SelectValue placeholder="Select format" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="json">JSON</SelectItem>
                                    <SelectItem value="xml">XML</SelectItem>
                                    <SelectItem value="form">Form Data</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox id="include-metadata" defaultChecked />
                                <Label htmlFor="include-metadata">Include submission metadata</Label>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 border border-dashed rounded-md text-center">
                              <Webhook className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                Enable Webhook integration to send data to custom endpoints
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setIntegrations({ ...integrations, webhook: true })}
                              >
                                Enable Integration
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </main>
          </div>

          {/* Database Connection Dialog */}
          <Dialog open={showDatabaseConnect} onOpenChange={setShowDatabaseConnect}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Conectar Base de Datos</DialogTitle>
                <DialogDescription>
                  Vincula tu formulario a una base de datos para almacenar envíos y usar campos de base de datos para la
                  generación de formularios.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="database-select">Seleccionar Base de Datos</Label>
                  <Select
                    value={connectedDatabase || "none"}
                    onValueChange={(value) => {
                      setConnectedDatabase(value === "none" ? null : value)
                      setSelectedTable(null)
                      setFieldMappings({})
                    }}
                  >
                    <SelectTrigger id="database-select">
                      <SelectValue placeholder="Selecciona una base de datos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna (Desconectar)</SelectItem>
                      {Object.values(databaseTemplates).map((db) => (
                        <SelectItem key={db.id} value={db.id}>
                          {db.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {connectedDatabase && (
                  <div className="space-y-2">
                    <Label htmlFor="table-select">Seleccionar Tabla</Label>
                    <Select
                      value={selectedTable || "none"}
                      onValueChange={(value) => {
                        setSelectedTable(value === "none" ? null : value)
                        setFieldMappings({})
                      }}
                    >
                      <SelectTrigger id="table-select">
                        <SelectValue placeholder="Selecciona una tabla" />
                      </SelectTrigger>
                      <SelectContent>
                        {databaseTemplates[connectedDatabase]?.tables.map((table: any) => (
                          <SelectItem key={table.id} value={table.name}>
                            {table.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {connectedDatabase && selectedTable && (
                  <>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="auto-map"
                        checked={autoMapFields}
                        onCheckedChange={(checked) => setAutoMapFields(!!checked)}
                      />
                      <Label htmlFor="auto-map">Mapear automáticamente campos basado en tipo y nombre</Label>
                    </div>

                    <div className="pt-2">
                      <Label className="mb-2 block">Mapeo de Campos</Label>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Campo del Formulario</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                              <TableHead>Campo de Base de Datos</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formElements.map((element) => (
                              <TableRow key={element.id}>
                                <TableCell className="font-medium">
                                  {element.label}
                                  {element.required && <span className="text-red-500">*</span>}
                                </TableCell>
                                <TableCell>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={fieldMappings[element.id] || "not-mapped"}
                                    onValueChange={(value) => {
                                      const newMappings = { ...fieldMappings }
                                      if (value !== "not-mapped") {
                                        newMappings[element.id] = value
                                      } else {
                                        delete newMappings[element.id]
                                      }
                                      setFieldMappings(newMappings)
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Sin mapear" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not-mapped">Sin mapear</SelectItem>
                                      {databaseTemplates[connectedDatabase]?.tables
                                        .find((t: any) => t.name === selectedTable)
                                        ?.fields.filter((f: any) => f.type !== "id")
                                        .map((field: any) => (
                                          <SelectItem key={field.id} value={field.name}>
                                            {field.name} ({field.type})
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-md p-3 mt-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5"/>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Cómo se guardan los datos del formulario</p>
                          <p className="text-sm text-blue-600">
                            Los envíos del formulario se almacenarán como nuevos registros en la tabla {selectedTable}.
                            Los campos mapeados guardarán datos en los campos correspondientes de la base de datos. Los
                            campos que no estén mapeados no se guardarán.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDatabaseConnect(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConnectToDatabase} disabled={!connectedDatabase || !selectedTable}>
                  Conectar Base de Datos
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
