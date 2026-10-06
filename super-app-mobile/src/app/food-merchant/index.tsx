import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  Platform, SafeAreaView, StatusBar,
  TouchableOpacity, Switch, ActivityIndicator, RefreshControl, Image, Modal, TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFoodMerchant } from '../../context/FoodMerchantContext';
import { FoodMerchantOrder } from '../../services/foodMerchantService';

const REJECT_REASONS = [
  'Hết nguyên liệu chế biến',
  'Quán đang quá tải giờ cao điểm',
  'Quán chuẩn bị đóng cửa',
  'Khách yêu cầu món không có trong thực đơn',
  'Lý do khác',
];

export default function MerchantDashboard() {
  const router = useRouter();
  const { 
    restaurant, 
    orders, 
    newOrdersCount, 
    inProgressCount, 
    deliveringCount, 
    todayCompletedCount,
    todayRevenue,
    weekRevenue,
    todayOrdersCount,
    loading,
    refreshing,
    isAlarming,
    isMerchantAuthorized,
    refreshProfile,
    refreshOrders,
    refreshFinancials,
    toggleOpen,
    confirmOrder,
    rejectOrder,
    stopAlarm,
    loginMerchant,
  } = useFoodMerchant();

  const [togglingOpen, setTogglingOpen] = useState(false);
  const [rejectingOrder, setRejectingOrder] = useState<FoodMerchantOrder | null>(null);
  const [selectedReason, setSelectedReason] = useState(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Modal xem nhanh đơn hàng
  const [quickViewOrder, setQuickViewOrder] = useState<FoodMerchantOrder | null>(null);

  // State đăng nhập thủ công nếu cần
  const [loginPhone, setLoginPhone] = useState('0911111111');
  const [loginPassword, setLoginPassword] = useState('Password@123');

  const primaryColor = '#0066FF';

  const handleToggleOpen = async (val: boolean) => {
    setTogglingOpen(true);
    await toggleOpen(val);
    setTogglingOpen(false);
  };

  const onRefresh = async () => {
    await Promise.all([refreshProfile(), refreshOrders(), refreshFinancials()]);
  };

  // Các đơn hàng mới (PENDING)
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');

  // Xử lý nhận đơn nhanh
  const handleConfirmOrder = async (orderId: string) => {
    setSubmittingAction(true);
    await confirmOrder(orderId);
    setSubmittingAction(false);
    if (quickViewOrder?.id === orderId) {
      setQuickViewOrder(null);
    }
  };

  // Gửi từ chối đơn
  const handleSendReject = async () => {
    if (!rejectingOrder) return;
    const finalReason = selectedReason === 'Lý do khác' ? (customReason.trim() || 'Quán từ chối tiếp nhận') : selectedReason;
    setSubmittingAction(true);
    await rejectOrder(rejectingOrder.id, finalReason);
    setSubmittingAction(false);
    setRejectingOrder(null);
    setCustomReason('');
    if (quickViewOrder?.id === rejectingOrder.id) {
      setQuickViewOrder(null);
    }
  };

  const formatPrice = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + 'đ';
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Màn hình yêu cầu đăng nhập tài khoản chủ quán
  if (!isMerchantAuthorized) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <View style={styles.authIconCircle}>
              <Ionicons name="storefront" size={40} color={primaryColor} />
            </View>
            <Text style={styles.authTitle}>V-Life Food Merchant</Text>
            <Text style={styles.authSub}>
              Tài khoản hiện tại chưa được cấp quyền quản lý nhà hàng. Vui lòng đăng nhập với tài khoản Chủ quán.
            </Text>

            {/* Phím đăng nhập 1-chạm vào quán thật */}
            <View style={{ width: '100%', marginVertical: 16, gap: 10 }}>
              <TouchableOpacity
                style={styles.quickLoginBtn}
                onPress={() => loginMerchant('0911111111', 'Password@123')}
              >
                <Ionicons name="pizza" size={20} color="#0066FF" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickLoginTitle}>Quán Pizza Company & Pasta</Text>
                  <Text style={styles.quickLoginPhone}>SĐT: 0911 111 111 (Chủ quán)</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickLoginBtn}
                onPress={() => loginMerchant('0933333333', 'Password@123')}
              >
                <Ionicons name="cafe" size={20} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickLoginTitle}>Quán Trà Sữa Lab</Text>
                  <Text style={styles.quickLoginPhone}>SĐT: 0933 333 333 (Chủ quán)</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.returnBtn}
              onPress={() => router.replace('/account' as any)}
            >
              <Text style={styles.returnBtnText}>Về trang người dùng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          {restaurant?.avatar ? (
            <Image source={{ uri: restaurant.avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Ionicons name="restaurant" size={20} color={primaryColor} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerStoreName} numberOfLines={1}>
              {restaurant?.name || 'Nhà hàng của bạn'}
            </Text>
            <View style={styles.statusBadgeRow}>
              <View style={[styles.statusDot, { backgroundColor: restaurant?.isOpen ? '#10B981' : '#EF4444' }]} />
              <Text style={[styles.statusBadgeText, { color: restaurant?.isOpen ? '#059669' : '#DC2626' }]}>
                {restaurant?.isOpen ? 'Đang mở cửa' : 'Đang đóng cửa'}
              </Text>
              <Text style={styles.statusDivider}>•</Text>
              <Text style={styles.headerHoursText}>
                {restaurant?.openingHours || '08:00 - 22:00'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.headerExitBtn}
          onPress={() => router.replace('/account' as any)}
          accessibilityLabel="Trở về tài khoản"
        >
          <Ionicons name="exit-outline" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
      >
        {/* Banner chuông báo động nếu có đơn mới reo */}
        {isAlarming && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.alarmBanner}>
            <View style={styles.alarmLeft}>
              <View style={styles.alarmIconPulse}>
                <Ionicons name="notifications" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.alarmTitle}>CÓ ĐƠN HÀNG MỚI ĐANG CHỜ!</Text>
                <Text style={styles.alarmSub}>Chuông đang reo báo hiệu...</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.stopAlarmBtn} onPress={stopAlarm}>
              <Ionicons name="volume-mute" size={16} color="#DC2626" />
              <Text style={styles.stopAlarmText}>Tắt chuông</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Banner nếu quán ĐANG ĐÓNG CỬA */}
        {!restaurant?.isOpen && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.closedWarningBanner}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={styles.closedWarningTitle}>Quán đang đóng cửa</Text>
              <Text style={styles.closedWarningSub}>
                Khách hàng hiện không thể đặt món. Hãy bật công tắc bên dưới khi quán sẵn sàng phục vụ.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Thẻ Quản Lý Trạng Thái Bật/Tắt Quán */}
        <Animated.View entering={FadeInDown.duration(350)} style={styles.openToggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIconWrap, { backgroundColor: restaurant?.isOpen ? '#ECFDF5' : '#FEF2F2' }]}>
              <Ionicons 
                name={restaurant?.isOpen ? 'storefront' : 'moon'} 
                size={22} 
                color={restaurant?.isOpen ? '#059669' : '#DC2626'} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>
                {restaurant?.isOpen ? '🟢 Quán Đang Mở' : '🔴 Quán Đang Đóng'}
              </Text>
              <Text style={styles.toggleSub}>
                {restaurant?.isOpen 
                  ? 'Quán sẵn sàng nhận đơn và hiển thị trên ứng dụng khách' 
                  : 'Tạm ngưng tiếp nhận tất cả đơn hàng mới'}
              </Text>
            </View>
          </View>

          <View style={styles.toggleRight}>
            {togglingOpen ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : (
              <Switch
                value={Boolean(restaurant?.isOpen)}
                onValueChange={handleToggleOpen}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={restaurant?.isOpen ? '#0066FF' : '#94A3B8'}
              />
            )}
          </View>
        </Animated.View>

        {/* ======================================================== */}
        {/* KHU VỰC: ĐƠN HÀNG MỚI (Nổi bật cao nhất theo yêu cầu) */}
        {/* ======================================================== */}
        {pendingOrders.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.urgentSection}>
            <View style={styles.urgentHeaderRow}>
              <View style={styles.urgentBadge}>
                <Ionicons name="flame" size={16} color="#FFFFFF" />
                <Text style={styles.urgentBadgeText}>ĐƠN HÀNG MỚI ({pendingOrders.length})</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/food-merchant/orders')}>
                <Text style={styles.urgentViewAll}>Xem tất cả đơn</Text>
              </TouchableOpacity>
            </View>

            {pendingOrders.map((order) => (
              <View key={order.id} style={styles.newOrderCard}>
                {/* Header đơn */}
                <View style={styles.newOrderHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.newOrderCode}>#{order.orderCode}</Text>
                    <View style={styles.newOrderPill}>
                      <Text style={styles.newOrderPillText}>Đơn mới</Text>
                    </View>
                  </View>
                  <View style={styles.newOrderTimeRow}>
                    <Ionicons name="time-outline" size={14} color="#64748B" />
                    <Text style={styles.newOrderTimeText}>{formatTime(order.createdAt)}</Text>
                  </View>
                </View>

                {/* Danh sách món */}
                <View style={styles.newOrderItemsList}>
                  {order.items?.map((it, idx) => (
                    <View key={idx} style={styles.newOrderItemRow}>
                      <Text style={styles.newOrderItemQty}>{it.quantity}x</Text>
                      <Text style={styles.newOrderItemName} numberOfLines={1}>
                        {it.name || it.menuItem?.name || 'Món ăn'}
                      </Text>
                      <Text style={styles.newOrderItemPrice}>
                        {formatPrice(it.totalPrice || it.customerPrice || it.unitPrice || 0)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Thông tin tiền & thanh toán */}
                <View style={styles.newOrderSummary}>
                  <View>
                    <Text style={styles.newOrderSummaryLabel}>Tổng ({order.items?.length || 0} món):</Text>
                    <Text style={styles.newOrderPaymentMethod}>
                      💳 {order.paymentMethod === 'WALLET' ? 'Ví V-Life (Đã TT)' : 'Tiền mặt COD'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.newOrderTotalText}>{formatPrice(order.total || order.subtotal || 0)}</Text>
                    <Text style={styles.newOrderPayoutText}>
                      Quán nhận 90%: <Text style={{ fontWeight: '700', color: '#059669' }}>
                        {formatPrice(order.restaurantPayout || Math.round((order.subtotal || order.total || 0) * 0.9))}
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* NÚT THAO TÁC: XEM ĐƠN, NHẬN ĐƠN, TỪ CHỐI */}
                <View style={styles.newOrderActionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnView}
                    onPress={() => setQuickViewOrder(order)}
                    disabled={submittingAction}
                  >
                    <Ionicons name="eye-outline" size={16} color="#334155" />
                    <Text style={styles.actionBtnViewText}>XEM ĐƠN</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnReject}
                    onPress={() => {
                      setRejectingOrder(order);
                      setSelectedReason(REJECT_REASONS[0]);
                      setCustomReason('');
                    }}
                    disabled={submittingAction}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                    <Text style={styles.actionBtnRejectText}>TỪ CHỐI</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnAccept}
                    onPress={() => handleConfirmOrder(order.id)}
                    disabled={submittingAction}
                  >
                    {submittingAction ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.actionBtnAcceptText}>NHẬN ĐƠN</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* DOANH THU & CHỈ SỐ KINH DOANH */}
        {/* ======================================================== */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.financeCard}>
          <View style={styles.financeHeader}>
            <View>
              <Text style={styles.financeHeaderSub}>DOANH THU THỰC NHẬN HÔM NAY (90%)</Text>
              <Text style={styles.financeHeaderMain}>{formatPrice(todayRevenue)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.financeDetailLink}
              onPress={() => router.push('/food-merchant/financials' as any)}
            >
              <Text style={styles.financeDetailLinkText}>Chi tiết</Text>
              <Ionicons name="chevron-forward" size={14} color={primaryColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.financeDivider} />

          <View style={styles.financeStatsRow}>
            <View style={styles.financeStatCol}>
              <Text style={styles.financeStatLabel}>Doanh thu 7 ngày</Text>
              <Text style={styles.financeStatValue}>{formatPrice(weekRevenue)}</Text>
            </View>
            <View style={styles.financeStatDivider} />
            <View style={styles.financeStatCol}>
              <Text style={styles.financeStatLabel}>Số đơn hôm nay</Text>
              <Text style={styles.financeStatValue}>{todayOrdersCount} đơn</Text>
            </View>
            <View style={styles.financeStatDivider} />
            <View style={styles.financeStatCol}>
              <Text style={styles.financeStatLabel}>Hoàn tất hôm nay</Text>
              <Text style={[styles.financeStatValue, { color: '#059669' }]}>{todayCompletedCount} đơn</Text>
            </View>
          </View>
        </Animated.View>

        {/* ======================================================== */}
        {/* THỐNG KÊ VẬN HÀNH TRONG NGÀY */}
        {/* ======================================================== */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Tiến Độ Xử Lý Đơn</Text>
          <View style={styles.metricsGrid}>
            <TouchableOpacity 
              style={[styles.metricBox, { borderLeftColor: '#F59E0B' }]}
              onPress={() => router.push('/food-merchant/orders' as any)}
            >
              <View style={styles.metricIconWrap}>
                <Ionicons name="receipt" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.metricValue}>{newOrdersCount}</Text>
              <Text style={styles.metricLabel}>Đơn mới chờ nhận</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.metricBox, { borderLeftColor: '#0066FF' }]}
              onPress={() => router.push('/food-merchant/orders' as any)}
            >
              <View style={styles.metricIconWrap}>
                <Ionicons name="restaurant" size={20} color="#0066FF" />
              </View>
              <Text style={styles.metricValue}>{inProgressCount}</Text>
              <Text style={styles.metricLabel}>Đang chuẩn bị</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.metricBox, { borderLeftColor: '#8B5CF6' }]}
              onPress={() => router.push('/food-merchant/orders' as any)}
            >
              <View style={styles.metricIconWrap}>
                <Ionicons name="bicycle" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.metricValue}>{deliveringCount}</Text>
              <Text style={styles.metricLabel}>Đang giao hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.metricBox, { borderLeftColor: '#10B981' }]}
              onPress={() => router.push('/food-merchant/orders' as any)}
            >
              <View style={styles.metricIconWrap}>
                <Ionicons name="checkmark-done-circle" size={20} color="#10B981" />
              </View>
              <Text style={styles.metricValue}>{todayCompletedCount}</Text>
              <Text style={styles.metricLabel}>Đã hoàn thành</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tiện ích nhanh */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Truy Cập Nhanh</Text>
          <View style={styles.quickAccessRow}>
            <TouchableOpacity 
              style={styles.quickAccessBtn}
              onPress={() => router.push('/food-merchant/menu' as any)}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="fast-food" size={22} color="#0066FF" />
              </View>
              <Text style={styles.quickAccessText}>Quản lý Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAccessBtn}
              onPress={() => router.push('/food-merchant/financials' as any)}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="bar-chart" size={22} color="#10B981" />
              </View>
              <Text style={styles.quickAccessText}>Báo cáo Tài chính</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAccessBtn}
              onPress={() => router.push('/food-merchant/profile' as any)}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: '#F8FAFC' }]}>
                <Ionicons name="settings" size={22} color="#64748B" />
              </View>
              <Text style={styles.quickAccessText}>Hồ sơ quán</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL XEM NHANH ĐƠN HÀNG */}
      {/* ======================================================== */}
      <Modal visible={Boolean(quickViewOrder)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Chi Tiết Đơn #{quickViewOrder?.orderCode}</Text>
                <Text style={styles.modalSub}>Thời gian đặt: {formatTime(quickViewOrder?.createdAt || '')}</Text>
              </View>
              <TouchableOpacity onPress={() => setQuickViewOrder(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              {/* Thông tin khách */}
              <View style={styles.customerBox}>
                <Ionicons name="person-circle-outline" size={24} color="#0066FF" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>
                    {quickViewOrder?.user?.fullName || quickViewOrder?.user?.name || 'Khách hàng V-Life'}
                  </Text>
                  {quickViewOrder?.user?.phone && (
                    <Text style={styles.customerPhone}>📞 {quickViewOrder.user.phone}</Text>
                  )}
                  <Text style={styles.customerAddress}>📍 {quickViewOrder?.deliveryAddress || 'Giao tận nơi'}</Text>
                </View>
              </View>

              {/* Món ăn */}
              <Text style={styles.subTitle}>Món ăn ({quickViewOrder?.items?.length || 0})</Text>
              {quickViewOrder?.items?.map((it, idx) => (
                <View key={idx} style={styles.modalItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemName}>{it.quantity}x {it.name || it.menuItem?.name}</Text>
                    {it.optionsJson && (
                      <Text style={styles.modalItemOption}>
                        {typeof it.optionsJson === 'string' ? it.optionsJson : JSON.stringify(it.optionsJson)}
                      </Text>
                    )}
                    {it.notes && <Text style={styles.modalItemNotes}>Ghi chú: {it.notes}</Text>}
                  </View>
                  <Text style={styles.modalItemPrice}>{formatPrice(it.totalPrice || it.unitPrice || 0)}</Text>
                </View>
              ))}

              {/* Thanh toán */}
              <View style={styles.billBox}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Tiền món:</Text>
                  <Text style={styles.billVal}>{formatPrice(quickViewOrder?.subtotal || 0)}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Hình thức:</Text>
                  <Text style={styles.billVal}>
                    {quickViewOrder?.paymentMethod === 'WALLET' ? 'Ví V-Life (Đã thanh toán)' : 'Tiền mặt khi nhận (COD)'}
                  </Text>
                </View>
                <View style={[styles.billRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
                  <Text style={[styles.billLabel, { fontWeight: '700', color: '#0F172A' }]}>Quán thực nhận (90%):</Text>
                  <Text style={[styles.billVal, { fontWeight: '700', color: '#059669', fontSize: 16 }]}>
                    {formatPrice(quickViewOrder?.restaurantPayout || Math.round((quickViewOrder?.subtotal || 0) * 0.9))}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalRejectBtn}
                onPress={() => {
                  const o = quickViewOrder;
                  setQuickViewOrder(null);
                  setRejectingOrder(o);
                }}
              >
                <Text style={styles.modalRejectText}>TỪ CHỐI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalAcceptBtn}
                onPress={() => quickViewOrder && handleConfirmOrder(quickViewOrder.id)}
              >
                <Text style={styles.modalAcceptText}>NHẬN ĐƠN NGAY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL TỪ CHỐI ĐƠN HÀNG (Bắt buộc lý do) */}
      {/* ======================================================== */}
      <Modal visible={Boolean(rejectingOrder)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Từ Chối Đơn #{rejectingOrder?.orderCode}</Text>
                <Text style={styles.modalSub}>Vui lòng chọn lý do từ chối để thông báo đến khách</Text>
              </View>
              <TouchableOpacity onPress={() => setRejectingOrder(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ marginVertical: 12 }}>
              {REJECT_REASONS.map((r, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.reasonOption, selectedReason === r && styles.reasonOptionActive]}
                  onPress={() => setSelectedReason(r)}
                >
                  <Ionicons
                    name={selectedReason === r ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={selectedReason === r ? '#0066FF' : '#94A3B8'}
                  />
                  <Text style={[styles.reasonText, selectedReason === r && styles.reasonTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}

              {selectedReason === 'Lý do khác' && (
                <TextInput
                  style={styles.customReasonInput}
                  placeholder="Nhập lý do cụ thể..."
                  placeholderTextColor="#94A3B8"
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                />
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setRejectingOrder(null)}
              >
                <Text style={styles.modalCancelText}>Quay lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmRejectBtn}
                onPress={handleSendReject}
                disabled={submittingAction}
              >
                {submittingAction ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmRejectText}>Xác nhận từ chối</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
  },
  headerAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStoreName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusDivider: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  headerHoursText: {
    fontSize: 12,
    color: '#64748B',
  },
  headerExitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  alarmBanner: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  alarmLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  alarmIconPulse: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  alarmSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
  },
  stopAlarmBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stopAlarmText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  closedWarningBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  closedWarningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  closedWarningSub: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 2,
  },
  openToggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  toggleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  toggleRight: {
    marginLeft: 8,
  },
  urgentSection: {
    marginBottom: 18,
  },
  urgentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  urgentBadge: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  urgentViewAll: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066FF',
  },
  newOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  newOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  newOrderCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  newOrderPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newOrderPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  newOrderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newOrderTimeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  newOrderItemsList: {
    gap: 6,
    marginBottom: 10,
  },
  newOrderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newOrderItemQty: {
    width: 24,
    fontSize: 13,
    fontWeight: '700',
    color: '#0066FF',
  },
  newOrderItemName: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  newOrderItemPrice: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  newOrderSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  newOrderSummaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  newOrderPaymentMethod: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  newOrderTotalText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  newOrderPayoutText: {
    fontSize: 11,
    color: '#64748B',
  },
  newOrderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnView: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnViewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  actionBtnReject: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnRejectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  actionBtnAccept: {
    flex: 1.3,
    backgroundColor: '#0066FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnAcceptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  financeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  financeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  financeHeaderSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  financeHeaderMain: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  financeDetailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  financeDetailLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066FF',
  },
  financeDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  financeStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  financeStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  financeStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  financeStatLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  financeStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  metricsSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
  },
  metricIconWrap: {
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quickAccessSection: {
    marginBottom: 18,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAccessBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  quickAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
  },
  customerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  customerPhone: {
    fontSize: 12,
    color: '#0066FF',
    marginTop: 1,
  },
  customerAddress: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  modalItemOption: {
    fontSize: 11,
    color: '#64748B',
  },
  modalItemNotes: {
    fontSize: 11,
    color: '#D97706',
    fontStyle: 'italic',
  },
  modalItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  billBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  billLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  billVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalRejectBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalAcceptBtn: {
    flex: 1.5,
    backgroundColor: '#0066FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalAcceptText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  reasonText: {
    fontSize: 13,
    color: '#334155',
  },
  reasonTextActive: {
    fontWeight: '600',
    color: '#0066FF',
  },
  customReasonInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  modalConfirmRejectBtn: {
    flex: 1.5,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  authIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  authSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  quickLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  quickLoginTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickLoginPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  returnBtn: {
    marginTop: 12,
    paddingVertical: 10,
  },
  returnBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
