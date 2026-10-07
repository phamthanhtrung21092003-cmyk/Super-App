import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Modal,
  FlatList,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFood } from '../../context/FoodContext';
import { useUser } from '../../context/UserContext';
import {
  foodService,
  SearchRestaurantItem,
  SearchMenuItem,
  FoodSearchSort,
} from '../../services/foodService';

const SEARCH_HISTORY_KEY = '@vlife_food_search_history';
const MAX_HISTORY_ITEMS = 10;

const TRENDING_KEYWORDS = [
  'Cơm tấm',
  'Trà sữa',
  'Phở bò',
  'Pizza',
  'Bún chả',
  'Gà rán',
  'Bánh mì',
  'Cà phê',
  'Món chay',
  'Hải sản',
];

const SORT_OPTIONS: { label: string; value: FoodSearchSort; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Phù hợp nhất', value: 'RELEVANCE', icon: 'sparkles-outline' },
  { label: 'Đánh giá cao nhất', value: 'RATING', icon: 'star-outline' },
  { label: 'Gần tôi nhất', value: 'DISTANCE', icon: 'navigate-outline' },
  { label: 'Giá thấp đến cao', value: 'PRICE_ASC', icon: 'trending-up-outline' },
  { label: 'Giá cao đến thấp', value: 'PRICE_DESC', icon: 'trending-down-outline' },
  { label: 'Nhiều đánh giá nhất', value: 'REVIEW_COUNT', icon: 'chatbubbles-outline' },
];

const PRICE_RANGES = [
  { label: 'Tất cả giá', min: undefined, max: undefined },
  { label: 'Dưới 50k', min: 0, max: 50000 },
  { label: '50k - 100k', min: 50000, max: 100000 },
  { label: '100k - 200k', min: 100000, max: 200000 },
  { label: 'Trên 200k', min: 200000, max: undefined },
];

export default function FoodSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const { customerCoords } = useFood();
  const { addresses } = useUser();
  const defaultAddress = addresses?.find((a) => a.isDefault) || addresses?.[0];
  const userLat = customerCoords?.lat ?? defaultAddress?.latitude ?? 21.0055;
  const userLng = customerCoords?.lng ?? defaultAddress?.longitude ?? 105.8450;

  // Search input state
  const [searchText, setSearchText] = useState(params.q || params.category || '');
  const [submittedQuery, setSubmittedQuery] = useState(params.q || params.category || '');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Results state
  const [activeTab, setActiveTab] = useState<'all' | 'restaurants' | 'dishes'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<SearchRestaurantItem[]>([]);
  const [menuItems, setMenuItems] = useState<SearchMenuItem[]>([]);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [totalMenuItems, setTotalMenuItems] = useState(0);

  // Filters state
  const [filterIsOpen, setFilterIsOpen] = useState(false);
  const [filterMinRating, setFilterMinRating] = useState<number | undefined>(undefined);
  const [filterHasVoucher, setFilterHasVoucher] = useState(false);
  const [filterHasFreeShip, setFilterHasFreeShip] = useState(false);
  const [filterMaxDistance, setFilterMaxDistance] = useState<number | undefined>(undefined);
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0);
  const [currentSort, setCurrentSort] = useState<FoodSearchSort>('RELEVANCE');

  // Modals state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // Load search history
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (stored) {
          setSearchHistory(JSON.parse(stored));
        }
      } catch (err) {
        console.log('Lỗi tải lịch sử tìm kiếm:', err);
      }
    })();
  }, []);

  // Save query to history
  const saveSearchQuery = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...searchHistory.filter((item) => item !== trimmed)].slice(
        0,
        MAX_HISTORY_ITEMS
      );
      setSearchHistory(updated);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.log('Lỗi lưu lịch sử tìm kiếm:', err);
    }
  };

  const removeHistoryItem = async (itemToRemove: string) => {
    try {
      const updated = searchHistory.filter((item) => item !== itemToRemove);
      setSearchHistory(updated);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.log('Lỗi xóa mục tìm kiếm:', err);
    }
  };

  const clearAllHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (err) {
      console.log('Lỗi xóa toàn bộ lịch sử:', err);
    }
  };

  // Execute Search API call
  const performSearch = useCallback(
    async (queryText: string) => {
      setIsLoading(true);
      try {
        const priceConfig = PRICE_RANGES[selectedPriceRangeIndex];
        const res = await foodService.searchCombined({
          q: queryText.trim(),
          minPrice: priceConfig.min,
          maxPrice: priceConfig.max,
          minRating: filterMinRating,
          maxDistance: filterMaxDistance,
          isOpen: filterIsOpen ? true : undefined,
          hasVoucher: filterHasVoucher ? true : undefined,
          hasFreeShip: filterHasFreeShip ? true : undefined,
          sort: currentSort,
          latitude: userLat,
          longitude: userLng,
          limit: 20,
        });

        if (res) {
          setRestaurants(res.restaurants?.items || []);
          setTotalRestaurants(res.restaurants?.total || 0);
          setMenuItems(res.menuItems?.items || []);
          setTotalMenuItems(res.menuItems?.total || 0);
        }
      } catch (err) {
        console.log('Lỗi thực hiện tìm kiếm:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      filterIsOpen,
      filterMinRating,
      filterHasVoucher,
      filterHasFreeShip,
      filterMaxDistance,
      selectedPriceRangeIndex,
      currentSort,
      userLat,
      userLng,
    ]
  );

  // Trigger search on submit or filter change
  const handleSubmitSearch = (customQuery?: string) => {
    const q = customQuery !== undefined ? customQuery : searchText;
    const trimmed = q.trim();
    setSearchText(trimmed);
    setSubmittedQuery(trimmed);
    Keyboard.dismiss();
    if (trimmed) {
      saveSearchQuery(trimmed);
      performSearch(trimmed);
    }
  };

  // Re-search when filters change if there is a submitted query
  useEffect(() => {
    if (submittedQuery) {
      performSearch(submittedQuery);
    }
  }, [
    filterIsOpen,
    filterMinRating,
    filterHasVoucher,
    filterHasFreeShip,
    filterMaxDistance,
    selectedPriceRangeIndex,
    currentSort,
    performSearch,
  ]);

  // Initial search if query param provided
  useEffect(() => {
    if (params.q || params.category) {
      const q = (params.q || params.category || '').trim();
      setSearchText(q);
      setSubmittedQuery(q);
      saveSearchQuery(q);
      performSearch(q);
    }
  }, []);

  const resetFilters = () => {
    setFilterIsOpen(false);
    setFilterMinRating(undefined);
    setFilterHasVoucher(false);
    setFilterHasFreeShip(false);
    setFilterMaxDistance(undefined);
    setSelectedPriceRangeIndex(0);
    setCurrentSort('RELEVANCE');
  };

  const hasActiveFilters =
    filterIsOpen ||
    filterMinRating !== undefined ||
    filterHasVoucher ||
    filterHasFreeShip ||
    filterMaxDistance !== undefined ||
    selectedPriceRangeIndex !== 0 ||
    currentSort !== 'RELEVANCE';

  // Render restaurant item
  const renderRestaurantCard = (item: SearchRestaurantItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.restCard}
      activeOpacity={0.88}
      onPress={() => router.push(`/food/restaurant/${item.id}` as any)}
    >
      <Image
        source={{
          uri:
            item.avatar ||
            item.coverImage ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
        }}
        style={styles.restImage}
      />
      <View style={styles.restDetails}>
        <View style={styles.restHeaderRow}>
          <Text style={styles.restName} numberOfLines={1}>
            {item.name}
          </Text>
          <View
            style={[
              styles.openBadge,
              { backgroundColor: item.isOpen ? '#DCFCE7' : '#FEE2E2' },
            ]}
          >
            <Text
              style={[
                styles.openBadgeText,
                { color: item.isOpen ? '#16A34A' : '#EF4444' },
              ]}
            >
              {item.isOpen ? 'Mở cửa' : 'Đóng cửa'}
            </Text>
          </View>
        </View>

        <Text style={styles.restAddress} numberOfLines={1}>
          {item.address}
        </Text>

        <View style={styles.restMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.metaRating}>
              {item.rating?.toFixed(1) || '5.0'} ({item.totalReviews || 0})
            </Text>
          </View>
          {item.distanceKm !== null && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaDistance}>{item.distanceKm} km</Text>
            </>
          )}
          {item.estimatedDeliveryTime && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaTime}>{item.estimatedDeliveryTime}</Text>
            </>
          )}
        </View>

        <View style={styles.tagRow}>
          {item.hasFreeShip && (
            <View style={styles.badgeFreeShip}>
              <Ionicons name="flash" size={11} color="#059669" />
              <Text style={styles.badgeFreeShipText}>Freeship</Text>
            </View>
          )}
          {item.hasVoucher && (
            <View style={styles.badgeVoucher}>
              <Ionicons name="pricetag" size={11} color="#DC2626" />
              <Text style={styles.badgeVoucherText}>Mã giảm giá</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render dish item
  const renderDishCard = (dish: SearchMenuItem) => (
    <TouchableOpacity
      key={dish.id}
      style={styles.dishCard}
      activeOpacity={0.88}
      onPress={() => router.push(`/food/restaurant/${dish.restaurantId}` as any)}
    >
      <Image
        source={{
          uri:
            dish.image ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
        }}
        style={styles.dishImage}
      />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName} numberOfLines={1}>
          {dish.name}
        </Text>
        {dish.description ? (
          <Text style={styles.dishDesc} numberOfLines={1}>
            {dish.description}
          </Text>
        ) : null}

        <View style={styles.dishRestRow}>
          <Ionicons name="storefront-outline" size={12} color="#64748B" />
          <Text style={styles.dishRestName} numberOfLines={1}>
            {dish.restaurantName}
          </Text>
        </View>

        <View style={styles.dishBottomRow}>
          <Text style={styles.dishPrice}>{dish.price?.toLocaleString('vi-VN')}đ</Text>
          <View style={styles.dishRating}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.dishRatingText}>
              {dish.rating > 0 ? dish.rating.toFixed(1) : '5.0'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

        {/* Top Search Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/food' as any))}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.searchInputWrap}>
            <Ionicons name="search" size={18} color="#64748B" style={{ marginLeft: 10 }} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Tìm quán ăn, món ngon, trà sữa..."
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => handleSubmitSearch()}
              returnKeyType="search"
              autoFocus={!params.q && !params.category}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setSearchText('');
                  inputRef.current?.focus();
                }}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchActionBtn}
            onPress={() => handleSubmitSearch()}
          >
            <Text style={styles.searchActionText}>Tìm</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Filter Horizontal Scroll */}
        {submittedQuery.length > 0 && (
          <View style={styles.filterBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {/* Nút Sort Picker */}
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  currentSort !== 'RELEVANCE' && styles.filterChipActive,
                ]}
                onPress={() => setShowSortModal(true)}
              >
                <Ionicons
                  name="swap-vertical"
                  size={14}
                  color={currentSort !== 'RELEVANCE' ? '#FFF' : '#475569'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    currentSort !== 'RELEVANCE' && styles.filterChipTextActive,
                  ]}
                >
                  {SORT_OPTIONS.find((s) => s.value === currentSort)?.label || 'Sắp xếp'}
                </Text>
              </TouchableOpacity>

              {/* Nút Lọc nâng cao */}
              <TouchableOpacity
                style={[styles.filterChip, hasActiveFilters && styles.filterChipActive]}
                onPress={() => setShowFilterModal(true)}
              >
                <Ionicons
                  name="options-outline"
                  size={14}
                  color={hasActiveFilters ? '#FFF' : '#475569'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    hasActiveFilters && styles.filterChipTextActive,
                  ]}
                >
                  Bộ lọc
                </Text>
              </TouchableOpacity>

              {/* Toggle Đang mở cửa */}
              <TouchableOpacity
                style={[styles.filterChip, filterIsOpen && styles.filterChipActive]}
                onPress={() => setFilterIsOpen(!filterIsOpen)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterIsOpen && styles.filterChipTextActive,
                  ]}
                >
                  Đang mở cửa
                </Text>
              </TouchableOpacity>

              {/* Toggle 4.5+ sao */}
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterMinRating === 4.5 && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilterMinRating(filterMinRating === 4.5 ? undefined : 4.5)
                }
              >
                <Ionicons
                  name="star"
                  size={12}
                  color={filterMinRating === 4.5 ? '#FFF' : '#F59E0B'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    filterMinRating === 4.5 && styles.filterChipTextActive,
                  ]}
                >
                  4.5+ sao
                </Text>
              </TouchableOpacity>

              {/* Toggle Freeship */}
              <TouchableOpacity
                style={[styles.filterChip, filterHasFreeShip && styles.filterChipActive]}
                onPress={() => setFilterHasFreeShip(!filterHasFreeShip)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterHasFreeShip && styles.filterChipTextActive,
                  ]}
                >
                  Freeship
                </Text>
              </TouchableOpacity>

              {/* Toggle Có Voucher */}
              <TouchableOpacity
                style={[styles.filterChip, filterHasVoucher && styles.filterChipActive]}
                onPress={() => setFilterHasVoucher(!filterHasVoucher)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterHasVoucher && styles.filterChipTextActive,
                  ]}
                >
                  Có Voucher
                </Text>
              </TouchableOpacity>

              {/* Toggle Gần tôi (<3km) */}
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterMaxDistance === 3 && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilterMaxDistance(filterMaxDistance === 3 ? undefined : 3)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterMaxDistance === 3 && styles.filterChipTextActive,
                  ]}
                >
                  Gần tôi (≤3km)
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Khi CHƯA tìm kiếm: Hiển thị Lịch sử & Trending Keywords */}
        {!submittedQuery ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.idleContainer}
          >
            {/* Lịch sử tìm kiếm gần đây */}
            {searchHistory.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderTitleWrap}>
                    <Ionicons name="time-outline" size={18} color="#64748B" />
                    <Text style={styles.sectionHeading}>Tìm kiếm gần đây</Text>
                  </View>
                  <TouchableOpacity onPress={clearAllHistory}>
                    <Text style={styles.clearAllText}>Xóa tất cả</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tagWrap}>
                  {searchHistory.map((item, index) => (
                    <View key={`${item}-${index}`} style={styles.historyChip}>
                      <TouchableOpacity
                        style={styles.historyTextTouch}
                        onPress={() => handleSubmitSearch(item)}
                      >
                        <Text style={styles.historyChipText}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.historyRemoveBtn}
                        onPress={() => removeHistoryItem(item)}
                      >
                        <Ionicons name="close" size={14} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Gợi ý món ngon thịnh hành */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderTitleWrap}>
                <Ionicons name="flame" size={18} color="#F97316" />
                <Text style={styles.sectionHeading}>Từ khóa thịnh hành</Text>
              </View>

              <View style={styles.tagWrap}>
                {TRENDING_KEYWORDS.map((kw) => (
                  <TouchableOpacity
                    key={kw}
                    style={styles.trendingChip}
                    onPress={() => handleSubmitSearch(kw)}
                  >
                    <Ionicons name="trending-up" size={13} color="#F97316" />
                    <Text style={styles.trendingChipText}>{kw}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          /* Khi ĐÃ tìm kiếm: Hiển thị Kết quả với Tabs */
          <View style={{ flex: 1 }}>
            {/* Result Tabs */}
            <View style={styles.tabsHeader}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
                onPress={() => setActiveTab('all')}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'all' && styles.tabBtnTextActive,
                  ]}
                >
                  Tất cả ({totalRestaurants + totalMenuItems})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'restaurants' && styles.tabBtnActive,
                ]}
                onPress={() => setActiveTab('restaurants')}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'restaurants' && styles.tabBtnTextActive,
                  ]}
                >
                  Nhà hàng ({totalRestaurants})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'dishes' && styles.tabBtnActive,
                ]}
                onPress={() => setActiveTab('dishes')}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'dishes' && styles.tabBtnTextActive,
                  ]}
                >
                  Món ăn ({totalMenuItems})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content List */}
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={accentColor} />
                <Text style={styles.loadingText}>Đang tìm kiếm món ngon cho bạn...</Text>
              </View>
            ) : totalRestaurants === 0 && totalMenuItems === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={60} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Không tìm thấy kết quả nào</Text>
                <Text style={styles.emptySubtitle}>
                  Không có quán ăn hoặc món nào khớp với &quot;{submittedQuery}&quot;. Thử từ
                  khóa khác hoặc xóa bộ lọc xem sao nhé!
                </Text>
                {hasActiveFilters && (
                  <TouchableOpacity style={styles.resetFilterBtn} onPress={resetFilters}>
                    <Ionicons name="refresh" size={16} color="#FFF" />
                    <Text style={styles.resetFilterText}>Xóa tất cả bộ lọc</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsScroll}
              >
                {/* TAB: TẤT CẢ */}
                {activeTab === 'all' && (
                  <>
                    {restaurants.length > 0 && (
                      <View style={styles.resultSection}>
                        <View style={styles.resultSectionHeader}>
                          <Text style={styles.resultSectionTitle}>
                            Nhà hàng ({totalRestaurants})
                          </Text>
                          {restaurants.length > 3 && (
                            <TouchableOpacity onPress={() => setActiveTab('restaurants')}>
                              <Text style={styles.seeMoreText}>Xem tất cả quán</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        {restaurants.slice(0, 4).map(renderRestaurantCard)}
                      </View>
                    )}

                    {menuItems.length > 0 && (
                      <View style={styles.resultSection}>
                        <View style={styles.resultSectionHeader}>
                          <Text style={styles.resultSectionTitle}>
                            Món ăn ({totalMenuItems})
                          </Text>
                          {menuItems.length > 4 && (
                            <TouchableOpacity onPress={() => setActiveTab('dishes')}>
                              <Text style={styles.seeMoreText}>Xem tất cả món</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        {menuItems.slice(0, 6).map(renderDishCard)}
                      </View>
                    )}
                  </>
                )}

                {/* TAB: NHÀ HÀNG */}
                {activeTab === 'restaurants' && (
                  <View style={styles.resultSection}>
                    {restaurants.length === 0 ? (
                      <View style={styles.emptySubBox}>
                        <Text style={styles.emptySubtitle}>
                          Không có nhà hàng nào khớp với bộ lọc
                        </Text>
                      </View>
                    ) : (
                      restaurants.map(renderRestaurantCard)
                    )}
                  </View>
                )}

                {/* TAB: MÓN ĂN */}
                {activeTab === 'dishes' && (
                  <View style={styles.resultSection}>
                    {menuItems.length === 0 ? (
                      <View style={styles.emptySubBox}>
                        <Text style={styles.emptySubtitle}>
                          Không có món ăn nào khớp với bộ lọc
                        </Text>
                      </View>
                    ) : (
                      menuItems.map(renderDishCard)
                    )}
                  </View>
                )}

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        )}

        {/* MODAL SẮP XẾP (SORT) */}
        <Modal
          visible={showSortModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSortModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          >
            <View style={styles.sortModalContent}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalHeaderTitle}>Sắp xếp theo</Text>
                <TouchableOpacity onPress={() => setShowSortModal(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.sortOptionItem,
                    currentSort === opt.value && styles.sortOptionItemActive,
                  ]}
                  onPress={() => {
                    setCurrentSort(opt.value);
                    setShowSortModal(false);
                  }}
                >
                  <View style={styles.sortOptionLeft}>
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={currentSort === opt.value ? '#F97316' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.sortOptionLabel,
                        currentSort === opt.value && styles.sortOptionLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {currentSort === opt.value && (
                    <Ionicons name="checkmark-circle" size={20} color="#F97316" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* MODAL BỘ LỌC NÂNG CAO (FILTER) */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowFilterModal(false)}
            />
            <View style={styles.filterModalContent}>
              <View style={styles.dragIndicator} />
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalHeaderTitle}>Bộ lọc nâng cao</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* Khoảng giá */}
                <Text style={styles.filterSectionTitle}>Khoảng giá món ăn</Text>
                <View style={styles.priceGrid}>
                  {PRICE_RANGES.map((pr, idx) => (
                    <TouchableOpacity
                      key={pr.label}
                      style={[
                        styles.priceChip,
                        selectedPriceRangeIndex === idx && styles.priceChipActive,
                      ]}
                      onPress={() => setSelectedPriceRangeIndex(idx)}
                    >
                      <Text
                        style={[
                          styles.priceChipText,
                          selectedPriceRangeIndex === idx && styles.priceChipTextActive,
                        ]}
                      >
                        {pr.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Đánh giá sao */}
                <Text style={styles.filterSectionTitle}>Đánh giá sao tối thiểu</Text>
                <View style={styles.ratingGrid}>
                  {[undefined, 4.5, 4.0, 3.5].map((val) => (
                    <TouchableOpacity
                      key={val ? `${val}sao` : 'tatca'}
                      style={[
                        styles.ratingChip,
                        filterMinRating === val && styles.ratingChipActive,
                      ]}
                      onPress={() => setFilterMinRating(val)}
                    >
                      <Text
                        style={[
                          styles.ratingChipText,
                          filterMinRating === val && styles.ratingChipTextActive,
                        ]}
                      >
                        {val ? `Từ ${val} ★` : 'Tất cả'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Khoảng cách tối đa */}
                <Text style={styles.filterSectionTitle}>Khoảng cách giao hàng</Text>
                <View style={styles.ratingGrid}>
                  {[undefined, 1, 3, 5, 10].map((km) => (
                    <TouchableOpacity
                      key={km ? `${km}km` : 'allKm'}
                      style={[
                        styles.ratingChip,
                        filterMaxDistance === km && styles.ratingChipActive,
                      ]}
                      onPress={() => setFilterMaxDistance(km)}
                    >
                      <Text
                        style={[
                          styles.ratingChipText,
                          filterMaxDistance === km && styles.ratingChipTextActive,
                        ]}
                      >
                        {km ? `≤ ${km} km` : 'Không giới hạn'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.resetModalBtn} onPress={resetFilters}>
                  <Text style={styles.resetModalText}>Đặt lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyModalBtn}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.applyModalText}>Áp dụng bộ lọc</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  desktopFrame: {
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  backBtn: {
    padding: 6,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    height: 40,
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  clearBtn: {
    padding: 4,
  },
  searchActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F97316',
    borderRadius: 8,
  },
  searchActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#F97316',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  idleContainer: {
    padding: 16,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearAllText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
  },
  historyTextTouch: {
    marginRight: 4,
  },
  historyChipText: {
    fontSize: 13,
    color: '#334155',
  },
  historyRemoveBtn: {
    padding: 2,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  trendingChipText: {
    fontSize: 13,
    color: '#C2410C',
    fontWeight: '600',
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#F97316',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptySubBox: {
    padding: 24,
    alignItems: 'center',
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    gap: 6,
  },
  resetFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultsScroll: {
    padding: 12,
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeMoreText: {
    fontSize: 13,
    color: '#F97316',
    fontWeight: '600',
  },
  restCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  restImage: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  restDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  restHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  restName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  openBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  restAddress: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  restMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaRating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  metaDot: {
    fontSize: 12,
    color: '#94A3B8',
  },
  metaDistance: {
    fontSize: 12,
    color: '#475569',
  },
  metaTime: {
    fontSize: 12,
    color: '#475569',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  badgeFreeShip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  badgeFreeShipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  badgeVoucher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  badgeVoucherText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  dishImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  dishInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dishName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  dishDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dishRestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dishRestName: {
    fontSize: 12,
    color: '#64748B',
  },
  dishBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
  },
  dishRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dishRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  sortModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sortOptionItemActive: {
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortOptionLabel: {
    fontSize: 14,
    color: '#334155',
  },
  sortOptionLabelActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  priceChipActive: {
    backgroundColor: '#F97316',
  },
  priceChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  priceChipTextActive: {
    color: '#FFFFFF',
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  ratingChipActive: {
    backgroundColor: '#F97316',
  },
  ratingChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  ratingChipTextActive: {
    color: '#FFFFFF',
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  resetModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  applyModalBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F97316',
    alignItems: 'center',
  },
  applyModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
