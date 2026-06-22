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

export default function PrincipalManageSchool() {
  const router = useRouter();
  const [schoolName, setSchoolName] = useState('THPT Chuyên Năng Khiếu');
  const [classCount, setClassCount] = useState('30');
  
  // Mock classes
  const [classes, setClasses] = useState([
    { id: '12A1', name: '12A1 - Toán Tin' },
    { id: '12A2', name: '12A2 - Toán Lý' },
    { id: '11B1', name: '11B1 - Hóa Sinh' },
  ]);

  const [newClassId, setNewClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');

  const handleAddClass = () => {
    if (newClassId && newClassName) {
      setClasses([{ id: newClassId, name: newClassName }, ...classes]);
      setNewClassId('');
      setNewClassName('');
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
          <Text style={S.title}>QUẢN LÝ TRƯỜNG HỌC</Text>
        </View>

        <ScrollView contentContainerStyle={S.scroll}>
          {/* School Settings */}
          <View style={S.card}>
            <Text style={S.cardTitle}>THÔNG TIN CHUNG</Text>
            <View style={S.inputGroup}>
              <Text style={S.label}>Tên Trường</Text>
              <TextInput style={S.input} value={schoolName} onChangeText={setSchoolName} />
            </View>
            <View style={S.inputGroup}>
              <Text style={S.label}>Tổng số lớp dự kiến</Text>
              <TextInput style={S.input} value={classCount} onChangeText={setClassCount} keyboardType="numeric" />
            </View>
            <TouchableOpacity style={S.saveBtn}>
              <Text style={S.saveBtnTxt}>LƯU THÔNG TIN</Text>
            </TouchableOpacity>
          </View>

          {/* Class Settings */}
          <View style={S.card}>
            <Text style={S.cardTitle}>DANH SÁCH LỚP HỌC</Text>
            <Text style={S.cardDesc}>Tạo các lớp học để chuẩn bị liên kết Giáo viên và Học sinh.</Text>
            
            <View style={S.addClassRow}>
              <TextInput style={[S.input, { flex: 1, marginRight: 10 }]} placeholder="Mã lớp (VD: 10A1)" value={newClassId} onChangeText={setNewClassId} />
              <TextInput style={[S.input, { flex: 2, marginRight: 10 }]} placeholder="Tên lớp (VD: 10A1 - Tự nhiên)" value={newClassName} onChangeText={setNewClassName} />
              <TouchableOpacity style={S.addBtn} onPress={handleAddClass}>
                <Ionicons name="add" size={24} color={T.white} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20 }}>
              {classes.map((c, i) => (
                <View key={i} style={S.classRow}>
                  <View style={S.classIcon}><Ionicons name="cube" size={20} color={T.principal} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={S.className}>{c.name}</Text>
                    <Text style={S.classId}>Mã ID Lớp: {c.id}</Text>
                  </View>
                  <TouchableOpacity><Ionicons name="trash-outline" size={20} color="#EF4444" /></TouchableOpacity>
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

  card: { backgroundColor: T.white, borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, color: T.primary, marginBottom: 15 },
  cardDesc: { fontSize: 13, color: T.sub, marginBottom: 20 },

  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '700', color: T.sub, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: T.primary },

  saveBtn: { backgroundColor: T.principal, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnTxt: { color: T.white, fontSize: 13, fontWeight: '800', letterSpacing: 1 },

  addClassRow: { flexDirection: 'row', alignItems: 'center' },
  addBtn: { width: 48, height: 48, backgroundColor: T.principal, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  classRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  classIcon: { width: 40, height: 40, backgroundColor: '#EEF2FF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  className: { fontSize: 15, fontWeight: '700', color: T.primary },
  classId: { fontSize: 12, color: T.sub, marginTop: 2 },
});
