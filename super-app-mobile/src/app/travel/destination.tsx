import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
  Animated,
  Image,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

// ─────────────────────────── MOCK DATA ───────────────────────────
const DESTINATION = {
  name: 'Vịnh Hạ Long',
  address: 'Thành phố Hạ Long, tỉnh Quảng Ninh',
  province: 'Quảng Ninh',
  rating: 4.9,
  reviews: 2341,
  distance: '165 km từ Hà Nội',
  bestTime: 'Tháng 10 – Tháng 4',
  priceFrom: '1.500.000đ',
  heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
  description: [
    'Vịnh Hạ Long là một trong những kỳ quan thiên nhiên của thế giới, nằm tại tỉnh Quảng Ninh, Việt Nam. Vịnh được UNESCO công nhận là Di sản Thiên nhiên Thế giới vào năm 1994, và tiếp tục được công nhận lần thứ hai vào năm 2000 vì những giá trị địa chất, địa mạo đặc biệt.',
    'Vịnh Hạ Long bao gồm hơn 1.600 hòn đảo lớn nhỏ, phần lớn là đảo đá vôi với nhiều hình thù kỳ lạ được hình thành qua hàng triệu năm phong hóa. Những hang động kỳ bí, những bãi tắm hoang sơ và làng chài trên mặt nước tạo nên bức tranh thiên nhiên tuyệt đẹp không thể tìm thấy ở bất kỳ đâu trên thế giới.',
    'Du khách đến Hạ Long có thể trải nghiệm các hoạt động như đi thuyền kayak khám phá hang động, tắm biển tại các bãi cát trắng, thưởng thức hải sản tươi ngon trực tiếp từ làng chài, hoặc chiêm ngưỡng bình minh và hoàng hôn tuyệt đẹp trên vịnh.',
    'Thời điểm lý tưởng nhất để thăm Hạ Long là từ tháng 10 đến tháng 4 năm sau, khi thời tiết mát mẻ, biển lặng và tầm nhìn rõ ràng. Tuy nhiên, mỗi mùa đều mang lại vẻ đẹp riêng biệt cho vùng đất này.',
  ],
  usefulInfo: {
    openHours: 'Mở cửa 24/7',
    ticketPrice: '150.000đ – 250.000đ/người',
    transport: 'Xe khách từ Hà Nội hoặc thuê xe riêng',
  },
};

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
  'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=400',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
  'https://images.unsplash.com/photo-1571003123771-9a6b9e3b5ee0?w=400',
];

const REVIEWS = [
  {
    id: '1',
    name: 'Nguyễn Minh Tuấn',
    avatar: 'https://i.pravatar.cc/80?img=11',
    date: '15/06/2025',
    stars: 5,
    content:
      'Chuyến đi tuyệt vời nhất trong cuộc đời tôi! Cảnh đẹp không thể diễn tả bằng lời. Sẽ quay lại vào năm sau.',
    images: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=200',
      'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=200',
    ],
  },
  {
    id: '2',
    name: 'Trần Thị Lan',
    avatar: 'https://i.pravatar.cc/80?img=5',
    date: '22/05/2025',
    stars: 5,
    content:
      'Vịnh Hạ Long đẹp hơn những gì mình tưởng tượng rất nhiều. Hải sản tươi ngon, giá hợp lý. Hướng dẫn viên nhiệt tình.',
    images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=200'],
  },
  {
    id: '3',
    name: 'Lê Văn Hùng',
    avatar: 'https://i.pravatar.cc/80?img=15',
    date: '10/04/2025',
    stars: 4,
    content:
      'Cảnh đẹp lung linh, đặc biệt lúc bình minh. Tuy nhiên cần chú ý chọn tour uy tín để có trải nghiệm tốt nhất.',
    images: [],
  },
  {
    id: '4',
    name: 'Phạm Thu Hương',
    avatar: 'https://i.pravatar.cc/80?img=9',
    date: '03/03/2025',
    stars: 5,
    content:
      'Đây là lần thứ 3 tôi đến Hạ Long và vẫn không hết ngạc nhiên. Kayak vào hang động là trải nghiệm không thể bỏ lỡ!',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200',
    ],
  },
];

const HOTELS = [
  {
    id: '1',
    name: 'Vinpearl Premium Hạ Long',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
    rating: 4.8,
    stars: 5,
    price: '3.200.000đ',
    distance: '2.1 km',
  },
  {
    id: '2',
    name: 'Mường Thanh Luxury Hạ Long',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    rating: 4.6,
    stars: 4,
    price: '1.450.000đ',
    distance: '0.8 km',
  },
  {
    id: '3',
    name: 'Sailing Club Signature Hạ Long',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
    rating: 4.7,
    stars: 4,
    price: '1.890.000đ',
    distance: '1.5 km',
  },
];

const FOODS = [
  {
    id: '1',
    name: 'Hải Sản Bến Đoan',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
    specialty: 'Cua rang muối, tôm hùm nướng',
    avgPrice: '300.000 – 800.000đ/người',
    rating: 4.7,
  },
  {
    id: '2',
    name: 'Nhà Hàng Hoa Biển',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    specialty: 'Chả mực Hạ Long, sứa biển',
    avgPrice: '150.000 – 400.000đ/người',
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Quán Nguyên Ngư',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    specialty: 'Bún cá, bánh cuốn Hạ Long',
    avgPrice: '50.000 – 120.000đ/người',
    rating: 4.6,
  },
];

const NEARBY = [
  {
    id: '1',
    name: 'Vườn Quốc gia Cát Bà',
    image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=300',
    distance: '65 km',
    rating: 4.7,
  },
  {
    id: '2',
    name: 'Đảo Cô Tô',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300',
    distance: '80 km',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Vịnh Bái Tử Long',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=300',
    distance: '45 km',
    rating: 4.9,
  },
];

const TABS = ['Giới thiệu', 'Ảnh', 'Review', 'Lịch trình', 'Khách sạn', 'Ẩm thực'];

const RATING_BREAKDOWN = [
  { stars: 5, count: 1876, pct: 0.8 },
  { stars: 4, count: 328, pct: 0.14 },
  { stars: 3, count: 93, pct: 0.04 },
  { stars: 2, count: 28, pct: 0.01 },
  { stars: 1, count: 16, pct: 0.01 },
];

// ─────────────────────────── COMPONENT ───────────────────────────
export default function DestinationScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState('Giới thiệu');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // ── Desktop frame ──
  const { width: SCREEN_W } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && SCREEN_W > 768;

  const content = (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating header on scroll */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
        <LinearGradient colors={['#0F172A', '#0C4A6E']} style={styles.floatingHeaderGrad}>
          <SafeAreaView>
            <View style={styles.floatingHeaderInner}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace('/travel'))}>
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
                {DESTINATION.name}
              </Text>
              <TouchableOpacity style={styles.headerBtn} onPress={() => setIsBookmarked(!isBookmarked)}>
                <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={20} color="#0EA5E9" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ══════ HERO ══════ */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: DESTINATION.heroImage }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            {/* Gradient overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.25)', 'transparent', 'rgba(0,0,0,0.80)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Top action buttons */}
            <SafeAreaView>
              <View style={styles.heroTop}>
                <TouchableOpacity style={styles.heroBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace('/travel'))}>
                  <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.heroTopRight}>
                  <TouchableOpacity style={styles.heroBtn}>
                    <Ionicons name="share-social" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.heroBtn}
                    onPress={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Ionicons
                      name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={isBookmarked ? '#0EA5E9' : '#fff'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>

            {/* Bottom overlay content */}
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>🌟 Điểm đến nổi bật</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* ══════ THÔNG TIN CƠ BẢN ══════ */}
        <Animated.View style={[styles.infoSection, { opacity: fadeAnim }]}>
          <Text style={styles.destName}>{DESTINATION.name}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={14} color="#0EA5E9" />
            <Text style={styles.addressText}>{DESTINATION.address}</Text>
          </View>

          {/* Rating row */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#EAB308" />
              <Text style={styles.ratingValue}>{DESTINATION.rating}</Text>
            </View>
            <Text style={styles.ratingReviews}>{DESTINATION.reviews.toLocaleString()} đánh giá</Text>
            <TouchableOpacity style={styles.reviewLinkBtn}>
              <Text style={styles.reviewLinkText}>Xem review</Text>
              <Ionicons name="chevron-forward" size={13} color="#0EA5E9" />
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📍</Text>
              <Text style={styles.statLabel}>Khoảng cách</Text>
              <Text style={styles.statValue}>{DESTINATION.distance}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statLabel}>Thời gian đẹp</Text>
              <Text style={styles.statValue}>{DESTINATION.bestTime}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statLabel}>Giá từ</Text>
              <Text style={styles.statValue}>{DESTINATION.priceFrom}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setIsBookmarked(!isBookmarked)}>
              <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color="#0EA5E9" />
              <Text style={styles.actionBtnText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="share-social-outline" size={18} color="#0EA5E9" />
              <Text style={styles.actionBtnText}>Chia sẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="map-outline" size={18} color="#0EA5E9" />
              <Text style={styles.actionBtnText}>Dẫn đường</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ══════ TABS ══════ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ══════ TAB CONTENT ══════ */}
        <View style={styles.tabContent}>
          {/* ── Giới thiệu ── */}
          {activeTab === 'Giới thiệu' && (
            <View>
              {DESTINATION.description.slice(0, descExpanded ? 4 : 2).map((para, i) => (
                <Text key={i} style={styles.descPara}>{para}</Text>
              ))}
              <TouchableOpacity style={styles.expandBtn} onPress={() => setDescExpanded(!descExpanded)}>
                <Text style={styles.expandBtnText}>
                  {descExpanded ? 'Thu gọn ▲' : 'Đọc thêm ▼'}
                </Text>
              </TouchableOpacity>

              {/* Mock map */}
              <View style={styles.mapMock}>
                <LinearGradient
                  colors={['#1E4D6B', '#0C7A5E']}
                  style={styles.mapGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75].map((v) => (
                    <View
                      key={`h${v}`}
                      style={[styles.mapGridLine, { top: `${v * 100}%` as any, width: '100%', height: 1 }]}
                    />
                  ))}
                  {[0.25, 0.5, 0.75].map((v) => (
                    <View
                      key={`v${v}`}
                      style={[styles.mapGridLine, { left: `${v * 100}%` as any, height: '100%', width: 1 }]}
                    />
                  ))}
                  {/* Marker */}
                  <View style={styles.mapMarker}>
                    <View style={styles.mapMarkerPin}>
                      <Ionicons name="location" size={16} color="#fff" />
                    </View>
                    <Text style={styles.mapMarkerLabel}>Vịnh Hạ Long</Text>
                  </View>
                </LinearGradient>
                <Text style={styles.mapCaption}>📍 Bản đồ vị trí</Text>
              </View>

              {/* Useful info */}
              <View style={styles.usefulCard}>
                <Text style={styles.usefulTitle}>ℹ️ Thông tin hữu ích</Text>
                {[
                  { icon: 'time-outline', label: 'Giờ mở cửa', value: DESTINATION.usefulInfo.openHours },
                  { icon: 'ticket-outline', label: 'Giá vé', value: DESTINATION.usefulInfo.ticketPrice },
                  { icon: 'car-outline', label: 'Di chuyển', value: DESTINATION.usefulInfo.transport },
                ].map((info) => (
                  <View key={info.label} style={styles.usefulRow}>
                    <Ionicons name={info.icon as any} size={16} color="#0EA5E9" style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.usefulLabel}>{info.label}</Text>
                      <Text style={styles.usefulValue}>{info.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Ảnh ── */}
          {activeTab === 'Ảnh' && (
            <FlatList
              data={GALLERY_IMAGES}
              keyExtractor={(item, i) => `${i}`}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: 3 }}
              ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.galleryItem} activeOpacity={0.8}>
                  <Image source={{ uri: item }} style={styles.galleryImg} resizeMode="cover" />
                </TouchableOpacity>
              )}
            />
          )}

          {/* ── Review ── */}
          {activeTab === 'Review' && (
            <View>
              {/* Rating overview */}
              <View style={styles.ratingOverview}>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingBigNum}>{DESTINATION.rating}</Text>
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={14} color="#EAB308" />
                    ))}
                  </View>
                  <Text style={styles.ratingBigSub}>{DESTINATION.reviews.toLocaleString()} đánh giá</Text>
                </View>
                <View style={styles.ratingBars}>
                  {RATING_BREAKDOWN.map((rb) => (
                    <View key={rb.stars} style={styles.ratingBarRow}>
                      <Text style={styles.ratingBarLabel}>{rb.stars}★</Text>
                      <View style={styles.ratingBarBg}>
                        <View style={[styles.ratingBarFill, { width: `${rb.pct * 100}%` }]} />
                      </View>
                      <Text style={styles.ratingBarCount}>{rb.count}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Review list */}
              {REVIEWS.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.reviewName}>{review.name}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                    <View style={styles.reviewStarRow}>
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <Ionicons key={i} name="star" size={12} color="#EAB308" />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewContent}>{review.content}</Text>
                  {review.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                      {review.images.map((img, i) => (
                        <Image key={i} source={{ uri: img }} style={styles.reviewImg} />
                      ))}
                    </ScrollView>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* ── Lịch trình ── */}
          {activeTab === 'Lịch trình' && (
            <View>
              <Text style={styles.itineraryTitle}>📅 Gợi ý lịch trình 3 ngày</Text>
              {[
                {
                  day: 'Ngày 1',
                  title: 'Hà Nội – Hạ Long',
                  color: '#0EA5E9',
                  items: ['07:00 – Khởi hành từ Hà Nội', '10:30 – Đến Hạ Long, check-in khách sạn', '13:00 – Ăn trưa hải sản tươi sống', '15:00 – Dạo thuyền trên vịnh, ngắm cảnh hoàng hôn', '19:00 – Ăn tối, nghỉ ngơi'],
                },
                {
                  day: 'Ngày 2',
                  title: 'Khám phá hang động',
                  color: '#14B8A6',
                  items: ['06:30 – Ngắm bình minh trên vịnh', '08:00 – Kayak vào hang Sáng Tối', '11:00 – Thăm động Thiên Cung', '13:00 – Ăn trưa trên thuyền', '15:00 – Tắm biển bãi Ti Tốp', '19:30 – Tiệc hải sản tối'],
                },
                {
                  day: 'Ngày 3',
                  title: 'Cát Bà – Hà Nội',
                  color: '#8B5CF6',
                  items: ['07:00 – Ăn sáng', '08:30 – Ghé thăm đảo Cát Bà', '11:00 – Mua đặc sản về làm quà', '13:00 – Lên xe về Hà Nội', '17:00 – Về đến nơi'],
                },
              ].map((day) => (
                <View key={day.day} style={styles.itineraryDay}>
                  <View style={[styles.itineraryDayBadge, { backgroundColor: day.color + '22', borderColor: day.color + '44' }]}>
                    <Text style={[styles.itineraryDayLabel, { color: day.color }]}>{day.day}</Text>
                    <Text style={styles.itineraryDayTitle}>{day.title}</Text>
                  </View>
                  {day.items.map((item, i) => (
                    <View key={i} style={styles.itineraryItem}>
                      <View style={[styles.itineraryDot, { backgroundColor: day.color }]} />
                      <Text style={styles.itineraryItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* ── Khách sạn ── */}
          {activeTab === 'Khách sạn' && (
            <View>
              <Text style={styles.nearbyTitle}>Khách sạn gần đó</Text>
              {HOTELS.map((hotel) => (
                <View key={hotel.id} style={styles.hotelCard}>
                  <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
                  <View style={styles.hotelInfo}>
                    <Text style={styles.hotelName}>{hotel.name}</Text>
                    <View style={styles.hotelStars}>
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Ionicons key={i} name="star" size={11} color="#EAB308" />
                      ))}
                      <Text style={styles.hotelRating}> {hotel.rating}</Text>
                    </View>
                    <View style={styles.hotelRow}>
                      <Ionicons name="location" size={12} color="#64748B" />
                      <Text style={styles.hotelDist}>{hotel.distance} từ trung tâm</Text>
                    </View>
                    <View style={styles.hotelBottom}>
                      <Text style={styles.hotelPrice}>{hotel.price}<Text style={styles.hotelPriceSub}>/đêm</Text></Text>
                      <TouchableOpacity style={styles.bookBtn}>
                        <Text style={styles.bookBtnText}>Đặt phòng</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Ẩm thực ── */}
          {activeTab === 'Ẩm thực' && (
            <View>
              <Text style={styles.nearbyTitle}>Nhà hàng & Quán ăn đặc sản</Text>
              {FOODS.map((food) => (
                <View key={food.id} style={styles.foodCard}>
                  <Image source={{ uri: food.image }} style={styles.foodImage} />
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <View style={styles.hotelStars}>
                      <Ionicons name="star" size={11} color="#EAB308" />
                      <Text style={styles.hotelRating}> {food.rating}</Text>
                    </View>
                    <Text style={styles.foodSpecialty}>🍽️ {food.specialty}</Text>
                    <Text style={styles.foodPrice}>💵 {food.avgPrice}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ══════ AI ĐỀ XUẤT ══════ */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <LinearGradient
            colors={['#0F766E', '#0EA5E9']}
            style={styles.aiCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.aiHeader}>
              <Text style={styles.aiEmoji}>🤖</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.aiTitle}>AI gợi ý lịch trình 3 ngày</Text>
                <Text style={styles.aiSub}>Được tối ưu theo sở thích của bạn</Text>
              </View>
            </View>
            <View style={styles.aiPreview}>
              {['🌅 Hà Nội khởi hành', '🚢 Check-in Hạ Long', '⛵ Dạo thuyền buổi chiều', '🦑 Thưởng thức hải sản'].map((item) => (
                <View key={item} style={styles.aiPreviewItem}>
                  <Text style={styles.aiPreviewText}>{item}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={() => router.push('/travel/itinerary')}
            >
              <Text style={styles.aiBtnText}>✨ Tạo lịch trình AI đầy đủ</Text>
              <Ionicons name="arrow-forward" size={16} color="#0F766E" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ══════ ĐỊA ĐIỂM TƯƠNG TỰ ══════ */}
        <View style={{ marginTop: 28 }}>
          <Text style={[styles.nearbyTitle, { paddingHorizontal: 16 }]}>Bạn có thể thích</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {NEARBY.map((place) => (
              <TouchableOpacity key={place.id} style={styles.nearbyCard} activeOpacity={0.85}>
                <Image source={{ uri: place.image }} style={styles.nearbyImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
                  style={styles.nearbyOverlay}
                />
                <View style={styles.nearbyInfo}>
                  <Text style={styles.nearbyName}>{place.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="location" size={11} color="#94A3B8" />
                    <Text style={styles.nearbyDist}>{place.distance}</Text>
                    <Ionicons name="star" size={11} color="#EAB308" style={{ marginLeft: 4 }} />
                    <Text style={styles.nearbyRating}>{place.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.ScrollView>

      {/* ══════ CTA BAR ══════ */}
      <View style={styles.ctaBar}>
        <View style={styles.ctaLeft}>
          <Text style={styles.ctaLabel}>Giá từ</Text>
          <Text style={styles.ctaPrice}>{DESTINATION.priceFrom}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/travel/booking')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#EF4444', '#F97316']}
            style={styles.ctaBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaBtnText}>🏖️ Đặt ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <View style={styles.webOuter}>
        <View style={styles.desktopFrame}>{content}</View>
      </View>
    );
  }
  return content;
}

// ─────────────────────────── STYLES ───────────────────────────────
const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    backgroundColor: '#0A0F1E',
    alignItems: 'center',
    justifyContent: 'center',
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // ── Floating header ──
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  floatingHeaderGrad: { paddingBottom: 10 },
  floatingHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 50,
    gap: 12,
  },
  floatingHeaderTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '700',
    textAlign: 'center',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hero ──
  heroContainer: { height: 300 },
  heroImage: { flex: 1 },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 54,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroTopRight: { flexDirection: 'row', gap: 10 },
  heroBadgeRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  heroBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroBadgeText: { color: '#fff', fontSize: 13, fontFamily: 'Outfit', fontWeight: '600' },

  // ── Info section ──
  infoSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  destName: {
    fontSize: 24,
    fontFamily: 'Outfit',
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  addressText: { color: '#64748B', fontSize: 13, fontFamily: 'Outfit' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingValue: { color: '#CA8A04', fontSize: 13, fontFamily: 'Outfit', fontWeight: '700' },
  ratingReviews: { color: '#64748B', fontSize: 12, fontFamily: 'Outfit', flex: 1 },
  reviewLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reviewLinkText: { color: '#0EA5E9', fontSize: 12, fontFamily: 'Outfit', fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: '#BFDBFE' },
  statIcon: { fontSize: 16 },
  statLabel: { color: '#94A3B8', fontSize: 10, fontFamily: 'Outfit' },
  statValue: { color: '#0F172A', fontSize: 11, fontFamily: 'Outfit', fontWeight: '600', textAlign: 'center' },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionBtnText: { color: '#0EA5E9', fontSize: 12, fontFamily: 'Outfit', fontWeight: '600' },

  // ── Tabs ──
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 4,
  },
  tabActive: { backgroundColor: '#0EA5E9' },
  tabText: { color: '#64748B', fontSize: 13, fontFamily: 'Outfit', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  // ── Tab content ──
  tabContent: { padding: 16, backgroundColor: '#fff', minHeight: 200 },

  descPara: {
    color: '#334155',
    fontSize: 14,
    fontFamily: 'Outfit',
    lineHeight: 22,
    marginBottom: 12,
  },
  expandBtn: { marginBottom: 16 },
  expandBtnText: { color: '#0EA5E9', fontSize: 13, fontFamily: 'Outfit', fontWeight: '600' },

  // Map mock
  mapMock: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapGrad: { height: 150, alignItems: 'center', justifyContent: 'center' },
  mapGridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.08)' },
  mapMarker: { alignItems: 'center' },
  mapMarkerPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  mapMarkerLabel: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Outfit',
    fontWeight: '700',
    marginTop: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mapCaption: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'Outfit',
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },

  // Useful info
  usefulCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  usefulTitle: { color: '#0F172A', fontSize: 15, fontFamily: 'Outfit', fontWeight: '700', marginBottom: 12 },
  usefulRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  usefulLabel: { color: '#94A3B8', fontSize: 12, fontFamily: 'Outfit', marginBottom: 2 },
  usefulValue: { color: '#334155', fontSize: 13, fontFamily: 'Outfit', fontWeight: '500' },

  // Gallery
  galleryItem: { flex: 1 },
  galleryImg: { width: '100%', aspectRatio: 1 },

  // Review
  ratingOverview: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  ratingBig: { alignItems: 'center', justifyContent: 'center', width: 80 },
  ratingBigNum: { fontSize: 38, fontFamily: 'Outfit', fontWeight: '800', color: '#0F172A' },
  starRow: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  ratingBigSub: { color: '#94A3B8', fontSize: 10, fontFamily: 'Outfit', textAlign: 'center' },
  ratingBars: { flex: 1, gap: 5 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingBarLabel: { color: '#64748B', fontSize: 11, fontFamily: 'Outfit', width: 22 },
  ratingBarBg: {
    flex: 1,
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: { height: '100%', backgroundColor: '#EAB308', borderRadius: 4 },
  ratingBarCount: { color: '#94A3B8', fontSize: 10, fontFamily: 'Outfit', width: 36, textAlign: 'right' },

  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: { width: 42, height: 42, borderRadius: 21 },
  reviewName: { color: '#0F172A', fontSize: 14, fontFamily: 'Outfit', fontWeight: '600' },
  reviewDate: { color: '#94A3B8', fontSize: 12, fontFamily: 'Outfit' },
  reviewStarRow: { flexDirection: 'row', gap: 2 },
  reviewContent: { color: '#334155', fontSize: 13, fontFamily: 'Outfit', lineHeight: 20 },
  reviewImg: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 8,
  },

  // Itinerary
  itineraryTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '700',
    marginBottom: 16,
  },
  itineraryDay: { marginBottom: 20 },
  itineraryDayBadge: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  itineraryDayLabel: {
    fontSize: 12,
    fontFamily: 'Outfit',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itineraryDayTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontFamily: 'Outfit',
    fontWeight: '600',
    marginTop: 2,
  },
  itineraryItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 7 },
  itineraryDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  itineraryItemText: { flex: 1, color: '#334155', fontSize: 13, fontFamily: 'Outfit', lineHeight: 20 },

  // Hotel
  nearbyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '700',
    marginBottom: 14,
  },
  hotelCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hotelImage: { width: 100, height: 110 },
  hotelInfo: { flex: 1, padding: 10, gap: 4 },
  hotelName: { color: '#0F172A', fontSize: 13, fontFamily: 'Outfit', fontWeight: '700' },
  hotelStars: { flexDirection: 'row', alignItems: 'center' },
  hotelRating: { color: '#64748B', fontSize: 12, fontFamily: 'Outfit' },
  hotelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  hotelDist: { color: '#94A3B8', fontSize: 11, fontFamily: 'Outfit' },
  hotelBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  hotelPrice: { color: '#0EA5E9', fontSize: 14, fontFamily: 'Outfit', fontWeight: '700' },
  hotelPriceSub: { color: '#94A3B8', fontSize: 11, fontFamily: 'Outfit', fontWeight: '400' },
  bookBtn: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bookBtnText: { color: '#fff', fontSize: 11, fontFamily: 'Outfit', fontWeight: '700' },

  // Food
  foodCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  foodImage: { width: 90, height: 100 },
  foodInfo: { flex: 1, padding: 10, gap: 4 },
  foodName: { color: '#0F172A', fontSize: 13, fontFamily: 'Outfit', fontWeight: '700' },
  foodSpecialty: { color: '#334155', fontSize: 12, fontFamily: 'Outfit' },
  foodPrice: { color: '#10B981', fontSize: 12, fontFamily: 'Outfit', fontWeight: '600' },

  // AI card
  aiCard: {
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  aiEmoji: { fontSize: 28 },
  aiTitle: { color: '#fff', fontSize: 15, fontFamily: 'Outfit', fontWeight: '700' },
  aiSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Outfit' },
  aiPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  aiPreviewItem: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  aiPreviewText: { color: '#fff', fontSize: 12, fontFamily: 'Outfit' },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
  },
  aiBtnText: { color: '#0F766E', fontSize: 14, fontFamily: 'Outfit', fontWeight: '700' },

  // Nearby
  nearbyCard: {
    width: 160,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nearbyImage: { width: '100%', height: '100%', position: 'absolute' },
  nearbyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  nearbyInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  nearbyName: { color: '#fff', fontSize: 13, fontFamily: 'Outfit', fontWeight: '700', marginBottom: 3 },
  nearbyDist: { color: '#94A3B8', fontSize: 11, fontFamily: 'Outfit' },
  nearbyRating: { color: '#EAB308', fontSize: 11, fontFamily: 'Outfit' },

  // CTA
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaLeft: {},
  ctaLabel: { color: '#94A3B8', fontSize: 12, fontFamily: 'Outfit' },
  ctaPrice: { color: '#0F172A', fontSize: 20, fontFamily: 'Outfit', fontWeight: '800' },
  ctaBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#EF4444',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Outfit', fontWeight: '800' },
});
