import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { partnerService } from '../services/partnerService';

export default function PartnerBookingDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const bookingId = (params.id as string) || 'booking-1';
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  const fetchDetail = async () => {
    try {
      const data = await partnerService.getBookingDetail(bookingId);
      setBooking(data);
    } catch (error) {
      // Fallback sample data
      setBooking({
        id: bookingId,
        bookingCode: 'VL202608031001',
        status: 'CONFIRMED',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0912345678',
        service: {
          title: 'Homestay Phú Quốc Luxury Villa',
          type: 'HOMESTAY_BOOKING',
          description: 'Phòng hướng biển, miễn phí ăn sáng',
        },
        partner: {
          businessName: 'Homestay Phú Quốc V-Life',
          phone: '0988777666',
        },
        grossAmount: 5000000,
        commissionRate: 0.1,
        commissionAmount: 500000,
        partnerAmount: 4500000,
        startDate: '2026-08-10T14:00:00Z',
        endDate: '2026-08-13T12:00:00Z',
        createdAt: '2026-08-03T09:00:00Z',
        payout: {
          id: 'payout-101',
          status: 'SUCCESS',
          amount: 4500000,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [bookingId]);

  const handleRetryPayout = async () => {
    if (!booking?.payout?.id) return;

    setRetrying(true);
    try {
      const res = await partnerService.retryPayout(booking.payout.id);
      Alert.alert('Thành công', res.message || 'Đã gửi lại lệnh Payout cho ngân hàng');
      fetchDetail();
    } catch (error: any) {
      Alert.alert('Lỗi Payout', error.response?.data?.message || 'Không thể thử lại Payout vào lúc này');
    } finally {
      setRetrying(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { text: 'Đã xác nhận', color: '#10B981', bg: '#D1FAE5' };
      case 'PENDING_PAYMENT':
        return { text: 'Chờ khách thanh toán', color: '#F59E0B', bg: '#FEF3C7' };
      case 'PAYMENT_PAID':
      case 'PAYOUT_PROCESSING':
        return { text: 'Đang xử lý thanh toán cho đối tác', color: '#0284C7', bg: '#E0F2FE' };
      case 'PAYOUT_ERROR':
      case 'FAILED':
        return { text: 'Thanh toán cho đối tác gặp lỗi', color: '#EF4444', bg: '#FEE2E2' };
      case 'CANCELLED':
        return { text: 'Đã hủy', color: '#6B7280', bg: '#F3F4F6' };
      default:
        return { text: status, color: '#4B5563', bg: '#F3F4F6' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0088FF" />
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusText(booking.status);
  const grossNum = Number(booking.grossAmount || 0);
  const commissionNum = Number(booking.commissionAmount || grossNum * 0.1);
  const partnerNum = Number(booking.partnerAmount || grossNum - commissionNum);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Đơn Đặt #{booking.bookingCode}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Badge Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusInfo.bg }]}>
          <Ionicons name="information-circle" size={20} color={statusInfo.color} />
          <Text style={[styles.statusBannerText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>

        {/* Khách hàng */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>THÔNG TIN KHÁCH HÀNG</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tên khách hàng:</Text>
            <Text style={styles.valBold}>{booking.customerName || 'Khách hàng V-Life'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.val}>{booking.customerPhone || '0912345678'}</Text>
          </View>
        </View>

        {/* Dịch vụ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>THÔNG TIN DỊCH VỤ</Text>
          <Text style={styles.serviceTitle}>{booking.service?.title}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Thời gian nhận:</Text>
            <Text style={styles.val}>{new Date(booking.startDate).toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Thời gian trả:</Text>
            <Text style={styles.val}>{new Date(booking.endDate).toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        {/* Phân rã Doanh thu & Hoa hồng */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PHÂN RÃ TÀI CHÍNH (SERVER TÍNH TOÁN)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tổng giá trị đơn hàng (Gross):</Text>
            <Text style={styles.valBold}>{grossNum.toLocaleString()}đ</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Hoa hồng V-life (10%):</Text>
            <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>-{commissionNum.toLocaleString()}đ</Text>
          </View>
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8, marginTop: 8 }]}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E293B' }}>TIỀN ĐỐI TÁC THỰC NHẬN:</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>{partnerNum.toLocaleString()}đ</Text>
          </View>
        </View>

        {/* Thử lại Payout nếu bị lỗi */}
        {booking.status === 'PAYOUT_ERROR' && (
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetryPayout} disabled={retrying}>
            {retrying ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.retryBtnText}>🔄 Thử Lại Payout Ngân Hàng</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  content: { padding: 16 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 16 },
  statusBannerText: { fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  cardTitle: { fontSize: 12, fontWeight: 'bold', color: '#0088FF', marginBottom: 12, letterSpacing: 0.5 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 13, color: '#64748B' },
  val: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
  valBold: { fontSize: 14, color: '#1E293B', fontWeight: 'bold' },
  retryBtn: { height: 48, borderRadius: 24, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});
