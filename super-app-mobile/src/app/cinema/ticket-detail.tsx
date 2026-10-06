import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema } from '../../context/CinemaContext';
import {
  movieService,
  BackendMovieTicket,
  BackendMovieOrder,
  copyToDeviceClipboard,
} from '../../services/movieService';

export default function TicketDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ticketId?: string; orderId?: string }>();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const { booking, resetBooking } = useCinema();

  const [ticket, setTicket] = useState<BackendMovieTicket | null>(booking.issuedTicket);
  const [order, setOrder] = useState<BackendMovieOrder | null>(booking.serverOrder);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showZoomModal, setShowZoomModal] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadTicketFromServer = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const targetTicketId = params.ticketId || booking.ticketId || booking.issuedTicket?.id;
      const targetOrderId = params.orderId || booking.movieOrderId || booking.serverOrder?.id;

      if (targetTicketId) {
        const fetchedTicket = await movieService.getTicketById(String(targetTicketId));
        setTicket(fetchedTicket);
        if (fetchedTicket.booking?.movieOrder) {
          setOrder(fetchedTicket.booking.movieOrder);
        }
      } else if (targetOrderId) {
        const fetchedOrder = await movieService.getOrderById(String(targetOrderId));
        setOrder(fetchedOrder);
        const firstTicket = fetchedOrder.booking?.tickets?.[0] || null;
        if (firstTicket) {
          const fullTicket = await movieService
            .getTicketById(firstTicket.id)
            .catch(() => firstTicket);
          setTicket(fullTicket);
        } else {
          setTicket(null);
        }
      } else {
        // Fallback: load most recent issued ticket of current user
        const myTickets = await movieService.getMyTickets();
        if (myTickets.length > 0) {
          const fullTicket = await movieService
            .getTicketById(myTickets[0].id)
            .catch(() => myTickets[0]);
          setTicket(fullTicket);
          if (fullTicket.booking?.movieOrder) {
            setOrder(fullTicket.booking.movieOrder);
          }
        } else {
          setErrorMessage('Không tìm thấy thông tin vé xem phim đã phát hành.');
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tải chi tiết vé xem phim từ máy chủ.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }, [
    params.ticketId,
    params.orderId,
    booking.ticketId,
    booking.issuedTicket?.id,
    booking.movieOrderId,
    booking.serverOrder?.id,
  ]);

  useEffect(() => {
    loadTicketFromServer();
  }, [loadTicketFromServer]);

  const handleCopy = async (text: string, key: string) => {
    const ok = await copyToDeviceClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleGoHome = () => {
    resetBooking();
    router.replace('/cinema');
  };

  const handleGoToHistory = () => {
    resetBooking();
    router.replace('/cinema/tickets' as any);
  };

  const movieObj = ticket?.movie || order?.movie;
  const cinemaObj = ticket?.cinema || order?.cinema;
  const showtimeObj = ticket?.showtime || order?.showtime;
  const bookingObj = ticket?.booking || order?.booking;
  const orderObj = ticket?.booking?.movieOrder || order;

  const barcodeValue = ticket?.barcode || '';
  const ticketCode = ticket?.ticketCode || '';
  const bookingCode = bookingObj?.bookingCode || '';
  const partnerBookingCode = bookingObj?.partnerBookingCode || '';
  const seatCodesText =
    ticket?.seatCodes && ticket.seatCodes.length > 0
      ? ticket.seatCodes.join(', ')
      : (orderObj?.items || [])
          .filter(i => i.itemType === 'SEAT')
          .map(i => i.seatCode || i.name)
          .join(', ');

  const combosList =
    ticket?.comboSummary && Array.isArray(ticket.comboSummary)
      ? ticket.comboSummary
      : (orderObj?.items || [])
          .filter(i => i.itemType === 'COMBO')
          .map(i => ({ name: i.name, quantity: i.quantity, unitPrice: Number(i.unitPrice) }));

  const totalPaid = Number(orderObj?.totalAmount || 0);
  const showtimeDateStr = showtimeObj?.startTime
    ? new Date(showtimeObj.startTime).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : `${booking.time} • ${booking.dateLabel}`;

  const barcodeUrl = barcodeValue
    ? `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(barcodeValue)}&code=Code128&translate-esc=true`
    : '';

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={false} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoHome} style={styles.closeBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>
            Vé Xem Phim & Mã Barcode
          </Text>
          <TouchableOpacity onPress={loadTicketFromServer} style={styles.shareBtn}>
            <Ionicons name="refresh" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#E11D48" />
              <Text style={styles.loadingText}>Đang tải thông tin vé từ Server...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={44} color="#EF4444" />
              <Text style={styles.errorTitle}>Chưa thể hiển thị vé</Text>
              <Text style={styles.errorDesc}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadTicketFromServer}>
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : !ticket && order ? (
            /* Order exists but Ticket is not issued (e.g. REFUNDED / BOOKING_CONFIRMING / PENDING) */
            <View style={styles.errorCard}>
              <Ionicons
                name={
                  order.status === 'REFUNDED' || order.booking?.status === 'REFUND_PENDING'
                    ? 'shield-checkmark'
                    : 'time-outline'
                }
                size={46}
                color="#F59E0B"
              />
              <Text style={styles.errorTitle}>
                Trạng thái đơn #{order.orderCode}: {order.booking?.status || order.status}
              </Text>
              <Text style={styles.errorDesc}>
                {order.status === 'REFUNDED' || order.booking?.status === 'REFUND_PENDING'
                  ? 'Đơn đặt vé này không thể xuất vé từ phía rạp và đã được hoàn tiền về Ví V-Life. Hệ thống không sinh mã Barcode cho đơn hoàn tiền.'
                  : 'Đơn đặt vé đang chờ xác nhận hoàn tất từ hệ thống rạp.'}
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadTicketFromServer}>
                <Text style={styles.retryBtnText}>Kiểm tra lại trạng thái</Text>
              </TouchableOpacity>
            </View>
          ) : ticket ? (
            <>
              {/* Success Banner */}
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={42} color="#22C55E" />
                <Text style={[styles.successTitle, { fontFamily: theme.fontFamily }]}>
                  Đã phát hành vé ({ticket.status})
                </Text>
                <Text style={styles.successSubText}>
                  Loại vé: {ticket.ticketType} (Quét mã Barcode tại quầy / Kiosk rạp để in vé giấy)
                </Text>
              </View>

              {/* Ticket Stub Card */}
              <View style={styles.ticketCard}>
                <View style={styles.ticketBannerRow}>
                  <Image
                    source={{
                      uri:
                        movieObj?.posterUrl ||
                        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
                    }}
                    style={styles.ticketPoster}
                  />
                  <View style={styles.ticketMovieColumn}>
                    <View style={styles.formatTagBadge}>
                      <Text style={styles.formatTagText}>
                        {showtimeObj?.screeningFormat || '2D'} • {movieObj?.ageRating || 'T13'}
                      </Text>
                    </View>
                    <Text
                      style={[styles.ticketMovieTitle, { fontFamily: theme.fontFamily }]}
                      numberOfLines={2}
                    >
                      {movieObj?.title || 'Vé xem phim V-Life'}
                    </Text>

                    <View style={styles.codeCopyRow}>
                      <Text style={styles.ticketBookingCodeText}>
                        MÃ ĐẶT VÉ: <Text style={styles.codeHighlight}>{bookingCode}</Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.miniCopyBtn}
                        onPress={() => handleCopy(bookingCode, 'BOOKING_CODE')}
                      >
                        <Text style={styles.miniCopyText}>
                          {copiedKey === 'BOOKING_CODE' ? 'Đã chép' : 'Copy'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {partnerBookingCode ? (
                      <Text style={styles.partnerCodeText}>
                        Mã đối tác rạp: {partnerBookingCode}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Ticket Details Grid */}
                <View style={styles.ticketDetailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Cụm rạp</Text>
                    <Text style={styles.detailValue}>{cinemaObj?.name}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phòng chiếu</Text>
                    <Text style={styles.detailValue}>
                      {showtimeObj?.auditorium?.name || booking.roomName || 'Phòng chiếu'}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Suất chiếu</Text>
                    <Text style={styles.detailValue}>{showtimeDateStr}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Ghế ngồi</Text>
                    <Text style={[styles.detailValue, { color: '#E11D48', fontWeight: '800' }]}>
                      {seatCodesText}
                    </Text>
                  </View>

                  {combosList.length > 0 && (
                    <View style={styles.detailItemFull}>
                      <Text style={styles.detailLabel}>Combo bắp nước đi kèm</Text>
                      <Text style={styles.detailValue}>
                        {combosList.map(c => `${c.name} (x${c.quantity})`).join(', ')}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Mã vé (Ticket Code)</Text>
                    <Text style={styles.detailValue}>{ticketCode}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Tổng tiền đã thanh toán</Text>
                    <Text style={[styles.detailValue, { color: '#16A34A' }]}>
                      {totalPaid.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                </View>

                {/* Perforated Divider */}
                <View style={styles.perforatedContainer}>
                  <View style={styles.notchLeft} />
                  <View style={styles.dashedLine} />
                  <View style={styles.notchRight} />
                </View>

                {/* Code128 Barcode Section (PRINT_AT_COUNTER) */}
                <View style={styles.barcodeSection}>
                  <View style={styles.scanReadyBadge}>
                    <Ionicons name="barcode-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                    <Text style={styles.scanReadyText}>
                      MÃ BARCODE IN VÉ TẠI QUẦY / KIOSK RẠP (PRINT_AT_COUNTER)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.barcodeBoxContainer}
                    onPress={() => setShowZoomModal(true)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: barcodeUrl }}
                      style={styles.barcode1DImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.barcodeNumberText}>{barcodeValue}</Text>
                    <View style={styles.barcodeActionsRow}>
                      <TouchableOpacity
                        style={styles.zoomHintBadge}
                        onPress={() => setShowZoomModal(true)}
                      >
                        <Ionicons name="expand" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                        <Text style={styles.zoomHintText}>Phóng to mã vạch</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.zoomHintBadge, { backgroundColor: '#FEE2E2' }]}
                        onPress={() => handleCopy(barcodeValue, 'BARCODE')}
                      >
                        <Ionicons name="copy-outline" size={12} color="#DC2626" style={{ marginRight: 4 }} />
                        <Text style={[styles.zoomHintText, { color: '#DC2626' }]}>
                          {copiedKey === 'BARCODE' ? 'Đã sao chép mã Barcode' : 'Sao chép mã Barcode'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.counterInstructionBox}>
                    <Ionicons name="print-outline" size={22} color="#0F172A" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.counterInstructionTitle}>
                        Hướng dẫn nhận vé giấy tại rạp
                      </Text>
                      <Text style={styles.counterInstructionDesc}>
                        Đưa mã Barcode ({barcodeValue}) này cho nhân viên tại quầy vé hoặc đặt trước đầu đọc Laser tại Kiosk tự động của rạp {cinemaObj?.name} để in vé giấy vào phòng chiếu.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsCol}>
                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => setShowZoomModal(true)}
                >
                  <Ionicons name="barcode-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.secondaryActionText}>Mở mã vạch độ sáng cao để quét</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.historyBtn} onPress={handleGoToHistory}>
                  <Ionicons name="list-outline" size={18} color="#E11D48" style={{ marginRight: 6 }} />
                  <Text style={styles.historyBtnText}>Xem Lịch Sử Vé Của Tôi</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primaryHomeBtn} onPress={handleGoHome}>
                  <Text style={[styles.primaryHomeText, { fontFamily: theme.fontFamily }]}>
                    Về Trang Chủ Đặt Vé Phim
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* High-Brightness Barcode Modal for Counter / Kiosk Scanner */}
        <Modal visible={showZoomModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.zoomedBarcodeCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Mã Barcode Quét In Vé Tại Rạp</Text>
                <TouchableOpacity onPress={() => setShowZoomModal(false)}>
                  <Ionicons name="close" size={24} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Đưa mã vạch Code128 này cho nhân viên quầy vé hoặc Kiosk in vé tự động
              </Text>

              <View style={styles.largeBarcodeContainer}>
                <Image
                  source={{ uri: barcodeUrl }}
                  style={styles.largeBarcodeImage}
                  resizeMode="contain"
                />
                <Text style={styles.largeBarcodeCodeText}>{barcodeValue}</Text>
              </View>

              <Text style={styles.modalMetaText}>
                Mã vé: {ticketCode} • Ghế: {seatCodesText}
              </Text>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowZoomModal(false)}
              >
                <Text style={styles.closeModalText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 20 }),
  },
  safeArea: { flex: 1, backgroundColor: '#0F172A', width: '100%' },
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
    paddingVertical: 14,
    backgroundColor: '#0F172A',
  },
  closeBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  shareBtn: { padding: 4 },
  container: { flex: 1, paddingHorizontal: 16 },
  centerBox: { paddingVertical: 60, alignItems: 'center' },
  loadingText: { color: '#94A3B8', fontSize: 13, marginTop: 10 },
  errorCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  errorTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  errorDesc: { color: '#CBD5E1', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  retryBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  retryBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  successBanner: { alignItems: 'center', paddingVertical: 14 },
  successTitle: { color: '#FFF', fontSize: 19, fontWeight: '800', marginTop: 6 },
  successSubText: { color: '#94A3B8', fontSize: 12, marginTop: 2, textAlign: 'center' },

  ticketCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
  },
  ticketBannerRow: { flexDirection: 'row', padding: 16, backgroundColor: '#18181B' },
  ticketPoster: { width: 68, height: 96, borderRadius: 10, backgroundColor: '#3F3F46' },
  ticketMovieColumn: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  formatTagBadge: {
    backgroundColor: '#BE123C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  formatTagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  ticketMovieTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', lineHeight: 20 },
  codeCopyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ticketBookingCodeText: { color: '#D4D4D8', fontSize: 11 },
  codeHighlight: { color: '#F43F5E', fontWeight: '800' },
  miniCopyBtn: {
    marginLeft: 8,
    backgroundColor: '#27272A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniCopyText: { color: '#60A5FA', fontSize: 10, fontWeight: '700' },
  partnerCodeText: { color: '#A1A1AA', fontSize: 11, marginTop: 2 },

  ticketDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, backgroundColor: '#FFF' },
  detailItem: { width: '50%', marginBottom: 12, paddingRight: 6 },
  detailItemFull: { width: '100%', marginBottom: 12 },
  detailLabel: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  detailValue: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 },

  perforatedContainer: { height: 24, position: 'relative', justifyContent: 'center', backgroundColor: '#FFF' },
  dashedLine: { borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', marginHorizontal: 24 },
  notchLeft: {
    position: 'absolute',
    left: -12,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  notchRight: {
    position: 'absolute',
    right: -12,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },

  barcodeSection: { alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
  scanReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  scanReadyText: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  barcodeBoxContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  barcode1DImage: { width: '100%', height: 68 },
  barcodeNumberText: { fontSize: 15, fontWeight: '900', color: '#0F172A', letterSpacing: 2, marginTop: 6 },
  barcodeActionsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  zoomHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoomHintText: { fontSize: 11, fontWeight: '700', color: '#0284C7' },

  counterInstructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    width: '100%',
  },
  counterInstructionTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  counterInstructionDesc: { fontSize: 11, color: '#475569', marginTop: 2, lineHeight: 16 },

  actionButtonsCol: { gap: 10 },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 13,
    borderRadius: 24,
  },
  secondaryActionText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 13,
    borderRadius: 24,
  },
  historyBtnText: { color: '#E11D48', fontSize: 14, fontWeight: '800' },
  primaryHomeBtn: { backgroundColor: '#E11D48', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  primaryHomeText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  zoomedBarcodeCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 12, color: '#64748B', width: '100%', marginBottom: 14 },
  largeBarcodeContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  largeBarcodeImage: { width: '100%', height: 95 },
  largeBarcodeCodeText: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 2, marginTop: 8 },
  modalMetaText: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 14 },
  closeModalBtn: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeModalText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
