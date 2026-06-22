import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  border: '#E2E8F0',
  parent: '#F59E0B'
};

export default function ParentDashboard() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [isLinked, setIsLinked] = useState(false);

  const handleLink = () => {
    if (studentId === 'HS-001') {
      setIsLinked(true);
    } else {
      alert('Không tìm thấy mã học sinh này!');
    }
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />
      <SafeAreaView style={S.safe}>
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.replace('/education')} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.primary} />
          </TouchableOpacity>
          <Text style={S.title}>CỔNG PHỤ HUYNH</Text>
        </View>

        <ScrollView contentContainerStyle={S.scroll}>
          {!isLinked ? (
            <View style={S.card}>
              <View style={S.iconWrap}><Ionicons name="link" size={40} color={T.parent} /></View>
              <Text style={S.cardTitle}>LIÊN KẾT HỒ SƠ HỌC SINH</Text>
              <Text style={S.cardDesc}>Vui lòng nhập Mã ID Học sinh do Nhà trường cấp để theo dõi quá trình học tập của con bạn.</Text>
              
              <TextInput 
                style={S.input} 
                placeholder="Nhập mã (VD: HS-001)" 
                value={studentId} 
                onChangeText={setStudentId} 
                autoCapitalize="characters"
              />
              <TouchableOpacity style={S.linkBtn} onPress={handleLink}>
                <Text style={S.linkBtnTxt}>KẾT NỐI</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={S.welcome}>Chào mừng Phụ huynh của:</Text>
              <Text style={S.name}>Trần Bình Trọng</Text>
              <Text style={S.subject}>Lớp 12A1 | Mã HS: HS-001</Text>

              <View style={S.card}>
                <Text style={S.cardTitle}>THEO DÕI HỌC TẬP</Text>
                <View style={S.toolsGrid}>
                  <TouchableOpacity style={S.toolBtn} onPress={() => router.push('/education/student/gradebook')}>
                    <Ionicons name="stats-chart" size={32} color={T.parent} />
                    <Text style={S.toolTxt}>Xem Bảng điểm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={S.toolBtn} onPress={() => router.push('/education/student/schedule')}>
                    <Ionicons name="calendar" size={32} color="#3B82F6" />
                    <Text style={S.toolTxt}>Lịch học & Thi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={S.toolBtn} onPress={() => router.push('/education/student/analytics')}>
                    <Ionicons name="compass" size={32} color="#10B981" />
                    <Text style={S.toolTxt}>Báo cáo Hướng nghiệp</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={S.card}>
                <Text style={S.cardTitle}>THÔNG BÁO TỪ NHÀ TRƯỜNG</Text>
                <View style={S.actRow}>
                  <Ionicons name="notifications" size={20} color={T.sub} style={{marginRight: 10}} />
                  <Text style={S.actTxt}>Ngày mai 23/06, học sinh được nghỉ học do trường tổ chức kỳ thi giáo viên giỏi cấp thành phố.</Text>
                </View>
                <View style={S.actRow}>
                  <Ionicons name="notifications" size={20} color={T.sub} style={{marginRight: 10}} />
                  <Text style={S.actTxt}>Nhà trường nhắc nhở hoàn thành học phí học kỳ 2 trước ngày 30/06.</Text>
                </View>
              </View>
            </>
          )}

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
  subject: { fontSize: 15, color: T.sub, fontWeight: '600', marginBottom: 20 },

  iconWrap: { alignItems: 'center', marginBottom: 15 },
  card: { backgroundColor: T.white, borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, color: T.primary, marginBottom: 15 },
  cardDesc: { fontSize: 14, color: T.sub, marginBottom: 20, textAlign: 'center', lineHeight: 22 },

  input: { backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 14, fontSize: 16, fontWeight: '600', color: T.primary, textAlign: 'center' },
  linkBtn: { backgroundColor: T.parent, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  linkBtnTxt: { color: T.white, fontSize: 14, fontWeight: '800', letterSpacing: 1 },

  toolsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  toolBtn: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: T.border },
  toolTxt: { fontSize: 11, fontWeight: '700', color: T.primary, marginTop: 8, textAlign: 'center' },

  actRow: { flexDirection: 'row', marginBottom: 12, paddingRight: 15, alignItems: 'flex-start' },
  actTxt: { flex: 1, fontSize: 14, color: T.primary, lineHeight: 22 },
});
