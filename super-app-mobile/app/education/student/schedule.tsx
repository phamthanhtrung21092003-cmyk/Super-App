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
  accent: '#3B82F6',
};

const SCHEDULE = [
  { time: '07:00', type: 'CLASS', title: 'Toán học (Tiết 1)', room: 'Lớp 12A1', duration: '45p' },
  { time: '07:45', type: 'CLASS', title: 'Vật Lý (Tiết 2)', room: 'Lớp 12A1', duration: '45p' },
  { time: '08:45', type: 'EXAM', title: 'Kiểm tra 1 tiết: Hóa học', room: 'Lớp 12A1', duration: '45p' },
  { time: '14:00', type: 'CLASS', title: 'Thực hành Sinh học', room: 'Phòng Lab Sinh', duration: '90p' },
  { time: '20:00', type: 'DEADLINE', title: 'Hạn chót làm bài tập Anh văn', room: 'Nộp trên nhóm Zalo', duration: '' },
];

export default function EducationSchedule() {
  const router = useRouter();
  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />
      <SafeAreaView style={S.safe}>
        
        <View style={S.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.replace('/education')} style={{ marginRight: 15 }}>
              <Ionicons name="arrow-back" size={26} color={T.primary} />
            </TouchableOpacity>
            <Text style={S.title}>LỊCH TRÌNH</Text>
          </View>
          <TouchableOpacity style={S.filterBtn}><Ionicons name="options" size={20} color={T.primary} /></TouchableOpacity>
        </View>

        {/* Horizontal Calendar Bar */}
        <View style={S.calendarBar}>
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
            <TouchableOpacity key={day} style={[S.dayPill, i === 2 && S.dayPillActive]}>
              <Text style={[S.dayName, i === 2 && S.dayNameActive]}>{day}</Text>
              <Text style={[S.dayNum, i === 2 && S.dayNumActive]}>{18 + i}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <Text style={S.dateLabel}>THỨ TƯ, 20 THÁNG 6</Text>

          <View style={S.timeline}>
            {SCHEDULE.map((item, idx) => (
              <View key={idx} style={S.timelineItem}>
                {/* Time Column */}
                <View style={S.timeCol}>
                  <Text style={S.timeTxt}>{item.time}</Text>
                </View>
                
                {/* Line & Dot */}
                <View style={S.lineCol}>
                  <View style={[S.dot, item.type === 'EXAM' ? { borderColor: '#EF4444' } : item.type === 'DEADLINE' ? { borderColor: '#F59E0B' } : {}]} />
                  {idx !== SCHEDULE.length - 1 && <View style={S.line} />}
                </View>

                {/* Card Column */}
                <View style={[S.cardCol, item.type === 'EXAM' && S.cardExam]}>
                  <View style={S.cardHeader}>
                    <Text style={[S.cardTitle, item.type === 'EXAM' && { color: T.white }]}>{item.title}</Text>
                    {item.duration ? <Text style={[S.cardDuration, item.type === 'EXAM' && { color: 'rgba(255,255,255,0.7)' }]}>{item.duration}</Text> : null}
                  </View>
                  <View style={S.cardFooter}>
                    <Ionicons name="location-outline" size={14} color={item.type === 'EXAM' ? 'rgba(255,255,255,0.7)' : T.sub} />
                    <Text style={[S.cardRoom, item.type === 'EXAM' && { color: 'rgba(255,255,255,0.9)' }]}>{item.room}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.white },
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: T.primary, letterSpacing: 1 },
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  calendarBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  dayPill: { width: 45, height: 65, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: T.white },
  dayPillActive: { backgroundColor: T.primary, shadowColor: T.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5 },
  dayName: { fontSize: 11, fontWeight: '600', color: T.sub, marginBottom: 8 },
  dayNameActive: { color: 'rgba(255,255,255,0.7)' },
  dayNum: { fontSize: 16, fontWeight: '700', color: T.primary },
  dayNumActive: { color: T.white },

  dateLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: T.sub, marginBottom: 20 },

  timeline: { flex: 1 },
  timelineItem: { flexDirection: 'row', minHeight: 100 },
  
  timeCol: { width: 50 },
  timeTxt: { fontSize: 13, fontWeight: '600', color: T.primary, marginTop: 2 },
  
  lineCol: { width: 30, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: T.accent, backgroundColor: T.white, zIndex: 2 },
  line: { width: 2, flex: 1, backgroundColor: T.border, marginTop: -14, zIndex: 1 },
  
  cardCol: { flex: 1, backgroundColor: T.bg, padding: 15, borderRadius: 12, marginBottom: 20 },
  cardExam: { backgroundColor: '#EF4444', shadowColor: '#EF4444', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: T.primary, flex: 1, paddingRight: 10 },
  cardDuration: { fontSize: 12, fontWeight: '600', color: T.sub },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  cardRoom: { fontSize: 12, color: T.sub, marginLeft: 6 },
});
