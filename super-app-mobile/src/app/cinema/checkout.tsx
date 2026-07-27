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
  TextInput,
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

  const [fullName, setFullName] = useState(booking.customerInfo.fullName || '');
  const [phone, setPhone] = useState(booking.customerInfo.phone || '');
  const [email, setEmail] = useState(booking.customerInfo.email || '');

  // Validation States
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const movie = booking.movie || {
    title: 'Conan Movie 29 (2026): Thiên Thần Sa Ngã Trên Xa Lộ',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  };

  const seatsCount = booking.selectedSeats.length > 0 ? booking.selectedSeats.length : 2;
  const grandTotal = getGrandTotal() > 0 ? getGrandTotal() : 105000;

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

  const handlePayNow = () => {
    let isValid = true;
    if (!fullName || fullName.trim().length < 2) {
      setNameError('Họ tên quá ngắn');
      isValid = false;
    }
    if (!phone || phone.trim().length < 9) {
      setPhoneError('Số điện thoại không hợp lệ');
      isValid = false;
    }

    if (!isValid) return;

    // Set mock booking code and navigate to E-Ticket screen
    const randomCode = 'BETA-' + Math.floor(100000 + Math.random() * 900000);
    setBooking(prev => ({
      ...prev,
      customerInfo: { fullName, phone, email },
      bookingCode: randomCode,
    }));

    router.push('/cinema/ticket-detail');
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFDFD" translucent={false} />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnRow}>
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
            <View style={styles.paymentRow}>
              <View style={styles.paymentLogoCircle}>
                <Text style={styles.paymentLogoText}>Mv</Text>
              </View>

              <View style={styles.paymentInfoCol}>
                <Text style={styles.paymentSubLabel}>THANH TOÁN BẰNG</Text>
                <Text style={[styles.paymentMethodName, { fontFamily: theme.fontFamily }]}>
                  {booking.paymentMethod || 'Chuyển khoản / Quét mã QR'}
                </Text>
              </View>

              <TouchableOpacity style={styles.changeMethodBtn} onPress={() => alert('Đang mở danh sách phương thức thanh toán...')}>
                <Text style={styles.changeMethodBtnText}>Đổi</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfoColumn}>
            <Text style={styles.bottomLabelText}>TỔNG · {seatsCount} VÉ</Text>
            <Text style={styles.bottomPriceText}>
              {grandTotal.toLocaleString('vi-VN')} đ
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryPayBtn} onPress={handlePayNow}>
            <Ionicons name="lock-closed" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={[styles.primaryPayBtnText, { fontFamily: theme.fontFamily }]}>
              Trả ngay
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
});
