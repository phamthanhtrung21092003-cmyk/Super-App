import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Alert,
  AppState,
  AppStateStatus,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCinema } from '../../context/CinemaContext';
import { useUser } from '../../context/UserContext';
import {
  movieService,
  copyToDeviceClipboard,
  BackendMovieOrder,
} from '../../services/movieService';
import { paymentService, PaymentStatusResponse } from '../../services/paymentService';

type CheckoutFlowStatus =
  | 'IDLE'
  | 'PAYMENT_PENDING'
  | 'BOOKING_CONFIRMING'
  | 'TICKET_ISSUED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'FAILED'
  | 'EXPIRED';

const MAX_POLL_ATTEMPTS = 120; // Bounded polling (max ~6 minutes at 3s interval)

export default function CinemaCheckoutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const {
    booking,
    setCustomerDetails,
    setServerMovieOrder,
    setIssuedTicket,
    clearExpiredHold,
    getSeatsTotalPrice,
    getCombosTotalPrice,
    getDiscountAmount,
    getGrandTotal,
    getRemainingHoldSeconds,
  } = useCinema();
  const { userName, phone: userPhone, email: userEmail } = useUser();

  const [fullName, setFullName] = useState<string>(
    booking.customerInfo.fullName || userName || ''
  );
  const [phone, setPhone] = useState<string>(
    booking.customerInfo.phone || userPhone || ''
  );
  const [email, setEmail] = useState<string>(
    booking.customerInfo.email || userEmail || ''
  );
  const [nameError, setNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submitLockRef = useRef<boolean>(false);

  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentOrderData, setPaymentOrderData] = useState<any | null>(null);
  const [flowStatus, setFlowStatus] = useState<CheckoutFlowStatus>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isCheckingServer, setIsCheckingServer] = useState<boolean>(false);
  const pollCountRef = useRef<number>(0);

  // Server-driven countdown (from serverOrder.expiresAt or holdExpiresAt)
  useEffect(() => {
    const expiresIso = booking.serverOrder?.expiresAt || booking.holdExpiresAt;
    if (!expiresIso) return;

    const tick = () => {
      const rem = getRemainingHoldSeconds();
      setRemainingSeconds(rem);
      if (
        rem <= 0 &&
        flowStatus !== 'TICKET_ISSUED' &&
        flowStatus !== 'BOOKING_CONFIRMING' &&
        flowStatus !== 'REFUNDED' &&
        flowStatus !== 'REFUND_PENDING'
      ) {
        setFlowStatus('EXPIRED');
        setStatusMessage('Đơn đặt vé đã hết thời gian giữ ghế trên Server.');
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [
    booking.serverOrder?.expiresAt,
    booking.holdExpiresAt,
    flowStatus,
    getRemainingHoldSeconds,
  ]);

  const validateCustomerFields = (): boolean => {
    let ok = true;
    if (!fullName || fullName.trim().length < 2) {
      setNameError('Vui lòng nhập họ và tên người nhận vé (tối thiểu 2 ký tự)');
      ok = false;
    } else {
      setNameError('');
    }
    if (!phone || phone.trim().length < 9) {
      setPhoneError('Vui lòng nhập số điện thoại hợp lệ');
      ok = false;
    } else {
      setPhoneError('');
    }
    return ok;
  };

  const evaluateServerPaymentStatus = useCallback(
    async (statusRes: PaymentStatusResponse, currentMovieOrder?: BackendMovieOrder | null) => {
      const pStatus = statusRes.paymentStatus;
      const mbStatus = statusRes.movieBookingStatus;
      const moStatus = statusRes.movieOrderStatus;
      const tickets = statusRes.tickets || [];

      if (
        mbStatus === 'TICKET_ISSUED' ||
        (pStatus === 'PAID' && tickets.length > 0)
      ) {
        const ticket = tickets[0];
        if (ticket) {
          setIssuedTicket(ticket);
        }
        setFlowStatus('TICKET_ISSUED');
        setStatusMessage('Đã xuất vé và cấp mã Barcode thành công!');
        setShowPaymentModal(false);
        const ticketIdParam = ticket?.id || '';
        const orderIdParam = statusRes.movieOrderId || currentMovieOrder?.id || '';
        router.replace(
          `/cinema/ticket-detail?ticketId=${encodeURIComponent(ticketIdParam)}&orderId=${encodeURIComponent(orderIdParam)}` as any
        );
        return;
      }

      if (pStatus === 'PAID' && (mbStatus === 'BOOKING_CONFIRMING' || mbStatus === 'CONFIRMED')) {
        setFlowStatus('BOOKING_CONFIRMING');
        setStatusMessage(
          'Đã nhận thanh toán! Đang đồng bộ xác nhận chỗ ngồi và phát hành Barcode với hệ thống Rạp...'
        );
        return;
      }

      if (
        pStatus === 'REFUNDED' ||
        moStatus === 'REFUNDED' ||
        mbStatus === 'REFUNDED'
      ) {
        setFlowStatus('REFUNDED');
        setStatusMessage(
          'Rạp đối tác không thể xuất vé cho ghế này. Hệ thống V-Life đã hoàn tiền 100% về Ví của bạn.'
        );
        return;
      }

      if (mbStatus === 'REFUND_PENDING' || mbStatus === 'FAILED') {
        setFlowStatus('REFUND_PENDING');
        setStatusMessage(
          'Thanh toán đã ghi nhận nhưng rạp đối tác báo lỗi xuất vé. Hệ thống đang xử lý hoàn tiền tự động (REFUND_PENDING).'
        );
        return;
      }

      if (pStatus === 'PAYMENT_FAILED') {
        setFlowStatus('FAILED');
        setStatusMessage('Giao dịch thanh toán thất bại hoặc sai số tiền.');
        return;
      }

      if (pStatus === 'PAYMENT_EXPIRED' || moStatus === 'EXPIRED' || statusRes.isExpired) {
        setFlowStatus('EXPIRED');
        setStatusMessage('Đơn thanh toán đã hết hạn giữ ghế.');
        return;
      }

      setFlowStatus('PAYMENT_PENDING');
      setStatusMessage('Đang chờ ngân hàng xác nhận giao dịch VietQR qua V-Life Payment Core...');
    },
    [router, setIssuedTicket]
  );

  // Poll Payment Status from Real Backend Database
  const checkPaymentStatusFromServer = useCallback(async () => {
    const orderIdToPoll = paymentOrderData?.orderId;
    if (!orderIdToPoll) return;

    try {
      setIsCheckingServer(true);
      const statusRes = await paymentService.getPaymentStatus(orderIdToPoll);
      await evaluateServerPaymentStatus(statusRes, booking.serverOrder);
    } catch (err: any) {
      // Do not crash polling on transient network hiccup
    } finally {
      setIsCheckingServer(false);
    }
  }, [paymentOrderData?.orderId, evaluateServerPaymentStatus, booking.serverOrder]);

  useEffect(() => {
    if (!showPaymentModal || !paymentOrderData?.orderId) return;
    if (
      flowStatus === 'TICKET_ISSUED' ||
      flowStatus === 'REFUNDED' ||
      flowStatus === 'FAILED' ||
      flowStatus === 'EXPIRED'
    ) {
      return;
    }

    pollCountRef.current = 0;
    const interval = setInterval(() => {
      pollCountRef.current += 1;
      if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
        clearInterval(interval);
        return;
      }
      checkPaymentStatusFromServer();
    }, 3000);

    return () => clearInterval(interval);
  }, [showPaymentModal, paymentOrderData?.orderId, flowStatus, checkPaymentStatusFromServer]);

  // Re-verify immediately when App resumes from background (e.g. after switching to Banking app)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active' && paymentOrderData?.orderId) {
        checkPaymentStatusFromServer();
      }
    });
    return () => sub.remove();
  }, [paymentOrderData?.orderId, checkPaymentStatusFromServer]);

  const handleCreateOrderAndPayment = async () => {
    if (booking.selectedSeats.length === 0) {
      Alert.alert('Chưa có ghế giữ chỗ', 'Vui lòng chọn ghế trước khi thanh toán.');
      router.replace('/cinema/seat-selection');
      return;
    }

    if (!validateCustomerFields()) {
      return;
    }

    if (submitLockRef.current || isSubmitting) return;
    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      setCustomerDetails(fullName.trim(), phone.trim(), email.trim());

      // Reuse existing PENDING MovieOrder if already created for the same hold, or create a new one on Server
      let currentOrder = booking.serverOrder;
      if (!currentOrder) {
        const seatIds = booking.selectedSeats.map(s => s.seatId);
        const combosPayload = booking.selectedCombos
          .filter(c => c.quantity > 0)
          .map(c => ({ comboId: c.id, quantity: c.quantity }));

        const orderIdemKey = `MVO_${booking.showtimeId}_${seatIds.slice().sort().join('_')}_${booking.holdIds.join('_')}`;

        currentOrder = await movieService.createMovieOrder({
          showtimeId: booking.showtimeId,
          seatIds,
          combos: combosPayload.length > 0 ? combosPayload : undefined,
          voucherCode: booking.voucherCode || undefined,
          customerName: fullName.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim() || undefined,
          idempotencyKey: orderIdemKey,
        });

        setServerMovieOrder(currentOrder);
      }

      // Create Payment Order via V-Life Shared Payment Core
      const payIdemKey = `PAY_MVO_${currentOrder.id}`;
      const payRes = await paymentService.createPaymentOrder({
        movieOrderId: currentOrder.id,
        provider: 'VIETQR',
        idempotencyKey: payIdemKey,
      });

      const pOrder = payRes.paymentOrder;
      setPaymentOrderData(pOrder);
      setFlowStatus('PAYMENT_PENDING');
      setStatusMessage(
        'Vui lòng quét mã VietQR hoặc chuyển khoản đúng nội dung để hệ thống tự động xuất vé.'
      );
      setShowPaymentModal(true);
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể khởi tạo đơn đặt vé hoặc thanh toán.';
      const msgText = Array.isArray(serverMsg) ? serverMsg.join(', ') : String(serverMsg);
      Alert.alert('Không thể tạo đơn thanh toán', msgText);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleReconcileConfirmingBooking = async () => {
    const targetOrderId = booking.serverOrder?.id || booking.movieOrderId;
    if (!targetOrderId) return;
    try {
      setIsCheckingServer(true);
      await movieService.reconcileOrder(targetOrderId);
      await checkPaymentStatusFromServer();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Hệ thống rạp vẫn đang xử lý. Vui lòng thử lại sau giây lát.';
      Alert.alert('Thông báo đối soát', Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setIsCheckingServer(false);
    }
  };

  const handleCopy = async (value: string, label: string) => {
    const ok = await copyToDeviceClipboard(value);
    if (ok) {
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cinema/concessions');
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
      : 'Chưa chọn ghế';
  const seatsSubtotal = getSeatsTotalPrice();
  const combosSubtotal = getCombosTotalPrice();
  const discountAmount = getDiscountAmount();
  const grandTotal = getGrandTotal();
  const vietqr = paymentOrderData?.vietqrInfo;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFDFD" translucent={false} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtnRow}>
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
            <Text style={[styles.backBtnText, { fontFamily: theme.fontFamily }]}>
              Quay lại chọn Combo & Voucher
            </Text>
          </TouchableOpacity>

          {remainingSeconds > 0 && (
            <View style={styles.timerPill}>
              <Ionicons name="time-outline" size={14} color="#D97706" style={{ marginRight: 4 }} />
              <Text style={styles.timerPillText}>{formatCountdown(remainingSeconds)}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Order Summary Header Card */}
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
                  <Text style={styles.filmTagText}>
                    {booking.cinemaBrand || 'V-LIFE'} • {booking.format}
                  </Text>
                </View>
                <Text style={[styles.filmTitle, { fontFamily: theme.fontFamily }]} numberOfLines={2}>
                  {booking.movie?.title || 'Đặt vé xem phim'}
                </Text>
                <Text style={styles.filmInfoDetailText}>
                  Rạp: {booking.cinemaName} ({booking.roomName})
                </Text>
                <Text style={styles.filmInfoDetailText}>
                  Suất chiếu: {booking.time} • {booking.dateLabel}
                </Text>
                <Text style={[styles.filmInfoDetailText, { color: '#FECDD3', fontWeight: '800' }]}>
                  Ghế giữ chỗ: {seatsText} ({booking.selectedSeats.length} ghế)
                </Text>
              </View>
            </View>
          </View>

          {/* Server-Authoritative Pricing Breakdown */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Chi tiết giá (Server tính & khóa giá)</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Tiền ghế ({booking.selectedSeats.map(s => s.id).join(', ') || '0 ghế'})
              </Text>
              <Text style={styles.priceValue}>{seatsSubtotal.toLocaleString('vi-VN')} đ</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Combo bắp nước ({booking.selectedCombos.reduce((n, c) => n + c.quantity, 0)})
              </Text>
              <Text style={styles.priceValue}>{combosSubtotal.toLocaleString('vi-VN')} đ</Text>
            </View>

            {booking.selectedCombos.map(c => (
              <Text key={c.id} style={styles.comboSubItem}>
                • {c.name} x{c.quantity} ({(c.price * c.quantity).toLocaleString('vi-VN')}đ)
              </Text>
            ))}

            {discountAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: '#16A34A' }]}>
                  Voucher giảm giá ({booking.voucherCode})
                </Text>
                <Text style={[styles.priceValue, { color: '#16A34A' }]}>
                  -{discountAmount.toLocaleString('vi-VN')} đ
                </Text>
              </View>
            )}

            <View style={[styles.priceRow, styles.priceTotalRow]}>
              <Text style={styles.priceTotalLabel}>Tổng thanh toán (Server Total)</Text>
              <Text style={styles.priceTotalValue}>{grandTotal.toLocaleString('vi-VN')} đ</Text>
            </View>
          </View>

          {/* Customer Information Card */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Thông tin người nhận vé điện tử</Text>
            <Text style={styles.cardSubTitle}>
              Mã đặt vé và thông báo phát hành Barcode sẽ gắn với tài khoản của bạn
            </Text>

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
                placeholder="Số điện thoại liên hệ *"
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
                placeholder="Email nhận thông tin vé (Không bắt buộc)"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Payment Method Info (Shared V-Life Payment Core) */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Phương thức thanh toán (V-Life Payment Core)</Text>
            <View style={styles.paymentOptionBox}>
              <Ionicons name="qr-code-outline" size={24} color="#E11D48" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentOptionTitle}>
                  Chuyển khoản Ngân hàng VietQR 24/7
                </Text>
                <Text style={styles.paymentOptionSub}>
                  Tự động xác thực qua Webhook Ngân hàng & kích hoạt đặt vé trực tiếp tại hệ thống Rạp.
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabelText}>TỔNG THANH TOÁN</Text>
            <Text style={styles.bottomPriceText}>{grandTotal.toLocaleString('vi-VN')} đ</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryPayBtn, isSubmitting && { opacity: 0.65 }]}
            disabled={isSubmitting}
            onPress={handleCreateOrderAndPayment}
          >
            {isSubmitting ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryPayBtnText}>Đang khởi tạo...</Text>
              </View>
            ) : (
              <Text style={[styles.primaryPayBtnText, { fontFamily: theme.fontFamily }]}>
                Thanh toán VietQR
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Real V-Life Payment Core VietQR Modal */}
        <Modal visible={showPaymentModal} transparent animationType="slide">
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModalCard}>
              <View style={styles.qrModalHeader}>
                <Text style={styles.qrModalTitle}>Thanh Toán Đơn Vé Xem Phim</Text>
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <Ionicons name="close" size={24} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {/* Countdown */}
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
                <Text style={styles.timerText}>
                  Thời gian giữ ghế & thanh toán còn: {formatCountdown(remainingSeconds)}
                </Text>
              </View>

              {/* Strict Warning: Payment QR != Ticket Barcode */}
              <View style={styles.qrWarningBanner}>
                <Ionicons name="information-circle" size={16} color="#1D4ED8" style={{ marginRight: 6 }} />
                <Text style={styles.qrWarningText}>
                  Đây là Mã QR Chuyển Khoản Ngân Hàng (Payment QR), KHÔNG PHẢI mã in vé tại rạp. Mã Barcode in vé sẽ được cấp sau khi thanh toán hoàn tất.
                </Text>
              </View>

              {/* VietQR Image from Backend */}
              {vietqr?.qrUrl && flowStatus === 'PAYMENT_PENDING' && (
                <View style={styles.qrBox}>
                  <Image source={{ uri: vietqr.qrUrl }} style={styles.qrImage} />
                  <Text style={styles.qrScanInstruction}>
                    Mở ứng dụng Ngân hàng bất kỳ để quét mã VietQR
                  </Text>
                </View>
              )}

              {/* Bank Transfer Details with Real Clipboard Copy */}
              {vietqr && (
                <View style={styles.bankDetailCard}>
                  <View style={styles.bankDetailRow}>
                    <Text style={styles.bankDetailLabel}>Ngân hàng:</Text>
                    <Text style={styles.bankDetailValue}>{vietqr.bankId}</Text>
                  </View>
                  <View style={styles.bankDetailRow}>
                    <Text style={styles.bankDetailLabel}>Chủ tài khoản:</Text>
                    <Text style={styles.bankDetailValue}>{vietqr.accountName}</Text>
                  </View>
                  <View style={styles.bankDetailRow}>
                    <Text style={styles.bankDetailLabel}>Số tài khoản:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.bankDetailValue}>{vietqr.accountNumber}</Text>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => handleCopy(String(vietqr.accountNumber), 'ACCOUNT')}
                      >
                        <Text style={styles.copyBtnText}>
                          {copiedField === 'ACCOUNT' ? 'Đã chép' : 'Sao chép'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.bankDetailRow}>
                    <Text style={styles.bankDetailLabel}>Số tiền:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.bankDetailValue, { color: '#E11D48' }]}>
                        {Number(vietqr.amount || grandTotal).toLocaleString('vi-VN')} đ
                      </Text>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => handleCopy(String(vietqr.amount || grandTotal), 'AMOUNT')}
                      >
                        <Text style={styles.copyBtnText}>
                          {copiedField === 'AMOUNT' ? 'Đã chép' : 'Sao chép'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={[styles.bankDetailRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.bankDetailLabel}>Nội dung CK:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.bankDetailValue, { color: '#2563EB' }]}>
                        {vietqr.transferContent || paymentOrderData?.orderId}
                      </Text>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() =>
                          handleCopy(
                            String(vietqr.transferContent || paymentOrderData?.orderId),
                            'CONTENT'
                          )
                        }
                      >
                        <Text style={styles.copyBtnText}>
                          {copiedField === 'CONTENT' ? 'Đã chép' : 'Sao chép'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Live Server Status Box */}
              <View
                style={[
                  styles.statusBox,
                  flowStatus === 'BOOKING_CONFIRMING' && styles.statusBoxConfirming,
                  (flowStatus === 'REFUND_PENDING' || flowStatus === 'REFUNDED') &&
                    styles.statusBoxRefund,
                ]}
              >
                <View style={styles.statusRow}>
                  {flowStatus === 'PAYMENT_PENDING' || flowStatus === 'BOOKING_CONFIRMING' ? (
                    <ActivityIndicator size="small" color="#E11D48" style={{ marginRight: 8 }} />
                  ) : (
                    <Ionicons
                      name={
                        flowStatus === 'REFUNDED' || flowStatus === 'REFUND_PENDING'
                          ? 'shield-checkmark'
                          : 'alert-circle'
                      }
                      size={18}
                      color="#DC2626"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text style={styles.statusTitle}>
                    {flowStatus === 'PAYMENT_PENDING' && 'Đang chờ xác nhận thanh toán từ Server'}
                    {flowStatus === 'BOOKING_CONFIRMING' && 'Đang xác nhận vé với hệ thống Rạp'}
                    {flowStatus === 'REFUND_PENDING' && 'Đang xử lý hoàn tiền tự động'}
                    {flowStatus === 'REFUNDED' && 'Đã hoàn tiền về Ví V-Life'}
                    {flowStatus === 'FAILED' && 'Thanh toán không thành công'}
                    {flowStatus === 'EXPIRED' && 'Đơn đặt vé đã hết hạn'}
                  </Text>
                </View>
                <Text style={styles.statusSub}>{statusMessage}</Text>
              </View>

              {/* Action Buttons by State (NO FAKE AUTO-SUCCESS) */}
              {flowStatus === 'BOOKING_CONFIRMING' ? (
                <TouchableOpacity
                  style={styles.checkPaymentBtn}
                  disabled={isCheckingServer}
                  onPress={handleReconcileConfirmingBooking}
                >
                  <Text style={styles.checkPaymentBtnText}>
                    {isCheckingServer ? 'Đang đối soát với Rạp...' : 'Đối soát trạng thái xuất vé'}
                  </Text>
                </TouchableOpacity>
              ) : flowStatus === 'REFUNDED' || flowStatus === 'REFUND_PENDING' ? (
                <TouchableOpacity
                  style={[styles.checkPaymentBtn, { backgroundColor: '#0F172A' }]}
                  onPress={() => {
                    setShowPaymentModal(false);
                    clearExpiredHold();
                    router.replace('/cinema/tickets' as any);
                  }}
                >
                  <Text style={styles.checkPaymentBtnText}>Xem lịch sử đơn & hoàn tiền</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.checkPaymentBtn}
                  disabled={isCheckingServer}
                  onPress={checkPaymentStatusFromServer}
                >
                  <Text style={styles.checkPaymentBtnText}>
                    {isCheckingServer
                      ? 'Đang kiểm tra từ Server...'
                      : 'Làm mới trạng thái thanh toán từ Server'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelTransferBtn}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.cancelTransferBtnText}>Đóng cửa sổ</Text>
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
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerPillText: { fontSize: 12, fontWeight: '800', color: '#D97706' },
  container: { flex: 1, paddingHorizontal: 16 },
  filmHeaderContainer: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  filmContentRow: { flexDirection: 'row', alignItems: 'center' },
  filmPoster: { width: 64, height: 92, borderRadius: 10, backgroundColor: '#3F3F46' },
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
  filmTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  filmInfoDetailText: { color: '#D4D4D8', fontSize: 11, marginTop: 2 },

  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  cardSubTitle: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  priceLabel: { fontSize: 13, color: '#475569' },
  priceValue: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  comboSubItem: { fontSize: 11, color: '#64748B', marginLeft: 8, marginTop: 2 },
  priceTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  priceTotalLabel: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  priceTotalValue: { fontSize: 16, fontWeight: '800', color: '#E11D48' },

  inputGroup: { marginBottom: 10 },
  textInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFF',
  },
  textInputError: { borderColor: '#E11D48' },
  errorText: { fontSize: 11, fontWeight: '600', color: '#E11D48', marginTop: 4 },

  paymentOptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1.5,
    borderColor: '#E11D48',
    borderRadius: 14,
    padding: 12,
  },
  paymentOptionTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  paymentOptionSub: { fontSize: 11, color: '#475569', marginTop: 2, lineHeight: 16 },

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
  primaryPayBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  primaryPayBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  qrModalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 18,
    width: '100%',
    maxWidth: 365,
    alignItems: 'center',
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  qrModalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  timerText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  qrWarningBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    width: '100%',
  },
  qrWarningText: { fontSize: 11, color: '#1E40AF', flex: 1, lineHeight: 15, fontWeight: '600' },
  qrBox: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  qrImage: { width: 165, height: 165, borderRadius: 8 },
  qrScanInstruction: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 6 },
  bankDetailCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 10,
    width: '100%',
    marginBottom: 10,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  bankDetailLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  bankDetailValue: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  copyBtn: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
  },
  copyBtnText: { fontSize: 10, color: '#1D4ED8', fontWeight: '700' },

  statusBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 10,
    width: '100%',
    marginBottom: 10,
  },
  statusBoxConfirming: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  statusBoxRefund: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statusTitle: { fontSize: 12, fontWeight: '800', color: '#BE123C', flex: 1 },
  statusSub: { fontSize: 11, color: '#881337', lineHeight: 15 },

  checkPaymentBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkPaymentBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  cancelTransferBtn: { paddingVertical: 8, alignItems: 'center', width: '100%' },
  cancelTransferBtnText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
});
