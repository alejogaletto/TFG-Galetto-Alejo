"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditWorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const workflowId = params.id as string

  useEffect(() => {
    // Redirect to create page with just the workflow ID
    // The create page will fetch the workflow data from the API
    router.push(`/dashboard/workflows/create?edit=true&id=${workflowId}`)
  }, [workflowId, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">Cargando editor...</div>
    </div>
  )
}
