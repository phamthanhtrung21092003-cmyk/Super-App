import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function RideBooking() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState('car7');
  
  // Mock Route Region
  const region = {
    latitude: 21.018511,
    longitude: 105.804817,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  
  const vehicles = [
    { id: 'bike', name: 'Xe máy', seats: 1, price: '52.000đ', eta: '14 phút', recommended: false, icon: 'bicycle' },
    { id: 'ev', name: 'Taxi điện', seats: 4, price: '65.000đ', eta: '16 phút', recommended: false, icon: 'car' },
    { id: 'car7', name: 'Ô tô 7 chỗ', seats: 7, price: '80.000đ', eta: '15 phút', recommended: true, icon: 'car-sport' },
    { id: 'suv', name: 'SUV Luxury', seats: 4, price: '110.000đ', eta: '15 phút', recommended: false, icon: 'car-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn loại xe</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={region}>
          <Marker coordinate={{ latitude: 21.028511, longitude: 105.804817 }} pinColor="#3B82F6" />
          <Marker coordinate={{ latitude: 21.008511, longitude: 105.814817 }} pinColor="#EF4444" />
          <Polyline 
            coordinates={[
              { latitude: 21.028511, longitude: 105.804817 },
              { latitude: 21.008511, longitude: 105.814817 }
            ]}
            strokeColor="#10B981"
            strokeWidth={4}
          />
        </MapView>
      </View>

      <View style={styles.bookingPanel}>
        {/* AI Smart Suggestion */}
        <View style={styles.aiBubble}>
          <Ionicons name="sparkles" size={20} color="#F59E0B" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiMessage}>Nhóm bạn có 4 người. Xe 7 chỗ chỉ đắt hơn 15.000đ. Đề xuất chọn xe 7 chỗ để ngồi thoải mái hơn.</Text>
          </View>
        </View>

        <ScrollView style={styles.vehicleList} showsVerticalScrollIndicator={false}>
          {vehicles.map(v => (
            <TouchableOpacity 
              key={v.id} 
              style={[styles.vehicleItem, selectedVehicle === v.id && styles.vehicleItemSelected]}
              onPress={() => setSelectedVehicle(v.id)}
            >
              <View style={styles.vehicleIcon}>
                <Ionicons name={v.icon as any} size={28} color={selectedVehicle === v.id ? '#10B981' : '#475569'} />
              </View>
              <View style={styles.vehicleInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.vehicleName, selectedVehicle === v.id && { color: '#10B981' }]}>{v.name}</Text>
                  <View style={styles.seatsBadge}>
                    <Ionicons name="person" size={10} color="#64748B" />
                    <Text style={styles.seatsText}>{v.seats}</Text>
                  </View>
                </View>
                <Text style={styles.vehicleEta}>Cách bạn {v.eta}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={[styles.priceText, selectedVehicle === v.id && { color: '#10B981' }]}>{v.price}</Text>
                {v.recommended && <Text style={styles.recommendedText}>Tối ưu nhất</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.paymentMethod}>
            <Ionicons name="wallet" size={24} color="#3B82F6" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.paymentName}>Ví SuperPay</Text>
              <Text style={styles.paymentPromo}>Hoàn 8% nhờ AI tối ưu</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bookButton} onPress={() => router.push('/ride/tracking')}>
            <Text style={styles.bookButtonText}>Đặt Xe 7 chỗ - 80.000đ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#FFFFFF', zIndex: 10 },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  
  bookingPanel: { height: 480, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 24 },
  
  aiBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  aiMessage: { color: '#D97706', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  
  vehicleList: { padding: 20 },
  vehicleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, marginBottom: 12, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: 'transparent' },
  vehicleItemSelected: { backgroundColor: '#F0FDF4', borderColor: '#10B981' },
  vehicleIcon: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  vehicleInfo: { flex: 1, marginLeft: 12 },
  vehicleName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  seatsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  seatsText: { fontSize: 12, color: '#64748B', marginLeft: 2, fontWeight: 'bold' },
  vehicleEta: { fontSize: 13, color: '#64748B' },
  priceContainer: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  recommendedText: { fontSize: 11, color: '#F59E0B', fontWeight: 'bold', marginTop: 4 },
  
  footer: { padding: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, marginBottom: 16 },
  paymentName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  paymentPromo: { fontSize: 12, color: '#10B981', fontWeight: '600', marginTop: 2 },
  bookButton: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 20, alignItems: 'center', elevation: 4, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  bookButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
