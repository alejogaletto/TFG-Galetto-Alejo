"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase-client"
import { validatePassword, getPasswordRequirements } from "@/lib/password"
import { Check, X } from "lucide-react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const passwordReqs = getPasswordRequirements(password)
  const showPasswordHints = passwordFocused || password.length > 0

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate password
      const validation = validatePassword(password)
      if (!validation.isValid) {
        toast({
          title: "Contraseña inválida",
          description: validation.errors[0],
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company_name: companyName,
          },
        },
      })

      if (error) {
        throw error
      }

      // Create user profile in custom User table (if needed for backward compatibility)
      if (data.user) {
        try {
          await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              email,
              name,
              configs: { companyName },
            }),
          })
        } catch (profileError) {
          console.error("Failed to create user profile:", profileError)
          // Don't block registration if profile creation fails
        }
      }

      toast({
        title: "¡Cuenta creada!",
        description: "Has iniciado sesión correctamente.",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Signup error:", error)
      toast({
        title: "Error",
        description: error?.message || "No se pudo crear la cuenta. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo conectar con Google",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleAppleSignup = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo conectar con Apple",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl">AutomatePyme</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/#features">
            Características
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/#pricing">
            Precios
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/#about">
            Acerca de
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Crear cuenta</h1>
            <p className="text-muted-foreground">Ingresa tu información para crear cuenta</p>
          </div>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de empresa</Label>
              <Input
                id="companyName"
                placeholder="Mi Empresa S.A."
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                placeholder="m@ejemplo.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                disabled={isLoading}
              />
              {showPasswordHints && (
                <div className="space-y-1 pt-2">
                  <p className="text-xs font-medium text-muted-foreground">Requisitos de contraseña:</p>
                  <div className="space-y-1">
                    <PasswordRequirement met={passwordReqs.minLength} text="Mínimo 8 caracteres" />
                    <PasswordRequirement met={passwordReqs.hasUppercase} text="Una letra mayúscula" />
                    <PasswordRequirement met={passwordReqs.hasNumber} text="Un número" />
                    <PasswordRequirement met={passwordReqs.hasSymbol} text="Un símbolo especial" />
                  </div>
                </div>
              )}
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </form>
          <Separator />
          <div className="space-y-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              type="button"
            >
              Continuar con Google
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleAppleSignup}
              disabled={isLoading}
              type="button"
            >
              Continuar con Apple
            </Button>
            <div className="text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link className="underline" href="/login">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={met ? "text-green-600" : "text-muted-foreground"}>{text}</span>
    </div>
  )
}
