import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Image, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DeliveryHome() {
  const router = useRouter();
  const [greeting] = useState('Chào buổi sáng, Trung 👋');
  const [weatherAlert] = useState('Hôm nay Hà Nội có mưa. Một số tuyến đường đang ùn tắc.');

  const categories = [
    { id: 'doc', name: 'Tài liệu', icon: 'document-text', color: '#3B82F6', bg: '#DBEAFE' },
    { id: 'food', name: 'Đồ ăn', icon: 'fast-food', color: '#F59E0B', bg: '#FEF3C7' },
    { id: 'gift', name: 'Quà tặng', icon: 'gift', color: '#EC4899', bg: '#FCE7F3' },
    { id: 'tech', name: 'Điện tử', icon: 'laptop', color: '#8B5CF6', bg: '#EDE9FE' },
    { id: 'clothes', name: 'Quần áo', icon: 'shirt', color: '#10B981', bg: '#D1FAE5' },
    { id: 'box', name: 'Hàng hoá', icon: 'cube', color: '#64748B', bg: '#F1F5F9' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header - AI Context */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
             <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#0F172A" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.historyBtn}>
               <Ionicons name="time" size={20} color="#0F172A" />
             </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>{greeting}</Text>
          <View style={styles.weatherBubble}>
            <Ionicons name="rainy" size={20} color="#3B82F6" />
            <Text style={styles.weatherText}>{weatherAlert}</Text>
          </View>
        </View>

        {/* Big Search Bar */}
        <View style={styles.searchSection}>
          <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/delivery/create')}>
             <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
             <Text style={styles.searchText}>Bạn muốn gửi gì?</Text>
          </TouchableOpacity>
          <View style={styles.searchActions}>
             <TouchableOpacity style={styles.actionBtn}>
               <Ionicons name="mic" size={24} color="#475569" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/delivery/package')}>
               <Ionicons name="camera" size={24} color="#475569" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.actionBtn}>
               <Ionicons name="qr-code" size={24} color="#475569" />
             </TouchableOpacity>
          </View>
        </View>

        {/* AI Personal Suggestion */}
        <TouchableOpacity style={styles.aiSuggestionCard} onPress={() => router.push('/delivery/create')}>
           <View style={styles.aiHeader}>
             <Ionicons name="sparkles" size={16} color="#F59E0B" />
             <Text style={styles.aiTitle}>AI Đề xuất cho bạn</Text>
           </View>
           <Text style={styles.aiBody}>Bạn thường gửi tài liệu đến Công ty vào giờ này. Tạo đơn siêu tốc ngay?</Text>
           <View style={styles.aiFooter}>
             <Text style={styles.aiFooterText}>Tạo đơn nhanh</Text>
             <Ionicons name="arrow-forward" size={16} color="#F59E0B" />
           </View>
        </TouchableOpacity>

        {/* Categories Grid */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Danh mục gửi hàng</Text>
          <View style={styles.grid}>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => router.push('/delivery/create')}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                  <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  historyBtn: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 26, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  weatherBubble: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, alignItems: 'center' },
  weatherText: { marginLeft: 10, color: '#1E3A8A', fontSize: 13, fontWeight: '500', flex: 1 },
  
  searchSection: { marginBottom: 32 },
  searchBox: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  searchText: { fontSize: 16, color: '#94A3B8', flex: 1 },
  searchActions: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  actionBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  
  aiSuggestionCard: { backgroundColor: '#FFFBEB', padding: 16, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: '#FDE68A' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aiTitle: { marginLeft: 8, fontSize: 13, fontWeight: 'bold', color: '#D97706', textTransform: 'uppercase' },
  aiBody: { fontSize: 15, color: '#92400E', fontWeight: '500', lineHeight: 22, marginBottom: 12 },
  aiFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12 },
  aiFooterText: { color: '#D97706', fontWeight: 'bold' },
  
  categoriesSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryItem: { width: '30%', alignItems: 'center', marginBottom: 24 },
  categoryIcon: { width: 64, height: 64, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 13, fontWeight: '600', color: '#475569' }
});
