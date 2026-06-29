import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

// ─── DATA ────────────────────────────────────────────────────────────────────

const BANNERS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600',
    title: 'Khám phá Vịnh Hạ Long',
    tag: 'SALE 30%',
    tagColor: '#F97316',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?w=600',
    title: 'Phú Quốc – Thiên đường biển',
    tag: 'SALE 30%',
    tagColor: '#0EA5E9',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?w=600',
    title: 'Đà Lạt mộng mơ',
    tag: 'HOT',
    tagColor: '#14B8A6',
  },
];

const CATEGORIES = [
  { id: '1', icon: '✈️', label: 'Vé máy bay', route: '/flights' },
  { id: '2', icon: '🏨', label: 'Khách sạn', route: '/hotels' },
  { id: '3', icon: '🏠', label: 'Homestay', route: null },
  { id: '4', icon: '🗺️', label: 'Tour', route: '/travel/booking' },
  { id: '5', icon: '🚗', label: 'Thuê xe', route: null },
  { id: '6', icon: '⛺', label: 'Camping', route: null },
  { id: '7', icon: '🍜', label: 'Ẩm thực', route: null },
  { id: '8', icon: '📸', label: 'Check-in', route: '/travel/community' },
];

interface SeasonItem {
  emoji: string;
  title: string;
  desc: string;
  period: string;
  months: number[];
}

const SEASON_LIST: SeasonItem[] = [
  {
    emoji: '🌸',
    title: 'Mộc Châu – Hoa mận trắng nở rộ',
    desc: 'Những rừng hoa mận trắng tinh khiết phủ đầy núi đồi Mộc Châu, tạo nên cảnh sắc thiên nhiên huyền ảo.',
    period: 'Tháng 1–2',
    months: [1, 2],
  },
  {
    emoji: '🌺',
    title: 'Hà Giang – Hoa tam giác mạch',
    desc: 'Cao nguyên đá Đồng Văn rực rỡ với thảm hoa tam giác mạch tím hồng trải dài tít tắp.',
    period: 'Tháng 3–4',
    months: [3, 4],
  },
  {
    emoji: '🌿',
    title: 'Sapa – Ruộng bậc thang mùa nước đổ',
    desc: 'Mùa nước đổ tháng 5, những thửa ruộng bậc thang lấp lánh như gương phản chiếu bầu trời.',
    period: 'Tháng 5',
    months: [5],
  },
  {
    emoji: '🌊',
    title: 'Phú Quốc – Biển trong xanh tuyệt đẹp',
    desc: 'Mùa hè là thời điểm vàng để tắm biển Phú Quốc với làn nước trong vắt như pha lê.',
    period: 'Tháng 6–8',
    months: [6, 7, 8],
  },
  {
    emoji: '🌾',
    title: 'Mù Cang Chải – Lúa chín vàng óng',
    desc: 'Mùa vàng tháng 9-10 khiến Mù Cang Chải như một bức tranh sơn dầu khổng lồ của thiên nhiên.',
    period: 'Tháng 9–10',
    months: [9, 10],
  },
  {
    emoji: '🌼',
    title: 'Đà Lạt – Hoa dã quỳ vàng rực',
    desc: 'Những con đường ở Đà Lạt tràn ngập màu vàng rực rỡ của hoa dã quỳ vào độ cuối thu.',
    period: 'Tháng 11–12',
    months: [11, 12],
  },
];

const DESTINATIONS = [
  {
    id: '1',
    name: 'Vịnh Hạ Long',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
    rating: 4.9,
    price: '2.500.000đ',
    distance: '180km',
    bestTime: 'Tháng 10–4',
    location: 'Quảng Ninh',
  },
  {
    id: '2',
    name: 'Hội An',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
    rating: 4.8,
    price: '1.800.000đ',
    distance: '860km',
    bestTime: 'Quanh năm',
    location: 'Quảng Nam',
  },
  {
    id: '3',
    name: 'Sapa',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    rating: 4.7,
    price: '2.000.000đ',
    distance: '320km',
    bestTime: 'Tháng 9–11',
    location: 'Lào Cai',
  },
  {
    id: '4',
    name: 'Phú Quốc',
    image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?w=400',
    rating: 4.9,
    price: '3.500.000đ',
    distance: 'Bay 1h30',
    bestTime: 'Tháng 11–4',
    location: 'Kiên Giang',
  },
  {
    id: '5',
    name: 'Đà Lạt',
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?w=400',
    rating: 4.6,
    price: '1.500.000đ',
    distance: '300km',
    bestTime: 'Quanh năm',
    location: 'Lâm Đồng',
  },
];

const TRENDING = [
  {
    id: '1',
    name: 'Hoàng Su Phì',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
    views: '12.4K lượt xem',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Tú Lệ',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300',
    views: '9.2K lượt xem',
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Hồ Tà Đùng',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    views: '8.7K lượt xem',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Bản Giốc',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300',
    views: '15.1K lượt xem',
    rating: 4.8,
  },
  {
    id: '5',
    name: 'Ninh Bình',
    image: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?w=300',
    views: '22.3K lượt xem',
    rating: 4.9,
  },
];

const VIDEOS = [
  {
    id: '1',
    title: 'Khám phá Vịnh Hạ Long',
    thumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=300',
    views: '1.2M lượt xem',
    duration: '12:34',
  },
  {
    id: '2',
    title: 'Đi chợ đêm Hội An',
    thumbnail: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300',
    views: '876K lượt xem',
    duration: '8:21',
  },
  {
    id: '3',
    title: 'Trải nghiệm Sapa mùa lúa chín',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
    views: '654K lượt xem',
    duration: '15:07',
  },
  {
    id: '4',
    title: 'Đà Lạt vào mùa hoa',
    thumbnail: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?w=300',
    views: '934K lượt xem',
    duration: '10:45',
  },
];

// ─── HELPER ──────────────────────────────────────────────────────────────────
function getSeasonSuggestion(): SeasonItem {
  const month = new Date().getMonth() + 1;
  return SEASON_LIST.find(s => s.months.includes(month)) ?? SEASON_LIST[3];
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function TravelHomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [activeTab, setActiveTab] = useState(0);
  const [activeBanner, setActiveBanner] = useState(0);
  const fabPulse = useRef(new Animated.Value(1)).current;
  const bannerScrollRef = useRef<ScrollView>(null);
  const currentSeason = getSeasonSuggestion();

  // FAB pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(fabPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [fabPulse]);

  // Auto-scroll banner
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => {
        const next = (prev + 1) % BANNERS.length;
        bannerScrollRef.current?.scrollTo({ x: next * 292, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryPress = useCallback(
    (route: string | null, label: string) => {
      if (route) {
        router.push(route as any);
      } else {
        Alert.alert('🚧 Sắp ra mắt', `Tính năng "${label}" đang được phát triển!\nHãy quay lại sớm nhé 🙌`);
      }
    },
    [router]
  );

  const handleAIAssistant = () => {
    Alert.alert(
      '🤖 Trợ lý AI VN Travel',
      `Xin chào! Dựa vào tháng ${new Date().getMonth() + 1} hiện tại, tôi gợi ý:\n\n${currentSeason.emoji} ${currentSeason.title}\n\n${currentSeason.desc}\n\nBạn có muốn xem chi tiết hành trình không?`,
      [
        { text: 'Để sau', style: 'cancel' },
        { text: '🗺️ Lên kế hoạch ngay', onPress: () => router.push('/travel/itinerary' as any) },
      ]
    );
  };

  const BOTTOM_TABS = [
    { icon: 'compass' as const, label: 'Khám phá', route: null },
    { icon: 'search' as const, label: 'Tìm kiếm', route: '/travel/search' },
    { icon: 'calendar' as const, label: 'Lịch trình', route: '/travel/itinerary' },
    { icon: 'people' as const, label: 'Cộng đồng', route: '/travel/community' },
    { icon: 'person' as const, label: 'Hồ sơ', route: '/travel/profile' },
  ];

  // ── HEADER ─────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <LinearGradient
      colors={['#0F172A', '#0C4A6E', '#0E7490']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <TouchableOpacity style={styles.headerLeft} onPress={() => router.push('/travel/profile' as any)}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80' }}
          style={styles.headerAvatar}
        />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.headerGreeting}>Du lịch cùng</Text>
          <Text style={styles.headerName}>Nguyễn Lý ✨</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <LinearGradient
          colors={['#0EA5E9', '#14B8A6']}
          style={styles.logoGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.logoText}>VN Travel</Text>
        </LinearGradient>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => Alert.alert('🔔 Thông báo', 'Bạn có 3 thông báo mới!')}
        >
          <Ionicons name="notifications-outline" size={22} color="#FFF" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => Alert.alert('💬 Tin nhắn', 'Đang mở tin nhắn...')}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // ── SEARCH BAR ─────────────────────────────────────────────────────────────
  const renderSearchBar = () => (
    <LinearGradient colors={['#0C4A6E', '#0F172A']} style={styles.searchWrapper}>
      <TouchableOpacity
        style={styles.searchBox}
        activeOpacity={0.85}
        onPress={() => router.push('/travel/search' as any)}
      >
        <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          Bạn muốn khám phá đâu?
        </Text>
        <View style={styles.searchActions}>
          <TouchableOpacity
            style={styles.searchIconBtn}
            onPress={() => Alert.alert('🎙️ Tìm kiếm giọng nói', 'Hãy nói điểm đến bạn muốn đến...')}
          >
            <Ionicons name="mic" size={18} color="#0EA5E9" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchIconBtn}
            onPress={() => Alert.alert('📷 Tìm kiếm bằng ảnh', 'Chụp hoặc chọn ảnh địa điểm bạn muốn tới...')}
          >
            <Ionicons name="camera" size={18} color="#14B8A6" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );

  // ── BANNER SLIDER ──────────────────────────────────────────────────────────
  const renderBanners = () => (
    <View style={styles.section}>
      <ScrollView
        ref={bannerScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={292}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / 292);
          setActiveBanner(Math.max(0, Math.min(idx, BANNERS.length - 1)));
        }}
      >
        {BANNERS.map(banner => (
          <TouchableOpacity key={banner.id} style={styles.bannerCard} activeOpacity={0.9}>
            <Image source={{ uri: banner.image }} style={styles.bannerImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.80)']}
              style={styles.bannerGradient}
            >
              <View style={[styles.bannerTag, { backgroundColor: banner.tagColor }]}>
                <Text style={styles.bannerTagText}>{banner.tag}</Text>
              </View>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <View style={styles.bannerCta}>
                <Text style={styles.bannerCtaText}>Khám phá ngay</Text>
                <Ionicons name="arrow-forward" size={13} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dotsRow}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeBanner ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>
    </View>
  );

  // ── CATEGORIES ─────────────────────────────────────────────────────────────
  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Danh mục dịch vụ</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(cat.route, cat.label)}
            activeOpacity={0.75}
          >
            <LinearGradient
              colors={['rgba(14,165,233,0.20)', 'rgba(20,184,166,0.20)']}
              style={styles.categoryIconCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
            </LinearGradient>
            <Text style={styles.categoryLabel} numberOfLines={1}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ── AI SEASON ──────────────────────────────────────────────────────────────
  const renderAISeason = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { marginBottom: 0, paddingHorizontal: 0 }]}>
          🤖 AI Gợi ý theo mùa
        </Text>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      <LinearGradient
        colors={['#0F4C75', '#1B6CA8', '#0E7490']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiMainCard}
      >
        <View style={styles.aiMainCardInner}>
          <Text style={styles.aiEmoji}>{currentSeason.emoji}</Text>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.aiTagRow}>
              <Ionicons name="time-outline" size={12} color="#7DD3FC" />
              <Text style={styles.aiTagText}>{currentSeason.period}</Text>
            </View>
            <Text style={styles.aiMainTitle}>{currentSeason.title}</Text>
            <Text style={styles.aiMainDesc} numberOfLines={3}>{currentSeason.desc}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.aiMainBtn}
          onPress={() => router.push('/travel/itinerary' as any)}
        >
          <Text style={styles.aiMainBtnText}>Lên lịch trình ngay</Text>
          <Ionicons name="arrow-forward-circle" size={18} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingVertical: 4 }}
      >
        {SEASON_LIST.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.seasonMiniCard} activeOpacity={0.85}>
            <Text style={styles.seasonMiniEmoji}>{item.emoji}</Text>
            <Text style={styles.seasonMiniTitle} numberOfLines={2}>
              {item.title.split('–')[0].trim()}
            </Text>
            <Text style={styles.seasonMiniPeriod}>{item.period}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ── DISCOVER ───────────────────────────────────────────────────────────────
  const renderDiscover = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { marginBottom: 0, paddingHorizontal: 0 }]}>
          Khám phá Việt Nam
        </Text>
        <TouchableOpacity onPress={() => Alert.alert('🗺️', 'Xem tất cả địa điểm')}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
      >
        {DESTINATIONS.map(item => (
          <View key={item.id} style={styles.destCard}>
            <Image source={{ uri: item.image }} style={styles.destImage} />
            <View style={styles.destRatingBadge}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={styles.destRatingText}>{item.rating}</Text>
            </View>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.90)']}
              style={styles.destGradient}
            >
              <View style={styles.destLocationRow}>
                <Ionicons name="location" size={11} color="#7DD3FC" />
                <Text style={styles.destLocation}>{item.location}</Text>
              </View>
              <Text style={styles.destName}>{item.name}</Text>
              <Text style={styles.destPrice}>Từ {item.price}</Text>
              <View style={styles.destMetaRow}>
                <Ionicons name="navigate-outline" size={11} color="#94A3B8" />
                <Text style={styles.destMeta}>{item.distance}</Text>
                <Ionicons name="sunny-outline" size={11} color="#94A3B8" style={{ marginLeft: 6 }} />
                <Text style={styles.destMeta}>{item.bestTime}</Text>
              </View>
              <TouchableOpacity
                style={styles.destBtn}
                onPress={() => router.push(('/travel/destination?id=' + item.id) as any)}
              >
                <Text style={styles.destBtnText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // ── TRENDING ───────────────────────────────────────────────────────────────
  const renderTrending = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔥 Đang hot</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {TRENDING.map(item => (
          <TouchableOpacity key={item.id} style={styles.trendCard} activeOpacity={0.85}>
            <Image source={{ uri: item.image }} style={styles.trendImage} />
            <View style={styles.trendInfo}>
              <Text style={styles.trendName}>{item.name}</Text>
              <View style={styles.trendMetaRow}>
                <Ionicons name="eye-outline" size={12} color="#94A3B8" />
                <Text style={styles.trendViews}>{item.views}</Text>
              </View>
              <View style={styles.trendRatingRow}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={styles.trendRating}>{item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ── VIDEOS ─────────────────────────────────────────────────────────────────
  const renderVideos = () => (
    <View style={[styles.section, { marginBottom: 24 }]}>
      <Text style={styles.sectionTitle}>▶️ Video nổi bật</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {VIDEOS.map(vid => (
          <TouchableOpacity
            key={vid.id}
            style={styles.videoCard}
            activeOpacity={0.85}
            onPress={() => Alert.alert('▶️ Video', 'Đang phát: ' + vid.title)}
          >
            <Image source={{ uri: vid.thumbnail }} style={styles.videoThumb} />
            <View style={styles.playOverlay}>
              <LinearGradient
                colors={['rgba(14,165,233,0.9)', 'rgba(20,184,166,0.9)']}
                style={styles.playBtn}
              >
                <Ionicons name="play" size={20} color="#FFF" />
              </LinearGradient>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{vid.duration}</Text>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>{vid.title}</Text>
              <View style={styles.videoMetaRow}>
                <Ionicons name="eye-outline" size={11} color="#94A3B8" />
                <Text style={styles.videoViews}>{vid.views}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ── BOTTOM NAV ─────────────────────────────────────────────────────────────
  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      {BOTTOM_TABS.map((tab, i) => {
        const active = activeTab === i;
        return (
          <TouchableOpacity
            key={i}
            style={styles.navItem}
            onPress={() => {
              setActiveTab(i);
              if (tab.route) router.push(tab.route as any);
            }}
          >
            {active && (
              <LinearGradient
                colors={['#0EA5E9', '#14B8A6']}
                style={styles.navActiveIndicator}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
            <Ionicons
              name={active ? tab.icon : ((tab.icon + '-outline') as any)}
              size={22}
              color={active ? '#0EA5E9' : '#64748B'}
            />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── AI FAB ─────────────────────────────────────────────────────────────────
  const renderFAB = () => (
    <Animated.View style={[styles.fab, { transform: [{ scale: fabPulse }] }]}>
      <TouchableOpacity onPress={handleAIAssistant} activeOpacity={0.85}>
        <LinearGradient
          colors={['#0EA5E9', '#14B8A6']}
          style={styles.fabGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.fabEmoji}>🤖</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  // ── MAIN RENDER ────────────────────────────────────────────────────────────
  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={false} />

        {renderHeader()}
        {renderSearchBar()}

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 88 }}
        >
          {renderBanners()}
          {renderCategories()}
          {renderAISeason()}
          {renderDiscover()}
          {renderTrending()}
          {renderVideos()}
        </ScrollView>

        {renderBottomNav()}
        {renderFAB()}
      </SafeAreaView>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  webWrapper: {
    flex: 1,
    backgroundColor: '#060B15',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { paddingVertical: 20 } : {}),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 390,
    maxHeight: 844,
    aspectRatio: 390 / 844,
    borderWidth: 12,
    borderColor: '#000',
    borderRadius: 44,
    overflow: 'hidden',
  },
  scrollContainer: { flex: 1, backgroundColor: '#0F172A' },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  headerGreeting: { color: '#94A3B8', fontSize: 11, fontWeight: '500' },
  headerName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  headerCenter: { alignItems: 'center' },
  logoGrad: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  logoText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 4,
  },
  headerIconBtn: { padding: 7, position: 'relative' },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },

  // ── Search
  searchWrapper: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 6 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  searchPlaceholder: { flex: 1, color: '#94A3B8', fontSize: 14 },
  searchActions: { flexDirection: 'row', gap: 6 },
  searchIconBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Sections
  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 17,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  seeAllText: { color: '#0EA5E9', fontSize: 13, fontWeight: '600' },

  // ── Banners
  bannerCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 14,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 6,
  },
  bannerTagText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  bannerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  bannerCta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bannerCtaText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 22, backgroundColor: '#0EA5E9' },
  dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.25)' },

  // ── Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 4,
  },
  categoryItem: { width: '22%', alignItems: 'center', gap: 6, paddingVertical: 4 },
  categoryIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.28)',
  },
  categoryEmoji: { fontSize: 26 },
  categoryLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── AI Season
  aiBadge: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  aiBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  aiMainCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.30)',
  },
  aiMainCardInner: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  aiEmoji: { fontSize: 48 },
  aiTagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  aiTagText: { color: '#7DD3FC', fontSize: 11, fontWeight: '600' },
  aiMainTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 6, lineHeight: 21 },
  aiMainDesc: { color: '#CBD5E1', fontSize: 12, lineHeight: 18 },
  aiMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  aiMainBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  seasonMiniCard: {
    width: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    gap: 6,
  },
  seasonMiniEmoji: { fontSize: 28 },
  seasonMiniTitle: {
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },
  seasonMiniPeriod: { color: '#0EA5E9', fontSize: 10, fontWeight: '600' },

  // ── Destinations
  destCard: {
    width: 200,
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  destImage: { width: '100%', height: '100%' },
  destRatingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  destRatingText: { color: '#FBBF24', fontSize: 11, fontWeight: '800' },
  destGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 12,
  },
  destLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 3 },
  destLocation: { color: '#7DD3FC', fontSize: 10, fontWeight: '600' },
  destName: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 3 },
  destPrice: { color: '#4ADE80', fontSize: 12, fontWeight: '700', marginBottom: 5 },
  destMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 10 },
  destMeta: { color: '#94A3B8', fontSize: 10, fontWeight: '500' },
  destBtn: {
    backgroundColor: 'rgba(14,165,233,0.90)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  destBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // ── Trending
  trendCard: {
    width: 230,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  trendImage: { width: 100, height: '100%' },
  trendInfo: { flex: 1, padding: 10, justifyContent: 'center', gap: 6 },
  trendName: { color: '#F1F5F9', fontSize: 14, fontWeight: '800', lineHeight: 18 },
  trendMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendViews: { color: '#94A3B8', fontSize: 11 },
  trendRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendRating: { color: '#FBBF24', fontSize: 12, fontWeight: '700' },

  // ── Videos
  videoCard: {
    width: 160,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  videoThumb: { width: '100%', height: 120 },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  durationBadge: {
    position: 'absolute',
    top: 96,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  videoInfo: { padding: 10 },
  videoTitle: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginBottom: 5,
  },
  videoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  videoViews: { color: '#94A3B8', fontSize: 10 },

  // ── Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3, position: 'relative' },
  navActiveIndicator: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  navLabel: { color: '#64748B', fontSize: 10, fontWeight: '500' },
  navLabelActive: { color: '#0EA5E9', fontWeight: '700' },

  // ── FAB
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGrad: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  fabEmoji: { fontSize: 24 },
});
