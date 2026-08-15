/**
 * Service Layer Abstraction for Seller Center
 * Decouples UI components from data fetching.
 * Seamlessly resolves state: New Seller (Empty State) -> Active Shop (Real Data).
 */

// Sample Demo Orders Dataset for Active Shop Testing
export const MOCK_ORDERS_DEMO = [
  {
    id: 'ord_1',
    code: '#VL000123',
    date: '15/08/2026 10:30',
    status: 'Chờ xác nhận',
    hasNewChat: true,
    countdownTimer: '12:30:45',
    warehouse: 'Kho Tổng Hà Nội',
    customer: {
      name: 'Nguyễn Văn B',
      phone: '0901 234 567',
      address: '123 Nguyễn Văn Linh, Quận Long Biên, Hà Nội',
      city: 'Hà Nội'
    },
    items: [
      {
        productId: 'p1',
        name: 'Áo thun Basic Nam Cotton 100%',
        variant: 'Trắng - M',
        sku: 'ATB-WHT-M',
        price: 299000,
        quantity: 1,
        total: 299000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'
      }
    ],
    summary: {
      subtotal: 299000,
      shippingFee: 25000,
      discount: -25000,
      total: 299000,
      paymentMethod: 'COD',
      paymentStatus: 'Chưa thanh toán'
    },
    shipping: {
      provider: 'Viettel Post',
      providerName: 'Viettel Post',
      service: 'Giao tiêu chuẩn',
      trackingNo: 'VTP882910394VN'
    }
  },
  {
    id: 'ord_2',
    code: '#VL000124',
    date: '15/08/2026 09:15',
    status: 'Chờ đóng gói',
    hasNewChat: false,
    countdownTimer: '08:45:10',
    warehouse: 'Kho Tổng TP.HCM',
    customer: {
      name: 'Trần Văn Minh',
      phone: '0987 654 321',
      address: '456 Lê Duẩn, Quận 1, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh'
    },
    items: [
      {
        productId: 'p2',
        name: 'Chuột Gaming Không Dây Ergonomic',
        variant: 'Đen nhám',
        sku: 'MS-G102-BLK',
        price: 450000,
        quantity: 1,
        total: 450000,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300'
      }
    ],
    summary: {
      subtotal: 450000,
      shippingFee: 20000,
      discount: 0,
      total: 470000,
      paymentMethod: 'Ví V-life',
      paymentStatus: 'Đã thanh toán'
    },
    shipping: {
      provider: 'GHN',
      providerName: 'Giao Hàng Nhanh',
      service: 'Giao siêu tốc',
      trackingNo: 'GHN992837411VN'
    }
  },
  {
    id: 'ord_3',
    code: '#VL000125',
    date: '14/08/2026 18:40',
    status: 'Chờ bàn giao',
    hasNewChat: true,
    warehouse: 'Kho Tổng Hà Nội',
    customer: {
      name: 'Phạm Hồng Nhung',
      phone: '0912 888 999',
      address: '78 Phố Huế, Quận Hai Bà Trưng, Hà Nội',
      city: 'Hà Nội'
    },
    items: [
      {
        productId: 'p3',
        name: 'Mũ lưỡi trai phong cách Vintage',
        variant: 'Be đậm',
        sku: 'CAP-VTG-BE',
        price: 129000,
        quantity: 2,
        total: 258000,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300'
      }
    ],
    summary: {
      subtotal: 258000,
      shippingFee: 15000,
      discount: -15000,
      total: 258000,
      paymentMethod: 'Ví V-life',
      paymentStatus: 'Đã thanh toán'
    },
    shipping: {
      provider: 'J&T',
      providerName: 'J&T Express',
      service: 'Giao nhanh 24h',
      trackingNo: 'JT773829104VN'
    }
  },
  {
    id: 'ord_4',
    code: '#VL000126',
    date: '14/08/2026 14:20',
    status: 'Đang giao',
    hasNewChat: false,
    warehouse: 'Kho Đà Nẵng',
    customer: {
      name: 'Lê Thu Hà',
      phone: '0966 112 233',
      address: '789 Nguyễn Văn Linh, Quận Thanh Khê, Đà Nẵng',
      city: 'Đà Nẵng'
    },
    items: [
      {
        productId: 'p4',
        name: 'Balo Laptop Chống Nước 15.6 inch',
        variant: 'Xám Titan',
        sku: 'BALO-156-GRY',
        price: 399000,
        quantity: 1,
        total: 399000,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300'
      }
    ],
    summary: {
      subtotal: 399000,
      shippingFee: 30000,
      discount: 0,
      total: 429000,
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
    id: 'ord_5',
    code: '#VL000127',
    date: '13/08/2026 11:30',
    status: 'Hoàn thành',
    hasNewChat: false,
    warehouse: 'Kho Tổng TP.HCM',
    customer: {
      name: 'Nguyễn Hoàng Long',
      phone: '0909 888 777',
      address: '321 3 Tháng 2, Quận Ninh Kiều, Cần Thơ',
      city: 'Cần Thơ'
    },
    items: [
      {
        productId: 'p5',
        name: 'Tai nghe Bluetooth True Wireless Bass Boost',
        variant: 'Trắng Pearl',
        sku: 'EAR-TWS-WHT',
        price: 450000,
        quantity: 1,
        total: 450000,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300'
      }
    ],
    summary: {
      subtotal: 450000,
      shippingFee: 20000,
      discount: -20000,
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
    id: 'ord_6',
    code: '#VL000128',
    date: '12/08/2026 16:50',
    status: 'Đã hủy',
    cancelReason: 'Khách hàng đổi ý muốn đổi size sản phẩm',
    warehouse: 'Kho Tổng Hà Nội',
    customer: {
      name: 'Đỗ Văn Nam',
      phone: '0877 456 789',
      address: '55 Hoàng Quốc Việt, Quận Cầu Giấy, Hà Nội',
      city: 'Hà Nội'
    },
    items: [
      {
        productId: 'p6',
        name: 'Sạc Dự Phòng 20000mAh Sạc Nhanh 22.5W',
        variant: 'Đen Matte',
        sku: 'PB-20K-BLK',
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
      paymentStatus: 'Đã hoàn tiền vào ví'
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
    code: '#VL000129',
    date: '12/08/2026 08:15',
    status: 'Trả hàng / Hoàn tiền',
    returnReason: 'Sản phẩm lỗi kết nối Bluetooth',
    returnStatus: 'Chờ Shop kiểm tra hàng hoàn',
    warehouse: 'Kho Tổng TP.HCM',
    customer: {
      name: 'Phạm Thị Mai',
      phone: '0388 999 666',
      address: '159 Trần Phú, Quận Ngô Quyền, Hải Phòng',
      city: 'Hải Phòng'
    },
    items: [
      {
        productId: 'p7',
        name: 'Đồng Hồ Thông Minh Sport Theo Dõi Sức Khỏe',
        variant: 'Dây Silicon Đen',
        sku: 'SW-SPORT-BLK',
        price: 680000,
        quantity: 1,
        total: 680000,
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300'
      }
    ],
    summary: {
      subtotal: 680000,
      shippingFee: 25000,
      discount: -50000,
      total: 655000,
      paymentMethod: 'Ví V-life',
      paymentStatus: 'Tạm giữ tiền hoàn'
    },
    shipping: {
      provider: 'GHN',
      providerName: 'Giao Hàng Nhanh',
      service: 'Thu hồi hàng hoàn',
      trackingNo: 'GHN-RET-992182VN'
    }
  },
  {
    id: 'ord_8',
    code: '#VL000130',
    date: '11/08/2026 21:00',
    status: 'Hoàn thành',
    hasNewChat: false,
    warehouse: 'Kho Tổng Hà Nội',
    customer: {
      name: 'Hoàng Thu Hiền',
      phone: '0912 345 678',
      address: '88 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
      city: 'Hà Nội'
    },
    items: [
      {
        productId: 'p8',
        name: 'Giày Thể Thao Nam Runner Pro Max Êm Ái',
        variant: 'Đen - 42',
        sku: 'SH-RUN-42B',
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

// =========================================================================
// 1️⃣ DASHBOARD DATA SERVICE (REALTIME MOCK PERSISTENCE & ANALYTICS)
// =========================================================================

// Fetch KPI Top Summary Cards
export const sellerService = {
  async getShopInfo() {
    return Promise.resolve({ ...newSellerDb.shopInfo });
  },

  async getKpiMetrics(period = 'today', existingOrders = [], existingProducts = []) {
    if ((!existingOrders || existingOrders.length === 0) && (!existingProducts || existingProducts.length === 0)) {
      return Promise.resolve({
        revenue: { formatted: '0đ', changePercent: 0, isPositive: true },
        orders: { formatted: '0', changePercent: 0, isPositive: true },
        pending: { formatted: '0', diffCount: 0, isPositive: true },
        itemsSold: { formatted: '0', changePercent: 0, isPositive: true },
        customers: { formatted: '0', changePercent: 0, isPositive: true }
      });
    }
    return Promise.resolve(newSellerDb.kpiMetrics[period] || newSellerDb.kpiMetrics.today);
  },

  // Fetch Pending Action Items (Requirement 4 & 20)
  async getPendingActions(existingOrders = [], unreadMessageCount = 8) {
    if (!existingOrders || existingOrders.length === 0) {
      return Promise.resolve([
        { id: 'pending_confirm', title: 'Đơn chờ xác nhận', count: 0, targetTab: 'orders', orderFilter: 'Chờ xác nhận' },
        { id: 'pending_pack', title: 'Đơn chờ đóng gói', count: 0, targetTab: 'orders', orderFilter: 'Chờ đóng gói' },
        { id: 'pending_handover', title: 'Đơn chờ bàn giao', count: 0, targetTab: 'orders', orderFilter: 'Chờ bàn giao' },
        { id: 'returns', title: 'Yêu cầu trả hàng', count: 0, targetTab: 'orders', orderFilter: 'Trả hàng' },
        { id: 'unread_chats', title: 'Tin nhắn chưa trả lời', count: unreadMessageCount, targetTab: 'messages', orderFilter: 'unread' }
      ]);
    }
    return Promise.resolve([
      { id: 'pending_confirm', title: 'Đơn chờ xác nhận', count: 24, targetTab: 'orders', orderFilter: 'Chờ xác nhận' },
      { id: 'pending_pack', title: 'Đơn chờ đóng gói', count: 12, targetTab: 'orders', orderFilter: 'Chờ đóng gói' },
      { id: 'pending_handover', title: 'Đơn chờ bàn giao', count: 8, targetTab: 'orders', orderFilter: 'Chờ bàn giao' },
      { id: 'returns', title: 'Yêu cầu trả hàng', count: 3, targetTab: 'orders', orderFilter: 'Trả hàng' },
      { id: 'unread_chats', title: 'Tin nhắn chưa trả lời', count: unreadMessageCount, targetTab: 'messages', orderFilter: 'unread' }
    ]);
  },

  // Fetch Revenue Chart Data (Requirement 12)
  async getRevenueChartData(days = 7, existingOrders = []) {
    if (!existingOrders || existingOrders.length === 0) {
      return Promise.resolve({
        totalRevenue: 0,
        formattedRevenue: '0đ',
        growthPercent: null,
        days,
        points: []
      });
    }
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

  // Get Recent Orders (Requirement 13)
  async getRecentOrders(existingOrders = [], limit = 5) {
    if (!existingOrders || existingOrders.length === 0) {
      return Promise.resolve([]);
    }
    const formatted = existingOrders.slice(0, limit).map((o, idx) => {
      const customerName = typeof o.customer === 'object' 
        ? (o.customer?.name || o.customer?.fullName || 'Khách hàng') 
        : (o.customer || 'Khách hàng');
      const avatar = (typeof o.customer === 'object' ? o.customer?.avatar : o.avatar) 
        || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`;
      const itemCount = o.products?.length || o.itemCount || 1;
      const totalAmount = typeof o.total === 'number' ? o.total : (o.summary?.totalAmount || o.totalAmount || 0);
      return {
        id: o.code || o.id || `#VL00012${idx}`,
        orderId: o.id || `ord_${idx}`,
        customer: customerName,
        avatar: avatar,
        items: `${itemCount} sản phẩm`,
        itemCount: itemCount,
        total: totalAmount,
        date: o.date || o.createdAt || '12/08/2026',
        status: o.status || 'Chờ xác nhận'
      };
    });
    return Promise.resolve(formatted);
  },

  // FINANCIAL OVERVIEW
  async getFinancialOverview(existingOrders = []) {
    if (existingOrders && existingOrders.length > 0) {
      return Promise.resolve({
        availableBalance: 18500000,
        formattedAvailable: '18.500.000đ',
        pendingReconciliation: 5200000,
        formattedPending: '5.200.000đ',
        settlementDate: '15/08/2026',
        monthlyRevenue: 125800000,
        formattedMonthly: '125.800.000đ',
        monthlyGrowth: '+18,6%',
        totalRevenue: 1268400000,
        formattedTotal: '1.268.400.000đ',
        commissionRate: 8,
        formattedCommission: '8%',
        hasBankAccount: true
      });
    }
    return Promise.resolve({
      availableBalance: 18500000,
      formattedAvailable: '18.500.000đ',
      pendingReconciliation: 5200000,
      formattedPending: '5.200.000đ',
      settlementDate: '15/08/2026',
      monthlyRevenue: 125800000,
      formattedMonthly: '125.800.000đ',
      monthlyGrowth: '+18,6%',
      totalRevenue: 1268400000,
      formattedTotal: '1.268.400.000đ',
      commissionRate: 8,
      formattedCommission: '8%',
      hasBankAccount: true
    });
  },

  // REVENUE SOURCES BREAKDOWN (DONUT CHART DATA)
  async getRevenueSources(isNewShopState = false) {
    if (isNewShopState) {
      return Promise.resolve({
        totalAmount: 0,
        formattedTotal: '0đ',
        sources: [
          { id: 'product', name: 'Sản phẩm', percent: 0, amount: 0, formattedAmount: '0đ', color: '#00B14F' },
          { id: 'livestream', name: 'Livestream', percent: 0, amount: 0, formattedAmount: '0đ', color: '#1877F2' },
          { id: 'video', name: 'Video', percent: 0, amount: 0, formattedAmount: '0đ', color: '#F97316' },
          { id: 'other', name: 'Khác', percent: 0, amount: 0, formattedAmount: '0đ', color: '#9333EA' }
        ]
      });
    }

    return Promise.resolve({
      totalAmount: 125800000,
      formattedTotal: '125.800.000đ',
      sources: [
        { id: 'product', name: 'Sản phẩm', percent: 78.2, amount: 98400000, formattedAmount: '98.400.000đ', color: '#00B14F' },
        { id: 'livestream', name: 'Livestream', percent: 12.6, amount: 15900000, formattedAmount: '15.900.000đ', color: '#1877F2' },
        { id: 'video', name: 'Video', percent: 6.3, amount: 7900000, formattedAmount: '7.900.000đ', color: '#F97316' },
        { id: 'other', name: 'Khác', percent: 2.9, amount: 3600000, formattedAmount: '3.600.000đ', color: '#9333EA' }
      ]
    });
  },

  // RECENT TRANSACTIONS LIST
  async getRecentTransactions(isNewShopState = false) {
    if (isNewShopState) {
      return Promise.resolve([]);
    }

    return Promise.resolve([
      {
        id: 'tx_1',
        time: '12/08/2026 14:30',
        content: 'Đơn hàng #VL000128',
        type: 'Doanh thu đơn hàng',
        typeCode: 'REVENUE',
        amount: 458000,
        isPositive: true,
        formattedAmount: '+458.000đ',
        status: 'Thành công',
        statusClass: 'success'
      },
      {
        id: 'tx_2',
        time: '12/08/2026 10:15',
        content: 'Phí vận chuyển #VL000127',
        type: 'Phí vận chuyển',
        typeCode: 'SHIPPING_FEE',
        amount: -32000,
        isPositive: false,
        formattedAmount: '-32.000đ',
        status: 'Thành công',
        statusClass: 'success'
      },
      {
        id: 'tx_3',
        time: '11/08/2026 22:10',
        content: 'Rút tiền về tài khoản ngân hàng',
        type: 'Rút tiền',
        typeCode: 'WITHDRAW',
        amount: -8000000,
        isPositive: false,
        formattedAmount: '-8.000.000đ',
        status: 'Thành công',
        statusClass: 'success'
      },
      {
        id: 'tx_4',
        time: '11/08/2026 16:45',
        content: 'Phí hoa hồng đơn hàng #VL000126',
        type: 'Phí hoa hồng',
        typeCode: 'COMMISSION_FEE',
        amount: -22500,
        isPositive: false,
        formattedAmount: '-22.500đ',
        status: 'Thành công',
        statusClass: 'success'
      },
      {
        id: 'tx_5',
        time: '11/08/2026 09:20',
        content: 'Đối soát doanh thu tuần 32',
        type: 'Đối soát',
        typeCode: 'SETTLEMENT',
        amount: 5200000,
        isPositive: true,
        formattedAmount: '+5.200.000đ',
        status: 'Chờ chuyển',
        statusClass: 'pending'
      }
    ]);
  },

  // SETTLEMENT CYCLE INFO
  async getSettlementInfo(isNewShopState = false) {
    if (isNewShopState) {
      return Promise.resolve({
        cycleName: 'Chu kỳ hiện tại (Tuần 33)',
        dateRange: '05/08/2026 - 11/08/2026',
        revenue: 0,
        formattedRevenue: '0đ',
        fee: 0,
        formattedFee: '0đ',
        netAmount: 0,
        formattedNetAmount: '0đ',
        payoutDate: '15/08/2026',
        steps: [
          { label: 'Đang đối soát', date: '11/08', status: 'current' },
          { label: 'Đã đối soát', date: '12/08', status: 'upcoming' },
          { label: 'Chờ chuyển khoản', date: '15/08', status: 'upcoming' },
          { label: 'Đã chuyển khoản', date: '15/08', status: 'upcoming' }
        ]
      });
    }

    return Promise.resolve({
      cycleName: 'Chu kỳ hiện tại (Tuần 33)',
      dateRange: '05/08/2026 - 11/08/2026',
      revenue: 5200000,
      formattedRevenue: '5.200.000đ',
      fee: -520000,
      formattedFee: '-520.000đ',
      netAmount: 4680000,
      formattedNetAmount: '4.680.000đ',
      payoutDate: '15/08/2026',
      steps: [
        { label: 'Đang đối soát', date: '11/08', status: 'completed' },
        { label: 'Đã đối soát', date: '12/08', status: 'completed' },
        { label: 'Chờ chuyển khoản', date: '15/08', status: 'current' },
        { label: 'Đã chuyển khoản', date: '15/08', status: 'upcoming' }
      ]
    });
  },

  // PROCESS WITHDRAWAL MOCK
  async processWithdrawal(amount) {
    const num = Number(amount) || 0;
    return Promise.resolve({
      success: true,
      message: `Đã gửi yêu cầu rút ${num.toLocaleString('vi-VN')}đ thành công. Tiền sẽ được chuyển về tài khoản ngân hàng của bạn trong 24h.`,
      newBalance: 18500000 - num,
      formattedNewBalance: `${(18500000 - num).toLocaleString('vi-VN')}đ`
    });
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
    const packing = ordersList.filter(o => o.status === 'Chờ đóng gói' || o.status === 'Chờ lấy hàng').length;
    const handover = ordersList.filter(o => o.status === 'Chờ bàn giao').length;
    const delivering = ordersList.filter(o => o.status === 'Đang giao').length;
    const delivered = ordersList.filter(o => o.status === 'Đã giao').length;
    const completed = ordersList.filter(o => o.status === 'Hoàn thành').length;
    const cancelled = ordersList.filter(o => o.status === 'Đã hủy').length;
    const returned = ordersList.filter(o => o.status === 'Trả hàng/Hoàn tiền' || o.status === 'Trả hàng' || o.status === 'Đã hoàn tiền').length;

    return Promise.resolve({
      total,
      confirm,
      packing,
      handover,
      delivering,
      delivered,
      completed,
      cancelled,
      returned
    });
  },

  // Get Orders Filtered
  async getOrders(ordersList = [], filters = {}) {
    return this.filterOrders(ordersList, filters);
  },

  // Get Orders By Status
  async getOrdersByStatus(ordersList = [], status = 'all') {
    if (!status || status === 'all' || status === 'Tất cả') {
      return Promise.resolve([...ordersList]);
    }
    const filtered = ordersList.filter(o => o.status === status);
    return Promise.resolve(filtered);
  },

  // Search Orders by orderId, customerName, or productName
  async searchOrders(ordersList = [], query = '') {
    if (!query || query.trim() === '') {
      return Promise.resolve([...ordersList]);
    }
    const q = query.toLowerCase().trim();
    const result = ordersList.filter(o => {
      const matchCode = (o.code && o.code.toLowerCase().includes(q)) || (o.id && o.id.toLowerCase().includes(q));
      const matchCustName = o.customer?.name && o.customer.name.toLowerCase().includes(q);
      const matchPhone = o.customer?.phone && o.customer.phone.includes(q);
      const matchProdName = o.items && o.items.some(it => it.name && it.name.toLowerCase().includes(q));
      return matchCode || matchCustName || matchPhone || matchProdName;
    });
    return Promise.resolve(result);
  },

  // Comprehensive Multi-Criteria Filter
  async filterOrders(ordersList = [], filters = {}) {
    const { 
      tab = 'all', 
      query = '', 
      provider = 'Tất cả',
      status = 'Tất cả',
      paymentMethod = 'Tất cả',
      warehouse = 'Tất cả'
    } = filters;

    let list = [...ordersList];

    // Status Tab Filtering
    if (tab === 'confirm') list = list.filter(o => o.status === 'Chờ xác nhận');
    if (tab === 'packing') list = list.filter(o => o.status === 'Chờ đóng gói' || o.status === 'Chờ lấy hàng');
    if (tab === 'handover') list = list.filter(o => o.status === 'Chờ bàn giao');
    if (tab === 'delivering') list = list.filter(o => o.status === 'Đang giao');
    if (tab === 'delivered') list = list.filter(o => o.status === 'Đã giao');
    if (tab === 'completed') list = list.filter(o => o.status === 'Hoàn thành');
    if (tab === 'cancelled') list = list.filter(o => o.status === 'Đã hủy');
    if (tab === 'returned') list = list.filter(o => o.status === 'Trả hàng/Hoàn tiền' || o.status === 'Trả hàng' || o.status === 'Trả hàng / Hoàn tiền' || o.status === 'Đã hoàn tiền');

    // Status dropdown filter
    if (status && status !== 'Tất cả') {
      list = list.filter(o => o.status === status);
    }

    // Payment Method Filter
    if (paymentMethod && paymentMethod !== 'Tất cả') {
      list = list.filter(o => o.summary?.paymentMethod === paymentMethod);
    }

    // Warehouse Filter
    if (warehouse && warehouse !== 'Tất cả') {
      list = list.filter(o => o.warehouse === warehouse);
    }

    // Shipping Provider Filter
    if (provider && provider !== 'Tất cả' && provider !== 'Tất cả vận chuyển') {
      list = list.filter(o => o.shipping?.provider === provider || o.shipping?.providerName === provider);
    }

    // Search Query (Code, Customer name, Phone, Product name)
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(o => {
        const matchCode = (o.code && o.code.toLowerCase().includes(q)) || (o.id && o.id.toLowerCase().includes(q));
        const matchCustName = o.customer?.name && o.customer.name.toLowerCase().includes(q);
        const matchPhone = o.customer?.phone && o.customer.phone.includes(q);
        const matchProdName = o.items && o.items.some(it => it.name && it.name.toLowerCase().includes(q));
        return matchCode || matchCustName || matchPhone || matchProdName;
      });
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

  // PRODUCT DRAFT MANAGEMENT FACADE API
  _productDrafts: {},

  async createProductDraft(data = {}) {
    const draftId = data.id || `draft_${Date.now()}`;
    const draft = {
      id: draftId,
      status: 'DRAFT',
      name: data.name || '',
      category: data.category || '',
      brand: data.brand || 'Không có thương hiệu',
      description: data.description || '',
      images: data.images || [],
      videos: data.videos || [],
      price: data.price || 0,
      stock: data.stock || 0,
      currentStep: data.currentStep || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    this._productDrafts[draftId] = draft;
    return Promise.resolve(draft);
  },

  async updateProductDraft(draftId, data = {}) {
    if (!this._productDrafts[draftId]) {
      return this.createProductDraft({ id: draftId, ...data });
    }
    this._productDrafts[draftId] = {
      ...this._productDrafts[draftId],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(this._productDrafts[draftId]);
  },

  async getProductDraft(draftId) {
    return Promise.resolve(this._productDrafts[draftId] || null);
  },

  async validateProductDraft(data = {}) {
    const errors = {};
    if (!data.name || !data.name.trim()) {
      errors.name = 'Vui lòng nhập tên sản phẩm.';
    } else if (data.name.trim().length > 120) {
      errors.name = 'Tên sản phẩm không được vượt quá 120 ký tự.';
    }

    if (!data.category || !data.category.trim() || data.category === 'Chọn danh mục' || data.category === 'Tất cả') {
      errors.category = 'Vui lòng chọn danh mục.';
    }

    if (!data.images || data.images.length === 0) {
      errors.images = 'Vui lòng thêm ít nhất 1 hình ảnh.';
    }

    const isValid = Object.keys(errors).length === 0;
    return Promise.resolve({ isValid, errors });
  },

  async publishProduct(draftId, existingProducts = []) {
    const draft = this._productDrafts[draftId];
    if (!draft) {
      return Promise.reject(new Error('Bản nháp không tồn tại.'));
    }
    const validation = await this.validateProductDraft(draft);
    if (!validation.isValid) {
      return Promise.reject(new Error('Thông tin sản phẩm chưa đầy đủ.'));
    }

    const newProduct = {
      id: `prod_${Date.now()}`,
      name: draft.name,
      sku: draft.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      category: draft.category,
      brand: draft.brand || 'Không có thương hiệu',
      description: draft.description || '',
      price: Number(draft.price) || 0,
      origPrice: Number(draft.origPrice) || Number(draft.price) || 0,
      stock: Number(draft.stock) || 0,
      sold: 0,
      status: 'Đang bán',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      variants: draft.variants || 'Mặc định',
      image: draft.images && draft.images.length > 0 ? draft.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      images: draft.images || [],
      videos: draft.videos || []
    };

    delete this._productDrafts[draftId];
    return Promise.resolve(newProduct);
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

  async hideProduct(productsList = [], productId) {
    const updatedList = productsList.map(p => p.id === productId ? { ...p, status: 'Tạm ẩn' } : p);
    return Promise.resolve(updatedList);
  },

  async showProduct(productsList = [], productId) {
    const updatedList = productsList.map(p => p.id === productId ? { ...p, status: 'Đang bán' } : p);
    return Promise.resolve(updatedList);
  },

  async getProductVariants(productId) {
    return Promise.resolve([
      { id: `${productId}_v1`, productId, sku: `${productId}-BLK-S`, name: 'Màu Đen / Size S', price: 129000, stock: 40, sold: 120 },
      { id: `${productId}_v2`, productId, sku: `${productId}-BLK-M`, name: 'Màu Đen / Size M', price: 129000, stock: 50, sold: 210 },
      { id: `${productId}_v3`, productId, sku: `${productId}-WHT-L`, name: 'Màu Trắng / Size L', price: 129000, stock: 38, sold: 95 }
    ]);
  },

  async bulkUpdateProducts(productsList = [], productIds = [], action, value) {
    let updated = [...productsList];
    if (action === 'hide') {
      updated = updated.map(p => productIds.includes(p.id) ? { ...p, status: 'Tạm ẩn' } : p);
    } else if (action === 'show') {
      updated = updated.map(p => productIds.includes(p.id) ? { ...p, status: 'Đang bán' } : p);
    } else if (action === 'updatePrice' && value) {
      updated = updated.map(p => productIds.includes(p.id) ? { ...p, price: Number(value) } : p);
    } else if (action === 'updateStock' && value !== undefined) {
      updated = updated.map(p => productIds.includes(p.id) ? { ...p, stock: Number(value) } : p);
    } else if (action === 'delete') {
      updated = updated.filter(p => !productIds.includes(p.id) || (p.sold && p.sold > 0));
      // Products with sold > 0 get hidden instead of deleted
      updated = updated.map(p => (productIds.includes(p.id) && p.sold > 0) ? { ...p, status: 'Tạm ẩn' } : p);
    }
    return Promise.resolve(updated);
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

  // Threshold Configuration (Requirement 12)
  LOW_STOCK_THRESHOLD: 5,

  async getWarehouses() {
    return Promise.resolve([
      { id: 'wh_hn', code: 'WH-HN', name: 'Kho Tổng Hà Nội', location: 'Hà Nội', isDefault: true },
      { id: 'wh_hcm', code: 'WH-HCM', name: 'Kho Tổng TP.HCM', location: 'TP. Hồ Chí Minh', isDefault: false },
      { id: 'wh_dn', code: 'WH-DN', name: 'Kho Đà Nẵng', location: 'Đà Nẵng', isDefault: false }
    ]);
  },

  // Calculate Status: Còn hàng (Green), Sắp hết (Orange), Hết hàng (Red)
  determineStockStatus(quantity) {
    if (quantity <= 0) return { label: 'Hết hàng', code: 'OUT_OF_STOCK', color: '#EF4444', bg: '#FEF2F2', icon: '🔴' };
    if (quantity <= this.LOW_STOCK_THRESHOLD) return { label: 'Sắp hết', code: 'LOW_STOCK', color: '#F97316', bg: '#FFF7ED', icon: '🟠' };
    return { label: 'Còn hàng', code: 'GOOD_STOCK', color: '#00B14F', bg: '#E6F4EA', icon: '🟢' };
  },

  // Get full inventory list (Referencing strictly from Product Catalog without duplicating catalog)
  async getInventory(existingProducts = [], isNewShopState = false) {
    if (isNewShopState || !existingProducts || existingProducts.length === 0) {
      return Promise.resolve([]);
    }

    const calculated = existingProducts.map(prod => {
      const quantity = typeof prod.stock === 'number' ? prod.stock : 100;
      const reservedQuantity = prod.reservedStock || (quantity > 10 ? 5 : (quantity > 0 ? 1 : 0));
      const availableQuantity = Math.max(0, quantity - reservedQuantity);
      const statusObj = this.determineStockStatus(quantity);

      return {
        id: `inv_${prod.id}`,
        productId: prod.id,
        sku: prod.sku || `SKU-${prod.id}`,
        warehouse: prod.warehouse || 'Kho Tổng Hà Nội',
        quantity,
        physicalStock: quantity,
        reservedQuantity,
        reservedStock: reservedQuantity,
        availableQuantity,
        availableStock: availableQuantity,
        sold: prod.sold || 0,
        status: statusObj.label,
        statusObj,
        updatedAt: prod.updatedAt || '15/08/2026'
      };
    });

    return Promise.resolve(calculated);
  },

  // Get Inventory By Product ID
  async getInventoryByProductId(productId, inventoryList = []) {
    const found = inventoryList.find(i => i.productId === productId);
    return Promise.resolve(found || null);
  },

  // Search Inventory by productId, productName, or SKU
  async searchInventory(inventoryList = [], query = '', existingProducts = []) {
    if (!query || query.trim() === '') {
      return Promise.resolve([...inventoryList]);
    }
    const q = query.toLowerCase().trim();
    const result = inventoryList.filter(item => {
      const prod = existingProducts.find(p => p.id === item.productId) || {};
      const matchPid = item.productId && item.productId.toLowerCase().includes(q);
      const matchSku = item.sku && item.sku.toLowerCase().includes(q);
      const matchName = prod.name && prod.name.toLowerCase().includes(q);
      return matchPid || matchSku || matchName;
    });
    return Promise.resolve(result);
  },

  // Comprehensive Multi-Criteria Filter for Inventory
  async filterInventory(inventoryList = [], filters = {}, existingProducts = []) {
    const {
      query = '',
      status = 'Tất cả',
      category = 'Tất cả',
      warehouse = 'Tất cả',
      stockRange = 'Tất cả'
    } = filters;

    let list = [...inventoryList];

    // Status filter (Còn hàng, Sắp hết, Hết hàng)
    if (status && status !== 'Tất cả') {
      if (status === 'Còn hàng') list = list.filter(i => (i.quantity || i.physicalStock || 0) > this.LOW_STOCK_THRESHOLD);
      else if (status === 'Sắp hết' || status === 'Sắp hết hàng') list = list.filter(i => (i.quantity || i.physicalStock || 0) > 0 && (i.quantity || i.physicalStock || 0) <= this.LOW_STOCK_THRESHOLD);
      else if (status === 'Hết hàng') list = list.filter(i => (i.quantity || i.physicalStock || 0) === 0);
    }

    // Category filter (lookup from existingProducts)
    if (category && category !== 'Tất cả' && category !== 'Tất cả danh mục') {
      list = list.filter(item => {
        const prod = existingProducts.find(p => p.id === item.productId) || {};
        return prod.category === category;
      });
    }

    // Warehouse filter
    if (warehouse && warehouse !== 'Tất cả' && warehouse !== 'Tất cả kho') {
      list = list.filter(item => item.warehouse === warehouse);
    }

    // Stock Range filter
    if (stockRange && stockRange !== 'Tất cả') {
      if (stockRange === 'under10') list = list.filter(i => (i.quantity || 0) < 10);
      else if (stockRange === '10to50') list = list.filter(i => (i.quantity || 0) >= 10 && (i.quantity || 0) <= 50);
      else if (stockRange === 'above50') list = list.filter(i => (i.quantity || 0) > 50);
    }

    // Search query (productId, productName, SKU)
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(item => {
        const prod = existingProducts.find(p => p.id === item.productId) || {};
        const matchPid = item.productId && item.productId.toLowerCase().includes(q);
        const matchSku = item.sku && item.sku.toLowerCase().includes(q);
        const matchName = prod.name && prod.name.toLowerCase().includes(q);
        return matchPid || matchSku || matchName;
      });
    }

    return Promise.resolve(list);
  },

  // Calculate 4 Inventory KPI Stats (Requirement 5)
  async getInventoryStats(inventoryList = []) {
    if (!inventoryList || inventoryList.length === 0) {
      return Promise.resolve({
        totalProducts: 0,
        inStockCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      });
    }

    const totalProducts = inventoryList.length;
    const inStockCount = inventoryList.filter(i => (i.quantity || i.physicalStock || 0) > this.LOW_STOCK_THRESHOLD).length;
    const lowStockCount = inventoryList.filter(i => (i.quantity || i.physicalStock || 0) > 0 && (i.quantity || i.physicalStock || 0) <= this.LOW_STOCK_THRESHOLD).length;
    const outOfStockCount = inventoryList.filter(i => (i.quantity || i.physicalStock || 0) === 0).length;

    return Promise.resolve({
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount
    });
  },

  // Receive stock (+) by SKU or productId (Requirement 10)
  async receiveInventory(inventoryList, skuOrProductId, quantity, reason = 'Nhập kho bổ sung') {
    const qty = parseInt(quantity, 10) || 0;
    const updated = inventoryList.map(item => {
      if (item.sku === skuOrProductId || item.productId === skuOrProductId || item.id === skuOrProductId) {
        const physicalStock = (item.physicalStock || item.quantity || 0) + qty;
        const reservedStock = item.reservedStock || item.reservedQuantity || 0;
        const availableStock = Math.max(0, physicalStock - reservedStock);
        const statusObj = this.determineStockStatus(physicalStock);
        return {
          ...item,
          physicalStock,
          quantity: physicalStock,
          availableStock,
          availableQuantity: availableStock,
          status: statusObj.label,
          statusObj,
          updatedAt: new Date().toLocaleDateString('vi-VN')
        };
      }
      return item;
    });
    return Promise.resolve(updated);
  },

  // Adjust stock quantity by SKU or productId (Requirement 11)
  async adjustInventory(inventoryList, skuOrProductId, adjustType, amount, reason = 'Kiểm kê thực tế') {
    const qty = parseInt(amount, 10) || 0;
    const updated = inventoryList.map(item => {
      if (item.sku === skuOrProductId || item.productId === skuOrProductId || item.id === skuOrProductId) {
        let physicalStock = item.physicalStock || item.quantity || 0;
        if (adjustType === 'ADD' || adjustType === 'add') physicalStock += qty;
        else if (adjustType === 'SUB' || adjustType === 'sub') physicalStock = Math.max(0, physicalStock - qty);
        else if (adjustType === 'SET' || adjustType === 'set') physicalStock = Math.max(0, qty);

        const reservedStock = item.reservedStock || item.reservedQuantity || 0;
        const availableStock = Math.max(0, physicalStock - reservedStock);
        const statusObj = this.determineStockStatus(physicalStock);
        return {
          ...item,
          physicalStock,
          quantity: physicalStock,
          availableStock,
          availableQuantity: availableStock,
          status: statusObj.label,
          statusObj,
          updatedAt: new Date().toLocaleDateString('vi-VN')
        };
      }
      return item;
    });
    return Promise.resolve(updated);
  },

  // Update Inventory directly
  async updateInventory(inventoryList, skuOrProductId, newQuantity) {
    return this.adjustInventory(inventoryList, skuOrProductId, 'SET', newQuantity, 'Cập nhật trực tiếp');
  },

  // Reserve Stock when Order is confirmed
  async reserveInventory(inventoryList, sku, qty = 1) {
    const updated = inventoryList.map(item => {
      if (item.sku === sku) {
        const reservedStock = (item.reservedStock || 0) + qty;
        const physicalStock = item.physicalStock || item.quantity || 0;
        const availableStock = Math.max(0, physicalStock - reservedStock);
        return { ...item, reservedStock, availableStock };
      }
      return item;
    });
    return Promise.resolve(updated);
  },

  // Release Reserved Stock when Order is cancelled
  async releaseInventory(inventoryList, sku, qty = 1) {
    const updated = inventoryList.map(item => {
      if (item.sku === sku) {
        const reservedStock = Math.max(0, (item.reservedStock || 0) - qty);
        const physicalStock = item.physicalStock || item.quantity || 0;
        const availableStock = Math.max(0, physicalStock - reservedStock);
        return { ...item, reservedStock, availableStock };
      }
      return item;
    });
    return Promise.resolve(updated);
  },

  // Commit Stock when Order is completed (Deduct physical & reserved stock)
  async commitInventory(inventoryList, sku, qty = 1) {
    const updated = inventoryList.map(item => {
      if (item.sku === sku) {
        const physicalStock = Math.max(0, (item.physicalStock || item.quantity || 0) - qty);
        const reservedStock = Math.max(0, (item.reservedStock || 0) - qty);
        const availableStock = Math.max(0, physicalStock - reservedStock);
        const soldQuantity = (item.soldQuantity || 0) + qty;
        return { ...item, physicalStock, quantity: physicalStock, reservedStock, availableStock, soldQuantity };
      }
      return item;
    });
    return Promise.resolve(updated);
  },

  // Get Inventory Transactions Log
  async getInventoryTransactions() {
    return Promise.resolve([
      { id: 'tx_101', time: '13/08/2026 09:30', productName: 'Áo thun nam basic', sku: 'ATB-BLK-M', type: 'Giữ hàng', typeCode: 'RESERVE', qty: -2, before: 130, after: 128, reason: 'Đơn hàng #VL000128', user: 'Hệ thống S-Shopping' },
      { id: 'tx_102', time: '12/08/2026 14:00', productName: 'Áo thun nam basic', sku: 'ATB-BLK-M', type: 'Nhập kho', typeCode: 'RECEIVE', qty: +50, before: 80, after: 130, reason: 'Nhập hàng từ NCC', user: 'Quản lý Kho' },
      { id: 'tx_103', time: '11/08/2026 16:20', productName: 'Giày Sneaker Unisex Sport', sku: 'GS-WHT-42', type: 'Điều chỉnh', typeCode: 'ADJUST', qty: -3, before: 45, after: 42, reason: 'Kiểm kê hư hỏng', user: 'Thủ kho' },
      { id: 'tx_104', time: '10/08/2026 10:15', productName: 'Sạc dự phòng 20000mAh', sku: 'SDP-20K-BLK', type: 'Xuất kho', typeCode: 'ISSUE', qty: -1, before: 15, after: 14, reason: 'Xuất bán đơn #SP250810-01', user: 'Shipper GHN' },
      { id: 'tx_105', time: '09/08/2026 15:45', productName: 'Áo sơ mi lụa nữ', sku: 'ASM-WHT-S', type: 'Hoàn hàng', typeCode: 'RETURN', qty: +1, before: 12, after: 13, reason: 'Khách hoàn trả đơn #VL000115', user: 'Hệ thống' }
    ]);
  },

  // =========================================================================
  // 🚚 SHIPPING MODULE FACADE API
  // =========================================================================

  // Calculate 5 Shipping KPI Overview Cards
  async getShippingOverview(shippingList = [], isNewShopState = false) {
    if (isNewShopState || !shippingList || shippingList.length === 0) {
      return Promise.resolve({
        pendingPickup: 0,
        pickingUp: 0,
        delivering: 0,
        success: 0,
        failed: 0,
        total: 0
      });
    }

    const pendingPickup = shippingList.filter(s => s.status === 'Chờ lấy hàng').length;
    const pickingUp = shippingList.filter(s => s.status === 'Đang lấy hàng' || s.status === 'Đã lấy hàng').length;
    const delivering = shippingList.filter(s => s.status === 'Đang vận chuyển').length;
    const success = shippingList.filter(s => s.status === 'Đã giao' || s.status === 'Giao thành công').length;
    const failed = shippingList.filter(s => s.status === 'Giao thất bại').length;
    const total = shippingList.length;

    return Promise.resolve({
      pendingPickup,
      pickingUp,
      delivering,
      success,
      failed,
      total
    });
  },

  // Get Shipping Orders Filtered
  async getShippingOrders(shippingList = [], filters = {}, isNewShopState = false) {
    if (isNewShopState) {
      return Promise.resolve([]);
    }

    const dataset = shippingList && shippingList.length > 0 ? shippingList : MOCK_SHIPPING_DEMO;
    const { tab = 'all', query = '', provider = 'Tất cả', status = 'Tất cả', warehouse = 'Tất cả' } = filters;
    let list = [...dataset];

    // Status Tab Filter
    if (tab === 'pickup') list = list.filter(s => s.status === 'Chờ lấy hàng');
    if (tab === 'picked') list = list.filter(s => s.status === 'Đang lấy hàng' || s.status === 'Đã lấy hàng');
    if (tab === 'delivering') list = list.filter(s => s.status === 'Đang vận chuyển');
    if (tab === 'delivered') list = list.filter(s => s.status === 'Đã giao' || s.status === 'Giao thành công');
    if (tab === 'failed') list = list.filter(s => s.status === 'Giao thất bại');
    if (tab === 'returned') list = list.filter(s => s.status === 'Hoàn trả');

    // Search Query (Order ID, Tracking Code, Customer Name, Phone)
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(s => {
        const matchOrder = s.orderId && s.orderId.toLowerCase().includes(q);
        const matchTracking = s.trackingNo && s.trackingNo.toLowerCase().includes(q);
        const matchCust = s.customer?.name && s.customer.name.toLowerCase().includes(q);
        const matchPhone = s.customer?.phone && s.customer.phone.includes(q);
        return matchOrder || matchTracking || matchCust || matchPhone;
      });
    }

    // Provider Filter
    if (provider && provider !== 'Tất cả' && provider !== 'Tất cả đơn vị') {
      list = list.filter(s => s.provider === provider || s.providerName === provider);
    }

    // Warehouse Filter
    if (warehouse && warehouse !== 'Tất cả' && warehouse !== 'Tất cả kho') {
      list = list.filter(s => s.warehouse === warehouse);
    }

    return Promise.resolve(list);
  },

  // Get Shipping Providers List
  async getShippingProviders(isNewShopState = false) {
    if (isNewShopState) {
      return Promise.resolve([
        { id: 'sp_1', name: 'V-life Delivery', orderCount: 0, successRate: '--%', status: 'Đang hoạt động', iconColor: '#00B14F' },
        { id: 'sp_2', name: 'GHN', orderCount: 0, successRate: '--%', status: 'Đang hoạt động', iconColor: '#F97316' },
        { id: 'sp_3', name: 'Viettel Post', orderCount: 0, successRate: '--%', status: 'Đang hoạt động', iconColor: '#16A34A' },
        { id: 'sp_4', name: 'J&T Express', orderCount: 0, successRate: '--%', status: 'Đang hoạt động', iconColor: '#DC2626' },
        { id: 'sp_5', name: 'Ninja Van', orderCount: 0, successRate: '--%', status: 'Đang hoạt động', iconColor: '#9333EA' }
      ]);
    }

    return Promise.resolve([
      { id: 'sp_1', name: 'V-life Delivery', orderCount: 18, successRate: '99.1%', status: 'Đang hoạt động', iconColor: '#00B14F' },
      { id: 'sp_2', name: 'GHN', orderCount: 36, successRate: '98.2%', status: 'Đang hoạt động', iconColor: '#F97316' },
      { id: 'sp_3', name: 'Viettel Post', orderCount: 22, successRate: '97.6%', status: 'Đang hoạt động', iconColor: '#16A34A' },
      { id: 'sp_4', name: 'J&T Express', orderCount: 28, successRate: '96.8%', status: 'Đang hoạt động', iconColor: '#DC2626' },
      { id: 'sp_5', name: 'Ninja Van', orderCount: 14, successRate: '97.0%', status: 'Đang hoạt động', iconColor: '#9333EA' }
    ]);
  },

  // Get All Shipments
  async getShipments(existingOrders = []) {
    const list = [
      {
        id: 'sh_101',
        orderId: 'VL000128',
        code: 'VL000128',
        trackingNo: 'VLX123456789',
        customerName: 'Nguyễn Văn B',
        customerPhone: '0901 234 567',
        address: '123 Nguyễn Huệ, Q.1, TP.HCM',
        provider: 'V-life Delivery',
        shippingFee: 25000,
        cod: 263000,
        status: 'Đang vận chuyển',
        estimatedDate: '15/08/2026',
        items: [{ name: 'Áo thun nam basic', productId: 'p2', sku: 'ATB-BLK-M', variant: 'Đen / M', quantity: 2 }]
      },
      {
        id: 'sh_102',
        orderId: 'VL000127',
        code: 'VL000127',
        trackingNo: 'GHN99887766',
        customerName: 'Trần Thị C',
        customerPhone: '0912 999 888',
        address: '456 Lê Lợi, Q. Long Biên, Hà Nội',
        provider: 'GHN',
        shippingFee: 22000,
        cod: 350000,
        status: 'Chờ lấy hàng',
        estimatedDate: '16/08/2026',
        items: [{ name: 'Giày Sneaker Unisex Sport', productId: 'p1', sku: 'GS-WHT-42', variant: 'Trắng / 42', quantity: 1 }]
      },
      {
        id: 'sh_103',
        orderId: 'VL000125',
        code: 'VL000125',
        trackingNo: 'VTP55443322',
        customerName: 'Lê Hoàng D',
        customerPhone: '0988 111 222',
        address: '789 Nguyễn Văn Linh, Q.7, TP.HCM',
        provider: 'Viettel Post',
        shippingFee: 25000,
        cod: 540000,
        status: 'Giao thất bại',
        estimatedDate: '14/08/2026',
        items: [{ name: 'Sạc dự phòng 20000mAh', productId: 'p3', sku: 'SDP-20K-BLK', variant: 'Đen', quantity: 1 }]
      }
    ];
    return Promise.resolve(list);
  },

  // Get Carriers list with Active/Inactive toggle
  async getCarriers() {
    return Promise.resolve([
      { id: 'v-life-delivery', name: 'V-life Delivery', active: true, time: '1 - 2 ngày', fee: '20.000đ', desc: 'Dịch vụ giao vận độc quyền hệ sinh thái V-life' },
      { id: 'ghn', name: 'Giao Hàng Nhanh (GHN)', active: true, time: '2 - 3 ngày', fee: '22.000đ', desc: 'Mạng lưới phủ sóng 63 tỉnh thành' },
      { id: 'viettel-post', name: 'Viettel Post', active: true, time: '2 - 4 ngày', fee: '25.000đ', desc: 'Tối ưu tuyến đường liên tỉnh & hải đảo' },
      { id: 'jt-express', name: 'J&T Express', active: false, time: '2 - 3 ngày', fee: '22.000đ', desc: 'Dịch vụ vận chuyển Express chuẩn hóa' }
    ]);
  },

  // Get Pickup Addresses list
  async getPickupAddresses() {
    return Promise.resolve([
      { id: 'addr_1', name: 'Kho tổng S-SHOPPING Hà Nội', contactName: 'Nguyễn Văn A', phone: '0988 777 666', address: 'Số 123 Đường Nguyễn Văn Cừ, Phường Bồ Đề, Quận Long Biên, Hà Nội', isDefault: true },
      { id: 'addr_2', name: 'Kho miền Nam (TP.HCM)', contactName: 'Trần Thị B', phone: '0901 234 567', address: '123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh', isDefault: false }
    ]);
  },

  // Generate tracking number MOCK
  generateTrackingNumber(prefix = 'VLX') {
    return `${prefix}${Math.floor(100000000 + Math.random() * 900000000)}`;
  },

  // Get Shipping Order Detail by ID
  async getShippingDetail(shippingList = [], orderId) {
    const dataset = shippingList && shippingList.length > 0 ? shippingList : MOCK_SHIPPING_DEMO;
    const found = dataset.find(s => s.id === orderId || s.orderId === orderId || s.trackingNo === orderId);
    return Promise.resolve(found || null);
  },

  // =========================================================================
  // 🎁 PROMOTIONS / MARKETING MODULE FACADE API
  // =========================================================================

  // Get All Promotions list
  async getPromotions() {
    const list = [
      {
        id: 'km_101',
        name: 'Freeship XTRA 8.8',
        code: 'KM0088',
        type: 'Miễn phí vận chuyển',
        badgeText: 'FREESHIP XTRA',
        time: '08/08/2026 - 12/08/2026',
        timeSubtext: 'Còn 2 ngày',
        budget: 2000000,
        spent: 1450000,
        status: 'Đang diễn ra',
        revenue: 32450000,
        productIds: ['p1', 'p2']
      },
      {
        id: 'km_102',
        name: 'Giảm giá 20% toàn shop',
        code: 'KM2008',
        type: 'Giảm giá sản phẩm',
        badgeText: '20% OFF',
        time: '05/08/2026 - 15/08/2026',
        timeSubtext: 'Đang diễn ra',
        budget: 3000000,
        spent: 1890000,
        status: 'Đang diễn ra',
        revenue: 28760000,
        productIds: ['p1', 'p2', 'p3']
      },
      {
        id: 'km_103',
        name: 'Giảm 50K đơn từ 500K',
        code: 'KM500K',
        type: 'Giảm giá đơn hàng',
        badgeText: 'REDEEM 50K',
        time: '10/08/2026 - 20/08/2026',
        timeSubtext: 'Còn 10 ngày',
        budget: 1500000,
        spent: 320000,
        status: 'Đang diễn ra',
        revenue: 9850000,
        productIds: ['p3']
      },
      {
        id: 'km_104',
        name: 'Flash Sale 12.12',
        code: 'FS1212',
        type: 'Flash Sale',
        badgeText: 'FLASH SALE',
        time: '12/12/2026 - 12/12/2026',
        timeSubtext: 'Chưa bắt đầu',
        budget: 5000000,
        spent: 0,
        status: 'Sắp diễn ra',
        revenue: 0,
        productIds: ['p1']
      },
      {
        id: 'km_105',
        name: 'Mua 1 tặng 1',
        code: 'MUA1TANG1',
        type: 'Mua X tặng Y',
        badgeText: 'MUA 1 TẶNG 1',
        time: '01/09/2026 - 10/09/2026',
        timeSubtext: 'Chưa bắt đầu',
        budget: 800000,
        spent: 0,
        status: 'Sắp diễn ra',
        revenue: 0,
        productIds: ['p2']
      },
      {
        id: 'km_106',
        name: 'Back to school',
        code: 'BTS2026',
        type: 'Giảm giá sản phẩm',
        badgeText: 'BACK SCHOOL',
        time: '01/08/2026 - 05/08/2026',
        timeSubtext: 'Đã kết thúc',
        budget: 1000000,
        spent: 1000000,
        status: 'Đã kết thúc',
        revenue: 15320000,
        productIds: ['p1', 'p2']
      },
      {
        id: 'km_107',
        name: 'Tết Sale 2026',
        code: 'TET2026',
        type: 'Giảm giá toàn shop',
        badgeText: 'TẾT SALE',
        time: '15/01/2026 - 22/01/2026',
        timeSubtext: 'Đã kết thúc',
        budget: 2500000,
        spent: 2500000,
        status: 'Đã kết thúc',
        revenue: 46000000,
        productIds: ['p1', 'p2', 'p3']
      }
    ];
    return Promise.resolve(list);
  },

  // Calculate Overview metrics
  async getPromotionOverview(list = []) {
    const total = list.length || 18;
    const active = list.filter(p => p.status === 'Đang diễn ra').length;
    const upcoming = list.filter(p => p.status === 'Sắp diễn ra').length;
    const ended = list.filter(p => p.status === 'Đã kết thúc').length;
    const paused = list.filter(p => p.status === 'Tạm dừng').length;

    return Promise.resolve({
      total,
      active,
      upcoming,
      ended,
      paused
    });
  },

  // =========================================================================
  // 🎬 VIDEO CHANNEL / MARKETING MODULE FACADE API
  // =========================================================================

  // Get All Videos List
  async getVideos() {
    const list = [
      {
        id: 'V000123',
        sellerId: 'S001',
        title: 'Review áo thun nam Basic',
        type: 'Video ngắn',
        duration: '02:45',
        thumbnailUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        status: 'PUBLISHED',
        views: 25840,
        likes: 2354,
        clicks: 1890,
        orders: 86,
        revenue: 12450000,
        productCount: 3,
        productType: 'OWN_PRODUCT',
        productIds: ['p2'],
        createdAt: '13/08/2026 10:30'
      },
      {
        id: 'V000124',
        sellerId: 'S001',
        title: 'Livestream thời trang công sở mùa thu',
        type: 'Livestream',
        duration: '45:00',
        thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        status: 'PUBLISHED',
        views: 68750,
        likes: 3520,
        clicks: 5240,
        orders: 210,
        revenue: 28760000,
        productCount: 8,
        productType: 'OWN_PRODUCT',
        productIds: ['p1', 'p2'],
        createdAt: '12/08/2026 20:00'
      },
      {
        id: 'V000125',
        sellerId: 'S001',
        title: 'Serum dưỡng da mini - Hiệu quả bất ngờ!',
        type: 'Video ngắn',
        duration: '01:15',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        status: 'PUBLISHED',
        views: 18960,
        likes: 1896,
        clicks: 980,
        orders: 45,
        revenue: 5240000,
        productCount: 1,
        productType: 'OWN_PRODUCT',
        productIds: ['p3'],
        createdAt: '12/08/2026 09:15'
      },
      {
        id: 'V000126',
        sellerId: 'S001',
        title: 'Review giày sneaker hot trend 2026',
        type: 'Video dài',
        duration: '03:20',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        status: 'PUBLISHED',
        views: 32140,
        likes: 2150,
        clicks: 2100,
        orders: 98,
        revenue: 15320000,
        productCount: 3,
        productType: 'OWN_PRODUCT',
        productIds: ['p1'],
        createdAt: '11/08/2026 16:45'
      },
      {
        id: 'V000127',
        sellerId: 'S001',
        title: 'Top 5 bàn phím Gaming đáng mua',
        type: 'Affiliate',
        duration: '05:12',
        thumbnailUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        status: 'PUBLISHED',
        views: 42350,
        likes: 2890,
        clicks: 4280,
        orders: 86,
        revenue: 12800000,
        productCount: 2,
        productType: 'AFFILIATE',
        productIds: ['P0098'],
        createdAt: '09/08/2026 08:00'
      }
    ];
    return Promise.resolve(list);
  },

  // Calculate Video Overview Metrics
  async getVideoOverview(list = []) {
    const total = list.length || 24;
    const own = list.filter(v => v.productType !== 'AFFILIATE').length || 18;
    const affiliate = list.filter(v => v.productType === 'AFFILIATE' || v.type === 'Affiliate').length || 6;
    const pending = list.filter(v => v.status === 'PENDING_REVIEW' || v.status === 'Chờ duyệt').length || 2;
    const published = list.filter(v => v.status === 'PUBLISHED' || v.status === 'Đã đăng').length || 19;
    const paused = list.filter(v => v.status === 'PAUSED' || v.status === 'Tạm ẩn').length || 2;
    const rejected = list.filter(v => v.status === 'REJECTED' || v.status === 'Vi phạm').length || 1;

    const totalViews = list.reduce((sum, v) => sum + (v.views || 0), 125800);
    const totalLikes = list.reduce((sum, v) => sum + (v.likes || 0), 8420);
    const totalClicks = list.reduce((sum, v) => sum + (v.clicks || 0), 12540);
    const totalOrders = list.reduce((sum, v) => sum + (v.orders || 0), 428);
    const totalRevenue = list.reduce((sum, v) => sum + (v.revenue || 0), 85600000);
    const affiliateCommission = 3250000;

    return Promise.resolve({
      total,
      own,
      affiliate,
      pending,
      published,
      paused,
      rejected,
      totalViews,
      totalLikes,
      totalClicks,
      totalOrders,
      totalRevenue,
      affiliateCommission
    });
  },

  // =========================================================================
  // 🎙️ LIVESTREAM MODULE FACADE API
  // =========================================================================

  // Get All Livestreams List
  async getLivestreams() {
    const list = [
      {
        id: 'LIVE001',
        sellerId: 'S001',
        title: 'Top deal cuối tuần - Giảm đến 50%',
        category: 'Thời trang',
        description: 'Săn deal đồng giá áo thun & giày sneaker...',
        hostName: 'MC Linh',
        duration: '01:25:20',
        thumbnailUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300',
        status: 'LIVE',
        scheduledAt: '13/08/2026 19:00',
        startedAt: '13/08/2026 19:00',
        viewers: 45680,
        peakViewers: 4820,
        likes: 18920,
        orders: 236,
        revenue: 28450000,
        pinnedProductId: 'p2',
        productIds: ['p1', 'p2', 'p3'],
        createdAt: '13/08/2026 10:00'
      },
      {
        id: 'LIVE002',
        sellerId: 'S001',
        title: 'Review đồ gia dụng thông minh',
        category: 'Gia dụng',
        description: 'Hướng dẫn sử dụng máy xay sinh tố, nồi chiên...',
        hostName: 'MC Hoàng',
        duration: '02:10:45',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
        status: 'LIVE',
        scheduledAt: '12/08/2026 20:00',
        startedAt: '12/08/2026 20:00',
        viewers: 38750,
        peakViewers: 3950,
        likes: 14200,
        orders: 198,
        revenue: 19850000,
        pinnedProductId: 'p1',
        productIds: ['p1', 'p3'],
        createdAt: '12/08/2026 14:00'
      },
      {
        id: 'LIVE003',
        sellerId: 'S001',
        title: 'Siêu sale 8.8 - Bùng nổ ưu đãi',
        category: 'Tổng hợp',
        description: 'Xả kho giá gốc...',
        hostName: 'MC Linh',
        duration: '01:45:10',
        thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
        status: 'ENDED',
        scheduledAt: '11/08/2026 20:00',
        startedAt: '11/08/2026 20:00',
        viewers: 68420,
        peakViewers: 6100,
        likes: 24500,
        orders: 356,
        revenue: 42750000,
        pinnedProductId: 'p2',
        productIds: ['p1', 'p2'],
        createdAt: '11/08/2026 09:00'
      },
      {
        id: 'LIVE004',
        sellerId: 'S001',
        title: 'Đồ làm đẹp chính hãng giá tốt',
        category: 'Làm đẹp',
        description: 'Tặng kèm voucher freeship...',
        hostName: 'MC Hương',
        duration: '00:58:30',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
        status: 'ENDED',
        scheduledAt: '10/08/2026 15:00',
        startedAt: '10/08/2026 15:00',
        viewers: 32150,
        peakViewers: 3100,
        likes: 11200,
        orders: 142,
        revenue: 18620000,
        pinnedProductId: 'p3',
        productIds: ['p3'],
        createdAt: '10/08/2026 10:00'
      },
      {
        id: 'LIVE005',
        sellerId: 'S001',
        title: 'Công nghệ mới - Giá cực sốc',
        category: 'Công nghệ',
        description: 'Sạc dự phòng chính hãng...',
        hostName: 'MC Hoàng',
        duration: '01:45:10',
        thumbnailUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300',
        status: 'ENDED',
        scheduledAt: '09/08/2026 19:30',
        startedAt: '09/08/2026 19:30',
        viewers: 52680,
        peakViewers: 5400,
        likes: 19800,
        orders: 272,
        revenue: 31250000,
        pinnedProductId: 'p3',
        productIds: ['p3'],
        createdAt: '09/08/2026 12:00'
      },
      {
        id: 'LIVE006',
        sellerId: 'S001',
        title: 'Flash Sale 15.8 - Giá hủy diệt',
        category: 'Tổng hợp',
        description: 'Hẹn giờ nhận quà...',
        hostName: 'MC Linh',
        duration: '02:00:00',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300',
        status: 'SCHEDULED',
        scheduledAt: '15/08/2026 20:00',
        viewers: 0,
        likes: 0,
        orders: 0,
        revenue: 0,
        productIds: ['p1', 'p2'],
        createdAt: '14/08/2026 09:00'
      }
    ];
    return Promise.resolve(list);
  },

  // Calculate Livestream Overview Metrics
  async getLivestreamOverview(list = []) {
    const totalSessions = list.length || 28;
    const liveNowCount = list.filter(l => l.status === 'LIVE' || l.status === 'Đang diễn ra').length || 2;
    const upcomingCount = list.filter(l => l.status === 'SCHEDULED' || l.status === 'Sắp diễn ra').length || 3;
    const endedCount = list.filter(l => l.status === 'ENDED' || l.status === 'Đã kết thúc').length || 23;
    const cancelledCount = list.filter(l => l.status === 'CANCELLED' || l.status === 'Đã hủy').length || 0;

    const totalViews = list.reduce((sum, l) => sum + (l.viewers || l.views || 0), 256450);
    const totalLikes = list.reduce((sum, l) => sum + (l.likes || 0), 18920);
    const totalOrders = list.reduce((sum, l) => sum + (l.orders || 0), 1248);
    const totalRevenue = list.reduce((sum, l) => sum + (l.revenue || 0), 156780000);

    return Promise.resolve({
      totalSessions,
      liveNowCount,
      upcomingCount,
      endedCount,
      cancelledCount,
      totalViews,
      totalLikes,
      totalOrders,
      totalRevenue
    });
  },

  // =========================================================================
  // 📊 REPORTS & ANALYTICS MODULE FACADE API
  // =========================================================================

  async getReportOverview(period = '7d') {
    return Promise.resolve({
      revenue: 156780000,
      orders: 1248,
      aov: 125450,
      visits: 82450,
      conversion: '2,12%',
      grossProfit: 62450000,
      totalCosts: 12450000,
      margin: '39.9%'
    });
  },

  async getReportTopProducts(catalogProducts = []) {
    if (catalogProducts && catalogProducts.length > 0) {
      return Promise.resolve(catalogProducts.slice(0, 5));
    }
    return Promise.resolve([
      { id: 'p2', name: 'Áo thun nam Basic', code: 'P00123', revenue: 25450000 },
      { id: 'p4', name: 'Quần jean slim fit', code: 'P00456', revenue: 18750000 },
      { id: 'p1', name: 'Giày sneaker A1', code: 'P00789', revenue: 15320000 }
    ]);
  },

  async exportReport(format = 'excel') {
    return Promise.resolve({ success: true, format, downloadUrl: `#/export/report.${format}` });
  },

  // =========================================================================
  // ⚙️ SHOP SETTINGS MODULE FACADE API
  // =========================================================================

  async getShopInformation() {
    return Promise.resolve({
      shopName: 'Cửa hàng ABC',
      displayName: 'Shop ABC Official',
      phone: '0912 345 678',
      email: 'shopabc@v-life.vn',
      desc: 'Chuyên cung cấp các sản phẩm chất lượng, chính hãng với giá tốt nhất. Cam kết đem đến trải nghiệm mua sắm tuyệt vời cho khách hàng.',
      socialLink: 'https://facebook.com/shopabc',
      category: 'Thời trang',
      joinDate: '01/08/2026',
      status: 'Đang hoạt động',
      isVerified: true
    });
  },

  async updateShopInformation(infoData) {
    return Promise.resolve({ success: true, updated: infoData });
  },

  async getWarehouseAddresses() {
    return Promise.resolve([
      {
        id: 'wh_1',
        name: 'Kho HCM - Tổng kho Miền Nam',
        address: '123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh',
        contact: 'Nguyễn Văn A',
        phone: '0912 345 678',
        isDefault: true,
        type: 'Kho lấy hàng & Kho trả hàng'
      }
    ]);
  },

  // =========================================================================
  // 💰 FINANCE MODULE FACADE API
  // =========================================================================

  async getSellerBalance() {
    return Promise.resolve({
      available: 62850000,
      pending: 35620000,
      receivable: 5000000
    });
  },

  async getTransactions() {
    return Promise.resolve([
      {
        id: 'TX10098',
        orderId: 'VL000128',
        time: '13/08/2026 14:30',
        content: 'Doanh thu đơn hàng #VL000128',
        type: 'Doanh thu',
        source: 'Đơn hàng S-Shopping',
        amount: 458000,
        fee: 9160,
        netAmount: 448840,
        status: 'Hoàn tất'
      },
      {
        id: 'TX10097',
        orderId: 'VL000127',
        time: '13/08/2026 10:15',
        content: 'Phí vận chuyển đơn hàng #VL000127',
        type: 'Chi phí',
        source: 'Giao Hàng Nhanh',
        amount: -32000,
        fee: 0,
        netAmount: -32000,
        status: 'Hoàn tất'
      },
      {
        id: 'TX10096',
        orderId: 'LIVE006',
        time: '12/08/2026 21:00',
        content: 'Doanh thu chốt đơn Livestream Siêu Sale',
        type: 'Doanh thu',
        source: 'Livestream Feed',
        amount: 15600000,
        fee: 312000,
        netAmount: 15288000,
        status: 'Hoàn tất'
      },
      {
        id: 'TX10095',
        orderId: 'VL000120',
        time: '11/08/2026 16:20',
        content: 'Hoàn tiền khách hủy đơn #VL000120',
        type: 'Hoàn tiền',
        source: 'Đơn hàng S-Shopping',
        amount: -520000,
        fee: 0,
        netAmount: -520000,
        status: 'Hoàn tất'
      },
      {
        id: 'TX10094',
        orderId: 'SETTLE_33',
        time: '11/08/2026 09:30',
        content: 'Đối soát số dư bán hàng kỳ tuần 32',
        type: 'Đối soát',
        source: 'Ví S-Shopping',
        amount: 45800000,
        fee: 0,
        netAmount: 45800000,
        status: 'Hoàn tất'
      },
      {
        id: 'TX10093',
        orderId: 'DEBT_01',
        time: '10/08/2026 15:00',
        content: 'Ghi nhận công nợ tạm giữ đơn bảo hành',
        type: 'Công nợ',
        source: 'Hệ thống bảo đảm',
        amount: 5000000,
        fee: 0,
        netAmount: 5000000,
        status: 'Đang giữ'
      }
    ]);
  },

  async getBankAccounts() {
    return Promise.resolve([
      {
        id: 'bank_1',
        bankName: 'Ngân hàng TMCP Ngoại Thương (Vietcombank)',
        accountNumberMasked: '9704 **** **** 6868',
        accountHolder: 'NGUYEN VAN A',
        isDefault: true,
        verificationStatus: '🟢 Đã xác minh'
      },
      {
        id: 'bank_2',
        bankName: 'Ngân hàng TMCP Quân Đội (MB Bank)',
        accountNumberMasked: '9704 **** **** 9999',
        accountHolder: 'NGUYEN VAN A',
        isDefault: false,
        verificationStatus: '🟢 Đã xác minh'
      }
    ]);
  }
};

// Shipping Demo Dataset
export const MOCK_SHIPPING_DEMO = [
  {
    id: 'shp_1',
    orderId: '#VL000128',
    trackingNo: '#GHN8934721',
    customer: {
      name: 'Nguyễn Văn Bình',
      phone: '0909 123 456',
      address: '123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    provider: 'GHN',
    providerName: 'Giao Hàng Nhanh',
    warehouse: 'Kho HCM',
    shippingFee: 25000,
    totalAmount: 458000,
    status: 'Đang vận chuyển',
    estimatedDate: '12/08/2026',
    timeline: [
      { step: 'Đơn hàng đã xác nhận', time: '12/08/2026 09:30', done: true },
      { step: 'Shop đã đóng gói', time: '12/08/2026 10:15', done: true },
      { step: 'Đã bàn giao cho đơn vị vận chuyển', time: '12/08/2026 11:20', done: true },
      { step: 'Đang vận chuyển', time: '12/08/2026 14:30', current: true },
      { step: 'Đang giao đến khách hàng', done: false },
      { step: 'Giao hàng thành công', done: false }
    ]
  },
  {
    id: 'shp_2',
    orderId: '#VL000127',
    trackingNo: '#JT8837291',
    customer: {
      name: 'Trần Minh Anh',
      phone: '0912 345 678',
      address: '456 Cầu Giấy, Quận Cầu Giấy, Hà Nội'
    },
    provider: 'J&T Express',
    providerName: 'J&T Express',
    warehouse: 'Kho Hà Nội',
    shippingFee: 32000,
    totalAmount: 580000,
    status: 'Chờ lấy hàng',
    estimatedDate: '12/08/2026',
    timeline: [
      { step: 'Đơn hàng đã xác nhận', time: '12/08/2026 08:15', done: true },
      { step: 'Shop đã đóng gói', time: '12/08/2026 09:00', done: true },
      { step: 'Chờ đơn vị vận chuyển lấy hàng', time: '12/08/2026 09:30', current: true },
      { step: 'Đang vận chuyển', done: false },
      { step: 'Giao hàng thành công', done: false }
    ]
  },
  {
    id: 'shp_3',
    orderId: '#VL000126',
    trackingNo: '#VP8834219',
    customer: {
      name: 'Lê Hoàng Nam',
      phone: '0934 567 890',
      address: '789 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng'
    },
    provider: 'Viettel Post',
    providerName: 'Viettel Post',
    warehouse: 'Kho Đà Nẵng',
    shippingFee: 28000,
    totalAmount: 320000,
    status: 'Đã giao',
    estimatedDate: '11/08/2026',
    timeline: [
      { step: 'Đơn hàng đã xác nhận', time: '10/08/2026 14:00', done: true },
      { step: 'Shop đã đóng gói', time: '10/08/2026 15:30', done: true },
      { step: 'Đã bàn giao cho đơn vị vận chuyển', time: '10/08/2026 17:00', done: true },
      { step: 'Đang vận chuyển', time: '11/08/2026 08:00', done: true },
      { step: 'Giao hàng thành công', time: '11/08/2026 16:30', done: true, current: true }
    ]
  },
  {
    id: 'shp_4',
    orderId: '#VL000125',
    trackingNo: '#GHN8934720',
    customer: {
      name: 'Phạm Thị Lan',
      phone: '0908 765 432',
      address: '88 Cách Mạng Tháng 8, Quận 3, TP. Hồ Chí Minh'
    },
    provider: 'GHN',
    providerName: 'Giao Hàng Nhanh',
    warehouse: 'Kho HCM',
    shippingFee: 25000,
    totalAmount: 410000,
    status: 'Đang lấy hàng',
    estimatedDate: '13/08/2026',
    timeline: [
      { step: 'Đơn hàng đã xác nhận', time: '12/08/2026 10:00', done: true },
      { step: 'Tài xế đang đến lấy hàng', time: '12/08/2026 11:30', current: true },
      { step: 'Đang vận chuyển', done: false },
      { step: 'Giao hàng thành công', done: false }
    ]
  },
  {
    id: 'shp_5',
    orderId: '#VL000124',
    trackingNo: '#NJV7792910',
    customer: {
      name: 'Đỗ Quốc Huy',
      phone: '0978 654 321',
      address: '22 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh'
    },
    provider: 'Ninja Van',
    providerName: 'Ninja Van',
    warehouse: 'Kho HCM',
    shippingFee: 22000,
    totalAmount: 290000,
    status: 'Chờ lấy hàng',
    estimatedDate: '13/08/2026',
    timeline: [
      { step: 'Đơn hàng đã xác nhận', time: '12/08/2026 11:00', done: true },
      { step: 'Shop đã đóng gói', time: '12/08/2026 12:00', done: true },
      { step: 'Chờ đơn vị vận chuyển lấy hàng', time: '12/08/2026 12:30', current: true }
    ]
  },
  {
    id: 'shp_6',
    orderId: '#VL000123',
    trackingNo: '#GHN8934719',
    customer: {
      name: 'Ngô Thanh Tùng',
      phone: '0987 111 222',
      address: '15 Trần Duy Hưng, Quận Cầu Giấy, Hà Nội'
    },
    provider: 'GHN',
    providerName: 'Giao Hàng Nhanh',
    warehouse: 'Kho Hà Nội',
    shippingFee: 25000,
    totalAmount: 670000,
    status: 'Giao thất bại',
    estimatedDate: '10/08/2026',
    timeline: [
      { step: 'Đơn hàng đã xác nhận', time: '09/08/2026 09:00', done: true },
      { step: 'Đã bàn giao cho vận chuyển', time: '09/08/2026 14:00', done: true },
      { step: 'Giao không thành công (Khách bận)', time: '10/08/2026 17:00', error: true }
    ]
  },
  {
    id: 'shp_7',
    orderId: '#VL000122',
    trackingNo: '#VTP8820011',
    customer: {
      name: 'Hoàng Hải Yến',
      phone: '0911 222 333',
      address: '44 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng'
    },
    provider: 'Viettel Post',
    providerName: 'Viettel Post',
    warehouse: 'Kho Đà Nẵng',
    shippingFee: 28000,
    totalAmount: 490000,
    status: 'Đã giao',
    estimatedDate: '09/08/2026',
    timeline: [
      { step: 'Đơn hàng đã xác nhận', time: '08/08/2026 10:00', done: true },
      { step: 'Giao hàng thành công', time: '09/08/2026 15:00', done: true }
    ]
  }
];

// =========================================================================
// 💬 MESSAGING CENTER MOCK DATA & FACADE METHODS (TRUNG TÂM TIN NHẮN)
// =========================================================================

export const MOCK_CONVERSATIONS_DATA = [
  {
    id: 'conv_1',
    customerId: 'cust_1',
    customerName: 'Nguyễn Minh Anh',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    customerPhone: '0987.654.321',
    customerJoinDate: '12/03/2025',
    customerTag: '⭐ Khách hàng thân thiết',
    totalOrders: 12,
    totalSpent: 8450000,
    lastMessage: 'Shop ơi áo này còn size M không?',
    lastMessageTime: '09:42',
    unreadCount: 2,
    isReplied: false,
    updatedAt: '2026-08-15T09:42:00Z',
    status: 'online'
  },
  {
    id: 'conv_2',
    customerId: 'cust_2',
    customerName: 'Trần Văn Nam',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    customerPhone: '0912.345.678',
    customerJoinDate: '05/06/2025',
    customerTag: '🟢 Đang mua hàng',
    totalOrders: 5,
    totalSpent: 2150000,
    lastMessage: 'Bao giờ đơn của tôi được giao?',
    lastMessageTime: '09:30',
    unreadCount: 1,
    isReplied: false,
    updatedAt: '2026-08-15T09:30:00Z',
    status: 'online'
  },
  {
    id: 'conv_3',
    customerId: 'cust_3',
    customerName: 'Lê Thu Hà',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    customerPhone: '0903.112.233',
    customerJoinDate: '20/07/2026',
    customerTag: '🔵 Khách mới',
    totalOrders: 1,
    totalSpent: 450000,
    lastMessage: 'Cho mình hỏi sản phẩm này còn không?',
    lastMessageTime: 'Hôm qua',
    unreadCount: 0,
    isReplied: true,
    updatedAt: '2026-08-14T16:20:00Z',
    status: 'offline'
  },
  {
    id: 'conv_4',
    customerId: 'cust_4',
    customerName: 'Hoàng Đức Thắng',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    customerPhone: '0938.889.991',
    customerJoinDate: '15/01/2025',
    customerTag: '⭐ Khách hàng thân thiết',
    totalOrders: 8,
    totalSpent: 5200000,
    lastMessage: 'Shop gói hàng kỹ giúp mình nhé!',
    lastMessageTime: '14/08',
    unreadCount: 0,
    isReplied: true,
    updatedAt: '2026-08-14T10:15:00Z',
    status: 'offline'
  },
  {
    id: 'conv_5',
    customerId: 'cust_5',
    customerName: 'Phạm Mai Chi',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    customerPhone: '0977.554.433',
    customerJoinDate: '10/11/2024',
    customerTag: '⭐ Khách hàng thân thiết',
    totalOrders: 15,
    totalSpent: 11200000,
    lastMessage: 'Áo mặc vừa vặn và đẹp lắm shop ơi.',
    lastMessageTime: '13/08',
    unreadCount: 0,
    isReplied: true,
    updatedAt: '2026-08-13T14:40:00Z',
    status: 'offline'
  },
  {
    id: 'conv_6',
    customerId: 'cust_6',
    customerName: 'Vũ Quốc Bảo',
    customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    customerPhone: '0966.778.899',
    customerJoinDate: '01/08/2026',
    customerTag: '🔵 Khách mới',
    totalOrders: 2,
    totalSpent: 620000,
    lastMessage: 'Có freeship cho đơn trên 300k không shop?',
    lastMessageTime: '12/08',
    unreadCount: 1,
    isReplied: false,
    updatedAt: '2026-08-12T11:05:00Z',
    status: 'online'
  },
  {
    id: 'conv_7',
    customerId: 'cust_7',
    customerName: 'Đặng Bích Ngọc',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    customerPhone: '0981.223.344',
    customerJoinDate: '18/05/2025',
    customerTag: '🟢 Đang mua hàng',
    totalOrders: 4,
    totalSpent: 1850000,
    lastMessage: 'Mình muốn đổi sang size L được không?',
    lastMessageTime: '11/08',
    unreadCount: 2,
    isReplied: false,
    updatedAt: '2026-08-11T18:22:00Z',
    status: 'offline'
  },
  {
    id: 'conv_8',
    customerId: 'cust_8',
    customerName: 'Ngô Thành Long',
    customerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    customerPhone: '0909.876.543',
    customerJoinDate: '08/08/2026',
    customerTag: '🔵 Khách mới',
    totalOrders: 1,
    totalSpent: 299000,
    lastMessage: 'Chất vải này có co giãn nhiều không bạn?',
    lastMessageTime: '10/08',
    unreadCount: 2,
    isReplied: false,
    updatedAt: '2026-08-10T15:30:00Z',
    status: 'online'
  }
];

export const MOCK_MESSAGES_DATA = {
  conv_1: [
    {
      id: 'm1_1',
      conversationId: 'conv_1',
      senderId: 'cust_1',
      senderType: 'customer',
      content: 'Chào shop! Mình đang xem mẫu áo thun Basic của shop.',
      createdAt: '09:38',
      productId: 'p1'
    },
    {
      id: 'm1_2',
      conversationId: 'conv_1',
      senderId: 'cust_1',
      senderType: 'customer',
      content: 'Shop ơi áo này còn size M màu trắng không ạ?',
      createdAt: '09:42'
    }
  ],
  conv_2: [
    {
      id: 'm2_1',
      conversationId: 'conv_2',
      senderId: 'cust_2',
      senderType: 'customer',
      content: 'Chào shop, mình có đặt một đơn hàng hôm qua.',
      createdAt: '09:28',
      orderId: 'ord_1'
    },
    {
      id: 'm2_2',
      conversationId: 'conv_2',
      senderId: 'cust_2',
      senderType: 'customer',
      content: 'Bao giờ đơn của tôi được giao?',
      createdAt: '09:30'
    }
  ],
  conv_3: [
    {
      id: 'm3_1',
      conversationId: 'conv_3',
      senderId: 'cust_3',
      senderType: 'customer',
      content: 'Cho mình hỏi sản phẩm này còn không?',
      createdAt: '16:15',
      productId: 'p2'
    },
    {
      id: 'm3_2',
      conversationId: 'conv_3',
      senderId: 'seller',
      senderType: 'seller',
      content: 'Chào bạn 👋 Shop đã kiểm tra và sản phẩm vẫn còn hàng nhé.',
      createdAt: '16:20'
    }
  ]
};

// Extend sellerService with Messaging methods
Object.assign(sellerService, {
  // Get all conversations with filters & search
  async getConversations(filter = 'all', query = '', conversations = MOCK_CONVERSATIONS_DATA) {
    let list = [...conversations];

    // Filter by Tab (all, unread, replied)
    if (filter === 'unread') {
      list = list.filter(c => c.unreadCount > 0);
    } else if (filter === 'replied') {
      list = list.filter(c => c.isReplied || c.unreadCount === 0);
    }

    // Search by customer name or last message
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(c => 
        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q)) ||
        (c.customerPhone && c.customerPhone.includes(q))
      );
    }

    return Promise.resolve(list);
  },

  // Get Conversation By ID
  async getConversationById(id, conversations = MOCK_CONVERSATIONS_DATA) {
    const found = conversations.find(c => c.id === id);
    return Promise.resolve(found || null);
  },

  // Get Message Thread for Conversation
  async getMessages(conversationId, allMessages = MOCK_MESSAGES_DATA) {
    const list = allMessages[conversationId] || [
      {
        id: `msg_init_${conversationId}`,
        conversationId,
        senderId: 'customer',
        senderType: 'customer',
        content: 'Chào shop, tư vấn giúp mình với ạ!',
        createdAt: 'Hôm nay'
      }
    ];
    return Promise.resolve(list);
  },

  // Send Message (Mock Socket/API layer)
  async sendMessage(conversationId, messageData, allMessages = MOCK_MESSAGES_DATA, allConversations = MOCK_CONVERSATIONS_DATA) {
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      conversationId,
      senderId: 'seller',
      senderType: 'seller',
      content: messageData.content || '',
      productId: messageData.productId || null,
      orderId: messageData.orderId || null,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const currentList = allMessages[conversationId] || [];
    const updatedMessages = {
      ...allMessages,
      [conversationId]: [...currentList, newMsg]
    };

    // Update conversation last message & mark as replied
    const updatedConversations = allConversations.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: messageData.content || (messageData.productId ? 'Đã gửi sản phẩm' : 'Đã gửi đơn hàng'),
          lastMessageTime: newMsg.createdAt,
          isReplied: true,
          unreadCount: 0
        };
      }
      return c;
    });

    return Promise.resolve({
      newMessage: newMsg,
      updatedMessages,
      updatedConversations
    });
  },

  // Mark Conversation As Read
  async markConversationAsRead(conversationId, conversations = MOCK_CONVERSATIONS_DATA) {
    const updated = conversations.map(c => {
      if (c.id === conversationId) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    });
    return Promise.resolve(updated);
  },

  // Mark All Conversations As Read
  async markAllConversationsAsRead(conversations = MOCK_CONVERSATIONS_DATA) {
    const updated = conversations.map(c => ({ ...c, unreadCount: 0 }));
    return Promise.resolve(updated);
  },

  // Get Quick Reply Templates
  async getQuickReplies() {
    return Promise.resolve([
      'Chào bạn, shop có thể hỗ trợ gì cho bạn ạ?',
      'Shop đã kiểm tra và sản phẩm vẫn còn hàng nhé.',
      'Đơn hàng của bạn đang được đóng gói và chuẩn bị bàn giao cho ĐVVC.',
      'Cảm ơn bạn đã ủng hộ shop. Chúc bạn một ngày tốt lành!',
      'Bạn vui lòng cung cấp thêm chiều cao và cân nặng để shop tư vấn size chuẩn nhất nhé.'
    ]);
  },

  // Get Orders associated with a customer
  async getCustomerOrders(customerId, existingOrders = []) {
    if (!existingOrders || existingOrders.length === 0) return Promise.resolve([]);
    const found = existingOrders.filter(o => 
      (o.customer?.id && o.customer.id === customerId) ||
      (o.customerId && o.customerId === customerId) ||
      (o.customer?.phone && customerId.includes(o.customer.phone))
    );
    if (found.length > 0) return Promise.resolve(found);
    // Return sample orders if not matched by ID
    return Promise.resolve(existingOrders.slice(0, 3));
  }
});

// =========================================================================
// 🔔 NOTIFICATION CENTER MOCK DATA & FACADE METHODS (TRUNG TÂM THÔNG BÁO)
// =========================================================================

export const MOCK_NOTIFICATIONS_DATA = [
  {
    id: 'noti_1',
    type: 'ORDER',
    title: 'Đơn hàng mới #VL000123',
    content: 'Bạn có đơn hàng #VL000123 đang chờ xác nhận từ khách hàng Nguyễn Minh Anh.',
    referenceId: 'VL000123',
    read: false,
    createdAt: '5 phút trước',
    timestamp: '2026-08-15T09:35:00Z',
    categoryName: 'Đơn hàng'
  },
  {
    id: 'noti_2',
    type: 'INVENTORY',
    title: 'Cảnh báo tồn kho thấp',
    content: 'Sản phẩm Áo thun nam Basic (ATB-001) chỉ còn 3 sản phẩm trong kho. Hãy nhập thêm hàng để tránh gián đoạn bán hàng.',
    referenceId: 'p1',
    read: false,
    createdAt: '20 phút trước',
    timestamp: '2026-08-15T09:20:00Z',
    categoryName: 'Sản phẩm'
  },
  {
    id: 'noti_3',
    type: 'FINANCE',
    title: 'Thanh toán đối soát thành công',
    content: 'Khoản thanh toán 2.450.000đ cho kỳ đối soát tuần 2 tháng 8 đã được ghi nhận vào Số dư ví Shop.',
    referenceId: 'fin_01',
    read: false,
    createdAt: '1 giờ trước',
    timestamp: '2026-08-15T08:40:00Z',
    categoryName: 'Tài chính'
  },
  {
    id: 'noti_4',
    type: 'VIDEO',
    title: 'Video đạt mốc 10.000 lượt xem',
    content: 'Video "Review áo thun nam basic" của bạn đã đạt mốc 10.000 lượt xem và mang về 18 đơn hàng mới.',
    referenceId: 'vid_01',
    read: false,
    createdAt: '3 giờ trước',
    timestamp: '2026-08-15T06:40:00Z',
    categoryName: 'Hệ thống'
  },
  {
    id: 'noti_5',
    type: 'PROMOTION',
    title: 'Chiến dịch Freeship tháng 8',
    content: 'Chiến dịch Freeship tháng 8 đã được cập nhật chính sách hỗ trợ phí vận chuyển 0đ cho toàn bộ đơn hàng.',
    referenceId: 'promo_01',
    read: false,
    createdAt: 'Hôm qua',
    timestamp: '2026-08-14T15:00:00Z',
    categoryName: 'Khuyến mãi'
  },
  {
    id: 'noti_6',
    type: 'LIVESTREAM',
    title: 'Tổng kết phiên Livestream',
    content: 'Phiên Livestream tối qua đã ghi nhận 2.450 người xem đồng thời và 86 đơn hàng phát sinh.',
    referenceId: 'live_01',
    read: true,
    createdAt: '13/08',
    timestamp: '2026-08-13T22:00:00Z',
    categoryName: 'Hệ thống'
  },
  {
    id: 'noti_7',
    type: 'SYSTEM',
    title: 'Nâng cấp tính năng Xử lý Đơn hàng',
    content: 'Hệ thống S-SHOPPING Seller Center vừa cập nhật tính năng in phiếu giao hàng và xử lý đơn hàng loạt.',
    referenceId: 'sys_01',
    read: true,
    createdAt: '12/08',
    timestamp: '2026-08-12T10:00:00Z',
    categoryName: 'Hệ thống'
  },
  {
    id: 'noti_8',
    type: 'ORDER',
    title: 'Đơn hàng #VL000127 đã giao thành công',
    content: 'Đơn hàng #VL000127 đã được bưu tá Viettel Post giao thành công đến người nhận Lê Thu Hà.',
    referenceId: 'VL000127',
    read: true,
    createdAt: '11/08',
    timestamp: '2026-08-11T16:30:00Z',
    categoryName: 'Đơn hàng'
  },
  {
    id: 'noti_9',
    type: 'INVENTORY',
    title: 'Nhập kho thành công SKU POLO-002',
    content: 'Phiếu nhập kho +50 sản phẩm Áo polo nam cao cấp đã được hoàn tất kiểm đếm vào Kho Tổng Hà Nội.',
    referenceId: 'p2',
    read: true,
    createdAt: '10/08',
    timestamp: '2026-08-10T14:20:00Z',
    categoryName: 'Sản phẩm'
  },
  {
    id: 'noti_10',
    type: 'SYSTEM',
    title: 'Quy định đóng gói hàng hóa mới',
    content: 'Vui lòng kiểm tra và tuân thủ quy chuẩn đóng gói hàng hóa chống sốc để tránh hư hỏng trong quá trình vận chuyển.',
    referenceId: 'sys_02',
    read: true,
    createdAt: '08/08',
    timestamp: '2026-08-08T09:00:00Z',
    categoryName: 'Hệ thống'
  }
];

// Extend sellerService with Notification methods
Object.assign(sellerService, {
  // Get all notifications with filters & search
  async getNotifications(filter = 'all', query = '', notifications = MOCK_NOTIFICATIONS_DATA) {
    let list = [...notifications];

    // Filter by Tab (all, unread, order, product, finance, promotion, system)
    if (filter === 'unread') {
      list = list.filter(n => !n.read);
    } else if (filter === 'order' || filter === 'ORDER') {
      list = list.filter(n => n.type === 'ORDER');
    } else if (filter === 'product' || filter === 'inventory' || filter === 'INVENTORY') {
      list = list.filter(n => n.type === 'INVENTORY' || n.type === 'PRODUCT');
    } else if (filter === 'finance' || filter === 'FINANCE') {
      list = list.filter(n => n.type === 'FINANCE');
    } else if (filter === 'promotion' || filter === 'PROMOTION') {
      list = list.filter(n => n.type === 'PROMOTION');
    } else if (filter === 'system' || filter === 'SYSTEM') {
      list = list.filter(n => n.type === 'SYSTEM' || n.type === 'VIDEO' || n.type === 'LIVESTREAM');
    }

    // Search by title, content, type, or category
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q)) ||
        (n.type && n.type.toLowerCase().includes(q)) ||
        (n.categoryName && n.categoryName.toLowerCase().includes(q)) ||
        (n.referenceId && n.referenceId.toLowerCase().includes(q))
      );
    }

    return Promise.resolve(list);
  },

  // Calculate unread notification count
  async getUnreadNotificationCount(notifications = MOCK_NOTIFICATIONS_DATA) {
    const unread = notifications.filter(n => !n.read).length;
    return Promise.resolve(unread);
  },

  // Get notifications by specific type
  async getNotificationsByType(type, notifications = MOCK_NOTIFICATIONS_DATA) {
    const filtered = notifications.filter(n => n.type === type);
    return Promise.resolve(filtered);
  },

  // Mark a single notification as read
  async markNotificationAsRead(id, notifications = MOCK_NOTIFICATIONS_DATA) {
    const updated = notifications.map(n => {
      if (n.id === id) {
        return { ...n, read: true };
      }
      return n;
    });
    return Promise.resolve(updated);
  },

  // Mark all notifications as read
  async markAllNotificationsAsRead(notifications = MOCK_NOTIFICATIONS_DATA) {
    const updated = notifications.map(n => ({ ...n, read: true }));
    return Promise.resolve(updated);
  },

  // Delete a notification (mock state update)
  async deleteNotification(id, notifications = MOCK_NOTIFICATIONS_DATA) {
    const updated = notifications.filter(n => n.id !== id);
    return Promise.resolve(updated);
  },

  // Get notification by ID
  async getNotificationById(id, notifications = MOCK_NOTIFICATIONS_DATA) {
    const found = notifications.find(n => n.id === id);
    return Promise.resolve(found || null);
  },

  // =========================================================================
  // 1️⃣2️⃣ SHOP SETUP ONBOARDING SERVICE (HOÀN THIỆN SHOP 7 BƯỚC)
  // =========================================================================

  // Get Shop Setup Status & Progress (Single Source of Truth)
  async getShopSetupStatus(currentState = null, isNewShop = false, existingProducts = []) {
    const base = currentState || (isNewShop ? MOCK_SHOP_SETUP_NEW : MOCK_SHOP_SETUP_INITIAL);
    
    // Dynamically check if first product is completed based on catalog
    const hasProducts = (existingProducts && existingProducts.length > 0) || (base.firstProduct && base.firstProduct.status === 'COMPLETED');
    const productStatus = hasProducts ? 'COMPLETED' : (base.firstProduct?.status || 'PENDING');

    // Dynamically check shipping
    const hasActiveShipping = base.shipping?.carriers?.some(c => c.enabled);
    const shippingStatus = hasActiveShipping ? 'COMPLETED' : (base.shipping?.status || 'PENDING');

    const steps = [
      {
        id: 1,
        key: 'shopInfo',
        stepNumber: '01',
        title: 'Thông tin Shop',
        desc: 'Thiết lập tên cửa hàng, logo nhận diện, slogan và danh mục kinh doanh chính.',
        status: base.shopInfo?.status || 'PENDING',
        data: base.shopInfo,
        actionText: base.shopInfo?.status === 'COMPLETED' ? 'Chỉnh sửa' : 'Thiết lập',
        targetTab: 'settings'
      },
      {
        id: 2,
        key: 'verification',
        stepNumber: '02',
        title: 'Xác minh người bán',
        desc: 'Xác thực định danh cá nhân / doanh nghiệp qua tài khoản S-Life và CCCD.',
        status: base.verification?.status || 'PENDING',
        data: base.verification,
        actionText: base.verification?.status === 'COMPLETED' ? 'Xem chi tiết' : 'Tiếp tục xác minh',
        targetTab: 'settings'
      },
      {
        id: 3,
        key: 'pickupAddress',
        stepNumber: '03',
        title: 'Địa chỉ lấy hàng',
        desc: 'Địa chỉ kho hàng hoặc cửa hàng để đơn vị vận chuyển đến lấy đơn.',
        status: base.pickupAddress?.status || 'PENDING',
        data: base.pickupAddress,
        actionText: base.pickupAddress?.status === 'COMPLETED' ? 'Chỉnh sửa' : 'Thêm địa chỉ',
        targetTab: 'shipping'
      },
      {
        id: 4,
        key: 'payoutAccount',
        stepNumber: '04',
        title: 'Tài khoản nhận tiền',
        desc: 'Liên kết tài khoản ngân hàng để nhận doanh thu thanh toán qua Napas 24/7.',
        status: base.payoutAccount?.status || 'PENDING',
        data: base.payoutAccount,
        actionText: base.payoutAccount?.status === 'COMPLETED' ? 'Thay đổi' : 'Thiết lập',
        targetTab: 'finance'
      },
      {
        id: 5,
        key: 'shipping',
        stepNumber: '05',
        title: 'Thiết lập vận chuyển',
        desc: 'Bật các kênh giao hàng: V-life Delivery, GHN, Viettel Post, GHTK.',
        status: shippingStatus,
        data: base.shipping,
        actionText: shippingStatus === 'COMPLETED' ? 'Cấu hình' : 'Bật vận chuyển',
        targetTab: 'shipping'
      },
      {
        id: 6,
        key: 'firstProduct',
        stepNumber: '06',
        title: 'Đăng sản phẩm đầu tiên',
        desc: 'Thêm sản phẩm đầu tiên để bắt đầu bán hàng trên sàn S-Shopping.',
        status: productStatus,
        data: { ...base.firstProduct, count: existingProducts?.length || 0 },
        actionText: productStatus === 'COMPLETED' ? '+ Thêm sản phẩm' : '+ Đăng sản phẩm',
        targetTab: 'products'
      },
      {
        id: 7,
        key: 'finalReview',
        stepNumber: '07',
        title: 'Kiểm tra & hoàn tất Shop',
        desc: 'Rà soát toàn bộ cấu hình và kích hoạt Shop chính thức lên sàn V-life.',
        status: base.finalReview?.status === 'COMPLETED' 
          ? 'COMPLETED' 
          : (stepsAreReadyForReview(base, hasProducts, hasActiveShipping) ? 'READY' : 'LOCKED'),
        data: base.finalReview,
        actionText: base.finalReview?.status === 'COMPLETED' 
          ? 'Shop đã hoạt động' 
          : (stepsAreReadyForReview(base, hasProducts, hasActiveShipping) ? 'Hoàn tất thiết lập Shop' : 'Chưa thể thực hiện'),
        targetTab: 'shop_setup'
      }
    ];

    // Compute progress
    const completedCount = steps.filter(s => s.status === 'COMPLETED').length;
    const progressPercent = Math.round((completedCount / 7) * 100);

    return Promise.resolve({
      completedCount,
      totalCount: 7,
      progressPercent,
      isFullyCompleted: completedCount === 7,
      steps,
      rawState: {
        ...base,
        firstProduct: { ...base.firstProduct, status: productStatus },
        shipping: { ...base.shipping, status: shippingStatus }
      }
    });
  },

  // Update specific step in setup
  async updateShopSetupStep(currentState, stepKey, updates) {
    const updated = {
      ...currentState,
      [stepKey]: {
        ...(currentState[stepKey] || {}),
        ...updates
      }
    };
    return Promise.resolve(updated);
  },

  // Complete entire shop setup (Final Step 7)
  async completeShopSetup(currentState) {
    const updated = {
      ...currentState,
      finalReview: {
        status: 'COMPLETED',
        completedAt: '12/08/2026 10:00'
      }
    };
    return Promise.resolve(updated);
  }
});

// Helper function to check if steps 1 to 6 are done
function stepsAreReadyForReview(base, hasProducts, hasActiveShipping) {
  const s1 = base.shopInfo?.status === 'COMPLETED';
  const s2 = base.verification?.status === 'COMPLETED';
  const s3 = base.pickupAddress?.status === 'COMPLETED';
  const s4 = base.payoutAccount?.status === 'COMPLETED';
  const s5 = hasActiveShipping || base.shipping?.status === 'COMPLETED';
  const s6 = hasProducts || base.firstProduct?.status === 'COMPLETED';
  return s1 && s2 && s3 && s4 && s5 && s6;
}

export const MOCK_SHOP_SETUP_INITIAL = {
  shopInfo: {
    status: 'COMPLETED',
    name: 'S-Shopping Fashion Official',
    displayName: 'S-Shopping Fashion',
    category: 'Thời trang & May mặc',
    description: 'Gian hàng thời trang cao cấp chính hãng trên S-Shopping.',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
  },
  verification: {
    status: 'COMPLETED',
    ownerName: 'Nguyễn Văn A',
    idNumber: '079203001234',
    phone: '0987654321',
    verifiedDate: '12/08/2026'
  },
  pickupAddress: {
    status: 'COMPLETED',
    contactName: 'Nguyễn Văn A (Kho Tổng)',
    phone: '0987654321',
    address: '123 Đường Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh'
  },
  payoutAccount: {
    status: 'COMPLETED',
    bankName: 'Vietcombank (VCB)',
    accountNumber: '10123456789',
    accountHolder: 'NGUYEN VAN A',
    napasVerified: true
  },
  shipping: {
    status: 'PENDING',
    carriers: [
      { id: 'vlife_del', name: 'V-life Delivery', enabled: true, time: '1-2 ngày', type: 'Hỏa tốc' },
      { id: 'viettel_post', name: 'Viettel Post', enabled: true, time: '2-3 ngày', type: 'Nhanh' },
      { id: 'ghn', name: 'Giao Hàng Nhanh (GHN)', enabled: true, time: '2-3 ngày', type: 'Nhanh' },
      { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm (GHTK)', enabled: false, time: '3-4 ngày', type: 'Tiết kiệm' }
    ]
  },
  firstProduct: {
    status: 'PENDING',
    productCount: 0
  },
  finalReview: {
    status: 'LOCKED',
    completedAt: null
  }
};

export const MOCK_SHOP_SETUP_NEW = {
  shopInfo: { status: 'PENDING', name: '', displayName: '', category: '', description: '', logo: '' },
  verification: { status: 'PENDING', ownerName: '', idNumber: '', phone: '', verifiedDate: null },
  pickupAddress: { status: 'PENDING', contactName: '', phone: '', address: '', ward: '', district: '', city: '' },
  payoutAccount: { status: 'PENDING', bankName: '', accountNumber: '', accountHolder: '', napasVerified: false },
  shipping: {
    status: 'PENDING',
    carriers: [
      { id: 'vlife_del', name: 'V-life Delivery', enabled: false, time: '1-2 ngày', type: 'Hỏa tốc' },
      { id: 'viettel_post', name: 'Viettel Post', enabled: false, time: '2-3 ngày', type: 'Nhanh' },
      { id: 'ghn', name: 'Giao Hàng Nhanh (GHN)', enabled: false, time: '2-3 ngày', type: 'Nhanh' },
      { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm (GHTK)', enabled: false, time: '3-4 ngày', type: 'Tiết kiệm' }
    ]
  },
  firstProduct: { status: 'PENDING', productCount: 0 },
  finalReview: { status: 'LOCKED', completedAt: null }
};

export default sellerService;



