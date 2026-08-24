import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  Platform, SafeAreaView, StatusBar, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const STATUS_TABS = ['Đơn mới (2)', 'Đang làm (4)', 'Chờ tài xế (1)', 'Hoàn thành'];

const MOCK_ORDERS = [
  { id: '#FD-2304', time: '14:20', customer: 'Nguyễn Văn A', items: '2x Pizza Hải Sản (M)\n1x Coca Cola', note: 'Không lấy hành tây', total: '250.000đ', status: 0 },
  { id: '#FD-2305', time: '14:25', customer: 'Trần Thị B', items: '1x Mì Ý Bò Băm', note: '', total: '85.000đ', status: 0 },
];

export default function MerchantOrders() {
  const [activeTab, setActiveTab] = useState(0);

  const accentColor = '#F97316';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontFamily: 'Outfit' }]}>Quản Lý Đơn</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {STATUS_TABS.map((tab, idx) => {
            const isActive = activeTab === idx;
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.tab, isActive && { backgroundColor: accentColor, borderColor: accentColor }]}
                onPress={() => setActiveTab(idx)}
              >
                <Text style={[styles.tabText, isActive && { color: '#FFF' }]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {MOCK_ORDERS.map((order, index) => (
          <Animated.View key={order.id} entering={FadeInUp.delay(index * 100).duration(400)} style={styles.orderCard}>
            <View style={styles.orderTop}>
              <View>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderTime}>{order.time}</Text>
              </View>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>{order.total}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderBody}>
              <View style={styles.customerRow}>
                <Ionicons name="person-circle-outline" size={18} color="#94A3B8" />
                <Text style={styles.customerName}>{order.customer}</Text>
              </View>
              <Text style={styles.itemsText}>{order.items}</Text>
              {order.note ? (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>Ghi chú: {order.note}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.orderActions}>
              <TouchableOpacity 
                style={styles.btnSecondary}
                onPress={() => alert(`Đã từ chối đơn ${order.id}`)}
              >
                <Text style={styles.btnSecondaryText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnPrimary, { backgroundColor: accentColor }]}
                onPress={() => alert(`Đã nhận đơn ${order.id} và gửi lệnh in bếp!`)}
              >
                <Text style={styles.btnPrimaryText}>Nhận đơn & In Bill</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
        
        {MOCK_ORDERS.length === 0 && (
          <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>Không có đơn hàng nào.</Text>
        )}
        
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 15 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  tabsWrapper: { borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingBottom: 12 },
  tabsScroll: { paddingHorizontal: 16, gap: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A' },
  tabText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  listContent: { padding: 16 },
  
  orderCard: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1E293B' },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  orderTime: { color: '#64748B', fontSize: 12, marginTop: 4 },
  priceTag: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceText: { color: '#10B981', fontSize: 14, fontWeight: '700' },
  
  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 12 },
  
  orderBody: { marginBottom: 16 },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  customerName: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  itemsText: { color: '#94A3B8', fontSize: 14, lineHeight: 22 },
  noteBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 10, borderRadius: 8, marginTop: 8, borderLeftWidth: 3, borderLeftColor: '#EF4444' },
  noteText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
  
  orderActions: { flexDirection: 'row', gap: 12 },
  btnSecondary: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  btnSecondaryText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  btnPrimary: { flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnPrimaryText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
