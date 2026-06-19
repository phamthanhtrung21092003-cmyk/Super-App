import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useShopping } from '../../context/ShoppingContext';

const T = {
  black: '#0F172A',
  white: '#FFFFFF',
  bg: '#F8FAFC',
  sub: '#64748B',
  border: '#E2E8F0',
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function PremiumCheckout() {
  const router = useRouter();
  const { cart, coins, checkout } = useShopping();

  const checkedItems = cart.filter(c => c.checked);
  const merchandiseTotal = checkedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Shipping Fee
  const uniqueShops = new Set(checkedItems.map(i => i.shopId)).size;
  const shippingFee = uniqueShops * 30000; // Premium shipping
  
  const [usePrivilege, setUsePrivilege] = useState(false);
  const discount = usePrivilege ? Math.min(coins, 50000) : 0; 

  const finalTotal = merchandiseTotal + shippingFee - discount;

  const handlePlaceOrder = () => {
    checkout(discount);
    window.alert('Đơn hàng của bạn đã được xác nhận.');
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
            <Text style={S.sectionTitle}>GIAO HÀNG TỚI</Text>
            <View style={S.addressBox}>
              <View style={{ flex: 1 }}>
                <Text style={S.addressName}>NGUYỄN VĂN A</Text>
                <Text style={S.addressText}>123 Phố Xa Hoa, Phường Cao Cấp{'\n'}Quận Nhất, TP. Hồ Chí Minh</Text>
                <Text style={S.addressText}>(+84) 912 345 678</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={T.sub} />
            </View>
          </View>

          {/* Items Section */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>SẢN PHẨM</Text>
            {checkedItems.map((item, idx) => (
              <View key={item.id} style={[S.itemRow, idx === checkedItems.length - 1 && { borderBottomWidth: 0 }]}>
                <Image source={{ uri: item.image }} style={S.itemImg} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={S.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={S.itemVariant}>{item.variant}  |  SL: {item.quantity}</Text>
                  <Text style={S.itemPrice}>{formatMoney(item.price)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Options Section */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>TÙY CHỌN & ƯU ĐÃI</Text>
            <View style={S.optionRow}>
              <Text style={S.optionLabel}>Phương thức vận chuyển</Text>
              <Text style={S.optionValue}>Hỏa tốc (Dự kiến ngày mai)</Text>
            </View>
            <View style={S.divider} />
            <View style={S.optionRow}>
              <Text style={S.optionLabel}>Phương thức thanh toán</Text>
              <Text style={S.optionValue}>Thẻ Tín Dụng (Visa/Mastercard)</Text>
            </View>
            <View style={S.divider} />
            <View style={S.optionRow}>
              <Text style={S.optionLabel}>Mã Đặc Quyền (Giảm {formatMoney(coins)})</Text>
              <Switch value={usePrivilege} onValueChange={setUsePrivilege} trackColor={{ false: T.border, true: T.black }} thumbColor={T.white} />
            </View>
          </View>

          {/* Bill Summary */}
          <View style={[S.section, { borderBottomWidth: 0 }]}>
            <Text style={S.sectionTitle}>TÓM TẮT ĐƠN HÀNG</Text>
            <View style={S.billRow}><Text style={S.billLabel}>Tạm tính</Text><Text style={S.billValue}>{formatMoney(merchandiseTotal)}</Text></View>
            <View style={S.billRow}><Text style={S.billLabel}>Phí giao hàng</Text><Text style={S.billValue}>{formatMoney(shippingFee)}</Text></View>
            {usePrivilege && <View style={S.billRow}><Text style={S.billLabel}>Chiết khấu đặc quyền</Text><Text style={S.billValue}>-{formatMoney(discount)}</Text></View>}
            <View style={[S.billRow, { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: T.border }]}>
              <Text style={S.billTotalLabel}>TỔNG CỘNG</Text>
              <Text style={S.billTotalValue}>{formatMoney(finalTotal)}</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer */}
        <View style={S.footer}>
          <TouchableOpacity style={S.placeOrderBtn} onPress={handlePlaceOrder} activeOpacity={0.8}>
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
  billTotalValue: { fontSize: 20, fontWeight: '600', color: T.black },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: T.white, borderTopWidth: 1, borderTopColor: T.border, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  placeOrderBtn: { width: '100%', backgroundColor: T.black, paddingVertical: 18, borderRadius: 8, alignItems: 'center' },
  placeOrderTxt: { color: T.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
});
