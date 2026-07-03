import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  Platform, Switch, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Circle } from 'react-native-maps';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

export default function DriverHome() {
  const [isOnline, setIsOnline] = useState(false);
  const [services, setServices] = useState({
    ride: true,
    delivery: true,
    food: false,
  });

  const toggleService = (key: keyof typeof services) => {
    setServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Mock Map Region
  const initialRegion = {
    latitude: 21.028511,
    longitude: 105.804817,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Fake Heatmap points
  const heatzones = [
    { id: 1, lat: 21.028511, lng: 105.804817, radius: 1000, color: 'rgba(239, 68, 68, 0.3)' }, // Đỏ (Rất nóng)
    { id: 2, lat: 21.018511, lng: 105.794817, radius: 1500, color: 'rgba(245, 158, 11, 0.3)' }, // Vàng (Nóng)
    { id: 3, lat: 21.038511, lng: 105.814817, radius: 800, color: 'rgba(16, 185, 129, 0.3)' },  // Xanh (Trung bình)
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Map */}
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          region={initialRegion}
          customMapStyle={mapStyle}
          showsUserLocation={true}
        >
          {isOnline && heatzones.map(zone => (
             <Circle
                key={zone.id}
                center={{ latitude: zone.lat, longitude: zone.lng }}
                radius={zone.radius}
                fillColor={zone.color}
                strokeWidth={0}
             />
          ))}
        </MapView>
      </View>

      {/* Top Overlay: Online Switch & Dashboard */}
      <View style={styles.topOverlay}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="menu" size={28} color="#0F172A" />
          </TouchableOpacity>
          <View style={[styles.statusPill, isOnline ? styles.statusOnline : styles.statusOffline]}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
            <Text style={[styles.statusText, isOnline ? { color: '#059669' } : { color: '#475569' }]}>
              {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#CBD5E1', true: '#34D399' }}
              thumbColor={isOnline ? '#ffffff' : '#f4f3f4'}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginLeft: 8 }}
            />
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {isOnline && (
          <Animated.View entering={FadeIn} style={styles.dashboardCard}>
            <View style={styles.dashStat}>
              <Text style={styles.dashLabel}>Thu nhập (VNĐ)</Text>
              <Text style={styles.dashValue}>850.000</Text>
            </View>
            <View style={styles.dashDivider} />
            <View style={styles.dashStat}>
              <Text style={styles.dashLabel}>Chuyến</Text>
              <Text style={styles.dashValue}>12</Text>
            </View>
            <View style={styles.dashDivider} />
            <View style={styles.dashStat}>
              <Text style={styles.dashLabel}>Đánh giá</Text>
              <Text style={styles.dashValue}>4.95 ⭐</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Bottom Overlay: AI Suggestion & Service Toggles */}
      <View style={styles.bottomOverlay}>
        
        {/* AI Suggestion Card */}
        {isOnline && (
          <Animated.View entering={SlideInDown} style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={18} color="#D97706" />
              <Text style={styles.aiTitle}>AI Điều phối</Text>
            </View>
            <Text style={styles.aiDesc}>
              Sắp tới giờ ăn trưa (11:30). Khu vực bạn đang đứng có nhu cầu giao thức ăn tăng vọt. AI khuyên bạn nên bật dịch vụ Giao đồ ăn!
            </Text>
          </Animated.View>
        )}

        {/* Services Toggle Panel */}
        <View style={styles.servicesPanel}>
          <Text style={styles.panelTitle}>Dịch vụ đang nhận</Text>
          
          <TouchableOpacity style={styles.serviceRow} onPress={() => toggleService('ride')} activeOpacity={0.8}>
            <View style={[styles.serviceIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="car" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.serviceName}>Chở khách</Text>
            <Switch value={services.ride} onValueChange={() => toggleService('ride')} trackColor={{ true: '#3B82F6' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceRow} onPress={() => toggleService('delivery')} activeOpacity={0.8}>
            <View style={[styles.serviceIcon, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="cube" size={24} color="#F97316" />
            </View>
            <Text style={styles.serviceName}>Giao hàng</Text>
            <Switch value={services.delivery} onValueChange={() => toggleService('delivery')} trackColor={{ true: '#F97316' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceRow} onPress={() => toggleService('food')} activeOpacity={0.8}>
            <View style={[styles.serviceIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="fast-food" size={24} color="#EF4444" />
            </View>
            <Text style={styles.serviceName}>Giao đồ ăn</Text>
            <Switch value={services.food} onValueChange={() => toggleService('food')} trackColor={{ true: '#EF4444' }} />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

// Simple light mode map style to hide POIs and make heatmap pop
const mapStyle = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  map: { flex: 1 },
  
  topOverlay: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 20, left: 16, right: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  statusOnline: { borderWidth: 2, borderColor: '#10B981' },
  statusOffline: { borderWidth: 2, borderColor: '#CBD5E1' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  
  dashboardCard: { backgroundColor: '#0F172A', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 16, borderRadius: 16, marginTop: 16, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 },
  dashStat: { alignItems: 'center' },
  dashLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  dashValue: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  dashDivider: { width: 1, height: 30, backgroundColor: '#334155' },
  
  bottomOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  
  aiCard: { backgroundColor: '#FFFBEB', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A', elevation: 4, shadowColor: '#F59E0B', shadowOpacity: 0.2, shadowRadius: 8 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aiTitle: { fontSize: 14, fontWeight: 'bold', color: '#D97706', marginLeft: 8 },
  aiDesc: { fontSize: 13, color: '#92400E', lineHeight: 20 },
  
  servicesPanel: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  panelTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  serviceIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  serviceName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0F172A' },
});
