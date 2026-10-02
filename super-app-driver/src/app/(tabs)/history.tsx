import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity,
  StatusBar, Platform, Modal, TextInput, Linking, Vibration, Alert,
  RefreshControl, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────
// CẤU TRÚC DỮ LIỆU CUỐC XE CHUẨN HOÁ
// (driver-trip-lifecycle & driver-wallet-reconciliation)
// ─────────────────────────────────────────
export interface TripItem {
  id: string; // '#VR-8899'
  serviceType: string; // 'V-Bike Siêu Tốc' | 'V-Car 4 chỗ' | 'V-Car 7 chỗ' | 'V-Express' | 'V-Food'
  serviceCategory: 'BIKE' | 'CAR' | 'EXPRESS' | 'FOOD';
  serviceIcon: keyof typeof Ionicons.glyphMap;
  dateStr: string; // 'Hôm nay, 14:10'
  fullTimeStr: string; // '14:10 - 14:32 • 02/10/2026'
  pickup: string;
  pickupLat: number;
  pickupLng: number;
  dropoff: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMin: number;
  paymentMethod: 'CASH' | 'ONLINE'; // Tiền mặt COD vs Thẻ / App
  baseFare: number;
  surgeFare: number; // Phụ phí cao điểm / ban đêm
  tipAmount: number; // Tiền boa tài xế hưởng 100%
  platformFeeRate: number; // 0.15 (15%)
  platformFee: number;
  driverEarnings: number; // (baseFare + surgeFare) * (1 - 0.15) + tipAmount
  status: 'COMPLETED' | 'CANCELLED';
  cancelReason?: string;
  cancelledBy?: 'CUSTOMER' | 'DRIVER' | 'SYSTEM';
  customerName: string;
  customerPhone: string;
  rating?: number;
  customerNote?: string;
  period: 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH';
}

const STORAGE_KEY_HISTORY = '@sunstar_driver_trip_history';

// Dữ liệu mẫu chuẩn nghiệp vụ vận hành
const INITIAL_TRIP_DATA: TripItem[] = [
  {
    id: 'VR-8899',
    serviceType: 'V-Bike Tiết Kiệm',
    serviceCategory: 'BIKE',
    serviceIcon: 'bicycle',
    dateStr: 'Hôm nay, 14:10',
    fullTimeStr: '14:10 - 14:32 • 02/10/2026',
    pickup: '128 Trần Duy Hưng, Trung Hòa, Cầu Giấy',
    pickupLat: 21.0084,
    pickupLng: 105.7995,
    dropoff: 'Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm',
    dropoffLat: 21.0168,
    dropoffLng: 105.7838,
    distanceKm: 3.8,
    durationMin: 22,
    paymentMethod: 'CASH', // Thu tiền mặt
    baseFare: 40000,
    surgeFare: 5000,
    tipAmount: 0,
    platformFeeRate: 0.15,
    platformFee: 6750,
    driverEarnings: 38250,
    status: 'COMPLETED',
    customerName: 'Hoàng Thị Linh',
    customerPhone: '0988123456',
    rating: 5.0,
    customerNote: 'Đón tại sảnh chính tòa nhà Charmvit',
    period: 'TODAY',
  },
  {
    id: 'VR-8898',
    serviceType: 'V-Car 4 Chỗ Êm Ái',
    serviceCategory: 'CAR',
    serviceIcon: 'car',
    dateStr: 'Hôm nay, 13:00',
    fullTimeStr: '13:00 - 13:38 • 02/10/2026',
    pickup: 'Đại học Quốc Gia Hà Nội, 144 Xuân Thủy, Cầu Giấy',
    pickupLat: 21.0378,
    pickupLng: 105.7816,
    dropoff: 'Hồ Gươm Plaza, 102 Trần Phú, Hà Đông',
    dropoffLat: 20.9841,
    dropoffLng: 105.7891,
    distanceKm: 8.5,
    durationMin: 38,
    paymentMethod: 'ONLINE', // Thanh toán qua App
    baseFare: 110000,
    surgeFare: 10000,
    tipAmount: 15000,
    platformFeeRate: 0.15,
    platformFee: 18000,
    driverEarnings: 117000, // 102.000 + 15.000 tip
    status: 'COMPLETED',
    customerName: 'Trần Văn Mạnh',
    customerPhone: '0912345678',
    rating: 5.0,
    customerNote: 'Bật điều hòa giúp mình nhé tài xế',
    period: 'TODAY',
  },
  {
    id: 'VR-8895',
    serviceType: 'V-Express Giao Hàng Siêu Tốc',
    serviceCategory: 'EXPRESS',
    serviceIcon: 'cube',
    dateStr: 'Hôm nay, 11:15',
    fullTimeStr: '11:15 - 11:42 • 02/10/2026',
    pickup: 'Kho Tổng Shopee Express, Mỹ Đình 2, Nam Từ Liêm',
    pickupLat: 21.0285,
    pickupLng: 105.7684,
    dropoff: '88 Láng Hạ, Đống Đa, Hà Nội',
    dropoffLat: 21.0162,
    dropoffLng: 105.8153,
    distanceKm: 6.2,
    durationMin: 27,
    paymentMethod: 'CASH',
    baseFare: 65000,
    surgeFare: 0,
    tipAmount: 0,
    platformFeeRate: 0.15,
    platformFee: 9750,
    driverEarnings: 55250,
    status: 'COMPLETED',
    customerName: 'Thu Trang (Giao kiện tài liệu)',
    customerPhone: '0977889900',
    rating: 4.8,
    customerNote: 'Kiện hàng hồ sơ quan trọng, giao tận tay phòng 602',
    period: 'TODAY',
  },
  {
    id: 'VR-8892',
    serviceType: 'V-Bike Tiết Kiệm',
    serviceCategory: 'BIKE',
    serviceIcon: 'bicycle',
    dateStr: 'Hôm nay, 09:40',
    fullTimeStr: '09:40 - 09:45 • 02/10/2026',
    pickup: 'Bến xe Mỹ Đình, Đường Phạm Hùng',
    pickupLat: 21.0285,
    pickupLng: 105.7784,
    dropoff: 'Đại học Sư Phạm Hà Nội, Cầu Giấy',
    dropoffLat: 21.0366,
    dropoffLng: 105.7825,
    distanceKm: 2.1,
    durationMin: 0,
    paymentMethod: 'CASH',
    baseFare: 28000,
    surgeFare: 0,
    tipAmount: 0,
    platformFeeRate: 0.15,
    platformFee: 0,
    driverEarnings: 0,
    status: 'CANCELLED',
    cancelReason: 'Khách đổi ý đi xe buýt sau khi tài xế đã di chuyển 1km',
    cancelledBy: 'CUSTOMER',
    customerName: 'Đặng Quốc Tuấn',
    customerPhone: '0933221100',
    period: 'TODAY',
  },
  {
    id: 'VR-8884',
    serviceType: 'V-Car 7 Chỗ Sân Bay',
    serviceCategory: 'CAR',
    serviceIcon: 'car-sport',
    dateStr: 'Hôm qua, 21:05',
    fullTimeStr: '21:05 - 21:48 • 01/10/2026',
    pickup: 'Sân bay Quốc tế Nội Bài (Cột số 5, Ga T1)',
    pickupLat: 21.2187,
    pickupLng: 105.8041,
    dropoff: 'Khách sạn Melia, 44 Lý Thường Kiệt, Hoàn Kiếm',
    dropoffLat: 21.0252,
    dropoffLng: 105.8494,
    distanceKm: 28.5,
    durationMin: 43,
    paymentMethod: 'ONLINE',
    baseFare: 300000,
    surgeFare: 20000, // Phụ phí đêm sân bay
    tipAmount: 30000,
    platformFeeRate: 0.15,
    platformFee: 48000,
    driverEarnings: 302000, // (320.000 * 0.85) + 30.000 = 302.000đ
    status: 'COMPLETED',
    customerName: 'David Miller',
    customerPhone: '0909998888',
    rating: 5.0,
    customerNote: 'Khách có 3 vali lớn, tài xế hỗ trợ nhiệt tình',
    period: 'YESTERDAY',
  },
  {
    id: 'VR-8879',
    serviceType: 'V-Food Giao Thức Ăn',
    serviceCategory: 'FOOD',
    serviceIcon: 'fast-food',
    dateStr: 'Hôm qua, 18:30',
    fullTimeStr: '18:30 - 18:55 • 01/10/2026',
    pickup: 'Quán Cơm Tấm Sà Bì Chưởng, 86 Nguyễn Trãi, Thanh Xuân',
    pickupLat: 20.9995,
    pickupLng: 105.8152,
    dropoff: 'Chung cư Vinhomes Royal City (Tòa R3), Thanh Xuân',
    dropoffLat: 21.0028,
    dropoffLng: 105.8164,
    distanceKm: 1.8,
    durationMin: 25,
    paymentMethod: 'ONLINE',
    baseFare: 35000,
    surgeFare: 5000,
    tipAmount: 10000,
    platformFeeRate: 0.15,
    platformFee: 6000,
    driverEarnings: 44000,
    status: 'COMPLETED',
    customerName: 'Lê Minh Anh',
    customerPhone: '0944556677',
    rating: 5.0,
    customerNote: 'Giao lên sảnh R3, để đồ tại bàn bảo vệ',
    period: 'YESTERDAY',
  },
  {
    id: 'VR-8870',
    serviceType: 'V-Car 4 Chỗ Êm Ái',
    serviceCategory: 'CAR',
    serviceIcon: 'car',
    dateStr: '30/09, 16:45',
    fullTimeStr: '16:45 - 17:35 • 30/09/2026',
    pickup: 'Khu Công Nghệ Cao Hòa Lạc, Thạch Thất',
    pickupLat: 21.0125,
    pickupLng: 105.5255,
    dropoff: 'Tòa nhà The Manor, Mễ Trì, Nam Từ Liêm',
    dropoffLat: 21.0135,
    dropoffLng: 105.7765,
    distanceKm: 26.2,
    durationMin: 50,
    paymentMethod: 'CASH',
    baseFare: 260000,
    surgeFare: 20000,
    tipAmount: 20000,
    platformFeeRate: 0.15,
    platformFee: 42000,
    driverEarnings: 258000,
    status: 'COMPLETED',
    customerName: 'Nguyễn Thành Nam',
    customerPhone: '0966778899',
    rating: 5.0,
    period: 'WEEK',
  },
];

export default function DriverHistoryScreen() {
  // Danh sách cuốc xe
  const [trips, setTrips] = useState<TripItem[]>(INITIAL_TRIP_DATA);
  const [refreshing, setRefreshing] = useState(false);

  // Bộ lọc
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'COMPLETED' | 'CANCELLED' | 'CASH' | 'ONLINE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Chi tiết Chuyến Đi
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Modal Báo cáo Sự Cố / Khiếu Nại (Dispute Center)
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeType, setDisputeType] = useState<'LOST_ITEM' | 'UNPAID_CASH' | 'WRONG_FARE' | 'UNFAIR_RATING' | 'OTHER'>('LOST_ITEM');
  const [disputeNote, setDisputeNote] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  // Modal Sao Kê Đối Soát
  const [showStatementModal, setShowStatementModal] = useState(false);

  // ─────────────────────────────────────────
  // 1. TẢI VÀ LƯU OFFLINE CACHE (offline-resilient-sync)
  // ─────────────────────────────────────────
  useEffect(() => {
    loadCachedTrips();
  }, []);

  const loadCachedTrips = async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTrips(parsed);
        }
      } else {
        // Lưu mẫu ban đầu
        await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(INITIAL_TRIP_DATA));
      }
    } catch (e) {
      console.warn('Lỗi đọc cache lịch sử:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic();
    // Giả lập đồng bộ API server
    setTimeout(async () => {
      setRefreshing(false);
      Alert.alert('Đã cập nhật', 'Dữ liệu lịch sử cuốc xe đã được đồng bộ mới nhất.');
    }, 800);
  };

  // ─────────────────────────────────────────
  // 2. RUNG HAPTICS & PHẦN CỨNG (driver-hardware-ux)
  // ─────────────────────────────────────────
  const triggerHaptic = (duration = 20) => {
    try {
      Vibration.vibrate(duration);
    } catch {
      // Bỏ qua nếu thiết bị không hỗ trợ rung
    }
  };

  const handleCallCustomer = (phone: string) => {
    triggerHaptic(40);
    Alert.alert(
      'Liên hệ khách hàng',
      `Bạn muốn gọi điện đến số: ${phone}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gọi ngay',
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch(() => {
              Alert.alert('Không thể mở ứng dụng cuộc gọi');
            });
          }
        }
      ]
    );
  };

  const handleOpenGoogleMaps = (trip: TripItem) => {
    triggerHaptic(40);
    const destinationUrl = `https://www.google.com/maps/dir/?api=1&origin=${trip.pickupLat},${trip.pickupLng}&destination=${trip.dropoffLat},${trip.dropoffLng}&travelmode=driving`;
    Linking.openURL(destinationUrl).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở ứng dụng Google Maps dẫn đường.');
    });
  };

  const handleCallHotline = () => {
    triggerHaptic(40);
    Linking.openURL('tel:19006868').catch(() => {
      Alert.alert('Hotline', 'Vui lòng quay số 1900 6868 trên bàn phím.');
    });
  };

  // ─────────────────────────────────────────
  // 3. BỘ LỌC ĐA TẦNG VÀ TÌM KIẾM
  // ─────────────────────────────────────────
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      // Lọc theo chu kỳ thời gian
      if (selectedPeriod !== 'ALL' && t.period !== selectedPeriod) {
        return false;
      }
      // Lọc theo trạng thái / phương thức thanh toán
      if (selectedStatus === 'COMPLETED' && t.status !== 'COMPLETED') return false;
      if (selectedStatus === 'CANCELLED' && t.status !== 'CANCELLED') return false;
      if (selectedStatus === 'CASH' && t.paymentMethod !== 'CASH') return false;
      if (selectedStatus === 'ONLINE' && t.paymentMethod !== 'ONLINE') return false;

      // Lọc theo thanh tìm kiếm
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchCode = t.id.toLowerCase().includes(query);
        const matchName = t.customerName.toLowerCase().includes(query);
        const matchPickup = t.pickup.toLowerCase().includes(query);
        const matchDropoff = t.dropoff.toLowerCase().includes(query);
        const matchService = t.serviceType.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchPickup && !matchDropoff && !matchService) {
          return false;
        }
      }
      return true;
    });
  }, [trips, selectedPeriod, selectedStatus, searchQuery]);

  // Thống kê tóm tắt theo danh sách đã lọc
  const summary = useMemo(() => {
    const completedList = filteredTrips.filter((t) => t.status === 'COMPLETED');
    const totalEarnings = completedList.reduce((acc, cur) => acc + cur.driverEarnings, 0);
    const totalDistance = completedList.reduce((acc, cur) => acc + cur.distanceKm, 0);
    const totalTripsCount = filteredTrips.length;
    const completionRate = totalTripsCount > 0 ? Math.round((completedList.length / totalTripsCount) * 100) : 100;

    return {
      completedCount: completedList.length,
      cancelledCount: totalTripsCount - completedList.length,
      totalEarnings,
      totalDistance: Math.round(totalDistance * 10) / 10,
      completionRate,
    };
  }, [filteredTrips]);

  // ─────────────────────────────────────────
  // 4. XỬ LÝ KHIẾU NẠI & BÁO CÁO SỰ CỐ
  // ─────────────────────────────────────────
  const handleSubmitDispute = () => {
    triggerHaptic(50);
    if (!disputeNote.trim() && disputeType === 'OTHER') {
      Alert.alert('Thông báo', 'Vui lòng nhập mô tả chi tiết sự cố cần hỗ trợ.');
      return;
    }
    setDisputeSuccess(true);
    setTimeout(() => {
      setDisputeSuccess(false);
      setShowDisputeModal(false);
      setDisputeNote('');
      Alert.alert(
        'Đã tiếp nhận khiếu nại',
        `Mã xử lý: #CS-${Math.floor(100000 + Math.random() * 900000)}. Đội ngũ hỗ trợ đối soát Sunstar sẽ liên hệ tài xế trong tối đa 15 phút.`
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER TỔNG THỂ */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Lịch Sử Hoạt Động</Text>
            <View style={styles.syncRow}>
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>Đồng bộ ngoại tuyến 💾 • {trips.length} chuyến</Text>
            </View>
          </View>

          {/* Nút Xuất Sao Kê Đối Soát */}
          <TouchableOpacity
            style={styles.statementBtn}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic(20);
              setShowStatementModal(true);
            }}
          >
            <Ionicons name="document-text-outline" size={16} color="#0088FF" />
            <Text style={styles.statementBtnText}>Sao kê</Text>
          </TouchableOpacity>
        </View>

        {/* THANH TÌM KIẾM TỨC THÌ */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo Mã chuyến (#VR-), tên khách, điểm đón/trả..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0088FF']} />}
      >
        {/* WIDGET TỔNG KẾT HIỆU SUẤT & THU NHẬP */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="analytics" size={18} color="#0088FF" />
              <Text style={styles.summaryTitle}>
                {selectedPeriod === 'ALL'
                  ? 'Tổng kết toàn bộ'
                  : selectedPeriod === 'TODAY'
                  ? 'Hiệu suất hôm nay'
                  : selectedPeriod === 'YESTERDAY'
                  ? 'Hiệu suất hôm qua'
                  : selectedPeriod === 'WEEK'
                  ? 'Hiệu suất 7 ngày qua'
                  : 'Hiệu suất tháng này'}
              </Text>
            </View>
            <View style={styles.completionTag}>
              <Text style={styles.completionTagText}>Hoàn thành: {summary.completionRate}%</Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>{summary.completedCount}</Text>
              <Text style={styles.summaryLabel}>Cuốc hoàn tất</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>{summary.totalDistance} <Text style={{ fontSize: 11 }}>km</Text></Text>
              <Text style={styles.summaryLabel}>Quãng đường</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryItem, { flex: 1.3 }]}>
              <Text style={styles.summaryEarnings}>+{summary.totalEarnings.toLocaleString('vi-VN')}đ</Text>
              <Text style={styles.summaryLabel}>Thực nhận về ví</Text>
            </View>
          </View>
        </View>

        {/* BỘ LỌC CHU KỲ THỜI GIAN */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
          {[
            { id: 'ALL', label: 'Tất cả thời gian' },
            { id: 'TODAY', label: 'Hôm nay' },
            { id: 'YESTERDAY', label: 'Hôm qua' },
            { id: 'WEEK', label: '7 ngày qua' },
            { id: 'MONTH', label: 'Tháng này' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.periodTab, selectedPeriod === tab.id && styles.periodTabActive]}
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic(15);
                setSelectedPeriod(tab.id as any);
              }}
            >
              <Text style={[styles.periodTabText, selectedPeriod === tab.id && styles.periodTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* BỘ LỌC TRẠNG THÁI & HÌNH THỨC THANH TOÁN (driver-wallet-reconciliation) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'Tất cả trạng thái', icon: 'layers-outline' },
            { id: 'COMPLETED', label: 'Hoàn thành', icon: 'checkmark-circle-outline' },
            { id: 'CANCELLED', label: 'Đã hủy', icon: 'close-circle-outline' },
            { id: 'CASH', label: 'Thu tiền mặt (COD)', icon: 'cash-outline' },
            { id: 'ONLINE', label: 'Thanh toán App', icon: 'card-outline' },
          ].map((f) => {
            const isActive = selectedStatus === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic(15);
                  setSelectedStatus(f.id as any);
                }}
              >
                <Ionicons
                  name={f.icon as any}
                  size={14}
                  color={isActive ? '#FFFFFF' : '#475569'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* THÔNG BÁO SỐ LƯỢNG KẾT QUẢ */}
        <View style={styles.resultCountRow}>
          <Text style={styles.resultCountText}>
            Hiển thị <Text style={{ fontWeight: '800', color: '#0F172A' }}>{filteredTrips.length}</Text> chuyến đi
          </Text>
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Xóa tìm kiếm</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* DANH SÁCH CÁC THẺ CHUYẾN ĐI (Rich Trip Card) */}
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={54} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không tìm thấy chuyến đi nào</Text>
            <Text style={styles.emptySub}>
              Thử thay đổi bộ lọc thời gian hoặc từ khóa tìm kiếm để xem các chuyến đi khác.
            </Text>
          </View>
        ) : (
          filteredTrips.map((trip) => {
            const isCancelled = trip.status === 'CANCELLED';
            const isCash = trip.paymentMethod === 'CASH';

            return (
              <TouchableOpacity
                key={trip.id}
                style={[styles.tripCard, isCancelled && styles.tripCardCancelled]}
                activeOpacity={0.85}
                onPress={() => {
                  triggerHaptic(20);
                  setSelectedTrip(trip);
                  setShowDetailModal(true);
                }}
              >
                {/* Header Thẻ: Mã chuyến + Loại dịch vụ + Trạng thái */}
                <View style={styles.tripCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View
                      style={[
                        styles.serviceIconCircle,
                        trip.serviceCategory === 'BIKE' && { backgroundColor: '#E0F2FE' },
                        trip.serviceCategory === 'CAR' && { backgroundColor: '#EEF2FF' },
                        trip.serviceCategory === 'EXPRESS' && { backgroundColor: '#FEF3C7' },
                        trip.serviceCategory === 'FOOD' && { backgroundColor: '#FEE2E2' },
                      ]}
                    >
                      <Ionicons
                        name={trip.serviceIcon}
                        size={18}
                        color={
                          trip.serviceCategory === 'BIKE'
                            ? '#0284C7'
                            : trip.serviceCategory === 'CAR'
                            ? '#4F46E5'
                            : trip.serviceCategory === 'EXPRESS'
                            ? '#D97706'
                            : '#DC2626'
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.tripCode}>#{trip.id}</Text>
                        <Text style={styles.tripBullet}>•</Text>
                        <Text style={styles.tripService}>{trip.serviceType}</Text>
                      </View>
                      <Text style={styles.tripTime}>{trip.dateStr}</Text>
                    </View>
                  </View>

                  {/* Badge Trạng Thái */}
                  <View
                    style={[
                      styles.statusBadge,
                      isCancelled ? { backgroundColor: '#FEE2E2' } : { backgroundColor: '#D1FAE5' },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: isCancelled ? '#EF4444' : '#10B981' }
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: isCancelled ? '#EF4444' : '#059669' }
                      ]}
                    >
                      {isCancelled ? 'Đã hủy' : 'Hoàn tất'}
                    </Text>
                  </View>
                </View>

                {/* Khách hàng */}
                <View style={styles.customerBriefRow}>
                  <Ionicons name="person-circle-outline" size={16} color="#64748B" />
                  <Text style={styles.customerBriefText}>
                    Khách: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{trip.customerName}</Text>
                  </Text>
                  {trip.rating && (
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={11} color="#EAB308" />
                      <Text style={styles.ratingText}>{trip.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>

                {/* Lộ Trình (Điểm đón & Điểm trả) */}
                <View style={styles.routeBox}>
                  {/* Điểm đón */}
                  <View style={styles.routeRow}>
                    <View style={styles.pickupMarker} />
                    <Text style={styles.routeText} numberOfLines={1}>
                      {trip.pickup}
                    </Text>
                  </View>
                  {/* Đường nối */}
                  <View style={styles.routeDashedLine} />
                  {/* Điểm trả */}
                  <View style={styles.routeRow}>
                    <Ionicons name="location" size={14} color="#EF4444" style={{ marginLeft: -1, marginRight: 3 }} />
                    <Text style={styles.routeText} numberOfLines={1}>
                      {trip.dropoff}
                    </Text>
                  </View>
                </View>

                {/* Footer Thẻ: Hình thức thanh toán + Thực nhận */}
                <View style={styles.tripCardFooter}>
                  {/* Nhãn thanh toán phân biệt rõ ràng */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                      style={[
                        styles.paymentTag,
                        isCash
                          ? { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }
                          : { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
                      ]}
                    >
                      <Ionicons
                        name={isCash ? 'cash-outline' : 'card-outline'}
                        size={13}
                        color={isCash ? '#D97706' : '#2563EB'}
                      />
                      <Text style={[styles.paymentTagText, { color: isCash ? '#D97706' : '#2563EB' }]}>
                        {isCash ? 'TIỀN MẶT (COD)' : 'THANH TOÁN APP'}
                      </Text>
                    </View>
                    <Text style={styles.distanceTag}>{trip.distanceKm} km</Text>
                  </View>

                  {/* Giá trị thực nhận */}
                  <View style={{ alignItems: 'flex-end' }}>
                    {isCancelled ? (
                      <Text style={styles.cancelledText}>Hủy chuyến • 0đ</Text>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                        <Text style={styles.earningsSub}>Thực nhận:</Text>
                        <Text style={styles.earningsMain}>
                          +{trip.driverEarnings.toLocaleString('vi-VN')}đ
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Ghi chú lý do hủy nếu có */}
                {isCancelled && trip.cancelReason && (
                  <View style={styles.cancelReasonBox}>
                    <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                    <Text style={styles.cancelReasonLabel} numberOfLines={1}>
                      Lý do: {trip.cancelReason}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ─────────────────────────────────────────
          MODAL CHI TIẾT HÓA ĐƠN & ĐỐI SOÁT CUỐC XE
          (driver-trip-lifecycle & driver-wallet-reconciliation)
         ───────────────────────────────────────── */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.modalTitle}>Chi Tiết Cuốc Xe</Text>
                  <Text style={styles.modalTripId}>#{selectedTrip?.id}</Text>
                </View>
                <Text style={styles.modalSub}>{selectedTrip?.fullTimeStr}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowDetailModal(false)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedTrip && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '82%' }}>
                {/* 1. KHÁCH HÀNG & LIÊN HỆ (driver-hardware-ux) */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionHeaderTitle}>HÀNH KHÁCH</Text>
                  <View style={styles.customerCard}>
                    <View style={styles.customerAvatarWrap}>
                      <Ionicons name="person" size={24} color="#0088FF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerNameBig}>{selectedTrip.customerName}</Text>
                      <Text style={styles.customerPhoneText}>{selectedTrip.customerPhone}</Text>
                      {selectedTrip.customerNote && (
                        <Text style={styles.customerNoteText}>"{selectedTrip.customerNote}"</Text>
                      )}
                    </View>
                    {/* Nút Gọi Khách Nhanh */}
                    <TouchableOpacity
                      style={styles.callCustomerBtn}
                      activeOpacity={0.8}
                      onPress={() => handleCallCustomer(selectedTrip.customerPhone)}
                    >
                      <Ionicons name="call" size={18} color="#FFFFFF" />
                      <Text style={styles.callCustomerBtnText}>Gọi điện</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 2. LỘ TRÌNH & ĐIỀU HƯỚNG BẢN ĐỒ GOOGLE MAPS (driver-hardware-ux) */}
                <View style={styles.detailSection}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={styles.sectionHeaderTitle}>LỘ TRÌNH DI CHUYỂN</Text>
                    <TouchableOpacity
                      style={styles.googleMapsBtn}
                      activeOpacity={0.8}
                      onPress={() => handleOpenGoogleMaps(selectedTrip)}
                    >
                      <Ionicons name="map-outline" size={14} color="#0088FF" />
                      <Text style={styles.googleMapsBtnText}>Mở Google Maps</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.routeDetailBox}>
                    <View style={styles.routeRow}>
                      <View style={styles.pickupMarker} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pointLabel}>ĐIỂM ĐÓN KHÁCH</Text>
                        <Text style={styles.pointAddress}>{selectedTrip.pickup}</Text>
                      </View>
                    </View>

                    <View style={styles.routeDashedLineLong} />

                    <View style={styles.routeRow}>
                      <Ionicons name="location" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pointLabelRed}>ĐIỂM TRẢ KHÁCH</Text>
                        <Text style={styles.pointAddress}>{selectedTrip.dropoff}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Thông số quãng đường & thời gian */}
                  <View style={styles.tripMetricsRow}>
                    <View style={styles.metricItem}>
                      <Ionicons name="speedometer-outline" size={15} color="#64748B" />
                      <Text style={styles.metricText}>Cự ly: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{selectedTrip.distanceKm} km</Text></Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                      <Ionicons name="time-outline" size={15} color="#64748B" />
                      <Text style={styles.metricText}>Thời gian: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{selectedTrip.durationMin} phút</Text></Text>
                    </View>
                  </View>
                </View>

                {/* 3. BẢNG KÊ ĐỐI SOÁT HẠCH TOÁN TÀI CHÍNH (driver-wallet-reconciliation) */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionHeaderTitle}>HẠCH TOÁN CƯỚC PHÍ CHI TIẾT</Text>

                  {/* Banner phương thức thanh toán */}
                  <View
                    style={[
                      styles.paymentBannerBig,
                      selectedTrip.paymentMethod === 'CASH'
                        ? { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }
                        : { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
                    ]}
                  >
                    <Ionicons
                      name={selectedTrip.paymentMethod === 'CASH' ? 'cash' : 'card'}
                      size={20}
                      color={selectedTrip.paymentMethod === 'CASH' ? '#D97706' : '#2563EB'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.paymentBannerTitle,
                          { color: selectedTrip.paymentMethod === 'CASH' ? '#B45309' : '#1D4ED8' }
                        ]}
                      >
                        {selectedTrip.paymentMethod === 'CASH'
                          ? 'ĐÃ THU TIỀN MẶT TỪ KHÁCH'
                          : 'THANH TOÁN ONLINE QUA APP (0Đ TIỀN MẶT)'}
                      </Text>
                      <Text style={styles.paymentBannerDesc}>
                        {selectedTrip.paymentMethod === 'CASH'
                          ? 'Tài xế đã cầm đủ tiền mặt của khách. Hệ thống tự động trừ phí sàn 15% vào Ví Ký Quỹ.'
                          : 'Khách thanh toán trước qua Ngân hàng / Thẻ. Cước thực nhận đã cộng thẳng vào Ví Thu Nhập.'}
                      </Text>
                    </View>
                  </View>

                  {/* Các mục hạch toán */}
                  <View style={styles.financialSheet}>
                    <View style={styles.financialRow}>
                      <Text style={styles.finLabel}>Giá cước gốc chuyến đi</Text>
                      <Text style={styles.finVal}>{selectedTrip.baseFare.toLocaleString('vi-VN')}đ</Text>
                    </View>

                    {selectedTrip.surgeFare > 0 && (
                      <View style={styles.financialRow}>
                        <Text style={styles.finLabel}>Phụ phí giờ cao điểm / đêm</Text>
                        <Text style={styles.finVal}>+{selectedTrip.surgeFare.toLocaleString('vi-VN')}đ</Text>
                      </View>
                    )}

                    {selectedTrip.tipAmount > 0 && (
                      <View style={styles.financialRow}>
                        <Text style={styles.finLabelTip}>Tiền tip / boa của khách (100%)</Text>
                        <Text style={styles.finValTip}>+{selectedTrip.tipAmount.toLocaleString('vi-VN')}đ</Text>
                      </View>
                    )}

                    <View style={styles.financialRow}>
                      <Text style={styles.finLabelFee}>Chiết khấu phí sàn Sunstar (15%)</Text>
                      <Text style={styles.finValFee}>-{selectedTrip.platformFee.toLocaleString('vi-VN')}đ</Text>
                    </View>

                    <View style={styles.financialDivider} />

                    {/* DÒNG THỰC NHẬN TỔNG KẾT */}
                    <View style={styles.financialRowTotal}>
                      <View>
                        <Text style={styles.totalLabel}>TÀI XẾ THỰC NHẬN</Text>
                        <Text style={styles.totalSub}>Đã đối soát vào ví</Text>
                      </View>
                      <Text style={styles.totalVal}>
                        +{selectedTrip.driverEarnings.toLocaleString('vi-VN')}đ
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 4. TRUNG TÂM BÁO CÁO SỰ CỐ & KHIẾU NẠI (Dispute / Support System) */}
                <View style={styles.disputeSection}>
                  <TouchableOpacity
                    style={styles.disputeTriggerBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      triggerHaptic(25);
                      setShowDisputeModal(true);
                    }}
                  >
                    <Ionicons name="shield-alert" size={18} color="#EA580C" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.disputeTriggerTitle}>Báo cáo sự cố hoặc khiếu nại cuốc xe này</Text>
                      <Text style={styles.disputeTriggerSub}>
                        Khách để quên đồ, bùng tiền mặt, sai cước phí, đánh giá oan
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Nút gọi khẩn cấp hỗ trợ */}
                  <TouchableOpacity
                    style={styles.supportHotlineRow}
                    activeOpacity={0.7}
                    onPress={handleCallHotline}
                  >
                    <Ionicons name="headset-outline" size={16} color="#64748B" />
                    <Text style={styles.supportHotlineText}>
                      Tổng đài hỗ trợ đối soát 24/7: <Text style={{ color: '#0088FF', fontWeight: '700' }}>1900 6868</Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 30 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL TRUNG TÂM KHIẾU NẠI CUỐC XE (Dispute Center)
         ───────────────────────────────────────── */}
      <Modal
        visible={showDisputeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisputeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-checkmark" size={22} color="#EA580C" />
                <Text style={styles.modalTitle}>Khiếu Nại & Báo Cáo Sự Cố</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDisputeModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.disputePrompt}>
                Vui lòng chọn loại sự cố xảy ra trong chuyến đi #{selectedTrip?.id}:
              </Text>

              {/* Lựa chọn danh mục khiếu nại */}
              {[
                {
                  id: 'LOST_ITEM',
                  title: 'Hành khách để quên đồ trên xe',
                  desc: 'Hỗ trợ kết nối bảo mật với khách để trao trả tài sản',
                  icon: 'briefcase-outline'
                },
                {
                  id: 'UNPAID_CASH',
                  title: 'Khách chưa trả tiền mặt / Bùng tiền',
                  desc: 'Yêu cầu bồi hoàn cước phí từ Quỹ bảo hiểm tài xế Sunstar',
                  icon: 'cash-outline'
                },
                {
                  id: 'WRONG_FARE',
                  title: 'Sai lệch lộ trình / Tính sai cước phí km',
                  desc: 'Hệ thống kiểm tra lại GPS và hiệu chỉnh số dư ví',
                  icon: 'calculator-outline'
                },
                {
                  id: 'UNFAIR_RATING',
                  title: 'Khách đánh giá sao xấu oan uổng',
                  desc: 'Gửi biên bản giải trình để bảo vệ chỉ số sao của bạn',
                  icon: 'star-half-outline'
                },
                {
                  id: 'OTHER',
                  title: 'Sự cố khác (Giao thông, tranh cãi, tai nạn)',
                  desc: 'Mô tả chi tiết để nhân viên CSKH can thiệp trực tiếp',
                  icon: 'help-circle-outline'
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.disputeOptionCard,
                    disputeType === item.id && styles.disputeOptionActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    triggerHaptic(15);
                    setDisputeType(item.id as any);
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={disputeType === item.id ? '#EA580C' : '#64748B'}
                    style={{ marginTop: 2 }}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      style={[
                        styles.disputeOptionTitle,
                        disputeType === item.id && { color: '#EA580C', fontWeight: '800' }
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.disputeOptionDesc}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Ô Nhập mô tả thêm */}
              <Text style={[styles.sectionHeaderTitle, { marginTop: 14, marginBottom: 6 }]}>
                MÔ TẢ CHI TIẾT SỰ VIỆC
              </Text>
              <TextInput
                style={styles.disputeInput}
                placeholder="Nhập ghi chú thêm, đặc điểm món đồ quên hoặc diễn biến sự việc..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={disputeNote}
                onChangeText={setDisputeNote}
              />

              {/* Nút gửi khiếu nại */}
              <TouchableOpacity
                style={styles.submitDisputeBtn}
                activeOpacity={0.85}
                onPress={handleSubmitDispute}
              >
                <Text style={styles.submitDisputeBtnText}>
                  {disputeSuccess ? 'Đang gửi hồ sơ...' : 'Gửi Khiếu Nại Lên Hệ Thống'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL SAO KÊ ĐỐI SOÁT CUỐC XE
          (Statement / Report Modal)
         ───────────────────────────────────────── */}
      <Modal
        visible={showStatementModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="document-text" size={22} color="#0088FF" />
                <Text style={styles.modalTitle}>Bản Sao Kê Đối Soát Thu Nhập</Text>
              </View>
              <TouchableOpacity onPress={() => setShowStatementModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.statementBox}>
                <Text style={styles.statementOrgName}>CÔNG TY CP TẬP ĐOÀN SUNSTAR</Text>
                <Text style={styles.statementSub}>Hệ Thống Quản Lý Điều Hành Vận Tải Công Nghệ</Text>
                <View style={styles.statementDivider} />

                <Text style={styles.statementPeriodText}>
                  Kỳ báo cáo: <Text style={{ fontWeight: '700' }}>{selectedPeriod === 'ALL' ? 'Toàn bộ thời gian' : selectedPeriod}</Text>
                </Text>

                <View style={styles.statementRow}>
                  <Text style={styles.statementLabel}>Tổng số cuốc nhận:</Text>
                  <Text style={styles.statementVal}>{trips.length} chuyến</Text>
                </View>
                <View style={styles.statementRow}>
                  <Text style={styles.statementLabel}>Số chuyến hoàn tất:</Text>
                  <Text style={styles.statementValBold}>{summary.completedCount} chuyến</Text>
                </View>
                <View style={styles.statementRow}>
                  <Text style={styles.statementLabel}>Số chuyến hủy:</Text>
                  <Text style={styles.statementValRed}>{summary.cancelledCount} chuyến</Text>
                </View>
                <View style={styles.statementRow}>
                  <Text style={styles.statementLabel}>Tổng cự ly lăn bánh:</Text>
                  <Text style={styles.statementVal}>{summary.totalDistance} km</Text>
                </View>
                <View style={styles.statementRow}>
                  <Text style={styles.statementLabel}>Tỷ lệ hoàn thành:</Text>
                  <Text style={styles.statementValGreen}>{summary.completionRate}%</Text>
                </View>

                <View style={styles.statementDivider} />

                <View style={styles.statementRowBig}>
                  <Text style={styles.statementTotalLabel}>TỔNG THU NHẬP RÒNG:</Text>
                  <Text style={styles.statementTotalVal}>+{summary.totalEarnings.toLocaleString('vi-VN')}đ</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.exportPdfBtn}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic(30);
                  Alert.alert('Thành công', 'Đã lưu bản sao kê đối soát PDF vào bộ nhớ thiết bị.');
                  setShowStatementModal(false);
                }}
              >
                <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
                <Text style={styles.exportPdfBtnText}>Tải & Chia Sẻ Bản Sao Kê</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 21, fontWeight: '900', color: '#0F172A', letterSpacing: -0.3 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  syncText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  statementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statementBtnText: { fontSize: 12, fontWeight: '700', color: '#0088FF' },

  // Thanh tìm kiếm
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },

  content: { padding: 16 },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryTitle: { fontSize: 13, fontWeight: '800', color: '#334155' },
  completionTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completionTagText: { fontSize: 11, fontWeight: '800', color: '#059669' },
  summaryGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 32, backgroundColor: '#F1F5F9' },
  summaryNum: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  summaryEarnings: { fontSize: 18, fontWeight: '900', color: '#059669' },
  summaryLabel: { fontSize: 11, color: '#94A3B8', marginTop: 3 },

  // Period Tabs
  periodScroll: { flexDirection: 'row', marginBottom: 10 },
  periodTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodTabActive: { backgroundColor: '#0088FF', borderColor: '#0088FF' },
  periodTabText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  periodTabTextActive: { color: '#FFFFFF', fontWeight: '800' },

  // Filter Chips
  filterScroll: { flexDirection: 'row', marginBottom: 12 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterChipTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // Result Count
  resultCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  resultCountText: { fontSize: 12, color: '#64748B' },
  clearSearchText: { fontSize: 12, color: '#0088FF', fontWeight: '700' },

  // Trip Card
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  tripCardCancelled: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFDFD',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 10,
    marginBottom: 8,
  },
  serviceIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripCode: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  tripBullet: { fontSize: 12, color: '#CBD5E1' },
  tripService: { fontSize: 12, fontWeight: '600', color: '#475569' },
  tripTime: { fontSize: 11, color: '#94A3B8', marginTop: 1 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },

  customerBriefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  customerBriefText: { fontSize: 12, color: '#64748B' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  ratingText: { fontSize: 10, fontWeight: '800', color: '#854D0E' },

  routeBox: { paddingVertical: 2 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pickupMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 2,
    marginRight: 2,
  },
  routeDashedLine: {
    width: 2,
    height: 12,
    backgroundColor: '#CBD5E1',
    marginLeft: 5,
    marginVertical: 2,
  },
  routeDashedLineLong: {
    width: 2,
    height: 22,
    backgroundColor: '#CBD5E1',
    marginLeft: 5,
    marginVertical: 4,
  },
  routeText: { flex: 1, fontSize: 12.5, color: '#334155', fontWeight: '500' },

  tripCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paymentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
  },
  paymentTagText: { fontSize: 10, fontWeight: '800' },
  distanceTag: { fontSize: 11, color: '#64748B', fontWeight: '600' },

  earningsSub: { fontSize: 11, color: '#64748B' },
  earningsMain: { fontSize: 15, fontWeight: '900', color: '#059669' },
  cancelledText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  cancelReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  cancelReasonLabel: { fontSize: 11, color: '#EF4444', fontStyle: 'italic', flex: 1 },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 18 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  modalTripId: { fontSize: 14, fontWeight: '800', color: '#0088FF' },
  modalSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailSection: { marginBottom: 16 },
  sectionHeaderTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 8 },

  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  customerAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerNameBig: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  customerPhoneText: { fontSize: 12, color: '#64748B', marginTop: 1 },
  customerNoteText: { fontSize: 11, color: '#D97706', fontStyle: 'italic', marginTop: 3 },
  callCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  callCustomerBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  googleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  googleMapsBtnText: { fontSize: 11, fontWeight: '700', color: '#0088FF' },

  routeDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pointLabel: { fontSize: 10, fontWeight: '800', color: '#059669', marginBottom: 2 },
  pointLabelRed: { fontSize: 10, fontWeight: '800', color: '#DC2626', marginBottom: 2 },
  pointAddress: { fontSize: 13, fontWeight: '600', color: '#1E293B', lineHeight: 18 },

  tripMetricsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  metricDivider: { width: 1, height: 18, backgroundColor: '#E2E8F0' },
  metricText: { fontSize: 12, color: '#64748B' },

  paymentBannerBig: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  paymentBannerTitle: { fontSize: 12, fontWeight: '800', marginBottom: 2 },
  paymentBannerDesc: { fontSize: 11, color: '#475569', lineHeight: 16 },

  financialSheet: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  finLabel: { fontSize: 12.5, color: '#64748B' },
  finVal: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  finLabelTip: { fontSize: 12.5, color: '#059669', fontWeight: '600' },
  finValTip: { fontSize: 13, fontWeight: '800', color: '#059669' },
  finLabelFee: { fontSize: 12.5, color: '#DC2626' },
  finValFee: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  financialDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },

  financialRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  totalSub: { fontSize: 11, color: '#059669', marginTop: 1 },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#059669' },

  disputeSection: { marginTop: 4, marginBottom: 12 },
  disputeTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  disputeTriggerTitle: { fontSize: 13, fontWeight: '800', color: '#C2410C' },
  disputeTriggerSub: { fontSize: 11, color: '#9A3412', marginTop: 2 },
  supportHotlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  supportHotlineText: { fontSize: 12, color: '#64748B' },

  // Dispute Modal
  disputePrompt: { fontSize: 13, color: '#475569', marginBottom: 12, lineHeight: 18 },
  disputeOptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  disputeOptionActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FB923C',
  },
  disputeOptionTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  disputeOptionDesc: { fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 },

  disputeInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 80,
  },
  submitDisputeBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  submitDisputeBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  // Statement Modal
  statementBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  statementOrgName: { fontSize: 14, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  statementSub: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 2 },
  statementDivider: { height: 1, backgroundColor: '#CBD5E1', marginVertical: 12 },
  statementPeriodText: { fontSize: 12, color: '#475569', marginBottom: 10 },
  statementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statementLabel: { fontSize: 12.5, color: '#64748B' },
  statementVal: { fontSize: 12.5, fontWeight: '600', color: '#1E293B' },
  statementValBold: { fontSize: 12.5, fontWeight: '800', color: '#0F172A' },
  statementValRed: { fontSize: 12.5, fontWeight: '800', color: '#EF4444' },
  statementValGreen: { fontSize: 12.5, fontWeight: '800', color: '#059669' },
  statementRowBig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  statementTotalLabel: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  statementTotalVal: { fontSize: 18, fontWeight: '900', color: '#059669' },

  exportPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0088FF',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  exportPdfBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
