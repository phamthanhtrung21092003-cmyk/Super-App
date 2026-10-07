import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFoodMerchant } from '../../context/FoodMerchantContext';

export default function MerchantMore() {
  const router = useRouter();
  const { restaurant } = useFoodMerchant();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mở Rộng & Cài Đặt</Text>
      </View>

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/food-merchant/financials' as any)}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="wallet" size={22} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Báo Cáo Tài Chính & Quyết Toán</Text>
            <Text style={styles.menuSub}>Doanh thu 90%, lịch sử giao dịch và đối soát ngân hàng</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/food-merchant/reviews' as any)}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={22} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Đánh Giá & Nhận Xét Khách Hàng</Text>
            <Text style={styles.menuSub}>Phản hồi chất lượng món ăn, phục vụ và thống kê sao</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/food-merchant/vouchers' as any)}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="ticket" size={22} color="#F97316" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Quản Lý Khuyến Mãi & Voucher</Text>
            <Text style={styles.menuSub}>Tạo mã giảm giá riêng của quán, theo dõi số lượt sử dụng</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/food-merchant/profile' as any)}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="storefront" size={22} color="#0066FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Hồ Sơ Quán & Cấu Hình Ngân Hàng</Text>
            <Text style={styles.menuSub}>{restaurant?.name || 'Thông tin nhà hàng, giờ mở cửa'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.replace('/account' as any)}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#F8FAFC' }]}>
            <Ionicons name="home" size={22} color="#64748B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Về Trang Chủ Người Dùng</Text>
            <Text style={styles.menuSub}>Quay lại ứng dụng khách hàng V-Life</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
