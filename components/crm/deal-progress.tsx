"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, DollarSign, TrendingUp, Calendar, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Deal {
  id: number
  data_json: {
    name: string
    value: number
    stage: string
    probability?: number
    contact_name?: string
    expected_close_date?: string
    assigned_to?: string
    notes?: string
  }
}

interface DealProgressProps {
  dealId?: number
  tableId?: string
  config?: {
    title?: string
    showDetails?: boolean
    allowStageUpdate?: boolean
    showValue?: boolean
    showProbability?: boolean
  }
}

const STAGES = [
  { value: "lead", label: "Lead", progress: 10, color: "bg-blue-500" },
  { value: "qualified", label: "Qualified", progress: 30, color: "bg-purple-500" },
  { value: "proposal", label: "Proposal", progress: 50, color: "bg-yellow-500" },
  { value: "negotiation", label: "Negotiation", progress: 70, color: "bg-orange-500" },
  { value: "closed_won", label: "Closed Won", progress: 100, color: "bg-green-500" },
  { value: "closed_lost", label: "Closed Lost", progress: 0, color: "bg-red-500" },
]

export function DealProgress({ dealId, tableId, config = {} }: DealProgressProps) {
  const [deal, setDeal] = useState<Deal | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [selectedDealId, setSelectedDealId] = useState<number | undefined>(dealId)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (dealId) {
      fetchDeal(dealId)
    } else if (tableId) {
      fetchDeals()
    }
  }, [dealId, tableId])

  useEffect(() => {
    if (selectedDealId && deals.length > 0) {
      const selected = deals.find((d) => d.id === selectedDealId)
      if (selected) {
        setDeal(selected)
      }
    }
  }, [selectedDealId, deals])

  const fetchDeal = async (id: number) => {
    try {
      const response = await fetch(`/api/business-data/${id}`)
      if (response.ok) {
        const data = await response.json()
        setDeal(data)
      }
    } catch (error) {
      console.error("Error fetching deal:", error)
      toast({
        title: "Error",
        description: "Failed to load deal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDeals = async () => {
    if (!tableId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/business-data?virtual_table_schema_id=${tableId}`)
      if (response.ok) {
        const data = await response.json()
        setDeals(data)
        if (data.length > 0 && !selectedDealId) {
          setSelectedDealId(data[0].id)
          setDeal(data[0])
        }
      }
    } catch (error) {
      console.error("Error fetching deals:", error)
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStageUpdate = async (newStage: string) => {
    if (!deal || !config.allowStageUpdate) return

    setUpdating(true)
    try {
      const updatedData = {
        ...deal.data_json,
        stage: newStage,
      }

      const response = await fetch(`/api/business-data/${deal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data_json: updatedData }),
      })

      if (response.ok) {
        setDeal({ ...deal, data_json: updatedData })
        toast({
          title: "Success",
          description: "Deal stage updated successfully",
        })
        if (tableId) {
          fetchDeals() // Refresh the list
        }
      }
    } catch (error) {
      console.error("Error updating deal stage:", error)
      toast({
        title: "Error",
        description: "Failed to update deal stage",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!deal) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-center text-muted-foreground">
          No deal selected
        </CardContent>
      </Card>
    )
  }

  const currentStage = STAGES.find((s) => s.value === deal.data_json.stage) || STAGES[0]
  const progressValue = currentStage.progress

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{config.title || "Deal Progress"}</CardTitle>
          {deals.length > 1 && (
            <Select
              value={selectedDealId?.toString()}
              onValueChange={(v) => setSelectedDealId(parseInt(v))}
            >
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deals.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.data_json.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deal Title */}
        <div>
          <h3 className="text-xl font-semibold mb-1">{deal.data_json.name}</h3>
          {deal.data_json.contact_name && (
            <p className="text-sm text-muted-foreground">
              Contact: {deal.data_json.contact_name}
            </p>
          )}
        </div>

        {/* Stage Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Stage</span>
            {config.allowStageUpdate !== false ? (
              <Select
                value={deal.data_json.stage}
                onValueChange={handleStageUpdate}
                disabled={updating}
              >
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge className={currentStage.color}>{currentStage.label}</Badge>
            )}
          </div>
          <Progress value={progressValue} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>
        </div>

        {/* Deal Details */}
        {config.showDetails !== false && (
          <div className="grid grid-cols-2 gap-4">
            {config.showValue !== false && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Deal Value
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(deal.data_json.value || 0)}
                </div>
              </div>
            )}

            {config.showProbability !== false && deal.data_json.probability !== undefined && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Win Probability
                </div>
                <div className="text-lg font-semibold">{deal.data_json.probability}%</div>
              </div>
            )}

            {deal.data_json.expected_close_date && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expected Close
                </div>
                <div className="text-sm font-medium">
                  {new Date(deal.data_json.expected_close_date).toLocaleDateString()}
                </div>
              </div>
            )}

            {deal.data_json.assigned_to && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Assigned To
                </div>
                <div className="text-sm font-medium">{deal.data_json.assigned_to}</div>
              </div>
            )}
          </div>
        )}

        {/* Expected Value (Value × Probability) */}
        {config.showValue !== false &&
          config.showProbability !== false &&
          deal.data_json.probability !== undefined && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expected Value</span>
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency((deal.data_json.value || 0) * ((deal.data_json.probability || 0) / 100))}
                </span>
              </div>
            </div>
          )}

        {/* Notes */}
        {deal.data_json.notes && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Notes</div>
            <div className="text-sm bg-muted p-3 rounded-md">{deal.data_json.notes}</div>
          </div>
        )}

        {/* Stage Indicators */}
        <div className="flex justify-between items-center gap-1 pt-2">
          {STAGES.filter((s) => s.value !== "closed_lost").map((stage, index) => {
            const isActive = stage.value === deal.data_json.stage
            const isPassed =
              STAGES.findIndex((s) => s.value === deal.data_json.stage) >
              STAGES.findIndex((s) => s.value === stage.value)

            return (
              <div key={stage.value} className="flex-1 text-center">
                <div
                  className={`h-1.5 rounded-full ${
                    isActive || isPassed ? stage.color : "bg-muted"
                  }`}
                />
                <div
                  className={`text-xs mt-1 ${
                    isActive ? "font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

