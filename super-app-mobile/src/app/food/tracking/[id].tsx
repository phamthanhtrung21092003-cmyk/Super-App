import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions, Image,
  Linking, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFood, FoodActiveOrder } from '../../../../src/context/FoodContext';
import { foodService } from '@/services/foodService';
import { foodSocketService } from '@/services/foodSocketService';

const STAGES: { status: string; title: string; desc: string; icon: any }[] = [
  { status: 'PENDING', title: 'Chờ quán xác nhận', desc: 'Đơn hàng đã được gửi tới quán ăn', icon: 'time-outline' },
  { status: 'PREPARING', title: 'Quán đang làm món', desc: 'Đầu bếp đang chế biến nóng sốt', icon: 'restaurant-outline' },
  { status: 'DRIVER_ACCEPTED', title: 'Tài xế đang đến quán', desc: 'Shipper đang trên đường lấy đồ ăn', icon: 'bicycle-outline' },
  { status: 'PICKED_UP', title: 'Đang giao đến bạn', desc: 'Tài xế đang di chuyển tới địa chỉ nhận', icon: 'navigate-outline' },
  { status: 'COMPLETED', title: 'Giao hàng thành công', desc: 'Chúc bạn có bữa ăn thật ngon miệng!', icon: 'checkmark-circle' },
];

export default function FoodTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const { activeOrder, updateOrderStatus } = useFood();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [serverOrder, setServerOrder] = useState<any>(null);
  const [etaMinutes, setEtaMinutes] = useState(25);

  const orderTargetId = typeof id === 'string' ? id : (activeOrder?.orderCode || activeOrder?.id || '');

  // Lấy dữ liệu đơn hàng thật từ Backend & Lắng nghe Realtime Socket.io
  useEffect(() => {
    let isMounted = true;

    const fetchOrderStatus = async () => {
      if (!orderTargetId) {
        setLoading(false);
        return;
      }

      try {
        const data = await foodService.getOrderTracking(orderTargetId);
        if (!isMounted) return;
        setServerOrder(data);
        setErrorMsg(null);

        // Đồng bộ trạng thái vào context nếu có
        if (data.status) {
          updateOrderStatus(data.status);
        }
      } catch (err: any) {
        if (!isMounted) return;
        if (!serverOrder && !activeOrder) {
          setErrorMsg(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // 1. Tải trạng thái ban đầu từ REST API (Single Source of Truth)
    fetchOrderStatus();

    // 2. Kết nối và Tham gia Room theo dõi Realtime Socket.io
    foodSocketService.connect().then(() => {
      if (orderTargetId) {
        foodSocketService.joinOrderRoom(orderTargetId);
      }
    });

    // 3. Lắng nghe cập nhật trạng thái đơn tức thì qua Socket.io
    const unsubStatus = foodSocketService.onOrderStatusChanged((payload) => {
      if (!isMounted) return;
      console.log('[TrackingScreen] Realtime status update:', payload.status);
      setServerOrder((prev: any) =>
        prev
          ? {
              ...prev,
              status: payload.status,
              driver: payload.driver || prev.driver,
              driverId: payload.driverId || prev.driverId,
              rejectedReason: payload.reason || prev.rejectedReason,
              cancellationReason: payload.reason || prev.cancellationReason,
            }
          : prev,
      );
      if (payload.status) {
        updateOrderStatus(payload.status as any);
      }
    });

    // 4. Khi Socket kết nối lại (sau khi mất mạng), tự động fetch lại từ REST API để đồng bộ chuẩn xác
    const unsubReconnect = foodSocketService.onReconnectSync(() => {
      if (isMounted) {
        console.log('[TrackingScreen] Socket reconnected, syncing with REST API...');
        fetchOrderStatus();
      }
    });

    return () => {
      isMounted = false;
      unsubStatus();
      unsubReconnect();
      if (orderTargetId) {
        foodSocketService.leaveOrderRoom(orderTargetId);
      }
    };
  }, [orderTargetId]);

  // Xác định vị trí trạng thái hiện tại trên thanh tiến trình
  const currentStatus = serverOrder?.status || activeOrder?.status || 'PENDING';
  let currentStageIdx = 0;
  if (currentStatus === 'CONFIRMED' || currentStatus === 'PREPARING') {
    currentStageIdx = 1;
  } else if (currentStatus === 'DRIVER_ACCEPTED' || currentStatus === 'DRIVER_ARRIVING') {
    currentStageIdx = 2;
  } else if (currentStatus === 'PICKED_UP' || currentStatus === 'DELIVERING') {
    currentStageIdx = 3;
  } else if (currentStatus === 'COMPLETED') {
    currentStageIdx = 4;
  }

  const orderCode = serverOrder?.orderCode || activeOrder?.orderCode || (typeof id === 'string' ? id : '#FD-FOOD');
  const restaurantName = serverOrder?.restaurant?.name || activeOrder?.restaurantName || 'Quán ăn V-Life';
  const deliveryAddress = serverOrder?.deliveryAddress || activeOrder?.deliveryAddress || 'Địa chỉ giao hàng';
  const totalAmount = serverOrder?.totalAmount || activeOrder?.totalAmount || 0;
  const items = serverOrder?.items || activeOrder?.items || [];

  const currentStage = STAGES[currentStageIdx];

  const handleCallDriver = () => {
    Linking.openURL('tel:0988888888').catch(() => alert('Gọi cho tài xế: 0988 888 888'));
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => router.replace('/food')}
          >
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Theo Dõi Đơn Hàng</Text>
            <Text style={styles.headerSub}>{orderCode}</Text>
          </View>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => alert('Cần hỗ trợ đơn hàng? Tổng đài CSKH: 1900 6868')}
          >
            <Ionicons name="headset-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          
          {/* Simulated Map / Route Header */}
          <View style={styles.mapContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80' }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.mapOverlay} />

            {/* Floating ETA Badge */}
            <View style={styles.etaBadge}>
              <Ionicons name="time" size={20} color="#FFF" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.etaLabel}>DỰ KIẾN GIAO</Text>
                <Text style={styles.etaTime}>{etaMinutes} phút nữa</Text>
              </View>
            </View>

            {/* Map Markers Simulation */}
            <View style={styles.routeSimulation}>
              <View style={[styles.pinBox, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="restaurant" size={16} color="#FFF" />
              </View>
              <View style={styles.routeDottedLine} />
              <View style={[styles.pinBox, { backgroundColor: accentColor }]}>
                <Ionicons name="bicycle" size={18} color="#FFF" />
              </View>
              <View style={styles.routeDottedLine} />
              <View style={[styles.pinBox, { backgroundColor: '#10B981' }]}>
                <Ionicons name="home" size={16} color="#FFF" />
              </View>
            </View>
          </View>

          <View style={styles.content}>

            {/* Current Stage Highlight Box */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.statusBox}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusIconWrap, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name={currentStage.icon} size={28} color={accentColor} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.statusTitle}>{currentStage.title}</Text>
                  <Text style={styles.statusDesc}>{currentStage.desc}</Text>
                </View>
              </View>

              {/* Progress 5 Dots */}
              <View style={styles.dotsRow}>
                {STAGES.map((stg, i) => {
                  const isDone = i <= currentStageIdx;
                  return (
                    <React.Fragment key={stg.status}>
                      <View style={[styles.dotCircle, isDone && { backgroundColor: accentColor, borderColor: accentColor }]}>
                        {isDone && <Ionicons name="checkmark" size={12} color="#FFF" />}
                      </View>
                      {i < STAGES.length - 1 && (
                        <View style={[styles.dotLine, i < currentStageIdx && { backgroundColor: accentColor }]} />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            </Animated.View>

            {/* Driver Profile Card */}
            {(currentStageIdx >= 2 || Boolean(serverOrder?.driver)) && (
              <Animated.View entering={FadeInUp.duration(300)} style={styles.driverCard}>
                <Image 
                  source={{ uri: serverOrder?.driver?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }} 
                  style={styles.driverAvatar} 
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.driverName}>
                    {serverOrder?.driver?.fullName || 'Tài xế V-Life'}
                  </Text>
                  <Text style={styles.driverVehicle}>
                    {serverOrder?.driver?.vehicleType || 'Xe máy'} • {serverOrder?.driver?.licensePlate || 'Đang cập nhật'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.driverRating}>
                      {serverOrder?.driver?.rating || '5.0'} ({(serverOrder?.driver?.totalTrips || 120)} cuốc)
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity 
                    style={styles.driverActionBtn} 
                    onPress={() => {
                      const phone = serverOrder?.driver?.phone || '0922222222';
                      Linking.openURL(`tel:${phone}`).catch(() => alert(`Gọi cho tài xế: ${phone}`));
                    }}
                  >
                    <Ionicons name="call" size={18} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.driverActionBtn} 
                    onPress={() => alert(`Nhắn tin cho tài xế: "Tôi đang ở địa chỉ ${deliveryAddress}"`)}
                  >
                    <Ionicons name="chatbubble" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* Order Destination Details */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
              
              <View style={styles.detailRow}>
                <Ionicons name="restaurant" size={18} color="#F97316" style={styles.detailIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailHeading}>{restaurantName}</Text>
                  <Text style={styles.detailText}>Lấy đồ ăn nóng hổi tại bếp</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="location" size={18} color="#10B981" style={styles.detailIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailHeading}>Địa chỉ nhận hàng</Text>
                  <Text style={styles.detailText}>{deliveryAddress}</Text>
                </View>
              </View>
            </View>

            {/* Order Items Snapshot */}
            <View style={styles.infoCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Món ăn ({items.length} món)</Text>
                <Text style={styles.orderTotalText}>{totalAmount.toLocaleString('vi-VN')}đ</Text>
              </View>

              {items.map((it: any, idx: number) => {
                const itemOptions = typeof it.optionsJson === 'string' ? JSON.parse(it.optionsJson || '{}') : (it.optionsJson || {});
                const sizeName = it.size?.name || itemOptions.size?.name;
                const toppings = it.toppings || itemOptions.toppings || [];
                const itemPrice = it.totalPrice || (it.price * it.quantity) || 0;

                return (
                  <View key={it.id || it.cartItemId || idx} style={styles.itemRow}>
                    <Text style={styles.itemQty}>{it.quantity}x</Text>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.itemName}>{it.name}</Text>
                      {sizeName ? <Text style={styles.itemSub}>{sizeName}</Text> : null}
                      {toppings.length > 0 ? (
                        <Text style={styles.itemSub}>+ {toppings.map((t: any) => t.name).join(', ')}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.itemPrice}>{itemPrice.toLocaleString('vi-VN')}đ</Text>
                  </View>
                );
              })}
            </View>

            {/* Action Return Home */}
            <TouchableOpacity 
              style={[styles.backHomeBtn, { backgroundColor: accentColor }]}
              onPress={() => router.replace('/food')}
            >
              <Ionicons name="home-outline" size={18} color="#FFF" />
              <Text style={styles.backHomeText}>Quay về Trang Chủ Đồ Ăn</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#020617', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', backgroundColor: '#F8FAFC' },
  desktopFrame: { maxWidth: 500, borderWidth: 1, borderColor: '#1E293B' },

  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', 
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9' 
  },
  iconBtn: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', 
    justifyContent: 'center', alignItems: 'center' 
  },
  headerTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  headerSub: { color: '#F97316', fontSize: 12, fontWeight: '700', marginTop: 2 },

  mapContainer: { height: 200, width: '100%', justifyContent: 'space-between', padding: 16 },
  mapOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  
  etaBadge: { 
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', 
    backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 14, 
    paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' 
  },
  etaLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  etaTime: { fontSize: 15, color: '#FFF', fontWeight: '800' },

  routeSimulation: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: 'rgba(255,255,255,0.92)', paddingVertical: 10, 
    paddingHorizontal: 16, borderRadius: 16, alignSelf: 'center', gap: 12 
  },
  pinBox: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  routeDottedLine: { width: 30, height: 2, backgroundColor: '#94A3B8' },

  content: { padding: 16, gap: 14 },

  statusBox: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 18, 
    borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', 
    shadowOpacity: 0.04, shadowRadius: 10 
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  statusIconWrap: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center' },
  statusTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statusDesc: { fontSize: 13, color: '#64748B', marginTop: 3 },

  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  dotCircle: { 
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, 
    borderColor: '#CBD5E1', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' 
  },
  dotLine: { flex: 1, height: 3, backgroundColor: '#E2E8F0', marginHorizontal: 4 },

  driverCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', 
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6 
  },
  driverAvatar: { width: 50, height: 50, borderRadius: 25 },
  driverName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  driverVehicle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  driverRating: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  driverActionBtn: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', 
    borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' 
  },

  infoCard: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, 
    borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', 
    shadowOpacity: 0.02, shadowRadius: 6 
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
  detailIcon: { marginRight: 12, marginTop: 2 },
  detailHeading: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  detailText: { fontSize: 12, color: '#64748B', marginTop: 2 },

  orderTotalText: { fontSize: 15, fontWeight: '800', color: '#F97316' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  itemQty: { fontSize: 13, fontWeight: '700', color: '#F97316', width: 24 },
  itemName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  itemSub: { fontSize: 11, color: '#64748B' },
  itemPrice: { fontSize: 13, fontWeight: '700', color: '#0F172A' },

  backHomeBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 4 
  },
  backHomeText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
