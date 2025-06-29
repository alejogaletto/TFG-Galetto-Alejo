"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Key, Shield, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfile {
  id: string
  name: string
  email: string
  company_name: string
  creation_date: string
  configs: any
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      // Verificar si hay usuario logueado en localStorage
      const userData = localStorage.getItem("user")

      if (!userData) {
        router.push("/login")
        return
      }

      const user = JSON.parse(userData)

      // Cargar datos del perfil desde localStorage o crear perfil por defecto
      const savedProfile = localStorage.getItem("userProfile")
      let userProfile: UserProfile

      if (savedProfile) {
        userProfile = JSON.parse(savedProfile)
      } else {
        // Crear perfil por defecto basado en datos de login
        userProfile = {
          id: user.id,
          name: user.name || user.email.split("@")[0] || "Usuario",
          email: user.email,
          company_name: "",
          creation_date: new Date().toISOString(),
          configs: {
            notifications: {
              email: true,
              push: false,
              marketing: false,
            },
          },
        }
        // Guardar perfil por defecto
        localStorage.setItem("userProfile", JSON.stringify(userProfile))
      }

      setProfile(userProfile)
      setName(userProfile.name)
      setCompanyName(userProfile.company_name || "")

      // Cargar preferencias de notificaciones
      if (userProfile.configs?.notifications) {
        setNotifications(userProfile.configs.notifications)
      }
    } catch (error: any) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      })
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    setSaving(true)
    try {
      if (!profile) return

      const updatedProfile = {
        ...profile,
        name,
        company_name: companyName,
        configs: {
          ...profile.configs,
          notifications,
        },
      }

      // Guardar en localStorage
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile))

      // Actualizar también los datos básicos del usuario
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        user.name = name
        localStorage.setItem("user", JSON.stringify(user))
      }

      setProfile(updatedProfile)

      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido guardados correctamente",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      // Simular actualización de contraseña
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const signOut = async () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem("user")
      localStorage.removeItem("userProfile")

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })

      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-lg font-semibold mb-2">Error de Perfil</h2>
            <p className="text-muted-foreground mb-4">No se pudo cargar la información del perfil</p>
            <Button onClick={() => router.push("/dashboard")}>Volver al Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Volver
        </Button>
        <h1 className="font-semibold text-lg">Mi Perfil</h1>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} />
                  <AvatarFallback>
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Miembro desde {new Date(profile.creation_date).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
              <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
              <TabsTrigger value="account">Cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>Actualiza tu información personal y de empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input id="email" value={profile.email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">El correo no se puede cambiar por seguridad</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Nombre de empresa</Label>
                    <Input
                      id="company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                  <Button onClick={updateProfile} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Cambiar Contraseña
                  </CardTitle>
                  <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña actual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Tu contraseña actual"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña (mín. 8 caracteres)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>
                  <Button onClick={updatePassword} disabled={saving || !newPassword || !confirmPassword}>
                    {saving ? "Actualizando..." : "Cambiar contraseña"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Preferencias de Notificaciones
                  </CardTitle>
                  <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones por email</Label>
                      <p className="text-sm text-muted-foreground">Recibe actualizaciones importantes por correo</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones push</Label>
                      <p className="text-sm text-muted-foreground">Recibe notificaciones en tiempo real</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Emails de marketing</Label>
                      <p className="text-sm text-muted-foreground">Recibe noticias y ofertas especiales</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketing: checked }))}
                    />
                  </div>
                  <Button onClick={updateProfile} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar preferencias"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Configuración de Cuenta
                  </CardTitle>
                  <CardDescription>Gestiona tu cuenta y configuraciones de seguridad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID de Usuario</Label>
                    <Input value={profile.id} disabled className="bg-muted font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de registro</Label>
                    <Input
                      value={new Date(profile.creation_date).toLocaleString("es-ES")}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium text-destructive">Zona de Peligro</h4>
                    <p className="text-sm text-muted-foreground">
                      Estas acciones son permanentes y no se pueden deshacer.
                    </p>
                    <Button variant="destructive" onClick={signOut}>
                      Cerrar Sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
