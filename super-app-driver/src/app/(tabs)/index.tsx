import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  Platform, Switch, ScrollView, Modal, TextInput, Image,
  Vibration, Linking, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebMap, { MapPoint } from '../../components/WebMap';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface ChatMessage {
  id: string;
  sender: 'driver' | 'user';
  text: string;
  time: string;
}

export default function DriverHome() {
  const [isOnline, setIsOnline] = useState(false);
  const [services, setServices] = useState({
    ride: true,
    delivery: true,
    food: false,
  });

  const toggleService = (key: keyof typeof services) => {
    setServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dispatch Matching State
  const [matchingOrder, setMatchingOrder] = useState<any>(null);
  const [orderCountdown, setOrderCountdown] = useState<number>(20);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [tripStep, setTripStep] = useState<number>(0); // 1 = Arriving, 2 = Arrived, 3 = In Trip, 4 = Payment & Rating

  // Passenger Rating Modal State
  const [passengerRating, setPassengerRating] = useState(5);
  const [passengerReview, setPassengerReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Đúng giờ', 'Lịch sự']);

  // Chat with Passenger Modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'user', text: 'Chào anh tài xế, em đang đứng ở sảnh A nhé!', time: 'Vừa xong' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Audio Chime Synthesizer
  const playIncomingOrderSound = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {}
  };

  // Google Maps Deep-link Navigation
  const openGoogleMaps = (destinationAddress: string, lat?: number, lng?: number) => {
    const query = lat && lng ? `${lat},${lng}` : encodeURIComponent(destinationAddress);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      if (typeof window !== 'undefined') window.open(url, '_blank');
    });
  };

  // Call Passenger
  const callPassenger = (phone: string = '0988123456') => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Gọi khách hàng', `Số điện thoại: ${phone}`);
    });
  };

  // Auto dispatch order when Online
  useEffect(() => {
    let timer: any;
    if (isOnline && !matchingOrder && !activeTrip) {
      timer = setTimeout(() => {
        const orderTypes = ['passenger', 'delivery', 'food'];
        const randomType = orderTypes[Math.floor(Math.random() * orderTypes.length)];

        if (randomType === 'passenger') {
          setMatchingOrder({
            id: 'ORD-8899',
            bookingCode: '#VR-8899',
            type: 'passenger',
            title: 'Chở khách V-Ride',
            pickup: 'Vincom Mega Mall Royal City, Thanh Xuân',
            dropoff: 'Keangnam Landmark 72, Mễ Trì',
            pickupLat: 21.0028,
            pickupLng: 105.8155,
            dropoffLat: 21.0168,
            dropoffLng: 105.7838,
            distance: '4.8 km',
            eta: '12 phút',
            price: 65000,
            tip: 10000,
            deal: 0,
            paymentMethod: 'CASH', // THU TIỀN MẶT
            customerName: 'Hoàng Minh Tuấn',
            customerPhone: '0988123456',
            customerRating: 4.9,
          });
        } else if (randomType === 'delivery') {
          setMatchingOrder({
            id: 'ORD-9901',
            bookingCode: '#DL-9901',
            type: 'delivery',
            title: 'Giao hàng Siêu Tốc V-Express',
            pickup: '18 Duy Tân, Cầu Giấy',
            dropoff: 'Tòa nhà Landmark 81 Trung Hòa',
            pickupLat: 21.0322,
            pickupLng: 105.7801,
            dropoffLat: 21.0090,
            dropoffLng: 105.8010,
            distance: '3.6 km',
            eta: '10 phút',
            price: 45000,
            tip: 5000,
            deal: 0,
            paymentMethod: 'ONLINE', // ĐÃ THANH TOÁN VÍ
            customerName: 'Chị Mai Linh',
            customerPhone: '0912345678',
            customerRating: 5.0,
          });
        } else {
          setMatchingOrder({
            id: 'ORD-7711',
            bookingCode: '#FD-7711',
            type: 'food',
            title: 'Giao đồ ăn (Cơm tấm sườn)',
            pickup: 'Cơm tấm Sài Gòn, 45 Nguyễn Trãi',
            dropoff: 'Chung cư Golden Land, 275 Nguyễn Trãi',
            pickupLat: 21.0023,
            pickupLng: 105.8152,
            dropoffLat: 20.9995,
            dropoffLng: 105.8105,
            distance: '1.5 km',
            eta: '6 phút',
            price: 25000,
            tip: 5000,
            deal: 0,
            paymentMethod: 'CASH',
            customerName: 'Anh Quang',
            customerPhone: '0977889900',
            customerRating: 4.8,
          });
        }
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isOnline, matchingOrder, activeTrip]);

  // Countdown timer for incoming order (20s) with Sound & Vibration
  useEffect(() => {
    let interval: any;
    if (matchingOrder) {
      setOrderCountdown(20);
      playIncomingOrderSound();
      try { Vibration.vibrate([0, 400, 200, 400]); } catch (e) {}

      interval = setInterval(() => {
        setOrderCountdown((prev) => {
          if (prev <= 1) {
            setMatchingOrder(null);
            return 20;
          }
          if (prev % 3 === 0) {
            playIncomingOrderSound();
            try { Vibration.vibrate([0, 250, 100, 250]); } catch (e) {}
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchingOrder]);

  const handleAcceptOrder = () => {
    setActiveTrip(matchingOrder);
    setMatchingOrder(null);
    setTripStep(1); // 1 = Go to pickup
  };

  const handleRejectOrder = () => {
    setMatchingOrder(null);
  };

  const handleAdvanceTrip = () => {
    if (!activeTrip) return;
    if (tripStep === 1) {
      setTripStep(2); // Arrived at pickup
    } else if (tripStep === 2) {
      setTripStep(3); // Start ride -> In Trip
    } else if (tripStep === 3) {
      setTripStep(4); // Trip ended -> Show Payment Settlement & Rating
    }
  };

  const handleFinishTrip = () => {
    Alert.alert('Thành công', 'Cuốc xe đã kết thúc hoàn hảo. Doanh thu đã được đối soát vào ví!');
    setActiveTrip(null);
    setTripStep(0);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'driver',
      text: chatInput.trim(),
      time: 'Vừa xong',
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const mapPoints: MapPoint[] = activeTrip
    ? [
        { lat: activeTrip.pickupLat || 21.0285, lng: activeTrip.pickupLng || 105.8048, label: activeTrip.pickup, color: '#3B82F6', icon: 'pin' },
        { lat: activeTrip.dropoffLat || 21.0028, lng: activeTrip.dropoffLng || 105.8155, label: activeTrip.dropoff, color: '#EF4444', icon: 'flag' },
      ]
    : [
        { lat: 21.028511, lng: 105.804817, label: 'Vị trí xe của bạn', color: '#10B981', icon: 'car' },
        { lat: 21.038511, lng: 105.814817, label: 'Khu vực nóng: Cầu Giấy 🔥', color: '#EF4444' },
      ];

  const totalFare = activeTrip ? (activeTrip.price + activeTrip.deal + activeTrip.tip) : 0;
  const platformCommission = Math.round((activeTrip?.price || 0) * 0.1);
  const netEarnings = totalFare - (activeTrip?.paymentMethod === 'CASH' ? platformCommission : 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Vector Map */}
      <View style={styles.mapContainer}>
        <WebMap
          points={mapPoints}
          showRoute={activeTrip ? true : false}
          routeColor="#10B981"
          height={650}
          zoom={14}
        />
      </View>

      {/* Top Overlay: Header & Metrics */}
      <View style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.headerRow}>
          <View style={styles.driverInfoCard}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatarMini} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.driverName}>Trần Bình</Text>
              <Text style={styles.driverRating}>⭐ 4.95 • Kim Cương</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.statusPill, isOnline ? styles.statusOnline : styles.statusOffline]}
            onPress={() => setIsOnline(!isOnline)}
            activeOpacity={0.8}
          >
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
            <Text style={[styles.statusText, isOnline ? { color: '#059669' } : { color: '#475569' }]}>
              {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              pointerEvents="none"
              trackColor={{ false: '#CBD5E1', true: '#34D399' }}
              thumbColor={isOnline ? '#ffffff' : '#f4f3f4'}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>

        {isOnline && !activeTrip && (
          <Animated.View entering={FadeIn} style={styles.dashboardCard}>
            <View style={styles.dashStat}>
              <Text style={styles.dashLabel}>Thu nhập (VNĐ)</Text>
              <Text style={styles.dashValue}>850.000</Text>
            </View>
            <View style={styles.dashDivider} />
            <View style={styles.dashStat}>
              <Text style={styles.dashLabel}>Chuyến hôm nay</Text>
              <Text style={styles.dashValue}>12</Text>
            </View>
            <View style={styles.dashDivider} />
            <View style={styles.dashStat}>
              <Text style={styles.dashLabel}>Tỷ lệ nhận</Text>
              <Text style={[styles.dashValue, { color: '#10B981' }]}>98%</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Bottom Overlay: Incoming Order OR Active Trip OR Services */}
      <View style={styles.bottomOverlay} pointerEvents="box-none">
        
        {/* 1. POPUP NHẬN CUỐC XE (Incoming Order) */}
        {matchingOrder && (
          <Animated.View entering={SlideInDown} style={styles.dispatchCard}>
            <View style={styles.dispHeader}>
              <View style={styles.dispBadge}>
                <Ionicons name="car-sport" size={18} color="#0F172A" />
                <Text style={styles.dispBadgeText}>{matchingOrder.title}</Text>
              </View>
              <View style={styles.countdownBadge}>
                <Ionicons name="timer-outline" size={15} color="#DC2626" />
                <Text style={styles.countdownText}>Còn {orderCountdown}s</Text>
              </View>
            </View>

            {/* Payment Method Badge */}
            <View style={[
              styles.payTypeBanner,
              matchingOrder.paymentMethod === 'ONLINE' ? styles.payTypeBannerOnline : styles.payTypeBannerCash
            ]}>
              <Ionicons
                name={matchingOrder.paymentMethod === 'ONLINE' ? 'shield-checkmark' : 'cash'}
                size={16}
                color={matchingOrder.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444'}
              />
              <Text style={[
                styles.payTypeBannerText,
                { color: matchingOrder.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444' }
              ]}>
                {matchingOrder.paymentMethod === 'ONLINE'
                  ? 'ĐÃ THANH TOÁN VÍ ONLINE (KHÔNG THU TIỀN KHÁCH)'
                  : 'THU TIỀN MẶT KHI TRẢ KHÁCH (COD)'}
              </Text>
            </View>

            <View style={styles.routeBox}>
              <Text style={styles.pointText} numberOfLines={1}>🟢 Đón: {matchingOrder.pickup}</Text>
              <Text style={styles.pointText} numberOfLines={1}>🔴 Trả: {matchingOrder.dropoff}</Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{matchingOrder.distance}</Text>
                <Text style={styles.metricLbl}>Cự ly</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{matchingOrder.eta}</Text>
                <Text style={styles.metricLbl}>Dự kiến</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricVal, { color: '#10B981' }]}>
                  {(matchingOrder.price + matchingOrder.tip).toLocaleString()}đ
                </Text>
                <Text style={styles.metricLbl}>Cước nhận</Text>
              </View>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.rejectBtn} onPress={handleRejectOrder}>
                <Text style={styles.rejectBtnText}>Bỏ qua</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptOrder}>
                <Text style={styles.acceptBtnText}>NHẬN CHUYẾN ({orderCountdown}s)</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* 2. MÀN HÌNH HÀNH TRÌNH CUỐC XE (Active Trip) */}
        {activeTrip && tripStep < 4 && (
          <Animated.View entering={SlideInDown} style={styles.activeTripCard}>
            <View style={styles.activeHeader}>
              <View>
                <Text style={styles.tripStepTitle}>
                  {tripStep === 1 && '1. Đang đến điểm đón khách'}
                  {tripStep === 2 && '2. Đã tới điểm đón (Chờ khách)'}
                  {tripStep === 3 && '3. Đang trên chuyến đi'}
                </Text>
                <Text style={styles.passengerSubtitle}>
                  Khách: {activeTrip.customerName} ({activeTrip.customerRating}★)
                </Text>
              </View>
              <Text style={styles.tripFareText}>{totalFare.toLocaleString()}đ</Text>
            </View>

            <Text style={styles.currentDestination}>
              📍 {tripStep <= 2 ? `Điểm đón: ${activeTrip.pickup}` : `Điểm trả: ${activeTrip.dropoff}`}
            </Text>

            {/* Zero-Dispute Payment Warning Banner */}
            <View style={[
              styles.paymentEnforcementBanner,
              activeTrip.paymentMethod === 'ONLINE' ? styles.payOnlineBanner : styles.payCashBanner
            ]}>
              <Ionicons
                name={activeTrip.paymentMethod === 'ONLINE' ? 'shield-checkmark' : 'cash'}
                size={22}
                color={activeTrip.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444'}
              />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[
                  styles.paymentBannerTitle,
                  { color: activeTrip.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444' }
                ]}>
                  {activeTrip.paymentMethod === 'ONLINE'
                    ? 'KHÁCH ĐÃ TRẢ VÍ (0Đ) - KHÔNG THU TIỀN MẶT'
                    : `THU TIỀN MẶT: ${totalFare.toLocaleString()}đ`}
                </Text>
                <Text style={styles.paymentBannerDesc}>
                  {activeTrip.paymentMethod === 'ONLINE'
                    ? 'Tiền cước đã được tự động cộng vào ví tài xế'
                    : 'Tài xế nhận đủ tiền mặt từ khách khi kết thúc chuyến'}
                </Text>
              </View>
            </View>

            {/* Action Tools: Google Maps, Phone, Chat */}
            <View style={styles.tripToolsRow}>
              <TouchableOpacity
                style={styles.googleMapsBtn}
                onPress={() => openGoogleMaps(tripStep <= 2 ? activeTrip.pickup : activeTrip.dropoff)}
              >
                <Ionicons name="navigate-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.googleMapsText}>Google Maps Chỉ đường</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleToolBtn}
                onPress={() => callPassenger(activeTrip.customerPhone)}
              >
                <Ionicons name="call" size={20} color="#10B981" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleToolBtn}
                onPress={() => setShowChatModal(true)}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            {/* Main Stage Advance Button */}
            <TouchableOpacity style={styles.advanceStageBtn} onPress={handleAdvanceTrip}>
              <Text style={styles.advanceStageText}>
                {tripStep === 1 && 'TÔI ĐÃ ĐẾN NƠI ĐÓN 📍'}
                {tripStep === 2 && 'KHÁCH ĐÃ LÊN XE (BẮT ĐẦU CHUYẾN) 🚗'}
                {tripStep === 3 && 'ĐÃ ĐẾN NƠI (KẾT THÚC CHUYẾN ĐI) 🏁'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* 3. MÀN HÌNH THU TIỀN & ĐÁNH GIÁ (Trip Step 4) */}
        {activeTrip && tripStep === 4 && (
          <Animated.View entering={SlideInDown} style={styles.settlementCard}>
            <View style={styles.successCheck}>
              <Ionicons name="checkmark-circle" size={52} color="#10B981" />
              <Text style={styles.settlementTitle}>Chuyến đi hoàn thành!</Text>
              <Text style={styles.settlementSub}>Mã cuốc: {activeTrip.bookingCode}</Text>
            </View>

            {/* Large Payment Badge */}
            <View style={[
              styles.settlementBanner,
              activeTrip.paymentMethod === 'ONLINE' ? styles.payOnlineBanner : styles.payCashBanner
            ]}>
              <Text style={[
                styles.settlementBannerText,
                { color: activeTrip.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444' }
              ]}>
                {activeTrip.paymentMethod === 'ONLINE'
                  ? '🟢 ĐÃ THANH TOÁN ONLINE (0đ) - KHÔNG THU TIỀN KHÁCH'
                  : `💰 THU TIỀN MẶT TỪ KHÁCH: ${totalFare.toLocaleString()}đ`}
              </Text>
            </View>

            {/* Fare Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakRow}>
                <Text style={styles.breakLbl}>Cước cuốc xe</Text>
                <Text style={styles.breakVal}>{activeTrip.price.toLocaleString()}đ</Text>
              </View>
              {activeTrip.tip > 0 && (
                <View style={styles.breakRow}>
                  <Text style={styles.breakLbl}>Tiền Tip thưởng thêm</Text>
                  <Text style={[styles.breakVal, { color: '#10B981' }]}>+{activeTrip.tip.toLocaleString()}đ</Text>
                </View>
              )}
              <View style={styles.breakRow}>
                <Text style={styles.breakLbl}>Phí nền tảng (10%)</Text>
                <Text style={[styles.breakVal, { color: '#EF4444' }]}>-{platformCommission.toLocaleString()}đ</Text>
              </View>
              <View style={styles.breakDivider} />
              <View style={styles.breakRow}>
                <Text style={styles.breakTotalLbl}>Tài xế thực nhận</Text>
                <Text style={styles.breakTotalVal}>{netEarnings.toLocaleString()}đ</Text>
              </View>
            </View>

            {/* Passenger Rating */}
            <Text style={styles.ratePassengerLbl}>Đánh giá hành khách:</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setPassengerRating(s)}>
                  <Ionicons
                    name={s <= passengerRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.completeAllBtn} onPress={handleFinishTrip}>
              <Text style={styles.completeAllText}>XÁC NHẬN HOÀN TẤT & VỀ TRANG CHỦ</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* 4. DEFAULT SERVICES PANEL (When idle) */}
        {!matchingOrder && !activeTrip && (
          <View style={styles.servicesPanel}>
            <Text style={styles.panelTitle}>Dịch vụ đang nhận</Text>
            
            <TouchableOpacity style={styles.serviceRow} onPress={() => toggleService('ride')} activeOpacity={0.8}>
              <View style={[styles.serviceIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="car" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.serviceName}>Chở khách (V-Ride)</Text>
              <Switch value={services.ride} pointerEvents="none" onValueChange={() => toggleService('ride')} trackColor={{ true: '#3B82F6' }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceRow} onPress={() => toggleService('delivery')} activeOpacity={0.8}>
              <View style={[styles.serviceIcon, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="cube" size={24} color="#F97316" />
              </View>
              <Text style={styles.serviceName}>Giao hàng Siêu Tốc</Text>
              <Switch value={services.delivery} pointerEvents="none" onValueChange={() => toggleService('delivery')} trackColor={{ true: '#F97316' }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceRow} onPress={() => toggleService('food')} activeOpacity={0.8}>
              <View style={[styles.serviceIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="fast-food" size={24} color="#EF4444" />
              </View>
              <Text style={styles.serviceName}>Giao đồ ăn (V-Food)</Text>
              <Switch value={services.food} pointerEvents="none" onValueChange={() => toggleService('food')} trackColor={{ true: '#EF4444' }} />
            </TouchableOpacity>
          </View>
        )}

      </View>

      {/* CHAT MODAL WITH PASSENGER */}
      <Modal visible={showChatModal} animationType="slide" onRequestClose={() => setShowChatModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.modalHeaderBar}>
            <TouchableOpacity onPress={() => setShowChatModal(false)}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Chat với {activeTrip?.customerName || 'Khách hàng'}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {chatMessages.map(m => (
              <View key={m.id} style={[styles.chatBubble, m.sender === 'driver' ? styles.chatBubbleDriver : styles.chatBubbleUser]}>
                <Text style={[styles.chatText, m.sender === 'driver' && { color: '#FFF' }]}>{m.text}</Text>
                <Text style={styles.chatTime}>{m.time}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Quick Chat Chips */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 6 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['Tôi đã đến điểm đón', 'Tôi bật đèn xi nhan rồi nhé', 'Bạn ra chưa ạ?'].map(chip => (
                <TouchableOpacity
                  key={chip}
                  style={styles.chatChip}
                  onPress={() => {
                    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'driver', text: chip, time: 'Vừa xong' }]);
                  }}
                >
                  <Text style={styles.chatChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage}>
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  
  topOverlay: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 20, left: 16, right: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverInfoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  avatarMini: { width: 36, height: 36, borderRadius: 18 },
  driverName: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  driverRating: { fontSize: 11, color: '#D97706', fontWeight: '600' },
  
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  statusOnline: { borderWidth: 2, borderColor: '#10B981' },
  statusOffline: { borderWidth: 2, borderColor: '#CBD5E1' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  
  dashboardCard: { backgroundColor: '#0F172A', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 14, borderRadius: 16, marginTop: 12, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 },
  dashStat: { alignItems: 'center' },
  dashLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  dashValue: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  dashDivider: { width: 1, height: 26, backgroundColor: '#334155' },
  
  bottomOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  
  // Dispatch Incoming Card
  dispatchCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, elevation: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  dispHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dispBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dispBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#B45309', marginLeft: 6 },
  countdownBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  countdownText: { fontSize: 13, fontWeight: 'bold', color: '#DC2626', marginLeft: 4 },
  
  payTypeBanner: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, marginVertical: 6 },
  payTypeBannerOnline: { backgroundColor: '#D1FAE5' },
  payTypeBannerCash: { backgroundColor: '#FEE2E2' },
  payTypeBannerText: { fontSize: 11, fontWeight: 'bold', marginLeft: 6 },

  routeBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12, marginVertical: 8 },
  pointText: { fontSize: 13, color: '#1E293B', fontWeight: '500', marginVertical: 2 },
  
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 8 },
  metricItem: { alignItems: 'center' },
  metricVal: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  metricLbl: { fontSize: 11, color: '#64748B', marginTop: 2 },

  actionButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  rejectBtn: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  rejectBtnText: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  acceptBtn: { flex: 2, backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 14, alignItems: 'center', elevation: 4 },
  acceptBtnText: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },

  // Active Trip Card
  activeTripCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, elevation: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripStepTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  passengerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  tripFareText: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },
  currentDestination: { fontSize: 13, color: '#334155', fontWeight: '600', marginVertical: 10 },

  paymentEnforcementBanner: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 12, borderWidth: 1.5 },
  payOnlineBanner: { backgroundColor: '#F0FDF4', borderColor: '#10B981' },
  payCashBanner: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  paymentBannerTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.2 },
  paymentBannerDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },

  tripToolsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  googleMapsBtn: { flex: 1, backgroundColor: '#1E293B', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
  googleMapsText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  circleToolBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  advanceStageBtn: { width: '100%', backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 14, alignItems: 'center', elevation: 4 },
  advanceStageText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  // Settlement Card
  settlementCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20 },
  successCheck: { alignItems: 'center', marginBottom: 12 },
  settlementTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginTop: 6 },
  settlementSub: { fontSize: 12, color: '#64748B' },
  settlementBanner: { padding: 10, borderRadius: 12, alignItems: 'center', marginVertical: 10, borderWidth: 1 },
  settlementBannerText: { fontSize: 13, fontWeight: 'bold' },
  breakdownCard: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 14, marginVertical: 10 },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  breakLbl: { fontSize: 12, color: '#64748B' },
  breakVal: { fontSize: 13, color: '#0F172A', fontWeight: '600' },
  breakDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 6 },
  breakTotalLbl: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  breakTotalVal: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  ratePassengerLbl: { fontSize: 13, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginTop: 6 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  completeAllBtn: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  completeAllText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  // Idle Services Panel
  servicesPanel: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  panelTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 14 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  serviceIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  serviceName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0F172A' },

  // Chat Modal
  modalHeaderBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  chatBubble: { padding: 10, borderRadius: 14, maxWidth: '80%', marginVertical: 4 },
  chatBubbleDriver: { backgroundColor: '#10B981', alignSelf: 'flex-end' },
  chatBubbleUser: { backgroundColor: '#E2E8F0', alignSelf: 'flex-start' },
  chatText: { fontSize: 13, color: '#0F172A' },
  chatTime: { fontSize: 10, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
  chatChip: { backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  chatChipText: { fontSize: 12, color: '#334155' },
  chatInputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center' },
  chatTextInput: { flex: 1, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 14, fontSize: 13, marginRight: 8 },
  chatSendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
});
