"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Database,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Copy,
  RefreshCw,
  Users,
  Building,
  Phone,
  Mail,
  Calendar,
  DollarSign,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SolutionDataPage() {
  const params = useParams()
  const solutionId = params?.id

  // Datos de las tablas de la base de datos
  const [tables, setTables] = useState([
    {
      id: "leads",
      name: "Leads",
      description: "Información de prospectos y oportunidades de venta",
      recordCount: 245,
      lastUpdated: "2024-01-25 14:30",
      status: "activa",
    },
    {
      id: "customers",
      name: "Clientes",
      description: "Base de datos de clientes existentes",
      recordCount: 156,
      lastUpdated: "2024-01-25 12:15",
      status: "activa",
    },
    {
      id: "activities",
      name: "Actividades",
      description: "Registro de todas las interacciones y actividades",
      recordCount: 1247,
      lastUpdated: "2024-01-25 15:45",
      status: "activa",
    },
    {
      id: "products",
      name: "Productos",
      description: "Catálogo de productos y servicios",
      recordCount: 89,
      lastUpdated: "2024-01-24 16:20",
      status: "activa",
    },
  ])

  // Datos de ejemplo de la tabla de leads
  const [leadsData, setLeadsData] = useState([
    {
      id: 1,
      name: "María González",
      email: "maria.gonzalez@empresa.com",
      phone: "+54 11 1234-5678",
      company: "Tech Solutions SRL",
      position: "CTO",
      status: "calificado",
      source: "Sitio Web",
      value: 250000,
      created_at: "2024-01-20",
      assigned_to: "Carlos Ruiz",
    },
    {
      id: 2,
      name: "Juan Pérez",
      email: "juan.perez@startup.com.ar",
      phone: "+54 11 2345-6789",
      company: "StartupTech",
      position: "CEO",
      status: "nuevo",
      source: "LinkedIn",
      value: 120000,
      created_at: "2024-01-22",
      assigned_to: "Ana López",
    },
    {
      id: 3,
      name: "Carmen Rodríguez",
      email: "carmen@consulting.com.ar",
      phone: "+54 11 3456-7890",
      company: "Consulting Pro",
      position: "Director",
      status: "negociacion",
      source: "Referido",
      value: 450000,
      created_at: "2024-01-18",
      assigned_to: "Carlos Ruiz",
    },
    {
      id: 4,
      name: "Roberto Silva",
      email: "roberto.silva@corp.com.ar",
      phone: "+54 11 4567-8901",
      company: "Corporate Inc",
      position: "Manager",
      status: "perdido",
      source: "Email Marketing",
      value: 320000,
      created_at: "2024-01-15",
      assigned_to: "Ana López",
    },
    {
      id: 5,
      name: "Laura Martín",
      email: "laura.martin@digital.com.ar",
      phone: "+54 11 5678-9012",
      company: "Digital Agency",
      position: "Founder",
      status: "ganado",
      source: "Google Ads",
      value: 180000,
      created_at: "2024-01-19",
      assigned_to: "Carlos Ruiz",
    },
  ])

  const [selectedTable, setSelectedTable] = useState("leads")
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusColor = (status) => {
    switch (status) {
      case "activa":
        return "bg-green-100 text-green-800"
      case "inactiva":
        return "bg-red-100 text-red-800"
      case "mantenimiento":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLeadStatusColor = (status) => {
    switch (status) {
      case "nuevo":
        return "bg-blue-100 text-blue-800"
      case "calificado":
        return "bg-green-100 text-green-800"
      case "negociacion":
        return "bg-yellow-100 text-yellow-800"
      case "ganado":
        return "bg-emerald-100 text-emerald-800"
      case "perdido":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredLeads = leadsData.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href={`/dashboard/solutions/${solutionId}`} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver al CRM</span>
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Gestión de Datos</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Registro
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Resumen de Tablas */}
        <div className="grid gap-4 md:grid-cols-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTable === table.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedTable(table.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{table.name}</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{table.recordCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">registros</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
                  <span className="text-xs text-muted-foreground">{table.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contenido de la Tabla Seleccionada */}
        <Tabs value={selectedTable} onValueChange={setSelectedTable}>
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="activities">Actividades</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Tabla de Leads</h2>
                <p className="text-muted-foreground">Gestiona todos los prospectos y oportunidades de venta</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar en leads..."
                    className="pl-8 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>Asignado a</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">#{lead.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                              <AvatarFallback>
                                {lead.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{lead.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {lead.company}
                          </div>
                        </TableCell>
                        <TableCell>{lead.position}</TableCell>
                        <TableCell>
                          <Badge className={getLeadStatusColor(lead.status)}>{lead.status}</Badge>
                        </TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(lead.value)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{lead.created_at}</TableCell>
                        <TableCell>{lead.assigned_to}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tabla de Clientes</CardTitle>
                <CardDescription>Base de datos de clientes existentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Tabla de Clientes</h3>
                    <p className="text-muted-foreground mb-4">156 registros de clientes</p>
                    <Button>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Datos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tabla de Actividades</CardTitle>
                <CardDescription>Registro de todas las interacciones y actividades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Tabla de Actividades</h3>
                    <p className="text-muted-foreground mb-4">1,247 registros de actividades</p>
                    <Button>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Datos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tabla de Productos</CardTitle>
                <CardDescription>Catálogo de productos y servicios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Tabla de Productos</h3>
                    <p className="text-muted-foreground mb-4">89 productos y servicios</p>
                    <Button>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Datos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
