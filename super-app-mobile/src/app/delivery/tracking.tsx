import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  Image, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

export default function DeliveryTracking() {
  const router = useRouter();
  const [showRisk, setShowRisk] = useState(false);

  useEffect(() => {
    // Simulate AI detecting a risk after 3 seconds
    const timer = setTimeout(() => {
      setShowRisk(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const region = {
    latitude: 21.025511,
    longitude: 105.814817,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={region}>
          <Marker coordinate={{ latitude: 21.028511, longitude: 105.804817 }} pinColor="#3B82F6" />
          <Marker coordinate={{ latitude: 21.008511, longitude: 105.814817 }} pinColor="#EF4444" />
          <Marker coordinate={{ latitude: 21.018511, longitude: 105.809817 }}>
            <View style={styles.vanMarker}>
              <Ionicons name="car-sport" size={24} color="#FFFFFF" />
            </View>
          </Marker>
          <Polyline 
            coordinates={[
              { latitude: 21.018511, longitude: 105.809817 },
              { latitude: 21.008511, longitude: 105.814817 }
            ]}
            strokeColor="#10B981"
            strokeWidth={4}
          />
        </MapView>
        
        {/* Floating AI Risk Alert */}
        {showRisk && (
          <Animated.View entering={SlideInDown} style={styles.riskAlert}>
            <View style={styles.riskHeader}>
              <Ionicons name="warning" size={20} color="#EF4444" />
              <Text style={styles.riskTitle}>AI Phát hiện Rủi ro</Text>
            </View>
            <Text style={styles.riskMessage}>Tuyến đường phía trước đang ngập lụt. AI đã tự động cập nhật ETA thêm 10 phút và gợi ý tài xế đi đường vòng.</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.panel}>
        <View style={styles.statusHeader}>
          <View>
             <Text style={styles.statusTitle}>Đang giao hàng</Text>
             <Text style={styles.etaText}>Dự kiến đến lúc 14:30</Text>
          </View>
          <View style={styles.orderIdBadge}>
            <Text style={styles.orderIdText}>#DLV-1029</Text>
          </View>
        </View>

        <View style={styles.driverInfo}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.driverAvatar} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.driverName}>Trần Bình</Text>
            <Text style={styles.driverVehicle}>Xe Van • 29D-123.45</Text>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons name="call" size={24} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitleDone}>Đã lấy hàng</Text>
              <Text style={styles.timelineTime}>14:00</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineItem}>
            <View style={styles.pulseDotWrapper}>
              <View style={styles.pulseDot} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitleActive}>Đang trên đường giao</Text>
              <Text style={styles.timelineAddr}>Tới Cửa hàng A, Thanh Xuân</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.finishBtn} onPress={() => router.push('/delivery')}>
          <Text style={styles.finishBtnText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  vanMarker: { backgroundColor: '#3B82F6', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#FFFFFF', elevation: 4 },
  
  riskAlert: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 20, left: 20, right: 20, backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FECACA', elevation: 8, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  riskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  riskTitle: { color: '#B91C1C', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  riskMessage: { color: '#991B1B', fontSize: 14, lineHeight: 20 },
  
  panel: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, marginTop: -24, elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 24 },
  
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  statusTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  etaText: { fontSize: 15, color: '#10B981', fontWeight: '600', marginTop: 4 },
  orderIdBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  orderIdText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
  
  driverInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 24 },
  driverAvatar: { width: 56, height: 56, borderRadius: 28 },
  driverName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  driverVehicle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  actionBtns: { flexDirection: 'row', gap: 12 },
  circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  
  timeline: { paddingLeft: 12, marginBottom: 32 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineLine: { width: 2, height: 30, backgroundColor: '#10B981', marginLeft: 11, marginVertical: 4 },
  timelineContent: { marginLeft: 16, flex: 1 },
  timelineTitleDone: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  timelineTime: { fontSize: 13, color: '#64748B', marginTop: 2 },
  
  pulseDotWrapper: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  pulseDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#DBEAFE' },
  timelineTitleActive: { fontSize: 16, fontWeight: 'bold', color: '#3B82F6' },
  timelineAddr: { fontSize: 13, color: '#64748B', marginTop: 2 },
  
  finishBtn: { backgroundColor: '#F1F5F9', paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
  finishBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' }
});
