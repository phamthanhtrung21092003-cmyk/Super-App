import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  Platform, SafeAreaView, StatusBar, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useFoodMerchant } from '../../context/FoodMerchantContext';

export default function MerchantFinancials() {
  const { 
    financials, 
    orders, 
    todayRevenue, 
    weekRevenue, 
    todayCompletedCount, 
    cancelledCount,
    refreshFinancials,
    refreshOrders 
  } = useFoodMerchant();

  const [refreshing, setRefreshing] = useState(false);
  const primaryColor = '#0066FF';

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshFinancials(), refreshOrders()]);
    setRefreshing(false);
  };

  const formatPrice = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + 'đ';
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const totalCompletedOrders = financials?.totalOrders || orders.filter((o) => o.status === 'COMPLETED').length;
  const netPayout = financials?.netPayout || orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + (o.restaurantPayout || Math.round((o.subtotal || 0) * 0.9)), 0);

  const totalFoodRevenue = financials?.totalRevenue || orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + (o.subtotal || o.total || 0), 0);

  const platformSpread = financials?.platformFee || Math.round(netPayout / 0.9 * 0.2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Báo Cáo Tài Chính</Text>
          <Text style={styles.headerSub}>Quyết toán minh bạch & đối soát doanh thu tự động</Text>
        </View>

        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#059669" />
          <Text style={styles.verifiedText}>Đối soát chuẩn</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
      >
        {/* Card Tổng Quyết Toán Thực Nhận */}
        <Animated.View entering={FadeInUp.duration(300)} style={styles.mainPayoutCard}>
          <Text style={styles.mainPayoutLabel}>TỔNG TIỀN QUÁN THỰC NHẬN (90%)</Text>
          <Text style={styles.mainPayoutAmount}>{formatPrice(netPayout)}</Text>
          <Text style={styles.mainPayoutSub}>
            Đã kết chuyển từ {totalCompletedOrders} đơn hàng hoàn tất thành công
          </Text>

          <View style={styles.payoutCardDivider} />

          <View style={styles.subStatsRow}>
            <View style={styles.subStatCol}>
              <Text style={styles.subStatLabel}>Hôm nay (90%)</Text>
              <Text style={styles.subStatVal}>{formatPrice(todayRevenue)}</Text>
            </View>
            <View style={styles.subStatDivider} />
            <View style={styles.subStatCol}>
              <Text style={styles.subStatLabel}>7 ngày gần nhất</Text>
              <Text style={styles.subStatVal}>{formatPrice(weekRevenue)}</Text>
            </View>
            <View style={styles.subStatDivider} />
            <View style={styles.subStatCol}>
              <Text style={styles.subStatLabel}>Đơn hoàn tất</Text>
              <Text style={[styles.subStatVal, { color: '#059669' }]}>{todayCompletedCount} đơn</Text>
            </View>
          </View>
        </Animated.View>

        {/* Khối Giải Trình Mô Hình Tài Chính V-Life */}
        <Animated.View entering={FadeInUp.delay(100).duration(350)} style={styles.modelExplainerCard}>
          <View style={styles.explainerHeader}>
            <Ionicons name="information-circle" size={20} color="#0066FF" />
            <Text style={styles.explainerTitle}>Mô Hình Doanh Thu Minh Bạch V-Life</Text>
          </View>

          <Text style={styles.explainerDesc}>
            V-Life áp dụng cơ chế đối soát độc lập, bảo đảm quán nhận đủ 90% giá gốc niêm yết mà không phát sinh phụ phí ẩn:
          </Text>

          <View style={styles.modelRows}>
            <View style={styles.modelRow}>
              <View style={[styles.modelDot, { backgroundColor: '#059669' }]} />
              <Text style={styles.modelLabel}>Quán thực nhận:</Text>
              <Text style={styles.modelValue}>90% giá gốc món</Text>
            </View>

            <View style={styles.modelRow}>
              <View style={[styles.modelDot, { backgroundColor: '#0066FF' }]} />
              <Text style={styles.modelLabel}>Khách hàng thanh toán:</Text>
              <Text style={styles.modelValue}>110% giá gốc món</Text>
            </View>

            <View style={styles.modelRow}>
              <View style={[styles.modelDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.modelLabel}>Phí vận hành V-Life (Gross Spread):</Text>
              <Text style={styles.modelValue}>20% giá gốc món</Text>
            </View>

            <View style={styles.modelRow}>
              <View style={[styles.modelDot, { backgroundColor: '#7C3AED' }]} />
              <Text style={styles.modelLabel}>Phí vận chuyển (Shipping):</Text>
              <Text style={styles.modelValue}>100% dành cho Tài xế</Text>
            </View>
          </View>
        </Animated.View>

        {/* Thống Kê Tổng Quan */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { borderLeftColor: '#0066FF' }]}>
            <Text style={styles.metricCardLabel}>Tổng doanh thu món</Text>
            <Text style={styles.metricCardVal}>{formatPrice(totalFoodRevenue)}</Text>
            <Text style={styles.metricCardSub}>Khách đã chi trả</Text>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#DC2626' }]}>
            <Text style={styles.metricCardLabel}>Đơn đã hủy</Text>
            <Text style={[styles.metricCardVal, { color: '#DC2626' }]}>{cancelledCount} đơn</Text>
            <Text style={styles.metricCardSub}>Tỷ lệ hủy thấp</Text>
          </View>
        </View>

        {/* Lịch Sử Quyết Toán Đơn Hàng Gần Nhất */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Lịch Sử Quyết Toán Đơn Hoàn Tất</Text>

          {financials?.settledOrders && financials.settledOrders.length > 0 ? (
            financials.settledOrders.map((item, idx) => (
              <View key={item.id || idx} style={styles.settledOrderCard}>
                <View style={styles.settledOrderHeader}>
                  <View>
                    <Text style={styles.settledOrderCode}>#{item.orderCode}</Text>
                    <Text style={styles.settledOrderTime}>{formatDateTime(item.completedAt)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.settledOrderPayout}>+{formatPrice(item.restaurantPayout)}</Text>
                    <Text style={styles.settledOrderPayoutLabel}>Quán thực nhận (90%)</Text>
                  </View>
                </View>

                <View style={styles.settledOrderFooter}>
                  <Text style={styles.settledOrderSub}>
                    Khách trả: {formatPrice(item.total)} • Giá gốc: {formatPrice(item.originalFoodAmount)}
                  </Text>
                  <View style={styles.settledBadge}>
                    <Text style={styles.settledBadgeText}>Đã quyết toán</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyHistoryBox}>
              <Ionicons name="receipt-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyHistoryText}>Chưa có lịch sử giao dịch quyết toán gần đây</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  mainPayoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  mainPayoutLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  mainPayoutAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  mainPayoutSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  payoutCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  subStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  subStatLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  subStatVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  modelExplainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  explainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explainerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  explainerDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  modelRows: {
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modelLabel: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
  },
  modelValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
  },
  metricCardLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  metricCardVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  metricCardSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  historySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  settledOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settledOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settledOrderCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  settledOrderTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  settledOrderPayout: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  settledOrderPayoutLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  settledOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  settledOrderSub: {
    fontSize: 11,
    color: '#64748B',
  },
  settledBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  settledBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  emptyHistoryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyHistoryText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
  },
});
