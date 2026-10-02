import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebMap from '../../components/WebMap';
import Animated, {
  FadeIn,
  SlideInUp,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import rideSocketService, { TripStatusUpdatePayload, DriverLocationPayload } from '../../services/rideSocketService';
import { cancelTrip, rateDriver, getTripById } from '../../modules/ride/services/realRideService';


interface ChatMessage {
  id: string;
  sender: 'driver' | 'user';
  text: string;
  time: string;
}

export default function RideTracking() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tripId?: string;
    bookingCode?: string;
    vehicleName?: string;
    price?: string;
    destinationName?: string;
    destinationAddress?: string;
    distanceKm?: string;
    paymentName?: string;
    paymentMethod?: string;
    pickupLat?: string;
    pickupLng?: string;
    dropLat?: string;
    dropLng?: string;
    isDemo?: string;
  }>();

  const tripId = params.tripId;
  const isDemo = params.isDemo === 'true' || !tripId || tripId.startsWith('DEMO-');

  const destinationName = params.destinationName || 'Royal City';
  const destinationAddress =
    params.destinationAddress || '72A Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội';
  const distanceKm = params.distanceKm || '4.8';
  const vehicleName = params.vehicleName || 'Taxi điện Xanh (VF 8)';
  const paymentName = params.paymentName || 'Ví SuperPay';

  // Trip State Machine:
  // 'searching' -> 'assigned' -> 'driving' -> 'completed'
  const [tripState, setTripState] = useState<'searching' | 'assigned' | 'driving' | 'completed'>(
    'searching'
  );
  const [simulatedTime, setSimulatedTime] = useState(0);
  const [isPriority, setIsPriority] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);

  // Real driver info from server
  const [assignedDriver, setAssignedDriver] = useState<{
    name: string; phone: string; vehicle: string; plate: string; avatar: string; rating: number;
  } | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Auto-play / Simulation toggle (bật khi demo, tắt khi có real socket)
  const [autoPlay, setAutoPlay] = useState(isDemo);

  // Modals
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDealSheet, setShowDealSheet] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Call state
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'driver',
      text: 'Chào bạn, tôi đã nhận chuyến và đang trên đường đến điểm đón nhé!',
      time: 'Vừa xong',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Rating state
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Lái xe an toàn', 'Đúng giờ']);
  const [ratingTip, setRatingTip] = useState(10000);
  const [ratingComment, setRatingComment] = useState('');

  const [selectedTip, setSelectedTip] = useState(10000);
  const [showDetourAlert, setShowDetourAlert] = useState(true);

  // Radar Animation
  const radarScale = useSharedValue(1);
  const radarOpacity = useSharedValue(1);

  useEffect(() => {
    radarScale.value = withRepeat(withTiming(2.2, { duration: 1500 }), -1, false);
    radarOpacity.value = withRepeat(withTiming(0, { duration: 1500 }), -1, false);
  }, []);

  const animatedRadar = useAnimatedStyle(() => ({
    transform: [{ scale: radarScale.value }],
    opacity: radarOpacity.value,
  }));

  // ─────────────────────────────────────────
  // REAL-TIME: Kết nối WebSocket nhận cập nhật trip
  // ─────────────────────────────────────────
  useEffect(() => {
    if (isDemo || !tripId) {
      // Chế độ demo: không kết nối socket
      return;
    }

    // Kết nối socket và tham gia phòng trip
    rideSocketService.connect('customer');
    rideSocketService.joinTripRoom(tripId);
    setSocketConnected(rideSocketService.isConnected);

    // Nhận cập nhật trạng thái trip từ server
    const unsubStatus = rideSocketService.onTripStatusUpdated((data: TripStatusUpdatePayload) => {
      if (data.tripId !== tripId) return;

      switch (data.status) {
        case 'ACCEPTED':
          setTripState('assigned');
          setAutoPlay(false); // Dừng simulation khi có driver thực
          if (data.driverName) {
            setAssignedDriver({
              name: data.driverName,
              phone: data.driverPhone || '0988123456',
              vehicle: data.vehicleName || 'VinFast VF 8',
              plate: data.licensePlate || '29A-999.88',
              avatar: data.avatarUrl || 'https://i.pravatar.cc/150?img=60',
              rating: data.driverRating || 4.95,
            });
          }
          break;
        case 'ARRIVED_PICKUP':
          setTripState('assigned');
          break;
        case 'IN_TRIP':
          setTripState('driving');
          break;
        case 'COMPLETED':
          setTripState('completed');
          setTimeout(() => setShowRatingModal(true), 800);
          // Xóa tripId khỏi storage
          AsyncStorage.removeItem('@active_trip_id').catch(() => {});
          break;
        case 'CANCELLED':
          Alert.alert(
            'Chuyến xe đã bị hủy',
            data.cancelReason || 'Tài xế đã hủy chuyến. Chúng tôi sẽ tìm tài xế khác cho bạn.',
            [{ text: 'OK', onPress: () => router.replace('/transport') }]
          );
          break;
      }
    });

    // Nhận cập nhật vị trí tài xế realtime
    const unsubLocation = rideSocketService.onDriverLocationUpdate((data: DriverLocationPayload) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    // Track connection state
    const unsubConn = rideSocketService.onConnectionChange(setSocketConnected);

    // Cleanup khi unmount
    return () => {
      unsubStatus();
      unsubLocation();
      unsubConn();
      rideSocketService.disconnect();
    };
  }, [tripId, isDemo]);

  // Auto-progression flow (End-to-End Simulation)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (autoPlay) {
      if (tripState === 'searching') {
        // Find driver after 3.5s
        timer = setTimeout(() => {
          setTripState('assigned');
        }, 3500);
      } else if (tripState === 'assigned') {
        // Driver arrives and trip starts after 6s
        timer = setTimeout(() => {
          setTripState('driving');
        }, 6000);
      } else if (tripState === 'driving') {
        // Trip completes after 7s
        timer = setTimeout(() => {
          setTripState('completed');
          // Auto open rating sheet after 800ms
          setTimeout(() => {
            setShowRatingModal(true);
          }, 800);
        }, 7000);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [tripState, autoPlay]);

  // Call timer simulation
  useEffect(() => {
    if (showCallModal) {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [showCallModal]);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const basePrice = params.price ? parseInt(params.price, 10) : 65000;
  const originalTotal = basePrice;
  const finalTotal = Math.max(0, originalTotal + tipAmount - 15000);

  const handleConfirmTip = () => {
    setTipAmount(selectedTip);
    setIsPriority(true);
    setShowDealSheet(false);
  };

  // Chat send message
  const handleSendMessage = (textToSend?: string) => {
    const msg = textToSend || inputMessage.trim();
    if (!msg) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: msg,
      time: 'Vừa xong',
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Driver auto reply after 1.5s
    setTimeout(() => {
      const driverReplies = [
        'Dạ vâng tôi thấy bạn rồi, tôi đang tấp vào lề đây!',
        'Dạ vâng tôi đang bật đèn xi nhan, bạn thấy xe chưa ạ?',
        'Vâng bạn chờ tôi 30 giây nhé, đang qua ngã tư.',
      ];
      const randomReply = driverReplies[Math.floor(Math.random() * driverReplies.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'driver',
          text: randomReply,
          time: 'Vừa xong',
        },
      ]);
    }, 1500);
  };

  // Toggle feedback tags
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Confirm rating and save trip to history
  const handleConfirmRating = async () => {
    setShowRatingModal(false);

    // Gọi API lưu đánh giá thực (nếu không phải demo)
    if (!isDemo && tripId) {
      try {
        await rateDriver(tripId, rating, ratingComment, selectedTags, ratingTip > 0 ? ratingTip : undefined);
      } catch (e) {
        // Lỗi API đánh giá không nghiêm trọng, vẫn tiếp tục
      }
    }

    // Lưu vào AsyncStorage history
    try {
      const completedTrip = {
        id: tripId || `TRIP-${Date.now()}`,
        destinationName,
        destinationAddress,
        distanceKm,
        vehicleName,
        price: finalTotal,
        paymentName,
        rating,
        date: new Date().toLocaleDateString('vi-VN'),
        driver: assignedDriver?.name || 'Nguyễn Văn Hùng',
        plate: assignedDriver?.plate || '29A-999.88',
      };

      const existingData = await AsyncStorage.getItem('@recent_rides');
      const list = existingData ? JSON.parse(existingData) : [];
      list.unshift(completedTrip);
      await AsyncStorage.setItem('@recent_rides', JSON.stringify(list.slice(0, 10)));
      await AsyncStorage.removeItem('@active_trip_id');
      await AsyncStorage.removeItem('@active_trip_data');
    } catch (e) {}

    Alert.alert(
      'Hoàn tất chuyến đi 🎉',
      `Cảm ơn bạn đã đánh giá ${rating} sao cho tài xế ${assignedDriver?.name || 'Nguyễn Văn Hùng'}!\nTổng thanh toán: ${finalTotal.toLocaleString('vi-VN')}đ\nCuốc xe đã kết thúc an toàn.`,
      [{ text: 'Về trang Vận chuyển', onPress: () => router.replace('/transport') }]
    );
  };

  // Cancellation handler
  const handleConfirmCancel = async () => {
    setShowCancelModal(false);

    // Gọi API hủy chuyến thực (nếu không phải demo)
    if (!isDemo && tripId) {
      try {
        await cancelTrip(tripId, 'Khách hủy chuyến', 'customer');
      } catch (e) {
        // Lỗi API không ngăn user khỏi ứng dụng
      }
    }

    // Xóa trip khỏi storage
    await AsyncStorage.removeItem('@active_trip_id').catch(() => {});
    await AsyncStorage.removeItem('@active_trip_data').catch(() => {});

    Alert.alert('Đã hủy chuyến', 'Cuốc xe của bạn đã được hủy thành công. Không phát sinh chi phí.', [
      { text: 'Đồng ý', onPress: () => router.replace('/transport') },
    ]);
  };

  // Map markers depending on state (dùng real driver GPS nếu có)
  const getMapPoints = () => {
    const driverLat = driverLocation?.lat || 21.024511;
    const driverLng = driverLocation?.lng || 21.800817;
    const driverLabel = `Tài xế ${assignedDriver?.name || 'đang đến'}`;

    if (tripState === 'searching') {
      return [
        { lat: 21.028511, lng: 105.804817, label: 'Điểm đón của bạn', color: '#3B82F6' },
        { lat: 21.0028, lng: 105.8155, label: `Điểm đến (${destinationName})`, color: '#EF4444' },
      ];
    } else if (tripState === 'assigned') {
      return [
        { lat: 21.028511, lng: 105.804817, label: 'Điểm đón của bạn', color: '#3B82F6' },
        { lat: driverLat, lng: driverLng || 105.800817, label: driverLabel, color: '#10B981' },
      ];
    } else {
      return [
        { lat: 21.018511, lng: 105.808817, label: 'Đang di chuyển', color: '#10B981' },
        { lat: 21.0028, lng: 105.8155, label: `Điểm đến (${destinationName})`, color: '#EF4444' },
      ];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Map Area */}
      <View style={styles.mapContainer}>
        <WebMap
          points={getMapPoints()}
          showRoute={true}
          routeColor={tripState === 'driving' ? '#10B981' : '#3B82F6'}
          height={320}
          zoom={14}
        />
      </View>

      {/* 2. Floating Header */}
      <View style={styles.headerFloating} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (tripState === 'completed') {
              router.replace('/transport');
            } else {
              setShowCancelModal(true);
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.tripHeaderInfo}>
          <View style={styles.locations}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.locText} numberOfLines={1}>
                Vị trí của bạn
              </Text>
            </View>
            <Ionicons
              name="arrow-down"
              size={12}
              color="#94A3B8"
              style={{ marginLeft: 3, marginVertical: 2 }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.locText} numberOfLines={1}>
                {destinationName}
              </Text>
            </View>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
      </View>

      {/* 3. Safety SOS button */}
      {['assigned', 'driving'].includes(tripState) && (
        <TouchableOpacity style={styles.safetyFloatingBtn} onPress={() => setShowSafetyModal(true)}>
          <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.safetyFloatingText}>An toàn SOS</Text>
        </TouchableOpacity>
      )}

      {/* 4. Detour AI Alert during driving */}
      {tripState === 'driving' && showDetourAlert && (
        <Animated.View entering={SlideInDown} style={styles.detourAlert}>
          <View style={styles.detourHeader}>
            <Ionicons name="warning" size={18} color="#D97706" />
            <Text style={styles.detourTitle}>AI Tối ưu Lộ trình</Text>
            <TouchableOpacity onPress={() => setShowDetourAlert(false)} style={styles.detourClose}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.detourText}>
            Phía trước đường Nguyễn Trãi đang đông xe. AI đã gợi ý tài xế đi tuyến đường gom để tiết kiệm
            8 phút di chuyển.
          </Text>
        </Animated.View>
      )}

      {/* 5. Main Bottom Panel */}
      <View style={[styles.panel, isPriority && styles.panelPriority]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {/* STATE 1: SEARCHING */}
          {tripState === 'searching' && (
            <Animated.View entering={FadeIn} style={styles.stateContainer}>
              <View style={styles.radarContainer}>
                <Animated.View style={[styles.radarCircle, animatedRadar]} />
                <View style={styles.radarCenter} />
              </View>
              <Text style={styles.findingTitle}>Đang kết nối tài xế gần bạn...</Text>
              <Text style={styles.findingSub}>
                ⏱ Đang tìm xe {vehicleName} trong bán kính 2km
              </Text>

              <View style={styles.aiFooter}>
                <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                <Text style={styles.aiFooterText}>AI đang định tuyến tài xế có đánh giá 4.9★</Text>
              </View>

              <View style={styles.buttonActionGroup}>
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={() => setTripState('assigned')}
                >
                  <Ionicons name="flash" size={16} color="#10B981" style={{ marginRight: 6 }} />
                  <Text style={styles.skipBtnText}>Ghép tài xế ngay (Tua nhanh)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelLinkBtn}
                  onPress={() => setShowCancelModal(true)}
                >
                  <Text style={styles.cancelLinkText}>Hủy tìm xe</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* STATE 2: ASSIGNED (Driver Coming) */}
          {tripState === 'assigned' && (
            <Animated.View entering={FadeIn} style={styles.stateContainer}>
              <View style={styles.driverInfoCard}>
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150?img=60' }}
                  style={styles.driverAvatar}
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.driverName}>Nguyễn Văn Hùng</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingText}>4.9 (1.248 chuyến)</Text>
                  </View>
                  <Text style={styles.driverPlate}>VinFast VF 8 • 29A-999.88</Text>
                </View>

                <View style={styles.statusPillBadge}>
                  <Text style={styles.statusPillText}>Đang đến</Text>
                </View>
              </View>

              <Text style={styles.findingTitle}>Tài xế đang đến điểm đón</Text>
              <Text style={styles.findingSub}>⏱ Dự kiến đón sau ~3 phút • Cách bạn 650m</Text>

              {/* Action Buttons: Chat, Call, Share, Cancel */}
              <View style={styles.chatActionRow}>
                <TouchableOpacity
                  style={styles.actionBtnCircle}
                  onPress={() => setShowChatModal(true)}
                >
                  <Ionicons name="chatbubble-ellipses" size={22} color="#3B82F6" />
                  <Text style={styles.circleBtnLabel}>Nhắn tin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnCircle}
                  onPress={() => setShowCallModal(true)}
                >
                  <Ionicons name="call" size={22} color="#10B981" />
                  <Text style={styles.circleBtnLabel}>Gọi điện</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnCircle}
                  onPress={() => {
                    Alert.alert(
                      'Chia sẻ chuyến đi',
                      'Liên kết hành trình: https://viet-super.vn/ride/track/99988\nĐã sao chép vào bộ nhớ tạm.'
                    );
                  }}
                >
                  <Ionicons name="share-social" size={22} color="#8B5CF6" />
                  <Text style={styles.circleBtnLabel}>Chia sẻ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtnCircle, { backgroundColor: '#FEF2F2' }]}
                  onPress={() => setShowCancelModal(true)}
                >
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                  <Text style={[styles.circleBtnLabel, { color: '#EF4444' }]}>Hủy cuốc</Text>
                </TouchableOpacity>
              </View>

              {/* Big Start Ride Button */}
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => setTripState('driving')}
              >
                <Text style={styles.primaryActionText}>Khách đã lên xe (Bắt đầu di chuyển) 🚗</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STATE 3: DRIVING (In Transit) */}
          {tripState === 'driving' && (
            <Animated.View entering={FadeIn} style={styles.stateContainer}>
              <View style={styles.driverInfoCard}>
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150?img=60' }}
                  style={styles.driverAvatar}
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.driverName}>Nguyễn Văn Hùng</Text>
                  <Text style={styles.driverPlate}>VinFast VF 8 • 29A-999.88</Text>
                  <Text style={{ fontSize: 12, color: '#10B981', fontWeight: 'bold', marginTop: 2 }}>
                    Tốc độ: 42 km/h
                  </Text>
                </View>
                <View style={[styles.statusPillBadge, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[styles.statusPillText, { color: '#047857' }]}>Đang chở khách</Text>
                </View>
              </View>

              <Text style={styles.findingTitle}>Đang trên hành trình đến {destinationName}</Text>
              <Text style={styles.findingSub}>
                ⏱ Khoảng cách còn lại: {distanceKm} km • Dự kiến đến sau ~10 phút
              </Text>

              <View style={styles.chatActionRow}>
                <TouchableOpacity
                  style={styles.actionBtnCircle}
                  onPress={() => setShowChatModal(true)}
                >
                  <Ionicons name="chatbubble-ellipses" size={22} color="#3B82F6" />
                  <Text style={styles.circleBtnLabel}>Nhắn tin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnCircle}
                  onPress={() => setShowCallModal(true)}
                >
                  <Ionicons name="call" size={22} color="#10B981" />
                  <Text style={styles.circleBtnLabel}>Gọi điện</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtnCircle, { backgroundColor: '#FEF2F2' }]}
                  onPress={() => setShowSafetyModal(true)}
                >
                  <Ionicons name="shield-checkmark" size={22} color="#EF4444" />
                  <Text style={[styles.circleBtnLabel, { color: '#EF4444' }]}>An toàn SOS</Text>
                </TouchableOpacity>
              </View>

              {/* Big Arrive Button */}
              <TouchableOpacity
                style={[styles.primaryActionButton, { backgroundColor: '#10B981' }]}
                onPress={() => {
                  setTripState('completed');
                  setTimeout(() => setShowRatingModal(true), 600);
                }}
              >
                <Text style={styles.primaryActionText}>Đã đến nơi (Kết thúc chuyến đi) 🏁</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STATE 4: COMPLETED (Trip Receipt & Finish) */}
          {tripState === 'completed' && (
            <Animated.View entering={FadeIn} style={styles.stateContainer}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-circle" size={54} color="#10B981" />
              </View>
              <Text style={styles.findingTitle}>Chuyến đi hoàn thành!</Text>
              <Text style={styles.findingSub}>Cảm ơn bạn đã lựa chọn dịch vụ V-Ride</Text>

              {/* Detailed Receipt Card */}
              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Lộ trình</Text>
                  <Text style={styles.receiptVal}>Vị trí bạn → {destinationName}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Quãng đường</Text>
                  <Text style={styles.receiptVal}>{distanceKm} km</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Phương thức</Text>
                  <Text style={styles.receiptVal}>{paymentName}</Text>
                </View>
                <View style={styles.receiptLine} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Cước ban đầu</Text>
                  <Text style={styles.receiptVal}>{originalTotal.toLocaleString('vi-VN')}đ</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Ưu đãi chuyến đầu</Text>
                  <Text style={[styles.receiptVal, { color: '#10B981' }]}>-15.000đ</Text>
                </View>
                {tipAmount > 0 && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Thưởng thêm (Tip)</Text>
                    <Text style={styles.receiptVal}>+{tipAmount.toLocaleString('vi-VN')}đ</Text>
                  </View>
                )}
                <View style={styles.receiptLine} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptTotalLabel}>Tổng thanh toán</Text>
                  <Text style={styles.receiptTotalVal}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.ratingBtn}
                onPress={() => setShowRatingModal(true)}
              >
                <Ionicons name="star" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.ratingBtnText}>Đánh giá tài xế & Hoàn tất</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </View>

      {/* 6. Dev Simulator Control Bar */}
      <View style={styles.simulator}>
        <View style={styles.simHeaderRow}>
          <Text style={styles.simTitle}>🛠 Trạng thái cuốc xe</Text>
          <TouchableOpacity
            style={[styles.autoPlayBadge, autoPlay && styles.autoPlayActive]}
            onPress={() => setAutoPlay(!autoPlay)}
          >
            <Ionicons
              name={autoPlay ? 'play' : 'pause'}
              size={12}
              color={autoPlay ? '#10B981' : '#94A3B8'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.autoPlayText, autoPlay && { color: '#10B981' }]}>
              {autoPlay ? 'Tự động chạy: BẬT' : 'Tự động: TẮT'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.simRow}>
          <TouchableOpacity
            style={[styles.simBtn, tripState === 'searching' && styles.simBtnActive]}
            onPress={() => {
              setTripState('searching');
              setSimulatedTime(0);
            }}
          >
            <Text style={[styles.simBtnText, tripState === 'searching' && styles.simBtnTextActive]}>
              1. Tìm xe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.simBtn, tripState === 'assigned' && styles.simBtnActive]}
            onPress={() => setTripState('assigned')}
          >
            <Text style={[styles.simBtnText, tripState === 'assigned' && styles.simBtnTextActive]}>
              2. Đã nhận
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.simBtn, tripState === 'driving' && styles.simBtnActive]}
            onPress={() => setTripState('driving')}
          >
            <Text style={[styles.simBtnText, tripState === 'driving' && styles.simBtnTextActive]}>
              3. Đang đi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.simBtn, tripState === 'completed' && styles.simBtnActive]}
            onPress={() => setTripState('completed')}
          >
            <Text style={[styles.simBtnText, tripState === 'completed' && styles.simBtnTextActive]}>
              4. Hoàn thành
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL 1: CHAT VỚI TÀI XẾ */}
      <Modal visible={showChatModal} animationType="slide" onRequestClose={() => setShowChatModal(false)}>
        <SafeAreaView style={styles.chatModalContainer}>
          <View style={styles.chatModalHeader}>
            <TouchableOpacity onPress={() => setShowChatModal(false)} style={{ padding: 6 }}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.chatHeaderName}>Nguyễn Văn Hùng</Text>
              <Text style={styles.chatHeaderStatus}>🟢 Đang trực tuyến • VinFast VF 8</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowChatModal(false);
                setShowCallModal(true);
              }}
              style={styles.chatCallBtn}
            >
              <Ionicons name="call" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView style={styles.chatMessageList} contentContainerStyle={{ padding: 16 }}>
            {chatMessages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.msgBubble,
                  m.sender === 'user' ? styles.msgBubbleUser : styles.msgBubbleDriver,
                ]}
              >
                <Text
                  style={[
                    styles.msgText,
                    m.sender === 'user' ? styles.msgTextUser : styles.msgTextDriver,
                  ]}
                >
                  {m.text}
                </Text>
                <Text style={styles.msgTime}>{m.time}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Quick Chat Chips */}
          <View style={styles.quickChipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                'Tôi đang ở sảnh chính',
                'Tôi mặc áo đen',
                'Tài xế đến cổng số 2 nhé',
                'OK bạn nhé',
              ].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={styles.quickChip}
                  onPress={() => handleSendMessage(chip)}
                >
                  <Text style={styles.quickChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Input Bar */}
          <View style={styles.chatInputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Nhập tin nhắn cho tài xế..."
              placeholderTextColor="#94A3B8"
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={() => handleSendMessage()}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={() => handleSendMessage()}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL 2: GỌI ĐIỆN CHO TÀI XẾ */}
      <Modal visible={showCallModal} transparent animationType="fade" onRequestClose={() => setShowCallModal(false)}>
        <View style={styles.callModalBg}>
          <View style={styles.callCard}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=60' }}
              style={styles.callAvatar}
            />
            <Text style={styles.callName}>Nguyễn Văn Hùng</Text>
            <Text style={styles.callVehicle}>VinFast VF 8 • 29A-999.88</Text>
            <Text style={styles.callTimer}>{formatCallTime(callDuration)}</Text>

            {/* Direct SIM Call Option */}
            <TouchableOpacity
              style={styles.simCallBtn}
              onPress={() => {
                setShowCallModal(false);
                Linking.openURL('tel:0988123456');
              }}
            >
              <Ionicons name="phone-portrait-outline" size={16} color="#3B82F6" style={{ marginRight: 6 }} />
              <Text style={styles.simCallText}>Gọi qua số điện thoại thường (0988.123.456)</Text>
            </TouchableOpacity>

            {/* Call Controls */}
            <View style={styles.callControlsRow}>
              <TouchableOpacity
                style={[styles.callControlBtn, isMuted && styles.callControlActive]}
                onPress={() => setIsMuted(!isMuted)}
              >
                <Ionicons
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color={isMuted ? '#EF4444' : '#0F172A'}
                />
                <Text style={styles.callControlLabel}>{isMuted ? 'Bật mic' : 'Tắt mic'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.endCallBtn}
                onPress={() => setShowCallModal(false)}
              >
                <Ionicons name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.callControlBtn, isSpeaker && styles.callControlActive]}
                onPress={() => setIsSpeaker(!isSpeaker)}
              >
                <Ionicons
                  name={isSpeaker ? 'volume-high' : 'volume-medium'}
                  size={24}
                  color={isSpeaker ? '#3B82F6' : '#0F172A'}
                />
                <Text style={styles.callControlLabel}>{isSpeaker ? 'Loa ngoài' : 'Loa trong'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: XÁC NHẬN HỦY CUỐC */}
      <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
        <View style={styles.modalBgCenter}>
          <View style={styles.cancelCard}>
            <View style={styles.cancelHeader}>
              <Ionicons name="alert-circle" size={32} color="#EF4444" />
              <Text style={styles.cancelTitle}>Xác nhận hủy chuyến đi?</Text>
            </View>
            <Text style={styles.cancelDesc}>
              Tài xế đang sắp xếp đón bạn. Bạn có chắc chắn muốn hủy chuyến xe này không?
            </Text>

            <View style={styles.cancelReasons}>
              <Text style={styles.cancelReasonLabel}>Lý do hủy thường gặp:</Text>
              {[
                'Tôi đổi ý / Không còn nhu cầu',
                'Thời gian chờ tài xế quá lâu',
                'Tôi muốn đổi địa điểm đón',
                'Tài xế yêu cầu tôi hủy',
              ].map((reason, idx) => (
                <View key={idx} style={styles.reasonRow}>
                  <Ionicons name="radio-button-on" size={16} color="#94A3B8" />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cancelBtnRow}>
              <TouchableOpacity
                style={styles.cancelBackBtn}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.cancelBackText}>Tiếp tục đi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelConfirmBtn}
                onPress={handleConfirmCancel}
              >
                <Text style={styles.cancelConfirmText}>Hủy chuyến ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: TRUNG TÂM AN TOÀN SOS */}
      <Modal visible={showSafetyModal} transparent animationType="fade" onRequestClose={() => setShowSafetyModal(false)}>
        <View style={styles.modalBgCenter}>
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={28} color="#10B981" />
              <Text style={styles.safetyTitle}>Trung tâm An toàn</Text>
            </View>
            <Text style={styles.safetyDesc}>Hành trình của bạn được bảo vệ 24/7 bởi hệ thống giám sát AI.</Text>

            <View style={styles.safetyOptions}>
              <TouchableOpacity
                style={styles.safetyItemBtn}
                onPress={() => {
                  setShowSafetyModal(false);
                  Alert.alert('Chia sẻ thành công', 'Đã sao chép liên kết lộ trình vào bộ nhớ tạm.');
                }}
              >
                <Ionicons name="share-social" size={20} color="#3B82F6" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.safetyItemName}>Chia sẻ hành trình</Text>
                  <Text style={styles.safetyItemSub}>Gửi vị trí trực tiếp cho người thân</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.safetyItemBtn}
                onPress={() => {
                  setShowSafetyModal(false);
                  Alert.alert('Đã gửi phản hồi', 'Hệ thống đã ghi nhận tín hiệu kiểm tra định vị của tài xế.');
                }}
              >
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.safetyItemName}>Báo cáo bất thường</Text>
                  <Text style={styles.safetyItemSub}>Lái xe chạy sai lộ trình hoặc vượt tốc độ</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.safetyItemBtn, styles.sosBtn]}
                onPress={() => {
                  setShowSafetyModal(false);
                  Linking.openURL('tel:113');
                }}
              >
                <Ionicons name="notifications" size={20} color="#FFFFFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.safetyItemName, { color: '#FFFFFF' }]}>GỌI CỨU HỘ KHẨN CẤP (113)</Text>
                  <Text style={[styles.safetyItemSub, { color: '#FECACA' }]}>Kết nối cơ quan công an & cứu hộ</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeSafetyBtn} onPress={() => setShowSafetyModal(false)}>
              <Text style={styles.closeSafetyText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: ĐÁNH GIÁ 5 SAO & HÓA ĐƠN */}
      <Modal visible={showRatingModal} transparent animationType="fade" onRequestClose={() => setShowRatingModal(false)}>
        <View style={styles.modalBgCenter}>
          <View style={styles.ratingCard}>
            <View style={styles.driverHeaderRating}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=60' }} style={styles.driverAvatarBig} />
              <Text style={styles.driverNameRating}>Nguyễn Văn Hùng</Text>
              <Text style={styles.driverVehicleRating}>VinFast VF 8 • 29A-999.88</Text>
            </View>

            <Text style={styles.ratingTitleText}>Đánh giá trải nghiệm của bạn</Text>

            {/* Star Icons */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={{ padding: 4 }}>
                  <Ionicons
                    name={s <= rating ? 'star' : 'star-outline'}
                    size={34}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Compliment Tags */}
            <View style={styles.complimentRow}>
              {[
                'Lái xe an toàn',
                'Xe sạch & thơm',
                'Đúng giờ',
                'Thân thiện',
                'Nhiệt tình',
              ].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.complimentChip,
                    selectedTags.includes(tag) && styles.complimentChipActive,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.complimentText,
                      selectedTags.includes(tag) && styles.complimentTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tip Option */}
            <Text style={styles.tipTitleText}>Thưởng thêm cho tài xế (Tip)</Text>
            <View style={styles.ratingTipRow}>
              {[0, 10000, 20000, 50000].map((tip) => (
                <TouchableOpacity
                  key={tip}
                  style={[styles.ratingTipBtn, ratingTip === tip && styles.ratingTipBtnActive]}
                  onPress={() => setRatingTip(tip)}
                >
                  <Text
                    style={[
                      styles.ratingTipTextBtn,
                      ratingTip === tip && styles.ratingTipTextBtnActive,
                    ]}
                  >
                    {tip === 0 ? 'Không tip' : `+${tip / 1000}k`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Inputs */}
            <TextInput
              style={styles.commentInput}
              placeholder="Chia sẻ thêm nhận xét của bạn về cuốc xe..."
              placeholderTextColor="#94A3B8"
              value={ratingComment}
              onChangeText={setRatingComment}
              multiline
            />

            <TouchableOpacity style={styles.ratingSubmitBtn} onPress={handleConfirmRating}>
              <Text style={styles.ratingSubmitText}>Gửi đánh giá & Hoàn tất</Text>
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

  headerFloating: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tripHeaderInfo: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locations: { flex: 1 },
  locText: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginLeft: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  priceTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },

  safetyFloatingBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 96 : 76,
    right: 16,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  safetyFloatingText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  detourAlert: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 96 : 76,
    left: 16,
    right: 120,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
    borderRadius: 14,
    zIndex: 10,
    elevation: 6,
  },
  detourHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  detourTitle: { fontSize: 12, fontWeight: '800', color: '#D97706', flex: 1, marginLeft: 4 },
  detourClose: { padding: 2 },
  detourText: { fontSize: 11, color: '#92400E', fontWeight: '500', lineHeight: 15 },

  panel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: 20,
    paddingBottom: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    zIndex: 10,
  },
  panelPriority: { backgroundColor: '#FEF2F2' },

  stateContainer: { alignItems: 'center', paddingVertical: 6 },
  radarContainer: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  radarCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  radarCenter: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#3B82F6', zIndex: 10 },
  findingTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4, textAlign: 'center' },
  findingSub: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 12, textAlign: 'center' },
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 16,
  },
  aiFooterText: { color: '#8B5CF6', fontWeight: '600', marginLeft: 6, fontSize: 12 },

  buttonActionGroup: { width: '100%', alignItems: 'center', gap: 10 },
  skipBtn: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  skipBtnText: { color: '#059669', fontSize: 14, fontWeight: 'bold' },
  cancelLinkBtn: { paddingVertical: 8 },
  cancelLinkText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },

  driverInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  driverAvatar: { width: 48, height: 48, borderRadius: 24 },
  driverName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#F59E0B', marginLeft: 2 },
  driverPlate: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusPillBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: { fontSize: 11, fontWeight: 'bold', color: '#3B82F6' },

  chatActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
    justifyContent: 'center',
    width: '100%',
  },
  actionBtnCircle: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  circleBtnLabel: { fontSize: 11, fontWeight: '600', color: '#475569', marginTop: 4 },

  primaryActionButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
  },
  primaryActionText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

  // Receipt Card
  receiptCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginVertical: 12,
  },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  receiptLabel: { fontSize: 13, color: '#64748B' },
  receiptVal: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  receiptLine: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  receiptTotalLabel: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  receiptTotalVal: { fontSize: 17, fontWeight: '800', color: '#10B981' },

  successIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 4,
  },
  ratingBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

  // Simulator Dev Toolbar
  simulator: { backgroundColor: '#0F172A', padding: 12, zIndex: 20 },
  simHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  simTitle: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  autoPlayBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#1E293B' },
  autoPlayActive: { backgroundColor: 'rgba(16,185,129,0.15)' },
  autoPlayText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  simRow: { flexDirection: 'row', gap: 6 },
  simBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#1E293B', borderRadius: 8, alignItems: 'center' },
  simBtnActive: { backgroundColor: '#10B981' },
  simBtnText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 11 },
  simBtnTextActive: { color: '#FFFFFF' },

  // Modals & Chat
  chatModalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chatHeaderName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  chatHeaderStatus: { fontSize: 12, color: '#10B981', marginTop: 2 },
  chatCallBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  chatMessageList: { flex: 1, backgroundColor: '#F8FAFC' },
  msgBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 10 },
  msgBubbleUser: { alignSelf: 'flex-end', backgroundColor: '#3B82F6', borderBottomRightRadius: 4 },
  msgBubbleDriver: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTextUser: { color: '#FFFFFF' },
  msgTextDriver: { color: '#0F172A' },
  msgTime: { fontSize: 10, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
  quickChipsContainer: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  quickChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  quickChipText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  chatInputBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#FFFFFF' },
  chatInput: { flex: 1, height: 42, backgroundColor: '#F1F5F9', borderRadius: 21, paddingHorizontal: 16, fontSize: 14, color: '#0F172A' },
  chatSendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  // Call Modal
  callModalBg: { flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  callCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  callAvatar: { width: 84, height: 84, borderRadius: 42, marginBottom: 12 },
  callName: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  callVehicle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  callTimer: { fontSize: 18, fontWeight: '700', color: '#10B981', marginVertical: 14 },
  simCallBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#EFF6FF', borderRadius: 10, marginBottom: 20 },
  simCallText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  callControlsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', alignItems: 'center' },
  callControlBtn: { alignItems: 'center', padding: 10 },
  callControlActive: { opacity: 0.5 },
  callControlLabel: { fontSize: 11, color: '#64748B', marginTop: 4 },
  endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', elevation: 6 },

  // Cancel Modal
  modalBgCenter: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  cancelCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, width: '100%', maxWidth: 360 },
  cancelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cancelTitle: { fontSize: 17, fontWeight: 'bold', color: '#EF4444', marginLeft: 8 },
  cancelDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 14 },
  cancelReasons: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, marginBottom: 16 },
  cancelReasonLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  reasonText: { fontSize: 12, color: '#334155', marginLeft: 8 },
  cancelBtnRow: { flexDirection: 'row', gap: 10 },
  cancelBackBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center' },
  cancelBackText: { fontSize: 14, fontWeight: 'bold', color: '#475569' },
  cancelConfirmBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#EF4444', borderRadius: 12, alignItems: 'center' },
  cancelConfirmText: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },

  // Safety Center
  safetyCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, width: '100%', maxWidth: 360 },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  safetyTitle: { fontSize: 18, fontWeight: 'bold', color: '#10B981', marginLeft: 8 },
  safetyDesc: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  safetyOptions: { gap: 10 },
  safetyItemBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  safetyItemName: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  safetyItemSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  sosBtn: { backgroundColor: '#EF4444', borderColor: 'transparent' },
  closeSafetyBtn: { marginTop: 16, alignSelf: 'center', padding: 8 },
  closeSafetyText: { color: '#64748B', fontWeight: 'bold', fontSize: 14 },

  // Rating Modal
  ratingCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, width: '100%', maxWidth: 360, alignItems: 'center' },
  driverHeaderRating: { alignItems: 'center', marginBottom: 12 },
  driverAvatarBig: { width: 60, height: 60, borderRadius: 30, marginBottom: 6 },
  driverNameRating: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  driverVehicleRating: { fontSize: 12, color: '#64748B' },
  ratingTitleText: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  starsContainer: { flexDirection: 'row', marginBottom: 12 },
  complimentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 14 },
  complimentChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  complimentChipActive: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  complimentText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  complimentTextActive: { color: '#B45309', fontWeight: '700' },
  tipTitleText: { fontSize: 13, fontWeight: 'bold', color: '#0F172A', alignSelf: 'flex-start', marginBottom: 8 },
  ratingTipRow: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 14 },
  ratingTipBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  ratingTipBtnActive: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  ratingTipTextBtn: { fontSize: 12, color: '#475569', fontWeight: '600' },
  ratingTipTextBtnActive: { color: '#10B981' },
  commentInput: {
    width: '100%',
    height: 70,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    borderRadius: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  ratingSubmitBtn: { width: '100%', backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  ratingSubmitText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
