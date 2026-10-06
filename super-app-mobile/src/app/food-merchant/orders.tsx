import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  Platform, SafeAreaView, StatusBar, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, RefreshControl, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useFoodMerchant } from '../../context/FoodMerchantContext';
import { FoodMerchantOrder } from '../../services/foodMerchantService';

const FILTER_TABS = [
  { key: 'ALL', label: 'Tất cả', statuses: [] },
  { key: 'NEW', label: 'Mới', statuses: ['PENDING'] },
  { key: 'CONFIRMED', label: 'Đã nhận', statuses: ['CONFIRMED'] },
  { key: 'PREPARING', label: 'Đang nấu', statuses: ['PREPARING'] },
  { key: 'FINDING_DRIVER', label: 'Chờ tài xế', statuses: ['FINDING_DRIVER'] },
  { key: 'DELIVERING', label: 'Đang giao', statuses: ['DRIVER_ACCEPTED', 'PICKED_UP'] },
  { key: 'COMPLETED', label: 'Hoàn thành', statuses: ['COMPLETED'] },
  { key: 'CANCELLED', label: 'Đã hủy', statuses: ['CANCELLED'] },
];

const REJECT_REASONS = [
  'Hết nguyên liệu chế biến',
  'Quán đang quá tải giờ cao điểm',
  'Quán chuẩn bị đóng cửa',
  'Khách yêu cầu món không có trong thực đơn',
  'Lý do khác',
];

export default function MerchantOrders() {
  const { 
    orders, 
    newOrdersCount, 
    inProgressCount, 
    deliveringCount,
    isAlarming,
    refreshOrders,
    confirmOrder,
    startPreparing,
    markReady,
    rejectOrder,
    stopAlarm,
  } = useFoodMerchant();

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<FoodMerchantOrder | null>(null);
  
  // State Modal Từ chối
  const [rejectingOrder, setRejectingOrder] = useState<FoodMerchantOrder | null>(null);
  const [selectedReason, setSelectedReason] = useState(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const primaryColor = '#0066FF';

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const activeTabConfig = FILTER_TABS[activeTabIdx];
  const filteredOrders = activeTabConfig.statuses.length === 0
    ? orders
    : orders.filter((o) => activeTabConfig.statuses.includes(o.status));

  // Handler xử lý tiếp nhận
  const handleConfirm = async (orderId: string) => {
    setSubmittingAction(true);
    await confirmOrder(orderId);
    setSubmittingAction(false);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: 'CONFIRMED' } : null);
    }
  };

  // Handler xử lý nấu món
  const handleStartPreparing = async (orderId: string) => {
    setSubmittingAction(true);
    await startPreparing(orderId);
    setSubmittingAction(false);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: 'PREPARING' } : null);
    }
  };

  // Handler xử lý báo xong món
  const handleMarkReady = async (orderId: string) => {
    setSubmittingAction(true);
    await markReady(orderId);
    setSubmittingAction(false);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: 'FINDING_DRIVER' } : null);
    }
  };

  // Handler gửi lý do từ chối
  const handleSendReject = async () => {
    if (!rejectingOrder) return;
    const finalReason = selectedReason === 'Lý do khác' ? (customReason.trim() || 'Quán từ chối tiếp nhận') : selectedReason;
    
    setSubmittingAction(true);
    await rejectOrder(rejectingOrder.id, finalReason);
    setSubmittingAction(false);
    if (selectedOrder?.id === rejectingOrder.id) {
      setSelectedOrder(null);
    }
    setRejectingOrder(null);
    setCustomReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Mới chờ nhận', color: '#D97706', bg: '#FEF3C7', icon: 'time' };
      case 'CONFIRMED':
        return { text: 'Đã nhận', color: '#2563EB', bg: '#EFF6FF', icon: 'checkmark-circle' };
      case 'PREPARING':
        return { text: 'Đang nấu', color: '#D97706', bg: '#FFFBEB', icon: 'flame' };
      case 'FINDING_DRIVER':
        return { text: 'Chờ tài xế', color: '#7C3AED', bg: '#F5F3FF', icon: 'bicycle' };
      case 'DRIVER_ACCEPTED':
        return { text: 'Tài xế đã nhận', color: '#7C3AED', bg: '#F5F3FF', icon: 'bicycle' };
      case 'PICKED_UP':
        return { text: 'Đang giao', color: '#0284C7', bg: '#F0F9FF', icon: 'navigate' };
      case 'COMPLETED':
        return { text: 'Hoàn tất', color: '#059669', bg: '#ECFDF5', icon: 'checkmark-done-circle' };
      case 'CANCELLED':
        return { text: 'Đã hủy', color: '#DC2626', bg: '#FEF2F2', icon: 'close-circle' };
      default:
        return { text: status, color: '#64748B', bg: '#F1F5F9', icon: 'ellipse' };
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

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.getDate()}/${d.getMonth() + 1}`;
  };

  // Tính thời gian chờ (phút) từ lúc tạo đơn
  const getWaitingTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin <= 0) return 'Vừa đặt';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const hours = Math.floor(diffMin / 60);
    return `${hours} giờ ${diffMin % 60}p trước`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Quản Lý Đơn Hàng</Text>
          <Text style={styles.headerSub}>Tổng cộng {orders.length} đơn • Cập nhật tự động realtime</Text>
        </View>

        {isAlarming && (
          <TouchableOpacity style={styles.stopAlarmBtn} onPress={stopAlarm}>
            <Ionicons name="volume-mute" size={16} color="#DC2626" />
            <Text style={styles.stopAlarmText}>Tắt chuông</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {FILTER_TABS.map((tab, idx) => {
            const isActive = activeTabIdx === idx;
            let badge = 0;
            if (tab.key === 'NEW') badge = newOrdersCount;
            if (tab.key === 'PREPARING') badge = inProgressCount;
            if (tab.key === 'DELIVERING') badge = deliveringCount;

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTabIdx(idx)}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {badge > 0 && (
                  <View style={[styles.tabBadge, { backgroundColor: tab.key === 'NEW' ? '#DC2626' : '#0066FF' }]}>
                    <Text style={styles.tabBadgeText}>{badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Danh Sách Đơn Hàng */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={44} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={styles.emptySub}>
              {activeTabConfig.key === 'ALL'
                ? 'Hiện chưa có đơn hàng nào trong hệ thống.'
                : `Không có đơn hàng nào ở mục "${activeTabConfig.label}".`}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const totalQty = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;

            return (
              <Animated.View key={order.id} entering={FadeInUp.duration(250)} style={styles.orderCard}>
                {/* Header đơn */}
                <TouchableOpacity 
                  style={styles.cardHeader}
                  onPress={() => setSelectedOrder(order)}
                >
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.orderCode}>#{order.orderCode}</Text>
                      <View style={[styles.statusTag, { backgroundColor: badge.bg }]}>
                        <Ionicons name={badge.icon as any} size={12} color={badge.color} />
                        <Text style={[styles.statusTagText, { color: badge.color }]}>{badge.text}</Text>
                      </View>
                    </View>
                    <Text style={styles.orderWaitTime}>⏱️ {getWaitingTime(order.createdAt)} ({formatTime(order.createdAt)})</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.orderTotal}>{formatPrice(order.total || order.subtotal || 0)}</Text>
                    <Text style={styles.orderPayout}>
                      Quán nhận 90%: <Text style={{ fontWeight: '700', color: '#059669' }}>
                        {formatPrice(order.restaurantPayout || Math.round((order.subtotal || order.total || 0) * 0.9))}
                      </Text>
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Thông tin khách hàng & món ăn */}
                <TouchableOpacity 
                  style={styles.cardBody}
                  onPress={() => setSelectedOrder(order)}
                >
                  <View style={styles.customerRow}>
                    <Ionicons name="person-outline" size={15} color="#64748B" />
                    <Text style={styles.customerNameText} numberOfLines={1}>
                      {order.user?.fullName || order.user?.name || 'Khách hàng'} • {order.user?.phone || 'Đã xác thực'}
                    </Text>
                  </View>

                  <View style={styles.itemsSummaryRow}>
                    <Ionicons name="fast-food-outline" size={15} color="#0066FF" />
                    <Text style={styles.itemsSummaryText} numberOfLines={2}>
                      <Text style={{ fontWeight: '700', color: '#0F172A' }}>{totalQty} món: </Text>
                      {order.items?.map((it) => `${it.quantity}x ${it.name || it.menuItem?.name}`).join(', ')}
                    </Text>
                  </View>

                  <View style={styles.payMethodRow}>
                    <Ionicons name="card-outline" size={15} color="#64748B" />
                    <Text style={styles.payMethodText}>
                      {order.paymentMethod === 'WALLET' ? 'Ví V-Life (Thanh toán online an toàn)' : 'Tiền mặt khi giao (COD)'}
                    </Text>
                  </View>

                  {order.driver && (
                    <View style={styles.driverRow}>
                      <Ionicons name="bicycle" size={15} color="#7C3AED" />
                      <Text style={styles.driverText}>
                        Tài xế: {order.driver.fullName} • {order.driver.licensePlate || 'Xe máy'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* NÚT XỬ LÝ THEO STATE MACHINE BACKEND */}
                <View style={styles.cardFooter}>
                  {/* PENDING -> NHẬN ĐƠN / TỪ CHỐI */}
                  {order.status === 'PENDING' && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.btnReject}
                        onPress={() => {
                          setRejectingOrder(order);
                          setSelectedReason(REJECT_REASONS[0]);
                          setCustomReason('');
                        }}
                        disabled={submittingAction}
                      >
                        <Ionicons name="close" size={16} color="#DC2626" />
                        <Text style={styles.btnRejectText}>TỪ CHỐI</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnConfirm}
                        onPress={() => handleConfirm(order.id)}
                        disabled={submittingAction}
                      >
                        {submittingAction ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                            <Text style={styles.btnConfirmText}>NHẬN ĐƠN</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* CONFIRMED -> BẮT ĐẦU CHUẨN BỊ */}
                  {order.status === 'CONFIRMED' && (
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={() => handleStartPreparing(order.id)}
                      disabled={submittingAction}
                    >
                      <Ionicons name="flame" size={16} color="#FFFFFF" />
                      <Text style={styles.btnPrimaryText}>BẮT ĐẦU CHUẨN BỊ</Text>
                    </TouchableOpacity>
                  )}

                  {/* PREPARING -> MÓN ĐÃ XONG (Sẵn sàng tìm tài xế) */}
                  {order.status === 'PREPARING' && (
                    <TouchableOpacity
                      style={[styles.btnPrimary, { backgroundColor: '#10B981' }]}
                      onPress={() => handleMarkReady(order.id)}
                      disabled={submittingAction}
                    >
                      <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                      <Text style={styles.btnPrimaryText}>MÓN ĐÃ XONG (TÌM TÀI XẾ)</Text>
                    </TouchableOpacity>
                  )}

                  {/* Các trạng thái đang do Tài xế / Vận chuyển xử lý */}
                  {['FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
                    <TouchableOpacity
                      style={styles.btnViewDetail}
                      onPress={() => setSelectedOrder(order)}
                    >
                      <Text style={styles.btnViewDetailText}>Xem chi tiết tiến độ đơn hàng</Text>
                      <Ionicons name="chevron-forward" size={16} color="#64748B" />
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL CHI TIẾT ĐƠN HÀNG (ORDER DETAIL) */}
      {/* ======================================================== */}
      <Modal visible={Boolean(selectedOrder)} animationType="slide">
        <SafeAreaView style={styles.orderDetailSafeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          {/* Header Chi tiết */}
          <View style={styles.detailHeader}>
            <TouchableOpacity 
              style={styles.detailBackBtn}
              onPress={() => setSelectedOrder(null)}
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.detailTitle}>Đơn hàng #{selectedOrder?.orderCode}</Text>
              <Text style={styles.detailSub}>Mã ID: {selectedOrder?.id?.slice(0, 16)}...</Text>
            </View>
            {selectedOrder && (
              <View style={[styles.statusTag, { backgroundColor: getStatusBadge(selectedOrder.status).bg }]}>
                <Text style={[styles.statusTagText, { color: getStatusBadge(selectedOrder.status).color }]}>
                  {getStatusBadge(selectedOrder.status).text}
                </Text>
              </View>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
            {/* THÔNG TIN KHÁCH HÀNG */}
            <View style={styles.detailCard}>
              <View style={styles.detailSectionTitleRow}>
                <Ionicons name="person" size={18} color="#0066FF" />
                <Text style={styles.detailSectionTitle}>Thông Tin Khách Hàng</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tên khách:</Text>
                <Text style={styles.infoValue}>
                  {selectedOrder?.user?.fullName || selectedOrder?.user?.name || 'Khách hàng V-Life'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                <Text style={[styles.infoValue, { color: '#0066FF', fontWeight: '700' }]}>
                  {selectedOrder?.user?.phone || 'Đã xác thực danh tính'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Địa chỉ giao:</Text>
                <Text style={styles.infoValue}>{selectedOrder?.deliveryAddress || 'Giao tận nơi'}</Text>
              </View>
              {selectedOrder?.noteForMerchant && (
                <View style={styles.merchantNoteBox}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#D97706" />
                  <Text style={styles.merchantNoteText}>
                    <Text style={{ fontWeight: '700' }}>Lời nhắn cho quán: </Text>
                    {selectedOrder.noteForMerchant}
                  </Text>
                </View>
              )}
            </View>

            {/* THÔNG TIN TÀI XẾ (Nếu đã có) */}
            {selectedOrder?.driver && (
              <View style={styles.detailCard}>
                <View style={styles.detailSectionTitleRow}>
                  <Ionicons name="bicycle" size={18} color="#7C3AED" />
                  <Text style={styles.detailSectionTitle}>Thông Tin Tài Xế Giao Hàng</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tài xế:</Text>
                  <Text style={styles.infoValue}>{selectedOrder.driver.fullName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số điện thoại:</Text>
                  <Text style={[styles.infoValue, { color: '#0066FF', fontWeight: '700' }]}>
                    {selectedOrder.driver.phone}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phương tiện:</Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder.driver.vehicleType || 'Xe máy'} • {selectedOrder.driver.licensePlate}
                  </Text>
                </View>
              </View>
            )}

            {/* DANH SÁCH MÓN ĂN */}
            <View style={styles.detailCard}>
              <View style={styles.detailSectionTitleRow}>
                <Ionicons name="restaurant" size={18} color="#0066FF" />
                <Text style={styles.detailSectionTitle}>Món Ăn ({selectedOrder?.items?.length || 0})</Text>
              </View>

              {selectedOrder?.items?.map((it, idx) => (
                <View key={idx} style={styles.detailFoodItemRow}>
                  <View style={styles.foodQtyWrap}>
                    <Text style={styles.foodQtyText}>{it.quantity}x</Text>
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.foodName}>{it.name || it.menuItem?.name || 'Món ăn'}</Text>
                    {it.optionsJson && (
                      <Text style={styles.foodOptionsText}>
                        {typeof it.optionsJson === 'string' ? it.optionsJson : JSON.stringify(it.optionsJson)}
                      </Text>
                    )}
                    {it.notes && (
                      <Text style={styles.foodItemNotes}>Ghi chú: {it.notes}</Text>
                    )}
                  </View>
                  <Text style={styles.foodPrice}>
                    {formatPrice(it.totalPrice || it.customerPrice || it.unitPrice || 0)}
                  </Text>
                </View>
              ))}
            </View>

            {/* CHI TIẾT THANH TOÁN (Minh bạch 90% - 110% - 20%) */}
            <View style={styles.detailCard}>
              <View style={styles.detailSectionTitleRow}>
                <Ionicons name="cash" size={18} color="#10B981" />
                <Text style={styles.detailSectionTitle}>Chi Tiết Thanh Toán & Doanh Thu</Text>
              </View>

              <View style={styles.billDetailRow}>
                <Text style={styles.billDetailLabel}>Tiền món khách trả (Subtotal):</Text>
                <Text style={styles.billDetailVal}>{formatPrice(selectedOrder?.subtotal || 0)}</Text>
              </View>
              <View style={styles.billDetailRow}>
                <Text style={styles.billDetailLabel}>Phí giao hàng (Dành cho tài xế):</Text>
                <Text style={styles.billDetailVal}>{formatPrice(selectedOrder?.shippingFee || 0)}</Text>
              </View>
              {Boolean(selectedOrder?.discountAmount) && (
                <View style={styles.billDetailRow}>
                  <Text style={styles.billDetailLabel}>Khuyến mãi:</Text>
                  <Text style={[styles.billDetailVal, { color: '#059669' }]}>
                    -{formatPrice(selectedOrder?.discountAmount || 0)}
                  </Text>
                </View>
              )}
              <View style={styles.billDetailRow}>
                <Text style={styles.billDetailLabel}>Tổng tiền đơn hàng:</Text>
                <Text style={[styles.billDetailVal, { fontWeight: '700', color: '#0F172A', fontSize: 15 }]}>
                  {formatPrice(selectedOrder?.total || 0)}
                </Text>
              </View>
              <View style={styles.billDetailRow}>
                <Text style={styles.billDetailLabel}>Phương thức:</Text>
                <Text style={styles.billDetailVal}>
                  {selectedOrder?.paymentMethod === 'WALLET' ? 'Ví V-Life' : 'Tiền mặt COD'}
                </Text>
              </View>
              <View style={styles.billDetailRow}>
                <Text style={styles.billDetailLabel}>Trạng thái thanh toán:</Text>
                <Text style={[styles.billDetailVal, { color: selectedOrder?.paymentStatus === 'PAID' ? '#059669' : '#D97706', fontWeight: '600' }]}>
                  {selectedOrder?.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </Text>
              </View>

              {/* Hộp quyết toán thực nhận của quán */}
              <View style={styles.payoutHighlightBox}>
                <Text style={styles.payoutHighlightLabel}>TIỀN QUÁN THỰC NHẬN (90% GIÁ MÓN)</Text>
                <Text style={styles.payoutHighlightVal}>
                  {formatPrice(selectedOrder?.restaurantPayout || Math.round((selectedOrder?.subtotal || 0) * 0.9))}
                </Text>
                <Text style={styles.payoutHighlightNote}>
                  * V-Life đối soát và kết chuyển tự động vào tài khoản ngân hàng của quán
                </Text>
              </View>
            </View>

            {/* TIMELINE TIẾN ĐỘ THỰC TẾ CÓ TIMESTAMP */}
            <View style={styles.detailCard}>
              <View style={styles.detailSectionTitleRow}>
                <Ionicons name="time" size={18} color="#0066FF" />
                <Text style={styles.detailSectionTitle}>Tiến Trình Đơn Hàng (Timeline)</Text>
              </View>

              <View style={styles.timelineWrapper}>
                {[
                  { title: 'Khách đặt hàng', time: selectedOrder?.createdAt, done: true },
                  { title: 'Quán đã xác nhận', time: selectedOrder?.confirmedAt, done: ['CONFIRMED', 'PREPARING', 'FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(selectedOrder?.status || '') },
                  { title: 'Đang nấu / Chuẩn bị', time: selectedOrder?.preparingAt, done: ['PREPARING', 'FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(selectedOrder?.status || '') },
                  { title: 'Chờ tìm tài xế giao', time: selectedOrder?.readyAt, done: ['FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(selectedOrder?.status || '') },
                  { title: 'Tài xế đã nhận đơn', time: null, done: ['DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(selectedOrder?.status || '') },
                  { title: 'Tài xế đã lấy món', time: selectedOrder?.pickedUpAt, done: ['PICKED_UP', 'COMPLETED'].includes(selectedOrder?.status || '') },
                  { title: 'Giao hàng thành công', time: selectedOrder?.completedAt, done: selectedOrder?.status === 'COMPLETED' },
                ].map((step, idx, arr) => (
                  <View key={idx} style={styles.timelineRow}>
                    <View style={styles.timelineIndicator}>
                      <View style={[styles.timelineDot, step.done && styles.timelineDotActive]} />
                      {idx < arr.length - 1 && (
                        <View style={[styles.timelineLine, step.done && styles.timelineLineActive]} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineStepTitle, step.done && styles.timelineStepTitleActive]}>
                        {step.title}
                      </Text>
                      {step.time && (
                        <Text style={styles.timelineStepTime}>
                          {formatDateTime(step.time)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* THANH THAO TÁC CỐ ĐỊNH Ở ĐÁY THEO STATE MACHINE */}
          {selectedOrder && (
            <View style={styles.detailBottomBar}>
              {selectedOrder.status === 'PENDING' && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.btnReject}
                    onPress={() => {
                      const o = selectedOrder;
                      setSelectedOrder(null);
                      setRejectingOrder(o);
                    }}
                  >
                    <Ionicons name="close" size={16} color="#DC2626" />
                    <Text style={styles.btnRejectText}>TỪ CHỐI</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnConfirm}
                    onPress={() => handleConfirm(selectedOrder.id)}
                    disabled={submittingAction}
                  >
                    {submittingAction ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                        <Text style={styles.btnConfirmText}>NHẬN ĐƠN</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {selectedOrder.status === 'CONFIRMED' && (
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => handleStartPreparing(selectedOrder.id)}
                  disabled={submittingAction}
                >
                  <Ionicons name="flame" size={18} color="#FFFFFF" />
                  <Text style={styles.btnPrimaryText}>BẮT ĐẦU CHUẨN BỊ</Text>
                </TouchableOpacity>
              )}

              {selectedOrder.status === 'PREPARING' && (
                <TouchableOpacity
                  style={[styles.btnPrimary, { backgroundColor: '#10B981' }]}
                  onPress={() => handleMarkReady(selectedOrder.id)}
                  disabled={submittingAction}
                >
                  <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                  <Text style={styles.btnPrimaryText}>MÓN ĐÃ XONG (TÌM TÀI XẾ GIAO)</Text>
                </TouchableOpacity>
              )}

              {['FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP'].includes(selectedOrder.status) && (
                <View style={styles.statusNoticeBox}>
                  <Ionicons name="information-circle" size={18} color="#0066FF" />
                  <Text style={styles.statusNoticeText}>
                    Đơn hàng đang trong tiến trình giao bởi Tài xế. Bạn có thể theo dõi vị trí và liên hệ khi cần.
                  </Text>
                </View>
              )}

              {selectedOrder.status === 'COMPLETED' && (
                <View style={[styles.statusNoticeBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  <Text style={[styles.statusNoticeText, { color: '#065F46' }]}>
                    Đơn hàng đã hoàn thành và quyết toán thành công vào doanh thu quán.
                  </Text>
                </View>
              )}

              {selectedOrder.status === 'CANCELLED' && (
                <View style={[styles.statusNoticeBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={[styles.statusNoticeText, { color: '#991B1B' }]}>
                    Đơn hàng đã bị hủy. Lý do: {selectedOrder.cancelledReason || 'Không có lý do cụ thể'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL TỪ CHỐI ĐƠN HÀNG */}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  stopAlarmBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
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
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#0066FF',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderWaitTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderPayout: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardBody: {
    padding: 14,
    gap: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  itemsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemsSummaryText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
  payMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payMethodText: {
    fontSize: 12,
    color: '#64748B',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    padding: 6,
    borderRadius: 8,
  },
  driverText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D28D9',
  },
  cardFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnReject: {
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
  btnRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  btnConfirm: {
    flex: 1.5,
    backgroundColor: '#0066FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnPrimary: {
    backgroundColor: '#0066FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnViewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  btnViewDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  orderDetailSafeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailSub: {
    fontSize: 11,
    color: '#64748B',
  },
  detailScroll: {
    padding: 16,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'right',
  },
  merchantNoteBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    flexDirection: 'row',
    gap: 6,
  },
  merchantNoteText: {
    fontSize: 12,
    color: '#B45309',
    flex: 1,
  },
  detailFoodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  foodQtyWrap: {
    width: 28,
  },
  foodQtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0066FF',
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  foodOptionsText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  foodItemNotes: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 2,
    fontStyle: 'italic',
  },
  foodPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  billDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billDetailLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  billDetailVal: {
    fontSize: 13,
    color: '#0F172A',
  },
  payoutHighlightBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  payoutHighlightLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  payoutHighlightVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  payoutHighlightNote: {
    fontSize: 10,
    color: '#047857',
    marginTop: 4,
    textAlign: 'center',
  },
  timelineWrapper: {
    paddingLeft: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    marginTop: 2,
  },
  timelineDotActive: {
    backgroundColor: '#0066FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineLineActive: {
    backgroundColor: '#0066FF',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineStepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  timelineStepTitleActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  timelineStepTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  detailBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
  },
  statusNoticeBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusNoticeText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 16,
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
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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
});
