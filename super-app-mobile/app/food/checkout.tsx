import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions, TextInput,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFood } from '../../src/context/FoodContext';

export default function FoodCheckoutScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const { 
    cart, 
    restaurant, 
    subtotal, 
    shippingFeeInfo, 
    placeOrder 
  } = useFood();

  const [deliveryAddress, setDeliveryAddress] = useState('Số 18, Ngõ 48 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội');
  const [noteForDriver, setNoteForDriver] = useState('');
  const [noteForMerchant, setNoteForMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'WALLET' | 'VIETQR'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = subtotal + shippingFeeInfo.finalShippingFee;

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const createdOrder = await placeOrder(
        deliveryAddress,
        paymentMethod,
        noteForMerchant,
        noteForDriver
      );

      // Chuyển hướng sang màn hình Live Tracking đơn hàng
      router.replace({
        pathname: '/food/tracking/[id]' as any,
        params: { id: createdOrder.orderCode || createdOrder.id },
      });
    } catch (e) {
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/food/cart')}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác Nhận Đơn Hàng</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.content}>

            {/* Delivery Address Card */}
            <Animated.View entering={FadeInDown.duration(300)} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="location" size={20} color={accentColor} />
                  <Text style={styles.cardTitle}>Địa chỉ giao hàng</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  const newAddr = prompt('Nhập địa chỉ nhận hàng mới:', deliveryAddress);
                  if (newAddr && newAddr.trim()) setDeliveryAddress(newAddr.trim());
                }}>
                  <Text style={styles.changeBtnText}>Thay đổi</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.addressText}>{deliveryAddress}</Text>

              <View style={styles.distanceBadge}>
                <Ionicons name="navigate-circle-outline" size={16} color="#64748B" />
                <Text style={styles.distanceText}>
                  Khoảng cách: ~{shippingFeeInfo.distanceKm} km từ {restaurant?.name || 'quán ăn'}
                </Text>
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="chatbox-ellipses-outline" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.inlineInput}
                  placeholder="Ghi chú cho tài xế (VD: Gọi trước khi đến, gửi bảo vệ...)"
                  placeholderTextColor="#94A3B8"
                  value={noteForDriver}
                  onChangeText={setNoteForDriver}
                />
              </View>
            </Animated.View>

            {/* Delivery Time Estimate */}
            <View style={styles.timeCard}>
              <View style={styles.timeIconWrap}>
                <Ionicons name="time" size={24} color="#F97316" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.timeTitle}>Thời gian giao dự kiến</Text>
                <Text style={styles.timeDesc}>20 - 30 phút • Tài xế nhận đơn ngay</Text>
              </View>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>Giao nhanh</Text>
              </View>
            </View>

            {/* Order Items Preview */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Chi tiết món đã chọn</Text>
                <Text style={styles.itemCountText}>{cart.reduce((s, i) => s + i.quantity, 0)} món</Text>
              </View>

              {cart.map((item) => (
                <View key={item.cartItemId} style={styles.orderRow}>
                  <Text style={styles.qtyBadge}>{item.quantity}x</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    {item.size ? (
                      <Text style={styles.orderItemSub}>{item.size.name}</Text>
                    ) : null}
                    {item.toppings.length > 0 ? (
                      <Text style={styles.orderItemSub}>+ {item.toppings.map(t => t.name).join(', ')}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.orderItemPrice}>{item.totalPrice.toLocaleString('vi-VN')}đ</Text>
                </View>
              ))}

              <View style={styles.inputWrap}>
                <Ionicons name="restaurant-outline" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.inlineInput}
                  placeholder="Ghi chú cho quán (VD: Ít đá, không tương ớt...)"
                  placeholderTextColor="#94A3B8"
                  value={noteForMerchant}
                  onChangeText={setNoteForMerchant}
                />
              </View>
            </View>

            {/* Payment Method Selector */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Phương thức thanh toán</Text>

              {/* Option 1: COD */}
              <TouchableOpacity 
                style={[styles.payOption, paymentMethod === 'COD' && styles.payOptionActive]}
                onPress={() => setPaymentMethod('COD')}
              >
                <View style={styles.payOptionLeft}>
                  <View style={[styles.payIconWrap, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="cash" size={20} color="#10B981" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.payName}>Tiền mặt (COD)</Text>
                    <Text style={styles.paySub}>Thanh toán khi nhận đồ ăn</Text>
                  </View>
                </View>
                <View style={[styles.radioCircle, paymentMethod === 'COD' && { borderColor: accentColor }]}>
                  {paymentMethod === 'COD' && <View style={[styles.radioDot, { backgroundColor: accentColor }]} />}
                </View>
              </TouchableOpacity>

              {/* Option 2: Super App Wallet */}
              <TouchableOpacity 
                style={[styles.payOption, paymentMethod === 'WALLET' && styles.payOptionActive]}
                onPress={() => setPaymentMethod('WALLET')}
              >
                <View style={styles.payOptionLeft}>
                  <View style={[styles.payIconWrap, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="wallet" size={20} color="#3B82F6" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.payName}>Ví Super App</Text>
                    <Text style={styles.paySub}>Số dư: 500.000đ • Trừ tiền an toàn</Text>
                  </View>
                </View>
                <View style={[styles.radioCircle, paymentMethod === 'WALLET' && { borderColor: accentColor }]}>
                  {paymentMethod === 'WALLET' && <View style={[styles.radioDot, { backgroundColor: accentColor }]} />}
                </View>
              </TouchableOpacity>

              {/* Option 3: VietQR */}
              <TouchableOpacity 
                style={[styles.payOption, paymentMethod === 'VIETQR' && styles.payOptionActive]}
                onPress={() => setPaymentMethod('VIETQR')}
              >
                <View style={styles.payOptionLeft}>
                  <View style={[styles.payIconWrap, { backgroundColor: '#FFF7ED' }]}>
                    <Ionicons name="qr-code" size={20} color="#F97316" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.payName}>Chuyển khoản QR (VietQR)</Text>
                    <Text style={styles.paySub}>Tự động tạo mã QR có sẵn số tiền</Text>
                  </View>
                </View>
                <View style={[styles.radioCircle, paymentMethod === 'VIETQR' && { borderColor: accentColor }]}>
                  {paymentMethod === 'VIETQR' && <View style={[styles.radioDot, { backgroundColor: accentColor }]} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Bill Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Chi tiết hóa đơn</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tiền món</Text>
                <Text style={styles.summaryVal}>{subtotal.toLocaleString('vi-VN')}đ</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Phí giao hàng ({shippingFeeInfo.distanceKm} km: 15k/3km, số lẻ +3k)
                </Text>
                <Text style={styles.summaryVal}>{shippingFeeInfo.originalShippingFee.toLocaleString('vi-VN')}đ</Text>
              </View>

              {shippingFeeInfo.discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="sparkles" size={14} color="#10B981" />
                    <Text style={[styles.summaryLabel, { color: '#10B981', fontWeight: '700' }]}>
                      Freeship đơn ≥ {shippingFeeInfo.freeshipThreshold.toLocaleString('vi-VN')}đ ({shippingFeeInfo.distanceKm} km)
                    </Text>
                  </View>
                  <Text style={[styles.summaryVal, { color: '#10B981' }]}>
                    -{shippingFeeInfo.discountAmount.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                <Text style={styles.totalVal}>{totalAmount.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>

            <View style={{ height: 110 }} />
          </View>
        </ScrollView>

        {/* Bottom Place Order Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomBarSub}>Tổng hóa đơn</Text>
            <Text style={styles.bottomBarTotal}>{totalAmount.toLocaleString('vi-VN')}đ</Text>
          </View>

          <TouchableOpacity 
            style={[styles.placeOrderBtn, { backgroundColor: accentColor }]}
            onPress={handleConfirmOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.placeOrderText}>Đặt Đơn Ngay</Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 6 }} />
              </>
            )}
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

  content: { padding: 16, gap: 14 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, 
    borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', 
    shadowOpacity: 0.02, shadowRadius: 6 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  changeBtnText: { fontSize: 13, fontWeight: '700', color: '#F97316' },
  itemCountText: { fontSize: 13, color: '#64748B', fontWeight: '600' },

  addressText: { fontSize: 14, color: '#1E293B', fontWeight: '600', lineHeight: 20 },
  distanceBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, 
    backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, 
    borderRadius: 8 
  },
  distanceText: { fontSize: 12, color: '#64748B' },

  inputWrap: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', 
    borderRadius: 10, paddingHorizontal: 12, marginTop: 12, borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  inlineInput: { flex: 1, height: 42, fontSize: 13, color: '#0F172A', marginLeft: 8 },

  timeCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FED7AA' 
  },
  timeIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
  timeTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  timeDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  priorityBadge: { backgroundColor: '#F9731615', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontSize: 11, fontWeight: '700', color: '#F97316' },

  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  qtyBadge: { fontSize: 13, fontWeight: '700', color: '#F97316', width: 26 },
  orderItemName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  orderItemSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  orderItemPrice: { fontSize: 13, fontWeight: '700', color: '#0F172A' },

  payOption: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', 
    marginTop: 10 
  },
  payOptionActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  payOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  payIconWrap: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  payName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  paySub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  summaryLabel: { color: '#64748B', fontSize: 13 },
  summaryVal: { color: '#0F172A', fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  totalLabel: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  totalVal: { color: '#F97316', fontSize: 17, fontWeight: '800' },

  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', 
    borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingHorizontal: 16, 
    paddingVertical: Platform.OS === 'ios' ? 24 : 14, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', 
    shadowOpacity: 0.08, shadowRadius: 10 
  },
  bottomBarSub: { fontSize: 11, color: '#64748B' },
  bottomBarTotal: { fontSize: 18, fontWeight: '800', color: '#F97316' },
  placeOrderBtn: { 
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, 
    paddingVertical: 13, paddingHorizontal: 26 
  },
  placeOrderText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
