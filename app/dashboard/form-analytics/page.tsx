"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, Calendar, Download, FileText, LineChart, Package, PieChart, Users, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock analytics data
const analyticsData = {
  "customer-feedback": {
    name: "Retroalimentación del Cliente",
    submissions: {
      total: 145,
      thisWeek: 23,
      lastWeek: 18,
      growth: "+27.8%",
      byDay: [12, 15, 18, 25, 30, 22, 23],
      byRating: {
        Excelente: 65,
        Bueno: 45,
        Promedio: 20,
        Malo: 10,
        "Muy Malo": 5,
      },
    },
    conversionRate: "87%",
    averageCompletionTime: "2m 15s",
    abandonmentRate: "13%",
    topReferrers: ["Sitio Web", "Campaña de Email", "Redes Sociales", "Directo"],
  },
  "contact-form": {
    name: "Contáctanos",
    submissions: {
      total: 78,
      thisWeek: 12,
      lastWeek: 15,
      growth: "-20%",
      byDay: [8, 10, 12, 14, 9, 12, 13],
      bySubject: {
        "Consulta de Producto": 30,
        "Soporte Técnico": 25,
        "Pregunta de Facturación": 15,
        Otro: 8,
      },
    },
    conversionRate: "92%",
    averageCompletionTime: "1m 45s",
    abandonmentRate: "8%",
    topReferrers: ["Sitio Web", "Página de Soporte", "Campaña de Email", "Sitios Asociados"],
  },
  "job-application": {
    name: "Solicitud de Empleo",
    submissions: {
      total: 32,
      thisWeek: 5,
      lastWeek: 4,
      growth: "+25%",
      byDay: [3, 5, 4, 6, 5, 4, 5],
      byPosition: {
        "Desarrollador de Software": 12,
        "Diseñador UX": 8,
        "Gerente de Producto": 6,
        "Especialista en Marketing": 4,
        "Representante de Ventas": 2,
      },
    },
    conversionRate: "65%",
    averageCompletionTime: "8m 30s",
    abandonmentRate: "35%",
    topReferrers: ["Portales de Empleo", "Sitio Web de la Empresa", "LinkedIn", "Referencias"],
  },
}

export default function FormAnalyticsPage() {
  const [selectedForm, setSelectedForm] = useState("customer-feedback")
  const [timeRange, setTimeRange] = useState("7days")

  const formData = analyticsData[selectedForm]

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
              <FileText className="h-4 w-4" />
              Formularios
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/form-submissions"
            >
              <FileText className="h-4 w-4" />
              Envíos de Formulario
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary transition-all bg-muted"
              href="/dashboard/form-analytics"
            >
              <BarChart3 className="h-4 w-4" />
              Analítica de Formularios
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              href="/dashboard/databases"
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
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
              </svg>
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
            <h1 className="font-semibold text-lg md:text-2xl">Analítica de Formularios</h1>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar Informe
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Seleccionar formulario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer-feedback">Retroalimentación del Cliente</SelectItem>
                <SelectItem value="contact-form">Contáctanos</SelectItem>
                <SelectItem value="job-application">Solicitud de Empleo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rango de tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 días</SelectItem>
                <SelectItem value="30days">Últimos 30 días</SelectItem>
                <SelectItem value="90days">Últimos 90 días</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center ml-auto">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {timeRange === "7days"
                  ? "15 Ago, 2023 - 22 Ago, 2023"
                  : timeRange === "30days"
                    ? "23 Jul, 2023 - 22 Ago, 2023"
                    : timeRange === "90days"
                      ? "24 May, 2023 - 22 Ago, 2023"
                      : "22 Ago, 2022 - 22 Ago, 2023"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Envíos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formData.submissions.total}</div>
                <p className="text-xs text-muted-foreground">
                  {formData.submissions.growth.startsWith("+") ? (
                    <span className="text-green-600">{formData.submissions.growth}</span>
                  ) : (
                    <span className="text-red-600">{formData.submissions.growth}</span>
                  )}
                  {" del período anterior"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formData.conversionRate}</div>
                <p className="text-xs text-muted-foreground">De visitantes que inician el formulario</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio de Finalización</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formData.averageCompletionTime}</div>
                <p className="text-xs text-muted-foreground">Tiempo para completar el formulario</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Abandono</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formData.abandonmentRate}</div>
                <p className="text-xs text-muted-foreground">Usuarios que se fueron sin enviar</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Envíos a lo Largo del Tiempo</CardTitle>
                <CardDescription>Envíos diarios de formulario para el período seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between gap-2">
                  {formData.submissions.byDay.map((value, index) => (
                    <div key={index} className="relative h-full flex flex-col justify-end">
                      <div
                        className="w-12 bg-primary rounded-t-md"
                        style={{ height: `${(value / Math.max(...formData.submissions.byDay)) * 100}%` }}
                      ></div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>
                  {selectedForm === "customer-feedback"
                    ? "Envíos por Calificación"
                    : selectedForm === "contact-form"
                      ? "Envíos por Asunto"
                      : "Envíos por Posición"}
                </CardTitle>
                <CardDescription>Desglose de envíos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <PieChart className="h-64 w-64 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Principales Referentes</CardTitle>
              <CardDescription>De dónde provienen los envíos de tu formulario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.topReferrers.map((referrer, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <p className="text-lg font-bold">{referrer}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(100 / formData.topReferrers.length) - index * 5}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="fields">Análisis de Campos</TabsTrigger>
              <TabsTrigger value="users">Demografía de Usuarios</TabsTrigger>
              <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="p-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen del Rendimiento del Formulario</CardTitle>
                    <CardDescription>Métricas clave para tu formulario</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Tendencias de Envío</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Esta Semana</span>
                          <span className="font-medium">{formData.submissions.thisWeek}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Semana Pasada</span>
                          <span className="font-medium">{formData.submissions.lastWeek}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Crecimiento</span>
                          <span
                            className={`font-medium ${formData.submissions.growth.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                          >
                            {formData.submissions.growth}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Experiencia del Usuario</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Tiempo Promedio en Formulario</span>
                          <span className="font-medium">{formData.averageCompletionTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Tasa de Finalización</span>
                          <span className="font-medium">{formData.conversionRate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Tasa de Abandono</span>
                          <span className="font-medium">{formData.abandonmentRate}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Fuentes de Tráfico</p>
                        {formData.topReferrers.map((referrer, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{referrer}</span>
                            <span className="font-medium">
                              {Math.floor(100 / formData.topReferrers.length) - index * 5}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento del Campo</CardTitle>
                  <CardDescription>Análisis de cómo los usuarios interactúan con cada campo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Este análisis muestra cómo los usuarios interactúan con cada campo en tu formulario, incluyendo
                    tiempo dedicado, tasas de error y tasas de finalización.
                  </p>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      La visualización de datos de análisis de campos aparecería aquí
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Datos Demográficos del Usuario</CardTitle>
                  <CardDescription>Información sobre los usuarios que completan tus formularios</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta sección proporciona información sobre la demografía de los usuarios que completan tus
                    formularios, incluyendo ubicación, grupos de edad y otra información relevante.
                  </p>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      La visualización de datos demográficos de usuarios aparecería aquí
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analítica de Dispositivos</CardTitle>
                  <CardDescription>Desglose de dispositivos utilizados para enviar tu formulario</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Este análisis muestra los tipos de dispositivos, navegadores y sistemas operativos utilizados por
                    las personas que envían tus formularios.
                  </p>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      La visualización de analítica de dispositivos aparecería aquí
                    </p>
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
