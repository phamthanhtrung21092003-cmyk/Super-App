import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform, SafeAreaView,
  StatusBar, ScrollView, Image, Dimensions, Alert, Share, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const TRIPS = [
  {
    id: 't1',
    title: 'Mù Cang Chải - Mùa lúa chín',
    date: '15-17/11/2024',
    days: 3,
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200'],
    totalCost: 4050000,
    distance: '320km',
    locations: ['Hà Nội', 'Tú Lệ', 'Mù Cang Chải'],
    highlights: ['Đèo Khau Phạ', 'Ruộng bậc thang La Pán Tẩn', 'Dù lượn', 'Suối khoáng nóng'],
    mood: '😍',
    isPublic: true,
  },
  {
    id: 't2',
    title: 'Phú Quốc - Hè 2024',
    date: '20-23/7/2024',
    days: 4,
    coverImage: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?w=400',
    photos: ['https://images.unsplash.com/photo-1540845511934-7721dd7adec3?w=200', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200'],
    totalCost: 12800000,
    distance: 'Bay 1h30',
    locations: ['Hà Nội', 'Phú Quốc'],
    highlights: ['Bãi Sao', 'Vinpearl Land', 'Lặn san hô', 'Chợ đêm Dinh Cậu'],
    mood: '🥰',
    isPublic: false,
  },
];

const EXPENSES = [
  { label: 'Di chuyển', amount: 1200000, icon: '✈️', color: '#F59E0B', pct: 30 },
  { label: 'Lưu trú', amount: 1500000, icon: '🏠', color: '#3B82F6', pct: 37 },
  { label: 'Ăn uống', amount: 800000, icon: '🍜', color: '#10B981', pct: 20 },
  { label: 'Vui chơi', amount: 550000, icon: '🎯', color: '#8B5CF6', pct: 13 },
];

export default function DiaryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const width = Dimensions.get('window').width;
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [activeTrip, setActiveTrip] = useState(TRIPS[0]);
  const [activeTab, setActiveTab] = useState<'photos' | 'map' | 'expense' | 'story'>('photos');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient colors={['#0F172A', '#1E1B4B']} style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Nhật ký chuyến đi</Text>
          <TouchableOpacity style={S.addBtn} onPress={() => router.push('/travel/itinerary' as any)}>
            <Ionicons name="add" size={24} color="#0EA5E9" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* TRIP SELECTOR */}
          <View style={S.tripSelector}>
            <Text style={S.sectionTitle}>Chuyến đi của tôi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {TRIPS.map(trip => (
                <TouchableOpacity key={trip.id} onPress={() => setActiveTrip(trip)} style={[S.tripThumb, activeTrip.id === trip.id && S.tripThumbActive]}>
                  <Image source={{ uri: trip.coverImage }} style={S.tripThumbImg} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={S.tripThumbGrad}>
                    <Text style={S.tripThumbMood}>{trip.mood}</Text>
                    <Text style={S.tripThumbTitle} numberOfLines={2}>{trip.title}</Text>
                    <Text style={S.tripThumbDate}>{trip.date}</Text>
                  </LinearGradient>
                  {!trip.isPublic && (
                    <View style={S.privateBadge}>
                      <Ionicons name="lock-closed" size={10} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={S.addTripCard} onPress={() => router.push('/travel/itinerary' as any)}>
                <LinearGradient colors={['#1E293B', '#334155']} style={S.addTripInner}>
                  <Ionicons name="add-circle-outline" size={32} color="#0EA5E9" />
                  <Text style={S.addTripTxt}>Thêm chuyến đi mới</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* ACTIVE TRIP DETAILS */}
          <View style={S.activeTripCard}>
            <Image source={{ uri: activeTrip.coverImage }} style={S.activeTripCover} resizeMode="cover" />
            <LinearGradient colors={['transparent', '#0F172A']} style={S.activeTripGrad} />
            <View style={S.activeTripInfo}>
              <Text style={S.activeTripMood}>{activeTrip.mood}</Text>
              <Text style={S.activeTripTitle}>{activeTrip.title}</Text>
              <View style={S.activeTripMeta}>
                <View style={S.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={S.metaTxt}>{activeTrip.date}</Text>
                </View>
                <View style={S.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={S.metaTxt}>{activeTrip.distance}</Text>
                </View>
                <View style={S.metaItem}>
                  <Ionicons name="moon-outline" size={14} color="#64748B" />
                  <Text style={S.metaTxt}>{activeTrip.days} ngày</Text>
                </View>
              </View>
            </View>
          </View>

          {/* HIGHLIGHTS */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>Điểm nổi bật</Text>
            <View style={S.highlightList}>
              {activeTrip.highlights.map((h, i) => (
                <View key={i} style={S.highlightItem}>
                  <View style={S.highlightDot} />
                  <Text style={S.highlightTxt}>{h}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* TABS */}
          <View style={S.tabRow}>
            {([
              { key: 'photos', icon: 'images-outline', label: 'Ảnh' },
              { key: 'map', icon: 'map-outline', label: 'Hành trình' },
              { key: 'expense', icon: 'wallet-outline', label: 'Chi phí' },
              { key: 'story', icon: 'document-text-outline', label: 'Story' },
            ] as const).map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[S.tab, activeTab === tab.key && S.tabActive]}>
                <Ionicons name={tab.icon} size={18} color={activeTab === tab.key ? '#0EA5E9' : '#64748B'} />
                <Text style={[S.tabLabel, activeTab === tab.key && S.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* PHOTOS TAB */}
          {activeTab === 'photos' && (
            <View style={S.photoGrid}>
              {[...activeTrip.photos, ...activeTrip.photos, ...activeTrip.photos].slice(0, 9).map((url, i) => (
                <TouchableOpacity key={i} style={S.photoCell} onPress={() => setSelectedImage(url)}>
                  <Image source={{ uri: url }} style={S.photoImg} />
                  {i === 8 && (
                    <View style={S.photoMore}>
                      <Text style={S.photoMoreTxt}>+{Math.max(0, 20 - 9)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* MAP TAB */}
          {activeTab === 'map' && (
            <View style={S.mapMock}>
              <LinearGradient colors={['#0C4A6E', '#0F766E']} style={S.mapBg}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 16 }}>🗺️ Hành trình</Text>
                {activeTrip.locations.map((loc, i) => (
                  <View key={i} style={S.routeItem}>
                    <View style={S.routeDot} />
                    {i < activeTrip.locations.length - 1 && <View style={S.routeLine} />}
                    <View style={S.routeInfo}>
                      <Text style={S.routeName}>{loc}</Text>
                      {i < activeTrip.locations.length - 1 && (
                        <Text style={S.routeArrow}>↓ ~2-3 giờ di chuyển</Text>
                      )}
                    </View>
                  </View>
                ))}
              </LinearGradient>
            </View>
          )}

          {/* EXPENSE TAB */}
          {activeTab === 'expense' && (
            <View style={S.expenseSection}>
              <View style={S.totalCard}>
                <Text style={S.totalLabel}>Tổng chi phí chuyến đi</Text>
                <Text style={S.totalAmount}>{fmt(activeTrip.totalCost)}</Text>
                <Text style={S.totalPerPerson}>≈ {fmt(activeTrip.totalCost / 2)}/người (2 người)</Text>
              </View>
              {EXPENSES.map(exp => (
                <View key={exp.label} style={S.expRow}>
                  <View style={[S.expIcon, { backgroundColor: exp.color + '22' }]}>
                    <Text style={{ fontSize: 20 }}>{exp.icon}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={S.expLabel}>{exp.label}</Text>
                      <Text style={S.expAmount}>{fmt(exp.amount)}</Text>
                    </View>
                    <View style={S.expBarBg}>
                      <View style={[S.expBar, { width: `${exp.pct}%` as any, backgroundColor: exp.color }]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* STORY TAB */}
          {activeTab === 'story' && (
            <View style={{ padding: 16 }}>
              <LinearGradient colors={['#1E293B', '#0C4A6E']} style={S.storyCard}>
                <Text style={S.storyTitle}>✨ Travel Story</Text>
                <Text style={S.storyContent}>
                  {"Chuyến đi Mù Cang Chải tháng 11 là một trong những trải nghiệm đáng nhớ nhất của năm 2024. Màu vàng ươm của lúa chín trải dài trên những thửa ruộng bậc thang, tiếng gió rừng xào xạc, và hương thơm của xôi nếp Tú Lệ theo khói bếp lan tỏa vào buổi sáng sớm...\n\nĐèo Khau Phạ mờ trong mây, bộ ảnh ghi lại khoảnh khắc bình minh trên cánh đồng La Pán Tẩn, và cái cảm giác lơ lửng trên chiếc dù lượn nhìn toàn bộ thung lũng từ trên cao — những điều đó không phải camera nào ghi lại được đầy đủ."}
                </Text>
                <View style={S.storyFooter}>
                  <TouchableOpacity style={S.exportBtn} onPress={() => Share.share({ message: `Nhật ký chuyến đi: ${activeTrip.title} - Rất tuyệt vời!` })}>
                    <Ionicons name="share-outline" size={16} color="#0EA5E9" />
                    <Text style={S.exportBtnTxt}>Xuất Travel Story</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={S.shareStoryBtn} onPress={() => Share.share({ message: `Đọc nhật ký hành trình ${activeTrip.title} của tôi trên VN Travel ngay!` })}>
                    <LinearGradient colors={['#0EA5E9', '#14B8A6']} style={S.shareStoryGrad}>
                      <Text style={{ color: '#FFF', fontWeight: '700' }}>Chia sẻ</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          )}
        </ScrollView>

        {/* IMAGE VIEWER MODAL */}
        <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close-circle" size={36} color="#FFF" />
            </TouchableOpacity>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
            )}
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safe: { flex: 1, backgroundColor: '#0F172A', width: '100%' },
  desktop: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000', borderRadius: 44, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 12, paddingBottom: 14 },
  backBtn: { padding: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  addBtn: { padding: 6 },
  tripSelector: { padding: 16, paddingBottom: 8 },
  sectionTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  tripThumb: { width: 160, height: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  tripThumbActive: { borderColor: '#0EA5E9' },
  tripThumbImg: { width: '100%', height: '100%' },
  tripThumbGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', padding: 10 },
  tripThumbMood: { fontSize: 20, marginBottom: 4 },
  tripThumbTitle: { color: '#FFF', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  tripThumbDate: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },
  privateBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 8 },
  addTripCard: { width: 140, height: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: '#334155', borderStyle: 'dashed' },
  addTripInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  addTripTxt: { color: '#64748B', fontSize: 12, textAlign: 'center' },

  activeTripCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden', height: 180 },
  activeTripCover: { width: '100%', height: '100%' },
  activeTripGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  activeTripInfo: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  activeTripMood: { fontSize: 24 },
  activeTripTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginTop: 4 },
  activeTripMeta: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt: { color: '#94A3B8', fontSize: 12 },

  section: { paddingHorizontal: 16, marginBottom: 12 },
  highlightList: { gap: 8 },
  highlightItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  highlightDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0EA5E9' },
  highlightTxt: { color: '#E2E8F0', fontSize: 14 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 4, marginBottom: 12 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: '#1E293B' },
  tabActive: { backgroundColor: 'rgba(14,165,233,0.15)', borderWidth: 1, borderColor: '#0EA5E9' },
  tabLabel: { color: '#64748B', fontSize: 10, fontWeight: '600', marginTop: 2 },
  tabLabelActive: { color: '#0EA5E9' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 4 },
  photoCell: { width: '31.5%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%' },
  photoMore: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  photoMoreTxt: { color: '#FFF', fontSize: 20, fontWeight: '800' },

  mapMock: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  mapBg: { padding: 20 },
  routeItem: { flexDirection: 'row', marginBottom: 4 },
  routeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#0EA5E9', marginTop: 4, marginRight: 12 },
  routeLine: { position: 'absolute', left: 5.5, top: 16, width: 1, height: 40, backgroundColor: '#334155' },
  routeInfo: { flex: 1, marginBottom: 30 },
  routeName: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  routeArrow: { color: '#64748B', fontSize: 12, marginTop: 4 },

  expenseSection: { padding: 16, gap: 12 },
  totalCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  totalLabel: { color: '#64748B', fontSize: 13 },
  totalAmount: { color: '#0EA5E9', fontSize: 28, fontWeight: '800', marginTop: 4 },
  totalPerPerson: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  expRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  expIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  expLabel: { color: '#E2E8F0', fontWeight: '600', fontSize: 14 },
  expAmount: { color: '#0EA5E9', fontWeight: '700', fontSize: 14 },
  expBarBg: { height: 4, backgroundColor: '#334155', borderRadius: 4, marginTop: 8 },
  expBar: { height: 4, borderRadius: 4 },

  storyCard: { borderRadius: 16, padding: 20 },
  storyTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  storyContent: { color: '#CBD5E1', fontSize: 14, lineHeight: 22 },
  storyFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#0EA5E9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  exportBtnTxt: { color: '#0EA5E9', fontWeight: '600' },
  shareStoryBtn: { borderRadius: 25, overflow: 'hidden' },
  shareStoryGrad: { paddingHorizontal: 20, paddingVertical: 10 },
});

