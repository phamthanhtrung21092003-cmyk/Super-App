import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  Platform, Switch, ScrollView, Modal, TextInput, Image,
  Vibration, Linking, Alert, Dimensions, PanResponder, Animated as RNAnimated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebMap, { MapPoint } from '../../components/WebMap';
import Animated, { FadeIn, SlideInDown, SlideInUp } from 'react-native-reanimated';
import rideSocketService, { IncomingOrderPayload } from '../../services/rideSocketService';
import realRideService from '../../services/realRideService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/apiClient';
import SosEmergencyModal from '../../components/SosEmergencyModal';
import { PLATFORM_FEE_RATE, STORAGE_KEYS, DEFAULT_QUICK_CHATS } from '../../constants/driverConstants';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  sender: 'driver' | 'user';
  text: string;
  time: string;
}

export default function DriverHome() {
  const { driver: authDriver } = useAuth();

  // ─────────────────────────────────────────
  // 1. TRẠNG THÁI TRỰC TUYẾN & ĐIỀU PHỐI (driver-home-cockpit)
  // ─────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(false);
  const [onlineDurationSec, setOnlineDurationSec] = useState(0);
  const [hideEarnings, setHideEarnings] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [homeTripActive, setHomeTripActive] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

  // Thống kê tài xế thật từ PostgreSQL database
  const [driverStats, setDriverStats] = useState({
    name: authDriver?.fullName || 'Tài xế Sunstar',
    rating: authDriver?.rating || 5.0,
    tier: authDriver?.tier || 'Kim Cương',
    dailyEarnings: 0,
    creditWallet: authDriver?.creditBalance || 0,
    totalTripsToday: authDriver?.totalTrips || 0,
  });

  // Bộ lọc dịch vụ nhận cuốc
  const [services, setServices] = useState({
    ride: true,
    delivery: true,
    food: true,
  });

  const toggleService = (key: keyof typeof services) => {
    setServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Đồng hồ đếm thời gian ca chạy
  useEffect(() => {
    let timer: any;
    if (isOnline) {
      timer = setInterval(() => {
        setOnlineDurationSec(prev => prev + 1);
      }, 1000);
    } else {
      setOnlineDurationSec(0);
    }
    return () => clearInterval(timer);
  }, [isOnline]);

  const formatDuration = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // ─────────────────────────────────────────
  // 2. DISPATCH & CUỐC XE THẬT (driver-trip-lifecycle & offline-resilient-sync)
  // ─────────────────────────────────────────
  const [matchingOrder, setMatchingOrder] = useState<any>(null);
  const [orderCountdown, setOrderCountdown] = useState<number>(20);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [tripStep, setTripStep] = useState<number>(0); // 1 = Arriving, 2 = Arrived, 3 = In Trip, 4 = Settlement
  const [waitingPassengerSec, setWaitingPassengerSec] = useState<number>(0);

  // Đánh giá hành khách
  const [passengerRating, setPassengerRating] = useState(5);
  const [passengerReview, setPassengerReview] = useState('');

  // Chat với khách
  const [showChatModal, setShowChatModal] = useState(false);
  const [quickChatList, setQuickChatList] = useState<string[]>(DEFAULT_QUICK_CHATS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'user', text: 'Chào bác tài, em đang đứng ở sảnh chính tòa nhà nhé!', time: 'Vừa xong' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Tải danh mục câu chat nhanh đã lưu từ Cài đặt
  useEffect(() => {
    const loadQuickChats = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.QUICK_CHATS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuickChatList(parsed);
          }
        }
      } catch (e) {}
    };
    if (showChatModal) {
      loadQuickChats();
    }
  }, [showChatModal]);

  // ─────────────────────────────────────────
  // 3. ÂM THANH CHUÔNG BÁO TO (driver-hardware-ux)
  // ─────────────────────────────────────────
  const playIncomingOrderSound = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
        osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.12); // C6
        osc.frequency.exponentialRampToValueAtTime(1318, ctx.currentTime + 0.24); // E6
        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // Google Maps Deep-link Chỉ đường ngoài 1 chạm
  const openGoogleMaps = (destinationAddress: string, lat?: number, lng?: number) => {
    const query = lat && lng ? `${lat},${lng}` : encodeURIComponent(destinationAddress);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      if (typeof window !== 'undefined') window.open(url, '_blank');
    });
  };

  // Gọi điện thoại cho khách
  const callPassenger = (phone: string = '0988123456') => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Gọi khách hàng', `Số điện thoại: ${phone}`);
    });
  };

  // ─────────────────────────────────────────
  // 4. KẾT NỐI REAL-TIME VỚI SERVER BACKEND
  // ─────────────────────────────────────────
  const [socketConnected, setSocketConnected] = useState(false);
  const driverIdRef = useRef(authDriver?.id || 'driver-demo-1');
  const processedTripIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (authDriver?.id) {
      driverIdRef.current = authDriver.id;
      setDriverStats((prev) => ({
        ...prev,
        name: authDriver.fullName || prev.name,
        rating: authDriver.rating || prev.rating,
        tier: authDriver.tier || prev.tier,
      }));
    }
  }, [authDriver]);

  // Lưu và khôi phục cuốc xe đang chạy vào AsyncStorage (offline-resilient-sync)
  useEffect(() => {
    const restorePersistedTrip = async () => {
      try {
        const savedTripJson = await AsyncStorage.getItem('@sunstar_driver_active_trip');
        const savedStep = await AsyncStorage.getItem('@sunstar_driver_trip_step');
        if (savedTripJson) {
          const trip = JSON.parse(savedTripJson);
          if (trip && trip.tripId) {
            setActiveTrip(trip);
            setTripStep(savedStep ? parseInt(savedStep, 10) : 1);
            setIsOnline(true);
          }
        }
      } catch (e) {}
    };
    restorePersistedTrip();
  }, []);

  // Cập nhật lưu trữ cục bộ mỗi khi activeTrip thay đổi
  useEffect(() => {
    if (activeTrip) {
      AsyncStorage.setItem('@sunstar_driver_active_trip', JSON.stringify(activeTrip)).catch(() => {});
      AsyncStorage.setItem('@sunstar_driver_trip_step', tripStep.toString()).catch(() => {});
    } else {
      AsyncStorage.removeItem('@sunstar_driver_active_trip').catch(() => {});
      AsyncStorage.removeItem('@sunstar_driver_trip_step').catch(() => {});
    }
  }, [activeTrip, tripStep]);

  // Bộ đếm thời gian chờ khách ở điểm đón
  useEffect(() => {
    let interval: any;
    if (tripStep === 2) {
      setWaitingPassengerSec(0);
      interval = setInterval(() => {
        setWaitingPassengerSec(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tripStep]);

  // Nạp thống kê doanh thu và thông tin tài xế THẬT từ PostgreSQL database
  useEffect(() => {
    const fetchDriverStats = async () => {
      try {
        const [meRes, walletRes] = await Promise.all([
          apiClient.get('/ride/driver/me').catch(() => null),
          apiClient.get('/ride/driver/wallet').catch(() => null),
        ]);
        if (meRes?.data) {
          if (meRes.data.id) driverIdRef.current = meRes.data.id;
          setDriverStats((prev) => ({
            ...prev,
            name: meRes.data.fullName || prev.name,
            rating: meRes.data.rating || prev.rating,
            tier: meRes.data.tier || prev.tier,
          }));
        }
        if (walletRes?.data) {
          setDriverStats((prev) => ({
            ...prev,
            dailyEarnings: walletRes.data.dailyEarnings ?? 0,
            creditWallet: walletRes.data.creditWallet ?? 0,
            totalTripsToday: walletRes.data.totalTripsToday ?? 0,
          }));
        }
      } catch (e) {
        console.warn('Lỗi tải dữ liệu buồng lái tài xế:', e);
      }
    };
    fetchDriverStats();
  }, [isOnline, activeTrip]);

  // WebSocket lifecycle
  useEffect(() => {
    if (!isOnline) {
      rideSocketService.disconnect();
      setSocketConnected(false);
      setMatchingOrder(null);
      realRideService.toggleDriverOnline(driverIdRef.current, false).catch(() => {});
      return;
    }

    rideSocketService.connect().then(() => {
      rideSocketService.joinAsDriver(driverIdRef.current, 21.0285, 105.8048);
      setSocketConnected(rideSocketService.isConnected);
    });
    realRideService.toggleDriverOnline(driverIdRef.current, true).catch(() => {});

    // Kiểm tra công việc đang chạy trên backend (Hỗ trợ cả Ride, Delivery và Food)
    realRideService.getDriverActiveJob().then((jobData) => {
      if (jobData && jobData.hasActiveJob) {
        processedTripIdsRef.current.add(jobData.jobId);
        if (jobData.jobType === 'FOOD') {
          rideSocketService.joinFoodOrderRoom(jobData.jobId);
          setActiveTrip({
            id: jobData.jobId,
            tripId: jobData.jobId,
            jobType: 'FOOD',
            bookingCode: jobData.code,
            type: 'food',
            title: 'Giao đồ ăn V-Food',
            pickup: jobData.pickupAddress,
            pickupName: jobData.pickupName,
            pickupPhone: jobData.pickupPhone,
            pickupLat: jobData.pickupLat,
            pickupLng: jobData.pickupLng,
            dropoff: jobData.dropoffAddress,
            dropoffLat: jobData.dropoffLat,
            dropoffLng: jobData.dropoffLng,
            distance: `${jobData.distanceKm} km`,
            eta: `${jobData.durationMin} phút`,
            price: jobData.earnings,
            finalAmount: jobData.totalAmount,
            tip: 0,
            deal: 0,
            paymentMethod: jobData.paymentMethod === 'COD' ? 'CASH' : 'ONLINE',
            customerName: jobData.customerName,
            customerPhone: jobData.customerPhone,
            customerRating: 5.0,
            restaurantName: jobData.restaurantName,
            itemCount: jobData.itemCount,
            items: jobData.items,
          });
          setTripStep(jobData.step || (jobData.status === 'DRIVER_ACCEPTED' ? 1 : 2));
        } else {
          // Ride hoặc General Delivery
          rideSocketService.joinTripRoom(jobData.jobId);
          setActiveTrip({
            id: jobData.jobId,
            tripId: jobData.jobId,
            jobType: jobData.jobType,
            bookingCode: jobData.code,
            type: jobData.jobType === 'DELIVERY' ? 'delivery' : 'passenger',
            title: jobData.jobType === 'DELIVERY' ? 'Giao hàng Siêu Tốc V-Express' : 'Chở khách V-Ride',
            pickup: jobData.pickupAddress,
            dropoff: jobData.dropoffAddress,
            pickupLat: jobData.pickupLat,
            pickupLng: jobData.pickupLng,
            dropoffLat: jobData.dropoffLat,
            dropoffLng: jobData.dropoffLng,
            distance: `${jobData.distanceKm} km`,
            eta: `${jobData.durationMin} phút`,
            price: jobData.earnings,
            finalAmount: jobData.totalAmount,
            tip: 0,
            deal: 0,
            paymentMethod: jobData.paymentMethod,
            customerName: jobData.customerName,
            customerPhone: jobData.customerPhone,
            customerRating: 5.0,
          });
          setTripStep(jobData.step || 1);
        }
      }
    }).catch(() => {});

    // Lắng nghe công việc THẬT từ WebSocket server (Hợp nhất Ride + Delivery + Food)
    const unsubJob = rideSocketService.onIncomingJob((job) => {
      if (!job || !job.id || processedTripIdsRef.current.has(job.id)) return;
      if (!activeTrip && isOnline) {
        // Tôn trọng bộ lọc dịch vụ của tài xế
        if (job.jobType === 'RIDE' && !services.ride) return;
        if (job.jobType === 'DELIVERY' && !services.delivery) return;
        if (job.jobType === 'FOOD' && !services.food) return;

        const incomingData = {
          id: job.id,
          tripId: job.id,
          jobId: job.id,
          jobType: job.jobType,
          bookingCode: job.code,
          type: job.jobType === 'FOOD' ? 'food' : job.jobType === 'DELIVERY' ? 'delivery' : 'passenger',
          title: job.title,
          pickup: job.pickup,
          pickupName: job.pickupName,
          pickupPhone: job.pickupPhone,
          pickupLat: job.pickupLat,
          pickupLng: job.pickupLng,
          dropoff: job.dropoff,
          dropoffLat: job.dropoffLat,
          dropoffLng: job.dropoffLng,
          distance: `${job.distanceKm} km`,
          eta: `${job.durationMin} phút`,
          price: job.earnings,
          finalAmount: job.finalAmount,
          tip: 0,
          deal: 0,
          paymentMethod: job.paymentMethod === 'COD' || job.paymentMethod === 'CASH' ? 'CASH' : 'ONLINE',
          customerName: job.customerName,
          customerPhone: job.customerPhone,
          customerRating: 5.0,
          restaurantName: job.restaurantName,
          itemCount: job.itemCount,
        };

        if (autoAccept) {
          processedTripIdsRef.current.add(job.id);
          setActiveTrip(incomingData);
          setTripStep(1);
          if (job.jobType === 'FOOD') {
            realRideService.acceptFoodOrder(job.id).catch(() => {});
            rideSocketService.joinFoodOrderRoom(job.id);
          } else {
            realRideService.acceptRide(job.id, {
              driverId: driverIdRef.current,
              driverName: driverStats.name,
              vehicleName: 'VinFast VF 8 Xanh SM',
              licensePlate: '29A-888.99',
            }).catch(() => {});
            rideSocketService.joinTripRoom(job.id);
          }
        } else {
          setMatchingOrder(incomingData);
        }
      }
    });

    const unsubCancel = rideSocketService.onTripCancelledByCustomer(({ tripId, reason }) => {
      if (activeTrip && (activeTrip.tripId === tripId || activeTrip.id === tripId)) {
        setActiveTrip(null);
        setTripStep(0);
        Alert.alert('Khách đã hủy chuyến', reason || 'Khách hàng đã hủy chuyến đi.');
      }
    });

    const unsubStatus = rideSocketService.onTripStatusUpdated((update) => {
      if (activeTrip && (activeTrip.tripId === update.tripId || activeTrip.id === update.tripId)) {
        if (update.status === 'CANCELLED') {
          setActiveTrip(null);
          setTripStep(0);
          Alert.alert('Chuyến đi đã bị hủy', update.cancelReason || 'Chuyến đi đã kết thúc.');
        } else if (update.status === 'COMPLETED') {
          setTripStep(4);
        }
      }
    });

    const unsubConn = rideSocketService.onConnectionChange((connected) => {
      setSocketConnected(connected);
      if (connected) {
        rideSocketService.joinAsDriver(driverIdRef.current, 21.0285, 105.8048);
      }
    });

    return () => {
      unsubJob();
      unsubCancel();
      unsubStatus();
      unsubConn();
      rideSocketService.disconnect();
      realRideService.toggleDriverOnline(driverIdRef.current, false).catch(() => {});
    };
  }, [isOnline, activeTrip, autoAccept, services]);

  // GPS Broadcast định kỳ khi đang có chuyến
  useEffect(() => {
    let interval: any;
    if (activeTrip?.tripId && isOnline) {
      interval = setInterval(() => {
        const baseLat = activeTrip.pickupLat || 21.0285;
        const baseLng = activeTrip.pickupLng || 105.8048;
        const jitter = () => (Math.random() - 0.5) * 0.001;
        rideSocketService.sendDriverLocation(
          driverIdRef.current,
          baseLat + jitter(),
          baseLng + jitter(),
          90,
          35,
          activeTrip.tripId
        );
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTrip?.tripId, isOnline]);

  // Bộ đếm đếm ngược 20s nhận cuốc kèm âm thanh chuông to
  useEffect(() => {
    let interval: any;
    if (matchingOrder) {
      setOrderCountdown(20);
      playIncomingOrderSound();
      try { Vibration.vibrate([0, 500, 200, 500]); } catch (e) {}

      interval = setInterval(() => {
        setOrderCountdown((prev) => {
          if (prev <= 1) {
            setMatchingOrder(null);
            return 20;
          }
          if (prev % 2 === 0) {
            playIncomingOrderSound();
            try { Vibration.vibrate([0, 300, 150, 300]); } catch (e) {}
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchingOrder]);

  const handleAcceptOrder = async () => {
    if (!matchingOrder || !matchingOrder.tripId) return;
    const order = matchingOrder;
    processedTripIdsRef.current.add(order.tripId);

    if (order.jobType === 'FOOD') {
      try {
        await realRideService.acceptFoodOrder(order.tripId);
        rideSocketService.joinFoodOrderRoom(order.tripId);
        setActiveTrip({
          ...order,
          status: 'DRIVER_ACCEPTED',
        });
        setMatchingOrder(null);
        setTripStep(1);
      } catch (e: any) {
        Alert.alert('Không thể nhận đơn', e.response?.data?.message || 'Đơn đồ ăn đã có tài xế khác tiếp nhận.');
        setMatchingOrder(null);
      }
    } else {
      rideSocketService.joinTripRoom(order.tripId);
      setActiveTrip(order);
      setMatchingOrder(null);
      setTripStep(1);

      try {
        await realRideService.acceptRide(order.tripId, {
          driverId: driverIdRef.current,
          driverName: driverStats.name,
          vehicleName: 'VinFast VF 8 Xanh SM',
          licensePlate: '29A-888.99',
          avatarUrl: 'https://i.pravatar.cc/150?img=11',
          rating: 4.95,
        });
      } catch (e: any) {
        Alert.alert('Không thể nhận cuốc', e.response?.data?.message || 'Cuốc xe đã được tài xế khác tiếp nhận.');
        setActiveTrip(null);
        setTripStep(0);
      }
    }
  };

  const handleRejectOrder = () => {
    if (matchingOrder?.tripId) {
      processedTripIdsRef.current.add(matchingOrder.tripId);
    }
    setMatchingOrder(null);
  };

  const handleAdvanceTrip = async () => {
    if (!activeTrip || !activeTrip.tripId) return;

    if (activeTrip.jobType === 'FOOD') {
      if (tripStep === 1) {
        // Bước 1: Đã đến quán và lấy món
        try {
          await realRideService.pickupFoodOrder(activeTrip.tripId);
          setTripStep(2);
        } catch (e: any) {
          Alert.alert('Lỗi cập nhật', e.response?.data?.message || 'Không thể xác nhận đã lấy món.');
        }
      } else if (tripStep === 2) {
        // Bước 2: Đã giao tới khách và hoàn tất
        try {
          await realRideService.completeFoodOrder(activeTrip.tripId);
          setTripStep(4);
        } catch (e: any) {
          Alert.alert('Lỗi cập nhật', e.response?.data?.message || 'Không thể hoàn tất đơn giao đồ ăn.');
        }
      }
    } else {
      // Ride / General Delivery
      if (tripStep === 1) {
        setTripStep(2);
        realRideService.updateTripStatus(activeTrip.tripId, 'ARRIVED_PICKUP').catch(() => {});
      } else if (tripStep === 2) {
        setTripStep(3);
        realRideService.updateTripStatus(activeTrip.tripId, 'IN_TRIP').catch(() => {});
      } else if (tripStep === 3) {
        setTripStep(4);
        realRideService.updateTripStatus(activeTrip.tripId, 'COMPLETED').catch(() => {});
      }
    }
  };

  const handleFinishTrip = async () => {
    if (activeTrip?.tripId) {
      if (activeTrip.jobType === 'FOOD') {
        rideSocketService.leaveFoodOrderRoom(activeTrip.tripId);
      } else {
        try {
          await realRideService.updateTripStatus(activeTrip.tripId, 'COMPLETED', {
            driverRating: passengerRating,
            driverReview: passengerReview,
          });
        } catch (e) {}
        rideSocketService.leaveTripRoom();
      }
    }
    Alert.alert('Thành công', 'Công việc đã hoàn thành trọn vẹn. Thu nhập đã được cập nhật vào ví!');
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

  // Các điểm trên bản đồ: Vị trí xe + Vùng nhiệt nhu cầu cao (Heatmap)
  const mapPoints: MapPoint[] = activeTrip
    ? [
        { lat: activeTrip.pickupLat || 21.0285, lng: activeTrip.pickupLng || 105.8048, label: activeTrip.pickup, color: '#3B82F6', icon: 'pin' },
        { lat: activeTrip.dropoffLat || 21.0028, lng: activeTrip.dropoffLng || 105.8155, label: activeTrip.dropoff, color: '#EF4444', icon: 'flag' },
      ]
    : [
        { lat: 21.028511, lng: 105.804817, label: 'Vị trí xe của bạn', color: '#10B981', icon: 'car' },
        { lat: 21.037511, lng: 105.783817, label: 'Bến xe Mỹ Đình 🔥 x1.4', color: '#EF4444' },
        { lat: 21.024511, lng: 105.851817, label: 'Hồ Gươm 📍 x1.3', color: '#F59E0B' },
        { lat: 21.016511, lng: 105.784817, label: 'Keangnam ⚡ +20k', color: '#8B5CF6' },
      ];

  const totalFare = activeTrip ? (activeTrip.price + activeTrip.deal + activeTrip.tip) : 0;
  const platformCommission = Math.round((activeTrip?.price || 0) * PLATFORM_FEE_RATE);
  const netEarnings = totalFare - (activeTrip?.paymentMethod === 'CASH' ? platformCommission : 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* ─────────────────────────────────────────
          BẢN ĐỒ VECTOR (WebMap)
          ───────────────────────────────────────── */}
      <View style={styles.mapContainer}>
        <WebMap
          points={mapPoints}
          showRoute={activeTrip ? true : false}
          routeColor="#10B981"
          height={SCREEN_HEIGHT}
          zoom={14}
        />
      </View>

      {/* ─────────────────────────────────────────
          TOP OVERLAY: COCKPIT DASHBOARD (driver-home-cockpit)
          ───────────────────────────────────────── */}
      <View style={styles.topOverlay} pointerEvents="box-none">
        
        {/* 1. THANH DOANH THU NHANH TRONG NGÀY (Today Earnings Bar) */}
        <View style={styles.earningsBarContainer}>
          <View style={styles.earningsTopRow}>
            <View style={styles.driverInfoBlock}>
              <View style={styles.driverAvatarBadge}>
                <Ionicons name="person" size={16} color="#ffffff" />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.driverGreeting}>{driverStats.name}</Text>
                <View style={styles.diamondBadge}>
                  <Text style={styles.diamondText}>⭐ {driverStats.rating.toFixed(2)} • {driverStats.tier}</Text>
                </View>
              </View>
            </View>

            {/* Thu nhập với nút ẩn/hiện mắt bảo mật */}
            <View style={styles.earningsAmountBlock}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Text style={styles.earningsLabel}>Thu nhập hôm nay</Text>
                <TouchableOpacity onPress={() => setHideEarnings(!hideEarnings)} style={{ marginLeft: 4 }}>
                  <Ionicons name={hideEarnings ? 'eye-off-outline' : 'eye-outline'} size={15} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.earningsValue}>
                {hideEarnings ? '•••••••• đ' : `${driverStats.dailyEarnings.toLocaleString('vi-VN')} đ`}
              </Text>
            </View>
          </View>

          {/* Thanh Tiến độ Thưởng ngày (Quest / Target Progress) */}
          <View style={styles.questProgressContainer}>
            <View style={styles.questTextRow}>
              <Text style={styles.questTitle}>
                🎯 Thưởng ngày: {driverStats.totalTripsToday} / 10 cuốc ({Math.min(100, Math.round(driverStats.totalTripsToday / 10 * 100))}%)
              </Text>
              <Text style={styles.questRewardText}>Thưởng +60.000đ</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.round(driverStats.totalTripsToday / 10 * 100))}%` }]} />
            </View>
          </View>

          {/* Vạch chỉ số: Số chuyến, Số dư ví, Thời gian ca chạy */}
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatItem}>
              <Ionicons name="car-outline" size={14} color="#3B82F6" />
              <Text style={styles.quickStatText}>{driverStats.totalTripsToday} chuyến</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.quickStatItem}>
              <Ionicons name="wallet-outline" size={14} color="#10B981" />
              <Text style={styles.quickStatText}>Ví: {driverStats.creditWallet.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.quickStatItem}>
              <Ionicons name="time-outline" size={14} color="#F59E0B" />
              <Text style={styles.quickStatText}>
                {isOnline ? formatDuration(onlineDurationSec) : 'Ngoại tuyến'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. ĐÈN BÁO TRẠNG THÁI MẠNG & GPS */}
        <View style={styles.statusPillBar}>
          <View style={styles.signalBadge}>
            <View style={[styles.signalDot, { backgroundColor: isOnline ? (socketConnected ? '#10B981' : '#EF4444') : '#94A3B8' }]} />
            <Text style={styles.signalText}>
              {!isOnline
                ? 'Đang nghỉ ngơi • Ngoại tuyến'
                : socketConnected
                ? '🟢 GPS Chuẩn • Sẵn sàng nổ cuốc'
                : '🔴 Đang kết nối lại máy chủ...'}
            </Text>
          </View>

          {/* Nút bật/tắt nhanh cuốc về nhà */}
          {isOnline && (
            <TouchableOpacity
              style={[styles.homeTripPill, homeTripActive && styles.homeTripPillActive]}
              onPress={() => {
                setHomeTripActive(!homeTripActive);
                Alert.alert('Cuốc về nhà', !homeTripActive ? 'Đã kích hoạt ưu tiên cuốc về nhà (Ngõ 68 Cầu Giấy)' : 'Đã tắt chế độ cuốc về nhà');
              }}
            >
              <Ionicons name="home" size={13} color={homeTripActive ? '#FFFFFF' : '#475569'} style={{ marginRight: 4 }} />
              <Text style={[styles.homeTripText, homeTripActive && { color: '#FFFFFF' }]}>
                {homeTripActive ? 'Về nhà (BẬT)' : 'Về nhà'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─────────────────────────────────────────
          NÚT NỔI TÁC VỤ NHANH (SOS, Recenter, Hotline)
          ───────────────────────────────────────── */}
      <View style={styles.floatingButtonsContainer} pointerEvents="box-none">
        {/* Nút SOS Khẩn cấp hình khiên đỏ */}
        <TouchableOpacity
          style={styles.sosFloatingBtn}
          activeOpacity={0.8}
          onPress={() => setShowSosModal(true)}
        >
          <Ionicons name="shield" size={24} color="#FFFFFF" />
          <Text style={styles.sosBtnText}>SOS</Text>
        </TouchableOpacity>

        {/* Nút định vị xe tâm bản đồ */}
        <TouchableOpacity
          style={styles.recenterFloatingBtn}
          activeOpacity={0.8}
          onPress={() => Alert.alert('Định vị', 'Đã căn tâm bản đồ vào vị trí xe của bạn.')}
        >
          <Ionicons name="locate" size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* Nút hỗ trợ Hotline 24/7 */}
        <TouchableOpacity
          style={styles.helpFloatingBtn}
          activeOpacity={0.8}
          onPress={() => Linking.openURL('tel:19001234')}
        >
          <Ionicons name="headset" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* ─────────────────────────────────────────
          BOTTOM OVERLAY: SLIDING BOTTOM SHEET
          ───────────────────────────────────────── */}
      <View style={styles.bottomOverlay} pointerEvents="box-none">
        
        {/* 1. POPUP NHẬN CUỐC ĐẾM NGƯỢC 20S (Incoming Order) */}
        {matchingOrder && (
          <Animated.View entering={SlideInDown} style={styles.dispatchCard}>
            <View style={styles.dispHeader}>
              <View style={[styles.dispBadge, matchingOrder.jobType === 'FOOD' && { backgroundColor: '#FEF2F2' }]}>
                <Ionicons
                  name={matchingOrder.jobType === 'FOOD' ? 'fast-food' : matchingOrder.jobType === 'DELIVERY' ? 'cube' : 'car-sport'}
                  size={18}
                  color={matchingOrder.jobType === 'FOOD' ? '#DC2626' : '#0F172A'}
                />
                <Text style={[styles.dispBadgeText, matchingOrder.jobType === 'FOOD' && { color: '#DC2626' }]}>
                  {matchingOrder.title}
                </Text>
              </View>
              <View style={styles.countdownBadge}>
                <Ionicons name="timer-outline" size={15} color="#DC2626" />
                <Text style={styles.countdownText}>Còn {orderCountdown}s</Text>
              </View>
            </View>

            {/* Zero-Dispute Payment Badge */}
            <View style={[
              styles.payTypeBanner,
              matchingOrder.paymentMethod === 'ONLINE' ? styles.payTypeBannerOnline : styles.payTypeBannerCash
            ]}>
              <Ionicons
                name={matchingOrder.paymentMethod === 'ONLINE' ? 'shield-checkmark' : 'cash'}
                size={18}
                color={matchingOrder.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444'}
              />
              <Text style={[
                styles.payTypeBannerText,
                { color: matchingOrder.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444' }
              ]}>
                {matchingOrder.paymentMethod === 'ONLINE'
                  ? 'KHÁCH ĐÃ TRẢ VÍ ONLINE (0Đ) - KHÔNG THU TIỀN MẶT'
                  : 'THU TIỀN MẶT KHI TRẢ KHÁCH (COD)'}
              </Text>
            </View>

            <View style={styles.routeBox}>
              <Text style={styles.pointText} numberOfLines={1}>
                {matchingOrder.jobType === 'FOOD' ? '🏪 Quán: ' : '🟢 Đón: '}
                {matchingOrder.pickup}
              </Text>
              <Text style={styles.pointText} numberOfLines={1}>
                {matchingOrder.jobType === 'FOOD' ? '🏠 Giao: ' : '🔴 Trả: '}
                {matchingOrder.dropoff}
              </Text>
              {matchingOrder.jobType === 'FOOD' && (
                <Text style={[styles.pointText, { color: '#DC2626', fontWeight: '600', marginTop: 2 }]} numberOfLines={1}>
                  🍔 Số lượng: {matchingOrder.itemCount || 1} món ăn
                </Text>
              )}
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
                  {(matchingOrder.price + (matchingOrder.tip || 0)).toLocaleString()}đ
                </Text>
                <Text style={styles.metricLbl}>Thực nhận</Text>
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

        {/* 2. MÀN HÌNH HÀNH TRÌNH CUỐC XE ĐANG CHỞ (Active Trip) */}
        {activeTrip && tripStep < 4 && (
          <Animated.View entering={SlideInDown} style={styles.activeTripCard}>
            <View style={styles.activeHeader}>
              <View>
                <Text style={styles.tripStepTitle}>
                  {activeTrip.jobType === 'FOOD' ? (
                    tripStep === 1
                      ? '1. Đang đến nhà hàng lấy món 🏪'
                      : '2. Đang giao món tới khách 🏠'
                  ) : (
                    tripStep === 1
                      ? '1. Đang đến điểm đón khách'
                      : tripStep === 2
                      ? `2. Đã tới điểm đón (Chờ ${formatDuration(waitingPassengerSec)})`
                      : '3. Đang trên chuyến đi'
                  )}
                </Text>
                <Text style={styles.passengerSubtitle}>
                  {activeTrip.jobType === 'FOOD'
                    ? `Quán: ${activeTrip.restaurantName || activeTrip.pickupName || 'Nhà hàng'} • ${activeTrip.itemCount || 1} món`
                    : `Khách: ${activeTrip.customerName} (${activeTrip.customerRating || 5.0}★)`}
                </Text>
              </View>
              <Text style={styles.tripFareText}>{totalFare.toLocaleString()}đ</Text>
            </View>

            <Text style={styles.currentDestination}>
              {activeTrip.jobType === 'FOOD'
                ? tripStep === 1
                  ? `🏪 Lấy món: ${activeTrip.pickup}`
                  : `🏠 Giao khách: ${activeTrip.dropoff}`
                : tripStep <= 2
                ? `📍 Điểm đón: ${activeTrip.pickup}`
                : `🏁 Điểm trả: ${activeTrip.dropoff}`}
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

            {/* Phím công cụ: Google Maps chỉ đường, Gọi điện, Chat */}
            <View style={styles.tripToolsRow}>
              <TouchableOpacity
                style={styles.googleMapsBtn}
                onPress={() => openGoogleMaps(tripStep <= 1 && activeTrip.jobType === 'FOOD' ? activeTrip.pickup : tripStep <= 2 ? activeTrip.pickup : activeTrip.dropoff)}
              >
                <Ionicons name="navigate-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.googleMapsText}>Google Maps Dẫn đường</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleToolBtn}
                onPress={() => callPassenger(tripStep === 1 && activeTrip.jobType === 'FOOD' ? (activeTrip.pickupPhone || activeTrip.customerPhone) : activeTrip.customerPhone)}
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

            {/* Nút chuyển trạng thái hành trình */}
            <TouchableOpacity style={styles.advanceStageBtn} onPress={handleAdvanceTrip}>
              <Text style={styles.advanceStageText}>
                {activeTrip.jobType === 'FOOD' ? (
                  tripStep === 1
                    ? 'ĐÃ ĐẾN QUÁN & LẤY MÓN 🍔'
                    : 'ĐÃ GIAO HÀNG TỚI KHÁCH (HOÀN TẤT) 🏁'
                ) : (
                  tripStep === 1
                    ? 'TÔI ĐÃ ĐẾN NƠI ĐÓN 📍'
                    : tripStep === 2
                    ? 'KHÁCH ĐÃ LÊN XE (BẮT ĐẦU CHUYẾN) 🚗'
                    : 'ĐÃ ĐẾN NƠI (KẾT THÚC CHUYẾN ĐI) 🏁'
                )}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* 3. MÀN HÌNH THU TIỀN & ĐÁNH GIÁ (Trip Step 4) */}
        {activeTrip && tripStep === 4 && (
          <Animated.View entering={SlideInDown} style={styles.settlementCard}>
            <View style={styles.successCheck}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text style={styles.settlementTitle}>Chuyến đi hoàn thành!</Text>
              <Text style={styles.settlementSub}>Mã cuốc: {activeTrip.bookingCode}</Text>
            </View>

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

            {/* Bảng phân tích cước */}
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
                <Text style={styles.breakLbl}>Phí nền tảng (15%)</Text>
                <Text style={[styles.breakVal, { color: '#EF4444' }]}>-{platformCommission.toLocaleString()}đ</Text>
              </View>
              <View style={styles.breakDivider} />
              <View style={styles.breakRow}>
                <Text style={styles.breakTotalLbl}>Tài xế thực nhận</Text>
                <Text style={styles.breakTotalVal}>{netEarnings.toLocaleString()}đ</Text>
              </View>
            </View>

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

        {/* 4. SLIDING CONTROL SHEET (Khi đang rảnh) */}
        {!matchingOrder && !activeTrip && (
          <View style={styles.cockpitSheet}>
            {/* Thanh kéo vuốt Bottom Sheet */}
            <TouchableOpacity
              style={styles.sheetHandleArea}
              activeOpacity={0.7}
              onPress={() => setBottomSheetExpanded(!bottomSheetExpanded)}
            >
              <View style={styles.sheetDragBar} />
            </TouchableOpacity>

            {/* Nút trượt Trực tuyến / Ngoại tuyến thông minh */}
            <TouchableOpacity
              style={[styles.bigOnlineSlider, isOnline ? styles.sliderOnlineBg : styles.sliderOfflineBg]}
              activeOpacity={0.85}
              onPress={() => setIsOnline(!isOnline)}
            >
              <View style={[styles.sliderKnob, isOnline ? styles.sliderKnobOnline : styles.sliderKnobOffline]}>
                <Ionicons
                  name={isOnline ? 'power' : 'power-outline'}
                  size={24}
                  color={isOnline ? '#059669' : '#475569'}
                />
              </View>
              <Text style={[styles.sliderLabel, isOnline ? styles.sliderLabelOnline : styles.sliderLabelOffline]}>
                {isOnline ? 'ĐANG TRỰC TUYẾN • CHẠM ĐỂ NGHỈ' : 'TRƯỢT HOẶC CHẠM ĐỂ BẬT TRỰC TUYẾN'}
              </Text>
              <Ionicons
                name={isOnline ? 'checkmark-circle' : 'chevron-forward'}
                size={22}
                color={isOnline ? '#34D399' : '#94A3B8'}
                style={{ marginRight: 14 }}
              />
            </TouchableOpacity>

            {/* Các tùy chọn nhanh: Tự động nhận cuốc & Điểm về nhà */}
            <View style={styles.quickTogglesRow}>
              <TouchableOpacity
                style={[styles.quickToggleCard, autoAccept && styles.quickToggleCardActive]}
                onPress={() => setAutoAccept(!autoAccept)}
              >
                <Ionicons name="flash" size={18} color={autoAccept ? '#10B981' : '#64748B'} />
                <View style={{ marginLeft: 6 }}>
                  <Text style={[styles.quickToggleTitle, autoAccept && { color: '#059669' }]}>Tự động nhận</Text>
                  <Text style={styles.quickToggleSub}>{autoAccept ? 'Đang bật' : 'Tắt'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickToggleCard, homeTripActive && styles.quickToggleCardActive]}
                onPress={() => setHomeTripActive(!homeTripActive)}
              >
                <Ionicons name="home" size={18} color={homeTripActive ? '#3B82F6' : '#64748B'} />
                <View style={{ marginLeft: 6 }}>
                  <Text style={[styles.quickToggleTitle, homeTripActive && { color: '#2563EB' }]}>Cuốc về nhà</Text>
                  <Text style={styles.quickToggleSub}>{homeTripActive ? 'Đang ưu tiên' : 'Cầu Giấy'}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Danh sách Dịch vụ đang nhận (Kéo mở rộng để xem hoặc cấu hình) */}
            <View style={styles.servicesContainer}>
              <View style={styles.servicesHeaderRow}>
                <Text style={styles.servicesTitle}>Dịch vụ đang nhận</Text>
                <Text style={styles.servicesSub}>Bật/tắt dịch vụ phù hợp</Text>
              </View>

              <View style={styles.servicesListRow}>
                <TouchableOpacity
                  style={[styles.serviceChip, services.ride && styles.serviceChipActive]}
                  onPress={() => toggleService('ride')}
                >
                  <Ionicons name="car" size={18} color={services.ride ? '#3B82F6' : '#94A3B8'} />
                  <Text style={[styles.serviceChipText, services.ride && styles.serviceChipTextActive]}>
                    Chở khách
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.serviceChip, services.delivery && styles.serviceChipActive]}
                  onPress={() => toggleService('delivery')}
                >
                  <Ionicons name="cube" size={18} color={services.delivery ? '#F97316' : '#94A3B8'} />
                  <Text style={[styles.serviceChipText, services.delivery && styles.serviceChipTextActive]}>
                    Giao hàng
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.serviceChip, services.food && styles.serviceChipActive]}
                  onPress={() => toggleService('food')}
                >
                  <Ionicons name="fast-food" size={18} color={services.food ? '#EF4444' : '#94A3B8'} />
                  <Text style={[styles.serviceChipText, services.food && styles.serviceChipTextActive]}>
                    Đồ ăn
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ─────────────────────────────────────────
          MODAL SOS KHẨN CẤP (Gom dùng chung SosEmergencyModal)
          ───────────────────────────────────────── */}
      <SosEmergencyModal
        visible={showSosModal}
        onClose={() => setShowSosModal(false)}
        currentLat={21.0285}
        currentLng={105.8048}
      />

      {/* ─────────────────────────────────────────
          MODAL CHAT VỚI KHÁCH HÀNG
          ───────────────────────────────────────── */}
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
              {quickChatList.map(chip => (
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
              placeholder="Nhập tin nhắn cho khách..."
              placeholderTextColor="#94A3B8"
              value={chatInput}
              onChangeText={setChatInput}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// BỘ STYLES GIAO DIỆN CHUẨN BUỒNG LÁI SỐ
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mapContainer: {
    ...StyleSheet.absoluteFill,
  },
  topOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 10,
    left: 12,
    right: 12,
    zIndex: 100,
  },

  // 1. THANH DOANH THU NHANH
  earningsBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  earningsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0C68EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverGreeting: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  diamondBadge: {
    marginTop: 2,
  },
  diamondText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '700',
  },
  earningsAmountBlock: {
    alignItems: 'flex-end',
  },
  earningsLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },

  // Quest Tracker
  questProgressContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  questTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  questTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  questRewardText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },

  // Quick stats
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 6,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 5,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#CBD5E1',
  },

  // Signal Bar
  statusPillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  signalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeTripPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeTripPillActive: {
    backgroundColor: '#2563EB',
  },
  homeTripText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },

  // Floating Buttons (SOS, Recenter, Help)
  floatingButtonsContainer: {
    position: 'absolute',
    right: 14,
    top: '40%',
    zIndex: 90,
    alignItems: 'center',
  },
  sosFloatingBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 12,
  },
  sosBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: -2,
  },
  recenterFloatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 12,
  },
  helpFloatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },

  // Bottom Overlay & Cockpit Sheet
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  cockpitSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  sheetDragBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },

  // Nút trượt lớn bật/tắt trực tuyến
  bigOnlineSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    padding: 6,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderOnlineBg: {
    backgroundColor: '#ECFDF5',
    borderColor: '#34D399',
    borderWidth: 1.5,
  },
  sliderOfflineBg: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  sliderKnob: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderKnobOnline: {
    backgroundColor: '#FFFFFF',
  },
  sliderKnobOffline: {
    backgroundColor: '#FFFFFF',
  },
  sliderLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  sliderLabelOnline: {
    color: '#065F46',
  },
  sliderLabelOffline: {
    color: '#475569',
  },

  // Quick Toggles (Tự động nhận & Cuốc về nhà)
  quickTogglesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickToggleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickToggleCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  quickToggleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  quickToggleSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  // Services List
  servicesContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  servicesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  servicesSub: {
    fontSize: 11,
    color: '#64748B',
  },
  servicesListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  serviceChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 6,
  },
  serviceChipTextActive: {
    color: '#1E40AF',
  },

  // DISPATCH CARD (Popup nổ cuốc)
  dispatchCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  dispHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dispBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dispBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 6,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
    marginLeft: 4,
  },
  payTypeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  payTypeBannerOnline: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
  },
  payTypeBannerCash: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  payTypeBannerText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  routeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  pointText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    marginVertical: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  rejectBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  // ACTIVE TRIP CARD
  activeTripCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripStepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  passengerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tripFareText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },
  currentDestination: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  paymentEnforcementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  payOnlineBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  payCashBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  paymentBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
  },
  paymentBannerDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1,
  },
  tripToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  googleMapsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  googleMapsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  circleToolBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  advanceStageBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  advanceStageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  // SETTLEMENT CARD (Hoàn thành & Đánh giá)
  settlementCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    alignItems: 'center',
  },
  successCheck: {
    alignItems: 'center',
    marginBottom: 10,
  },
  settlementTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  settlementSub: {
    fontSize: 12,
    color: '#64748B',
  },
  settlementBanner: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  settlementBannerText: {
    fontSize: 13,
    fontWeight: '900',
  },
  breakdownCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  breakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  breakLbl: {
    fontSize: 13,
    color: '#64748B',
  },
  breakVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  breakDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  breakTotalLbl: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  breakTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  ratePassengerLbl: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  completeAllBtn: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // CHAT MODAL
  modalHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatBubble: {
    maxWidth: '80%',
    borderRadius: 14,
    padding: 12,
    marginVertical: 4,
  },
  chatBubbleDriver: {
    backgroundColor: '#0C68EF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  chatBubbleUser: {
    backgroundColor: '#E2E8F0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  chatText: {
    fontSize: 14,
    color: '#0F172A',
  },
  chatTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  chatChipText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F1F5F9',
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
  },
  chatSendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0C68EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
