"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditWorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const workflowId = params.id as string
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        // Load workflow from database
        const workflowResponse = await fetch(`/api/workflows/${workflowId}?includeSteps=true`)
        
        if (!workflowResponse.ok) {
          router.push("/dashboard/workflows")
          return
        }
        
        const workflow = await workflowResponse.json()
        
        // Convert database format to UI format
        const steps = workflow.steps || []
        const configs = workflow.configs || {}
        
        const workflowData = {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          isActive: workflow.is_active,
          steps: steps.map((step: any) => ({
            id: step.id,
            type: step.type,
            actionType: step.type,
            name: step.type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            description: '',
            config: step.configs || {},
            position: { x: 50, y: 50 }
          })),
          connections: configs.connections || [],
          createdAt: workflow.creation_date,
          updatedAt: workflow.creation_date
        }
        
        const workflowDataEncoded = encodeURIComponent(JSON.stringify(workflowData))
        router.push(`/dashboard/workflows/create?edit=true&workflow=${workflowDataEncoded}`)
      } catch (error) {
        console.error('Error loading workflow:', error)
        router.push("/dashboard/workflows")
      } finally {
        setLoading(false)
      }
    }
    
    loadWorkflow()
  }, [workflowId, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">
        {loading ? "Cargando workflow..." : "Redirigiendo al editor..."}
      </div>
    </div>
  )
}
