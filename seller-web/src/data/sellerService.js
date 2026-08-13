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
    const { tab = 'all', query = '', provider = 'Tất cả' } = filters;
    let list = [...ordersList];

    // Status Tab Filtering
    if (tab === 'confirm') list = list.filter(o => o.status === 'Chờ xác nhận');
    if (tab === 'packing') list = list.filter(o => o.status === 'Chờ đóng gói' || o.status === 'Chờ lấy hàng');
    if (tab === 'handover') list = list.filter(o => o.status === 'Chờ bàn giao');
    if (tab === 'delivering') list = list.filter(o => o.status === 'Đang giao');
    if (tab === 'delivered') list = list.filter(o => o.status === 'Đã giao');
    if (tab === 'completed') list = list.filter(o => o.status === 'Hoàn thành');
    if (tab === 'cancelled') list = list.filter(o => o.status === 'Đã hủy');
    if (tab === 'returned') list = list.filter(o => o.status === 'Trả hàng/Hoàn tiền' || o.status === 'Trả hàng' || o.status === 'Đã hoàn tiền');

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



  // Receive stock (+) by SKU or productId
  async receiveInventory(inventoryList, skuOrProductId, quantity, reason = 'Nhập kho bổ sung') {
    const qty = parseInt(quantity, 10) || 0;
    const updated = inventoryList.map(item => {
      if (item.sku === skuOrProductId || item.productId === skuOrProductId || item.id === skuOrProductId) {
        const physicalStock = (item.physicalStock || item.quantity || 0) + qty;
        const reservedStock = item.reservedStock || item.reservedQuantity || 0;
        const availableStock = Math.max(0, physicalStock - reservedStock);
        return {
          ...item,
          physicalStock,
          quantity: physicalStock,
          availableStock,
          availableQuantity: availableStock,
          updatedAt: new Date().toLocaleDateString('vi-VN')
        };
      }
      return item;
    });
    return Promise.resolve(updated);
  },

  // Adjust stock quantity by SKU
  async adjustInventory(inventoryList, skuOrProductId, adjustType, amount, reason = 'Điều chỉnh tồn kho') {
    const qty = parseInt(amount, 10) || 0;
    const updated = inventoryList.map(item => {
      if (item.sku === skuOrProductId || item.productId === skuOrProductId || item.id === skuOrProductId) {
        let physicalStock = item.physicalStock || item.quantity || 0;
        if (adjustType === 'ADD' || adjustType === 'add') physicalStock += qty;
        else if (adjustType === 'SUB' || adjustType === 'sub') physicalStock = Math.max(0, physicalStock - qty);
        else if (adjustType === 'SET' || adjustType === 'set') physicalStock = Math.max(0, qty);

        const reservedStock = item.reservedStock || item.reservedQuantity || 0;
        const availableStock = Math.max(0, physicalStock - reservedStock);
        return {
          ...item,
          physicalStock,
          quantity: physicalStock,
          availableStock,
          availableQuantity: availableStock,
          updatedAt: new Date().toLocaleDateString('vi-VN')
        };
      }
      return item;
    });
    return Promise.resolve(updated);
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

export default sellerService;

