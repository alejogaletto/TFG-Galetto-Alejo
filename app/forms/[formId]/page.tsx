"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Database, GitBranch, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function FormView({ params }: { params: Promise<{ formId: string }> }) {
  const [formId, setFormId] = useState<string | null>(null)
  const [form, setForm] = useState<any | null>(null)
  const [fields, setFields] = useState<any[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConnections, setShowConnections] = useState(false)

  // Unwrap params Promise
  useEffect(() => {
    params.then((p) => setFormId(p.formId))
  }, [params])

  useEffect(() => {
    if (!formId) return
    
    const load = async () => {
      setIsLoading(true)
      try {
        const [formRes, fieldsRes] = await Promise.all([
          fetch(`/api/forms/${formId}`),
          fetch(`/api/form-fields?form_id=${formId}`),
        ])

        if (formRes.ok) {
          const f = await formRes.json()
          setForm(f)
        } else {
          setForm(null)
        }

        if (fieldsRes.ok) {
          const ff = await fieldsRes.json()
          setFields(ff || [])

          const initial: Record<string, any> = {}
          ;(ff || []).forEach((fld: any) => {
            // Boolean fields (checkbox, switch) should initialize to false
            initial[`field_${fld.id}`] = (fld.type === "checkbox" || fld.type === "switch") ? false : fld.configs?.default ?? ""
          })
          setFormData(initial)
        } else {
          setFields([])
          setFormData({})
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [formId])

  const handleInputChange = (fieldId: number, value: any) => {
    setFormData((prev) => ({ ...prev, [`field_${fieldId}`]: value }))
    if (errors[`field_${fieldId}`]) {
      setErrors((prev) => ({ ...prev, [`field_${fieldId}`]: null }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    for (const fld of fields) {
      const value = formData[`field_${fld.id}`]
      const cfg = fld.configs || {}

      if (cfg.required) {
        // Boolean fields (checkbox, switch) need special validation
        if (fld.type === "checkbox" || fld.type === "switch") {
          if (!value) {
            newErrors[`field_${fld.id}`] = "Este campo es obligatorio"
            isValid = false
          }
        } else if (value === undefined || value === null || String(value).trim() === "") {
          newErrors[`field_${fld.id}`] = "Este campo es obligatorio"
          isValid = false
        }
      }

      if (fld.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(value))) {
          newErrors[`field_${fld.id}`] = "Por favor ingresa un email válido"
          isValid = false
        }
      }

      if (fld.type === "phone" && value) {
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
        if (!phoneRegex.test(String(value))) {
          newErrors[`field_${fld.id}`] = "Por favor ingresa un teléfono válido"
          isValid = false
        }
      }

      if (cfg.pattern && value) {
        try {
          const rx = new RegExp(cfg.pattern)
          if (!rx.test(String(value))) {
            newErrors[`field_${fld.id}`] = cfg.patternMessage || "Formato inválido"
            isValid = false
          }
        } catch {}
      }

      if (cfg.minLength && value && String(value).length < cfg.minLength) {
        newErrors[`field_${fld.id}`] = `Debe tener al menos ${cfg.minLength} caracteres`
        isValid = false
      }
      if (cfg.maxLength && value && String(value).length > cfg.maxLength) {
        newErrors[`field_${fld.id}`] = `Debe tener como máximo ${cfg.maxLength} caracteres`
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    setShowConnections(true)
    try {
      // Build payload expected by API: keys are raw form_field ids
      const payload: Record<string, any> = {}
      fields.forEach((fld) => {
        payload[fld.id] = formData[`field_${fld.id}`]
      })

      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_id: Number(formId), form_data: payload }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'No se pudo enviar el formulario')
      }

      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (fld: any) => {
    const id = fld.id
    const cfg = fld.configs || {}
    const value = formData[`field_${id}`] ?? (fld.type === "checkbox" ? false : "")
    const error = errors[`field_${id}`]
    const label = fld.label

    // Normalize type to handle different capitalizations and synonyms from builder
    const rawType = String(fld.type || "").toLowerCase()
    const typeMap: Record<string, string> = {
      texto: "text",
      text: "text",
      input: "text",
      email: "email",
      correo: "email",
      phone: "phone",
      telefono: "phone",
      "teléfono": "phone",
      textarea: "textarea",
      area: "textarea",
      select: "select",
      dropdown: "select",
      checkbox: "checkbox",
      "casilla de verificación": "checkbox",
      radio: "radio",
      "botón de radio": "radio",
    }
    const normalizedType = typeMap[rawType] || rawType

    switch (normalizedType) {
      case "text":
      case "email":
      case "phone":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={`field_${id}`} className="flex">
              {label}
              {cfg.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`field_${id}`}
              type={fld.type === "email" ? "email" : "text"}
              placeholder={cfg.placeholder}
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {cfg.helpText && <p className="text-sm text-muted-foreground">{cfg.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={`field_${id}`} className="flex">
              {label}
              {cfg.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={`field_${id}`}
              placeholder={cfg.placeholder}
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              rows={cfg.rows || 3}
              className={error ? "border-red-500" : ""}
            />
            {cfg.helpText && <p className="text-sm text-muted-foreground">{cfg.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "select":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={`field_${id}`} className="flex">
              {label}
              {cfg.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(id, val)}>
              <SelectTrigger id={`field_${id}`} className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={cfg.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {(cfg.options || []).map((opt: string, idx: number) => (
                  <SelectItem key={idx} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cfg.helpText && <p className="text-sm text-muted-foreground">{cfg.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2" key={id}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`field_${id}`}
                checked={!!value}
                onCheckedChange={(checked) => handleInputChange(id, checked)}
                className={error ? "border-red-500" : ""}
              />
              <Label htmlFor={`field_${id}`} className="flex">
                {label}
                {cfg.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {cfg.helpText && <p className="text-sm text-muted-foreground">{cfg.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2" key={id}>
            <Label className="flex">
              {label}
              {cfg.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup value={value} onValueChange={(val) => handleInputChange(id, val)} className="space-y-2">
              {(cfg.options || []).map((opt: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`field_${id}_option_${idx}`} />
                  <Label htmlFor={`field_${id}_option_${idx}`}>{opt}</Label>
                </div>
              ))}
            </RadioGroup>
            {cfg.helpText && <p className="text-sm text-muted-foreground">{cfg.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "date":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={`field_${id}`} className="flex">
              {label}
              {cfg.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`field_${id}`}
              type="date"
              placeholder={cfg.placeholder}
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {cfg.helpText && <p className="text-sm text-muted-foreground">{cfg.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "switch":
        return (
          <div className="space-y-2" key={id}>
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
              <div className="flex items-center gap-3">
                <Switch
                  id={`field_${id}`}
                  checked={!!value}
                  onCheckedChange={(checked) => handleInputChange(id, checked)}
                  className={error ? "border-red-500" : ""}
                />
                <div className="flex flex-col">
                  <Label htmlFor={`field_${id}`} className="flex">
                    {label}
                    {cfg.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {cfg.placeholder || "No / Si"}
                  </span>
                </div>
              </div>
            </div>
            {cfg.helpText && <p className="text-sm text-muted-foreground mt-2">{cfg.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "number":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={`field_${id}`} className="flex">
              {label}
              {cfg.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`field_${id}`}
              type="number"
              placeholder={cfg.placeholder}
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {cfg.helpText && <p className="text-sm text-muted-foreground">{cfg.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "name":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={`field_${id}`} className="flex">
              {label}
              {cfg.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`field_${id}`}
              type="text"
              placeholder={cfg.placeholder}
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {cfg.helpText && <p className="text-sm text-muted-foreground">{cfg.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

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
          </Card>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    const successMessage = form?.configs?.successMessage || "¡Gracias! Tu respuesta fue enviada."
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <div className="container max-w-3xl mx-auto py-12 px-4 md:px-6">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              </div>
              <CardTitle className="text-2xl">{successMessage}</CardTitle>
              <CardDescription>Your submission has been received and will be processed shortly.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false)
                  setShowConnections(false)
                  const initial: Record<string, any> = {}
                  fields.forEach((fld) => {
                    // Boolean fields (checkbox, switch) should initialize to false
                    initial[`field_${fld.id}`] = (fld.type === "checkbox" || fld.type === "switch") ? false : fld.configs?.default ?? ""
                  })
                  setFormData(initial)
                  setErrors({})
                }}
              >
                Enviar otra respuesta
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  const primaryColor = form?.configs?.primaryColor || "#4f46e5"
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
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: primaryColor }}>
              {form.name}
            </CardTitle>
            <CardDescription>{form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {fields.map((fld) => renderField(fld))}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
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
                    <p className="text-xs text-muted-foreground">Saving to database</p>
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
                    <p className="text-xs text-muted-foreground">Initiating connected workflow</p>
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
              Al enviar este formulario, aceptas nuestros {" "}
              <Link href="#" className="underline">
                Términos de Servicio
              </Link>{" "}
              y {" "}
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
