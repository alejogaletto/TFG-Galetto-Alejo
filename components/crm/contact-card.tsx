"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Building2, User, Edit, Trash2 } from "lucide-react"

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

interface ContactCardProps {
  contact: Contact
  onEdit?: (contact: Contact) => void
  onDelete?: (id: number) => void
  compact?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
}

export function ContactCard({ contact, onEdit, onDelete, compact = false }: ContactCardProps) {
  const { name, email, phone, company, status, assigned_to, tags } = contact.data_json
  
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  const statusColor = status ? STATUS_COLORS[status] || STATUS_COLORS.prospect : STATUS_COLORS.prospect

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{name}</div>
          <div className="text-sm text-muted-foreground truncate">{email || phone || "No contact info"}</div>
        </div>
        {status && (
          <Badge variant="outline" className={`${statusColor} text-xs`}>
            {status}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{name}</h3>
              {company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {company}
                </p>
              )}
            </div>
          </div>
          {status && (
            <Badge variant="outline" className={statusColor}>
              {status}
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-3">
          {email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${email}`}
                className="hover:text-primary hover:underline truncate"
              >
                {email}
              </a>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a
                href={`tel:${phone}`}
                className="hover:text-primary hover:underline"
              >
                {phone}
              </a>
            </div>
          )}
          {assigned_to && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{assigned_to}</span>
            </div>
          )}
        </div>

        {tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.split(",").map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(contact)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onDelete(contact.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

