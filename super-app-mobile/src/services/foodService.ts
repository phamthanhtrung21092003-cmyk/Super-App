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
  voucherCode?: string;
  items: FoodOrderItemPayload[];
}

export type FoodSearchSort = 
  | 'RELEVANCE' 
  | 'RATING' 
  | 'DISTANCE' 
  | 'PRICE_ASC' 
  | 'PRICE_DESC' 
  | 'REVIEW_COUNT';

export interface FoodSearchQuery {
  q?: string;
  categoryId?: string;
  restaurantId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDistance?: number;
  isOpen?: boolean;
  hasVoucher?: boolean;
  hasFreeShip?: boolean;
  sort?: FoodSearchSort;
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
}

export interface FoodDiscoveryQuery {
  latitude?: number;
  longitude?: number;
  limit?: number;
}

export interface SearchRestaurantItem {
  id: string;
  name: string;
  slug?: string;
  address: string;
  avatar?: string;
  coverImage?: string;
  latitude: number;
  longitude: number;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  openingHours?: string;
  distanceKm: number | null;
  estimatedDeliveryTime: string | null;
  hasVoucher: boolean;
  hasFreeShip: boolean;
  matchedCategories: string[];
}

export interface SearchMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  restaurantId: string;
  restaurantName: string;
  restaurantAvatar?: string;
  restaurantRating?: number;
  restaurantAddress?: string;
  distanceKm?: number | null;
  categoryName?: string;
}

export interface FoodSearchCombinedResponse {
  query: string;
  restaurants: {
    items: SearchRestaurantItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  menuItems: {
    items: SearchMenuItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface FoodDiscoveryResponse {
  featured: SearchRestaurantItem[];
  topRated: SearchRestaurantItem[];
  nearby: SearchRestaurantItem[];
  openNow: SearchRestaurantItem[];
  withVouchers: SearchRestaurantItem[];
  popularDishes: any[];
  categories: any[];
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

  /**
   * Gửi đánh giá đơn hàng (Nhà hàng, Món ăn, Tài xế)
   */
  async submitOrderReviews(
    orderId: string,
    payload: {
      restaurantRating?: number;
      restaurantComment?: string;
      driverRating?: number;
      driverComment?: string;
      itemReviews?: { menuItemId: string; rating: number; comment?: string }[];
    }
  ): Promise<any> {
    const response = await apiClient.post(`/food/orders/${orderId}/reviews`, payload);
    return response.data;
  },

  /**
   * Lấy trạng thái và chi tiết đánh giá của đơn hàng
   */
  async getOrderReviews(orderId: string): Promise<any> {
    const response = await apiClient.get(`/food/orders/${orderId}/reviews`);
    return response.data;
  },

  /**
   * Lấy danh sách đánh giá của nhà hàng kèm thống kê sao
   */
  async getRestaurantReviews(
    restaurantId: string,
    query?: { page?: number; limit?: number; rating?: number; sort?: 'latest' | 'highest' | 'lowest' }
  ): Promise<any> {
    const response = await apiClient.get(`/food/restaurants/${restaurantId}/reviews`, { params: query });
    return response.data;
  },

  /**
   * Lấy danh sách đánh giá của món ăn
   */
  async getItemReviews(
    itemId: string,
    query?: { page?: number; limit?: number }
  ): Promise<any> {
    const response = await apiClient.get(`/food/menu-items/${itemId}/reviews`, { params: query });
    return response.data;
  },

  /**
   * Merchant xem đánh giá nhà hàng của mình
   */
  async getMerchantReviews(
    query?: { page?: number; limit?: number; rating?: number; sort?: 'latest' | 'highest' | 'lowest' }
  ): Promise<any> {
    const response = await apiClient.get('/food/merchant/reviews', { params: query });
    return response.data;
  },

  /**
   * Tài xế xem đánh giá của mình từ khách hàng
   */
  async getDriverReviews(
    query?: { page?: number; limit?: number }
  ): Promise<any> {
    const response = await apiClient.get('/food/driver/reviews', { params: query });
    return response.data;
  },

  /**
   * Kiểm tra tính hợp lệ và tính số tiền giảm của Voucher
   */
  async validateVoucher(
    code: string,
    restaurantId: string,
    subtotal: number,
    shippingFee?: number
  ): Promise<any> {
    const response = await apiClient.post('/food/vouchers/validate', {
      code,
      restaurantId,
      subtotal,
      shippingFee: shippingFee || 0,
    });
    return response.data;
  },

  /**
   * Lấy danh sách Voucher khả dụng của người dùng
   */
  async getAvailableVouchers(restaurantId?: string): Promise<any[]> {
    const params: Record<string, any> = {};
    if (restaurantId) params.restaurantId = restaurantId;
    const response = await apiClient.get<any[]>('/food/vouchers', { params });
    return response.data;
  },

  /**
   * Chủ quán lấy danh sách Voucher của quán
   */
  async getMerchantVouchers(query?: { page?: number; limit?: number }): Promise<any> {
    const response = await apiClient.get('/food/merchant/vouchers', { params: query });
    return response.data;
  },

  /**
   * Chủ quán tạo Voucher mới
   */
  async createMerchantVoucher(payload: any): Promise<any> {
    const response = await apiClient.post('/food/merchant/vouchers', payload);
    return response.data;
  },

  /**
   * Chủ quán cập nhật Voucher
   */
  async updateMerchantVoucher(id: string, payload: any): Promise<any> {
    const response = await apiClient.put(`/food/merchant/vouchers/${id}`, payload);
    return response.data;
  },

  /**
   * Chủ quán bật/tắt kích hoạt Voucher
   */
  async toggleMerchantVoucher(id: string): Promise<any> {
    const response = await apiClient.patch(`/food/merchant/vouchers/${id}/toggle`);
    return response.data;
  },

  /**
   * Chủ quán xóa Voucher
   */
  async deleteMerchantVoucher(id: string): Promise<any> {
    const response = await apiClient.delete(`/food/merchant/vouchers/${id}`);
    return response.data;
  },

  /**
   * Tìm kiếm kết hợp (Nhà hàng & Món ăn)
   */
  async searchCombined(query: FoodSearchQuery): Promise<FoodSearchCombinedResponse> {
    const response = await apiClient.get<FoodSearchCombinedResponse>('/food/search', {
      params: query,
    });
    return response.data;
  },

  /**
   * Tìm kiếm riêng danh sách Nhà hàng có phân trang và lọc đa chiều
   */
  async searchRestaurants(query: FoodSearchQuery): Promise<{
    items: SearchRestaurantItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get('/food/search/restaurants', {
      params: query,
    });
    return response.data;
  },

  /**
   * Tìm kiếm riêng danh sách Món ăn có phân trang và lọc đa chiều
   */
  async searchMenuItems(query: FoodSearchQuery): Promise<{
    items: SearchMenuItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get('/food/search/menu-items', {
      params: query,
    });
    return response.data;
  },

  /**
   * Lấy dữ liệu Discovery Feed cho trang chủ (quán nổi bật, top rated, gần user, có voucher, món hot)
   */
  async getDiscovery(query?: FoodDiscoveryQuery): Promise<FoodDiscoveryResponse> {
    const response = await apiClient.get<FoodDiscoveryResponse>('/food/discovery', {
      params: query,
    });
    return response.data;
  },
};

