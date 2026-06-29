import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useShopping, CartItem } from '../../context/ShoppingContext';

const T = {
  black: '#222222',
  white: '#FFFFFF',
  bg: '#F5F5F5',
  sub: '#888888',
  border: '#E8E8E8',
  orange: '#4F46E5',
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function PremiumCart() {
  const router = useRouter();
  const { cart, toggleCheckItem, toggleCheckShop, toggleCheckAll, updateQuantity } = useShopping();

  // Group cart by shop
  const groupedCart: { shopId: string; shopName: string; isMall: boolean; items: CartItem[] }[] = [];
  cart.forEach(item => {
    let shop = groupedCart.find(g => g.shopId === item.shopId);
    if (!shop) {
      shop = { shopId: item.shopId, shopName: item.shopName, isMall: item.isMall, items: [] };
      groupedCart.push(shop);
    }
    shop.items.push(item);
  });

  const checkedCount = cart.filter(c => c.checked).length;
  const isAllChecked = cart.length > 0 && checkedCount === cart.length;
  const totalPrice = cart.filter(c => c.checked).reduce((sum, c) => sum + c.price * c.quantity, 0);

  return (
    <View style={S.root}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={T.white} translucent={false} />
        
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}><Ionicons name="arrow-back" size={24} color={T.black} /></TouchableOpacity>
          <Text style={S.headerTitle}>TÚI CỦA BẠN</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {cart.length === 0 ? (
            <View style={S.emptyState}>
              <Ionicons name="bag-outline" size={60} color={T.border} />
              <Text style={S.emptyTxt}>Túi mua sắm của bạn đang trống.</Text>
              <TouchableOpacity style={S.shopNowBtn} onPress={() => router.push('/shopping')}>
                <Text style={S.shopNowTxt}>TIẾP TỤC MUA SẮM</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 20 }}>
              {groupedCart.map((shop, sIdx) => {
                const isShopChecked = shop.items.every(i => i.checked);
                return (
                  <View key={shop.shopId} style={S.shopGroup}>
                    {/* Shop Header */}
                    <View style={S.shopHeader}>
                      <TouchableOpacity onPress={() => toggleCheckShop(shop.shopId, !isShopChecked)} style={{ marginRight: 15 }}>
                        <Ionicons name={isShopChecked ? "checkmark-circle" : "ellipse-outline"} size={22} color={isShopChecked ? T.black : T.border} />
                      </TouchableOpacity>
                      <Text style={S.shopName}>{shop.shopName.toUpperCase()}</Text>
                    </View>

                    {/* Items */}
                    {shop.items.map((item, idx) => (
                      <View key={item.id} style={[S.itemRow, idx === shop.items.length - 1 && { borderBottomWidth: 0 }]}>
                        <TouchableOpacity onPress={() => toggleCheckItem(item.id)} style={{ marginRight: 15 }}>
                          <Ionicons name={item.checked ? "checkmark-circle" : "ellipse-outline"} size={22} color={item.checked ? T.black : T.border} />
                        </TouchableOpacity>
                        
                        <Image source={{ uri: item.image }} style={S.itemImg} />
                        
                        <View style={{ flex: 1, marginLeft: 15 }}>
                          <Text style={S.itemName} numberOfLines={2}>{item.name}</Text>
                          <Text style={S.variantTxt}>{item.variant}</Text>
                          
                          <View style={S.itemPriceRow}>
                            <Text style={S.itemPrice}>{formatMoney(item.price)}</Text>
                            <View style={S.qtyControls}>
                              <TouchableOpacity style={S.qtyBtn} onPress={() => updateQuantity(item.id, -1)}><Ionicons name="remove" size={16} /></TouchableOpacity>
                              <Text style={S.qtyVal}>{item.quantity}</Text>
                              <TouchableOpacity style={S.qtyBtn} onPress={() => updateQuantity(item.id, 1)}><Ionicons name="add" size={16} /></TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                    
                    {/* Shop Voucher Row */}
                    <View style={S.shopVoucherRow}>
                      <Ionicons name="pricetag-outline" size={14} color="#4F46E5" style={{ marginRight: 6 }} />
                      <Text style={S.shopVoucherText}>Khuyến mãi Shop: Giảm 10k đơn từ 200k</Text>
                      <TouchableOpacity style={S.shopVoucherBtn} onPress={() => Alert.alert('Khuyến mãi', 'Đã áp dụng giảm 10.000đ từ Shop!')}>
                        <Text style={S.shopVoucherBtnTxt}>Áp dụng</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Bottom Footer */}
        {cart.length > 0 && (
          <View style={S.footer}>
            <View style={S.checkoutRow}>
              <TouchableOpacity style={S.checkAllWrap} onPress={() => toggleCheckAll(!isAllChecked)}>
                <Ionicons name={isAllChecked ? "checkmark-circle" : "ellipse-outline"} size={24} color={isAllChecked ? T.black : T.border} />
                <Text style={S.checkAllTxt}>Tất cả</Text>
              </TouchableOpacity>
              
              <View style={S.totalWrap}>
                <Text style={S.totalLabel}>TỔNG CỘNG</Text>
                <Text style={S.totalPrice}>{formatMoney(totalPrice)}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={[S.checkoutBtn, checkedCount === 0 && { opacity: 0.5 }]} disabled={checkedCount === 0} onPress={() => router.push('/shopping/checkout')} activeOpacity={0.8}>
              <Text style={S.checkoutBtnTxt}>THANH TOÁN</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.white },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.white, height: 60, paddingHorizontal: 20 },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 2, color: T.black },
  
  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTxt: { marginTop: 20, color: T.sub, fontSize: 14, marginBottom: 30 },
  shopNowBtn: { backgroundColor: T.orange, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30 },
  shopNowTxt: { color: T.white, fontWeight: '600', letterSpacing: 1, fontSize: 12 },
  
  shopGroup: { marginBottom: 30 },
  shopHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: T.border },
  shopName: { fontSize: 12, letterSpacing: 2, color: T.sub },
  
  itemRow: { flexDirection: 'row', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  itemImg: { width: 80, height: 100, borderRadius: 4 },
  itemName: { fontSize: 14, lineHeight: 20, color: T.black, fontWeight: '400' },
  variantTxt: { fontSize: 12, color: T.sub, marginTop: 4 },
  itemPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  itemPrice: { fontSize: 14, color: T.black, fontWeight: '600' },
  
  qtyControls: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.border, borderRadius: 20 },
  qtyBtn: { padding: 8 },
  qtyVal: { paddingHorizontal: 10, fontSize: 13, fontWeight: '500' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: T.white, borderTopWidth: 1, borderTopColor: T.border, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  checkoutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkAllWrap: { flexDirection: 'row', alignItems: 'center' },
  checkAllTxt: { fontSize: 13, marginLeft: 10, color: T.sub },
  totalWrap: { flex: 1, alignItems: 'flex-end' },
  totalLabel: { fontSize: 10, letterSpacing: 1, color: T.sub, marginBottom: 4 },
  totalPrice: { fontSize: 18, fontWeight: '700', color: T.orange },
  checkoutBtn: { width: '100%', backgroundColor: T.orange, paddingVertical: 18, borderRadius: 8, alignItems: 'center' },
  checkoutBtnTxt: { color: T.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  // Shop Voucher Styles
  shopVoucherRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.orangeLight, padding: 12, borderRadius: 10, marginTop: 12 },
  shopVoucherText: { fontSize: 11, color: T.orange, fontWeight: '600', flex: 1 },
  shopVoucherBtn: { backgroundColor: T.orange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  shopVoucherBtnTxt: { color: T.white, fontSize: 10, fontWeight: '700' },
});
