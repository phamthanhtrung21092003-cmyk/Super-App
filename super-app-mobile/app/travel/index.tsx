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

// ─── HIGH RESOLUTION VIBRANT DESTINATION DATA ────────────────────────────────

const BANNERS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop',
    title: 'Khám phá kỳ quan Vịnh Hạ Long',
    subtitle: 'Nước biển xanh ngọc, núi đá vôi hùng vĩ',
    tag: 'SALE 30%',
    tagColor: '#FF5722',
    route: '/travel/destination?id=1',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?q=80&w=1200&auto=format&fit=crop',
    title: 'Phú Quốc – Thiên đường biển đảo',
    subtitle: 'Biển trong vắt, bãi cát trắng mịn màng',
    tag: 'ƯU ĐÃI HOT',
    tagColor: '#0284C7',
    route: '/travel/destination?id=4',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1200&auto=format&fit=crop',
    title: 'Đà Nẵng – Biển xanh & Cầu Rồng',
    subtitle: 'Thành phố đáng sống, biển Mỹ Khê tuyệt đẹp',
    tag: 'TOP 1',
    tagColor: '#059669',
    route: '/travel/destination?id=6',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1200&auto=format&fit=crop',
    title: 'Hội An – Phố cổ ngàn sắc màu',
    subtitle: 'Kiến trúc vàng hoài niệm bên dòng sông Hoài',
    tag: 'ĐẶC SẮC',
    tagColor: '#D97706',
    route: '/travel/destination?id=2',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=1200&auto=format&fit=crop',
    title: 'Đà Lạt – Thành phố ngàn hoa',
    subtitle: 'Rừng thông bạt ngàn, không khí mát lành quanh năm',
    tag: 'HOT DEAL',
    tagColor: '#7C3AED',
    route: '/travel/destination?id=5',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
    title: 'Sa Pa – Chạm vào mây trời Tây Bắc',
    subtitle: 'Mùa lúa chín vàng ươm trên ruộng bậc thang',
    tag: 'AI GỢI Ý',
    tagColor: '#0284C7',
    route: '/travel/destination?id=3',
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=1200&auto=format&fit=crop',
    title: 'Hà Giang – Cung đường hùng vĩ',
    subtitle: 'Hẻm vực Tu Sản & Sông Nho Quế xanh biếc',
    tag: 'SALE 25%',
    tagColor: '#EA580C',
    route: '/travel/destination?id=7',
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    title: 'Nha Trang – Vịnh biển ngọc ngà',
    subtitle: 'Bờ cát trắng trải dài, hải sản tươi ngon bậc nhất',
    tag: 'HOT',
    tagColor: '#0EA5E9',
    route: '/travel/destination?id=8',
  },
];

// ─── UNIFIED PROFESSIONAL VECTOR CATEGORIES ─────────────────────────────────

const CATEGORIES = [
  {
    id: '1',
    iconName: 'airplane-takeoff' as const,
    label: 'Vé máy bay',
    route: '/flights',
    bg: '#E0F2FE',
    border: '#BAE6FD',
    color: '#0284C7',
  },
  {
    id: '2',
    iconName: 'office-building' as const,
    label: 'Khách sạn',
    route: '/travel/hotel',
    bg: '#FFE4E6',
    border: '#FECDD3',
    color: '#E11D48',
  },
  {
    id: '3',
    iconName: 'home-city-outline' as const,
    label: 'Homestay',
    route: '/travel/homestay',
    bg: '#DCFCE7',
    border: '#BBF7D0',
    color: '#16A34A',
  },
  {
    id: '4',
    iconName: 'map-marker-path' as const,
    label: 'Tour',
    route: '/travel/booking',
    bg: '#CCFBF1',
    border: '#99F6E4',
    color: '#0D9488',
  },
  {
    id: '5',
    iconName: 'car-side' as const,
    label: 'Thuê xe',
    route: '/travel/car',
    bg: '#FFEDD5',
    border: '#FED7AA',
    color: '#EA580C',
  },
  {
    id: '6',
    iconName: 'tent' as const,
    label: 'Camping',
    route: '/travel/camping',
    bg: '#F3E8FF',
    border: '#E9D5FF',
    color: '#9333EA',
  },
  {
    id: '7',
    iconName: 'silverware-fork-knife' as const,
    label: 'Ẩm thực',
    route: '/travel/food',
    bg: '#FEF3C7',
    border: '#FDE68A',
    color: '#D97706',
  },
  {
    id: '8',
    iconName: 'robot-happy-outline' as const,
    label: 'Lên kế hoạch',
    route: '/travel/budget',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    color: '#4F46E5',
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
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?w=800&auto=format&fit=crop',
  },
  {
    emoji: '☁️',
    title: 'Măng Đen – Mùa dã quỳ & săn mây',
    desc: 'Tận hưởng tiết trời se lạnh, nhâm nhi tách cà phê nguyên bản giữa đại ngàn Tây Nguyên hoang sơ.',
    period: 'Tháng 11',
    months: [11],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
  },
  {
    emoji: '🎄',
    title: 'Đà Lạt – Festival Hoa',
    desc: 'Thành phố ngàn hoa rực rỡ sắc màu trong không khí se lạnh cuối năm, mang đậm âm hưởng lễ hội.',
    period: 'Tháng 12',
    months: [12],
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop',
  },
];

// ─── SECTION 7: ĐIỂM ĐẾN NỔI BẬT (FEATURED DESTINATIONS) ─────────────────────

const FEATURED_DESTINATIONS = [
  {
    id: '5',
    name: 'Đà Lạt',
    province: 'Lâm Đồng',
    rating: 4.9,
    reviews: '2.4k',
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=700&auto=format&fit=crop',
    tag: 'Khí hậu mát',
  },
  {
    id: '1',
    name: 'Vịnh Hạ Long',
    province: 'Quảng Ninh',
    rating: 4.9,
    reviews: '5.1k',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=700&auto=format&fit=crop',
    tag: 'Kỳ quan TG',
  },
  {
    id: '6',
    name: 'Đà Nẵng',
    province: 'Đà Nẵng',
    rating: 4.9,
    reviews: '4.8k',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=700&auto=format&fit=crop',
    tag: 'Biển đẹp',
  },
  {
    id: '2',
    name: 'Hội An',
    province: 'Quảng Nam',
    rating: 4.8,
    reviews: '3.6k',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=700&auto=format&fit=crop',
    tag: 'Phố cổ',
  },
  {
    id: '3',
    name: 'Sa Pa',
    province: 'Lào Cai',
    rating: 4.8,
    reviews: '3.1k',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=700&auto=format&fit=crop',
    tag: 'Săn mây',
  },
  {
    id: '7',
    name: 'Hà Giang',
    province: 'Hà Giang',
    rating: 4.9,
    reviews: '2.9k',
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=700&auto=format&fit=crop',
    tag: 'Hùng vĩ',
  },
  {
    id: '4',
    name: 'Phú Quốc',
    province: 'Kiên Giang',
    rating: 4.9,
    reviews: '6.2k',
    image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?q=80&w=700&auto=format&fit=crop',
    tag: 'Đảo ngọc',
  },
  {
    id: '9',
    name: 'Ninh Bình',
    province: 'Ninh Bình',
    rating: 4.9,
    reviews: '3.4k',
    image: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?q=80&w=700&auto=format&fit=crop',
    tag: 'Non nước',
  },
];

// ─── SECTION 8: ĐANG ĐƯỢC YÊU THÍCH (POPULAR DEALS) ──────────────────────────

const POPULAR_DEALS = [
  {
    id: '6',
    name: 'Đà Nẵng',
    location: 'Miền Trung',
    rating: 4.9,
    price: '699.000đ',
    badge: 'HOT DEAL',
    badgeColor: '#EF4444',
    distance: 'Bay 1h15',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'Đà Lạt',
    location: 'Lâm Đồng',
    rating: 4.8,
    price: '499.000đ',
    badge: 'GIÁ TỐT',
    badgeColor: '#059669',
    distance: '300km',
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Phú Quốc',
    location: 'Kiên Giang',
    rating: 4.9,
    price: '899.000đ',
    badge: 'BÁN CHẠY',
    badgeColor: '#0284C7',
    distance: 'Bay 1h00',
    image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: '1',
    name: 'Vịnh Hạ Long',
    location: 'Quảng Ninh',
    rating: 4.9,
    price: '1.250.000đ',
    badge: 'TOUR VIP',
    badgeColor: '#7C3AED',
    distance: '180km',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Hội An',
    location: 'Quảng Nam',
    rating: 4.8,
    price: '550.000đ',
    badge: 'VÉ HOT',
    badgeColor: '#D97706',
    distance: 'Bay 1h20',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Sa Pa',
    location: 'Lào Cai',
    rating: 4.8,
    price: '750.000đ',
    badge: 'COMBO AI',
    badgeColor: '#2563EB',
    distance: '320km',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=700&auto=format&fit=crop',
  },
];

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

const QUICK_BENEFITS = [
  {
    id: '1',
    iconName: 'shield-check-outline' as const,
    title: 'Thanh toán an toàn',
    subtitle: 'Bảo mật tuyệt đối',
    color: '#0284C7',
    bg: '#E0F2FE',
  },
  {
    id: '2',
    iconName: 'tag-outline' as const,
    title: 'Giá tốt mỗi ngày',
    subtitle: 'Ưu đãi hấp dẫn',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    id: '3',
    iconName: 'headset' as const,
    title: 'Hỗ trợ 24/7',
    subtitle: 'Luôn sẵn sàng',
    color: '#7C3AED',
    bg: '#F3E8FF',
  },
  {
    id: '4',
    iconName: 'lightning-bolt-outline' as const,
    title: 'Đặt nhanh',
    subtitle: 'Xác nhận tức thì',
    color: '#DB2777',
    bg: '#FCE7F3',
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
            {/* Subtle bottom-only gradient overlay to keep landscape fully bright */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.50)']}
              locations={[0.4, 0.7, 1.0]}
              style={styles.bannerGradient}
            >
              <View style={[styles.bannerTag, { backgroundColor: banner.tagColor }]}>
                <Text style={styles.bannerTagText}>{banner.tag}</Text>
              </View>
              <Text style={styles.bannerTitle} numberOfLines={1}>{banner.title}</Text>
              <Text style={styles.bannerSubtitle} numberOfLines={1}>{banner.subtitle}</Text>
              <View style={styles.bannerCta}>
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

  // ── SERVICE CATEGORY GRID (8 PROFESSIONAL VECTOR ICONS) ────────────────────
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
              <MaterialCommunityIcons name={cat.iconName} size={26} color={cat.color} />
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

  // ── AI TRAVEL RECOMMENDATION ───────────────────────────────────────────────
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
            <Animated.View style={[styles.aiMascotOrb, { transform: [{ scale: fabPulse }] }]}>
              <MaterialCommunityIcons name="robot-happy-outline" size={18} color="#0284C7" />
            </Animated.View>
            <Text style={styles.aiSparkles}>✨</Text>
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

  // ── QUICK BENEFITS ─────────────────────────────────────────────────────────
  const renderQuickBenefits = () => (
    <View style={styles.benefitsCard}>
      {QUICK_BENEFITS.map(item => (
        <View key={item.id} style={styles.benefitItem}>
          <View style={[styles.benefitIconBox, { backgroundColor: item.bg }]}>
            <MaterialCommunityIcons name={item.iconName} size={20} color={item.color} />
          </View>
          <Text style={styles.benefitTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.benefitSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        </View>
      ))}
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

  // ── Header (White, Premium, Airy)
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
    fontSize: 16.5,
    fontWeight: '700',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11.5,
    fontWeight: '400',
    marginBottom: 6,
  },
  bannerCta: {
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
    shadowOpacity: 0.03,
    shadowRadius: 4,
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
    fontSize: 11.5,
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
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
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
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  aiMainDesc: {
    color: '#64748B',
    fontSize: 11.5,
    lineHeight: 16,
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
    right: 4,
    top: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiMascotOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  aiSparkles: {
    fontSize: 10,
    position: 'absolute',
    top: -6,
    right: -4,
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
    width: 156,
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
    height: 110,
    backgroundColor: '#E2E8F0',
  },
  featuredTagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  featuredTagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  featuredInfo: {
    padding: 10,
  },
  featuredName: {
    fontSize: 14,
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
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
  },

  // ── Videos
  videoCard: {
    width: 165,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  videoThumb: {
    width: '100%',
    height: 98,
    backgroundColor: '#E2E8F0',
  },
  playOverlay: {
    position: 'absolute',
    top: 31,
    left: 64,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(2, 132, 199, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    top: 72,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  videoInfo: {
    padding: 10,
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 16,
    marginBottom: 4,
  },
  videoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoViews: {
    fontSize: 10,
    color: '#64748B',
  },

  // ── Bottom Nav (Minimalist, White, Crisp)
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    position: 'relative',
  },
  navActiveIndicator: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0284C7',
  },
  navLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#0284C7',
    fontWeight: '700',
  },

  // ── AI FAB
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fabGrad: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
