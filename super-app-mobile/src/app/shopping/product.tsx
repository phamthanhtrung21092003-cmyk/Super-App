import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useShopping } from '../../context/ShoppingContext';
import { MOCK_PRODUCTS } from './index';

const T = {
  black: '#0F172A',
  white: '#FFFFFF',
  bg: '#F8FAFC',
  sub: '#64748B',
  border: '#E2E8F0',
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function PremiumProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { cart, addToCart } = useShopping();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  
  const product = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  
  const [showSheet, setShowSheet] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || 'Default');
  const [quantity, setQuantity] = useState(1);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      shopId: product.shopId,
      shopName: product.shopName,
      isMall: product.isMall,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      variant: selectedVariant,
      image: product.image,
      quantity,
    });
    setShowSheet(false);
  };

  const renderVariantSheet = () => {
    if (!showSheet) return null;
    return (
      <View style={S.sheetOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowSheet(false)} />
        <Animated.View entering={SlideInDown.springify().damping(25).stiffness(200)} style={S.sheet}>
          <View style={S.sheetHeader}>
            <Text style={S.sheetTitle}>TUỲ CHỌN</Text>
            <TouchableOpacity onPress={() => setShowSheet(false)}><Ionicons name="close" size={24} color={T.black} /></TouchableOpacity>
          </View>
          
          <ScrollView style={{ maxHeight: 400 }}>
            <View style={S.productPreview}>
              <Image source={{ uri: product.image }} style={S.previewImg} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={S.previewName} numberOfLines={2}>{product.name}</Text>
                <Text style={S.previewPrice}>{formatMoney(product.price)}</Text>
              </View>
            </View>

            {product.variants && (
              <View style={S.section}>
                <Text style={S.sectionLabel}>Phân loại</Text>
                <View style={S.variantGrid}>
                  {product.variants.map(v => (
                    <TouchableOpacity key={v} style={[S.variantBtn, selectedVariant === v && S.variantBtnActive]} onPress={() => setSelectedVariant(v)}>
                      <Text style={[S.variantTxt, selectedVariant === v && S.variantTxtActive]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={S.section}>
              <Text style={S.sectionLabel}>Số lượng</Text>
              <View style={S.qtyControls}>
                <TouchableOpacity style={S.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}><Ionicons name="remove" size={20} /></TouchableOpacity>
                <Text style={S.qtyVal}>{quantity}</Text>
                <TouchableOpacity style={S.qtyBtn} onPress={() => setQuantity(q => q + 1)}><Ionicons name="add" size={20} /></TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={S.addToBagBtn} onPress={handleAddToCart} activeOpacity={0.8}>
            <Text style={S.addToBagTxt}>THÊM VÀO TÚI</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Transparent Header */}
        <View style={S.headerActions} pointerEvents="box-none">
          <TouchableOpacity style={S.roundBtn} onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={T.black} /></TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={S.roundBtn} onPress={() => router.push('/shopping/cart')}>
              <Ionicons name="bag-outline" size={22} color={T.black} />
              {cartItemCount > 0 && <View style={S.cartBadge}><Text style={S.cartBadgeTxt}>{cartItemCount}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity style={S.roundBtn}><Ionicons name="share-outline" size={22} color={T.black} /></TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: product.image }} style={S.mainImg} />
          
          <View style={S.infoContainer}>
            <Text style={S.brandName}>{product.shopName.toUpperCase()}</Text>
            <Text style={S.productName}>{product.name}</Text>
            <Text style={S.price}>{formatMoney(product.price)}</Text>
            
            <View style={S.divider} />
            
            <Text style={S.descTitle}>CHI TIẾT SẢN PHẨM</Text>
            <Text style={S.descText}>
              Mang phong cách tối giản, sản phẩm được thiết kế để hoàn thiện vẻ ngoài thanh lịch của bạn. 
              Chất liệu cao cấp, đường may tỉ mỉ, mang lại cảm giác thoải mái tuyệt đối trong mọi hoàn cảnh.
            </Text>

            <View style={S.divider} />
            
            <TouchableOpacity style={S.accordion}>
              <Text style={S.accordionTxt}>Vận chuyển & Trả hàng</Text>
              <Ionicons name="add" size={20} color={T.black} />
            </TouchableOpacity>
            <TouchableOpacity style={S.accordion}>
              <Text style={S.accordionTxt}>Đánh giá ({product.rating} ★)</Text>
              <Ionicons name="add" size={20} color={T.black} />
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Floating Bottom Bar */}
        <View style={S.bottomBar}>
          <TouchableOpacity style={S.bottomBtn} onPress={() => setShowSheet(true)} activeOpacity={0.8}>
            <Text style={S.bottomBtnTxt}>THÊM VÀO TÚI</Text>
          </TouchableOpacity>
        </View>

        {renderVariantSheet()}
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.white },
  safe: { flex: 1 },
  desktop: { maxWidth: 414, alignSelf: 'center', borderRadius: 20, overflow: 'hidden' },
  
  headerActions: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 0, right: 0, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: T.black, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  cartBadgeTxt: { color: T.white, fontSize: 10, fontWeight: '700' },
  
  mainImg: { width: '100%', height: 500, resizeMode: 'cover' },
  
  infoContainer: { padding: 25 },
  brandName: { fontSize: 12, letterSpacing: 2, color: T.sub, marginBottom: 10 },
  productName: { fontSize: 24, fontWeight: '400', color: T.black, lineHeight: 32, marginBottom: 15 },
  price: { fontSize: 20, fontWeight: '600', color: T.black },
  
  divider: { height: 1, backgroundColor: T.border, marginVertical: 25 },
  
  descTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: T.black, marginBottom: 15 },
  descText: { fontSize: 14, color: T.sub, lineHeight: 24 },
  
  accordion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: T.border },
  accordionTxt: { fontSize: 14, color: T.black, fontWeight: '500' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 35 : 20, backgroundColor: 'rgba(255,255,255,0.95)' },
  bottomBtn: { backgroundColor: T.black, paddingVertical: 18, borderRadius: 8, alignItems: 'center' },
  bottomBtnTxt: { color: T.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100 },
  sheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: T.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  sheetTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  
  productPreview: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  previewImg: { width: 60, height: 80, borderRadius: 4 },
  previewName: { fontSize: 14, color: T.black, marginBottom: 8 },
  previewPrice: { fontSize: 16, fontWeight: '600', color: T.black },
  
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  sectionLabel: { fontSize: 12, letterSpacing: 1, color: T.sub, marginBottom: 15 },
  
  variantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  variantBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, borderWidth: 1, borderColor: T.border },
  variantBtnActive: { backgroundColor: T.black, borderColor: T.black },
  variantTxt: { fontSize: 13, color: T.black },
  variantTxtActive: { color: T.white, fontWeight: '600' },
  
  qtyControls: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: T.border, borderRadius: 30 },
  qtyBtn: { padding: 12 },
  qtyVal: { paddingHorizontal: 20, fontSize: 16, fontWeight: '500' },
  
  addToBagBtn: { backgroundColor: T.black, marginHorizontal: 20, marginTop: 20, paddingVertical: 18, borderRadius: 8, alignItems: 'center' },
  addToBagTxt: { color: T.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
});
