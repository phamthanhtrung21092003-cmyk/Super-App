/**
 * foodDriverService.ts
 * ─────────────────────────────────────────────────────────
 * REST API Client cho Tài xế nhận và xử lý đơn giao đồ ăn.
 * Kết nối trực tiếp Backend NestJS: /api/v1/food/driver/*
 * ─────────────────────────────────────────────────────────
 */

import apiClient from './apiClient';

export interface AvailableFoodOrder {
  id: string;
  orderCode: string;
  restaurantId: string;
  status: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  distanceKm: number;
  shippingFee: number;
  totalAmount: number;
  subtotal: number;
  paymentMethod: string;
  distanceToRestaurantKm: number;
  restaurant: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    phoneNumber?: string;
    avatar?: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    optionsJson?: any;
  }[];
  createdAt: string;
}

export const foodDriverService = {
  /**
   * Bật/tắt trạng thái nhận cuốc của tài xế
   */
  async toggleOnline(isOnline: boolean): Promise<{ driverId: string; fullName: string; isOnline: boolean }> {
    const response = await apiClient.patch('/food/driver/toggle-online', { isOnline });
    return response.data;
  },

  /**
   * Gửi tọa độ GPS định vị của tài xế
   */
  async sendLocation(data: { lat: number; lng: number; heading?: number; speed?: number; orderId?: string }): Promise<any> {
    const response = await apiClient.post('/food/driver/location', data);
    return response.data;
  },

  /**
   * Lấy danh sách các đơn đồ ăn đang chờ tài xế (FINDING_DRIVER)
   */
  async getAvailableOrders(lat?: number, lng?: number): Promise<AvailableFoodOrder[]> {
    const params: Record<string, any> = {};
    if (lat !== undefined && lng !== undefined) {
      params.lat = lat;
      params.lng = lng;
    }
    const response = await apiClient.get<AvailableFoodOrder[]>('/food/driver/available-orders', { params });
    return response.data;
  },

  /**
   * Lấy đơn đồ ăn hiện tại mà tài xế đang thực hiện giao
   */
  async getActiveOrder(): Promise<any> {
    const response = await apiClient.get('/food/driver/active-order');
    return response.data;
  },

  /**
   * Lịch sử giao hàng đồ ăn của tài xế
   */
  async getOrderHistory(): Promise<any[]> {
    const response = await apiClient.get('/food/driver/order-history');
    return response.data;
  },

  /**
   * Tài xế tiếp nhận đơn đồ ăn: FINDING_DRIVER -> DRIVER_ACCEPTED
   */
  async acceptOrder(orderId: string): Promise<any> {
    const response = await apiClient.post(`/food/driver/orders/${orderId}/accept`);
    return response.data;
  },

  /**
   * Tài xế xác nhận đã đến quán và nhận món: DRIVER_ACCEPTED -> PICKED_UP
   */
  async pickupOrder(orderId: string): Promise<any> {
    const response = await apiClient.patch(`/food/driver/orders/${orderId}/pickup`);
    return response.data;
  },

  /**
   * Tài xế hoàn tất giao hàng thành công: PICKED_UP -> COMPLETED
   */
  async completeOrder(orderId: string): Promise<any> {
    const response = await apiClient.patch(`/food/driver/orders/${orderId}/complete`);
    return response.data;
  },

  /**
   * Tài xế hủy nhận đơn (trước khi pickup): DRIVER_ACCEPTED -> FINDING_DRIVER
   */
  async cancelOrder(orderId: string, reason?: string): Promise<any> {
    const response = await apiClient.post(`/food/driver/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};
