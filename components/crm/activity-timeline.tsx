"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Phone, Mail, Calendar, FileText, CheckSquare, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Activity {
  id: number
  data_json: {
    type: string
    related_to?: string
    description: string
    date: string
    assigned_to?: string
    status: string
  }
}

interface ActivityTimelineProps {
  tableId: string
  config?: {
    title?: string
    allowCreate?: boolean
    maxItems?: number
    showRelatedTo?: boolean
    showAssignedTo?: boolean
  }
}

const ACTIVITY_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  call: {
    icon: <Phone className="h-4 w-4" />,
    color: "bg-blue-500 text-white",
  },
  email: {
    icon: <Mail className="h-4 w-4" />,
    color: "bg-purple-500 text-white",
  },
  meeting: {
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-green-500 text-white",
  },
  note: {
    icon: <FileText className="h-4 w-4" />,
    color: "bg-gray-500 text-white",
  },
  task: {
    icon: <CheckSquare className="h-4 w-4" />,
    color: "bg-orange-500 text-white",
  },
}

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

export function ActivityTimeline({ tableId, config = {} }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    type: "note",
    related_to: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    assigned_to: "",
    status: "completed",
  })

  useEffect(() => {
    fetchActivities()
  }, [tableId])

  const fetchActivities = async () => {
    if (!tableId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/business-data?virtual_table_schema_id=${tableId}`)
      if (response.ok) {
        const data = await response.json()
        // Sort by date descending (newest first)
        const sorted = data.sort((a: Activity, b: Activity) => {
          return new Date(b.data_json.date).getTime() - new Date(a.data_json.date).getTime()
        })
        setActivities(sorted)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.description) {
      toast({
        title: "Error",
        description: "Description is required",
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
          data_json: formData,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Activity logged successfully",
        })
        fetchActivities()
        setShowAddDialog(false)
        setFormData({
          type: "note",
          related_to: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          assigned_to: "",
          status: "completed",
        })
      }
    } catch (error) {
      console.error("Error creating activity:", error)
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday = date.toDateString() === today.toDateString()
    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const groupActivitiesByDate = () => {
    const groups: Record<string, Activity[]> = {}

    activities.slice(0, config.maxItems || activities.length).forEach((activity) => {
      const date = new Date(activity.data_json.date).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })

    return groups
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

  const groupedActivities = groupActivitiesByDate()

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{config.title || "Activity Timeline"}</CardTitle>
            {config.allowCreate !== false && (
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-3 w-3 mr-1" />
                Log Activity
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No activities logged yet
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                <div key={date}>
                  <div className="text-sm font-medium text-muted-foreground mb-3">
                    {formatDate(dateActivities[0].data_json.date)}
                  </div>
                  <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-[2px] before:bg-border">
                    {dateActivities.map((activity, index) => {
                      const activityType = ACTIVITY_ICONS[activity.data_json.type] || ACTIVITY_ICONS.note
                      const statusColor = STATUS_COLORS[activity.data_json.status] || STATUS_COLORS.completed

                      return (
                        <div key={activity.id} className="flex gap-3 relative">
                          <div
                            className={`flex items-center justify-center h-8 w-8 rounded-full ${activityType.color} flex-shrink-0 z-10`}
                          >
                            {activityType.icon}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="bg-muted/50 rounded-lg p-3 border">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm capitalize">
                                    {activity.data_json.type}
                                  </span>
                                  <Badge variant="outline" className={`${statusColor} text-xs`}>
                                    {activity.data_json.status}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-foreground mb-2">
                                {activity.data_json.description}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                {config.showRelatedTo !== false && activity.data_json.related_to && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {activity.data_json.related_to}
                                  </div>
                                )}
                                {config.showAssignedTo !== false && activity.data_json.assigned_to && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Assigned to {activity.data_json.assigned_to}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Activity Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>Record a new activity or interaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Activity Type *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what happened..."
                rows={3}
              />
            </div>
            <div>
              <Label>Related To</Label>
              <Input
                value={formData.related_to}
                onChange={(e) => setFormData({ ...formData, related_to: e.target.value })}
                placeholder="Contact or Deal name"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                placeholder="Team member name"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Log Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

