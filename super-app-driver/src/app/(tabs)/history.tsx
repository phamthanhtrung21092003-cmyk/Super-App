import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DriverHistory() {
  const history = [
    { id: 1, type: 'ride', name: 'Chở khách', price: '95.000đ', time: '14:30', date: 'Hôm nay', color: '#3B82F6' },
    { id: 2, type: 'delivery', name: 'Giao hàng', price: '45.000đ', time: '11:15', date: 'Hôm nay', color: '#F97316' },
    { id: 3, type: 'food', name: 'Giao đồ ăn', price: '32.000đ', time: '09:00', date: 'Hôm nay', color: '#EF4444' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử cuốc xe</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Filters */}
        <View style={styles.filters}>
          <View style={[styles.filterChip, styles.filterChipActive]}>
            <Text style={styles.filterChipTextActive}>Tất cả</Text>
          </View>
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>Chở khách</Text>
          </View>
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>Giao hàng</Text>
          </View>
        </View>

        {/* List */}
        {history.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.typeDot, { backgroundColor: item.color }]} />
                <Text style={styles.cardType}>{item.name}</Text>
              </View>
              <Text style={styles.cardPrice}>{item.price}</Text>
            </View>
            <View style={styles.cardBody}>
               <Text style={styles.cardTime}>{item.time} • {item.date}</Text>
               <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  content: { padding: 20 },
  
  filters: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterChipText: { color: '#475569', fontWeight: '500' },
  filterChipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  cardType: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTime: { fontSize: 14, color: '#64748B' }
});
