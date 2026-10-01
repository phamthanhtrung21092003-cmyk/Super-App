import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useFood } from '../../context/FoodContext';

export default function CartScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const { 
    cart, 
    restaurant, 
    subtotal, 
    shippingFeeInfo, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    addToCart 
  } = useFood();

  const progress = Math.min((subtotal / shippingFeeInfo.freeshipThreshold) * 100, 100);

  // Món gợi ý thông minh bù tiền Freeship (Smart Upsell)
  const UPSELL_ITEMS = [
    {
      id: 'up_tea',
      name: 'Trà Đào Cam Sả Mát Lạnh',
      price: 45000,
      img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'up_garlic_bread',
      name: 'Bánh Mì Bơ Tỏi Nướng Giòn',
      price: 35000,
      img: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const handleAddUpsell = (item: typeof UPSELL_ITEMS[0]) => {
    if (!restaurant) return;
    addToCart(
      {
        menuItemId: item.id,
        name: item.name,
        basePrice: item.price,
        image: item.img,
        quantity: 1,
        toppings: [],
      },
      restaurant
    );
  };

  if (cart.length === 0) {
    return (
      <View style={styles.webWrapper}>
        <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/food')}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Giỏ Hàng</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="cart-outline" size={64} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
            <Text style={styles.emptyDesc}>Hãy khám phá thực đơn phong phú và chọn những món ăn ngon lành nhé!</Text>
            <TouchableOpacity 
              style={[styles.emptyBtn, { backgroundColor: accentColor }]}
              onPress={() => router.replace('/food')}
            >
              <Text style={styles.emptyBtnText}>Khám phá món ngon ngay</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/food')}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Giỏ Hàng</Text>
            {restaurant && (
              <Text style={styles.headerSub} numberOfLines={1}>{restaurant.name}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={clearCart}>
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
                  <Text style={styles.aiFreeshipTitle}>ƯU ĐÃI FREESHIP ({shippingFeeInfo.distanceKm} KM)</Text>
                </View>
                <Text style={styles.aiFreeshipSub}>
                  {shippingFeeInfo.remainingForFreeship > 0 
                    ? `Mua thêm ${shippingFeeInfo.remainingForFreeship.toLocaleString('vi-VN')}đ để được Freeship (đơn từ ${shippingFeeInfo.freeshipThreshold.toLocaleString('vi-VN')}đ)!` 
                    : `🎉 Đơn hàng đã đạt điều kiện Freeship (tiết kiệm ${shippingFeeInfo.discountAmount.toLocaleString('vi-VN')}đ)!`}
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </Animated.View>

            {/* Smart Upsell: Gợi ý món bù tiền để đạt Freeship */}
            {shippingFeeInfo.remainingForFreeship > 0 && (
              <View style={styles.upsellWrapper}>
                <View style={styles.upsellHeader}>
                  <Ionicons name="bulb-outline" size={16} color="#F97316" />
                  <Text style={styles.upsellTitle}>Gợi ý thêm để đủ điều kiện Freeship</Text>
                </View>
                {UPSELL_ITEMS.map((up) => (
                  <View key={up.id} style={styles.upsellItem}>
                    <Image source={{ uri: up.img }} style={styles.upsellImg} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.upsellName} numberOfLines={1}>{up.name}</Text>
                      <Text style={styles.upsellPrice}>{up.price.toLocaleString('vi-VN')}đ</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.upsellAddBtn}
                      onPress={() => handleAddUpsell(up)}
                    >
                      <Ionicons name="add" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Danh sách món trong giỏ */}
            <View style={styles.itemsWrapper}>
              <Text style={styles.sectionHeading}>Món đã chọn ({cart.reduce((s, i) => s + i.quantity, 0)})</Text>
              
              {cart.map((item) => {
                const optionsDescription = [
                  item.size ? item.size.name : '',
                  item.toppings.length > 0 ? item.toppings.map(t => t.name).join(', ') : '',
                  item.notes ? `Ghi chú: ${item.notes}` : ''
                ].filter(Boolean).join(' • ');

                return (
                  <View key={item.cartItemId} style={styles.cartItem}>
                    {item.image && <Image source={{ uri: item.image }} style={styles.itemImg} />}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {optionsDescription ? (
                        <Text style={styles.itemDetails} numberOfLines={2}>{optionsDescription}</Text>
                      ) : null}
                      <Text style={styles.itemPrice}>{item.totalPrice.toLocaleString('vi-VN')}đ</Text>
                    </View>

                    <View style={styles.qtyBox}>
                      <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.cartItemId, -1)}
                      >
                        <Ionicons 
                          name={item.quantity === 1 ? "trash-outline" : "remove"} 
                          size={16} 
                          color={item.quantity === 1 ? "#EF4444" : "#0F172A"} 
                        />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.cartItemId, 1)}
                      >
                        <Ionicons name="add" size={16} color="#0F172A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity 
                style={styles.addMoreBtn}
                onPress={() => router.canGoBack() ? router.back() : router.replace('/food')}
              >
                <Ionicons name="add-circle-outline" size={18} color={accentColor} />
                <Text style={[styles.addMoreText, { color: accentColor }]}>Thêm món khác từ quán</Text>
              </TouchableOpacity>
            </View>

            {/* Chi tiết thanh toán tạm tính */}
            <View style={styles.summaryBox}>
              <Text style={styles.sectionHeading}>Tóm tắt hóa đơn</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tiền món ({cart.length} món)</Text>
                <Text style={styles.summaryVal}>{subtotal.toLocaleString('vi-VN')}đ</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí giao hàng (~{shippingFeeInfo.distanceKm} km)</Text>
                <Text style={styles.summaryVal}>{shippingFeeInfo.originalShippingFee.toLocaleString('vi-VN')}đ</Text>
              </View>

              {shippingFeeInfo.discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#10B981' }]}>Khuyến mãi Freeship</Text>
                  <Text style={[styles.summaryVal, { color: '#10B981' }]}>
                    -{shippingFeeInfo.discountAmount.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                <Text style={styles.totalVal}>
                  {(subtotal + shippingFeeInfo.finalShippingFee).toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Checkout Bottom Bar */}
        <View style={styles.checkoutBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.barTotalLabel}>Tổng cộng</Text>
            <Text style={styles.barTotalVal}>
              {(subtotal + shippingFeeInfo.finalShippingFee).toLocaleString('vi-VN')}đ
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.checkoutBtn, { backgroundColor: accentColor }]} 
            onPress={() => router.push('/food/checkout' as any)}
          >
            <Text style={styles.checkoutText}>Giao đến bạn</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#020617', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', backgroundColor: '#F8FAFC' },
  desktopFrame: { maxWidth: 500, borderWidth: 1, borderColor: '#1E293B' },

  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', 
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9' 
  },
  iconBtn: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', 
    justifyContent: 'center', alignItems: 'center' 
  },
  headerTitle: { color: '#0F172A', fontSize: 17, fontWeight: '800' },
  headerSub: { color: '#64748B', fontSize: 12, marginTop: 2, maxWidth: 220 },

  content: { padding: 16 },

  aiFreeshipBox: { 
    backgroundColor: '#ECFDF5', padding: 14, borderRadius: 16, 
    borderWidth: 1, borderColor: '#A7F3D0', marginBottom: 16 
  },
  aiFreeshipHeader: { marginBottom: 10 },
  aiFreeshipTitle: { color: '#059669', fontSize: 12, fontWeight: '800' },
  aiFreeshipSub: { color: '#0F172A', fontSize: 13, fontWeight: '600', marginTop: 4 },
  progressBg: { height: 6, backgroundColor: '#D1FAE5', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },

  upsellWrapper: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 16, 
    borderWidth: 1, borderColor: '#FED7AA' 
  },
  upsellHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  upsellTitle: { fontSize: 13, fontWeight: '700', color: '#C2410C' },
  upsellItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  upsellImg: { width: 44, height: 44, borderRadius: 8 },
  upsellName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  upsellPrice: { fontSize: 12, color: '#F97316', fontWeight: '700', marginTop: 2 },
  upsellAddBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },

  itemsWrapper: { 
    backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', 
    padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6 
  },
  sectionHeading: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  cartItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  itemImg: { width: 60, height: 60, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  itemDetails: { color: '#64748B', fontSize: 12, marginTop: 3 },
  itemPrice: { color: '#F97316', fontSize: 14, fontWeight: '800', marginTop: 4 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, height: 32 },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyText: { color: '#0F172A', fontSize: 14, fontWeight: '700', width: 24, textAlign: 'center' },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 14, gap: 6 },
  addMoreText: { fontSize: 13, fontWeight: '700' },

  summaryBox: { 
    backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', 
    padding: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6 
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#64748B', fontSize: 13 },
  summaryVal: { color: '#0F172A', fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  totalLabel: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  totalVal: { color: '#F97316', fontSize: 17, fontWeight: '800' },

  checkoutBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', 
    borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingHorizontal: 16, 
    paddingVertical: Platform.OS === 'ios' ? 24 : 14, flexDirection: 'row', 
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10 
  },
  barTotalLabel: { fontSize: 11, color: '#64748B' },
  barTotalVal: { fontSize: 18, fontWeight: '800', color: '#F97316' },
  checkoutBtn: { 
    flexDirection: 'row', alignItems: 'center', borderRadius: 12, 
    paddingVertical: 12, paddingHorizontal: 22 
  },
  checkoutText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
  emptyBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
