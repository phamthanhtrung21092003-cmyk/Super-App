import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  border: '#E2E8F0',
  principal: '#6366F1', // Indigo
  teacher: '#10B981', // Emerald
  parent: '#F59E0B', // Amber
  student: '#3B82F6', // Blue
};

export default function RoleSelection() {
  const router = useRouter();

  const renderRoleCard = (title: string, desc: string, icon: keyof typeof Ionicons.glyphMap, color: string, route: string) => (
    <TouchableOpacity style={[S.card, { borderColor: color }]} onPress={() => router.push(route)}>
      <View style={[S.iconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <View style={S.textWrap}>
        <Text style={[S.title, { color }]}>{title}</Text>
        <Text style={S.desc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={T.border} />
    </TouchableOpacity>
  );

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <SafeAreaView style={S.safe}>
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.primary} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>HỆ SINH THÁI GIÁO DỤC</Text>
        </View>

        <View style={S.body}>
          <Text style={S.headline}>Chào mừng đến với hệ thống!</Text>
          <Text style={S.subHeadline}>Vui lòng chọn vai trò của bạn để tiếp tục sử dụng các chức năng quản lý, giảng dạy hoặc học tập.</Text>

          <View style={S.grid}>
            {renderRoleCard('HIỆU TRƯỞNG', 'Quản trị hệ thống trường, phân quyền giáo viên và lớp học.', 'school', T.principal, '/education/principal')}
            {renderRoleCard('GIÁO VIÊN', 'Quản lý lớp học, nhập sổ điểm, giao bài tập cho học sinh.', 'easel', T.teacher, '/education/teacher')}
            {renderRoleCard('PHỤ HUYNH', 'Theo dõi điểm số, điểm danh, thông báo học phí của con cái.', 'people', T.parent, '/education/parent')}
            {renderRoleCard('HỌC SINH', 'Xem thời khóa biểu, sổ điểm điện tử, định hướng nghề nghiệp.', 'school-outline', T.student, '/education/student')}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: T.primary, letterSpacing: 1 },
  
  body: { padding: 20 },
  headline: { fontSize: 24, fontWeight: '800', color: T.primary, marginBottom: 8 },
  subHeadline: { fontSize: 14, color: T.sub, lineHeight: 22, marginBottom: 30 },

  grid: { gap: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, padding: 20, borderRadius: 16, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
  iconWrap: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  desc: { fontSize: 12, color: T.sub, lineHeight: 18 },
});
