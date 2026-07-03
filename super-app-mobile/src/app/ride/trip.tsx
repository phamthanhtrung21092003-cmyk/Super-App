import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function RideTrip() {
  const router = useRouter();
  const [tripState, setTripState] = useState('in_progress'); // in_progress, ended
  
  const region = {
    latitude: 21.020511,
    longitude: 105.808817,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  return (
    <SafeAreaView style={styles.container}>
      {tripState === 'in_progress' ? (
        <>
          <View style={styles.mapContainer}>
            <MapView style={styles.map} region={region}>
              <Marker coordinate={{ latitude: 21.028511, longitude: 105.804817 }} pinColor="#3B82F6" />
              <Marker coordinate={{ latitude: 21.008511, longitude: 105.814817 }} pinColor="#EF4444" />
              <Marker coordinate={{ latitude: 21.018511, longitude: 105.809817 }}>
                <View style={styles.carMarker}>
                  <Ionicons name="car" size={24} color="#FFFFFF" />
                </View>
              </Marker>
              <Polyline 
                coordinates={[
                  { latitude: 21.018511, longitude: 105.809817 },
                  { latitude: 21.008511, longitude: 105.814817 }
                ]}
                strokeColor="#3B82F6"
                strokeWidth={5}
              />
            </MapView>
            
            {/* Top Floating Info */}
            <SafeAreaView style={styles.floatingTop}>
              <View style={styles.floatingHeader}>
                <TouchableOpacity onPress={() => router.push('/ride')} style={styles.backButton}>
                  <Ionicons name="close" size={24} color="#0F172A" />
                </TouchableOpacity>
                <View style={styles.tripStatusBadge}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.tripStatusText}>Đang di chuyển</Text>
                </View>
                <TouchableOpacity style={styles.sosButton}>
                  <Ionicons name="shield-half" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>

          <View style={styles.panel}>
            <View style={styles.etaHeader}>
              <View>
                <Text style={styles.etaTime}>10 phút</Text>
                <Text style={styles.etaSub}>2.4 km nữa đến điểm đến</Text>
              </View>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>80.000đ</Text>
              </View>
            </View>

            <View style={styles.aiAlert}>
              <Ionicons name="warning" size={24} color="#F59E0B" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aiAlertTitle}>AI Cảnh báo Giao thông</Text>
                <Text style={styles.aiAlertMessage}>Có tai nạn phía trước 1km. Đã đề xuất tài xế đổi lộ trình để tiết kiệm 5 phút.</Text>
              </View>
            </View>

            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="location" size={24} color="#475569" />
                <Text style={styles.actionText}>Sửa điểm đến</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="share-social" size={24} color="#475569" />
                <Text style={styles.actionText}>Chia sẻ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="musical-notes" size={24} color="#475569" />
                <Text style={styles.actionText}>Nhạc</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="snow" size={24} color="#475569" />
                <Text style={styles.actionText}>Điều hoà</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.endBtn} onPress={() => setTripState('ended')}>
              <Text style={styles.endBtnText}>Mô phỏng: Kết thúc chuyến</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Animated.View entering={FadeIn} style={styles.receiptContainer}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View style={styles.receiptHeader}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text style={styles.receiptTitle}>Chuyến đi hoàn tất</Text>
              <Text style={styles.receiptTime}>Hôm nay, 08:30 AM</Text>
            </View>

            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Tổng quãng đường</Text>
                <Text style={styles.receiptValue}>4.2 km</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Thời gian</Text>
                <Text style={styles.receiptValue}>18 phút</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Thành tiền</Text>
                <Text style={styles.receiptValue}>80.000đ</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Khuyến mãi AI</Text>
                <Text style={[styles.receiptValue, { color: '#10B981' }]}>- 8.000đ</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptTotalLabel}>Tổng thanh toán</Text>
                <Text style={styles.receiptTotalValue}>72.000đ</Text>
              </View>
            </View>

            <View style={styles.aiTipBox}>
              <Ionicons name="sparkles" size={20} color="#F59E0B" style={{ marginRight: 12 }} />
              <Text style={styles.aiTipText}>Vì bạn thanh toán bằng SuperPay, AI đã tự động áp dụng mã hoàn tiền 10%. Chuyến đi tuyệt vời chứ?</Text>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>Đánh giá tài xế</Text>
              <View style={styles.stars}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name="star-outline" size={40} color="#CBD5E1" />
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/ride')}>
              <Text style={styles.homeBtnText}>Về trang chủ</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  carMarker: { backgroundColor: '#10B981', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#FFFFFF', elevation: 4 },
  
  floatingTop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  floatingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backButton: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tripStatusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  tripStatusText: { fontWeight: 'bold', color: '#0F172A' },
  sosButton: { width: 44, height: 44, backgroundColor: '#EF4444', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  
  panel: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, marginTop: -24, elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 24 },
  etaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  etaTime: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  etaSub: { fontSize: 14, color: '#64748B', marginTop: 4 },
  priceBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  
  aiAlert: { flexDirection: 'row', backgroundColor: '#FEF3C7', padding: 16, borderRadius: 16, marginBottom: 24, alignItems: 'flex-start' },
  aiAlertTitle: { fontSize: 15, fontWeight: 'bold', color: '#D97706', marginBottom: 4 },
  aiAlertMessage: { fontSize: 13, color: '#92400E', lineHeight: 20 },
  
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionBtn: { width: '48%', backgroundColor: '#F8FAFC', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginTop: 8 },
  
  endBtn: { backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  endBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  receiptContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  receiptHeader: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  receiptTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginTop: 16 },
  receiptTime: { fontSize: 14, color: '#64748B', marginTop: 4 },
  
  receiptCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, marginBottom: 24 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  receiptLabel: { fontSize: 15, color: '#475569' },
  receiptValue: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8, marginBottom: 24 },
  receiptTotalLabel: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  receiptTotalValue: { fontSize: 24, fontWeight: 'bold', color: '#10B981' },
  
  aiTipBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 16, borderRadius: 16, marginBottom: 32, alignItems: 'center' },
  aiTipText: { flex: 1, fontSize: 14, color: '#D97706', lineHeight: 20, fontWeight: '500' },
  
  ratingSection: { alignItems: 'center', marginBottom: 40 },
  ratingTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  stars: { flexDirection: 'row', gap: 12 },
  
  homeBtn: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 20, alignItems: 'center', elevation: 4, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  homeBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
