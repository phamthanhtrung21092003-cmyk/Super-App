import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import WebMap from '../components/WebMap';

export default function TransportHome() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();

  const currentLocationPin = [
    { lat: 21.028511, lng: 105.804817, label: 'Vị trí của bạn', color: '#3B82F6' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Full screen Map */}
      <View style={styles.mapContainer}>
        <WebMap
          points={currentLocationPin}
          showRoute={false}
          height={windowHeight - 220} // ensure it covers the top and fits background
          zoom={15}
        />
      </View>

      {/* Floating Header Actions */}
      <View style={styles.floatingHeader} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/home');
          }}
          style={styles.floatingBackBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingHistoryBtn}
          onPress={() => {
            if (Platform.OS === 'web') {
              window.alert('Lịch sử di chuyển:\n\n🚗 05/07 - Chuyến đi tới Royal City (95.000đ)\n📦 03/07 - Giao hàng tới Cửa hàng A (25.000đ)');
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
          <Text style={styles.greeting}>Bạn muốn làm gì hôm nay?</Text>
          
          {/* Main Service Cards */}
          <View style={styles.serviceRow}>
            <TouchableOpacity 
              style={[styles.serviceCard, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}
              onPress={() => router.push('/ride')}
            >
              <Text style={styles.serviceIcon}>🚗</Text>
              <Text style={styles.serviceTitle}>Chở khách</Text>
              <Text style={styles.serviceDesc}>Đặt xe máy, ô tô, taxi điện</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.serviceCard, { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' }]}
              onPress={() => router.push('/delivery')}
            >
              <Text style={styles.serviceIcon}>📦</Text>
              <Text style={styles.serviceTitle}>Giao hàng</Text>
              <Text style={styles.serviceDesc}>Giao tài liệu, đồ ăn, quà tặng</Text>
            </TouchableOpacity>
          </View>

          {/* AI Suggestions Card */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={18} color="#D97706" />
              <Text style={styles.aiTitle}>AI Trợ lý Gợi ý</Text>
            </View>
            <Text style={styles.aiBody}>Hiện tại khu vực Cầu Giấy đang có mưa nhẹ. Thời gian chờ ghép xe khoảng 5 phút. Hãy ưu tiên chọn ô tô hoặc đặt lịch trước để tránh trễ giờ.</Text>
          </View>

          {/* Interactive Search box */}
          <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/ride/search')}>
            <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
            <Text style={styles.searchPlaceholder}>Bạn muốn đi đâu hoặc giao hàng đi đâu?</Text>
          </TouchableOpacity>

          {/* Saved places */}
          <Text style={styles.sectionTitle}>Địa điểm đã lưu</Text>
          <View style={styles.savedPlaces}>
            <TouchableOpacity style={styles.placeItem} onPress={() => router.push('/ride/search')}>
              <View style={[styles.placeIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="home" size={18} color="#10B981" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>Nhà</Text>
                <Text style={styles.placeAddress}>Royal City, 72A Nguyễn Trãi</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.placeItem} onPress={() => router.push('/ride/search')}>
              <View style={[styles.placeIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="briefcase" size={18} color="#3B82F6" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>Công ty</Text>
                <Text style={styles.placeAddress}>Keangnam Landmark 72, Mễ Trì</Text>
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

  greeting: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 16 },

  // Service Row Cards
  serviceRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  serviceCard: {
    flex: 1, padding: 16, borderRadius: 20, borderWidth: 1,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  serviceIcon: { fontSize: 32, marginBottom: 8 },
  serviceTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  serviceDesc: { fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: '500', lineHeight: 16 },

  // AI Card
  aiCard: {
    backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A',
    padding: 16, borderRadius: 20, marginBottom: 20,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  aiTitle: { fontSize: 14, fontWeight: '800', color: '#D97706', marginLeft: 8 },
  aiBody: { fontSize: 13, color: '#92400E', fontWeight: '500', lineHeight: 20 },

  // Search Box
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    padding: 14, borderRadius: 16, marginBottom: 24,
  },
  searchPlaceholder: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },

  // Saved locations
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  savedPlaces: { gap: 10 },
  placeItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  placeIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  placeInfo: { marginLeft: 12 },
  placeName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  placeAddress: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
});
