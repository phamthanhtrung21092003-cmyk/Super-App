import React, { useState } from 'react';
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
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema } from '../../context/CinemaContext';

export default function TicketDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const [showZoomModal, setShowZoomModal] = useState(false);

  const { booking, resetBooking, getGrandTotal } = useCinema();

  const movie = booking.movie || {
    title: 'Conan Movie 29: Thiên Thần Sa Ngã Trên Xa Lộ',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  };

  const bookingCode = booking.bookingCode || 'BETA-CONAN-98421';
  const seatsText = booking.selectedSeats.length > 0
    ? booking.selectedSeats.map(s => s.id).join(', ')
    : 'E5, E6';

  const grandTotal = getGrandTotal() > 0 ? getGrandTotal() : 105000;

  const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${bookingCode}&code=Code128&translate-esc=true`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${bookingCode}`;

  const handleGoHome = () => {
    resetBooking();
    router.replace('/home');
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={false} />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoHome} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>Vé xem phim điện tử</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={() => alert('Đang chia sẻ vé xem phim...')}>
            <Ionicons name="share-social-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Success Banner */}
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={44} color="#22C55E" />
            <Text style={[styles.successTitle, { fontFamily: theme.fontFamily }]}>Đặt vé thành công!</Text>
            <Text style={styles.successSubText}>Mã vạch đã sẵn sàng để quét in vé tại rạp</Text>
          </View>

          {/* Ticket Stub Card Component */}
          <View style={styles.ticketCard}>
            {/* Ticket Card Header Banner */}
            <View style={styles.ticketBannerRow}>
              <Image source={{ uri: movie.poster }} style={styles.ticketPoster} />
              <View style={styles.ticketMovieColumn}>
                <View style={styles.formatTagBadge}>
                  <Text style={styles.formatTagText}>
                    {booking.format || '2D LỒNG TIẾNG'} · {booking.ageRating || 'T13'}
                  </Text>
                </View>
                <Text style={[styles.ticketMovieTitle, { fontFamily: theme.fontFamily }]} numberOfLines={2}>
                  {movie.title}
                </Text>
                <Text style={styles.ticketBookingCodeText}>
                  MÃ VÉ: <Text style={styles.codeHighlight}>{bookingCode}</Text>
                </Text>
              </View>
            </View>

            {/* Ticket Info Details */}
            <View style={styles.ticketDetailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cụm rạp</Text>
                <Text style={styles.detailValue}>{booking.cinemaName || 'Beta Xuân Thủy'}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Phòng chiếu</Text>
                <Text style={styles.detailValue}>{booking.roomName || 'Phòng chiếu P7'}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Suất chiếu</Text>
                <Text style={styles.detailValue}>
                  {booking.time || '17:30'} · {booking.dateLabel || 'Thứ Hai 27/07'}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ghế đã chọn</Text>
                <Text style={[styles.detailValue, { color: '#E11D48', fontWeight: '800' }]}>
                  {seatsText}
                </Text>
              </View>

              {booking.customerInfo.fullName ? (
                <View style={styles.detailItemFull}>
                  <Text style={styles.detailLabel}>Người nhận vé</Text>
                  <Text style={styles.detailValue}>
                    {booking.customerInfo.fullName} ({booking.customerInfo.phone})
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Perforated Divider Line with Cutout Notches */}
            <View style={styles.perforatedContainer}>
              <View style={styles.notchLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.notchRight} />
            </View>

            {/* Barcode & QR Code Check-in Section */}
            <View style={styles.barcodeSection}>
              {/* Scan Ready Badge */}
              <View style={styles.scanReadyBadge}>
                <Ionicons name="scan-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.scanReadyText}>ĐƯA MÃ NÀY CHO NHÂN VIÊN RẠP QUÉT / IN VÉ</Text>
              </View>

              {/* Code128 1D Barcode Graphic */}
              <TouchableOpacity
                style={styles.barcodeBoxContainer}
                onPress={() => setShowZoomModal(true)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: barcodeUrl }}
                  style={styles.barcode1DImage}
                  resizeMode="contain"
                />
                <Text style={styles.barcodeNumberText}>{bookingCode}</Text>
                <View style={styles.zoomHintBadge}>
                  <Ionicons name="expand" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                  <Text style={styles.zoomHintText}>Chạm để phóng to mã vạch quét vé</Text>
                </View>
              </TouchableOpacity>

              {/* QR Code Section */}
              <View style={styles.qrRowBox}>
                <Image source={{ uri: qrUrl }} style={styles.qrCodeSquare} />
                <View style={styles.qrInstructionCol}>
                  <Text style={styles.qrInstructionTitle}>Quét tại Máy In Vé Tự Động (Kiosk)</Text>
                  <Text style={styles.qrInstructionBody}>
                    Đặt màn hình có mã vạch / mã QR trước đầu đọc Laser của máy in vé tại sảnh rạp để lấy vé cứng vào phòng chiếu.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsCol}>
            <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => setShowZoomModal(true)}>
              <Ionicons name="barcode-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.secondaryActionText}>Mở mã vạch độ sáng cao</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryHomeBtn} onPress={handleGoHome}>
              <Text style={[styles.primaryHomeText, { fontFamily: theme.fontFamily }]}>
                Trở về Trang chủ
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Zoomed High-Brightness Barcode Modal for Staff Scanning */}
        <Modal visible={showZoomModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.zoomedBarcodeCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Mã Vạch Quét Vé Vào Phim</Text>
                <TouchableOpacity onPress={() => setShowZoomModal(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#1E293B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>Đưa mã vạch này cho nhân viên rạp soát vé hoặc quét tại kiosk</Text>

              {/* Large Code128 Barcode */}
              <View style={styles.largeBarcodeContainer}>
                <Image source={{ uri: barcodeUrl }} style={styles.largeBarcodeImage} resizeMode="contain" />
                <Text style={styles.largeBarcodeCodeText}>{bookingCode}</Text>
              </View>

              {/* Large QR Code */}
              <View style={styles.largeQrContainer}>
                <Image source={{ uri: qrUrl }} style={styles.largeQrImage} />
                <Text style={styles.largeQrNote}>Mã xác thực vé tự động</Text>
              </View>

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowZoomModal(false)}>
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
  webWrapper: { flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safeArea: { flex: 1, backgroundColor: '#0F172A', width: '100%' },
  desktopFrame: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000000', borderRadius: 44, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#0F172A' },
  closeBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  shareBtn: { padding: 4 },

  container: { flex: 1, paddingHorizontal: 16 },

  successBanner: { alignItems: 'center', paddingVertical: 16 },
  successTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 8 },
  successSubText: { color: '#94A3B8', fontSize: 13, marginTop: 2 },

  /* Ticket Card */
  ticketCard: { backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', marginBottom: 20, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  ticketBannerRow: { flexDirection: 'row', padding: 16, backgroundColor: '#18181B' },
  ticketPoster: { width: 68, height: 96, borderRadius: 10, backgroundColor: '#3F3F46' },
  ticketMovieColumn: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  formatTagBadge: { backgroundColor: '#BE123C', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 6 },
  formatTagText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  ticketMovieTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', lineHeight: 20 },
  ticketBookingCodeText: { color: '#A1A1AA', fontSize: 12, marginTop: 6 },
  codeHighlight: { color: '#F43F5E', fontWeight: '800' },

  ticketDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, backgroundColor: '#FFF' },
  detailItem: { width: '50%', marginBottom: 12 },
  detailItemFull: { width: '100%', marginTop: 4 },
  detailLabel: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 2 },

  /* Perforated Line & Notches */
  perforatedContainer: { height: 24, position: 'relative', justifyContent: 'center', backgroundColor: '#FFF' },
  dashedLine: { borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', marginHorizontal: 24 },
  notchLeft: { position: 'absolute', left: -12, top: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#0F172A' },
  notchRight: { position: 'absolute', right: -12, top: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#0F172A' },

  /* Barcode Section */
  barcodeSection: { alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
  scanReadyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  scanReadyText: { fontSize: 11, fontWeight: '800', color: '#DC2626', letterSpacing: 0.5 },

  barcodeBoxContainer: { width: '100%', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 16 },
  barcode1DImage: { width: '100%', height: 65 },
  barcodeNumberText: { fontSize: 16, fontWeight: '800', color: '#0F172A', letterSpacing: 3, marginTop: 6 },
  zoomHintBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  zoomHintText: { fontSize: 11, fontWeight: '700', color: '#0284C7' },

  qrRowBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 12, width: '100%' },
  qrCodeSquare: { width: 90, height: 90, borderRadius: 8 },
  qrInstructionCol: { flex: 1, marginLeft: 12 },
  qrInstructionTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  qrInstructionBody: { fontSize: 11, color: '#64748B', marginTop: 4, lineHeight: 16 },

  /* Action Buttons */
  actionButtonsCol: { marginTop: 4 },
  secondaryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', paddingVertical: 14, borderRadius: 24, marginBottom: 10 },
  secondaryActionText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  primaryHomeBtn: { backgroundColor: '#E11D48', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  primaryHomeText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  zoomedBarcodeCard: { width: '100%', maxWidth: 360, backgroundColor: '#FFF', borderRadius: 24, padding: 20, alignItems: 'center' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 4 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  modalCloseBtn: { padding: 4 },
  modalSubtitle: { fontSize: 12, color: '#64748B', width: '100%', marginBottom: 16 },

  largeBarcodeContainer: { width: '100%', backgroundColor: '#FFF', borderWidth: 2, borderColor: '#000', borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 16 },
  largeBarcodeImage: { width: '100%', height: 90 },
  largeBarcodeCodeText: { fontSize: 18, fontWeight: '900', color: '#000', letterSpacing: 4, marginTop: 8 },

  largeQrContainer: { alignItems: 'center', marginBottom: 16 },
  largeQrImage: { width: 140, height: 140, borderRadius: 12 },
  largeQrNote: { fontSize: 11, color: '#64748B', marginTop: 6 },

  closeModalBtn: { width: '100%', backgroundColor: '#0F172A', paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  closeModalText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
