import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, Switch, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useShopping } from '../../context/ShoppingContext';
import { useUser } from '../../context/UserContext';

const T = {
  black: '#222222',
  white: '#FFFFFF',
  bg: '#F5F5F5',
  sub: '#888888',
  border: '#E8E8E8',
  orange: '#4F46E5',
  orangeLight: '#EEF2FF',
  red: '#EE4D2D',
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function PremiumCheckout() {
  const router = useRouter();
  const { cart, checkout } = useShopping();
  const { addresses, coins, setCoins, walletBalance, addTransaction } = useUser();
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const checkedItems = cart.filter(c => c.checked);
  const merchandiseTotal = checkedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Group checked items by shop
  const groupedItems: { shopId: string; shopName: string; isMall: boolean; items: typeof checkedItems }[] = [];
  checkedItems.forEach(item => {
    let shop = groupedItems.find(g => g.shopId === item.shopId);
    if (!shop) {
      shop = { shopId: item.shopId, shopName: item.shopName, isMall: item.isMall, items: [] };
      groupedItems.push(shop);
    }
    shop.items.push(item);
  });
  
  // Shipping Fee
  const uniqueShops = groupedItems.length;
  const shippingFee = uniqueShops * 30000; // 30k per shop
  
  // Discount States
  const [useCoins, setUseCoins] = useState(false);
  const [useFreeshipVoucher, setUseFreeshipVoucher] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'wallet' | 'momo'>('cod');

  const coinDiscount = useCoins ? Math.min(coins, 50000) : 0; 
  const freeshipDiscount = useFreeshipVoucher ? Math.min(shippingFee, 30000) : 0;
  const totalDiscount = coinDiscount + freeshipDiscount;

  const finalTotal = Math.max(0, merchandiseTotal + shippingFee - totalDiscount);

  const handlePlaceOrder = () => {
    if (!defaultAddress) {
      Alert.alert('Lỗi', 'Vui lòng bổ sung địa chỉ giao hàng trong trang Hồ sơ trước.');
      return;
    }
    
    if (paymentMethod === 'wallet') {
      if (walletBalance < finalTotal) {
        Alert.alert('Thất bại', 'Số dư ví Super App không đủ để thanh toán. Vui lòng nạp thêm tiền hoặc chọn COD.');
        return;
      }
      // Deduct balance
      addTransaction(finalTotal, 'out', 'Mua hàng Marketplace', `Đơn hàng tại ${uniqueShops} cửa hàng`, 'bag-handle', '#FEE2E2', '#EF4444');
    }

    if (useCoins) {
      setCoins(Math.max(0, coins - coinDiscount));
    }

    checkout(coinDiscount); // clear checkout items
    Alert.alert('Thành công', 'Đơn hàng của bạn đã được xác nhận thanh toán thành công!');
    router.replace('/shopping'); 
  };

  if (checkedItems.length === 0) {
    return (
      <SafeAreaView style={[S.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: T.sub }}>Không có sản phẩm nào được chọn.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}><Text style={{ color: T.black, fontWeight: '600' }}>Quay lại Túi</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={S.root}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={T.white} translucent={false} />
        
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}><Ionicons name="arrow-back" size={24} color={T.black} /></TouchableOpacity>
          <Text style={S.headerTitle}>THANH TOÁN</Text>
          <View style={{ width: 40 }} />
        </View>
 
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Address Section */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>ĐỊA CHỈ GIAO HÀNG</Text>
            {defaultAddress ? (
              <View style={S.addressBox}>
                <View style={{ flex: 1 }}>
                  <Text style={S.addressName}>{defaultAddress.receiverName.toUpperCase()} - {defaultAddress.receiverPhone}</Text>
                  <Text style={S.addressText}>{defaultAddress.detailAddress}, {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.province}</Text>
                  {defaultAddress.note ? <Text style={[S.addressText, { fontStyle: 'italic', marginTop: 4 }]}>Ghi chú: {defaultAddress.note}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => router.push('/account')}>
                  <Text style={{ color: '#4F46E5', fontSize: 13, fontWeight: '700' }}>Thay đổi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => router.push('/account')} style={{ paddingVertical: 10 }}>
                <Text style={{ color: '#EF4444', fontWeight: '600' }}>+ Thêm địa chỉ nhận hàng để tiếp tục</Text>
              </TouchableOpacity>
            )}
          </View>
 
          {/* Grouped Items Section */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>CHI TIẾT ĐƠN HÀNG</Text>
            {groupedItems.map((shop) => (
              <View key={shop.shopId} style={{ marginBottom: 20 }}>
                <View style={S.shopRowHeader}>
                  <Ionicons name="storefront-outline" size={16} color={T.sub} style={{ marginRight: 6 }} />
                  <Text style={S.shopRowName}>{shop.shopName.toUpperCase()}</Text>
                  {shop.isMall && (
                    <View style={S.mallBadge}><Text style={S.mallBadgeTxt}>Mall</Text></View>
                  )}
                </View>
                {shop.items.map((item, idx) => (
                  <View key={item.id} style={[S.itemRow, idx === shop.items.length - 1 && { borderBottomWidth: 0 }]}>
                    <Image source={{ uri: item.image }} style={S.itemImg} />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={S.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={S.itemVariant}>{item.variant}  |  SL: {item.quantity}</Text>
                      <Text style={S.itemPrice}>{formatMoney(item.price)}</Text>
                    </View>
                  </View>
                ))}
                <View style={S.shopShippingRow}>
                  <Text style={{ fontSize: 12, color: T.sub }}>Phí vận chuyển cửa hàng:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: T.black }}>{formatMoney(30000)}</Text>
                </View>
              </View>
            ))}
          </View>
 
          {/* Options Section */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>TÙY CHỌN & KHUYẾN MÃI</Text>
            
            {/* Free Ship Coupon */}
            <View style={S.optionRow}>
              <View>
                <Text style={S.optionLabel}>Mã giảm giá Freeship</Text>
                <Text style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>Giảm tối đa 30k vận chuyển</Text>
              </View>
              <Switch value={useFreeshipVoucher} onValueChange={setUseFreeshipVoucher} trackColor={{ false: T.border, true: T.black }} thumbColor={T.white} />
            </View>

            <View style={S.divider} />

            {/* Privilege Coins */}
            <View style={S.optionRow}>
              <View>
                <Text style={S.optionLabel}>Dùng {coins.toLocaleString('vi-VN')} Xu tích luỹ</Text>
                <Text style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>Giảm tối đa 50.000đ (1 xu = 1đ)</Text>
              </View>
              <Switch value={useCoins} onValueChange={setUseCoins} disabled={coins <= 0} trackColor={{ false: T.border, true: T.black }} thumbColor={T.white} />
            </View>
          </View>

          {/* Payment Method Selector */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>PHƯƠNG THỨC THANH TOÁN</Text>
            {[
              { key: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: 'cash-outline' },
              { key: 'wallet', label: `Ví Super App (Số dư: ${formatMoney(walletBalance)})`, icon: 'wallet-outline' },
              { key: 'momo', label: 'Ví MoMo / ZaloPay', icon: 'phone-portrait-outline' },
            ].map(pm => (
              <TouchableOpacity key={pm.key} style={S.pmRow} onPress={() => setPaymentMethod(pm.key as any)}>
                <Ionicons name={pm.icon as any} size={20} color={T.black} style={{ marginRight: 12 }} />
                <Text style={[S.pmLabel, paymentMethod === pm.key && { fontWeight: '700' }]}>{pm.label}</Text>
                <Ionicons name={paymentMethod === pm.key ? "radio-button-on" : "radio-button-off"} size={18} color={paymentMethod === pm.key ? '#4F46E5' : T.border} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </View>
 
          {/* Bill Summary */}
          <View style={[S.section, { borderBottomWidth: 0 }]}>
            <Text style={S.sectionTitle}>TÓM TẮT ĐƠN HÀNG</Text>
            <View style={S.billRow}><Text style={S.billLabel}>Tạm tính hàng</Text><Text style={S.billValue}>{formatMoney(merchandiseTotal)}</Text></View>
            <View style={S.billRow}><Text style={S.billLabel}>Phí giao hàng ({uniqueShops} Shop)</Text><Text style={S.billValue}>{formatMoney(shippingFee)}</Text></View>
            {useFreeshipVoucher && <View style={S.billRow}><Text style={S.billLabel}>Freeship giảm</Text><Text style={S.billValue}>-{formatMoney(freeshipDiscount)}</Text></View>}
            {useCoins && <View style={S.billRow}><Text style={S.billLabel}>Khấu trừ Xu</Text><Text style={S.billValue}>-{formatMoney(coinDiscount)}</Text></View>}
            <View style={[S.billRow, { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: T.border }]}>
              <Text style={S.billTotalLabel}>TỔNG CỘNG THANH TOÁN</Text>
              <Text style={S.billTotalValue}>{formatMoney(finalTotal)}</Text>
            </View>
          </View>
 
          <View style={{ height: 120 }} />
        </ScrollView>
 
        {/* Footer */}
        <View style={S.footer}>
          <TouchableOpacity style={[S.placeOrderBtn, !defaultAddress && { opacity: 0.5 }]} disabled={!defaultAddress} onPress={handlePlaceOrder} activeOpacity={0.8}>
            <Text style={S.placeOrderTxt}>XÁC NHẬN ĐẶT HÀNG</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.bg, height: 60, paddingHorizontal: 20 },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 2, color: T.black },

  section: { backgroundColor: T.white, padding: 20, borderBottomWidth: 1, borderBottomColor: T.border, marginBottom: 10 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: T.sub, marginBottom: 20 },
  
  addressBox: { flexDirection: 'row', alignItems: 'center' },
  addressName: { fontSize: 14, fontWeight: '600', color: T.black, marginBottom: 8 },
  addressText: { fontSize: 13, color: T.sub, lineHeight: 20 },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  itemImg: { width: 60, height: 80, borderRadius: 4 },
  itemName: { fontSize: 14, color: T.black },
  itemVariant: { fontSize: 12, color: T.sub, marginTop: 4 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: T.black, marginTop: 8 },

  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  optionLabel: { fontSize: 13, color: T.black },
  optionValue: { fontSize: 13, color: T.sub },
  divider: { height: 1, backgroundColor: T.bg },

  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { fontSize: 13, color: T.sub },
  billValue: { fontSize: 13, color: T.black },
  billTotalLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: T.black },
  billTotalValue: { fontSize: 20, fontWeight: '700', color: T.orange },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: T.white, borderTopWidth: 1, borderTopColor: T.border, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  placeOrderBtn: { width: '100%', backgroundColor: T.orange, paddingVertical: 18, borderRadius: 8, alignItems: 'center' },
  placeOrderTxt: { color: T.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  // Marketplace checkout additions
  shopRowHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingBottom: 8 },
  shopRowName: { fontSize: 13, fontWeight: '700', color: T.black },
  mallBadge: { backgroundColor: T.red, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 6 },
  mallBadgeTxt: { color: T.white, fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  shopShippingRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, backgroundColor: T.orangeLight, padding: 8, borderRadius: 8 },
  pmRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  pmLabel: { fontSize: 13, color: T.black },
});
