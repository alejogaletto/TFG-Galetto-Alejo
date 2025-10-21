"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  Package,
  Users,
  ShoppingCart,
  MessageSquare,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export default function SolutionSetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const solutionId = searchParams ? searchParams.get("id") : null
  const templateId = searchParams ? searchParams.get("template") : null

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupProgress, setSetupProgress] = useState(0)

  const [solutionData, setSolutionData] = useState({
    name: "",
    description: "",
    modules: [],
    forms: [],
    databases: [],
    workflows: [],
  })

  // Template definitions
  const templates = {
    crm: {
      name: "Customer Relationship Management",
      description: "Manage customer interactions, track leads, and improve customer service",
      icon: <Users className="h-10 w-10 text-blue-500" />,
      modules: [
        { id: "contacts", name: "Contacts", required: true },
        { id: "leads", name: "Leads", required: true },
        { id: "deals", name: "Deals", required: true },
        { id: "activities", name: "Activities", required: false },
        { id: "email", name: "Email Integration", required: false },
      ],
      forms: [
        { id: "contact", name: "Contact Form", required: true },
        { id: "lead", name: "Lead Capture Form", required: true },
        { id: "deal", name: "Deal Information", required: true },
      ],
      databases: [
        { id: "contacts", name: "Contacts Database", required: true },
        { id: "leads", name: "Leads Database", required: true },
        { id: "deals", name: "Deals Database", required: true },
        { id: "activities", name: "Activities Database", required: false },
      ],
      workflows: [
        { id: "lead_assignment", name: "Lead Assignment", required: false },
        { id: "deal_stages", name: "Deal Stage Progression", required: true },
        { id: "follow_up", name: "Follow-up Reminders", required: false },
      ],
    },
    inventory: {
      name: "Inventory Management",
      description: "Track stock levels, manage suppliers, and automate reordering",
      icon: <Package className="h-10 w-10 text-green-500" />,
      modules: [
        { id: "products", name: "Products", required: true },
        { id: "stock", name: "Stock Management", required: true },
        { id: "suppliers", name: "Suppliers", required: true },
        { id: "orders", name: "Purchase Orders", required: false },
        { id: "reports", name: "Inventory Reports", required: false },
      ],
      forms: [
        { id: "product", name: "Product Form", required: true },
        { id: "supplier", name: "Supplier Form", required: true },
        { id: "stock_adjustment", name: "Stock Adjustment Form", required: true },
        { id: "purchase_order", name: "Purchase Order Form", required: false },
      ],
      databases: [
        { id: "products", name: "Products Database", required: true },
        { id: "stock", name: "Stock Levels Database", required: true },
        { id: "suppliers", name: "Suppliers Database", required: true },
        { id: "purchase_orders", name: "Purchase Orders Database", required: false },
      ],
      workflows: [
        { id: "low_stock", name: "Low Stock Alerts", required: true },
        { id: "order_approval", name: "Purchase Order Approval", required: false },
        { id: "stock_updates", name: "Automatic Stock Updates", required: false },
      ],
    },
  }

  // Get template data
  const templateData = templateId && templates[templateId] ? templates[templateId] : null

  // Initialize solution data from template
  useEffect(() => {
    if (templateData) {
      setSolutionData({
        name: templateData.name,
        description: templateData.description,
        modules: templateData.modules.filter((m) => m.required).map((m) => m.id),
        forms: templateData.forms.filter((f) => f.required).map((f) => f.id),
        databases: templateData.databases.filter((d) => d.required).map((d) => d.id),
        workflows: templateData.workflows.filter((w) => w.required).map((w) => w.id),
      })
    }
  }, [templateData])

  // Update progress when step changes
  useEffect(() => {
    const totalSteps = 5
    setSetupProgress((currentStep / totalSteps) * 100)
  }, [currentStep])

  const handleModuleToggle = (moduleId) => {
    setSolutionData((prev) => {
      if (prev.modules.includes(moduleId)) {
        return {
          ...prev,
          modules: prev.modules.filter((id) => id !== moduleId),
        }
      } else {
        return {
          ...prev,
          modules: [...prev.modules, moduleId],
        }
      }
    })
  }

  const handleFormToggle = (formId) => {
    setSolutionData((prev) => {
      if (prev.forms.includes(formId)) {
        return {
          ...prev,
          forms: prev.forms.filter((id) => id !== formId),
        }
      } else {
        return {
          ...prev,
          forms: [...prev.forms, formId],
        }
      }
    })
  }

  const handleDatabaseToggle = (databaseId) => {
    setSolutionData((prev) => {
      if (prev.databases.includes(databaseId)) {
        return {
          ...prev,
          databases: prev.databases.filter((id) => id !== databaseId),
        }
      } else {
        return {
          ...prev,
          databases: [...prev.databases, databaseId],
        }
      }
    })
  }

  const handleWorkflowToggle = (workflowId) => {
    setSolutionData((prev) => {
      if (prev.workflows.includes(workflowId)) {
        return {
          ...prev,
          workflows: prev.workflows.filter((id) => id !== workflowId),
        }
      } else {
        return {
          ...prev,
          workflows: [...prev.workflows, workflowId],
        }
      }
    })
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete setup
      finishSetup()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const finishSetup = () => {
    setIsLoading(true)

    // Simulate setup process
    setTimeout(() => {
      setSetupComplete(true)
      setIsLoading(false)
    }, 2000)
  }

  const getTemplateIcon = () => {
    switch (templateId) {
      case "crm":
        return <Users className="h-12 w-12 text-blue-500" />
      case "inventory":
        return <Package className="h-12 w-12 text-green-500" />
      case "orders":
        return <ShoppingCart className="h-12 w-12 text-purple-500" />
      case "helpdesk":
        return <MessageSquare className="h-12 w-12 text-orange-500" />
      case "project":
        return <Clock className="h-12 w-12 text-indigo-500" />
      case "hr":
        return <Users className="h-12 w-12 text-red-500" />
      case "expenses":
        return <DollarSign className="h-12 w-12 text-emerald-500" />
      case "events":
        return <Calendar className="h-12 w-12 text-yellow-500" />
      default:
        return <Package className="h-12 w-12 text-gray-500" />
    }
  }

  if (!templateData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Template Not Found</CardTitle>
            <CardDescription>The requested template could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/solutions">Volver a Soluciones</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (setupComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/10">
        <Card className="w-[500px]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Setup Complete!</CardTitle>
            <CardDescription>
              Your {templateData.name} solution has been successfully set up and is ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium mb-2">What's included:</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>{solutionData.modules.length} modules</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>{solutionData.forms.length} forms</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>{solutionData.databases.length} databases</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>{solutionData.workflows.length} workflows</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href={`/dashboard/solutions/${solutionId}`}>Ir al Panel de Solución</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/solutions">Volver a Soluciones</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/solutions" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Soluciones</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
            Atrás
          </Button>
          <Button size="sm" onClick={nextStep} disabled={isLoading}>
            {currentStep === 5 ? (
              isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                "Completar Configuración"
              )
            ) : (
              "Continuar"
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col">
        <div className="border-b bg-muted/20 px-6 py-4">
          <div className="mx-auto max-w-[800px]">
            <div className="flex items-center gap-4">
              {getTemplateIcon()}
              <div>
                <h1 className="text-2xl font-semibold">{templateData.name}</h1>
                <p className="text-muted-foreground">{templateData.description}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Setup Progress</div>
                <div className="text-sm text-muted-foreground">Step {currentStep} of 5</div>
              </div>
              <Progress value={setupProgress} className="h-2" />
            </div>

            <div className="flex justify-between mt-4">
              <div className={`flex items-center ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary mr-2">
                  {currentStep > 1 ? <Check className="h-3 w-3" /> : "1"}
                </div>
                <span className="text-sm">Basics</span>
              </div>
              <div className={`flex items-center ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary mr-2">
                  {currentStep > 2 ? <Check className="h-3 w-3" /> : "2"}
                </div>
                <span className="text-sm">Modules</span>
              </div>
              <div className={`flex items-center ${currentStep >= 3 ? "text-primary" : "text-muted-foreground"}`}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary mr-2">
                  {currentStep > 3 ? <Check className="h-3 w-3" /> : "3"}
                </div>
                <span className="text-sm">Formularios</span>
              </div>
              <div className={`flex items-center ${currentStep >= 4 ? "text-primary" : "text-muted-foreground"}`}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary mr-2">
                  {currentStep > 4 ? <Check className="h-3 w-3" /> : "4"}
                </div>
                <span className="text-sm">Bases de Datos</span>
              </div>
              <div className={`flex items-center ${currentStep >= 5 ? "text-primary" : "text-muted-foreground"}`}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary mr-2">
                  {currentStep > 5 ? <Check className="h-3 w-3" /> : "5"}
                </div>
                <span className="text-sm">Flujos de Trabajo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="mx-auto max-w-[800px]">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Basic Information</h2>
                <p className="text-muted-foreground">
                  Let's start by setting up the basic information for your {templateData.name} solution.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="solution-name">Solution Name</Label>
                    <Input
                      id="solution-name"
                      value={solutionData.name}
                      onChange={(e) => setSolutionData({ ...solutionData, name: e.target.value })}
                      placeholder="Enter a name for your solution"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solution-description">Description</Label>
                    <Textarea
                      id="solution-description"
                      value={solutionData.description}
                      onChange={(e) => setSolutionData({ ...solutionData, description: e.target.value })}
                      placeholder="Describe what this solution will be used for"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Modules */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Select Modules</h2>
                <p className="text-muted-foreground">
                  Choose which modules you want to include in your {templateData.name} solution.
                </p>

                <div className="space-y-4">
                  {templateData.modules.map((module) => (
                    <div key={module.id} className="flex items-start space-x-3 p-4 border rounded-md">
                      <Checkbox
                        id={`module-${module.id}`}
                        checked={solutionData.modules.includes(module.id)}
                        onCheckedChange={() => handleModuleToggle(module.id)}
                        disabled={module.required}
                      />
                      <div className="space-y-1">
                        <Label htmlFor={`module-${module.id}`} className="font-medium">
                          {module.name}
                          {module.required && <Badge className="ml-2 bg-blue-100 text-blue-800">Required</Badge>}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {module.id === "contacts" && "Manage customer contact information and communication history"}
                          {module.id === "leads" && "Track and manage potential customers through your sales pipeline"}
                          {module.id === "deals" && "Track sales opportunities and manage your sales pipeline"}
                          {module.id === "activities" && "Schedule and track meetings, calls, and tasks"}
                          {module.id === "email" && "Send and track emails directly from the CRM"}

                          {module.id === "products" && "Manage product information, categories, and pricing"}
                          {module.id === "stock" && "Track inventory levels across locations"}
                          {module.id === "suppliers" && "Manage supplier information and purchase history"}
                          {module.id === "orders" && "Create and manage purchase orders"}
                          {module.id === "reports" && "Generate inventory reports and analytics"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Forms */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Configurar Formularios</h2>
                <p className="text-muted-foreground">
                  Select which forms you want to include in your solution. These forms will be used to collect data.
                </p>

                <div className="space-y-4">
                  {templateData.forms.map((form) => (
                    <div key={form.id} className="flex items-start space-x-3 p-4 border rounded-md">
                      <Checkbox
                        id={`form-${form.id}`}
                        checked={solutionData.forms.includes(form.id)}
                        onCheckedChange={() => handleFormToggle(form.id)}
                        disabled={form.required}
                      />
                      <div className="space-y-1">
                        <Label htmlFor={`form-${form.id}`} className="font-medium">
                          {form.name}
                          {form.required && <Badge className="ml-2 bg-blue-100 text-blue-800">Required</Badge>}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {form.id === "contact" && "Collect and manage customer contact information"}
                          {form.id === "lead" && "Capture new leads from your website or manually"}
                          {form.id === "deal" && "Record details about sales opportunities"}

                          {form.id === "product" && "Add and update product information"}
                          {form.id === "supplier" && "Add and manage supplier information"}
                          {form.id === "stock_adjustment" && "Record stock adjustments and movements"}
                          {form.id === "purchase_order" && "Create purchase orders for suppliers"}
                        </p>
                        <div className="mt-2">
                          <Button variant="outline" size="sm">
                            Preview Form
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Databases */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Configurar Bases de Datos</h2>
                <p className="text-muted-foreground">
                  Select which databases you want to include. These will store the data for your solution.
                </p>

                <div className="space-y-4">
                  {templateData.databases.map((database) => (
                    <div key={database.id} className="flex items-start space-x-3 p-4 border rounded-md">
                      <Checkbox
                        id={`database-${database.id}`}
                        checked={solutionData.databases.includes(database.id)}
                        onCheckedChange={() => handleDatabaseToggle(database.id)}
                        disabled={database.required}
                      />
                      <div className="space-y-1">
                        <Label htmlFor={`database-${database.id}`} className="font-medium">
                          {database.name}
                          {database.required && <Badge className="ml-2 bg-blue-100 text-blue-800">Required</Badge>}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {database.id === "contacts" && "Store customer contact information and communication history"}
                          {database.id === "leads" && "Store lead information and track conversion status"}
                          {database.id === "deals" && "Store sales opportunities and track pipeline progress"}
                          {database.id === "activities" && "Store scheduled activities and task information"}

                          {database.id === "products" && "Store product information, categories, and pricing"}
                          {database.id === "stock" && "Store current inventory levels and location information"}
                          {database.id === "suppliers" && "Store supplier information and purchase history"}
                          {database.id === "purchase_orders" && "Store purchase order information and status"}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button variant="outline" size="sm">
                            View Schema
                          </Button>
                          <Button variant="outline" size="sm">
                            Sample Data
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Workflows */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Configurar Flujos de Trabajo</h2>
                <p className="text-muted-foreground">
                  Select which automated workflows you want to include. These will help automate your business
                  processes.
                </p>

                <div className="space-y-4">
                  {templateData.workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-start space-x-3 p-4 border rounded-md">
                      <Checkbox
                        id={`workflow-${workflow.id}`}
                        checked={solutionData.workflows.includes(workflow.id)}
                        onCheckedChange={() => handleWorkflowToggle(workflow.id)}
                        disabled={workflow.required}
                      />
                      <div className="space-y-1">
                        <Label htmlFor={`workflow-${workflow.id}`} className="font-medium">
                          {workflow.name}
                          {workflow.required && <Badge className="ml-2 bg-blue-100 text-blue-800">Required</Badge>}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {workflow.id === "lead_assignment" &&
                            "Automatically assign new leads to sales representatives"}
                          {workflow.id === "deal_stages" && "Automate movement through sales pipeline stages"}
                          {workflow.id === "follow_up" && "Send automated follow-up reminders for leads and deals"}

                          {workflow.id === "low_stock" && "Send alerts when inventory levels fall below thresholds"}
                          {workflow.id === "order_approval" && "Route purchase orders through an approval process"}
                          {workflow.id === "stock_updates" && "Automatically update stock levels based on transactions"}
                        </p>
                        <div className="mt-2">
                          <Button variant="outline" size="sm">
                            View Workflow
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
