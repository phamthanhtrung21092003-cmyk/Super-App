import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Alert,
  AppState,
  AppStateStatus,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema, SelectedSeat } from '../../context/CinemaContext';
import {
  movieService,
  BackendShowtimeSeat,
  BackendShowtimeWithSeats,
  resolveMobileSeatStatus,
} from '../../services/movieService';

function mapSeatType(st: string): 'standard' | 'vip' | 'couple' {
  const upper = (st || '').toUpperCase();
  if (upper === 'VIP') return 'vip';
  if (upper === 'COUPLE' || upper === 'SWEETBOX') return 'couple';
  return 'standard';
}

export default function SeatSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ showtimeId?: string }>();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const {
    booking,
    selectShowtime,
    toggleSeat,
    setSeatHolds,
    clearExpiredHold,
    getSeatsTotalPrice,
    getRemainingHoldSeconds,
  } = useCinema();

  const [showtimeData, setShowtimeData] = useState<BackendShowtimeWithSeats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const holdLockRef = useRef<boolean>(false);

  const effectiveShowtimeId = params.showtimeId || booking.showtimeId;

  const loadSeatMap = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let targetShowtimeId = effectiveShowtimeId;
      if (!targetShowtimeId) {
        const allShowtimes = await movieService.getShowtimes();
        if (allShowtimes.length > 0) {
          targetShowtimeId = allShowtimes[0].id;
        }
      }
      if (!targetShowtimeId) {
        setErrorMessage('Chưa chọn suất chiếu hợp lệ.');
        setLoading(false);
        return;
      }

      const data = await movieService.getShowtimeSeats(targetShowtimeId);
      setShowtimeData(data);

      // Sync showtime metadata if user entered directly via deep-link
      if (!booking.showtimeId && data.movie && data.cinema) {
        const startD = new Date(data.startTime);
        const timeStr = `${startD.getHours().toString().padStart(2, '0')}:${startD.getMinutes().toString().padStart(2, '0')}`;
        selectShowtime(
          {
            id: data.movie.id,
            title: data.movie.title,
            poster: data.movie.posterUrl,
            ageRating: data.movie.ageRating || 'T13',
            duration: `${data.movie.durationMin} phút`,
            hasTrailer: Boolean(data.movie.trailerUrl),
            genres: (data.movie.genres || []).join(', '),
            showtimes: [],
          },
          data.screeningFormat || '2D',
          timeStr,
          Number(data.basePrice) || 75000,
          startD.toLocaleDateString('vi-VN'),
          data.cinema.name,
          data.auditorium?.name || 'Phòng chiếu 01',
          {
            showtimeId: data.id,
            cinemaId: data.cinemaId,
            cinemaBrand: data.cinema.brand,
            startTimeIso: data.startTime,
          }
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tải sơ đồ ghế từ máy chủ.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }, [effectiveShowtimeId, booking.showtimeId, selectShowtime]);

  useEffect(() => {
    loadSeatMap();
  }, [loadSeatMap]);

  // AppState Background/Resume listener: re-verify seat status from Server
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        loadSeatMap();
      }
    });
    return () => sub.remove();
  }, [loadSeatMap]);

  // Live countdown driven strictly by server expiresAt
  useEffect(() => {
    if (!booking.holdExpiresAt) {
      setRemainingSeconds(0);
      return;
    }
    const updateTimer = () => {
      const rem = getRemainingHoldSeconds();
      setRemainingSeconds(rem);
      if (rem <= 0 && booking.holdExpiresAt) {
        clearExpiredHold();
        loadSeatMap();
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking.holdExpiresAt, getRemainingHoldSeconds, clearExpiredHold, loadSeatMap]);

  // Group seats by rowLabel from real Backend showtimeSeats
  const groupedRows = React.useMemo(() => {
    if (!showtimeData?.showtimeSeats) return [];
    const map = new Map<string, BackendShowtimeSeat[]>();
    for (const ss of showtimeData.showtimeSeats) {
      const row = ss.seat?.rowLabel || ss.seatCode.charAt(0) || 'A';
      const list = map.get(row) || [];
      list.push(ss);
      map.set(row, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([rowLabel, seats]) => ({
        rowLabel,
        seats: seats.sort((x, y) => (x.seat?.seatNumber || 0) - (y.seat?.seatNumber || 0)),
      }));
  }, [showtimeData]);

  const handleSeatPress = (ss: BackendShowtimeSeat) => {
    const displayStatus = resolveMobileSeatStatus(
      ss,
      undefined,
      booking.selectedSeats.map(s => s.seatId)
    );
    if (
      displayStatus === 'BOOKED' ||
      displayStatus === 'HELD_BY_OTHER' ||
      displayStatus === 'UNAVAILABLE'
    ) {
      return;
    }

    const seatObj: SelectedSeat = {
      id: ss.seatCode,
      seatId: ss.seatId,
      showtimeSeatId: ss.id,
      row: ss.seat?.rowLabel || ss.seatCode.charAt(0),
      number: ss.seat?.seatNumber || 1,
      type: mapSeatType(ss.seatType),
      price: Number(ss.price) || Number(showtimeData?.basePrice) || 75000,
    };
    toggleSeat(seatObj);
  };

  const handleHoldSeatsAndContinue = async () => {
    if (booking.selectedSeats.length === 0) {
      Alert.alert('Chưa chọn ghế', 'Vui lòng chọn ít nhất 1 ghế ngồi để tiếp tục.');
      return;
    }
    if (holdLockRef.current || isHolding) return;

    const targetShowtimeId = showtimeData?.id || effectiveShowtimeId;
    if (!targetShowtimeId) {
      Alert.alert('Lỗi suất chiếu', 'Không xác định được suất chiếu.');
      return;
    }

    holdLockRef.current = true;
    setIsHolding(true);

    try {
      const seatIds = booking.selectedSeats.map(s => s.seatId);
      const idempotencyKey = `HOLD_${targetShowtimeId}_${seatIds.slice().sort().join('_')}`;
      const res = await movieService.holdSeats({
        showtimeId: targetShowtimeId,
        seatIds,
        idempotencyKey,
      });

      const holdIds = (res.holds || []).map(h => h.id);
      setSeatHolds(holdIds, res.expiresAt);
      router.push('/cinema/concessions');
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Ghế bạn chọn vừa có người khác giữ hoặc đã đặt.';
      const msgText = Array.isArray(serverMsg) ? serverMsg.join(', ') : String(serverMsg);

      if (status === 409) {
        Alert.alert(
          'Ghế vừa có người giữ',
          `${msgText}\nHệ thống sẽ tải lại sơ đồ ghế mới nhất để bạn chọn ghế khác.`
        );
      } else {
        Alert.alert('Không thể giữ ghế', msgText);
      }
      await loadSeatMap();
    } finally {
      holdLockRef.current = false;
      setIsHolding(false);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cinema');
    }
  };

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const seatsCount = booking.selectedSeats.length;
  const totalPrice = getSeatsTotalPrice();
  const basePriceDisplay = Number(showtimeData?.basePrice || booking.basePrice || 75000);
  const vipPriceDisplay = Number(showtimeData?.vipPrice || basePriceDisplay + 15000);
  const couplePriceDisplay = Number(showtimeData?.couplePrice || basePriceDisplay * 2 + 10000);

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFDFD" translucent={false} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtnRow}>
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
            <Text style={[styles.backBtnText, { fontFamily: theme.fontFamily }]}>
              Quay lại chọn suất
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={loadSeatMap} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={18} color="#E11D48" />
            <Text style={styles.refreshBtnText}>Làm mới</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Film Header Card */}
          <View style={styles.filmHeaderContainer}>
            <View style={styles.filmContentRow}>
              <Image
                source={{
                  uri:
                    showtimeData?.movie?.posterUrl ||
                    booking.movie?.poster ||
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
                }}
                style={styles.filmPoster}
              />
              <View style={styles.filmMetaColumn}>
                <View style={styles.filmTagBadge}>
                  <Text style={styles.filmTagText}>
                    {showtimeData?.screeningFormat || booking.format} •{' '}
                    {showtimeData?.movie?.ageRating || booking.ageRating}
                  </Text>
                </View>
                <Text style={[styles.filmTitle, { fontFamily: theme.fontFamily }]} numberOfLines={2}>
                  {showtimeData?.movie?.title || booking.movie?.title || 'Đặt vé xem phim'}
                </Text>
                <Text style={styles.filmInfoDetailText}>
                  {showtimeData?.cinema?.name || booking.cinemaName} •{' '}
                  {showtimeData?.auditorium?.name || booking.roomName}
                </Text>
                <Text style={styles.filmInfoDetailText}>
                  Suất: {booking.time || '19:30'} • {booking.dateLabel}
                </Text>
              </View>
            </View>

            {remainingSeconds > 0 && (
              <View style={styles.holdCountdownBar}>
                <Ionicons name="time-outline" size={15} color="#FDE047" style={{ marginRight: 6 }} />
                <Text style={styles.holdCountdownText}>
                  Thời gian giữ ghế trên Server còn: {formatCountdown(remainingSeconds)}
                </Text>
              </View>
            )}
          </View>

          {/* 5-Status Seat Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.seatStandard]} />
              <Text style={styles.legendText}>
                Thường ({Math.round(basePriceDisplay / 1000)}K)
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.seatVip]} />
              <Text style={styles.legendText}>VIP ({Math.round(vipPriceDisplay / 1000)}K)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.seatCouple]} />
              <Text style={styles.legendText}>Đôi ({Math.round(couplePriceDisplay / 1000)}K)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.seatSelected]} />
              <Text style={styles.legendText}>Đang chọn / Giữ của tôi</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.seatHeldByOther]} />
              <Text style={styles.legendText}>Người khác đang giữ</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.seatBooked]} />
              <Text style={styles.legendText}>Đã đặt / Khóa</Text>
            </View>
          </View>

          {/* Screen Arc */}
          <View style={styles.screenSection}>
            <View style={styles.screenArcLine} />
            <Text style={styles.screenText}>MÀN HÌNH CHIẾU (SCREEN)</Text>
          </View>

          {/* Loading / Error / Seat Grid */}
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#E11D48" />
              <Text style={styles.loadingText}>Đang đồng bộ sơ đồ ghế từ Rạp...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadSeatMap}>
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.seatGridContainer}>
              {groupedRows.map(row => (
                <View key={row.rowLabel} style={styles.seatRow}>
                  <Text style={styles.rowLabelText}>{row.rowLabel}</Text>
                  {row.seats.map(ss => {
                    const isSelected = booking.selectedSeats.some(
                      s => s.seatId === ss.seatId || s.id === ss.seatCode
                    );
                    const status = resolveMobileSeatStatus(
                      ss,
                      undefined,
                      booking.selectedSeats.map(s => s.seatId)
                    );
                    const isCouple =
                      ss.seatType === 'COUPLE' || ss.seatType === 'SWEETBOX';
                    const isDisabled =
                      status === 'BOOKED' ||
                      status === 'HELD_BY_OTHER' ||
                      status === 'UNAVAILABLE';

                    let bgStyle = styles.seatStandard;
                    if (ss.seatType === 'VIP') bgStyle = styles.seatVip;
                    if (isCouple) bgStyle = styles.seatCouple;
                    if (status === 'HELD_BY_OTHER') bgStyle = styles.seatHeldByOther;
                    if (status === 'BOOKED' || status === 'UNAVAILABLE') bgStyle = styles.seatBooked;
                    if (isSelected || status === 'HELD_BY_ME') bgStyle = styles.seatSelected;

                    return (
                      <TouchableOpacity
                        key={ss.id}
                        disabled={isDisabled}
                        style={[
                          styles.seatBox,
                          isCouple && styles.seatBoxCouple,
                          bgStyle,
                        ]}
                        onPress={() => handleSeatPress(ss)}
                      >
                        {isSelected ? (
                          <Ionicons name="checkmark" size={14} color="#FFF" />
                        ) : status === 'HELD_BY_OTHER' ? (
                          <Ionicons name="time" size={12} color="#92400E" />
                        ) : status === 'BOOKED' || status === 'UNAVAILABLE' ? (
                          <Ionicons name="close" size={12} color="#94A3B8" />
                        ) : (
                          <Text
                            style={[
                              styles.seatText,
                              (ss.seatType === 'VIP' || isCouple) && { color: '#FFF' },
                            ]}
                          >
                            {ss.seatCode}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {/* Selected Seat Chips */}
          {booking.selectedSeats.length > 0 && (
            <View style={styles.chipsContainer}>
              {booking.selectedSeats.map(seat => (
                <TouchableOpacity
                  key={seat.seatId || seat.id}
                  style={styles.chipPill}
                  onPress={() => toggleSeat(seat)}
                >
                  <View style={styles.chipDot} />
                  <Text style={styles.chipText}>
                    {seat.id} ({seat.price.toLocaleString('vi-VN')}đ)
                  </Text>
                  <Ionicons name="close" size={14} color="#DC2626" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomSeatsCountText}>{seatsCount} GHẾ ĐÃ CHỌN</Text>
            <Text style={styles.bottomTotalPriceText}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryNextBtn,
              (seatsCount === 0 || isHolding) && styles.primaryNextBtnDisabled,
            ]}
            disabled={seatsCount === 0 || isHolding}
            onPress={handleHoldSeatsAndContinue}
          >
            {isHolding ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryNextBtnText}>Đang giữ ghế...</Text>
              </View>
            ) : (
              <Text style={[styles.primaryNextBtnText, { fontFamily: theme.fontFamily }]}>
                Giữ ghế & Tiếp tục
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  safeArea: { flex: 1, backgroundColor: '#FFFDFD', width: '100%' },
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
    backgroundColor: '#FFFDFD',
  },
  backBtnRow: { flexDirection: 'row', alignItems: 'center' },
  backBtnText: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginLeft: 6 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  refreshBtnText: { fontSize: 12, fontWeight: '700', color: '#E11D48', marginLeft: 4 },
  container: { flex: 1, paddingHorizontal: 16 },
  filmHeaderContainer: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  filmContentRow: { flexDirection: 'row', alignItems: 'center' },
  filmPoster: { width: 60, height: 86, borderRadius: 10, backgroundColor: '#3F3F46' },
  filmMetaColumn: { flex: 1, marginLeft: 12 },
  filmTagBadge: {
    backgroundColor: '#BE123C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  filmTagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  filmTitle: { color: '#FFF', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  filmInfoDetailText: { color: '#D4D4D8', fontSize: 11, marginTop: 2 },
  holdCountdownBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
  },
  holdCountdownText: { color: '#FDE047', fontSize: 12, fontWeight: '700' },

  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '48%', marginVertical: 4 },
  legendBox: { width: 16, height: 16, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 11, fontWeight: '600', color: '#475569' },

  screenSection: { marginTop: 14, alignItems: 'center', width: '100%' },
  screenArcLine: { width: '88%', height: 4, backgroundColor: '#F43F5E', borderRadius: 2, marginBottom: 6 },
  screenText: { fontSize: 11, fontWeight: '700', color: '#E11D48', letterSpacing: 2 },

  loadingWrap: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B', fontWeight: '600' },
  errorWrap: { paddingVertical: 30, alignItems: 'center' },
  errorText: { color: '#DC2626', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  retryBtn: { backgroundColor: '#E11D48', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 16 },
  retryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  seatGridContainer: { marginTop: 18, alignItems: 'center' },
  seatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  rowLabelText: { width: 18, fontSize: 11, fontWeight: '800', color: '#64748B', marginRight: 4 },
  seatBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatBoxCouple: { width: 58, borderRadius: 8 },
  seatStandard: { backgroundColor: '#E2E8F0' },
  seatVip: { backgroundColor: '#D97706' },
  seatCouple: { backgroundColor: '#2563EB' },
  seatHeldByOther: { backgroundColor: '#FDE68A', borderWidth: 1, borderColor: '#F59E0B' },
  seatBooked: { backgroundColor: '#CBD5E1', opacity: 0.55 },
  seatSelected: { backgroundColor: '#E11D48' },
  seatText: { fontSize: 9, fontWeight: '800', color: '#334155' },

  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E11D48', marginRight: 6 },
  chipText: { fontSize: 12, fontWeight: '700', color: '#E11D48' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomSeatsCountText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  bottomTotalPriceText: { fontSize: 20, fontWeight: '800', color: '#E11D48', marginTop: 2 },
  primaryNextBtn: { backgroundColor: '#E11D48', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  primaryNextBtnDisabled: { backgroundColor: '#FDA4AF' },
  primaryNextBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
