"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase-client"

export default function AuthSuccessPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          console.error("Error getting user:", error)
          router.push("/login")
          return
        }

        // Check if user has company name
        const hasCompanyName = user.user_metadata?.company_name

        if (!hasCompanyName) {
          // New OAuth user needs to complete profile
          router.push("/onboarding")
          return
        }

        // Check if profile exists in User table, create if not
        try {
          const { data: profile } = await supabase
            .from("User")
            .select("id")
            .eq("id", user.id)
            .single()

          if (!profile) {
            // Create profile in User table
            await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0],
                configs: { companyName: user.user_metadata?.company_name },
              }),
            })
          }
        } catch (profileError) {
          console.error("Profile check/creation error:", profileError)
          // Don't block redirect if profile creation fails
        }

        // User is fully set up, go to dashboard
        router.push("/dashboard")
        router.refresh()
      } catch (err) {
        console.error("Auth success check error:", err)
        router.push("/login")
      }
    }

    checkUserAndRedirect()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completando tu sesión...</p>
      </div>
    </div>
  )
}

