import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, StatusBar, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEducation } from '../../../context/EducationContext';
import Svg, { Polygon, Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  sub: '#64748B',
  border: '#E2E8F0',
  accent: '#3B82F6',
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#10B981',
  purple: '#8B5CF6',
};

type TabType = 'OVERVIEW' | 'SKILLS' | 'RANKING';

const MOCK_SCHOOLS = [
  { name: 'THPT Lê Hồng Phong', gpa: 8.8, isMe: false },
  { name: 'THPT Năng Khiếu', gpa: 8.6, isMe: false },
  { name: 'Trường của bạn', gpa: 8.4, isMe: true }, // Will be replaced by real GPA
  { name: 'THPT Nguyễn Thượng Hiền', gpa: 8.1, isMe: false },
  { name: 'THPT Gia Định', gpa: 7.9, isMe: false },
];

export default function EducationAnalytics() {
  const router = useRouter();
  const { subjects, getSubjectGPA, getOverallGPA, targetGPA, setTargetGPA } = useEducation();
  const overallGPA = getOverallGPA() || 8.4; // Fallback if 0

  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [inputTarget, setInputTarget] = useState(targetGPA.toString());
  const [showDeepInsight, setShowDeepInsight] = useState(false);

  // 1. Data Prep: Sort Subjects
  const subjData = subjects.map(s => ({
    ...s,
    gpa: getSubjectGPA(s.id) || 0
  })).sort((a, b) => b.gpa - a.gpa);

  // 2. Data Prep: Target Calculator
  const handleUpdateTarget = () => {
    const val = parseFloat(inputTarget.replace(',', '.'));
    if (!isNaN(val) && val > 0 && val <= 10) {
      setTargetGPA(val);
      alert(`Đã cập nhật mục tiêu: ${val}`);
    }
  };
  const calculateNeededFinal = (currentGpa: number, target: number) => {
    const needed = target + (target - currentGpa) * 1.5;
    if (needed > 10) return '> 10 (Rất khó)';
    if (needed < 0) return '0.0 (Đã an toàn)';
    return needed.toFixed(1);
  };

  // 3. Data Prep: GPA Rescue (Find subject just below next threshold)
  // Simple heuristic: Subject with GPA between 6.5 and 7.8 is easiest to push to 8.0
  const rescueSubj = subjData.find(s => s.gpa >= 6.0 && s.gpa < 8.0) || subjData[0];

  // 4. Data Prep: Radar Chart (4 axes: Logic, Language, Natural, Social)
  // Math/IT/Phy -> Logic
  // Lit/Eng -> Language
  // Che/Bio -> Natural
  // Mocking 4 values based on real GPA for visual
  const logicVal = ((getSubjectGPA('math') || 8) + (getSubjectGPA('phy') || 8) + (getSubjectGPA('it') || 8)) / 3;
  const langVal = ((getSubjectGPA('lit') || 7) + (getSubjectGPA('eng') || 9)) / 2;
  const natVal = ((getSubjectGPA('che') || 6) + (getSubjectGPA('bio') || 7)) / 2;
  const socVal = 7.5; // Mock social

  // Radar SVG Math
  const radarSize = width - 120;
  const center = radarSize / 2;
  const radius = center - 20;
  const getPoint = (val: number, angleOffset: number) => {
    const r = (val / 10) * radius;
    const angle = (angleOffset * Math.PI) / 180;
    return `${center + r * Math.sin(angle)},${center - r * Math.cos(angle)}`;
  };
  const radarPoints = `${getPoint(logicVal, 0)} ${getPoint(langVal, 90)} ${getPoint(socVal, 180)} ${getPoint(natVal, 270)}`;
  const baseRadar = `${getPoint(10, 0)} ${getPoint(10, 90)} ${getPoint(10, 180)} ${getPoint(10, 270)}`;

  // 5. Data Prep: 2025 University Admission Predictor (2 Compulsory + 2 Elective)
  const getSubjScore = (id: string) => getSubjectGPA(id) || 6.5; // Fallback
  
  // 2 Compulsory Subjects
  const compMath = { id: 'math', name: 'Toán', score: getSubjScore('math') };
  const compLit = { id: 'lit', name: 'Ngữ Văn', score: getSubjScore('lit') };
  
  // Find top 2 Elective Subjects
  const electives = ['eng', 'phy', 'che', 'bio', 'it']
    .map(id => ({ id, name: subjects.find(s => s.id === id)?.name || id, score: getSubjScore(id) }))
    .sort((a, b) => b.score - a.score);
  const top2Electives = electives.slice(0, 2);

  // Total Graduation Score (Out of 40)
  const gradScore = compMath.score + compLit.score + top2Electives[0].score + top2Electives[1].score;

  // Predict DGNL (Out of 1200) based on overall GPA
  const dgnlScore = Math.min(1200, Math.round(overallGPA * 112.5 + 45));

  // Determine Major Insights dynamically based on Top Electives
  const hasTech = top2Electives.some(e => ['phy', 'it'].includes(e.id));
  const hasMedical = top2Electives.some(e => ['che', 'bio'].includes(e.id));
  const hasLanguage = top2Electives.some(e => ['eng'].includes(e.id));

  let majorsStr = 'Kinh tế, Quản trị, Xã hội học';
  let unisStr = 'ĐH Kinh tế, ĐH KHXH&NV';
  let insightsObj = { 
    salary: '10-20 Triệu', rate: '85%', style: 'Văn phòng/Linh hoạt', stress: 'Trung bình', trend: 'Nhu cầu ổn định', difficulty: 'Khó (Bằng Giỏi: 20%, Khá: 50%, Tạch môn nhiều)',
    deep: {
      tuition: { public: '25 - 40 triệu/năm', private: '80 - 150 triệu/năm' },
      salaryRoadmap: { fresher: '8 - 12 triệu', junior: '15 - 25 triệu', senior: '30 - 60+ triệu' },
      jobTitles: ['Chuyên viên Marketing', 'Nhân sự (HR)', 'Phân tích dữ liệu kinh doanh (BA)', 'Kế toán/Kiểm toán'],
      killerSubjects: ['Kinh tế vi mô / vĩ mô', 'Toán cao cấp', 'Xác suất thống kê'],
      aiRisk: 'Trung bình (Cần học thêm AI để không bị đào thải trong việc phân tích số liệu)',
      workVibe: 'OT (Làm thêm giờ) nhiều vào dịp cuối năm. Chạy Deadline/KPIs căng thẳng. Môi trường trẻ, năng động.',
      globalOpp: 'Khá khó do rào cản ngôn ngữ và khác biệt thị trường, trừ khi làm cho tập đoàn đa quốc gia.'
    }
  };

  if (hasMedical) {
    majorsStr = 'Y khoa, Dược, CNSH, Kỹ thuật Hóa';
    unisStr = 'ĐH Y Dược, Y Khoa Phạm Ngọc Thạch, KHTN';
    insightsObj = { 
      salary: '15-30+ Triệu', rate: '99%', style: 'Bệnh viện/Phòng Lab', stress: 'Trực đêm căng thẳng', trend: 'Luôn thiếu Y bác sĩ chất lượng', difficulty: 'Cực Khó (Xuất sắc: 2%, Giỏi: 15%, Học lại cao)',
      deep: {
        tuition: { public: '50 - 80 triệu/năm', private: '150 - 250+ triệu/năm' },
        salaryRoadmap: { fresher: '8 - 15 triệu (Nội trú)', junior: '20 - 40 triệu', senior: '50 - 100+ triệu (Phòng khám riêng)' },
        jobTitles: ['Bác sĩ đa khoa / chuyên khoa', 'Dược sĩ lâm sàng', 'Chuyên viên Nghiên cứu Sinh học', 'Kỹ thuật viên y tế'],
        killerSubjects: ['Giải phẫu học', 'Hóa sinh', 'Sinh lý bệnh'],
        aiRisk: 'Rất Thấp (AI chỉ hỗ trợ chẩn đoán hình ảnh, không thể thay thế bác sĩ khám trực tiếp)',
        workVibe: 'Cực kỳ khắc nghiệt. Trực đêm liên tục 24h. Áp lực ranh giới sinh tử. Ít thời gian cho gia đình.',
        globalOpp: 'Rất cao. Điều dưỡng/Bác sĩ có chứng chỉ quốc tế cực kỳ dễ định cư Mỹ, Úc, Đức.'
      }
    };
  } else if (hasTech) {
    majorsStr = 'CNTT, Vi mạch, Kỹ thuật, Tự động hóa';
    unisStr = 'ĐH Bách Khoa, Sư phạm Kỹ thuật, KHTN';
    insightsObj = { 
      salary: '12-30 Triệu', rate: '95%', style: 'Văn phòng/Remote', stress: 'Áp lực dự án/Công nghệ mới', trend: 'Khát nhân lực AI & Vi mạch Bán dẫn', difficulty: 'Rất Khó (Xuất sắc: 5%, Giỏi: 20%, Khá: 40%)',
      deep: {
        tuition: { public: '30 - 45 triệu/năm', private: '90 - 120 triệu/năm' },
        salaryRoadmap: { fresher: '12 - 18 triệu', junior: '25 - 40 triệu', senior: '50 - 100+ triệu' },
        jobTitles: ['Kỹ sư phần mềm (Software Engineer)', 'Kỹ sư Vi mạch bán dẫn', 'Kỹ sư Trí tuệ Nhân tạo (AI)', 'Kỹ sư Tự động hóa'],
        killerSubjects: ['Cấu trúc dữ liệu & Giải thuật', 'Toán rời rạc', 'Lập trình hướng đối tượng'],
        aiRisk: 'Trung bình - Cao (AI có thể code thay Lập trình viên bậc thấp, cần tư duy thiết kế hệ thống cấp cao)',
        workVibe: 'Tiếp xúc màn hình >10 tiếng/ngày. Cần liên tục học công nghệ mới. Có thể làm Remote (Từ xa).',
        globalOpp: 'Cực kỳ dễ. Dễ dàng apply việc làm và xin Visa tại Mỹ, Châu Âu, Singapore.'
      }
    };
  } else if (hasLanguage) {
    majorsStr = 'Ngôn ngữ, Truyền thông, Sư phạm tiếng Anh';
    unisStr = 'ĐH Ngoại Thương, ĐH Sư Phạm, Ngoại Giao';
    insightsObj = { 
      salary: '8-20 Triệu', rate: '88%', style: 'Studio/Làm việc với đối tác quốc tế', stress: 'Chạy số, deadline', trend: 'Bùng nổ Sáng tạo nội dung toàn cầu', difficulty: 'Vừa (Xuất sắc: 10%, Giỏi: 35%, Ít nợ môn)',
      deep: {
        tuition: { public: '25 - 35 triệu/năm', private: '70 - 100 triệu/năm' },
        salaryRoadmap: { fresher: '8 - 12 triệu', junior: '15 - 25 triệu', senior: '30 - 50+ triệu' },
        jobTitles: ['Sáng tạo nội dung (Content Creator)', 'Phiên dịch / Biên dịch viên', 'Giáo viên / Giảng viên', 'Chuyên viên Truyền thông'],
        killerSubjects: ['Ngữ pháp nâng cao', 'Dịch thuật chuyên ngành', 'Văn học Anh/Mỹ'],
        aiRisk: 'Rất Cao (Các công cụ dịch thuật và viết lách AI đang dần thay thế công việc cơ bản)',
        workVibe: 'Môi trường sáng tạo, đòi hỏi linh hoạt, thay đổi theo trend liên tục. Không gò bó.',
        globalOpp: 'Trung bình. Tùy thuộc vào năng lực giao tiếp và các chứng chỉ giảng dạy quốc tế (TESOL).'
      }
    };
  }

  // 6. Data Prep: Bell Curve (Gaussian)
  const bellWidth = width - 80;
  const bellHeight = 150;
  const bellPoints = Array.from({length: 50}, (_, i) => {
    const x = -3 + (i / 49) * 6;
    const y = Math.exp(-(x*x)/2);
    return `${(i/49)*bellWidth},${bellHeight - 20 - y*120}`;
  }).join(' ');
  // Calculate user dot position based on overallGPA
  // Let's assume Mean = 6.5, StdDev = 1.5. OverallGPA 8.4 = Z-score of (8.4 - 6.5)/1.5 = 1.26
  const mean = 6.5;
  const stdDev = 1.5;
  const zScore = Math.max(-3, Math.min(3, (overallGPA - mean) / stdDev));
  const dotX = ((zScore + 3) / 6) * bellWidth;
  const dotY = bellHeight - 20 - Math.exp(-(zScore*zScore)/2)*120;
  
  // Percentile calculation without Math.erf
  let percentile = 50;
  if (zScore >= 0) {
    percentile = 50 + 50 * (1 - Math.exp(-zScore * 1.2));
  } else {
    percentile = 50 * Math.exp(zScore * 1.2);
  }
  percentile = Math.round(percentile);
  if (percentile >= 100) percentile = 99;
  if (percentile <= 0) percentile = 1;
  // 6. Data Prep: Schools Leaderboard
  const schools = [...MOCK_SCHOOLS];
  const mySchoolIdx = schools.findIndex(s => s.isMe);
  if (mySchoolIdx > -1) {
    schools[mySchoolIdx].gpa = overallGPA;
  }
  schools.sort((a, b) => b.gpa - a.gpa);

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <SafeAreaView style={S.safe}>
        
        {/* Header */}
        <View style={S.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.replace('/utilities')} style={{ marginRight: 15 }}>
              <Ionicons name="arrow-back" size={26} color={T.primary} />
            </TouchableOpacity>
            <Text style={S.title}>EDU-ANALYTICS 3.0</Text>
          </View>
        </View>

        {/* Custom Tabs */}
        <View style={S.tabContainer}>
          {(['OVERVIEW', 'SKILLS', 'RANKING'] as TabType[]).map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[S.tabBtn, activeTab === tab && S.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[S.tabTxt, activeTab === tab && S.tabTxtActive]}>
                {tab === 'OVERVIEW' ? 'TỔNG QUAN' : tab === 'SKILLS' ? 'NĂNG LỰC' : 'XẾP HẠNG'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>

          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'OVERVIEW' && (
            <View>
              {/* Target & GPA */}
              <View style={S.card}>
                <Text style={S.cardTitle}>MỤC TIÊU HỌC KỲ</Text>
                <View style={S.goalRow}>
                  <View style={S.goalCircle}>
                    <Text style={S.goalTxt}>{overallGPA.toFixed(1)}</Text>
                    <Text style={S.goalSubTxt}>Hiện tại</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={24} color={T.sub} />
                  <View style={[S.goalCircle, { borderColor: T.accent }]}>
                    <Text style={[S.goalTxt, { color: T.accent }]}>{targetGPA.toFixed(1)}</Text>
                    <Text style={S.goalSubTxt}>Mục tiêu</Text>
                  </View>
                </View>

                <View style={S.inputRow}>
                  <TextInput style={S.input} value={inputTarget} onChangeText={setInputTarget} keyboardType="decimal-pad" />
                  <TouchableOpacity style={S.btn} onPress={handleUpdateTarget}>
                    <Text style={S.btnTxt}>CẬP NHẬT</Text>
                  </TouchableOpacity>
                </View>

                <View style={[S.alertBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Ionicons name="bulb" size={20} color={T.accent} />
                  <Text style={[S.alertTxt, { color: '#1E3A8A' }]}>Để đạt {targetGPA}, các bài thi Cuối Kỳ cần trung bình: <Text style={{ fontWeight: '700' }}>{calculateNeededFinal(overallGPA, targetGPA)}</Text></Text>
                </View>
              </View>

              {/* GPA Rescue Strategy */}
              {rescueSubj && (
                <View style={[S.card, { borderColor: '#FDE68A', borderWidth: 1 }]}>
                  <Text style={S.cardTitle}>CHIẾN LƯỢC KÉO ĐIỂM 🚀</Text>
                  <Text style={S.cardDesc}>Thuật toán AI phát hiện cơ hội tốt nhất để bạn tăng hạng:</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                    <View style={[S.subjectBadge, { backgroundColor: rescueSubj.color }]}><Text style={S.subjectBadgeTxt}>{rescueSubj.name.substring(0,2)}</Text></View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: T.primary }}>Tập trung môn {rescueSubj.name}</Text>
                      <Text style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>Điểm hiện tại: {rescueSubj.gpa.toFixed(1)}. Chỉ cần gỡ 1 bài 15 phút lên 8.0, GPA tổng sẽ tăng mạnh nhất vì hệ số môn này rất cao.</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Strengths & Weaknesses Bars */}
              <View style={S.card}>
                <Text style={S.cardTitle}>XẾP HẠNG MÔN HỌC</Text>
                <Text style={S.cardDesc}>Thống kê điểm mạnh và điểm cần cải thiện</Text>
                <View style={{ marginTop: 20 }}>
                  {subjData.map((item, idx) => (
                    <View key={item.id} style={S.barRow}>
                      <View style={S.barLabelWrap}>
                        <Text style={S.barLabel}>
                          {idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : ''}{item.name}
                        </Text>
                        <Text style={S.barVal}>{item.gpa.toFixed(1)}</Text>
                      </View>
                      <View style={S.barTrack}>
                        <View style={[S.barFill, { width: `${(item.gpa / 10) * 100}%`, backgroundColor: item.color }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ================= TAB 2: SKILLS ================= */}
          {activeTab === 'SKILLS' && (
            <View>
              <View style={S.card}>
                <Text style={S.cardTitle}>BẢN ĐỒ NĂNG LỰC LÕI 🕸️</Text>
                <Text style={S.cardDesc}>Dữ liệu được phân tích và gom nhóm thành 4 tư duy cốt lõi.</Text>
                
                <View style={{ alignItems: 'center', marginVertical: 30 }}>
                  <Svg width={radarSize} height={radarSize}>
                    {/* Base Grid */}
                    <Polygon points={baseRadar} fill="#F1F5F9" stroke={T.border} strokeWidth="1" />
                    <Line x1={center} y1={20} x2={center} y2={radarSize-20} stroke={T.border} />
                    <Line x1={20} y1={center} x2={radarSize-20} y2={center} stroke={T.border} />
                    
                    {/* Data Polygon */}
                    <Polygon points={radarPoints} fill="rgba(59, 130, 246, 0.2)" stroke={T.accent} strokeWidth="3" />
                  </Svg>
                  
                  {/* Labels (Absolute positioning over SVG) */}
                  <View style={StyleSheet.absoluteFill}>
                    <Text style={[S.radarLabel, { top: 0, alignSelf: 'center' }]}>Logic & Toán ({logicVal.toFixed(1)})</Text>
                    <Text style={[S.radarLabel, { bottom: 0, alignSelf: 'center' }]}>Tự nhiên ({natVal.toFixed(1)})</Text>
                    <Text style={[S.radarLabel, { top: center - 10, left: 0 }]}>Xã hội</Text>
                    <Text style={[S.radarLabel, { top: center - 10, right: 0 }]}>Ngôn ngữ</Text>
                  </View>
                </View>

                <View style={[S.alertBox, { backgroundColor: '#F3E8FF', borderColor: '#D8B4FE' }]}>
                  <Ionicons name="scan-outline" size={20} color={T.purple} />
                  <Text style={[S.alertTxt, { color: '#581C87' }]}>
                    <Text style={{ fontWeight: '700' }}>Chẩn đoán AI: </Text>
                    Bạn có thiên hướng rõ rệt về Tư duy Logic. Khả năng cao bạn sẽ rất thành công trong nhóm ngành Kỹ thuật, Công nghệ Thông tin hoặc Tài chính.
                  </Text>
                </View>
              </View>

              <View style={S.card}>
                <Text style={S.cardTitle}>DỰ BÁO TRÚNG TUYỂN ĐẠI HỌC 🎓</Text>
                <Text style={S.cardDesc}>Dựa trên 3 môn có điểm cao nhất (Tổ hợp môn)</Text>
                
                <View style={S.uniBlock}>
                  <View style={S.uniTop}>
                    <Text style={S.uniKhối}>
                      Toán - Văn - {top2Electives[0].name} - {top2Electives[1].name}
                    </Text>
                  </View>
                  <Text style={[S.uniĐiểm, { marginBottom: 10 }]}>Dự phóng Tốt nghiệp: {gradScore.toFixed(1)} / 40 đ</Text>
                  
                  <Text style={[S.uniSuggest, { color: T.primary, fontWeight: '700', marginBottom: 8 }]}>Ngành: {majorsStr}</Text>
                  
                  <View style={S.insightsGrid}>
                    <View style={S.insightItem}>
                      <Ionicons name="cash" size={14} color="#10B981" />
                      <Text style={S.insightTxt}>Lương: {insightsObj.salary}</Text>
                    </View>
                    <View style={S.insightItem}>
                      <Ionicons name="briefcase" size={14} color="#3B82F6" />
                      <Text style={S.insightTxt}>Việc làm: {insightsObj.rate}</Text>
                    </View>
                    <View style={S.insightItem}>
                      <Ionicons name="body" size={14} color="#F59E0B" />
                      <Text style={S.insightTxt}>Môi trường: {insightsObj.style}</Text>
                    </View>
                    <View style={S.insightItem}>
                      <Ionicons name="warning" size={14} color="#EF4444" />
                      <Text style={S.insightTxt}>Áp lực: {insightsObj.stress}</Text>
                    </View>
                    <View style={[S.insightItem, { width: '100%', borderColor: '#FCA5A5' }]}>
                      <Ionicons name="skull" size={14} color="#DC2626" />
                      <Text style={[S.insightTxt, { color: '#991B1B' }]}>Độ khó: {insightsObj.difficulty}</Text>
                    </View>
                    <View style={[S.insightItem, { width: '100%' }]}>
                      <Ionicons name="trending-up" size={14} color="#8B5CF6" />
                      <Text style={S.insightTxt}>Xu hướng: {insightsObj.trend}</Text>
                    </View>
                  </View>

                  <Text style={[S.uniSuggest, { marginTop: 10, fontStyle: 'italic' }]}>Trường: {unisStr}</Text>

                  <TouchableOpacity style={S.deepInsightBtn} onPress={() => setShowDeepInsight(true)}>
                    <Ionicons name="lock-open" size={16} color={T.white} />
                    <Text style={S.deepInsightBtnTxt}>ĐỌC HỒ SƠ BÍ MẬT NGÀNH HỌC</Text>
                  </TouchableOpacity>
                </View>

                {/* DGNL Predictor */}
                <View style={[S.uniBlock, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE', marginTop: 10 }]}>
                  <View style={S.uniTop}>
                    <Text style={[S.uniKhối, { color: '#4338CA' }]}>Thi Đánh Giá Năng Lực (ĐHQG)</Text>
                    <Text style={[S.uniĐiểm, { color: '#4338CA' }]}>{dgnlScore} / 1200</Text>
                  </View>
                  <Text style={S.uniSuggest}>Dựa trên phổ điểm toàn diện, bạn có khả năng lọt top 15% thí sinh điểm cao nhất kỳ thi ĐGNL.</Text>
                </View>
              </View>
            </View>
          )}

          {/* ================= TAB 3: RANKING ================= */}
          {activeTab === 'RANKING' && (
            <View>
              {/* Peer Percentile */}
              <View style={S.card}>
                <Text style={S.cardTitle}>VỊ THẾ BẠN BÈ (PEER PERCENTILE) 🔔</Text>
                <Text style={S.cardDesc}>So sánh điểm số của bạn với phổ điểm toàn khối (Phân phối chuẩn).</Text>
                
                <View style={{ alignItems: 'center', marginVertical: 30, height: bellHeight }}>
                  <Svg width={bellWidth} height={bellHeight}>
                    <Polyline points={bellPoints} fill="none" stroke={T.sub} strokeWidth="2" strokeDasharray="5,5" />
                    {/* Fill Area underneath curve for Top N% - complex in SVG without path, so we skip fill and just show dot */}
                    <Line x1={dotX} y1={dotY} x2={dotX} y2={bellHeight} stroke={T.accent} strokeWidth="2" strokeDasharray="4,4" />
                    <Circle cx={dotX} cy={dotY} r="8" fill={T.accent} stroke={T.white} strokeWidth="3" />
                  </Svg>
                  {/* Axis labels */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: bellWidth, marginTop: 5 }}>
                    <Text style={S.axisTxt}>5.0</Text>
                    <Text style={S.axisTxt}>6.5 (Trung bình)</Text>
                    <Text style={S.axisTxt}>10.0</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 40, fontWeight: '800', color: T.accent, marginBottom: 5 }}>TOP {percentile}%</Text>
                  <Text style={{ fontSize: 14, color: T.sub, textAlign: 'center', lineHeight: 22 }}>
                    GPA của bạn đang xuất sắc hơn <Text style={{ fontWeight: '700', color: T.primary }}>{100 - percentile}%</Text> học sinh cùng khối. Chỉ cần 0.15 điểm nữa để lọt vào Top 10% tinh hoa!
                  </Text>
                </View>
              </View>

              {/* Inter-School Leaderboard */}
              <View style={S.card}>
                <Text style={S.cardTitle}>BẢNG XẾP HẠNG LIÊN TRƯỜNG 🏆</Text>
                <Text style={S.cardDesc}>Thi đua GPA trung bình khối 12 toàn thành phố</Text>
                
                <View style={{ marginTop: 20 }}>
                  {schools.map((school, index) => (
                    <View key={index} style={[S.schoolRow, school.isMe && S.mySchoolRow]}>
                      <View style={S.schoolRank}>
                        <Text style={[S.schoolRankTxt, index < 3 && { color: T.accent }]}>#{index + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[S.schoolName, school.isMe && { color: T.white }]}>
                          {school.name} {school.isMe ? '(Trường bạn)' : ''}
                        </Text>
                      </View>
                      <Text style={[S.schoolGpa, school.isMe && { color: T.white }]}>{school.gpa.toFixed(1)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Modal Hồ Sơ Bí Mật */}
        <Modal visible={showDeepInsight} animationType="slide" transparent={true} onRequestClose={() => setShowDeepInsight(false)}>
          <View style={S.modalOverlay}>
            <View style={S.modalContent}>
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>HỒ SƠ BÍ MẬT: {majorsStr.split(',')[0]}</Text>
                <TouchableOpacity onPress={() => setShowDeepInsight(false)}><Ionicons name="close-circle" size={30} color={T.sub} /></TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Tuition */}
                <View style={S.deepSection}>
                  <Text style={S.deepSecTitle}>1. Học phí dự kiến (4 năm)</Text>
                  <Text style={S.deepTxt}>• Trường Công Lập: <Text style={{fontWeight:'700', color: T.primary}}>{insightsObj.deep.tuition.public}</Text></Text>
                  <Text style={S.deepTxt}>• Trường Tư/Quốc tế: <Text style={{fontWeight:'700', color: T.primary}}>{insightsObj.deep.tuition.private}</Text></Text>
                </View>

                {/* Salary Roadmap */}
                <View style={S.deepSection}>
                  <Text style={S.deepSecTitle}>2. Lộ trình thu nhập</Text>
                  <Text style={S.deepTxt}>• Mới ra trường (Fresher): <Text style={{fontWeight:'700', color: '#10B981'}}>{insightsObj.deep.salaryRoadmap.fresher}</Text></Text>
                  <Text style={S.deepTxt}>• Có kinh nghiệm (Junior): <Text style={{fontWeight:'700', color: '#10B981'}}>{insightsObj.deep.salaryRoadmap.junior}</Text></Text>
                  <Text style={S.deepTxt}>• Quản lý/Chuyên gia (Senior): <Text style={{fontWeight:'700', color: '#10B981'}}>{insightsObj.deep.salaryRoadmap.senior}</Text></Text>
                </View>

                {/* Job Titles */}
                <View style={S.deepSection}>
                  <Text style={S.deepSecTitle}>3. Chức danh công việc thực tế</Text>
                  {insightsObj.deep.jobTitles.map((job, idx) => (
                    <Text key={idx} style={S.deepTxt}>• {job}</Text>
                  ))}
                </View>

                {/* Killer Subjects */}
                <View style={[S.deepSection, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                  <Text style={[S.deepSecTitle, { color: '#DC2626' }]}>4. Các môn "Sát thủ" ở Đại học</Text>
                  <Text style={[S.deepTxt, { fontStyle: 'italic', color: '#991B1B', marginBottom: 5 }]}>Cảnh báo: Tỉ lệ sinh viên nợ môn và rớt cực cao ở các môn này:</Text>
                  {insightsObj.deep.killerSubjects.map((sub, idx) => (
                    <Text key={idx} style={[S.deepTxt, { color: '#991B1B', fontWeight: '600' }]}>💀 {sub}</Text>
                  ))}
                </View>

                {/* AI Risk */}
                <View style={S.deepSection}>
                  <Text style={S.deepSecTitle}>5. Nguy cơ bị AI đào thải (10 năm tới)</Text>
                  <Text style={S.deepTxt}>{insightsObj.deep.aiRisk}</Text>
                </View>

                {/* Workspace Vibe */}
                <View style={S.deepSection}>
                  <Text style={S.deepSecTitle}>6. Sự thật về Môi trường làm việc</Text>
                  <Text style={S.deepTxt}>{insightsObj.deep.workVibe}</Text>
                </View>

                {/* Global Opportunity */}
                <View style={S.deepSection}>
                  <Text style={S.deepSecTitle}>7. Cơ hội Định cư & Xuất ngoại</Text>
                  <Text style={S.deepTxt}>{insightsObj.deep.globalOpp}</Text>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
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
  header: { padding: 20, paddingBottom: 15, backgroundColor: T.white },
  title: { fontSize: 18, fontWeight: '800', color: T.primary, letterSpacing: 1 },

  tabContainer: { flexDirection: 'row', backgroundColor: T.white, paddingHorizontal: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20 },
  tabBtnActive: { backgroundColor: T.primary },
  tabTxt: { fontSize: 12, fontWeight: '700', color: T.sub, letterSpacing: 0.5 },
  tabTxtActive: { color: T.white },

  card: { backgroundColor: T.white, borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: T.primary, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5, color: T.primary, marginBottom: 5 },
  cardDesc: { fontSize: 12, color: T.sub, lineHeight: 18 },

  goalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginVertical: 25 },
  goalCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: T.border, justifyContent: 'center', alignItems: 'center' },
  goalTxt: { fontSize: 28, fontWeight: '800', color: T.primary },
  goalSubTxt: { fontSize: 11, color: T.sub, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, fontWeight: '600', color: T.primary, textAlign: 'center' },
  btn: { backgroundColor: T.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, justifyContent: 'center' },
  btnTxt: { color: T.white, fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  alertBox: { flexDirection: 'row', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  alertTxt: { flex: 1, fontSize: 13, marginLeft: 10, lineHeight: 20 },

  subjectBadge: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  subjectBadgeTxt: { color: T.white, fontWeight: '800', fontSize: 16 },

  barRow: { marginBottom: 15 },
  barLabelWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 13, fontWeight: '600', color: T.primary },
  barVal: { fontSize: 13, fontWeight: '700', color: T.sub },
  barTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  radarLabel: { fontSize: 10, fontWeight: '600', color: T.sub, position: 'absolute' },

  uniBlock: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: T.border },
  uniTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  uniKhối: { fontSize: 14, fontWeight: '700', color: T.primary },
  uniĐiểm: { fontSize: 14, fontWeight: '700', color: T.accent },
  uniSuggest: { fontSize: 13, color: T.sub, lineHeight: 20 },

  insightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  insightItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: T.border },
  insightTxt: { fontSize: 11, fontWeight: '500', color: T.sub, marginLeft: 6 },

  axisTxt: { fontSize: 10, color: T.sub, fontWeight: '600' },

  schoolRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  mySchoolRow: { backgroundColor: T.primary, borderRadius: 12, paddingHorizontal: 15, borderBottomWidth: 0, marginVertical: 5 },
  schoolRank: { width: 30 },
  schoolRankTxt: { fontSize: 15, fontWeight: '800', color: T.sub },
  schoolName: { fontSize: 14, fontWeight: '600', color: T.primary },
  schoolGpa: { fontSize: 16, fontWeight: '800', color: T.primary },

  deepInsightBtn: { backgroundColor: T.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  deepInsightBtnTxt: { color: T.white, fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: T.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: T.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomWidth: 1, borderBottomColor: T.border },
  modalTitle: { fontSize: 16, fontWeight: '800', color: T.primary, textTransform: 'uppercase' },
  
  deepSection: { backgroundColor: T.white, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: T.border },
  deepSecTitle: { fontSize: 14, fontWeight: '800', color: T.primary, marginBottom: 10 },
  deepTxt: { fontSize: 13, color: T.sub, lineHeight: 22, marginBottom: 4 },
});
