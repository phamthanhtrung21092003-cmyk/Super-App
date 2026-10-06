/**
 * foodMerchantService.ts
 * ─────────────────────────────────────────────────────────
 * REST API client cho Phân hệ Quán ăn (Food Merchant).
 * Kết nối trực tiếp Backend NestJS: /api/v1/food/merchant/*
 * ─────────────────────────────────────────────────────────
 */

import apiClient from './apiClient';

export interface MerchantRestaurantProfile {
  id: string;
  name: string;
  slug?: string;
  address: string;
  phone?: string;
  phoneNumber?: string;
  avatar?: string;
  coverImage?: string;
  isOpen: boolean;
  autoAcceptOrder: boolean;
  openingHours?: string;
  rating?: number;
  totalReviews?: number;
  bankName?: string | null;
  bankCode?: string | null;
  bankAccountNumber?: string | null;
  bankAccountNo?: string | null;
  bankAccountName?: string | null;
  bankAccountHolder?: string | null;
  ownerId: string;
}

export interface FoodMerchantOrderItem {
  id: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  basePrice: number;
  customerPrice: number;
  totalPrice: number;
  unitPrice?: number;
  notes?: string | null;
  optionsJson?: any;
  menuItem?: {
    id?: string;
    name?: string;
    imageUrl?: string | null;
    price?: number;
  };
}

export interface FoodMerchantOrder {
  id: string;
  orderCode: string;
  restaurantId: string;
  userId: string;
  driverId?: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'FINDING_DRIVER' | 'DRIVER_ACCEPTED' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED';
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  originalFoodAmount: number;
  restaurantPayout: number;
  platformFoodMargin: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  noteForMerchant?: string | null;
  noteForDriver?: string | null;
  cancelledReason?: string | null;
  cancelledBy?: string | null;
  confirmedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  pickedUpAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: FoodMerchantOrderItem[];
  user?: {
    id: string;
    fullName?: string;
    name?: string;
    phone?: string;
    avatar?: string;
  };
  driver?: {
    id: string;
    fullName: string;
    phone: string;
    licensePlate: string;
    vehicleType: string;
  } | null;
}

export interface MerchantFinancialReport {
  restaurantId: string;
  restaurantName: string;
  totalRevenue: number;     // 110% khách trả
  netPayout: number;        // 90% quán thực nhận
  platformFee: number;      // 20% chênh lệch sàn
  totalOrders: number;
  settledOrders: {
    id: string;
    orderCode: string;
    completedAt: string;
    total: number;
    originalFoodAmount: number;
    restaurantPayout: number;
    platformFoodMargin: number;
  }[];
}

export const foodMerchantService = {
  /**
   * Lấy hồ sơ nhà hàng và cấu hình ngân hàng
   */
  async getProfile(): Promise<MerchantRestaurantProfile> {
    const response = await apiClient.get<MerchantRestaurantProfile>('/food/merchant/profile');
    return response.data;
  },

  /**
   * Cập nhật thông tin hồ sơ quán, giờ mở cửa, tài khoản ngân hàng
   */
  async updateProfile(dto: {
    name?: string;
    address?: string;
    phoneNumber?: string;
    openingHours?: string;
    avatar?: string;
    coverImage?: string;
    isOpen?: boolean;
    autoAcceptOrder?: boolean;
    bankName?: string;
    bankCode?: string;
    bankAccountNo?: string;
    bankAccountHolder?: string;
  }): Promise<MerchantRestaurantProfile> {
    const response = await apiClient.put<MerchantRestaurantProfile>('/food/merchant/profile', dto);
    return response.data;
  },

  /**
   * Bật/tắt trạng thái Mở/Đóng cửa và Tự động nhận đơn
   */
  async toggleOpen(isOpen?: boolean, autoAcceptOrder?: boolean): Promise<{ success: boolean; isOpen: boolean; autoAcceptOrder: boolean }> {
    const response = await apiClient.patch('/food/merchant/toggle-open', { isOpen, autoAcceptOrder });
    return response.data;
  },

  /**
   * Lấy danh sách đơn hàng của quán (lọc theo trạng thái nếu có)
   */
  async getOrders(status?: string): Promise<FoodMerchantOrder[]> {
    const params: Record<string, any> = {};
    if (status) {
      params.status = status;
    }
    const response = await apiClient.get<FoodMerchantOrder[]>('/food/merchant/orders', { params });
    return response.data;
  },

  /**
   * Lấy lịch sử đơn hàng của quán (hỗ trợ phân trang, lọc theo kỳ và trạng thái)
   */
  async getOrderHistory(query?: {
    page?: number;
    limit?: number;
    period?: 'TODAY' | '7DAYS' | '30DAYS' | 'ALL';
    status?: string;
  }): Promise<{
    orders: FoodMerchantOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    summary: {
      totalOrders: number;
      totalMerchantEarning: number;
    };
  }> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.period) params.period = query.period;
    if (query?.status) params.status = query.status;

    const response = await apiClient.get('/food/merchant/orders/history', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  async getOrderById(id: string): Promise<FoodMerchantOrder> {
    const response = await apiClient.get<FoodMerchantOrder>(`/food/merchant/orders/${id}`);
    return response.data;
  },

  /**
   * Xác nhận tiếp nhận đơn hàng (PENDING -> CONFIRMED)
   */
  async confirmOrder(id: string): Promise<FoodMerchantOrder> {
    const response = await apiClient.patch<FoodMerchantOrder>(`/food/merchant/orders/${id}/confirm`);
    return response.data;
  },

  /**
   * Bắt đầu chế biến món (CONFIRMED -> PREPARING)
   */
  async startPreparing(id: string): Promise<FoodMerchantOrder> {
    const response = await apiClient.patch<FoodMerchantOrder>(`/food/merchant/orders/${id}/preparing`);
    return response.data;
  },

  /**
   * Báo đã làm xong món, sẵn sàng tìm tài xế giao (PREPARING -> FINDING_DRIVER)
   */
  async markReady(id: string): Promise<FoodMerchantOrder> {
    const response = await apiClient.patch<FoodMerchantOrder>(`/food/merchant/orders/${id}/ready`);
    return response.data;
  },

  /**
   * Từ chối đơn hàng kèm lý do (PENDING/CONFIRMED -> CANCELLED, tự động hoàn ví nếu online)
   */
  async rejectOrder(id: string, reason: string): Promise<FoodMerchantOrder> {
    const response = await apiClient.patch<FoodMerchantOrder>(`/food/merchant/orders/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Lấy toàn bộ thực đơn kèm danh mục và tuỳ chọn
   */
  async getMenu(): Promise<any> {
    const response = await apiClient.get('/food/merchant/menu');
    const data = response.data;
    const cats = data.categories || [];
    const allItems: any[] = [];
    cats.forEach((c: any) => {
      if (c.items) {
        c.items.forEach((it: any) => {
          allItems.push({ 
            ...it, 
            categoryName: c.name,
            basePrice: it.originalPrice || it.price,
            customerPrice: Math.round((it.originalPrice || it.price) * 1.1),
            imageUrl: it.image,
          });
        });
      }
    });
    if (data.uncategorizedItems) {
      data.uncategorizedItems.forEach((it: any) => {
        allItems.push({ 
          ...it, 
          categoryName: 'Chưa phân loại',
          basePrice: it.originalPrice || it.price,
          customerPrice: Math.round((it.originalPrice || it.price) * 1.1),
          imageUrl: it.image,
        });
      });
    }
    return {
      ...data,
      categories: cats,
      items: allItems,
    };
  },

  /**
   * Tạo danh mục thực đơn mới
   */
  async createCategory(dto: { name: string; sortOrder?: number }): Promise<any> {
    const response = await apiClient.post('/food/merchant/categories', dto);
    return response.data;
  },

  /**
   * Cập nhật danh mục
   */
  async updateCategory(id: string, dto: { name?: string; sortOrder?: number }): Promise<any> {
    const response = await apiClient.put(`/food/merchant/categories/${id}`, dto);
    return response.data;
  },

  /**
   * Xóa danh mục
   */
  async deleteCategory(id: string): Promise<any> {
    const response = await apiClient.delete(`/food/merchant/categories/${id}`);
    return response.data;
  },

  /**
   * Thêm món ăn mới vào thực đơn
   */
  async createItem(dto: {
    name: string;
    description?: string;
    basePrice?: number;
    price?: number;
    imageUrl?: string;
    image?: string;
    categoryId?: string;
    isAvailable?: boolean;
    calories?: string;
  }): Promise<any> {
    const payload = {
      name: dto.name,
      description: dto.description,
      price: dto.price ?? dto.basePrice ?? 0,
      originalPrice: dto.basePrice ?? dto.price ?? 0,
      image: dto.image ?? dto.imageUrl,
      categoryId: dto.categoryId || undefined,
      isAvailable: dto.isAvailable ?? true,
      calories: dto.calories,
    };
    const response = await apiClient.post('/food/merchant/items', payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin món ăn
   */
  async updateItem(id: string, dto: {
    name?: string;
    description?: string;
    basePrice?: number;
    price?: number;
    imageUrl?: string;
    image?: string;
    categoryId?: string;
    isAvailable?: boolean;
    calories?: string;
  }): Promise<any> {
    const payload: any = { ...dto };
    if (dto.basePrice !== undefined && dto.price === undefined) {
      payload.price = dto.basePrice;
      payload.originalPrice = dto.basePrice;
    }
    if (dto.imageUrl !== undefined && dto.image === undefined) {
      payload.image = dto.imageUrl;
    }
    const response = await apiClient.put(`/food/merchant/items/${id}`, payload);
    return response.data;
  },

  /**
   * Bật/tắt nhanh trạng thái còn hàng/hết hàng của món ăn
   */
  async toggleStock(id: string): Promise<any> {
    const response = await apiClient.patch(`/food/merchant/items/${id}/toggle-stock`);
    return response.data;
  },

  /**
   * Xóa món ăn khỏi thực đơn
   */
  async deleteItem(id: string): Promise<any> {
    const response = await apiClient.delete(`/food/merchant/items/${id}`);
    return response.data;
  },

  /**
   * Tạo nhóm tuỳ chọn (Size, Topping, v.v.)
   */
  async createOptionGroup(itemId: string, dto: {
    name: string;
    maxSelect?: number;
    maxSelections?: number;
    required?: boolean;
    isRequired?: boolean;
  }): Promise<any> {
    const payload = {
      name: dto.name,
      required: dto.required ?? dto.isRequired ?? false,
      maxSelect: dto.maxSelect ?? dto.maxSelections ?? 1,
    };
    const response = await apiClient.post(`/food/merchant/items/${itemId}/option-groups`, payload);
    return response.data;
  },

  /**
   * Cập nhật nhóm tuỳ chọn
   */
  async updateOptionGroup(id: string, dto: {
    name?: string;
    maxSelect?: number;
    maxSelections?: number;
    required?: boolean;
    isRequired?: boolean;
  }): Promise<any> {
    const payload: any = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.required !== undefined || dto.isRequired !== undefined) {
      payload.required = dto.required ?? dto.isRequired;
    }
    if (dto.maxSelect !== undefined || dto.maxSelections !== undefined) {
      payload.maxSelect = dto.maxSelect ?? dto.maxSelections;
    }
    const response = await apiClient.put(`/food/merchant/option-groups/${id}`, payload);
    return response.data;
  },

  /**
   * Xóa nhóm tuỳ chọn
   */
  async deleteOptionGroup(id: string): Promise<any> {
    const response = await apiClient.delete(`/food/merchant/option-groups/${id}`);
    return response.data;
  },

  /**
   * Thêm tuỳ chọn con vào nhóm
   */
  async createOption(groupId: string, dto: {
    name: string;
    price: number;
    isAvailable?: boolean;
  }): Promise<any> {
    const response = await apiClient.post(`/food/merchant/option-groups/${groupId}/options`, dto);
    return response.data;
  },

  /**
   * Cập nhật tuỳ chọn con
   */
  async updateOption(id: string, dto: {
    name?: string;
    price?: number;
    isAvailable?: boolean;
  }): Promise<any> {
    const response = await apiClient.put(`/food/merchant/options/${id}`, dto);
    return response.data;
  },

  /**
   * Xóa tuỳ chọn con
   */
  async deleteOption(id: string): Promise<any> {
    const response = await apiClient.delete(`/food/merchant/options/${id}`);
    return response.data;
  },

  /**
   * Lấy báo cáo doanh thu tài chính quyết toán
   */
  async getFinancials(): Promise<MerchantFinancialReport> {
    const response = await apiClient.get<any>('/food/merchant/financials');
    const data = response.data;
    const summary = data.financialSummary || {};
    return {
      restaurantId: data.restaurant?.id || '',
      restaurantName: data.restaurant?.name || '',
      totalRevenue: summary.totalFoodRevenue || 0,
      netPayout: summary.totalMerchantEarning || 0,
      platformFee: summary.totalAppGrossProfit || 0,
      totalOrders: summary.completedOrdersCount || 0,
      settledOrders: (data.recentCompletedOrders || []).map((o: any) => ({
        id: o.id,
        orderCode: o.orderCode,
        completedAt: o.completedAt,
        total: o.subtotal,
        originalFoodAmount: o.baseStorePrice,
        restaurantPayout: o.merchantEarning,
        platformFoodMargin: o.merchantEarning ? Math.round(o.baseStorePrice * 0.2) : 0,
      })),
    };
  },
};
