import { BaseClient } from '../client/base';
import { Notification } from '../types';

/**
 * Notifications module for managing user notifications
 */
export class Notifications extends BaseClient {
  /**
   * List all notifications for the current user
   */
  async list(): Promise<Notification[]> {
    return this.get<Notification[]>('/api/notifications/list');
  }

  /**
   * Create a new notification
   */
  async create(data: {
    key: string;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    userId?: string;
    organization?: string;
    project?: string;
  }): Promise<any> {
    return this.post('/api/notifications/new', data);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userNotificationId: string): Promise<{
    id: string;
    fk_user_id: string;
    fk_notification_id: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
  }> {
    return this.post(`/api/notifications/read`, { userNotificationId });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    return this.post<void>('/api/notifications/read-all', {});
  }
}