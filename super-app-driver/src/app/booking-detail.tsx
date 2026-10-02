import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DriverBookingDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const tripId = (params.id as string) || 'VR-8899';

  // Sample trip detail data
  const trip = {
    id: tripId,
    serviceType: 'V-Bike Siêu Tốc',
    status: 'COMPLETED',
    createdAt: '14:05 Hôm nay',
    pickupTime: '14:12 Hôm nay',
    dropoffTime: '14:32 Hôm nay',
    distanceKm: 3.8,
    durationMin: 20,
    pickup: '128 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội',
    dropoff: 'Tòa nhà Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    customer: {
      name: 'Hoàng Linh',
      phone: '0988123456',
      rating: 4.9,
      note: 'Đứng chờ ở sảnh tòa A',
    },
    payment: {
      method: 'CASH', // 'CASH' | 'ONLINE'
      baseFare: 40000,
      peakSurcharge: 5000,
      tip: 10000,
      totalFare: 55000,
      commissionFee: 6750, // 15% của 45k
      driverNetEarnings: 48250, // 55000 - 6750
    },
  };

  const isCash = trip.payment.method === 'CASH';

  // Open Google Maps
  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.dropoff)}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      if (typeof window !== 'undefined') window.open(url, '_blank');
    });
  };

  // Call customer
  const handleCallCustomer = () => {
    Linking.openURL(`tel:${trip.customer.phone}`).catch(() => {
      if (Platform.OS === 'web') alert(`Gọi cho khách hàng: ${trip.customer.phone}`);
      else Alert.alert('Gọi khách', `SĐT: ${trip.customer.phone}`);
    });
  };

  // Report Issue
  const handleReportIssue = () => {
    if (Platform.OS === 'web') {
      alert('Đã ghi nhận yêu cầu hỗ trợ cho cuốc xe #' + trip.id + '. Tổng đài viên sẽ liên hệ lại trong vòng 15 phút.');
    } else {
      Alert.alert(
        'Hỗ trợ cuốc xe',
        'Vui lòng chọn loại sự cố cần hỗ trợ:',
        [
          { text: 'Khách để quên đồ', onPress: () => Alert.alert('Đã gửi', 'Tổng đài đã tiếp nhận sự cố quên đồ.') },
          { text: 'Sai lệch cước phí', onPress: () => Alert.alert('Đã gửi', 'Đội kiểm soát đang rà soát lại lộ trình GPS.') },
          { text: 'Đóng', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Cuốc Xe #{trip.id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.statusTitle}>Cuốc xe hoàn thành</Text>
              <Text style={styles.statusSubtitle}>{trip.dropoffTime}</Text>
            </View>
          </View>
          <View style={styles.serviceTag}>
            <Text style={styles.serviceTagText}>{trip.serviceType}</Text>
          </View>
        </View>

        {/* Route Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTitle}>LỘ TRÌNH CHUYẾN ĐI</Text>
            <TouchableOpacity style={styles.mapsBtn} onPress={handleOpenGoogleMaps}>
              <Ionicons name="navigate" size={14} color="#0088FF" />
              <Text style={styles.mapsBtnText}>Xem Google Maps</Text>
            </TouchableOpacity>
          </View>

          {/* Pickup */}
          <View style={styles.routeRow}>
            <View style={styles.pickupDot} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.routeLabel}>Điểm đón khách ({trip.pickupTime})</Text>
              <Text style={styles.routeAddress}>{trip.pickup}</Text>
            </View>
          </View>

          <View style={styles.routeConnector} />

          {/* Dropoff */}
          <View style={styles.routeRow}>
            <Ionicons name="location" size={16} color="#EF4444" style={{ marginLeft: -2 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.routeLabel}>Điểm trả khách ({trip.dropoffTime})</Text>
              <Text style={styles.routeAddress}>{trip.dropoff}</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Ionicons name="speedometer-outline" size={16} color="#64748B" />
              <Text style={styles.metricText}>Cự ly: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{trip.distanceKm} km</Text></Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.metricText}>Thời gian: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{trip.durationMin} phút</Text></Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>THÔNG TIN HÀNH KHÁCH</Text>
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={24} color="#0F172A" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.customerName}>{trip.customer.name}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{trip.customer.rating}</Text>
                </View>
              </View>
              <Text style={styles.customerNote}>Ghi chú: "{trip.customer.note}"</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallCustomer}>
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment & Settlement Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>CHI TIẾT THANH TOÁN & THU NHẬP</Text>

          {/* Payment Notice Banner */}
          <View
            style={[
              styles.paymentNoticeBanner,
              isCash ? { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' } : { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
            ]}
          >
            <Ionicons
              name={isCash ? 'cash' : 'checkmark-circle'}
              size={22}
              color={isCash ? '#DC2626' : '#059669'}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.paymentNoticeTitle, isCash ? { color: '#B91C1C' } : { color: '#047857' }]}>
                {isCash ? 'HÌNH THỨC: THU TIỀN MẶT' : 'HÌNH THỨC: THANH TOÁN ONLINE / VÍ'}
              </Text>
              <Text style={[styles.paymentNoticeSub, isCash ? { color: '#991B1B' } : { color: '#065F46' }]}>
                {isCash
                  ? `Tài xế thu trực tiếp ${trip.payment.totalFare.toLocaleString('vi-VN')}đ từ khách hàng.`
                  : 'Khách đã thanh toán qua thẻ/ví điện tử. Tuyệt đối KHÔNG thu tiền mặt!'}
              </Text>
            </View>
          </View>

          {/* Fare Itemization */}
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Cước gốc theo cự ly</Text>
            <Text style={styles.fareValue}>{trip.payment.baseFare.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Phụ phí giờ cao điểm</Text>
            <Text style={styles.fareValue}>+{trip.payment.peakSurcharge.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Tiền Tip từ khách</Text>
            <Text style={styles.fareValueGreen}>+{trip.payment.tip.toLocaleString('vi-VN')}đ</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fareRow}>
            <Text style={styles.fareBoldLabel}>Tổng cước chuyến đi</Text>
            <Text style={styles.fareBoldValue}>{trip.payment.totalFare.toLocaleString('vi-VN')}đ</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Chiết khấu nền tảng (15%)</Text>
            <Text style={styles.fareValueRed}>-{trip.payment.commissionFee.toLocaleString('vi-VN')}đ</Text>
          </View>

          <View style={styles.netEarningsBox}>
            <Text style={styles.netEarningsLabel}>THỰC NHẬN CỦA TÀI XẾ</Text>
            <Text style={styles.netEarningsAmount}>+{trip.payment.driverNetEarnings.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>

        {/* Support & Dispute Button */}
        <TouchableOpacity style={styles.supportBtn} onPress={handleReportIssue}>
          <Ionicons name="warning-outline" size={20} color="#64748B" />
          <Text style={styles.supportBtnText}>Báo cáo sự cố hoặc khiếu nại cuốc xe này</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { padding: 16 },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  checkCircle: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  statusSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  serviceTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  serviceTagText: { fontSize: 12, fontWeight: '700', color: '#0284C7' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardSectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  mapsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapsBtnText: { fontSize: 13, fontWeight: '700', color: '#0088FF' },

  routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  pickupDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', marginTop: 4 },
  routeConnector: { width: 2, height: 24, backgroundColor: '#CBD5E1', marginLeft: 4, marginVertical: 2 },
  routeLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  routeAddress: { fontSize: 14, color: '#0F172A', fontWeight: '600', marginTop: 2 },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricText: { fontSize: 13, color: '#64748B' },

  customerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
  customerNote: { fontSize: 12, color: '#64748B', marginTop: 4, fontStyle: 'italic' },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paymentNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  paymentNoticeTitle: { fontSize: 13, fontWeight: '800' },
  paymentNoticeSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },

  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  fareLabel: { fontSize: 13, color: '#64748B' },
  fareValue: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  fareValueGreen: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  fareValueRed: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  fareBoldLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  fareBoldValue: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },

  netEarningsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  netEarningsLabel: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  netEarningsAmount: { fontSize: 18, fontWeight: '900', color: '#059669' },

  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  supportBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
});
