import Link from "next/link"
import { Database, Plus, Search, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DatabasesPage() {
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
          <Link className="text-sm font-medium text-primary" href="/dashboard/databases">
            Bases de Datos
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/workflows">
            Flujos de Trabajo
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
              Panel
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/forms"
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
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Formularios
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary transition-all bg-muted"
              href="/dashboard/databases"
            >
              <Database className="h-4 w-4" />
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
            <h1 className="font-semibold text-lg md:text-2xl">Bases de Datos</h1>
            <Link href="/dashboard/databases/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Base de Datos
              </Button>
            </Link>
          </div>
          <div className="border rounded-lg">
            <div className="p-4 flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar bases de datos..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="shared">Compartidas</TabsTrigger>
                  <TabsTrigger value="personal">Personales</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Clientes</CardTitle>
                    <CardDescription>Base de datos de información de clientes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Registros</div>
                        <div className="text-2xl font-bold">128</div>
                      </div>
                      <div className="flex h-8 items-center">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Compartida
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between mt-auto">
                    <Button variant="outline" size="sm">
                      Ver Esquema
                    </Button>
                    <Link href="/dashboard/databases/customers">
                      <Button size="sm">Abrir</Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Productos</CardTitle>
                    <CardDescription>Base de datos de catálogo de productos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Registros</div>
                        <div className="text-2xl font-bold">56</div>
                      </div>
                      <div className="flex h-8 items-center">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Compartida
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between mt-auto">
                    <Button variant="outline" size="sm">
                      Ver Esquema
                    </Button>
                    <Link href="/dashboard/databases/products">
                      <Button size="sm">Abrir</Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Pedidos</CardTitle>
                    <CardDescription>Base de datos de pedidos de clientes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Registros</div>
                        <div className="text-2xl font-bold">243</div>
                      </div>
                      <div className="flex h-8 items-center">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Compartida
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between mt-auto">
                    <Button variant="outline" size="sm">
                      Ver Esquema
                    </Button>
                    <Link href="/dashboard/databases/orders">
                      <Button size="sm">Abrir</Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Empleados</CardTitle>
                    <CardDescription>Base de datos de información de empleados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Registros</div>
                        <div className="text-2xl font-bold">32</div>
                      </div>
                      <div className="flex h-8 items-center">
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          Personal
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between mt-auto">
                    <Button variant="outline" size="sm">
                      Ver Esquema
                    </Button>
                    <Link href="/dashboard/databases/employees">
                      <Button size="sm">Abrir</Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Proyectos</CardTitle>
                    <CardDescription>Base de datos de gestión de proyectos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Registros</div>
                        <div className="text-2xl font-bold">18</div>
                      </div>
                      <div className="flex h-8 items-center">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Compartida
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between mt-auto">
                    <Button variant="outline" size="sm">
                      Ver Esquema
                    </Button>
                    <Link href="/dashboard/databases/projects">
                      <Button size="sm">Abrir</Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Link href="/dashboard/databases/new" className="block">
                  <Card className="flex flex-col items-center justify-center p-6 h-full hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="rounded-full bg-muted p-3">
                      <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 font-medium">Crear Nueva Base de Datos</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      Comienza a construir una nueva base de datos para tu negocio
                    </p>
                    <Button className="mt-4" variant="outline">
                      Crear Base de Datos
                    </Button>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
