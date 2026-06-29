import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, SafeAreaView, Platform, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

const HOTELS = [
  { id: '1', name: 'InterContinental Phú Quốc', rating: 5.0, reviews: 1240, price: 4200000, oldPrice: 5500000, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', tags: ['Khách sạn 5 sao', 'Bãi biển riêng', 'Buffet sáng'], location: 'Bãi Kem, An Thới', discount: 'Giảm 24%' },
  { id: '2', name: 'Movenpick Resort Waverly', rating: 4.8, reviews: 892, price: 2800000, oldPrice: null, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', tags: ['Khách sạn 5 sao', 'Hồ bơi lớn', 'Buffet sáng'], location: 'Bãi Ông Lang', discount: null },
  { id: '3', name: 'Salinda Resort', rating: 4.9, reviews: 560, price: 3500000, oldPrice: 4000000, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', tags: ['Khách sạn 5 sao', 'Eco-friendly', 'Gần trung tâm'], location: 'Cửa Lấp', discount: 'Giảm 12%' },
  { id: '4', name: 'Amarin Resort & Spa', rating: 4.5, reviews: 320, price: 1500000, oldPrice: null, image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400', tags: ['Khách sạn 4 sao', 'Spa xịn', 'Bãi biển riêng'], location: 'Trần Hưng Đạo', discount: null },
];

const FILTERS = ['Tất cả', '5 sao', '4 sao', 'Có hồ bơi', 'Buffet sáng miễn phí', 'Giá dưới 2 triệu'];

export default function HotelScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  return (
    <View style={[S.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        
        {/* HEADER */}
        <LinearGradient colors={['#0F172A', '#1E3A5F']} style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Tìm Khách Sạn</Text>
          <TouchableOpacity style={S.headerRight}>
            <Ionicons name="options-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          
          {/* SEARCH BAR */}
          <View style={S.searchSection}>
            <View style={S.searchContainer}>
              <View style={S.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#64748B" />
                <TextInput placeholder="Bạn muốn nghỉ tại đâu?" placeholderTextColor="#94A3B8" style={S.searchInput} defaultValue="Phú Quốc" />
              </View>
              
              <View style={S.rowBox}>
                <View style={S.datePickerWrapper}>
                  <Ionicons name="calendar-outline" size={18} color="#64748B" />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={S.dateLabel}>Nhận - Trả phòng</Text>
                    <Text style={S.dateValue}>22/10 - 24/10</Text>
                  </View>
                </View>
                <View style={S.guestPickerWrapper}>
                  <Ionicons name="people-outline" size={18} color="#64748B" />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={S.dateLabel}>Khách & Phòng</Text>
                    <Text style={S.dateValue}>2 Khách, 1 P</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={S.searchBtn}>
                <Text style={S.searchBtnText}>Tìm khách sạn</Text>
              </TouchableOpacity>
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

          {/* AI SUGGESTION BANNER */}
          <View style={S.aiBanner}>
            <View style={S.aiBannerHeader}>
              <Ionicons name="sparkles" size={16} color="#059669" />
              <Text style={S.aiBannerTitle}>AI Gợi ý cho Gia đình</Text>
            </View>
            <Text style={S.aiBannerText}>Nhóm bạn có 2 người lớn và trẻ em. Các resort 5 sao ở khu vực Bãi Kem rất lý tưởng vì có Kid Club và bãi biển riêng an toàn.</Text>
          </View>

          {/* HOTEL LIST */}
          <View style={S.listSection}>
            <Text style={S.sectionTitle}>Khách sạn hàng đầu tại Phú Quốc</Text>
            {HOTELS.map(hotel => (
              <TouchableOpacity key={hotel.id} style={S.hotelCard} onPress={() => router.push(`/travel/hotel/${hotel.id}`)}>
                <View style={S.imageContainer}>
                  <Image source={{ uri: hotel.image }} style={S.hotelImage} />
                  {hotel.discount && (
                    <View style={S.discountBadge}>
                      <Text style={S.discountTxt}>{hotel.discount}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={S.heartBtn}>
                    <Ionicons name="heart-outline" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={S.hotelInfo}>
                  <Text style={S.hotelName} numberOfLines={1}>{hotel.name}</Text>
                  
                  <View style={S.ratingRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={S.ratingTxt}>{hotel.rating}</Text>
                    <Text style={S.reviewCount}>({hotel.reviews} đánh giá) • {hotel.location}</Text>
                  </View>
                  
                  <View style={S.tagsRow}>
                    {hotel.tags.slice(0,2).map(tag => (
                      <View key={tag} style={S.tagBadge}>
                        <Text style={S.tagTxt}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={S.priceRow}>
                    {hotel.oldPrice && (
                      <Text style={S.oldPriceValue}>{hotel.oldPrice.toLocaleString('vi-VN')}đ</Text>
                    )}
                    <Text style={S.priceValue}>{hotel.price.toLocaleString('vi-VN')}đ<Text style={S.priceUnit}>/đêm</Text></Text>
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
    paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  headerRight: { padding: 4 },
  
  searchSection: { padding: 16, backgroundColor: '#0F172A', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  searchContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333', fontWeight: '600' },
  
  rowBox: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  datePickerWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 12 },
  guestPickerWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 12 },
  dateLabel: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  dateValue: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  
  searchBtn: { backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  filterSection: { marginTop: 16, paddingBottom: 16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: 'transparent' },
  filterBadgeActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  filterText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  filterTextActive: { color: '#10B981', fontWeight: '600' },

  aiBanner: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#A7F3D0' },
  aiBannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: '#047857' },
  aiBannerText: { fontSize: 13, color: '#065F46', lineHeight: 20 },

  listSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  hotelCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  imageContainer: { position: 'relative', width: '100%', height: 180 },
  hotelImage: { width: '100%', height: '100%', backgroundColor: '#E2E8F0' },
  discountBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  discountTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  heartBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.3)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  
  hotelInfo: { padding: 16 },
  hotelName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingTxt: { fontSize: 14, fontWeight: '600', color: '#F59E0B', marginLeft: 4, marginRight: 6 },
  reviewCount: { fontSize: 13, color: '#64748B' },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagTxt: { fontSize: 11, color: '#475569' },
  
  priceRow: { alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  oldPriceValue: { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through', marginBottom: 2 },
  priceValue: { fontSize: 18, fontWeight: '700', color: '#EF4444' },
  priceUnit: { fontSize: 14, fontWeight: '400', color: '#64748B' },
});

