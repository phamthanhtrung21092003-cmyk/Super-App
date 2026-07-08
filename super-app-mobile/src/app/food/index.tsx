import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions,
  TextInput, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const CATEGORIES = [
  { id: 'rice', name: 'Cơm', icon: '🍚' },
  { id: 'noodle', name: 'Bún/Phở', icon: '🍜' },
  { id: 'banhmi', name: 'Bánh mì', icon: '🥖' },
  { id: 'milktea', name: 'Trà sữa', icon: '🧋' },
  { id: 'hotpot', name: 'Lẩu', icon: '🍲' },
  { id: 'bbq', name: 'Đồ nướng', icon: '🍢' },
  { id: 'fastfood', name: 'Fast Food', icon: '🍔' },
  { id: 'chicken', name: 'Gà rán', icon: '🍗' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'seafood', name: 'Hải sản', icon: '🦀' },
  { id: 'sushi', name: 'Sushi', icon: '🍣' },
  { id: 'snack', name: 'Ăn vặt', icon: '🍟' },
  { id: 'coffee', name: 'Cà phê', icon: '☕' },
  { id: 'cake', name: 'Bánh ngọt', icon: '🍰' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
  { id: 'vegan', name: 'Món chay', icon: '🥦' },
];

const BANNERS = [
  { id: '1', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', title: 'Freeship mọi đơn' },
  { id: '2', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', title: 'Giảm 50% BBQ' },
];

const SUGGESTIONS = [
  { id: '1', title: 'Trời mưa ăn lẩu nhé?', desc: 'Giảm giá 30% các quán lẩu gần bạn', img: 'https://images.unsplash.com/photo-1547825407-2d060104b7f8?auto=format&fit=crop&w=400&q=80' },
  { id: '2', title: 'Gợi ý nạp năng lượng', desc: 'Các món Healthy dưới 300 Kcal', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
];

export default function FoodHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const accentColor = '#F97316'; // Orange
  const accentLight = 'rgba(249, 115, 22, 0.15)';

  const goToList = (filter?: string) => {
    router.push({ pathname: '/food/list', params: { filter } });
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <LinearGradient
          colors={['#FFF9F5', '#FFFFFF']}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Header (Back + Cart) */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontFamily: 'Outfit' }]}>GIAO ĐỒ ĂN</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={accentColor} />
              <Text style={styles.locationText} numberOfLines={1}>Giao đến: 123 Nguyễn Văn Linh, Quận 7</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </View>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => alert('Giỏ hàng đang trống')}>
            <Ionicons name="cart-outline" size={24} color="#0F172A" />
            <View style={[styles.badge, { backgroundColor: accentColor }]}><Text style={styles.badgeText}>2</Text></View>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Search Bar */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#64748B" />
              <TextInput 
                style={styles.searchInput}
                placeholder="Tìm món ăn, quán ăn..."
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.micBtn} onPress={() => alert('Đang nghe...')}>
                <Ionicons name="mic" size={20} color={accentColor} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Banners */}
          <Animated.View entering={FadeInUp.delay(100).duration(600)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {BANNERS.map((banner) => (
                <TouchableOpacity key={banner.id} style={styles.bannerCard} activeOpacity={0.9} onPress={() => alert(`Đang mở khuyến mãi: ${banner.title}`)}>
                  <Image source={{ uri: banner.img }} style={styles.bannerImg} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.bannerOverlay}>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Categories */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: 'Outfit' }]}>Danh mục</Text>
            </View>
            <View style={styles.grid}>
              {CATEGORIES.map((cat, index) => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.catItem}
                  onPress={() => goToList(cat.id)}
                >
                  <View style={[styles.catIconWrap, { backgroundColor: accentLight }]}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.catName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* AI Suggestions */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { fontFamily: 'Outfit' }]}>AI Gợi Ý Hôm Nay</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
              {SUGGESTIONS.map(sug => (
                <TouchableOpacity key={sug.id} style={styles.sugCard} onPress={() => goToList('ai')} activeOpacity={0.9}>
                  <Image source={{ uri: sug.img }} style={styles.sugImg} />
                  <View style={styles.sugInfo}>
                    <Text style={styles.sugTitle}>{sug.title}</Text>
                    <Text style={styles.sugDesc} numberOfLines={2}>{sug.desc}</Text>
                    <View style={styles.sugBadge}>
                      <Text style={styles.sugBadgeText}>Khám phá ngay</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#FFF', width: '100%' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#E2E8F0', borderRadius: 55, overflow: 'hidden' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingHorizontal: 16, paddingBottom: 15, backgroundColor: '#FFF' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  locationText: { color: '#475569', fontSize: 12, maxWidth: 200 },
  badge: { position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  scrollContent: { paddingTop: 20 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, marginHorizontal: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#FFEDD5', shadowColor: '#F97316', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  searchInput: { flex: 1, marginLeft: 12, color: '#0F172A', fontSize: 15, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  micBtn: { padding: 8 },

  bannerScroll: { marginTop: 24, marginBottom: 24 },
  bannerCard: { width: 300, height: 150, borderRadius: 20, overflow: 'hidden', marginRight: 16 },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 16 },
  bannerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },

  section: { marginBottom: 30 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#0F172A', fontSize: 20, fontWeight: '700' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  catItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  catIconWrap: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, backgroundColor: '#FFF', shadowColor: '#F97316', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  catIcon: { fontSize: 28 },
  catName: { color: '#334155', fontSize: 12, fontWeight: '600', textAlign: 'center' },

  sugCard: { width: 260, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  sugImg: { width: '100%', height: 130 },
  sugInfo: { padding: 16 },
  sugTitle: { color: '#0F172A', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  sugDesc: { color: '#64748B', fontSize: 13, marginBottom: 12, lineHeight: 18 },
  sugBadge: { alignSelf: 'flex-start', backgroundColor: '#F97316', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  sugBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' }
});
