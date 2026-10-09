import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebMap, { MapPoint } from '../../components/WebMap';
import { createRideBooking } from '../../modules/ride/services/realRideService';

export default function RideBooking() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    destinationName?: string;
    destinationAddress?: string;
    distanceKm?: string;
    etaMinutes?: string;
    vehicleId?: string;
    dropLat?: string;
    dropLng?: string;
  }>();

  const destinationName = params.destinationName || 'Royal City';
  const destinationAddress = params.destinationAddress || '72A Nguyễn Trãi, Thanh Xuân, Hà Nội';
  const distance = parseFloat(params.distanceKm || '4.8');
  const baseEta = parseInt(params.etaMinutes || '14', 10);

  const [selectedVehicle, setSelectedVehicle] = useState(
    params.vehicleId === 'bike'
      ? 'bike'
      : params.vehicleId === 'suv'
      ? 'suv'
      : params.vehicleId === 'car7' || params.vehicleId === 'car'
      ? 'car7'
      : 'ev'
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState({
    id: 'superpay',
    name: 'Ví SuperPay',
    icon: 'wallet-outline',
    color: '#3B82F6',
    desc: 'Hoàn 8% tiền mặt ngay lập tức',
  });

  const paymentMethods = [
    { id: 'superpay', name: 'Ví SuperPay', icon: 'wallet-outline', color: '#3B82F6', desc: 'Hoàn 8% tiền mặt ngay lập tức' },
    { id: 'cash', name: 'Tiền mặt', icon: 'cash-outline', color: '#10B981', desc: 'Thanh toán trực tiếp cho tài xế' },
    { id: 'card', name: 'Thẻ ATM / Visa / Master', icon: 'card-outline', color: '#8B5CF6', desc: 'Liên kết bảo mật PCI-DSS' },
    { id: 'qr', name: 'VNPAY QR', icon: 'qr-code-outline', color: '#EF4444', desc: 'Quét mã chuyển khoản nhanh' },
  ];

  // Dynamic pricing calculation based on real distance
  const calcPrice = (base: number, perKm: number) => {
    const total = base + Math.max(0, distance - 2) * perKm;
    return Math.round(total / 1000) * 1000;
  };

  const vehicles = [
    {
      id: 'bike',
      name: 'Xe máy Công nghệ',
      desc: 'Nhanh nhẹn, lách kẹt xe',
      seats: 1,
      price: calcPrice(15000, 7500),
      eta: `${Math.max(1, baseEta - 3)} phút`,
      recommended: false,
      icon: 'bicycle',
      color: '#3B82F6',
    },
    {
      id: 'ev',
      name: 'Taxi điện Xanh (4 chỗ)',
      desc: 'VinFast VF e34 êm ái, bảo vệ môi trường',
      seats: 4,
      price: calcPrice(25000, 12500),
      eta: `${baseEta} phút`,
      recommended: true,
      icon: 'car-sport',
      color: '#10B981',
    },
    {
      id: 'car7',
      name: 'Taxi điện 7 chỗ (VF 9)',
      desc: 'Khoang rộng, phù hợp gia đình & hành lý',
      seats: 7,
      price: calcPrice(32000, 15000),
      eta: `${baseEta + 2} phút`,
      recommended: false,
      icon: 'car',
      color: '#8B5CF6',
    },
    {
      id: 'suv',
      name: 'Xe hơi Cao cấp (Sedan / SUV)',
      desc: 'Camry / Mercedes cho khách VIP',
      seats: 4,
      price: calcPrice(45000, 20000),
      eta: `${baseEta + 3} phút`,
      recommended: false,
      icon: 'shield-checkmark',
      color: '#EA580C',
    },
  ];

  const currentVehicleData = vehicles.find((v) => v.id === selectedVehicle) || vehicles[1];

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const mapPoints: MapPoint[] = [
    { lat: 21.028511, lng: 105.804817, label: 'Điểm đón của bạn', color: '#3B82F6' },
    {
      lat: params.dropLat ? parseFloat(params.dropLat) : 21.0028,
      lng: params.dropLng ? parseFloat(params.dropLng) : 105.8155,
      label: destinationName,
      color: '#EF4444',
    },
  ];

  const [isBooking, setIsBooking] = useState(false);

  const handleBookNow = async () => {
    if (isBooking) return;

    // 1. Kiểm tra trạng thái đăng nhập
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản để đặt chuyến xe.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => router.push('/') },
        ]
      );
      return;
    }

    setIsBooking(true);
    try {
      // Lấy thông tin người dùng từ storage
      const userStr = await AsyncStorage.getItem('currentUser').catch(() => null);
      const user = userStr ? JSON.parse(userStr) : null;

      const paymentMethod =
        selectedPayment.id === 'superpay' ? 'SUPERPAY' :
        selectedPayment.id === 'cash' ? 'CASH' :
        selectedPayment.id === 'qr' ? 'VIETQR' : 'CARD';

      // Gọi API đặt chuyến
      const trip = await createRideBooking({
        pickupAddress: locationName,
        pickupLat: 21.028511,
        pickupLng: 105.804817,
        dropoffAddress: destinationAddress,
        dropoffLat: params.dropLat ? parseFloat(params.dropLat) : 21.0028,
        dropoffLng: params.dropLng ? parseFloat(params.dropLng) : 105.8155,
        vehicleType: selectedVehicle,
        serviceType: 'RIDE',
        fareAmount: currentVehicleData.price,
        distanceKm: distance,
        paymentMethod,
        customerName: user?.fullName || 'Khách hàng V-Life',
        customerPhone: user?.phone || '0988000000',
      }, user?.id);

      // Lưu tripId vào storage để có thể resume nếu app bị tắt
      await AsyncStorage.setItem('@active_trip_id', trip.id);
      await AsyncStorage.setItem('@active_trip_data', JSON.stringify(trip));

      // Chuyển tới màn hình tracking với tripId thực
      router.push({
        pathname: '/ride/tracking',
        params: {
          tripId: trip.id,
          bookingCode: trip.bookingCode,
          vehicleName: currentVehicleData.name,
          price: trip.finalAmount.toString(),
          destinationName: destinationName,
          destinationAddress: destinationAddress,
          distanceKm: distance.toString(),
          paymentName: selectedPayment.name,
          paymentMethod: trip.paymentMethod,
          pickupLat: '21.028511',
          pickupLng: '105.804817',
          dropLat: params.dropLat || '21.0028',
          dropLng: params.dropLng || '105.8155',
        },
      });
    } catch (error: any) {
      console.error('[RideBooking] Lỗi tạo cuốc xe:', error);
      const isNetworkError = !error.response && error.request;
      if (isNetworkError) {
        Alert.alert(
          'Không thể kết nối máy chủ',
          'Máy chủ đang ngoại tuyến hoặc không có phản hồi. Vui lòng kiểm tra kết nối mạng (LAN/Wi-Fi) và thử lại sau.'
        );
      } else if (error.response?.status === 401) {
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.',
          [{ text: 'Đăng nhập lại', onPress: () => router.push('/') }]
        );
      } else {
        const rawMessage = error.response?.data?.message;
        const displayMsg = Array.isArray(rawMessage)
          ? rawMessage.join('\n')
          : (typeof rawMessage === 'string' && rawMessage.length > 0)
          ? rawMessage
          : 'Có lỗi xảy ra khi tạo chuyến xe trên hệ thống.';
        Alert.alert('Đặt chuyến thất bại', displayMsg);
      }
    } finally {
      setIsBooking(false);
    }
  };

  // Tên vị trí hiện tại (lấy từ params hoặc default)
  const locationName = '72 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội';
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/ride/search');
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Xác nhận chuyến xe</Text>
          <Text style={styles.headerSubTitle} numberOfLines={1}>
            Đến {destinationName} • {distance} km
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Vector Route Map */}
      <View style={styles.mapContainer}>
        <WebMap
          points={mapPoints}
          showRoute={true}
          routeColor="#10B981"
          height={230}
          zoom={14}
          showNearbyDrivers={true}
        />
      </View>

      {/* Booking Panel */}
      <View style={styles.bookingPanel}>
        {/* AI Recommendation Message */}
        <View style={styles.aiBubble}>
          <Ionicons name="sparkles" size={18} color="#D97706" style={{ marginRight: 10 }} />
          <Text style={styles.aiMessage}>
            AI đề xuất: Taxi điện VinFast là lựa chọn tốt nhất hiện nay (êm ái, xe sạch, chỉ cách bạn 2 phút đón).
          </Text>
        </View>

        <ScrollView style={styles.vehicleList} showsVerticalScrollIndicator={false}>
          {vehicles.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.vehicleItem,
                selectedVehicle === v.id && styles.vehicleItemSelected,
              ]}
              onPress={() => setSelectedVehicle(v.id)}
            >
              <View
                style={[
                  styles.vehicleIcon,
                  { backgroundColor: selectedVehicle === v.id ? '#D1FAE5' : '#F1F5F9' },
                ]}
              >
                <Ionicons
                  name={v.icon as any}
                  size={26}
                  color={selectedVehicle === v.id ? '#10B981' : '#475569'}
                />
              </View>

              <View style={styles.vehicleInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={[
                      styles.vehicleName,
                      selectedVehicle === v.id && { color: '#10B981' },
                    ]}
                  >
                    {v.name}
                  </Text>
                  <View style={styles.seatsBadge}>
                    <Ionicons name="person" size={10} color="#64748B" />
                    <Text style={styles.seatsText}>{v.seats}</Text>
                  </View>
                </View>
                <Text style={styles.vehicleDesc}>{v.desc}</Text>
                <Text style={styles.vehicleEta}>Đón sau ~{v.eta}</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text
                  style={[
                    styles.priceText,
                    selectedVehicle === v.id && { color: '#10B981' },
                  ]}
                >
                  {formatPrice(v.price)}
                </Text>
                {v.recommended && (
                  <View style={styles.recBadge}>
                    <Text style={styles.recommendedText}>Tối ưu nhất</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.paymentMethod}
            onPress={() => setShowPaymentModal(true)}
          >
            <Ionicons name={selectedPayment.icon as any} size={22} color={selectedPayment.color} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.paymentName}>{selectedPayment.name}</Text>
              <Text style={styles.paymentPromo}>{selectedPayment.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookButton, isBooking && { opacity: 0.7 }]}
            onPress={handleBookNow}
            disabled={isBooking}
          >
            {isBooking ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.bookButtonText}>
                Đặt {currentVehicleData.name} • {formatPrice(currentVehicleData.price)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Selection Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.bottomSheetModal}>
            <View style={styles.bsHeader}>
              <Text style={styles.bsTitle}>Phương thức thanh toán</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close-circle" size={26} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bsSub}>Chọn hình thức thanh toán cho chuyến đi này</Text>

            <ScrollView style={styles.paymentList} showsVerticalScrollIndicator={false}>
              {paymentMethods.map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  style={[
                    styles.paymentItem,
                    selectedPayment.id === pm.id && styles.paymentItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedPayment(pm);
                    setShowPaymentModal(false);
                  }}
                >
                  <View style={[styles.pmIconWrap, { backgroundColor: pm.color + '15' }]}>
                    <Ionicons name={pm.icon as any} size={22} color={pm.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pmName}>{pm.name}</Text>
                    <Text style={styles.pmDesc}>{pm.desc}</Text>
                  </View>
                  <Ionicons
                    name={selectedPayment.id === pm.id ? 'radio-button-on' : 'radio-button-off'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 10,
  },
  headerCenter: { alignItems: 'center' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerSubTitle: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '600' },

  mapContainer: { height: 230, position: 'relative' },

  bookingPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },

  aiBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  aiMessage: { color: '#B45309', fontSize: 12, fontWeight: '600', lineHeight: 18, flex: 1 },

  vehicleList: { padding: 16 },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleItemSelected: { backgroundColor: '#F0FDF4', borderColor: '#10B981' },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: { flex: 1, marginLeft: 12 },
  vehicleName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  vehicleDesc: { fontSize: 10, color: '#64748B', marginTop: 2 },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  seatsText: { fontSize: 10, color: '#475569', marginLeft: 2, fontWeight: '700' },
  vehicleEta: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: 2 },
  priceContainer: { alignItems: 'flex-end', marginLeft: 8 },
  priceText: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  recBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  recommendedText: { fontSize: 9, color: '#D97706', fontWeight: '800' },

  footer: {
    padding: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  paymentPromo: { fontSize: 11, color: '#10B981', fontWeight: '600' },
  bookButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  bookButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(15,23,42,0.65)', justifyContent: 'flex-end' },
  bottomSheetModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  bsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bsTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  bsSub: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  paymentList: { gap: 8 },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  paymentItemSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  pmIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pmName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  pmDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
});
