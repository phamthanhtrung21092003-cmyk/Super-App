import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

export default function RideHome() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Chào buổi sáng');
  const [weather, setWeather] = useState('Hôm nay Hà Nội 34°C, Trời có mưa lúc 17h.');
  const [aiSuggestion, setAiSuggestion] = useState('Bạn thường đi làm lúc này. Đặt xe đến Công ty?');
  const [locationName, setLocationName] = useState('Đang tìm vị trí...');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Không có quyền truy cập vị trí');
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({});
      // Reverse geocode to get name (mocking for speed, real API can be hooked here)
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
      
      // Real LLM integration can go here to set greeting, weather, and suggestions based on time/location
      const hour = new Date().getHours();
      if (hour >= 12 && hour < 18) {
        setGreeting('Chào buổi chiều');
        setAiSuggestion('Hôm nay trời có thể mưa. Nên ưu tiên chọn Ô tô.');
      } else if (hour >= 18) {
        setGreeting('Chào buổi tối');
        setAiSuggestion('Đã muộn rồi, bạn muốn đặt xe về Nhà?');
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header - AI Greeting */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.locationPill}>
              <Ionicons name="location" size={16} color="#10B981" />
              <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
          
          <Text style={styles.title}>Xin chào, Trung 👋</Text>
          <Text style={styles.subtitle}>{greeting}</Text>
          
          <View style={styles.weatherCard}>
            <Ionicons name="partly-sunny" size={24} color="#F59E0B" />
            <Text style={styles.weatherText}>{weather}</Text>
          </View>
        </View>

        {/* AI Suggestion Bubble */}
        <View style={styles.aiBubble}>
          <View style={styles.aiIconContainer}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.aiTextContainer}>
            <Text style={styles.aiLabel}>AI Dự đoán</Text>
            <Text style={styles.aiMessage}>{aiSuggestion}</Text>
          </View>
          <TouchableOpacity style={styles.aiActionBtn} onPress={() => router.push('/ride/search')}>
            <Text style={styles.aiActionText}>Đi ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/ride/search')}>
          <View style={styles.searchLeft}>
            <View style={styles.greenDot} />
            <Text style={styles.searchText}>Bạn muốn đi đâu?</Text>
          </View>
          <View style={styles.searchActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="mic" size={20} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="scan" size={20} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="map" size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickCard}>
            <View style={[styles.quickIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="time" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.quickText}>Thuê theo giờ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard}>
            <View style={[styles.quickIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="calendar" size={24} color="#D97706" />
            </View>
            <Text style={styles.quickText}>Đặt lịch trước</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard}>
            <View style={[styles.quickIcon, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="people" size={24} color="#DB2777" />
            </View>
            <Text style={styles.quickText}>Đi chung</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Places */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gợi ý điểm đến</Text>
          <View style={styles.placesList}>
            <TouchableOpacity style={styles.placeItem}>
              <View style={styles.placeIcon}>
                <Ionicons name="home" size={20} color="#10B981" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>Nhà</Text>
                <Text style={styles.placeAddress}>Royal City, Nguyễn Trãi</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.placeItem}>
              <View style={styles.placeIcon}>
                <Ionicons name="business" size={20} color="#3B82F6" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>Công ty</Text>
                <Text style={styles.placeAddress}>Keangnam Landmark 72</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.placeItem}>
              <View style={styles.placeIcon}>
                <Ionicons name="cafe" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>Cafe ABC (Đã đi gần đây)</Text>
                <Text style={styles.placeAddress}>123 Nguyễn Đình Chiểu</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  locationPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, maxWidth: '70%', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  locationText: { marginLeft: 8, fontSize: 14, fontWeight: '500', color: '#0F172A' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  subtitle: { fontSize: 18, color: '#475569', marginBottom: 12 },
  weatherCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 16, alignSelf: 'flex-start', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  weatherText: { marginLeft: 10, fontSize: 14, fontWeight: '500', color: '#475569' },
  
  aiBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', padding: 16, borderRadius: 20, marginBottom: 24, elevation: 4, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  aiIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiTextContainer: { flex: 1 },
  aiLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  aiMessage: { color: '#FFFFFF', fontSize: 15, fontWeight: '500', lineHeight: 20 },
  aiActionBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  aiActionText: { color: '#10B981', fontWeight: 'bold', fontSize: 14 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  searchLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  greenDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', marginRight: 12 },
  searchText: { fontSize: 18, fontWeight: '600', color: '#94A3B8' },
  searchActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  quickCard: { backgroundColor: '#FFFFFF', flex: 1, marginHorizontal: 4, padding: 16, borderRadius: 20, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  quickIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  quickText: { fontSize: 13, fontWeight: '600', color: '#475569', textAlign: 'center' },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  placesList: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  placeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  placeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  placeAddress: { fontSize: 13, color: '#94A3B8' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 56 }
});
