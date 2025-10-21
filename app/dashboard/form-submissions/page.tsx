"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  Calendar,
  Download,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Package,
  Search,
  Trash,
  User,
  Mail,
  Home,
  Database,
  Workflow,
  BarChart3,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock submission data
const submissions = [
  {
    id: "sub_1",
    formId: "customer-feedback",
    formName: "Retroalimentación del Cliente",
    submittedBy: "Juan Pérez",
    email: "juan@example.com",
    submittedAt: "2023-09-15T14:30:00Z",
    status: "processed",
    data: {
      name: "Juan Pérez",
      email: "juan@example.com",
      rating: "Excelente",
      feedback: "¡El producto es increíble! Me encanta lo fácil que es de usar y el servicio al cliente es excelente.",
    },
  },
  {
    id: "sub_2",
    formId: "customer-feedback",
    formName: "Retroalimentación del Cliente",
    submittedBy: "María García",
    email: "maria@example.com",
    submittedAt: "2023-09-14T10:15:00Z",
    status: "processed",
    data: {
      name: "María García",
      email: "maria@example.com",
      rating: "Bueno",
      feedback: "En general buena experiencia, pero hay espacio para mejorar en el proceso de pago.",
    },
  },
  {
    id: "sub_3",
    formId: "contact-form",
    formName: "Contáctanos",
    submittedBy: "Roberto Johnson",
    email: "roberto@example.com",
    submittedAt: "2023-09-13T16:45:00Z",
    status: "pending",
    data: {
      name: "Roberto Johnson",
      email: "roberto@example.com",
      subject: "Consulta de Producto",
      message: "Estoy interesado en su plan empresarial. ¿Podría alguien de ventas contactarme con más información?",
    },
  },
  {
    id: "sub_4",
    formId: "job-application",
    formName: "Solicitud de Empleo",
    submittedBy: "Emily Davis",
    email: "emily@example.com",
    submittedAt: "2023-09-12T09:20:00Z",
    status: "processed",
    data: {
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "555-123-4567",
      position: "Diseñador UX",
      coverLetter:
        "Soy un diseñador UX con 5 años de experiencia creando diseños centrados en el usuario para aplicaciones web y móviles...",
    },
  },
  {
    id: "sub_5",
    formId: "contact-form",
    formName: "Contáctanos",
    submittedBy: "Miguel Wilson",
    email: "miguel@example.com",
    submittedAt: "2023-09-11T13:10:00Z",
    status: "pending",
    data: {
      name: "Miguel Wilson",
      email: "miguel@example.com",
      subject: "Soporte Técnico",
      message:
        "Tengo problemas integrando su API con mi aplicación. ¿Podría alguien de soporte ayudarme a solucionarlo?",
    },
  },
]

// Form templates for reference
const formTemplates = {
  "customer-feedback": {
    id: "customer-feedback",
    title: "Retroalimentación del Cliente",
    fields: ["name", "email", "rating", "feedback"],
  },
  "contact-form": {
    id: "contact-form",
    title: "Contáctanos",
    fields: ["name", "email", "subject", "message"],
  },
  "job-application": {
    id: "job-application",
    title: "Solicitud de Empleo",
    fields: ["name", "email", "phone", "position", "coverLetter"],
  },
}

export default function FormSubmissionsPage() {
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [viewSubmissionDetails, setViewSubmissionDetails] = useState(false)
  const [filterForm, setFilterForm] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSubmissions = submissions.filter((submission) => {
    // Filter by form
    if (filterForm !== "all" && submission.formId !== filterForm) {
      return false
    }

    // Filter by status
    if (filterStatus !== "all" && submission.status !== filterStatus) {
      return false
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        submission.submittedBy.toLowerCase().includes(query) ||
        submission.email.toLowerCase().includes(query) ||
        submission.formName.toLowerCase().includes(query)
      )
    }

    return true
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission)
    setViewSubmissionDetails(true)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
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
          <Link className="text-sm font-medium" href="/dashboard/solutions">
            Soluciones
          </Link>
        </nav>
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
            <h1 className="font-semibold text-lg md:text-2xl">Envíos de Formulario</h1>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar envíos..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrar</span>
              </Button>
            </div>

            <div className="flex gap-2">
              <Select value={filterForm} onValueChange={setFilterForm}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por formulario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Formularios</SelectItem>
                  <SelectItem value="customer-feedback">Retroalimentación del Cliente</SelectItem>
                  <SelectItem value="contact-form">Contáctanos</SelectItem>
                  <SelectItem value="job-application">Solicitud de Empleo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processed">Procesado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle>Envíos Recientes</CardTitle>
                <CardDescription>{filteredSubmissions.length} envíos encontrados</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">
                      <div className="flex items-center gap-1">
                        Formulario
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Enviado Por
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Fecha
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.formName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{submission.submittedBy}</span>
                          <span className="text-xs text-muted-foreground">{submission.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(submission.submittedAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={submission.status === "processed" ? "default" : "outline"}>
                          {submission.status === "processed" ? "Procesado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewSubmission(submission)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              Contactar al Remitente
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
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

          <Dialog open={viewSubmissionDetails} onOpenChange={setViewSubmissionDetails}>
            {selectedSubmission && (
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Detalles del Envío</DialogTitle>
                  <DialogDescription>
                    Formulario: {selectedSubmission.formName} | Enviado: {formatDate(selectedSubmission.submittedAt)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{selectedSubmission.submittedBy}</p>
                        <p className="text-sm text-muted-foreground">{selectedSubmission.email}</p>
                      </div>
                    </div>
                    <Badge variant={selectedSubmission.status === "processed" ? "default" : "outline"}>
                      {selectedSubmission.status === "processed" ? "Procesado" : "Pendiente"}
                    </Badge>
                  </div>

                  <Tabs defaultValue="data">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="data">Datos del Formulario</TabsTrigger>
                      <TabsTrigger value="activity">Registro de Actividad</TabsTrigger>
                    </TabsList>

                    <TabsContent value="data" className="space-y-4 pt-4">
                      {Object.entries(selectedSubmission.data).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <p className="text-sm font-medium capitalize">{key}</p>
                          <div className="rounded-md border p-3">
                            <p className="text-sm">{value}</p>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="activity" className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <div className="rounded-full bg-blue-100 p-1">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Formulario Enviado</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(selectedSubmission.submittedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="rounded-full bg-green-100 p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-green-600"
                            >
                              <ellipse cx="12" cy="5" rx="9" ry="3" />
                              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Guardado en Base de Datos</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(selectedSubmission.submittedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="rounded-full bg-amber-100 p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-amber-600"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Flujo de Trabajo Activado</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(selectedSubmission.submittedAt)}
                            </p>
                          </div>
                        </div>

                        {selectedSubmission.status === "processed" && (
                          <div className="flex items-start gap-2">
                            <div className="rounded-full bg-purple-100 p-1">
                              <Mail className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Email de Confirmación Enviado</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(new Date(new Date(selectedSubmission.submittedAt).getTime() + 60000))}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>

                  {selectedSubmission.status === "pending" && <Button>Marcar como Procesado</Button>}
                </div>
              </DialogContent>
            )}
          </Dialog>
        </main>
      </div>
    </div>
  )
}
