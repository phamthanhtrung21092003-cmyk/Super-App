import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Platform, SafeAreaView, StatusBar, TextInput, Dimensions, Animated, Easing
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && width > 768;

type OptionLevel = 'cheap' | 'standard' | 'luxury';

interface CategoryConfig {
  id: string;
  label: string;
  icon: any;
  allocPct: number; // Allocation percentage of budget
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'transport', label: 'Di chuyển', icon: 'airplane', allocPct: 0.3 },
  { id: 'hotel', label: 'Lưu trú', icon: 'bed', allocPct: 0.35 },
  { id: 'food', label: 'Ăn uống', icon: 'restaurant', allocPct: 0.2 },
  { id: 'activities', label: 'Vui chơi', icon: 'ticket', allocPct: 0.15 },
];

const MULTIPLIERS = {
  cheap: 0.7,
  standard: 1.0,
  luxury: 1.6,
};

const LEVEL_LABELS = {
  cheap: 'Tiết kiệm',
  standard: 'Tiêu chuẩn',
  luxury: 'Cao cấp',
};

export default function AIBudgetScreen() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [budgetText, setBudgetText] = useState('10000000');
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(3);
  
  const [aiBaseCost, setAiBaseCost] = useState(0);
  const [suggestedDest, setSuggestedDest] = useState({ title: 'Phú Quốc - Đảo Ngọc', image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?w=600' });
  
  const [selections, setSelections] = useState<Record<string, OptionLevel>>({
    transport: 'standard',
    hotel: 'standard',
    food: 'standard',
    activities: 'standard',
  });

  // Animation for loading
  const spinValue = React.useRef(new Animated.Value(0)).current;

  const numericBudget = parseInt(budgetText) || 0;

  useEffect(() => {
    if (step === 2) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      const timer = setTimeout(() => {
        // AI Logic
        const dests = [
          { min: 0, max: 4000000, title: 'Tam Đảo - Vĩnh Phúc', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600' },
          { min: 4000000, max: 8000000, title: 'Sapa - Lào Cai', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
          { min: 8000000, max: 15000000, title: 'Đà Lạt - Lâm Đồng', image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?w=600' },
          { min: 15000000, max: 50000000, title: 'Phú Quốc - Kiên Giang', image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?w=600' },
          { min: 50000000, max: 999999999, title: 'Bali - Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' }
        ];
        const dest = dests.find(d => numericBudget >= d.min && numericBudget < d.max) || dests[3];
        setSuggestedDest(dest);
        
        // AI Base Cost oscillates slightly (+/- 5%) around user budget to seem realistic
        const variation = 0.95 + (numericBudget % 11) * 0.01; 
        setAiBaseCost(numericBudget * variation);
        
        setStep(3);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, numericBudget]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Calculations
  
  const getPrice = (catId: string, level: OptionLevel) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return 0;
    const base = aiBaseCost * cat.allocPct;
    return base * MULTIPLIERS[level];
  };

  const currentTotal = CATEGORIES.reduce((sum, cat) => {
    return sum + getPrice(cat.id, selections[cat.id]);
  }, 0);

  const diff = numericBudget - currentTotal;
  const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
      <View style={S.formCard}>
        <Text style={S.formTitle}>Thiết lập ngân sách</Text>
        <Text style={S.formDesc}>Cho AI biết bạn dự định chi bao nhiêu cho chuyến đi này, chúng tôi sẽ gợi ý lịch trình tối ưu nhất.</Text>

        <View style={S.inputGroup}>
          <Text style={S.inputLabel}>Tổng ngân sách (VNĐ)</Text>
          <View style={S.budgetInputWrapper}>
            <Text style={S.budgetPrefix}>đ</Text>
            <TextInput
              style={S.budgetInput}
              keyboardType="numeric"
              value={budgetText.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              onChangeText={(t) => setBudgetText(t.replace(/\D/g, ''))}
              placeholder="Ví dụ: 10.000.000"
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        <View style={S.rowInputs}>
          <View style={S.inputGroupHalf}>
            <Text style={S.inputLabel}>Số người</Text>
            <View style={S.counter}>
              <TouchableOpacity style={S.counterBtn} onPress={() => setPeople(p => Math.max(1, p - 1))}>
                <Ionicons name="remove" size={20} color="#E2E8F0" />
              </TouchableOpacity>
              <Text style={S.counterValue}>{people}</Text>
              <TouchableOpacity style={S.counterBtn} onPress={() => setPeople(p => p + 1)}>
                <Ionicons name="add" size={20} color="#E2E8F0" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={S.inputGroupHalf}>
            <Text style={S.inputLabel}>Số ngày</Text>
            <View style={S.counter}>
              <TouchableOpacity style={S.counterBtn} onPress={() => setDays(d => Math.max(1, d - 1))}>
                <Ionicons name="remove" size={20} color="#E2E8F0" />
              </TouchableOpacity>
              <Text style={S.counterValue}>{days}</Text>
              <TouchableOpacity style={S.counterBtn} onPress={() => setDays(d => d + 1)}>
                <Ionicons name="add" size={20} color="#E2E8F0" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[S.primaryBtn, numericBudget < 500000 && S.primaryBtnDisabled]} 
          disabled={numericBudget < 500000}
          onPress={() => setStep(2)}
        >
          <LinearGradient colors={numericBudget < 500000 ? ['#475569', '#334155'] : ['#0EA5E9', '#14B8A6']} style={S.primaryBtnGrad}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
            <Text style={S.primaryBtnText}>Bắt đầu phân tích</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <View style={S.loadingContainer}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <LinearGradient colors={['#0EA5E9', '#14B8A6', '#8B5CF6']} style={S.spinner} />
        <View style={S.spinnerInner}>
          <Text style={{fontSize: 40}}>🤖</Text>
        </View>
      </Animated.View>
      <Text style={S.loadingTitle}>AI Đang xử lý...</Text>
      <Text style={S.loadingSub}>Đang đối chiếu dữ liệu giá vé máy bay, khách sạn và các dịch vụ phù hợp với ngân sách {fmt(numericBudget)}...</Text>
    </View>
  );

  const renderStep3 = () => (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[S.scrollContent, { paddingBottom: 160 }]}>
        
        {/* Destination Suggestion Banner */}
        <View style={S.suggestBanner}>
          <Image source={{ uri: suggestedDest.image }} style={S.suggestImg} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={S.suggestGrad} />
          <View style={S.suggestInfo}>
            <View style={S.suggestBadge}><Text style={S.suggestBadgeTxt}>GỢI Ý TỐT NHẤT</Text></View>
            <Text style={S.suggestTitle}>{suggestedDest.title}</Text>
            <Text style={S.suggestSub}>{days} ngày {Math.max(1, days-1)} đêm • {people} người</Text>
          </View>
        </View>

        <Text style={S.sectionTitle}>Cấu hình chi phí linh hoạt</Text>
        <Text style={S.sectionSub}>Nhấn vào các tuỳ chọn bên dưới để điều chỉnh ngân sách. AI sẽ tự động thay đổi lịch trình tương ứng.</Text>

        {CATEGORIES.map(cat => (
          <View key={cat.id} style={S.catCard}>
            <View style={S.catHeader}>
              <View style={S.catIconWrapper}>
                <Ionicons name={cat.icon as any} size={18} color="#0EA5E9" />
              </View>
              <Text style={S.catTitle}>{cat.label}</Text>
              <Text style={S.catSelectedPrice}>{fmt(getPrice(cat.id, selections[cat.id]))}</Text>
            </View>

            <View style={S.optionsRow}>
              {(['cheap', 'standard', 'luxury'] as OptionLevel[]).map(level => {
                const isSelected = selections[cat.id] === level;
                return (
                  <TouchableOpacity 
                    key={level} 
                    style={[S.optionBtn, isSelected && S.optionBtnSelected]}
                    onPress={() => setSelections(prev => ({ ...prev, [cat.id]: level }))}
                  >
                    <Text style={[S.optionLabel, isSelected && S.optionLabelSelected]}>{LEVEL_LABELS[level]}</Text>
                    <Text style={[S.optionPrice, isSelected && S.optionPriceSelected]}>{fmt(getPrice(cat.id, level))}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* STICKY BOTTOM BAR */}
      <View style={S.bottomBar}>
        <View style={S.bottomStats}>
          <View style={S.statCol}>
            <Text style={S.statLabel}>Ngân sách ban đầu</Text>
            <Text style={S.statValue}>{fmt(numericBudget)}</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statCol}>
            <Text style={S.statLabel}>Dự kiến hiện tại</Text>
            <Text style={[S.statValue, { color: diff >= 0 ? '#10B981' : '#EF4444' }]}>{fmt(currentTotal)}</Text>
          </View>
        </View>

        <View style={[S.diffBanner, { backgroundColor: diff >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
          <Ionicons name={diff >= 0 ? 'checkmark-circle' : 'warning'} size={20} color={diff >= 0 ? '#10B981' : '#EF4444'} />
          <Text style={[S.diffText, { color: diff >= 0 ? '#10B981' : '#EF4444' }]}>
            {diff >= 0 
              ? `Tuyệt vời! Bạn còn dư ${fmt(diff)} để mua quà hoặc dự phòng.` 
              : `Cảnh báo: Lịch trình hiện tại vượt ngân sách ${fmt(Math.abs(diff))}.`}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={S.replanBtn} onPress={() => setStep(1)}>
            <Text style={S.replanBtnTxt}>Sửa lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.saveBtn} onPress={() => {
            router.push('/travel/itinerary' as any);
          }}>
            <LinearGradient colors={['#0EA5E9', '#0C4A6E']} style={S.saveBtnGrad}>
              <Text style={S.saveBtnTxt}>Lưu & Xem lịch trình</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <StatusBar barStyle="light-content" />
        
        {/* HEADER */}
        <LinearGradient colors={['#0F172A', '#0F172A']} style={S.header}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/travel'))} style={S.headerBackBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>AI Lên Ngân Sách</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060B15', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safe: { flex: 1, backgroundColor: '#0F172A', width: '100%' },
  desktop: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000', borderRadius: 44, overflow: 'hidden' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 12, paddingBottom: 14 },
  headerBackBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  scrollContent: { padding: 16 },

  // Step 1
  formCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  formDesc: { fontSize: 14, color: '#94A3B8', lineHeight: 20, marginBottom: 24 },
  
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#E2E8F0', marginBottom: 8 },
  budgetInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 16 },
  budgetPrefix: { color: '#0EA5E9', fontSize: 18, fontWeight: '700', marginRight: 8 },
  budgetInput: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: '700', paddingVertical: 14 },

  rowInputs: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  inputGroupHalf: { flex: 1 },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#334155', padding: 4 },
  counterBtn: { padding: 10, backgroundColor: '#1E293B', borderRadius: 8 },
  counterValue: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  primaryBtn: { borderRadius: 14, overflow: 'hidden' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Step 2
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  spinner: { width: 100, height: 100, borderRadius: 50 },
  spinnerInner: { position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, backgroundColor: '#0F172A', borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 32, marginBottom: 12 },
  loadingSub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22 },

  // Step 3
  suggestBanner: { borderRadius: 20, overflow: 'hidden', height: 200, marginBottom: 24, position: 'relative' },
  suggestImg: { width: '100%', height: '100%', position: 'absolute' },
  suggestGrad: { width: '100%', height: '100%', position: 'absolute' },
  suggestInfo: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  suggestBadge: { backgroundColor: '#F59E0B', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  suggestBadgeTxt: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  suggestTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  suggestSub: { color: '#E2E8F0', fontSize: 14 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 6 },
  sectionSub: { fontSize: 13, color: '#94A3B8', marginBottom: 20, lineHeight: 18 },

  catCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  catIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(14,165,233,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  catTitle: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '700' },
  catSelectedPrice: { color: '#0EA5E9', fontSize: 16, fontWeight: '800' },

  optionsRow: { flexDirection: 'row', gap: 8 },
  optionBtn: { flex: 1, backgroundColor: '#0F172A', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  optionBtnSelected: { backgroundColor: 'rgba(14,165,233,0.1)', borderColor: '#0EA5E9' },
  optionLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  optionLabelSelected: { color: '#0EA5E9' },
  optionPrice: { color: '#E2E8F0', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  optionPriceSelected: { color: '#38BDF8' },

  // Bottom Bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E293B', borderTopWidth: 1, borderTopColor: '#334155', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  bottomStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statCol: { flex: 1 },
  statDivider: { width: 1, backgroundColor: '#334155', marginHorizontal: 16 },
  statLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  diffBanner: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, gap: 8, marginBottom: 16 },
  diffText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },

  replanBtn: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  replanBtnTxt: { color: '#94A3B8', fontSize: 15, fontWeight: '700' },
  saveBtn: { flex: 2, borderRadius: 12, overflow: 'hidden' },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  saveBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
