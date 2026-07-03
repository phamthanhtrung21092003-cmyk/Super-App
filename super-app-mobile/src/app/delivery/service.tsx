import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DeliveryService() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState('standard');
  const [selectedVehicle, setSelectedVehicle] = useState('bike');

  const services = [
    { id: 'express', name: 'Siêu tốc', price: '45.000đ', eta: '30 phút', desc: 'Giao nhanh nhất' },
    { id: 'standard', name: 'Tiêu chuẩn', price: '25.000đ', eta: '4 giờ', desc: 'Tiết kiệm chi phí', aiRecommend: true },
  ];

  const vehicles = [
    { id: 'bike', name: 'Xe máy', icon: 'bicycle', disabled: false },
    { id: 'van', name: 'Xe Van (Nhỏ)', icon: 'car-sport', disabled: false, eco: true },
    { id: 'truck', name: 'Xe tải', icon: 'bus', disabled: true, reason: 'AI: Không cần thiết cho kiện hàng 2.5kg' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dịch vụ & Phương tiện</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Service Selection */}
        <Text style={styles.sectionTitle}>Loại dịch vụ</Text>
        <View style={styles.serviceList}>
          {services.map(s => (
            <TouchableOpacity 
              key={s.id} 
              style={[styles.serviceItem, selectedService === s.id && styles.serviceItemSelected]}
              onPress={() => setSelectedService(s.id)}
            >
              <View style={styles.serviceHeader}>
                <Text style={[styles.serviceName, selectedService === s.id && { color: '#10B981' }]}>{s.name}</Text>
                <Text style={[styles.servicePrice, selectedService === s.id && { color: '#10B981' }]}>{s.price}</Text>
              </View>
              <Text style={styles.serviceDesc}>{s.desc} • Chờ {s.eta}</Text>
              
              {s.aiRecommend && (
                <View style={styles.aiTag}>
                  <Ionicons name="sparkles" size={14} color="#D97706" />
                  <Text style={styles.aiTagText}>AI Khuyên Dùng: Tiết kiệm 20.000đ do bạn không vội.</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Vehicle Selection */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Phương tiện vận chuyển</Text>
        <View style={styles.vehicleList}>
          {vehicles.map(v => (
            <TouchableOpacity 
              key={v.id} 
              disabled={v.disabled}
              style={[
                styles.vehicleItem, 
                selectedVehicle === v.id && styles.vehicleItemSelected,
                v.disabled && styles.vehicleItemDisabled
              ]}
              onPress={() => setSelectedVehicle(v.id)}
            >
              <View style={styles.vehicleIconWrapper}>
                 <Ionicons name={v.icon as any} size={28} color={v.disabled ? '#CBD5E1' : (selectedVehicle === v.id ? '#10B981' : '#475569')} />
              </View>
              <View style={styles.vehicleInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.vehicleName, v.disabled && { color: '#94A3B8' }, selectedVehicle === v.id && { color: '#10B981' }]}>{v.name}</Text>
                  {v.eco && (
                    <View style={styles.ecoBadge}>
                      <Ionicons name="leaf" size={12} color="#10B981" />
                      <Text style={styles.ecoText}>Eco</Text>
                    </View>
                  )}
                </View>
                {v.disabled && (
                  <Text style={styles.vehicleDisabledReason}>{v.reason}</Text>
                )}
              </View>
              <Ionicons name={selectedVehicle === v.id ? "radio-button-on" : "radio-button-off"} size={24} color={v.disabled ? '#CBD5E1' : (selectedVehicle === v.id ? '#10B981' : '#CBD5E1')} />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Green Delivery */}
        {selectedVehicle === 'van' && (
          <View style={styles.aiGreenBox}>
            <Ionicons name="leaf" size={24} color="#10B981" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.aiGreenTitle}>AI Green Delivery</Text>
              <Text style={styles.aiGreenText}>Xe Van hiện đang chạy ghép đơn qua khu vực của bạn. Nếu chọn xe này, bạn giúp giảm 2.4kg CO₂ phát thải ra môi trường.</Text>
            </View>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalPrice}>25.000đ</Text>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/delivery/tracking')}>
          <Text style={styles.nextBtnText}>Thanh toán & Đặt đơn</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  
  serviceList: { gap: 16 },
  serviceItem: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  serviceItemSelected: { backgroundColor: '#F0FDF4', borderColor: '#10B981' },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serviceName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  servicePrice: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  serviceDesc: { fontSize: 14, color: '#64748B' },
  
  aiTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 8, borderRadius: 8, marginTop: 12 },
  aiTagText: { fontSize: 12, color: '#D97706', fontWeight: 'bold', marginLeft: 6 },
  
  vehicleList: { gap: 12 },
  vehicleItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  vehicleItemSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  vehicleItemDisabled: { backgroundColor: '#F8FAFC', borderColor: 'transparent' },
  vehicleIconWrapper: { width: 48, height: 48, backgroundColor: '#F1F5F9', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  ecoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  ecoText: { fontSize: 10, color: '#10B981', fontWeight: 'bold', marginLeft: 2 },
  vehicleDisabledReason: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  
  aiGreenBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16, marginTop: 24, borderWidth: 1, borderColor: '#A7F3D0' },
  aiGreenTitle: { fontSize: 14, fontWeight: 'bold', color: '#059669', marginBottom: 4 },
  aiGreenText: { fontSize: 13, color: '#047857', lineHeight: 20 },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 16, color: '#475569' },
  totalPrice: { fontSize: 24, fontWeight: 'bold', color: '#10B981' },
  nextBtn: { backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
