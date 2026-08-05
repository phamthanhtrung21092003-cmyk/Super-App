import apiClient from './apiClient';

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  /**
   * Lấy danh sách thông báo của người dùng hiện tại
   */
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    const response = await apiClient.get('/notifications');
    return { notifications: response.data };
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },
};
