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
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema, SelectedSeat } from '../../context/CinemaContext';

// Helper to generate seat matrix based on movie base price
const getSeatMatrix = (basePrice: number = 50000): SelectedSeat[] => {
  const stdPrice = basePrice;
  const vipPrice = basePrice + 10000;
  const couplePrice = basePrice * 2; // 100,000đ cho 1 ghế đôi (2 chỗ)

  const rows: SelectedSeat[] = [];

  // Rows A, B, C - Standard
  ['A', 'B', 'C'].forEach(r => {
    for (let i = 1; i <= 10; i++) {
      rows.push({ id: `${r}${i}`, row: r, number: i, type: 'standard', price: stdPrice });
    }
  });

  // Rows D, E - VIP
  ['D', 'E'].forEach(r => {
    for (let i = 1; i <= 10; i++) {
      rows.push({ id: `${r}${i}`, row: r, number: i, type: 'vip', price: vipPrice });
    }
  });

  // Row F - Couple (5 đôi ghế rộng gấp đôi, mỗi ghế 100.000đ chiếm 2 vị trí)
  const couplePairs = [
    { id: 'F1-F2', num: 1 },
    { id: 'F3-F4', num: 3 },
    { id: 'F5-F6', num: 5 },
    { id: 'F7-F8', num: 7 },
    { id: 'F9-F10', num: 9 },
  ];

  couplePairs.forEach(p => {
    rows.push({ id: p.id, row: 'F', number: p.num, type: 'couple', price: couplePrice });
  });

  return rows;
};

const BOOKED_SEAT_IDS = ['E4', 'F3-F4']; // Ghế đã bán

export default function SeatSelectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const { booking, toggleSeat, getSeatsTotalPrice } = useCinema();

  const basePrice = booking.basePrice || 50000;
  const stdPrice = basePrice;
  const vipPrice = basePrice + 10000;
  const couplePrice = basePrice * 2;

  const seatMatrix = getSeatMatrix(basePrice);

  // Selected seats from Context
  const selectedSeats = booking.selectedSeats;
  const seatsCount = selectedSeats.length;
  const totalPrice = getSeatsTotalPrice();

  // If initial load and no seats selected, preset E5 & E6
  React.useEffect(() => {
    if (booking.selectedSeats.length === 0) {
      toggleSeat({ id: 'E5', row: 'E', number: 5, type: 'vip', price: vipPrice });
      toggleSeat({ id: 'E6', row: 'E', number: 6, type: 'vip', price: vipPrice });
    }
  }, []);

  const handleNextStep = () => {
    if (seatsCount === 0) {
      alert('Vui lòng chọn ít nhất 1 ghế để tiếp tục!');
      return;
    }
    router.push('/cinema/concessions');
  };

  const movie = booking.movie || {
    title: 'Conan Movie 29 (2026): Thiên Thần Sa Ngã Trên Xa Lộ',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
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
        <StatusBar barStyle="dark-content" backgroundColor="#FFFDFD" translucent={false} />

        {/* Top Header Link */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtnRow}>
            <Ionicons name="arrow-back" size={20} color="#64748B" />
            <Text style={[styles.backBtnText, { fontFamily: theme.fontFamily }]}>
              Quay lại chọn suất chiếu
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Moveek Film-Strip Header Component */}
          <View style={styles.filmHeaderContainer}>
            {/* Top Film Holes */}
            <View style={styles.filmHolesRow}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.filmHole} />
              ))}
            </View>

            {/* Inner Content */}
            <View style={styles.filmContentRow}>
              <Image source={{ uri: movie.poster }} style={styles.filmPoster} />
              <View style={styles.filmMetaColumn}>
                <View style={styles.filmTagBadge}>
                  <Text style={styles.filmTagText}>
                    {booking.format || '2D LỒNG TIẾNG'} · {booking.ageRating || 'T13'}
                  </Text>
                </View>

                <Text style={[styles.filmTitle, { fontFamily: theme.fontFamily }]} numberOfLines={2}>
                  {movie.title}
                </Text>

                <View style={styles.filmInfoDetailRow}>
                  <Ionicons name="time-outline" size={14} color="#CBD5E1" style={{ marginRight: 4 }} />
                  <Text style={styles.filmInfoDetailText}>
                    {booking.time || '17:30'} · {booking.dateLabel || 'Thứ Hai · 27/07'}
                  </Text>
                </View>

                <View style={styles.filmInfoDetailRow}>
                  <Ionicons name="location-outline" size={14} color="#CBD5E1" style={{ marginRight: 4 }} />
                  <Text style={styles.filmInfoDetailText}>
                    {booking.cinemaName || 'Beta Xuân Thủy'}   {booking.roomName || 'Phòng chiếu P7'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Film Holes */}
            <View style={styles.filmHolesRow}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.filmHole} />
              ))}
            </View>
          </View>

          {/* Seat Legend Indicator Bar */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#E11D48' }]}>
                <Ionicons name="checkmark" size={10} color="#FFF" />
              </View>
              <Text style={styles.legendText}>Đang chọn</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxBooked]} />
              <Text style={styles.legendText}>Đã bán</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#E2E8F0' }]} />
              <Text style={styles.legendText}>Thường <Text style={styles.legendPrice}>{stdPrice.toLocaleString('vi-VN')}đ</Text></Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#D97706' }]} />
              <Text style={styles.legendText}>VIP <Text style={styles.legendPrice}>{vipPrice.toLocaleString('vi-VN')}đ</Text></Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#2563EB', width: 26 }]} />
              <Text style={styles.legendText}>Ghế Đôi <Text style={styles.legendPrice}>{couplePrice.toLocaleString('vi-VN')}đ (2 chỗ)</Text></Text>
            </View>
          </View>

          {/* Screen Arc Section */}
          <View style={styles.screenSection}>
            <View style={styles.screenArcRow}>
              <View style={styles.screenArcLine} />
              <Text style={[styles.screenText, { fontFamily: theme.fontFamily }]}>M À N   H Ì N H</Text>
            </View>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => alert('Phóng to/Thu nhỏ sơ đồ ghế')}>
              <Ionicons name="search" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Interactive Seat Matrix */}
          <View style={styles.seatGridContainer}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map(rowLabel => (
              <View key={rowLabel} style={styles.seatRow}>
                {seatMatrix.filter(seat => seat.row === rowLabel).map(seat => {
                  const isBooked = BOOKED_SEAT_IDS.includes(seat.id);
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  const isCouple = seat.type === 'couple';

                  let bgStyle = styles.seatStandard;
                  if (seat.type === 'vip') bgStyle = styles.seatVip;
                  if (seat.type === 'couple') bgStyle = styles.seatCouple;
                  if (isBooked) bgStyle = styles.seatBooked;
                  if (isSelected) bgStyle = styles.seatSelected;

                  return (
                    <TouchableOpacity
                      key={seat.id}
                      disabled={isBooked}
                      style={[styles.seatBox, isCouple && styles.seatBoxCouple, bgStyle]}
                      onPress={() => toggleSeat(seat)}
                    >
                      {isSelected ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="checkmark" size={14} color="#FFF" />
                          {isCouple && <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800', marginLeft: 2 }}>{seat.id}</Text>}
                        </View>
                      ) : isBooked ? (
                        <View style={styles.bookedHatchPattern} />
                      ) : (
                        <Text style={[styles.seatText, isSelected && styles.seatTextSelected]}>
                          {isCouple ? `${seat.id}` : `${seat.number}`}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Selected Seat Chips */}
          {selectedSeats.length > 0 && (
            <View style={styles.chipsContainer}>
              {selectedSeats.map(seat => (
                <TouchableOpacity
                  key={seat.id}
                  style={styles.chipPill}
                  onPress={() => toggleSeat(seat)}
                >
                  <View style={styles.chipDot} />
                  <Text style={styles.chipText}>{seat.id} ({seat.price.toLocaleString('vi-VN')}đ)</Text>
                  <Ionicons name="close" size={14} color="#DC2626" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfoColumn}>
            <Text style={styles.bottomSeatsCountText}>{seatsCount} GHẾ ĐÃ CHỌN</Text>
            <Text style={styles.bottomTotalPriceText}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryNextBtn} onPress={handleNextStep}>
            <Text style={[styles.primaryNextBtnText, { fontFamily: theme.fontFamily }]}>
              Tiếp tục
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safeArea: { flex: 1, backgroundColor: '#FFFDFD', width: '100%' },
  desktopFrame: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000000', borderRadius: 44, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },

  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFDFD' },
  backBtnRow: { flexDirection: 'row', alignItems: 'center' },
  backBtnText: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginLeft: 6 },

  container: { flex: 1, paddingHorizontal: 16 },

  /* Moveek Film Strip Header Card */
  filmHeaderContainer: { backgroundColor: '#18181B', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16 },
  filmHolesRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginVertical: 4 },
  filmHole: { width: 14, height: 8, borderRadius: 2, backgroundColor: '#000' },
  filmContentRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  filmPoster: { width: 64, height: 90, borderRadius: 10, backgroundColor: '#3F3F46' },
  filmMetaColumn: { flex: 1, marginLeft: 12 },
  filmTagBadge: { backgroundColor: '#BE123C', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 6 },
  filmTagText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  filmTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 6 },
  filmInfoDetailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  filmInfoDetailText: { color: '#D4D4D8', fontSize: 12, fontWeight: '500' },

  /* Legend Bar */
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 8, marginVertical: 4 },
  legendBox: { width: 18, height: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  legendBoxBooked: { backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' },
  legendText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  legendPrice: { fontSize: 10, color: '#94A3B8', fontWeight: '400' },

  /* Screen Arc Section */
  screenSection: { marginTop: 16, alignItems: 'center', position: 'relative', width: '100%' },
  screenArcRow: { alignItems: 'center', width: '100%' },
  screenArcLine: { width: '90%', height: 4, backgroundColor: '#F43F5E', borderRadius: 2, marginBottom: 6 },
  screenText: { fontSize: 12, fontWeight: '700', color: '#E11D48', letterSpacing: 4 },
  zoomBtn: { position: 'absolute', right: 4, top: 0, width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },

  /* Seat Grid */
  seatGridContainer: { marginTop: 20, alignItems: 'center' },
  seatRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  seatBox: { width: 28, height: 28, borderRadius: 6, marginHorizontal: 2, alignItems: 'center', justifyContent: 'center' },
  seatBoxCouple: { width: 58, borderRadius: 8 },
  seatStandard: { backgroundColor: '#E2E8F0' },
  seatVip: { backgroundColor: '#D97706' },
  seatCouple: { backgroundColor: '#2563EB' },
  seatBooked: { backgroundColor: '#E2E8F0', opacity: 0.6, borderWidth: 1, borderColor: '#CBD5E1' },
  bookedHatchPattern: { width: 14, height: 14, borderRadius: 2, backgroundColor: '#94A3B8' },
  seatSelected: { backgroundColor: '#E11D48' },
  seatText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  seatTextSelected: { color: '#FFF' },

  /* Selected Chips */
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  chipPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, marginRight: 8, marginBottom: 8 },
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E11D48', marginRight: 6 },
  chipText: { fontSize: 12, fontWeight: '700', color: '#E11D48' },

  /* Sticky Bottom Bar */
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' },
  bottomInfoColumn: {},
  bottomSeatsCountText: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  bottomTotalPriceText: { fontSize: 20, fontWeight: '800', color: '#E11D48', marginTop: 2 },
  primaryNextBtn: { backgroundColor: '#E11D48', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  primaryNextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
