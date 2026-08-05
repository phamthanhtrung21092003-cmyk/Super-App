import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Image,
  ActivityIndicator,
  Clipboard,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { paymentService, PaymentStatusResponse } from '../../services/paymentService';

type PaymentType = 'vietqr' | 'vnpay' | 'momo' | 'cash';
type UIStatus = 'IDLE' | 'CREATING_BOOKING' | 'PENDING' | 'CHECKING' | 'NOT_RECEIVED' | 'SUCCESS' | 'EXPIRED' | 'ERROR';

const colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  subText: '#64748B',
  border: '#E2E8F0',
};

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const serviceId = (params.serviceId as string) || 'service-uuid-1';
  const name = (params.name as string) || 'Tour du lịch Phú Quốc 4N3Đ';
  const price = Number(params.price) || 3500000;
  const roomName = params.roomName as string;

  // Real backend booking & payment states
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentOrderData, setPaymentOrderData] = useState<any>(null);
  const [uiStatus, setUiStatus] = useState<UIStatus>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Payment selection states
  const [selectedPayment, setSelectedPayment] = useState<PaymentType>('vietqr');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins TTL

  const pollingRef = useRef<any>(null);

  // Clean up polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Countdown timer for QR modal
  useEffect(() => {
    let timer: any;
    if (showQRModal && timeLeft > 0 && uiStatus !== 'SUCCESS') {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQRModal, timeLeft, uiStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  /**
   * Bắt đầu Polling kiểm tra trạng thái thực từ Backend
   */
  const startPollingPaymentStatus = (orderId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res: PaymentStatusResponse = await paymentService.getPaymentStatus(orderId);

        if (res.bookingStatus === 'CONFIRMED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setUiStatus('SUCCESS');
          setStatusMessage('Đặt dịch vụ thành công!');
          setTimeout(() => {
            setShowQRModal(false);
            setShowSuccessModal(true);
          }, 800);
        } else if (res.bookingStatus === 'PAYMENT_PAID' || res.bookingStatus === 'PAYOUT_PROCESSING') {
          setUiStatus('CHECKING');
          setStatusMessage('Đã nhận thanh toán. Đang hoàn tất xác nhận dịch vụ...');
        } else if (res.isExpired || res.paymentStatus === 'PAYMENT_EXPIRED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setUiStatus('EXPIRED');
          setStatusMessage('Thời gian giữ chỗ đã hết hạn. Vui lòng thử lại.');
        }
      } catch (error) {
        console.log('Polling check error:', error);
      }
    }, 3000);
  };

  /**
   * Khởi tạo Đơn Đặt & Đơn Thanh Toán Kết Nối Backend Thật
   */
  const handleConfirmOrder = async () => {
    setUiStatus('CREATING_BOOKING');
    setStatusMessage('Đang khởi tạo đơn đặt hàng trên máy chủ...');

    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      const bookingRes = await paymentService.createBooking({
        serviceId,
        startDate,
        endDate,
        customerName: 'Người dùng V-Life',
        customerPhone: '0912345678',
        note: name,
      });

      const newBooking = bookingRes.booking;
      setBookingData(newBooking);

      if (selectedPayment === 'cash') {
        setUiStatus('SUCCESS');
        setShowSuccessModal(true);
        return;
      }

      const paymentRes = await paymentService.createPaymentOrder({
        bookingId: newBooking.id,
        provider: selectedPayment === 'vnpay' ? 'VNPAY' : selectedPayment === 'momo' ? 'MOMO' : 'VIETQR',
      });

      const orderInfo = paymentRes.paymentOrder;
      setPaymentOrderData(orderInfo);
      setUiStatus('PENDING');
      setShowQRModal(true);

      startPollingPaymentStatus(orderInfo.orderId);
    } catch (error: any) {
      console.log('Create booking error:', error);
      setUiStatus('ERROR');
      Alert.alert('Lỗi đặt hàng', error.response?.data?.message || 'Không thể tạo đơn đặt. Vui lòng thử lại.');
    }
  };

  /**
   * Nút "Tôi đã chuyển khoản xong" -> Gọi API Backend ngay lập tức
   */
  const handleCheckPayment = async () => {
    if (!paymentOrderData) return;

    setUiStatus('CHECKING');
    setStatusMessage('Đang kết nối Ngân hàng đối soát giao dịch...');

    try {
      const res: PaymentStatusResponse = await paymentService.getPaymentStatus(paymentOrderData.orderId);

      if (res.bookingStatus === 'CONFIRMED') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setUiStatus('SUCCESS');
        setShowQRModal(false);
        setShowSuccessModal(true);
      } else if (res.bookingStatus === 'PAYMENT_PAID' || res.bookingStatus === 'PAYOUT_PROCESSING') {
        setStatusMessage('Đã nhận tiền! Đang khởi tạo xác nhận dịch vụ...');
      } else {
        setUiStatus('NOT_RECEIVED');
        setStatusMessage('Hệ thống chưa nhận được báo CÓ từ Ngân hàng. Vui lòng đợi 30s hoặc thử lại.');
      }
    } catch (error) {
      setUiStatus('NOT_RECEIVED');
    }
  };

  const currentGrossPrice = bookingData ? bookingData.grossAmount : Math.round(price * 1.1);
  const currentBookingCode = bookingData ? bookingData.bookingCode : paymentOrderData?.bookingCode || 'VL20260803';
  const qrImageUrl = paymentOrderData?.vietqrInfo?.qrUrl || 
    `https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=${currentGrossPrice}&addInfo=${currentBookingCode}&accountName=${encodeURIComponent('SUPER APP TRAVEL V-LIFE')}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Xác Nhận Thanh Toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Banner dịch vụ */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.cardSectionTitle}>THÔNG TIN DỊCH VỤ</Text>
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconBg}>
              <Ionicons name="bed" size={24} color="#0088FF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={2}>
                {name}
              </Text>
              {roomName && <Text style={styles.serviceSub}>Hạng phòng: {roomName}</Text>}
              <Text style={styles.serviceSub}>Thời gian: 3 Ngày 2 Đêm</Text>
            </View>
          </View>
        </View>

        {/* Phương thức thanh toán */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.cardSectionTitle}>CHỌN PHƯƠNG THỨC THANH TOÁN</Text>

          <TouchableOpacity
            style={[styles.paymentOption, selectedPayment === 'vietqr' && styles.paymentOptionActive]}
            onPress={() => setSelectedPayment('vietqr')}
          >
            <View style={[styles.radio, selectedPayment === 'vietqr' && styles.radioActive]}>
              {selectedPayment === 'vietqr' && <View style={styles.radioInner} />}
            </View>
            <Ionicons name="qr-code-sharp" size={24} color="#0088FF" style={{ marginHorizontal: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.paymentOptionTitle, { color: colors.text }]}>Chuyển khoản Ngân hàng (VietQR)</Text>
              <Text style={styles.paymentOptionSub}>Tự động xác nhận qua Webhook 24/7</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, selectedPayment === 'vnpay' && styles.paymentOptionActive]}
            onPress={() => setSelectedPayment('vnpay')}
          >
            <View style={[styles.radio, selectedPayment === 'vnpay' && styles.radioActive]}>
              {selectedPayment === 'vnpay' && <View style={styles.radioInner} />}
            </View>
            <Ionicons name="card" size={24} color="#FF6B00" style={{ marginHorizontal: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.paymentOptionTitle, { color: colors.text }]}>Cổng thanh toán VNPay</Text>
              <Text style={styles.paymentOptionSub}>Thẻ ATM / QR / Mobile Banking</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, selectedPayment === 'cash' && styles.paymentOptionActive]}
            onPress={() => setSelectedPayment('cash')}
          >
            <View style={[styles.radio, selectedPayment === 'cash' && styles.radioActive]}>
              {selectedPayment === 'cash' && <View style={styles.radioInner} />}
            </View>
            <Ionicons name="cash-outline" size={24} color="#10B981" style={{ marginHorizontal: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.paymentOptionTitle, { color: colors.text }]}>Thanh toán tại cơ sở</Text>
              <Text style={styles.paymentOptionSub}>Trả tiền trực tiếp khi nhận phòng/dịch vụ</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tổng tiền & Chi tiết giá Server */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.cardSectionTitle}>CHI TIẾT THANH TOÁN (SERVER)</Text>
          <View style={styles.priceRow}>
            <Text style={{ color: colors.subText }}>Giá niêm yết dịch vụ</Text>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{price.toLocaleString()}đ</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={{ color: colors.subText }}>Thuế & Phí dịch vụ</Text>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{(currentGrossPrice - price).toLocaleString()}đ</Text>
          </View>
          <View style={[styles.priceRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>TỔNG CỘNG</Text>
            <Text style={{ color: '#0088FF', fontWeight: 'bold', fontSize: 18 }}>{currentGrossPrice.toLocaleString()}đ</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View>
          <Text style={{ color: colors.subText, fontSize: 12 }}>Tổng thanh toán</Text>
          <Text style={{ color: '#0088FF', fontSize: 20, fontWeight: 'bold' }}>{currentGrossPrice.toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleConfirmOrder} disabled={uiStatus === 'CREATING_BOOKING'}>
          <LinearGradient colors={['#0088FF', '#0055FF']} style={styles.gradientBtn}>
            {uiStatus === 'CREATING_BOOKING' ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Xác Nhận Đặt Hàng</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* MODAL MÃ QR THANH TOÁN KẾT NỐI POLLING BÀO VỆ BACKEND */}
      <Modal visible={showQRModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.qrModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Quét Mã VietQR Thanh Toán</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.subText} />
              </TouchableOpacity>
            </View>

            {/* Countdown timer */}
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={16} color="#FF6B00" />
              <Text style={styles.timerText}>Mã QR hết hạn trong: {formatTime(timeLeft)}</Text>
            </View>

            {/* Ảnh VietQR từ Ngân hàng */}
            <View style={styles.qrImageContainer}>
              <Image source={{ uri: qrImageUrl }} style={styles.qrImage} resizeMode="contain" />
            </View>

            {/* Thông tin đối soát Ngân hàng */}
            <View style={[styles.bankInfoCard, { backgroundColor: colors.background }]}>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Ngân hàng:</Text>
                <Text style={[styles.bankVal, { color: colors.text }]}>{paymentOrderData?.vietqrInfo?.bankName || 'MB BANK'}</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Số tài khoản:</Text>
                <TouchableOpacity onPress={() => handleCopy(paymentOrderData?.vietqrInfo?.accountNo || '0912345678', 'STK')}>
                  <Text style={styles.copyVal}>{paymentOrderData?.vietqrInfo?.accountNo || '0912345678'} 📋</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Chủ tài khoản:</Text>
                <Text style={[styles.bankVal, { color: colors.text }]}>{paymentOrderData?.vietqrInfo?.accountHolder || 'SUPER APP TRAVEL V-LIFE'}</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Nội dung CK:</Text>
                <TouchableOpacity onPress={() => handleCopy(currentBookingCode, 'Nội dung')}>
                  <Text style={[styles.copyVal, { color: '#0088FF', fontWeight: 'bold' }]}>{currentBookingCode} 📋</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Báo trạng thái Polling thời gian thực */}
            {uiStatus === 'CHECKING' && (
              <View style={styles.statusBoxChecking}>
                <ActivityIndicator color="#0088FF" size="small" />
                <Text style={styles.statusTextChecking}>{statusMessage || 'Đang kết nối Ngân hàng đối soát giao dịch...'}</Text>
              </View>
            )}

            {uiStatus === 'NOT_RECEIVED' && (
              <View style={styles.statusBoxWarning}>
                <Ionicons name="alert-circle" size={20} color="#FF6B00" />
                <Text style={styles.statusTextWarning}>{statusMessage || 'Chưa nhận được thông báo CÓ tiền. Vui lòng thử lại.'}</Text>
              </View>
            )}

            {/* Nút hành động */}
            <TouchableOpacity style={styles.checkPaymentBtn} onPress={handleCheckPayment}>
              <Text style={styles.checkPaymentBtnText}>Tôi Đã Chuyển Khoản Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL ĐẶT DỊCH VỤ THÀNH CÔNG (CHỈ HIỂN THỊ KHI BACKEND TRẢ VỀ CONFIRMED) */}
      <Modal visible={showSuccessModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.successModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.successIconBg}>
              <Ionicons name="checkmark-circle" size={72} color="#10B981" />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>🎉 ĐẶT DỊCH VỤ THÀNH CÔNG</Text>
            <Text style={styles.successSub}>Backend V-Life đã xác minh thanh toán & xác nhận đơn vị thành công!</Text>

            <View style={[styles.receiptCard, { backgroundColor: colors.background }]}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Mã Booking:</Text>
                <Text style={styles.receiptValBold}>{currentBookingCode}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Dịch vụ:</Text>
                <Text style={[styles.receiptVal, { color: colors.text }]} numberOfLines={1}>{name}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Tổng thanh toán:</Text>
                <Text style={styles.receiptValHighlight}>{currentGrossPrice.toLocaleString()}đ</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Trạng thái:</Text>
                <Text style={{ color: '#10B981', fontWeight: 'bold' }}>ĐÃ XÁC NHẬN (CONFIRMED)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/travel/booking-history');
              }}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.gradientBtn}>
                <Text style={styles.submitBtnText}>Xem Lịch Sử Đặt Hàng</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  cardSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#0088FF', marginBottom: 12, letterSpacing: 0.5 },
  serviceRow: { flexDirection: 'row', alignItems: 'center' },
  serviceIconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
  serviceName: { fontSize: 15, fontWeight: 'bold' },
  serviceSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  paymentOptionActive: { borderColor: '#0088FF', backgroundColor: '#F0F9FF' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#0088FF' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0088FF' },
  paymentOptionTitle: { fontSize: 14, fontWeight: '600' },
  paymentOptionSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  bottomBar: { padding: 16, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submitBtn: { width: 180, height: 48, borderRadius: 24, overflow: 'hidden' },
  gradientBtn: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  qrModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', padding: 8, borderRadius: 8, marginTop: 12, alignSelf: 'center' },
  timerText: { color: '#C2410C', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  qrImageContainer: { width: 220, height: 220, alignSelf: 'center', marginVertical: 16 },
  qrImage: { width: '100%', height: '100%' },
  bankInfoCard: { padding: 12, borderRadius: 12, marginBottom: 16 },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  bankLabel: { fontSize: 13, color: '#64748B' },
  bankVal: { fontSize: 13, fontWeight: '600' },
  copyVal: { fontSize: 13, fontWeight: 'bold', color: '#0088FF' },
  statusBoxChecking: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 10, borderRadius: 8, marginBottom: 12 },
  statusTextChecking: { fontSize: 13, color: '#1D4ED8', marginLeft: 8, flex: 1 },
  statusBoxWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', padding: 10, borderRadius: 8, marginBottom: 12 },
  statusTextWarning: { fontSize: 13, color: '#C2410C', marginLeft: 8, flex: 1 },
  checkPaymentBtn: { height: 48, borderRadius: 24, backgroundColor: '#0088FF', justifyContent: 'center', alignItems: 'center' },
  checkPaymentBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  successModalContent: { margin: 20, borderRadius: 24, padding: 24, alignItems: 'center', alignSelf: 'center', width: '90%' },
  successIconBg: { marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  successSub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  receiptCard: { width: '100%', padding: 16, borderRadius: 12, marginBottom: 20 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  receiptLabel: { fontSize: 13, color: '#64748B' },
  receiptVal: { fontSize: 13, fontWeight: '600', maxWidth: '60%' },
  receiptValBold: { fontSize: 14, fontWeight: 'bold', color: '#0088FF' },
  receiptValHighlight: { fontSize: 15, fontWeight: 'bold', color: '#10B981' },
  doneBtn: { width: '100%', height: 48, borderRadius: 24, overflow: 'hidden' },
});
