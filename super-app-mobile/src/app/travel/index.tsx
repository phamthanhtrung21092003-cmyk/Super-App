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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import {
  getVerifiedHeroCarousel,
  getVerifiedFeaturedDestinations,
  getVerifiedPopularDeals,
} from '../../modules/travel/data/verifiedDestinations';
import { TravelBottomNav } from '../../components/travel/TravelBottomNav';
import {
  AirplaneIcon,
  HotelIcon,
  HomestayIcon,
  TourMapIcon,
  CarRentalIcon,
  CampingTentIcon,
  FoodBowlIcon,
  AiRobotIcon,
  AiMascotCharacter,
  TrustShieldIcon,
  TrustMedalIcon,
  TrustHeadsetIcon,
  TrustTicketIcon,
} from '../../components/travel/TravelIllustratedIcons';

// ─── HIGH RESOLUTION VIBRANT DESTINATION DATA ────────────────────────────────

const BANNERS = getVerifiedHeroCarousel();

// ─── 3D ILLUSTRATED SERVICE CATEGORIES ──────────────────────────────────────

const CATEGORIES = [
  {
    id: '1',
    iconType: 'airplane',
    label: 'Vé máy bay',
    route: '/flights',
    bg: '#F0F9FF',
    border: '#E0F2FE',
  },
  {
    id: '2',
    iconType: 'hotel',
    label: 'Khách sạn',
    route: '/travel/hotel',
    bg: '#FFF1F2',
    border: '#FFE4E6',
  },
  {
    id: '3',
    iconType: 'homestay',
    label: 'Homestay',
    route: '/travel/homestay',
    bg: '#F0FDF4',
    border: '#DCFCE7',
  },
  {
    id: '4',
    iconType: 'tour',
    label: 'Tour',
    route: '/travel/booking',
    bg: '#ECFEFF',
    border: '#CCFBF1',
  },
  {
    id: '5',
    iconType: 'car',
    label: 'Thuê xe',
    route: '/travel/car',
    bg: '#FFF7ED',
    border: '#FFEDD5',
  },
  {
    id: '6',
    iconType: 'camping',
    label: 'Camping',
    route: '/travel/camping',
    bg: '#FAF5FF',
    border: '#F3E8FF',
  },
  {
    id: '7',
    iconType: 'food',
    label: 'Ẩm thực',
    route: '/travel/food',
    bg: '#FFFBEB',
    border: '#FEF3C7',
  },
  {
    id: '8',
    iconType: 'ai',
    label: 'Lên kế hoạch',
    route: '/travel/budget',
    bg: '#EEF2FF',
    border: '#E0E7FF',
    isAI: true,
  },
];

interface SeasonItem {
  emoji: string;
  title: string;
  desc: string;
  period: string;
  months: number[];
  image: string;
}

const SEASON_LIST: SeasonItem[] = [
  {
    emoji: '🌸',
    title: 'Mộc Châu – Lễ hội hoa mận',
    desc: 'Những rừng hoa mận trắng tinh khiết phủ đầy núi đồi Mộc Châu, đón chào mùa xuân và năm mới bình an.',
    period: 'Tháng 1',
    months: [1],
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '⛩️',
    title: 'Tây Ninh – Hội xuân Núi Bà Đen',
    desc: 'Hành hương đầu năm, cầu bình an và chiêm ngưỡng cảnh sắc non nước hữu tình tại nóc nhà Nam Bộ.',
    period: 'Tháng 2',
    months: [2],
    image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '🌼',
    title: 'Điện Biên – Lễ hội Hoa Ban',
    desc: 'Hòa mình vào không gian văn hóa Tây Bắc, ngắm hoa ban nở trắng rực rỡ khắp các sườn đồi.',
    period: 'Tháng 3',
    months: [3],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '🏮',
    title: 'Huế – Festival Di sản Cố Đô',
    desc: 'Khám phá văn hóa, xem biểu diễn nghệ thuật cung đình và đắm chìm trong vẻ đẹp thơ mộng của dòng sông Hương.',
    period: 'Tháng 4',
    months: [4],
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '🌾',
    title: 'Ninh Bình – Sắc vàng Tam Cốc',
    desc: 'Xuôi thuyền trên sông Ngô Đồng, tham gia tuần lễ du lịch và ngắm những cánh đồng lúa chín vàng ươm.',
    period: 'Tháng 5',
    months: [5],
    image: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '🎆',
    title: 'Đà Nẵng – Lễ hội Pháo hoa Quốc tế',
    desc: 'Tận hưởng mùa hè sôi động với những màn trình diễn pháo hoa đỉnh cao và các bãi biển quyến rũ.',
    period: 'Tháng 6',
    months: [6],
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '🦇',
    title: 'Quảng Bình – Lễ hội Hang động',
    desc: 'Trốn cái nóng mùa hè bằng cách khám phá thế giới kỳ bí bên trong hệ thống hang động Phong Nha - Kẻ Bàng.',
    period: 'Tháng 7',
    months: [7],
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '🏖️',
    title: 'Nha Trang – Festival Biển',
    desc: 'Hòa mình vào làn nước xanh mát, tham gia các hoạt động thể thao biển và thưởng thức hải sản tươi ngon.',
    period: 'Tháng 8',
    months: [8],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '🍂',
    title: 'Mù Cang Chải – Lễ hội Ruộng bậc thang',
    desc: 'Trải nghiệm bay dù lượn trên mùa vàng lúa chín, chiêm ngưỡng bức tranh sơn dầu khổng lồ của thiên nhiên.',
    period: 'Tháng 9',
    months: [9],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '🌺',
    title: 'Hà Giang – Lễ hội Hoa Tam giác mạch',
    desc: 'Cao nguyên đá Đồng Văn rực rỡ với thảm hoa tam giác mạch tím hồng trải dài tít tắp sườn đồi.',
    period: 'Tháng 10',
    months: [10],
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '☁️',
    title: 'Măng Đen – Mùa dã quỳ & săn mây',
    desc: 'Tận hưởng tiết trời se lạnh, nhâm nhi tách cà phê nguyên bản giữa đại ngàn Tây Nguyên hoang sơ.',
    period: 'Tháng 11',
    months: [11],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop',
  },
  {
    emoji: '🎄',
    title: 'Đà Lạt – Festival Hoa',
    desc: 'Thành phố ngàn hoa rực rỡ sắc màu trong không khí se lạnh cuối năm, mang đậm âm hưởng lễ hội.',
    period: 'Tháng 12',
    months: [12],
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=800&auto=format&fit=crop',
  },
];

// ─── SECTION 7: ĐIỂM ĐẾN NỔI BẬT (FEATURED DESTINATIONS) ─────────────────────

const FEATURED_DESTINATIONS = getVerifiedFeaturedDestinations();

// ─── SECTION 8: ĐANG ĐƯỢC YÊU THÍCH (POPULAR DEALS) ──────────────────────────

const POPULAR_DEALS = getVerifiedPopularDeals();

const VIDEOS = [
  {
    id: '1',
    title: 'Khám phá Vịnh Hạ Long từ trên cao',
    thumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop',
    views: '1.2M lượt xem',
    duration: '12:34',
  },
  {
    id: '2',
    title: 'Một ngày dạo bước phố cổ Hội An rực rỡ',
    thumbnail: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=600&auto=format&fit=crop',
    views: '876K lượt xem',
    duration: '8:21',
  },
  {
    id: '3',
    title: 'Trải nghiệm Sa Pa mùa lúa chín vàng óng',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop',
    views: '654K lượt xem',
    duration: '15:07',
  },
  {
    id: '4',
    title: 'Đà Lạt sáng sớm – Săn mây và đồi thông',
    thumbnail: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=600&auto=format&fit=crop',
    views: '934K lượt xem',
    duration: '10:45',
  },
];

// ─── HELPER ──────────────────────────────────────────────────────────────────
function getSeasonSuggestion(): SeasonItem {
  const month = new Date().getMonth() + 1;
  return SEASON_LIST.find(s => s.months.includes(month)) ?? SEASON_LIST[7];
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function TravelHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { userName, avatarUrl } = useUser();
  const { width } = Dimensions.get('window');
  const isDesktop = Platform.OS === 'web' && width > 768;

  const headerTopPadding = Platform.OS === 'android'
    ? Math.max((StatusBar.currentHeight ?? 0) + 8, insets.top + 6, 40)
    : Math.max(insets.top, 12);

  const [activeTab, setActiveTab] = useState(0);
  const [activeBanner, setActiveBanner] = useState(0);
  const fabPulse = useRef(new Animated.Value(1)).current;
  const bannerScrollRef = useRef<ScrollView>(null);
  const currentSeason = getSeasonSuggestion();

  // Responsive card widths
  const bannerCardWidth = Math.min(width - 48, 336);

  // FAB pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, { toValue: 1.10, duration: 1000, useNativeDriver: true }),
        Animated.timing(fabPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
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
        bannerScrollRef.current?.scrollTo({ x: next * (bannerCardWidth + 14), animated: true });
        return next;
      });
    }, 4200);
    return () => clearInterval(interval);
  }, [bannerCardWidth]);

  const handleCategoryPress = useCallback(
    (route: string | null, label: string) => {
      if (route) {
        router.push(route as any);
      } else {
        router.push('/travel/search' as any);
      }
    },
    [router]
  );

  const handleAIAssistant = () => {
    Alert.alert(
      '🤖 Trợ lý AI VN Travel',
      `Xin chào! Tôi có thể giúp bạn lên kế hoạch du lịch hoàn hảo dựa trên ngân sách, số người và số ngày đi của bạn.\n\nHoặc tôi cũng có thể gợi ý lịch trình theo mùa (${currentSeason.period}). Bạn muốn chọn chức năng nào?`,
      [
        { text: 'Lên ngân sách AI', onPress: () => router.push('/travel/budget' as any) },
        { text: 'Lịch trình theo mùa', onPress: () => router.push('/travel/itinerary' as any) },
        { text: 'Đóng', style: 'cancel' },
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

  const renderCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case 'airplane':
        return <AirplaneIcon size={34} />;
      case 'hotel':
        return <HotelIcon size={34} />;
      case 'homestay':
        return <HomestayIcon size={34} />;
      case 'tour':
        return <TourMapIcon size={34} />;
      case 'car':
        return <CarRentalIcon size={34} />;
      case 'camping':
        return <CampingTentIcon size={34} />;
      case 'food':
        return <FoodBowlIcon size={34} />;
      case 'ai':
        return <AiRobotIcon size={34} />;
      default:
        return <AirplaneIcon size={34} />;
    }
  };

  // ── HEADER ─────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: headerTopPadding }]}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.headerProfileRow}
          onPress={() => router.push('/travel/profile' as any)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80' }}
            style={styles.headerAvatar}
          />
          <View style={{ marginLeft: 9 }}>
            <View style={styles.headerLocationRow}>
              <Ionicons name="location" size={11} color="#0284C7" />
              <Text style={styles.headerGreeting}>Du lịch cùng</Text>
            </View>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName} numberOfLines={1}>
                {userName || 'Phạm Thành'}
              </Text>
              <Ionicons name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 3 }} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.headerCenter}>
        <LinearGradient
          colors={['#0284C7', '#06B6D4']}
          style={styles.logoGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.logoText}>VN Travel ✨</Text>
        </LinearGradient>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push('/notifications' as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={21} color="#1E293B" />
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push('/travel/wishlist' as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="heart-outline" size={21} color="#1E293B" />
          <View style={[styles.badgeContainer, styles.wishlistBadge]}>
            <Text style={styles.badgeText}>96</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── SEARCH BAR ─────────────────────────────────────────────────────────────
  const renderSearchBar = () => (
    <View style={styles.searchWrapper}>
      <TouchableOpacity
        style={styles.searchBox}
        activeOpacity={0.9}
        onPress={() => router.push('/travel/search' as any)}
      >
        <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          Bạn muốn khám phá đâu?
        </Text>
        <View style={styles.searchActions}>
          <TouchableOpacity
            style={styles.voiceBtn}
            onPress={() => router.push({ pathname: '/travel/search', params: { autoFocus: 'voice' } } as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={17} color="#0284C7" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={() => router.push({ pathname: '/travel/search', params: { autoFocus: 'camera' } } as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={17} color="#0D9488" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  // ── HERO DESTINATION CAROUSEL (8 VIBRANT DESTINATIONS) ──────────────────────
  const renderBanners = () => (
    <View style={styles.carouselSection}>
      <ScrollView
        ref={bannerScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={bannerCardWidth + 14}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (bannerCardWidth + 14));
          setActiveBanner(Math.max(0, Math.min(idx, BANNERS.length - 1)));
        }}
      >
        {BANNERS.map(banner => (
          <TouchableOpacity
            key={banner.id}
            style={[styles.bannerCard, { width: bannerCardWidth }]}
            activeOpacity={0.92}
            onPress={() => router.push(banner.route as any)}
          >
            <Image source={{ uri: banner.image }} style={styles.bannerImage} />
            {/* Subtle bottom-only gradient overlay keeping landscape fully bright */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.48)']}
              locations={[0.45, 0.72, 1.0]}
              style={styles.bannerGradient}
            >
              <View style={[styles.bannerTag, { backgroundColor: banner.tagColor }]}>
                <Text style={styles.bannerTagText}>{banner.tag}</Text>
              </View>
              <Text style={styles.bannerTitle} numberOfLines={1}>{banner.title}</Text>
              <View style={styles.bannerCtaRow}>
                <Text style={styles.bannerCtaText}>Khám phá ngay</Text>
                <Ionicons name="arrow-forward" size={13} color="#FFF" style={{ marginLeft: 4 }} />
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

  // ── SERVICE CATEGORY GRID (8 3D ILLUSTRATED ICONS) ─────────────────────────
  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh mục dịch vụ</Text>
        <TouchableOpacity
          onPress={() => router.push('/travel/search' as any)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(cat.route, cat.label)}
            activeOpacity={0.75}
          >
            <View style={[styles.categoryIconBox, { backgroundColor: cat.bg, borderColor: cat.border }]}>
              {renderCategoryIcon(cat.iconType)}
              {cat.isAI && (
                <View style={styles.categoryAiBadge}>
                  <Text style={styles.categoryAiBadgeText}>AI</Text>
                </View>
              )}
            </View>
            <Text style={styles.categoryLabel} numberOfLines={1}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ── AI TRAVEL RECOMMENDATION (WITH CUTE MASCOT CHARACTER) ───────────────────
  const renderAISeason = () => (
    <View style={styles.section}>
      <View style={styles.aiHeaderRow}>
        <View style={styles.aiBadgePill}>
          <Text style={styles.aiBadgePillText}>AI</Text>
        </View>
        <Text style={styles.aiSectionTitle}>AI Gợi ý theo mùa</Text>
      </View>

      <LinearGradient
        colors={['#F0F9FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiMainCard}
      >
        <View style={styles.aiCardContent}>
          <Image
            source={{ uri: currentSeason.image }}
            style={styles.aiDestinationImg}
          />
          <View style={styles.aiInfoCol}>
            <View style={styles.aiTagRow}>
              <Ionicons name="calendar-outline" size={13} color="#0284C7" />
              <Text style={styles.aiTagText}>{currentSeason.period}</Text>
            </View>
            <Text style={styles.aiMainTitle} numberOfLines={1}>
              {currentSeason.title}
            </Text>
            <Text style={styles.aiMainDesc} numberOfLines={2}>
              {currentSeason.desc}
            </Text>
            <TouchableOpacity
              style={styles.aiMainBtn}
              onPress={() => router.push('/travel/itinerary' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.aiMainBtnText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>

          {/* AI Mascot character visual */}
          <View style={styles.aiMascotWrapper}>
            <Animated.View style={{ transform: [{ scale: fabPulse }] }}>
              <AiMascotCharacter size={70} />
            </Animated.View>
          </View>
        </View>
      </LinearGradient>

      {/* Mini Season Month Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.seasonScroll}
      >
        {SEASON_LIST.map((item, idx) => {
          const isSelected = item.period === currentSeason.period;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.seasonMiniCard, isSelected && styles.seasonMiniCardActive]}
              activeOpacity={0.8}
              onPress={() => router.push('/travel/itinerary' as any)}
            >
              <Text style={styles.seasonMiniEmoji}>{item.emoji}</Text>
              <Text style={[styles.seasonMiniTitle, isSelected && styles.seasonMiniTitleActive]} numberOfLines={1}>
                {item.title.split('–')[0].trim()}
              </Text>
              <Text style={[styles.seasonMiniPeriod, isSelected && styles.seasonMiniPeriodActive]}>
                {item.period}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // ── SECTION 7: ĐIỂM ĐẾN NỔI BẬT (FEATURED DESTINATIONS) ─────────────────────
  const renderFeaturedDestinations = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Điểm đến nổi bật</Text>
        <TouchableOpacity
          onPress={() => router.push('/travel/search' as any)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
      >
        {FEATURED_DESTINATIONS.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.featuredCard}
            activeOpacity={0.88}
            onPress={() => router.push(('/travel/destination?id=' + item.id) as any)}
          >
            <Image source={{ uri: item.image }} style={styles.featuredImage} />
            <View style={styles.featuredTagBadge}>
              <Text style={styles.featuredTagText}>{item.tag}</Text>
            </View>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.featuredMetaRow}>
                <View style={styles.featuredRatingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.featuredRatingText}>{item.rating}</Text>
                </View>
                <Text style={styles.featuredDot}>•</Text>
                <Text style={styles.featuredProvince} numberOfLines={1}>{item.province}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ── SECTION 8: ĐANG ĐƯỢC YÊU THÍCH (POPULAR DEALS) ──────────────────────────
  const renderPopularDeals = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Đang được yêu thích</Text>
        <TouchableOpacity
          onPress={() => router.push('/travel/search' as any)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
      >
        {POPULAR_DEALS.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.dealCard}
            activeOpacity={0.88}
            onPress={() => router.push(('/travel/destination?id=' + item.id) as any)}
          >
            <Image source={{ uri: item.image }} style={styles.dealImage} />
            <View style={[styles.dealBadge, { backgroundColor: item.badgeColor }]}>
              <Text style={styles.dealBadgeText}>{item.badge}</Text>
            </View>
            <View style={styles.dealRatingRow}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.dealRatingText}>{item.rating}</Text>
            </View>
            <View style={styles.dealBody}>
              <Text style={styles.dealName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.dealLocation}>{item.location}</Text>
              <View style={styles.dealPriceRow}>
                <Text style={styles.dealPriceLabel}>Từ </Text>
                <Text style={styles.dealPriceVal}>{item.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ── QUICK TRUST BENEFITS ───────────────────────────────────────────────────
  const renderQuickBenefits = () => (
    <View style={styles.benefitsCard}>
      <View style={styles.benefitItem}>
        <View style={[styles.benefitIconBox, { backgroundColor: '#E0F2FE' }]}>
          <TrustShieldIcon size={22} />
        </View>
        <Text style={styles.benefitTitle} numberOfLines={1}>Thanh toán an toàn</Text>
        <Text style={styles.benefitSubtitle} numberOfLines={1}>Bảo mật tuyệt đối</Text>
      </View>

      <View style={styles.benefitItem}>
        <View style={[styles.benefitIconBox, { backgroundColor: '#FEF3C7' }]}>
          <TrustMedalIcon size={22} />
        </View>
        <Text style={styles.benefitTitle} numberOfLines={1}>Giá tốt mỗi ngày</Text>
        <Text style={styles.benefitSubtitle} numberOfLines={1}>Ưu đãi hấp dẫn</Text>
      </View>

      <View style={styles.benefitItem}>
        <View style={[styles.benefitIconBox, { backgroundColor: '#F3E8FF' }]}>
          <TrustHeadsetIcon size={22} />
        </View>
        <Text style={styles.benefitTitle} numberOfLines={1}>Hỗ trợ 24/7</Text>
        <Text style={styles.benefitSubtitle} numberOfLines={1}>Luôn sẵn sàng</Text>
      </View>

      <View style={styles.benefitItem}>
        <View style={[styles.benefitIconBox, { backgroundColor: '#FCE7F3' }]}>
          <TrustTicketIcon size={22} />
        </View>
        <Text style={styles.benefitTitle} numberOfLines={1}>Đặt nhanh</Text>
        <Text style={styles.benefitSubtitle} numberOfLines={1}>Xác nhận tức thì</Text>
      </View>
    </View>
  );

  // ── VIDEOS NỔI BẬT ─────────────────────────────────────────────────────────
  const renderVideos = () => (
    <View style={[styles.section, { marginBottom: 28 }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Video nổi bật</Text>
        <TouchableOpacity onPress={() => router.push('/video' as any)}>
          <Text style={styles.seeAllText}>Xem thêm &gt;</Text>
        </TouchableOpacity>
      </View>
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
            onPress={() => router.push('/video' as any)}
          >
            <Image source={{ uri: vid.thumbnail }} style={styles.videoThumb} />
            <View style={styles.playOverlay}>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={18} color="#FFF" style={{ marginLeft: 2 }} />
              </View>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{vid.duration}</Text>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>{vid.title}</Text>
              <View style={styles.videoMetaRow}>
                <Ionicons name="eye-outline" size={11} color="#64748B" />
                <Text style={styles.videoViews}>{vid.views}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ── BOTTOM NAVIGATION ──────────────────────────────────────────────────────
  const renderBottomNav = () => (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 8) }]}>
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
            activeOpacity={0.75}
          >
            {active && <View style={styles.navActiveIndicator} />}
            <Ionicons
              name={active ? tab.icon : ((tab.icon + '-outline') as any)}
              size={22}
              color={active ? '#0284C7' : '#64748B'}
            />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── AI FLOATING ACTION BUTTON ──────────────────────────────────────────────
  const renderFAB = () => (
    <Animated.View style={[styles.fab, { transform: [{ scale: fabPulse }] }]}>
      <TouchableOpacity onPress={handleAIAssistant} activeOpacity={0.85}>
        <LinearGradient
          colors={['#0284C7', '#06B6D4']}
          style={styles.fabGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="robot-happy-outline" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  // ── MAIN RENDER ────────────────────────────────────────────────────────────
  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

        {renderHeader()}
        {renderSearchBar()}

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 96 }}
        >
          {renderBanners()}
          {renderCategories()}
          {renderAISeason()}
          {renderFeaturedDestinations()}
          {renderPopularDeals()}
          {renderQuickBenefits()}
          {renderVideos()}
        </ScrollView>

        <TravelBottomNav activeTab="explore" />
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { paddingVertical: 20 } : {}),
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  headerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  headerGreeting: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  headerName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 95,
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGrad: {
    paddingHorizontal: 13,
    paddingVertical: 5.5,
    borderRadius: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  wishlistBadge: {
    backgroundColor: '#0D9488',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  // ── Search Bar
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchPlaceholder: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '400',
  },
  searchActions: {
    flexDirection: 'row',
    gap: 6,
  },
  voiceBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 17,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    backgroundColor: '#ECFDF5',
    borderRadius: 17,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hero Destination Carousel
  carouselSection: {
    marginTop: 16,
  },
  bannerCard: {
    height: 180,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    marginBottom: 5,
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#0284C7',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },

  // ── Sections General
  section: {
    marginTop: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284C7',
  },

  // ── Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  categoryAiBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  categoryAiBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 6,
    textAlign: 'center',
  },

  // ── AI Recommendation Card
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  aiBadgePill: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  aiBadgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  aiSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  aiMainCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    padding: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiDestinationImg: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  aiInfoCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 60,
    justifyContent: 'center',
  },
  aiTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  aiTagText: {
    color: '#0284C7',
    fontSize: 11.5,
    fontWeight: '700',
  },
  aiMainTitle: {
    color: '#0F172A',
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  aiMainDesc: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  aiMainBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  aiMainBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  aiMascotWrapper: {
    position: 'absolute',
    right: -4,
    top: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seasonScroll: {
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 12,
  },
  seasonMiniCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  seasonMiniCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  seasonMiniEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  seasonMiniTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  seasonMiniTitleActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  seasonMiniPeriod: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  seasonMiniPeriodActive: {
    color: '#0284C7',
    fontWeight: '600',
  },

  // ── Section 7: Featured Destinations Cards
  featuredCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E2E8F0',
  },
  featuredTagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15,23,42,0.65)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  featuredTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  featuredInfo: {
    padding: 9,
  },
  featuredName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  featuredDot: {
    color: '#94A3B8',
    marginHorizontal: 4,
    fontSize: 10,
  },
  featuredProvince: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },

  // ── Section 8: Popular Deals Cards
  dealCard: {
    width: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dealImage: {
    width: '100%',
    height: 115,
    backgroundColor: '#E2E8F0',
  },
  dealBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  dealBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  dealRatingRow: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 10,
    gap: 3,
  },
  dealRatingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  dealBody: {
    padding: 10,
  },
  dealName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  dealLocation: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  dealPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dealPriceLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  dealPriceVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0284C7',
  },

  // ── Quick Benefits
  benefitsCard: {
    marginHorizontal: 20,
    marginTop: 26,
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  benefitItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  benefitIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  benefitTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  benefitSubtitle: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
    textAlign: 'center',
  },

  // ── Videos Nổi Bật
  videoCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  videoThumb: {
    width: '100%',
    height: 120,
    backgroundColor: '#E2E8F0',
  },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    top: 92,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 10,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 17,
  },
  videoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoViews: {
    fontSize: 11,
    color: '#64748B',
  },

  // ── Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
    paddingVertical: 2,
  },
  navActiveIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0284C7',
  },
  navLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#0284C7',
    fontWeight: '700',
  },

  // ── FAB AI Assistant
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabGrad: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
