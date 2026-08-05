import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { partnerService, PartnerFinanceResponse } from '../../services/partnerService';

export default function WalletScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financeData, setFinanceData] = useState<PartnerFinanceResponse | null>(null);

  const fetchFinance = async () => {
    try {
      const data = await partnerService.getPartnerFinance();
      setFinanceData(data);
    } catch (error) {
      console.log('Error fetching partner finance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinance();
  };

  const balance = financeData?.balance || {
    availableBalance: 12500000,
    pendingBalance: 3500000,
    totalRevenue: 18000000,
    totalCommission: 2000000,
    totalPaidOut: 12500000,
  };

  const getPayoutBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return { label: 'Thành công', color: '#10B981', bg: '#D1FAE5' };
      case 'PROCESSING':
        return { label: 'Đang xử lý', color: '#0284C7', bg: '#E0F2FE' };
      case 'FAILED':
        return { label: 'Thất bại', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { label: status, color: '#4B5563', bg: '#F3F4F6' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ví & Báo Cáo Tài Chính Đối Tác</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0088FF" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Card Số dư ví chính */}
          <View style={styles.mainBalanceCard}>
            <Text style={styles.balanceLabel}>Số Dư Khả Dụng (Available Balance)</Text>
            <Text style={styles.balanceValue}>{balance.availableBalance.toLocaleString()}đ</Text>

            <View style={styles.pendingRow}>
              <Ionicons name="time-outline" size={16} color="#FCD34D" />
              <Text style={styles.pendingText}>
                Tiền đang chờ Payout: {balance.pendingBalance.toLocaleString()}đ
              </Text>
            </View>
          </View>

          {/* Phân rã Doanh thu & Hoa hồng */}
          <View style={styles.gridContainer}>
            <View style={styles.gridCard}>
              <Ionicons name="stats-chart" size={24} color="#0088FF" />
              <Text style={styles.gridLabel}>Tổng doanh thu</Text>
              <Text style={styles.gridValBlue}>{balance.totalRevenue.toLocaleString()}đ</Text>
            </View>

            <View style={styles.gridCard}>
              <Ionicons name="pie-chart" size={24} color="#EF4444" />
              <Text style={styles.gridLabel}>Hoa hồng V-life (10%)</Text>
              <Text style={styles.gridValRed}>{balance.totalCommission.toLocaleString()}đ</Text>
            </View>
          </View>

          {/* Thông tin tài khoản Ngân hàng nhận Payout */}
          <View style={styles.bankCard}>
            <Text style={styles.cardSectionTitle}>TÀI KHOẢN NGÂN HÀNG PAIRED</Text>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Ngân hàng:</Text>
              <Text style={styles.bankVal}>{financeData?.bankInfo?.bankName || 'MB BANK'}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Số tài khoản:</Text>
              <Text style={styles.bankValBold}>{financeData?.bankInfo?.bankAccountNo || '0912345678'}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Chủ tài khoản:</Text>
              <Text style={styles.bankVal}>{financeData?.bankInfo?.bankAccountHolder || 'SUPER APP TRAVEL V-LIFE'}</Text>
            </View>
          </View>

          {/* Lịch sử Payout từ Ngân hàng */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LỊCH SỬ PAYOUT GẦN ĐÂY</Text>
          </View>

          {financeData?.recentPayouts && financeData.recentPayouts.length > 0 ? (
            financeData.recentPayouts.map((item) => {
              const badge = getPayoutBadge(item.status);
              return (
                <TouchableOpacity
                  key={item.payoutId}
                  style={styles.payoutCard}
                  onPress={() => router.push(`/booking-detail?id=${item.bookingCode}`)}
                >
                  <View style={styles.payoutHeader}>
                    <Text style={styles.bookingCode}>Booking #{item.bookingCode}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <View style={styles.payoutBody}>
                    <Text style={styles.payoutAmount}>+{Number(item.amount).toLocaleString()}đ</Text>
                    <Text style={styles.payoutDate}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                  </View>

                  {item.failureReason && (
                    <Text style={styles.errorReason}>⚠️ Lý do lỗi: {item.failureReason}</Text>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có lịch sử Payout nào</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  content: { padding: 16 },
  mainBalanceCard: {
    backgroundColor: '#0088FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0088FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: { color: '#E0F2FE', fontSize: 13, fontWeight: '500' },
  balanceValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pendingText: { color: '#FDE68A', fontSize: 13, marginLeft: 6, fontWeight: '500' },
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  gridCard: { flex: 0.48, backgroundColor: '#FFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  gridLabel: { fontSize: 12, color: '#64748B', marginVertical: 4 },
  gridValBlue: { fontSize: 16, fontWeight: 'bold', color: '#0088FF' },
  gridValRed: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' },
  bankCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  cardSectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#0088FF', marginBottom: 10, letterSpacing: 0.5 },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  bankLabel: { fontSize: 13, color: '#64748B' },
  bankVal: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
  bankValBold: { fontSize: 13, color: '#0088FF', fontWeight: 'bold' },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', letterSpacing: 0.5 },
  payoutCard: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  payoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingCode: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  payoutBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payoutAmount: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  payoutDate: { fontSize: 12, color: '#64748B' },
  errorReason: { fontSize: 12, color: '#EF4444', marginTop: 6, fontStyle: 'italic' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 14 },
});
