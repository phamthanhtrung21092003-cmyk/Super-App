import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Platform, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DriverProfile() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ tài xế</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Profile Info */}
        <View style={styles.profileCard}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>Trần Bình</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.badgeText}>4.95</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="diamond" size={14} color="#9333EA" />
                <Text style={[styles.badgeText, { color: '#7E22CE' }]}>Kim Cương</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="car" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.menuText}>Phương tiện (Van 29D-123.45)</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="card" size={20} color="#EF4444" />
            </View>
            <Text style={styles.menuText}>Ngân hàng nhận tiền</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="headset" size={20} color="#10B981" />
            </View>
            <Text style={styles.menuText}>Trung tâm hỗ trợ (AI Chat)</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="settings" size={20} color="#475569" />
            </View>
            <Text style={styles.menuText}>Cài đặt ứng dụng</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  content: { padding: 20 },
  
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  info: { flex: 1 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 13, fontWeight: 'bold', color: '#D97706', marginLeft: 4 },
  
  menuGroup: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 68 }
});
