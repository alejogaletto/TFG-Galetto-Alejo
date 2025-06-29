"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Key, Globe, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { IntegrationsEngine, type IntegrationTemplate } from "@/lib/integrations-engine"

export default function ConnectIntegrationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [template, setTemplate] = useState<IntegrationTemplate | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [config, setConfig] = useState<Record<string, any>>({})
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const integrationsEngine = IntegrationsEngine.getInstance()
  const templateId = params.templateId as string

  useEffect(() => {
    const templates = integrationsEngine.getIntegrationTemplates()
    const foundTemplate = templates.find((t) => t.id === templateId)

    if (foundTemplate) {
      setTemplate(foundTemplate)
    } else {
      toast({
        title: "Error",
        description: "Servicio no encontrado",
        variant: "destructive",
      })
      router.push("/dashboard/workflows")
    }

    setIsLoading(false)
  }, [templateId, router, toast])

  const handleNext = () => {
    if (currentStep < (template?.setupSteps.length || 0) - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleConnect()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConnect = async () => {
    if (!template) return

    setIsConnecting(true)
    try {
      // Simular proceso de conexión
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const integration = integrationsEngine.connectIntegration(template.id, config)

      toast({
        title: "¡Integración conectada!",
        description: `${template.name} se ha conectado exitosamente`,
      })

      router.push("/dashboard/workflows")
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const renderStepContent = () => {
    if (!template) return null

    switch (template.authType) {
      case "oauth":
        return renderOAuthStep()
      case "api_key":
        return renderApiKeyStep()
      case "webhook":
        return renderWebhookStep()
      default:
        return null
    }
  }

  const renderOAuthStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Autorización OAuth</h3>
            <p className="text-muted-foreground">Serás redirigido a {template?.name} para autorizar el acceso</p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Permisos solicitados:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Acceso de lectura a tu perfil</li>
              <li>• Capacidad de enviar datos en tu nombre</li>
              <li>• Acceso a las funciones específicas del servicio</li>
            </ul>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-medium">¡Autorización exitosa!</h3>
          <p className="text-muted-foreground">La conexión con {template?.name} se ha establecido correctamente</p>
        </div>
      </div>
    )
  }

  const renderApiKeyStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Configuración de API Key</h3>
            <p className="text-muted-foreground">Ingresa tu API key de {template?.name}</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Ingresa tu API key"
                value={config.api_key || ""}
                onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Puedes encontrar tu API key en la configuración de tu cuenta de {template?.name}
              </p>
            </div>

            {template?.id === "mailchimp" && (
              <div>
                <Label htmlFor="server_prefix">Prefijo del servidor</Label>
                <Input
                  id="server_prefix"
                  placeholder="us1, us2, etc."
                  value={config.server_prefix || ""}
                  onChange={(e) => setConfig({ ...config, server_prefix: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ejemplo: si tu URL de Mailchimp es https://us1.admin.mailchimp.com, tu prefijo es "us1"
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-medium">¡API Key configurada!</h3>
          <p className="text-muted-foreground">La conexión con {template?.name} está lista para usar</p>
        </div>
      </div>
    )
  }

  const renderWebhookStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Configuración de Webhook</h3>
            <p className="text-muted-foreground">Configura el webhook para recibir datos</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook_url">URL del Webhook</Label>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://tu-servicio.com/webhook"
                value={config.webhook_url || ""}
                onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="secret">Secreto (opcional)</Label>
              <Input
                id="secret"
                type="password"
                placeholder="Secreto para validar el webhook"
                value={config.secret || ""}
                onChange={(e) => setConfig({ ...config, secret: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="events">Eventos a escuchar</Label>
              <Textarea
                id="events"
                placeholder="user.created, order.completed, etc."
                value={config.events || ""}
                onChange={(e) => setConfig({ ...config, events: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-medium">¡Webhook configurado!</h3>
          <p className="text-muted-foreground">El webhook está listo para recibir eventos</p>
        </div>
      </div>
    )
  }

  const isStepValid = () => {
    if (!template) return false

    switch (template.authType) {
      case "oauth":
        return true // OAuth siempre es válido para avanzar
      case "api_key":
        return config.api_key && config.api_key.length > 0
      case "webhook":
        return config.webhook_url && config.webhook_url.length > 0
      default:
        return false
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
        </main>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/dashboard/workflows" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Volver a Workflows</span>
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Servicio no encontrado</h2>
            <p className="text-muted-foreground mb-4">El servicio que buscas no existe.</p>
            <Button asChild>
              <Link href="/dashboard/workflows">Volver a Workflows</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/workflows" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Volver a Workflows</span>
        </Link>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-2xl">{template.icon}</span>
          <h1 className="font-semibold">Conectar {template.name}</h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-6">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Configurar Integración</h2>
                <p className="text-muted-foreground">{template.description}</p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-8">
              {template.setupSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < template.setupSteps.length - 1 && (
                    <div className={`mx-2 h-1 w-16 ${index < currentStep ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{template.setupSteps[currentStep]}</CardTitle>
              <CardDescription>
                Paso {currentStep + 1} de {template.setupSteps.length}
              </CardDescription>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>

            <Button onClick={handleNext} disabled={!isStepValid() || isConnecting}>
              {isConnecting
                ? "Conectando..."
                : currentStep === template.setupSteps.length - 1
                  ? "Conectar Integración"
                  : "Siguiente"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
