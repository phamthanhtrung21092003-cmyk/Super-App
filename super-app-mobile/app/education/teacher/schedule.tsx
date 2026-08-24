import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  border: '#E2E8F0',
  teacher: '#10B981',
};

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MOCK_SCHEDULE = [
  { id: '1', period: 'Tiết 1', time: '07:00 - 07:45', class: '12A1', subject: 'Toán học', status: 'past', note: '' },
  { id: '2', period: 'Tiết 2', time: '07:50 - 08:35', class: '12A2', subject: 'Toán học', status: 'active', note: 'Kiểm tra 15 phút' },
  { id: '3', period: 'Tiết 3', time: '08:50 - 09:35', class: '12A3', subject: 'Toán học', status: 'upcoming', note: '' },
  { id: '4', period: 'Tiết 4', time: '09:40 - 10:25', class: '', subject: 'Nghỉ giải lao', status: 'upcoming', note: '' },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const [activeDay, setActiveDay] = useState(1); // T3
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [noteText, setNoteText] = useState('');

  const openNote = (period: any) => {
    setSelectedPeriod(period);
    setNoteText(period.note);
    setShowNoteModal(true);
  };

  const saveNote = () => {
    // Mock save
    setShowNoteModal(false);
  };

  const getStatusColor = (status: string) => {
    if (status === 'past') return { bg: '#F1F5F9', border: '#E2E8F0', text: T.sub };
    if (status === 'active') return { bg: '#F0FDF4', border: '#10B981', text: '#10B981' };
    return { bg: '#EFF6FF', border: '#3B82F6', text: '#3B82F6' }; // upcoming
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />
      <SafeAreaView style={S.safe}>
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.primary} />
          </TouchableOpacity>
          <Text style={S.title}>LỊCH BÁO GIẢNG</Text>
        </View>

        <View style={S.calendarStrip}>
          {DAYS.map((d, i) => (
            <TouchableOpacity 
              key={d} 
              style={[S.dayBtn, activeDay === i && S.dayBtnActive]}
              onPress={() => setActiveDay(i)}
            >
              <Text style={[S.dayTxt, activeDay === i && S.dayTxtActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
          <Text style={S.dateLabel}>Hôm nay, 26 tháng 10</Text>

          <View style={S.timeline}>
            {MOCK_SCHEDULE.map((item, index) => {
              const colors = getStatusColor(item.status);
              return (
                <Animated.View key={item.id} entering={FadeInUp.delay(index * 150)} style={S.timelineItem}>
                  <View style={S.timeCol}>
                    <Text style={S.timePeriod}>{item.period}</Text>
                    <Text style={S.timeTxt}>{item.time.split(' - ')[0]}</Text>
                  </View>
                  
                  <View style={S.lineWrapper}>
                    <View style={[S.dot, { borderColor: colors.border, backgroundColor: colors.bg }]} />
                    {index < MOCK_SCHEDULE.length - 1 && <View style={[S.line, { backgroundColor: T.border }]} />}
                  </View>

                  <TouchableOpacity 
                    style={[S.card, { backgroundColor: colors.bg, borderColor: colors.border }]}
                    onPress={() => openNote(item)}
                    activeOpacity={0.8}
                  >
                    {item.class ? (
                      <>
                        <View style={S.cardRow}>
                          <Text style={[S.cardClass, { color: colors.text }]}>Lớp {item.class}</Text>
                          {item.status === 'active' && <View style={S.activeBadge}><Text style={S.activeBadgeTxt}>Đang dạy</Text></View>}
                        </View>
                        <Text style={S.cardSubject}>{item.subject}</Text>
                        {item.note ? (
                          <View style={S.noteBox}>
                            <Ionicons name="information-circle" size={14} color={colors.text} />
                            <Text style={[S.noteTxt, { color: colors.text }]}>{item.note}</Text>
                          </View>
                        ) : null}
                      </>
                    ) : (
                      <Text style={S.cardSubject}>{item.subject}</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
          <View style={{height: 100}} />
        </ScrollView>

        {/* Modal Ghi chú */}
        <Modal visible={showNoteModal} transparent animationType="fade">
          <View style={S.modalOverlay}>
            <View style={S.modalContent}>
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>Ghi chú: {selectedPeriod?.period}</Text>
                <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                  <Ionicons name="close" size={24} color={T.primary} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={S.noteInput}
                multiline
                placeholder="Nhập ghi chú cho tiết học này (VD: Kiểm tra bài cũ)..."
                placeholderTextColor={T.sub}
                value={noteText}
                onChangeText={setNoteText}
                autoFocus
              />
              
              <TouchableOpacity style={S.saveBtn} onPress={saveNote}>
                <Text style={S.saveBtnTxt}>LƯU GHI CHÚ</Text>
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

  calendarStrip: { flexDirection: 'row', backgroundColor: T.white, paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  dayBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, marginHorizontal: 5, borderRadius: 12 },
  dayBtnActive: { backgroundColor: T.primary },
  dayTxt: { fontSize: 14, fontWeight: '600', color: T.sub },
  dayTxtActive: { color: T.white, fontWeight: '800' },

  scroll: { padding: 20 },
  dateLabel: { fontSize: 16, fontWeight: '800', color: T.primary, marginBottom: 20 },

  timeline: { flex: 1 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timeCol: { width: 50, alignItems: 'flex-end', paddingTop: 5 },
  timePeriod: { fontSize: 13, fontWeight: '800', color: T.primary },
  timeTxt: { fontSize: 11, color: T.sub, marginTop: 2 },

  lineWrapper: { width: 30, alignItems: 'center', position: 'relative' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, marginTop: 7, backgroundColor: T.white, zIndex: 2 },
  line: { position: 'absolute', top: 21, bottom: -20, width: 2, zIndex: 1 },

  card: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 15, marginLeft: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardClass: { fontSize: 14, fontWeight: '800' },
  activeBadge: { backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeBadgeTxt: { color: T.white, fontSize: 10, fontWeight: '800' },
  cardSubject: { fontSize: 15, fontWeight: '600', color: T.primary },
  
  noteBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 8 },
  noteTxt: { fontSize: 12, fontWeight: '500', marginLeft: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: T.white, borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: T.primary },
  
  noteInput: { height: 120, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, fontSize: 15, color: T.primary, textAlignVertical: 'top', marginBottom: 20, borderWidth: 1, borderColor: T.border, ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  saveBtn: { backgroundColor: T.teacher, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  saveBtnTxt: { color: T.white, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
