import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, SlideInDown, FadeIn } from 'react-native-reanimated';

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  border: '#E2E8F0',
  teacher: '#10B981',
};

const MOCK_ACTIVE = [
  { id: '1', title: 'Bài tập Đại số: Đạo hàm', class: '12A1', deadline: '23:59 - 25/10', total: 45, submitted: 30 },
  { id: '2', title: 'Kiểm tra 15p: Hình không gian', class: '12A2', deadline: '10:00 - 26/10', total: 42, submitted: 5 },
];

const MOCK_PAST = [
  { id: '3', title: 'Bài tập Khảo sát hàm số', class: '12A1', deadline: 'Đã hết hạn', total: 45, submitted: 45 },
];

export default function AssignmentsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const createAssignment = () => {
    if (Platform.OS === 'web') window.alert('✅ Đã giao bài tập thành công!');
    else alert('Đã giao bài tập thành công!');
    setShowModal(false);
    setNewTitle('');
  };

  const renderItem = (item: any, index: number) => {
    const progress = item.total ? (item.submitted / item.total) * 100 : 0;
    
    return (
      <Animated.View key={item.id} entering={FadeInUp.delay(index * 150)} style={S.card}>
        <View style={S.cardHeader}>
          <View style={S.iconBox}><Ionicons name="document-text" size={20} color={T.teacher} /></View>
          <View style={S.cardInfo}>
            <Text style={S.cardTitle}>{item.title}</Text>
            <Text style={S.cardSub}>{item.class} • Hạn nộp: {item.deadline}</Text>
          </View>
        </View>
        
        <View style={S.progressHeader}>
          <Text style={S.progressTxt}>Đã nộp: <Text style={{fontWeight: '700', color: T.primary}}>{item.submitted}/{item.total}</Text></Text>
          <Text style={S.progressPct}>{Math.round(progress)}%</Text>
        </View>
        <View style={S.progressBg}>
          <Animated.View style={[S.progressFill, { width: `${progress}%` }]} />
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />
      <SafeAreaView style={S.safe}>
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.primary} />
          </TouchableOpacity>
          <Text style={S.title}>GIAO BÀI TẬP</Text>
        </View>

        <View style={S.tabs}>
          <TouchableOpacity style={[S.tabBtn, tab === 'active' && S.tabActive]} onPress={() => setTab('active')} activeOpacity={0.7}>
            <Text style={[S.tabTxt, tab === 'active' && S.tabTxtActive]}>Đang diễn ra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.tabBtn, tab === 'past' && S.tabActive]} onPress={() => setTab('past')} activeOpacity={0.7}>
            <Text style={[S.tabTxt, tab === 'past' && S.tabTxtActive]}>Đã kết thúc</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'active' ? MOCK_ACTIVE.map(renderItem) : MOCK_PAST.map(renderItem)}
          <View style={{height: 100}} />
        </ScrollView>

        <Animated.View entering={FadeIn.delay(500)} style={S.fabContainer}>
          <TouchableOpacity style={S.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={32} color={T.white} />
          </TouchableOpacity>
        </Animated.View>

        {/* Modal Create Assignment */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={S.modalOverlay}>
            <View style={S.modalContent}>
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>Tạo bài tập mới</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color={T.primary} />
                </TouchableOpacity>
              </View>
              
              <Text style={S.label}>TÊN BÀI TẬP</Text>
              <TextInput
                style={S.input}
                placeholder="Nhập tên bài tập..."
                placeholderTextColor={T.sub}
                value={newTitle}
                onChangeText={setNewTitle}
              />
              
              <Text style={S.label}>LỚP NHẬN BÀI</Text>
              <View style={S.checkboxRow}>
                <TouchableOpacity style={S.checkboxActive} activeOpacity={0.8}>
                  <Text style={S.checkboxTxtActive}>12A1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.checkbox} activeOpacity={0.8}>
                  <Text style={S.checkboxTxt}>12A2</Text>
                </TouchableOpacity>
              </View>

              <Text style={S.label}>ĐÍNH KÈM TÀI LIỆU</Text>
              <TouchableOpacity style={S.attachBtn} activeOpacity={0.7}>
                <Ionicons name="cloud-upload-outline" size={24} color="#3B82F6" />
                <Text style={S.attachTxt}>Tải file bài tập lên (PDF, Word)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={S.submitBtn} onPress={createAssignment} activeOpacity={0.8}>
                <Text style={S.submitBtnTxt}>GIAO BÀI NGAY</Text>
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

  tabs: { flexDirection: 'row', backgroundColor: T.white, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: T.teacher },
  tabTxt: { fontSize: 14, fontWeight: '600', color: T.sub },
  tabTxtActive: { color: T.teacher, fontWeight: '800' },

  scroll: { padding: 20 },
  
  card: { backgroundColor: T.white, borderRadius: 16, padding: 20, marginBottom: 15, shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: T.primary, marginBottom: 4 },
  cardSub: { fontSize: 13, color: T.sub, fontWeight: '500' },

  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTxt: { fontSize: 13, color: T.sub },
  progressPct: { fontSize: 13, fontWeight: '800', color: T.teacher },
  progressBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: T.teacher, borderRadius: 4 },

  fabContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 30, right: 20 },
  fab: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', shadowColor: '#3B82F6', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: T.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: T.primary },
  
  label: { fontSize: 12, fontWeight: '800', color: T.sub, letterSpacing: 1, marginBottom: 10, marginTop: 5 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, fontSize: 15, color: T.primary, borderWidth: 1, borderColor: T.border, marginBottom: 20, ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  
  checkboxRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  checkbox: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: T.border, backgroundColor: '#F8FAFC', marginRight: 10 },
  checkboxActive: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: T.teacher, backgroundColor: '#F0FDF4', marginRight: 10 },
  checkboxTxt: { fontSize: 14, fontWeight: '600', color: T.sub },
  checkboxTxtActive: { fontSize: 14, fontWeight: '700', color: T.teacher },

  attachBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE', backgroundColor: '#EFF6FF', borderStyle: 'dashed', marginBottom: 30 },
  attachTxt: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#3B82F6' },

  submitBtn: { backgroundColor: T.teacher, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: T.teacher, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
  submitBtnTxt: { color: T.white, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
