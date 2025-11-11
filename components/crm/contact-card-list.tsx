"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Plus, Search, Grid3x3, List } from "lucide-react"
import { ContactCard } from "./contact-card"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Contact {
  id: number
  data_json: {
    name: string
    email?: string
    phone?: string
    company?: string
    status?: string
    assigned_to?: string
    tags?: string
    notes?: string
  }
}

interface ContactCardListProps {
  tableId: string
  config?: {
    title?: string
    allowCreate?: boolean
    allowEdit?: boolean
    allowDelete?: boolean
    defaultView?: "grid" | "list"
    showSearch?: boolean
  }
}

export function ContactCardList({ tableId, config = {} }: ContactCardListProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">(config.defaultView || "grid")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "prospect",
    assigned_to: "",
    tags: "",
    notes: "",
  })

  useEffect(() => {
    fetchContacts()
  }, [tableId])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContacts(contacts)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredContacts(
        contacts.filter(
          (contact) =>
            contact.data_json.name?.toLowerCase().includes(query) ||
            contact.data_json.email?.toLowerCase().includes(query) ||
            contact.data_json.company?.toLowerCase().includes(query) ||
            contact.data_json.phone?.includes(query)
        )
      )
    }
  }, [searchQuery, contacts])

  const fetchContacts = async () => {
    if (!tableId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/business-data?virtual_table_schema_id=${tableId}`)
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
        setFilteredContacts(data)
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingContact) {
        // Update existing contact
        const response = await fetch(`/api/business-data/${editingContact.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data_json: formData }),
        })

        if (response.ok) {
          toast({
            title: "Success",
            description: "Contact updated successfully",
          })
        }
      } else {
        // Create new contact
        const response = await fetch("/api/business-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            virtual_table_schema_id: tableId,
            data_json: {
              ...formData,
              created_date: new Date().toISOString(),
            },
          }),
        })

        if (response.ok) {
          toast({
            title: "Success",
            description: "Contact created successfully",
          })
        }
      }

      fetchContacts()
      setShowAddDialog(false)
      setEditingContact(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "prospect",
        assigned_to: "",
        tags: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error saving contact:", error)
      toast({
        title: "Error",
        description: "Failed to save contact",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData(contact.data_json)
    setShowAddDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    try {
      const response = await fetch(`/api/business-data/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        })
        fetchContacts()
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
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
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{config.title || "Contacts"}</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
                <TabsList className="h-8">
                  <TabsTrigger value="grid" className="h-6">
                    <Grid3x3 className="h-3 w-3" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="h-6">
                    <List className="h-3 w-3" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {config.allowCreate !== false && (
                <Button size="sm" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Contact
                </Button>
              )}
            </div>
          </div>
          {config.showSearch !== false && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "No contacts found" : "No contacts yet"}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={config.allowEdit !== false ? handleEdit : undefined}
                  onDelete={config.allowDelete !== false ? handleDelete : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={config.allowEdit !== false ? handleEdit : undefined}
                  onDelete={config.allowDelete !== false ? handleDelete : undefined}
                  compact
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
            <DialogDescription>
              {editingContact ? "Update contact information" : "Create a new contact"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                placeholder="Sales Rep Name"
              />
            </div>
            <div>
              <Label>Tags</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="VIP, Partner, etc. (comma separated)"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false)
                setEditingContact(null)
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  company: "",
                  status: "prospect",
                  assigned_to: "",
                  tags: "",
                  notes: "",
                })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingContact ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

