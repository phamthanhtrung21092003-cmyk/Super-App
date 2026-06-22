import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, SlideInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  border: '#E2E8F0',
  teacher: '#10B981',
};

const MOCK_DATA = [
  { id: '1', name: 'Nguyễn Văn An', scores: { s1: 8, s2: 7.5, s3: 8, s4: 9 } },
  { id: '2', name: 'Trần Thị Bình', scores: { s1: 9, s2: 9, s3: 8.5, s4: 9 } },
  { id: '3', name: 'Lê Hoàng Châu', scores: { s1: 6, s2: 7, s3: 6.5, s4: 7 } },
  { id: '4', name: 'Phạm Đức Dũng', scores: { s1: 5, s2: null, s3: 6, s4: null } },
  { id: '5', name: 'Hoàng Tú Anh', scores: { s1: 10, s2: 9.5, s3: 10, s4: 9 } },
];

export default function GradesScreen() {
  const router = useRouter();
  const [data, setData] = useState(MOCK_DATA);
  const [activeCell, setActiveCell] = useState<{ id: string; col: keyof typeof MOCK_DATA[0]['scores'] } | null>(null);

  const handleNumpad = (val: string) => {
    if (!activeCell) return;
    const { id, col } = activeCell;

    setData(prev => prev.map(student => {
      if (student.id === id) {
        let currentVal = student.scores[col] !== null ? student.scores[col].toString() : '';
        let newVal = '';

        if (val === 'DEL') {
          newVal = currentVal.slice(0, -1);
        } else if (val === '.') {
          if (!currentVal.includes('.')) newVal = currentVal + '.';
          else newVal = currentVal;
        } else {
          newVal = currentVal + val;
        }

        // Limit to 10
        let num = parseFloat(newVal);
        if (num > 10) newVal = '10';

        return {
          ...student,
          scores: {
            ...student.scores,
            [col]: newVal === '' ? null : parseFloat(newVal) || newVal // store as string temporary if ends with dot
          }
        };
      }
      return student;
    }));
  };

  const getAvg = (scores: any) => {
    const s = [scores.s1, scores.s2, scores.s3, scores.s4].filter(x => x !== null && x !== '');
    if (s.length === 0) return '-';
    const sum = s.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    return (sum / s.length).toFixed(1);
  };

  const saveGrades = () => {
    setActiveCell(null);
    if (Platform.OS === 'web') window.alert('✅ Đã lưu sổ điểm thành công!');
    else alert('Đã lưu sổ điểm thành công!');
    router.back();
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
            <Text style={S.title}>NHẬP SỔ ĐIỂM</Text>
            <Text style={S.subtitle}>Lớp 12A1 • Môn Toán</Text>
          </View>
        </View>

        <View style={S.tableContainer}>
          <View style={S.tableHeader}>
            <View style={[S.colName, S.headerCell]}><Text style={S.headerTxt}>Họ Tên</Text></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.scrollScores}>
              <View style={[S.colScore, S.headerCell]}><Text style={S.headerTxt}>Miệng</Text></View>
              <View style={[S.colScore, S.headerCell]}><Text style={S.headerTxt}>15 phút</Text></View>
              <View style={[S.colScore, S.headerCell]}><Text style={S.headerTxt}>1 tiết</Text></View>
              <View style={[S.colScore, S.headerCell]}><Text style={S.headerTxt}>Học kỳ</Text></View>
              <View style={[S.colScore, S.headerCell, { backgroundColor: '#F0FDF4' }]}><Text style={[S.headerTxt, { color: T.teacher }]}>TBM</Text></View>
            </ScrollView>
          </View>

          <ScrollView style={S.tableBody} showsVerticalScrollIndicator={false}>
            {data.map((student, index) => (
              <Animated.View key={student.id} entering={FadeInUp.delay(index * 100)} style={S.row}>
                <View style={[S.colName, S.cell]}><Text style={S.studentName} numberOfLines={1}>{student.name}</Text></View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.scrollScores} scrollEnabled={false}>
                  {['s1', 's2', 's3', 's4'].map((colKey) => {
                    const isActive = activeCell?.id === student.id && activeCell?.col === colKey;
                    const val = student.scores[colKey as keyof typeof student.scores];
                    return (
                      <TouchableOpacity 
                        key={colKey}
                        style={[S.colScore, S.cell, isActive && S.activeCell]}
                        onPress={() => setActiveCell({ id: student.id, col: colKey as any })}
                      >
                        <Text style={[S.scoreTxt, val !== null && val < 5 && { color: '#EF4444' }]}>
                          {val !== null ? val : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={[S.colScore, S.cell, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[S.scoreTxt, { fontWeight: '800', color: T.teacher }]}>{getAvg(student.scores)}</Text>
                  </View>
                </ScrollView>
              </Animated.View>
            ))}
            <View style={{ height: activeCell ? 300 : 100 }} />
          </ScrollView>
        </View>

        {!activeCell && (
          <Animated.View entering={FadeInUp} style={S.bottomBar}>
            <TouchableOpacity style={S.saveBtn} onPress={saveGrades}>
              <Text style={S.saveBtnTxt}>LƯU SỔ ĐIỂM</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {activeCell && (
          <Animated.View entering={SlideInDown.duration(300)} style={S.numpadContainer}>
            <View style={S.numpadHeader}>
              <Text style={S.numpadTitle}>Nhập điểm</Text>
              <TouchableOpacity onPress={() => setActiveCell(null)}>
                <Text style={S.numpadDone}>Xong</Text>
              </TouchableOpacity>
            </View>
            <View style={S.numpadGrid}>
              {['1','2','3','4','5','6','7','8','9','.', '0', 'DEL'].map((btn) => (
                <TouchableOpacity 
                  key={btn} 
                  style={[S.numBtn, btn === 'DEL' && { backgroundColor: '#FEE2E2' }]} 
                  onPress={() => handleNumpad(btn)}
                >
                  <Text style={[S.numBtnTxt, btn === 'DEL' && { color: '#EF4444' }]}>{btn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
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
  subtitle: { fontSize: 13, color: T.sub, fontWeight: '600', marginTop: 2 },

  tableContainer: { flex: 1, backgroundColor: T.white, marginTop: 10 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border, backgroundColor: '#F8FAFC' },
  tableBody: { flex: 1 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  
  colName: { width: 140, borderRightWidth: 1, borderRightColor: T.border, paddingLeft: 15 },
  scrollScores: { flex: 1 },
  colScore: { width: 70, borderRightWidth: 1, borderRightColor: '#F1F5F9' },
  
  headerCell: { height: 40, justifyContent: 'center' },
  headerTxt: { fontSize: 12, fontWeight: '700', color: T.sub, textAlign: 'center' },
  
  cell: { height: 50, justifyContent: 'center' },
  activeCell: { backgroundColor: '#DBEAFE', borderWidth: 2, borderColor: '#3B82F6' },
  studentName: { fontSize: 14, fontWeight: '600', color: T.primary },
  scoreTxt: { fontSize: 16, fontWeight: '600', color: T.primary, textAlign: 'center' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: T.white, padding: 20, borderTopWidth: 1, borderTopColor: T.border, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  saveBtn: { backgroundColor: T.teacher, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: T.teacher, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
  saveBtnTxt: { color: T.white, fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  numpadContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: T.border, paddingBottom: Platform.OS === 'ios' ? 34 : 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: -5 }, shadowRadius: 10, elevation: 20 },
  numpadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: T.border, backgroundColor: T.white },
  numpadTitle: { fontSize: 14, fontWeight: '700', color: T.sub },
  numpadDone: { fontSize: 16, fontWeight: '800', color: '#3B82F6' },
  numpadGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  numBtn: { width: '31%', aspectRatio: 2, backgroundColor: T.white, margin: '1.1%', borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 1 },
  numBtnTxt: { fontSize: 22, fontWeight: '700', color: T.primary },
});
