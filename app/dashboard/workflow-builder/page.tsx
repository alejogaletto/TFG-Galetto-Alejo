"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Database,
  FileText,
  Mail,
  Plus,
  Save,
  Settings,
  Trash,
} from "lucide-react"
import { email } from "some-email-module" // Declare the email variable here

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function WorkflowBuilderPage() {
  const [workflowName, setWorkflowName] = useState("New Workflow")
  const [workflowDescription, setWorkflowDescription] = useState("Automate your business processes")
  const [activeTab, setActiveTab] = useState("design")
  const [showAddStep, setShowAddStep] = useState(false)
  const [showStepSettings, setShowStepSettings] = useState(null)
  const [selectedStepType, setSelectedStepType] = useState("trigger")
  const [selectedTriggerType, setSelectedTriggerType] = useState("form")
  const [selectedActionType, setSelectedActionType] = useState("email")

  const [workflowSteps, setWorkflowSteps] = useState([
    {
      id: 1,
      type: "trigger",
      triggerType: "form",
      name: "Form Submission",
      description: "When a form is submitted",
      icon: <FileText className="h-8 w-8" />,
      config: {
        formId: "customer_feedback",
        formName: "Customer Feedback",
      },
    },
    {
      id: 2,
      type: "action",
      actionType: "database",
      name: "Update Database",
      description: "Add data to a database",
      icon: <Database className="h-8 w-8" />,
      config: {
        databaseId: "customers",
        databaseName: "Customers",
        action: "create",
        mappings: [
          { source: "name", target: "name" },
          { source: "email", target: "email" },
        ],
      },
    },
    {
      id: 3,
      type: "action",
      actionType: "email",
      name: "Send Email",
      description: "Send a confirmation email",
      icon: <Mail className="h-8 w-8" />,
      config: {
        template: "confirmation",
        subject: "Thank you for your submission",
        to: "{{email}}",
        body: "Dear {{name}},\n\nThank you for your feedback. We appreciate your input and will review it shortly.\n\nBest regards,\nThe Team",
      },
    },
  ])

  const triggerTypes = [
    {
      id: "form",
      name: "Form Submission",
      icon: <FileText className="h-4 w-4" />,
      description: "Trigger when a form is submitted",
    },
    {
      id: "schedule",
      name: "Schedule",
      icon: <Calendar className="h-4 w-4" />,
      description: "Trigger at specific times or intervals",
    },
    {
      id: "database",
      name: "Database Change",
      icon: <Database className="h-4 w-4" />,
      description: "Trigger when data changes in a database",
    },
    {
      id: "webhook",
      name: "Webhook",
      icon: <ArrowRight className="h-4 w-4" />,
      description: "Trigger from external systems via webhook",
    },
  ]

  const actionTypes = [
    {
      id: "email",
      name: "Send Email",
      icon: <Mail className="h-4 w-4" />,
      description: "Send an email to users or team members",
    },
    {
      id: "database",
      name: "Update Database",
      icon: <Database className="h-4 w-4" />,
      description: "Create, update, or delete database records",
    },
    {
      id: "notification",
      name: "Send Notification",
      icon: <ArrowRight className="h-4 w-4" />,
      description: "Send in-app notifications",
    },
    {
      id: "condition",
      name: "Condition",
      icon: <Check className="h-4 w-4" />,
      description: "Branch workflow based on conditions",
    },
    {
      id: "delay",
      name: "Delay",
      icon: <Clock className="h-4 w-4" />,
      description: "Wait for a specified time period",
    },
  ]

  const addWorkflowStep = () => {
    const newId = Math.max(...workflowSteps.map((step) => step.id)) + 1

    const newStep = {
      id: newId,
      type: selectedStepType,
      config: {},
    }

    if (selectedStepType === "trigger") {
      newStep.triggerType = selectedTriggerType

      switch (selectedTriggerType) {
        case "form":
          newStep.name = "Form Submission"
          newStep.description = "When a form is submitted"
          newStep.icon = <FileText className="h-8 w-8" />
          newStep.config = {
            formId: "customer_feedback",
            formName: "Customer Feedback",
          }
          break
        case "schedule":
          newStep.name = "Schedule"
          newStep.description = "Run at specific times"
          newStep.icon = <Calendar className="h-8 w-8" />
          newStep.config = {
            frequency: "daily",
            time: "09:00",
          }
          break
        case "database":
          newStep.name = "Database Change"
          newStep.description = "When data changes"
          newStep.icon = <Database className="h-8 w-8" />
          newStep.config = {
            databaseId: "customers",
            databaseName: "Customers",
            event: "create",
          }
          break
      }
    } else if (selectedStepType === "action") {
      newStep.actionType = selectedActionType

      switch (selectedActionType) {
        case "email":
          newStep.name = "Send Email"
          newStep.description = "Send an email"
          newStep.icon = <Mail className="h-8 w-8" />
          newStep.config = {
            template: "default",
            subject: "Notification",
            to: "",
            body: "",
          }
          break
        case "database":
          newStep.name = "Update Database"
          newStep.description = "Add or update data"
          newStep.icon = <Database className="h-8 w-8" />
          newStep.config = {
            databaseId: "customers",
            databaseName: "Customers",
            action: "create",
            mappings: [],
          }
          break
        case "condition":
          newStep.name = "Condition"
          newStep.description = "Branch based on conditions"
          newStep.icon = <Check className="h-8 w-8" />
          newStep.config = {
            field: "",
            operator: "equals",
            value: "",
          }
          break
      }
    }

    setWorkflowSteps([...workflowSteps, newStep])
    setShowAddStep(false)
  }

  const removeWorkflowStep = (id) => {
    setWorkflowSteps(workflowSteps.filter((step) => step.id !== id))
    setShowStepSettings(null)
  }

  const updateWorkflowStep = (id, updates) => {
    setWorkflowSteps(workflowSteps.map((step) => (step.id === id ? { ...step, ...updates } : step)))
  }

  const moveWorkflowStep = (id, direction) => {
    const index = workflowSteps.findIndex((step) => step.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === workflowSteps.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? index - 1 : index + 1
    const newSteps = [...workflowSteps]
    const step = newSteps[index]
    newSteps.splice(index, 1)
    newSteps.splice(newIndex, 0, step)

    setWorkflowSteps(newSteps)
  }

  const renderStepSettings = (step) => {
    if (!step) return null

    return (
      <div className="space-y-4 p-4 border rounded-md bg-muted/30">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Step Settings</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowStepSettings(null)}>
            Close
          </Button>
        </div>

        {step.type === "trigger" && step.triggerType === "form" && (
          <>
            <div className="space-y-2">
              <Label>Select Form</Label>
              <Select
                value={step.config.formId}
                onValueChange={(value) => {
                  const formName =
                    value === "customer_feedback"
                      ? "Customer Feedback"
                      : value === "employee_onboarding"
                        ? "Employee Onboarding"
                        : value === "project_request"
                          ? "Project Request"
                          : "Unknown Form"
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, formId: value, formName },
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_feedback">Customer Feedback</SelectItem>
                  <SelectItem value="employee_onboarding">Employee Onboarding</SelectItem>
                  <SelectItem value="project_request">Project Request</SelectItem>
                  <SelectItem value="it_support">IT Support Ticket</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Form Fields to Use</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-name" defaultChecked />
                  <Label htmlFor="field-name">Name</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-email" defaultChecked />
                  <Label htmlFor="field-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-message" defaultChecked />
                  <Label htmlFor="field-message">Message</Label>
                </div>
              </div>
            </div>
          </>
        )}

        {step.type === "trigger" && step.triggerType === "schedule" && (
          <>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={step.config.frequency}
                onValueChange={(value) =>
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, frequency: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {step.config.frequency === "daily" && (
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={step.config.time}
                  onChange={(e) =>
                    updateWorkflowStep(step.id, {
                      config: { ...step.config, time: e.target.value },
                    })
                  }
                />
              </div>
            )}
            {step.config.frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  defaultValue="monday"
                  onValueChange={(value) =>
                    updateWorkflowStep(step.id, {
                      config: { ...step.config, dayOfWeek: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {step.type === "action" && step.actionType === "email" && (
          <>
            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select
                value={step.config.template}
                onValueChange={(value) =>
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, template: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmation">Confirmation Email</SelectItem>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="notification">Notification Email</SelectItem>
                  <SelectItem value="custom">Custom Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Input
                placeholder="Use form field or enter email"
                value={step.config.to}
                onChange={(e) =>
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, to: e.target.value },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">Use field placeholders like {email}</p>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Email subject"
                value={step.config.subject}
                onChange={(e) =>
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, subject: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                rows={5}
                value={step.config.body}
                onChange={(e) =>
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, body: e.target.value },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">Use field placeholders like {email}</p>
            </div>
          </>
        )}

        {step.type === "action" && step.actionType === "database" && (
          <>
            <div className="space-y-2">
              <Label>Select Database</Label>
              <Select
                value={step.config.databaseId}
                onValueChange={(value) => {
                  const databaseName =
                    value === "customers"
                      ? "Customers"
                      : value === "orders"
                        ? "Orders"
                        : value === "products"
                          ? "Products"
                          : "Unknown Database"
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, databaseId: value, databaseName },
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="employees">Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={step.config.action}
                onValueChange={(value) =>
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, action: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create new record</SelectItem>
                  <SelectItem value="update">Update existing record</SelectItem>
                  <SelectItem value="delete">Delete record</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Field Mappings</Label>
              <div className="space-y-2 border rounded-md p-2">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="text-sm font-medium">Form Field</div>
                  <div className="text-sm font-medium">Database Field</div>
                </div>
                {step.config.mappings?.map((mapping, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 items-center">
                    <Input
                      value={mapping.source}
                      onChange={(e) => {
                        const newMappings = [...step.config.mappings]
                        newMappings[index].source = e.target.value
                        updateWorkflowStep(step.id, {
                          config: { ...step.config, mappings: newMappings },
                        })
                      }}
                    />
                    <div className="flex gap-2 items-center">
                      <Input
                        value={mapping.target}
                        onChange={(e) => {
                          const newMappings = [...step.config.mappings]
                          newMappings[index].target = e.target.value
                          updateWorkflowStep(step.id, {
                            config: { ...step.config, mappings: newMappings },
                          })
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const newMappings = step.config.mappings.filter((_, i) => i !== index)
                          updateWorkflowStep(step.id, {
                            config: { ...step.config, mappings: newMappings },
                          })
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    const newMappings = [...(step.config.mappings || []), { source: "", target: "" }]
                    updateWorkflowStep(step.id, {
                      config: { ...step.config, mappings: newMappings },
                    })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mapping
                </Button>
              </div>
            </div>
          </>
        )}

        {step.type === "action" && step.actionType === "condition" && (
          <>
            <div className="space-y-2">
              <Label>Field to Check</Label>
              <Input
                placeholder="Enter field name"
                value={step.config.field || ""}
                onChange={(e) =>
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, field: e.target.value },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">Use field name from previous steps</p>
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={step.config.operator || "equals"}
                onValueChange={(value) =>
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, operator: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                placeholder="Value to compare against"
                value={step.config.value || ""}
                onChange={(e) =>
                  updateWorkflowStep(step.id, {
                    config: { ...step.config, value: e.target.value },
                  })
                }
              />
            </div>
          </>
        )}

        <div className="pt-2 flex justify-between">
          <Button variant="destructive" size="sm" onClick={() => removeWorkflowStep(step.id)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/workflows" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Flujos de Trabajo</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link className="text-sm font-medium" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/forms">
            Forms
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/databases">
            Databases
          </Link>
          <Link className="text-sm font-medium text-primary" href="/dashboard/workflows">
            Workflows
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/solutions">
            Solutions
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
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
            <h2 className="font-semibold mb-2">Desencadenantes</h2>
            <div className="grid gap-2">
              {triggerTypes.map((trigger) => (
                <Button
                  key={trigger.id}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setSelectedStepType("trigger")
                    setSelectedTriggerType(trigger.id)
                    setShowAddStep(true)
                  }}
                >
                  {trigger.icon}
                  <span className="ml-2">{trigger.name}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2">Form Triggers</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded-md hover:border-primary/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Customer Feedback Form Submission</span>
                </div>
                <Button variant="ghost" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md hover:border-primary/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>IT Support Ticket Form Submission</span>
                </div>
                <Button variant="ghost" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md hover:border-primary/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Employee Onboarding Form Submission</span>
                </div>
                <Button variant="ghost" size="sm">
                  Add
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2">Acciones</h2>
            <div className="grid gap-2">
              {actionTypes.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setSelectedStepType("action")
                    setSelectedActionType(action.id)
                    setShowAddStep(true)
                  }}
                >
                  {action.icon}
                  <span className="ml-2">{action.name}</span>
                </Button>
              ))}
            </div>
          </div>
          {showStepSettings !== null && (
            <div className="p-4">{renderStepSettings(workflowSteps.find((step) => step.id === showStepSettings))}</div>
          )}
        </aside>
        <main className="flex flex-1 flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="border-b">
              <div className="flex items-center px-4 py-2">
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="max-w-[300px] border-none text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
                <TabsList className="ml-auto">
                  <TabsTrigger value="design">Diseño</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="design" className="flex-1 p-4">
              <div className="mx-auto max-w-[800px]">
                <Dialog open={showAddStep} onOpenChange={setShowAddStep}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Paso de Flujo de Trabajo</DialogTitle>
                      <DialogDescription>Configura el nuevo paso para tu flujo de trabajo.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Tabs defaultValue={selectedStepType}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="trigger" onClick={() => setSelectedStepType("trigger")}>
                            Desencadenante
                          </TabsTrigger>
                          <TabsTrigger value="action" onClick={() => setSelectedStepType("action")}>
                            Acción
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="trigger" className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Trigger Type</Label>
                            <RadioGroup
                              value={selectedTriggerType}
                              onValueChange={setSelectedTriggerType}
                              className="space-y-2"
                            >
                              {triggerTypes.map((trigger) => (
                                <div key={trigger.id} className="flex items-start space-x-2">
                                  <RadioGroupItem value={trigger.id} id={`trigger-${trigger.id}`} />
                                  <div className="grid gap-1">
                                    <Label htmlFor={`trigger-${trigger.id}`} className="flex items-center">
                                      {trigger.icon}
                                      <span className="ml-2">{trigger.name}</span>
                                    </Label>
                                    <p className="text-sm text-muted-foreground">{trigger.description}</p>
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </TabsContent>
                        <TabsContent value="action" className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Action Type</Label>
                            <RadioGroup
                              value={selectedActionType}
                              onValueChange={setSelectedActionType}
                              className="space-y-2"
                            >
                              {actionTypes.map((action) => (
                                <div key={action.id} className="flex items-start space-x-2">
                                  <RadioGroupItem value={action.id} id={`action-${action.id}`} />
                                  <div className="grid gap-1">
                                    <Label htmlFor={`action-${action.id}`} className="flex items-center">
                                      {action.icon}
                                      <span className="ml-2">{action.name}</span>
                                    </Label>
                                    <p className="text-sm text-muted-foreground">{action.description}</p>
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddStep(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addWorkflowStep}>Add Step</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="mb-8 relative">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-muted p-3 flex-shrink-0">{step.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium">{step.name}</h3>
                            <p className="text-muted-foreground">{step.description}</p>

                            {step.type === "trigger" && step.triggerType === "form" && (
                              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                                <p className="text-sm font-medium">Form: {step.config.formName}</p>
                                <p className="text-sm text-muted-foreground">Triggers when this form is submitted</p>
                              </div>
                            )}

                            {step.type === "action" && step.actionType === "database" && (
                              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                                <p className="text-sm font-medium">Database: {step.config.databaseName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Action:{" "}
                                  {step.config.action === "create"
                                    ? "Create new record"
                                    : step.config.action === "update"
                                      ? "Update existing record"
                                      : "Delete record"}
                                </p>
                                {step.config.mappings && step.config.mappings.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium">Field Mappings:</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                      {step.config.mappings.map((mapping, i) => (
                                        <div key={i} className="col-span-2 grid grid-cols-2 text-sm">
                                          <span>{mapping.source}</span>
                                          <span className="flex items-center">
                                            <ArrowRight className="h-3 w-3 mx-1" />
                                            {mapping.target}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {step.type === "action" && step.actionType === "email" && (
                              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                                <p className="text-sm font-medium">Template: {step.config.template}</p>
                                <p className="text-sm">To: {step.config.to}</p>
                                <p className="text-sm">Subject: {step.config.subject}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setShowStepSettings(step.id)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeWorkflowStep(step.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {index < workflowSteps.length - 1 && (
                      <div className="flex justify-center my-2">
                        <ArrowDown className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={() => setShowAddStep(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="p-4">
              <div className="mx-auto max-w-[800px]">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workflow-name">Workflow Name</Label>
                      <Input
                        id="workflow-name"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workflow-description">Description</Label>
                      <Textarea
                        id="workflow-description"
                        placeholder="Enter a description for your workflow"
                        value={workflowDescription}
                        onChange={(e) => setWorkflowDescription(e.target.value)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="workflow-active">Active</Label>
                        <p className="text-sm text-muted-foreground">Enable or disable this workflow</p>
                      </div>
                      <Switch id="workflow-active" defaultChecked />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Error Handling</Label>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Retry on failure</p>
                          <p className="text-sm text-muted-foreground">Attempt to run the workflow again if it fails</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Notify on error</p>
                          <p className="text-sm text-muted-foreground">Send email notification when workflow fails</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Execution Settings</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">Run in background</p>
                            <p className="text-sm text-muted-foreground">Execute workflow asynchronously</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">Timeout (minutes)</p>
                            <p className="text-sm text-muted-foreground">Maximum execution time</p>
                          </div>
                          <Input type="number" className="w-20" defaultValue="30" min="1" max="120" />
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
    </div>
  )
}
