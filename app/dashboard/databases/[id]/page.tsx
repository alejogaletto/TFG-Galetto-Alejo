"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Check,
  Download,
  FileText,
  Key,
  Mail,
  Plus,
  Save,
  Settings,
  Trash,
  Type,
  Hash,
  Braces,
  Minus,
  MoreHorizontal,
  Edit,
  Database,
  Filter,
  Search,
  ChevronDown,
  Upload,
  BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock database data
const databaseTemplates = {
  customers: {
    id: "customers",
    name: "Customers",
    description: "Customer information database",
    records: 128,
    shared: true,
    tables: [
      {
        id: 1,
        name: "Customers",
        description: "Store customer information",
        fields: [
          {
            id: 1,
            name: "id",
            type: "id",
            required: true,
            unique: true,
            isPrimary: true,
            description: "Unique identifier",
          },
          { id: 2, name: "name", type: "text", required: true, unique: false, description: "Customer's full name" },
          {
            id: 3,
            name: "email",
            type: "email",
            required: true,
            unique: true,
            description: "Customer's email address",
          },
          {
            id: 4,
            name: "phone",
            type: "text",
            required: false,
            unique: false,
            description: "Customer's phone number",
          },
          {
            id: 5,
            name: "created_at",
            type: "datetime",
            required: true,
            unique: false,
            description: "Date customer was added",
          },
        ],
      },
    ],
    relations: [
      {
        id: 1,
        name: "customer_orders",
        sourceTable: "Customers",
        sourceField: "id",
        targetTable: "Orders",
        targetField: "customer_id",
        type: "one-to-many",
      },
    ],
    sampleData: [
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan@example.es",
        phone: "555-123-4567",
        created_at: "2023-05-12",
      },
      {
        id: 2,
        name: "Ana López",
        email: "ana@example.mx",
        phone: "555-987-6543",
        created_at: "2023-06-23",
      },
      {
        id: 3,
        name: "Roberto Gómez",
        email: "roberto@example.es",
        phone: "555-456-7890",
        created_at: "2023-07-15",
      },
      {
        id: 4,
        name: "Sara Williams",
        email: "sarah@example.com",
        phone: "555-789-0123",
        created_at: "2023-08-05",
      },
      {
        id: 5,
        name: "Miguel Brown",
        email: "michael@example.com",
        phone: "555-234-5678",
        created_at: "2023-09-18",
      },
    ],
  },
  products: {
    id: "products",
    name: "Products",
    description: "Product catalog database",
    records: 56,
    shared: true,
    tables: [
      {
        id: 1,
        name: "Products",
        description: "Store product information",
        fields: [
          {
            id: 1,
            name: "id",
            type: "id",
            required: true,
            unique: true,
            isPrimary: true,
            description: "Unique identifier",
          },
          { id: 2, name: "name", type: "text", required: true, unique: true, description: "Product name" },
          {
            id: 3,
            name: "description",
            type: "text",
            required: false,
            unique: false,
            description: "Product description",
          },
          { id: 4, name: "price", type: "number", required: true, unique: false, description: "Product price" },
          { id: 5, name: "category", type: "text", required: true, unique: false, description: "Product category" },
          {
            id: 6,
            name: "in_stock",
            type: "boolean",
            required: true,
            unique: false,
            description: "Stock availability",
          },
        ],
      },
    ],
    relations: [
      {
        id: 1,
        name: "product_orders",
        sourceTable: "Products",
        sourceField: "id",
        targetTable: "OrderItems",
        targetField: "product_id",
        type: "one-to-many",
      },
    ],
    sampleData: [
      {
        id: 1,
        name: "Laptop Pro",
        description: "Laptop de alto rendimiento para profesionales",
        price: 1299.99,
        category: "Electronics",
        in_stock: true,
      },
      {
        id: 2,
        name: "Wireless Headphones",
        description: "Auriculares inalámbricos con cancelación de ruido",
        price: 199.99,
        category: "Audio",
        in_stock: true,
      },
      {
        id: 3,
        name: "Smart Watch",
        description: "Reloj inteligente para seguimiento de salud y fitness",
        price: 249.99,
        category: "Wearables",
        in_stock: false,
      },
      {
        id: 4,
        name: "Desk Chair",
        description: "Silla de oficina ergonómica",
        price: 349.99,
        category: "Furniture",
        in_stock: true,
      },
      {
        id: 5,
        name: "Coffee Maker",
        description: "Cafetera programable con temporizador",
        price: 79.99,
        category: "Kitchen",
        in_stock: true,
      },
    ],
  },
  orders: {
    id: "orders",
    name: "Orders",
    description: "Customer orders database",
    records: 243,
    shared: true,
    tables: [
      {
        id: 1,
        name: "Orders",
        description: "Store order information",
        fields: [
          {
            id: 1,
            name: "id",
            type: "id",
            required: true,
            unique: true,
            isPrimary: true,
            description: "Unique identifier",
          },
          { id: 2, name: "customer_id", type: "number", required: true, unique: false, description: "Customer ID" },
          { id: 3, name: "order_date", type: "datetime", required: true, unique: false, description: "Order date" },
          { id: 4, name: "status", type: "text", required: true, unique: false, description: "Order status" },
          { id: 5, name: "total", type: "number", required: true, unique: false, description: "Order total" },
        ],
      },
      {
        id: 2,
        name: "OrderItems",
        description: "Store order line items",
        fields: [
          {
            id: 1,
            name: "id",
            type: "id",
            required: true,
            unique: true,
            isPrimary: true,
            description: "Unique identifier",
          },
          { id: 2, name: "order_id", type: "number", required: true, unique: false, description: "Order ID" },
          { id: 3, name: "product_id", type: "number", required: true, unique: false, description: "Product ID" },
          { id: 4, name: "quantity", type: "number", required: true, unique: false, description: "Item quantity" },
          { id: 5, name: "price", type: "number", required: true, unique: false, description: "Item price" },
        ],
      },
    ],
    relations: [
      {
        id: 1,
        name: "order_customer",
        sourceTable: "Orders",
        sourceField: "customer_id",
        targetTable: "Customers",
        targetField: "id",
        type: "many-to-one",
      },
      {
        id: 2,
        name: "order_items",
        sourceTable: "Orders",
        sourceField: "id",
        targetTable: "OrderItems",
        targetField: "order_id",
        type: "one-to-many",
      },
      {
        id: 3,
        name: "item_product",
        sourceTable: "OrderItems",
        sourceField: "product_id",
        targetTable: "Products",
        targetField: "id",
        type: "many-to-one",
      },
    ],
    sampleData: [
      {
        id: 1,
        customer_id: 1,
        order_date: "2023-05-15",
        status: "Completed",
        total: 125.0,
      },
      {
        id: 2,
        customer_id: 1,
        order_date: "2023-06-28",
        status: "Shipped",
        total: 85.5,
      },
      {
        id: 3,
        customer_id: 2,
        order_date: "2023-07-18",
        status: "Processing",
        total: 220.75,
      },
      {
        id: 4,
        customer_id: 3,
        order_date: "2023-08-10",
        status: "Delivered",
        total: 175.25,
      },
      {
        id: 5,
        customer_id: 4,
        order_date: "2023-09-22",
        status: "Pending",
        total: 350.0,
      },
    ],
  },
  employees: {
    id: "employees",
    name: "Employees",
    description: "Employee information database",
    records: 32,
    shared: false,
    tables: [
      {
        id: 1,
        name: "Employees",
        description: "Store employee information",
        fields: [
          {
            id: 1,
            name: "id",
            type: "id",
            required: true,
            unique: true,
            isPrimary: true,
            description: "Unique identifier",
          },
          { id: 2, name: "first_name", type: "text", required: true, unique: false, description: "First name" },
          { id: 3, name: "last_name", type: "text", required: true, unique: false, description: "Last name" },
          { id: 4, name: "email", type: "email", required: true, unique: true, description: "Email address" },
          { id: 5, name: "position", type: "text", required: true, unique: false, description: "Job position" },
          { id: 6, name: "department", type: "text", required: true, unique: false, description: "Department" },
          { id: 7, name: "hire_date", type: "datetime", required: true, unique: false, description: "Hire date" },
        ],
      },
    ],
    relations: [],
    sampleData: [
      {
        id: 1,
        first_name: "John",
        last_name: "Smith",
        email: "john.smith@company.com",
        position: "Software Engineer",
        department: "Engineering",
        hire_date: "2021-03-15",
      },
      {
        id: 2,
        first_name: "Emily",
        last_name: "Johnson",
        email: "emily.johnson@company.com",
        position: "Marketing Manager",
        department: "Marketing",
        hire_date: "2020-06-22",
      },
      {
        id: 3,
        first_name: "Michael",
        last_name: "Williams",
        email: "michael.williams@company.com",
        position: "Sales Representative",
        department: "Sales",
        hire_date: "2022-01-10",
      },
      {
        id: 4,
        first_name: "Jessica",
        last_name: "Brown",
        email: "jessica.brown@company.com",
        position: "HR Specialist",
        department: "Human Resources",
        hire_date: "2021-09-05",
      },
      {
        id: 5,
        first_name: "David",
        last_name: "Miller",
        email: "david.miller@company.com",
        position: "Financial Analyst",
        department: "Finance",
        hire_date: "2022-04-18",
      },
    ],
  },
  projects: {
    id: "projects",
    name: "Projects",
    description: "Project management database",
    records: 18,
    shared: true,
    tables: [
      {
        id: 1,
        name: "Projects",
        description: "Store project information",
        fields: [
          {
            id: 1,
            name: "id",
            type: "id",
            required: true,
            unique: true,
            isPrimary: true,
            description: "Unique identifier",
          },
          { id: 2, name: "name", type: "text", required: true, unique: true, description: "Project name" },
          {
            id: 3,
            name: "description",
            type: "text",
            required: false,
            unique: false,
            description: "Project description",
          },
          { id: 4, name: "start_date", type: "datetime", required: true, unique: false, description: "Start date" },
          { id: 5, name: "end_date", type: "datetime", required: false, unique: false, description: "End date" },
          { id: 6, name: "status", type: "text", required: true, unique: false, description: "Project status" },
          {
            id: 7,
            name: "manager_id",
            type: "number",
            required: true,
            unique: false,
            description: "Project manager ID",
          },
        ],
      },
      {
        id: 2,
        name: "Tasks",
        description: "Store project tasks",
        fields: [
          {
            id: 1,
            name: "id",
            type: "id",
            required: true,
            unique: true,
            isPrimary: true,
            description: "Unique identifier",
          },
          { id: 2, name: "project_id", type: "number", required: true, unique: false, description: "Project ID" },
          { id: 3, name: "title", type: "text", required: true, unique: false, description: "Task title" },
          { id: 4, name: "description", type: "text", required: false, unique: false, description: "Task description" },
          { id: 5, name: "assignee_id", type: "number", required: false, unique: false, description: "Assignee ID" },
          { id: 6, name: "status", type: "text", required: true, unique: false, description: "Task status" },
          { id: 7, name: "due_date", type: "datetime", required: false, unique: false, description: "Due date" },
        ],
      },
    ],
    relations: [
      {
        id: 1,
        name: "project_tasks",
        sourceTable: "Projects",
        sourceField: "id",
        targetTable: "Tasks",
        targetField: "project_id",
        type: "one-to-many",
      },
      {
        id: 2,
        name: "project_manager",
        sourceTable: "Projects",
        sourceField: "manager_id",
        targetTable: "Employees",
        targetField: "id",
        type: "many-to-one",
      },
      {
        id: 3,
        name: "task_assignee",
        sourceTable: "Tasks",
        sourceField: "assignee_id",
        targetTable: "Employees",
        targetField: "id",
        type: "many-to-one",
      },
    ],
    sampleData: [
      {
        id: 1,
        name: "Website Redesign",
        description: "Redesign company website for better user experience",
        start_date: "2023-04-10",
        end_date: "2023-07-15",
        status: "Completed",
        manager_id: 1,
      },
      {
        id: 2,
        name: "Mobile App Development",
        description: "Develop a mobile app for customer engagement",
        start_date: "2023-06-01",
        end_date: null,
        status: "In Progress",
        manager_id: 3,
      },
      {
        id: 3,
        name: "CRM Implementation",
        description: "Implement new CRM system for sales team",
        start_date: "2023-08-15",
        end_date: "2023-12-31",
        status: "In Progress",
        manager_id: 2,
      },
      {
        id: 4,
        name: "Marketing Campaign",
        description: "Q4 marketing campaign for new product launch",
        start_date: "2023-09-01",
        end_date: "2023-11-30",
        status: "In Progress",
        manager_id: 4,
      },
      {
        id: 5,
        name: "Office Relocation",
        description: "Plan and execute office move to new location",
        start_date: "2023-10-15",
        end_date: "2024-01-15",
        status: "Planning",
        manager_id: 5,
      },
    ],
  },
}

// Data types with icons
const dataTypes = [
  { value: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
  { value: "number", label: "Number", icon: <Hash className="h-4 w-4" /> },
  { value: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { value: "boolean", label: "Boolean", icon: <Check className="h-4 w-4" /> },
  { value: "datetime", label: "Date/Time", icon: <Calendar className="h-4 w-4" /> },
  { value: "id", label: "ID", icon: <Key className="h-4 w-4" /> },
  { value: "json", label: "JSON", icon: <Braces className="h-4 w-4" /> },
  { value: "file", label: "File", icon: <FileText className="h-4 w-4" /> },
]

export default function DatabaseViewPage() {
  const params = useParams()
  const router = useRouter()
  const [database, setDatabase] = useState(null)
  const [activeTab, setActiveTab] = useState("data")
  const [activeTable, setActiveTable] = useState(0)
  const [showAddField, setShowAddField] = useState(false)
  const [showAddRelation, setShowAddRelation] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showImportData, setShowImportData] = useState(false)
  const [showExportData, setShowExportData] = useState(false)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({})
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")
  const [newField, setNewField] = useState({
    name: "",
    type: "text",
    required: false,
    unique: false,
    defaultValue: "",
    description: "",
  })
  const [newRecord, setNewRecord] = useState({})

  // Load database data
  useEffect(() => {
    const dbId = params.id
    if (dbId && databaseTemplates[dbId]) {
      const db = databaseTemplates[dbId]
      setDatabase(db)

      // Initialize filtered data with sample data
      if (db.tables && db.tables.length > 0) {
        setFilteredData(db.sampleData || [])

        // Initialize new record with empty values for each field
        const initialRecord = {}
        db.tables[0].fields.forEach((field) => {
          initialRecord[field.name] = ""
        })
        setNewRecord(initialRecord)
      }
    } else {
      // Handle database not found
      router.push("/dashboard/databases")
    }
  }, [params.id, router])

  // Get data type icon
  const getDataTypeIcon = (type) => {
    const dataType = dataTypes.find((dt) => dt.value === type)
    return dataType ? dataType.icon : <Type className="h-4 w-4" />
  }

  // Add new field
  const addField = () => {
    if (!database || !database.tables || database.tables.length === 0) return

    const currentTable = database.tables[activeTable]
    const newId = Math.max(...currentTable.fields.map((field) => field.id)) + 1
    const updatedFields = [...currentTable.fields, { ...newField, id: newId }]

    const updatedTables = database.tables.map((table, index) =>
      index === activeTable ? { ...table, fields: updatedFields } : table,
    )

    setDatabase({ ...database, tables: updatedTables })
    setNewField({
      name: "",
      type: "text",
      required: false,
      unique: false,
      defaultValue: "",
      description: "",
    })
    setShowAddField(false)
  }

  // Remove field
  const removeField = (fieldId) => {
    if (!database || !database.tables || database.tables.length === 0) return

    const currentTable = database.tables[activeTable]
    const updatedFields = currentTable.fields.filter((field) => field.id !== fieldId)

    const updatedTables = database.tables.map((table, index) =>
      index === activeTable ? { ...table, fields: updatedFields } : table,
    )

    setDatabase({ ...database, tables: updatedTables })
  }

  // Add new record
  const addRecord = () => {
    if (!database || !database.sampleData) return

    // Generate a new ID
    const newId = Math.max(...database.sampleData.map((record) => record.id)) + 1
    const recordWithId = { ...newRecord, id: newId }

    // Add the new record
    const updatedData = [...database.sampleData, recordWithId]
    setDatabase({ ...database, sampleData: updatedData })
    setFilteredData(updatedData)

    // Reset the form
    const initialRecord = {}
    database.tables[activeTable].fields.forEach((field) => {
      initialRecord[field.name] = ""
    })
    setNewRecord(initialRecord)
    setShowAddRecord(false)
  }

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term)
    if (!database || !database.sampleData) return

    if (!term) {
      setFilteredData(database.sampleData)
      return
    }

    const results = database.sampleData.filter((record) => {
      return Object.values(record).some((value) => value && value.toString().toLowerCase().includes(term.toLowerCase()))
    })

    setFilteredData(results)
  }

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New field, default to ascending
      setSortField(field)
      setSortDirection("asc")
    }

    if (!database || !database.sampleData) return

    const sorted = [...filteredData].sort((a, b) => {
      if (a[field] === null) return 1
      if (b[field] === null) return -1

      if (typeof a[field] === "string") {
        return sortDirection === "asc" ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field])
      } else {
        return sortDirection === "asc" ? a[field] - b[field] : b[field] - a[field]
      }
    })

    setFilteredData(sorted)
  }

  // If database is not loaded yet
  if (!database) {
    return <div className="flex items-center justify-center h-screen">Loading database...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/databases" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Bases de Datos</span>
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
        <div className="ml-auto flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center mr-2">
                  <span className="text-sm mr-2">Modo Avanzado</span>
                  <Switch checked={isAdvancedMode} onCheckedChange={setIsAdvancedMode} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Habilitar características avanzadas de base de datos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="sm" onClick={() => setShowExportData(true)}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-[250px] flex-col border-r bg-muted/40 md:flex overflow-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2">Tablas</h2>
            <div className="space-y-2">
              {database.tables.map((table, index) => (
                <div
                  key={table.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${index === activeTable ? "bg-muted" : ""}`}
                  onClick={() => setActiveTable(index)}
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>{table.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {isAdvancedMode && (
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Tabla
                </Button>
              )}
            </div>
          </div>
          <div className="p-4">
            <h2 className="font-semibold mb-2">Configuración de Base de Datos</h2>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="db-name">Nombre de la Base de Datos</Label>
                <Input
                  id="db-name"
                  value={database.name}
                  onChange={(e) => setDatabase({ ...database, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="db-description">Descripción</Label>
                <Textarea
                  id="db-description"
                  value={database.description}
                  onChange={(e) => setDatabase({ ...database, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm">Compartir</span>
                <Switch
                  checked={database.shared}
                  onCheckedChange={(checked) => setDatabase({ ...database, shared: checked })}
                />
              </div>

              {isAdvancedMode && (
                <>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">Control de Versiones</span>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">Registro de Auditoría</span>
                    <Switch defaultChecked={false} />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="p-4 border-t">
            <h3 className="font-medium mb-2">Formularios Conectados</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Customer Feedback</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Activo
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Contact Form</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Activo
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Conectar Nuevo Formulario
              </Button>
            </div>
          </div>
        </aside>
        <main className="flex flex-1 flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="border-b">
              <div className="flex items-center px-4 py-2">
                <h1 className="text-lg font-medium">{database.tables[activeTable]?.name || "Table"}</h1>
                <TabsList className="ml-auto">
                  <TabsTrigger value="data">Datos</TabsTrigger>
                  <TabsTrigger value="structure">Estructura</TabsTrigger>
                  <TabsTrigger value="relations">Relaciones</TabsTrigger>
                  {isAdvancedMode && <TabsTrigger value="analytics">Analíticas</TabsTrigger>}
                </TabsList>
              </div>
            </div>

            {/* Data Tab */}
            <TabsContent value="data" className="flex-1 p-4">
              <div className="mx-auto max-w-[1200px]">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Registros</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Buscar registros..."
                          className="pl-8 w-[200px]"
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowImportData(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar
                      </Button>
                      <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Registro
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Agregar Nuevo Registro</DialogTitle>
                            <DialogDescription>
                              Crear un nuevo registro en la tabla {database.tables[activeTable]?.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            {database.tables[activeTable]?.fields
                              .filter((field) => field.name !== "id")
                              .map((field) => (
                                <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor={`field-${field.name}`} className="text-right">
                                    {field.name}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                                  <div className="col-span-3">
                                    {field.type === "boolean" ? (
                                      <Checkbox
                                        id={`field-${field.name}`}
                                        checked={newRecord[field.name] === true}
                                        onCheckedChange={(checked) =>
                                          setNewRecord({ ...newRecord, [field.name]: checked })
                                        }
                                      />
                                    ) : (
                                      <Input
                                        id={`field-${field.name}`}
                                        type={field.type === "number" ? "number" : "text"}
                                        value={newRecord[field.name] || ""}
                                        onChange={(e) => setNewRecord({ ...newRecord, [field.name]: e.target.value })}
                                        placeholder={field.description}
                                      />
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddRecord(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={addRecord}>Agregar Registro</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showFilters && (
                      <div className="mb-4 p-4 border rounded-md bg-muted/30">
                        <h3 className="font-medium mb-2">Filtros</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {database.tables[activeTable]?.fields.map((field) => (
                            <div key={field.id} className="space-y-1">
                              <Label htmlFor={`filter-${field.name}`}>{field.name}</Label>
                              <Input
                                id={`filter-${field.name}`}
                                placeholder={`Filtrar por ${field.name}`}
                                className="w-full"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button variant="outline" size="sm" className="mr-2">
                            Restablecer
                          </Button>
                          <Button size="sm">Aplicar Filtros</Button>
                        </div>
                      </div>
                    )}

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {database.tables[activeTable]?.fields.map((field) => (
                              <TableHead
                                key={field.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort(field.name)}
                              >
                                <div className="flex items-center">
                                  {field.name}
                                  {sortField === field.name && (
                                    <ChevronDown
                                      className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                                    />
                                  )}
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="w-[80px]">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredData.length > 0 ? (
                            filteredData.map((record, index) => (
                              <TableRow key={index}>
                                {database.tables[activeTable]?.fields.map((field) => (
                                  <TableCell key={field.id}>
                                    {field.type === "boolean" ? (
                                      record[field.name] ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Minus className="h-4 w-4 text-muted-foreground" />
                                      )
                                    ) : (
                                      record[field.name]
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Eliminar
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={database.tables[activeTable]?.fields.length + 1}
                                className="text-center py-4"
                              >
                                No se encontraron registros
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Structure Tab */}
            <TabsContent value="structure" className="flex-1 p-4">
              <div className="mx-auto max-w-[900px]">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Estructura de Tabla</CardTitle>
                    <Dialog open={showAddField} onOpenChange={setShowAddField}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Campo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Nuevo Campo</DialogTitle>
                          <DialogDescription>
                            Define las propiedades para tu nuevo campo de base de datos.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="field-name">Nombre del Campo</Label>
                              <Input
                                id="field-name"
                                value={newField.name}
                                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                placeholder="ej. primer_nombre"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="field-type">Tipo de Dato</Label>
                              <Select
                                value={newField.type}
                                onValueChange={(value) => setNewField({ ...newField, type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {dataTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center">
                                        {type.icon}
                                        <span className="ml-2">{type.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="field-description">Descripción</Label>
                            <Textarea
                              id="field-description"
                              value={newField.description}
                              onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                              placeholder="Describe el propósito de este campo"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="field-required"
                                checked={newField.required}
                                onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                              />
                              <Label htmlFor="field-required">Requerido</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="field-unique"
                                checked={newField.unique}
                                onCheckedChange={(checked) => setNewField({ ...newField, unique: checked })}
                              />
                              <Label htmlFor="field-unique">Único</Label>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="field-default">Valor Predeterminado (Opcional)</Label>
                            <Input
                              id="field-default"
                              value={newField.defaultValue}
                              onChange={(e) => setNewField({ ...newField, defaultValue: e.target.value })}
                              placeholder="Valor predeterminado si no se proporciona ninguno"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddField(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={addField}>Agregar Campo</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Nombre</TableHead>
                          <TableHead className="w-[120px]">Tipo</TableHead>
                          <TableHead className="w-[100px]">Requerido</TableHead>
                          <TableHead className="w-[100px]">Único</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {database.tables[activeTable]?.fields.map((field) => (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium">
                              {field.isPrimary && <Key className="h-3 w-3 inline mr-1 text-amber-500" />}
                              {field.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getDataTypeIcon(field.type)}
                                <span className="capitalize">{field.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {field.required ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Minus className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {field.unique ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Minus className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>{field.description}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => removeField(field.id)}
                                    disabled={field.isPrimary}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Relations Tab */}
            <TabsContent value="relations" className="flex-1 p-4">
              <div className="mx-auto max-w-[900px]">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Relaciones de Tabla</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Relación
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Origen</TableHead>
                          <TableHead>Destino</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {database.relations && database.relations.length > 0 ? (
                          database.relations.map((relation) => (
                            <TableRow key={relation.id}>
                              <TableCell className="font-medium">{relation.name}</TableCell>
                              <TableCell>
                                {relation.sourceTable}.{relation.sourceField}
                              </TableCell>
                              <TableCell>
                                {relation.targetTable}.{relation.targetField}
                              </TableCell>
                              <TableCell>{relation.type}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No hay relaciones definidas
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            {isAdvancedMode && (
              <TabsContent value="analytics" className="flex-1 p-4">
                <div className="mx-auto max-w-[1200px]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{database.records || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          +{Math.floor(Math.random() * 10)}% del mes pasado
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tamaño Promedio de Registro</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{Math.floor(Math.random() * 5) + 1} KB</div>
                        <p className="text-xs text-muted-foreground">En todos los registros</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">Hoy</div>
                        <p className="text-xs text-muted-foreground">horas atrás</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Analíticas de Base de Datos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20">
                        <div className="text-center">
                          <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
                          <h3 className="mt-2 font-medium">Visualización de Analíticas</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Gráficos e información sobre el uso de tu base de datos
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  )
}
