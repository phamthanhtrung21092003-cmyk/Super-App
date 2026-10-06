import apiClient from './apiClient';

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface RegisterPushTokenPayload {
  deviceId: string;
  token: string;
  platform?: 'android' | 'ios' | 'web';
  appRole?: 'CUSTOMER' | 'MERCHANT' | 'DRIVER';
}

export const notificationService = {
  /**
   * Đăng ký hoặc cập nhật FCM Push Token cho thiết bị
   */
  async registerPushToken(payload: RegisterPushTokenPayload): Promise<any> {
    try {
      const response = await apiClient.post('/notifications/device-token', payload);
      return response.data;
    } catch (error) {
      console.warn('[notificationService] Lỗi đăng ký Push Token:', error);
      throw error;
    }
  },

  /**
   * Hủy kích hoạt FCM Push Token khi người dùng logout
   */
  async unregisterPushToken(deviceId?: string, token?: string, appRole?: string): Promise<any> {
    try {
      const response = await apiClient.delete('/notifications/device-token', {
        data: { deviceId, token, appRole },
      });
      return response.data;
    } catch (error) {
      console.warn('[notificationService] Lỗi hủy kích hoạt Push Token:', error);
      return null;
    }
  },

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
