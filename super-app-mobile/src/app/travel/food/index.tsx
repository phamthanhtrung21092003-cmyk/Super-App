import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, SafeAreaView, Platform, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

const FOODS = [
  { id: '1', name: 'Bún chả Hương Liên', rating: 4.8, reviews: 1540, price: '40.000đ - 60.000đ', type: 'Đặc sản Hà Nội', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?w=400', tags: ['Michelin Guide', 'Ngõ nhỏ'], location: 'Hoàn Kiếm, Hà Nội' },
  { id: '2', name: 'Nhà hàng Bún Bò Huế Oanh', rating: 4.7, reviews: 890, price: '50.000đ - 80.000đ', type: 'Đặc sản Huế', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400', tags: ['Đậm vị truyền thống', 'Rộng rãi'], location: 'TP Huế' },
  { id: '3', name: 'Quán Hải Sản Làng Chài', rating: 4.6, reviews: 1200, price: '150.000đ - 500.000đ', type: 'Hải sản tươi sống', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400', tags: ['View biển', 'Đang mở cửa'], location: 'Nha Trang' },
];

const FILTERS = ['Tất cả', 'Đặc sản', 'Hải sản', 'Đang mở cửa', 'View đẹp', 'Giá rẻ'];

export default function FoodScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  return (
    <View style={[S.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        
        <LinearGradient colors={['#D97706', '#B45309']} style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Khám phá Ẩm thực</Text>
          <TouchableOpacity style={S.headerRight}>
            <Ionicons name="map-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          
          <View style={S.searchSection}>
            <View style={S.searchContainer}>
              <View style={S.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#64748B" />
                <TextInput placeholder="Tìm món ăn, quán ăn..." placeholderTextColor="#94A3B8" style={S.searchInput} />
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
              <Ionicons name="restaurant" size={16} color="#B45309" />
              <Text style={S.aiBannerTitle}>AI Gợi ý theo Ngữ cảnh</Text>
            </View>
            <Text style={S.aiBannerText}>Trời đang se lạnh và có mưa phùn (19°C) tại Hà Nội. Thật tuyệt vời nếu bạn thưởng thức một bát phở bò nóng hổi hoặc bún chả nướng than hoa.</Text>
          </View>

          {/* FOOD LIST */}
          <View style={S.listSection}>
            <Text style={S.sectionTitle}>Quán ngon quanh đây</Text>
            {FOODS.map(food => (
              <TouchableOpacity key={food.id} style={S.card} onPress={() => router.push(`/travel/food/${food.id}`)}>
                <Image source={{ uri: food.image }} style={S.cardImage} />
                <TouchableOpacity style={S.heartBtn}>
                  <Ionicons name="heart-outline" size={20} color="#FFF" />
                </TouchableOpacity>
                
                <View style={S.cardInfo}>
                  <Text style={S.cardName} numberOfLines={1}>{food.name}</Text>
                  
                  <View style={S.ratingRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={S.ratingTxt}>{food.rating}</Text>
                    <Text style={S.reviewCount}>({food.reviews}) • {food.location}</Text>
                  </View>
                  
                  <View style={S.tagsRow}>
                    {food.tags.map(tag => (
                      <View key={tag} style={S.tagBadge}>
                        <Text style={S.tagTxt}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={S.priceRow}>
                    <Text style={S.priceValue}>{food.price}</Text>
                    <Text style={S.foodType}>{food.type}</Text>
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
  
  searchSection: { padding: 16, backgroundColor: '#D97706', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  searchContainer: { backgroundColor: '#FFF', borderRadius: 12, padding: 8, elevation: 4 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },

  filterSection: { marginTop: 16, paddingBottom: 16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: 'transparent' },
  filterBadgeActive: { backgroundColor: '#FEF3C7', borderColor: '#D97706' },
  filterText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  filterTextActive: { color: '#D97706', fontWeight: '600' },

  aiBanner: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FEF3C7' },
  aiBannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: '#B45309' },
  aiBannerText: { fontSize: 13, color: '#92400E', lineHeight: 20 },

  listSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2 },
  cardImage: { width: '100%', height: 160, backgroundColor: '#E2E8F0' },
  heartBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.3)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { padding: 16 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingTxt: { fontSize: 14, fontWeight: '600', color: '#F59E0B', marginLeft: 4, marginRight: 6 },
  reviewCount: { fontSize: 13, color: '#64748B' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagTxt: { fontSize: 11, color: '#475569' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  priceValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  foodType: { fontSize: 13, fontWeight: '500', color: '#D97706' },
});

