"use client"

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bell, 
  FileText, 
  Database, 
  Workflow as WorkflowIcon, 
  Package,
  CheckCircle
} from 'lucide-react';
import { Notification, NotificationType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'form_submission':
      return <FileText className="h-4 w-4" />;
    case 'form_created':
      return <FileText className="h-4 w-4" />;
    case 'registry_created':
      return <Database className="h-4 w-4" />;
    case 'database_created':
      return <Database className="h-4 w-4" />;
    case 'workflow_completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'solution_deployed':
      return <Package className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'form_submission':
      return 'text-blue-600 bg-blue-50';
    case 'form_created':
      return 'text-blue-600 bg-blue-50';
    case 'registry_created':
      return 'text-purple-600 bg-purple-50';
    case 'database_created':
      return 'text-purple-600 bg-purple-50';
    case 'workflow_completed':
      return 'text-green-600 bg-green-50';
    case 'solution_deployed':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: es
  });

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 border-b last:border-b-0",
        !notification.is_read && "bg-blue-50/50"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        getNotificationColor(notification.type)
      )}>
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm font-medium text-gray-900",
            !notification.is_read && "font-semibold"
          )}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1" />
          )}
        </div>
        
        {notification.message && (
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          {timeAgo}
        </p>
      </div>
    </div>
  );
}

