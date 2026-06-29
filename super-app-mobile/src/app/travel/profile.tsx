import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform, SafeAreaView,
  StatusBar, ScrollView, Image, Dimensions, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const BADGES = [
  { icon: '🌊', name: 'Người của biển', desc: 'Đã ghé thăm 5 bãi biển', earned: true },
  { icon: '🏔️', name: 'Chinh phục đỉnh cao', desc: 'Đã leo 3 ngọn núi', earned: true },
  { icon: '🌏', name: 'Lữ hành quốc tế', desc: 'Đã đến 2 quốc gia', earned: true },
  { icon: '📸', name: 'Nhiếp ảnh gia', desc: 'Đã chia sẻ 50 ảnh', earned: false },
  { icon: '🍜', name: 'Ẩm thực gia', desc: 'Đã thử 20 món đặc sản', earned: false },
  { icon: '🏕️', name: 'Phượt thủ', desc: 'Đã cắm trại 3 lần', earned: false },
];

const WISHLIST = [
  { id: '1', name: 'Hoàng Su Phì - Hà Giang', image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?w=200', season: 'Th9-10', saved: true },
  { id: '2', name: 'Côn Đảo - Bà Rịa', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200', season: 'T4-9', saved: true },
  { id: '3', name: 'Bản Giốc - Cao Bằng', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200', season: 'T9-10', saved: true },
];

const COUNTRIES = ['🇻🇳 Việt Nam', '🇹🇭 Thái Lan'];
const PROVINCES = ['Hà Nội', 'Yên Bái', 'Phú Quốc', 'Quảng Ninh', 'Lào Cai', 'Đà Lạt', 'Hội An', 'Đà Nẵng'];

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const width = Dimensions.get('window').width;
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'wishlist' | 'itineraries'>('stats');

  const STATS = [
    { label: 'Chuyến đi', value: '12', icon: '✈️', color: '#0EA5E9' },
    { label: 'Tỉnh thành', value: PROVINCES.length.toString(), icon: '📍', color: '#10B981' },
    { label: 'Quốc gia', value: COUNTRIES.length.toString(), icon: '🌍', color: '#F97316' },
    { label: 'Tổng km', value: '8.4k', icon: '🛣️', color: '#8B5CF6' },
  ];

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient colors={['#0F172A', '#0C4A6E']} style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Hồ sơ du lịch</Text>
          <TouchableOpacity style={S.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* PROFILE HERO */}
          <LinearGradient colors={['#0C4A6E', '#0F172A']} style={S.profileHero}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }}
              style={S.avatar}
            />
            <Text style={S.userName}>Nguyễn Văn A</Text>
            <Text style={S.userBio}>🌿 Phượt thủ | 📸 Travel Photography | Hà Nội, Việt Nam</Text>
            <View style={S.followRow}>
              <View style={S.followItem}>
                <Text style={S.followNum}>124</Text>
                <Text style={S.followLabel}>Đang theo dõi</Text>
              </View>
              <View style={S.followDivider} />
              <View style={S.followItem}>
                <Text style={S.followNum}>1.2k</Text>
                <Text style={S.followLabel}>Người theo dõi</Text>
              </View>
              <View style={S.followDivider} />
              <View style={S.followItem}>
                <Text style={S.followNum}>48</Text>
                <Text style={S.followLabel}>Bài đăng</Text>
              </View>
            </View>
            <TouchableOpacity style={S.editProfileBtn}>
              <Text style={S.editProfileTxt}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* QUICK STATS */}
          <View style={S.statsGrid}>
            {STATS.map(stat => (
              <View key={stat.label} style={S.statCard}>
                <LinearGradient colors={[stat.color + '22', stat.color + '11']} style={S.statCardInner}>
                  <Text style={{ fontSize: 24 }}>{stat.icon}</Text>
                  <Text style={[S.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={S.statLabel}>{stat.label}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* VISITED MAP PREVIEW */}
          <View style={S.mapPreview}>
            <LinearGradient colors={['#0C4A6E', '#0F766E']} style={S.mapPreviewBg}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Text style={S.mapPreviewTitle}>🗺️ Bản đồ hành trình</Text>
                <View style={S.rankBadge}>
                  <Text style={S.rankTxt}>🏆 Rank: Explorer</Text>
                </View>
              </View>
              {/* Province grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {PROVINCES.map(p => (
                  <View key={p} style={S.provinceChip}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={S.provinceChipTxt}>{p}</Text>
                  </View>
                ))}
              </View>
              {/* Countries */}
              <View style={S.countriesRow}>
                <Text style={S.countriesLabel}>Quốc gia đã đến:</Text>
                {COUNTRIES.map(c => (
                  <View key={c} style={S.countryChip}><Text style={S.countryChipTxt}>{c}</Text></View>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* TABS */}
          <View style={S.tabRow}>
            {([
              { key: 'stats', icon: 'stats-chart-outline', label: 'Thống kê' },
              { key: 'badges', icon: 'ribbon-outline', label: 'Huy hiệu' },
              { key: 'wishlist', icon: 'heart-outline', label: 'Wishlist' },
              { key: 'itineraries', icon: 'calendar-outline', label: 'Lịch trình' },
            ] as const).map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[S.tabBtn, activeTab === tab.key && S.tabBtnActive]}>
                <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#0EA5E9' : '#64748B'} />
                <Text style={[S.tabBtnLabel, activeTab === tab.key && S.tabBtnLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <View style={{ padding: 16 }}>
              <Text style={S.sectionTitle}>📊 Phân tích chuyến đi</Text>
              {[
                { label: 'Tháng đi nhiều nhất', value: 'Tháng 10-11 (mùa lúa chín)' },
                { label: 'Điểm đến yêu thích', value: 'Mù Cang Chải ❤️' },
                { label: 'Tổng chi phí 2024', value: '28.500.000đ' },
                { label: 'Chi phí trung bình/chuyến', value: '2.375.000đ' },
                { label: 'Bạn đồng hành', value: 'Gia đình (40%), Nhóm bạn (60%)' },
                { label: 'Phương tiện ưa thích', value: 'Xe máy phượt (70%), Máy bay (30%)' },
              ].map(item => (
                <View key={item.label} style={S.statRow}>
                  <Text style={S.statRowLabel}>{item.label}</Text>
                  <Text style={S.statRowValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* BADGES TAB */}
          {activeTab === 'badges' && (
            <View style={S.badgeGrid}>
              {BADGES.map(badge => (
                <View key={badge.name} style={[S.badgeCard, !badge.earned && S.badgeCardLocked]}>
                  <Text style={{ fontSize: badge.earned ? 36 : 30, opacity: badge.earned ? 1 : 0.4 }}>{badge.icon}</Text>
                  <Text style={[S.badgeName, !badge.earned && { color: '#475569' }]}>{badge.name}</Text>
                  <Text style={S.badgeDesc}>{badge.desc}</Text>
                  {!badge.earned && (
                    <View style={S.lockedBadge}>
                      <Ionicons name="lock-closed" size={12} color="#64748B" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <View style={{ padding: 16, gap: 12 }}>
              {WISHLIST.map(place => (
                <TouchableOpacity key={place.id} style={S.wishCard} onPress={() => router.push('/travel/destination')}>
                  <Image source={{ uri: place.image }} style={S.wishImg} />
                  <View style={S.wishInfo}>
                    <Text style={S.wishName}>{place.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Ionicons name="sunny-outline" size={13} color="#F59E0B" />
                      <Text style={S.wishSeason}>Mùa đẹp: {place.season}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      <TouchableOpacity style={S.wishAction} onPress={() => router.push('/travel/itinerary')}>
                        <Text style={S.wishActionTxt}>Lập lịch trình</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[S.wishAction, { backgroundColor: '#DC2626' }]}>
                        <Text style={S.wishActionTxt}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ITINERARIES TAB */}
          {activeTab === 'itineraries' && (
            <View style={{ padding: 16, gap: 12 }}>
              {[
                { title: 'Mù Cang Chải 3N2Đ', date: '15-17/11/2024', status: 'Đã hoàn thành', color: '#10B981' },
                { title: 'Phú Quốc Summer 4N3Đ', date: '20-23/7/2024', status: 'Đã hoàn thành', color: '#10B981' },
                { title: 'Hà Giang Loop 5N4Đ', date: 'Tháng 4/2025', status: 'Đang lên kế hoạch', color: '#F59E0B' },
              ].map((it, i) => (
                <TouchableOpacity key={i} style={S.itineCard} onPress={() => router.push('/travel/itinerary')}>
                  <View style={[S.itineStatus, { backgroundColor: it.color + '22' }]}>
                    <View style={[S.itineDot, { backgroundColor: it.color }]} />
                    <Text style={[S.itineStatusTxt, { color: it.color }]}>{it.status}</Text>
                  </View>
                  <Text style={S.itineTitle}>{it.title}</Text>
                  <Text style={S.itineDate}>{it.date}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#334155" style={{ position: 'absolute', right: 16, top: '50%' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
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
  settingsBtn: { padding: 6 },

  profileHero: { alignItems: 'center', padding: 20, paddingTop: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#0EA5E9' },
  userName: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 12 },
  userBio: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  followRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 24 },
  followItem: { alignItems: 'center' },
  followNum: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  followLabel: { color: '#64748B', fontSize: 11, marginTop: 2 },
  followDivider: { width: 1, height: 32, backgroundColor: '#334155' },
  editProfileBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#0EA5E9' },
  editProfileTxt: { color: '#0EA5E9', fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  statCard: { width: '47%', borderRadius: 16, overflow: 'hidden' },
  statCardInner: { padding: 16, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { color: '#64748B', fontSize: 12 },

  mapPreview: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  mapPreviewBg: { padding: 20 },
  mapPreviewTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  rankBadge: { backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#F59E0B' },
  rankTxt: { color: '#F59E0B', fontSize: 11, fontWeight: '700' },
  provinceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  provinceChipTxt: { color: '#10B981', fontSize: 11, fontWeight: '600', marginLeft: 4 },
  countriesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  countriesLabel: { color: '#94A3B8', fontSize: 12 },
  countryChip: { backgroundColor: 'rgba(14,165,233,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countryChipTxt: { color: '#0EA5E9', fontSize: 12, fontWeight: '600' },

  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 4, marginBottom: 8 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: '#1E293B' },
  tabBtnActive: { backgroundColor: 'rgba(14,165,233,0.15)', borderWidth: 1, borderColor: '#0EA5E9' },
  tabBtnLabel: { color: '#64748B', fontSize: 10, marginTop: 2 },
  tabBtnLabelActive: { color: '#0EA5E9', fontWeight: '600' },

  sectionTitle: { color: '#E2E8F0', fontSize: 15, fontWeight: '800', marginBottom: 12 },
  statRow: { backgroundColor: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 8 },
  statRowLabel: { color: '#64748B', fontSize: 12, marginBottom: 4 },
  statRowValue: { color: '#E2E8F0', fontWeight: '700', fontSize: 14 },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  badgeCard: { width: '30%', backgroundColor: '#1E293B', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#334155' },
  badgeCardLocked: { opacity: 0.6 },
  badgeName: { color: '#E2E8F0', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  badgeDesc: { color: '#64748B', fontSize: 9, textAlign: 'center', lineHeight: 13 },
  lockedBadge: { position: 'absolute', top: 8, right: 8 },

  wishCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  wishImg: { width: 110, height: 120, resizeMode: 'cover' },
  wishInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  wishName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  wishSeason: { color: '#F59E0B', fontSize: 12 },
  wishAction: { backgroundColor: '#0EA5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  wishActionTxt: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  itineCard: { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155' },
  itineStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  itineDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  itineStatusTxt: { fontSize: 11, fontWeight: '700' },
  itineTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  itineDate: { color: '#64748B', fontSize: 12, marginTop: 4 },
});

