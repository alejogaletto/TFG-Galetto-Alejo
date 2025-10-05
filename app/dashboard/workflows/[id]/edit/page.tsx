"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { WorkflowEngine } from "@/lib/workflow-engine"

export default function EditWorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const workflowId = params.id as string

  useEffect(() => {
    const workflowEngine = WorkflowEngine.getInstance()
    workflowEngine.loadWorkflows()
    const workflow = workflowEngine.getWorkflow(workflowId)
    
    if (workflow) {
      // Redirect to creation page with edit mode and workflow data
      const workflowData = encodeURIComponent(JSON.stringify({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        isActive: workflow.isActive,
        steps: workflow.steps,
        connections: workflow.connections,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
      }))
      
      router.push(`/dashboard/workflows/create?edit=true&workflow=${workflowData}`)
    } else {
      // Workflow not found, redirect to workflows list
      router.push("/dashboard/workflows")
    }
  }, [workflowId, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">Redirigiendo al editor...</div>
    </div>
  )
}
