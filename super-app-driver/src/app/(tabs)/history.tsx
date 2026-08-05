import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PartnerHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('ALL');

  const historyItems = [
    {
      id: 'VL202608031001',
      type: 'Homestay',
      serviceTitle: 'Homestay Phú Quốc Luxury Villa',
      customerName: 'Nguyễn Văn A',
      grossAmount: 5000000,
      partnerAmount: 4500000,
      status: 'CONFIRMED',
      date: '03/08/2026',
    },
    {
      id: 'VL202608031002',
      type: 'Hotel',
      serviceTitle: 'Vinpearl Resort Phú Quốc',
      customerName: 'Trần Thị B',
      grossAmount: 3500000,
      partnerAmount: 3150000,
      status: 'PAYOUT_PROCESSING',
      date: '03/08/2026',
    },
    {
      id: 'VL202608031003',
      type: 'Camping',
      serviceTitle: 'Lều Glamping Đà Lạt View Mây',
      customerName: 'Lê Văn C',
      grossAmount: 1800000,
      partnerAmount: 1620000,
      status: 'PAYOUT_ERROR',
      date: '02/08/2026',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', color: '#10B981', bg: '#D1FAE5' };
      case 'PAYOUT_PROCESSING':
        return { label: 'Đang xử lý Payout', color: '#0284C7', bg: '#E0F2FE' };
      case 'PAYOUT_ERROR':
        return { label: 'Thanh toán lỗi', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { label: status, color: '#4B5563', bg: '#F3F4F6' };
    }
  };

  const filteredItems = historyItems.filter((item) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CONFIRMED') return item.status === 'CONFIRMED';
    if (activeFilter === 'PROCESSING') return item.status === 'PAYOUT_PROCESSING';
    if (activeFilter === 'ERROR') return item.status === 'PAYOUT_ERROR';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản Lý Đơn Đặt Dịch Vụ Đối Tác</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Filters */}
        <View style={styles.filters}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'CONFIRMED', label: 'Đã xác nhận' },
            { id: 'PROCESSING', label: 'Đang Payout' },
            { id: 'ERROR', label: 'Cần xử lý' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterChip, activeFilter === filter.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[styles.filterChipText, activeFilter === filter.id && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {filteredItems.map((item) => {
          const badge = getStatusBadge(item.status);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/booking-detail?id=${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.bookingCode}>Booking #{item.id}</Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>

              <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>

              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={14} color="#64748B" />
                <Text style={styles.infoText}>Khách hàng: {item.customerName}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.footerLabel}>Thực nhận (Server):</Text>
                  <Text style={styles.footerValue}>{item.partnerAmount.toLocaleString()}đ</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  content: { padding: 16 },
  filters: { flexDirection: 'row', marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  filterChipActive: { backgroundColor: '#0088FF', borderColor: '#0088FF' },
  filterChipText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  filterChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingCode: { fontSize: 14, fontWeight: 'bold', color: '#0088FF' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  serviceTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 13, color: '#64748B', marginLeft: 6 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel: { fontSize: 11, color: '#64748B' },
  footerValue: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
});
