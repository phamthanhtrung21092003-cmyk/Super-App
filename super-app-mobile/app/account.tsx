import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image,
  ScrollView, StatusBar, Platform, Modal, TextInput,
  useWindowDimensions, SafeAreaView, Alert, ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { imageHolderService } from '../services/imageHolderService';

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({ message, type = 'success', visible }: { message: string; type?: 'success' | 'error'; visible: boolean }) => {
  if (!visible) return null;
  return (
    <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOutDown.duration(200)} style={[toastStyles.wrap, type === 'error' && toastStyles.errorWrap]}>
      <Ionicons name={type === 'error' ? 'alert-circle' : 'checkmark-circle'} size={18} color={type === 'error' ? '#EF4444' : '#22c55e'} />
      <Text style={toastStyles.text}>{message}</Text>
    </Animated.View>
  );
};

const toastStyles = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 90, alignSelf: 'center', zIndex: 999,
    backgroundColor: 'rgba(15,23,42,0.95)', borderRadius: 24,
    paddingHorizontal: 20, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  errorWrap: {
    backgroundColor: 'rgba(69,10,10,0.95)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  text: { color: '#FFF', fontSize: 13, fontWeight: '600' },
});

export default function AccountScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { 
    userName, avatarUrl, bio, username, email, phone, birthYear, gender, hometown, createdAt,
    updateUserProfile, checkUsernameAvailability,
    requestPhoneOtp, verifyPhoneOtp, requestEmailOtp, verifyEmailOtp,
    devices, refreshDevices, logoutDevice, logoutOtherDevices,
    coins, rewardPoints, vipTier, logout, changePassword, currentUser
  } = useUser();
  const { width } = useWindowDimensions();
  const isMobileUA = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isDesktop = Platform.OS === 'web' && width > 1024 && !isMobileUA;

  // ─── Modals State ─────────────────────────────────────────────────────────
  const [showEdit, setShowEdit] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showJoinDateModal, setShowJoinDateModal] = useState(false);

  // ─── Scroll & Form State ───────────────────────────────────────────────────
  const mainScrollRef = useRef<ScrollView>(null);
  const editScrollRef = useRef<ScrollView>(null);
  const [editName, setEditName] = useState(userName || 'Phạm Thành Trung');
  const [editUsername, setEditUsername] = useState(username || 'phm_thnh_trung_');
  const [editBio, setEditBio] = useState(bio || '');
  const [editBirthYear, setEditBirthYear] = useState(birthYear ? birthYear.toString() : '2003');
  const [editGender, setEditGender] = useState(gender || 'Nam');
  const [editHometown, setEditHometown] = useState(hometown || 'Hà Nội, Việt Nam');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ─── Phone Change Flow State ──────────────────────────────────────────────
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // ─── Email Link Flow State ────────────────────────────────────────────────
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailError, setEmailError] = useState<string | null>(null);

  // ─── Password State ───────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ─── General State ────────────────────────────────────────────────────────
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' }>({ visible: false, message: '' });

  // ─── Countdown Timers ─────────────────────────────────────────────────────
  useEffect(() => {
    let timer: any;
    if (phoneCountdown > 0) {
      timer = setInterval(() => setPhoneCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phoneCountdown]);

  useEffect(() => {
    let timer: any;
    if (emailCountdown > 0) {
      timer = setInterval(() => setEmailCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCountdown]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message: msg, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 2500);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    showToast(`Đã sao chép ${label}!`);
  };

  // ─── Form Handlers ────────────────────────────────────────────────────────
  const handleOpenEdit = () => {
    setEditName(userName || 'Phạm Thành Trung');
    setEditUsername(username || 'phm_thnh_trung_');
    setEditBio(bio || '');
    setEditBirthYear(birthYear ? birthYear.toString() : '2003');
    setEditGender(gender || 'Nam');
    setEditHometown(hometown || 'Hà Nội, Việt Nam');
    setProfileError(null);
    setShowEdit(true);
  };

  const handleSaveProfile = async () => {
    setProfileError(null);
    const trimmedName = editName.trim();
    const trimmedUsername = editUsername.trim().toLowerCase();
    const trimmedBio = editBio.trim();
    const trimmedHometown = editHometown.trim();
    const parsedYear = parseInt(editBirthYear.trim(), 10);

    // Validation
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      setProfileError('Họ và tên phải từ 2 đến 100 ký tự');
      return;
    }

    if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      setProfileError('Username phải từ 3 đến 30 ký tự');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setProfileError('Username chỉ được chứa chữ cái, chữ số và dấu gạch dưới (_)');
      return;
    }

    if (trimmedBio.length > 100) {
      setProfileError('Tiểu sử không được vượt quá 100 ký tự');
      return;
    }

    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2026) {
      setProfileError('Năm sinh không hợp lệ (phải từ 1900 đến 2026)');
      return;
    }

    if (!['Nam', 'Nữ', 'Khác'].includes(editGender)) {
      setProfileError('Giới tính không hợp lệ (chọn Nam, Nữ hoặc Khác)');
      return;
    }

    setIsSavingProfile(true);
    try {
      if (trimmedUsername !== (username || '').toLowerCase()) {
        const check = await checkUsernameAvailability(trimmedUsername);
        if (!check.available) {
          setProfileError(check.message);
          setIsSavingProfile(false);
          return;
        }
      }

      await updateUserProfile({
        fullName: trimmedName,
        username: trimmedUsername,
        bio: trimmedBio,
        birthYear: parsedYear,
        gender: editGender,
        hometown: trimmedHometown,
      });

      setShowEdit(false);
      showToast('Đã lưu thông tin cá nhân thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể lưu hồ sơ';
      setProfileError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ─── Phone Change Flow ────────────────────────────────────────────────────
  const handleOpenPhoneModal = () => {
    setNewPhoneInput('');
    setPhonePassword('');
    setPhoneOtp('');
    setPhoneOtpSent(false);
    setPhoneError(null);
    setShowPhoneModal(true);
  };

  const handleSendPhoneOtp = async () => {
    setPhoneError(null);
    const trimmedPhone = newPhoneInput.trim();
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(trimmedPhone)) {
      setPhoneError('Số điện thoại không hợp lệ (10 chữ số: 03x, 05x, 07x, 08x, 09x)');
      return;
    }

    if (trimmedPhone === phone) {
      setPhoneError('Số điện thoại mới phải khác số điện thoại hiện tại');
      return;
    }

    if (!phonePassword.trim()) {
      setPhoneError('Vui lòng nhập mật khẩu tài khoản để xác thực chính chủ');
      return;
    }

    setIsSendingPhoneOtp(true);
    try {
      const res = await requestPhoneOtp(trimmedPhone, phonePassword.trim());
      setPhoneOtpSent(true);
      setPhoneCountdown(60);
      if (res.devOtp) {
        setPhoneOtp(res.devOtp);
      }
      showToast(res.message || 'Đã gửi mã OTP xác thực');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể gửi mã OTP';
      setPhoneError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhone = async () => {
    setPhoneError(null);
    const trimmedPhone = newPhoneInput.trim();
    const trimmedOtp = phoneOtp.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setPhoneError('Vui lòng nhập đúng mã OTP gồm 6 chữ số');
      return;
    }

    setIsVerifyingPhone(true);
    try {
      await verifyPhoneOtp(trimmedPhone, trimmedOtp);
      setShowPhoneModal(false);
      showToast('Đổi số điện thoại thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Mã OTP không chính xác';
      setPhoneError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  // ─── Email Link Flow ──────────────────────────────────────────────────────
  const handleOpenEmailModal = () => {
    setNewEmailInput('');
    setEmailOtp('');
    setEmailOtpSent(false);
    setEmailError(null);
    setShowEmailModal(true);
  };

  const handleSendEmailOtp = async () => {
    setEmailError(null);
    const trimmedEmail = newEmailInput.trim().toLowerCase();
    if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(trimmedEmail)) {
      setEmailError('Định dạng địa chỉ email không hợp lệ');
      return;
    }

    if (trimmedEmail === (email || '').toLowerCase()) {
      setEmailError('Email mới phải khác email hiện tại');
      return;
    }

    setIsSendingEmailOtp(true);
    try {
      const res = await requestEmailOtp(trimmedEmail);
      setEmailOtpSent(true);
      setEmailCountdown(60);
      if (res.devOtp) {
        setEmailOtp(res.devOtp);
      }
      showToast(res.message || 'Đã gửi mã xác nhận đến email mới');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể gửi mã xác nhận';
      setEmailError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyEmail = async () => {
    setEmailError(null);
    const trimmedEmail = newEmailInput.trim().toLowerCase();
    const trimmedOtp = emailOtp.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setEmailError('Vui lòng nhập đúng mã xác nhận gồm 6 chữ số');
      return;
    }

    setIsVerifyingEmail(true);
    try {
      await verifyEmailOtp(trimmedEmail, trimmedOtp);
      setShowEmailModal(false);
      showToast('Liên kết email thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Mã xác nhận không chính xác';
      setEmailError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // ─── Password Flow ────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError('Vui lòng điền đầy đủ các thông tin mật khẩu');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changePassword(
        currentPassword.trim(),
        newPassword.trim(),
        confirmPassword.trim()
      );

      if (result.success) {
        showToast('Đổi mật khẩu thành công!');
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      setPasswordError('Đã xảy ra lỗi khi kết nối máy chủ!');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ─── Devices Flow ─────────────────────────────────────────────────────────
  const handleOpenDevicesModal = () => {
    refreshDevices();
    setShowDevicesModal(true);
  };

  const handleLogoutDevice = async (deviceId: string, deviceName: string) => {
    try {
      await logoutDevice(deviceId);
      showToast(`Đã đăng xuất khỏi ${deviceName}!`);
    } catch (e: any) {
      showToast(e.message || 'Không thể đăng xuất thiết bị', 'error');
    }
  };

  const handleLogoutAllOtherDevices = async () => {
    const perform = async () => {
      try {
        await logoutOtherDevices();
        showToast('Đã đăng xuất khỏi tất cả các thiết bị khác!');
      } catch (e: any) {
        showToast(e.message || 'Không thể đăng xuất thiết bị khác', 'error');
      }
    };

    if (Platform.OS === 'web') {
      const confirm = window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?');
      if (confirm) perform();
    } else {
      Alert.alert(
        'Đăng xuất thiết bị khác',
        'Bạn có chắc chắn muốn hủy phiên đăng nhập trên toàn bộ thiết bị khác?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng xuất tất cả', style: 'destructive', onPress: perform }
        ]
      );
    }
  };

  // ─── Image Picker ─────────────────────────────────────────────────────────
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh!');
        return;
      }
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        imageHolderService.setImage({
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
          mimeType: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || asset.uri.split('/').pop() || 'avatar.jpg',
        });
        router.push('/crop');
      }
    } catch (error) {
      console.error('[Account] pickImage failed:', error);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  // ─── Logout Flow ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    const performLogout = async () => {
      setIsLoggingOut(true);
      await logout();
      setIsLoggingOut(false);
      router.replace('/');
    };

    if (Platform.OS === 'web') {
      const confirm = window.confirm('Bạn có chắc chắn muốn đăng xuất không?');
      if (confirm) performLogout();
    } else {
      Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: performLogout }
      ]);
    }
  };

  // ─── Display Values ───────────────────────────────────────────────────────
  const displayPhone = phone && phone.length >= 10 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : (phone || 'Chưa cập nhật');
  const displayVLifeId = username ? `@${username}` : (currentUser?.id ? `VL-${currentUser.id.slice(-8).toUpperCase()}` : '@phm_thnh_trung_');
  const displayAccountId = currentUser?.id || 'V-LIFE-888999';
  const displayJoinDate = createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : '12/08/2023';

  // Device list separation
  const currentDevice = devices.find(d => d.isCurrent || d.status === 'ACTIVE') || devices[0];
  const historyDevices = devices.filter(d => d !== currentDevice);
  const activeOtherDevicesCount = devices.filter(d => !d.isCurrent && d.status === 'ACTIVE').length;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Toast */}
        <Toast message={toast.message} type={toast.type} visible={toast.visible} />

        {/* ══════════ TOP BAR ══════════ */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { fontFamily: theme.fontFamily }]}>Hồ sơ cá nhân</Text>
          <View style={styles.topRightRow}>
            <TouchableOpacity style={styles.topBtn} onPress={() => setShowQR(true)}>
              <Ionicons name="qr-code-outline" size={20} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topBtn} onPress={() => mainScrollRef.current?.scrollToEnd({ animated: true })}>
              <Ionicons name="settings-outline" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView ref={mainScrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {/* ══════════ PROFILE HEADER (User Identity) ══════════ */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity activeOpacity={0.9} onPress={pickImage} style={styles.avatarWrap}>
                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                <View style={styles.onlineDot} />
                <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                  <Ionicons name="camera" size={13} color="#FFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <View style={styles.nameRow}>
              <Text style={[styles.displayName, { fontFamily: theme.fontFamily }]}>
                {userName || 'Phạm Thành Trung'}
              </Text>
              <Ionicons name="checkmark-circle" size={18} color="#F59E0B" style={{ marginLeft: 4 }} />
            </View>

            <Text style={[styles.handleName, { fontFamily: theme.fontFamily }]}>
              {displayVLifeId}
            </Text>
            <Text style={[styles.bioText, { fontFamily: theme.fontFamily }]}>
              {bio || 'Kẻ lữ hành tìm kiếm những chân trời mới. 🌍✨'}
            </Text>

            <TouchableOpacity style={styles.editPillBtn} onPress={handleOpenEdit} activeOpacity={0.85}>
              <Ionicons name="pencil" size={13} color="#FF4D6D" style={{ marginRight: 5 }} />
              <Text style={[styles.editPillText, { fontFamily: theme.fontFamily }]}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>

          {/* ══════════ CARD: THÔNG TIN CÁ NHÂN ══════════ */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { fontFamily: theme.fontFamily }]}>Thông tin cá nhân</Text>
              <TouchableOpacity onPress={handleOpenEdit}>
                <Text style={[styles.cardActionLink, { fontFamily: theme.fontFamily }]}>Chỉnh sửa &gt;</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoGrid}>
              {/* Row 1: Năm sinh & Giới tính */}
              <TouchableOpacity style={styles.infoCol} activeOpacity={0.7} onPress={handleOpenEdit}>
                <View style={[styles.infoIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <Ionicons name="calendar" size={18} color="#F43F5E" />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Năm sinh</Text>
                  <Text style={[styles.infoVal, { fontFamily: theme.fontFamily }]}>{birthYear || '2003'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.infoCol} activeOpacity={0.7} onPress={handleOpenEdit}>
                <View style={[styles.infoIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="male-female" size={18} color="#3B82F6" />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Giới tính</Text>
                  <Text style={[styles.infoVal, { fontFamily: theme.fontFamily }]}>{gender || 'Nam'}</Text>
                </View>
              </TouchableOpacity>

              {/* Row 2: Quê quán & V-life ID */}
              <TouchableOpacity style={styles.infoCol} activeOpacity={0.7} onPress={handleOpenEdit}>
                <View style={[styles.infoIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="location" size={18} color="#F59E0B" />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Quê quán</Text>
                  <Text style={[styles.infoVal, { fontFamily: theme.fontFamily }]} numberOfLines={1}>{hometown || 'Hà Nội, Việt Nam'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.infoCol} activeOpacity={0.7} onPress={() => copyToClipboard(displayVLifeId, 'Username')}>
                <View style={[styles.infoIconBox, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="at-outline" size={18} color="#8B5CF6" />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>V-life ID</Text>
                  <Text style={[styles.infoVal, { fontFamily: theme.fontFamily }]} numberOfLines={1}>{displayVLifeId}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ══════════ CARD: TÀI KHOẢN & BẢO MẬT ══════════ */}
          <View style={styles.listCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { fontFamily: theme.fontFamily }]}>Tài khoản &amp; Bảo mật</Text>
            </View>

            {/* Item 1: Số điện thoại */}
            <TouchableOpacity style={styles.listItem} onPress={handleOpenPhoneModal}>
              <View style={[styles.listIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="call-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>Số điện thoại</Text>
              <Text style={[styles.listItemVal, { fontFamily: theme.fontFamily }]}>{displayPhone}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Item 2: Email */}
            <TouchableOpacity style={styles.listItem} onPress={handleOpenEmailModal}>
              <View style={[styles.listIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="mail-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>Email</Text>
              <Text style={[styles.listItemVal, { fontFamily: theme.fontFamily }]}>{email || 'Chưa liên kết'}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Item 3: Mật khẩu */}
            <TouchableOpacity style={styles.listItem} onPress={() => { setPasswordError(null); setShowChangePassword(true); }}>
              <View style={[styles.listIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="lock-closed-outline" size={18} color="#D97706" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>Mật khẩu</Text>
              <Text style={[styles.listItemVal, { fontFamily: theme.fontFamily }]}>••••••••</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Item 4: Thiết bị đăng nhập */}
            <TouchableOpacity style={styles.listItem} onPress={handleOpenDevicesModal}>
              <View style={[styles.listIconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="phone-portrait-outline" size={18} color="#9333EA" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>Thiết bị đăng nhập</Text>
              <Text style={[styles.listItemVal, { fontFamily: theme.fontFamily }]}>
                {devices.length > 0 ? (devices.filter(d => d.status === 'ACTIVE').length > 0 ? `${devices.filter(d => d.status === 'ACTIVE').length} đang hoạt động` : `${devices.length} thiết bị`) : '1 thiết bị'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Item 5: Ngày tham gia (Read-only) */}
            <TouchableOpacity style={styles.listItem} onPress={() => setShowJoinDateModal(true)}>
              <View style={[styles.listIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="medal-outline" size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>Ngày tham gia V-life</Text>
              <Text style={[styles.listItemVal, { fontFamily: theme.fontFamily }]}>{displayJoinDate}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Item 6: ID tài khoản (Read-only + Copy) */}
            <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => copyToClipboard(displayAccountId, 'ID tài khoản')}>
              <View style={[styles.listIconBox, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="finger-print-outline" size={18} color="#64748B" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>ID tài khoản</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.listItemVal, { fontFamily: theme.fontFamily }]} numberOfLines={1}>
                  {displayAccountId.length > 14 ? `${displayAccountId.slice(0, 10)}...` : displayAccountId}
                </Text>
                <Ionicons name="copy-outline" size={14} color="#94A3B8" style={{ marginLeft: 4 }} />
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>

          {/* ══════════ CARD: CÀI ĐẶT HỆ THỐNG ══════════ */}
          <View style={styles.listCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { fontFamily: theme.fontFamily }]}>Cài đặt hệ thống</Text>
            </View>

            {/* Item 1: Thông báo */}
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/notifications')}>
              <View style={[styles.listIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="notifications-outline" size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>Thông báo</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Item 2: Quyền riêng tư */}
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/privacy')}>
              <View style={[styles.listIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>Quyền riêng tư</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Item 3: Giao diện */}
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/appearance')}>
              <View style={[styles.listIconBox, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="color-palette-outline" size={18} color="#8B5CF6" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>Giao diện</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Item 4: Trợ giúp & Hỗ trợ */}
            <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => showToast('Trung tâm Trợ giúp V-life: Hotline 1900 6868')}>
              <View style={[styles.listIconBox, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="help-circle-outline" size={18} color="#64748B" />
              </View>
              <Text style={[styles.listItemTitle, { fontFamily: theme.fontFamily }]}>Trợ giúp &amp; Hỗ trợ</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          {/* ══════════ NÚT ĐĂNG XUẤT (NGOÀI CÙNG) ══════════ */}
          <View style={styles.logoutWrapper}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={isLoggingOut} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={19} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={[styles.logoutText, { fontFamily: theme.fontFamily }]}>
                {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất tài khoản'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ══════════ FLOATING BOTTOM TAB BAR ══════════ */}
        <View style={styles.bottomTabBar}>
          <TouchableOpacity style={styles.tabItemBar} onPress={() => router.push('/')}>
            <Ionicons name="home-outline" size={22} color="#64748B" />
            <Text style={[styles.tabBarLabel, { fontFamily: theme.fontFamily }]}>Trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItemBar} onPress={() => router.push('/social')}>
            <Ionicons name="people-outline" size={22} color="#64748B" />
            <Text style={[styles.tabBarLabel, { fontFamily: theme.fontFamily }]}>Mạng xã hội</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.qrCenterBtnWrap} onPress={() => setShowQR(true)}>
            <View style={styles.qrCenterBtn}>
              <Ionicons name="qr-code" size={24} color="#FFF" />
            </View>
            <Text style={[styles.tabBarLabel, { fontFamily: theme.fontFamily, fontWeight: '600', marginTop: 1 }]}>Quét QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItemBar} onPress={() => showToast('Chức năng Thông báo đang cập nhật!')}>
            <View style={{ position: 'relative' }}>
              <Ionicons name="notifications-outline" size={22} color="#64748B" />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>3</Text>
              </View>
            </View>
            <Text style={[styles.tabBarLabel, { fontFamily: theme.fontFamily }]}>Thông báo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItemBar}>
            <Ionicons name="person" size={22} color="#FF4D6D" />
            <Text style={[styles.tabBarLabel, { fontFamily: theme.fontFamily, color: '#FF4D6D', fontWeight: '700' }]}>Hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* ══════════ MODAL: CHỈNH SỬA HỒ SƠ & THÔNG TIN CÁ NHÂN ══════════ */}
        <Modal visible={showEdit} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => !isSavingProfile && setShowEdit(false)} />
            <BlurView intensity={95} tint="dark" style={styles.sheetContent}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHead}>
                <TouchableOpacity onPress={() => setShowEdit(false)} disabled={isSavingProfile}>
                  <Text style={{ color: '#94A3B8', fontSize: 15, fontWeight: '600' }}>Huỷ</Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Chỉnh sửa thông tin</Text>
                <TouchableOpacity onPress={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <ActivityIndicator size="small" color="#FF4D6D" />
                  ) : (
                    <Text style={{ color: '#FF4D6D', fontSize: 15, fontWeight: '800' }}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={editScrollRef}
                style={{ flexGrow: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 380 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {profileError && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.errorBannerText}>{profileError}</Text>
                  </View>
                )}

                {/* Avatar changer */}
                <View style={styles.editAvatarWrap}>
                  <TouchableOpacity style={styles.editAvatarRing} onPress={pickImage}>
                    <Image source={{ uri: avatarUrl }} style={styles.editAvatarImg} />
                    <View style={styles.cameraOverlay}>
                      <Ionicons name="camera" size={24} color="#FFF" />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.photoTip}>Chạm vào ảnh để đổi avatar</Text>
                </View>

                {/* Field 1: Họ tên */}
                <Text style={styles.inputLabel}>Họ và tên <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, { fontFamily: theme.fontFamily }]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nhập họ và tên..."
                  placeholderTextColor="#94A3B8"
                  maxLength={100}
                />

                {/* Field 2: Username / V-life ID */}
                <Text style={styles.inputLabel}>Username / V-life ID <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, { fontFamily: theme.fontFamily }]}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="Ví dụ: phm_thnh_trung_"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  maxLength={30}
                />
                <Text style={styles.fieldHelper}>3-30 ký tự, chỉ gồm chữ cái thường, số và dấu gạch dưới (_)</Text>

                {/* Field 3: Tiểu sử */}
                <View style={styles.bioHeaderRow}>
                  <Text style={styles.inputLabel}>Tiểu sử</Text>
                  <Text style={styles.bioCounter}>{editBio.length}/100</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.bioInput, { fontFamily: theme.fontFamily }]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Nhập tiểu sử ngắn..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                />

                {/* Field 4: Năm sinh */}
                <Text style={styles.inputLabel}>Năm sinh <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, { fontFamily: theme.fontFamily }]}
                  value={editBirthYear}
                  onChangeText={setEditBirthYear}
                  placeholder="Ví dụ: 2003"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={4}
                />

                {/* Field 5: Giới tính */}
                <Text style={styles.inputLabel}>Giới tính</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  {['Nam', 'Nữ', 'Khác'].map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderPill,
                        editGender === g && { backgroundColor: '#FFF1F2', borderColor: '#FF4D6D' }
                      ]}
                      onPress={() => setEditGender(g)}
                    >
                      <Text style={[styles.genderPillText, editGender === g && { color: '#FF4D6D', fontWeight: '700' }]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Field 6: Quê quán */}
                <Text style={styles.inputLabel}>Quê quán</Text>
                <TextInput
                  style={[styles.textInput, { fontFamily: theme.fontFamily }]}
                  value={editHometown}
                  onChangeText={setEditHometown}
                  placeholder="Nhập quê quán..."
                  placeholderTextColor="#94A3B8"
                  maxLength={100}
                />

                <TouchableOpacity
                  style={[styles.submitPasswordBtn, isSavingProfile && { opacity: 0.7 }]}
                  onPress={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.submitPasswordBtnText}>LƯU THÔNG TIN HỒ SƠ</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </BlurView>
          </KeyboardAvoidingView>
        </Modal>

        {/* ══════════ MODAL: ĐỔI SỐ ĐIỆN THOẠI ══════════ */}
        <Modal visible={showPhoneModal} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => !isVerifyingPhone && setShowPhoneModal(false)} />
            <BlurView intensity={95} tint="dark" style={styles.sheetContent}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHead}>
                <TouchableOpacity onPress={() => setShowPhoneModal(false)} disabled={isVerifyingPhone}>
                  <Text style={{ color: '#94A3B8', fontSize: 15 }}>Huỷ</Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Đổi số điện thoại</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView style={{ padding: 20 }} contentContainerStyle={{ paddingBottom: 280 }} keyboardShouldPersistTaps="handled">
                {phoneError && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.errorBannerText}>{phoneError}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Số điện thoại hiện tại</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: '#F1F5F9', color: '#64748B' }]}
                  value={displayPhone}
                  editable={false}
                />

                <Text style={styles.inputLabel}>Số điện thoại mới <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, { fontFamily: theme.fontFamily }]}
                  value={newPhoneInput}
                  onChangeText={setNewPhoneInput}
                  placeholder="Nhập số điện thoại mới (10 số)..."
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <Text style={styles.inputLabel}>Mật khẩu tài khoản <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, { fontFamily: theme.fontFamily }]}
                  value={phonePassword}
                  onChangeText={setPhonePassword}
                  placeholder="Nhập mật khẩu để xác thực chính chủ..."
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                />

                <Text style={styles.inputLabel}>Mã xác thực OTP (6 chữ số)</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, marginBottom: 0, fontFamily: theme.fontFamily }]}
                    value={phoneOtp}
                    onChangeText={setPhoneOtp}
                    placeholder="Nhập mã 6 số..."
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[styles.otpBtn, (isSendingPhoneOtp || phoneCountdown > 0) && { opacity: 0.6 }]}
                    onPress={handleSendPhoneOtp}
                    disabled={isSendingPhoneOtp || phoneCountdown > 0}
                  >
                    {isSendingPhoneOtp ? (
                      <ActivityIndicator size="small" color="#FF4D6D" />
                    ) : (
                      <Text style={styles.otpBtnText}>
                        {phoneCountdown > 0 ? `${phoneCountdown}s` : phoneOtpSent ? 'Gửi lại' : 'Lấy mã OTP'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.warningBox}>
                  <Ionicons name="shield-checkmark" size={18} color="#16A34A" style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={[styles.warningText, { color: '#166534' }]}>
                    Mã OTP có hiệu lực trong 3 phút. Sau khi đổi thành công, bạn sẽ sử dụng số điện thoại mới để đăng nhập.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitPasswordBtn, isVerifyingPhone && { opacity: 0.7 }]}
                  onPress={handleVerifyPhone}
                  disabled={isVerifyingPhone}
                >
                  {isVerifyingPhone ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.submitPasswordBtnText}>XÁC NHẬN ĐỔI SỐ ĐIỆN THOẠI</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </BlurView>
          </KeyboardAvoidingView>
        </Modal>

        {/* ══════════ MODAL: CẬP NHẬT / LIÊN KẾT EMAIL ══════════ */}
        <Modal visible={showEmailModal} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => !isVerifyingEmail && setShowEmailModal(false)} />
            <BlurView intensity={95} tint="dark" style={styles.sheetContent}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHead}>
                <TouchableOpacity onPress={() => setShowEmailModal(false)} disabled={isVerifyingEmail}>
                  <Text style={{ color: '#94A3B8', fontSize: 15 }}>Huỷ</Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Liên kết Email</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView style={{ padding: 20 }} contentContainerStyle={{ paddingBottom: 280 }} keyboardShouldPersistTaps="handled">
                {emailError && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.errorBannerText}>{emailError}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Email hiện tại</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: '#F1F5F9', color: '#64748B' }]}
                  value={email || 'Chưa liên kết'}
                  editable={false}
                />

                <Text style={styles.inputLabel}>Địa chỉ Email mới <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, { fontFamily: theme.fontFamily }]}
                  value={newEmailInput}
                  onChangeText={setNewEmailInput}
                  placeholder="Nhập địa chỉ email mới..."
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Mã xác thực hòm thư (OTP)</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, marginBottom: 0, fontFamily: theme.fontFamily }]}
                    value={emailOtp}
                    onChangeText={setEmailOtp}
                    placeholder="Mã 6 chữ số..."
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[styles.otpBtn, (isSendingEmailOtp || emailCountdown > 0) && { opacity: 0.6 }]}
                    onPress={handleSendEmailOtp}
                    disabled={isSendingEmailOtp || emailCountdown > 0}
                  >
                    {isSendingEmailOtp ? (
                      <ActivityIndicator size="small" color="#FF4D6D" />
                    ) : (
                      <Text style={styles.otpBtnText}>
                        {emailCountdown > 0 ? `${emailCountdown}s` : emailOtpSent ? 'Gửi lại' : 'Gửi mã'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.warningBox}>
                  <Ionicons name="information-circle-outline" size={18} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={[styles.warningText, { color: '#1E40AF' }]}>
                    Email dùng để nhận thông báo bảo mật và khôi phục tài khoản khi quên mật khẩu.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitPasswordBtn, isVerifyingEmail && { opacity: 0.7 }]}
                  onPress={handleVerifyEmail}
                  disabled={isVerifyingEmail}
                >
                  {isVerifyingEmail ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.submitPasswordBtnText}>LƯU VÀ LIÊN KẾT EMAIL</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </BlurView>
          </KeyboardAvoidingView>
        </Modal>

        {/* ══════════ MODAL: ĐỔI MẬT KHẨU ══════════ */}
        <Modal visible={showChangePassword} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => !isChangingPassword && setShowChangePassword(false)} />
            <BlurView intensity={95} tint="dark" style={styles.sheetContent}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHead}>
                <TouchableOpacity onPress={() => setShowChangePassword(false)} disabled={isChangingPassword}>
                  <Text style={{ color: '#94A3B8', fontSize: 15 }}>Huỷ</Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Đổi mật khẩu</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView
                style={{ flexGrow: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 380 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {passwordError && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.errorBannerText}>{passwordError}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.textInput, { fontFamily: theme.fontFamily, flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Nhập mật khẩu hiện tại..."
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={secureCurrent}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecureCurrent(!secureCurrent)}>
                    <Ionicons name={secureCurrent ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 20 }]}>Mật khẩu mới</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.textInput, { fontFamily: theme.fontFamily, flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={secureNew}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecureNew(!secureNew)}>
                    <Ionicons name={secureNew ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 20 }]}>Xác nhận mật khẩu mới</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.textInput, { fontFamily: theme.fontFamily, flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Xác nhận lại mật khẩu mới..."
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={secureConfirm}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecureConfirm(!secureConfirm)}>
                    <Ionicons name={secureConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                  </TouchableOpacity>
                </View>

                <View style={styles.warningBox}>
                  <Ionicons name="information-circle-outline" size={20} color="#F59E0B" style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={[styles.warningText, { fontFamily: theme.fontFamily }]}>
                    Khi đổi mật khẩu thành công, toàn bộ phiên đăng nhập trên thiết bị khác sẽ được tự động đăng xuất để bảo đảm an toàn.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitPasswordBtn, isChangingPassword && { opacity: 0.7 }]}
                  onPress={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={[styles.submitPasswordBtnText, { fontFamily: theme.fontFamily }]}>
                      ĐỔI MẬT KHẨU
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </BlurView>
          </KeyboardAvoidingView>
        </Modal>

        {/* ══════════ MODAL: QUẢN LÝ THIẾT BỊ ĐĂNG NHẬP (DEVICE HISTORY) ══════════ */}
        <Modal visible={showDevicesModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowDevicesModal(false)} />
            <BlurView intensity={95} tint="dark" style={styles.sheetContent}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHead}>
                <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Thiết bị đăng nhập</Text>
                <TouchableOpacity onPress={() => setShowDevicesModal(false)}>
                  <Ionicons name="close" size={22} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}>
                {/* ─── PHẦN 1: THIẾT BỊ HIỆN TẠI (ĐANG HOẠT ĐỘNG) ─── */}
                <Text style={styles.deviceSectionHeader}>THIẾT BỊ HIỆN TẠI</Text>

                {currentDevice && (
                  <View style={[styles.deviceItemCard, styles.currentDeviceCard]}>
                    <View style={[styles.listIconBox, { backgroundColor: '#DCFCE7' }]}>
                      <Ionicons
                        name={currentDevice.platform?.toLowerCase().includes('web') ? 'laptop' : 'phone-portrait'}
                        size={20}
                        color="#16A34A"
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <Text style={[styles.deviceItemName, { fontFamily: theme.fontFamily }]}>
                          {currentDevice.deviceName}
                        </Text>
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Thiết bị này</Text>
                        </View>
                        <View style={[styles.currentBadge, { backgroundColor: '#E0F2FE' }]}>
                          <Text style={[styles.currentBadgeText, { color: '#0284C7' }]}>Đang hoạt động</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.deviceItemMeta}>
                        {currentDevice.osVersion ? `${currentDevice.osVersion}` : currentDevice.platform}
                        {currentDevice.modelName && currentDevice.modelName !== currentDevice.deviceName ? ` • ${currentDevice.modelName}` : ''}
                      </Text>

                      <Text style={[styles.deviceItemMeta, { color: '#16A34A', marginTop: 4, fontWeight: '600' }]}>
                        {currentDevice.lastLoginAt ? `Đăng nhập: ${new Date(currentDevice.lastLoginAt).toLocaleString('vi-VN')}` : 'Đang hoạt động'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* ─── PHẦN 2: LỊCH SỬ THIẾT BỊ TRƯỚC ĐÂY (ĐÃ ĐĂNG XUẤT) ─── */}
                {historyDevices.length > 0 && (
                  <>
                    <Text style={[styles.deviceSectionHeader, { marginTop: 18 }]}>THIẾT BỊ TRƯỚC ĐÂY</Text>
                    
                    {historyDevices.map((device, idx) => {
                      const isDeviceActive = device.status === 'ACTIVE';
                      return (
                        <View key={device.id || device.deviceId || idx} style={styles.deviceItemCard}>
                          <View style={[styles.listIconBox, { backgroundColor: isDeviceActive ? '#DCFCE7' : '#F1F5F9' }]}>
                            <Ionicons
                              name={device.platform?.toLowerCase().includes('web') ? 'laptop-outline' : 'phone-portrait-outline'}
                              size={18}
                              color={isDeviceActive ? '#16A34A' : '#64748B'}
                            />
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                              <Text style={[styles.deviceItemName, { fontFamily: theme.fontFamily }]}>
                                {device.deviceName}
                              </Text>
                              {isDeviceActive ? (
                                <View style={[styles.currentBadge, { backgroundColor: '#DCFCE7' }]}>
                                  <Text style={styles.currentBadgeText}>Đang hoạt động</Text>
                                </View>
                              ) : (
                                <View style={[styles.currentBadge, { backgroundColor: '#F1F5F9' }]}>
                                  <Text style={[styles.currentBadgeText, { color: '#64748B' }]}>Đã đăng xuất</Text>
                                </View>
                              )}
                            </View>

                            <Text style={styles.deviceItemMeta}>
                              {device.osVersion ? `${device.osVersion}` : device.platform}
                              {device.modelName && device.modelName !== device.deviceName ? ` • ${device.modelName}` : ''}
                            </Text>

                            <Text style={[styles.deviceItemMeta, { marginTop: 3 }]}>
                              {device.lastLoginAt ? `Đăng nhập: ${new Date(device.lastLoginAt).toLocaleString('vi-VN')}` : ''}
                            </Text>

                            {device.loggedOutAt && (
                              <Text style={[styles.deviceItemMeta, { color: '#94A3B8', marginTop: 1 }]}>
                                Đã đăng xuất lúc: {new Date(device.loggedOutAt).toLocaleString('vi-VN')}
                              </Text>
                            )}
                          </View>

                          {isDeviceActive && (
                            <TouchableOpacity
                              style={styles.deviceLogoutBtn}
                              onPress={() => handleLogoutDevice(device.id || device.deviceId, device.deviceName)}
                            >
                              <Text style={styles.deviceLogoutText}>Đăng xuất</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </>
                )}

                {activeOtherDevicesCount > 0 && (
                  <TouchableOpacity
                    style={styles.logoutAllDevicesBtn}
                    onPress={handleLogoutAllOtherDevices}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.logoutAllDevicesText}>Đăng xuất khỏi tất cả thiết bị khác</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </BlurView>
          </View>
        </Modal>

        {/* ══════════ MODAL: NGÀY THAM GIA & HUY HIỆU (READ-ONLY) ══════════ */}
        <Modal visible={showJoinDateModal} transparent animationType="fade">
          <TouchableOpacity style={styles.qrOverlay} activeOpacity={1} onPress={() => setShowJoinDateModal(false)}>
            <View style={[styles.qrCard, { paddingVertical: 32 }]}>
              <View style={[styles.assetIconCircle, { width: 68, height: 68, borderRadius: 34, backgroundColor: '#FFFBEB', marginBottom: 14 }]}>
                <Ionicons name="medal" size={36} color="#F59E0B" />
              </View>

              <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: '800', textAlign: 'center' }}>
                Thành viên Tiên Phong V-life
              </Text>
              <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 }}>
                PIONEER MEMBER 🎖️
              </Text>

              <View style={styles.joinDateStatBox}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#64748B', fontSize: 11 }}>Ngày gia nhập</Text>
                  <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800', marginTop: 2 }}>{displayJoinDate}</Text>
                </View>
                <View style={{ width: 1, height: 28, backgroundColor: '#E2E8F0' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#64748B', fontSize: 11 }}>Hạng thành viên</Text>
                  <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800', marginTop: 2 }}>{vipTier || 'Vàng'}</Text>
                </View>
              </View>

              <Text style={{ color: '#64748B', fontSize: 12.5, textAlign: 'center', lineHeight: 18, marginTop: 16, paddingHorizontal: 12 }}>
                Cảm ơn bạn đã đồng hành cùng hệ sinh thái Super App V-life. Tài khoản của bạn được ưu tiên bảo mật và hưởng các quyền lợi tốt nhất.
              </Text>

              <TouchableOpacity
                style={[styles.submitPasswordBtn, { width: '100%', marginBottom: 0, marginTop: 24 }]}
                onPress={() => setShowJoinDateModal(false)}
              >
                <Text style={styles.submitPasswordBtnText}>ĐÓNG</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ══════════ QR MODAL ══════════ */}
        <Modal visible={showQR} transparent animationType="fade">
          <TouchableOpacity style={styles.qrOverlay} activeOpacity={1} onPress={() => setShowQR(false)}>
            <View style={styles.qrCard}>
              <Image source={{ uri: avatarUrl }} style={styles.qrAvatar} />
              <Text style={styles.qrName}>{userName || 'Phạm Thành Trung'}</Text>
              <Text style={styles.qrHandle}>{displayVLifeId}</Text>

              <View style={styles.qrBox}>
                <View style={styles.qrGrid}>
                  {Array.from({ length: 49 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.qrDot,
                        {
                          backgroundColor:
                            i % 2 === 0 || i % 5 === 0 || i === 0 || i === 6 || i === 42 || i === 48
                              ? '#0F172A'
                              : 'transparent',
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.qrLogo}>
                  <Ionicons name="scan" size={20} color="#FF4D6D" />
                </View>
              </View>

              <Text style={styles.qrHint}>Quét mã QR để liên hệ hoặc chuyển khoản nhanh</Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' }}>
                <TouchableOpacity style={[styles.qrBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => showToast('Đã lưu mã QR vào thư viện ảnh!')}>
                  <Ionicons name="download-outline" size={16} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#0F172A', fontWeight: '700', fontSize: 13 }}>Lưu ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.qrBtn, { backgroundColor: '#FF4D6D' }]} onPress={() => showToast('Đang chia sẻ mã QR')}>
                  <Ionicons name="share-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Chia sẻ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  webWrapper: {
    flex: 1, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 10 } as any),
  },
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', width: '100%' },
  desktopFrame: {
    maxWidth: 410, maxHeight: 880, aspectRatio: 410 / 880,
    borderWidth: 10, borderColor: '#0F172A', borderRadius: 44,
    overflow: 'hidden', boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(255,255,255,0.8)',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  topBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  topRightRow: { flexDirection: 'row', gap: 8 },

  // Profile Section
  profileSection: {
    alignItems: 'center', paddingTop: 20, paddingBottom: 20,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  avatarContainer: { marginBottom: 12 },
  avatarWrap: { position: 'relative' },
  avatarImg: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#E2E8F0',
    borderWidth: 3, borderColor: '#FFF',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  onlineDot: {
    position: 'absolute', bottom: 4, right: 4, width: 14, height: 14,
    borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2.5, borderColor: '#FFF',
  },
  cameraBtn: {
    position: 'absolute', top: 0, right: 0, width: 26, height: 26,
    borderRadius: 13, backgroundColor: 'rgba(15,23,42,0.75)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  displayName: { fontSize: 19, fontWeight: '800', color: '#0F172A' },
  handleName: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 6 },
  bioText: {
    fontSize: 13, color: '#475569', textAlign: 'center', paddingHorizontal: 32,
    lineHeight: 18, marginBottom: 14,
  },
  editPillBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF1F2',
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: '#FFE4E6',
  },
  editPillText: { fontSize: 12.5, fontWeight: '700', color: '#FF4D6D' },

  // Cards
  card: {
    backgroundColor: '#FFF', marginTop: 12, marginHorizontal: 16,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardActionLink: { fontSize: 12.5, fontWeight: '700', color: '#FF4D6D' },

  // Info Grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  infoCol: { flexDirection: 'row', alignItems: 'center', width: '50%' },
  infoIconBox: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center',
    justifyContent: 'center', marginRight: 10,
  },
  infoTextWrap: { flex: 1, paddingRight: 4 },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  infoVal: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginTop: 1 },

  // List Card
  listCard: {
    backgroundColor: '#FFF', marginTop: 12, marginHorizontal: 16,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  listItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  listIconBox: {
    width: 34, height: 34, borderRadius: 10, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  listItemTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  listItemVal: { fontSize: 13, color: '#64748B', fontWeight: '500', marginRight: 6 },

  // Floating Bottom Tab Bar
  bottomTabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 68,
    backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#F1F5F9',
    paddingBottom: Platform.OS === 'ios' ? 12 : 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 8,
  },
  tabItemBar: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabBarLabel: { fontSize: 10.5, color: '#64748B', marginTop: 3, fontWeight: '500' },
  qrCenterBtnWrap: { alignItems: 'center', justifyContent: 'center', marginTop: -18, flex: 1 },
  qrCenterBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF4D6D',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4D6D', shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  notifBadge: {
    position: 'absolute', top: -3, right: -6, backgroundColor: '#EF4444',
    width: 15, height: 15, borderRadius: 7.5, alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  // Modals & Sheets
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContent: {
    backgroundColor: 'rgba(255,255,255,0.98)', borderTopLeftRadius: 28,
    borderTopRightRadius: 28, maxHeight: '90%', minHeight: '55%', overflow: 'hidden',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1',
    alignSelf: 'center', marginTop: 10,
  },
  sheetHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },

  // Form Inputs
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 12 },
  fieldHelper: { fontSize: 11, color: '#64748B', marginTop: -8, marginBottom: 12 },
  textInput: {
    backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 14, color: '#0F172A', borderWidth: 1,
    borderColor: '#E2E8F0', marginBottom: 14,
  },
  bioHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bioCounter: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  bioInput: { height: 75, textAlignVertical: 'top', paddingTop: 10 },
  genderPill: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
  },
  genderPillText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  passwordInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14,
  },
  eyeIcon: { paddingHorizontal: 12 },
  otpBtn: {
    backgroundColor: '#FFF1F2', borderRadius: 12, paddingHorizontal: 14,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE4E6',
  },
  otpBtnText: { color: '#FF4D6D', fontSize: 13, fontWeight: '700' },
  submitPasswordBtn: {
    backgroundColor: '#FF4D6D', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 16, marginBottom: 24,
  },
  submitPasswordBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  // Warnings & Errors
  warningBox: {
    flexDirection: 'row', backgroundColor: '#FEF3C7', borderRadius: 12,
    padding: 12, marginTop: 4, marginBottom: 12,
  },
  warningText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 16 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  errorBannerText: { flex: 1, fontSize: 12.5, color: '#B91C1C', fontWeight: '600' },

  // Avatar Changer
  editAvatarWrap: { alignItems: 'center', marginVertical: 10 },
  editAvatarRing: {
    width: 84, height: 84, borderRadius: 42, overflow: 'hidden',
    borderWidth: 3, borderColor: '#FF4D6D',
  },
  editAvatarImg: { width: '100%', height: '100%' },
  cameraOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  photoTip: { fontSize: 12, color: '#64748B', marginTop: 6, fontWeight: '500' },

  // Devices Modal (Device History)
  deviceSectionHeader: {
    fontSize: 12, fontWeight: '800', color: '#64748B', letterSpacing: 0.8,
    marginBottom: 10,
  },
  deviceItemCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF',
    padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9',
  },
  currentDeviceCard: {
    borderColor: '#86EFAC', backgroundColor: '#F0FDF4',
  },
  deviceItemName: { fontSize: 14.5, fontWeight: '800', color: '#0F172A' },
  deviceItemMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  currentBadge: {
    backgroundColor: '#DCFCE7', paddingHorizontal: 7, paddingVertical: 2.5,
    borderRadius: 6,
  },
  currentBadgeText: { color: '#16A34A', fontSize: 10.5, fontWeight: '700' },
  deviceLogoutBtn: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, alignSelf: 'center',
  },
  deviceLogoutText: { color: '#EF4444', fontSize: 11.5, fontWeight: '700' },
  logoutAllDevicesBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 12, paddingVertical: 12,
    marginTop: 14, borderWidth: 1, borderColor: '#FEE2E2',
  },
  logoutAllDevicesText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },

  // Settings & QR
  settingsItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  settingsItemText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  logoutWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#FEE2E2',
    shadowColor: '#EF4444', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  logoutText: { color: '#EF4444', fontSize: 14.5, fontWeight: '700' },
  qrOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center',
    justifyContent: 'center', padding: 20,
  },
  qrCard: {
    backgroundColor: '#FFF', borderRadius: 28, padding: 24, alignItems: 'center',
    width: '100%', maxWidth: 340, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 20, elevation: 10,
  },
  qrAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#FFF', marginBottom: 8 },
  qrName: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  qrHandle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 16 },
  qrBox: {
    width: 190, height: 190, backgroundColor: '#F8FAFC', borderRadius: 16,
    padding: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  qrGrid: { width: 166, height: 166, flexDirection: 'row', flexWrap: 'wrap' },
  qrDot: { width: 166 / 7, height: 166 / 7, borderRadius: 3 },
  qrLogo: {
    position: 'absolute', width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#F1F5F9',
  },
  qrHint: { fontSize: 11.5, color: '#94A3B8', marginTop: 14, textAlign: 'center' },
  qrBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, borderRadius: 12,
  },
  assetIconCircle: { alignItems: 'center', justifyContent: 'center' },
  joinDateStatBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    width: '100%', backgroundColor: '#F8FAFC', borderRadius: 14,
    paddingVertical: 12, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0',
  },
});
