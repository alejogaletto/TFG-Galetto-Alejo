"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
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

// Virtual schemas will be fetched from the API

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

  // Sidebar resize state
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Database connection state
  const [dataConnectionId, setDataConnectionId] = useState<number | null>(null)
  const [connectedSchemaId, setConnectedSchemaId] = useState<number | null>(null)
  const [connectedSchema, setConnectedSchema] = useState<any>(null)
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [showDatabaseConnect, setShowDatabaseConnect] = useState(false)
  const [autoMapFields, setAutoMapFields] = useState(true)
  const [fieldMappings, setFieldMappings] = useState<Record<number, number>>({}) // form_field_id -> virtual_field_schema_id
  const [availableSchemas, setAvailableSchemas] = useState<any[]>([])
  const [loadingSchemas, setLoadingSchemas] = useState(false)

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

        // Fetch the form data and fields separately
        const [formResponse, fieldsResponse] = await Promise.all([
          fetch(`/api/forms/${formId}`),
          fetch(`/api/form-fields?form_id=${formId}`)
        ])
        
        if (!formResponse.ok) {
          throw new Error(`HTTP error! status: ${formResponse.status}`)
        }
        
        const formData = await formResponse.json()
        
        // Set form title and description
        setFormTitle(formData.name || "Nuevo Formulario")
        setFormDescription(formData.description || "Recopila información de tus clientes")
        
        // Fetch fields from the API
        let loadedFields: any[] = []
        if (fieldsResponse.ok) {
          const fieldsData = await fieldsResponse.json()
          if (fieldsData && fieldsData.length > 0) {
            // Convert FormField objects to form elements
            loadedFields = fieldsData
              .sort((a: any, b: any) => (a.position || 0) - (b.position || 0)) // Sort by position
              .map((field: any, index: number) => ({
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
            
            setFormElements(loadedFields)
            console.log("📝 Loaded form fields from database:", loadedFields.map(f => ({ id: f.id, label: f.label })))
          }
        }
        
        // If no fields loaded, check if form has a template configuration
        if (loadedFields.length === 0 && formData.configs && formData.configs.template) {
          const templateId = formData.configs.template as keyof typeof templates
          
          // Apply the template if it exists
          if (templates[templateId]) {
            setFormElements(templates[templateId])
            console.log(`Applied template: ${templateId}`, templates[templateId])
          } else {
            console.warn(`Template ${templateId} not found, starting with blank form`)
            setFormElements([])
          }
        }
        
        // Set other configurations
        if (formData.configs?.googleSheets !== undefined) {
          setIntegrations(prev => ({ ...prev, googleSheets: !!formData.configs.googleSheets }))
        }
        
        if (formData.configs?.googleDocs !== undefined) {
          setIntegrations(prev => ({ ...prev, googleDocs: !!formData.configs.googleDocs }))
        }

        // Fetch DataConnection if exists
        console.log('🔌 Fetching DataConnection for form_id:', formId)
        const dataConnResponse = await fetch(`/api/data-connections?form_id=${formId}`)
        console.log('📡 DataConnection response status:', dataConnResponse.status)
        
        let hasDataConnection = false
        
        if (dataConnResponse.ok) {
          const dataConn = await dataConnResponse.json()
          console.log('🔗 DataConnection found:', dataConn)
          
          if (dataConn && dataConn.id) {
            hasDataConnection = true
            console.log('✅ Setting DataConnection state:', {
              dataConnectionId: dataConn.id,
              virtual_schema_id: dataConn.virtual_schema_id,
              virtual_table_schema_id: dataConn.virtual_table_schema_id
            })
            
            setDataConnectionId(dataConn.id)
            setConnectedSchemaId(dataConn.virtual_schema_id)
            setSelectedTableId(dataConn.virtual_table_schema_id)

            // Fetch the virtual schema with full tree
            if (dataConn.virtual_schema_id) {
              const schemaResponse = await fetch(`/api/virtual-schemas/${dataConn.virtual_schema_id}/tree`)
              if (schemaResponse.ok) {
                const schema = await schemaResponse.json()
                console.log('📊 Virtual schema loaded:', schema.name)
                setConnectedSchema(schema)
              }
            }

            // Fetch field mappings
            console.log('🔍 Fetching field mappings for data_connection_id:', dataConn.id)
            const mappingsResponse = await fetch(`/api/field-mappings?data_connection_id=${dataConn.id}`)
            console.log('📡 Mappings response status:', mappingsResponse.status)
            
            if (mappingsResponse.ok) {
              const mappings = await mappingsResponse.json()
              console.log('🔍 Raw field mappings from API:', mappings)
              const mappingsMap: Record<number, number> = {}
              mappings.forEach((m: any) => {
                console.log('  Mapping:', m.form_field_id, '->', m.virtual_field_schema_id)
                mappingsMap[m.form_field_id] = m.virtual_field_schema_id
              })
              console.log('🗺️ Mapped field mappings:', mappingsMap)
              console.log('📋 Loaded form field IDs:', loadedFields.map(el => el.id))
              setFieldMappings(mappingsMap)
            } else {
              console.error('❌ Failed to fetch field mappings:', await mappingsResponse.text())
            }
          } else {
            console.log('⚠️ DataConnection exists but has no ID')
          }
        } else {
          console.log('⚠️ No DataConnection found for this form')
        }

        // Migration: Check if form has old-style database config but no DataConnection
        if (formData.configs?.database && !hasDataConnection) {
          console.log("Migrating old database connection:", formData.configs.database)
          // Fetch all virtual schemas to find matching one
          const schemasResponse = await fetch('/api/virtual-schemas')
          if (schemasResponse.ok) {
            const schemas = await schemasResponse.json()
            const matchingSchema = schemas.find((s: any) => 
              s.name.toLowerCase() === formData.configs.database.toLowerCase()
            )
            
            if (matchingSchema) {
              // Create DataConnection for this form
              const createResponse = await fetch('/api/data-connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  form_id: Number(formId),
                  virtual_schema_id: matchingSchema.id,
                  virtual_table_schema_id: null,
                }),
              })
              
              if (createResponse.ok) {
                const newDataConn = await createResponse.json()
                setDataConnectionId(newDataConn.id)
                setConnectedSchemaId(newDataConn.virtual_schema_id)
                console.log("Migration successful: Created DataConnection", newDataConn.id)
              }
            }
          }
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

  // Fetch available databases on component mount (same as wizard)
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const res = await fetch('/api/virtual-schemas')
        if (!res.ok) {
          console.error('Failed to fetch schemas:', res.status)
          return
        }
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        console.log('Fetched available databases:', list)
        setAvailableSchemas(list)
      } catch (e) {
        console.error('Error fetching databases:', e)
      }
    }
    fetchDatabases()
  }, [])

  // Add this useEffect to handle loading state
  useEffect(() => {
    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Sidebar resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = e.clientX
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const fieldTypes = [
    { type: "text", label: "Texto", icon: <Type className="h-4 w-4" /> },
    { type: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
    { type: "number", label: "Número", icon: <ListChecks className="h-4 w-4" /> },
    { type: "phone", label: "Teléfono", icon: <Phone className="h-4 w-4" /> },
    { type: "textarea", label: "Área de Texto", icon: <List className="h-4 w-4" /> },
    { type: "checkbox", label: "Casilla", icon: <Check className="h-4 w-4" /> },
    { type: "switch", label: "Switch (Si/No)", icon: <Check className="h-4 w-4" /> },
    { type: "select", label: "Lista", icon: <ChevronDown className="h-4 w-4" /> },
    { type: "radio", label: "Opción", icon: <Circle className="h-4 w-4" /> },
    { type: "date", label: "Fecha", icon: <Calendar className="h-4 w-4" /> },
    { type: "name", label: "Nombre", icon: <User className="h-4 w-4" /> },
  ]

  // Function to connect to a database
  const handleConnectToDatabase = async () => {
    if (!connectedSchemaId || !selectedTableId) return

    try {
      // Work with a copy of formElements that we'll update if needed
      let currentFormElements = formElements

      // Check if form fields need to be saved first
      const hasUnsavedFields = currentFormElements.some((el: any) => {
        // Check if this field exists in the database by trying to verify its ID
        // New fields typically have low IDs (1, 2, 3...) while saved fields have higher IDs
        return el.id < 100
      })

      if (hasUnsavedFields && currentFormElements.length > 0) {
        console.log('⚠️ Form has unsaved fields. Saving fields first...')
        alert('Guardando campos del formulario antes de conectar la base de datos...')
        
        // Save form fields first
        const payload = {
          fields: currentFormElements.map((element: any, index: number) => ({
            type: element.type,
            label: element.label,
            position: index,
            configs: {
              placeholder: element.placeholder,
              required: element.required,
              helpText: element.helpText,
              options: element.options,
              rows: element.rows,
              dbField: element.dbField,
            },
          })),
        }

        const saveResponse = await fetch(`/api/forms/${formId}/publish-fields`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!saveResponse.ok) {
          alert('Error: No se pudieron guardar los campos. Por favor intenta guardar manualmente primero.')
          return
        }

        // Fetch the newly saved fields to get their real IDs
        const fieldsResponse = await fetch(`/api/form-fields?form_id=${formId}`)
        if (!fieldsResponse.ok) {
          alert('Error: No se pudieron cargar los campos guardados.')
          return
        }

        const savedFields = await fieldsResponse.json()
        console.log('✅ Fields saved with new IDs:', savedFields)

        // Update formElements with real database IDs
        const updatedElements = currentFormElements.map((el: any, idx: number) => {
          const savedField = savedFields.find((f: any) => f.position === idx)
          return savedField ? { ...el, id: savedField.id } : el
        })
        setFormElements(updatedElements)
        currentFormElements = updatedElements
        
        console.log('🔄 Updated form elements with database IDs:', updatedElements.map((el: any) => ({ id: el.id, label: el.label })))
      }

      // Create or update DataConnection
      const dataConnResponse = await fetch('/api/data-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: Number(formId),
          virtual_schema_id: connectedSchemaId,
          virtual_table_schema_id: selectedTableId,
        }),
      })

      if (!dataConnResponse.ok) {
        console.error('Failed to create/update data connection')
        alert('Error: No se pudo crear la conexión a la base de datos.')
        return
      }

      const dataConn = await dataConnResponse.json()
      setDataConnectionId(dataConn.id)

      // Determine which mappings to save
      let mappingsToSave: Record<number, number> = {}

      // Create field mappings based on field types if autoMapFields is enabled
      if (autoMapFields && connectedSchema) {
        const selectedTable = connectedSchema.tables?.find((t: any) => t.id === selectedTableId)

        if (selectedTable && selectedTable.fields) {
          const newMappings: Record<number, number> = {}

          // Try to automatically map form fields to database fields
          currentFormElements.forEach((element: any) => {
            // Find a matching database field based on type and name similarity
            const matchingField = selectedTable.fields.find((field: any) => {
              // Skip ID fields
              if (field.type === "id" || field.name === "id") return false

              // Match types - be flexible with type matching
              const typeMatches =
                (element.type === "text" && (field.type === "text" || field.type === "varchar")) ||
                (element.type === "email" && (field.type === "email" || field.type === "text" || field.type === "varchar")) ||
                (element.type === "number" && (field.type === "number" || field.type === "integer" || field.type === "int")) ||
                (element.type === "phone" && (field.type === "text" || field.type === "varchar")) ||
                // Boolean fields can be checkbox, switch, or radio with 2 options
                (element.type === "checkbox" && field.type === "boolean") ||
                (element.type === "switch" && field.type === "boolean") ||
                (element.type === "radio" && field.type === "boolean" && element.options?.length === 2) ||
                (element.type === "date" && (field.type === "datetime" || field.type === "date" || field.type === "timestamp"))

              // Check if field names are similar
              const elementName = element.label.toLowerCase().replace(/\s+/g, '_')
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
              newMappings[element.id] = matchingField.id
            }
          })

          setFieldMappings(newMappings)
          mappingsToSave = newMappings
        }
      } else {
        // Use manual mappings from the UI
        mappingsToSave = fieldMappings
      }

      // Persist field mappings to the API
      if (Object.keys(mappingsToSave).length > 0) {
        const mappingsArray = Object.entries(mappingsToSave).map(([formFieldId, virtualFieldId]) => ({
          data_connection_id: dataConn.id,
          form_field_id: Number(formFieldId),
          virtual_field_schema_id: virtualFieldId,
          changes: null,
        }))

        console.log('💾 Saving field mappings:', mappingsArray)
        console.log('📊 Data Connection ID:', dataConn.id)
        console.log('📋 Number of mappings:', mappingsArray.length)
        
        const mappingsResponse = await fetch('/api/field-mappings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mappingsArray),
        })

        if (!mappingsResponse.ok) {
          const errorData = await mappingsResponse.json().catch(() => ({}))
          console.error('❌ Failed to save field mappings:', errorData)
          alert('Error: No se pudieron guardar los mapeos de campos. Por favor intenta nuevamente.')
          return
        } else {
          const result = await mappingsResponse.json()
          console.log('✅ Field mappings saved successfully:', result)
        }
      } else {
        console.warn('⚠️ No field mappings to save! Make sure to map at least one field.')
        alert('Advertencia: No has mapeado ningún campo. Los datos del formulario no se guardarán en campos específicos de la base de datos.')
      }

      setShowDatabaseConnect(false)
    } catch (error) {
      console.error('Error connecting to database:', error)
    }
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
    } else if (type === "switch") {
      newElement.label = "Nueva Opción Switch"
      newElement.placeholder = "No / Si"
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
        case "switch":
          return (
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
              <div className="flex items-center gap-3">
                <Switch id={`element-${element.id}`} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {element.placeholder || "No / Si"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Activa o desactiva esta opción
                  </span>
                </div>
              </div>
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
    if (!connectedSchemaId || !selectedTableId || !fieldMappings[element.id]) return null

    const mappedFieldId = fieldMappings[element.id]
    const selectedTable = connectedSchema?.tables?.find((t: any) => t.id === selectedTableId)
    const mappedField = selectedTable?.fields?.find((f: any) => f.id === mappedFieldId)

    if (!mappedField) return null

    return (
      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-50">
        <Database className="h-3 w-3 mr-1" />
        {mappedField.name}
      </Badge>
    )
  }

  const renderFieldSettings = (element: any) => {
    if (!element) return null

    return (
      <div className="space-y-4 p-4 border rounded-md bg-muted/30">
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-medium text-sm">Configuración del Campo</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowFieldSettings(null)}>
            Cerrar
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`field-label-${element.id}`} className="text-xs">Etiqueta</Label>
          <Input
            id={`field-label-${element.id}`}
            value={element.label}
            onChange={(e) => updateFormElement(element.id, { label: e.target.value })}
            className="text-sm"
          />
        </div>

        {["text", "email", "number", "phone", "textarea", "select", "name"].includes(element.type) && (
          <div className="space-y-2">
            <Label htmlFor={`field-placeholder-${element.id}`} className="text-xs">Texto de Ejemplo</Label>
            <Input
              id={`field-placeholder-${element.id}`}
              value={element.placeholder}
              onChange={(e) => updateFormElement(element.id, { placeholder: e.target.value })}
              className="text-sm"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`field-help-${element.id}`} className="text-xs">Texto de Ayuda</Label>
          <Input
            id={`field-help-${element.id}`}
            value={element.helpText || ""}
            onChange={(e) => updateFormElement(element.id, { helpText: e.target.value })}
            placeholder="Información adicional sobre este campo"
            className="text-sm"
          />
        </div>

        {element.type === "textarea" && (
          <div className="space-y-2">
            <Label htmlFor={`field-rows-${element.id}`} className="text-xs">Filas</Label>
            <Input
              id={`field-rows-${element.id}`}
              type="number"
              min="2"
              max="10"
              value={element.rows || 3}
              onChange={(e) => updateFormElement(element.id, { rows: Number.parseInt(e.target.value) })}
              className="text-sm"
            />
          </div>
        )}

        {["select", "radio"].includes(element.type) && element.options && (
          <div className="space-y-2">
            <Label className="text-xs">Opciones</Label>
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
                    className="text-sm"
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
                className="w-full"
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
          <Label htmlFor={`field-required-${element.id}`} className="text-xs">Campo obligatorio</Label>
        </div>

        {connectedSchemaId && selectedTableId && connectedSchema && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs">
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
              value={fieldMappings[element.id]?.toString() || "not-mapped"}
              onValueChange={async (value) => {
                const newMappings = { ...fieldMappings }
                if (value !== "not-mapped") {
                  newMappings[element.id] = Number(value)
                } else {
                  delete newMappings[element.id]
                }
                setFieldMappings(newMappings)

                // Persist mapping change to API
                if (dataConnectionId) {
                  const mappingsToSave = Object.entries(newMappings).map(([formFieldId, virtualFieldId]) => ({
                    data_connection_id: dataConnectionId,
                    form_field_id: Number(formFieldId),
                    virtual_field_schema_id: virtualFieldId,
                    changes: null,
                  }))

                  await fetch('/api/field-mappings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mappingsToSave),
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona campo de base de datos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-mapped">Sin mapear</SelectItem>
                {connectedSchema?.tables
                  ?.find((t: any) => t.id === selectedTableId)
                  ?.fields?.filter((f: any) => f.type !== "id" && f.name !== "id") // Filter out ID fields
                  .map((field: any) => (
                    <SelectItem key={field.id} value={field.id.toString()}>
                      {field.name} ({field.type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-2">
          <Button variant="destructive" size="sm" onClick={() => removeFormElement(element.id)} className="w-full">
            <Trash className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
          <Button variant="outline" size="sm" onClick={() => duplicateFormElement(element.id)} className="w-full">
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
        </div>
      </div>
    )
  }

  const renderDatabaseConnection = () => {
    // No database connected at all
    if (!connectedSchemaId) {
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

    // Database connected but no table selected
    if (!selectedTableId) {
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

          <div className="mb-4">
            <Label className="text-sm text-blue-700">Base de Datos Conectada</Label>
            <div className="flex items-center gap-2 mt-1">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{connectedSchema?.name || "Loading..."}</span>
            </div>
          </div>

          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Selecciona una Tabla</AlertTitle>
            <AlertDescription>
              Tu formulario está conectado a una base de datos, pero necesitas seleccionar una tabla específica para almacenar los envíos.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowDatabaseConnect(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Seleccionar Tabla
            </Button>
          </div>
        </div>
      )
    }

    // Both database and table connected
    const selectedTable = connectedSchema?.tables?.find((t: any) => t.id === selectedTableId)

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
              <span className="text-sm font-medium">{connectedSchema?.name || "Database"}</span>
            </div>
          </div>

          <div>
            <Label className="text-sm text-blue-700">Tabla Conectada</Label>
            <div className="flex items-center gap-2 mt-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{selectedTable?.name || "Table"}</span>
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
              {Object.entries(fieldMappings).map(([formFieldId, virtualFieldId]) => {
                const formField = formElements.find((el) => el.id === Number(formFieldId))
                const dbField = selectedTable?.fields?.find((f: any) => f.id === virtualFieldId)
                if (!formField || !dbField) return null
                return (
                  <div key={formFieldId} className="flex items-center justify-between py-1 border-b last:border-0">
                    <span>{formField.label}</span>
                    <div className="flex items-center">
                      <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                      <Badge variant="outline" className="bg-blue-50">
                        {dbField.name}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50" onClick={() => setShowDatabaseConnect(true)}>
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
              {connectedSchemaId && selectedTableId && connectedSchema && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  <Database className="h-3 w-3 mr-1" />
                  Conectado a {connectedSchema.name}
                </Badge>
              )}
            </div>
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
                    {connectedSchemaId && selectedTableId && connectedSchema && (
                      <div className="flex items-center gap-2 mb-4">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">
                          Este formulario guardará datos en tu base de datos conectada{" "}
                          {connectedSchema.name}
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
                    console.log('🔵 Guardando cambios...')
                    toast.loading('Guardando cambios...', { id: 'save-form', duration: Infinity })
                    
                    // Store old field IDs before saving
                    const oldFieldIds = formElements.map(el => el.id)
                    
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
                    
                    console.log('📤 Enviando payload:', payload)
                    
                    const res = await fetch(`/api/forms/${formId}/publish-fields`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    })
                    
                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({}))
                      console.error('❌ Error al guardar:', errorData)
                      toast.error('Error al guardar', {
                        id: 'save-form',
                        description: errorData.error || 'No se pudieron guardar los cambios',
                        duration: 5000
                      })
                      return
                    }
                    
                    const result = await res.json()
                    console.log('✅ Guardado exitoso:', result)
                    
                    // Fetch the newly created fields to get their new IDs
                    const fieldsResponse = await fetch(`/api/form-fields?form_id=${formId}`)
                    if (fieldsResponse.ok) {
                      const newFields = await fieldsResponse.json()
                      console.log('🔄 Nuevos campos con IDs:', newFields)
                      
                      // Create mapping from old IDs to new IDs based on position
                      const idMapping: Record<number, number> = {}
                      oldFieldIds.forEach((oldId, idx) => {
                        const newField = newFields.find((f: any) => f.position === idx)
                        if (newField) {
                          idMapping[oldId] = newField.id
                        }
                      })
                      console.log('🗺️ Mapeo de IDs (viejo -> nuevo):', idMapping)
                      
                      // Update formElements with new IDs
                      const updatedElements = formElements.map((el, idx) => {
                        const newField = newFields.find((f: any) => f.position === idx)
                        return newField ? {
                          ...el,
                          id: newField.id
                        } : el
                      })
                      setFormElements(updatedElements)
                      
                      // Update fieldMappings with new IDs
                      if (Object.keys(fieldMappings).length > 0) {
                        const updatedMappings: Record<number, number> = {}
                        Object.entries(fieldMappings).forEach(([oldFieldId, virtualFieldId]) => {
                          const newFieldId = idMapping[Number(oldFieldId)]
                          if (newFieldId) {
                            updatedMappings[newFieldId] = virtualFieldId
                          }
                        })
                        console.log('🔄 Mapeos actualizados:', updatedMappings)
                        setFieldMappings(updatedMappings)
                        
                        // Re-save field mappings if we have a data connection
                        if (dataConnectionId && Object.keys(updatedMappings).length > 0) {
                          const mappingsToSave = Object.entries(updatedMappings).map(([formFieldId, virtualFieldId]) => ({
                            data_connection_id: dataConnectionId,
                            form_field_id: Number(formFieldId),
                            virtual_field_schema_id: virtualFieldId,
                            changes: null,
                          }))
                          
                          console.log('💾 Re-guardando mapeos de campos:', mappingsToSave)
                          const mappingsResponse = await fetch('/api/field-mappings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(mappingsToSave),
                          })
                          
                          if (mappingsResponse.ok) {
                            console.log('✅ Mapeos de campos guardados exitosamente')
                          } else {
                            console.error('❌ Error guardando mapeos:', await mappingsResponse.text())
                          }
                        }
                      }
                    }
                    
                    toast.success('¡Cambios guardados!', {
                      id: 'save-form',
                      description: `Se guardaron ${result.inserted || 0} campos exitosamente`,
                      duration: 5000
                    })
                  } catch (e: any) {
                    console.error('❌ Error inesperado:', e)
                    toast.error('Error al guardar', {
                      id: 'save-form',
                      description: e?.message || 'Ocurrió un error inesperado',
                      duration: 5000
                    })
                  }
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            </div>
          </header>
          <div className="flex flex-1">
            <aside 
              ref={sidebarRef}
              className="flex-col border-r bg-muted/40 md:flex overflow-auto relative"
              style={{ width: `${sidebarWidth}px`, minWidth: '200px', maxWidth: '500px' }}
            >
              <div className="p-4 border-b">
                <h2 className="font-semibold mb-2 text-sm">Elementos del Formulario</h2>
                <div className="grid gap-2" style={{ gridTemplateColumns: sidebarWidth < 280 ? '1fr' : 'repeat(2, 1fr)' }}>
                  {fieldTypes.map((field) => (
                    <div
                      key={field.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, field.type)}
                      className="flex items-center gap-2 p-2 border rounded-md cursor-move hover:bg-muted transition-colors"
                    >
                      {field.icon}
                      <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">{field.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-b">
                <h2 className="font-semibold mb-2 text-sm">Elementos de Diseño</h2>
                <div className="grid gap-2" style={{ gridTemplateColumns: sidebarWidth < 280 ? '1fr' : 'repeat(2, 1fr)' }}>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, "section")}
                    className="flex items-center gap-2 p-2 border rounded-md cursor-move hover:bg-muted transition-colors"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">Sección</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, "separator")}
                    className="flex items-center gap-2 p-2 border rounded-md cursor-move hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                    <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">Divisor</span>
                  </div>
                </div>
              </div>
              {showFieldSettings !== null && (
                <div className="p-4">{renderFieldSettings(formElements.find((el) => el.id === showFieldSettings))}</div>
              )}
            </aside>
            {/* Resize Handle */}
            <div
              className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors relative group"
              onMouseDown={(e) => {
                e.preventDefault()
                setIsResizing(true)
              }}
            >
              <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/10" />
            </div>
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
              </Tabs>
            </main>
          </div>

          {/* Database Connection Dialog */}
          <Dialog 
            open={showDatabaseConnect} 
            onOpenChange={(open) => {
              if (open) {
                console.log('🚀 Opening database dialog')
                console.log('📋 Form elements:', formElements.map(el => ({ id: el.id, label: el.label })))
                console.log('🗺️ Current field mappings:', fieldMappings)
                console.log('🔗 Connected schema ID:', connectedSchemaId)
                console.log('📊 Selected table ID:', selectedTableId)
              }
              setShowDatabaseConnect(open)
            }}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
                    value={connectedSchemaId?.toString() || "none"}
                    onValueChange={async (value) => {
                      if (value === "none") {
                        setConnectedSchemaId(null)
                        setConnectedSchema(null)
                        setSelectedTableId(null)
                        setFieldMappings({})
                      } else if (value === "new") {
                        window.open("/dashboard/databases/new", "_blank")
                      } else {
                        setConnectedSchemaId(Number(value))
                        setSelectedTableId(null)
                        setFieldMappings({})
                        // Fetch the full schema with tables and fields
                        setLoadingSchemas(true)
                        try {
                          const schemaResponse = await fetch(`/api/virtual-schemas/${value}/tree`)
                          if (schemaResponse.ok) {
                            const schema = await schemaResponse.json()
                            console.log('Fetched schema tree:', schema)
                            setConnectedSchema(schema)
                          } else {
                            console.error('Failed to fetch schema tree:', schemaResponse.status)
                          }
                        } catch (err) {
                          console.error('Error fetching schema tree:', err)
                        } finally {
                          setLoadingSchemas(false)
                        }
                      }
                    }}
                  >
                    <SelectTrigger id="database-select">
                      <SelectValue placeholder="Selecciona una base de datos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna (Desconectar)</SelectItem>
                      {availableSchemas.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No hay bases de datos disponibles
                        </SelectItem>
                      ) : (
                        availableSchemas.map((schema) => (
                          <SelectItem key={schema.id} value={schema.id.toString()}>
                            {schema.name} {schema.is_template ? '(Plantilla)' : ''}
                          </SelectItem>
                        ))
                      )}
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

                {connectedSchemaId && connectedSchema && (
                  <div className="space-y-2">
                    <Label htmlFor="table-select">Seleccionar Tabla</Label>
                    <Select
                      value={selectedTableId?.toString() || "none"}
                      onValueChange={(value) => {
                        setSelectedTableId(value === "none" ? null : Number(value))
                        setFieldMappings({})
                      }}
                    >
                      <SelectTrigger id="table-select">
                        <SelectValue placeholder="Selecciona una tabla" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectedSchema?.tables?.map((table: any) => (
                          <SelectItem key={table.id} value={table.id.toString()}>
                            {table.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {connectedSchemaId && selectedTableId && connectedSchema && (
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
                                    value={fieldMappings[element.id]?.toString() || "not-mapped"}
                                    onValueChange={(value) => {
                                      const newMappings = { ...fieldMappings }
                                      if (value !== "not-mapped") {
                                        newMappings[element.id] = Number(value)
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
                                      {connectedSchema?.tables
                                        ?.find((t: any) => t.id === selectedTableId)
                                        ?.fields?.filter((f: any) => f.type !== "id" && f.name !== "id")
                                        .map((field: any) => (
                                          <SelectItem key={field.id} value={field.id.toString()}>
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
                            Los envíos del formulario se almacenarán como nuevos registros en la tabla {connectedSchema?.tables?.find((t: any) => t.id === selectedTableId)?.name}.
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
                <Button onClick={handleConnectToDatabase} disabled={!connectedSchemaId || !selectedTableId}>
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
