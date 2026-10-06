import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  Platform, SafeAreaView, StatusBar, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFoodMerchant } from '../../../context/FoodMerchantContext';
import { FoodMerchantOrder, foodMerchantService } from '../../../services/foodMerchantService';

const REJECT_REASONS = [
  'Hết nguyên liệu chế biến',
  'Quán đang quá tải giờ cao điểm',
  'Quán chuẩn bị đóng cửa',
  'Khách yêu cầu món không có trong thực đơn',
  'Lý do khác',
];

export default function MerchantOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    confirmOrder, 
    startPreparing, 
    markReady, 
    rejectOrder, 
    orders 
  } = useFoodMerchant();

  const [order, setOrder] = useState<FoodMerchantOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Modal Từ chối
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const fetchOrderDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await foodMerchantService.getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      // Fallback lấy trong state context
      const found = orders.find((o) => o.id === id || o.orderCode === id);
      if (found) {
        setOrder(found);
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng này');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleConfirm = async () => {
    if (!order) return;
    setSubmittingAction(true);
    const ok = await confirmOrder(order.id);
    if (ok) setOrder((prev) => prev ? { ...prev, status: 'CONFIRMED' } : null);
    setSubmittingAction(false);
  };

  const handleStartPreparing = async () => {
    if (!order) return;
    setSubmittingAction(true);
    const ok = await startPreparing(order.id);
    if (ok) setOrder((prev) => prev ? { ...prev, status: 'PREPARING' } : null);
    setSubmittingAction(false);
  };

  const handleMarkReady = async () => {
    if (!order) return;
    setSubmittingAction(true);
    const ok = await markReady(order.id);
    if (ok) setOrder((prev) => prev ? { ...prev, status: 'FINDING_DRIVER' } : null);
    setSubmittingAction(false);
  };

  const handleReject = async () => {
    if (!order) return;
    const finalReason = selectedReason === 'Lý do khác' ? (customReason.trim() || 'Quán từ chối tiếp nhận') : selectedReason;
    setSubmittingAction(true);
    const ok = await rejectOrder(order.id, finalReason);
    if (ok) {
      setOrder((prev) => prev ? { ...prev, status: 'CANCELLED', cancelledReason: finalReason } : null);
      setRejectModalVisible(false);
    }
    setSubmittingAction(false);
  };

  const formatPrice = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + 'đ';
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.getDate()}/${d.getMonth() + 1}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Chờ nhận', color: '#D97706', bg: '#FEF3C7' };
      case 'CONFIRMED':
        return { text: 'Đã nhận', color: '#2563EB', bg: '#EFF6FF' };
      case 'PREPARING':
        return { text: 'Đang nấu', color: '#D97706', bg: '#FFFBEB' };
      case 'FINDING_DRIVER':
      case 'DRIVER_ACCEPTED':
        return { text: 'Chờ tài xế', color: '#7C3AED', bg: '#F5F3FF' };
      case 'PICKED_UP':
        return { text: 'Đang giao', color: '#0284C7', bg: '#F0F9FF' };
      case 'COMPLETED':
        return { text: 'Hoàn tất', color: '#059669', bg: '#ECFDF5' };
      case 'CANCELLED':
        return { text: 'Đã hủy', color: '#DC2626', bg: '#FEF2F2' };
      default:
        return { text: status, color: '#64748B', bg: '#F1F5F9' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>Không tìm thấy đơn hàng</Text>
          <TouchableOpacity style={styles.btnBack} onPress={() => router.back()}>
            <Text style={styles.btnBackText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const badge = getStatusBadge(order.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Đơn hàng #{order.orderCode}</Text>
          <Text style={styles.headerSub}>ID: {order.id?.slice(0, 16)}...</Text>
        </View>
        <View style={[styles.statusTag, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusTagText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Khách hàng */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="person" size={18} color="#0066FF" />
            <Text style={styles.cardTitle}>Thông Tin Khách Hàng</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên khách:</Text>
            <Text style={styles.infoValue}>{order.user?.fullName || order.user?.name || 'Khách hàng'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Điện thoại:</Text>
            <Text style={[styles.infoValue, { color: '#0066FF', fontWeight: '700' }]}>
              {order.user?.phone || 'Đã xác thực'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoValue}>{order.deliveryAddress || 'Giao tận nơi'}</Text>
          </View>
        </View>

        {/* Tài xế nếu có */}
        {order.driver && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="bicycle" size={18} color="#7C3AED" />
              <Text style={styles.cardTitle}>Tài Xế Giao Hàng</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tên tài xế:</Text>
              <Text style={styles.infoValue}>{order.driver.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Điện thoại:</Text>
              <Text style={[styles.infoValue, { color: '#0066FF', fontWeight: '700' }]}>{order.driver.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Biển số xe:</Text>
              <Text style={styles.infoValue}>{order.driver.licensePlate}</Text>
            </View>
          </View>
        )}

        {/* Món ăn */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="restaurant" size={18} color="#0066FF" />
            <Text style={styles.cardTitle}>Món Ăn ({order.items?.length || 0})</Text>
          </View>
          {order.items?.map((it, idx) => (
            <View key={idx} style={styles.foodRow}>
              <Text style={styles.foodQty}>{it.quantity}x</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{it.name || it.menuItem?.name}</Text>
                {it.optionsJson && (
                  <Text style={styles.foodOptions}>
                    {typeof it.optionsJson === 'string' ? it.optionsJson : JSON.stringify(it.optionsJson)}
                  </Text>
                )}
                {it.notes && <Text style={styles.foodNotes}>Ghi chú: {it.notes}</Text>}
              </View>
              <Text style={styles.foodPrice}>{formatPrice(it.totalPrice || it.unitPrice || 0)}</Text>
            </View>
          ))}
        </View>

        {/* Thanh toán & Doanh thu 90% */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cash" size={18} color="#10B981" />
            <Text style={styles.cardTitle}>Thanh Toán & Doanh Thu</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tiền món khách trả (Subtotal):</Text>
            <Text style={styles.billVal}>{formatPrice(order.subtotal || 0)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Phí giao hàng (Tài xế):</Text>
            <Text style={styles.billVal}>{formatPrice(order.shippingFee || 0)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Hình thức:</Text>
            <Text style={styles.billVal}>{order.paymentMethod === 'WALLET' ? 'Ví V-Life' : 'Tiền mặt COD'}</Text>
          </View>

          <View style={styles.payoutHighlight}>
            <Text style={styles.payoutLabel}>TIỀN QUÁN THỰC NHẬN (90%)</Text>
            <Text style={styles.payoutVal}>
              {formatPrice(order.restaurantPayout || Math.round((order.subtotal || 0) * 0.9))}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="time" size={18} color="#0066FF" />
            <Text style={styles.cardTitle}>Tiến Trình (Timeline)</Text>
          </View>
          <View style={styles.timelineBox}>
            {[
              { title: 'Khách đặt hàng', time: order.createdAt, done: true },
              { title: 'Quán đã xác nhận', time: order.confirmedAt, done: ['CONFIRMED', 'PREPARING', 'FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(order.status) },
              { title: 'Đang nấu / Chuẩn bị', time: order.preparingAt, done: ['PREPARING', 'FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(order.status) },
              { title: 'Chờ tìm tài xế giao', time: order.readyAt, done: ['FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(order.status) },
              { title: 'Tài xế đã lấy món', time: order.pickedUpAt, done: ['PICKED_UP', 'COMPLETED'].includes(order.status) },
              { title: 'Giao hàng thành công', time: order.completedAt, done: order.status === 'COMPLETED' },
            ].map((step, idx) => (
              <View key={idx} style={styles.timelineRow}>
                <View style={[styles.timelineDot, step.done && styles.timelineDotActive]} />
                <View style={{ flex: 1, paddingBottom: 12 }}>
                  <Text style={[styles.timelineTitle, step.done && styles.timelineTitleActive]}>{step.title}</Text>
                  {step.time && <Text style={styles.timelineTime}>{formatDateTime(step.time)}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Nút hành động cố định */}
      <View style={styles.bottomBar}>
        {order.status === 'PENDING' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.btnReject} onPress={() => setRejectModalVisible(true)}>
              <Text style={styles.btnRejectText}>TỪ CHỐI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnConfirm} onPress={handleConfirm} disabled={submittingAction}>
              {submittingAction ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnConfirmText}>NHẬN ĐƠN</Text>}
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'CONFIRMED' && (
          <TouchableOpacity style={styles.btnPrimary} onPress={handleStartPreparing} disabled={submittingAction}>
            <Text style={styles.btnPrimaryText}>BẮT ĐẦU CHUẨN BỊ</Text>
          </TouchableOpacity>
        )}

        {order.status === 'PREPARING' && (
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#10B981' }]} onPress={handleMarkReady} disabled={submittingAction}>
            <Text style={styles.btnPrimaryText}>MÓN ĐÃ XONG (TÌM TÀI XẾ)</Text>
          </TouchableOpacity>
        )}

        {['FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
          <View style={styles.statusBox}>
            <Text style={styles.statusBoxText}>Trạng thái: {badge.text}</Text>
          </View>
        )}
      </View>

      {/* Modal Từ Chối */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lý do từ chối đơn hàng</Text>
            {REJECT_REASONS.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.reasonOption, selectedReason === r && styles.reasonOptionActive]}
                onPress={() => setSelectedReason(r)}
              >
                <Text style={styles.reasonText}>{r}</Text>
              </TouchableOpacity>
            ))}
            {selectedReason === 'Lý do khác' && (
              <TextInput
                style={styles.customInput}
                placeholder="Nhập lý do cụ thể..."
                value={customReason}
                onChangeText={setCustomReason}
              />
            )}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirmReject} onPress={handleReject}>
                <Text style={styles.btnConfirmRejectText}>Xác nhận từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B' },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusTagText: { fontSize: 11, fontWeight: '700' },
  scrollContent: { padding: 16, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#64748B' },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  btnBack: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#0066FF', borderRadius: 8 },
  btnBackText: { color: '#FFF', fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: '#64748B' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#0F172A', flex: 1, textAlign: 'right' },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  foodQty: { width: 26, fontSize: 14, fontWeight: '700', color: '#0066FF' },
  foodName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  foodOptions: { fontSize: 11, color: '#64748B', marginTop: 2 },
  foodNotes: { fontSize: 11, color: '#D97706', marginTop: 2, fontStyle: 'italic' },
  foodPrice: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  billLabel: { fontSize: 13, color: '#64748B' },
  billVal: { fontSize: 13, color: '#0F172A' },
  payoutHighlight: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 12, padding: 12, marginTop: 10, alignItems: 'center' },
  payoutLabel: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  payoutVal: { fontSize: 22, fontWeight: '800', color: '#059669', marginTop: 2 },
  timelineBox: { paddingLeft: 8 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#CBD5E1', marginTop: 4 },
  timelineDotActive: { backgroundColor: '#0066FF' },
  timelineTitle: { fontSize: 13, color: '#64748B' },
  timelineTitleActive: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  timelineTime: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', padding: 14, paddingBottom: Platform.OS === 'ios' ? 28 : 14 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  btnReject: { flex: 1, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnRejectText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  btnConfirm: { flex: 1.5, backgroundColor: '#0066FF', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnConfirmText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  btnPrimary: { backgroundColor: '#0066FF', paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  btnPrimaryText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  statusBox: { paddingVertical: 10, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8 },
  statusBoxText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  reasonOption: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F8FAFC', marginBottom: 6 },
  reasonOptionActive: { backgroundColor: '#EFF6FF', borderColor: '#0066FF', borderWidth: 1 },
  reasonText: { fontSize: 13, color: '#334155' },
  customInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, marginTop: 6, fontSize: 13 },
  btnCancel: { flex: 1, paddingVertical: 10, backgroundColor: '#F1F5F9', borderRadius: 8, alignItems: 'center' },
  btnCancelText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  btnConfirmReject: { flex: 1.5, paddingVertical: 10, backgroundColor: '#DC2626', borderRadius: 8, alignItems: 'center' },
  btnConfirmRejectText: { fontSize: 13, color: '#FFFFFF', fontWeight: '700' },
});
