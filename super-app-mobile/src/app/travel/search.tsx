import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Keyboard,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { TravelBottomNav } from '../../components/travel/TravelBottomNav';
import {
  VERIFIED_DESTINATIONS,
  VERIFIED_HOTELS,
  VERIFIED_HOMESTAYS,
  VERIFIED_FOODS,
  VERIFIED_CARS,
} from '../../modules/travel/data/verifiedDestinations';

const RECENT_SEARCHES = ['Đà Nẵng', 'Đà Lạt', 'Phú Quốc', 'Vịnh Hạ Long', 'Sa Pa'];

const FILTER_TABS = ['Tất cả', 'Địa điểm', 'Khách sạn', 'Homestay', 'Ẩm thực', 'Thuê xe'];

export default function TravelSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { width } = Dimensions.get('window');
  const isDesktop = Platform.OS === 'web' && width > 768;

  const headerTopPadding = Platform.OS === 'android'
    ? Math.max((StatusBar.currentHeight ?? 0) + 8, insets.top + 6, 40)
    : Math.max(insets.top, 12);

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [recentList, setRecentList] = useState(RECENT_SEARCHES);
  const inputRef = useRef<TextInput>(null);

  const clearHistory = () => {
    setRecentList([]);
  };

  const handleRecentPress = (item: string) => {
    setQuery(item);
    Keyboard.dismiss();
  };

  const destinationsFiltered = VERIFIED_DESTINATIONS.filter(d =>
    !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.province.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

        {/* ── TOP HEADER & SEARCH INPUT ── */}
        <View style={[styles.header, { paddingTop: headerTopPadding }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.canGoBack() ? router.back() : router.replace('/travel')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tìm kiếm du lịch</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Bạn muốn khám phá địa điểm nào?"
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.voiceBtn}
              onPress={() => setQuery('Đà Nẵng')}
              activeOpacity={0.8}
            >
              <Ionicons name="mic" size={17} color="#0284C7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── FILTER CATEGORY PILLS ── */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_TABS.map(tab => {
              const isActive = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActiveFilter(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── MAIN CONTENT SCROLL ── */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Recent Searches (shown when no query) */}
          {query.length === 0 && recentList.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
                <TouchableOpacity onPress={clearHistory} activeOpacity={0.7}>
                  <Text style={styles.clearHistoryText}>Xóa tất cả</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentWrap}>
                {recentList.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.recentChip}
                    onPress={() => handleRecentPress(item)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.recentChipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── POPULAR & VERIFIED DESTINATIONS ── */}
          {(activeFilter === 'Tất cả' || activeFilter === 'Địa điểm') && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {query ? `Kết quả địa điểm (${destinationsFiltered.length})` : 'Địa điểm nổi bật'}
                </Text>
              </View>

              <View style={styles.destList}>
                {destinationsFiltered.map(dest => (
                  <TouchableOpacity
                    key={dest.id}
                    style={styles.destCard}
                    activeOpacity={0.88}
                    onPress={() => router.push((`/travel/destination?id=${dest.numericId}`) as any)}
                  >
                    <Image source={{ uri: dest.heroImage.url }} style={styles.destCardImg} />
                    <View style={styles.destCardBadge}>
                      <Text style={styles.destCardBadgeText}>{dest.popularBadge || 'XÁC THỰC'}</Text>
                    </View>
                    <View style={styles.destCardBody}>
                      <View style={styles.destCardTopRow}>
                        <Text style={styles.destCardName} numberOfLines={1}>{dest.name}</Text>
                        <View style={styles.ratingBox}>
                          <Ionicons name="star" size={11} color="#F59E0B" />
                          <Text style={styles.ratingBoxText}>{dest.rating}</Text>
                        </View>
                      </View>
                      <View style={styles.destLocRow}>
                        <Ionicons name="location-outline" size={12} color="#64748B" />
                        <Text style={styles.destLocText}>{dest.province}</Text>
                      </View>
                      <Text style={styles.destTagline} numberOfLines={2}>{dest.tagline}</Text>
                      <View style={styles.destBottomRow}>
                        <View>
                          <Text style={styles.destPriceLabel}>Giá vé từ</Text>
                          <Text style={styles.destPriceVal}>{dest.priceFrom}</Text>
                        </View>
                        <View style={styles.exploreBtn}>
                          <Text style={styles.exploreBtnText}>Khám phá</Text>
                          <Ionicons name="chevron-forward" size={13} color="#FFFFFF" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── VERIFIED HOTELS ── */}
          {(activeFilter === 'Tất cả' || activeFilter === 'Khách sạn') && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Khách sạn & Resort cao cấp</Text>
                <TouchableOpacity onPress={() => router.push('/travel/hotel' as any)}>
                  <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
                </TouchableOpacity>
              </View>
              {VERIFIED_HOTELS.map(hotel => (
                <TouchableOpacity
                  key={hotel.id}
                  style={styles.serviceRowCard}
                  activeOpacity={0.85}
                  onPress={() => router.push('/travel/hotel' as any)}
                >
                  <Image source={{ uri: hotel.image.url }} style={styles.serviceRowImg} />
                  <View style={styles.serviceRowBody}>
                    <Text style={styles.serviceRowName} numberOfLines={1}>{hotel.name}</Text>
                    <View style={styles.destLocRow}>
                      <Ionicons name="location-outline" size={12} color="#64748B" />
                      <Text style={styles.destLocText} numberOfLines={1}>{hotel.location}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text style={styles.ratingText}>{hotel.rating}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.reviewCount}>({hotel.reviews} đánh giá)</Text>
                    </View>
                    <Text style={styles.servicePrice}>{hotel.priceFormatted}/đêm</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <TravelBottomNav activeTab="search" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 390,
    maxHeight: 844,
    aspectRatio: 390 / 844,
    borderWidth: 10,
    borderColor: '#1E293B',
    borderRadius: 44,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  voiceBtn: {
    backgroundColor: '#EFF6FF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  clearHistoryText: {
    fontSize: 12.5,
    color: '#0284C7',
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '600',
  },
  recentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentChipText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
  },
  destList: {
    gap: 14,
  },
  destCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  destCardImg: {
    width: '100%',
    height: 150,
    backgroundColor: '#E2E8F0',
  },
  destCardBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(2, 132, 199, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  destCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  destCardBody: {
    padding: 14,
  },
  destCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  destCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  ratingBoxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  destLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  destLocText: {
    fontSize: 12,
    color: '#64748B',
  },
  destTagline: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 12,
  },
  destBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 10,
  },
  destPriceLabel: {
    fontSize: 10.5,
    color: '#64748B',
  },
  destPriceVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
  },
  exploreBtn: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 2,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  serviceRowCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  serviceRowImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  serviceRowBody: {
    flex: 1,
    marginLeft: 12,
  },
  serviceRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  dot: {
    color: '#CBD5E1',
    marginHorizontal: 3,
  },
  reviewCount: {
    fontSize: 11,
    color: '#64748B',
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
});
