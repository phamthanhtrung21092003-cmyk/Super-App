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
  TextInput,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema, ConcessionCombo } from '../../context/CinemaContext';
import { movieService, BackendVoucher } from '../../services/movieService';

export default function ConcessionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const {
    booking,
    setAvailableCombos,
    updateComboQuantity,
    applyValidatedVoucher,
    clearVoucher,
    clearExpiredHold,
    getSeatsTotalPrice,
    getCombosTotalPrice,
    getDiscountAmount,
    getGrandTotal,
    getRemainingHoldSeconds,
  } = useCinema();

  const [combos, setCombos] = useState<ConcessionCombo[]>([]);
  const [vouchers, setVouchers] = useState<BackendVoucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [voucherInput, setVoucherInput] = useState<string>(booking.voucherCode || '');
  const [validatingVoucher, setValidatingVoucher] = useState<boolean>(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const fetchCombosAndVouchers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [comboData, voucherData] = await Promise.all([
        movieService.getCombos(booking.cinemaId || undefined),
        movieService.getVouchers(booking.cinemaId || undefined).catch(() => []),
      ]);

      const normalizedCombos: ConcessionCombo[] = (Array.isArray(comboData) ? comboData : []).map(
        c => ({
          id: c.id,
          code: c.code,
          brand: c.brand,
          cinemaId: c.cinemaId,
          name: c.name,
          description: c.description || '',
          price: Number(c.price) || 0,
          originalPrice: c.originalPrice ? Number(c.originalPrice) : null,
          quantity: 0,
          savingsText: c.savingsText || undefined,
        })
      );

      setCombos(normalizedCombos);
      setAvailableCombos(normalizedCombos);
      setVouchers(Array.isArray(voucherData) ? voucherData : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tải danh sách Combo bắp nước từ máy chủ.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }, [booking.cinemaId, setAvailableCombos]);

  useEffect(() => {
    fetchCombosAndVouchers();
  }, [fetchCombosAndVouchers]);

  // Countdown strictly from server holdExpiresAt
  useEffect(() => {
    if (!booking.holdExpiresAt) return;
    const tick = () => {
      const rem = getRemainingHoldSeconds();
      setRemainingSeconds(rem);
      if (rem <= 0 && booking.holdExpiresAt) {
        clearExpiredHold();
        Alert.alert(
          'Hết thời gian giữ ghế',
          'Thời gian giữ ghế của bạn trên hệ thống đã hết hạn. Vui lòng chọn lại ghế.'
        );
        router.replace('/cinema/seat-selection');
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [booking.holdExpiresAt, getRemainingHoldSeconds, clearExpiredHold, router]);

  const handleApplyVoucher = async (codeOverride?: string) => {
    const code = (codeOverride ?? voucherInput).trim().toUpperCase();
    if (!code) {
      setVoucherError('Vui lòng nhập mã giảm giá.');
      return;
    }

    setValidatingVoucher(true);
    setVoucherError(null);
    try {
      const subtotal = getSeatsTotalPrice() + getCombosTotalPrice();
      const result = await movieService.validateVoucher({
        voucherCode: code,
        showtimeId: booking.showtimeId || undefined,
        seatIds: booking.selectedSeats.map(s => s.seatId),
        combos: booking.selectedCombos.map(c => ({ comboId: c.id, quantity: c.quantity })),
        subtotal,
      });

      setVoucherInput(result.voucherCode);
      applyValidatedVoucher(result.voucherCode, result.discountAmount, result.title);
    } catch (err: any) {
      clearVoucher();
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Mã giảm giá không hợp lệ hoặc không đủ điều kiện áp dụng.';
      setVoucherError(Array.isArray(serverMsg) ? serverMsg.join(', ') : String(serverMsg));
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleNextStep = () => {
    router.push('/cinema/checkout');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cinema/seat-selection');
    }
  };

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const seatsText =
    booking.selectedSeats.length > 0
      ? booking.selectedSeats.map(s => s.id).join(', ')
      : 'Chưa chọn';
  const seatsTotal = getSeatsTotalPrice();
  const combosTotal = getCombosTotalPrice();
  const discountAmount = getDiscountAmount();
  const grandTotal = getGrandTotal();
  const hasCombosSelected = booking.selectedCombos.length > 0;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFDFD" translucent={false} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtnRow}>
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
            <Text style={[styles.backBtnText, { fontFamily: theme.fontFamily }]}>
              Quay lại chọn ghế
            </Text>
          </TouchableOpacity>

          {remainingSeconds > 0 && (
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={14} color="#D97706" style={{ marginRight: 4 }} />
              <Text style={styles.timerBadgeText}>{formatCountdown(remainingSeconds)}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Film Header */}
          <View style={styles.filmHeaderContainer}>
            <View style={styles.filmContentRow}>
              <Image
                source={{
                  uri:
                    booking.movie?.poster ||
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
                }}
                style={styles.filmPoster}
              />
              <View style={styles.filmMetaColumn}>
                <View style={styles.filmTagBadge}>
                  <Text style={styles.filmTagText}>{booking.cinemaBrand || 'CINEMA'} COMBO</Text>
                </View>
                <Text style={[styles.filmTitle, { fontFamily: theme.fontFamily }]} numberOfLines={2}>
                  {booking.movie?.title || 'Đặt vé xem phim V-Life'}
                </Text>
                <Text style={styles.filmInfoDetailText}>
                  {booking.cinemaName} • {booking.roomName}
                </Text>
                <Text style={[styles.filmInfoDetailText, { color: '#FECDD3', fontWeight: '700' }]}>
                  Ghế giữ chỗ: {seatsText}
                </Text>
              </View>
            </View>
          </View>

          {/* Combo List Section */}
          <Text style={styles.sectionTitle}>Chọn Bắp Nước Theo Rạp ({combos.length})</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#E11D48" />
              <Text style={styles.loadingText}>Đang tải danh sách Combo từ Rạp...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchCombosAndVouchers}>
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : combos.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Cụm rạp này hiện không có Combo trực tuyến.</Text>
            </View>
          ) : (
            <View style={styles.comboList}>
              {combos.map(combo => {
                const selectedItem = booking.selectedCombos.find(c => c.id === combo.id);
                const qty = selectedItem ? selectedItem.quantity : 0;

                return (
                  <View key={combo.id} style={styles.comboCard}>
                    <View style={styles.comboIconBox}>
                      <Ionicons name="fast-food" size={28} color="#FFF" />
                    </View>

                    <View style={styles.comboInfoColumn}>
                      {combo.savingsText ? (
                        <Text style={styles.savingsTag}>{combo.savingsText}</Text>
                      ) : null}
                      <Text style={[styles.comboName, { fontFamily: theme.fontFamily }]}>
                        {combo.name}
                      </Text>
                      <Text style={styles.comboDesc} numberOfLines={2}>
                        {combo.description}
                      </Text>
                      <Text style={styles.comboPriceText}>
                        {combo.price.toLocaleString('vi-VN')} đ
                      </Text>
                    </View>

                    {qty === 0 ? (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => updateComboQuantity(combo.id, 1, combo)}
                      >
                        <Text style={styles.addBtnText}>+ Thêm</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.counterRow}>
                        <TouchableOpacity
                          style={styles.counterBtn}
                          onPress={() => updateComboQuantity(combo.id, -1, combo)}
                        >
                          <Ionicons name="remove" size={16} color="#E11D48" />
                        </TouchableOpacity>
                        <Text style={styles.counterValueText}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.counterBtn}
                          onPress={() => updateComboQuantity(combo.id, 1, combo)}
                        >
                          <Ionicons name="add" size={16} color="#E11D48" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Voucher Input & Server Validation Section */}
          <View style={styles.voucherCard}>
            <Text style={styles.sectionTitle}>Mã giảm giá / Voucher V-Life</Text>
            <View style={styles.voucherInputRow}>
              <TextInput
                style={styles.voucherInput}
                value={voucherInput}
                onChangeText={t => {
                  setVoucherInput(t.toUpperCase());
                  setVoucherError(null);
                }}
                placeholder="Nhập mã giảm giá (VD: VLIFEMOVIE20K)"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyVoucherBtn}
                disabled={validatingVoucher}
                onPress={() => handleApplyVoucher()}
              >
                {validatingVoucher ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.applyVoucherBtnText}>Áp dụng</Text>
                )}
              </TouchableOpacity>
            </View>

            {voucherError ? <Text style={styles.voucherErrorText}>{voucherError}</Text> : null}

            {booking.voucherCode && discountAmount > 0 ? (
              <View style={styles.appliedVoucherBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appliedVoucherTitle}>
                    Đã áp dụng mã {booking.voucherCode}: -{discountAmount.toLocaleString('vi-VN')}đ
                  </Text>
                  {booking.voucherTitle ? (
                    <Text style={styles.appliedVoucherSub}>{booking.voucherTitle}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    clearVoucher();
                    setVoucherInput('');
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#16A34A" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Suggested Active Vouchers from Backend */}
            {vouchers.length > 0 && (
              <View style={styles.suggestedVouchersCol}>
                <Text style={styles.suggestedLabel}>Mã ưu đãi hiện có:</Text>
                {vouchers.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={styles.voucherHintChip}
                    onPress={() => handleApplyVoucher(v.code)}
                  >
                    <Ionicons name="pricetag-outline" size={14} color="#E11D48" style={{ marginRight: 6 }} />
                    <Text style={styles.voucherHintText}>
                      {v.code} — {v.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Price Breakdown Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính ghế ({booking.selectedSeats.length})</Text>
              <Text style={styles.summaryVal}>{seatsTotal.toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính Combo bắp nước</Text>
              <Text style={styles.summaryVal}>{combosTotal.toLocaleString('vi-VN')} đ</Text>
            </View>
            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#16A34A' }]}>
                  Giảm giá ({booking.voucherCode})
                </Text>
                <Text style={[styles.summaryVal, { color: '#16A34A' }]}>
                  -{discountAmount.toLocaleString('vi-VN')} đ
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalLabel}>Tổng thanh toán dự kiến</Text>
              <Text style={styles.summaryTotalVal}>{grandTotal.toLocaleString('vi-VN')} đ</Text>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabelText}>TỔNG TẠM TÍNH</Text>
            <Text style={styles.bottomPriceText}>{grandTotal.toLocaleString('vi-VN')} đ</Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNextStep}>
            <Text style={[styles.primaryBtnText, { fontFamily: theme.fontFamily }]}>
              {hasCombosSelected ? 'Tiếp tục thanh toán →' : 'Bỏ qua Combo →'}
            </Text>
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
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerBadgeText: { fontSize: 12, fontWeight: '800', color: '#D97706' },
  container: { flex: 1, paddingHorizontal: 16 },
  filmHeaderContainer: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },
  filmContentRow: { flexDirection: 'row', alignItems: 'center' },
  filmPoster: { width: 60, height: 84, borderRadius: 10, backgroundColor: '#3F3F46' },
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
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  loadingBox: { paddingVertical: 24, alignItems: 'center' },
  loadingText: { fontSize: 12, color: '#64748B', marginTop: 6 },
  errorBox: { padding: 16, backgroundColor: '#FEF2F2', borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  errorText: { fontSize: 12, color: '#DC2626', textAlign: 'center', marginBottom: 8 },
  retryBtn: { backgroundColor: '#E11D48', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14 },
  retryBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  emptyBox: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 12 },
  emptyText: { fontSize: 12, color: '#64748B', textAlign: 'center' },

  comboList: { marginBottom: 8 },
  comboCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  comboIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboInfoColumn: { flex: 1, marginLeft: 12, paddingRight: 8 },
  savingsTag: { fontSize: 10, fontWeight: '800', color: '#E11D48', marginBottom: 2 },
  comboName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  comboDesc: { fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 },
  comboPriceText: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#E11D48',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  addBtnText: { color: '#E11D48', fontSize: 12, fontWeight: '700' },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E11D48',
    borderRadius: 18,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  counterBtn: { padding: 4 },
  counterValueText: { fontSize: 14, fontWeight: '700', color: '#0F172A', paddingHorizontal: 8 },

  voucherCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  voucherInputRow: { flexDirection: 'row', gap: 8 },
  voucherInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  applyVoucherBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyVoucherBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  voucherErrorText: { fontSize: 12, color: '#DC2626', fontWeight: '600', marginTop: 6 },
  appliedVoucherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  appliedVoucherTitle: { fontSize: 12, fontWeight: '800', color: '#15803D' },
  appliedVoucherSub: { fontSize: 11, color: '#166534', marginTop: 2 },
  suggestedVouchersCol: { marginTop: 10, gap: 6 },
  suggestedLabel: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  voucherHintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  voucherHintText: { fontSize: 11, fontWeight: '600', color: '#BE123C', flex: 1 },

  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  summaryLabel: { fontSize: 12, color: '#64748B' },
  summaryVal: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  summaryTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  summaryTotalLabel: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  summaryTotalVal: { fontSize: 15, fontWeight: '800', color: '#E11D48' },

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
  bottomLabelText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  bottomPriceText: { fontSize: 20, fontWeight: '800', color: '#E11D48', marginTop: 2 },
  primaryBtn: { backgroundColor: '#E11D48', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  primaryBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
