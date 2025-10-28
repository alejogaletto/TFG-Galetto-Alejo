"use client"

import { useEffect, useState } from 'react';
import { Notification, NotificationType } from '@/lib/types';
import { NotificationItem } from './notification-item';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Loader2 } from 'lucide-react';

interface NotificationListProps {
  onClose?: () => void;
}

type FilterType = 'all' | NotificationType;

export function NotificationList({ onClose }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '50' });
      if (filter !== 'all') {
        params.append('type', filter);
      }

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="w-[380px] max-w-[90vw]">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
              className="text-xs"
            >
              {markingAllRead ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Marcar todas leídas
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 border-b bg-gray-50/50">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              Todas
            </TabsTrigger>
            <TabsTrigger value="form_submission" className="text-xs">
              Formularios
            </TabsTrigger>
            <TabsTrigger value="workflow_completed" className="text-xs">
              Workflows
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notification List */}
      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <p className="text-sm text-gray-500">No hay notificaciones</p>
            <p className="text-xs text-gray-400 mt-1">
              Recibirás notificaciones aquí cuando ocurran eventos importantes
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

