import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import WebMap from '../../components/WebMap';

export default function RideBooking() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState('car7');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState({
    id: 'superpay',
    name: 'Ví SuperPay',
    icon: 'wallet-outline',
    color: '#3B82F6',
    desc: 'Hoàn 8% nhờ AI tối ưu'
  });
  
  const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt', icon: 'cash-outline', color: '#10B981', desc: 'Thanh toán trực tiếp' },
    { id: 'superpay', name: 'Ví SuperPay', icon: 'wallet-outline', color: '#3B82F6', desc: 'Hoàn 8% nhờ AI tối ưu' },
    { id: 'card', name: 'Thẻ tín dụng', icon: 'card-outline', color: '#8B5CF6', desc: 'Visa, Mastercard' },
    { id: 'qr', name: 'VNPAY QR', icon: 'qr-code-outline', color: '#EF4444', desc: 'Quét mã thanh toán' },
    { id: 'apple', name: 'Apple Pay', icon: 'logo-apple', color: '#0F172A', desc: 'Xác thực nhanh bằng FaceID' }
  ];

  const mapPoints = [
    { lat: 21.028511, lng: 105.804817, label: 'Điểm đón (Nhà)', color: '#3B82F6' },
    { lat: 21.008511, lng: 105.814817, label: 'Điểm đến (Aeon Mall)', color: '#EF4444' }
  ];
  
  const vehicles = [
    { id: 'bike', name: 'Xe máy', seats: 1, price: 52000, eta: '14 phút', recommended: false, icon: 'bicycle-outline' },
    { id: 'ev', name: 'Taxi điện', seats: 4, price: 65000, eta: '16 phút', recommended: false, icon: 'car-outline' },
    { id: 'car7', name: 'Ô tô 7 chỗ', seats: 7, price: 80000, eta: '15 phút', recommended: true, icon: 'car-sport-outline' },
    { id: 'suv', name: 'SUV Luxury', seats: 4, price: 110000, eta: '15 phút', recommended: false, icon: 'shield-checkmark-outline' },
  ];

  const currentVehicleData = vehicles.find(v => v.id === selectedVehicle);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/ride');
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn loại xe</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <WebMap
          points={mapPoints}
          showRoute={true}
          routeColor="#10B981"
          height={260}
          zoom={13}
        />
      </View>

      <View style={styles.bookingPanel}>
        {/* AI Smart Suggestion */}
        <View style={styles.aiBubble}>
          <Ionicons name="sparkles" size={20} color="#D97706" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiMessage}>Nhóm bạn có 4 người. Xe 7 chỗ chỉ đắt hơn 15.000đ. Đề xuất chọn xe 7 chỗ để ngồi thoải mái hơn.</Text>
          </View>
        </View>

        <ScrollView style={styles.vehicleList} showsVerticalScrollIndicator={false}>
          {vehicles.map(v => (
            <TouchableOpacity 
              key={v.id} 
              style={[styles.vehicleItem, selectedVehicle === v.id && styles.vehicleItemSelected]}
              onPress={() => setSelectedVehicle(v.id)}
            >
              <View style={[styles.vehicleIcon, selectedVehicle === v.id && { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name={v.icon as any} size={26} color={selectedVehicle === v.id ? '#10B981' : '#475569'} />
              </View>
              <View style={styles.vehicleInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.vehicleName, selectedVehicle === v.id && { color: '#10B981' }]}>{v.name}</Text>
                  <View style={styles.seatsBadge}>
                    <Ionicons name="person" size={10} color="#64748B" />
                    <Text style={styles.seatsText}>{v.seats}</Text>
                  </View>
                </View>
                <Text style={styles.vehicleEta}>Cách bạn {v.eta}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={[styles.priceText, selectedVehicle === v.id && { color: '#10B981' }]}>{formatPrice(v.price)}</Text>
                {v.recommended && <Text style={styles.recommendedText}>Tối ưu nhất</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.footer}>
          {/* Payment Method Selector Trigger */}
          <TouchableOpacity style={styles.paymentMethod} onPress={() => setShowPaymentModal(true)}>
            <Ionicons name={selectedPayment.icon as any} size={24} color={selectedPayment.color} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.paymentName}>{selectedPayment.name}</Text>
              <Text style={styles.paymentPromo}>{selectedPayment.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bookButton} onPress={() => router.push('/ride/tracking')}>
            <Text style={styles.bookButtonText}>Đặt {currentVehicleData?.name} - {formatPrice(currentVehicleData?.price || 0)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Selection Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modalBg}>
          <View style={styles.bottomSheet}>
            <View style={styles.bsHeader}>
              <Text style={styles.bsTitle}>Chọn phương thức thanh toán</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bsSub}>Vui lòng chọn phương thức thanh toán phù hợp cho chuyến đi.</Text>

            <ScrollView style={styles.paymentList} showsVerticalScrollIndicator={false}>
              {paymentMethods.map(pm => (
                <TouchableOpacity
                  key={pm.id}
                  style={[styles.paymentItem, selectedPayment.id === pm.id && styles.paymentItemSelected]}
                  onPress={() => {
                    setSelectedPayment(pm);
                    setShowPaymentModal(false);
                  }}
                >
                  <View style={[styles.pmIconWrap, { backgroundColor: pm.color + '15' }]}>
                    <Ionicons name={pm.icon as any} size={24} color={pm.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pmName}>{pm.name}</Text>
                    <Text style={styles.pmDesc}>{pm.desc}</Text>
                  </View>
                  <Ionicons
                    name={selectedPayment.id === pm.id ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={selectedPayment.id === pm.id ? '#10B981' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', zIndex: 10 },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  
  mapContainer: { height: 260, position: 'relative' },
  
  bookingPanel: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 24 },
  
  aiBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  aiMessage: { color: '#D97706', fontSize: 13, fontWeight: '600', lineHeight: 20, flex: 1 },
  
  vehicleList: { padding: 20 },
  vehicleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, marginBottom: 10, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: 'transparent' },
  vehicleItemSelected: { backgroundColor: '#F0FDF4', borderColor: '#10B981' },
  vehicleIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  vehicleInfo: { flex: 1, marginLeft: 12 },
  vehicleName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  seatsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  seatsText: { fontSize: 11, color: '#64748B', marginLeft: 2, fontWeight: 'bold' },
  vehicleEta: { fontSize: 12, color: '#64748B' },
  priceContainer: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  recommendedText: { fontSize: 10, color: '#F59E0B', fontWeight: 'bold', marginTop: 4 },
  
  footer: { padding: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  paymentName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  paymentPromo: { fontSize: 12, color: '#10B981', fontWeight: '600', marginTop: 2 },
  bookButton: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 20, alignItems: 'center', elevation: 4, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  bookButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  bsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bsTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  bsSub: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  paymentList: { gap: 10 },
  paymentItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  paymentItemSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  pmIconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pmName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  pmDesc: { fontSize: 12, color: '#64748B', marginTop: 2 }
});
