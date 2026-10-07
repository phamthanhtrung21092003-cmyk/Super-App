import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions, TextInput,
  ActivityIndicator, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFood } from '../../context/FoodContext';
import { useUser, Address } from '../../context/UserContext';
import { foodService } from '../../services/foodService';

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
    customerCoords,
    setCustomerCoords,
    placeOrder 
  } = useFood();

  const { addresses } = useUser();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [noteForDriver, setNoteForDriver] = useState('');
  const [noteForMerchant, setNoteForMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'WALLET' | 'VIETQR'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voucher State
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [manualCode, setManualCode] = useState<string>('');
  const [isValidatingCode, setIsValidatingCode] = useState<boolean>(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Tự động gán địa chỉ mặc định từ Sổ địa chỉ thật của Người dùng
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr);
      const fullText = [defaultAddr.detailAddress, defaultAddr.ward, defaultAddr.district, defaultAddr.province]
        .filter(Boolean)
        .join(', ');
      setDeliveryAddress(fullText || defaultAddr.detailAddress || 'Địa chỉ nhận hàng');
      if (defaultAddr.latitude && defaultAddr.longitude) {
        setCustomerCoords({ lat: defaultAddr.latitude, lng: defaultAddr.longitude });
      }
    } else {
      setDeliveryAddress('Số 18, Ngõ 48 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội');
      setCustomerCoords({ lat: 21.0055, lng: 105.8450 });
    }
  }, [addresses]);

  // Tự động tải danh sách Voucher khả dụng của quán và toàn sàn
  useEffect(() => {
    if (restaurant?.id) {
      foodService.getAvailableVouchers(restaurant.id)
        .then(res => setAvailableVouchers(res || []))
        .catch(err => console.log('[Checkout] Lỗi tải danh sách voucher:', err));
    }
  }, [restaurant?.id]);

  const handleApplyVoucher = async (code: string) => {
    if (!code || !code.trim()) {
      setVoucherError('Vui lòng nhập mã khuyến mãi');
      return;
    }
    if (!restaurant) return;

    setIsValidatingCode(true);
    setVoucherError(null);
    try {
      const res = await foodService.validateVoucher(
        code.trim(),
        restaurant.id,
        subtotal,
        shippingFeeInfo.finalShippingFee,
      );
      setSelectedVoucher(res.voucher);
      setVoucherDiscount(res.discountAmount);
      setShowVoucherModal(false);
      setManualCode('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Mã khuyến mãi không hợp lệ';
      setVoucherError(msg);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setVoucherDiscount(0);
    setVoucherError(null);
  };

  const totalAmount = Math.max(0, subtotal + shippingFeeInfo.finalShippingFee - voucherDiscount);

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddress(addr);
    const fullText = [addr.detailAddress, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
    setDeliveryAddress(fullText || addr.detailAddress);
    if (addr.latitude && addr.longitude) {
      setCustomerCoords({ lat: addr.latitude, lng: addr.longitude });
    }
    setShowAddressPicker(false);
  };

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;

    if (!deliveryAddress || !deliveryAddress.trim()) {
      alert('Vui lòng nhập địa chỉ nhận hàng chính xác');
      return;
    }

    if (!restaurant) {
      alert('Không tìm thấy thông tin quán ăn. Vui lòng thử lại!');
      return;
    }

    if (cart.length === 0) {
      alert('Giỏ hàng trống. Hãy chọn món ăn trước khi thanh toán.');
      return;
    }

    setIsSubmitting(true);

    try {
      const targetCoords = (selectedAddress?.latitude && selectedAddress?.longitude)
        ? { lat: selectedAddress.latitude, lng: selectedAddress.longitude }
        : customerCoords;

      const createdOrder = await placeOrder(
        deliveryAddress.trim(),
        paymentMethod,
        targetCoords,
        noteForMerchant.trim() || undefined,
        noteForDriver.trim() || undefined,
        selectedVoucher ? selectedVoucher.code : undefined,
      );

      // Chuyển hướng sang màn hình Live Tracking đơn hàng
      router.replace({
        pathname: '/food/tracking/[id]' as any,
        params: { id: createdOrder.orderCode || createdOrder.id },
      });
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!';
      alert(msg);
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
                <TouchableOpacity onPress={() => setShowAddressPicker(true)}>
                  <Text style={styles.changeBtnText}>Thay đổi</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.addressText}>{deliveryAddress || 'Chưa chọn địa chỉ giao hàng'}</Text>
              {selectedAddress?.label && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: '#F97316', backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '700' }}>
                    {selectedAddress.label}
                  </Text>
                  {selectedAddress.receiverName ? (
                    <Text style={{ fontSize: 12, color: '#64748B', marginLeft: 6 }}>
                      {selectedAddress.receiverName} • {selectedAddress.receiverPhone}
                    </Text>
                  ) : null}
                </View>
              )}

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

            {/* Voucher / Promotion Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="ticket" size={20} color="#F97316" />
                  <Text style={styles.cardTitle}>V-Life Khuyến mãi</Text>
                </View>
                <TouchableOpacity onPress={() => setShowVoucherModal(true)}>
                  <Text style={styles.changeBtnText}>
                    {selectedVoucher ? 'Đổi mã' : 'Chọn mã'}
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedVoucher ? (
                <View style={styles.appliedVoucherBox}>
                  <View style={styles.appliedVoucherLeft}>
                    <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.appliedVoucherCode}>
                        {selectedVoucher.code} • Giảm {voucherDiscount.toLocaleString('vi-VN')}đ
                      </Text>
                      <Text style={styles.appliedVoucherDesc} numberOfLines={1}>
                        {selectedVoucher.name}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={handleRemoveVoucher} style={styles.removeVoucherBtn}>
                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.selectVoucherBtn}
                  onPress={() => setShowVoucherModal(true)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="pricetag-outline" size={18} color="#64748B" />
                    <Text style={styles.selectVoucherText}>Chọn hoặc nhập mã khuyến mãi</Text>
                  </View>
                  {availableVouchers.length > 0 && (
                    <View style={styles.voucherCountBadge}>
                      <Text style={styles.voucherCountText}>{availableVouchers.length} mã khả dụng</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
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

              {voucherDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="pricetag" size={14} color="#10B981" />
                    <Text style={[styles.summaryLabel, { color: '#10B981', fontWeight: '700' }]}>
                      Voucher ({selectedVoucher?.code})
                    </Text>
                  </View>
                  <Text style={[styles.summaryVal, { color: '#10B981', fontWeight: '800' }]}>
                    -{voucherDiscount.toLocaleString('vi-VN')}đ
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

        {/* Modal chọn địa chỉ nhận hàng */}
        <Modal
          visible={showAddressPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddressPicker(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              activeOpacity={1} 
              onPress={() => setShowAddressPicker(false)} 
            />
            <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: 500 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>Chọn địa chỉ nhận hàng</Text>
                <TouchableOpacity onPress={() => setShowAddressPicker(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {addresses && addresses.length > 0 ? (
                  addresses.map((addr) => {
                    const isSelected = selectedAddress?.id === addr.id;
                    const fullAddr = [addr.detailAddress, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
                    return (
                      <TouchableOpacity
                        key={addr.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 14,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: isSelected ? accentColor : '#E2E8F0',
                          backgroundColor: isSelected ? '#FFF7ED' : '#FFF',
                          marginBottom: 10,
                        }}
                        onPress={() => handleSelectAddress(addr)}
                      >
                        <Ionicons 
                          name={isSelected ? "radio-button-on" : "radio-button-off"} 
                          size={20} 
                          color={isSelected ? accentColor : '#94A3B8'} 
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>
                              {addr.label || 'Địa chỉ'}
                            </Text>
                            {addr.isDefault && (
                              <Text style={{ fontSize: 10, color: '#10B981', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, fontWeight: '700' }}>
                                Mặc định
                              </Text>
                            )}
                          </View>
                          <Text style={{ fontSize: 13, color: '#475569', marginTop: 3 }} numberOfLines={2}>
                            {fullAddr || addr.detailAddress}
                          </Text>
                          {addr.receiverName ? (
                            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                              {addr.receiverName} • {addr.receiverPhone}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={{ color: '#64748B', textAlign: 'center', marginVertical: 20 }}>
                    Bạn chưa lưu địa chỉ nào trong hồ sơ.
                  </Text>
                )}

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderRadius: 12,
                    marginTop: 10,
                    gap: 8,
                  }}
                  onPress={() => {
                    const customAddr = prompt('Nhập địa chỉ nhận hàng chi tiết:', deliveryAddress);
                    if (customAddr && customAddr.trim()) {
                      setDeliveryAddress(customAddr.trim());
                      setSelectedAddress(null);
                      setShowAddressPicker(false);
                    }
                  }}
                >
                  <Ionicons name="add-circle-outline" size={20} color={accentColor} />
                  <Text style={{ color: accentColor, fontWeight: '700', fontSize: 14 }}>
                    Nhập địa chỉ khác
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Voucher Picker & Manual Input Modal */}
        <Modal
          visible={showVoucherModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowVoucherModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="ticket" size={22} color="#F97316" />
                  <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>Mã Khuyến Mãi / Voucher</Text>
                </View>
                <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Input nhập mã thủ công */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TextInput
                  style={{
                    flex: 1,
                    height: 44,
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#0F172A',
                    backgroundColor: '#F8FAFC',
                    textTransform: 'uppercase',
                  }}
                  placeholder="Nhập mã khuyến mãi (VD: VLIFE20)"
                  placeholderTextColor="#94A3B8"
                  value={manualCode}
                  onChangeText={(val) => {
                    setManualCode(val);
                    if (voucherError) setVoucherError(null);
                  }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F97316',
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => handleApplyVoucher(manualCode)}
                  disabled={isValidatingCode || !manualCode.trim()}
                >
                  {isValidatingCode ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>Áp dụng</Text>
                  )}
                </TouchableOpacity>
              </View>

              {voucherError ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8 }}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600', flex: 1 }}>{voucherError}</Text>
                </View>
              ) : null}

              {/* Danh sách voucher khả dụng */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 10 }}>
                VOUCHER KHẢ DỤNG CHO BẠN ({availableVouchers.length})
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {availableVouchers && availableVouchers.length > 0 ? (
                  availableVouchers.map((v) => {
                    const isSelected = selectedVoucher?.id === v.id;
                    const canUse = v.isUsable && subtotal >= (v.minOrderValue || 0);

                    return (
                      <View
                        key={v.id}
                        style={{
                          borderRadius: 14,
                          borderWidth: 1.5,
                          borderColor: isSelected ? '#10B981' : '#E2E8F0',
                          backgroundColor: isSelected ? '#ECFDF5' : '#FFF',
                          padding: 14,
                          marginBottom: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A' }}>
                              {v.code}
                            </Text>
                            <View
                              style={{
                                backgroundColor: v.type === 'FREESHIP' ? '#EFF6FF' : '#FFF7ED',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontWeight: '800',
                                  color: v.type === 'FREESHIP' ? '#2563EB' : '#F97316',
                                }}
                              >
                                {v.type === 'PERCENT' ? `Giảm ${v.value}%` : v.type === 'FIXED' ? `Giảm ${v.value.toLocaleString('vi-VN')}đ` : 'Miễn phí ship'}
                              </Text>
                            </View>
                          </View>

                          <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600', marginTop: 4 }}>
                            {v.name}
                          </Text>

                          <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                            Đơn tối thiểu {v.minOrderValue?.toLocaleString('vi-VN')}đ
                            {v.maxDiscount ? ` • Giảm tối đa ${v.maxDiscount.toLocaleString('vi-VN')}đ` : ''}
                          </Text>

                          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                            HSD: {new Date(v.endAt).toLocaleDateString('vi-VN')} • Còn {v.remainingUserUsage || 1} lượt dùng
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={{
                            backgroundColor: isSelected ? '#10B981' : canUse ? '#F97316' : '#E2E8F0',
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 8,
                            marginLeft: 10,
                          }}
                          disabled={!canUse || isSelected}
                          onPress={() => handleApplyVoucher(v.code)}
                        >
                          <Text
                            style={{
                              color: isSelected || canUse ? '#FFF' : '#94A3B8',
                              fontWeight: '700',
                              fontSize: 12,
                            }}
                          >
                            {isSelected ? 'Đang dùng' : canUse ? 'Áp dụng' : 'Chưa đủ đk'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                    <Ionicons name="pricetags-outline" size={40} color="#CBD5E1" />
                    <Text style={{ color: '#64748B', fontSize: 13, marginTop: 8 }}>
                      Hiện chưa có mã khuyến mãi công khai. Bạn có thể nhập mã giảm giá riêng ở trên!
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

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

  // Voucher Card Styles
  appliedVoucherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
  },
  appliedVoucherLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  appliedVoucherCode: { fontSize: 14, fontWeight: '800', color: '#065F46' },
  appliedVoucherDesc: { fontSize: 12, color: '#047857', marginTop: 2 },
  removeVoucherBtn: { padding: 4 },
  selectVoucherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  selectVoucherText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  voucherCountBadge: { backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  voucherCountText: { fontSize: 11, fontWeight: '700', color: '#F97316' },

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
