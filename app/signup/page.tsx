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

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate signup process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For demo purposes, simulate successful signup
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Algo salió mal. Por favor intenta de nuevo.",
        variant: "destructive",
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
            <h1 className="text-3xl font-bold">Crear cuenta</h1>
            <p className="text-muted-foreground">Ingresa tu información para crear cuenta</p>
          </div>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de empresa</Label>
              <Input
                id="companyName"
                placeholder="Mi Empresa S.A."
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
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
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 8 caracteres</p>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </form>
          <Separator />
          <div className="space-y-4">
            <Button className="w-full" variant="outline" disabled={isLoading}>
              Continuar con Google
            </Button>
            <Button className="w-full" variant="outline" disabled={isLoading}>
              Continuar con Apple
            </Button>
            <div className="text-center text-sm">
              ¿Ya tiene unas cuenta?{" "}
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
