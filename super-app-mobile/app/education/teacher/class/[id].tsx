import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, TextInput, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  border: '#E2E8F0',
  teacher: '#10B981',
  red: '#EF4444',
};

const MOCK_STUDENTS = [
  { id: 'HS001', name: 'Nguyễn Văn An' },
  { id: 'HS002', name: 'Trần Thị Bình' },
  { id: 'HS003', name: 'Lê Hoàng Châu' },
  { id: 'HS004', name: 'Phạm Đức Dũng' },
  { id: 'HS005', name: 'Hoàng Tú Anh' },
];

export default function ClassDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgText, setMsgText] = useState('');

  const filteredStudents = MOCK_STUDENTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const saveAttendance = () => {
    if (Platform.OS === 'web') {
      window.alert('✅ Đã lưu điểm danh thành công!');
    } else {
      // Alert or custom toast in real app
      alert('Đã lưu điểm danh thành công!');
    }
    router.back();
  };

  const sendMsg = () => {
    if (!msgText.trim()) return;
    if (Platform.OS === 'web') {
      window.alert('✅ Đã gửi thông báo tới phụ huynh lớp ' + id);
    } else {
      alert('Đã gửi thông báo thành công!');
    }
    setShowMsgModal(false);
    setMsgText('');
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />
      <SafeAreaView style={S.safe}>
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.primary} />
          </TouchableOpacity>
          <View>
            <Text style={S.title}>LỚP {id}</Text>
            <Text style={S.subtitle}>Sĩ số: 45 | Vắng: {Object.values(attendance).filter(v => v).length}</Text>
          </View>
          <TouchableOpacity style={S.msgBtn} onPress={() => setShowMsgModal(true)}>
            <Ionicons name="chatbubbles" size={22} color={T.teacher} />
          </TouchableOpacity>
        </View>

        <View style={S.searchContainer}>
          <Ionicons name="search" size={20} color={T.sub} style={S.searchIcon} />
          <TextInput
            style={S.searchInput}
            placeholder="Tìm kiếm học sinh..."
            placeholderTextColor={T.sub}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
          <Text style={S.sectionTitle}>DANH SÁCH ĐIỂM DANH</Text>
          
          {filteredStudents.map((student, index) => (
            <Animated.View 
              key={student.id}
              entering={FadeInDown.delay(index * 100).duration(400)}
              layout={Layout.springify()}
            >
              <View style={S.studentCard}>
                <View style={S.avatar}>
                  <Text style={S.avatarTxt}>{student.name.charAt(0)}</Text>
                </View>
                <View style={S.studentInfo}>
                  <Text style={S.studentName}>{student.name}</Text>
                  <Text style={S.studentId}>{student.id}</Text>
                </View>

                {/* Nút điểm danh 1 chạm */}
                <TouchableOpacity 
                  style={[S.attBtn, attendance[student.id] ? S.attBtnAbsent : S.attBtnPresent]}
                  onPress={() => toggleAttendance(student.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[S.attTxt, attendance[student.id] ? S.attTxtAbsent : S.attTxtPresent]}>
                    {attendance[student.id] ? 'Vắng' : 'Có mặt'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
          <View style={{height: 100}} />
        </ScrollView>

        <Animated.View entering={FadeInUp.delay(500)} style={S.bottomBar}>
          <TouchableOpacity style={S.saveBtn} onPress={saveAttendance} activeOpacity={0.8}>
            <Text style={S.saveBtnTxt}>LƯU ĐIỂM DANH</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Modal Thông báo */}
        <Modal visible={showMsgModal} transparent animationType="slide">
          <View style={S.modalOverlay}>
            <View style={S.modalContent}>
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>Gửi thông báo lớp {id}</Text>
                <TouchableOpacity onPress={() => setShowMsgModal(false)}>
                  <Ionicons name="close" size={24} color={T.primary} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={S.msgInput}
                multiline
                placeholder="Nhập nội dung thông báo gửi tới Phụ huynh..."
                placeholderTextColor={T.sub}
                value={msgText}
                onChangeText={setMsgText}
              />
              <TouchableOpacity style={S.sendBtn} onPress={sendMsg}>
                <Text style={S.sendBtnTxt}>GỬI THÔNG BÁO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 20, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn: { marginRight: 15 },
  title: { fontSize: 18, fontWeight: '800', color: T.primary },
  subtitle: { fontSize: 12, color: T.sub, fontWeight: '600', marginTop: 2 },
  msgBtn: { marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, margin: 20, marginBottom: 10, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: T.border, height: 50 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 15, color: T.primary, ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  
  scroll: { padding: 20, paddingTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1, color: T.sub, marginBottom: 15 },
  
  studentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, padding: 15, borderRadius: 16, marginBottom: 12, shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 1 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTxt: { fontSize: 18, fontWeight: '700', color: T.primary },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '700', color: T.primary, marginBottom: 4 },
  studentId: { fontSize: 12, color: T.sub, fontWeight: '500' },
  
  attBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  attBtnPresent: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  attBtnAbsent: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  attTxt: { fontSize: 13, fontWeight: '700' },
  attTxtPresent: { color: T.teacher },
  attTxtAbsent: { color: T.red },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: T.white, padding: 20, borderTopWidth: 1, borderTopColor: T.border, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  saveBtn: { backgroundColor: T.teacher, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: T.teacher, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
  saveBtnTxt: { color: T.white, fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: T.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: T.primary },
  msgInput: { height: 120, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, fontSize: 15, color: T.primary, textAlignVertical: 'top', marginBottom: 20, borderWidth: 1, borderColor: T.border, ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  sendBtn: { backgroundColor: '#3B82F6', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  sendBtnTxt: { color: T.white, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
