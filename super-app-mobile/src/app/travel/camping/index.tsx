import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, SafeAreaView, Platform, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { VERIFIED_CAMPING } from '../../../modules/travel/data/verifiedDestinations';

const CAMPINGS = VERIFIED_CAMPING.map(c => ({
  id: c.id,
  name: c.name,
  rating: c.rating,
  reviews: c.reviews,
  price: c.price,
  type: c.type || 'Glamping',
  image: c.image.url,
  tags: c.tags,
  location: c.location,
}));

const FILTERS = ['Tất cả', 'Ven biển', 'Bờ hồ', 'Trên núi', 'Trong rừng', 'Glamping (Tiện nghi)'];

export default function CampingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  return (
    <View style={[S.root, { backgroundColor: theme.background || '#F8FAFC' }]}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        
        {/* HEADER */}
        <LinearGradient colors={['#166534', '#14532D']} style={S.header}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/travel'))} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Tìm điểm Cắm Trại</Text>
          <TouchableOpacity style={S.headerRight}>
            <Ionicons name="map-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          
          {/* SEARCH BAR */}
          <View style={S.searchSection}>
            <View style={S.searchContainer}>
              <View style={S.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#64748B" />
                <TextInput placeholder="Bạn muốn đi cắm trại ở đâu?" placeholderTextColor="#94A3B8" style={S.searchInput} />
              </View>
            </View>
          </View>

          {/* FILTERS */}
          <View style={S.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.filterScroll}>
              {FILTERS.map(f => (
                <TouchableOpacity 
                  key={f} 
                  style={[S.filterBadge, activeFilter === f && S.filterBadgeActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[S.filterText, activeFilter === f && S.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* AI WEATHER WARNING BANNER */}
          <View style={S.aiBanner}>
            <View style={S.aiBannerHeader}>
              <Ionicons name="rainy" size={18} color="#0284C7" />
              <Text style={S.aiBannerTitle}>AI Dự báo Thời tiết cuối tuần</Text>
            </View>
            <Text style={S.aiBannerText}>Khu vực Sóc Sơn (Hà Nội) dự báo có mưa dông vào chiều T7. Khuyên bạn nên mang bạt che mưa cỡ lớn hoặc chọn khu vực có chòi che sẵn.</Text>
          </View>

          {/* CAMPING LIST */}
          <View style={S.listSection}>
            <Text style={S.sectionTitle}>Các khu cắm trại hot nhất</Text>
            {CAMPINGS.map(camp => (
              <TouchableOpacity key={camp.id} style={S.card} onPress={() => router.push(`/travel/camping/${camp.id}`)}>
                <Image source={{ uri: camp.image }} style={S.cardImage} />
                
                <View style={S.cardInfo}>
                  <Text style={S.cardName}>{camp.name}</Text>
                  
                  <View style={S.ratingRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={S.ratingTxt}>{camp.rating}</Text>
                    <Text style={S.reviewCount}>({camp.reviews}) • {camp.location}</Text>
                  </View>
                  
                  <View style={S.tagsRow}>
                    {camp.tags.map(tag => (
                      <View key={tag} style={S.tagBadge}>
                        <Text style={S.tagTxt}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={S.priceRow}>
                    <Text style={S.priceValue}>{camp.price.toLocaleString('vi-VN')}đ<Text style={S.priceUnit}>/người</Text></Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? Math.max((StatusBar.currentHeight || 0) + 10, 44) : 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  headerRight: { padding: 4 },
  
  searchSection: { padding: 16, backgroundColor: '#166534', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  searchContainer: { backgroundColor: '#FFF', borderRadius: 12, padding: 8, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },

  filterSection: { marginTop: 16, paddingBottom: 16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: 'transparent' },
  filterBadgeActive: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
  filterText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  filterTextActive: { color: '#16A34A', fontWeight: '600' },

  aiBanner: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#F0F9FF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#BAE6FD' },
  aiBannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: '#0369A1' },
  aiBannerText: { fontSize: 13, color: '#0C4A6E', lineHeight: 20 },

  listSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardImage: { width: '100%', height: 160, backgroundColor: '#E2E8F0' },
  cardInfo: { padding: 16 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingTxt: { fontSize: 14, fontWeight: '600', color: '#F59E0B', marginLeft: 4, marginRight: 6 },
  reviewCount: { fontSize: 13, color: '#64748B' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagTxt: { fontSize: 11, color: '#475569' },
  priceRow: { alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  priceValue: { fontSize: 18, fontWeight: '700', color: '#16A34A' },
  priceUnit: { fontSize: 14, fontWeight: '400', color: '#64748B' },
});

