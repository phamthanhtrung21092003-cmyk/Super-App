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
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema } from '../../context/CinemaContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const { booking, setCustomerDetails, getGrandTotal, setBooking } = useCinema();

  const [fullName, setFullName] = useState(booking.customerInfo.fullName || 'Nguyễn Văn A');
  const [phone, setPhone] = useState(booking.customerInfo.phone || '0987654321');
  const [email, setEmail] = useState(booking.customerInfo.email || 'khachtest@gmail.com');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'demo' | 'qr'>('demo');

  // QR Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'WAITING' | 'SUCCESS'>('WAITING');
  const [pendingBookingCode, setPendingBookingCode] = useState('');
  const [qrCountdown, setQrCountdown] = useState(600); // 10 minutes

  // Validation States
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const movie = booking.movie || {
    title: 'Conan Movie 29: Thiên Thần Sa Ngã Trên Xa Lộ',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  };

  const seatsCount = booking.selectedSeats.length > 0 ? booking.selectedSeats.length : 2;
  const grandTotal = getGrandTotal() > 0 ? getGrandTotal() : 105000;

  // Countdown timer effect & Auto-polling bank webhook simulation
  useEffect(() => {
    let timer: any;
    let pollInterval: any;

    if (showQrModal && paymentStatus === 'WAITING') {
      // Countdown 10 mins
      timer = setInterval(() => setQrCountdown(prev => Math.max(0, prev - 1)), 1000);

      // Auto-poll bank webhook listener every 7 seconds for test demonstration
      pollInterval = setTimeout(() => {
        handleTriggerBankPaymentSuccess();
      }, 7000);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(pollInterval);
    };
  }, [showQrModal, paymentStatus]);

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
      // Demo Instant Checkout
      completeBookingWithCode(randomCode, 'Thanh toán Thử nghiệm (Miễn phí)');
    } else {
      // QR Transfer Mode: Open QR Modal and start Auto-Listening
      setPendingBookingCode(randomCode);
      setQrCountdown(600);
      setPaymentStatus('WAITING');
      setShowQrModal(true);
    }
  };

  // Called when bank webhook detects money transferred!
  const handleTriggerBankPaymentSuccess = () => {
    setPaymentStatus('SUCCESS');
    setTimeout(() => {
      setShowQrModal(false);
      completeBookingWithCode(pendingBookingCode, 'Chuyển khoản VietQR Bank (Tự động xác nhận)');
    }, 1200);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cinema/concessions');
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFDFD" translucent={false} />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtnRow}>
            <Ionicons name="arrow-back" size={20} color="#64748B" />
            <Text style={[styles.backBtnText, { fontFamily: theme.fontFamily }]}>
              Quay lại chọn bắp nước
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Moveek Film-Strip Header Component */}
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

            <View style={styles.filmHolesRow}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.filmHole} />
              ))}
            </View>
          </View>

          {/* Customer Info Card */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>K</Text>
              </View>
              <View style={styles.cardHeaderTitleCol}>
                <Text style={[styles.cardTitle, { fontFamily: theme.fontFamily }]}>Người nhận vé</Text>
                <Text style={styles.cardSubTitle}>Khách vãng lai</Text>
              </View>
            </View>

            {/* Input Full Name */}
            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.textInput, nameError ? styles.textInputError : null]}
                placeholder="Họ và tên"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  if (text.length >= 2) setNameError('');
                }}
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            {/* Input Phone */}
            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.textInput, phoneError ? styles.textInputError : null]}
                placeholder="Số điện thoại"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={text => {
                  setPhone(text);
                  if (text.length >= 9) setPhoneError('');
                }}
              />
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity style={styles.saveInfoBtn} onPress={handleSaveInfo}>
              <Text style={[styles.saveInfoBtnText, { fontFamily: theme.fontFamily }]}>Lưu</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Method Card */}
          <View style={styles.cardContainer}>
            <Text style={[styles.cardTitle, { fontFamily: theme.fontFamily, marginBottom: 10 }]}>
              Chọn phương thức thanh toán
            </Text>

            {/* Test Demo Mode Option */}
            <TouchableOpacity
              style={[
                styles.paymentOptionBox,
                selectedPaymentMode === 'demo' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMode('demo')}
            >
              <Ionicons
                name={selectedPaymentMode === 'demo' ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={selectedPaymentMode === 'demo' ? '#E11D48' : '#94A3B8'}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.paymentOptionTitle}>⚡ Thử nghiệm / Demo (Miễn phí)</Text>
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>KHUYÊN DÙNG</Text>
                  </View>
                </View>
                <Text style={styles.paymentOptionSub}>
                  Hoàn tất đặt vé ngay lập tức 0đ để nhận Mã vạch quét vé vào rạp
                </Text>
              </View>
            </TouchableOpacity>

            {/* QR Transfer Option */}
            <TouchableOpacity
              style={[
                styles.paymentOptionBox,
                selectedPaymentMode === 'qr' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMode('qr')}
            >
              <Ionicons
                name={selectedPaymentMode === 'qr' ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={selectedPaymentMode === 'qr' ? '#E11D48' : '#94A3B8'}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentOptionTitle}>📲 Chuyển khoản / Quét mã QR</Text>
                <Text style={styles.paymentOptionSub}>
                  Quét mã VietQR chuyển khoản (Mô phỏng thử nghiệm)
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfoColumn}>
            <Text style={styles.bottomLabelText}>TỔNG · {seatsCount} VÉ</Text>
            <Text style={styles.bottomPriceText}>
              {selectedPaymentMode === 'demo' ? '0 đ (Thử nghiệm)' : `${grandTotal.toLocaleString('vi-VN')} đ`}
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryPayBtn} onPress={handlePayNow}>
            <Ionicons name="checkmark-done-circle" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={[styles.primaryPayBtnText, { fontFamily: theme.fontFamily }]}>
              {selectedPaymentMode === 'demo' ? 'Xác nhận Đặt Vé' : 'Trả ngay'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* VietQR Transfer Modal */}
        <Modal visible={showQrModal} animationType="slide" transparent>
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModalCard}>
              {/* Modal Header */}
              <View style={styles.qrModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="qr-code-outline" size={22} color="#E11D48" style={{ marginRight: 6 }} />
                  <Text style={styles.qrModalTitle}>Chuyển khoản VietQR</Text>
                </View>
                <TouchableOpacity onPress={() => setShowQrModal(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Countdown badge */}
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={14} color="#D97706" style={{ marginRight: 4 }} />
                <Text style={styles.timerText}>
                  Thời gian thanh toán còn lại: {Math.floor(qrCountdown / 60)}:{(qrCountdown % 60).toString().padStart(2, '0')}
                </Text>
              </View>

              {/* QR Image Box */}
              <View style={styles.qrBox}>
                <Image
                  source={{
                    uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=20082699998888666MBBANK${grandTotal}${pendingBookingCode}`
                  }}
                  style={styles.qrImage}
                />
                <Text style={styles.qrScanInstruction}>Quét mã bằng App Ngân hàng hoặc VNPAY</Text>
              </View>

              {/* Bank Transfer Details Table */}
              <View style={styles.bankDetailCard}>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Ngân hàng:</Text>
                  <Text style={styles.bankDetailValue}>MBBank (Quân Đội)</Text>
                </View>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Số tài khoản:</Text>
                  <Text style={[styles.bankDetailValue, { color: '#E11D48' }]}>9999 8888 666</Text>
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
                  <Text style={[styles.bankDetailValue, { fontWeight: '800' }]}>{pendingBookingCode}</Text>
                </View>
              </View>

              {/* Real-time Bank Listener Status Card */}
              <View style={styles.autoListenCard}>
                {paymentStatus === 'WAITING' ? (
                  <>
                    <View style={styles.listeningRow}>
                      <ActivityIndicator size="small" color="#E11D48" style={{ marginRight: 8 }} />
                      <Text style={styles.listeningTitle}>
                        Đang chờ ngân hàng báo biến động số dư...
                      </Text>
                    </View>
                    <Text style={styles.listeningSub}>
                      Hệ thống tự động phát hành vé ngay khi nhận chuyển khoản
                    </Text>

                    {/* Developer / Testing trigger button */}
                    <TouchableOpacity
                      style={styles.simulateBankBtn}
                      onPress={handleTriggerBankPaymentSuccess}
                    >
                      <Ionicons name="flash" size={14} color="#D97706" style={{ marginRight: 4 }} />
                      <Text style={styles.simulateBankBtnText}>Giả lập MBBank nhận {grandTotal.toLocaleString('vi-VN')}đ</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.successStatusRow}>
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" style={{ marginRight: 8 }} />
                    <View>
                      <Text style={styles.successStatusTitle}>Đã nhận tiền thành công!</Text>
                      <Text style={styles.successStatusSub}>Đang phát hành mã vạch vé...</Text>
                    </View>
                  </View>
                )}
              </View>

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
  textInput: { height: 48, borderWidth: 1, borderColor: '#000000', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: '#0F172A', backgroundColor: '#FFF' },
  textInputError: { borderColor: '#E11D48', borderWidth: 1 },
  errorText: { fontSize: 12, fontWeight: '600', color: '#E11D48', marginTop: 4, marginLeft: 4 },

  saveInfoBtn: { backgroundColor: '#E11D48', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  saveInfoBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  /* Payment Section */
  paymentOptionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, padding: 12, marginBottom: 10 },
  paymentOptionSelected: { backgroundColor: '#FFF1F2', borderColor: '#E11D48' },
  paymentOptionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  paymentOptionSub: { fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 },
  demoBadge: { backgroundColor: '#22C55E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  demoBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  paymentRow: { flexDirection: 'row', alignItems: 'center' },
  paymentLogoCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center' },
  paymentLogoText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  paymentInfoCol: { flex: 1, marginLeft: 12 },
  paymentSubLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  paymentMethodName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  changeMethodBtn: { borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  changeMethodBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },

  /* Sticky Bottom Bar */
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' },
  bottomInfoColumn: {},
  bottomLabelText: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  bottomPriceText: { fontSize: 20, fontWeight: '800', color: '#E11D48', marginTop: 2 },
  primaryPayBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E11D48', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  primaryPayBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  /* VietQR Modal Styles */
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
  bankDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  bankDetailLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  bankDetailValue: { fontSize: 12, color: '#0F172A', fontWeight: '700' },

  /* Real-time Bank Listener Card */
  autoListenCard: { backgroundColor: '#FFF1F2', borderRadius: 14, borderWidth: 1, borderColor: '#FECDD3', padding: 12, width: '100%', marginBottom: 12 },
  listeningRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  listeningTitle: { fontSize: 13, fontWeight: '700', color: '#BE123C' },
  listeningSub: { fontSize: 11, color: '#9F1239', lineHeight: 15 },
  simulateBankBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, marginTop: 8 },
  simulateBankBtnText: { color: '#B45309', fontSize: 11, fontWeight: '700' },
  successStatusRow: { flexDirection: 'row', alignItems: 'center' },
  successStatusTitle: { fontSize: 14, fontWeight: '800', color: '#15803D' },
  successStatusSub: { fontSize: 11, color: '#166534', marginTop: 2 },

  cancelTransferBtn: { paddingVertical: 10, alignItems: 'center', width: '100%' },
  cancelTransferBtnText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
});
