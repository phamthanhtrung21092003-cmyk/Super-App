import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';
import { PLATFORM_FEE_RATE } from '../constants/driverConstants';

export default function DriverBookingDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const tripId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setErrorMsg('Không tìm thấy mã chuyến xe.');
      setLoading(false);
      return;
    }

    const fetchTripDetail = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/ride/${tripId}`);
        if (res.data) {
          setTrip(res.data);
          setErrorMsg(null);
        } else {
          setErrorMsg('Không có dữ liệu chuyến xe này.');
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Không thể tải chi tiết chuyến xe.');
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetail();
  }, [tripId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0088FF" />
        <Text style={styles.loadingText}>Đang tải chi tiết cuốc xe...</Text>
      </SafeAreaView>
    );
  }

  if (errorMsg || !trip) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
        <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
        <Text style={styles.errorDesc}>{errorMsg || 'Không tìm thấy chuyến xe.'}</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()}>
          <Text style={styles.backHomeText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isCash = trip.paymentMethod === 'CASH';
  const fare = trip.fareAmount || 0;
  const tip = trip.tipAmount || 0;
  const commission = Math.round(fare * PLATFORM_FEE_RATE);
  const netEarnings = fare - commission + tip;
  const d = new Date(trip.createdAt || Date.now());
  const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

  // Open Google Maps
  const handleOpenGoogleMaps = () => {
    const dest = trip.dropoffAddress || `${trip.dropoffLat},${trip.dropoffLng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      if (typeof window !== 'undefined') window.open(url, '_blank');
    });
  };

  // Call customer
  const handleCallCustomer = () => {
    const phone = trip.customerPhone || '0988000000';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Gọi khách', `SĐT: ${phone}`);
    });
  };

  // Report Issue
  const handleReportIssue = () => {
    Alert.alert(
      'Hỗ trợ cuốc xe',
      `Tiếp nhận hỗ trợ cho cuốc xe ${trip.bookingCode || trip.id}:`,
      [
        { text: 'Khách để quên đồ', onPress: () => Alert.alert('Đã gửi', 'Tổng đài đã ghi nhận sự cố để quên đồ.') },
        { text: 'Sai lệch cước phí', onPress: () => Alert.alert('Đã gửi', 'Đội đối soát đang kiểm tra lộ trình GPS.') },
        { text: 'Đóng', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Cuốc Xe {trip.bookingCode || `#VR-${trip.id.slice(-4)}`}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={styles.checkCircle}>
              <Ionicons
                name={trip.status === 'COMPLETED' ? 'checkmark-circle' : trip.status === 'CANCELLED' ? 'close-circle' : 'time'}
                size={32}
                color={trip.status === 'COMPLETED' ? '#10B981' : trip.status === 'CANCELLED' ? '#EF4444' : '#F59E0B'}
              />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.statusTitle}>
                {trip.status === 'COMPLETED' ? 'Cuốc xe hoàn thành' : trip.status === 'CANCELLED' ? 'Cuốc xe đã hủy' : 'Đang xử lý'}
              </Text>
              <Text style={styles.statusSubtitle}>{timeStr} • {dateStr}</Text>
            </View>
          </View>
          <View style={styles.serviceTag}>
            <Text style={styles.serviceTagText}>{trip.serviceType === 'DELIVERY' ? 'Giao hàng' : 'Chở khách'}</Text>
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
              <Text style={styles.routeLabel}>Điểm đón khách</Text>
              <Text style={styles.routeAddress}>{trip.pickupAddress}</Text>
            </View>
          </View>

          <View style={styles.routeConnector} />

          {/* Dropoff */}
          <View style={styles.routeRow}>
            <Ionicons name="location" size={16} color="#EF4444" style={{ marginLeft: -2 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.routeLabel}>Điểm trả khách</Text>
              <Text style={styles.routeAddress}>{trip.dropoffAddress}</Text>
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
                <Text style={styles.customerName}>{trip.customerName}</Text>
                {trip.driverRating && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{trip.driverRating}</Text>
                  </View>
                )}
              </View>
              {trip.driverReview && (
                <Text style={styles.customerNote}>Đánh giá: "{trip.driverReview}"</Text>
              )}
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
                  ? `Tài xế thu trực tiếp ${fare.toLocaleString('vi-VN')}đ từ khách hàng.`
                  : 'Khách đã thanh toán qua thẻ/ví điện tử. Tuyệt đối KHÔNG thu tiền mặt!'}
              </Text>
            </View>
          </View>

          {/* Fare Itemization */}
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Cước chuyến đi</Text>
            <Text style={styles.fareValue}>{fare.toLocaleString('vi-VN')}đ</Text>
          </View>
          {tip > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Tiền Tip từ khách</Text>
              <Text style={[styles.fareValue, { color: '#059669' }]}>+{tip.toLocaleString('vi-VN')}đ</Text>
            </View>
          )}
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Phí nền tảng (15%)</Text>
            <Text style={[styles.fareValue, { color: '#DC2626' }]}>-{commission.toLocaleString('vi-VN')}đ</Text>
          </View>

          <View style={styles.divider} />

          {/* Total Earnings */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Thực nhận vào ví</Text>
            <Text style={styles.totalValue}>{netEarnings.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.reportBtn} onPress={handleReportIssue}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#475569" style={{ marginRight: 6 }} />
          <Text style={styles.reportBtnText}>Khiếu nại hoặc báo cáo sự cố cuốc này</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  errorDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  backHomeBtn: {
    backgroundColor: '#0088FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backHomeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  serviceTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0088FF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapsBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0088FF',
    marginLeft: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0088FF',
    marginTop: 3,
  },
  routeLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  routeConnector: {
    width: 2,
    height: 18,
    backgroundColor: '#E2E8F0',
    marginLeft: 5,
    marginVertical: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 2,
  },
  customerNote: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 10,
  },
  paymentNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  paymentNoticeSub: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  fareLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  fareValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  reportBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
