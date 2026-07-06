import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, Modal, TextInput, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import WebMap from '../../components/WebMap';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function RideTracking() {
  const router = useRouter();
  
  // Trip State Machine
  // 'searching' -> searching for driver (with simulatedTime 0, 5, 10, 20)
  // 'assigned' -> driver accepted, coming to pickup
  // 'driving' -> trip in progress, heading to destination
  // 'completed' -> trip finished, show rating sheet
  const [tripState, setTripState] = useState<'searching' | 'assigned' | 'driving' | 'completed'>('searching');
  const [simulatedTime, setSimulatedTime] = useState(0); // 0, 5, 10, 20
  const [isPriority, setIsPriority] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  
  // Modal states
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDealSheet, setShowDealSheet] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  // Rating states
  const [rating, setRating] = useState(5);
  const [ratingTip, setRatingTip] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const [selectedTip, setSelectedTip] = useState(10000); // Default AI recommend
  const [showDetourAlert, setShowDetourAlert] = useState(true);

  // Radar Animation
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

  const handleConfirmRating = () => {
    setShowRatingModal(false);
    if (Platform.OS === 'web') {
      window.alert(`Cảm ơn bạn đã đánh giá!\n⭐: ${rating} Sao\nTip: ${ratingTip.toLocaleString()}đ\nBình luận: ${ratingComment || 'Không có'}`);
    }
    router.replace('/transport');
  };

  // Map markers depending on state
  const getMapPoints = () => {
    if (tripState === 'searching') {
      return [
        { lat: 21.028511, lng: 105.804817, label: 'Điểm đón (Nhà)', color: '#3B82F6' },
        { lat: 20.982511, lng: 105.754817, label: 'Điểm đến (Aeon Mall)', color: '#EF4444' }
      ];
    } else if (tripState === 'assigned') {
      return [
        { lat: 21.028511, lng: 105.804817, label: 'Điểm đón (Nhà)', color: '#3B82F6' },
        { lat: 21.022511, lng: 105.798817, label: 'Tài xế Nguyễn Văn Hùng', color: '#F59E0B' }
      ];
    } else { // driving or completed
      return [
        { lat: 21.005511, lng: 105.774817, label: 'Vị trí hiện tại', color: '#10B981' },
        { lat: 20.982511, lng: 105.754817, label: 'Điểm đến (Aeon Mall)', color: '#EF4444' }
      ];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapContainer}>
        <WebMap
          points={getMapPoints()}
          showRoute={true}
          routeColor={tripState === 'driving' ? '#10B981' : '#3B82F6'}
          height={320}
          zoom={13}
        />
      </View>

      {/* Floating Header */}
      <View style={styles.headerFloating} pointerEvents="box-none">
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/transport');
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <View style={styles.tripHeaderInfo}>
          <View style={styles.locations}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.locText} numberOfLines={1}>Nhà (Royal City)</Text>
            </View>
            <Ionicons name="arrow-down" size={12} color="#94A3B8" style={{ marginLeft: 3, marginVertical: 2 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.locText} numberOfLines={1}>AEON Mall Hà Đông</Text>
            </View>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
      </View>

      {/* Safety SOS button (Visible when driver is assigned or driving) */}
      {['assigned', 'driving'].includes(tripState) && (
        <TouchableOpacity style={styles.safetyFloatingBtn} onPress={() => setShowSafetyModal(true)}>
          <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.safetyFloatingText}>An toàn</Text>
        </TouchableOpacity>
      )}

      {/* Detour AI alert (Visible during driving) */}
      {tripState === 'driving' && showDetourAlert && (
        <Animated.View entering={SlideInDown} style={styles.detourAlert}>
          <View style={styles.detourHeader}>
            <Ionicons name="warning" size={18} color="#D97706" />
            <Text style={styles.detourTitle}>AI Cảnh báo Kẹt xe</Text>
            <TouchableOpacity onPress={() => setShowDetourAlert(false)} style={styles.detourClose}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.detourText}>Đường Tố Hữu phía trước đang tắc nghẽn nặng. AI đề xuất tài xế đổi lộ trình qua Đại lộ Thăng Long để tiết kiệm 12 phút di chuyển.</Text>
        </Animated.View>
      )}

      {/* Bottom Panel */}
      <View style={[styles.panel, isPriority && styles.panelPriority]}>
        
        {/* Priority Banner */}
        {tripState === 'searching' && isPriority && simulatedTime < 20 && (
          <Animated.View entering={FadeIn} style={styles.priorityBanner}>
            <View style={styles.priorityHeader}>
              <Ionicons name="flame" size={22} color="#EF4444" />
              <Text style={styles.priorityTitle}>Đang ưu tiên tìm tài xế</Text>
            </View>
            <Text style={styles.priorityText}>Bạn đã thưởng {tipAmount.toLocaleString('vi-VN')}đ. AI đang ưu tiên ghép xe trong khu vực.</Text>
            <View style={styles.radarContainerPriority}>
              <Animated.View style={[styles.radarCircle, animatedRadar, { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)' }]} />
              <View style={[styles.radarCenter, { backgroundColor: '#EF4444' }]} />
            </View>
          </Animated.View>
        )}

        {/* Searching States */}
        {tripState === 'searching' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* State 1: Normal Finding */}
            {!isPriority && simulatedTime === 0 && (
              <Animated.View entering={FadeIn} style={styles.stateContainer}>
                <View style={styles.radarContainer}>
                  <Animated.View style={[styles.radarCircle, animatedRadar]} />
                  <View style={styles.radarCenter} />
                </View>
                <Text style={styles.findingTitle}>Đang tìm tài xế gần bạn...</Text>
                <Text style={styles.findingSub}>⏱ Đã chờ: 02:35</Text>
                <View style={styles.aiFooter}>
                  <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                  <Text style={styles.aiFooterText}>AI đang tìm xe phù hợp nhất</Text>
                </View>
              </Animated.View>
            )}

            {/* State 2: AI Market Analysis */}
            {!isPriority && simulatedTime === 5 && (
              <Animated.View entering={SlideInUp} style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Ionicons name="analytics" size={22} color="#3B82F6" />
                  <Text style={styles.aiCardTitle}>AI Phân tích Thị trường</Text>
                </View>
                <Text style={styles.aiCardDesc}>Khu vực của bạn hiện có:</Text>
                <View style={styles.checklist}>
                  <Text style={styles.checklistItem}>✓ Trời đang mưa lớn</Text>
                  <Text style={styles.checklistItem}>✓ Nhu cầu đặt xe tăng 180%</Text>
                  <Text style={styles.checklistItem}>✓ Ít tài xế rảnh rỗi</Text>
                </View>
                <Text style={styles.aiCardNote}>Giá hệ thống tự điều chỉnh để tối ưu cơ hội ghép chuyến.</Text>
                
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

            {/* State 3: AI Timeout Suggestion */}
            {!isPriority && simulatedTime === 10 && (
              <Animated.View entering={SlideInUp} style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Ionicons name="warning" size={22} color="#D97706" />
                  <Text style={[styles.aiCardTitle, { color: '#D97706' }]}>AI Đề xuất Đàm phán</Text>
                </View>
                <Text style={styles.aiCardMainText}>Đã hơn 10 phút chưa ghép được xe.</Text>
                <Text style={styles.aiCardNote}>Bạn có muốn thêm khoản thưởng (Tip) để kích thích tài xế nhận chuyến ngay lập tức?</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => setSimulatedTime(20)}><Text style={styles.btnSecondaryText}>Tiếp tục chờ</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => setShowDealSheet(true)}>
                    <Ionicons name="cash" size={18} color="#FFF" style={{marginRight:6}} />
                    <Text style={styles.btnPrimaryText}>Thưởng thêm</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* State 4: Fallback */}
            {simulatedTime === 20 && (
              <Animated.View entering={SlideInUp} style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Ionicons name="alert-circle" size={22} color="#EF4444" />
                  <Text style={[styles.aiCardTitle, { color: '#EF4444' }]}>Chuyến đi rất khó ghép</Text>
                </View>
                <Text style={styles.aiCardNote}>Đã 20 phút trôi qua. Tình trạng kẹt xe cực kỳ nghiêm trọng. Bạn hãy thử:</Text>
                <View style={styles.fallbackGrid}>
                   <TouchableOpacity style={styles.fbBtn} onPress={() => { setSelectedTip(20000); handleConfirmTip(); }}><Ionicons name="cash" size={16} color="#475569"/><Text style={styles.fbBtnText}>Tăng thưởng</Text></TouchableOpacity>
                   <TouchableOpacity style={styles.fbBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đã đổi điểm đón cách 150m để tài xế dễ quay đầu.'); }}><Ionicons name="walk" size={16} color="#3B82F6"/><Text style={[styles.fbBtnText, {color:'#3B82F6'}]}>Đổi điểm đón (150m)</Text></TouchableOpacity>
                   <TouchableOpacity style={styles.fbBtn} onPress={() => router.replace('/ride/booking')}><Ionicons name="car" size={16} color="#475569"/><Text style={styles.fbBtnText}>Thay đổi xe</Text></TouchableOpacity>
                   <TouchableOpacity style={styles.fbBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đơn đặt xe của bạn đã được dời lịch đặt trước lúc 11h30 (Tiết kiệm 15%)'); router.replace('/transport'); }}><Ionicons name="calendar" size={16} color="#475569"/><Text style={styles.fbBtnText}>Đặt trước</Text></TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        )}

        {/* Assigned State (Driver Coming) */}
        {tripState === 'assigned' && (
          <Animated.View entering={FadeIn} style={styles.stateContainer}>
            <View style={styles.driverInfoCard}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=60' }} style={styles.driverAvatar} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.driverName}>Nguyễn Văn Hùng</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>4.9</Text>
                  <Text style={styles.driverPlate}> • VinFast VF8 • 29A-999.88</Text>
                </View>
              </View>
            </View>
            <Text style={styles.findingTitle}>Tài xế đang đến điểm đón</Text>
            <Text style={styles.findingSub}>⏱ Dự kiến đến trong 4 phút (0.8 km)</Text>

            <View style={styles.chatActionRow}>
              <TouchableOpacity style={styles.actionBtnCircle} onPress={() => { if (Platform.OS === 'web') window.alert('Mở chat với tài xế...'); }}><Ionicons name="chatbubble-ellipses-outline" size={24} color="#3B82F6" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnCircle} onPress={() => { if (Platform.OS === 'web') window.alert('Đang gọi điện cho tài xế...'); }}><Ionicons name="call-outline" size={24} color="#10B981" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnCircle} onPress={() => { if (Platform.OS === 'web') window.alert('Đang lấy link chia sẻ hành trình...'); }}><Ionicons name="share-social-outline" size={24} color="#8B5CF6" /></TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Driving State (In Trip) */}
        {tripState === 'driving' && (
          <Animated.View entering={FadeIn} style={styles.stateContainer}>
            <View style={styles.driverInfoCard}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=60' }} style={styles.driverAvatar} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.driverName}>Nguyễn Văn Hùng</Text>
                <Text style={styles.driverPlate}>VinFast VF8 • 29A-999.88</Text>
              </View>
            </View>
            <Text style={styles.findingTitle}>Đang trên hành trình</Text>
            <Text style={styles.findingSub}>⏱ Còn 3.8 km • Dự kiến đến lúc 11:20</Text>

            <View style={styles.chatActionRow}>
              <TouchableOpacity style={styles.actionBtnCircle} onPress={() => { if (Platform.OS === 'web') window.alert('Đang lấy link chia sẻ hành trình...'); }}><Ionicons name="share-social-outline" size={24} color="#8B5CF6" /></TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtnCircle, { backgroundColor: '#FEF2F2' }]} onPress={() => setShowSafetyModal(true)}><Ionicons name="shield-alert-outline" size={24} color="#EF4444" /></TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Completed State (Show Rating Button) */}
        {tripState === 'completed' && (
          <Animated.View entering={FadeIn} style={styles.stateContainer}>
            <View style={styles.successIconBox}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text style={styles.findingTitle}>Chuyến đi hoàn thành!</Text>
            <Text style={styles.findingSub}>Cảm ơn bạn đã đồng hành cùng SuperApp</Text>
            <TouchableOpacity style={styles.ratingBtn} onPress={() => setShowRatingModal(true)}>
              <Text style={styles.ratingBtnText}>Đánh giá tài xế & Gửi phản hồi</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Dev Simulator Control Panel */}
      <View style={styles.simulator}>
        <Text style={styles.simTitle}>🛠 Dev Tool: Trạng thái chuyến đi</Text>
        <View style={styles.simRow}>
          <TouchableOpacity 
            style={[styles.simBtn, tripState === 'searching' && styles.simBtnActive]}
            onPress={() => { setTripState('searching'); setSimulatedTime(0); }}
          >
            <Text style={[styles.simBtnText, tripState === 'searching' && styles.simBtnTextActive]}>Tìm kiếm</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.simBtn, tripState === 'assigned' && styles.simBtnActive]}
            onPress={() => setTripState('assigned')}
          >
            <Text style={[styles.simBtnText, tripState === 'assigned' && styles.simBtnTextActive]}>Đã nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.simBtn, tripState === 'driving' && styles.simBtnActive]}
            onPress={() => setTripState('driving')}
          >
            <Text style={[styles.simBtnText, tripState === 'driving' && styles.simBtnTextActive]}>Đang đi</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.simBtn, tripState === 'completed' && styles.simBtnActive]}
            onPress={() => setTripState('completed')}
          >
            <Text style={[styles.simBtnText, tripState === 'completed' && styles.simBtnTextActive]}>Đã đến</Text>
          </TouchableOpacity>
        </View>

        {tripState === 'searching' && (
          <View style={[styles.simRow, { marginTop: 8 }]}>
            {[0, 5, 10, 20].map(time => (
              <TouchableOpacity 
                key={time} 
                style={[styles.simBtn, { backgroundColor: '#1E293B' }, simulatedTime === time && { backgroundColor: '#8B5CF6' }]}
                onPress={() => setSimulatedTime(time)}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>{time} phút</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* BottomSheet: AI Deal Giá */}
      <Modal visible={showDealSheet} transparent animationType="slide" onRequestClose={() => setShowDealSheet(false)}>
        <View style={styles.modalBg}>
          <View style={styles.bottomSheet}>
            <View style={styles.bsHeader}>
              <Text style={styles.bsTitle}>Thưởng thêm cho tài xế</Text>
              <TouchableOpacity onPress={() => setShowDealSheet(false)}>
                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bsSub}>Thưởng sẽ được chuyển 100% cho tài xế sau chuyến đi.</Text>

            {/* AI Market Data */}
            <View style={styles.marketDataBox}>
               <View style={styles.mdHeader}>
                 <Ionicons name="eye" size={16} color="#3B82F6" />
                 <Text style={styles.mdTitle}>AI Đã phân tích thị trường</Text>
               </View>
               <Text style={styles.mdTotal}>Hiện có 12 tài xế trong bán kính 3km:</Text>
               <View style={styles.mdGrid}>
                 <View style={styles.mdItem}><View style={[styles.dot, {backgroundColor:'#EF4444'}]}/><Text style={styles.mdItemText}>7 tài xế đang bận chở khách</Text></View>
                 <View style={styles.mdItem}><View style={[styles.dot, {backgroundColor:'#F59E0B'}]}/><Text style={styles.mdItemText}>3 tài xế sắp hoàn thành cuốc</Text></View>
                 <View style={styles.mdItem}><View style={[styles.dot, {backgroundColor:'#94A3B8'}]}/><Text style={styles.mdItemText}>2 tài xế trống ở hướng ngược lại</Text></View>
               </View>
            </View>

            {/* Probability Bars */}
            <Text style={styles.probTitle}>Xác suất có xe theo mức thưởng:</Text>
            <View style={styles.probList}>
              <TouchableOpacity style={styles.probRow} onPress={() => setSelectedTip(0)}>
                <View style={styles.radio}><View style={selectedTip===0 && styles.radioInner} /></View>
                <Text style={styles.probVal}>Không thêm</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: '35%', backgroundColor: '#EF4444' }]} />
                </View>
                <Text style={[styles.probPct, { color: '#EF4444' }]}>35%</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.probRow} onPress={() => setSelectedTip(5000)}>
                <View style={styles.radio}><View style={selectedTip===5000 && styles.radioInner} /></View>
                <Text style={styles.probVal}>+5.000đ</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: '60%', backgroundColor: '#F59E0B' }]} />
                </View>
                <Text style={[styles.probPct, { color: '#F59E0B' }]}>60%</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.probRow, styles.probRowRecommend]} onPress={() => setSelectedTip(10000)}>
                <View style={styles.aiTagRec}><Text style={styles.aiTagRecText}>🤖 AI khuyên dùng (Đợi ~2p)</Text></View>
                <View style={styles.radio}><View style={selectedTip===10000 && styles.radioInner} /></View>
                <Text style={[styles.probVal, { fontWeight: 'bold' }]}>+10.000đ</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: '91%', backgroundColor: '#10B981' }]} />
                </View>
                <Text style={[styles.probPct, { color: '#10B981', fontWeight: 'bold' }]}>91%</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.probRow} onPress={() => setSelectedTip(20000)}>
                <View style={styles.radio}><View style={selectedTip===20000 && styles.radioInner} /></View>
                <Text style={styles.probVal}>+20.000đ</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: '99%', backgroundColor: '#059669' }]} />
                </View>
                <Text style={[styles.probPct, { color: '#059669' }]}>99%</Text>
              </TouchableOpacity>
            </View>

            {/* Total Calculation */}
            <View style={styles.calcBox}>
              <View style={styles.calcRow}><Text style={styles.calcLabel}>Giá chuyến đi</Text><Text style={styles.calcVal}>{originalTotal.toLocaleString()}đ</Text></View>
              <View style={styles.calcRow}><Text style={styles.calcLabel}>Thưởng thêm</Text><Text style={styles.calcVal}>+ {selectedTip.toLocaleString()}đ</Text></View>
              <View style={styles.calcLine} />
              <View style={styles.calcRow}><Text style={styles.calcLabelTotal}>Tổng thanh toán</Text><Text style={styles.calcValTotal}>{(originalTotal + selectedTip).toLocaleString()}đ</Text></View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmTip}>
               <Text style={styles.confirmBtnText}>Xác nhận thưởng {selectedTip.toLocaleString()}đ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Safety Center SOS Modal */}
      <Modal visible={showSafetyModal} transparent animationType="fade" onRequestClose={() => setShowSafetyModal(false)}>
        <View style={styles.modalBgCenter}>
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={28} color="#10B981" />
              <Text style={styles.safetyTitle}>Trung tâm An toàn</Text>
            </View>
            <Text style={styles.safetyDesc}>Hành trình của bạn đang được giám sát bảo mật bởi AI.</Text>
            
            <View style={styles.safetyOptions}>
              <TouchableOpacity style={styles.safetyItemBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đã gửi liên kết theo dõi hành trình cho danh bạ khẩn cấp của bạn.'); setShowSafetyModal(false); }}>
                <Ionicons name="share-social" size={20} color="#3B82F6" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.safetyItemName}>Chia sẻ hành trình</Text>
                  <Text style={styles.safetyItemSub}>Gửi vị trí trực tiếp cho người thân</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.safetyItemBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đang báo cáo bất thường: AI ghi nhận xe đi chệch tuyến đường dự kiến.'); setShowSafetyModal(false); }}>
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.safetyItemName}>Báo cáo bất thường</Text>
                  <Text style={styles.safetyItemSub}>Lái xe chạy sai lộ trình / nguy hiểm</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.safetyItemBtn, styles.sosBtn]} onPress={() => { if (Platform.OS === 'web') window.alert('🚨 ĐÃ GỬI TÍN HIỆU CỨU HỘ KHẨN CẤP (SOS)!\n\nHệ thống đang liên hệ với cơ quan chức năng và số điện thoại khẩn cấp.'); setShowSafetyModal(false); }}>
                <Ionicons name="notifications" size={20} color="#FFFFFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.safetyItemName, { color: '#FFFFFF' }]}>YÊU CẦU CỨU TRỢ (SOS)</Text>
                  <Text style={[styles.safetyItemSub, { color: '#FECACA' }]}>Gọi ngay cứu hộ 113 & Đội an ninh</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeSafetyBtn} onPress={() => setShowSafetyModal(false)}>
              <Text style={styles.closeSafetyText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Driver Rating & Tip Modal */}
      <Modal visible={showRatingModal} transparent animationType="fade" onRequestClose={() => setShowRatingModal(false)}>
        <View style={styles.modalBgCenter}>
          <View style={styles.ratingCard}>
            <View style={styles.driverHeaderRating}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=60' }} style={styles.driverAvatarBig} />
              <Text style={styles.driverNameRating}>Nguyễn Văn Hùng</Text>
              <Text style={styles.driverVehicleRating}>VinFast VF8 • 29A-999.88</Text>
            </View>

            <Text style={styles.ratingTitleText}>Đánh giá tài xế của bạn</Text>
            
            {/* Star Icons */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons name={s <= rating ? "star" : "star-outline"} size={32} color="#F59E0B" style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Inputs */}
            <TextInput
              style={styles.commentInput}
              placeholder="Chia sẻ nhận xét của bạn về chuyến đi..."
              placeholderTextColor="#94A3B8"
              value={ratingComment}
              onChangeText={setRatingComment}
              multiline
            />

            {/* Tip Option */}
            <Text style={styles.tipTitleText}>Thưởng thêm cho tài xế (Tip)</Text>
            <View style={styles.ratingTipRow}>
              {[0, 10000, 20000, 50000].map(tip => (
                <TouchableOpacity
                  key={tip}
                  style={[styles.ratingTipBtn, ratingTip === tip && styles.ratingTipBtnActive]}
                  onPress={() => setRatingTip(tip)}
                >
                  <Text style={[styles.ratingTipTextBtn, ratingTip === tip && styles.ratingTipTextBtnActive]}>
                    {tip === 0 ? 'Không tip' : `+${tip/1000}k`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.ratingSubmitBtn} onPress={handleConfirmRating}>
              <Text style={styles.ratingSubmitText}>Gửi đánh giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  mapContainer: { height: 320, position: 'relative' },
  
  headerFloating: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 20, left: 16, right: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, zIndex: 10 },
  backButton: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  tripHeaderInfo: { flex: 1, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 16, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locations: { flex: 1 },
  locText: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginLeft: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  priceTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },

  // Safety button
  safetyFloatingBtn: { position: 'absolute', top: 100, right: 16, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, zIndex: 10, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  safetyFloatingText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Detour Alert
  detourAlert: { position: 'absolute', top: 100, left: 16, right: 16, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 12, borderRadius: 16, zIndex: 10, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  detourHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detourTitle: { fontSize: 13, fontWeight: '800', color: '#D97706', flex: 1, marginLeft: 6 },
  detourClose: { padding: 2 },
  detourText: { fontSize: 12, color: '#92400E', fontWeight: '500', lineHeight: 18 },
  
  panel: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, padding: 20, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, zIndex: 10 },
  panelPriority: { backgroundColor: '#FEF2F2' },
  
  stateContainer: { alignItems: 'center', paddingVertical: 10 },
  radarContainer: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  radarCircle: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)' },
  radarCenter: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#3B82F6', zIndex: 10 },
  findingTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  findingSub: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 12 },
  aiFooter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  aiFooterText: { color: '#8B5CF6', fontWeight: '600', marginLeft: 6, fontSize: 12 },
  
  aiCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 },
  aiCardDesc: { fontSize: 13, color: '#475569', fontWeight: '600', marginBottom: 6 },
  checklist: { marginBottom: 10 },
  checklistItem: { fontSize: 13, color: '#0F172A', fontWeight: '500', marginBottom: 4 },
  aiCardNote: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 10 },
  
  detailBtn: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#EFF6FF', borderRadius: 8 },
  detailBtnText: { color: '#3B82F6', fontWeight: '600', fontSize: 12 },
  breakdownBox: { marginTop: 10, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  bdLabel: { color: '#475569', fontSize: 12 },
  bdVal: { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  breakdownLine: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 6 },
  
  aiCardMainText: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  btnSecondary: { flex: 1, paddingVertical: 12, backgroundColor: '#E2E8F0', borderRadius: 12, alignItems: 'center' },
  btnSecondaryText: { color: '#475569', fontWeight: 'bold', fontSize: 14 },
  btnPrimary: { flex: 1, flexDirection: 'row', paddingVertical: 12, backgroundColor: '#D97706', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  
  priorityBanner: { alignItems: 'center', paddingVertical: 6 },
  priorityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  priorityTitle: { fontSize: 16, fontWeight: 'bold', color: '#DC2626', marginLeft: 6 },
  priorityText: { fontSize: 13, color: '#991B1B', textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  radarContainerPriority: { width: 70, height: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  
  fallbackGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  fbBtn: { width: '48%', backgroundColor: '#FFFFFF', paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', gap: 4 },
  fbBtnText: { fontSize: 12, fontWeight: 'bold', color: '#475569' },
  
  // Driver info
  driverInfoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  driverAvatar: { width: 44, height: 44, borderRadius: 22 },
  driverName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#F59E0B', marginLeft: 2 },
  driverPlate: { fontSize: 12, color: '#64748B' },
  chatActionRow: { flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center', width: '100%' },
  actionBtnCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  
  // Completed & rating
  successIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  ratingBtn: { backgroundColor: '#10B981', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 20, marginTop: 8, elevation: 4, shadowColor: '#10B981', shadowOpacity: 0.2, shadowRadius: 4 },
  ratingBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

  // Dev Tool
  simulator: { backgroundColor: '#0F172A', padding: 16, zIndex: 20 },
  simTitle: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  simRow: { flexDirection: 'row', gap: 8 },
  simBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#1E293B', borderRadius: 8, alignItems: 'center' },
  simBtnActive: { backgroundColor: '#10B981' },
  simBtnText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 12 },
  simBtnTextActive: { color: '#FFFFFF' },
  
  // Modals
  modalBg: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  bsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bsTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  bsSub: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  
  marketDataBox: { backgroundColor: '#EFF6FF', padding: 14, borderRadius: 16, marginBottom: 16 },
  mdHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  mdTitle: { fontSize: 13, fontWeight: 'bold', color: '#1D4ED8', marginLeft: 6 },
  mdTotal: { fontSize: 12, color: '#1E3A8A', fontWeight: '600', marginBottom: 6 },
  mdGrid: { gap: 4 },
  mdItem: { flexDirection: 'row', alignItems: 'center' },
  mdItemText: { fontSize: 12, color: '#334155', marginLeft: 6 },
  
  probTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  probList: { gap: 8 },
  probRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  probRowRecommend: { backgroundColor: '#ECFDF5', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0', marginHorizontal: -10 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  probVal: { width: 75, fontSize: 13, color: '#475569' },
  barBg: { flex: 1, height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, marginHorizontal: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  probPct: { width: 35, fontSize: 13, textAlign: 'right' },
  
  aiTagRec: { position: 'absolute', top: -10, left: 10, backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  aiTagRecText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  
  calcBox: { marginTop: 16, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  calcLabel: { color: '#64748B', fontSize: 13 },
  calcVal: { color: '#0F172A', fontSize: 13, fontWeight: '500' },
  calcLine: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 6 },
  calcLabelTotal: { color: '#0F172A', fontSize: 15, fontWeight: 'bold' },
  calcValTotal: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
  
  confirmBtn: { backgroundColor: '#0F172A', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

  // Center Modals
  modalBgCenter: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  safetyCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, elevation: 10 },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  safetyTitle: { fontSize: 18, fontWeight: 'bold', color: '#10B981', marginLeft: 8 },
  safetyDesc: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  safetyOptions: { gap: 12 },
  safetyItemBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  safetyItemName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  safetyItemSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  sosBtn: { backgroundColor: '#EF4444', borderColor: 'transparent' },
  closeSafetyBtn: { marginTop: 20, alignSelf: 'center', padding: 10 },
  closeSafetyText: { color: '#64748B', fontWeight: 'bold', fontSize: 14 },

  // Rating Modal
  ratingCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, alignItems: 'center', elevation: 10 },
  driverHeaderRating: { alignItems: 'center', marginBottom: 16 },
  driverAvatarBig: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
  driverNameRating: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  driverVehicleRating: { fontSize: 12, color: '#64748B', marginTop: 2 },
  ratingTitleText: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  starsContainer: { flexDirection: 'row', marginBottom: 16 },
  commentInput: { width: '100%', height: 80, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 14, fontSize: 13, color: '#0F172A', textAlignVertical: 'top', marginBottom: 16, ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }) },
  tipTitleText: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', alignSelf: 'flex-start', marginBottom: 10 },
  ratingTipRow: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 20 },
  ratingTipBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  ratingTipBtnActive: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  ratingTipTextBtn: { fontSize: 12, color: '#475569', fontWeight: '600' },
  ratingTipTextBtnActive: { color: '#10B981' },
  ratingSubmitBtn: { width: '100%', backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  ratingSubmitText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }
});
