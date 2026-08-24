import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEducation, GradeType } from '../../../context/EducationContext';

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  border: '#E2E8F0',
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#10B981'
};

const getGPAColor = (gpa: number | null) => {
  if (gpa === null) return T.sub;
  if (gpa < 5.0) return T.red;
  if (gpa < 8.0) return T.yellow;
  return T.green;
};

export default function Gradebook() {
  const router = useRouter();
  const { subjects, grades, getSubjectGPA, getOverallGPA, addGrade, deleteGrade } = useEducation();
  const overallGPA = getOverallGPA();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedType, setSelectedType] = useState<GradeType>('QUICK');
  const [scoreInput, setScoreInput] = useState('');

  const handleAddGrade = () => {
    const val = parseFloat(scoreInput.replace(',', '.'));
    if (isNaN(val) || val < 0 || val > 10 || !selectedSubject) {
      alert('Vui lòng nhập điểm hợp lệ (0-10) và chọn môn học.');
      return;
    }
    const weight = selectedType === 'QUICK' ? 1 : selectedType === 'MIDTERM' ? 2 : 3;
    addGrade(selectedSubject, selectedType, val, weight);
    setModalVisible(false);
    setScoreInput('');
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />
      <SafeAreaView style={S.safe}>
        
        {/* Header Summary */}
        <View style={S.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.replace('/education')} style={{ marginRight: 15 }}>
              <Ionicons name="arrow-back" size={26} color={T.primary} />
            </TouchableOpacity>
            <Text style={S.title}>SỔ ĐIỂM ĐIỆN TỬ</Text>
          </View>
          <View style={S.summaryCard}>
            <View>
              <Text style={S.summaryLabel}>ĐIỂM TRUNG BÌNH</Text>
              <Text style={[S.gpaBig, { color: getGPAColor(overallGPA) }]}>{overallGPA !== null ? overallGPA.toFixed(1) : '--'}</Text>
            </View>
            <View style={S.rankBadge}>
              <Text style={S.rankTxt}>{overallGPA !== null && overallGPA >= 8.0 ? 'GIỎI' : overallGPA !== null && overallGPA >= 6.5 ? 'KHÁ' : 'TRUNG BÌNH'}</Text>
            </View>
          </View>
        </View>

        {/* Subjects List */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {subjects.map(subj => {
            const subjGrades = grades.filter(g => g.subjectId === subj.id).sort((a, b) => a.date - b.date);
            const subjGPA = getSubjectGPA(subj.id);

            return (
              <View key={subj.id} style={S.subjectCard}>
                <View style={S.subjectHeader}>
                  <View style={S.subjectTitleWrap}>
                    <View style={[S.colorDot, { backgroundColor: subj.color }]} />
                    <Text style={S.subjectName}>{subj.name}</Text>
                  </View>
                  <Text style={[S.subjectGPA, { color: getGPAColor(subjGPA) }]}>{subjGPA !== null ? subjGPA.toFixed(1) : '-'}</Text>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.gradesRow}>
                  {subjGrades.map(g => (
                    <TouchableOpacity key={g.id} onLongPress={() => deleteGrade(g.id)} style={[S.gradePill, g.weight === 2 && S.gradePillMid, g.weight === 3 && S.gradePillFinal]}>
                      <Text style={[S.gradeVal, g.weight > 1 && { color: T.primary, fontWeight: '700' }]}>{g.value}</Text>
                      <Text style={S.gradeType}>{g.weight === 1 ? 'HS1' : g.weight === 2 ? 'HS2' : 'HS3'}</Text>
                    </TouchableOpacity>
                  ))}
                  {subjGrades.length === 0 && <Text style={S.noGradeTxt}>Chưa có điểm</Text>}
                </ScrollView>
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity style={S.fab} onPress={() => { setSelectedSubject(subjects[0]?.id || ''); setModalVisible(true); }}>
          <Ionicons name="add" size={32} color={T.white} />
        </TouchableOpacity>

      </SafeAreaView>

      {/* Add Grade Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={S.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={S.modalContent}>
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>NHẬP ĐIỂM MỚI</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={T.primary} /></TouchableOpacity>
            </View>

            <Text style={S.label}>Môn Học</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, marginBottom: 20 }}>
              {subjects.map(s => (
                <TouchableOpacity key={s.id} style={[S.chip, selectedSubject === s.id && S.chipActive]} onPress={() => setSelectedSubject(s.id)}>
                  <Text style={[S.chipTxt, selectedSubject === s.id && S.chipTxtActive]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={S.label}>Hệ Số Điểm</Text>
            <View style={S.typeRow}>
              {(['QUICK', 'MIDTERM', 'FINAL'] as GradeType[]).map(t => (
                <TouchableOpacity key={t} style={[S.chip, { flex: 1 }, selectedType === t && S.chipActive]} onPress={() => setSelectedType(t)}>
                  <Text style={[S.chipTxt, selectedType === t && S.chipTxtActive]}>{t === 'QUICK' ? 'HS1' : t === 'MIDTERM' ? 'HS2' : 'HS3'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={S.label}>Điểm Số (0 - 10)</Text>
            <TextInput 
              style={S.scoreInput}
              keyboardType="decimal-pad"
              placeholder="Ví dụ: 8.5"
              value={scoreInput}
              onChangeText={setScoreInput}
              autoFocus
            />

            <TouchableOpacity style={S.submitBtn} onPress={handleAddGrade}>
              <Text style={S.submitTxt}>LƯU ĐIỂM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  safe: { flex: 1 },
  header: { backgroundColor: T.white, padding: 20, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: T.primary, shadowOpacity: 0.05, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 5 },
  headerTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: T.sub, textAlign: 'center', marginBottom: 20 },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: T.sub, marginBottom: 4 },
  gpaBig: { fontSize: 48, fontWeight: '800' },
  rankBadge: { backgroundColor: T.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  rankTxt: { color: T.white, fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  subjectCard: { backgroundColor: T.white, borderRadius: 16, padding: 20, marginBottom: 15, shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  subjectTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  subjectName: { fontSize: 16, fontWeight: '600', color: T.primary },
  subjectGPA: { fontSize: 20, fontWeight: '700' },
  
  gradesRow: { gap: 10, alignItems: 'center' },
  gradePill: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: 'center', minWidth: 50 },
  gradePillMid: { backgroundColor: '#E0E7FF', borderWidth: 1, borderColor: '#C7D2FE' },
  gradePillFinal: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  gradeVal: { fontSize: 16, fontWeight: '600', color: T.sub },
  gradeType: { fontSize: 10, color: T.sub, marginTop: 2, fontWeight: '500' },
  noGradeTxt: { fontSize: 13, color: T.sub, fontStyle: 'italic' },

  fab: { position: 'absolute', bottom: 20, right: 20, width: 64, height: 64, borderRadius: 32, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center', shadowColor: T.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 8 }, shadowRadius: 15, elevation: 8 },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: T.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 16, fontWeight: '700', letterSpacing: 1, color: T.primary },
  
  label: { fontSize: 13, fontWeight: '600', color: T.sub, marginBottom: 10, marginTop: 10 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 10, alignItems: 'center' },
  chipActive: { backgroundColor: T.primary },
  chipTxt: { fontSize: 14, fontWeight: '500', color: T.sub },
  chipTxtActive: { color: T.white, fontWeight: '600' },
  
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  scoreInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: T.border, borderRadius: 16, padding: 20, fontSize: 32, fontWeight: '700', color: T.primary, textAlign: 'center', marginBottom: 30 },
  
  submitBtn: { backgroundColor: T.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  submitTxt: { color: T.white, fontSize: 15, fontWeight: '700', letterSpacing: 1 },
});
