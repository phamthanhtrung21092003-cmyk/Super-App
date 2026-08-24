import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  accent: '#3B82F6',
  border: '#E2E8F0',
};

const MOCK_COURSES = [
  { id: '1', title: 'IELTS 7.0 Masterclass', author: 'Dr. John Doe', image: 'https://images.unsplash.com/photo-1546410531-ee4cb1270cb2?auto=format&fit=crop&w=600&q=80', tag: 'Ngoại ngữ' },
  { id: '2', title: 'Lập trình React Native', author: 'Antigravity Studio', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', tag: 'Công nghệ' },
  { id: '3', title: 'Tài chính cá nhân', author: 'Warren B.', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80', tag: 'Kỹ năng' },
];

export default function EducationHome() {
  const router = useRouter();

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <SafeAreaView style={S.safe}>
        <View style={S.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.replace('/education')} style={{ marginRight: 15 }}>
              <Ionicons name="arrow-back" size={26} color={T.primary} />
            </TouchableOpacity>
            <View>
              <Text style={S.greeting}>Chào buổi sáng,</Text>
              <Text style={S.name}>Nguyễn Văn A</Text>
              <Text style={S.studentId}>Mã HS: HS-001</Text>
            </View>
          </View>
          <TouchableOpacity style={S.idBadgeBtn}>
            <Ionicons name="qr-code" size={20} color={T.white} />
            <Text style={S.idBadgeTxt}>Mã của tôi</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Resume Learning Card */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>TIẾP TỤC HỌC</Text>
            <View style={S.resumeCard}>
              <View style={S.resumeInfo}>
                <Text style={S.resumeCourseTitle} numberOfLines={2}>Toán 12 - Khảo sát hàm số</Text>
                <Text style={S.resumeLesson}>Bài 4: Đường tiệm cận</Text>
                
                <View style={S.progressWrapper}>
                  <View style={S.progressBar}><View style={[S.progressFill, { width: '65%' }]} /></View>
                  <Text style={S.progressTxt}>65%</Text>
                </View>
              </View>
              <TouchableOpacity style={S.playBtn}>
                <Ionicons name="play" size={24} color={T.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Quests */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>MỤC TIÊU HÔM NAY</Text>
            <View style={S.questCard}>
              <View style={S.questIcon}><Ionicons name="book" size={20} color={T.accent} /></View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={S.questTitle}>Học 30 phút</Text>
                <Text style={S.questSub}>Hoàn thành 1/2 bài giảng</Text>
              </View>
              <Text style={S.questReward}>+10 EXP</Text>
            </View>
          </View>

          {/* Recommended Courses */}
          <View style={S.section}>
            <View style={S.sectionHeader}>
              <Text style={S.sectionTitle}>KHOÁ HỌC ĐỀ XUẤT</Text>
              <TouchableOpacity><Text style={S.seeAllTxt}>Xem tất cả</Text></TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}>
              {MOCK_COURSES.map(course => (
                <TouchableOpacity key={course.id} style={S.courseCard} activeOpacity={0.8}>
                  <Image source={{ uri: course.image }} style={S.courseImg} />
                  <View style={S.courseTag}><Text style={S.courseTagTxt}>{course.tag}</Text></View>
                  <View style={S.courseInfo}>
                    <Text style={S.courseTitle} numberOfLines={2}>{course.title}</Text>
                    <Text style={S.courseAuthor}>{course.author}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  greeting: { fontSize: 13, color: T.sub, marginBottom: 2 },
  name: { fontSize: 20, fontWeight: '800', color: T.primary },
  studentId: { fontSize: 12, fontWeight: '600', color: '#10B981', marginTop: 2 },
  
  idBadgeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  idBadgeTxt: { fontSize: 13, fontWeight: '700', color: T.white, marginLeft: 6 },
  
  section: { marginTop: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: T.sub, marginLeft: 20, marginBottom: 15 },
  seeAllTxt: { fontSize: 12, color: T.accent, fontWeight: '600' },
  
  resumeCard: { backgroundColor: T.primary, marginHorizontal: 20, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: T.primary, shadowOpacity: 0.2, shadowOffset: { width: 0, height: 10 }, shadowRadius: 15, elevation: 8 },
  resumeInfo: { flex: 1, marginRight: 20 },
  resumeCourseTitle: { color: T.white, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  resumeLesson: { color: '#94A3B8', fontSize: 13, marginBottom: 15 },
  progressWrapper: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: T.accent, borderRadius: 3 },
  progressTxt: { color: T.white, fontSize: 12, fontWeight: '600', marginLeft: 12 },
  playBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  
  questCard: { backgroundColor: T.white, marginHorizontal: 20, padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.border },
  questIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  questTitle: { fontSize: 15, fontWeight: '600', color: T.primary },
  questSub: { fontSize: 12, color: T.sub, marginTop: 4 },
  questReward: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },

  courseCard: { width: 240, backgroundColor: T.white, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  courseImg: { width: '100%', height: 140 },
  courseTag: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  courseTagTxt: { color: T.white, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  courseInfo: { padding: 15 },
  courseTitle: { fontSize: 15, fontWeight: '600', color: T.primary, lineHeight: 22, height: 44 },
  courseAuthor: { fontSize: 12, color: T.sub, marginTop: 8 },
});
