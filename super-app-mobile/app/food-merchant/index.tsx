import React from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, withRepeat, withTiming, useSharedValue, useAnimatedStyle, withSequence } from 'react-native-reanimated';

export default function MerchantDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const accentColor = '#F97316'; 

  // AI Glow Effect
  const glowOpacity = useSharedValue(0.4);
  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 1500 }), withTiming(0.4, { duration: 1500 })),
      -1, true
    );
  }, []);

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const STATS = [
    { label: 'Doanh thu (hôm nay)', value: '4.250.000đ', icon: 'cash-outline', color: '#10B981', trend: '+12%' },
    { label: 'Đơn mới', value: '18', icon: 'receipt-outline', color: '#3B82F6', trend: '+3' },
    { label: 'Đang chế biến', value: '4', icon: 'flame-outline', color: '#F97316', trend: '' },
    { label: 'Đơn hủy', value: '1', icon: 'close-circle-outline', color: '#EF4444', trend: '-2%' },
  ];

  // Mock Bar Chart Data
  const CHART_DATA = [
    { day: 'T2', val: 40 }, { day: 'T3', val: 65 }, { day: 'T4', val: 50 },
    { day: 'T5', val: 80 }, { day: 'T6', val: 100 }, { day: 'T7', val: 120 }, { day: 'CN', val: 90 }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontFamily: 'Outfit' }]}>Tổng Quan Quán</Text>
          <Text style={styles.headerSub}>Chào buổi chiều, Chủ quán!</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* AI Insight Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.aiCardWrap}>
          <Animated.View style={[styles.aiGlow, animatedGlow]} />
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={18} color="#FBBF24" />
              <Text style={styles.aiTitle}>AI Business Assistant</Text>
            </View>
            <Text style={styles.aiText}>
              📈 Dự báo: Doanh thu hôm nay có thể đạt <Text style={{ color: '#FBBF24', fontWeight: 'bold' }}>5.500.000đ</Text>.{"\n"}
              ⚠️ Cảnh báo: Thời gian chuẩn bị món "Pizza Hải Sản" đang chậm hơn 2 phút so với mức trung bình.
            </Text>
          </View>
        </Animated.View>

        {/* KPI Grid */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.statsGrid}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={[styles.statIcon, { backgroundColor: `${s.color}20` }]}>
                  <Ionicons name={s.icon as any} size={20} color={s.color} />
                </View>
                {s.trend ? (
                  <Text style={[styles.statTrend, { color: s.trend.includes('+') ? '#10B981' : '#EF4444' }]}>
                    {s.trend}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Chart Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Doanh thu 7 ngày qua</Text>
          <View style={styles.chartBox}>
            <View style={styles.chartBars}>
              {CHART_DATA.map((col, i) => (
                <View key={i} style={styles.chartCol}>
                  <View style={[styles.chartBar, { height: `${col.val}%`, backgroundColor: i === 5 ? accentColor : '#1E293B' }]} />
                  <Text style={styles.chartLabel}>{col.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 15 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { paddingHorizontal: 16, paddingTop: 10 },
  
  aiCardWrap: { position: 'relative', marginBottom: 20, borderRadius: 16 },
  aiGlow: { position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, backgroundColor: '#FBBF24', borderRadius: 18, zIndex: 0 },
  aiCard: { backgroundColor: '#1E1B4B', padding: 16, borderRadius: 16, zIndex: 1, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  aiTitle: { color: '#FBBF24', fontSize: 15, fontWeight: '700' },
  aiText: { color: '#E2E8F0', fontSize: 14, lineHeight: 22 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  statCard: { width: '48%', backgroundColor: '#0F172A', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statTrend: { fontSize: 12, fontWeight: '700' },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: '#94A3B8', fontSize: 12 },

  chartSection: { backgroundColor: '#0F172A', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 20 },
  chartBox: { height: 150 },
  chartBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  chartCol: { alignItems: 'center', width: 30 },
  chartBar: { width: 14, borderRadius: 7, marginBottom: 8 },
  chartLabel: { color: '#64748B', fontSize: 11 },
});
