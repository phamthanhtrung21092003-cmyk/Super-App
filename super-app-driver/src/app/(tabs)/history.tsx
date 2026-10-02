import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity,
  StatusBar, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DriverHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED' | 'CASH' | 'ONLINE'>('ALL');

  const tripHistory = [
    {
      id: 'VR-8899',
      serviceType: 'V-Bike',
      serviceIcon: 'bicycle',
      date: 'Hôm nay, 14:10 - 14:32',
      pickup: '128 Trần Duy Hưng, Cầu Giấy',
      dropoff: 'Keangnam Landmark 72, Nam Từ Liêm',
      distanceKm: 3.8,
      durationMin: 18,
      paymentMethod: 'CASH', // Khách trả tiền mặt
      totalFare: 45000,
      fee: 6750, // 15%
      driverEarnings: 38250,
      status: 'COMPLETED',
      customerName: 'Hoàng Linh',
      rating: 5,
    },
    {
      id: 'VR-8898',
      serviceType: 'V-Car 4 chỗ',
      serviceIcon: 'car',
      date: 'Hôm nay, 13:00 - 13:35',
      pickup: 'Đại học Quốc Gia Hà Nội, Xuân Thủy',
      dropoff: 'Hồ Gươm Plaza, Hà Đông',
      distanceKm: 8.5,
      durationMin: 32,
      paymentMethod: 'ONLINE', // VNPay / Thẻ
      totalFare: 120000,
      fee: 18000,
      driverEarnings: 102000,
      status: 'COMPLETED',
      customerName: 'Trần Văn Mạnh',
      rating: 5,
    },
    {
      id: 'VR-8895',
      serviceType: 'V-Express Siêu Tốc',
      serviceIcon: 'cube',
      date: 'Hôm nay, 11:15 - 11:45',
      pickup: 'Kho Shopee Express, Mỹ Đình',
      dropoff: '88 Láng Hạ, Đống Đa',
      distanceKm: 6.2,
      durationMin: 25,
      paymentMethod: 'CASH',
      totalFare: 65000,
      fee: 9750,
      driverEarnings: 55250,
      status: 'COMPLETED',
      customerName: 'Thu Trang (Giao kiện)',
      rating: 4.8,
    },
    {
      id: 'VR-8892',
      serviceType: 'V-Bike',
      serviceIcon: 'bicycle',
      date: 'Hôm nay, 09:40',
      pickup: 'Bến xe Mỹ Đình, Từ Liêm',
      dropoff: 'Cầu Giấy, Hà Nội',
      distanceKm: 2.1,
      durationMin: 0,
      paymentMethod: 'CASH',
      totalFare: 28000,
      fee: 0,
      driverEarnings: 0,
      status: 'CANCELLED',
      cancelReason: 'Khách đổi ý đi xe buýt',
      customerName: 'Đặng Tuấn',
      rating: 0,
    },
    {
      id: 'VR-8884',
      serviceType: 'V-Car 4 chỗ',
      serviceIcon: 'car',
      date: 'Hôm qua, 21:05 - 21:40',
      pickup: 'Sân bay Nội Bài (Ga T1)',
      dropoff: 'Khách sạn Melia, Lý Thường Kiệt',
      distanceKm: 28.5,
      durationMin: 35,
      paymentMethod: 'ONLINE',
      totalFare: 320000,
      fee: 48000,
      driverEarnings: 272000,
      status: 'COMPLETED',
      customerName: 'David Miller',
      rating: 5,
    },
  ];

  const filteredTrips = tripHistory.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'COMPLETED') return t.status === 'COMPLETED';
    if (activeFilter === 'CANCELLED') return t.status === 'CANCELLED';
    if (activeFilter === 'CASH') return t.paymentMethod === 'CASH';
    if (activeFilter === 'ONLINE') return t.paymentMethod === 'ONLINE';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Sử Cuốc Xe & Chuyến Đi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Summary Banner */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Hiệu suất hoạt động hôm nay</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryNum}>4</Text>
              <Text style={styles.summaryLabel}>Cuốc hoàn thành</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryNum}>18.5 km</Text>
              <Text style={styles.summaryLabel}>Tổng cự ly</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryNumGreen}>195.500đ</Text>
              <Text style={styles.summaryLabel}>Thu nhập ròng</Text>
            </View>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'COMPLETED', label: 'Hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' },
            { id: 'CASH', label: 'Thu tiền mặt' },
            { id: 'ONLINE', label: 'Thanh toán App' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.id as any)}
            >
              <Text style={[styles.filterChipText, activeFilter === f.id && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trips List */}
        {filteredTrips.map((trip) => {
          const isCancelled = trip.status === 'CANCELLED';
          const isCash = trip.paymentMethod === 'CASH';

          return (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/booking-detail?id=${trip.id}`)}
            >
              {/* Trip Header */}
              <View style={styles.tripCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.serviceIconWrap}>
                    <Ionicons name={trip.serviceIcon as any} size={18} color="#0088FF" />
                  </View>
                  <View>
                    <Text style={styles.tripCode}>#{trip.id} • {trip.serviceType}</Text>
                    <Text style={styles.tripTime}>{trip.date}</Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    isCancelled ? { backgroundColor: '#FEE2E2' } : { backgroundColor: '#D1FAE5' },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, isCancelled ? { color: '#EF4444' } : { color: '#059669' }]}>
                    {isCancelled ? 'Đã hủy' : 'Hoàn thành'}
                  </Text>
                </View>
              </View>

              {/* Route */}
              <View style={styles.routeContainer}>
                {/* Pickup */}
                <View style={styles.routeRow}>
                  <View style={styles.pickupDot} />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {trip.pickup}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                {/* Dropoff */}
                <View style={styles.routeRow}>
                  <Ionicons name="location" size={14} color="#EF4444" style={{ marginLeft: -1, marginRight: 2 }} />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {trip.dropoff}
                  </Text>
                </View>
              </View>

              {/* Payment & Earnings Summary */}
              <View style={styles.tripFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={[
                      styles.paymentBadge,
                      isCash ? { backgroundColor: '#FEF3C7' } : { backgroundColor: '#EFF6FF' },
                    ]}
                  >
                    <Ionicons
                      name={isCash ? 'cash-outline' : 'card-outline'}
                      size={13}
                      color={isCash ? '#D97706' : '#0284C7'}
                    />
                    <Text style={[styles.paymentBadgeText, isCash ? { color: '#D97706' } : { color: '#0284C7' }]}>
                      {isCash ? 'TIỀN MẶT' : 'ONLINE / APP'}
                    </Text>
                  </View>
                  <Text style={styles.distanceTag}>{trip.distanceKm} km</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  {isCancelled ? (
                    <Text style={styles.cancelReasonText}>{trip.cancelReason}</Text>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                      <Text style={styles.earningsLabel}>Thực nhận:</Text>
                      <Text style={styles.earningsValue}>+{trip.driverEarnings.toLocaleString('vi-VN')}đ</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  content: { padding: 16 },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryCol: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 32, backgroundColor: '#F1F5F9' },
  summaryNum: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  summaryNumGreen: { fontSize: 17, fontWeight: '900', color: '#059669' },
  summaryLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  filterScroll: { flexDirection: 'row', marginBottom: 16 },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterChipTextActive: { color: '#FFFFFF' },

  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 10,
    marginBottom: 10,
  },
  serviceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripCode: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  tripTime: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },

  routeContainer: { paddingVertical: 4 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pickupDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginLeft: 2, marginRight: 2 },
  routeLine: { width: 2, height: 14, backgroundColor: '#CBD5E1', marginLeft: 5, marginVertical: 2 },
  routeText: { flex: 1, fontSize: 13, color: '#334155', fontWeight: '500' },

  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  paymentBadgeText: { fontSize: 10, fontWeight: '800' },
  distanceTag: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  earningsLabel: { fontSize: 11, color: '#64748B' },
  earningsValue: { fontSize: 15, fontWeight: '900', color: '#059669' },
  cancelReasonText: { fontSize: 12, color: '#EF4444', fontStyle: 'italic' },
});
