import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { SlideInDown, Layout, FadeInDown } from 'react-native-reanimated';
import WebMap from '../../components/WebMap';

export default function DeliveryCreate() {
  const router = useRouter();
  
  // Points list with dynamic state
  const [points, setPoints] = useState([
    { id: 'start', title: 'Điểm lấy hàng', addr: 'Kho X, Cầu Giấy, Hà Nội', lat: 21.0355, lng: 105.7838, color: '#3B82F6' },
    { id: 'drop1', title: 'Điểm giao 1', addr: 'Cửa hàng B, Đống Đa, Hà Nội', lat: 21.0167, lng: 105.8300, color: '#F59E0B' },
    { id: 'drop2', title: 'Điểm giao 2', addr: 'Cửa hàng A, Thanh Xuân, Hà Nội', lat: 21.0024, lng: 105.8072, color: '#EF4444' },
  ]);

  const [isOptimized, setIsOptimized] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newAddress, setNewAddress] = useState('');

  // Sender & Recipient States
  const [senderName, setSenderName] = useState('Trần Trung');
  const [senderPhone, setSenderPhone] = useState('0912345678');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientNote, setRecipientNote] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  const mapPoints = points.map((p, i) => ({
    lat: p.lat,
    lng: p.lng,
    label: p.title,
    color: p.color,
  }));

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setIsOptimized(true);
      // Re-order points for optimization (swap drop1 and drop2)
      setPoints(prev => [prev[0], prev[2], prev[1]]);
    }, 1500);
  };

  const handleAddPoint = () => {
    if (!newAddress) return;

    // Generate random coordinate near Cầu Giấy for simulated map marker
    const randomLat = 21.0100 + Math.random() * 0.03;
    const randomLng = 105.7900 + Math.random() * 0.04;
    const newPoint = {
      id: 'drop' + (points.length + 1),
      title: 'Điểm giao ' + points.length,
      addr: newAddress,
      lat: randomLat,
      lng: randomLng,
      color: '#EC4899' // Pink color for user added pins
    };

    setPoints([...points, newPoint]);
    setNewAddress('');
    setShowAddInput(false);
    
    if (Platform.OS === 'web') {
      window.alert(`Đã thêm điểm giao mới thành công!\nĐịa chỉ: ${newAddress}\nBản đồ đã tự động cập nhật lộ trình đi qua điểm này.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Real Map */}
      <View style={styles.mapContainer}>
        <WebMap
          points={mapPoints}
          showRoute={true}
          routeColor={isOptimized ? '#10B981' : '#3B82F6'}
          height={280}
          zoom={13}
        />

        {/* Floating Back Button */}
        <View style={styles.floatingHeader} pointerEvents="box-none">
          <TouchableOpacity 
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/delivery');
            }} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.mapTitle}>Tuyến đường</Text>
        </View>
      </View>

      {/* Bottom Panel */}
      <View style={styles.panel}>
        <View style={styles.panelHandle} />
        
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Tuyến đường giao hàng</Text>
          <TouchableOpacity style={styles.addPointBtn} onPress={() => setShowAddInput(!showAddInput)}>
            <Ionicons name={showAddInput ? "close" : "add"} size={20} color="#3B82F6" />
            <Text style={styles.addPointText}>{showAddInput ? 'Đóng' : 'Thêm điểm'}</Text>
          </TouchableOpacity>
        </View>

        {showAddInput && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.addInputContainer}>
            <TextInput
              style={styles.addInput}
              placeholder="Nhập địa chỉ giao hàng mới..."
              placeholderTextColor="#94A3B8"
              value={newAddress}
              onChangeText={setNewAddress}
            />
            <TouchableOpacity
              style={[styles.addConfirmBtn, !newAddress && { opacity: 0.5 }]}
              disabled={!newAddress}
              onPress={handleAddPoint}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}

        <ScrollView style={styles.pointsList} showsVerticalScrollIndicator={false}>
          {points.map((p, index) => (
            <Animated.View key={p.id} layout={Layout.springify()} style={styles.pointRow}>
              <View style={styles.pointTimeline}>
                <View style={[styles.dot, { backgroundColor: p.color }]}>
                  <Text style={styles.dotText}>{index + 1}</Text>
                </View>
                {index < points.length - 1 && <View style={styles.line} />}
              </View>
              <View style={styles.pointInfo}>
                <Text style={styles.pointLabel}>{p.title}</Text>
                <Text style={styles.pointAddr}>{p.addr}</Text>
              </View>
              <TouchableOpacity style={styles.reorderBtn}>
                <Ionicons name="reorder-two" size={24} color="#CBD5E1" />
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* Toggleable Contact Details Form */}
          <TouchableOpacity 
            style={styles.contactFormHeader} 
            onPress={() => setShowContactForm(!showContactForm)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people-outline" size={20} color="#3B82F6" />
              <Text style={styles.contactFormTitle}>Thông tin liên hệ giao hàng</Text>
            </View>
            <Ionicons name={showContactForm ? "chevron-up" : "chevron-down"} size={20} color="#94A3B8" />
          </TouchableOpacity>

          {showContactForm && (
            <Animated.View entering={FadeInDown.duration(200)} style={styles.contactFormContent}>
              <Text style={styles.formSectionLabel}>Thông tin người gửi (Điểm 1)</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.formInput, { flex: 1, marginRight: 8 }]}
                  placeholder="Tên người gửi"
                  placeholderTextColor="#94A3B8"
                  value={senderName}
                  onChangeText={setSenderName}
                />
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  placeholder="SĐT người gửi"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={senderPhone}
                  onChangeText={setSenderPhone}
                />
              </View>

              <Text style={[styles.formSectionLabel, { marginTop: 12 }]}>Thông tin người nhận (Điểm cuối)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Tên người nhận"
                placeholderTextColor="#94A3B8"
                value={recipientName}
                onChangeText={setRecipientName}
              />
              <TextInput
                style={[styles.formInput, { marginTop: 8 }]}
                placeholder="Số điện thoại người nhận"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={recipientPhone}
                onChangeText={setRecipientPhone}
              />
              <TextInput
                style={[styles.formInput, { marginTop: 8, height: 60, textAlignVertical: 'top' }]}
                placeholder="Ghi chú người nhận (VD: Giao bảo vệ, gọi trước khi đến...)"
                placeholderTextColor="#94A3B8"
                value={recipientNote}
                onChangeText={setRecipientNote}
                multiline
              />
            </Animated.View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* AI Routing Feature */}
        {!isOptimized ? (
          <TouchableOpacity
            style={[styles.aiRouteBtn, isOptimizing && styles.aiRouteBtnDisabled]}
            onPress={handleOptimize}
            disabled={isOptimizing}
          >
            <Ionicons name={isOptimizing ? "hourglass" : "git-network"} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.aiRouteBtnText}>
              {isOptimizing ? 'AI đang tính toán...' : 'AI Tối ưu Tuyến đường'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Animated.View entering={SlideInDown} style={styles.aiSuccessCard}>
            <View style={styles.aiSuccessHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.aiSuccessTitle}>Đã tối ưu lộ trình!</Text>
            </View>
            <Text style={styles.aiSuccessText}>Tiết kiệm 4.2km (~18.000đ) và giảm 12 phút di chuyển.</Text>
          </Animated.View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.nextBtn, !recipientName && styles.nextBtnDisabled]} 
            disabled={!recipientName}
            onPress={() => router.push('/delivery/package')}
          >
            <Text style={styles.nextBtnText}>Tiếp tục</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          {!recipientName && (
            <Text style={styles.warnText}>Vui lòng nhập tên người nhận trong bảng thông tin liên hệ.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Map area
  mapContainer: { height: 280, position: 'relative' },

  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    zIndex: 10,
  },
  backButton: {
    width: 44, height: 44, backgroundColor: '#FFFFFF',
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  mapTitle: {
    marginLeft: 12, fontSize: 18, fontWeight: 'bold', color: '#0F172A',
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },

  // Bottom panel
  panel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -24,
    elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1, shadowRadius: 24,
    paddingHorizontal: 24, paddingTop: 12,
  },
  panelHandle: {
    width: 40, height: 4, backgroundColor: '#E2E8F0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  panelHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  panelTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  addPointBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },
  addPointText: { color: '#3B82F6', fontWeight: 'bold', marginLeft: 4 },

  // Add address input
  addInputContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  addInput: {
    flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    padding: 12, borderRadius: 12, fontSize: 14, color: '#0F172A',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }),
  },
  addConfirmBtn: {
    width: 44, height: 44, backgroundColor: '#3B82F6', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },

  // Points list
  pointsList: { flex: 1 },
  pointRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pointTimeline: { alignItems: 'center', marginRight: 12, width: 32 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  dotText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  line: { width: 2, height: 24, backgroundColor: '#E2E8F0', marginTop: 4 },
  pointInfo: {
    flex: 1, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  pointLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  pointAddr: { fontSize: 15, color: '#0F172A', fontWeight: '600', marginTop: 2 },
  reorderBtn: { padding: 4, marginLeft: 8 },

  // Contact form styles
  contactFormHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginTop: 12,
  },
  contactFormTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginLeft: 8 },
  contactFormContent: {
    backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0', borderTopWidth: 0,
    borderTopLeftRadius: 0, borderTopRightRadius: 0, gap: 8,
  },
  formSectionLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 },
  formInput: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    padding: 10, borderRadius: 10, fontSize: 13, color: '#0F172A',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }),
  },
  row: { flexDirection: 'row' },

  // AI Buttons
  aiRouteBtn: {
    flexDirection: 'row', backgroundColor: '#8B5CF6',
    paddingVertical: 14, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginVertical: 12,
    elevation: 4, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  aiRouteBtnDisabled: { backgroundColor: '#A78BFA' },
  aiRouteBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  aiSuccessCard: {
    backgroundColor: '#F0FDF4', padding: 14, borderRadius: 16, marginVertical: 12,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  aiSuccessHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  aiSuccessTitle: { color: '#059669', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  aiSuccessText: { color: '#047857', fontSize: 13, lineHeight: 20 },

  // Footer
  footer: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, paddingBottom: 12 },
  nextBtn: {
    backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 20,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  warnText: { fontSize: 11, color: '#EF4444', textAlign: 'center', marginTop: 8, fontWeight: '500' },
});
