import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, TextInput, useWindowDimensions,
  ScrollView, Image, KeyboardAvoidingView, Keyboard,
  ActivityIndicator, PanResponder, Animated as RNAnimated, Modal
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, FadeIn, FadeOut, SlideInUp, SlideOutDown, SlideOutUp, SlideInDown,
  withTiming, withRepeat, useSharedValue, useAnimatedStyle, withSpring, interpolate, Extrapolation
} from 'react-native-reanimated';
import { useUser } from '../context/UserContext';

// ─── Types & Mock Data ──────────────────────────────────────────────────────
type HealthState = 
  | 'idle' 
  | 'sos_active' 
  | 'medical_id'
  | 'tele_finding' | 'tele_room'
  | 'book_search' | 'book_slot' | 'book_ticket'
  | 'pharma_home' | 'pharma_cart'
  | 'med_detail';

const DOCTORS = [
  { id: '1', name: 'BS. CKII Trần Tâm', specialty: 'Tim mạch', position: 'Trưởng khoa', experience: '15 năm', rating: 4.9, fee: '200.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '1b', name: 'BS Hoàng Tim', specialty: 'Tim mạch', position: 'Bác sĩ chuyên khoa', experience: '8 năm', rating: 4.8, fee: '150.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=15' },
  { id: '2', name: 'ThS. BS Nguyễn Tâm Lý', specialty: 'Tâm lý', position: 'Phó khoa', experience: '10 năm', rating: 5.0, fee: '300.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: '2b', name: 'Chuyên gia Thu Hà', specialty: 'Tâm lý', position: 'Tiến sĩ tâm lý học', experience: '12 năm', rating: 4.9, fee: '250.000đ', online: false, avatar: 'https://i.pravatar.cc/150?img=43' },
  { id: '3', name: 'BS Lê Da', specialty: 'Da liễu', position: 'Bác sĩ chuyên khoa', experience: '8 năm', rating: 4.8, fee: '150.000đ', online: false, avatar: 'https://i.pravatar.cc/150?img=32' },
  { id: '3b', name: 'BS Trần Mụn', specialty: 'Da liễu', position: 'Thạc sĩ y học', experience: '5 năm', rating: 4.7, fee: '120.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: '4', name: 'BS Phạm Xương', specialty: 'Xương khớp', position: 'Giảng viên ĐHYD', experience: '12 năm', rating: 4.7, fee: '180.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=59' },
  { id: '4b', name: 'BS Lê Khớp', specialty: 'Xương khớp', position: 'Bác sĩ nội trú', experience: '4 năm', rating: 4.6, fee: '100.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=53' },
  { id: '5', name: 'ThS. BS Trần Sản', specialty: 'Phụ khoa', position: 'Bác sĩ điều trị', experience: '9 năm', rating: 4.9, fee: '250.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=44' },
  { id: '5b', name: 'BS CK1 Ngọc Nữ', specialty: 'Phụ khoa', position: 'Phó khoa Sản', experience: '14 năm', rating: 5.0, fee: '300.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=45' },
  { id: '6', name: 'BS Nguyễn Nhi', specialty: 'Nhi khoa', position: 'Trưởng khoa Nhi', experience: '18 năm', rating: 4.9, fee: '150.000đ', online: false, avatar: 'https://i.pravatar.cc/150?img=28' },
  { id: '6b', name: 'BS Bé Tí', specialty: 'Nhi khoa', position: 'Bác sĩ chuyên khoa', experience: '6 năm', rating: 4.8, fee: '120.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=38' },
  { id: '7', name: 'BS Đào Tiêu Hóa', specialty: 'Tiêu hóa', position: 'Bác sĩ chuyên khoa', experience: '6 năm', rating: 4.8, fee: '150.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=13' },
  { id: '7b', name: 'BS Lê Dạ Dày', specialty: 'Tiêu hóa', position: 'Trưởng khoa', experience: '20 năm', rating: 4.9, fee: '200.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=60' },
  { id: '8', name: 'BS CKI Lê Răng', specialty: 'Nha khoa', position: 'Giám đốc chuyên môn', experience: '14 năm', rating: 4.9, fee: '100.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=14' },
  { id: '8b', name: 'BS Nguyễn Nha', specialty: 'Nha khoa', position: 'Bác sĩ phẫu thuật', experience: '7 năm', rating: 4.7, fee: '80.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=34' },
  { id: '9', name: 'ThS. BS Võ Mắt', specialty: 'Mắt', position: 'Bác sĩ phẫu thuật chính', experience: '11 năm', rating: 4.8, fee: '200.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=35' },
  { id: '9b', name: 'BS Trần Cận', specialty: 'Mắt', position: 'Chuyên khoa khúc xạ', experience: '5 năm', rating: 4.6, fee: '100.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=41' },
  { id: '10', name: 'BS Phạm Tai', specialty: 'Tai Mũi Họng', position: 'Phó khoa TMH', experience: '13 năm', rating: 4.7, fee: '150.000đ', online: false, avatar: 'https://i.pravatar.cc/150?img=61' },
  { id: '10b', name: 'BS Nguyễn Họng', specialty: 'Tai Mũi Họng', position: 'Bác sĩ nội trú', experience: '3 năm', rating: 4.5, fee: '100.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=17' },
  { id: '11', name: 'BS Trần Dưỡng', specialty: 'Dinh dưỡng', position: 'Chuyên gia dinh dưỡng', experience: '7 năm', rating: 4.9, fee: '120.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=42' },
  { id: '12', name: 'BS Hoàng Tiết', specialty: 'Nội tiết', position: 'Bác sĩ chuyên khoa', experience: '10 năm', rating: 4.8, fee: '180.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: '13', name: 'BS Đỗ Hô Hấp', specialty: 'Hô hấp', position: 'Bác sĩ điều trị', experience: '8 năm', rating: 4.9, fee: '150.000đ', online: false, avatar: 'https://i.pravatar.cc/150?img=16' },
  { id: '14', name: 'Chuyên gia Lê Liệu', specialty: 'Vật lý trị liệu', position: 'Trưởng phòng VLTL', experience: '16 năm', rating: 4.7, fee: '200.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=18' },
  { id: '15', name: 'BS Đinh Nam', specialty: 'Nam khoa', position: 'Trưởng khoa Nam học', experience: '15 năm', rating: 4.9, fee: '250.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=52' },
  { id: '16', name: 'BS Nguyễn Lão', specialty: 'Lão khoa', position: 'Bác sĩ cấp cao', experience: '22 năm', rating: 5.0, fee: '200.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=68' },
  { id: '17', name: 'GS. TS Trần Bướu', specialty: 'Ung bướu', position: 'Giám đốc bệnh viện', experience: '30 năm', rating: 5.0, fee: '500.000đ', online: false, avatar: 'https://i.pravatar.cc/150?img=69' },
  { id: '18', name: 'BS Vũ Nhiễm', specialty: 'Truyền nhiễm', position: 'Phó khoa Kiểm soát', experience: '11 năm', rating: 4.8, fee: '150.000đ', online: true, avatar: 'https://i.pravatar.cc/150?img=70' },
];

const SPECIALTIES = [
  { id: 'all', name: 'Tất cả', icon: '🌟' },
  { id: 'dalieu', name: 'Da liễu', icon: '🧴' },
  { id: 'phukhoa', name: 'Phụ khoa', icon: '👩‍⚕️' },
  { id: 'xuongkhop', name: 'Xương khớp', icon: '🦴' },
  { id: 'tamly', name: 'Tâm lý', icon: '🧠' },
  { id: 'nhikhoa', name: 'Nhi khoa', icon: '👶' },
  { id: 'timmach', name: 'Tim mạch', icon: '❤️' },
  { id: 'tieuhoa', name: 'Tiêu hóa', icon: '🩺' },
  { id: 'nhakhoa', name: 'Nha khoa', icon: '🦷' },
  { id: 'nhankhoa', name: 'Mắt', icon: '👁️' },
  { id: 'taimuihong', name: 'Tai Mũi Họng', icon: '👂' },
  { id: 'dinhduong', name: 'Dinh dưỡng', icon: '🥗' },
  { id: 'namkhoa', name: 'Nam khoa', icon: '👨' },
  { id: 'noitiet', name: 'Nội tiết', icon: '🩸' },
  { id: 'hohap', name: 'Hô hấp', icon: '🫁' },
  { id: 'vatlytrilieu', name: 'Vật lý trị liệu', icon: '💆' },
  { id: 'laokhoa', name: 'Lão khoa', icon: '👴' },
  { id: 'ungbuou', name: 'Ung bướu', icon: '🔬' },
  { id: 'truyennhiem', name: 'Truyền nhiễm', icon: '🦠' },
];

const HOSPITALS = [
  { id: '1', name: 'BV Đa khoa Tâm Anh', address: '108 Hoàng Như Tiếp, Long Biên', distance: '2.5 km', est: '10 phút' },
  { id: '2', name: 'BV Đa khoa Hồng Ngọc', address: '55 Yên Ninh, Ba Đình', distance: '4.1 km', est: '15 phút' },
  { id: '3', name: 'Phòng khám Vinmec', address: 'Times City, Hai Bà Trưng', distance: '5.0 km', est: '20 phút' },
];

const INITIAL_MEDICATIONS = [
  { id: 'm1', name: 'Panadol Extra', time: '08:00', dosage: '1 viên', note: 'Uống sau khi ăn no', taken: false, restrictions: 'Kiêng rượu bia, cà phê', totalDoses: 10, completedDoses: 4 },
  { id: 'm2', name: 'Amoxicillin 500mg', time: '12:00', dosage: '2 viên', note: 'Kháng sinh, uống cách bữa ăn 1h', taken: false, restrictions: 'Không dùng chung với sữa', totalDoses: 21, completedDoses: 14 },
  { id: 'm3', name: 'Vitamin C 1000mg', time: '20:00', dosage: '1 viên sủi', note: 'Hòa tan vào 200ml nước', taken: false, restrictions: 'Không uống sát giờ ngủ', totalDoses: 5, completedDoses: 1 },
];

const OTC_MEDS = [
  { id: 'm1', name: 'Panadol Extra', type: 'Thuốc giảm đau, hạ sốt', price: '45.000đ', icon: 'pills', color: '#EF4444' },
  { id: 'm2', name: 'Oresol Cam', type: 'Bù nước điện giải', price: '20.000đ', icon: 'tint', color: '#F59E0B' },
  { id: 'm3', name: 'Vitamin C Sủi', type: 'Tăng đề kháng', price: '60.000đ', icon: 'lemon', color: '#10B981' },
];

// Theme Colors (Premium Light - Medical)
const T = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSub: '#64748B',
  primary: '#0F766E', // Teal
  primaryLight: '#E0F2FE', // Light Blue
  red: '#DC2626', // SOS/Warning
  redLight: '#FEE2E2',
  amber: '#D97706',
  green: '#10B981',
  border: '#E2E8F0'
};

export default function HealthScreen() {
  const router = useRouter();
  const { width, height: SCREEN_H } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const { userData } = useUser();

  const [state, setState] = useState<HealthState>('idle');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [medications, setMedications] = useState(INITIAL_MEDICATIONS);
  const [alarmMed, setAlarmMed] = useState<any>(null);
  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);
  
  // Animation Values
  const sosProgress = useRef(new RNAnimated.Value(0)).current;
  const heartScale = useSharedValue(1);

  useEffect(() => {
    heartScale.value = withRepeat(withTiming(1.15, { duration: 600 }), -1, true);
  }, []);

  const animatedHeart = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }]
  }));

  // SOS Slider Logic
  const SLIDER_WIDTH = Math.min(width - 40, 400);
  const THUMB_SIZE = 56;
  const MAX_SLIDE = SLIDER_WIDTH - THUMB_SIZE - 10;
  
  const sosPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      if (g.dx >= 0 && g.dx <= MAX_SLIDE) {
        sosProgress.setValue(g.dx);
      }
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx >= MAX_SLIDE - 20) {
        // Trigger SOS
        RNAnimated.timing(sosProgress, { toValue: MAX_SLIDE, duration: 150, useNativeDriver: false }).start();
        setTimeout(() => setState('medical_id'), 400);
      } else {
        RNAnimated.spring(sosProgress, { toValue: 0, useNativeDriver: false }).start();
      }
    }
  })).current;

  // Medication Logic
  const markAsTaken = (id: string) => {
    setMedications(prev => prev.map(m => m.id === id ? { 
      ...m, 
      taken: !m.taken,
      completedDoses: !m.taken ? m.completedDoses + 1 : Math.max(0, m.completedDoses - 1)
    } : m));
  };

  const simulateAlarm = (med: any) => {
    setAlarmMed(med);
    // Vibrate repeatedly logic if on physical device
    if (Platform.OS !== 'web') {
      const interval = setInterval(() => {
        // Haptics/Vibration would go here
      }, 1000);
      setTimeout(() => clearInterval(interval), 10000); // stop after 10s if not dismissed
    }
  };

  // Greeting Logic
  const hour = new Date().getHours();
  let greeting = 'Chào bạn';
  let subGreeting = 'Hãy chú ý giữ gìn sức khỏe nhé.';
  if (hour < 12) { greeting = 'Chào buổi sáng'; subGreeting = 'Khởi đầu ngày mới với một ly nước ấm nhé 🌅'; }
  else if (hour < 18) { greeting = 'Buổi chiều năng lượng'; subGreeting = 'Đừng quên vận động nhẹ nhàng sau khi ngồi lâu ☕'; }
  else { greeting = 'Buổi tối thư giãn'; subGreeting = 'Thời gian để cơ thể nghỉ ngơi và phục hồi 🌙'; }

  // ── Render Helpers ────────────────────────────────────────────────────────
  
  const renderTopBar = () => {
    if (['tele_room', 'medical_id', 'book_ticket', 'med_detail'].includes(state)) return null;
    return (
      <View style={S.topBar}>
        <TouchableOpacity style={S.backBtn} onPress={() => {
          if (state !== 'idle') setState('idle');
          else if (router.canGoBack()) router.back();
          else router.replace('/utilities');
        }}>
          <Ionicons name="chevron-back" size={28} color={T.text} />
        </TouchableOpacity>
        <Text style={S.topTitle}>{state === 'idle' ? 'Y Tế & Sức Khỏe' : 
                                  state === 'pharma_home' ? 'Nhà Thuốc 24/7' : 
                                  state === 'book_search' ? 'Đặt Lịch Khám' : 
                                  'Tư Vấn Trực Tuyến'}</Text>
        <TouchableOpacity style={S.profileBtn}>
          <Image source={{ uri: userData?.avatarUrl || 'https://i.pravatar.cc/150' }} style={S.avatar} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDashboard = () => {
    if (state !== 'idle') return null;
    return (
      <Animated.ScrollView entering={FadeIn} exiting={FadeOut} style={S.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={S.greetSection}>
          <Text style={S.greetTxt}>{greeting}, {userData?.name?.split(' ')[0] || 'Trung'}!</Text>
          <Text style={S.subGreetTxt}>{subGreeting}</Text>
        </View>

        {/* SOS Slider */}
        <View style={S.sosContainer}>
          <Text style={S.sosLabel}>VUỐT ĐỂ GỌI CẤP CỨU & SOS</Text>
          <View style={S.sliderTrack}>
            <View style={S.sliderTextWrap}>
              <Text style={S.sliderText}>Trượt sang phải</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={T.red} style={{ opacity: 0.5 }} />
              <Ionicons name="chevron-forward-outline" size={20} color={T.red} style={{ marginLeft: -10, opacity: 0.8 }} />
            </View>
            <RNAnimated.View {...sosPan.panHandlers} style={[S.sliderThumb, { transform: [{ translateX: sosProgress }] }]}>
              <MaterialCommunityIcons name="ambulance" size={28} color="#FFF" />
            </RNAnimated.View>
            <RNAnimated.View style={[S.sliderFill, { width: RNAnimated.add(sosProgress, THUMB_SIZE) }]} pointerEvents="none" />
          </View>
        </View>

        {/* Vitals Snapshot */}
        <View style={S.vitalsRow}>
          <View style={S.vitalCard}>
            <View style={S.vitalHeader}>
              <Ionicons name="water" size={18} color="#0EA5E9" />
              <Text style={S.vitalTitle}>Nước</Text>
            </View>
            <Text style={S.vitalValue}>1.2 <Text style={S.vitalUnit}>/ 2 Lít</Text></Text>
            <View style={S.progressBar}><View style={[S.progressFill, { width: '60%', backgroundColor: '#0EA5E9' }]} /></View>
          </View>
          <View style={S.vitalCard}>
            <View style={S.vitalHeader}>
              <Animated.View style={animatedHeart}><Ionicons name="heart" size={18} color={T.red} /></Animated.View>
              <Text style={S.vitalTitle}>Nhịp tim</Text>
            </View>
            <Text style={S.vitalValue}>75 <Text style={S.vitalUnit}>bpm</Text></Text>
            <Text style={S.vitalStatus}>Bình thường</Text>
          </View>
        </View>

        {/* Reminders */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
          <View>
            <Text style={[S.sectionTitle, { marginBottom: 4 }]}>Lịch uống thuốc hôm nay</Text>
            <Text style={{ fontSize: 13, color: T.textSub, marginLeft: 20 }}>
              Đã uống: <Text style={{ color: T.green, fontWeight: '700' }}>{medications.filter(m => m.taken).length}</Text>  •  Chưa uống: <Text style={{ color: T.red, fontWeight: '700' }}>{medications.filter(m => !m.taken).length}</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={() => simulateAlarm(medications.find(m => !m.taken) || medications[0])} style={{ paddingVertical: 4 }}>
            <Text style={{ color: T.red, fontWeight: '700', marginRight: 20, fontSize: 13 }}>Test Báo thức</Text>
          </TouchableOpacity>
        </View>

        {medications.map(med => (
          <TouchableOpacity 
            key={med.id} 
            style={[S.reminderCard, med.taken && { opacity: 0.6, backgroundColor: '#F8FAFC' }]} 
            activeOpacity={0.8}
            onPress={() => {
              setSelectedMedId(med.id);
              setState('med_detail');
            }}
          >
            <View style={[S.reminderIcon, med.taken && { backgroundColor: '#E2E8F0' }]}>
              <FontAwesome5 name="pills" size={18} color={med.taken ? '#94A3B8' : T.amber} />
            </View>
            <View style={S.reminderInfo}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[S.reminderTime, med.taken && { textDecorationLine: 'line-through' }]}>
                  {med.time} - {med.note}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: med.taken ? '#94A3B8' : T.primary }}>
                  {med.completedDoses}/{med.totalDoses} liều
                </Text>
              </View>
              <Text style={[S.reminderName, med.taken && { textDecorationLine: 'line-through', color: '#94A3B8' }]}>
                {med.dosage} {med.name}
              </Text>
              {!med.taken && (
                <Text style={{ fontSize: 12, color: T.red, marginTop: 4 }}>
                  <Ionicons name="warning" size={12} /> {med.restrictions}
                </Text>
              )}
            </View>
            <View style={[S.checkBtn, med.taken && { backgroundColor: T.green, borderColor: T.green }]}>
              <Ionicons name={med.taken ? "checkmark" : "chevron-forward"} size={20} color={med.taken ? '#FFF' : T.border} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Services Grid */}
        <Text style={S.sectionTitle}>Dịch vụ Y tế</Text>
        <View style={S.serviceGrid}>
          <TouchableOpacity style={S.serviceItem} onPress={() => setState('tele_finding')}>
            <View style={[S.serviceIconWrap, { backgroundColor: '#E0E7FF' }]}><Ionicons name="videocam" size={28} color="#4F46E5" /></View>
            <Text style={S.serviceTxt}>Bác sĩ 24/7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.serviceItem} onPress={() => setState('book_search')}>
            <View style={[S.serviceIconWrap, { backgroundColor: '#DCFCE7' }]}><Ionicons name="calendar" size={28} color="#16A34A" /></View>
            <Text style={S.serviceTxt}>Đặt lịch khám</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.serviceItem} onPress={() => setState('pharma_home')}>
            <View style={[S.serviceIconWrap, { backgroundColor: '#FEF9C3' }]}><MaterialCommunityIcons name="pill" size={28} color="#CA8A04" /></View>
            <Text style={S.serviceTxt}>Mua thuốc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.serviceItem} onPress={() => alert('Đang phát triển')}>
            <View style={[S.serviceIconWrap, { backgroundColor: '#FCE7F3' }]}><Ionicons name="home" size={28} color="#DB2777" /></View>
            <Text style={S.serviceTxt}>Y tế tại nhà</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    );
  };

  const renderMedicalID = () => {
    if (state !== 'medical_id') return null;
    return (
      <Animated.View entering={SlideInUp.springify()} exiting={SlideOutDown} style={S.medicalIdScreen}>
        <StatusBar barStyle="light-content" backgroundColor={T.red} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Animated.View style={animatedHeart}>
            <Ionicons name="warning" size={80} color="#FFF" style={{ marginBottom: 20 }} />
          </Animated.View>
          <Text style={S.sosAlertTxt}>ĐANG GỌI CẤP CỨU...</Text>
          <Text style={S.sosTimerTxt}>Xe cứu thương sẽ được điều phối trong 5 giây.</Text>
          
          <View style={S.idCard}>
            <Text style={S.idHeader}>THÔNG TIN Y TẾ KHẨN CẤP</Text>
            <View style={S.idDivider} />
            <Text style={S.idLabel}>Họ và tên</Text>
            <Text style={S.idValue}>{userData?.name?.toUpperCase() || 'NGUYỄN VĂN TRUNG'}</Text>
            
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <View style={{ flex: 1 }}>
                <Text style={S.idLabel}>Nhóm máu</Text>
                <Text style={[S.idValue, { color: T.red, fontSize: 28 }]}>O+</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.idLabel}>Dị ứng</Text>
                <Text style={[S.idValue, { color: T.red }]}>Penicillin</Text>
              </View>
            </View>
            
            <View style={{ marginTop: 15 }}>
              <Text style={S.idLabel}>Bệnh nền</Text>
              <Text style={S.idValue}>Hen suyễn (Asthma)</Text>
            </View>
            <View style={{ marginTop: 15 }}>
              <Text style={S.idLabel}>Liên hệ khẩn cấp</Text>
              <Text style={S.idValue}>Mẹ: 090 123 4567</Text>
            </View>
          </View>
          
          <TouchableOpacity style={S.cancelSosBtn} onPress={() => { sosProgress.setValue(0); setState('idle'); }}>
            <Text style={S.cancelSosTxt}>HỦY YÊU CẦU</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderMedDetail = () => {
    if (state !== 'med_detail' || !selectedMedId) return null;
    const med = medications.find(m => m.id === selectedMedId);
    if (!med) return null;

    return (
      <Animated.View entering={SlideInUp} exiting={SlideOutDown} style={S.medDetailScreen}>
        <View style={S.topBar}>
          <TouchableOpacity onPress={() => setState('idle')} style={S.backBtn}>
            <Ionicons name="chevron-back" size={28} color={T.text} />
          </TouchableOpacity>
          <Text style={S.topTitle}>Chi tiết đơn thuốc</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={S.mdHeader}>
            <View style={S.mdIconWrap}>
              <FontAwesome5 name="pills" size={40} color={T.primary} />
            </View>
            <Text style={S.mdName}>{med.name}</Text>
            <Text style={S.mdDosage}>{med.dosage}</Text>
            <View style={{ marginTop: 15, width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: T.textSub, marginBottom: 8 }}>
                Tiến độ: Đã uống <Text style={{ color: T.green, fontWeight: '700' }}>{med.completedDoses}</Text> / {med.totalDoses} liều
              </Text>
              <View style={{ width: '80%', height: 8, backgroundColor: T.border, borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ width: `${(med.completedDoses / med.totalDoses) * 100}%`, height: '100%', backgroundColor: T.green, borderRadius: 4 }} />
              </View>
            </View>
          </View>

          <View style={S.mdInfoCard}>
            <View style={S.mdInfoRow}>
              <Ionicons name="time" size={24} color={T.amber} style={{ width: 30 }} />
              <View>
                <Text style={S.mdInfoLabel}>Giờ uống</Text>
                <Text style={S.mdInfoValue}>{med.time}</Text>
              </View>
            </View>
            <View style={S.mdDivider} />
            <View style={S.mdInfoRow}>
              <Ionicons name="information-circle" size={24} color={T.primary} style={{ width: 30 }} />
              <View>
                <Text style={S.mdInfoLabel}>Chỉ định của bác sĩ</Text>
                <Text style={S.mdInfoValue}>{med.note}</Text>
              </View>
            </View>
          </View>

          <View style={S.mdWarningCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="warning" size={20} color={T.red} />
              <Text style={S.mdWarningTitle}>Kiêng cữ bắt buộc</Text>
            </View>
            <Text style={S.mdWarningTxt}>{med.restrictions}</Text>
          </View>
        </ScrollView>

        <View style={S.mdBottomBar}>
          <TouchableOpacity 
            style={[S.mdConfirmBtn, med.taken && { backgroundColor: T.border }]} 
            disabled={med.taken}
            onPress={() => {
              markAsTaken(med.id);
              setTimeout(() => setState('idle'), 400); // go back after success
            }}
          >
            <Ionicons name={med.taken ? "checkmark-done" : "checkmark-circle"} size={24} color={med.taken ? T.textSub : '#FFF'} style={{ marginRight: 10 }} />
            <Text style={[S.mdConfirmTxt, med.taken && { color: T.textSub }]}>
              {med.taken ? "ĐÃ HOÀN THÀNH" : "XÁC NHẬN ĐÃ UỐNG"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderTelehealth = () => {
    if (state === 'tele_finding') {
      return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={S.fullScreen}>
          <Text style={S.teleTitle}>Bác Sĩ Trực Tuyến</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.specScroll} contentContainerStyle={S.specContainer}>
            {SPECIALTIES.map(spec => (
              <TouchableOpacity 
                key={spec.id} 
                style={[S.specChip, selectedSpecialty === spec.id && S.specChipAct]}
                onPress={() => setSelectedSpecialty(spec.id)}
              >
                <Text style={S.specIcon}>{spec.icon}</Text>
                <Text style={[S.specTxt, selectedSpecialty === spec.id && S.specTxtAct]}>{spec.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
            {DOCTORS.filter(d => selectedSpecialty === 'all' || d.specialty.toLowerCase().includes(SPECIALTIES.find(s => s.id === selectedSpecialty)?.name.toLowerCase() || '')).map(doc => (
              <TouchableOpacity key={doc.id} style={S.docCard} onPress={() => setState('tele_room')}>
                <Image source={{ uri: doc.avatar }} style={S.docAvt} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[S.docName, { fontSize: 17, color: T.primary }]}>{doc.specialty}</Text>
                    {doc.online && <View style={S.onlineDot} />}
                  </View>
                  <Text style={[S.docSpec, { fontSize: 15, fontWeight: '700', color: T.text }]}>{doc.name}</Text>
                  <Text style={{ fontSize: 13, color: T.textSub, marginTop: 2, marginBottom: 6 }}>
                    {doc.position} • {doc.experience}
                  </Text>
                  <View style={S.docStats}>
                    <Ionicons name="star" size={14} color={T.amber} />
                    <Text style={S.docStatTxt}>{doc.rating}</Text>
                    <Text style={S.docStatTxt}> • {doc.fee}/15p</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      );
    }
    
    if (state === 'tele_room') {
      return (
        <Animated.View entering={SlideInUp} style={S.videoRoom}>
          <StatusBar hidden />
          <Image source={{ uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop' }} style={StyleSheet.absoluteFillObject} />
          <View style={S.videoOverlay}>
            <View style={S.videoHeader}>
              <View>
                <Text style={S.videoTitle}>BS. CKII Trần Tâm</Text>
                <Text style={S.videoTime}>02:14</Text>
              </View>
              <View style={S.liveVitals}>
                <Ionicons name="heart" size={14} color={T.red} />
                <Text style={S.liveVitalsTxt}> 76 bpm</Text>
              </View>
            </View>
            
            {/* My camera PiP */}
            <View style={S.myCamera}>
              <View style={S.myCameraInner}><Ionicons name="person" size={40} color="#CBD5E1" /></View>
            </View>
            
            <View style={S.videoControls}>
              <TouchableOpacity style={S.vCtrlBtn}><Ionicons name="mic-off" size={24} color="#FFF" /></TouchableOpacity>
              <TouchableOpacity style={[S.vCtrlBtn, { backgroundColor: T.red }]} onPress={() => setState('idle')}><Ionicons name="call" size={24} color="#FFF" /></TouchableOpacity>
              <TouchableOpacity style={S.vCtrlBtn}><Ionicons name="camera-reverse" size={24} color="#FFF" /></TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      );
    }
    return null;
  };

  const renderBooking = () => {
    if (state === 'book_search') {
      return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={S.fullScreen}>
          <View style={S.searchBox}>
            <Ionicons name="search" size={20} color={T.textMuted} />
            <TextInput placeholder="Tìm bệnh viện, phòng khám..." style={S.searchInput} placeholderTextColor={T.textMuted} />
          </View>
          <ScrollView style={{ flex: 1, padding: 20 }}>
            {HOSPITALS.map(h => (
              <TouchableOpacity key={h.id} style={S.hospCard} onPress={() => setState('book_slot')}>
                <View style={S.hospIcon}><FontAwesome5 name="hospital" size={20} color={T.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={S.hospName}>{h.name}</Text>
                  <Text style={S.hospAddr}>{h.address}</Text>
                  <Text style={S.hospDist}>{h.distance}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      );
    }
    
    if (state === 'book_slot') {
      return (
        <Animated.View entering={SlideInDown} exiting={FadeOut} style={S.fullScreen}>
          <ScrollView style={{ padding: 20 }}>
            <Text style={S.slotH1}>Bệnh viện Đa Khoa Tâm Anh</Text>
            <Text style={S.slotH2}>Chọn ngày khám</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 20 }}>
              {['Hôm nay', 'Ngày mai', 'Thứ 4', 'Thứ 5'].map((d, i) => (
                <View key={i} style={[S.dayChip, i===0 && S.dayChipAct]}><Text style={[S.dayTxt, i===0 && S.dayTxtAct]}>{d}</Text></View>
              ))}
            </ScrollView>
            
            <Text style={S.slotH2}>Chọn giờ khám</Text>
            <View style={S.slotGrid}>
              {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30'].map((t, i) => (
                <TouchableOpacity key={i} style={[S.timeSlot, i===2 && S.timeSlotAct]} onPress={() => {
                  setTimeout(() => setState('book_ticket'), 500);
                }}>
                  <Text style={[S.timeTxt, i===2 && S.timeTxtAct]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      );
    }
    
    if (state === 'book_ticket') {
      return (
        <Animated.View entering={SlideInUp.springify()} style={[S.fullScreen, { backgroundColor: T.primary, justifyContent: 'center', padding: 20 }]}>
          <View style={S.ticket}>
            <View style={S.ticketCutL} />
            <View style={S.ticketCutR} />
            <Text style={S.tkSuccess}>Đặt lịch thành công!</Text>
            <Ionicons name="qr-code" size={150} color={T.text} style={{ alignSelf: 'center', marginVertical: 20 }} />
            <Text style={S.tkLabel}>BỆNH VIỆN ĐA KHOA TÂM ANH</Text>
            <Text style={S.tkH1}>Khám Nội Tổng Quát</Text>
            <View style={S.tkRow}>
              <View>
                <Text style={S.tkSub}>Thời gian</Text>
                <Text style={S.tkVal}>09:00 AM</Text>
              </View>
              <View>
                <Text style={S.tkSub}>Số thứ tự</Text>
                <Text style={S.tkVal}>42</Text>
              </View>
            </View>
            <TouchableOpacity style={S.tkBtn} onPress={() => setState('idle')}><Text style={S.tkBtnTxt}>VỀ TRANG CHỦ</Text></TouchableOpacity>
          </View>
        </Animated.View>
      );
    }
    return null;
  };

  const renderPharmacy = () => {
    if (state !== 'pharma_home') return null;
    return (
      <Animated.View entering={FadeIn} style={S.fullScreen}>
        <ScrollView style={{ padding: 20 }}>
          {/* Upload Rx */}
          <TouchableOpacity style={S.uploadRx}>
            <Ionicons name="camera" size={32} color={T.primary} />
            <Text style={S.uploadTitle}>Tải đơn thuốc lên</Text>
            <Text style={S.uploadSub}>Chụp ảnh đơn bác sĩ, dược sĩ sẽ soạn thuốc giao tận nơi</Text>
          </TouchableOpacity>
          
          <Text style={S.sectionTitle}>Thuốc không kê đơn (OTC)</Text>
          {OTC_MEDS.map(m => (
            <View key={m.id} style={S.medCard}>
              <View style={[S.medIcon, { backgroundColor: m.color + '20' }]}><FontAwesome5 name={m.icon as any} size={20} color={m.color} /></View>
              <View style={{ flex: 1 }}>
                <Text style={S.medName}>{m.name}</Text>
                <Text style={S.medType}>{m.type}</Text>
                <Text style={S.medPrice}>{m.price}</Text>
              </View>
              <TouchableOpacity style={S.addBtn}><Ionicons name="add" size={20} color="#FFF" /></TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
      <StatusBar barStyle={state === 'medical_id' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      {renderTopBar()}
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        {renderDashboard()}
        {renderMedDetail()}
        {renderTelehealth()}
        {renderBooking()}
        {renderPharmacy()}
      </View>
      {renderMedicalID()}

      {/* Alarm Modal */}
      <Modal visible={!!alarmMed} transparent animationType="fade">
        <View style={S.alarmOverlay}>
          <Animated.View entering={SlideInUp.springify()} style={S.alarmBox}>
            <View style={S.alarmIconWrap}>
              <Ionicons name="notifications-circle" size={80} color={T.red} />
            </View>
            <Text style={S.alarmTitle}>ĐẾN GIỜ UỐNG THUỐC!</Text>
            {alarmMed && (
              <View style={S.alarmContent}>
                <Text style={S.alarmMedName}>{alarmMed.dosage} {alarmMed.name}</Text>
                <Text style={S.alarmNote}>{alarmMed.note}</Text>
                <View style={S.alarmWarningBox}>
                  <Ionicons name="warning" size={16} color={T.amber} style={{ marginRight: 6 }} />
                  <Text style={S.alarmWarningTxt}>{alarmMed.restrictions}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity 
              style={S.alarmConfirmBtn} 
              onPress={() => {
                if (alarmMed) markAsTaken(alarmMed.id);
                setAlarmMed(null);
              }}
            >
              <Text style={S.alarmConfirmTxt}>XÁC NHẬN ĐÃ UỐNG</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={S.alarmSnoozeBtn} 
              onPress={() => setAlarmMed(null)}
            >
              <Text style={S.alarmSnoozeTxt}>Bỏ qua (Nhắc lại sau 5 phút)</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg, width: '100%' },
  desktop: { maxWidth: 420, maxHeight: 860, alignSelf: 'center', borderWidth: 10, borderColor: '#E2E8F0', borderRadius: 48, overflow: 'hidden', marginVertical: 20 },
  fullScreen: { flex: 1, backgroundColor: T.bg },
  scrollArea: { flex: 1, padding: 20 },
  
  // TopBar
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30, paddingBottom: 15, backgroundColor: T.bg, zIndex: 10 },
  backBtn: { padding: 8, marginLeft: -8 },
  topTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: T.text, textAlign: 'center' },
  profileBtn: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },

  // Dashboard Greet
  greetSection: { marginBottom: 25 },
  greetTxt: { fontSize: 24, fontWeight: '800', color: T.text, marginBottom: 4 },
  subGreetTxt: { fontSize: 14, color: T.textSub, lineHeight: 20 },

  // SOS Slider
  sosContainer: { backgroundColor: T.redLight, borderRadius: 20, padding: 16, marginBottom: 25, borderWidth: 1, borderColor: '#FECACA' },
  sosLabel: { color: T.red, fontSize: 11, fontWeight: '800', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 },
  sliderTrack: { height: 60, backgroundColor: '#FFF', borderRadius: 30, justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  sliderTextWrap: { position: 'absolute', width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  sliderText: { color: T.red, fontWeight: '700', fontSize: 15, opacity: 0.8, marginRight: 8 },
  sliderThumb: { width: 56, height: 56, borderRadius: 28, backgroundColor: T.red, position: 'absolute', left: 2, top: 2, justifyContent: 'center', alignItems: 'center', zIndex: 2, elevation: 5, shadowColor: T.red, shadowOpacity: 0.3, shadowRadius: 8 },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: T.red, opacity: 0.1, zIndex: 1 },

  // Vitals
  vitalsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  vitalCard: { flex: 1, backgroundColor: T.card, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  vitalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  vitalTitle: { fontSize: 14, fontWeight: '600', color: T.textSub, marginLeft: 8 },
  vitalValue: { fontSize: 24, fontWeight: '800', color: T.text, marginBottom: 8 },
  vitalUnit: { fontSize: 14, fontWeight: '600', color: T.textSub },
  progressBar: { height: 6, backgroundColor: T.bg, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  vitalStatus: { fontSize: 13, fontWeight: '600', color: T.green },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 15 },
  
  // Reminder
  reminderCard: { flexDirection: 'row', backgroundColor: T.card, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  reminderIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  reminderInfo: { flex: 1, marginLeft: 12 },
  reminderTime: { fontSize: 12, fontWeight: '600', color: T.amber, marginBottom: 4 },
  reminderName: { fontSize: 15, fontWeight: '700', color: T.text },
  checkBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: T.green, justifyContent: 'center', alignItems: 'center' },

  // Services
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  serviceItem: { width: '47%', backgroundColor: T.card, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  serviceIconWrap: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  serviceTxt: { fontSize: 15, fontWeight: '700', color: T.text },

  // Medical ID Screen
  medicalIdScreen: { ...StyleSheet.absoluteFillObject, backgroundColor: T.red, zIndex: 100 },
  sosAlertTxt: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  sosTimerTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 40, textAlign: 'center' },
  idCard: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  idHeader: { fontSize: 18, fontWeight: '800', color: T.text, textAlign: 'center', marginBottom: 15 },
  idDivider: { height: 1, backgroundColor: T.border, marginBottom: 15 },
  idLabel: { fontSize: 12, fontWeight: '600', color: T.textSub, textTransform: 'uppercase', marginBottom: 4 },
  idValue: { fontSize: 18, fontWeight: '700', color: T.text },
  cancelSosBtn: { marginTop: 40, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.2)' },
  cancelSosTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Telehealth
  teleTitle: { fontSize: 22, fontWeight: '800', color: T.text, paddingHorizontal: 20, marginBottom: 10 },
  specScroll: { maxHeight: 50, marginBottom: 15 },
  specContainer: { paddingHorizontal: 20, gap: 10 },
  specChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.border, height: 40 },
  specChipAct: { backgroundColor: T.primary, borderColor: T.primary },
  specIcon: { fontSize: 16, marginRight: 6 },
  specTxt: { fontSize: 14, fontWeight: '600', color: T.textSub },
  specTxtAct: { color: '#FFF' },
  docCard: { flexDirection: 'row', backgroundColor: T.card, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8 },
  docAvt: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  docName: { fontSize: 16, fontWeight: '700', color: T.text },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.green },
  docSpec: { fontSize: 14, color: T.textSub, marginTop: 4, marginBottom: 8 },
  docStats: { flexDirection: 'row', alignItems: 'center' },
  docStatTxt: { fontSize: 13, fontWeight: '600', color: T.textSub, marginLeft: 4 },
  
  // Video Room
  videoRoom: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', zIndex: 50 },
  videoOverlay: { flex: 1, justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, backgroundColor: 'rgba(0,0,0,0.2)' },
  videoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  videoTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  videoTime: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  liveVitals: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignItems: 'center' },
  liveVitalsTxt: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  myCamera: { position: 'absolute', bottom: 120, right: 20, width: 100, height: 140, borderRadius: 16, backgroundColor: '#1E293B', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  myCameraInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoControls: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingBottom: 20 },
  vCtrlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' },

  // Booking
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, marginHorizontal: 20, paddingHorizontal: 16, height: 50, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: T.text },
  hospCard: { flexDirection: 'row', backgroundColor: T.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border },
  hospIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: T.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  hospName: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 4 },
  hospAddr: { fontSize: 13, color: T.textSub, marginBottom: 6 },
  hospDist: { fontSize: 12, fontWeight: '600', color: T.primary },
  
  slotH1: { fontSize: 20, fontWeight: '800', color: T.text, marginBottom: 20 },
  slotH2: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 12 },
  dayChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: T.card, marginRight: 10, borderWidth: 1, borderColor: T.border },
  dayChipAct: { backgroundColor: T.primary, borderColor: T.primary },
  dayTxt: { fontSize: 14, fontWeight: '600', color: T.textSub },
  dayTxtAct: { color: '#FFF' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { width: '31%', paddingVertical: 12, backgroundColor: T.card, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  timeSlotAct: { backgroundColor: T.primaryLight, borderColor: T.primary },
  timeTxt: { fontSize: 15, fontWeight: '600', color: T.text },
  timeTxtAct: { color: T.primary },

  // Ticket
  ticket: { backgroundColor: '#FFF', borderRadius: 24, padding: 30, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10, position: 'relative' },
  ticketCutL: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: T.primary, left: -15, top: '40%' },
  ticketCutR: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: T.primary, right: -15, top: '40%' },
  tkSuccess: { fontSize: 18, fontWeight: '700', color: T.green, textAlign: 'center' },
  tkLabel: { fontSize: 12, fontWeight: '700', color: T.textSub, textAlign: 'center', marginBottom: 4 },
  tkH1: { fontSize: 22, fontWeight: '800', color: T.text, textAlign: 'center', marginBottom: 30 },
  tkRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: T.border, paddingTop: 20 },
  tkSub: { fontSize: 13, color: T.textSub, marginBottom: 4 },
  tkVal: { fontSize: 18, fontWeight: '700', color: T.text },
  tkBtn: { marginTop: 40, backgroundColor: T.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  tkBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Pharmacy
  uploadRx: { borderWidth: 2, borderColor: T.primary, borderStyle: 'dashed', borderRadius: 16, padding: 24, alignItems: 'center', backgroundColor: T.primaryLight + '50', marginBottom: 25 },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: T.primary, marginTop: 12, marginBottom: 4 },
  uploadSub: { fontSize: 13, color: T.textSub, textAlign: 'center', paddingHorizontal: 20 },
  medCard: { flexDirection: 'row', backgroundColor: T.card, borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  medIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  medName: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 4 },
  medType: { fontSize: 13, color: T.textSub, marginBottom: 6 },
  medPrice: { fontSize: 15, fontWeight: '700', color: T.primary },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center' },

  // Alarm Modal
  alarmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alarmBox: { width: '100%', backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', shadowColor: T.red, shadowOpacity: 0.5, shadowRadius: 30, elevation: 20 },
  alarmIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: T.redLight, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alarmTitle: { fontSize: 24, fontWeight: '900', color: T.red, marginBottom: 25, textAlign: 'center' },
  alarmContent: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 30 },
  alarmMedName: { fontSize: 20, fontWeight: '800', color: T.text, marginBottom: 8, textAlign: 'center' },
  alarmNote: { fontSize: 15, color: T.textSub, textAlign: 'center', marginBottom: 15 },
  alarmWarningBox: { flexDirection: 'row', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  alarmWarningTxt: { fontSize: 14, fontWeight: '700', color: T.amber },
  alarmConfirmBtn: { width: '100%', backgroundColor: T.green, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 15 },
  alarmConfirmTxt: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  alarmSnoozeBtn: { paddingVertical: 10 },
  alarmSnoozeTxt: { color: T.textSub, fontSize: 14, fontWeight: '600' },

  // Medication Detail Screen
  medDetailScreen: { ...StyleSheet.absoluteFillObject, backgroundColor: '#F8FAFC', zIndex: 100 },
  mdHeader: { alignItems: 'center', marginVertical: 30 },
  mdIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: T.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mdName: { fontSize: 26, fontWeight: '900', color: T.text, marginBottom: 8, textAlign: 'center' },
  mdDosage: { fontSize: 18, fontWeight: '600', color: T.primary },
  
  mdInfoCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, marginBottom: 20 },
  mdInfoRow: { flexDirection: 'row', alignItems: 'center' },
  mdInfoLabel: { fontSize: 13, fontWeight: '600', color: T.textSub, textTransform: 'uppercase', marginBottom: 4 },
  mdInfoValue: { fontSize: 18, fontWeight: '700', color: T.text },
  mdDivider: { height: 1, backgroundColor: T.border, marginVertical: 15 },
  
  mdWarningCard: { backgroundColor: '#FEF2F2', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#FECACA', marginBottom: 120 },
  mdWarningTitle: { fontSize: 16, fontWeight: '800', color: T.red, marginLeft: 8 },
  mdWarningTxt: { fontSize: 15, fontWeight: '600', color: T.red, lineHeight: 22 },
  
  mdBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: T.border },
  mdConfirmBtn: { flexDirection: 'row', backgroundColor: T.green, paddingVertical: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  mdConfirmTxt: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
