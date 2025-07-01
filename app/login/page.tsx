"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validaciones básicas
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos",
          variant: "destructive",
        })
        return
      }

      if (!email.includes("@")) {
        toast({
          title: "Error",
          description: "Por favor ingresa un email válido",
          variant: "destructive",
        })
        return
      }

      // Simulación de login (reemplazar con Supabase cuando esté configurado)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Credenciales de demo para testing
      const validCredentials = [
        { email: "admin@ejemplo.com", password: "admin123" },
        { email: "usuario@ejemplo.com", password: "usuario123" },
        { email: email, password: password }, // Acepta cualquier credencial por ahora
      ]

      const isValidUser =
        validCredentials.some((cred) => cred.email === email && cred.password === password) || password.length >= 6 // Acepta cualquier password de 6+ caracteres

      if (isValidUser) {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        })

        // Simular almacenamiento de sesión
        localStorage.setItem(
          "user",
          JSON.stringify({
            email,
            name: email.split("@")[0],
            id: Math.random().toString(36).substr(2, 9),
          }),
        )

        router.push("/dashboard")
      } else {
        toast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Google Login",
        description: "Funcionalidad próximamente disponible",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Apple Login",
        description: "Funcionalidad próximamente disponible",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl">AutomateSMB</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/#about">
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Ingrese sus credenciales para acceder a su cuenta</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link className="text-sm underline" href="/reset-password">
                  Recuperar contraseña
                </Link>
              </div>
              <Input
                id="password"
                placeholder="Ingresa tu contraseña"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          <Separator />
          <div className="space-y-4">
            <Button className="w-full" variant="outline" onClick={handleGoogleLogin} disabled={isLoading} type="button">
              Continuar con Google
            </Button>
            <Button className="w-full" variant="outline" onClick={handleAppleLogin} disabled={isLoading} type="button">
              Continuar con Apple
            </Button>
            <div className="text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link className="underline" href="/signup">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
