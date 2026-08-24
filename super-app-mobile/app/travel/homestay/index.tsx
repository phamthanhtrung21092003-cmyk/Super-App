import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, SafeAreaView, Platform, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

const HOMESTAYS = [
  { id: '1', name: 'The K’ho Homestay', rating: 4.8, reviews: 210, price: 650000, type: 'Bungalow gỗ', image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400', tags: ['Săn mây', 'Giữa rừng thông', 'Vintage'], location: 'Đà Lạt' },
  { id: '2', name: 'Mộc Châu Retreat', rating: 4.9, reviews: 345, price: 800000, type: 'Villa nguyên căn', image: 'https://images.unsplash.com/photo-1542314831-c6a4d1424164?w=400', tags: ['Nguyên căn', 'Phù hợp gia đình', 'Có BBQ'], location: 'Mộc Châu' },
  { id: '3', name: 'Pù Luông Natura', rating: 4.7, reviews: 120, price: 1200000, type: 'Farmstay', image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=400', tags: ['Bể bơi vô cực', 'View ruộng bậc thang'], location: 'Thanh Hóa' },
];

const FILTERS = ['Tất cả', 'Bungalow', 'Villa nguyên căn', 'Farmstay', 'Săn mây', 'Gần suối'];

export default function HomestayScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  return (
    <View style={[S.root, { backgroundColor: theme.background || '#F8FAFC' }]}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        
        <LinearGradient colors={['#9D174D', '#831843']} style={S.header}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/travel'))} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Tìm Homestay</Text>
          <TouchableOpacity style={S.headerRight}>
            <Ionicons name="options-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          
          <View style={S.searchSection}>
            <View style={S.searchContainer}>
              <View style={S.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#64748B" />
                <TextInput placeholder="Bạn muốn tìm Homestay ở đâu?" placeholderTextColor="#94A3B8" style={S.searchInput} />
              </View>
            </View>
          </View>

          <View style={S.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.filterScroll}>
              {FILTERS.map(f => (
                <TouchableOpacity key={f} style={[S.filterBadge, activeFilter === f && S.filterBadgeActive]} onPress={() => setActiveFilter(f)}>
                  <Text style={[S.filterText, activeFilter === f && S.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* AI SUGGESTION BANNER */}
          <View style={S.aiBanner}>
            <View style={S.aiBannerHeader}>
              <Ionicons name="heart" size={16} color="#E11D48" />
              <Text style={S.aiBannerTitle}>AI Gợi ý cho Cặp đôi</Text>
            </View>
            <Text style={S.aiBannerText}>Các Bungalow gỗ kính có view thung lũng săn mây tại Đà Lạt cực kỳ lãng mạn cho 2 người vào dịp cuối tuần này.</Text>
          </View>

          {/* HOMESTAY LIST */}
          <View style={S.listSection}>
            <Text style={S.sectionTitle}>Gợi ý Homestay dành cho bạn</Text>
            {HOMESTAYS.map(home => (
              <TouchableOpacity key={home.id} style={S.card} onPress={() => router.push(`/travel/homestay/${home.id}`)}>
                <Image source={{ uri: home.image }} style={S.cardImage} />
                <TouchableOpacity style={S.heartBtn}>
                  <Ionicons name="heart-outline" size={20} color="#FFF" />
                </TouchableOpacity>
                
                <View style={S.cardInfo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={S.cardName} numberOfLines={1}>{home.name}</Text>
                    <View style={S.ratingBox}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={S.ratingTxt}>{home.rating}</Text>
                    </View>
                  </View>
                  <Text style={S.cardType}>{home.type} • {home.location}</Text>
                  
                  <View style={S.tagsRow}>
                    {home.tags.map(tag => (
                      <View key={tag} style={S.tagBadge}>
                        <Text style={S.tagTxt}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={S.priceRow}>
                    <Text style={S.priceValue}>{home.price.toLocaleString('vi-VN')}đ<Text style={S.priceUnit}>/đêm</Text></Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  headerRight: { padding: 4 },
  
  searchSection: { padding: 16, backgroundColor: '#9D174D', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  searchContainer: { backgroundColor: '#FFF', borderRadius: 12, padding: 8, elevation: 4 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },

  filterSection: { marginTop: 16, paddingBottom: 16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: 'transparent' },
  filterBadgeActive: { backgroundColor: '#FCE7F3', borderColor: '#DB2777' },
  filterText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  filterTextActive: { color: '#DB2777', fontWeight: '600' },

  aiBanner: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFF1F2', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FECDD3' },
  aiBannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: '#BE123C' },
  aiBannerText: { fontSize: 13, color: '#881337', lineHeight: 20 },

  listSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2 },
  cardImage: { width: '100%', height: 160, backgroundColor: '#E2E8F0' },
  heartBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.3)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { padding: 16 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 2 },
  ratingTxt: { fontSize: 12, fontWeight: '600', color: '#B45309' },
  cardType: { fontSize: 14, color: '#64748B', marginBottom: 12, marginTop: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagTxt: { fontSize: 11, color: '#475569' },
  priceRow: { alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  priceValue: { fontSize: 18, fontWeight: '700', color: '#DB2777' },
  priceUnit: { fontSize: 14, fontWeight: '400', color: '#64748B' },
});

