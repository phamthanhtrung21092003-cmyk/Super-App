import apiClient from './apiClient';

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export const partnerNotificationService = {
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    const response = await apiClient.get('/notifications');
    return { notifications: response.data };
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },
};
