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
  principal: '#6366F1'
};

export default function PrincipalLinking() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState('12A1');
  
  const [teacherId, setTeacherId] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [linkedTeachers, setLinkedTeachers] = useState([
    { id: 'GV-001', name: 'Nguyễn Văn A (Toán)' }
  ]);
  const [linkedStudents, setLinkedStudents] = useState([
    { id: 'HS-001', name: 'Trần Bình Trọng' },
    { id: 'HS-002', name: 'Lê Thị Hoa' }
  ]);

  const handleLinkTeacher = () => {
    if (teacherId) {
      setLinkedTeachers([...linkedTeachers, { id: teacherId, name: `Giáo viên mới (${teacherId})` }]);
      setTeacherId('');
    }
  };

  const handleLinkStudent = () => {
    if (studentId) {
      setLinkedStudents([...linkedStudents, { id: studentId, name: `Học sinh mới (${studentId})` }]);
      setStudentId('');
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
          <Text style={S.title}>LIÊN KẾT ID</Text>
        </View>

        <ScrollView contentContainerStyle={S.scroll}>
          {/* Class Selector Mock */}
          <View style={S.classSelectWrap}>
            <Text style={S.label}>Đang thao tác trên Lớp:</Text>
            <TouchableOpacity style={S.classSelectBtn}>
              <Text style={S.classSelectTxt}>{selectedClass}</Text>
              <Ionicons name="chevron-down" size={20} color={T.primary} />
            </TouchableOpacity>
          </View>

          {/* Teacher Linking */}
          <View style={S.card}>
            <Text style={S.cardTitle}>GIÁO VIÊN BỘ MÔN & CHỦ NHIỆM</Text>
            <Text style={S.cardDesc}>Nhập mã ID Giáo viên để phân công giảng dạy cho lớp {selectedClass}.</Text>
            
            <View style={S.inputRow}>
              <Ionicons name="scan" size={24} color={T.sub} style={S.inputIcon} />
              <TextInput style={S.input} placeholder="Nhập ID Giáo viên (VD: GV-001)" value={teacherId} onChangeText={setTeacherId} />
              <TouchableOpacity style={S.linkBtn} onPress={handleLinkTeacher}>
                <Text style={S.linkBtnTxt}>LIÊN KẾT</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 15 }}>
              {linkedTeachers.map((t, i) => (
                <View key={i} style={S.linkedRow}>
                  <Ionicons name="person-circle" size={24} color={T.principal} />
                  <Text style={S.linkedName}>{t.name}</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              ))}
            </View>
          </View>

          {/* Student Linking */}
          <View style={S.card}>
            <Text style={S.cardTitle}>DANH SÁCH HỌC SINH</Text>
            <Text style={S.cardDesc}>Nhập mã ID Học sinh để thêm các em vào lớp {selectedClass}.</Text>
            
            <View style={S.inputRow}>
              <Ionicons name="scan" size={24} color={T.sub} style={S.inputIcon} />
              <TextInput style={S.input} placeholder="Nhập ID Học sinh (VD: HS-001)" value={studentId} onChangeText={setStudentId} />
              <TouchableOpacity style={S.linkBtn} onPress={handleLinkStudent}>
                <Text style={S.linkBtnTxt}>THÊM</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 15 }}>
              {linkedStudents.map((s, i) => (
                <View key={i} style={S.linkedRow}>
                  <Ionicons name="school" size={24} color="#3B82F6" />
                  <Text style={S.linkedName}>{s.name}</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
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

  classSelectWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: T.sub },
  classSelectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  classSelectTxt: { fontSize: 16, fontWeight: '800', color: T.primary, marginRight: 5 },

  card: { backgroundColor: T.white, borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, color: T.primary, marginBottom: 5 },
  cardDesc: { fontSize: 13, color: T.sub, marginBottom: 20 },

  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 10 },
  inputIcon: { marginRight: 5 },
  input: { flex: 1, height: 48, fontSize: 14, fontWeight: '600', color: T.primary },
  linkBtn: { backgroundColor: T.principal, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  linkBtnTxt: { color: T.white, fontSize: 12, fontWeight: '800' },

  linkedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  linkedName: { flex: 1, fontSize: 14, fontWeight: '600', color: T.primary, marginLeft: 10 },
});
