import React from 'react';
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

  const { booking, resetBooking, getGrandTotal } = useCinema();

  const movie = booking.movie || {
    title: 'Conan Movie 29 (2026): Thiên Thần Sa Ngã Trên Xa Lộ',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  };

  const bookingCode = booking.bookingCode || 'BETA-CONAN-98421';
  const seatsText = booking.selectedSeats.length > 0
    ? booking.selectedSeats.map(s => s.id).join(', ')
    : 'E5, E6';

  const grandTotal = getGrandTotal() > 0 ? getGrandTotal() : 105000;

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
            <Text style={styles.successSubText}>Vé điện tử đã sẵn sàng để check-in tại rạp</Text>
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

            {/* QR Code & Check-in Section */}
            <View style={styles.qrSection}>
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${bookingCode}` }}
                style={styles.qrCodeImage}
              />
              <Text style={styles.barcodeText}>* {bookingCode} *</Text>
              <Text style={styles.qrInstruction}>
                Đưa mã QR này cho nhân viên rạp hoặc quét tại kiosk để in vé
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsCol}>
            <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => alert('Đã chỉ đường tới Beta Xuân Thủy trên Google Maps!')}>
              <Ionicons name="navigate-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.secondaryActionText}>Chỉ đường đến rạp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryHomeBtn} onPress={handleGoHome}>
              <Text style={[styles.primaryHomeText, { fontFamily: theme.fontFamily }]}>
                Trở về Trang chủ
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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

  /* QR Section */
  qrSection: { alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  qrCodeImage: { width: 160, height: 160, borderRadius: 12 },
  barcodeText: { fontSize: 14, fontWeight: '800', color: '#0F172A', letterSpacing: 2, marginTop: 8 },
  qrInstruction: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 8, paddingHorizontal: 20, lineHeight: 16 },

  /* Action Buttons */
  actionButtonsCol: { marginTop: 4 },
  secondaryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', paddingVertical: 14, borderRadius: 24, marginBottom: 10 },
  secondaryActionText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  primaryHomeBtn: { backgroundColor: '#E11D48', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  primaryHomeText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
