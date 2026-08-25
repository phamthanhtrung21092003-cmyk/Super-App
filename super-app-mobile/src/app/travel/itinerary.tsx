import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { TravelBottomNav } from '../../components/travel/TravelBottomNav';

const DAYS_PLAN = [
  {
    day: 1,
    date: '12/09/2025',
    title: 'Khám phá bán đảo Sơn Trà & Biển Mỹ Khê',
    items: [
      {
        time: '08:30',
        title: 'Chùa Linh Ứng & Bán đảo Sơn Trà',
        location: 'Sơn Trà, Đà Nẵng',
        desc: 'Chiêm ngưỡng tượng Phật Bà Quan Âm 67m ngắm toàn cảnh biển',
        icon: 'camera-outline',
        color: '#0284C7',
        bg: '#E0F2FE',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=400&auto=format&fit=crop',
      },
      {
        time: '11:30',
        title: 'Thưởng thức Mì Quảng ếch Bếp Trang',
        location: 'Trần Phú, Hải Châu',
        desc: 'Đặc sản Đà Nẵng đậm đà chuẩn vị',
        icon: 'restaurant-outline',
        color: '#D97706',
        bg: '#FEF3C7',
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=400&auto=format&fit=crop',
      },
      {
        time: '15:00',
        title: 'Tắm biển Mỹ Khê & Thể thao nước',
        location: 'Bãi biển Mỹ Khê',
        desc: 'Biển xanh trong, cát mịn màng ngập tràn nắng',
        icon: 'water-outline',
        color: '#0D9488',
        bg: '#CCFBF1',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop',
      },
      {
        time: '19:30',
        title: 'Cầu Rồng phun lửa & Phố đi bộ Bạch Đằng',
        location: 'Cầu Rồng, Đà Nẵng',
        desc: 'Thưởng thức màn trình diễn ánh sáng rực rỡ bên sông Hàn',
        icon: 'sparkles-outline',
        color: '#7C3AED',
        bg: '#F3E8FF',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=400&auto=format&fit=crop',
      },
    ],
  },
  {
    day: 2,
    date: '13/09/2025',
    title: 'Hành trình phố cổ Hội An di sản',
    items: [
      {
        time: '09:00',
        title: 'Rừng dừa Bảy Mẫu Cẩm Thanh',
        location: 'Cẩm Thanh, Hội An',
        desc: 'Trải nghiệm múa thuyền thúng độc đáo trên sông',
        icon: 'boat-outline',
        color: '#16A34A',
        bg: '#DCFCE7',
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=400&auto=format&fit=crop',
      },
      {
        time: '14:30',
        title: 'Check-in Phố Cổ Hội An & Chùa Cầu',
        location: 'Trần Phú, Minh An, Hội An',
        desc: 'Dạo bước ngắm nhà vàng hoa giấy và thưởng thức cà phê Faifo',
        icon: 'walk-outline',
        color: '#EA580C',
        bg: '#FFEDD5',
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=400&auto=format&fit=crop',
      },
    ],
  },
];

export default function TravelItineraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { width } = Dimensions.get('window');
  const isDesktop = Platform.OS === 'web' && width > 768;

  const headerTopPadding = Platform.OS === 'android'
    ? Math.max((StatusBar.currentHeight ?? 0) + 8, insets.top + 6, 40)
    : Math.max(insets.top, 12);

  const [activeDayIdx, setActiveDayIdx] = useState(0);

  const handleCreateTrip = () => {
    Alert.alert('Tạo lịch trình mới', 'Bạn muốn tự tạo lịch trình hay nhờ Trợ lý AI gợi ý tự động?', [
      { text: 'Trợ lý AI Planner', onPress: () => router.push('/travel/budget' as any) },
      { text: 'Tự lên lịch trình', onPress: () => Alert.alert('Đang mở bộ tạo lịch trình...') },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const currentDay = DAYS_PLAN[activeDayIdx] || DAYS_PLAN[0];

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

        {/* ── HEADER ── */}
        <View style={[styles.header, { paddingTop: headerTopPadding }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Lịch trình của tôi</Text>
            <Text style={styles.headerSubtitle}>Kế hoạch chuyến đi thông minh</Text>
          </View>
          <TouchableOpacity
            style={styles.createTripBtn}
            onPress={handleCreateTrip}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createTripBtnText}>Tạo mới</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* ── ACTIVE TRIP HERO CARD ── */}
          <View style={styles.activeTripCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop' }}
              style={styles.activeTripBg}
            />
            <View style={styles.activeTripOverlay}>
              <View style={styles.tripStatusPill}>
                <Text style={styles.tripStatusText}>SẮP DIỄN RA</Text>
              </View>
              <Text style={styles.tripName}>Đà Nẵng – Hội An Rực Rỡ</Text>
              <Text style={styles.tripDate}>📅 12/09 – 15/09/2025 • 3 ngày 2 đêm</Text>

              <View style={styles.tripActionRow}>
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => Share.share({ message: 'Lịch trình Đà Nẵng 3N2Đ của tôi trên V-Life!' })}
                >
                  <Ionicons name="share-social-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.shareBtnText}>Chia sẻ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.aiOptimizeBtn}
                  onPress={() => Alert.alert('✨ AI Planner', 'Lịch trình đã được AI tối ưu hóa lộ trình ngắn nhất, tiết kiệm 35% thời gian di chuyển!')}
                >
                  <MaterialCommunityIcons name="robot-happy-outline" size={15} color="#0284C7" />
                  <Text style={styles.aiOptimizeBtnText}>Tối ưu AI</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── DAY SELECTOR TABS ── */}
          <View style={styles.daysTabRow}>
            {DAYS_PLAN.map((item, idx) => {
              const isSelected = activeDayIdx === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dayPill, isSelected && styles.dayPillActive]}
                  onPress={() => setActiveDayIdx(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayPillNum, isSelected && styles.dayPillNumActive]}>
                    Ngày {item.day}
                  </Text>
                  <Text style={[styles.dayPillDate, isSelected && styles.dayPillDateActive]}>
                    {item.date.split('/')[0]}/{item.date.split('/')[1]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── DAY TITLE ── */}
          <View style={styles.daySummaryBox}>
            <Ionicons name="compass" size={16} color="#0284C7" />
            <Text style={styles.daySummaryText}>{currentDay.title}</Text>
          </View>

          {/* ── VERTICAL TIMELINE ── */}
          <View style={styles.timelineContainer}>
            {currentDay.items.map((act, index) => (
              <View key={index} style={styles.timelineRow}>
                {/* Time & Line */}
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{act.time}</Text>
                  {index < currentDay.items.length - 1 && <View style={styles.verticalLine} />}
                </View>

                {/* Card Item */}
                <View style={styles.actCard}>
                  <Image source={{ uri: act.image }} style={styles.actImg} />
                  <View style={styles.actContent}>
                    <View style={styles.actTopRow}>
                      <View style={[styles.actIconBox, { backgroundColor: act.bg }]}>
                        <Ionicons name={act.icon as any} size={15} color={act.color} />
                      </View>
                      <Text style={styles.actTitle} numberOfLines={1}>{act.title}</Text>
                    </View>
                    <View style={styles.actLocRow}>
                      <Ionicons name="location-outline" size={12} color="#64748B" />
                      <Text style={styles.actLocText} numberOfLines={1}>{act.location}</Text>
                    </View>
                    <Text style={styles.actDesc} numberOfLines={2}>{act.desc}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <TravelBottomNav activeTab="itinerary" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  createTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 4,
  },
  createTripBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  activeTripCard: {
    marginHorizontal: 20,
    marginTop: 18,
    height: 160,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  activeTripBg: {
    width: '100%',
    height: '100%',
  },
  activeTripOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    padding: 16,
    justifyContent: 'space-between',
  },
  tripStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tripStatusText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  tripName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  tripDate: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  tripActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  aiOptimizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  aiOptimizeBtnText: {
    color: '#0284C7',
    fontSize: 11.5,
    fontWeight: '700',
  },
  daysTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 10,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  dayPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  dayPillNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  dayPillNumActive: {
    color: '#FFFFFF',
  },
  dayPillDate: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  dayPillDateActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  daySummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 8,
  },
  daySummaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
    flex: 1,
  },
  timelineContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeCol: {
    width: 50,
    alignItems: 'center',
    position: 'relative',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
    marginBottom: 6,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 1,
  },
  actCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  actImg: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  actContent: {
    flex: 1,
    marginLeft: 10,
  },
  actTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  actIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  actLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  actLocText: {
    fontSize: 11,
    color: '#64748B',
  },
  actDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
});
