import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { foodService } from '../../services/foodService';

export default function FoodVouchersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const [activeTab, setActiveTab] = useState<'ALL' | 'SYSTEM' | 'RESTAURANT'>('ALL');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    try {
      const data = await foodService.getAvailableVouchers();
      setVouchers(data || []);
    } catch (err: any) {
      console.log('[FoodVouchersScreen] Lỗi tải voucher:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVouchers();
  };

  const filteredVouchers = vouchers.filter((v) => {
    // Filter theo tab
    if (activeTab === 'SYSTEM' && !v.isSystem) return false;
    if (activeTab === 'RESTAURANT' && v.isSystem) return false;

    // Filter theo search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = v.code.toLowerCase().includes(q);
      const nameMatch = v.name.toLowerCase().includes(q);
      const restMatch = v.restaurantName?.toLowerCase().includes(q);
      return codeMatch || nameMatch || restMatch;
    }
    return true;
  });

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleUseNow = (voucher: any) => {
    if (voucher.restaurantId) {
      router.push({
        pathname: '/food/restaurant/[id]' as any,
        params: { id: voucher.restaurantId },
      });
    } else {
      router.push('/food' as any);
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/food' as any))}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kho Voucher & Ưu Đãi</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm mã khuyến mãi, tên quán..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.trim() ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Tabs Filter */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'ALL' && styles.tabItemActive]}
            onPress={() => setActiveTab('ALL')}
          >
            <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
              Tất cả ({vouchers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'SYSTEM' && styles.tabItemActive]}
            onPress={() => setActiveTab('SYSTEM')}
          >
            <Text style={[styles.tabText, activeTab === 'SYSTEM' && styles.tabTextActive]}>
              V-Life Sàn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'RESTAURANT' && styles.tabItemActive]}
            onPress={() => setActiveTab('RESTAURANT')}
          >
            <Text style={[styles.tabText, activeTab === 'RESTAURANT' && styles.tabTextActive]}>
              Quán ăn
            </Text>
          </TouchableOpacity>
        </View>

        {/* Body content */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13 }}>Đang tải kho ưu đãi...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[accentColor]} />}
          >
            {filteredVouchers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="ticket-outline" size={56} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Chưa có mã khuyến mãi nào</Text>
                <Text style={styles.emptySubtitle}>
                  Các chương trình giảm giá và mã freeship sẽ sớm xuất hiện tại đây.
                </Text>
              </View>
            ) : (
              filteredVouchers.map((v, index) => {
                const isCopied = copiedCode === v.code;
                const isFreeship = v.type === 'FREESHIP';
                const isPercent = v.type === 'PERCENT';

                return (
                  <Animated.View
                    key={v.id}
                    entering={FadeInDown.delay(index * 60).duration(300)}
                    style={styles.voucherCard}
                  >
                    {/* Left coupon cutout indicator */}
                    <View style={styles.couponLeft}>
                      <View
                        style={[
                          styles.voucherBadgeIcon,
                          { backgroundColor: isFreeship ? '#EFF6FF' : '#FFF7ED' },
                        ]}
                      >
                        <Ionicons
                          name={isFreeship ? 'bicycle' : isPercent ? 'gift' : 'cash'}
                          size={24}
                          color={isFreeship ? '#2563EB' : '#F97316'}
                        />
                      </View>
                      <Text style={styles.couponTagText}>
                        {isPercent ? `${v.value}%` : isFreeship ? 'SHIP' : 'GIẢM'}
                      </Text>
                    </View>

                    {/* Divider dotted line */}
                    <View style={styles.couponDivider} />

                    {/* Right coupon details */}
                    <View style={styles.couponRight}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.couponScope}>
                          {v.isSystem ? 'Toàn sàn V-Life' : v.restaurantName || 'Quán ăn'}
                        </Text>
                        <View style={styles.codePill}>
                          <Text style={styles.codePillText}>{v.code}</Text>
                        </View>
                      </View>

                      <Text style={styles.couponName} numberOfLines={2}>
                        {v.name}
                      </Text>

                      {v.description ? (
                        <Text style={styles.couponDesc} numberOfLines={2}>
                          {v.description}
                        </Text>
                      ) : null}

                      <View style={styles.couponConditionWrap}>
                        <Text style={styles.couponConditionText}>
                          Đơn tối thiểu {v.minOrderValue?.toLocaleString('vi-VN')}đ
                          {v.maxDiscount ? ` • Tối đa ${v.maxDiscount.toLocaleString('vi-VN')}đ` : ''}
                        </Text>
                        <Text style={styles.couponExpiryText}>
                          HSD: {new Date(v.endAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>

                      {/* Actions */}
                      <View style={styles.couponActionRow}>
                        <TouchableOpacity
                          style={[styles.copyBtn, isCopied && styles.copyBtnDone]}
                          onPress={() => handleCopyCode(v.code)}
                        >
                          <Ionicons
                            name={isCopied ? 'checkmark' : 'copy-outline'}
                            size={14}
                            color={isCopied ? '#10B981' : '#64748B'}
                          />
                          <Text style={[styles.copyBtnText, isCopied && { color: '#10B981' }]}>
                            {isCopied ? 'Đã chép' : 'Sao chép'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.useNowBtn, { backgroundColor: accentColor }]}
                          onPress={() => handleUseNow(v)}
                        >
                          <Text style={styles.useNowText}>Dùng ngay</Text>
                          <Ionicons name="chevron-forward" size={14} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.View>
                );
              })
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#020617', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', backgroundColor: '#F8FAFC' },
  desktopFrame: { maxWidth: 500, borderWidth: 1, borderColor: '#1E293B' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#0F172A', fontSize: 17, fontWeight: '800' },

  searchSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#F97316' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#F97316' },

  scrollContent: { padding: 16, gap: 12 },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 14 },
  emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 18 },

  voucherCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  couponLeft: {
    width: 90,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  voucherBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  couponTagText: { fontSize: 12, fontWeight: '900', color: '#334155' },

  couponDivider: {
    width: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    borderStyle: 'dashed',
  },

  couponRight: { flex: 1, padding: 12 },
  couponScope: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  codePill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codePillText: { fontSize: 11, fontWeight: '800', color: '#F97316' },
  couponName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  couponDesc: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 16 },

  couponConditionWrap: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  couponConditionText: { fontSize: 11, color: '#64748B' },
  couponExpiryText: { fontSize: 10, color: '#94A3B8', marginTop: 2 },

  couponActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  copyBtnDone: { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' },
  copyBtnText: { fontSize: 11, fontWeight: '700', color: '#64748B' },

  useNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  useNowText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
});
