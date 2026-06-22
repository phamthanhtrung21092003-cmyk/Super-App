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
  teacher: '#10B981'
};

export default function TeacherDashboard() {
  const router = useRouter();

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />
      <SafeAreaView style={S.safe}>
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.replace('/education')} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.primary} />
          </TouchableOpacity>
          <Text style={S.title}>BÀN LÀM VIỆC CỦA GIÁO VIÊN</Text>
        </View>

        <ScrollView contentContainerStyle={S.scroll}>
          <Text style={S.welcome}>Mã GV: GV-001</Text>
          <Text style={S.name}>Giáo viên: Nguyễn Văn A</Text>
          <Text style={S.subject}>Bộ môn: Toán học</Text>

          <View style={S.card}>
            <Text style={S.cardTitle}>LỚP ĐANG GIẢNG DẠY (2)</Text>
            
            <TouchableOpacity style={S.classItem}>
              <View style={S.classIcon}><Ionicons name="people" size={24} color={T.white} /></View>
              <View style={{ flex: 1 }}>
                <Text style={S.className}>Lớp 12A1 (Chủ nhiệm)</Text>
                <Text style={S.classDesc}>Sĩ số: 45 học sinh | Chưa nhập điểm giữa kỳ</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={T.sub} />
            </TouchableOpacity>

            <TouchableOpacity style={S.classItem}>
              <View style={[S.classIcon, { backgroundColor: '#3B82F6' }]}><Ionicons name="book" size={24} color={T.white} /></View>
              <View style={{ flex: 1 }}>
                <Text style={S.className}>Lớp 12A2</Text>
                <Text style={S.classDesc}>Sĩ số: 42 học sinh | Đã hoàn thành điểm</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>

          <View style={S.card}>
            <Text style={S.cardTitle}>CÔNG CỤ GIẢNG DẠY</Text>
            <View style={S.toolsGrid}>
              <TouchableOpacity style={S.toolBtn}>
                <Ionicons name="create" size={32} color={T.teacher} />
                <Text style={S.toolTxt}>Nhập sổ điểm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.toolBtn}>
                <Ionicons name="document-text" size={32} color="#3B82F6" />
                <Text style={S.toolTxt}>Giao bài tập</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.toolBtn}>
                <Ionicons name="calendar" size={32} color="#F59E0B" />
                <Text style={S.toolTxt}>Lịch báo giảng</Text>
              </TouchableOpacity>
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

  welcome: { fontSize: 13, color: T.sub, fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '800', color: T.primary, marginTop: 4 },
  subject: { fontSize: 15, color: T.teacher, fontWeight: '700', marginBottom: 20 },

  card: { backgroundColor: T.white, borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, color: T.primary, marginBottom: 15 },

  classItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  classIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: T.teacher, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  className: { fontSize: 16, fontWeight: '700', color: T.primary },
  classDesc: { fontSize: 12, color: T.sub, marginTop: 4 },

  toolsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  toolBtn: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: T.border },
  toolTxt: { fontSize: 12, fontWeight: '700', color: T.primary, marginTop: 8, textAlign: 'center' },
});
