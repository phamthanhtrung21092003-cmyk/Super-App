import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, useWindowDimensions, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import WebMap from '../../components/WebMap';
import * as Location from 'expo-location';

export default function RideHome() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const [greeting, setGreeting] = useState('Chào buổi sáng, Trung 👋');
  const [weather, setWeather] = useState('Hôm nay Hà Nội 34°C, Trời có mưa lúc 17h.');
  const [aiSuggestion, setAiSuggestion] = useState('Bạn thường đi làm lúc này. Đặt xe đến Công ty?');
  const [locationName, setLocationName] = useState('Đang tìm vị trí...');
  const [coords, setCoords] = useState({ lat: 21.028511, lng: 105.804817 });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Không có quyền truy cập vị trí');
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({});
      setCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
      
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        setLocationName(`${place.street || place.name || ''}, ${place.city || place.subregion || ''}`);
      } else {
        setLocationName('Vị trí hiện tại của bạn');
      }
      
      const hour = new Date().getHours();
      if (hour >= 12 && hour < 18) {
        setGreeting('Chào buổi chiều, Trung 👋');
        setAiSuggestion('Hôm nay trời có thể mưa. Nên ưu tiên chọn Ô tô.');
      } else if (hour >= 18) {
        setGreeting('Chào buổi tối, Trung 👋');
        setAiSuggestion('Đã muộn rồi, bạn muốn đặt xe về Nhà?');
      }
    })();
  }, []);

  const mapPoints = [
    { lat: coords.lat, lng: coords.lng, label: locationName, color: '#3B82F6' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Full screen Map */}
      <View style={styles.mapContainer}>
        <WebMap
          points={mapPoints}
          showRoute={false}
          height={windowHeight - 200}
          zoom={15}
        />
      </View>

      {/* Floating Header Actions */}
      <View style={styles.floatingHeader} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/transport');
          }}
          style={styles.floatingBackBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingHistoryBtn}
          onPress={() => {
            if (Platform.OS === 'web') {
              window.alert('Lịch sử di chuyển:\n\n🚗 05/07 - Chuyến đi tới Royal City (95.000đ)\n🚗 01/07 - Chuyến đi tới Công ty (65.000đ)');
            }
          }}
        >
          <Ionicons name="time-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Panel */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetContent}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subGreeting}>Trời đang mưa nhẹ. Nên đặt xe máy hoặc taxi điện ngay.</Text>

          {/* Grab-style Search Box */}
          <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/ride/search')}>
            <View style={styles.searchLeft}>
              <View style={styles.searchIconBg}>
                <Ionicons name="search" size={20} color="#10B981" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.searchPlaceholder}>Bạn muốn đi đâu?</Text>
                <Text style={styles.searchSubPlaceholder}>Đề xuất: Công ty (Keangnam)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Quick Action Badges */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => {
                if (Platform.OS === 'web') window.alert('🎙️ AI Voice Search\n\nBạn có thể đọc địa chỉ để AI tự động thiết lập điểm đến.');
              }}
            >
              <Ionicons name="mic-outline" size={18} color="#475569" style={{ marginRight: 6 }} />
              <Text style={styles.quickActionLabel}>Đặt giọng nói</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => {
                if (Platform.OS === 'web') window.alert('📅 Đặt lịch trước giúp tiết kiệm tới 15% vào giờ cao điểm.');
              }}
            >
              <Ionicons name="calendar-outline" size={18} color="#475569" style={{ marginRight: 6 }} />
              <Text style={styles.quickActionLabel}>Đặt trước</Text>
            </TouchableOpacity>
          </View>

          {/* AI Suggestion Card */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={16} color="#D97706" />
              <Text style={styles.aiTitle}>AI Dự đoán điểm đến</Text>
            </View>
            <Text style={styles.aiBody}>{aiSuggestion}</Text>
          </View>

          {/* Saved Places */}
          <Text style={styles.sectionTitle}>Địa điểm đã lưu</Text>
          <View style={styles.placesList}>
            <TouchableOpacity style={styles.placeItem} onPress={() => router.push('/ride/search')}>
              <View style={styles.placeIcon}>
                <Ionicons name="home" size={20} color="#10B981" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>Nhà</Text>
                <Text style={styles.placeAddress}>Royal City, Nguyễn Trãi</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.placeItem} onPress={() => router.push('/ride/search')}>
              <View style={styles.placeIcon}>
                <Ionicons name="business" size={20} color="#3B82F6" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>Công ty</Text>
                <Text style={styles.placeAddress}>Keangnam Landmark 72</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', position: 'relative' },
  mapContainer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },

  // Floating Actions
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  floatingBackBtn: {
    width: 44, height: 44,
    backgroundColor: '#FFFFFF', borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  floatingHistoryBtn: {
    width: 44, height: 44,
    backgroundColor: '#FFFFFF', borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6,
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    elevation: 24, shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.15, shadowRadius: 16,
    zIndex: 10,
    maxHeight: '65%',
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 44, height: 4,
    backgroundColor: '#E2E8F0', borderRadius: 2,
    alignSelf: 'center', marginVertical: 12,
  },
  sheetContent: { flex: 1 },

  // Text
  greeting: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  subGreeting: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },

  // Search Box
  searchBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    padding: 14, borderRadius: 18, marginTop: 16, marginBottom: 14,
  },
  searchLeft: { flexDirection: 'row', alignItems: 'center' },
  searchIconBg: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
  },
  searchPlaceholder: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  searchSubPlaceholder: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },

  // Quick Action row
  quickActionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F1F5F9', paddingVertical: 10, borderRadius: 12,
  },
  quickActionLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },

  // AI Card
  aiCard: {
    backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A',
    padding: 14, borderRadius: 16, marginBottom: 24,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  aiTitle: { fontSize: 13, fontWeight: '800', color: '#D97706', marginLeft: 6 },
  aiBody: { fontSize: 13, color: '#92400E', fontWeight: '500', lineHeight: 18 },

  // Places list
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  placesList: { gap: 10 },
  placeItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  placeIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
  },
  placeInfo: { marginLeft: 12 },
  placeName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  placeAddress: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
});
