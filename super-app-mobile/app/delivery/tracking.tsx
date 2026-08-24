import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  Image, Platform, ScrollView, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import WebMap from '../../components/WebMap';

export default function DeliveryTracking() {
  const router = useRouter();
  
  // States
  const [showRisk, setShowRisk] = useState(false);
  const [deliveryState, setDeliveryState] = useState<'picked_up' | 'delivering' | 'delivered'>('delivering');
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Rating form
  const [rating, setRating] = useState(5);
  const [ratingTip, setRatingTip] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRisk(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    { title: 'Đã đặt đơn', time: '13:45', done: true },
    { title: 'Đã lấy hàng', time: '14:00', done: ['picked_up', 'delivering', 'delivered'].includes(deliveryState) },
    { title: 'Đang trên đường giao', time: 'Dự kiến 14:30', done: ['delivering', 'delivered'].includes(deliveryState), active: deliveryState === 'delivering', addr: 'Cửa hàng A, Thanh Xuân' },
    { title: 'Đã giao hàng thành công', time: deliveryState === 'delivered' ? '14:25' : '', done: deliveryState === 'delivered' },
  ];

  // Map points: origin, driver, destination
  const mapPoints = [
    { lat: 21.0355, lng: 105.7838, label: 'Kho X (Điểm lấy)', color: '#3B82F6' },
    { lat: deliveryState === 'delivered' ? 21.0024 : 21.0180, lng: deliveryState === 'delivered' ? 105.8072 : 105.8050, label: deliveryState === 'delivered' ? 'Đã giao thành công' : 'Tài xế Trần Bình', color: '#F59E0B' },
    { lat: 21.0024, lng: 105.8072, label: 'Cửa hàng A (Điểm giao)', color: '#EF4444' },
  ];

  const handleConfirmRating = () => {
    setShowRatingModal(false);
    if (Platform.OS === 'web') {
      window.alert(`Cảm ơn bạn đã đánh giá dịch vụ giao hàng!\n⭐: ${rating} Sao\nTip: ${ratingTip.toLocaleString()}đ\nÝ kiến: ${ratingComment || 'Không có'}`);
    }
    router.replace('/transport');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Real Map */}
      <View style={styles.mapContainer}>
        <WebMap
          points={mapPoints}
          showRoute={true}
          routeColor="#10B981"
          height={260}
          zoom={13}
        />

        {/* Risk Alert */}
        {showRisk && deliveryState !== 'delivered' && (
          <Animated.View entering={SlideInDown} style={styles.riskAlert}>
            <View style={styles.riskHeader}>
              <View style={styles.riskIconWrap}>
                <Ionicons name="warning" size={18} color="#EF4444" />
              </View>
              <Text style={styles.riskTitle}>AI Phát hiện Rủi ro</Text>
              <TouchableOpacity onPress={() => setShowRisk(false)} style={styles.riskClose}>
                <Ionicons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={styles.riskMessage}>
              Tuyến đường phía trước đang ngập lụt. AI đã tự động cập nhật ETA thêm 10 phút và gợi ý tài xế đi đường vòng.
            </Text>
          </Animated.View>
        )}

        {/* Back button */}
        <View style={styles.floatingHeader} pointerEvents="box-none">
          <TouchableOpacity 
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/transport');
            }} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SOS Safety Button (Visible during transit) */}
      {deliveryState !== 'delivered' && (
        <TouchableOpacity style={styles.safetyFloatingBtn} onPress={() => setShowSafetyModal(true)}>
          <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.safetyFloatingText}>An toàn</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Panel */}
      <View style={styles.panel}>
        <View style={styles.panelHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Header */}
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.statusTitle}>
                {deliveryState === 'picked_up' && 'Tài xế đã lấy hàng'}
                {deliveryState === 'delivering' && 'Đang giao hàng'}
                {deliveryState === 'delivered' && 'Đã hoàn thành'}
              </Text>
              <Text style={styles.etaText}>
                {deliveryState === 'delivered' ? 'Giao thành công lúc 14:25' : 'Dự kiến đến lúc 14:30'}
              </Text>
            </View>
            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdText}>#DLV-1029</Text>
            </View>
          </View>

          {/* Driver Info */}
          <View style={styles.driverInfo}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.driverAvatar} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.driverName}>Trần Bình</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>4.9</Text>
                <Text style={styles.driverVehicle}> • Xe Van • 29D-123.45</Text>
              </View>
            </View>
            {deliveryState !== 'delivered' && (
              <View style={styles.actionBtns}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Mở tin nhắn với tài xế Trần Bình'); }}><Ionicons name="chatbubble-ellipses" size={20} color="#3B82F6" /></TouchableOpacity>
                <TouchableOpacity style={[styles.circleBtn, { backgroundColor: '#F0FDF4' }]} onPress={() => { if (Platform.OS === 'web') window.alert('Đang gọi điện cho tài xế...'); }}><Ionicons name="call" size={20} color="#10B981" /></TouchableOpacity>
              </View>
            )}
          </View>

          {/* OTP / QR Verify Row (Visible during delivering) */}
          {deliveryState === 'delivering' && (
            <View style={styles.verifyCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.verifyTitle}>Xác nhận giao nhận bằng AI</Text>
                <Text style={styles.verifySub}>Cung cấp mã hoặc quét QR để ký nhận</Text>
                <Text style={styles.otpText}>Mã OTP: <Text style={{ color: '#10B981', fontWeight: 'bold' }}>8899</Text></Text>
              </View>
              <TouchableOpacity style={styles.qrVerifyBtn} onPress={() => setShowConfirmModal(true)}>
                <Ionicons name="qr-code" size={22} color="#FFFFFF" />
                <Text style={styles.qrVerifyText}>Hiện QR</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Timeline */}
          <View style={styles.timeline}>
            {steps.map((step, index) => (
              <View key={index}>
                <View style={styles.timelineItem}>
                  {step.done ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  ) : step.active ? (
                    <View style={styles.pulseDotWrapper}>
                      <View style={styles.pulseDot} />
                    </View>
                  ) : (
                    <View style={styles.emptyDot} />
                  )}
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      step.done && styles.timelineTitleDone,
                      step.active && styles.timelineTitleActive,
                    ]}>
                      {step.title}
                    </Text>
                    {step.addr && <Text style={styles.timelineAddr}>{step.addr}</Text>}
                    {step.time ? <Text style={styles.timelineTime}>{step.time}</Text> : null}
                  </View>
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                )}
              </View>
            ))}
          </View>

          {/* Action Row */}
          {deliveryState !== 'delivered' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionCardBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Chia sẻ lộ trình giao hàng qua tin nhắn/zalo.'); }}><Ionicons name="share-social" size={20} color="#8B5CF6" /><Text style={styles.actionCardText}>Chia sẻ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionCardBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Liên hệ trung tâm hỗ trợ sự cố giao hàng.'); }}><Ionicons name="help-circle" size={20} color="#F59E0B" /><Text style={styles.actionCardText}>Hỗ trợ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionCardBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đang thực hiện quy trình hủy đơn hàng...'); }}><Ionicons name="close-circle" size={20} color="#EF4444" /><Text style={styles.actionCardText}>Hủy đơn</Text></TouchableOpacity>
            </View>
          )}

          {/* Completed rating trigger button */}
          {deliveryState === 'delivered' ? (
            <TouchableOpacity style={styles.finishBtnActive} onPress={() => setShowRatingModal(true)}>
              <Ionicons name="star" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.finishBtnActiveText}>Đánh giá & Tip Tài xế</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishBtn} onPress={() => router.replace('/transport')}>
              <Ionicons name="home" size={20} color="#0F172A" style={{ marginRight: 8 }} />
              <Text style={styles.finishBtnText}>Về trang Vận chuyển</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* Dev Simulator Panel */}
      <View style={styles.simulator}>
        <Text style={styles.simTitle}>🛠 Dev Tool: Trạng thái Giao hàng</Text>
        <View style={styles.simRow}>
          <TouchableOpacity style={[styles.simBtn, deliveryState === 'picked_up' && styles.simBtnActive]} onPress={() => setDeliveryState('picked_up')}><Text style={[styles.simBtnText, deliveryState === 'picked_up' && styles.simBtnTextActive]}>Đã lấy</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.simBtn, deliveryState === 'delivering' && styles.simBtnActive]} onPress={() => setDeliveryState('delivering')}><Text style={[styles.simBtnText, deliveryState === 'delivering' && styles.simBtnTextActive]}>Đang giao</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.simBtn, deliveryState === 'delivered' && styles.simBtnActive]} onPress={() => setDeliveryState('delivered')}><Text style={[styles.simBtnText, deliveryState === 'delivered' && styles.simBtnTextActive]}>Đã giao</Text></TouchableOpacity>
        </View>
      </View>

      {/* Confirm QR Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalBgCenter}>
          <View style={styles.confirmCard}>
            <View style={styles.bsHeader}>
              <Text style={styles.bsTitle}>Mã xác nhận nhận hàng</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Ionicons name="close-circle" size={24} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            <Text style={styles.confirmSub}>Đưa mã QR này cho tài xế quét hoặc cung cấp mã OTP để xác nhận gói hàng đã giao thành công.</Text>
            
            <View style={styles.qrCodeWrapper}>
               {/* Simulated QR Code structure */}
               <View style={styles.mockQr}>
                  <View style={styles.qrCorner} />
                  <Ionicons name="qr-code" size={140} color="#0F172A" />
               </View>
               <Text style={styles.otpBigText}>OTP: 8899</Text>
            </View>

            <TouchableOpacity style={styles.closeConfirmBtn} onPress={() => setShowConfirmModal(false)}>
              <Text style={styles.closeConfirmText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Safety SOS Modal */}
      <Modal visible={showSafetyModal} transparent animationType="fade" onRequestClose={() => setShowSafetyModal(false)}>
        <View style={styles.modalBgCenter}>
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={28} color="#10B981" />
              <Text style={styles.safetyTitle}>Trung tâm An toàn</Text>
            </View>
            <Text style={styles.safetyDesc}>Đơn hàng giao nhận đang được bảo vệ an ninh thời gian thực.</Text>
            
            <View style={styles.safetyOptions}>
              <TouchableOpacity style={styles.safetyItemBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đã chia sẻ link bản đồ theo dõi hàng hóa cho người nhận.'); setShowSafetyModal(false); }}>
                <Ionicons name="share-social" size={20} color="#3B82F6" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.safetyItemName}>Chia sẻ hành trình đơn hàng</Text>
                  <Text style={styles.safetyItemSub}>Gửi vị trí trực tiếp cho người nhận</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.safetyItemBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đã báo cáo rủi ro hàng hóa có khả năng bị hỏng / tài xế đi sai lộ trình.'); setShowSafetyModal(false); }}>
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.safetyItemName}>Báo cáo sự cố khẩn cấp</Text>
                  <Text style={styles.safetyItemSub}>Hàng dễ vỡ bị xóc nảy, tài xế bất thường</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.safetyItemBtn, styles.sosBtn]} onPress={() => { if (Platform.OS === 'web') window.alert('🚨 ĐÃ GỬI BÁO CÁO CỨU HỘ SOS!\n\nĐang gọi khẩn cấp cho hotline hỗ trợ giao hàng.'); setShowSafetyModal(false); }}>
                <Ionicons name="notifications" size={20} color="#FFFFFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.safetyItemName, { color: '#FFFFFF' }]}>YÊU CẦU TRỢ GIÚP KHẨN CẤP</Text>
                  <Text style={[styles.safetyItemSub, { color: '#FECACA' }]}>Liên hệ trực tiếp đội cứu hộ đơn hàng</Text>
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
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.driverAvatarBig} />
              <Text style={styles.driverNameRating}>Trần Bình</Text>
              <Text style={styles.driverVehicleRating}>Xe Van • 29D-123.45</Text>
            </View>

            <Text style={styles.ratingTitleText}>Đánh giá chất lượng giao hàng</Text>
            
            {/* Star Icons */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons name={s <= rating ? "star" : "star-outline"} size={32} color="#F59E0B" style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Nhận xét của bạn về tài xế giao hàng..."
              placeholderTextColor="#94A3B8"
              value={ratingComment}
              onChangeText={setRatingComment}
              multiline
            />

            <Text style={styles.tipTitleText}>Thưởng thêm cho tài xế giao hàng (Tip)</Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mapContainer: { height: 260, position: 'relative' },

  // Risk Alert
  riskAlert: {
    position: 'absolute', top: Platform.OS === 'android' ? 80 : 60,
    left: 16, right: 16,
    backgroundColor: '#FEF2F2', padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: '#FECACA', elevation: 8,
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, zIndex: 10,
  },
  riskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  riskIconWrap: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center',
  },
  riskTitle: { color: '#B91C1C', fontWeight: 'bold', fontSize: 15, marginLeft: 8, flex: 1 },
  riskClose: { padding: 4 },
  riskMessage: { color: '#991B1B', fontSize: 13, lineHeight: 20 },

  // Floating header
  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, zIndex: 10,
  },
  backButton: {
    width: 44, height: 44, backgroundColor: '#FFFFFF',
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },

  safetyFloatingBtn: { position: 'absolute', top: 100, right: 16, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, zIndex: 10, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  safetyFloatingText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Panel
  panel: {
    flex: 1, backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -24, elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1, shadowRadius: 24,
    paddingHorizontal: 24, paddingTop: 12, zIndex: 10,
  },
  panelHandle: {
    width: 40, height: 4, backgroundColor: '#E2E8F0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },

  // Status
  statusHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  statusTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  etaText: { fontSize: 15, color: '#10B981', fontWeight: '600', marginTop: 4 },
  orderIdBadge: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  orderIdText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },

  // Driver info
  driverInfo: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 16,
  },
  driverAvatar: { width: 52, height: 52, borderRadius: 26 },
  driverName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#F59E0B', marginLeft: 4 },
  driverVehicle: { fontSize: 13, color: '#64748B' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  circleBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },

  // Verify code
  verifyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderSize: 1, borderColor: '#A7F3D0', padding: 16, borderRadius: 16, marginBottom: 20 },
  verifyTitle: { fontSize: 14, fontWeight: 'bold', color: '#047857' },
  verifySub: { fontSize: 11, color: '#065F46', marginTop: 2 },
  otpText: { fontSize: 13, color: '#047857', fontWeight: '700', marginTop: 8 },
  qrVerifyBtn: { backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  qrVerifyText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },

  // Timeline
  timeline: { marginBottom: 20 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineLine: {
    width: 2, height: 24, backgroundColor: '#E2E8F0',
    marginLeft: 11, marginVertical: 2,
  },
  timelineLineDone: { backgroundColor: '#10B981' },
  timelineContent: { marginLeft: 12, flex: 1, paddingBottom: 4 },
  timelineTitle: { fontSize: 15, fontWeight: '600', color: '#94A3B8' },
  timelineTitleDone: { color: '#0F172A' },
  timelineTitleActive: { color: '#3B82F6' },
  timelineTime: { fontSize: 12, color: '#64748B', marginTop: 2 },
  timelineAddr: { fontSize: 13, color: '#64748B', marginTop: 2 },
  pulseDotWrapper: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  pulseDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#3B82F6', borderWidth: 3, borderColor: '#DBEAFE',
  },
  emptyDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#E2E8F0',
    justifyContent: 'center', alignItems: 'center',
  },

  // Action row
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 16,
  },
  actionCardBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    backgroundColor: '#F8FAFC', borderRadius: 14,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  actionCardText: { fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 4 },

  // Finish
  finishBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F1F5F9', paddingVertical: 16, borderRadius: 20,
  },
  finishBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  finishBtnActive: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 20,
    elevation: 4, shadowColor: '#10B981', shadowOpacity: 0.2, shadowRadius: 4,
  },
  finishBtnActiveText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  // Dev Tool
  simulator: { backgroundColor: '#0F172A', padding: 16, zIndex: 20 },
  simTitle: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  simRow: { flexDirection: 'row', gap: 8 },
  simBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#1E293B', borderRadius: 8, alignItems: 'center' },
  simBtnActive: { backgroundColor: '#10B981' },
  simBtnText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 12 },
  simBtnTextActive: { color: '#FFFFFF' },

  // Modals
  modalBgCenter: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirmCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, elevation: 10 },
  confirmSub: { fontSize: 13, color: '#64748B', marginTop: 10, lineHeight: 18 },
  qrCodeWrapper: { alignItems: 'center', marginVertical: 20 },
  mockQr: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  qrCorner: { position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderColor: '#10B981', borderTopWidth: 3, borderLeftWidth: 3 },
  otpBigText: { fontSize: 24, fontWeight: 'bold', color: '#10B981', marginTop: 16, letterSpacing: 2 },
  closeConfirmBtn: { backgroundColor: '#0F172A', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 16, alignSelf: 'center' },
  closeConfirmText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },

  // Safety Center SOS Modal
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
