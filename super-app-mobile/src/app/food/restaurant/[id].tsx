import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions, Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, Extrapolate, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const MENU_CATEGORIES = ['Món bán chạy', 'Combo Tiết kiệm', 'Món chính', 'Đồ uống'];
const MOCK_ITEMS = [
  { id: 'i1', cat: 'Món bán chạy', name: 'Pizza Hải Sản Viền Phô Mai', desc: 'Tôm, mực, nghêu, ớt chuông, phô mai dầy', price: '185.000đ', oldPrice: '250.000đ', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80' },
  { id: 'i2', cat: 'Món bán chạy', name: 'Mì Ý Bò Băm Xốt Cà Chua', desc: 'Thịt bò băm, xốt cà chua tươi, phô mai Parmesan', price: '95.000đ', img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80' },
  { id: 'i3', cat: 'Combo Tiết kiệm', name: 'Combo 2 Người Vui Vẻ', desc: '1 Pizza M + 1 Mì Ý + 2 Coca', price: '250.000đ', oldPrice: '320.000đ', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80' },
  { id: 'i4', cat: 'Món chính', name: 'Salad Gà Nướng Healthy', desc: 'Ức gà nướng mật ong, xà lách, xốt mè rang', price: '75.000đ', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
  { id: 'i5', cat: 'Đồ uống', name: 'Trà Đào Cam Sả', desc: 'Trà đào tươi, sả, cam tươi giải nhiệt', price: '45.000đ', img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80' },
];

const HEADER_HEIGHT = 250;

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const [activeCat, setActiveCat] = useState('Món bán chạy');
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-100, 0], [1.5, 1], Extrapolate.CLAMP);
    const translateY = interpolate(scrollY.value, [0, HEADER_HEIGHT], [0, -(HEADER_HEIGHT / 2)], Extrapolate.CLAMP);
    return { transform: [{ scale }, { translateY }] };
  });

  return (
    <View style={styles.webWrapper}>
      <View style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Back & Icons */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/food')}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="share-social-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="heart-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.ScrollView 
          onScroll={onScroll} 
          scrollEventThrottle={16} 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: '#F8FAFC' }}
        >
          {/* Parallax Header */}
          <View style={{ height: HEADER_HEIGHT }}>
            <Animated.Image 
              source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' }} 
              style={[StyleSheet.absoluteFill, headerStyle]} 
            />
            <LinearGradient colors={['transparent', 'rgba(248, 250, 252, 1)']} style={StyleSheet.absoluteFillObject} />
          </View>

          <View style={styles.content}>
            {/* Info Card */}
            <Animated.View entering={FadeInUp.duration(400)} style={styles.infoCard}>
              <Text style={styles.resName}>Pizza 4P's - Hai Bà Trưng</Text>
              <Text style={styles.resType}>Pizza, Đồ Âu • Đang mở cửa</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={[styles.metaText, { color: '#0F172A', fontWeight: 'bold' }]}>4.8 <Text style={{ color: '#64748B', fontWeight: 'normal' }}>(999+)</Text></Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <Text style={styles.metaText}>20 phút</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={16} color="#64748B" />
                  <Text style={styles.metaText}>1.2 km</Text>
                </View>
              </View>
              
              <View style={styles.promoRow}>
                <View style={[styles.promoTag, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="pricetag" size={12} color="#10B981" />
                  <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }}>Freeship Xtra</Text>
                </View>
                <View style={[styles.promoTag, { backgroundColor: '#F9731620' }]}>
                  <Ionicons name="flash" size={12} color="#F97316" />
                  <Text style={{ color: '#F97316', fontSize: 12, fontWeight: '700' }}>Giảm 30K đơn 150K</Text>
                </View>
              </View>
            </Animated.View>

            {/* Menu Categories */}
            <View style={styles.menuCats}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 10 }}>
                {MENU_CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.catBtn, activeCat === cat && { backgroundColor: accentColor, borderColor: accentColor }]}
                    onPress={() => setActiveCat(cat)}
                  >
                    <Text style={[styles.catText, activeCat === cat && { color: '#FFF' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Items List */}
            <View style={styles.itemList}>
              {MOCK_ITEMS.filter(item => item.cat === activeCat || activeCat === 'Món bán chạy').map((item, idx) => (
                <Animated.View key={item.id} entering={FadeInUp.delay(idx * 50).duration(400)}>
                  <TouchableOpacity 
                    style={styles.itemCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/food/item/${item.id}`)}
                  >
                    <Image source={{ uri: item.img }} style={styles.itemImg} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.itemPrice}>{item.price}</Text>
                        {item.oldPrice && <Text style={styles.itemOldPrice}>{item.oldPrice}</Text>}
                        
                        <View style={styles.addBtn}>
                          <Ionicons name="add" size={18} color="#FFF" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View style={{ height: 100 }} />
          </View>
        </Animated.ScrollView>

        {/* View Cart Floating Button */}
        <View style={styles.floatCartWrap}>
          <TouchableOpacity 
            style={[styles.floatCartBtn, { backgroundColor: accentColor }]}
            activeOpacity={0.9}
            onPress={() => router.push('/food/cart')}
          >
            <View style={styles.cartIconBox}>
              <Ionicons name="cart" size={20} color={accentColor} />
              <View style={styles.cartBadge}><Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>2</Text></View>
            </View>
            <Text style={styles.cartTotalText}>Giỏ hàng • 280.000đ</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#FFF', width: '100%', position: 'relative' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#E2E8F0', borderRadius: 55, overflow: 'hidden' },
  
  topBar: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  
  content: { paddingHorizontal: 16, marginTop: -60 },
  
  infoCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  resName: { color: '#0F172A', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  resType: { color: '#64748B', fontSize: 14, marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#334155', fontSize: 13 },
  promoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  promoTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },

  menuCats: { marginTop: 24, marginBottom: 16 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  catText: { color: '#475569', fontSize: 14, fontWeight: '600' },

  itemList: { gap: 16 },
  itemCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  itemImg: { width: 100, height: 100, borderRadius: 12 },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemName: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  itemDesc: { color: '#64748B', fontSize: 13, marginTop: 4, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  itemPrice: { color: '#F97316', fontSize: 16, fontWeight: '800', marginRight: 8 },
  itemOldPrice: { color: '#94A3B8', fontSize: 13, textDecorationLine: 'line-through' },
  addBtn: { marginLeft: 'auto', width: 32, height: 32, borderRadius: 16, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },

  floatCartWrap: { position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20, left: 16, right: 16 },
  floatCartBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, shadowColor: '#F97316', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cartIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cartBadge: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  cartTotalText: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '800', marginLeft: 16 },
});
