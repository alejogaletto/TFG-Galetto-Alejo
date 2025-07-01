"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Database, GitBranch, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Mock form data - in a real app, this would come from an API or database
const formTemplates = {
  "customer-feedback": {
    id: "customer-feedback",
    title: "Comentarios de Clientes",
    description: "Valoramos tus comentarios. Por favor, déjanos saber cómo lo estamos haciendo.",
    logo: "/placeholder.svg?height=40&width=40",
    companyName: "AutomateSMB",
    primaryColor: "#4f46e5",
    successMessage: "¡Gracias por tus comentarios! Apreciamos tu opinión.",
    elements: [
      {
        id: 1,
        type: "text",
        label: "Nombre Completo",
        placeholder: "Ingresa tu nombre completo",
        required: true,
        helpText: "Por favor ingresa tu nombre legal como aparece en tu identificación",
      },
      {
        id: 2,
        type: "email",
        label: "Dirección de Email",
        placeholder: "Ingresa tu dirección de email",
        required: true,
        helpText: "Nunca compartiremos tu email con nadie más",
      },
      {
        id: 3,
        type: "select",
        label: "Calificación",
        placeholder: "Selecciona tu calificación",
        required: true,
        helpText: "¿Cómo calificarías tu experiencia?",
        options: ["Excelente", "Bueno", "Regular", "Malo", "Muy Malo"],
      },
      {
        id: 4,
        type: "textarea",
        label: "Comentarios",
        placeholder: "Por favor comparte tus comentarios",
        required: true,
        helpText: "Cuéntanos qué te gustó o cómo podemos mejorar",
        rows: 4,
      },
    ],
    connections: {
      database: {
        connected: true,
        name: "Clientes",
      },
      workflow: {
        connected: true,
        name: "Procesamiento de Comentarios de Clientes",
      },
    },
  },
  "contact-form": {
    id: "contact-form",
    title: "Contáctanos",
    description: "¿Tienes preguntas? Ponte en contacto con nuestro equipo.",
    logo: "/placeholder.svg?height=40&width=40",
    companyName: "AutomateSMB",
    primaryColor: "#0ea5e9",
    successMessage: "¡Gracias por contactarnos! Te responderemos pronto.",
    elements: [
      {
        id: 1,
        type: "text",
        label: "Nombre Completo",
        placeholder: "Ingresa tu nombre completo",
        required: true,
        helpText: "",
      },
      {
        id: 2,
        type: "email",
        label: "Dirección de Email",
        placeholder: "Ingresa tu dirección de email",
        required: true,
        helpText: "Responderemos a esta dirección de email",
      },
      {
        id: 3,
        type: "text",
        label: "Asunto",
        placeholder: "¿De qué se trata?",
        required: true,
        helpText: "",
      },
      {
        id: 4,
        type: "textarea",
        label: "Mensaje",
        placeholder: "Ingresa tu mensaje",
        required: true,
        helpText: "Por favor proporciona tantos detalles como sea posible",
        rows: 4,
      },
    ],
    connections: {
      database: {
        connected: true,
        name: "Contactos",
      },
      workflow: {
        connected: true,
        name: "Procesamiento de Formulario de Contacto",
      },
    },
  },
  "job-application": {
    id: "job-application",
    title: "Solicitud de Empleo",
    description: "Aplica para puestos disponibles en nuestra empresa.",
    logo: "/placeholder.svg?height=40&width=40",
    companyName: "AutomateSMB",
    primaryColor: "#10b981",
    successMessage: "¡Gracias por tu solicitud! La revisaremos y te contactaremos pronto.",
    elements: [
      {
        id: 1,
        type: "text",
        label: "Nombre Completo",
        placeholder: "Ingresa tu nombre completo",
        required: true,
        helpText: "",
      },
      {
        id: 2,
        type: "email",
        label: "Dirección de Email",
        placeholder: "Ingresa tu dirección de email",
        required: true,
        helpText: "",
      },
      {
        id: 3,
        type: "phone",
        label: "Número de Teléfono",
        placeholder: "Ingresa tu número de teléfono",
        required: true,
        helpText: "",
      },
      {
        id: 4,
        type: "select",
        label: "Puesto",
        placeholder: "Selecciona el puesto al que aplicas",
        required: true,
        helpText: "",
        options: [
          "Desarrollador de Software",
          "Gerente de Producto",
          "Diseñador UX",
          "Especialista en Marketing",
          "Representante de Ventas",
        ],
      },
      {
        id: 5,
        type: "textarea",
        label: "Carta de Presentación",
        placeholder: "Cuéntanos por qué te interesa este puesto",
        required: true,
        helpText: "Describe brevemente tu experiencia relevante y por qué eres una buena opción",
        rows: 5,
      },
      {
        id: 6,
        type: "checkbox",
        label: "Acepto los términos y condiciones",
        required: true,
        helpText: "",
      },
    ],
    connections: {
      database: {
        connected: true,
        name: "Solicitudes de Empleo",
      },
      workflow: {
        connected: true,
        name: "Procesamiento de Solicitudes",
      },
    },
  },
}

export default function FormView({ params }) {
  const router = useRouter()
  const { formId } = params
  const [form, setForm] = useState(null)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConnections, setShowConnections] = useState(false)

  // Map numeric IDs to template IDs for backward compatibility
  const numericIdMap = {
    "1": "customer-feedback",
    "2": "contact-form",
    "3": "job-application",
  }

  useEffect(() => {
    // Check if formId is a numeric ID and map it to a template ID
    const templateId = numericIdMap[formId] || formId

    // In a real app, this would be an API call
    const formTemplate = formTemplates[templateId]
    if (formTemplate) {
      setForm(formTemplate)

      // Initialize form data with empty values
      const initialData = {}
      formTemplate.elements.forEach((element) => {
        initialData[`field_${element.id}`] = element.type === "checkbox" ? false : ""
      })
      setFormData(initialData)
    } else {
      // Handle form not found - we'll show a UI for this instead of console error
      console.error("Form not found:", formId)
    }
  }, [formId])

  if (!form) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/forms" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Volver a Formularios</span>
          </Link>
        </header>

        <div className="container max-w-3xl mx-auto py-12 px-4 md:px-6">
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-500">Formulario No Encontrado</CardTitle>
              <CardDescription>El formulario que buscas no existe o puede haber sido eliminado.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-red-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-center mb-6">
                No pudimos encontrar un formulario con el ID: <strong>{formId}</strong>
              </p>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Por favor verifica la URL o regresa a la lista de formularios para seleccionar uno disponible.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/forms">Ver Formularios Disponibles</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  const handleInputChange = (id, value) => {
    setFormData({
      ...formData,
      [`field_${id}`]: value,
    })

    // Clear error when user types
    if (errors[`field_${id}`]) {
      setErrors({
        ...errors,
        [`field_${id}`]: null,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    if (!form) return false

    form.elements.forEach((element) => {
      const value = formData[`field_${element.id}`]

      if (element.required) {
        if (element.type === "checkbox" && !value) {
          newErrors[`field_${element.id}`] = "Este campo es obligatorio"
          isValid = false
        } else if (element.type !== "checkbox" && (!value || value.trim() === "")) {
          newErrors[`field_${element.id}`] = "Este campo es obligatorio"
          isValid = false
        }
      }

      // Email validation
      if (element.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          newErrors[`field_${element.id}`] = "Por favor ingresa una dirección de email válida"
          isValid = false
        }
      }

      // Phone validation
      if (element.type === "phone" && value) {
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
        if (!phoneRegex.test(value)) {
          newErrors[`field_${element.id}`] = "Por favor ingresa un número de teléfono válido"
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setShowConnections(true)

    try {
      // Simulate API call to submit form
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, this would be an API call to save the data
      console.log("Form submitted:", formData)

      // Show success message
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting form:", error)
      // Handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFormElement = (element) => {
    const { id, type, label, placeholder, required, helpText, options, rows } = element
    const value = formData[`field_${id}`] || ""
    const error = errors[`field_${id}`]

    switch (type) {
      case "text":
      case "email":
      case "phone":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={`field_${id}`} className="flex">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`field_${id}`}
              type={type === "email" ? "email" : "text"}
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={`field_${id}`} className="flex">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={`field_${id}`}
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              rows={rows || 3}
              className={error ? "border-red-500" : ""}
            />
            {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "select":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={`field_${id}`} className="flex">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(value) => handleInputChange(id, value)}>
              <SelectTrigger id={`field_${id}`} className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options &&
                  options.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2" key={id}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`field_${id}`}
                checked={value}
                onCheckedChange={(checked) => handleInputChange(id, checked)}
                className={error ? "border-red-500" : ""}
              />
              <Label htmlFor={`field_${id}`} className="flex">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2" key={id}>
            <Label className="flex">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup value={value} onValueChange={(value) => handleInputChange(id, value)} className="space-y-2">
              {options &&
                options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`field_${id}_option_${index}`} />
                    <Label htmlFor={`field_${id}_option_${index}`}>{option}</Label>
                  </div>
                ))}
            </RadioGroup>
            {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <div className="container max-w-3xl mx-auto py-12 px-4 md:px-6">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              </div>
              <CardTitle className="text-2xl">{form.successMessage}</CardTitle>
              <CardDescription>Your submission has been received and will be processed shortly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">What happens next?</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>Your information has been securely stored in our database</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>You'll receive a confirmation email shortly</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>Our team will review your submission and take appropriate action</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">System Processes</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Database Storage</p>
                        <p className="text-xs text-muted-foreground">
                          Data saved to {form.connections.database.name} database
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 ml-auto text-green-500" />
                    </div>

                    <div className="flex items-center">
                      <GitBranch className="h-5 w-5 mr-2 text-amber-500" />
                      <div>
                        <p className="font-medium text-sm">Workflow Triggered</p>
                        <p className="text-xs text-muted-foreground">
                          {form.connections.workflow.name} workflow initiated
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 ml-auto text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  // Reset form
                  setIsSubmitted(false)
                  setShowConnections(false)

                  // Initialize form data with empty values
                  const initialData = {}
                  form.elements.forEach((element) => {
                    initialData[`field_${element.id}`] = element.type === "checkbox" ? false : ""
                  })
                  setFormData(initialData)
                  setErrors({})
                }}
              >
                Submit Another Response
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/forms" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Formularios</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-semibold">{form.companyName}</span>
        </div>
      </header>

      <div className="container max-w-3xl mx-auto py-12 px-4 md:px-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: form.primaryColor }}>
              {form.title}
            </CardTitle>
            <CardDescription>{form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.elements.map((element) => renderFormElement(element))}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                backgroundColor: form.primaryColor,
                borderColor: form.primaryColor,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>

            {showConnections && (
              <div className="w-full rounded-lg border p-4 mt-4 space-y-3">
                <h3 className="text-sm font-medium">Form Connections</h3>

                <div className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Database Connection</p>
                    <p className="text-xs text-muted-foreground">Saving to {form.connections.database.name} database</p>
                  </div>
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 ml-auto animate-spin text-blue-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 ml-auto text-green-500" />
                  )}
                </div>

                <div className="flex items-center">
                  <GitBranch className="h-5 w-5 mr-2 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Workflow Trigger</p>
                    <p className="text-xs text-muted-foreground">
                      Initiating {form.connections.workflow.name} workflow
                    </p>
                  </div>
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 ml-auto animate-spin text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 ml-auto text-green-500" />
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground pt-2">
              Al enviar este formulario, aceptas nuestros{" "}
              <Link href="#" className="underline">
                Términos de Servicio
              </Link>{" "}
              y{" "}
              <Link href="#" className="underline">
                Política de Privacidad
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
