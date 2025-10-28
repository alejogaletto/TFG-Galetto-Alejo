import { createServerAdminClient } from './supabase-client';
import { Notification, NotificationType } from './types';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  metadata?: any;
}

/**
 * Notification Service
 * Centralized service for managing notifications
 * Uses admin client to bypass RLS since we explicitly set user_id
 */
export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification({
    userId,
    type,
    title,
    message,
    metadata
  }: CreateNotificationParams): Promise<Notification | null> {
    try {
      const supabase = createServerAdminClient();
      
      const { data, error } = await supabase
        .from('Notification')
        .insert([
          {
            user_id: userId,
            type,
            title,
            message,
            metadata,
            is_read: false
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data as Notification;
    } catch (error) {
      console.error('Exception creating notification:', error);
      return null;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const supabase = createServerAdminClient();
      
      const { error } = await supabase
        .from('Notification')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const supabase = createServerAdminClient();
      
      const { error } = await supabase
        .from('Notification')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const supabase = createServerAdminClient();
      
      const { count, error } = await supabase
        .from('Notification')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Exception getting unread count:', error);
      return 0;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      const supabase = createServerAdminClient();
      
      const { error } = await supabase
        .from('Notification')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception deleting notification:', error);
      return false;
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService;

