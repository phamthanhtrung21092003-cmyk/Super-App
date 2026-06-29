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
  FlatList,
  Animated,
  Image,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

// ─────────────────────────── MOCK DATA ───────────────────────────
const RECENT_SEARCHES = [
  'Phú Quốc',
  'Sapa tháng 10',
  'Tour Hà Giang',
  'Khách sạn Đà Nẵng',
];

const TRENDING = [
  { rank: 1, name: 'Phú Quốc', rise: '+42%' },
  { rank: 2, name: 'Sapa', rise: '+38%' },
  { rank: 3, name: 'Hội An', rise: '+31%' },
  { rank: 4, name: 'Hà Giang', rise: '+28%' },
  { rank: 5, name: 'Đà Lạt', rise: '+25%' },
  { rank: 6, name: 'Nha Trang', rise: '+22%' },
  { rank: 7, name: 'Đà Nẵng', rise: '+19%' },
  { rank: 8, name: 'Huế', rise: '+15%' },
];

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const MONTH_SUGGESTIONS: Record<number, { places: string[]; tip: string }> = {
  0:  { places: ['Mộc Châu'], tip: 'Tháng 1 – Lễ hội hoa mận trắng tinh khiết, đón chào mùa xuân.' },
  1:  { places: ['Tây Ninh'], tip: 'Tháng 2 – Hành hương Hội xuân Núi Bà Đen, cầu bình an đầu năm.' },
  2:  { places: ['Điện Biên'], tip: 'Tháng 3 – Lễ hội Hoa Ban nở rực rỡ khắp núi rừng Tây Bắc.' },
  3:  { places: ['Huế'], tip: 'Tháng 4 – Festival Di sản Cố Đô, đậm đà bản sắc văn hóa dân tộc.' },
  4:  { places: ['Ninh Bình'], tip: 'Tháng 5 – Sắc vàng Tam Cốc, xuôi thuyền trên sông Ngô Đồng ngắm lúa chín.' },
  5:  { places: ['Đà Nẵng'], tip: 'Tháng 6 – Lễ hội Pháo hoa Quốc tế, biển xanh cát trắng nắng vàng.' },
  6:  { places: ['Quảng Bình'], tip: 'Tháng 7 – Lễ hội Hang động, trốn nóng mùa hè khám phá Phong Nha Kẻ Bàng.' },
  7:  { places: ['Nha Trang'], tip: 'Tháng 8 – Festival Biển sôi động, tận hưởng hải sản tươi ngon.' },
  8:  { places: ['Mù Cang Chải'], tip: 'Tháng 9 – Lễ hội Ruộng bậc thang, bay dù lượn ngắm lúa chín vàng.' },
  9:  { places: ['Hà Giang'], tip: 'Tháng 10 – Lễ hội Hoa Tam giác mạch rực rỡ trên Cao nguyên đá Đồng Văn.' },
  10: { places: ['Măng Đen'], tip: 'Tháng 11 – Mùa dã quỳ và săn mây, cái lạnh se se nơi đại ngàn Tây Nguyên.' },
  11: { places: ['Đà Lạt'], tip: 'Tháng 12 – Festival Hoa lãng mạn, đón Giáng sinh rực rỡ sắc màu.' },
};

const BUDGET_OPTIONS = [
  {
    icon: 'wallet-outline' as const,
    label: 'Dưới 2 triệu',
    price: '< 2.000.000đ',
    color: '#10B981',
    desc: 'Mộc Châu, Ninh Bình, Tràng An',
  },
  {
    icon: 'card-outline' as const,
    label: 'Dưới 5 triệu',
    price: '< 5.000.000đ',
    color: '#0EA5E9',
    desc: 'Đà Lạt, Hội An, Nha Trang',
  },
  {
    icon: 'diamond-outline' as const,
    label: 'Dưới 10 triệu',
    price: '< 10.000.000đ',
    color: '#8B5CF6',
    desc: 'Phú Quốc, Đà Nẵng, Côn Đảo',
  },
  {
    icon: 'star-outline' as const,
    label: 'Trên 10 triệu',
    price: '> 10.000.000đ',
    color: '#F97316',
    desc: 'Du lịch quốc tế, resort 5 sao',
  },
];

const FILTER_TABS = ['Tất cả', 'Tour', 'Khách sạn', 'Vé máy bay', 'Homestay'];

const SEARCH_RESULTS = [
  {
    id: '1',
    type: 'Tour',
    name: 'Tour Phú Quốc 4N3Đ – Khám phá đảo ngọc',
    location: 'Phú Quốc, Kiên Giang',
    rating: 4.8,
    reviews: 1243,
    price: '3.990.000đ',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300',
    tag: 'Bán chạy',
    tagColor: '#F97316',
  },
  {
    id: '2',
    type: 'Khách sạn',
    name: 'Vinpearl Resort & Spa Phú Quốc',
    location: 'Phú Quốc, Kiên Giang',
    rating: 4.9,
    reviews: 867,
    price: '2.500.000đ/đêm',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=300',
    tag: '5 Sao',
    tagColor: '#EAB308',
  },
  {
    id: '3',
    type: 'Vé máy bay',
    name: 'HAN → PQC – Vietnam Airlines',
    location: 'Hà Nội → Phú Quốc',
    rating: 4.6,
    reviews: 2310,
    price: '890.000đ',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300',
    tag: 'Giá tốt',
    tagColor: '#10B981',
  },
  {
    id: '4',
    type: 'Tour',
    name: 'Tour Sapa – Fansipan 3N2Đ – Chinh phục nóc nhà',
    location: 'Sapa, Lào Cai',
    rating: 4.7,
    reviews: 987,
    price: '2.750.000đ',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    tag: 'Hot',
    tagColor: '#EF4444',
  },
  {
    id: '5',
    type: 'Homestay',
    name: 'Eco House Sapa – Giữa lòng bản làng',
    location: 'Sapa, Lào Cai',
    rating: 4.5,
    reviews: 432,
    price: '450.000đ/đêm',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300',
    tag: 'Eco',
    tagColor: '#10B981',
  },
  {
    id: '6',
    type: 'Khách sạn',
    name: 'InterContinental Đà Nẵng Sun Peninsula',
    location: 'Sơn Trà, Đà Nẵng',
    rating: 4.9,
    reviews: 1567,
    price: '4.200.000đ/đêm',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300',
    tag: 'Luxury',
    tagColor: '#8B5CF6',
  },
];

// ─────────────────────────── COMPONENT ───────────────────────────
export default function TravelSearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [query, setQuery] = useState('');
  const [recentList, setRecentList] = useState(RECENT_SEARCHES);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const hasResults = query.trim().length > 0;

  const filteredResults = hasResults
    ? activeFilter === 'Tất cả'
      ? SEARCH_RESULTS
      : SEARCH_RESULTS.filter((r) => r.type === activeFilter)
    : [];

  const removeRecent = useCallback((item: string) => {
    setRecentList((prev) => prev.filter((r) => r !== item));
  }, []);

  const handleChipPress = (text: string) => {
    setQuery(text);
    Keyboard.dismiss();
  };

  // ── Desktop frame ──
  const isWeb = Platform.OS === 'web';

  const content = (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* ══════ HEADER ══════ */}
      <LinearGradient colors={['#0F172A', '#0C4A6E']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerInner}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            {/* Search box */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Bạn muốn đi đâu?"
                placeholderTextColor="#64748B"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                selectionColor="#0EA5E9"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="mic" size={20} color="#0EA5E9" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="image" size={20} color="#14B8A6" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ══════ BODY ══════ */}
      {hasResults ? (
        /* ─── KẾT QUẢ TÌM KIẾM ─── */
        <View style={{ flex: 1 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTER_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, activeFilter === tab && styles.filterChipActive]}
                onPress={() => setActiveFilter(tab)}
              >
                <Text style={[styles.filterChipText, activeFilter === tab && styles.filterChipTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.resultCount}>
            {filteredResults.length} kết quả cho "{query}"
          </Text>

          <FlatList
            data={filteredResults}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultCard}
                activeOpacity={0.85}
                onPress={() => router.push('/travel/destination')}
              >
                <Image source={{ uri: item.image }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <View style={[styles.resultTag, { backgroundColor: item.tagColor + '25' }]}>
                    <Text style={[styles.resultTagText, { color: item.tagColor }]}>{item.tag}</Text>
                  </View>
                  <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.resultRow}>
                    <Ionicons name="location" size={12} color="#64748B" />
                    <Text style={styles.resultLocation} numberOfLines={1}>{item.location}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Ionicons name="star" size={12} color="#EAB308" />
                    <Text style={styles.resultRating}>{item.rating}</Text>
                    <Text style={styles.resultReviews}>({item.reviews} đánh giá)</Text>
                  </View>
                  <View style={styles.resultBottom}>
                    <Text style={styles.resultPrice}>{item.price}</Text>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => router.push('/travel/destination')}
                    >
                      <Text style={styles.viewBtnText}>Xem</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        /* ─── PLACEHOLDER CONTENT ─── */
        <Animated.ScrollView
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          {/* Lịch sử tìm kiếm */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
              {recentList.length > 0 && (
                <TouchableOpacity onPress={() => setRecentList([])}>
                  <Text style={styles.clearBtn}>Xóa tất cả</Text>
                </TouchableOpacity>
              )}
            </View>
            {recentList.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có lịch sử tìm kiếm</Text>
            ) : (
              <View style={styles.chipsWrap}>
                {recentList.map((item) => (
                  <View key={item} style={styles.recentChip}>
                    <Ionicons name="time-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                    <TouchableOpacity onPress={() => handleChipPress(item)}>
                      <Text style={styles.recentChipText}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeRecent(item)}
                      style={{ marginLeft: 6 }}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="close" size={13} color="#475569" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* AI Gợi ý */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#1E3A5F', '#0C4A6E']}
              style={styles.aiCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.aiCardHeader}>
                <Text style={styles.aiEmoji}>🤖</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.aiTitle}>AI Du Lịch</Text>
                  <Text style={styles.aiSubtitle}>Tháng này nên đi đâu?</Text>
                </View>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
              </View>
              <View style={styles.chipsWrap}>
                {['Mù Cang Chải', 'Hội An', 'Côn Đảo', 'Ninh Bình'].map((place) => (
                  <TouchableOpacity
                    key={place}
                    style={styles.aiChip}
                    onPress={() => handleChipPress(place)}
                  >
                    <Text style={styles.aiChipText}>✨ {place}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Xu hướng */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Xu hướng</Text>
            <View>
              {TRENDING.map((item) => (
                <TouchableOpacity
                  key={item.rank}
                  style={styles.trendItem}
                  onPress={() => handleChipPress(item.name)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.trendRank,
                    item.rank <= 3 && { color: item.rank === 1 ? '#F97316' : item.rank === 2 ? '#94A3B8' : '#B45309' }
                  ]}>
                    {item.rank}
                  </Text>
                  <Text style={styles.trendName}>{item.name}</Text>
                  <View style={styles.trendRight}>
                    <Ionicons name="trending-up" size={13} color="#10B981" />
                    <Text style={styles.trendRise}>{item.rise}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tìm theo tháng */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Tìm theo tháng</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
            >
              {MONTHS.map((m, idx) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthChip, activeMonth === idx && styles.monthChipActive]}
                  onPress={() => setActiveMonth(idx)}
                >
                  <Text style={[styles.monthChipText, activeMonth === idx && styles.monthChipTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.monthCard, { marginTop: 12 }]}>
              <Text style={styles.monthCardTip}>{MONTH_SUGGESTIONS[activeMonth].tip}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {MONTH_SUGGESTIONS[activeMonth].places.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.monthPlace}
                    onPress={() => handleChipPress(p)}
                  >
                    <Ionicons name="location" size={13} color="#0EA5E9" />
                    <Text style={styles.monthPlaceText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Tìm theo ngân sách */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Tìm theo ngân sách</Text>
            <View style={styles.budgetGrid}>
              {BUDGET_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt.label} style={styles.budgetCard} activeOpacity={0.8}>
                  <View style={[styles.budgetIconWrap, { backgroundColor: opt.color + '22' }]}>
                    <Ionicons name={opt.icon} size={22} color={opt.color} />
                  </View>
                  <Text style={styles.budgetLabel}>{opt.label}</Text>
                  <Text style={[styles.budgetPrice, { color: opt.color }]}>{opt.price}</Text>
                  <Text style={styles.budgetDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.ScrollView>
      )}
    </View>
  );

  if (isWeb) {
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
  container: { flex: 1, backgroundColor: '#0F172A' },

  // ── Header ──
  header: { paddingBottom: 14 },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 10,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 15,
    fontFamily: 'Outfit',
    paddingVertical: 0,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },

  // ── Filter ──
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterChipActive: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' },
  filterChipText: { color: '#94A3B8', fontSize: 13, fontFamily: 'Outfit' },
  filterChipTextActive: { color: '#fff', fontFamily: 'Outfit', fontWeight: '600' },

  resultCount: {
    color: '#64748B',
    fontSize: 13,
    fontFamily: 'Outfit',
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // ── Result cards ──
  resultCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  resultImage: { width: 100, height: 115 },
  resultInfo: { flex: 1, padding: 10, gap: 4 },
  resultTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
  },
  resultTagText: { fontSize: 10, fontFamily: 'Outfit', fontWeight: '700' },
  resultName: { color: '#F1F5F9', fontSize: 13, fontFamily: 'Outfit', fontWeight: '600', lineHeight: 18 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  resultLocation: { color: '#64748B', fontSize: 11, fontFamily: 'Outfit', flex: 1 },
  resultRating: { color: '#EAB308', fontSize: 12, fontFamily: 'Outfit', fontWeight: '600' },
  resultReviews: { color: '#475569', fontSize: 11, fontFamily: 'Outfit' },
  resultBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  resultPrice: { color: '#0EA5E9', fontSize: 13, fontFamily: 'Outfit', fontWeight: '700' },
  viewBtn: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Outfit', fontWeight: '700' },

  // ── Sections ──
  section: { paddingHorizontal: 16, marginTop: 22 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '700',
    marginBottom: 12,
  },
  clearBtn: { color: '#0EA5E9', fontSize: 13, fontFamily: 'Outfit' },
  emptyText: { color: '#475569', fontSize: 13, fontFamily: 'Outfit', fontStyle: 'italic' },

  // ── Recent chips ──
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  recentChipText: { color: '#CBD5E1', fontSize: 13, fontFamily: 'Outfit' },

  // ── AI card ──
  aiCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.25)',
  },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  aiEmoji: { fontSize: 30 },
  aiTitle: { color: '#fff', fontSize: 15, fontFamily: 'Outfit', fontWeight: '700' },
  aiSubtitle: { color: '#7DD3FC', fontSize: 13, fontFamily: 'Outfit' },
  aiBadge: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Outfit', fontWeight: '700' },
  aiChip: {
    backgroundColor: 'rgba(14,165,233,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.30)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  aiChipText: { color: '#7DD3FC', fontSize: 13, fontFamily: 'Outfit' },

  // ── Trending ──
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 5,
  },
  trendRank: {
    width: 26,
    color: '#475569',
    fontSize: 14,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
  trendName: { flex: 1, color: '#CBD5E1', fontSize: 14, fontFamily: 'Outfit' },
  trendRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendRise: { color: '#10B981', fontSize: 12, fontFamily: 'Outfit', fontWeight: '600' },

  // ── Month ──
  monthChip: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },
  monthChipActive: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' },
  monthChipText: { color: '#94A3B8', fontSize: 12, fontFamily: 'Outfit', fontWeight: '600' },
  monthChipTextActive: { color: '#fff', fontWeight: '700' },
  monthCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  monthCardTip: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: 'Outfit',
    lineHeight: 20,
  },
  monthPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  monthPlaceText: { color: '#7DD3FC', fontSize: 13, fontFamily: 'Outfit' },

  // ── Budget ──
  budgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  budgetCard: {
    width: '47.5%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  budgetIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  budgetLabel: {
    color: '#F1F5F9',
    fontSize: 13,
    fontFamily: 'Outfit',
    fontWeight: '700',
    marginBottom: 2,
  },
  budgetPrice: { fontSize: 12, fontFamily: 'Outfit', fontWeight: '600', marginBottom: 5 },
  budgetDesc: { color: '#64748B', fontSize: 11, fontFamily: 'Outfit', lineHeight: 16 },
});
