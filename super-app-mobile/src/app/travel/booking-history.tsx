import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../../services/paymentService';

type TabFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  subText: '#64748B',
  border: '#E2E8F0',
};

export default function BookingHistoryScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchBookings = async () => {
    try {
      const res = await paymentService.getUserBookingsHistory();
      if (res.bookings && res.bookings.length > 0) {
        setBookings(res.bookings);
      } else {
        setBookings([
          {
            id: 'b-101',
            bookingCode: 'VL202608031001',
            serviceTitle: 'Khách sạn Phú Quốc Luxury Villa',
            grossAmount: 3850000,
            status: 'CONFIRMED',
            startDate: '2026-08-10',
            endDate: '2026-08-13',
            createdAt: '2026-08-03',
          },
          {
            id: 'b-102',
            bookingCode: 'VL202608031002',
            serviceTitle: 'Lều Glamping Đà Lạt View Mây',
            grossAmount: 1800000,
            status: 'PENDING_PAYMENT',
            startDate: '2026-08-15',
            endDate: '2026-08-16',
            createdAt: '2026-08-03',
          },
        ]);
      }
    } catch (error) {
      console.log('Fetch bookings history error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filteredBookings = bookings.filter((item) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return item.status === 'PENDING_PAYMENT' || item.status === 'PAYMENT_PAID';
    if (activeTab === 'CONFIRMED') return item.status === 'CONFIRMED';
    if (activeTab === 'COMPLETED') return item.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return item.status === 'CANCELLED' || item.status === 'PAYMENT_EXPIRED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' };
      case 'PENDING_PAYMENT':
        return { label: 'Chờ thanh toán', bg: '#FEF3C7', text: '#D97706', icon: 'time-outline' };
      case 'PAYMENT_PAID':
      case 'PAYOUT_PROCESSING':
        return { label: 'Đang xử lý', bg: '#E0F2FE', text: '#0284C7', icon: 'sync-outline' };
      case 'COMPLETED':
        return { label: 'Hoàn thành', bg: '#F3E8FF', text: '#9333EA', icon: 'ribbon-outline' };
      case 'CANCELLED':
      case 'PAYMENT_EXPIRED':
        return { label: 'Đã hủy', bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
      default:
        return { label: status, bg: '#F1F5F9', text: '#475569', icon: 'help-circle' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Lịch Sử Đặt Dịch Vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs Filter */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ xử lý' },
            { id: 'CONFIRMED', label: 'Đã xác nhận' },
            { id: 'COMPLETED', label: 'Hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.id as TabFilter)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List Items */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0088FF" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#94A3B8" />
              <Text style={[styles.emptyText, { color: colors.subText }]}>Chưa có lịch sử đặt dịch vụ nào</Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <View style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.bookingCode}>{item.bookingCode}</Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon as any} size={14} color={badge.text} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                </View>

                <Text style={[styles.serviceTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.serviceTitle}
                </Text>

                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={16} color="#64748B" />
                  <Text style={styles.dateText}>
                    {new Date(item.startDate).toLocaleDateString('vi-VN')} - {new Date(item.endDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>

                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>Tổng thanh toán</Text>
                    <Text style={styles.totalPrice}>{Number(item.grossAmount).toLocaleString()}đ</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.detailBtn}
                    onPress={() => router.push(`/travel/checkout?serviceId=${item.serviceId}&price=${item.grossAmount}`)}
                  >
                    <Text style={styles.detailBtnText}>Xem Chi Tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
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
  tabContainer: { marginVertical: 8 },
  tabScroll: { paddingHorizontal: 16 },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  tabItemActive: { backgroundColor: '#0088FF' },
  tabText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 14 },
  bookingCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingCode: { fontSize: 14, fontWeight: 'bold', color: '#0088FF' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  serviceTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 12, color: '#64748B', marginLeft: 6 },
  cardFooter: { borderTopWidth: 1, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: '#0088FF' },
  detailBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#EFF6FF' },
  detailBtnText: { color: '#0088FF', fontSize: 13, fontWeight: 'bold' },
});
