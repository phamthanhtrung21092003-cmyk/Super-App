import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSpring } from 'react-native-reanimated';

export default function RideTracking() {
  const router = useRouter();
  
  // State Machine for AI Negotiation
  const [simulatedTime, setSimulatedTime] = useState(0); // 0, 5, 10, 20
  const [isPriority, setIsPriority] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  
  // UI States
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDealSheet, setShowDealSheet] = useState(false);
  const [selectedTip, setSelectedTip] = useState(10000); // Default AI recommend

  // Radar Animation for 0 mins
  const radarScale = useSharedValue(1);
  const radarOpacity = useSharedValue(1);
  
  React.useEffect(() => {
    radarScale.value = withRepeat(withTiming(2, { duration: 1500 }), -1, false);
    radarOpacity.value = withRepeat(withTiming(0, { duration: 1500 }), -1, false);
  }, []);

  const animatedRadar = useAnimatedStyle(() => ({
    transform: [{ scale: radarScale.value }],
    opacity: radarOpacity.value,
  }));

  const basePrice = 72000;
  const sysAdjust = 23000;
  const originalTotal = basePrice + sysAdjust;
  const finalTotal = originalTotal + tipAmount;

  const handleConfirmTip = () => {
    setTipAmount(selectedTip);
    setIsPriority(true);
    setShowDealSheet(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          region={{ latitude: 21.015511, longitude: 105.794817, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          pitchEnabled={false}
          scrollEnabled={false}
        >
          <Marker coordinate={{ latitude: 21.028511, longitude: 105.804817 }} pinColor="#3B82F6" />
          <Marker coordinate={{ latitude: 20.982511, longitude: 105.754817 }} pinColor="#EF4444" />
          <Polyline 
            coordinates={[
              { latitude: 21.028511, longitude: 105.804817 },
              { latitude: 20.982511, longitude: 105.754817 }
            ]}
            strokeColor="#10B981"
            strokeWidth={4}
          />
        </MapView>
      </View>

      {/* Header Info */}
      <View style={styles.headerFloating}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <View style={styles.tripHeaderInfo}>
          <View style={styles.locations}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.locText}>Nhà</Text>
            </View>
            <Ionicons name="arrow-down" size={16} color="#94A3B8" style={{ marginLeft: 3 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.locText}>AEON Mall Hà Đông</Text>
            </View>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
      </View>

      {/* Main Interaction Panel (Bottom) */}
      <View style={[styles.panel, isPriority && styles.panelPriority]}>
        
        {/* Priority Banner (State 4) */}
        {isPriority && simulatedTime < 20 && (
          <Animated.View entering={FadeIn} style={styles.priorityBanner}>
            <View style={styles.priorityHeader}>
              <Ionicons name="flame" size={24} color="#EF4444" />
              <Text style={styles.priorityTitle}>Đang ưu tiên tìm tài xế</Text>
            </View>
            <Text style={styles.priorityText}>Bạn đã thưởng {tipAmount.toLocaleString('vi-VN')}đ. AI đang ưu tiên phân phối chuyến này.</Text>
            <View style={styles.radarContainerPriority}>
              <Animated.View style={[styles.radarCircle, animatedRadar, { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.2)' }]} />
              <View style={[styles.radarCenter, { backgroundColor: '#EF4444' }]} />
            </View>
          </Animated.View>
        )}

        {/* State 1: Normal Finding (0 mins) */}
        {!isPriority && simulatedTime === 0 && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stateContainer}>
            <View style={styles.radarContainer}>
              <Animated.View style={[styles.radarCircle, animatedRadar]} />
              <View style={styles.radarCenter} />
            </View>
            <Text style={styles.findingTitle}>Đang tìm tài xế gần bạn...</Text>
            <Text style={styles.findingSub}>⏱ Đã chờ: 02:35</Text>
            <View style={styles.aiFooter}>
              <Ionicons name="sparkles" size={16} color="#8B5CF6" />
              <Text style={styles.aiFooterText}>AI đang tìm tài xế phù hợp nhất</Text>
            </View>
          </Animated.View>
        )}

        {/* State 2: AI Analysis (5 mins) */}
        {!isPriority && simulatedTime === 5 && (
          <Animated.View entering={SlideInUp} exiting={FadeOut} style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <Ionicons name="analytics" size={24} color="#3B82F6" />
              <Text style={styles.aiCardTitle}>AI Phân tích Thị trường</Text>
            </View>
            <Text style={styles.aiCardDesc}>Hiện khu vực của bạn đang có:</Text>
            <View style={styles.checklist}>
              <Text style={styles.checklistItem}>✓ Mưa lớn</Text>
              <Text style={styles.checklistItem}>✓ Nhiều khách đặt xe</Text>
              <Text style={styles.checklistItem}>✓ Ít tài xế hoạt động</Text>
            </View>
            <Text style={styles.aiCardNote}>Hệ thống đã tự điều chỉnh giá để tăng khả năng ghép chuyến.</Text>
            
            <TouchableOpacity style={styles.detailBtn} onPress={() => setShowBreakdown(!showBreakdown)}>
              <Text style={styles.detailBtnText}>Chi tiết giá {showBreakdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            
            {showBreakdown && (
              <Animated.View entering={FadeIn} style={styles.breakdownBox}>
                <View style={styles.breakdownRow}><Text style={styles.bdLabel}>Giá gốc</Text><Text style={styles.bdVal}>72.000đ</Text></View>
                <View style={styles.breakdownRow}><Text style={styles.bdLabel}>+ Giờ cao điểm</Text><Text style={styles.bdVal}>10.000đ</Text></View>
                <View style={styles.breakdownRow}><Text style={styles.bdLabel}>+ Mưa</Text><Text style={styles.bdVal}>8.000đ</Text></View>
                <View style={styles.breakdownRow}><Text style={styles.bdLabel}>+ Khan hiếm xe</Text><Text style={styles.bdVal}>5.000đ</Text></View>
                <View style={styles.breakdownLine} />
                <View style={styles.breakdownRow}><Text style={[styles.bdLabel, {fontWeight:'bold'}]}>Tổng cộng</Text><Text style={[styles.bdVal, {fontWeight:'bold', color:'#3B82F6'}]}>95.000đ</Text></View>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* State 3: AI Timeout Suggestion (10 mins) */}
        {!isPriority && simulatedTime === 10 && (
          <Animated.View entering={SlideInUp} exiting={FadeOut} style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <Ionicons name="warning" size={24} color="#D97706" />
              <Text style={[styles.aiCardTitle, { color: '#D97706' }]}>AI Đề xuất Đàm phán</Text>
            </View>
            <Text style={styles.aiCardMainText}>Đã hơn 10 phút vẫn chưa có tài xế nhận chuyến.</Text>
            <Text style={styles.aiCardNote}>Hệ thống đã tự động tăng giá theo điều kiện hiện tại. Bạn có muốn thưởng thêm để tăng khả năng nhận chuyến?</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnSecondary}><Text style={styles.btnSecondaryText}>Tiếp tục chờ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => setShowDealSheet(true)}>
                <Ionicons name="cash" size={20} color="#FFF" style={{marginRight:6}} />
                <Text style={styles.btnPrimaryText}>Thưởng thêm</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* State 5: Fallback (20 mins) */}
        {simulatedTime === 20 && (
          <Animated.View entering={SlideInUp} style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <Ionicons name="sad" size={24} color="#EF4444" />
              <Text style={[styles.aiCardTitle, { color: '#EF4444' }]}>Chuyến đi rất khó ghép</Text>
            </View>
            <Text style={styles.aiCardNote}>Đã 20 phút trôi qua. Tình trạng kẹt xe và thiếu tài xế đang diễn ra. Bạn có thể:</Text>
            <View style={styles.fallbackGrid}>
               <TouchableOpacity style={styles.fbBtn}><Ionicons name="time" size={20} color="#475569"/><Text style={styles.fbBtnText}>Tiếp tục chờ</Text></TouchableOpacity>
               <TouchableOpacity style={styles.fbBtn}><Ionicons name="cash" size={20} color="#475569"/><Text style={styles.fbBtnText}>Tăng thưởng</Text></TouchableOpacity>
               <TouchableOpacity style={styles.fbBtn}><Ionicons name="walk" size={20} color="#3B82F6"/><Text style={[styles.fbBtnText, {color:'#3B82F6'}]}>Đổi điểm đón (250m)</Text></TouchableOpacity>
               <TouchableOpacity style={styles.fbBtn}><Ionicons name="car" size={20} color="#475569"/><Text style={styles.fbBtnText}>Đổi loại xe</Text></TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Dev Simulator Controls */}
      <View style={styles.simulator}>
        <Text style={styles.simTitle}>🛠 Dev Tool: Kéo thả thời gian chờ</Text>
        <View style={styles.simRow}>
          {[0, 5, 10, 20].map(time => (
            <TouchableOpacity 
              key={time} 
              style={[styles.simBtn, simulatedTime === time && styles.simBtnActive]}
              onPress={() => setSimulatedTime(time)}
            >
              <Text style={[styles.simBtnText, simulatedTime === time && styles.simBtnTextActive]}>{time} phút</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* BottomSheet: AI Deal Giá */}
      <Modal visible={showDealSheet} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.bottomSheet}>
            <View style={styles.bsHeader}>
              <Text style={styles.bsTitle}>Thưởng thêm cho tài xế</Text>
              <TouchableOpacity onPress={() => setShowDealSheet(false)}>
                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bsSub}>Thưởng sẽ được chuyển 100% cho tài xế.</Text>

            {/* AI Market Data */}
            <View style={styles.marketDataBox}>
               <View style={styles.mdHeader}>
                 <Ionicons name="eye" size={16} color="#3B82F6" />
                 <Text style={styles.mdTitle}>AI Đã phân tích thị trường</Text>
               </View>
               <Text style={styles.mdTotal}>Hiện có 12 tài xế trong bán kính 3km:</Text>
               <View style={styles.mdGrid}>
                 <View style={styles.mdItem}><View style={[styles.dot, {backgroundColor:'#EF4444'}]}/><Text style={styles.mdItemText}>7 tài xế đang bận</Text></View>
                 <View style={styles.mdItem}><View style={[styles.dot, {backgroundColor:'#F59E0B'}]}/><Text style={styles.mdItemText}>3 sắp hoàn thành chuyến</Text></View>
                 <View style={styles.mdItem}><View style={[styles.dot, {backgroundColor:'#94A3B8'}]}/><Text style={styles.mdItemText}>2 đang rảnh nhưng ngược đường</Text></View>
               </View>
            </View>

            {/* Probability Bars */}
            <Text style={styles.probTitle}>Xác suất nhận chuyến theo mức thưởng:</Text>
            <View style={styles.probList}>
              
              {/* Option 1 */}
              <TouchableOpacity style={styles.probRow} onPress={() => setSelectedTip(0)}>
                <View style={styles.radio}><View style={selectedTip===0 && styles.radioInner} /></View>
                <Text style={styles.probVal}>Không thêm</Text>
                <View style={styles.barBg}>
                  <Animated.View style={[styles.barFill, { width: '35%', backgroundColor: '#EF4444' }]} />
                </View>
                <Text style={[styles.probPct, { color: '#EF4444' }]}>35%</Text>
              </TouchableOpacity>

              {/* Option 2 */}
              <TouchableOpacity style={styles.probRow} onPress={() => setSelectedTip(5000)}>
                <View style={styles.radio}><View style={selectedTip===5000 && styles.radioInner} /></View>
                <Text style={styles.probVal}>+5.000đ</Text>
                <View style={styles.barBg}>
                  <Animated.View style={[styles.barFill, { width: '60%', backgroundColor: '#F59E0B' }]} />
                </View>
                <Text style={[styles.probPct, { color: '#F59E0B' }]}>60%</Text>
              </TouchableOpacity>

              {/* Option 3 (AI Recommend) */}
              <TouchableOpacity style={[styles.probRow, styles.probRowRecommend]} onPress={() => setSelectedTip(10000)}>
                <View style={styles.aiTagRec}><Text style={styles.aiTagRecText}>🤖 AI khuyên dùng (Đợi ~2p)</Text></View>
                <View style={styles.radio}><View style={selectedTip===10000 && styles.radioInner} /></View>
                <Text style={[styles.probVal, { fontWeight: 'bold' }]}>+10.000đ</Text>
                <View style={styles.barBg}>
                  <Animated.View style={[styles.barFill, { width: '91%', backgroundColor: '#10B981' }]} />
                </View>
                <Text style={[styles.probPct, { color: '#10B981', fontWeight: 'bold' }]}>91%</Text>
              </TouchableOpacity>

              {/* Option 4 */}
              <TouchableOpacity style={styles.probRow} onPress={() => setSelectedTip(20000)}>
                <View style={styles.radio}><View style={selectedTip===20000 && styles.radioInner} /></View>
                <Text style={styles.probVal}>+20.000đ</Text>
                <View style={styles.barBg}>
                  <Animated.View style={[styles.barFill, { width: '99%', backgroundColor: '#059669' }]} />
                </View>
                <Text style={[styles.probPct, { color: '#059669' }]}>99%</Text>
              </TouchableOpacity>

            </View>

            {/* Total Calculation */}
            <View style={styles.calcBox}>
              <View style={styles.calcRow}><Text style={styles.calcLabel}>Giá chuyến</Text><Text style={styles.calcVal}>{originalTotal.toLocaleString()}đ</Text></View>
              <View style={styles.calcRow}><Text style={styles.calcLabel}>Thưởng thêm</Text><Text style={styles.calcVal}>+ {selectedTip.toLocaleString()}đ</Text></View>
              <View style={styles.calcLine} />
              <View style={styles.calcRow}><Text style={styles.calcLabelTotal}>Tổng thanh toán</Text><Text style={styles.calcValTotal}>{(originalTotal + selectedTip).toLocaleString()}đ</Text></View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmTip}>
               <Text style={styles.confirmBtnText}>Xác nhận thưởng {(selectedTip).toLocaleString()}đ</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  
  headerFloating: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 20, left: 16, right: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  backButton: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  tripHeaderInfo: { flex: 1, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locations: { flex: 1 },
  locText: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginLeft: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  priceTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  
  panel: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, minHeight: 250 },
  panelPriority: { backgroundColor: '#FEF2F2' },
  
  stateContainer: { alignItems: 'center', paddingVertical: 20 },
  radarContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  radarCircle: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.2)' },
  radarCenter: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3B82F6', zIndex: 10 },
  findingTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  findingSub: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 20 },
  aiFooter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  aiFooterText: { color: '#8B5CF6', fontWeight: '600', marginLeft: 8, fontSize: 13 },
  
  aiCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 },
  aiCardDesc: { fontSize: 14, color: '#475569', fontWeight: '600', marginBottom: 8 },
  checklist: { marginBottom: 12 },
  checklistItem: { fontSize: 14, color: '#0F172A', fontWeight: '500', marginBottom: 4 },
  aiCardNote: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 12 },
  
  detailBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#EFF6FF', borderRadius: 8 },
  detailBtnText: { color: '#3B82F6', fontWeight: '600', fontSize: 13 },
  breakdownBox: { marginTop: 12, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  bdLabel: { color: '#475569', fontSize: 13 },
  bdVal: { color: '#0F172A', fontSize: 13, fontWeight: '500' },
  breakdownLine: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  
  aiCardMainText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnSecondary: { flex: 1, paddingVertical: 14, backgroundColor: '#E2E8F0', borderRadius: 12, alignItems: 'center' },
  btnSecondaryText: { color: '#475569', fontWeight: 'bold', fontSize: 15 },
  btnPrimary: { flex: 1, flexDirection: 'row', paddingVertical: 14, backgroundColor: '#D97706', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  
  priorityBanner: { alignItems: 'center', paddingVertical: 10 },
  priorityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  priorityTitle: { fontSize: 18, fontWeight: 'bold', color: '#DC2626', marginLeft: 8 },
  priorityText: { fontSize: 14, color: '#991B1B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  radarContainerPriority: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  
  fallbackGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  fbBtn: { width: '48%', backgroundColor: '#FFFFFF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  fbBtnText: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  
  simulator: { backgroundColor: '#0F172A', padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  simTitle: { color: '#94A3B8', fontSize: 13, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
  simRow: { flexDirection: 'row', gap: 8 },
  simBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#1E293B', borderRadius: 8, alignItems: 'center' },
  simBtnActive: { backgroundColor: '#3B82F6' },
  simBtnText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 13 },
  simBtnTextActive: { color: '#FFFFFF' },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  bsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bsTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  bsSub: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  
  marketDataBox: { backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16, marginBottom: 24 },
  mdHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mdTitle: { fontSize: 14, fontWeight: 'bold', color: '#1D4ED8', marginLeft: 8 },
  mdTotal: { fontSize: 13, color: '#1E3A8A', fontWeight: '600', marginBottom: 8 },
  mdGrid: { gap: 6 },
  mdItem: { flexDirection: 'row', alignItems: 'center' },
  mdItemText: { fontSize: 13, color: '#334155', marginLeft: 8 },
  
  probTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  probList: { gap: 12 },
  probRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  probRowRecommend: { backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0', marginHorizontal: -12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  probVal: { width: 70, fontSize: 14, color: '#475569' },
  barBg: { flex: 1, height: 12, backgroundColor: '#F1F5F9', borderRadius: 6, marginHorizontal: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  probPct: { width: 35, fontSize: 14, textAlign: 'right' },
  
  aiTagRec: { position: 'absolute', top: -12, left: 12, backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  aiTagRecText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  
  calcBox: { marginTop: 24, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calcLabel: { color: '#64748B', fontSize: 14 },
  calcVal: { color: '#0F172A', fontSize: 14, fontWeight: '500' },
  calcLine: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  calcLabelTotal: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  calcValTotal: { color: '#10B981', fontSize: 18, fontWeight: 'bold' },
  
  confirmBtn: { backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
