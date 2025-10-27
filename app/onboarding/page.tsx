"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }

      // Check if user already has company name
      const companyNameFromMeta = user.user_metadata?.company_name
      if (companyNameFromMeta) {
        // User already completed onboarding
        router.push("/dashboard")
        return
      }

      setCheckingAuth(false)
    }

    checkUserProfile()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No user found")
      }

      // Update user metadata with company name
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          company_name: companyName,
        },
      })

      if (updateError) throw updateError

      // Create profile in User table
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0],
          configs: { companyName },
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.error("Profile creation error:", error)
        // Don't throw - profile creation is not critical
      }

      toast({
        title: "¡Perfil completado!",
        description: "Tu cuenta está lista para usar.",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Onboarding error:", error)
      toast({
        title: "Error",
        description: error?.message || "No se pudo completar el perfil. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Completa tu perfil</CardTitle>
          <CardDescription>
            Solo necesitamos un poco más de información para configurar tu cuenta.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de empresa</Label>
              <Input
                id="companyName"
                placeholder="Mi Empresa S.A."
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Este nombre se usará en tus formularios y comunicaciones.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Continuar"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}

