import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, interpolateColor } from 'react-native-reanimated';
import { useShopping } from '../../context/ShoppingContext';

const T = {
  black: '#0F172A',
  white: '#FFFFFF',
  bg: '#F8FAFC',
  sub: '#64748B',
  border: '#E2E8F0',
};

export const MOCK_PRODUCTS = [
  { id: 'p1', shopId: 's1', shopName: 'Apple Premium', isMall: true, name: 'iPhone 15 Pro Max', price: 29990000, originalPrice: 34990000, sold: '15.2k', rating: 4.9, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80', variants: ['Titan Tự Nhiên', 'Titan Đen'] },
  { id: 'p2', shopId: 's2', shopName: 'Minimalist Studio', isMall: true, name: 'Essential Cotton Tee', price: 450000, originalPrice: 600000, sold: '5.1k', rating: 4.8, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', variants: ['Onyx Black', 'Pure White'] },
  { id: 'p3', shopId: 's3', shopName: 'Aura Skincare', isMall: true, name: 'Hydrating Serum', price: 850000, originalPrice: 1200000, sold: '2.4k', rating: 4.9, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', variants: ['50ml', '100ml'] },
  { id: 'p4', shopId: 's4', shopName: 'Urban Kicks', isMall: false, name: 'Classic White Sneakers', price: 1250000, originalPrice: 1500000, sold: '1.2k', rating: 4.7, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', variants: ['Size 39', 'Size 40', 'Size 41'] },
  { id: 'p5', shopId: 's1', shopName: 'Apple Premium', isMall: true, name: 'AirPods Pro Gen 2', price: 5490000, originalPrice: 6100000, sold: '8.5k', rating: 4.9, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', variants: ['Tiêu Chuẩn'] },
  { id: 'p6', shopId: 's2', shopName: 'Minimalist Studio', isMall: true, name: 'Lounge Shorts', price: 350000, originalPrice: 450000, sold: '3.3k', rating: 4.8, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80', variants: ['Black', 'Grey'] },
];

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function PremiumHome() {
  const router = useRouter();
  const { cart } = useShopping();
  const scrollY = useSharedValue(0);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(scrollY.value, [0, 200], ['transparent', 'rgba(255,255,255,0.95)']);
    const border = interpolateColor(scrollY.value, [0, 200], ['transparent', 'rgba(0,0,0,0.05)']);
    return { backgroundColor: bg, borderBottomColor: border, borderBottomWidth: 1 };
  });
  
  const iconColorStyle = useAnimatedStyle(() => {
    const color = interpolateColor(scrollY.value, [0, 200], ['#FFFFFF', T.black]);
    return { color };
  });

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Floating Header */}
      <Animated.View style={[S.header, headerStyle]} pointerEvents="box-none">
        <SafeAreaView pointerEvents="box-none">
          <View style={S.headerContent} pointerEvents="box-none">
            <TouchableOpacity onPress={() => router.replace('/utilities')}>
              <Animated.Text style={iconColorStyle}><Ionicons name="grid-outline" size={24} /></Animated.Text>
            </TouchableOpacity>
            
            <Animated.Text style={[S.brandTitle, iconColorStyle]}>BOUTIQUE</Animated.Text>

            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity>
                <Animated.Text style={iconColorStyle}><Ionicons name="search-outline" size={24} /></Animated.Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/shopping/cart')}>
                <Animated.Text style={iconColorStyle}><Ionicons name="bag-outline" size={24} /></Animated.Text>
                {cartItemCount > 0 && (
                  <View style={S.cartBadge}><Text style={S.cartBadgeTxt}>{cartItemCount}</Text></View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={S.heroWrapper}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80' }} style={S.heroImg} />
          <View style={S.heroOverlay}>
            <Text style={S.heroSubtitle}>THU ĐÔNG 2026</Text>
            <Text style={S.heroTitle}>SỰ TỐI GIẢN</Text>
            <Text style={S.heroTitle}>HOÀN MỸ</Text>
            <TouchableOpacity style={S.heroBtn}><Text style={S.heroBtnTxt}>Khám Phá Ngay</Text></TouchableOpacity>
          </View>
        </View>

        {/* Essential Picks */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>BỘ SƯU TẬP THIẾT YẾU</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}>
            {MOCK_PRODUCTS.slice(0, 3).map(p => (
              <TouchableOpacity key={p.id} style={S.essentialCard} onPress={() => router.push(`/shopping/product?id=${p.id}`)}>
                <Image source={{ uri: p.image }} style={S.essentialImg} />
                <View style={S.essentialInfo}>
                  <Text style={S.essentialName} numberOfLines={1}>{p.name}</Text>
                  <Text style={S.essentialPrice}>{formatMoney(p.price)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Curated Grid */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>DÀNH RIÊNG CHO BẠN</Text>
          <View style={S.grid}>
            {MOCK_PRODUCTS.map(p => (
              <TouchableOpacity key={`grid-${p.id}`} style={S.gridCard} onPress={() => router.push(`/shopping/product?id=${p.id}`)} activeOpacity={0.8}>
                <Image source={{ uri: p.image }} style={S.gridImg} />
                <View style={S.gridInfo}>
                  <Text style={S.gridBrand}>{p.shopName.toUpperCase()}</Text>
                  <Text style={S.gridName} numberOfLines={2}>{p.name}</Text>
                  <Text style={S.gridPrice}>{formatMoney(p.price)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 15 },
  brandTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 4, textAlign: 'center', position: 'absolute', left: 0, right: 0, zIndex: -1 },
  
  cartBadge: { position: 'absolute', top: -5, right: -8, backgroundColor: T.black, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: T.white },
  cartBadgeTxt: { color: T.white, fontSize: 9, fontWeight: '700' },
  
  heroWrapper: { width: '100%', height: 600, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', padding: 30, paddingBottom: 60 },
  heroSubtitle: { color: T.white, fontSize: 12, letterSpacing: 3, marginBottom: 10, opacity: 0.9 },
  heroTitle: { color: T.white, fontSize: 42, fontWeight: '800', letterSpacing: 2, lineHeight: 48 },
  heroBtn: { backgroundColor: T.white, alignSelf: 'flex-start', paddingHorizontal: 25, paddingVertical: 12, marginTop: 25, borderRadius: 30 },
  heroBtnTxt: { color: T.black, fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  
  section: { marginTop: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', letterSpacing: 2, color: T.black, marginLeft: 20, marginBottom: 20 },
  
  essentialCard: { width: 280 },
  essentialImg: { width: 280, height: 350, borderRadius: 8 },
  essentialInfo: { marginTop: 15 },
  essentialName: { fontSize: 16, color: T.black, fontWeight: '500' },
  essentialPrice: { fontSize: 14, color: T.sub, marginTop: 5 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, justifyContent: 'space-between' },
  gridCard: { width: '48%', marginBottom: 30 },
  gridImg: { width: '100%', aspectRatio: 3/4, borderRadius: 8 },
  gridInfo: { marginTop: 12 },
  gridBrand: { fontSize: 10, letterSpacing: 1, color: T.sub, marginBottom: 4 },
  gridName: { fontSize: 14, color: T.black, lineHeight: 20 },
  gridPrice: { fontSize: 14, color: T.black, fontWeight: '600', marginTop: 8 },
});
