import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

const CAMPING_DETAILS: Record<string, any> = {
  '1': {
    id: '1', name: 'Đồng Mô Discovery', rating: 4.6, reviews: 312, price: 150000, 
    image: 'https://images.unsplash.com/photo-1504280327387-5c3244266380?w=800',
    description: 'Khu cắm trại Đồng Mô với bãi cỏ rộng rãi ven hồ, cực kỳ thích hợp cho gia đình và nhóm bạn dịp cuối tuần. Nơi đây cách trung tâm Hà Nội chỉ khoảng 40km.',
    amenities: ['Điện/Nước sạch', 'Khu vệ sinh', 'Cho thuê lều', 'Bếp nướng BBQ', 'Chèo SUP', 'Chỗ đỗ xe'],
    weather: { temp: 24, status: 'Nhiều mây, có lúc có mưa rào', warning: 'Khu vực gần hồ có nhiều muỗi và côn trùng sau mưa.' }
  }
};

const DEFAULT_CHECKLIST = [
  { id: '1', text: 'Lều cắm trại & Tấm lót', checked: false },
  { id: '2', text: 'Túi ngủ / Chăn mỏng', checked: false },
  { id: '3', text: 'Đèn pin / Đèn lều', checked: false },
  { id: '4', text: 'Bếp gas mini & Đồ ăn', checked: false },
  { id: '5', text: 'Xịt chống muỗi & Thuốc y tế', checked: true },
];

export default function CampingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  
  const camp = CAMPING_DETAILS[id as string] || CAMPING_DETAILS['1'];
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/travel/camping');
    }
  };

  return (
    <View style={[S.root, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={S.imageHeader}>
          <Image source={{ uri: camp.image }} style={S.mainImage} />
        </View>

        <View style={S.content}>
          <View style={S.titleRow}>
            <Text style={S.name}>{camp.name}</Text>
            <View style={S.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={S.ratingTxtBadge}>{camp.rating}</Text>
            </View>
          </View>
          <Text style={S.description}>{camp.description}</Text>

          {/* AI WEATHER & WARNING */}
          <View style={S.aiBox}>
            <View style={S.aiHeader}>
              <Ionicons name="cloudy-night" size={18} color="#0369A1" />
              <Text style={S.aiTitle}>Thời tiết & Cảnh báo khu vực</Text>
            </View>
            <Text style={S.aiText}>Nhiệt độ hiện tại: {camp.weather.temp}°C. {camp.weather.status}.</Text>
            <View style={S.warningRow}>
              <Ionicons name="warning" size={16} color="#DC2626" />
              <Text style={S.warningText}>{camp.weather.warning}</Text>
            </View>
          </View>

          {/* AMENITIES */}
          <Text style={S.sectionTitle}>Tiện ích có sẵn</Text>
          <View style={S.amenitiesGrid}>
            {camp.amenities.map((amenity: string, i: number) => (
              <View key={i} style={S.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={S.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          {/* CHECKLIST */}
          <View style={S.checklistHeader}>
            <Text style={S.sectionTitle}>Check-list đồ cần mang</Text>
            <Text style={S.aiSuggested}>AI Gợi ý thêm</Text>
          </View>
          <View style={S.checklistBox}>
            {checklist.map(item => (
              <TouchableOpacity key={item.id} style={S.checkItem} onPress={() => toggleCheck(item.id)}>
                <Ionicons name={item.checked ? "checkbox" : "square-outline"} size={24} color={item.checked ? "#16A34A" : "#94A3B8"} />
                <Text style={[S.checkText, item.checked && S.checkTextDone]}>{item.text}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={S.addCheckItemBtn}>
              <Ionicons name="add" size={20} color="#3B82F6" />
              <Text style={S.addCheckText}>Thêm vật dụng</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={S.headerGradient}>
        <SafeAreaView>
          <View style={S.headerBtns}>
            <TouchableOpacity onPress={handleBack} style={S.iconBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* BOTTOM ACTION BAR */}
      <View style={S.bottomBar}>
        <View style={S.priceInfo}>
          <Text style={S.priceValue}>{camp.price.toLocaleString('vi-VN')}đ<Text style={S.priceUnit}>/vé</Text></Text>
          <Text style={S.totalDays}>Phí vào cổng & Dọn vệ sinh</Text>
        </View>
        <TouchableOpacity style={S.bookBtn} onPress={() => router.push({ pathname: '/travel/checkout', params: { type: 'camping', id: camp.id, price: camp.price, name: camp.name } } as any)}>
          <Text style={S.bookBtnText}>Mua vé ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  imageHeader: { position: 'relative', height: 260 },
  mainImage: { width: '100%', height: '100%' },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 10, elevation: 10 },
  headerBtns: { flexDirection: 'row', paddingHorizontal: 16, marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  
  content: { padding: 16, marginTop: -24, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 24, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingTxtBadge: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  description: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 24 },

  aiBox: { backgroundColor: '#F0F9FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#BAE6FD', marginBottom: 24 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: '#0369A1' },
  aiText: { fontSize: 14, color: '#0C4A6E', marginBottom: 8 },
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, gap: 8 },
  warningText: { fontSize: 13, color: '#991B1B', flex: 1 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, width: '47%', gap: 8 },
  amenityText: { fontSize: 13, color: '#334155', flex: 1 },

  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiSuggested: { fontSize: 12, color: '#8B5CF6', fontWeight: '600', backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 16 },
  checklistBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  checkText: { fontSize: 15, color: '#334155', flex: 1 },
  checkTextDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  addCheckItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  addCheckText: { fontSize: 14, color: '#3B82F6', fontWeight: '500' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  priceInfo: { flex: 1 },
  priceValue: { fontSize: 20, fontWeight: '700', color: '#16A34A' },
  priceUnit: { fontSize: 14, fontWeight: '400', color: '#64748B' },
  totalDays: { fontSize: 13, color: '#64748B' },
  bookBtn: { backgroundColor: '#16A34A', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
