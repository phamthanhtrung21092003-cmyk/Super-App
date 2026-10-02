import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions,
  Image, Modal, TextInput, Vibration, Linking, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebMap from '../../components/WebMap';
import Animated, { FadeIn, SlideInDown, Layout } from 'react-native-reanimated';
import rideSocketService, { IncomingOrderPayload } from '../../services/rideSocketService';
import realRideApiService from '../../modules/ride/services/realRideService';


export default function DriverDashboard() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F59E0B'; // Amber Gold

  // Active Bottom Tab: 'home' | 'earnings' | 'ledger' | 'ai_support' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'earnings' | 'ledger' | 'ai_support' | 'profile'>('home');

  // Online / Offline state
  const [isOnline, setIsOnline] = useState(false);

  // Simulated Dispatch Matching State
  const [matchingOrder, setMatchingOrder] = useState<any>(null);
  const [orderCountdown, setOrderCountdown] = useState<number>(20);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [tripStep, setTripStep] = useState<number>(0);

  // VietQR Topup Modal
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('200000');

  // Driver wallet & earnings logs
  const [walletBalance, setWalletBalance] = useState(1280000);
  const [dailyEarnings, setDailyEarnings] = useState(380000);
  const [transactions, setTransactions] = useState([
    { id: 'TX-901', type: 'earn', title: 'Chở khách: Royal City -> Láng', amount: 95000, time: '10:15', category: 'passenger' },
    { id: 'TX-902', type: 'earn', title: 'Giao hàng: Duy Tân -> Mễ Trì', amount: 45000, time: '09:00', category: 'delivery' },
    { id: 'TX-903', type: 'withdraw', title: 'Rút tiền về Vietcombank', amount: -500000, time: 'Hôm qua', category: 'withdraw' },
    { id: 'TX-904', type: 'earn', title: 'Giao đồ ăn: Bún chả -> Cầu Giấy', amount: 35000, time: 'Hôm qua', category: 'food' },
  ]);

  // Ledger state (Sổ thu chi)
  const [ledgerLogs, setLedgerLogs] = useState([
    { id: 'L-1', type: 'fuel', title: 'Đổ xăng Wave', amount: 50000, date: 'Hôm nay' },
    { id: 'L-2', type: 'meal', title: 'Cơm trưa văn phòng', amount: 35000, date: 'Hôm nay' },
    { id: 'L-3', type: 'toll', title: 'Phí cầu đường', amount: 20000, date: 'Hôm qua' },
  ]);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerCostName, setLedgerCostName] = useState('');
  const [ledgerCostAmount, setLedgerCostAmount] = useState('');
  const [ledgerCostType, setLedgerCostType] = useState('fuel');

  // Customer rating / Reporting states
  const [showRateCustomerModal, setShowRateCustomerModal] = useState(false);
  const [customerRating, setCustomerRating] = useState(5);
  const [customerComment, setCustomerComment] = useState('');
  const [flagReason, setFlagReason] = useState<string | null>(null);

  // OTP Verification Modal
  const [showOtpVerifyModal, setShowOtpVerifyModal] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // AI Assistant Chat state
  const [aiChatMessages, setAiChatMessages] = useState([
    { sender: 'ai', text: 'Chào tài xế Trung! Hôm nay bạn hoạt động rất tích cực. Mình khuyên bạn nên di chuyển về hướng Cầu Giấy - Duy Tân, hiện nhu cầu bún chả trưa đang tăng 150%.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Simulation parameters
  const heatMapCircles = [
    { lat: 21.0285, lng: 105.7801, label: 'Đểm nóng: Duy Tân (Nhu cầu cao 🔥)', color: '#EF4444' },
    { lat: 21.0322, lng: 105.8010, label: 'Điểm nóng: Cầu Giấy (12 đơn chờ 🛵)', color: '#EF4444' }
  ];

  // Audio sound synthesizer for incoming order alert
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
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {}
  };

  // Google Maps Deep-link navigation
  const openGoogleMaps = (destinationAddress: string, lat?: number, lng?: number) => {
    const query = lat && lng ? `${lat},${lng}` : encodeURIComponent(destinationAddress);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      if (typeof window !== 'undefined') window.open(url, '_blank');
    });
  };

  // Call passenger
  const callPassenger = (phone: string = '0988123456') => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      if (typeof window !== 'undefined') window.alert(`Gọi điện cho khách hàng: ${phone}`);
    });
  };

  // Load persistent trip from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedTrip = await AsyncStorage.getItem('@vlife_driver_active_trip');
        if (storedTrip) {
          const parsed = JSON.parse(storedTrip);
          if (parsed && parsed.trip) {
            setActiveTrip(parsed.trip);
            setTripStep(parsed.step || 1);
            setIsOnline(true);
          }
        }
      } catch (e) {}
    })();
  }, []);

  // Save persistent trip on changes
  useEffect(() => {
    (async () => {
      try {
        if (activeTrip) {
          await AsyncStorage.setItem('@vlife_driver_active_trip', JSON.stringify({ trip: activeTrip, step: tripStep }));
        } else {
          await AsyncStorage.removeItem('@vlife_driver_active_trip');
        }
      } catch (e) {}
    })();
  }, [activeTrip, tripStep]);

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

  // ─────────────────────────────────────────
  // REAL-TIME: Kết nối WebSocket khi tài xế online
  // ─────────────────────────────────────────
  const [socketConnected, setSocketConnected] = useState(false);
  const driverIdRef = useRef('driver-demo-1');

  useEffect(() => {
    if (!isOnline) {
      // Khi offline → ngắt kết nối
      rideSocketService.disconnect();
      setSocketConnected(false);
      return;
    }

    // Khi online → kết nối socket và join drivers_pool
    rideSocketService.connect('driver');
    rideSocketService.joinAsDriver(driverIdRef.current, 21.0285, 105.7801);
    setSocketConnected(rideSocketService.isConnected);

    // Thông báo server tài xế online qua REST (backup)
    realRideApiService.toggleDriverOnline(driverIdRef.current, true).catch(() => {});

    // Lắng nghe cuốc xe mới từ server (realtime dispatch)
    const unsubOrder = rideSocketService.onIncomingOrder((order: IncomingOrderPayload) => {
      if (!activeTrip && isOnline) {
        // Chuyển đổi format IncomingOrderPayload → format matchingOrder
        setMatchingOrder({
          id: order.tripId,
          tripId: order.tripId,
          type: order.serviceType?.toLowerCase().includes('delivery') ? 'delivery' : 'passenger',
          title: order.serviceType === 'DELIVERY' ? 'Giao hàng Siêu Tốc' : 'Chở khách V-Ride',
          pickup: order.pickup,
          dropoff: order.dropoff,
          pickupLat: order.pickupLat,
          pickupLng: order.pickupLng,
          dropoffLat: order.dropoffLat,
          dropoffLng: order.dropoffLng,
          distance: `${order.distanceKm} km`,
          eta: `${order.durationMin} phút`,
          price: order.fareAmount,
          finalAmount: order.finalAmount,
          deal: 0,
          tip: 0,
          profitScore: order.profitScore || 90,
          paymentMethod: order.paymentMethod,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          desc: order.paymentMethod === 'CASH' ? 'Thu tiền mặt trực tiếp' : 'Khách đã thanh toán qua ví',
          isRealOrder: true, // Đánh dấu đây là cuốc thực
        });
      }
    });

    // Lắng nghe khi khách hủy cuốc
    const unsubCancel = rideSocketService.onTripCancelledByCustomer(({ tripId, reason }) => {
      if (activeTrip && activeTrip.tripId === tripId) {
        setActiveTrip(null);
        setTripStep(0);
        Alert.alert('Khách đã hủy chuyến', reason || 'Khách hàng đã hủy yêu cầu.');
      }
    });

    // Track connection state
    const unsubConn = rideSocketService.onConnectionChange(setSocketConnected);

    return () => {
      unsubOrder();
      unsubCancel();
      unsubConn();
      rideSocketService.disconnect();
      realRideApiService.toggleDriverOnline(driverIdRef.current, false).catch(() => {});
    };
  }, [isOnline]);

  // GPS broadcast khi đang có active trip
  const locationIntervalRef = useRef<any>(null);
  useEffect(() => {
    if (activeTrip?.tripId && isOnline) {
      locationIntervalRef.current = setInterval(() => {
        // Gửi vị trí GPS giả lập (trong production: dùng expo-location)
        const baseLat = 21.0285;
        const baseLng = 105.7801;
        const jitter = () => (Math.random() - 0.5) * 0.002;
        rideSocketService.sendDriverLocation(
          driverIdRef.current,
          baseLat + jitter(),
          baseLng + jitter(),
          Math.random() * 360,
          30 + Math.random() * 20,
          activeTrip.tripId,
        );
      }, 5000); // Gửi vị trí mỗi 5 giây
    } else {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    }
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [activeTrip?.tripId, isOnline]);


  const handleAcceptOrder = async () => {
    const order = matchingOrder;
    setActiveTrip(order);
    setMatchingOrder(null);
    setTripStep(1); // 1 = Go to pickup

    // Gọi API nhận cuốc thực (chỉ khi có tripId thực)
    if (order?.tripId && order?.isRealOrder) {
      try {
        await realRideApiService.acceptRide(order.tripId, {
          driverId: driverIdRef.current,
          driverName: 'Nguyễn Văn Hùng',
          vehicleName: 'VinFast VF 8 Xanh SM',
          licensePlate: '29A-999.88',
          avatarUrl: 'https://i.pravatar.cc/150?img=60',
          rating: 4.95,
        });
        // Server sẽ tự broadcast tới khách qua WebSocket
      } catch (e) {
        console.log('[Driver] Accept ride API error (non-critical):', e);
      }
    }
  };

  const handleRejectOrder = () => {
    setMatchingOrder(null);
  };

  // Status mapping: tripStep → server status
  const STEP_TO_STATUS: Record<number, string> = {
    1: 'ACCEPTED',
    2: 'ARRIVED_PICKUP',
    3: 'IN_TRIP',
  };

  const handleAdvanceTrip = async () => {
    if (!activeTrip) return;

    if (activeTrip.type === 'passenger') {
      if (tripStep === 1) {
        setTripStep(2); // Arrived at pickup
        // Gọi API cập nhật trạng thái
        if (activeTrip.tripId && activeTrip.isRealOrder) {
          realRideApiService.updateTripStatus(activeTrip.tripId, 'ARRIVED_PICKUP').catch(() => {});
        }
      } else if (tripStep === 2) {
        setTripStep(3); // Start trip - IN_TRIP
        if (activeTrip.tripId && activeTrip.isRealOrder) {
          realRideApiService.updateTripStatus(activeTrip.tripId, 'IN_TRIP').catch(() => {});
        }
      } else if (tripStep === 3) {
        // Complete trip → COMPLETED
        if (activeTrip.tripId && activeTrip.isRealOrder) {
          try {
            const completed = await realRideApiService.updateTripStatus(activeTrip.tripId, 'COMPLETED');
            // Cập nhật ví từ server response
          } catch (e) {}
        }

        // Cập nhật ví local (luôn chạy, kể cả demo)
        const finalEarning = (activeTrip.finalAmount || activeTrip.price) - Math.round((activeTrip.price || 0) * 0.15);
        setWalletBalance(prev => prev + finalEarning);
        setDailyEarnings(prev => prev + finalEarning);
        setTransactions(prev => [
          {
            id: `TX-${Math.floor(Math.random()*900)+100}`,
            type: 'earn',
            title: `Chở khách: ${activeTrip.pickup.split(',')[0]} → ${activeTrip.dropoff.split(',')[0]}`,
            amount: finalEarning,
            time: 'Vừa xong',
            category: 'passenger'
          },
          ...prev
        ]);
        setShowRateCustomerModal(true);
      }
    } else if (activeTrip.type === 'delivery') {
      if (tripStep === 1) {
        setTripStep(2); // Arrived at sender/pickup point
      } else if (tripStep === 2) {
        setTripStep(3); // Picked up package, now delivering
      } else if (tripStep === 3) {
        // Trigger OTP verify modal first
        setShowOtpVerifyModal(true);
      }
    } else if (activeTrip.type === 'food') {
      if (tripStep === 1) {
        setTripStep(2); // Arrived at restaurant
      } else if (tripStep === 2) {
        setTripStep(3); // Picked up food, delivering
      } else if (tripStep === 3) {
        // Complete food delivery
        const finalEarning = activeTrip.price + activeTrip.deal + activeTrip.tip;
        setWalletBalance(prev => prev + finalEarning);
        setDailyEarnings(prev => prev + finalEarning);
        setTransactions(prev => [
          {
            id: `TX-${Math.floor(Math.random()*900)+100}`,
            type: 'earn',
            title: `Giao đồ ăn: ${activeTrip.pickup.split(',')[0]}`,
            amount: finalEarning,
            time: 'Vừa xong',
            category: 'food'
          },
          ...prev
        ]);
        setShowRateCustomerModal(true);
      }
    }
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === '8899') {
      setShowOtpVerifyModal(false);
      setEnteredOtp('');
      setOtpError('');
      // Complete delivery
      const finalEarning = activeTrip.price + activeTrip.deal + activeTrip.tip;
      setWalletBalance(prev => prev + finalEarning);
      setDailyEarnings(prev => prev + finalEarning);
      setTransactions(prev => [
        {
          id: `TX-${Math.floor(Math.random()*900)+100}`,
          type: 'earn',
          title: `Giao hàng: ${activeTrip.pickup.split(',')[0]} -> ${activeTrip.dropoff.split(',')[0]}`,
          amount: finalEarning,
          time: 'Vừa xong',
          category: 'delivery'
        },
        ...prev
      ]);
      setShowRateCustomerModal(true);
    } else {
      setOtpError('Mã OTP không chính xác. Hãy hỏi lại khách nhận hàng (Gợi ý: 8899)');
    }
  };

  const handleConfirmCustomerRating = () => {
    setShowRateCustomerModal(false);
    setActiveTrip(null);
    setTripStep(0);
    setCustomerComment('');
    setCustomerRating(5);
    setFlagReason(null);
  };

  const handleAddLedgerCost = () => {
    if (!ledgerCostName || !ledgerCostAmount) return;
    const newLog = {
      id: `L-${Date.now()}`,
      type: ledgerCostType,
      title: ledgerCostName,
      amount: parseInt(ledgerCostAmount) || 0,
      date: 'Hôm nay'
    };
    setLedgerLogs([newLog, ...ledgerLogs]);
    setLedgerCostName('');
    setLedgerCostAmount('');
    setShowLedgerModal(false);
  };

  const handleSendAiMessage = () => {
    if (!chatInput) return;
    const userMsg = { sender: 'driver', text: chatInput };
    setAiChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      // AI simulated response
      let aiText = "Tôi đã ghi nhận ý kiến của bạn. Hệ thống đang tối ưu hóa luồng đơn hàng.";
      if (chatInput.toLowerCase().includes('thu nhập')) {
        aiText = "Doanh thu hôm nay của bạn đang cao hơn 12% so với trung bình tuần. Hãy tiếp tục duy trì hoạt động thêm 2 tiếng để nhận thưởng mốc 20 chuyến.";
      } else if (chatInput.toLowerCase().includes('kẹt xe') || chatInput.toLowerCase().includes('tắc')) {
        aiText = "Đường Cầu Giấy đang tắc nghẽn nặng do mưa. Đề xuất bạn di chuyển theo hướng Trần Đăng Ninh để né điểm kẹt.";
      }
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 1000);
  };

  const calculateLedgerTotal = () => {
    return ledgerLogs.reduce((total, l) => total + l.amount, 0);
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

        {/* TOP STATUS BAR (Online Indicator / Dashboard Header) */}
        <View style={styles.headerDashboard}>
          <View style={styles.drvHeaderInfo}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=60' }} style={styles.drvAvatar} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.drvName}>Trần Trung</Text>
              <View style={styles.badgeTier}>
                <Ionicons name="trophy" size={12} color="#F59E0B" />
                <Text style={styles.badgeTierText}>Hạng Vàng (Đối tác AI)</Text>
              </View>
            </View>
          </View>

          {/* Quick Exit back to main client app */}
          <TouchableOpacity style={styles.exitBtn} onPress={() => router.replace('/account')}>
            <Ionicons name="log-out-outline" size={20} color="#94A3B8" />
            <Text style={styles.exitBtnText}>Thoát tài xế</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN TAB CONTENT */}
        <View style={styles.tabContentContainer}>
          
          {/* TAB 1: HOME MAP & DISPATCH */}
          {activeTab === 'home' && (
            <View style={styles.mapTab}>
              
              {/* Web Map */}
              <View style={styles.mapFrame}>
                <WebMap
                  points={isOnline && !activeTrip ? heatMapCircles : (activeTrip ? [
                    { lat: 21.0285, lng: 105.7801, label: activeTrip.pickup, color: '#3B82F6' },
                    { lat: 21.0322, lng: 105.8010, label: activeTrip.dropoff || activeTrip.pickup, color: '#EF4444' }
                  ] : [{ lat: 21.028511, lng: 105.804817, label: 'Bạn đang ở đây', color: '#F59E0B' }])}
                  showRoute={activeTrip ? true : false}
                  routeColor="#F59E0B"
                  height={height - 300}
                  zoom={14}
                />
              </View>

              {/* Online/Offline Toggle Overlay */}
              {!activeTrip && (
                <View style={styles.onlineToggleOverlay} pointerEvents="box-none">
                  <TouchableOpacity 
                    style={[styles.toggleBtn, isOnline ? styles.toggleBtnOnline : styles.toggleBtnOffline]}
                    onPress={() => setIsOnline(!isOnline)}
                  >
                    <Ionicons name="power" size={24} color="#000" />
                    <Text style={styles.toggleBtnText}>{isOnline ? '🟢 ĐANG HOẠT ĐỘNG' : '🔴 ĐÃ TẮT NHẬN ĐƠN'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* AI Dispatch Order Match Popup Card */}
              {matchingOrder && (
                <Animated.View entering={SlideInDown} style={styles.dispatchCard}>
                  <View style={styles.dispHeader}>
                    <View style={styles.dispBadge}>
                      <Ionicons name={matchingOrder.type === 'passenger' ? 'car' : (matchingOrder.type === 'delivery' ? 'cube' : 'restaurant')} size={16} color="#000" />
                      <Text style={styles.dispBadgeText}>{matchingOrder.title}</Text>
                    </View>
                    <View style={styles.countdownBadge}>
                      <Ionicons name="timer-outline" size={15} color="#DC2626" />
                      <Text style={styles.countdownText}>{orderCountdown}s</Text>
                    </View>
                    <View style={styles.profitBadge}>
                      <Text style={styles.profitScoreText}>AI Profit: {matchingOrder.profitScore}đ</Text>
                      <View style={{ flexDirection: 'row', marginLeft: 4 }}>
                        {[...Array(matchingOrder.profitStars)].map((_, i) => (
                          <Ionicons key={i} name="star" size={10} color="#F59E0B" />
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Payment Type Badge */}
                  <View style={[
                    styles.payTypeBanner,
                    matchingOrder.paymentMethod === 'ONLINE' ? styles.payTypeBannerOnline : styles.payTypeBannerCash
                  ]}>
                    <Ionicons
                      name={matchingOrder.paymentMethod === 'ONLINE' ? 'card-outline' : 'cash-outline'}
                      size={16}
                      color={matchingOrder.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444'}
                    />
                    <Text style={[
                      styles.payTypeBannerText,
                      { color: matchingOrder.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444' }
                    ]}>
                      {matchingOrder.paymentMethod === 'ONLINE' ? 'ĐÃ THANH TOÁN VÍ ONLINE (KHÔNG THU TIỀN)' : 'THU TIỀN MẶT KHI TRẢ KHÁCH (COD)'}
                    </Text>
                  </View>

                  <Text style={styles.dispRouteTitle}>Tuyến đường đề xuất:</Text>
                  <Text style={styles.dispPoint} numberOfLines={1}>🟢 Đón: {matchingOrder.pickup}</Text>
                  <Text style={styles.dispPoint} numberOfLines={1}>🔴 Giao: {matchingOrder.dropoff || 'Tại điểm lấy'}</Text>
                  
                  <View style={styles.dispMetrics}>
                    <View style={styles.metricItem}><Text style={styles.mVal}>{matchingOrder.distance}</Text><Text style={styles.mLbl}>Cự ly</Text></View>
                    <View style={styles.metricItem}><Text style={styles.mVal}>{matchingOrder.eta}</Text><Text style={styles.mLbl}>ETA</Text></View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.mVal, { color: '#10B981' }]}>{(matchingOrder.price + matchingOrder.deal + matchingOrder.tip).toLocaleString()}đ</Text>
                      <Text style={styles.mLbl}>Giá thu thực</Text>
                    </View>
                  </View>

                  {matchingOrder.deal > 0 || matchingOrder.tip > 0 ? (
                    <View style={styles.tipDealNotice}>
                      <Ionicons name="sparkles" size={14} color="#D97706" style={{ marginRight: 6 }} />
                      <Text style={styles.tipDealText}>
                        Đơn hàng gồm +{matchingOrder.deal.toLocaleString()}đ Deal giá và +{matchingOrder.tip.toLocaleString()}đ tiền Tip.
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.dispActionRow}>
                    <TouchableOpacity style={styles.rejectBtn} onPress={handleRejectOrder}>
                      <Text style={styles.rejectBtnText}>Từ chối</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptOrder}>
                      <Text style={styles.acceptBtnText}>NHẬN ĐƠN ({orderCountdown}s)</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* Active Trip Execution Card */}
              {activeTrip && (
                <Animated.View entering={SlideInDown} style={styles.activeTripCard}>
                  <View style={styles.tripHeader}>
                    <Text style={styles.tripTitle}>
                      {tripStep === 1 && '1. Đang đi đến điểm đón'}
                      {tripStep === 2 && '2. Đã tới nơi - Chờ khách / Nhận hàng'}
                      {tripStep === 3 && '3. Đang di chuyển giao nhận'}
                    </Text>
                    <Text style={styles.tripPrice}>{(activeTrip.price + activeTrip.deal + activeTrip.tip).toLocaleString()}đ</Text>
                  </View>

                  <Text style={styles.tripRouteDesc}>
                    {tripStep <= 2 ? `Điểm đón/lấy: ${activeTrip.pickup}` : `Điểm giao/đến: ${activeTrip.dropoff || activeTrip.pickup}`}
                  </Text>

                  {/* High Contrast Payment Warning Banner */}
                  <View style={[
                    styles.payStatusBanner,
                    activeTrip.paymentMethod === 'ONLINE' ? styles.payStatusOnline : styles.payStatusCash
                  ]}>
                    <Ionicons
                      name={activeTrip.paymentMethod === 'ONLINE' ? 'shield-checkmark' : 'cash'}
                      size={20}
                      color={activeTrip.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444'}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[
                        styles.payStatusTitle,
                        { color: activeTrip.paymentMethod === 'ONLINE' ? '#10B981' : '#EF4444' }
                      ]}>
                        {activeTrip.paymentMethod === 'ONLINE'
                          ? 'KHÁCH ĐÃ TRẢ QUA VÍ (0Đ) - KHÔNG THU TIỀN MẶT'
                          : `THU TIỀN MẶT: ${(activeTrip.price + activeTrip.deal + activeTrip.tip).toLocaleString()}đ`}
                      </Text>
                      <Text style={styles.payStatusDesc}>
                        {activeTrip.paymentMethod === 'ONLINE'
                          ? 'Tiền cước đã tự động cộng vào ví tài xế'
                          : 'Tài xế thu đủ tiền mặt từ khách khi kết thúc chuyến'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripActionButtonsRow}>
                    <TouchableOpacity
                      style={styles.navBtn}
                      onPress={() => openGoogleMaps(tripStep <= 2 ? activeTrip.pickup : activeTrip.dropoff)}
                    >
                      <Ionicons name="navigate-circle" size={20} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.navBtnText}>Google Maps Chỉ đường</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.chatCallBtn}
                      onPress={() => callPassenger(activeTrip.customerPhone)}
                    >
                      <Ionicons name="call" size={18} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.chatCallBtnText}>Gọi khách</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.advanceBtn} onPress={handleAdvanceTrip}>
                    <Text style={styles.advanceBtnText}>
                      {tripStep === 1 && 'ĐÃ ĐẾN ĐIỂM ĐÓN / LẤY'}
                      {tripStep === 2 && (activeTrip.type === 'passenger' ? 'BẮT ĐẦU CHUYẾN ĐI' : 'ĐÃ LẤY HÀNG / MÓN ĂN')}
                      {tripStep === 3 && (activeTrip.type === 'passenger' ? 'HOÀN THÀNH CHUYẾN ĐI' : 'XÁC NHẬN ĐÃ GIAO HÀNG')}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

            </View>
          )}

          {/* TAB 2: EARNINGS & WALLET */}
          {activeTab === 'earnings' && (
            <ScrollView style={styles.scrollTab} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeader}>Doanh thu & Ví</Text>
              
              {/* Wallet Card */}
              <View style={styles.walletCard}>
                <Text style={styles.walletLabel}>Số dư Ví tài xế (SuperPay):</Text>
                <Text style={styles.walletBalanceText}>{walletBalance.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.walletSub}>Tiền chờ đối soát: 150.000đ</Text>
                
                <View style={styles.walletActions}>
                  <TouchableOpacity
                    style={[styles.walletActionBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => setShowTopupModal(true)}
                  >
                    <Ionicons name="qr-code-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={[styles.walletActionText, { color: '#FFF' }]}>Nạp ví VietQR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.walletActionBtn} onPress={() => {
                    if (walletBalance >= 100000) {
                      setWalletBalance(prev => prev - 100000);
                      setTransactions(prev => [
                        { id: `TX-${Date.now()}`, type: 'withdraw', title: 'Rút tiền về tài khoản ngân hàng', amount: -100000, time: 'Vừa xong', category: 'withdraw' },
                        ...prev
                      ]);
                      if (Platform.OS === 'web') window.alert('Đã gửi yêu cầu rút 100.000đ về ngân hàng liên kết thành công!');
                    }
                  }}>
                    <Ionicons name="wallet-outline" size={18} color="#000" style={{ marginRight: 6 }} />
                    <Text style={styles.walletActionText}>Rút về Ngân hàng</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.walletActionBtn, { backgroundColor: 'rgba(255,255,255,0.08)' }]} onPress={() => {
                    if (Platform.OS === 'web') window.alert('Đã xuất báo cáo lịch sử giao dịch PDF/Excel gửi về email của bạn.');
                  }}>
                    <Ionicons name="download-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={[styles.walletActionText, { color: '#FFF' }]}>Xuất Excel/PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Earnings stat grid */}
              <Text style={styles.subSectionTitle}>Thống kê hôm nay</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}><Text style={styles.statVal}>{dailyEarnings.toLocaleString()}đ</Text><Text style={styles.statLbl}>Thực nhận</Text></View>
                <View style={styles.statBox}><Text style={styles.statVal}>{(dailyEarnings * 0.15).toLocaleString()}đ</Text><Text style={styles.statLbl}>Chiết khấu trừ</Text></View>
                <View style={styles.statBox}><Text style={styles.statVal}>35.000đ</Text><Text style={styles.statLbl}>Thưởng đạt mốc</Text></View>
              </View>

              {/* Transaction list */}
              <Text style={styles.subSectionTitle}>Lịch sử giao dịch</Text>
              <View style={styles.transList}>
                {transactions.map(tx => (
                  <View key={tx.id} style={styles.transItem}>
                    <View style={[styles.txIconWrap, { backgroundColor: tx.type === 'earn' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                      <Ionicons name={tx.type === 'earn' ? "add" : "remove"} size={16} color={tx.type === 'earn' ? '#10B981' : '#EF4444'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.txTitle}>{tx.title}</Text>
                      <Text style={styles.txTime}>{tx.time} • Mã: {tx.id}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: tx.type === 'earn' ? '#10B981' : '#EF4444' }]}>
                      {tx.type === 'earn' ? '+' : ''}{tx.amount.toLocaleString()}đ
                    </Text>
                  </View>
                ))}
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* TAB 3: LEDGER */}
          {activeTab === 'ledger' && (
            <ScrollView style={styles.scrollTab} showsVerticalScrollIndicator={false}>
              <View style={styles.ledgerHeaderRow}>
                <Text style={styles.sectionHeader}>Sổ thu chi Tài xế</Text>
                <TouchableOpacity style={styles.addLedBtn} onPress={() => setShowLedgerModal(true)}>
                  <Ionicons name="add" size={18} color="#000" />
                  <Text style={styles.addLedText}>Ghi chép</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.sectionDesc}>Theo dõi các khoản chi phí phát sinh thực tế (xăng xe, cầu đường, sửa chữa...) để AI tính toán lợi nhuận thực tế.</Text>

              {/* AI Profit Analysis Box */}
              <View style={styles.aiLedgerBox}>
                <View style={styles.aiLedHeader}>
                  <Ionicons name="sparkles" size={18} color="#D97706" />
                  <Text style={styles.aiLedTitle}>AI Phân tích Tài chính</Text>
                </View>
                <Text style={styles.aiLedText}>
                  Doanh thu hôm nay: <Text style={{ color: '#10B981', fontWeight: 'bold' }}>{dailyEarnings.toLocaleString()}đ</Text>.{'\n'}
                  Tổng chi phí ghi nhận: <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>{calculateLedgerTotal().toLocaleString()}đ</Text>.{'\n\n'}
                  Lợi nhuận ròng thực tế: <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>{(dailyEarnings - calculateLedgerTotal()).toLocaleString()}đ</Text> (Tỷ lệ lợi nhuận 81%).{'\n\n'}
                  💡 <Text style={{ fontWeight: 'bold' }}>Khuyên dùng:</Text> Chi phí xăng xe chiếm tỷ trọng cao nhất. Hãy cân nhắc đổi sang xe máy điện để tiết kiệm tới 65% chi phí vận hành hàng ngày.
                </Text>
              </View>

              {/* Expense Logs */}
              <Text style={styles.subSectionTitle}>Các khoản chi tiêu hôm nay</Text>
              <View style={styles.ledgerList}>
                {ledgerLogs.map(log => (
                  <View key={log.id} style={styles.ledgerItem}>
                    <View style={styles.ledgerLeft}>
                      <View style={styles.ledIcon}>
                        <Ionicons 
                          name={log.type === 'fuel' ? "color-fill-outline" : (log.type === 'meal' ? "restaurant-outline" : "construct-outline")} 
                          size={18} 
                          color="#94A3B8" 
                        />
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.ledName}>{log.title}</Text>
                        <Text style={styles.ledDate}>{log.date} • {log.type === 'fuel' ? 'Xăng xe' : (log.type === 'meal' ? 'Ăn uống' : 'Chi phí khác')}</Text>
                      </View>
                    </View>
                    <Text style={styles.ledAmount}>- {log.amount.toLocaleString()}đ</Text>
                  </View>
                ))}
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* TAB 4: AI DRIVER ASSISTANT & HELP */}
          {activeTab === 'ai_support' && (
            <ScrollView style={styles.scrollTab} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeader}>AI Driver Assistant & Hỗ trợ</Text>

              {/* SOS Emergency button */}
              <View style={styles.sosCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sosTitle}>🚨 Báo động khẩn cấp (SOS)</Text>
                  <Text style={styles.sosSub}>Gửi tọa độ GPS hiện tại và thông báo về trung tâm cứu hộ khẩn cấp ngay.</Text>
                </View>
                <TouchableOpacity style={styles.sosActBtn} onPress={() => {
                  if (Platform.OS === 'web') {
                    window.alert('🚨 ĐÃ GỬI CỨU TRỢ SOS KHẨN CẤP!\n\nTọa độ GPS của bạn đã được gửi cho cảnh sát đường bộ và đội cứu hộ 113.');
                  }
                }}>
                  <Text style={styles.sosActText}>SOS</Text>
                </TouchableOpacity>
              </View>

              {/* AI Chat Conversation Area */}
              <Text style={styles.subSectionTitle}>AI Trợ lý tài xế Chat</Text>
              <View style={styles.aiChatContainer}>
                <ScrollView style={styles.chatMessageScroll} contentContainerStyle={{ gap: 8 }}>
                  {aiChatMessages.map((msg, index) => (
                    <View key={index} style={[styles.chatBubble, msg.sender === 'ai' ? styles.chatBubbleAi : styles.chatBubbleUser]}>
                      <Text style={[styles.chatBubbleText, msg.sender === 'ai' ? { color: '#FFFFFF' } : { color: '#000000' }]}>{msg.text}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.chatInputRow}>
                  <TextInput
                    style={styles.chatTextInput}
                    placeholder="Hỏi AI về kẹt xe, dự báo doanh thu..."
                    placeholderTextColor="#64748B"
                    value={chatInput}
                    onChangeText={setChatInput}
                  />
                  <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendAiMessage}>
                    <Ionicons name="send" size={18} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tickets support logs */}
              <Text style={styles.subSectionTitle}>Báo cáo sự cố & Ticket</Text>
              <View style={styles.ticketGrid}>
                <TouchableOpacity style={styles.ticketBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đã gửi ticket báo cáo khách hàng bùng tiền ship 45k.'); }}><Ionicons name="cash-outline" size={24} color={accentColor} /><Text style={styles.ticketLabel}>Khách bùng tiền</Text></TouchableOpacity>
                <TouchableOpacity style={styles.ticketBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đã thông báo sự cố hỏng xe/tai nạn trên đường.'); }}><Ionicons name="alert-circle-outline" size={24} color={accentColor} /><Text style={styles.ticketLabel}>Báo cáo tai nạn</Text></TouchableOpacity>
                <TouchableOpacity style={styles.ticketBtn} onPress={() => { if (Platform.OS === 'web') window.alert('Đang liên hệ CSKH hỗ trợ địa chỉ sai lệch...'); }}><Ionicons name="map-outline" size={24} color={accentColor} /><Text style={styles.ticketLabel}>Sai địa chỉ</Text></TouchableOpacity>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* TAB 5: PROFILE & TIERS */}
          {activeTab === 'profile' && (
            <ScrollView style={styles.scrollTab} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeader}>Hồ sơ & Hạng đối tác</Text>

              {/* Tier status card */}
              <View style={[styles.tierCard, { borderColor: '#F59E0B' }]}>
                <LinearGradient colors={['#1E1B4B', '#0F172A']} style={StyleSheet.absoluteFillObject} />
                <View style={styles.tierHeader}>
                  <Ionicons name="ribbon" size={28} color="#F59E0B" />
                  <Text style={styles.tierTitle}>HẠNG VÀNG (GOLD)</Text>
                </View>
                <Text style={styles.tierDesc}>Ưu tiên ghép cuốc xe ngon, giảm chiết khấu xuống còn 17%.</Text>
                <Text style={styles.tierProgress}>Tiến trình lên Kim Cương: 185/200 chuyến</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '92.5%' }]} />
                </View>
              </View>

              {/* Driver info parameters */}
              <Text style={styles.subSectionTitle}>Giấy tờ của tôi</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}><Text style={styles.infoLbl}>Mã số tài xế:</Text><Text style={styles.infoVal}>DRV-009988</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLbl}>Căn cước công dân:</Text><Text style={styles.infoVal}>03709501****</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLbl}>Hạng GPLX:</Text><Text style={styles.infoVal}>A1 (Đang hoạt động)</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLbl}>Số tài khoản:</Text><Text style={styles.infoVal}>Vietcombank • 1029****</Text></View>
              </View>

              {/* Tiers perks list */}
              <Text style={styles.subSectionTitle}>Đặc quyền hạng Vàng</Text>
              <View style={styles.perksList}>
                <View style={styles.perkItem}><Ionicons name="checkmark-done" size={16} color="#10B981" /><Text style={styles.perkText}>Giảm chiết khấu từ 20% xuống 17%</Text></View>
                <View style={styles.perkItem}><Ionicons name="checkmark-done" size={16} color="#10B981" /><Text style={styles.perkText}>Ưu tiên phát đơn trong bán kính 1.5km</Text></View>
                <View style={styles.perkItem}><Ionicons name="checkmark-done" size={16} color="#10B981" /><Text style={styles.perkText}>Hỗ trợ xử lý nhanh khi có sự cố bùng tiền</Text></View>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

        </View>

        {/* BOTTOM TAB BAR NAVIGATION */}
        <View style={styles.bottomTabbar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('home')}>
            <Ionicons name={activeTab === 'home' ? 'map' : 'map-outline'} size={20} color={activeTab === 'home' ? accentColor : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'home' && { color: accentColor }]}>Bản đồ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('earnings')}>
            <Ionicons name={activeTab === 'earnings' ? 'bar-chart' : 'bar-chart-outline'} size={20} color={activeTab === 'earnings' ? accentColor : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'earnings' && { color: accentColor }]}>Thu nhập</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('ledger')}>
            <Ionicons name={activeTab === 'ledger' ? 'book' : 'book-outline'} size={20} color={activeTab === 'ledger' ? accentColor : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'ledger' && { color: accentColor }]}>Sổ thu chi</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('ai_support')}>
            <Ionicons name={activeTab === 'ai_support' ? 'sparkles' : 'sparkles-outline'} size={20} color={activeTab === 'ai_support' ? accentColor : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'ai_support' && { color: accentColor }]}>AI & Hỗ trợ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('profile')}>
            <Ionicons name={activeTab === 'profile' ? 'person' : 'person-outline'} size={20} color={activeTab === 'profile' ? accentColor : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'profile' && { color: accentColor }]}>Hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* MODAL: INPUT EXPENSE LOG (Ledger) */}
        <Modal visible={showLedgerModal} transparent animationType="slide" onRequestClose={() => setShowLedgerModal(false)}>
          <View style={styles.modalBg}>
            <View style={styles.bottomSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ghi chép chi phí phát sinh</Text>
                <TouchableOpacity onPress={() => setShowLedgerModal(false)}>
                  <Ionicons name="close-circle" size={24} color="#CBD5E1" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>TÊN CHI PHÍ</Text>
              <TextInput style={styles.modalInput} placeholder="Ví dụ: Đổ xăng Wave, Cơm trưa..." placeholderTextColor="#64748B" value={ledgerCostName} onChangeText={setLedgerCostName} />
              
              <Text style={[styles.label, { marginTop: 12 }]}>SỐ TIỀN (VNĐ)</Text>
              <TextInput style={styles.modalInput} placeholder="50.000" placeholderTextColor="#64748B" value={ledgerCostAmount} onChangeText={setLedgerCostAmount} keyboardType="numeric" />

              <Text style={[styles.label, { marginTop: 12 }]}>PHÂN LOẠI CHI PHÍ</Text>
              <View style={styles.ledgerTypeRow}>
                <TouchableOpacity style={[styles.ledTypeBtn, ledgerCostType === 'fuel' && styles.ledTypeBtnActive]} onPress={() => setLedgerCostType('fuel')}><Text style={[styles.ledTypeText, ledgerCostType === 'fuel' && {color:'#000'}]}>Xăng xe</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.ledTypeBtn, ledgerCostType === 'meal' && styles.ledTypeBtnActive]} onPress={() => setLedgerCostType('meal')}><Text style={[styles.ledTypeText, ledgerCostType === 'meal' && {color:'#000'}]}>Ăn uống</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.ledTypeBtn, ledgerCostType === 'other' && styles.ledTypeBtnActive]} onPress={() => setLedgerCostType('other')}><Text style={[styles.ledTypeText, ledgerCostType === 'other' && {color:'#000'}]}>Chi phí khác</Text></TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitCostBtn} onPress={handleAddLedgerCost}>
                <Text style={styles.submitCostText}>GHI CHÉP NGAY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL: VERIFY OTP FOR DELIVERY */}
        <Modal visible={showOtpVerifyModal} transparent animationType="fade" onRequestClose={() => setShowOtpVerifyModal(false)}>
          <View style={styles.modalBgCenter}>
            <View style={styles.centerCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Xác nhận Giao hàng OTP</Text>
                <TouchableOpacity onPress={() => setShowOtpVerifyModal(false)}>
                  <Ionicons name="close-circle" size={24} color="#CBD5E1" />
                </TouchableOpacity>
              </View>
              <Text style={styles.descText}>Hỏi khách hàng mã OTP giao hàng gồm 4 chữ số (Gợi ý: 8899) để hoàn thành đơn.</Text>
              
              <TextInput
                style={styles.otpInput}
                placeholder="Nhập mã OTP 4 số"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                maxLength={4}
                value={enteredOtp}
                onChangeText={setEnteredOtp}
              />
              {otpError ? <Text style={styles.otpErrorText}>{otpError}</Text> : null}

              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981', width: '100%', marginTop: 12 }]} onPress={handleVerifyOtp}>
                <Text style={styles.actionBtnText}>XÁC THỰC HOÀN TẤT ĐƠN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL: RATE CUSTOMER AFTER TRIP */}
        <Modal visible={showRateCustomerModal} transparent animationType="fade" onRequestClose={() => setShowRateCustomerModal(false)}>
          <View style={styles.modalBgCenter}>
            <View style={styles.centerCard}>
              <Text style={styles.rateTitle}>Đánh giá Khách hàng</Text>
              <Text style={styles.descText}>Cập nhật điểm uy tín khách hàng để AI chọn lọc đối tượng phục vụ.</Text>

              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(s => (
                  <TouchableOpacity key={s} onPress={() => setCustomerRating(s)}>
                    <Ionicons name={s <= customerRating ? "star" : "star-outline"} size={28} color="#F59E0B" style={{ marginHorizontal: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>

              {customerRating < 5 && (
                <View style={styles.flagsList}>
                  {['Không đúng điểm đón', 'Thái độ không tốt', 'Chờ quá lâu', 'Quấy rối / Nghi ngờ hàng cấm'].map(reason => (
                    <TouchableOpacity 
                      key={reason} 
                      style={[styles.flagBtn, flagReason === reason && styles.flagBtnActive]} 
                      onPress={() => setFlagReason(reason)}
                    >
                      <Text style={[styles.flagBtnText, flagReason === reason && { color: accentColor }]}>{reason}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TextInput
                style={styles.commentInput}
                placeholder="Nhập ghi chú phản hồi về khách (nếu có)..."
                placeholderTextColor="#64748B"
                value={customerComment}
                onChangeText={setCustomerComment}
                multiline
              />

              <TouchableOpacity style={[styles.actionBtn, { width: '100%', backgroundColor: accentColor }]} onPress={handleConfirmCustomerRating}>
                <Text style={styles.actionBtnText}>HOÀN TẤT ĐÁNH GIÁ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL: TOPUP WALLET VIETQR */}
        <Modal visible={showTopupModal} transparent animationType="slide" onRequestClose={() => setShowTopupModal(false)}>
          <View style={styles.modalBgCenter}>
            <View style={[styles.centerCard, { maxWidth: 380, padding: 20 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nạp Tiền Ví Ký Quỹ Tài Xế</Text>
                <TouchableOpacity onPress={() => setShowTopupModal(false)}>
                  <Ionicons name="close-circle" size={24} color="#CBD5E1" />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12, textAlign: 'center', lineHeight: 18 }}>
                Quét mã VietQR bên dưới bằng app ngân hàng bất kỳ để nạp tiền ví nhận cuốc. Hệ thống tự động duyệt trong 30 giây.
              </Text>

              {/* VietQR Dynamic Image */}
              <View style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 16, marginBottom: 12, alignItems: 'center' }}>
                <Image
                  source={{ uri: `https://api.vietqr.io/image/970422-0988123456-compact2.png?amount=${topupAmount}&addInfo=NAP%20VI%20TAI%20XE%20V-LIFE` }}
                  style={{ width: 200, height: 200 }}
                />
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 6, fontWeight: 'bold' }}>
                  MB BANK • STK: 0988123456 • NGUYEN VAN HUNG
                </Text>
              </View>

              {/* Quick Select Amounts */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, width: '100%' }}>
                {['100000', '200000', '500000'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: topupAmount === amt ? '#10B981' : 'rgba(255,255,255,0.05)',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: topupAmount === amt ? '#10B981' : 'rgba(255,255,255,0.1)',
                    }}
                    onPress={() => setTopupAmount(amt)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: topupAmount === amt ? '#FFF' : '#CBD5E1' }}>
                      {(parseInt(amt) / 1000).toLocaleString()}k
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={{ width: '100%', backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                onPress={() => {
                  const added = parseInt(topupAmount) || 200000;
                  setWalletBalance((prev) => prev + added);
                  setTransactions((prev) => [
                    { id: `TX-${Date.now()}`, type: 'earn', title: `Nạp ví ký quỹ VietQR 24/7`, amount: added, time: 'Vừa xong', category: 'topup' },
                    ...prev,
                  ]);
                  setShowTopupModal(false);
                  if (Platform.OS === 'web') {
                    window.alert(`Nạp thành công +${added.toLocaleString()}đ vào Ví ký quỹ tài xế!`);
                  }
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>XÁC NHẬN ĐÃ CHUYỂN KHOẢN XONG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#0B0F19', width: '100%', position: 'relative' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#111', borderRadius: 55, overflow: 'hidden' },

  // Header Dashboard
  headerDashboard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#111827', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  drvHeaderInfo: { flexDirection: 'row', alignItems: 'center' },
  drvAvatar: { width: 36, height: 36, borderRadius: 18 },
  drvName: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  badgeTier: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  badgeTierText: { fontSize: 10, color: '#F59E0B', fontWeight: 'bold', marginLeft: 4 },
  exitBtn: { flexDirection: 'row', alignItems: 'center', padding: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10 },
  exitBtnText: { color: '#94A3B8', fontSize: 11, marginLeft: 4, fontWeight: '600' },

  // Tab Content Container
  tabContentContainer: { flex: 1, backgroundColor: '#0F172A' },
  
  // Tab 1: Map
  mapTab: { flex: 1, position: 'relative' },
  mapFrame: { ...StyleSheet.absoluteFillObject },
  onlineToggleOverlay: { position: 'absolute', top: 20, left: 16, right: 16, alignItems: 'center', zIndex: 10 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6 },
  toggleBtnOnline: { backgroundColor: '#10B981' },
  toggleBtnOffline: { backgroundColor: '#EF4444' },
  toggleBtnText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 0.8, marginLeft: 8 },

  // Dispatch Matching Card
  dispatchCard: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#111827', borderRadius: 24, padding: 18, borderSize: 1, borderColor: 'rgba(255,255,255,0.1)', elevation: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, zIndex: 10 },
  dispHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dispBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dispBadgeText: { color: '#000', fontWeight: 'bold', fontSize: 11, marginLeft: 4 },
  profitBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  profitScoreText: { color: '#10B981', fontSize: 11, fontWeight: 'bold' },
  dispRouteTitle: { fontSize: 12, color: '#64748B', fontWeight: 'bold', marginBottom: 6 },
  dispPoint: { fontSize: 13, color: '#FFFFFF', fontWeight: '600', marginBottom: 4 },
  dispMetrics: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 12, marginVertical: 12 },
  metricItem: { alignItems: 'center', flex: 1 },
  mVal: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  mLbl: { fontSize: 10, color: '#64748B', marginTop: 2 },
  tipDealNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.08)', padding: 10, borderRadius: 10, marginBottom: 12 },
  tipDealText: { color: '#F59E0B', fontSize: 11, fontWeight: '600' },
  dispActionRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, alignItems: 'center' },
  rejectBtnText: { color: '#94A3B8', fontWeight: 'bold' },
  acceptBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#F59E0B', borderRadius: 14, alignItems: 'center' },
  acceptBtnText: { color: '#000', fontWeight: 'bold' },

  // Active Trip Card
  activeTripCard: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#111827', borderRadius: 24, padding: 18, borderSize: 1, borderColor: 'rgba(255,255,255,0.1)', elevation: 20, shadowColor: '#000', zIndex: 10 },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tripTitle: { fontSize: 14, fontWeight: 'bold', color: '#F59E0B' },
  tripPrice: { fontSize: 16, fontWeight: '900', color: '#10B981' },
  tripRouteDesc: { fontSize: 13, color: '#FFFFFF', fontWeight: '500', marginBottom: 12 },
  tripActionButtonsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  navBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#3B82F6', paddingVertical: 8, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  navBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  chatCallBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  advanceBtn: { width: '100%', paddingVertical: 12, backgroundColor: '#F59E0B', borderRadius: 14, alignItems: 'center' },
  advanceBtnText: { color: '#000000', fontWeight: '900', fontSize: 13, letterSpacing: 0.8 },

  // Tab Scroll style
  scrollTab: { flex: 1, padding: 20 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  sectionDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 18, marginBottom: 16 },
  subSectionTitle: { fontSize: 14, color: '#F59E0B', fontWeight: 'bold', marginVertical: 16, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Wallet
  walletCard: { backgroundColor: '#1E1B4B', padding: 20, borderRadius: 24, borderSize: 1, borderColor: 'rgba(255,255,255,0.08)' },
  walletLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  walletBalanceText: { fontSize: 28, fontWeight: '900', color: '#10B981', marginVertical: 8 },
  walletSub: { fontSize: 12, color: '#64748B' },
  walletActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  walletActionBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#F59E0B', paddingVertical: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  walletActionText: { color: '#000000', fontSize: 12, fontWeight: 'bold' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderSize: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 16, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  statLbl: { fontSize: 10, color: '#64748B', marginTop: 4 },

  // Transaction list
  transList: { gap: 10 },
  transItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  txIconWrap: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  txTitle: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  txTime: { fontSize: 11, color: '#64748B', marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: 'bold' },

  // Ledger Header
  ledgerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addLedBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addLedText: { color: '#000', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },

  // AI Ledger Analysis
  aiLedgerBox: { backgroundColor: 'rgba(245,158,11,0.04)', borderSize: 1, borderColor: 'rgba(245,158,11,0.15)', padding: 16, borderRadius: 20, marginBottom: 20 },
  aiLedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aiLedTitle: { color: '#F59E0B', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  aiLedText: { color: '#94A3B8', fontSize: 13, lineHeight: 20 },

  // Ledger List
  ledgerList: { gap: 10 },
  ledgerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  ledgerLeft: { flexDirection: 'row', alignItems: 'center' },
  ledIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  ledName: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
  ledDate: { fontSize: 11, color: '#64748B', marginTop: 2 },
  ledAmount: { fontSize: 14, color: '#EF4444', fontWeight: 'bold' },

  // Tab 4: AI & Support SOS
  sosCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.1)', borderSize: 1, borderColor: 'rgba(239,68,68,0.3)', padding: 16, borderRadius: 20, marginBottom: 20 },
  sosTitle: { fontSize: 15, fontWeight: 'bold', color: '#EF4444' },
  sosSub: { fontSize: 11, color: '#FCA5A5', marginTop: 4, lineHeight: 16 },
  sosActBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  sosActText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  // AI Chat
  aiChatContainer: { height: 260, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, borderSize: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 12, justifyContent: 'space-between' },
  chatMessageScroll: { flex: 1 },
  chatBubble: { padding: 10, borderRadius: 12, maxWidth: '80%', marginVertical: 4 },
  chatBubbleAi: { backgroundColor: 'rgba(255,255,255,0.05)', alignSelf: 'flex-start' },
  chatBubbleUser: { backgroundColor: '#F59E0B', alignSelf: 'flex-end' },
  chatBubbleText: { fontSize: 12, lineHeight: 18 },
  chatInputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chatTextInput: { flex: 1, backgroundColor: '#090D16', borderSize: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 12, fontSize: 12, color: '#FFF', ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  chatSendBtn: { width: 36, height: 36, backgroundColor: '#F59E0B', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // Ticket logs
  ticketGrid: { flexDirection: 'row', gap: 10 },
  ticketBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  ticketLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginTop: 8 },

  // Tab 5: Profile Tiers
  tierCard: { backgroundColor: '#1E1B4B', padding: 20, borderRadius: 24, overflow: 'hidden', borderWidth: 1, marginBottom: 20 },
  tierHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tierTitle: { fontSize: 16, fontWeight: 'bold', color: '#F59E0B' },
  tierDesc: { fontSize: 12, color: '#94A3B8', lineHeight: 18, marginBottom: 12 },
  tierProgress: { fontSize: 11, color: '#64748B', fontWeight: 'bold', marginBottom: 4 },
  progressBarBg: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  progressBarFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 2 },
  
  infoCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLbl: { fontSize: 13, color: '#64748B' },
  infoVal: { fontSize: 13, color: '#FFFFFF', fontWeight: 'bold' },

  perksList: { gap: 8 },
  perkItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  perkText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },

  // Bottom Tabbar Navigation
  bottomTabbar: { flexDirection: 'row', height: 64, backgroundColor: '#111827', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', zIndex: 20 },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontSize: 10, color: '#94A3B8', marginTop: 4, fontWeight: '700' },

  // Modals generic
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  label: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold', marginBottom: 8 },
  modalInput: { backgroundColor: '#090D16', borderSize: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, color: '#FFF', fontSize: 14, marginBottom: 12, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  
  ledgerTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  ledTypeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  ledTypeBtnActive: { backgroundColor: '#F59E0B', borderColor: 'transparent' },
  ledTypeText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
  submitCostBtn: { width: '100%', backgroundColor: '#F59E0B', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  submitCostText: { color: '#000', fontWeight: 'bold', fontSize: 13 },

  modalBgCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  centerCard: { backgroundColor: '#111827', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, alignItems: 'center', elevation: 12 },
  
  // OTP Verify Delivery
  otpInput: { width: '100%', letterSpacing: 4, fontSize: 20, textAlign: 'center', color: '#FFFFFF', backgroundColor: '#090D16', padding: 12, borderRadius: 12, marginVertical: 12, borderSize: 1, borderColor: 'rgba(255,255,255,0.1)', ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  otpErrorText: { color: '#EF4444', fontSize: 11, fontWeight: '500', marginBottom: 8, textAlign: 'center' },

  // Rate Customer post-trip
  rateTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  starsRow: { flexDirection: 'row', marginVertical: 14 },
  commentInput: { width: '100%', height: 60, backgroundColor: '#090D16', borderSize: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, color: '#FFF', fontSize: 12, textAlignVertical: 'top', marginVertical: 14, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  flagsList: { gap: 6, width: '100%', marginBottom: 10 },
  flagBtn: { width: '100%', padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  flagBtnActive: { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.05)' },
  flagBtnText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  actionBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  actionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  descText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },

  // Countdown badge in dispatch card
  countdownBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  countdownText: { fontSize: 12, fontWeight: 'bold', color: '#DC2626', marginLeft: 4 },

  // Payment type badge
  payTypeBanner: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, marginTop: 8, marginBottom: 4 },
  payTypeBannerOnline: { backgroundColor: 'rgba(16,185,129,0.1)' },
  payTypeBannerCash: { backgroundColor: 'rgba(239,68,68,0.1)' },
  payTypeBannerText: { fontSize: 11, fontWeight: 'bold', marginLeft: 6 },

  // Active Trip Payment High Contrast Banner
  payStatusBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginVertical: 10, borderWidth: 1.5 },
  payStatusOnline: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: '#10B981' },
  payStatusCash: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: '#EF4444' },
  payStatusTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 0.2 },
  payStatusDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  chatCallBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});

