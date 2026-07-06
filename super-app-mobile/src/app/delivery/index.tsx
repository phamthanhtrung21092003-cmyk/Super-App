import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import WebMap from '../../components/WebMap';

export default function DeliveryHome() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const [greeting] = useState('Chào buổi sáng, Trung 👋');

  const currentLocationPin = [
    { lat: 21.028511, lng: 105.804817, label: 'Vị trí của bạn', color: '#3B82F6' }
  ];

  const categories = [
    { id: 'doc', name: 'Tài liệu', icon: 'document-text', color: '#3B82F6', bg: '#DBEAFE' },
    { id: 'food', name: 'Đồ ăn', icon: 'fast-food', color: '#F59E0B', bg: '#FEF3C7' },
    { id: 'gift', name: 'Quà tặng', icon: 'gift', color: '#EC4899', bg: '#FCE7F3' },
    { id: 'tech', name: 'Điện tử', icon: 'laptop', color: '#8B5CF6', bg: '#EDE9FE' },
    { id: 'clothes', name: 'Quần áo', icon: 'shirt', color: '#10B981', bg: '#D1FAE5' },
    { id: 'box', name: 'Hàng hoá', icon: 'cube', color: '#64748B', bg: '#F1F5F9' },
  ];

  const recentOrders = [
    { id: '1', code: '#DLV-1028', status: 'Đã giao', time: 'Hôm qua, 15:30', icon: 'checkmark-circle', color: '#10B981' },
    { id: '2', code: '#DLV-1027', status: 'Đã giao', time: '03/07, 10:00', icon: 'checkmark-circle', color: '#10B981' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Full screen Map */}
      <View style={styles.mapContainer}>
        <WebMap
          points={currentLocationPin}
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
              window.alert('Lịch sử đơn hàng:\n\n#DLV-1028 - Đã giao (Hôm qua)\n#DLV-1027 - Đã giao (03/07)\n#DLV-1026 - Đã giao (01/07)');
            }
          }}
        >
          <Ionicons name="time-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Panel (Grab / Gojek / Bee style) */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetContent}>
          {/* Greeting */}
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subGreeting}>Bạn muốn giao hàng đến đâu hôm nay?</Text>

          {/* Grab-style Search Box */}
          <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/delivery/create')}>
            <View style={styles.searchLeft}>
              <View style={styles.searchIconBg}>
                <Ionicons name="search" size={20} color="#10B981" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.searchPlaceholder}>Nhập địa chỉ giao hàng...</Text>
                <Text style={styles.searchSubPlaceholder}>Đề xuất: Kho X, Cửa hàng A</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Quick Action Badges */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => {
                if (Platform.OS === 'web') window.alert('🎙️ AI Voice Search\n\nBạn có thể đọc địa chỉ để AI tìm kiếm lộ trình tự động.');
              }}
            >
              <Ionicons name="mic-outline" size={20} color="#475569" style={{ marginRight: 6 }} />
              <Text style={styles.quickActionLabel}>Tìm giọng nói</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => {
                if (Platform.OS === 'web') window.alert('📷 Quét mã QR đơn hàng để tra cứu nhanh');
              }}
            >
              <Ionicons name="qr-code-outline" size={18} color="#475569" style={{ marginRight: 6 }} />
              <Text style={styles.quickActionLabel}>Quét mã QR</Text>
            </TouchableOpacity>
          </View>

          {/* Categories Horizontal Scroll */}
          <Text style={styles.sectionTitle}>Danh mục gửi hàng</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push('/delivery/create')}>
                <View style={[styles.categoryIconWrap, { backgroundColor: cat.bg }]}>
                  <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                </View>
                <Text style={styles.categoryLabel}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recent Destinations / Orders */}
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Đơn gần đây</Text>
            <TouchableOpacity onPress={() => router.push('/delivery/create')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.map(order => (
            <TouchableOpacity
              key={order.id}
              style={styles.recentItem}
              onPress={() => router.push('/delivery/tracking')}
            >
              <View style={styles.recentLeft}>
                <View style={styles.locationIconWrap}>
                  <Ionicons name="location-sharp" size={18} color="#64748B" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.recentCode}>{order.code}</Text>
                  <Text style={styles.recentTime}>{order.time}</Text>
                </View>
              </View>
              <View style={styles.recentRight}>
                <Text style={styles.recentStatus}>{order.status}</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          ))}
          
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
    maxHeight: '68%',
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

  // Sections
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  categoryScroll: { flexDirection: 'row', marginBottom: 24, paddingRight: 20 },
  categoryCard: { width: 72, alignItems: 'center', marginRight: 16 },
  categoryIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: '#475569', textAlign: 'center' },

  // Recent list
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  recentLeft: { flexDirection: 'row', alignItems: 'center' },
  locationIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
  },
  recentCode: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  recentTime: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  recentRight: { flexDirection: 'row', alignItems: 'center' },
  recentStatus: { fontSize: 13, fontWeight: '700', color: '#10B981' },
});
