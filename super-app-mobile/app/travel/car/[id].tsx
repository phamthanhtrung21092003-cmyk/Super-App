import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

const CAR_DETAILS: Record<string, any> = {
  '1': {
    id: '1', name: 'Mazda 3 2023', type: 'Sedan • 5 chỗ', transmission: 'Tự động', price: 800000, 
    rating: 4.9, reviews: 124, image: 'https://images.unsplash.com/photo-1598555310613-2287f37e4130?w=800',
    images: ['https://images.unsplash.com/photo-1598555310613-2287f37e4130?w=400', 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400'],
    specs: { seats: 5, doors: 4, fuel: 'Xăng', fuelConsumption: '6.5L/100km' },
    conditions: ['Bằng lái B1 trở lên', 'Cọc 15 triệu hoặc xe máy có giá trị tương đương'],
    isRisky: true, riskyReason: 'Bạn dự định đi cung đường đèo núi (Hà Giang). Xe Sedan gầm thấp có thể gặp khó khăn và không an toàn. Đề xuất đổi sang xe SUV/Bán tải.'
  },
  '2': {
    id: '2', name: 'Toyota Fortuner 2022', type: 'SUV • 7 chỗ', transmission: 'Tự động', price: 1200000, 
    rating: 4.8, reviews: 85, image: 'https://images.unsplash.com/photo-1590362891991-f7055743a12a?w=800',
    images: ['https://images.unsplash.com/photo-1590362891991-f7055743a12a?w=400'],
    specs: { seats: 7, doors: 4, fuel: 'Dầu', fuelConsumption: '8.0L/100km' },
    conditions: ['Bằng lái B2 trở lên', 'Cọc 20 triệu'],
    isRisky: false, riskyReason: ''
  }
};

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  
  const car = CAR_DETAILS[id as string] || CAR_DETAILS['2'];
  const [days, setDays] = useState(3);
  const [distance] = useState(300); // Giả lập quãng đường
  const deliveryFee = 150000;
  
  // Tính tiền xăng giả lập
  const fuelCostPerKm = car.specs.fuel === 'Xăng' ? 2500 : 2000;
  const estimatedFuelCost = distance * fuelCostPerKm;
  const totalCost = (car.price * days) + estimatedFuelCost + deliveryFee;

  const handleBooking = () => {
    router.push({ pathname: '/travel/checkout', params: { type: 'car', id: car.id, price: totalCost, name: car.name } } as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/travel/car');
    }
  };

  return (
    <View style={[S.root, { backgroundColor: theme.background || '#F8FAFC' }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER IMAGE */}
        <View style={S.imageHeader}>
          <Image source={{ uri: car.image }} style={S.mainImage} />
        </View>

        <View style={S.content}>
          {/* CAR INFO */}
          <View style={S.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={S.carName}>{car.name}</Text>
              <Text style={S.carType}>{car.type} • {car.transmission}</Text>
            </View>
            <View style={S.ratingBox}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={S.ratingTxt}>{car.rating}</Text>
              <Text style={S.reviewCount}>({car.reviews})</Text>
            </View>
          </View>

          {/* AI SAFETY WARNING */}
          {car.isRisky && (
            <View style={S.warningBanner}>
              <Ionicons name="warning" size={24} color="#DC2626" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={S.warningTitle}>Cảnh báo AI: Xe không phù hợp</Text>
                <Text style={S.warningText}>{car.riskyReason}</Text>
              </View>
            </View>
          )}

          {/* SPECS */}
          <Text style={S.sectionTitle}>Thông số kỹ thuật</Text>
          <View style={S.specsGrid}>
            <View style={S.specItem}>
              <Ionicons name="people-outline" size={24} color="#3B82F6" />
              <Text style={S.specLabel}>Số chỗ</Text>
              <Text style={S.specValue}>{car.specs.seats}</Text>
            </View>
            <View style={S.specItem}>
              <Ionicons name="water-outline" size={24} color="#3B82F6" />
              <Text style={S.specLabel}>Nhiên liệu</Text>
              <Text style={S.specValue}>{car.specs.fuel}</Text>
            </View>
            <View style={S.specItem}>
              <Ionicons name="speedometer-outline" size={24} color="#3B82F6" />
              <Text style={S.specLabel}>Mức tiêu hao</Text>
              <Text style={S.specValue}>{car.specs.fuelConsumption}</Text>
            </View>
          </View>

          {/* CONDITIONS */}
          <Text style={S.sectionTitle}>Điều kiện thuê xe</Text>
          <View style={S.conditionsBox}>
            {car.conditions.map((c: string, i: number) => (
              <View key={i} style={S.conditionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={S.conditionText}>{c}</Text>
              </View>
            ))}
          </View>

          {/* AI COST OPTIMIZER */}
          <Text style={S.sectionTitle}>AI Ước tính chi phí chuyến đi</Text>
          <View style={S.costBox}>
            <View style={S.costRow}>
              <Text style={S.costLabel}>Tiền thuê xe ({days} ngày)</Text>
              <Text style={S.costValue}>{(car.price * days).toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={S.costRow}>
              <Text style={S.costLabel}>Dự tính tiền xăng (~{distance}km)</Text>
              <Text style={S.costValue}>{estimatedFuelCost.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={S.costRow}>
              <Text style={S.costLabel}>Phí giao nhận xe tận nơi</Text>
              <Text style={S.costValue}>{deliveryFee.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={[S.costRow, S.totalRow]}>
              <Text style={S.totalLabel}>Tổng dự kiến</Text>
              <Text style={S.totalValue}>{totalCost.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>

        </View>
      </ScrollView>

      <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={S.headerGradient}>
        <SafeAreaView>
          <TouchableOpacity onPress={handleBack} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      {/* BOTTOM ACTION BAR */}
      <View style={S.bottomBar}>
        <View style={S.priceInfo}>
          <Text style={S.priceValue}>{car.price.toLocaleString('vi-VN')}đ<Text style={S.priceUnit}>/ngày</Text></Text>
          <Text style={S.totalDays}>Tổng cho {days} ngày</Text>
        </View>
        <TouchableOpacity style={S.bookBtn} onPress={handleBooking}>
          <Text style={S.bookBtnText}>Đặt xe ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  imageHeader: { position: 'relative', height: 280 },
  mainImage: { width: '100%', height: '100%' },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 10, elevation: 10 },
  backBtn: { padding: 16, marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  
  content: { padding: 16, marginTop: -24, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  carName: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  carType: { fontSize: 16, color: '#64748B' },
  ratingBox: { alignItems: 'flex-end' },
  ratingTxt: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  reviewCount: { fontSize: 13, color: '#64748B' },

  warningBanner: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', marginBottom: 24 },
  warningTitle: { fontSize: 15, fontWeight: '700', color: '#B91C1C', marginBottom: 4 },
  warningText: { fontSize: 14, color: '#991B1B', lineHeight: 20 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16, marginTop: 8 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  specItem: { flex: 1, minWidth: 100, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, alignItems: 'center' },
  specLabel: { fontSize: 13, color: '#64748B', marginTop: 8, marginBottom: 4 },
  specValue: { fontSize: 15, fontWeight: '600', color: '#0F172A' },

  conditionsBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, gap: 12, marginBottom: 24 },
  conditionItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  conditionText: { fontSize: 15, color: '#334155', flex: 1 },

  costBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  costLabel: { fontSize: 14, color: '#475569' },
  costValue: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#CBD5E1', paddingTop: 12, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#3B82F6' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  priceInfo: { flex: 1 },
  priceValue: { fontSize: 20, fontWeight: '700', color: '#3B82F6' },
  priceUnit: { fontSize: 14, fontWeight: '400', color: '#64748B' },
  totalDays: { fontSize: 13, color: '#64748B' },
  bookBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
