import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function CartScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const CART_ITEMS = [
    { id: '1', name: 'Pizza Hải Sản Viền Phô Mai', details: 'Size L, Thêm Xúc Xích', price: 255000, qty: 1, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80' },
    { id: '2', name: 'Trà Đào Cam Sả', details: 'Size M, Ít đá', price: 45000, qty: 2, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=200&q=80' },
  ];

  const subtotal = CART_ITEMS.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 15000;
  const freeshipThreshold = 400000;
  const remainingForFreeship = freeshipThreshold - subtotal;
  const progress = Math.min((subtotal / freeshipThreshold) * 100, 100);

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/food')}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ Hàng</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => alert('Đã xóa toàn bộ giỏ hàng')}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.content}>
            
            {/* AI Freeship Progress */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.aiFreeshipBox}>
              <View style={styles.aiFreeshipHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="sparkles" size={16} color="#10B981" />
                  <Text style={styles.aiFreeshipTitle}>AI Tối ưu Khuyến mãi</Text>
                </View>
                <Text style={styles.aiFreeshipSub}>
                  {remainingForFreeship > 0 
                    ? `Mua thêm ${remainingForFreeship.toLocaleString('vi-VN')}đ để Freeship!` 
                    : 'Tuyệt vời! Đơn của bạn đã được Freeship'}
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </Animated.View>

            {/* Items */}
            <Animated.View entering={FadeInUp.duration(400)} style={styles.itemsWrapper}>
              {CART_ITEMS.map((item, idx) => (
                <View key={item.id} style={[styles.cartItem, idx === CART_ITEMS.length - 1 && { borderBottomWidth: 0 }]}>
                  <Image source={{ uri: item.img }} style={styles.itemImg} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemDetails}>{item.details}</Text>
                    <Text style={styles.itemPrice}>{(item.price * item.qty).toLocaleString('vi-VN')}đ</Text>
                  </View>
                  <View style={styles.qtyBox}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => alert('Giảm số lượng')}>
                      <Ionicons name="remove" size={16} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => alert('Tăng số lượng')}>
                      <Ionicons name="add" size={16} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.addMoreBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/food')}>
                <Ionicons name="add-circle-outline" size={20} color={accentColor} />
                <Text style={{ color: accentColor, fontWeight: '700', marginLeft: 8 }}>Thêm món khác</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Voucher Selection */}
            <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.voucherBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="ticket" size={24} color="#F59E0B" />
                <View>
                  <Text style={styles.voucherTitle}>Mã khuyến mãi</Text>
                  <Text style={styles.voucherSub}>AI đã tự động chọn mã tốt nhất</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </Animated.View>

            {/* Summary */}
            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính</Text>
                <Text style={styles.summaryVal}>{subtotal.toLocaleString('vi-VN')}đ</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí giao hàng</Text>
                <Text style={styles.summaryVal}>{shipping.toLocaleString('vi-VN')}đ</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Khuyến mãi (AI Tự động)</Text>
                <Text style={[styles.summaryVal, { color: '#10B981' }]}>-{shipping.toLocaleString('vi-VN')}đ</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                <Text style={styles.totalVal}>{subtotal.toLocaleString('vi-VN')}đ</Text>
              </View>
            </Animated.View>

            <View style={{ height: 120 }} />
          </View>
        </ScrollView>

        {/* Checkout Bottom */}
        <View style={styles.checkoutBar}>
          <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: accentColor }]} onPress={() => {
            alert('Tính năng Thanh toán (Phase 3) đang được phát triển!');
          }}>
            <Text style={styles.checkoutText}>Đặt đơn • {subtotal.toLocaleString('vi-VN')}đ</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#FFF', width: '100%', position: 'relative' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#E2E8F0', borderRadius: 55, overflow: 'hidden' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 10 : 30, paddingBottom: 15, backgroundColor: '#FFF' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  
  content: { padding: 16 },

  aiFreeshipBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', marginBottom: 20 },
  aiFreeshipHeader: { marginBottom: 12 },
  aiFreeshipTitle: { color: '#10B981', fontSize: 13, fontWeight: '800' },
  aiFreeshipSub: { color: '#0F172A', fontSize: 14, fontWeight: '600', marginTop: 4 },
  progressBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },

  itemsWrapper: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cartItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  itemImg: { width: 60, height: 60, borderRadius: 12 },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  itemDetails: { color: '#64748B', fontSize: 12, marginTop: 4 },
  itemPrice: { color: '#F97316', fontSize: 14, fontWeight: '700', marginTop: 6 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, height: 32, alignSelf: 'flex-end', marginBottom: 4 },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyText: { color: '#0F172A', fontSize: 14, fontWeight: '700', width: 24, textAlign: 'center' },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 16 },

  voucherBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  voucherTitle: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  voucherSub: { color: '#64748B', fontSize: 12, marginTop: 2 },

  summaryBox: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: '#64748B', fontSize: 14 },
  summaryVal: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  totalLabel: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  totalVal: { color: '#F97316', fontSize: 18, fontWeight: '800' },

  checkoutBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 30 : 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } },
  checkoutBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  checkoutText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
