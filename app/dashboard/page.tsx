import Link from "next/link"
import { BarChart3, Database, FileText, Home, Plus, Settings, Workflow, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2 font-semibold" href="#">
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
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/profile">
              <Settings className="mr-2 h-4 w-4" />
              Mi Perfil
            </Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[220px] flex-col border-r bg-muted/40 md:flex">
          <nav className="grid gap-2 p-4">
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all bg-muted text-primary text-sm"
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
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg md:text-2xl">Panel de Control</h1>
          </div>
          <Tabs defaultValue="overview">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="overview">Vista General</TabsTrigger>
                <TabsTrigger value="analytics">Analíticas</TabsTrigger>
                <TabsTrigger value="reports">Informes</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm">
                  Descargar
                </Button>
                <Button size="sm">Crear Nuevo</Button>
              </div>
            </div>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Formularios</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 del mes pasado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Bases de Datos</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">+1 del mes pasado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Flujos de Trabajo Activos</CardTitle>
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">+3 del mes pasado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Soluciones Activas</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2</div>
                    <p className="text-xs text-muted-foreground">+1 del mes pasado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Envíos de Formulario</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">132</div>
                    <p className="text-xs text-muted-foreground">+28 del mes pasado</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <img
                      src="/placeholder.svg?height=300&width=600"
                      width={600}
                      height={300}
                      alt="Gráfico de actividad"
                      className="rounded-md object-cover"
                    />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Formularios Recientes</CardTitle>
                    <CardDescription>Has creado 12 formularios este mes.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">Retroalimentación del Cliente</p>
                          <p className="text-sm text-muted-foreground">Creado hace 2 días</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">Incorporación de Empleados</p>
                          <p className="text-sm text-muted-foreground">Creado hace 5 días</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">Solicitud de Proyecto</p>
                          <p className="text-sm text-muted-foreground">Creado hace 1 semana</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" className="w-full" asChild>
                      <Link href="/dashboard/form-builder">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Nuevo Formulario
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Analíticas</CardTitle>
                  <CardDescription>
                    Ver analíticas detalladas sobre tus formularios, bases de datos y flujos de trabajo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-md">
                    <p className="text-muted-foreground">El panel de analíticas aparecerá aquí</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informes Generados</CardTitle>
                  <CardDescription>Ver y descargar informes generados a partir de tus datos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-md">
                    <p className="text-muted-foreground">Los informes aparecerán aquí</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
