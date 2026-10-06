import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import {
  movieService,
  BackendMovieOrder,
  BackendMovieTicket,
} from '../../services/movieService';

type HistoryFilterKey =
  | 'ALL'
  | 'HOLDING'
  | 'PAYMENT_PENDING'
  | 'ISSUED'
  | 'USED'
  | 'CANCELLED'
  | 'REFUNDED';

const FILTER_TABS: { key: HistoryFilterKey; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'ISSUED', label: 'Đã phát hành vé' },
  { key: 'HOLDING', label: 'Đang giữ ghế' },
  { key: 'PAYMENT_PENDING', label: 'Chờ thanh toán' },
  { key: 'USED', label: 'Đã sử dụng' },
  { key: 'CANCELLED', label: 'Đã hủy / Hết hạn' },
  { key: 'REFUNDED', label: 'Đã hoàn tiền' },
];

export default function MovieTicketHistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [orders, setOrders] = useState<BackendMovieOrder[]>([]);
  const [tickets, setTickets] = useState<BackendMovieTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<HistoryFilterKey>('ALL');

  const fetchHistory = useCallback(async () => {
    setErrorMessage(null);
    try {
      const [ordersData, ticketsData] = await Promise.all([
        movieService.getMyOrders(),
        movieService.getMyTickets(),
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tải lịch sử vé và đơn đặt phim từ máy chủ.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const classifyOrderCategory = (order: BackendMovieOrder): HistoryFilterKey => {
    const ticket =
      order.booking?.tickets?.[0] ||
      tickets.find(t => t.bookingId === order.booking?.id);

    if (
      order.status === 'REFUNDED' ||
      order.booking?.status === 'REFUNDED' ||
      order.booking?.status === 'REFUND_PENDING' ||
      ticket?.status === 'REFUNDED'
    ) {
      return 'REFUNDED';
    }

    if (
      order.status === 'CANCELLED' ||
      order.status === 'EXPIRED' ||
      order.booking?.status === 'CANCELLED' ||
      ticket?.status === 'CANCELLED'
    ) {
      return 'CANCELLED';
    }

    if (
      ticket?.status === 'PRINTED_AT_COUNTER' ||
      ticket?.status === 'CHECKED_IN'
    ) {
      return 'USED';
    }

    if (
      order.booking?.status === 'TICKET_ISSUED' ||
      ticket?.status === 'ISSUED'
    ) {
      return 'ISSUED';
    }

    if (
      order.status === 'PAYMENT_PENDING' ||
      order.booking?.status === 'BOOKING_CONFIRMING'
    ) {
      return 'PAYMENT_PENDING';
    }

    return 'HOLDING';
  };

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'ALL') return orders;
    return orders.filter(o => classifyOrderCategory(o) === activeFilter);
  }, [orders, tickets, activeFilter]);

  const getStatusBadgeInfo = (order: BackendMovieOrder) => {
    const cat = classifyOrderCategory(order);
    switch (cat) {
      case 'ISSUED':
        return { text: 'Đã phát hành vé', bg: '#DCFCE7', color: '#15803D' };
      case 'USED':
        return { text: 'Đã in vé / Sử dụng', bg: '#DBEAFE', color: '#1D4ED8' };
      case 'HOLDING':
        return { text: 'Đang giữ ghế', bg: '#FEF3C7', color: '#B45309' };
      case 'PAYMENT_PENDING':
        return {
          text:
            order.booking?.status === 'BOOKING_CONFIRMING'
              ? 'Đang xác nhận với Rạp'
              : 'Chờ thanh toán',
          bg: '#FEF3C7',
          color: '#D97706',
        };
      case 'REFUNDED':
        return {
          text:
            order.booking?.status === 'REFUND_PENDING'
              ? 'Đang hoàn tiền'
              : 'Đã hoàn tiền',
          bg: '#FEE2E2',
          color: '#DC2626',
        };
      case 'CANCELLED':
      default:
        return {
          text: order.status === 'EXPIRED' ? 'Hết hạn giữ ghế' : 'Đã hủy',
          bg: '#F1F5F9',
          color: '#64748B',
        };
    }
  };

  const handlePressOrder = (order: BackendMovieOrder) => {
    const ticket =
      order.booking?.tickets?.[0] ||
      tickets.find(t => t.bookingId === order.booking?.id);
    const ticketIdParam = ticket?.id || '';
    router.push(
      `/cinema/ticket-detail?ticketId=${encodeURIComponent(ticketIdParam)}&orderId=${encodeURIComponent(order.id)}` as any
    );
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cinema');
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>
            Lịch Sử Vé Xem Phim ({orders.length})
          </Text>
          <TouchableOpacity
            onPress={() => {
              setRefreshing(true);
              fetchHistory();
            }}
            style={styles.backBtn}
          >
            <Ionicons name="refresh" size={20} color="#E11D48" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
            {FILTER_TABS.map(tab => {
              const active = activeFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setActiveFilter(tab.key)}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchHistory();
              }}
            />
          }
        >
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#E11D48" />
              <Text style={styles.loadingText}>Đang tải lịch sử vé từ Server...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchHistory}>
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : filteredOrders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="ticket-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Chưa có vé hoặc đơn đặt nào</Text>
              <Text style={styles.emptySub}>
                Các vé xem phim đã phát hành và đơn đặt của bạn sẽ hiển thị tại đây.
              </Text>
            </View>
          ) : (
            filteredOrders.map(order => {
              const badge = getStatusBadgeInfo(order);
              const ticket =
                order.booking?.tickets?.[0] ||
                tickets.find(t => t.bookingId === order.booking?.id);
              const seatItems = (order.items || []).filter(i => i.itemType === 'SEAT');
              const seatCodes =
                ticket?.seatCodes?.join(', ') ||
                seatItems.map(i => i.seatCode || i.name).join(', ');

              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  activeOpacity={0.85}
                  onPress={() => handlePressOrder(order)}
                >
                  <View style={styles.cardTopRow}>
                    <Image
                      source={{
                        uri:
                          order.movie?.posterUrl ||
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
                      }}
                      style={styles.poster}
                    />
                    <View style={styles.metaCol}>
                      <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                            {badge.text}
                          </Text>
                        </View>
                        <Text style={styles.orderCodeText}>#{order.orderCode}</Text>
                      </View>

                      <Text style={styles.movieTitle} numberOfLines={1}>
                        {order.movie?.title || 'Vé xem phim V-Life'}
                      </Text>

                      <Text style={styles.cinemaText} numberOfLines={1}>
                        {order.cinema?.name}
                      </Text>

                      <Text style={styles.seatText}>Ghế: {seatCodes || 'Đang cập nhật'}</Text>

                      {ticket?.barcode ? (
                        <View style={styles.barcodeTag}>
                          <Ionicons name="barcode-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                          <Text style={styles.barcodeTagText}>Barcode: {ticket.barcode}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardBottomRow}>
                    <Text style={styles.totalText}>
                      Tổng tiền: {Number(order.totalAmount).toLocaleString('vi-VN')} đ
                    </Text>
                    <Text style={styles.actionLinkText}>
                      {ticket ? 'Xem vé & Mã Barcode →' : 'Xem chi tiết đơn →'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 20 }),
  },
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', width: '100%' },
  desktopFrame: {
    maxWidth: 390,
    maxHeight: 844,
    aspectRatio: 390 / 844,
    borderWidth: 12,
    borderColor: '#000',
    borderRadius: 44,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  filterBar: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterList: { paddingHorizontal: 12, gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterPillActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  filterPillText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterPillTextActive: { color: '#FFF', fontWeight: '700' },
  container: { flex: 1, padding: 14 },
  centerBox: { paddingVertical: 50, alignItems: 'center' },
  loadingText: { fontSize: 13, color: '#64748B', marginTop: 8 },
  errorBox: { padding: 20, backgroundColor: '#FEF2F2', borderRadius: 14, alignItems: 'center' },
  errorText: { fontSize: 13, color: '#DC2626', textAlign: 'center', marginBottom: 10 },
  retryBtn: { backgroundColor: '#E11D48', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 16 },
  retryBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  emptyBox: { paddingVertical: 60, alignItems: 'center', paddingHorizontal: 20 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#334155', marginTop: 10 },
  emptySub: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4 },

  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: { flexDirection: 'row' },
  poster: { width: 64, height: 92, borderRadius: 10, backgroundColor: '#E2E8F0' },
  metaCol: { flex: 1, marginLeft: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  orderCodeText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  movieTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  cinemaText: { fontSize: 12, color: '#475569', marginTop: 2 },
  seatText: { fontSize: 12, fontWeight: '700', color: '#E11D48', marginTop: 3 },
  barcodeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 5,
  },
  barcodeTagText: { fontSize: 11, fontWeight: '800', color: '#DC2626' },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalText: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  actionLinkText: { fontSize: 12, fontWeight: '700', color: '#E11D48' },
});
