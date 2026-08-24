import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const TABS = ['Tất cả', 'Khách sạn', 'Homestay', 'Thuê xe', 'Quán ăn', 'Camping'];

const MOCK_WISHLIST = [
  { id: '1', type: 'Khách sạn', name: 'InterContinental Phú Quốc', rating: 5.0, price: '4.200.000đ', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', route: '/travel/hotel/1' },
  { id: '2', type: 'Thuê xe', name: 'Mazda 3 2023', rating: 4.9, price: '800.000đ/ngày', image: 'https://images.unsplash.com/photo-1598555310613-2287f37e4130?w=400', route: '/travel/car/1' },
  { id: '3', type: 'Homestay', name: 'The K’ho Homestay', rating: 4.8, price: '650.000đ/đêm', image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400', route: '/travel/homestay/1' },
  { id: '4', type: 'Quán ăn', name: 'Bún chả Hương Liên', rating: 4.8, price: '40.000đ - 60.000đ', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?w=400', route: '/travel/food/1' },
];

export default function WishlistScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Tất cả');

  const filtered = activeTab === 'Tất cả' ? MOCK_WISHLIST : MOCK_WISHLIST.filter(i => i.type === activeTab);

  return (
    <View style={[S.root, { backgroundColor: theme.background || '#F8FAFC' }]}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        
        <LinearGradient colors={['#BE185D', '#9D174D']} style={S.header}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/travel'))} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Danh sách Yêu thích</Text>
          <TouchableOpacity style={S.headerRight}>
            <Ionicons name="trash-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={S.tabSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.tabScroll}>
            {TABS.map(tab => (
              <TouchableOpacity key={tab} style={[S.tabBadge, activeTab === tab && S.tabBadgeActive]} onPress={() => setActiveFilter(tab)}>
                <Text style={[S.tabText, activeTab === tab && S.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {filtered.length === 0 ? (
            <View style={S.emptyBox}>
              <Ionicons name="heart-dislike-outline" size={48} color="#CBD5E1" />
              <Text style={S.emptyText}>Chưa có mục yêu thích nào</Text>
            </View>
          ) : (
            filtered.map(item => (
              <TouchableOpacity key={item.id} style={S.card} onPress={() => router.push(item.route as any)}>
                <Image source={{ uri: item.image }} style={S.cardImage} />
                <View style={S.cardInfo}>
                  <Text style={S.cardType}>{item.type}</Text>
                  <Text style={S.cardName} numberOfLines={1}>{item.name}</Text>
                  <View style={S.ratingRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={S.ratingTxt}>{item.rating}</Text>
                  </View>
                  <Text style={S.priceValue}>{item.price}</Text>
                </View>
                <TouchableOpacity style={S.removeBtn}>
                  <Ionicons name="heart" size={24} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  function setActiveFilter(tab: string) {
    setActiveTab(tab);
  }
}

const S = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  headerRight: { padding: 4 },
  
  tabSection: { paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tabScroll: { paddingHorizontal: 16, gap: 8 },
  tabBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  tabBadgeActive: { backgroundColor: '#FCE7F3', borderColor: '#BE185D' },
  tabText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  tabTextActive: { color: '#BE185D', fontWeight: '700' },

  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  cardImage: { width: 100, height: '100%', backgroundColor: '#E2E8F0' },
  cardInfo: { flex: 1, padding: 12 },
  cardType: { fontSize: 11, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingTxt: { fontSize: 13, fontWeight: '600', color: '#F59E0B', marginLeft: 4 },
  priceValue: { fontSize: 15, fontWeight: '700', color: '#BE185D' },
  removeBtn: { padding: 12, justifyContent: 'center' },

  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { marginTop: 12, fontSize: 15, color: '#94A3B8' },
});
