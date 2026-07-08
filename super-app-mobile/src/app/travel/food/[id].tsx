import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView, StatusBar, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

const FOOD_DETAILS: Record<string, any> = {
  '1': {
    id: '1', name: 'Bún chả Hương Liên', rating: 4.8, reviews: 1540, 
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?w=800',
    description: 'Nổi tiếng với bữa ăn của cựu Tổng thống Mỹ Obama. Quán giữ nguyên hương vị truyền thống Hà Nội với nước chấm pha vừa vặn, thịt nướng than hoa thơm lừng.',
    openTime: '08:00 - 20:30',
    address: '24 Lê Văn Hưu, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội',
    menu: [
      { id: 'm1', name: 'Combo Obama (Bún chả + Nem hải sản + Bia HN)', price: 120000 },
      { id: 'm2', name: 'Bún chả xịn', price: 60000 },
      { id: 'm3', name: 'Nem cua bể', price: 30000 },
    ],
    aiSuggestion: 'Bạn đang đi một mình. Gợi ý gọi 1 Bún chả xịn và 1 Nem cua bể (Tổng 90k) là vừa đủ no. Nên đến trước 11h30 để tránh đông đúc.'
  }
};

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  
  const food = FOOD_DETAILS[id as string] || FOOD_DETAILS['1'];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/travel/food');
    }
  };

  return (
    <View style={[S.root, { backgroundColor: theme.background || '#F8FAFC' }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={S.imageHeader}>
          <Image source={{ uri: food.image }} style={S.mainImage} />
          <View style={[S.headerBtns, { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 }]}>
            <TouchableOpacity style={S.iconBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity style={S.iconBtn}>
              <Ionicons name="heart-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={S.content}>
          <View style={S.titleRow}>
            <Text style={S.name}>{food.name}</Text>
            <View style={S.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={S.ratingTxtBadge}>{food.rating}</Text>
            </View>
          </View>
          <View style={S.metaRow}>
            <Ionicons name="location" size={14} color="#64748B" />
            <Text style={S.metaText}>{food.address}</Text>
          </View>
          <View style={S.metaRow}>
            <Ionicons name="time" size={14} color="#64748B" />
            <Text style={S.metaText}>Giờ mở cửa: {food.openTime}</Text>
          </View>
          
          <Text style={S.description}>{food.description}</Text>

          {/* AI SUGGESTION */}
          <View style={S.aiBox}>
            <View style={S.aiHeader}>
              <Ionicons name="restaurant" size={18} color="#EA580C" />
              <Text style={S.aiTitle}>AI Gợi ý chọn món</Text>
            </View>
            <Text style={S.aiText}>{food.aiSuggestion}</Text>
          </View>

          {/* MENU */}
          <Text style={S.sectionTitle}>Thực đơn nổi bật</Text>
          <View style={S.menuBox}>
            {food.menu.map((item: any) => (
              <View key={item.id} style={S.menuItem}>
                <Text style={S.menuItemName}>{item.name}</Text>
                <Text style={S.menuItemPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={S.bottomBar}>
        <TouchableOpacity style={S.dirBtn} onPress={() => Linking.openURL('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(food.address))}>
          <Ionicons name="navigate" size={20} color="#3B82F6" />
          <Text style={S.dirBtnText}>Dẫn đường</Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.bookBtn} onPress={() => router.push({ pathname: '/travel/checkout', params: { type: 'table', name: food.name, price: 0 } })}>
          <Text style={S.bookBtnText}>Đặt bàn trước</Text>
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
  headerBtns: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  
  content: { padding: 16, marginTop: -24, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingTxtBadge: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  metaText: { fontSize: 14, color: '#64748B', flex: 1 },
  description: { fontSize: 15, color: '#334155', lineHeight: 22, marginVertical: 16 },

  aiBox: { backgroundColor: '#FFF7ED', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFEDD5', marginBottom: 24 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: '#EA580C' },
  aiText: { fontSize: 14, color: '#C2410C', lineHeight: 20 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  menuBox: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuItemName: { fontSize: 15, color: '#1E293B', flex: 1 },
  menuItemPrice: { fontSize: 15, fontWeight: '600', color: '#F97316', marginLeft: 16 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 12 },
  dirBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  dirBtnText: { color: '#3B82F6', fontSize: 16, fontWeight: '600' },
  bookBtn: { flex: 1, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
