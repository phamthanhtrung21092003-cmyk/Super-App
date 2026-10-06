import apiClient from './apiClient';

export interface FoodRestaurant {
  id: string;
  name: string;
  slug?: string;
  address: string;
  avatar?: string;
  coverImage?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  totalReviews?: number;
  openingHours?: string;
  distanceKm?: number;
  estimatedTime?: string;
  shippingFee?: number;
  categories?: any[];
}

export interface FoodOrderItemPayload {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  optionsJson?: {
    size?: { name: string; price: number };
    toppings?: { name: string; price: number }[];
  };
}

export interface CreateFoodOrderPayload {
  restaurantId: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  idempotencyKey?: string;
  noteForMerchant?: string;
  noteForDriver?: string;
  paymentMethod?: 'COD' | 'WALLET' | 'VIETQR';
  items: FoodOrderItemPayload[];
}

export const foodService = {
  /**
   * Lấy danh sách quán ăn từ Backend
   */
  async getRestaurants(lat?: number, lng?: number): Promise<FoodRestaurant[]> {
    const params: Record<string, any> = {};
    if (lat !== undefined && lng !== undefined) {
      params.lat = lat;
      params.lng = lng;
    }
    const response = await apiClient.get<FoodRestaurant[]>('/food/restaurants', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết quán và menu món, size, topping từ Backend
   */
  async getRestaurantDetail(id: string): Promise<any> {
    const response = await apiClient.get(`/food/restaurants/${id}`);
    return response.data;
  },

  /**
   * Tính toán cước phí và Freeship từ Backend
   */
  async calculateFee(subtotal: number, distanceKm: number): Promise<any> {
    const response = await apiClient.post('/food/calculate-fee', {
      subtotal,
      distanceKm,
    });
    return response.data;
  },

  /**
   * Tạo đơn hàng mới lên Backend (Server xác thực và tính toán lại giá an toàn)
   */
  async createOrder(payload: CreateFoodOrderPayload): Promise<any> {
    const response = await apiClient.post('/food/orders', payload);
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng và trạng thái cập nhật cho Live Tracking
   */
  async getOrderTracking(idOrCode: string): Promise<any> {
    const safeId = encodeURIComponent(idOrCode);
    const response = await apiClient.get(`/food/orders/${safeId}`);
    return response.data;
  },

  /**
   * Lấy lịch sử đơn hàng của người dùng (hỗ trợ phân trang và lọc theo tab)
   */
  async getUserOrders(query?: {
    page?: number;
    limit?: number;
    tab?: 'ALL' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    status?: string;
  }): Promise<{
    orders: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.tab) params.tab = query.tab;
    if (query?.status) params.status = query.status;

    const response = await apiClient.get('/food/orders', { params });
    return response.data;
  },

  /**
   * Lấy lịch sử đơn hàng của người dùng (Backward compatibility)
   */
  async getMyOrders(): Promise<any[]> {
    const response = await apiClient.get('/food/orders/my-orders');
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng cho User (có kiểm tra quyền sở hữu, include món, tài xế, timeline)
   */
  async getOrderDetail(idOrCode: string): Promise<any> {
    const safeId = encodeURIComponent(idOrCode);
    const response = await apiClient.get(`/food/orders/${safeId}`);
    return response.data;
  },

  /**
   * Kiểm tra tính khả dụng khi Mua lại (Re-order)
   * Kiểm tra quán còn mở không và giá/tồn kho các món theo DB thời gian thực
   */
  async checkReorder(idOrCode: string): Promise<{
    restaurant: {
      id: string;
      name: string;
      address: string;
      avatar?: string;
      isOpen: boolean;
      isActive: boolean;
    };
    isRestaurantAvailable: boolean;
    unavailableReason?: string;
    validItems: {
      menuItemId: string;
      name: string;
      basePrice: number;
      image?: string;
      quantity: number;
      optionsJson?: any;
      notes?: string;
    }[];
    unavailableItems: {
      menuItemId: string;
      name: string;
      reason: string;
    }[];
  }> {
    const safeId = encodeURIComponent(idOrCode);
    const response = await apiClient.post(`/food/orders/${safeId}/reorder-check`);
    return response.data;
  },

  /**
   * Hủy đơn hàng (Áp dụng phân quyền chặt chẽ: User chỉ được hủy khi PENDING)
   */
  async cancelOrder(idOrCode: string, reason: string): Promise<any> {
    const safeId = encodeURIComponent(idOrCode);
    const response = await apiClient.patch(`/food/orders/${safeId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng (Áp dụng State Machine Guard dành cho Quán và Tài xế)
   */
  async updateOrderStatus(idOrCode: string, status: string, note?: string, driverId?: string): Promise<any> {
    const safeId = encodeURIComponent(idOrCode);
    const response = await apiClient.patch(`/food/orders/${safeId}/status`, { status, note, driverId });
    return response.data;
  },
};
