import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  border: '#E2E8F0',
  principal: '#6366F1'
};

export default function PrincipalDashboard() {
  const router = useRouter();

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />
      <SafeAreaView style={S.safe}>
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.replace('/education')} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.primary} />
          </TouchableOpacity>
          <Text style={S.title}>TỔNG QUAN HỆ THỐNG</Text>
        </View>

        <ScrollView contentContainerStyle={S.scroll}>
          <Text style={S.welcome}>Xin chào, Hiệu trưởng!</Text>
          <Text style={S.schoolName}>THPT Chuyên Năng Khiếu</Text>

          <View style={S.statsGrid}>
            <View style={S.statCard}>
              <Ionicons name="cube" size={30} color={T.principal} />
              <Text style={S.statVal}>30</Text>
              <Text style={S.statLabel}>Lớp học</Text>
            </View>
            <View style={S.statCard}>
              <Ionicons name="easel" size={30} color="#10B981" />
              <Text style={S.statVal}>85</Text>
              <Text style={S.statLabel}>Giáo viên</Text>
            </View>
            <View style={S.statCard}>
              <Ionicons name="school" size={30} color="#3B82F6" />
              <Text style={S.statVal}>1,250</Text>
              <Text style={S.statLabel}>Học sinh</Text>
            </View>
            <View style={S.statCard}>
              <Ionicons name="warning" size={30} color="#EF4444" />
              <Text style={S.statVal}>12</Text>
              <Text style={S.statLabel}>Chưa liên kết</Text>
            </View>
          </View>

          <View style={S.card}>
            <Text style={S.cardTitle}>HOẠT ĐỘNG GẦN ĐÂY</Text>
            <View style={S.actRow}>
              <View style={S.actDot} />
              <Text style={S.actTxt}>Đã thêm Giáo viên <Text style={{fontWeight:'700'}}>Nguyễn Văn A (Toán)</Text> vào lớp 12A1.</Text>
            </View>
            <View style={S.actRow}>
              <View style={S.actDot} />
              <Text style={S.actTxt}>Học sinh <Text style={{fontWeight:'700'}}>Trần Bình Trọng</Text> đã được cấp ID thành công.</Text>
            </View>
            <View style={S.actRow}>
              <View style={S.actDot} />
              <Text style={S.actTxt}>Khởi tạo 15 lớp học khối 10 hoàn tất.</Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, padding: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn: { marginRight: 15 },
  title: { fontSize: 16, fontWeight: '800', color: T.primary, letterSpacing: 1 },
  scroll: { padding: 20 },

  welcome: { fontSize: 14, color: T.sub, fontWeight: '600' },
  schoolName: { fontSize: 24, fontWeight: '800', color: T.primary, marginBottom: 20 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 20 },
  statCard: { width: '47%', backgroundColor: T.white, padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  statVal: { fontSize: 28, fontWeight: '800', color: T.primary, marginTop: 10 },
  statLabel: { fontSize: 13, color: T.sub, fontWeight: '600', marginTop: 4 },

  card: { backgroundColor: T.white, borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, color: T.primary, marginBottom: 15 },
  actRow: { flexDirection: 'row', marginBottom: 12, paddingRight: 15 },
  actDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.principal, marginTop: 6, marginRight: 10 },
  actTxt: { fontSize: 14, color: T.primary, lineHeight: 22 },
});
