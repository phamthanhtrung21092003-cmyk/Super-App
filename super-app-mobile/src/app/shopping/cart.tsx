import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, Alert, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useShopping, CartItem } from '../../context/ShoppingContext';

const T = {
  red: '#EE4D2D',
  redLight: '#FEF2F2',
  black: '#111827',
  white: '#FFFFFF',
  bg: '#F3F4F6',
  sub: '#6B7280',
  border: '#E5E7EB',
  orange: '#00B14F',
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function ShopeeStyleCart() {
  const router = useRouter();
  const { cart, toggleCheckItem, toggleCheckShop, toggleCheckAll, updateQuantity } = useShopping();
  const [useCoinsToggle, setUseCoinsToggle] = useState(false);
  const [isEditingCart, setIsEditingCart] = useState(false);

  // Group cart items by shop
  const groupedCart: { shopId: string; shopName: string; isMall: boolean; items: CartItem[] }[] = [];
  cart.forEach(item => {
    let shop = groupedCart.find(g => g.shopId === item.shopId);
    if (!shop) {
      shop = { shopId: item.shopId, shopName: item.shopName, isMall: item.isMall, items: [] };
      groupedCart.push(shop);
    }
    shop.items.push(item);
  });

  const totalItemCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const checkedCount = cart.filter(c => c.checked).reduce((sum, c) => sum + c.quantity, 0);
  const isAllChecked = cart.length > 0 && cart.every(c => c.checked);
  const totalPrice = cart.filter(c => c.checked).reduce((sum, c) => sum + c.price * c.quantity, 0);

  return (
    <View style={S.root}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={T.white} translucent={false} />
        
        {/* 🔴 SHOPEE HEADER */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={S.headerTitle}>
            Giỏ hàng {totalItemCount > 0 ? `(${totalItemCount})` : '(122)'}
          </Text>

          <View style={S.headerRight}>
            <TouchableOpacity onPress={() => setIsEditingCart(!isEditingCart)} style={S.editHeaderBtn}>
              <Text style={S.editHeaderTxt}>{isEditingCart ? 'Xong' : 'Sửa'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => Alert.alert('Trò chuyện', 'Mở ứng dụng trò chuyện với người bán')}
              style={S.chatIconWrap}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#EE4D2D" />
              <View style={S.chatBadge}>
                <Text style={S.chatBadgeTxt}>33</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {cart.length === 0 ? (
            <View style={S.emptyState}>
              <Ionicons name="cart-outline" size={72} color={T.sub} />
              <Text style={S.emptyTxt}>Giỏ hàng của bạn còn trống</Text>
              <TouchableOpacity style={S.shopNowBtn} onPress={() => router.push('/shopping')}>
                <Text style={S.shopNowTxt}>MUA SẮM NGAY</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 10 }}>
              {groupedCart.map((shop) => {
                const isShopChecked = shop.items.every(i => i.checked);
                return (
                  <View key={shop.shopId} style={S.shopCard}>
                    {/* 🏪 Shop Header */}
                    <View style={S.shopHeaderRow}>
                      <TouchableOpacity 
                        onPress={() => toggleCheckShop(shop.shopId, !isShopChecked)} 
                        style={S.checkboxWrap}
                      >
                        <View style={[S.checkbox, isShopChecked && S.checkboxChecked]}>
                          {isShopChecked && <Ionicons name="checkmark" size={14} color={T.white} />}
                        </View>
                      </TouchableOpacity>

                      {shop.isMall ? (
                        <View style={S.mallBadge}>
                          <Text style={S.mallBadgeTxt}>Mall</Text>
                        </View>
                      ) : shop.shopId === 's_minhphuong' ? (
                        <View style={S.favBadge}>
                          <Text style={S.favBadgeTxt}>Yêu thích+</Text>
                        </View>
                      ) : (
                        <Ionicons name="storefront-outline" size={16} color="#333" style={{ marginRight: 4 }} />
                      )}

                      <TouchableOpacity 
                        onPress={() => router.push(`/shopping/shop?id=${shop.shopId}`)}
                        style={S.shopTitleBtn}
                      >
                        <Text style={S.shopNameTxt}>{shop.shopName}</Text>
                        <Ionicons name="chevron-forward" size={14} color="#666" />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => Alert.alert('Sửa gian hàng', `Chỉnh sửa các sản phẩm từ ${shop.shopName}`)}>
                        <Text style={S.shopEditTxt}>Sửa</Text>
                      </TouchableOpacity>
                    </View>

                    {/* 📦 Product Items in Shop */}
                    {shop.items.map((item, idx) => (
                      <View key={item.id} style={[S.itemCardRow, idx > 0 && { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }]}>
                        <TouchableOpacity 
                          onPress={() => toggleCheckItem(item.id)} 
                          style={[S.checkboxWrap, { marginTop: 10 }]}
                        >
                          <View style={[S.checkbox, item.checked && S.checkboxChecked]}>
                            {item.checked && <Ionicons name="checkmark" size={14} color={T.white} />}
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          onPress={() => router.push(`/shopping/product?id=${item.productId}`)}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: item.image }} style={S.itemThumbImg} />
                        </TouchableOpacity>

                        <View style={S.itemDetailCol}>
                          <Text style={S.itemNameTxt} numberOfLines={2}>{item.name}</Text>
                          
                          {/* Variant Select Button */}
                          <TouchableOpacity style={S.variantPill} onPress={() => Alert.alert('Chọn phân loại', `Chỉnh phân loại: ${item.variant}`)}>
                            <Text style={S.variantPillTxt} numberOfLines={1}>{item.variant}</Text>
                            <Ionicons name="chevron-down" size={12} color="#666" />
                          </TouchableOpacity>

                          {/* Campaign Badge */}
                          <View style={S.voucherXtraTag}>
                            <Text style={S.voucherXtraTxt}>8.8 Voucher Xtra</Text>
                          </View>

                          {/* Price & Quantity Control */}
                          <View style={S.priceQtyRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={S.itemPriceTxt}>{formatMoney(item.price)}</Text>
                              {item.originalPrice > item.price && (
                                <Text style={S.itemOrigPriceTxt}>{formatMoney(item.originalPrice)}</Text>
                              )}
                              <Text style={S.flashSaleTimerNote}>Flash Sale kết thúc lúc 17:00:00</Text>
                            </View>

                            {/* Quantity Controls */}
                            <View style={S.qtyBox}>
                              <TouchableOpacity style={S.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                                <Text style={S.qtyBtnSymbol}>-</Text>
                              </TouchableOpacity>
                              <Text style={S.qtyValTxt}>{item.quantity}</Text>
                              <TouchableOpacity style={S.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                                <Text style={S.qtyBtnSymbol}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}

                    {/* 🎟️ Shop Voucher Row */}
                    <TouchableOpacity 
                      style={S.shopVoucherRow} 
                      onPress={() => Alert.alert('Shop Voucher', 'Đã thêm Voucher giảm 15.000đ từ Shop!')}
                    >
                      <Ionicons name="ticket-outline" size={16} color="#EE4D2D" style={{ marginRight: 6 }} />
                      <Text style={S.shopVoucherTxt}>Thêm Shop Voucher</Text>
                      <Ionicons name="chevron-forward" size={14} color="#888" />
                    </TouchableOpacity>
                  </View>
                );
              })}

              {/* 🎟️ SHOPEE PLATFORM VOUCHER CARD */}
              <TouchableOpacity 
                style={S.platformVoucherCard}
                onPress={() => Alert.alert('Shopee Voucher', 'Chọn hoặc nhập mã giảm giá Shopee')}
              >
                <Ionicons name="ticket-outline" size={18} color="#EE4D2D" style={{ marginRight: 8 }} />
                <Text style={S.platformVoucherTitle}>Shopee Voucher</Text>
                <Text style={S.platformVoucherAction}>Chọn hoặc nhập mã</Text>
                <Ionicons name="chevron-forward" size={14} color="#888" style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              {/* 🪙 COIN REDEMPTION ROW */}
              <View style={S.coinRowCard}>
                <View style={S.coinIconBg}>
                  <Text style={S.coinIconTxt}>S</Text>
                </View>
                <Text style={S.coinLabelTxt}>
                  {checkedCount > 0 ? 'Dùng 500 Xu (-5.000đ)' : 'Bạn chưa chọn sản phẩm (?)'}
                </Text>
                <Switch 
                  value={checkedCount > 0 && useCoinsToggle} 
                  onValueChange={(val) => setUseCoinsToggle(val)} 
                  disabled={checkedCount === 0}
                  trackColor={{ false: '#E5E7EB', true: '#EE4D2D' }}
                  thumbColor="#FFF"
                />
              </View>
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* 🛒 FLOATING BOTTOM CHECKOUT BAR */}
        {cart.length > 0 && (
          <View style={S.bottomCheckoutBar}>
            <TouchableOpacity 
              style={S.checkAllBtnRow} 
              onPress={() => toggleCheckAll(!isAllChecked)}
              activeOpacity={0.8}
            >
              <View style={[S.checkbox, isAllChecked && S.checkboxChecked]}>
                {isAllChecked && <Ionicons name="checkmark" size={14} color={T.white} />}
              </View>
              <Text style={S.checkAllBarTxt}>Tất cả</Text>
            </TouchableOpacity>

            <View style={S.totalPriceCol}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={S.totalLabelTxt}>Tổng thanh toán: </Text>
                <Text style={S.totalPriceValTxt}>{formatMoney(totalPrice)}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[S.checkoutActionBtn, checkedCount === 0 && { backgroundColor: '#CCCCCC' }]} 
              disabled={checkedCount === 0} 
              onPress={() => router.push('/shopping/checkout')} 
              activeOpacity={0.85}
            >
              <Text style={S.checkoutActionBtnTxt}>Mua hàng ({checkedCount})</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  safe: { flex: 1 },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editHeaderBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  editHeaderTxt: { fontSize: 14, color: '#374151', fontWeight: '500' },
  chatIconWrap: { position: 'relative', padding: 4 },
  chatBadge: {
    position: 'absolute', top: -3, right: -6,
    backgroundColor: '#EE4D2D', borderRadius: 10,
    paddingHorizontal: 4, height: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFFFFF',
  },
  chatBadgeTxt: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },

  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTxt: { marginTop: 16, color: '#6B7280', fontSize: 14, marginBottom: 24 },
  shopNowBtn: { backgroundColor: '#EE4D2D', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 20 },
  shopNowTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkboxWrap: { marginRight: 10, padding: 2 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#EE4D2D',
    borderColor: '#EE4D2D',
  },
  mallBadge: {
    backgroundColor: '#D97706',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginRight: 6,
  },
  mallBadgeTxt: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  favBadge: {
    backgroundColor: '#EE4D2D',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginRight: 6,
  },
  favBadgeTxt: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  shopTitleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  shopNameTxt: { fontSize: 13, fontWeight: '700', color: '#111827', marginRight: 4 },
  shopEditTxt: { fontSize: 12, color: '#6B7280' },

  itemCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  itemThumbImg: {
    width: 80,
    height: 80,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  itemDetailCol: { flex: 1 },
  itemNameTxt: { fontSize: 13, color: '#1F2937', lineHeight: 18, fontWeight: '500' },
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  variantPillTxt: { fontSize: 11, color: '#4B5563', maxWidth: 140 },
  voucherXtraTag: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  voucherXtraTxt: { fontSize: 9, color: '#D97706', fontWeight: '800' },

  priceQtyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemPriceTxt: { fontSize: 15, fontWeight: '700', color: '#EE4D2D' },
  itemOrigPriceTxt: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through' },
  flashSaleTimerNote: { fontSize: 9, color: '#EE4D2D', marginTop: 2, fontWeight: '600' },

  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    height: 26,
  },
  qtyBtn: {
    width: 24,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  qtyBtnSymbol: { fontSize: 13, color: '#374151', fontWeight: '600' },
  qtyValTxt: {
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },

  shopVoucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  shopVoucherTxt: { flex: 1, fontSize: 12, color: '#4B5563' },

  platformVoucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  platformVoucherTitle: { fontSize: 13, fontWeight: '600', color: '#111827', flex: 1 },
  platformVoucherAction: { fontSize: 12, color: '#6B7280' },

  coinRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coinIconBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  coinIconTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  coinLabelTxt: { fontSize: 12, color: '#374151', flex: 1 },

  bottomCheckoutBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  checkAllBtnRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
  checkAllBarTxt: { fontSize: 13, color: '#374151', marginLeft: 6 },
  totalPriceCol: { flex: 1, alignItems: 'flex-end', paddingRight: 10 },
  totalLabelTxt: { fontSize: 12, color: '#374151' },
  totalPriceValTxt: { fontSize: 15, fontWeight: '800', color: '#EE4D2D' },
  checkoutActionBtn: {
    backgroundColor: '#EE4D2D',
    height: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutActionBtnTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
