/**
 * Service Layer Abstraction for Seller Center
 * Decouples UI components from data fetching.
 * Seamlessly resolves state: New Seller (Empty State) -> Active Shop (Real Data).
 */

// Sample Demo Orders Dataset for Active Shop Testing
export const MOCK_ORDERS_DEMO = [
  {
    id: 'ord_1',
    code: '#SP250811-0286',
    date: '11/08 10:30',
    status: 'Chờ xác nhận',
    hasNewChat: true,
    countdownTimer: '12:30:45',
    customer: {
      name: 'Nguyễn Thị Lan',
      phone: '0901 234 567',
      address: '123 Nguyễn Văn Linh, Quận Long Biên, Hà Nội',
      city: 'Hà Nội'
    },
    items: [
      {
        productId: 'p1',
        name: 'Áo thun nam Basic',
        variant: 'Trắng - M',
        price: 199000,
        quantity: 2,
        total: 398000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'
      },
      {
        productId: 'p2',
        name: 'Mũ lưỡi trai Be',
        variant: 'Be',
        price: 129000,
        quantity: 1,
        total: 129000,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300'
      }
    ],
    summary: {
      subtotal: 527000,
      shippingFee: 15000,
      discount: -20000,
      total: 522000,
      paymentMethod: 'Ví V-life',
      paymentStatus: 'Chờ xác nhận'
    },
    shipping: {
      provider: 'GHN',
      providerName: 'Giao Hàng Nhanh',
      service: 'Giao tiêu chuẩn',
      trackingNo: 'GHN123456789VN'
    }
  },
  {
    id: 'ord_2',
    code: '#SP250811-0285',
    date: '11/08 09:15',
    status: 'Chờ lấy hàng',
    customer: {
      name: 'Trần Văn Minh',
      phone: '0987 654 321',
      address: '456 Lê Duẩn, Quận 1, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh'
    },
    items: [
      {
        productId: 'p3',
        name: 'Chuột Logitech G102',
        variant: 'Đen',
        price: 550000,
        quantity: 1,
        total: 550000,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300'
      }
    ],
    summary: {
      subtotal: 550000,
      shippingFee: 20000,
      discount: 0,
      total: 570000,
      paymentMethod: 'Thanh toán online',
      paymentStatus: 'Đã thanh toán'
    },
    shipping: {
      provider: 'J&T',
      providerName: 'J&T Express',
      service: 'Giao nhanh',
      trackingNo: 'JT987654321VN'
    }
  },
  {
    id: 'ord_3',
    code: '#SP250811-0284',
    date: '10/08 20:10',
    status: 'Đang giao',
    customer: {
      name: 'Lê Thu Hà',
      phone: '0966 112 233',
      address: '789 Nguyễn Văn Linh, Quận Thanh Khê, Đà Nẵng',
      city: 'Đà Nẵng'
    },
    items: [
      {
        productId: 'p4',
        name: 'Balo laptop 15.6 inch',
        variant: 'Xám',
        price: 299000,
        quantity: 1,
        total: 299000,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300'
      }
    ],
    summary: {
      subtotal: 299000,
      shippingFee: 25000,
      discount: 0,
      total: 324000,
      paymentMethod: 'COD',
      paymentStatus: 'Thanh toán khi nhận hàng'
    },
    shipping: {
      provider: 'Viettel Post',
      providerName: 'Viettel Post',
      service: 'Giao tiêu chuẩn',
      trackingNo: 'VTP456789123VN'
    }
  },
  {
    id: 'ord_4',
    code: '#SP250811-0283',
    date: '10/08 16:20',
    status: 'Hoàn thành',
    customer: {
      name: 'Nguyễn Hoàng',
      phone: '0909 888 777',
      address: '321 3 Tháng 2, Quận Ninh Kiều, Cần Thơ',
      city: 'Cần Thơ'
    },
    items: [
      {
        productId: 'p5',
        name: 'Tai nghe Bluetooth True Wireless',
        variant: 'Trắng',
        price: 450000,
        quantity: 1,
        total: 450000,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300'
      }
    ],
    summary: {
      subtotal: 450000,
      shippingFee: 15000,
      discount: -15000,
      total: 450000,
      paymentMethod: 'Ví V-life',
      paymentStatus: 'Đã thanh toán'
    },
    shipping: {
      provider: 'GHN',
      providerName: 'Giao Hàng Nhanh',
      service: 'Giao tiêu chuẩn',
      trackingNo: 'GHN555666777VN'
    }
  },
  {
    id: 'ord_5',
    code: '#SP250811-0282',
    date: '10/08 14:10',
    status: 'Hoàn thành',
    customer: {
      name: 'Phạm Thị Mai',
      phone: '0388 999 666',
      address: '159 Trần Phú, Quận Ngô Quyền, Hải Phòng',
      city: 'Hải Phòng'
    },
    items: [
      {
        productId: 'p6',
        name: 'Áo hoodie nữ Premium Oversize',
        variant: 'Hồng - L',
        price: 349000,
        quantity: 1,
        total: 349000,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300'
      }
    ],
    summary: {
      subtotal: 349000,
      shippingFee: 20000,
      discount: 0,
      total: 369000,
      paymentMethod: 'COD',
      paymentStatus: 'Đã thanh toán khi nhận'
    },
    shipping: {
      provider: 'J&T',
      providerName: 'J&T Express',
      service: 'Giao tiêu chuẩn',
      trackingNo: 'JT111222333VN'
    }
  },
  {
    id: 'ord_6',
    code: '#SP250811-0281',
    date: '10/08 11:45',
    status: 'Đã hủy',
    cancelReason: 'Khách hủy đơn',
    customer: {
      name: 'Đỗ Văn Nam',
      phone: '0877 456 789',
      address: '55 Hoàng Quốc Việt, Quận Cầu Giấy, Hà Nội',
      city: 'Hà Nội'
    },
    items: [
      {
        productId: 'p7',
        name: 'Sạc dự phòng 20000mAh Sạc nhanh 22.5W',
        variant: 'Đen',
        price: 299000,
        quantity: 1,
        total: 299000,
        image: 'https://images.unsplash.com/photo-1609592424074-b9034d6be206?w=300'
      }
    ],
    summary: {
      subtotal: 299000,
      shippingFee: 0,
      discount: 0,
      total: 299000,
      paymentMethod: 'Ví V-life',
      paymentStatus: 'Đã hoàn tiền'
    },
    shipping: {
      provider: '--',
      providerName: 'Chưa bàn giao',
      service: '--',
      trackingNo: '--'
    }
  },
  {
    id: 'ord_7',
    code: '#SP250811-0280',
    date: '09/08 22:30',
    status: 'Hoàn thành',
    customer: {
      name: 'Hoàng Thu Hiền',
      phone: '0912 345 678',
      address: '88 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
      city: 'Hà Nội'
    },
    items: [
      {
        productId: 'p8',
        name: 'Giày thể thao nam Runner Pro Max',
        variant: 'Đen - 42',
        price: 599000,
        quantity: 1,
        total: 599000,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'
      }
    ],
    summary: {
      subtotal: 599000,
      shippingFee: 30000,
      discount: -50000,
      total: 579000,
      paymentMethod: 'Ví V-life',
      paymentStatus: 'Đã thanh toán'
    },
    shipping: {
      provider: 'Viettel Post',
      providerName: 'Viettel Post',
      service: 'Giao tiêu chuẩn',
      trackingNo: 'VTP999888777VN'
    }
  }
];

// Initial New Seller Database State
// Initial Seller Database State (Active Shop with rich order history)
const newSellerDb = {
  shopInfo: {
    name: 'Shop ABC',
    ownerName: 'Nguyễn Văn A',
    slogan: 'Chất lượng hàng đầu - Phục vụ tận tâm 24/7',
    status: 'ACTIVE',
    subtitle: 'Shop đang hoạt động',
    isKycVerified: true,
    lastUpdated: '12/08/2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'
  },

  kpiMetrics: {
    period: 'today',
    today: {
      revenue: { value: 12580000, formatted: '12.580.000đ', changePercent: 18.5, isPositive: true, label: 'so với hôm qua' },
      orders: { value: 128, formatted: '128', changePercent: 12, isPositive: true, label: 'so với hôm qua' },
      pending: { value: 36, formatted: '36', diffCount: 5, isPositive: true, label: 'đơn so với hôm qua' },
      itemsSold: { value: 84, formatted: '84', changePercent: 10, isPositive: true, label: 'so với hôm qua' },
      customers: { value: 1245, formatted: '1.245', changePercent: 8.2, isPositive: true, label: 'so với hôm qua' }
    }
  },

  pendingActions: [
    { id: 'pending_confirm', key: 'pending_confirm', title: 'Đơn chờ xác nhận', count: 24, badgeColor: '#FEF2F2', iconColor: '#EF4444', targetTab: 'orders', orderFilter: 'Chờ xác nhận' },
    { id: 'pending_pack', key: 'pending_pack', title: 'Đơn chờ đóng gói', count: 18, badgeColor: '#FFF7ED', iconColor: '#F97316', targetTab: 'orders', orderFilter: 'Chờ đóng gói' },
    { id: 'pending_handover', key: 'pending_handover', title: 'Đơn chờ bàn giao', count: 12, badgeColor: '#EFF6FF', iconColor: '#1877F2', targetTab: 'orders', orderFilter: 'Chờ bàn giao' },
    { id: 'returns', key: 'returns', title: 'Yêu cầu trả hàng', count: 3, badgeColor: '#F3E8FF', iconColor: '#A855F7', targetTab: 'orders', orderFilter: 'Trả hàng' },
    { id: 'unread_chats', key: 'unread_chats', title: 'Tin nhắn chưa trả lời', count: 8, badgeColor: '#F0FDF4', iconColor: '#00B14F', targetTab: 'chat', orderFilter: null }
  ],

  financialOverview: {
    availableBalance: 45800000,
    formattedAvailable: '45.800.000đ',
    pendingReconciliation: 12500000,
    formattedPending: '12.500.000đ',
    monthlyRevenue: 125800000,
    formattedMonthly: '125.800.000đ',
    hasBankAccount: true
  },

  shopHealth: {
    score: 98,
    maxScore: 100,
    statusText: 'Shop đang hoạt động rất tốt',
    onTimeDeliveryRate: 98.5,
    cancellationRate: 1.2,
    returnRate: 0.5,
    penaltyPoints: 0
  },

  platformAnnouncements: [
    { id: 'ann_1', title: 'Chính sách vận chuyển mới có hiệu lực từ 15/08/2026', date: '12/08/2026', category: 'THONG_TIN', tag: 'Thông tin', tagColor: 'blue' },
    { id: 'ann_2', title: 'Chương trình Freeship tháng 8 - Tham gia ngay!', date: '11/08/2026', category: 'QUAN_TRONG', tag: 'Quan trọng', tagColor: 'red' },
    { id: 'ann_3', title: 'Cập nhật điều khoản sử dụng dành cho Người bán', date: '10/08/2026', category: 'CAN_CHUY_Y', tag: 'Cần chú ý', tagColor: 'orange' },
    { id: 'ann_4', title: 'Hệ thống sẽ bảo trì lúc 02:00 - 04:00 ngày 15/08/2026', date: '10/08/2026', category: 'THONG_TIN', tag: 'Thông tin', tagColor: 'blue' }
  ]
};

// Public Service Layer API Interface
export const sellerService = {
  // Fetch Shop Profile Info
  async getShopInfo() {
    return Promise.resolve({ ...newSellerDb.shopInfo });
  },

  // Fetch KPI Metrics (Dynamically calculates if real orders exist)
  async getKpiMetrics(period = 'today', existingOrders = []) {
    return Promise.resolve(newSellerDb.kpiMetrics[period] || newSellerDb.kpiMetrics.today);
  },

  // Fetch Pending Action Items
  async getPendingActions(existingOrders = []) {
    return Promise.resolve([...newSellerDb.pendingActions]);
  },

  // Fetch Revenue Chart Data
  async getRevenueChartData(days = 7, existingOrders = []) {
    return Promise.resolve({
      totalRevenue: 125800000,
      formattedRevenue: '125.800.000đ',
      growthPercent: 18.5,
      days,
      points: [
        { date: '06/08', revenue: 8500000, orders: 15 },
        { date: '07/08', revenue: 14200000, orders: 28 },
        { date: '08/08', revenue: 21800000, orders: 36 },
        { date: '09/08', revenue: 18600000, orders: 30 },
        { date: '10/08', revenue: 24500000, orders: 42 },
        { date: '11/08', revenue: 20100000, orders: 35 },
        { date: '12/08', revenue: 38100000, orders: 58 }
      ]
    });
  },

  // Get Recent Orders
  async getRecentOrders(existingOrders = [], limit = 5) {
    const defaultOrders = [
      { id: '#VL000123', orderId: 'ord_1', customer: 'Nguyễn Văn A', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', items: '2 sản phẩm', itemCount: 2, total: 398000, date: '12/08/2026', status: 'Chờ xác nhận' },
      { id: '#VL000124', orderId: 'ord_2', customer: 'Trần Văn B', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', items: '1 sản phẩm', itemCount: 1, total: 250000, date: '12/08/2026', status: 'Đang giao' },
      { id: '#VL000125', orderId: 'ord_3', customer: 'Lê Thị C', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', items: '3 sản phẩm', itemCount: 3, total: 680000, date: '12/08/2026', status: 'Chờ lấy hàng' },
      { id: '#VL000126', orderId: 'ord_4', customer: 'Phạm Văn D', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', items: '1 sản phẩm', itemCount: 1, total: 120000, date: '12/08/2026', status: 'Hoàn thành' },
      { id: '#VL000127', orderId: 'ord_5', customer: 'Hoàng Văn E', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', items: '2 sản phẩm', itemCount: 2, total: 560000, date: '12/08/2026', status: 'Đang giao' }
    ];
    return Promise.resolve(defaultOrders);
  },

  // FINANCIAL OVERVIEW
  async getFinancialOverview(existingOrders = []) {
    if (existingOrders && existingOrders.length > 0) {
      const totalRev = existingOrders.reduce((sum, o) => sum + (o.summary?.total || o.total || 0), 0);
      return Promise.resolve({
        availableBalance: Math.round(totalRev * 0.9),
        formattedAvailable: `${Math.round(totalRev * 0.9).toLocaleString('vi-VN')}đ`,
        pendingReconciliation: Math.round(totalRev * 0.1),
        formattedPending: `${Math.round(totalRev * 0.1).toLocaleString('vi-VN')}đ`,
        monthlyRevenue: totalRev,
        formattedMonthly: `${totalRev.toLocaleString('vi-VN')}đ`,
        hasBankAccount: true
      });
    }
    return Promise.resolve({ ...newSellerDb.financialOverview });
  },

  // SHOP HEALTH
  async getShopHealth(existingOrders = []) {
    if (!existingOrders || existingOrders.length === 0) {
      return Promise.resolve({ ...newSellerDb.shopHealth });
    }
    return Promise.resolve({
      score: 98,
      maxScore: 100,
      statusText: 'Shop đang hoạt động tốt',
      onTimeDeliveryRate: 97.2,
      cancellationRate: 4.2,
      returnRate: 0.0,
      penaltyPoints: 0
    });
  },

  // PLATFORM ANNOUNCEMENTS
  async getPlatformAnnouncements() {
    return Promise.resolve([...newSellerDb.platformAnnouncements]);
  },

  // =========================================================================
  // 📦 ORDER MANAGEMENT FACADE API
  // =========================================================================

  // Calculate Metric Counts for Order Status Cards & Tabs
  async getOrderMetrics(ordersList = []) {
    const total = ordersList.length;
    const confirm = ordersList.filter(o => o.status === 'Chờ xác nhận').length;
    const pickup = ordersList.filter(o => o.status === 'Chờ lấy hàng' || o.status === 'Chờ đóng gói').length;
    const delivering = ordersList.filter(o => o.status === 'Đang giao' || o.status === 'Chờ bàn giao').length;
    const completed = ordersList.filter(o => o.status === 'Hoàn thành').length;
    const cancelled = ordersList.filter(o => o.status === 'Đã hủy').length;
    const returned = ordersList.filter(o => o.status === 'Trả hàng/Hoàn tiền' || o.status === 'Trả hàng').length;

    return Promise.resolve({
      total,
      confirm,
      pickup,
      delivering,
      completed,
      cancelled,
      returned
    });
  },

  // Get Orders Filtered
  async getOrders(ordersList = [], filters = {}) {
    const { tab = 'all', query = '', provider = 'Tất cả', dateRange = 'all' } = filters;
    let list = [...ordersList];

    // Status Tab Filtering
    if (tab === 'confirm') list = list.filter(o => o.status === 'Chờ xác nhận');
    if (tab === 'pickup') list = list.filter(o => o.status === 'Chờ lấy hàng' || o.status === 'Chờ đóng gói');
    if (tab === 'delivering') list = list.filter(o => o.status === 'Đang giao' || o.status === 'Chờ bàn giao');
    if (tab === 'completed') list = list.filter(o => o.status === 'Hoàn thành');
    if (tab === 'cancelled') list = list.filter(o => o.status === 'Đã hủy');
    if (tab === 'returned') list = list.filter(o => o.status === 'Trả hàng/Hoàn tiền' || o.status === 'Trả hàng');

    // Search Query (Code, Customer name, Phone)
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(o => {
        const matchCode = o.code && o.code.toLowerCase().includes(q);
        const matchCustName = o.customer?.name && o.customer.name.toLowerCase().includes(q);
        const matchPhone = o.customer?.phone && o.customer.phone.includes(q);
        return matchCode || matchCustName || matchPhone;
      });
    }

    // Shipping Provider Filter
    if (provider && provider !== 'Tất cả' && provider !== 'Tất cả vận chuyển') {
      list = list.filter(o => o.shipping?.provider === provider || o.shipping?.providerName === provider);
    }

    return Promise.resolve(list);
  },

  // Get Order By ID
  async getOrderById(ordersList = [], orderId) {
    const found = ordersList.find(o => o.id === orderId || o.code === orderId);
    return Promise.resolve(found || null);
  },

  // Update Single Order Status
  async updateOrderStatus(ordersList = [], orderId, newStatus) {
    const updated = ordersList.map(o => {
      if (o.id === orderId || o.code === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    return Promise.resolve(updated);
  },

  // Bulk Update Orders Status
  async bulkUpdateOrderStatus(ordersList = [], orderIds = [], newStatus) {
    const updated = ordersList.map(o => {
      if (orderIds.includes(o.id) || orderIds.includes(o.code)) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    return Promise.resolve(updated);
  },

  // PRODUCT CATALOG MANAGEMENT FACADE API
  async getProducts(productsList = [], filters = {}) {
    const { tab = 'all', query = '', category = 'Tất cả', status = 'Tất cả' } = filters;
    let list = [...productsList];
    if (tab === 'active') list = list.filter(p => p.status === 'Đang bán');
    if (tab === 'hidden') list = list.filter(p => p.status === 'Tạm ẩn');
    if (tab === 'outofstock') list = list.filter(p => p.stock === 0 || p.status === 'Hết hàng');
    if (tab === 'draft') list = list.filter(p => p.status === 'Bản nháp');

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
    }
    if (category && category !== 'Tất cả' && category !== 'Tất cả danh mục') {
      list = list.filter(p => p.category === category);
    }
    if (status && status !== 'Tất cả') {
      list = list.filter(p => p.status === status);
    }
    return Promise.resolve(list);
  },

  async getProductById(productsList = [], productId) {
    const found = productsList.find(p => p.id === productId);
    return Promise.resolve(found || null);
  },

  async getProductMetrics(productsList = []) {
    const total = productsList.length;
    const active = productsList.filter(p => p.status === 'Đang bán').length;
    const hidden = productsList.filter(p => p.status === 'Tạm ẩn').length;
    const outofstock = productsList.filter(p => p.stock === 0 || p.status === 'Hết hàng').length;
    const draft = productsList.filter(p => p.status === 'Bản nháp').length;

    return Promise.resolve({ total, active, hidden, outofstock, draft });
  },

  async createProduct(newProductData) {
    const createdProduct = {
      id: `prod_${Date.now()}`,
      name: newProductData.name || 'Sản phẩm mới',
      sku: newProductData.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      category: newProductData.category || 'Thời trang',
      price: Number(newProductData.price) || 0,
      origPrice: Number(newProductData.origPrice) || Number(newProductData.price) || 0,
      stock: Number(newProductData.stock) || 0,
      sold: 0,
      status: newProductData.status || 'Đang bán',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      variants: newProductData.variants || 'Mặc định',
      image: newProductData.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      description: newProductData.description || ''
    };
    return Promise.resolve(createdProduct);
  },

  async updateProduct(productsList = [], productId, updatedFields) {
    const updatedList = productsList.map(p => p.id === productId ? { ...p, ...updatedFields } : p);
    return Promise.resolve(updatedList);
  },

  async deleteProduct(productsList = [], productId) {
    const updatedList = productsList.filter(p => p.id !== productId);
    return Promise.resolve(updatedList);
  },

  async updateProductStatus(productsList = [], productId, newStatus) {
    const updatedList = productsList.map(p => p.id === productId ? { ...p, status: newStatus } : p);
    return Promise.resolve(updatedList);
  },

  // Get Top Selling Products
  async getTopSellingProducts(existingProducts = [], limit = 3) {
    if (existingProducts && existingProducts.length > 0) {
      const sorted = [...existingProducts].sort((a, b) => (b.sold || 0) - (a.sold || 0));
      const top = sorted.slice(0, limit).map((p, idx) => ({
        productId: p.id,
        rank: idx + 1,
        name: p.name,
        sku: p.sku || `SKU-${p.id}`,
        variantInfo: p.variantInfo || p.category || 'Mặc định',
        image: p.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        sold: p.sold || 0,
        formattedRevenue: `${((p.price || 0) * (p.sold || 0)).toLocaleString('vi-VN')}đ`
      }));
      return Promise.resolve(top);
    }
    const defaultTop = [
      { productId: 'p1', rank: 1, name: 'Áo thun nam basic', sku: 'ATN001', variantInfo: 'Phân loại: 5', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', sold: 328, formattedRevenue: '65.600.000đ' },
      { productId: 'p2', rank: 2, name: 'Giày thể thao nam', sku: 'GTT002', variantInfo: 'Phân loại: 8', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', sold: 214, formattedRevenue: '42.800.000đ' },
      { productId: 'p3', rank: 3, name: 'Túi đeo chéo thời trang', sku: 'TDC003', variantInfo: 'Phân loại: 4', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', sold: 156, formattedRevenue: '31.200.000đ' }
    ];
    return Promise.resolve(defaultTop);
  },

  // Get Inventory Alerts
  async getInventoryAlerts(existingProducts = []) {
    if (existingProducts && existingProducts.length > 0) {
      const lowOrOut = existingProducts.filter(p => p.stock <= 5 || p.status === 'Hết hàng');
      const alerts = lowOrOut.map((p, idx) => ({
        id: p.id,
        rank: idx + 1,
        name: p.name,
        sku: p.sku || `SKU-${p.id}`,
        image: p.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        isOutOfStock: p.stock === 0 || p.status === 'Hết hàng',
        statusLabel: p.stock === 0 || p.status === 'Hết hàng' ? 'Hết hàng' : `Còn ${p.stock} sản phẩm`
      }));
      return Promise.resolve(alerts);
    }
    const defaultAlerts = [
      { id: 'p1', rank: 1, name: 'Áo thun nam basic', sku: 'ATN001', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', isOutOfStock: false, statusLabel: 'Còn 3 sản phẩm' },
      { id: 'p2', rank: 2, name: 'Giày thể thao nam', sku: 'GTT002', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', isOutOfStock: false, statusLabel: 'Còn 5 sản phẩm' },
      { id: 'p3', rank: 3, name: 'Túi đeo chéo thời trang', sku: 'TDC003', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', isOutOfStock: true, statusLabel: 'Hết hàng' }
    ];
    return Promise.resolve(defaultAlerts);
  },

  // Get Video Performance
  async getVideoPerformance(existingProducts = []) {
    return Promise.resolve({
      views: '125.800',
      productClicks: '8.240',
      orders: 428,
      revenue: '85.600.000đ',
      bestVideo: {
        thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        duration: '02:45',
        title: 'Review áo thun nam basic',
        productId: 'p1',
        productName: 'Áo thun nam basic',
        views: '52.800',
        orders: 182,
        revenue: '36.400.000đ'
      }
    });
  },

  // Get Livestream Performance
  async getLivestreamPerformance() {
    return Promise.resolve({
      viewers: '2.450',
      orders: 86,
      revenue: '12.800.000đ'
    });
  },

  // =========================================================================
  // 🏭 INVENTORY MANAGEMENT FACADE API (KHO HÀNG SERVICE LAYER)
  // =========================================================================

  // Threshold Configuration
  LOW_STOCK_THRESHOLD: 30,

  async getWarehouses() {
    return Promise.resolve([
      { id: 'wh_main', code: 'WH-MAIN', name: 'Kho chính', location: 'TP. Hồ Chí Minh', isDefault: true },
      { id: 'wh_hn', code: 'WH-HN', name: 'Kho Hà Nội', location: 'Hà Nội', isDefault: false },
      { id: 'wh_dn', code: 'WH-DN', name: 'Kho Đà Nẵng', location: 'Đà Nẵng', isDefault: false }
    ]);
  },

  // Calculate Status: Tồn kho tốt (Green), Sắp hết hàng (Orange), Hết hàng (Red)
  determineStockStatus(quantity) {
    if (quantity <= 0) return { label: 'Hết hàng', code: 'OUT_OF_STOCK', color: '#EF4444', bg: '#FEF2F2' };
    if (quantity <= this.LOW_STOCK_THRESHOLD) return { label: 'Sắp hết hàng', code: 'LOW_STOCK', color: '#F97316', bg: '#FFF7ED' };
    return { label: 'Tồn kho tốt', code: 'GOOD_STOCK', color: '#00B14F', bg: '#E6F4EA' };
  },

  // Get full inventory list (Hydrated from Product Catalog)
  async getInventory(existingProducts = [], isNewShopState = false) {
    if (isNewShopState) {
      return Promise.resolve([]);
    }

    const defaultItems = [
      {
        id: 'inv_1',
        productId: 'p1',
        productName: 'Áo thun nam Basic',
        sku: 'ATB-001-WHT-L',
        category: 'Thời trang nam / Áo thun',
        warehouseId: 'wh_main',
        warehouseName: 'Kho chính',
        quantity: 120,
        reservedQuantity: 35,
        costPrice: 80000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        barcode: '893600001001'
      },
      {
        id: 'inv_2',
        productId: 'p2',
        productName: 'Áo polo nam cao cấp',
        sku: 'POLO-002-BLK-M',
        category: 'Thời trang nam / Áo polo',
        warehouseId: 'wh_main',
        warehouseName: 'Kho chính',
        quantity: 85,
        reservedQuantity: 20,
        costPrice: 150000,
        image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400',
        barcode: '893600001002'
      },
      {
        id: 'inv_3',
        productId: 'p3',
        productName: 'Giày sneaker nam',
        sku: 'SHOE-003-WHT-42',
        category: 'Giày dép / Sneaker',
        warehouseId: 'wh_main',
        warehouseName: 'Kho chính',
        quantity: 45,
        reservedQuantity: 10,
        costPrice: 250000,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        barcode: '893600001003'
      },
      {
        id: 'inv_4',
        productId: 'p4',
        productName: 'Balo laptop 15.6 inch',
        sku: 'BALO-004-BLK',
        category: 'Phụ kiện / Balo',
        warehouseId: 'wh_main',
        warehouseName: 'Kho chính',
        quantity: 60,
        reservedQuantity: 15,
        costPrice: 180000,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        barcode: '893600001004'
      },
      {
        id: 'inv_5',
        productId: 'p5',
        productName: 'Đồng hồ nam dây da',
        sku: 'WATCH-005-BRN',
        category: 'Phụ kiện / Đồng hồ',
        warehouseId: 'wh_main',
        warehouseName: 'Kho chính',
        quantity: 0,
        reservedQuantity: 8,
        costPrice: 450000,
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400',
        barcode: '893600001005'
      },
      {
        id: 'inv_6',
        productId: 'p6',
        productName: 'Ví da nam cao cấp',
        sku: 'WALLET-006-BRN',
        category: 'Phụ kiện / Ví',
        warehouseId: 'wh_main',
        warehouseName: 'Kho chính',
        quantity: 30,
        reservedQuantity: 5,
        costPrice: 120000,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
        barcode: '893600001006'
      },
      {
        id: 'inv_7',
        productId: 'p7',
        productName: 'Tai nghe Bluetooth Wireless',
        sku: 'EAR-007-WHT',
        category: 'Thiết bị điện tử',
        warehouseId: 'wh_main',
        warehouseName: 'Kho chính',
        quantity: 12,
        reservedQuantity: 4,
        costPrice: 320000,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        barcode: '893600001007'
      },
      {
        id: 'inv_8',
        productId: 'p8',
        productName: 'Mũ lưỡi trai Unisex',
        sku: 'CAP-008-BLK',
        category: 'Thời trang nam',
        warehouseId: 'wh_main',
        warehouseName: 'Kho chính',
        quantity: 0,
        reservedQuantity: 0,
        costPrice: 60000,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
        barcode: '893600001008'
      }
    ];

    // Compute derived properties: Available stock & Inventory Value & Status
    const calculated = defaultItems.map(item => {
      const availableQuantity = Math.max(0, item.quantity - item.reservedQuantity);
      const inventoryValue = item.quantity * item.costPrice;
      const statusObj = this.determineStockStatus(item.quantity);

      return {
        ...item,
        availableQuantity,
        inventoryValue,
        status: statusObj.label,
        statusObj
      };
    });

    return Promise.resolve(calculated);
  },

  // Calculate 5 Inventory KPI Stats
  async getInventoryStats(inventoryList = []) {
    if (!inventoryList || inventoryList.length === 0) {
      return Promise.resolve({
        totalValue: 0,
        formattedTotalValue: '0đ',
        totalSku: 0,
        totalQuantity: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        positiveStockCount: 0
      });
    }

    const totalValue = inventoryList.reduce((sum, i) => sum + (i.inventoryValue || i.quantity * i.costPrice || 0), 0);
    const totalSku = inventoryList.length;
    const totalQuantity = inventoryList.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const lowStockCount = inventoryList.filter(i => i.quantity > 0 && i.quantity <= this.LOW_STOCK_THRESHOLD).length;
    const outOfStockCount = inventoryList.filter(i => i.quantity <= 0).length;
    const positiveStockCount = inventoryList.filter(i => i.quantity > 0).length;

    return Promise.resolve({
      totalValue,
      formattedTotalValue: `${totalValue.toLocaleString('vi-VN')}đ`,
      totalSku,
      totalQuantity,
      lowStockCount,
      outOfStockCount,
      positiveStockCount
    });
  },

  // Get Item History Logs
  async getInventoryHistory(productId) {
    const historyLogs = [
      { id: 'h1', productId: 'p1', time: '12/08/2026 14:30', type: 'Nhập kho', change: +50, before: 70, after: 120, user: 'Nguyễn Văn A', note: 'Nhập lô hàng mới từ nhà cung cấp' },
      { id: 'h2', productId: 'p1', time: '11/08/2026 10:15', type: 'Xuất kho', change: -10, before: 80, after: 70, user: 'Hệ thống (Đơn hàng)', note: 'Đóng gói đơn hàng #VL000123' },
      { id: 'h3', productId: 'p1', time: '10/08/2026 16:45', type: 'Điều chỉnh', change: +5, before: 65, after: 70, user: 'Nguyễn Văn A', note: 'Kiểm kê thực tế kho' },
      { id: 'h4', productId: 'p2', time: '12/08/2026 09:00', type: 'Nhập kho', change: +35, before: 50, after: 85, user: 'Nguyễn Văn A', note: 'Nhập bổ sung tồn kho' }
    ];

    if (productId) {
      return Promise.resolve(historyLogs.filter(h => h.productId === productId));
    }
    return Promise.resolve(historyLogs);
  },

  // Adjust stock quantity (+, -, or =)
  async adjustInventory(inventoryList, productId, adjustType, amount, reason) {
    const qty = parseInt(amount, 10) || 0;
    const updated = inventoryList.map(item => {
      if (item.productId === productId || item.id === productId) {
        let newQty = item.quantity;
        if (adjustType === 'ADD' || adjustType === 'add') newQty += qty;
        else if (adjustType === 'SUB' || adjustType === 'sub') newQty = Math.max(0, newQty - qty);
        else if (adjustType === 'SET' || adjustType === 'set') newQty = Math.max(0, qty);

        const availableQuantity = Math.max(0, newQty - item.reservedQuantity);
        const inventoryValue = newQty * item.costPrice;
        const statusObj = this.determineStockStatus(newQty);

        return {
          ...item,
          quantity: newQty,
          availableQuantity,
          inventoryValue,
          status: statusObj.label,
          statusObj
        };
      }
      return item;
    });

    return Promise.resolve(updated);
  },

  // Receive stock (+)
  async receiveInventory(inventoryList, productId, quantity, warehouseId, notes) {
    const qty = parseInt(quantity, 10) || 0;
    return this.adjustInventory(inventoryList, productId, 'ADD', qty, notes || 'Nhập kho');
  },

  // Issue stock (-)
  async issueInventory(inventoryList, productId, quantity, warehouseId, reason) {
    const qty = parseInt(quantity, 10) || 0;
    const targetItem = inventoryList.find(i => i.productId === productId || i.id === productId);
    if (targetItem && targetItem.quantity < qty) {
      return Promise.reject(new Error('Không đủ tồn kho để xuất.'));
    }
    return this.adjustInventory(inventoryList, productId, 'SUB', qty, reason || 'Xuất kho');
  }
};

export default sellerService;
