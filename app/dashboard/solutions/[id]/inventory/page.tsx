"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Settings,
  Package,
  TrendingUp,
  AlertTriangle,
  XCircle,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  MoreVertical,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  User,
  Building,
  Truck,
  ShoppingCart,
  Activity,
  CheckCircle,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

export default function InventoryDetailPage() {
  const params = useParams()
  const solutionId = params?.id

  // Función para formatear moneda en pesos argentinos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Datos de la solución de inventario
  const [solution, setSolution] = useState({
    id: solutionId,
    name: "Sistema de Inventario",
    description: "Gestión completa de productos y stock",
    category: "inventario",
    icon: "package",
    status: "activo",
    created: "2024-01-15",
    lastModified: "2024-01-20",
    stats: {
      totalProducts: 1247,
      totalValue: 15750000, // 15.75 millones de pesos
      lowStockItems: 23,
      outOfStockItems: 8,
      warehouseUtilization: 78.5,
      monthlyTurnover: 12.3,
    },
  })

  // Datos de productos
  const [products, setProducts] = useState([
    {
      id: 1,
      sku: "NB-LEN-001",
      name: "Notebook Lenovo ThinkPad E14",
      category: "Notebooks",
      brand: "Lenovo",
      currentStock: 15,
      minStock: 5,
      maxStock: 50,
      unitPrice: 850000,
      totalValue: 12750000,
      location: "Depósito A - Estante 3",
      supplier: "Tech Distributor SA",
      lastMovement: "2024-01-24",
      status: "disponible",
      image: "/placeholder.svg?height=40&width=40&text=NB",
    },
    {
      id: 2,
      sku: "MON-SAM-002",
      name: "Monitor Samsung 24'' Full HD",
      category: "Monitores",
      brand: "Samsung",
      currentStock: 3,
      minStock: 8,
      maxStock: 30,
      unitPrice: 180000,
      totalValue: 540000,
      location: "Depósito B - Estante 1",
      supplier: "Display Solutions",
      lastMovement: "2024-01-23",
      status: "stock-bajo",
      image: "/placeholder.svg?height=40&width=40&text=MON",
    },
    {
      id: 3,
      sku: "TEC-COR-003",
      name: "Teclado Corsair K70 RGB",
      category: "Periféricos",
      brand: "Corsair",
      currentStock: 0,
      minStock: 10,
      maxStock: 25,
      unitPrice: 95000,
      totalValue: 0,
      location: "Depósito A - Estante 7",
      supplier: "Gaming Gear Ltd",
      lastMovement: "2024-01-20",
      status: "agotado",
      image: "/placeholder.svg?height=40&width=40&text=TEC",
    },
    {
      id: 4,
      sku: "MOU-LOG-004",
      name: "Mouse Logitech MX Master 3",
      category: "Periféricos",
      brand: "Logitech",
      currentStock: 28,
      minStock: 15,
      maxStock: 40,
      unitPrice: 65000,
      totalValue: 1820000,
      location: "Depósito A - Estante 7",
      supplier: "Peripheral Pro",
      lastMovement: "2024-01-25",
      status: "disponible",
      image: "/placeholder.svg?height=40&width=40&text=MOU",
    },
    {
      id: 5,
      sku: "IMP-HP-005",
      name: "Impresora HP LaserJet Pro",
      category: "Impresoras",
      brand: "HP",
      currentStock: 7,
      minStock: 3,
      maxStock: 15,
      unitPrice: 320000,
      totalValue: 2240000,
      location: "Depósito C - Estante 2",
      supplier: "Office Equipment SA",
      lastMovement: "2024-01-22",
      status: "disponible",
      image: "/placeholder.svg?height=40&width=40&text=IMP",
    },
    {
      id: 6,
      sku: "WEB-LOG-006",
      name: "Webcam Logitech C920",
      category: "Periféricos",
      brand: "Logitech",
      currentStock: 12,
      minStock: 8,
      maxStock: 20,
      unitPrice: 45000,
      totalValue: 540000,
      location: "Depósito B - Estante 4",
      supplier: "Video Tech",
      lastMovement: "2024-01-24",
      status: "disponible",
      image: "/placeholder.svg?height=40&width=40&text=WEB",
    },
  ])

  // Movimientos de inventario
  const [movements, setMovements] = useState([
    {
      id: 1,
      type: "entrada",
      product: "Notebook Lenovo ThinkPad E14",
      sku: "NB-LEN-001",
      quantity: 10,
      reason: "Compra a proveedor",
      user: "Carlos Mendoza",
      timestamp: "2024-01-25 14:30",
      reference: "PO-2024-001",
    },
    {
      id: 2,
      type: "salida",
      product: "Monitor Samsung 24'' Full HD",
      sku: "MON-SAM-002",
      quantity: 5,
      reason: "Venta a cliente",
      user: "Ana García",
      timestamp: "2024-01-25 11:15",
      reference: "VT-2024-045",
    },
    {
      id: 3,
      type: "ajuste",
      product: "Teclado Corsair K70 RGB",
      sku: "TEC-COR-003",
      quantity: -2,
      reason: "Producto dañado",
      user: "Roberto Silva",
      timestamp: "2024-01-24 16:20",
      reference: "AJ-2024-012",
    },
    {
      id: 4,
      type: "entrada",
      product: "Mouse Logitech MX Master 3",
      sku: "MOU-LOG-004",
      quantity: 15,
      reason: "Reposición de stock",
      user: "María López",
      timestamp: "2024-01-24 09:45",
      reference: "PO-2024-002",
    },
    {
      id: 5,
      type: "salida",
      product: "Webcam Logitech C920",
      sku: "WEB-LOG-006",
      quantity: 3,
      reason: "Transferencia a sucursal",
      user: "Diego Fernández",
      timestamp: "2024-01-23 13:10",
      reference: "TR-2024-008",
    },
  ])

  // Alertas del sistema
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: "Stock bajo: Monitor Samsung 24''",
      description: "Solo quedan 3 unidades, mínimo requerido: 8",
      priority: "alta",
      type: "stock-bajo",
      productId: 2,
      timestamp: "2024-01-25 08:00",
    },
    {
      id: 2,
      title: "Producto agotado: Teclado Corsair K70",
      description: "Sin stock disponible, se requiere reposición urgente",
      priority: "critica",
      type: "agotado",
      productId: 3,
      timestamp: "2024-01-24 15:30",
    },
    {
      id: 3,
      title: "Reposición programada",
      description: "Llegada de 20 notebooks programada para mañana",
      priority: "media",
      type: "reposicion",
      productId: 1,
      timestamp: "2024-01-25 10:15",
    },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 text-green-800"
      case "stock-bajo":
        return "bg-yellow-100 text-yellow-800"
      case "agotado":
        return "bg-red-100 text-red-800"
      case "descontinuado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "disponible":
        return <CheckCircle className="h-4 w-4" />
      case "stock-bajo":
        return <AlertTriangle className="h-4 w-4" />
      case "agotado":
        return <XCircle className="h-4 w-4" />
      case "descontinuado":
        return <Clock className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critica":
        return "bg-red-100 text-red-800"
      case "alta":
        return "bg-orange-100 text-orange-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "baja":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMovementIcon = (type) => {
    switch (type) {
      case "entrada":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "salida":
        return <ShoppingCart className="h-4 w-4 text-blue-600" />
      case "ajuste":
        return <Edit className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStockLevel = (current, min, max) => {
    if (current === 0) return 0
    if (current <= min) return 25
    if (current >= max) return 100
    return ((current - min) / (max - min)) * 75 + 25
  }

  const resolveAlert = (alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/solutions" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Soluciones</span>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-semibold">{solution.name}</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/solutions/builder?id=${solutionId}`}>
              <Settings className="mr-2 h-4 w-4" />
              Configurar
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Público
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Exportar Inventario
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Estadísticas Principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{solution.stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{solution.stats.monthlyTurnover}% rotación mensual
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(solution.stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">Inventario valorizado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{solution.stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Productos requieren reposición</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{solution.stats.outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">Productos agotados</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido Principal */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Gestión de Productos</TabsTrigger>
            <TabsTrigger value="movements">Movimientos</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestión de Productos</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar productos..." className="pl-8 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inventario de Productos</CardTitle>
                <CardDescription>Gestiona todos los productos y niveles de stock</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.brand}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{product.currentStock}</div>
                            <div className="text-xs text-muted-foreground">
                              Min: {product.minStock} | Max: {product.maxStock}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-16">
                            <Progress
                              value={getStockLevel(product.currentStock, product.minStock, product.maxStock)}
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(product.unitPrice)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(product.totalValue)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {product.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(product.status)}>
                            {getStatusIcon(product.status)}
                            <span className="ml-1 capitalize">{product.status.replace("-", " ")}</span>
                          </Badge>
                        </TableCell>
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
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Ajustar Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Truck className="mr-2 h-4 w-4" />
                                Solicitar Reposición
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

          <TabsContent value="movements" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Movimientos de Inventario</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Filtrar por Fecha
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Movimiento
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historial de Movimientos</CardTitle>
                <CardDescription>Registro completo de entradas, salidas y ajustes de inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {movements.map((movement) => (
                    <div key={movement.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {getMovementIcon(movement.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{movement.product}</h4>
                          <Badge variant="outline" className="text-xs">
                            {movement.sku}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              movement.type === "entrada"
                                ? "text-green-600"
                                : movement.type === "salida"
                                  ? "text-blue-600"
                                  : "text-orange-600"
                            }
                          >
                            {movement.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {movement.type === "entrada" ? "+" : movement.type === "salida" ? "-" : ""}
                          {Math.abs(movement.quantity)} unidades - {movement.reason}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {movement.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {movement.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {movement.reference}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Alertas del Sistema</h2>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configurar Alertas
              </Button>
            </div>

            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{alert.title}</CardTitle>
                          <Badge className={getPriorityColor(alert.priority)} variant="outline">
                            {alert.priority}
                          </Badge>
                        </div>
                        <CardDescription>{alert.description}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {alert.type}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Analíticas de Inventario</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Último mes
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Reporte
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notebooks</span>
                      <span className="font-medium">345 (28%)</span>
                    </div>
                    <Progress value={28} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monitores</span>
                      <span className="font-medium">234 (19%)</span>
                    </div>
                    <Progress value={19} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Periféricos</span>
                      <span className="font-medium">456 (37%)</span>
                    </div>
                    <Progress value={37} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Impresoras</span>
                      <span className="font-medium">123 (10%)</span>
                    </div>
                    <Progress value={10} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Otros</span>
                      <span className="font-medium">89 (7%)</span>
                    </div>
                    <Progress value={7} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Utilización de Depósitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                          <Building className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Depósito A</p>
                          <p className="text-xs text-muted-foreground">Productos tecnológicos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">85%</p>
                        <p className="text-xs text-muted-foreground">456 productos</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                          <Building className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Depósito B</p>
                          <p className="text-xs text-muted-foreground">Periféricos y accesorios</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">72%</p>
                        <p className="text-xs text-muted-foreground">389 productos</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
                          <Building className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Depósito C</p>
                          <p className="text-xs text-muted-foreground">Equipos de oficina</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">63%</p>
                        <p className="text-xs text-muted-foreground">234 productos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
