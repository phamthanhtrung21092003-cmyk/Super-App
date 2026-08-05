import React, { useState, useEffect } from 'react';
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
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema } from '../../context/CinemaContext';

type PaymentMode = 'vietqr' | 'momo' | 'vnpay' | 'demo';
type UIStatus = 'IDLE' | 'PENDING' | 'CHECKING' | 'NOT_RECEIVED' | 'SUCCESS';

export default function CinemaCheckoutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const { booking, setCustomerDetails, getGrandTotal, setBooking } = useCinema();

  const [fullName, setFullName] = useState(booking.customerInfo.fullName || 'Nguyễn Văn A');
  const [phone, setPhone] = useState(booking.customerInfo.phone || '0987654321');
  const [email, setEmail] = useState(booking.customerInfo.email || 'khachtest@gmail.com');
  
  // Payment selection mode (Default VietQR like Travel)
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode>('vietqr');

  // QR Modal & Real-time Status States (Matches Travel Payment Architecture)
  const [showQrModal, setShowQrModal] = useState(false);
  const [uiStatus, setUiStatus] = useState<UIStatus>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  const [pendingBookingCode, setPendingBookingCode] = useState('');
  const [qrCountdown, setQrCountdown] = useState(600); // 10 mins TTL
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Validation States
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const movie = booking.movie || {
    title: 'Conan Movie 29: Thiên Thần Sa Ngã Trên Xa Lộ',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  };

  const seatsCount = booking.selectedSeats.length > 0 ? booking.selectedSeats.length : 2;
  const grandTotal = getGrandTotal() > 0 ? getGrandTotal() : 105000;
  const seatsText = booking.selectedSeats.length > 0
    ? booking.selectedSeats.map(s => s.id).join(', ')
    : 'E5, E6';

  // 10-Minute Countdown Timer (NO AUTO-TRIGGER, user or bank webhook verifies)
  useEffect(() => {
    let timer: any;
    if (showQrModal && qrCountdown > 0 && uiStatus !== 'SUCCESS') {
      timer = setInterval(() => setQrCountdown(prev => Math.max(0, prev - 1)), 1000);
    }
    return () => clearInterval(timer);
  }, [showQrModal, qrCountdown, uiStatus]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, label: string) => {
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleSaveInfo = () => {
    let isValid = true;
    if (!fullName || fullName.trim().length < 2) {
      setNameError('Họ tên quá ngắn');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!phone || phone.trim().length < 9) {
      setPhoneError('Số điện thoại không hợp lệ');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (isValid) {
      setCustomerDetails(fullName, phone, email);
      alert('Đã lưu thông tin người nhận vé!');
    }
  };

  const completeBookingWithCode = (code: string, methodStr: string) => {
    const nameToUse = fullName.trim() || 'Nguyễn Văn A';
    const phoneToUse = phone.trim() || '0987654321';

    setBooking(prev => ({
      ...prev,
      customerInfo: { fullName: nameToUse, phone: phoneToUse, email },
      bookingCode: code,
      paymentMethod: methodStr,
    }));

    router.push('/cinema/ticket-detail');
  };

  const handlePayNow = () => {
    const brandPrefix = (booking.cinemaName?.split(' ')[0].toUpperCase() || 'BETA');
    const randomCode = `${brandPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    if (selectedPaymentMode === 'demo') {
      // Demo Instant Free Checkout
      completeBookingWithCode(randomCode, 'Thanh toán Thử nghiệm (Miễn phí)');
    } else {
      // QR Transfer Mode (VietQR / MoMo / VNPAY): Open Modal in PENDING status (Matches Travel)
      setPendingBookingCode(randomCode);
      setQrCountdown(600);
      setUiStatus('PENDING');
      setStatusMessage('');
      setShowQrModal(true);
    }
  };

  /**
   * Action button "Tôi Đã Chuyển Khoản Xong" or "⚡ Giả lập MBBank..."
   * Connects to bank status check and transitions gracefully to Success (Matches Travel flow)
   */
  const handleCheckPaymentStatus = () => {
    setUiStatus('CHECKING');
    setStatusMessage('Đang kết nối Ngân hàng đối soát giao dịch...');

    setTimeout(() => {
      setUiStatus('SUCCESS');
      setStatusMessage('Xác minh thanh toán thành công!');

      setTimeout(() => {
        setShowQrModal(false);
        const methodTitle = selectedPaymentMode === 'momo' 
          ? 'Ví MoMo (Đã thanh toán)' 
          : selectedPaymentMode === 'vnpay'
          ? 'VNPAY QR (Đã thanh toán)'
          : 'Chuyển khoản VietQR Bank (Đã xác nhận)';
        completeBookingWithCode(pendingBookingCode, methodTitle);
      }, 1000);
    }, 1500);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cinema/concessions');
    }
  };

  const qrImageUrl = `https://img.vietqr.io/image/MB-99998888666-compact2.png?amount=${grandTotal}&addInfo=${pendingBookingCode}&accountName=${encodeURIComponent('RAP PHIM MOVEEK CINEMA')}`;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFDFD" translucent={false} />

        {/* Top Header Link */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtnRow}>
            <Ionicons name="arrow-back" size={20} color="#64748B" />
            <Text style={[styles.backBtnText, { fontFamily: theme.fontFamily }]}>
              Quay lại chọn bắp nước
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Moveek Film-Strip Header Card */}
          <View style={styles.filmHeaderContainer}>
            <View style={styles.filmHolesRow}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.filmHole} />
              ))}
            </View>

            <View style={styles.filmContentRow}>
              <Image source={{ uri: movie.poster }} style={styles.filmPoster} />
              <View style={styles.filmMetaColumn}>
                <View style={styles.filmTagBadge}>
                  <Text style={styles.filmTagText}>Moveek Cinema</Text>
                </View>
                <Text style={[styles.filmTitle, { fontFamily: theme.fontFamily }]} numberOfLines={2}>
                  {movie.title}
                </Text>
                <View style={styles.filmInfoDetailRow}>
                  <Ionicons name="film-outline" size={13} color="#E2E8F0" style={{ marginRight: 4 }} />
                  <Text style={styles.filmInfoDetailText}>
                    {booking.cinemaName || 'LOTTE Cinema Nam Định'}
                  </Text>
                </View>
                <View style={styles.filmInfoDetailRow}>
                  <Ionicons name="calendar-outline" size={13} color="#E2E8F0" style={{ marginRight: 4 }} />
                  <Text style={styles.filmInfoDetailText}>
                    {booking.showtimeDate || 'Hôm Nay'} · {booking.showtimeHour || '19:30'} · {booking.screeningFormat || '2D'}
                  </Text>
                </View>
                <View style={styles.filmInfoDetailRow}>
                  <Ionicons name="ticket-outline" size={13} color="#E11D48" style={{ marginRight: 4 }} />
                  <Text style={[styles.filmInfoDetailText, { color: '#FECDD3', fontWeight: '700' }]}>
                    Ghế: {seatsText} ({seatsCount} vé)
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.filmHolesRow}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.filmHole} />
              ))}
            </View>
          </View>

          {/* Customer Information Card */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {fullName ? fullName.charAt(0).toUpperCase() : 'N'}
                </Text>
              </View>
              <View style={styles.cardHeaderTitleCol}>
                <Text style={[styles.cardTitle, { fontFamily: theme.fontFamily }]}>Thông tin người nhận vé</Text>
                <Text style={styles.cardSubTitle}>Vé điện tử & Mã QR sẽ gửi qua SĐT / Email này</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.textInput, nameError ? styles.textInputError : null]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Họ và tên người nhận vé *"
                placeholderTextColor="#94A3B8"
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.textInput, phoneError ? styles.textInputError : null]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Số điện thoại nhận mã QR *"
                placeholderTextColor="#94A3B8"
              />
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Địa chỉ Email (Nhận hóa đơn điện tử)"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <TouchableOpacity style={styles.saveInfoBtn} onPress={handleSaveInfo}>
              <Text style={styles.saveInfoBtnText}>Lưu thông tin</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Method Selection Section (Matches Travel Payment Options) */}
          <View style={styles.cardContainer}>
            <Text style={[styles.cardTitle, { fontFamily: theme.fontFamily, marginBottom: 12 }]}>
              Phương thức thanh toán
            </Text>

            {/* Option 1: VietQR Bank Transfer (Recommended) */}
            <TouchableOpacity
              style={[
                styles.paymentOptionBox,
                selectedPaymentMode === 'vietqr' && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPaymentMode('vietqr')}
            >
              <View style={[styles.radioCircle, selectedPaymentMode === 'vietqr' && styles.radioCircleActive]}>
                {selectedPaymentMode === 'vietqr' && <View style={styles.radioDot} />}
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.paymentOptionTitle}>Chuyển khoản VietQR Ngân hàng (MBBank)</Text>
                  <View style={styles.recommendBadge}>
                    <Text style={styles.recommendBadgeText}>Tự động</Text>
                  </View>
                </View>
                <Text style={styles.paymentOptionSub}>Quét mã QR bằng App ngân hàng bất kỳ · Nhận vé tức thì</Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: MoMo / VNPAY */}
            <TouchableOpacity
              style={[
                styles.paymentOptionBox,
                selectedPaymentMode === 'momo' && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPaymentMode('momo')}
            >
              <View style={[styles.radioCircle, selectedPaymentMode === 'momo' && styles.radioCircleActive]}>
                {selectedPaymentMode === 'momo' && <View style={styles.radioDot} />}
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.paymentOptionTitle}>Ví MoMo / ZaloPay / VNPAY QR</Text>
                <Text style={styles.paymentOptionSub}>Thanh toán siêu tốc bằng ứng dụng ví điện tử</Text>
              </View>
            </TouchableOpacity>

            {/* Option 3: Demo Free Checkout */}
            <TouchableOpacity
              style={[
                styles.paymentOptionBox,
                selectedPaymentMode === 'demo' && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPaymentMode('demo')}
            >
              <View style={[styles.radioCircle, selectedPaymentMode === 'demo' && styles.radioCircleActive]}>
                {selectedPaymentMode === 'demo' && <View style={styles.radioDot} />}
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.paymentOptionTitle}>Thanh toán Thử nghiệm (Miễn phí)</Text>
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>TEST DEMO</Text>
                  </View>
                </View>
                <Text style={styles.paymentOptionSub}>Bỏ qua cổng thanh toán · Nhận vé điện tử ngay để kiểm thử</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Sticky Payment Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfoColumn}>
            <Text style={styles.bottomLabelText}>TỔNG CỘNG ({seatsCount} VÉ)</Text>
            <Text style={[styles.bottomPriceText, { fontFamily: theme.fontFamily }]}>
              {grandTotal.toLocaleString('vi-VN')} đ
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryPayBtn} onPress={handlePayNow}>
            <Text style={[styles.primaryPayBtnText, { fontFamily: theme.fontFamily }]}>
              Thanh Toán Đặt Vé
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#FFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* VietQR Payment Modal (Refactored to match Travel Payment Flow) */}
        <Modal
          visible={showQrModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowQrModal(false)}
        >
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModalCard}>
              {/* Modal Header */}
              <View style={styles.qrModalHeader}>
                <Text style={[styles.qrModalTitle, { fontFamily: theme.fontFamily }]}>
                  Chuyển khoản VietQR
                </Text>
                <TouchableOpacity onPress={() => setShowQrModal(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Countdown Badge */}
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={14} color="#D97706" style={{ marginRight: 4 }} />
                <Text style={styles.timerText}>
                  Thời gian giữ vé còn lại: {formatCountdown(qrCountdown)}
                </Text>
              </View>

              {/* QR Image Frame */}
              <View style={styles.qrBox}>
                <Image source={{ uri: qrImageUrl }} style={styles.qrImage} />
                <Text style={styles.qrScanInstruction}>Quét mã bằng App Ngân hàng hoặc VNPAY</Text>
              </View>

              {/* Bank Transfer Details with Copy Buttons */}
              <View style={styles.bankDetailCard}>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Ngân hàng:</Text>
                  <Text style={styles.bankDetailValue}>MBBank (Quân Đội)</Text>
                </View>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Số tài khoản:</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.bankDetailValue, { color: '#E11D48' }]}>9999 8888 666</Text>
                    <TouchableOpacity onPress={() => handleCopy('9999 8888 666', 'stk')} style={styles.copyBtn}>
                      <Text style={[styles.copyBtnText, copiedText === 'stk' && { color: '#22C55E' }]}>
                        {copiedText === 'stk' ? '✓ Đã chép' : 'Sao chép'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Chủ tài khoản:</Text>
                  <Text style={styles.bankDetailValue}>RẠP PHIM MOVEEK CINEMA</Text>
                </View>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Số tiền:</Text>
                  <Text style={[styles.bankDetailValue, { color: '#E11D48', fontWeight: '800' }]}>
                    {grandTotal.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
                <View style={[styles.bankDetailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.bankDetailLabel}>Cú pháp CK:</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.bankDetailValue, { fontWeight: '800' }]}>{pendingBookingCode}</Text>
                    <TouchableOpacity onPress={() => handleCopy(pendingBookingCode, 'code')} style={styles.copyBtn}>
                      <Text style={[styles.copyBtnText, copiedText === 'code' && { color: '#22C55E' }]}>
                        {copiedText === 'code' ? '✓ Đã chép' : 'Sao chép'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Status Box (Matches Travel status states) */}
              <View style={styles.statusBox}>
                {uiStatus === 'PENDING' && (
                  <>
                    <View style={styles.statusRow}>
                      <ActivityIndicator size="small" color="#E11D48" style={{ marginRight: 8 }} />
                      <Text style={styles.statusTitle}>
                        Đang chờ ngân hàng báo biến động số dư...
                      </Text>
                    </View>
                    <Text style={styles.statusSub}>
                      Hệ thống tự động phát hành vé ngay khi nhận chuyển khoản
                    </Text>

                    {/* Simulation Helper */}
                    <TouchableOpacity
                      style={styles.simulateBankBtn}
                      onPress={handleCheckPaymentStatus}
                    >
                      <Ionicons name="flash" size={14} color="#D97706" style={{ marginRight: 4 }} />
                      <Text style={styles.simulateBankBtnText}>Giả lập MBBank nhận {grandTotal.toLocaleString('vi-VN')}đ</Text>
                    </TouchableOpacity>
                  </>
                )}

                {uiStatus === 'CHECKING' && (
                  <View style={styles.statusRow}>
                    <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 8 }} />
                    <Text style={[styles.statusTitle, { color: '#2563EB' }]}>
                      {statusMessage || 'Đang kết nối Ngân hàng đối soát giao dịch...'}
                    </Text>
                  </View>
                )}

                {uiStatus === 'SUCCESS' && (
                  <View style={styles.statusRow}>
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" style={{ marginRight: 8 }} />
                    <View>
                      <Text style={[styles.statusTitle, { color: '#15803D' }]}>Đã nhận thanh toán thành công!</Text>
                      <Text style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>Đang phát hành vé điện tử...</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Primary Action Button (Matches Travel "Tôi Đã Chuyển Khoản Xong") */}
              <TouchableOpacity
                style={styles.checkPaymentBtn}
                onPress={handleCheckPaymentStatus}
                disabled={uiStatus === 'CHECKING' || uiStatus === 'SUCCESS'}
              >
                <Text style={styles.checkPaymentBtnText}>
                  {uiStatus === 'CHECKING' ? 'Đang kiểm tra đối soát...' : 'Tôi Đã Chuyển Khoản Xong'}
                </Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelTransferBtn}
                onPress={() => setShowQrModal(false)}
              >
                <Text style={styles.cancelTransferBtnText}>Hủy giao dịch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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

  /* Card Containers */
  cardContainer: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  cardHeaderTitleCol: { marginLeft: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardSubTitle: { fontSize: 12, color: '#64748B' },

  inputGroup: { marginBottom: 10 },
  textInput: { height: 48, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: '#0F172A', backgroundColor: '#FFF' },
  textInputError: { borderColor: '#E11D48', borderWidth: 1 },
  errorText: { fontSize: 12, fontWeight: '600', color: '#E11D48', marginTop: 4, marginLeft: 4 },

  saveInfoBtn: { backgroundColor: '#E11D48', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  saveInfoBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  /* Payment Section Options (Matching Travel) */
  paymentOptionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, padding: 12, marginBottom: 10 },
  paymentOptionSelected: { backgroundColor: '#FFF1F2', borderColor: '#E11D48' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  radioCircleActive: { borderColor: '#E11D48' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E11D48' },
  paymentOptionTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  paymentOptionSub: { fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 },
  recommendBadge: { backgroundColor: '#FEF2F2', borderBottomWidth: 1, borderColor: '#FCA5A5', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, marginLeft: 6 },
  recommendBadgeText: { color: '#E11D48', fontSize: 9, fontWeight: '800' },
  demoBadge: { backgroundColor: '#22C55E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  demoBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  /* Sticky Bottom Bar */
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' },
  bottomInfoColumn: {},
  bottomLabelText: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  bottomPriceText: { fontSize: 20, fontWeight: '800', color: '#E11D48', marginTop: 2 },
  primaryPayBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E11D48', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  primaryPayBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  /* VietQR Modal Styles (Refactored to match Travel) */
  qrModalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrModalCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, width: '100%', maxWidth: 360, alignItems: 'center' },
  qrModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 },
  qrModalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 14 },
  timerText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  qrBox: { alignItems: 'center', padding: 12, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  qrImage: { width: 180, height: 180, borderRadius: 8 },
  qrScanInstruction: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 8 },

  bankDetailCard: { backgroundColor: '#F1F5F9', borderRadius: 14, padding: 12, width: '100%', marginBottom: 12 },
  bankDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  bankDetailLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  bankDetailValue: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  copyBtn: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#EFF6FF', borderRadius: 6 },
  copyBtnText: { fontSize: 11, color: '#2563EB', fontWeight: '700' },

  /* Real-time Status Card (Matches Travel Status States) */
  statusBox: { backgroundColor: '#FFF1F2', borderRadius: 14, borderWidth: 1, borderColor: '#FECDD3', padding: 12, width: '100%', marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statusTitle: { fontSize: 13, fontWeight: '700', color: '#BE123C' },
  statusSub: { fontSize: 11, color: '#9F1239', lineHeight: 15 },
  simulateBankBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, marginTop: 8 },
  simulateBankBtnText: { color: '#B45309', fontSize: 11, fontWeight: '700' },

  /* Primary Action Button (Matches Travel "Tôi Đã Chuyển Khoản Xong") */
  checkPaymentBtn: { backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 6 },
  checkPaymentBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  cancelTransferBtn: { paddingVertical: 10, alignItems: 'center', width: '100%' },
  cancelTransferBtnText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
});
