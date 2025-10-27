"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase-client"
import { validatePassword, getPasswordRequirements } from "@/lib/password"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Check, X } from "lucide-react"

export default function UpdatePassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isValidToken, setIsValidToken] = useState(true)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const passwordReqs = getPasswordRequirements(password)
  const showPasswordHints = passwordFocused || password.length > 0

  useEffect(() => {
    // Verificar que el usuario llegó aquí con un token válido
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setIsValidToken(false)
        setMessage({
          type: "error",
          text: "El enlace de recuperación no es válido o ha expirado. Por favor solicita uno nuevo.",
        })
      }
    }

    checkSession()
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Las contraseñas no coinciden.",
      })
      return
    }

    // Validar política de contraseñas
    const validation = validatePassword(password)
    if (!validation.isValid) {
      setMessage({
        type: "error",
        text: validation.errors[0],
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      setMessage({
        type: "success",
        text: "Tu contraseña ha sido actualizada correctamente.",
      })

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Ha ocurrido un error al actualizar la contraseña.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Enlace inválido</CardTitle>
            <CardDescription>El enlace de recuperación no es válido o ha expirado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Por favor solicita un nuevo enlace de recuperación.</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/reset-password")}>
              Solicitar nuevo enlace
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Establecer nueva contraseña</CardTitle>
          <CardDescription>Ingresa tu nueva contraseña para completar el proceso de recuperación.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdatePassword}>
          <CardContent className="space-y-4">
            {message && (
              <Alert
                className={
                  message.type === "error"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }
              >
                {message.type === "error" && <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                minLength={8}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
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
