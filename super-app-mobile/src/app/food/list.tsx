import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const FILTERS = ['Gần tôi', 'Freeship Xtra', 'Đánh giá 4.5+', 'Đang mở cửa', 'Healthy', 'Món chay'];

const MOCK_RESTAURANTS = [
  { 
    id: '1', name: "Pizza 4P's - Hai Bà Trưng", type: 'Pizza, Đồ Âu', rating: '4.8',
    time: '20 phút', dist: '1.2 km', fee: '15.000đ',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    badges: ['Đối tác uy tín', 'Freeship']
  },
  { 
    id: '2', name: 'Phở Thìn Lò Đúc', type: 'Món Việt, Phở', rating: '4.5',
    time: '15 phút', dist: '0.8 km', fee: '10.000đ',
    img: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=600&q=80',
    badges: ['Đang thịnh hành']
  },
  { 
    id: '3', name: 'Salad Station (Healthy)', type: 'Salad, Healthy', rating: '4.9',
    time: '25 phút', dist: '2.5 km', fee: '20.000đ',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    badges: ['Giảm 30%']
  },
];

export default function FoodListScreen() {
  const router = useRouter();
  const { filter } = useLocalSearchParams(); 
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const accentColor = '#F97316'; 

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (f: string) => {
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const getTitle = () => {
    if (filter === 'ai') return 'Gợi ý từ AI 🤖';
    if (filter === 'healthy') return 'Món Healthy';
    if (filter === 'pizza') return 'Pizza & Đồ Âu';
    return 'Danh sách Nhà hàng';
  };

  const handleRestaurantPress = (id: string) => {
    router.push(`/food/restaurant/${id}`);
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <LinearGradient
          colors={['#FFF9F5', '#FFFFFF']}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontFamily: 'Outfit' }]}>{getTitle()}</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="options-outline" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Filters Scroll */}
        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map((f, i) => {
              const isActive = activeFilters.includes(f);
              return (
                <Animated.View key={f} entering={FadeInDown.delay(i * 50).duration(300)}>
                  <TouchableOpacity 
                    style={[styles.filterChip, isActive && { backgroundColor: accentColor, borderColor: accentColor }]}
                    onPress={() => toggleFilter(f)}
                  >
                    <Text style={[styles.filterText, isActive && { color: '#FFF' }]}>{f}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {MOCK_RESTAURANTS.map((res, index) => (
            <Animated.View key={res.id} entering={FadeInUp.delay(index * 100).duration(500)}>
              <TouchableOpacity 
                style={styles.resCard} 
                activeOpacity={0.9}
                onPress={() => handleRestaurantPress(res.id)}
              >
                <View style={styles.imgContainer}>
                  <Image source={{ uri: res.img }} style={styles.resImg} />
                  {/* Badges Overlay */}
                  <View style={styles.badgeContainer}>
                    {res.badges.map(b => (
                      <View key={b} style={[styles.badge, b === 'Freeship' && { backgroundColor: '#10B981' }]}>
                        <Text style={styles.badgeText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.favBtn}>
                    <Ionicons name="heart-outline" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.resInfo}>
                  <Text style={styles.resName}>{res.name}</Text>
                  <Text style={styles.resType}>{res.type}</Text>
                  
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={[styles.metaText, { color: '#F59E0B', fontWeight: '700' }]}>{res.rating}</Text>
                    </View>
                    <Text style={styles.dot}>•</Text>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#64748B" />
                      <Text style={styles.metaText}>{res.time}</Text>
                    </View>
                    <Text style={styles.dot}>•</Text>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color="#64748B" />
                      <Text style={styles.metaText}>{res.dist}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.feeRow}>
                    <Ionicons name="bicycle-outline" size={16} color={accentColor} />
                    <Text style={styles.feeText}>Phí giao: {res.fee}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
          
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
  
  filterWrapper: { paddingVertical: 12, backgroundColor: '#FFF' },
  filterScroll: { paddingHorizontal: 16, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  filterText: { color: '#334155', fontSize: 13, fontWeight: '600' },

  scrollContent: { padding: 16 },
  
  resCard: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  imgContainer: { width: '100%', height: 180, position: 'relative' },
  resImg: { width: '100%', height: '100%' },
  badgeContainer: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 },
  badge: { backgroundColor: '#F97316', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  favBtn: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  
  resInfo: { padding: 16 },
  resName: { color: '#0F172A', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  resType: { color: '#64748B', fontSize: 14, marginBottom: 12 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  dot: { color: '#94A3B8', marginHorizontal: 8, fontSize: 16 },
  
  feeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(249, 115, 22, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  feeText: { color: '#F97316', fontSize: 13, fontWeight: '600' }
});
