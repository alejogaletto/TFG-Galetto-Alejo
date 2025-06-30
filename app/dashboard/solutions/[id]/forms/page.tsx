"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  MoreHorizontal,
  FileText,
  BarChart3,
  Users,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Datos de ejemplo para los formularios de la solución
const solutionForms = [
  {
    id: "1",
    name: "Registro de Clientes",
    description: "Formulario principal para registro de nuevos clientes en el CRM",
    status: "activo",
    category: "ventas",
    fields: 8,
    submissions: 246,
    conversionRate: 15.2,
    createdAt: "2024-01-10",
    lastModified: "2024-01-25",
    icon: Users,
  },
  {
    id: "2",
    name: "Seguimiento de Leads",
    description: "Formulario para capturar información de seguimiento de prospectos",
    status: "activo",
    category: "ventas",
    fields: 6,
    submissions: 189,
    conversionRate: 12.8,
    createdAt: "2024-01-12",
    lastModified: "2024-01-24",
    icon: BarChart3,
  },
  {
    id: "3",
    name: "Evaluación de Satisfacción",
    description: "Encuesta post-venta para evaluar la satisfacción del cliente",
    status: "activo",
    category: "feedback",
    fields: 10,
    submissions: 156,
    conversionRate: 8.5,
    createdAt: "2024-01-15",
    lastModified: "2024-01-23",
    icon: BarChart3,
  },
  {
    id: "4",
    name: "Soporte Técnico",
    description: "Formulario para reportar problemas técnicos y solicitar soporte",
    status: "borrador",
    category: "soporte",
    fields: 7,
    submissions: 0,
    conversionRate: 0,
    createdAt: "2024-01-20",
    lastModified: "2024-01-20",
    icon: Settings,
  },
  {
    id: "5",
    name: "Renovación de Contratos",
    description: "Formulario para gestionar renovaciones de contratos existentes",
    status: "pausado",
    category: "ventas",
    fields: 12,
    submissions: 67,
    conversionRate: 22.4,
    createdAt: "2024-01-08",
    lastModified: "2024-01-22",
    icon: FileText,
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
    case "ventas":
      return "bg-green-100 text-green-800"
    case "feedback":
      return "bg-orange-100 text-orange-800"
    case "soporte":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function SolutionFormsPage({ params }: { params: { id: string } }) {
  const [selectedTab, setSelectedTab] = useState("all")

  const handleToggleStatus = (formId: string, currentStatus: string) => {
    const newStatus = currentStatus === "activo" ? "pausado" : "activo"
    console.log(`Cambiando estado del formulario ${formId} a ${newStatus}`)
  }

  const filteredForms = solutionForms.filter((form) => {
    if (selectedTab === "all") return true
    return form.status === selectedTab
  })

  const totalSubmissions = solutionForms.reduce((sum, form) => sum + form.submissions, 0)
  const activeForms = solutionForms.filter((form) => form.status === "activo").length
  const averageConversion = solutionForms.reduce((sum, form) => sum + form.conversionRate, 0) / solutionForms.length

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/solutions/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-lg">Formularios de la Solución</h1>
            <p className="text-sm text-muted-foreground">Gestiona todos los formularios de tu CRM</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/solutions/${params.id}/builder`}>Volver al Constructor</Link>
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Formulario
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Estadísticas Generales */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Formularios</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{solutionForms.length}</div>
              <p className="text-xs text-muted-foreground">{activeForms} activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Envíos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">+23 esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversión Promedio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageConversion.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">+2.1% vs mes anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Formularios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeForms}</div>
              <p className="text-xs text-muted-foreground">de {solutionForms.length} total</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Formularios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Formularios</h2>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">Todos ({solutionForms.length})</TabsTrigger>
              <TabsTrigger value="activo">
                Activos ({solutionForms.filter((f) => f.status === "activo").length})
              </TabsTrigger>
              <TabsTrigger value="borrador">
                Borradores ({solutionForms.filter((f) => f.status === "borrador").length})
              </TabsTrigger>
              <TabsTrigger value="pausado">
                Pausados ({solutionForms.filter((f) => f.status === "pausado").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              <div className="grid gap-4">
                {filteredForms.map((form) => {
                  const IconComponent = form.icon
                  return (
                    <Card key={form.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
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
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/forms/${form.id}`} target="_blank">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Formulario
                                </Link>
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
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                            <p className="font-medium">{new Date(form.createdAt).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">Creado</p>
                          </div>
                          <div>
                            <p className="font-medium">{new Date(form.lastModified).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">Modificado</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
