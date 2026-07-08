import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, SafeAreaView, Platform, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

const CARS = [
  { id: '1', name: 'Mazda 3 2023', type: 'Sedan • 5 chỗ', transmission: 'Tự động', price: 800000, rating: 4.9, reviews: 124, image: 'https://images.unsplash.com/photo-1598555310613-2287f37e4130?w=400', tags: ['Giao xe tận nơi', 'Miễn phí hủy'] },
  { id: '2', name: 'Toyota Fortuner 2022', type: 'SUV • 7 chỗ', transmission: 'Tự động', price: 1200000, rating: 4.8, reviews: 85, image: 'https://images.unsplash.com/photo-1590362891991-f7055743a12a?w=400', tags: ['Rộng rãi', 'Leo dốc tốt'] },
  { id: '3', name: 'Honda CR-V 2024', type: 'CUV • 7 chỗ', transmission: 'Tự động', price: 1100000, rating: 4.9, reviews: 200, image: 'https://images.unsplash.com/photo-1606540306385-d852a42dd7de?w=400', tags: ['Tiết kiệm xăng', 'Giao xe tận nơi'] },
  { id: '4', name: 'Ford Ranger 2023', type: 'Bán tải • 5 chỗ', transmission: 'Số sàn', price: 1000000, rating: 4.7, reviews: 92, image: 'https://images.unsplash.com/photo-1603584852928-874cc66380c5?w=400', tags: ['Off-road', 'Chở đồ tốt'] },
];

const FILTERS = ['Tất cả', '4-5 chỗ', '7 chỗ', 'Số tự động', 'Giao xe tận nơi', 'SUV'];

export default function CarRentalScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const width = Dimensions.get('window').width;
  const isDesktop = Platform.OS === 'web' && width > 768;
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  return (
    <View style={[S.root, { backgroundColor: theme.background || '#F8FAFC' }]}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        
        {/* HEADER */}
        <LinearGradient colors={['#0F172A', '#1E3A5F']} style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Thuê xe tự lái</Text>
          <TouchableOpacity style={S.headerRight}>
            <Ionicons name="options-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          
          {/* SEARCH BAR */}
          <View style={S.searchSection}>
            <View style={S.searchContainer}>
              <View style={S.searchInputWrapper}>
                <Ionicons name="location-outline" size={20} color="#64748B" />
                <TextInput placeholder="Bạn muốn thuê xe ở đâu?" placeholderTextColor="#94A3B8" style={S.searchInput} />
              </View>
              <View style={S.datePickerWrapper}>
                <View style={S.dateBox}>
                  <Text style={S.dateLabel}>Nhận xe</Text>
                  <Text style={S.dateValue}>22/10, 08:00</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#CBD5E1" />
                <View style={S.dateBox}>
                  <Text style={S.dateLabel}>Trả xe</Text>
                  <Text style={S.dateValue}>24/10, 20:00</Text>
                </View>
              </View>
              <TouchableOpacity style={S.searchBtn}>
                <Text style={S.searchBtnText}>Tìm xe ngay</Text>
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
              <Ionicons name="sparkles" size={16} color="#F59E0B" />
              <Text style={S.aiBannerTitle}>AI Gợi ý theo lịch trình</Text>
            </View>
            <Text style={S.aiBannerText}>Dựa theo hành trình đi Đà Lạt (nhiều đèo dốc) với 4 người, bạn nên chọn các xe SUV gầm cao để đảm bảo an toàn và thoải mái nhất.</Text>
          </View>

          {/* CAR LIST */}
          <View style={S.listSection}>
            <Text style={S.sectionTitle}>Gợi ý hàng đầu</Text>
            {CARS.map(car => (
              <TouchableOpacity key={car.id} style={S.carCard} onPress={() => router.push(`/travel/car/${car.id}`)}>
                <Image source={{ uri: car.image }} style={S.carImage} />
                <View style={S.carInfo}>
                  <View style={S.carHeaderRow}>
                    <Text style={S.carName}>{car.name}</Text>
                    <View style={S.ratingBox}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={S.ratingTxt}>{car.rating}</Text>
                    </View>
                  </View>
                  <Text style={S.carType}>{car.type} • {car.transmission}</Text>
                  
                  <View style={S.tagsRow}>
                    {car.tags.map(tag => (
                      <View key={tag} style={S.tagBadge}>
                        <Text style={S.tagTxt}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={S.priceRow}>
                    <Text style={S.priceValue}>{car.price.toLocaleString('vi-VN')}đ<Text style={S.priceUnit}>/ngày</Text></Text>
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
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
  datePickerWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 12, marginBottom: 16 },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  dateValue: { fontSize: 14, fontWeight: '500', color: '#0F172A' },
  searchBtn: { backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  filterSection: { marginTop: 16, paddingBottom: 16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: 'transparent' },
  filterBadgeActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  filterText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  filterTextActive: { color: '#3B82F6', fontWeight: '600' },

  aiBanner: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FEF3C7' },
  aiBannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: '#B45309' },
  aiBannerText: { fontSize: 13, color: '#92400E', lineHeight: 20 },

  listSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  carCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  carImage: { width: '100%', height: 180, backgroundColor: '#E2E8F0' },
  carInfo: { padding: 16 },
  carHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  carName: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 2 },
  ratingTxt: { fontSize: 12, fontWeight: '600', color: '#B45309' },
  carType: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tagBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagTxt: { fontSize: 11, color: '#475569' },
  priceRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  priceValue: { fontSize: 18, fontWeight: '700', color: '#3B82F6' },
  priceUnit: { fontSize: 14, fontWeight: '400', color: '#64748B' },
});

