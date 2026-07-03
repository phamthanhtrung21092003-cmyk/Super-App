import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Animated, { FadeIn, SlideInDown, Layout } from 'react-native-reanimated';

export default function DeliveryCreate() {
  const router = useRouter();
  const [isOptimized, setIsOptimized] = useState(false);

  // Unoptimized Points (A -> B -> C)
  const initialPoints = [
    { id: 'start', title: 'Điểm lấy', addr: 'Kho X', lat: 21.028511, lng: 105.804817 },
    { id: 'drop1', title: 'Điểm giao 1', addr: 'Cửa hàng B', lat: 21.018511, lng: 105.824817 },
    { id: 'drop2', title: 'Điểm giao 2', addr: 'Cửa hàng A', lat: 21.008511, lng: 105.814817 },
  ];

  // Optimized Points (A -> C -> B)
  const optimizedPoints = [
    initialPoints[0],
    initialPoints[2],
    initialPoints[1]
  ];

  const points = isOptimized ? optimizedPoints : initialPoints;
  const coordinates = points.map(p => ({ latitude: p.lat, longitude: p.lng }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={{ latitude: 21.018511, longitude: 105.814817, latitudeDelta: 0.05, longitudeDelta: 0.05 }}>
          {points.map((p, index) => (
             <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }}>
               <View style={[styles.marker, index === 0 ? { backgroundColor: '#3B82F6' } : { backgroundColor: '#EF4444' }]}>
                 <Text style={{ color: '#fff', fontWeight: 'bold' }}>{index + 1}</Text>
               </View>
             </Marker>
          ))}
          <Polyline 
            coordinates={coordinates}
            strokeColor={isOptimized ? "#10B981" : "#0F172A"}
            strokeWidth={4}
            lineDashPattern={isOptimized ? undefined : [5, 5]}
          />
        </MapView>
        
        {/* Floating Back Button */}
        <SafeAreaView style={styles.floatingHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Tuyến đường giao hàng</Text>
          <TouchableOpacity style={styles.addPointBtn}>
             <Ionicons name="add" size={20} color="#3B82F6" />
             <Text style={styles.addPointText}>Thêm điểm</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.pointsList}>
          {points.map((p, index) => (
            <Animated.View key={p.id} layout={Layout.springify()} style={styles.pointRow}>
              <View style={styles.pointTimeline}>
                <View style={[styles.dot, index === 0 ? { backgroundColor: '#3B82F6' } : { backgroundColor: '#EF4444' }]} />
                {index < points.length - 1 && <View style={styles.line} />}
              </View>
              <View style={styles.pointInfo}>
                <Text style={styles.pointLabel}>{p.title}</Text>
                <Text style={styles.pointAddr}>{p.addr}</Text>
              </View>
              <Ionicons name="reorder-two" size={24} color="#CBD5E1" />
            </Animated.View>
          ))}
        </ScrollView>

        {/* AI Routing Feature */}
        {!isOptimized ? (
          <TouchableOpacity style={styles.aiRouteBtn} onPress={() => setIsOptimized(true)}>
            <Ionicons name="git-network" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.aiRouteBtnText}>AI Tối ưu Tuyến đường</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View entering={SlideInDown} style={styles.aiSuccessCard}>
            <View style={styles.aiSuccessHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.aiSuccessTitle}>Đã tối ưu lộ trình thành công</Text>
            </View>
            <Text style={styles.aiSuccessText}>Tiết kiệm được 4.2km (tương đương 18.000đ) và giảm 12 phút di chuyển.</Text>
          </Animated.View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/delivery/package')}>
            <Text style={styles.nextBtnText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  marker: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF', elevation: 4 },
  
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backButton: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  
  panel: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: 500, marginTop: -24, elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 24, padding: 24 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  panelTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  addPointBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  addPointText: { color: '#3B82F6', fontWeight: 'bold', marginLeft: 4 },
  
  pointsList: { flex: 1 },
  pointRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  pointTimeline: { alignItems: 'center', marginRight: 16, width: 20 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, height: 40, backgroundColor: '#E2E8F0', marginTop: 4, marginBottom: -12 },
  pointInfo: { flex: 1, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  pointLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  pointAddr: { fontSize: 16, color: '#0F172A', fontWeight: 'bold', marginTop: 4 },
  
  aiRouteBtn: { flexDirection: 'row', backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 4, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  aiRouteBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  aiSuccessCard: { backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#BBF7D0' },
  aiSuccessHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aiSuccessTitle: { color: '#059669', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  aiSuccessText: { color: '#047857', fontSize: 13, lineHeight: 20 },
  
  footer: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  nextBtn: { backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
