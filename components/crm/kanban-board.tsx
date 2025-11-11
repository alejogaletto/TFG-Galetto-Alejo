"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, DollarSign, Calendar, User, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface KanbanColumn {
  id: string
  title: string
  stage: string
  color: string
}

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

interface KanbanBoardProps {
  tableId: string
  config?: {
    title?: string
    columns?: KanbanColumn[]
    allowCreate?: boolean
    allowEdit?: boolean
    showValue?: boolean
    showProbability?: boolean
  }
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "lead", title: "Lead", stage: "lead", color: "bg-blue-500" },
  { id: "qualified", title: "Qualified", stage: "qualified", color: "bg-purple-500" },
  { id: "proposal", title: "Proposal", stage: "proposal", color: "bg-yellow-500" },
  { id: "negotiation", title: "Negotiation", stage: "negotiation", color: "bg-orange-500" },
  { id: "closed_won", title: "Closed Won", stage: "closed_won", color: "bg-green-500" },
  { id: "closed_lost", title: "Closed Lost", stage: "closed_lost", color: "bg-red-500" },
]

export function KanbanBoard({ tableId, config = {} }: KanbanBoardProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [newDeal, setNewDeal] = useState({
    name: "",
    value: "",
    contact_name: "",
    probability: "50",
    expected_close_date: "",
    assigned_to: "",
    notes: "",
  })

  const columns = config.columns || DEFAULT_COLUMNS

  useEffect(() => {
    fetchDeals()
  }, [tableId])

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

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId) return

    const dealId = parseInt(draggableId.replace("deal-", ""))
    const newStage = destination.droppableId

    try {
      const deal = deals.find((d) => d.id === dealId)
      if (!deal) return

      const updatedData = {
        ...deal.data_json,
        stage: newStage,
      }

      const response = await fetch(`/api/business-data/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data_json: updatedData }),
      })

      if (response.ok) {
        setDeals((prev) =>
          prev.map((d) =>
            d.id === dealId ? { ...d, data_json: updatedData } : d
          )
        )
        toast({
          title: "Success",
          description: "Deal moved successfully",
        })
      }
    } catch (error) {
      console.error("Error updating deal:", error)
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      })
    }
  }

  const handleAddDeal = async () => {
    if (!newDeal.name || !newDeal.value) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/business-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          virtual_table_schema_id: tableId,
          data_json: {
            name: newDeal.name,
            value: parseFloat(newDeal.value),
            stage: selectedColumn || "lead",
            probability: parseInt(newDeal.probability),
            contact_name: newDeal.contact_name,
            expected_close_date: newDeal.expected_close_date,
            assigned_to: newDeal.assigned_to,
            notes: newDeal.notes,
            created_date: new Date().toISOString(),
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Deal created successfully",
        })
        fetchDeals()
        setShowAddDialog(false)
        setNewDeal({
          name: "",
          value: "",
          contact_name: "",
          probability: "50",
          expected_close_date: "",
          assigned_to: "",
          notes: "",
        })
      }
    } catch (error) {
      console.error("Error creating deal:", error)
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive",
      })
    }
  }

  const getDealsByStage = (stage: string) => {
    return deals.filter((deal) => deal.data_json.stage === stage)
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

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">{config.title || "Deal Pipeline"}</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-6 gap-4 min-h-[500px]">
              {columns.map((column) => {
                const columnDeals = getDealsByStage(column.stage)
                const totalValue = columnDeals.reduce(
                  (sum, deal) => sum + (deal.data_json.value || 0),
                  0
                )

                return (
                  <div key={column.id} className="flex flex-col">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm">{column.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {columnDeals.length}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(totalValue)}
                      </div>
                      {config.allowCreate !== false && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full mt-2 h-7"
                          onClick={() => {
                            setSelectedColumn(column.stage)
                            setShowAddDialog(true)
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>

                    <Droppable droppableId={column.stage}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 space-y-2 p-2 rounded-md transition-colors ${
                            snapshot.isDraggingOver
                              ? "bg-muted"
                              : "bg-muted/30"
                          }`}
                        >
                          {columnDeals.map((deal, index) => (
                            <Draggable
                              key={deal.id}
                              draggableId={`deal-${deal.id}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-background border rounded-md p-3 shadow-sm hover:shadow-md transition-shadow ${
                                    snapshot.isDragging ? "shadow-lg" : ""
                                  }`}
                                >
                                  <div className="space-y-2">
                                    <div className="font-medium text-sm line-clamp-2">
                                      {deal.data_json.name}
                                    </div>
                                    
                                    {config.showValue !== false && (
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        {formatCurrency(deal.data_json.value || 0)}
                                      </div>
                                    )}

                                    {deal.data_json.contact_name && (
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <User className="h-3 w-3 mr-1" />
                                        {deal.data_json.contact_name}
                                      </div>
                                    )}

                                    {config.showProbability !== false &&
                                      deal.data_json.probability && (
                                        <div className="flex items-center text-xs text-muted-foreground">
                                          <TrendingUp className="h-3 w-3 mr-1" />
                                          {deal.data_json.probability}% chance
                                        </div>
                                      )}

                                    {deal.data_json.expected_close_date && (
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(
                                          deal.data_json.expected_close_date
                                        ).toLocaleDateString()}
                                      </div>
                                    )}

                                    {deal.data_json.assigned_to && (
                                      <Badge variant="outline" className="text-xs">
                                        {deal.data_json.assigned_to}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Add Deal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
            <DialogDescription>
              Create a new deal in the pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Deal Name *</Label>
              <Input
                value={newDeal.name}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, name: e.target.value })
                }
                placeholder="Q4 Enterprise Deal"
              />
            </div>
            <div>
              <Label>Deal Value (USD) *</Label>
              <Input
                type="number"
                value={newDeal.value}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, value: e.target.value })
                }
                placeholder="50000"
              />
            </div>
            <div>
              <Label>Contact Name</Label>
              <Input
                value={newDeal.contact_name}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, contact_name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Win Probability (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newDeal.probability}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, probability: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Expected Close Date</Label>
              <Input
                type="date"
                value={newDeal.expected_close_date}
                onChange={(e) =>
                  setNewDeal({
                    ...newDeal,
                    expected_close_date: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input
                value={newDeal.assigned_to}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, assigned_to: e.target.value })
                }
                placeholder="Sales Rep Name"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newDeal.notes}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, notes: e.target.value })
                }
                placeholder="Additional details..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDeal}>Create Deal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

