import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function OfficeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F59E0B'; // Amber

  // Stages: 'schedule' | 'verify' | 'contract' | 'training' | 'quiz' | 'equipment' | 'activated'
  const [stage, setStage] = useState<'schedule' | 'verify' | 'contract' | 'training' | 'quiz' | 'equipment' | 'activated'>('schedule');
  const [loading, setLoading] = useState(false);

  // Equipment buying details
  const [buyHelmet, setBuyHelmet] = useState(true);
  const [buyJacket, setBuyJacket] = useState(true);
  const [buyThermalBag, setBuyThermalBag] = useState(true);

  // Video progress simulator
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);

  // Quiz States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const questions = [
    {
      q: "Khi khách hàng bùng tiền xe / tiền ship, hành vi đúng của tài xế là?",
      options: [
        "A. Đánh khách hàng hoặc giữ đồ đạc làm tin",
        "B. Báo cáo sự cố bùng tiền qua mục khiếu nại/ticket hỗ trợ để được đền bù",
        "C. Chấp nhận chịu lỗ và không báo cáo ai"
      ],
      correct: 1
    },
    {
      q: "Tiền Tip (thưởng thêm) và tiền Deal (thỏa thuận) có bị thu chiết khấu dịch vụ không?",
      options: [
        "A. Có, chiết khấu như bình thường (20%)",
        "B. Không, tài xế được hưởng trọn vẹn 100%",
        "C. Bị thu một nửa (10%)"
      ],
      correct: 1
    },
    {
      q: "Khi xảy ra sự cố khẩn cấp (tai nạn hoặc đe dọa an toàn), tài xế nên sử dụng nút nào đầu tiên?",
      options: [
        "A. Nút SOS khẩn cấp trong app tài xế để gửi tọa độ GPS về trung tâm cứu hộ",
        "B. Gọi điện thoại cho người thân",
        "C. Đăng bài lên nhóm Facebook để nhờ hỗ trợ"
      ],
      correct: 0
    },
    {
      q: "Chỉ số AI Profit Score (Điểm Lợi Nhuận) chấm điểm điều gì ở mỗi đơn hàng?",
      options: [
        "A. Đánh giá thái độ của khách hàng",
        "B. Đánh giá tính lời lãi sau xăng xe và gợi ý cơ hội ghép thêm đơn nối tuyến",
        "C. Độ dài quãng đường di chuyển"
      ],
      correct: 1
    },
    {
      q: "Tài xế xe máy xăng được quyền nhận những loại đơn hàng nào?",
      options: [
        "A. Chỉ chở khách và giao hàng",
        "B. Chở khách, giao hàng, và giao đồ ăn",
        "C. Chỉ giao đồ ăn"
      ],
      correct: 1
    }
  ];

  const handleStartVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage('verify');
    }, 1200);
  };

  const handleVerifySuccess = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage('contract');
    }, 1200);
  };

  const handleSignContract = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage('training');
    }, 1500);
  };

  const handleSimulateWatchVideo = () => {
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setVideoProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setVideoWatched(true);
      }
    }, 500);
  };

  const handleAnswerQuestion = (optionIndex: number) => {
    const newSelected = [...selectedAnswers];
    newSelected[currentQuestion] = optionIndex;
    setSelectedAnswers(newSelected);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      selectedAnswers.forEach((ans, index) => {
        if (ans === questions[index].correct) correctCount++;
      });
      const finalScore = (correctCount / questions.length) * 100;
      setQuizScore(finalScore);
      setQuizFinished(true);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setQuizFinished(false);
    setQuizScore(0);
  };

  const handleConfirmQuiz = () => {
    setStage('equipment');
  };

  const handleActivateAccount = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage('activated');
    }, 1500);
  };

  const calculateGearTotal = () => {
    let total = 0;
    if (buyHelmet) total += 150000;
    if (buyJacket) total += 200000;
    if (buyThermalBag) total += 250000;
    return total;
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <LinearGradient colors={['#0F172A', '#000000']} style={StyleSheet.absoluteFillObject} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Xác minh tại Văn phòng (Offline)</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text style={styles.loadingText}>Đang xử lý hồ sơ...</Text>
            </View>
          )}

          {/* STAGE 1: SCHEDULE VISIT */}
          {stage === 'schedule' && (
            <Animated.View entering={FadeInDown} style={styles.stageContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="calendar-outline" size={48} color={accentColor} />
              </View>
              <Text style={styles.titleText}>Đặt lịch hẹn kiểm tra trực tiếp</Text>
              <Text style={styles.descText}>
                Hồ sơ online đã được AI duyệt. Bạn cần đặt lịch mang giấy tờ gốc đến văn phòng đối chiếu để kích hoạt tài khoản.
              </Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>📍 Địa chỉ văn phòng:</Text>
                <Text style={styles.infoVal}>Tòa nhà SuperApp Center, Duy Tân, Cầu Giấy, Hà Nội</Text>
                <Text style={[styles.infoLabel, { marginTop: 12 }]}>📅 Thời gian đề xuất:</Text>
                <Text style={styles.infoVal}>Hôm nay, 14:00 - 17:00 (Đã đặt lịch hẹn tự động)</Text>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={handleStartVerify}>
                <Text style={styles.actionBtnText}>TÔI ĐÃ ĐẾN VĂN PHÒNG</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STAGE 2: PHYSICAL VERIFY */}
          {stage === 'verify' && (
            <Animated.View entering={FadeInDown} style={styles.stageContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="checkbox-outline" size={48} color="#10B981" />
              </View>
              <Text style={styles.titleText}>Đối chiếu giấy tờ gốc & Xe</Text>
              <Text style={styles.descText}>
                Nhân viên văn phòng đang kiểm tra đối chiếu trực tiếp CCCD, GPLX gốc và tình trạng hoạt động thực tế của phương tiện.
              </Text>
              <View style={styles.infoCard}>
                <View style={styles.checkRow}><Ionicons name="checkmark-circle" size={18} color="#10B981" /><Text style={styles.checkText}>Đối chiếu CCCD gốc: Hợp lệ</Text></View>
                <View style={styles.checkRow}><Ionicons name="checkmark-circle" size={18} color="#10B981" /><Text style={styles.checkText}>Đối chiếu GPLX gốc: Hợp lệ</Text></View>
                <View style={styles.checkRow}><Ionicons name="checkmark-circle" size={18} color="#10B981" /><Text style={styles.checkText}>Kiểm tra an toàn xe máy: Đủ điều kiện</Text></View>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={handleVerifySuccess}>
                <Text style={styles.actionBtnText}>TIẾP TỤC BƯỚC TIẾP THEO</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STAGE 3: DIGITAL CONTRACT */}
          {stage === 'contract' && (
            <Animated.View entering={FadeInDown} style={styles.stageContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="document-text-outline" size={48} color={accentColor} />
              </View>
              <Text style={styles.titleText}>Ký Hợp đồng điện tử</Text>
              <Text style={styles.descText}>
                Hợp đồng đối tác kỹ thuật số liên kết giữa bạn và SuperApp. Vui lòng ký để tiếp tục đào tạo sát hạch.
              </Text>
              <View style={styles.contractBox}>
                <Text style={styles.contractText}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM{'\n'}
                  Độc lập - Tự do - Hạnh phúc{'\n\n'}
                  HỢP ĐỒNG ĐỐI TÁC DỊCH VỤ VẬN CHUYỂN{'\n\n'}
                  Bên A: Công ty Cổ phần Siêu Ứng Dụng SuperApp{'\n'}
                  Bên B: Đối tác Tài xế Trần Trung{'\n\n'}
                  Điều 1: Bên A cung ứng nền tảng kết nối, Bên B thực hiện vận chuyển hành khách và giao nhận.{'\n'}
                  Điều 2: Bên B hưởng 100% doanh thu thưởng thêm (Tip) và Deal giá trực tiếp với khách.{'\n'}
                  Điều 3: Cam kết an toàn, chấp hành quy chuẩn ứng xử văn minh thương hiệu.
                </Text>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={handleSignContract}>
                <Ionicons name="create-outline" size={20} color="#000" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnText}>KÝ HỢP ĐỒNG ĐIỆN TỬ</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STAGE 4: TRAINING VIDEO */}
          {stage === 'training' && (
            <Animated.View entering={FadeInDown} style={styles.stageContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="play-circle-outline" size={48} color={accentColor} />
              </View>
              <Text style={styles.titleText}>Đào tạo nghiệp vụ Tài xế</Text>
              <Text style={styles.descText}>
                Tất cả tài xế bắt buộc xem video hướng dẫn nhận đơn, chở khách, giao hàng và quy trình an toàn SOS của SuperApp.
              </Text>
              
              <View style={styles.videoPlayer}>
                {videoProgress > 0 && videoProgress < 100 ? (
                  <View style={styles.videoPlaying}>
                    <ActivityIndicator size="small" color={accentColor} />
                    <Text style={styles.videoPlayText}>Đang chiếu video đào tạo nghiệp vụ ({videoProgress}%)</Text>
                  </View>
                ) : videoWatched ? (
                  <View style={styles.videoPlaying}>
                    <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                    <Text style={[styles.videoPlayText, { color: '#10B981' }]}>Đã hoàn thành xem video hướng dẫn!</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.videoStartBtn} onPress={handleSimulateWatchVideo}>
                    <Ionicons name="play" size={40} color="#000" />
                    <Text style={styles.videoStartText}>BẮT ĐẦU XEM VIDEO</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${videoProgress}%` }]} />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.actionBtn, !videoWatched && { opacity: 0.5 }]} 
                disabled={!videoWatched}
                onPress={() => setStage('quiz')}
              >
                <Text style={styles.actionBtnText}>LÀM BÀI SÁT HẠCH LÝ THUYẾT</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STAGE 5: THEORETICAL QUIZ */}
          {stage === 'quiz' && (
            <Animated.View entering={FadeInDown} style={styles.stageContainer}>
              {!quizFinished ? (
                <>
                  <Text style={styles.quizTitle}>Kiểm tra nghiệp vụ (Câu {currentQuestion + 1}/5)</Text>
                  <Text style={styles.questionText}>{questions[currentQuestion].q}</Text>
                  <View style={styles.optionsList}>
                    {questions[currentQuestion].options.map((opt, oIndex) => {
                      const isSelected = selectedAnswers[currentQuestion] === oIndex;
                      return (
                        <TouchableOpacity
                          key={oIndex}
                          style={[styles.optionItem, isSelected && styles.optionItemActive]}
                          onPress={() => handleAnswerQuestion(oIndex)}
                        >
                          <Text style={[styles.optionText, isSelected && { color: accentColor }]}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity 
                    style={[styles.actionBtn, selectedAnswers[currentQuestion] === undefined && { opacity: 0.5 }]}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                    onPress={handleNextQuestion}
                  >
                    <Text style={styles.actionBtnText}>
                      {currentQuestion === questions.length - 1 ? 'HOÀN THÀNH BÀI THI' : 'CÂU TIẾP THEO'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <Ionicons 
                    name={quizScore >= 80 ? "ribbon-outline" : "alert-circle-outline"} 
                    size={64} 
                    color={quizScore >= 80 ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={[styles.titleText, { marginTop: 16 }]}>Kết quả sát hạch</Text>
                  <Text style={[styles.scoreText, { color: quizScore >= 80 ? '#10B981' : '#EF4444' }]}>
                    Điểm số: {quizScore}% ({quizScore >= 80 ? 'ĐẠT' : 'KHÔNG ĐẠT'})
                  </Text>
                  <Text style={styles.descText}>
                    {quizScore >= 80 
                      ? 'Xin chúc mừng! Bạn đã trả lời chính xác >= 80% câu hỏi sát hạch và đủ điều kiện làm đối tác.' 
                      : 'Rất tiếc, bạn chưa đạt mức 80% điểm số tối thiểu. Vui lòng thi lại.'}
                  </Text>

                  {quizScore >= 80 ? (
                    <TouchableOpacity style={styles.actionBtn} onPress={handleConfirmQuiz}>
                      <Text style={styles.actionBtnText}>ĐĂNG KÝ TRANG THIẾT BỊ</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.actionBtn} onPress={handleRetakeQuiz}>
                      <Text style={styles.actionBtnText}>THI LẠI SÁT HẠCH</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Animated.View>
          )}

          {/* STAGE 6: EQUIPMENT BUYING */}
          {stage === 'equipment' && (
            <Animated.View entering={FadeInDown} style={styles.stageContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="shirt-outline" size={48} color={accentColor} />
              </View>
              <Text style={styles.titleText}>Trang bị & Đồng phục bắt buộc</Text>
              <Text style={styles.descText}>
                Đối tác xe máy cần mua trang bị tối thiểu để kích hoạt dịch vụ giao đồ ăn và đảm bảo an toàn di chuyển.
              </Text>
              
              <View style={styles.gearList}>
                <TouchableOpacity style={[styles.gearItem, buyHelmet && styles.gearItemActive]} onPress={() => setBuyHelmet(!buyHelmet)}>
                  <Ionicons name="checkbox" size={22} color={buyHelmet ? accentColor : "#64748B"} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.gearName}>Mũ bảo hiểm SuperApp</Text>
                    <Text style={styles.gearPrice}>150.000đ</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.gearItem, buyJacket && styles.gearItemActive]} onPress={() => setBuyJacket(!buyJacket)}>
                  <Ionicons name="checkbox" size={22} color={buyJacket ? accentColor : "#64748B"} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.gearName}>Áo khoác đồng phục</Text>
                    <Text style={styles.gearPrice}>200.000đ</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.gearItem, buyThermalBag && styles.gearItemActive]} onPress={() => setBuyThermalBag(!buyThermalBag)}>
                  <Ionicons name="checkbox" size={22} color={buyThermalBag ? accentColor : "#64748B"} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.gearName}>Túi giữ nhiệt chính hãng</Text>
                    <Text style={styles.gearPrice}>250.000đ</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.totalGearCard}>
                <Text style={styles.totalLabel}>Tổng chi phí trang bị:</Text>
                <Text style={styles.totalVal}>{calculateGearTotal().toLocaleString('vi-VN')}đ</Text>
              </View>

              <TouchableOpacity style={styles.actionBtn} onPress={handleActivateAccount}>
                <Text style={styles.actionBtnText}>XÁC NHẬN & KÍCH HOẠT TÀI KHOẢN</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STAGE 7: ACTIVATED SUCCESS */}
          {stage === 'activated' && (
            <Animated.View entering={FadeInDown} style={styles.stageContainer}>
              <View style={styles.successGlow}>
                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
              </View>
              <Text style={[styles.titleText, { color: '#10B981', fontSize: 26 }]}>Tài khoản Đã Kích Hoạt!</Text>
              <Text style={styles.descText}>
                Hệ thống đã kích hoạt thành công tài khoản AI Driver cùng Ví đối tác. Giờ đây bạn đã có thể bắt đầu nhận chuyến đi kiếm tiền!
              </Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>💳 Mã số tài xế ID:</Text>
                <Text style={styles.infoVal}>DRV-009988</Text>
                <Text style={[styles.infoLabel, { marginTop: 8 }]}>🔔 Dịch vụ mở khóa:</Text>
                <Text style={styles.infoVal}>Chở khách, Giao hàng, Giao đồ ăn</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: '#10B981' }]} 
                onPress={() => router.replace('/partner/dashboard')}
              >
                <Text style={styles.actionBtnText}>BẮT ĐẦU NHẬN ĐƠN NGAY</Text>
                <Ionicons name="rocket-outline" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </Animated.View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#000', width: '100%' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#111', borderRadius: 55, overflow: 'hidden' },

  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },

  scrollContent: { padding: 24, paddingBottom: 100 },

  stageContainer: { alignItems: 'center' },
  iconWrapper: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  titleText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  descText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 12 },

  infoCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 18, marginBottom: 24 },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: 'bold', marginBottom: 4 },
  infoVal: { fontSize: 14, color: '#FFFFFF', fontWeight: '500', lineHeight: 20 },

  actionBtn: { width: '100%', height: 52, backgroundColor: '#F59E0B', borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 12 },
  actionBtnText: { color: '#000000', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.8 },

  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  checkText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: '#FFFFFF', fontWeight: 'bold' },

  // Contract
  contractBox: { width: '100%', height: 260, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, marginBottom: 24 },
  contractText: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },

  // Training
  videoPlayer: { width: '100%', height: 200, backgroundColor: '#090D16', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'space-between', marginBottom: 24 },
  videoStartBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F59E0B', margin: 40, borderRadius: 16 },
  videoStartText: { color: '#000', fontWeight: 'bold', fontSize: 12, marginTop: 8 },
  videoPlaying: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  videoPlayText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressBar: { height: '100%', backgroundColor: '#F59E0B' },

  // Quiz
  quizTitle: { fontSize: 15, color: '#F59E0B', fontWeight: 'bold', marginBottom: 16 },
  questionText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  optionsList: { gap: 12, width: '100%', marginBottom: 24 },
  optionItem: { width: '100%', padding: 16, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  optionItemActive: { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.05)' },
  optionText: { color: '#94A3B8', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  scoreText: { fontSize: 22, fontWeight: '900', marginBottom: 12 },

  // Gear
  gearList: { width: '100%', gap: 12, marginBottom: 20 },
  gearItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16 },
  gearItemActive: { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.05)' },
  gearName: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  gearPrice: { fontSize: 12, color: '#F59E0B', marginTop: 2, fontWeight: '500' },
  totalGearCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 18, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24 },
  totalLabel: { fontSize: 14, color: '#94A3B8', fontWeight: 'bold' },
  totalVal: { fontSize: 18, color: '#10B981', fontWeight: 'bold' },

  // Success Glow
  successGlow: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(16,185,129,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 20 },
});
