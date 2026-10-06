import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  Platform, SafeAreaView, StatusBar, TouchableOpacity,
  Switch, ActivityIndicator, Modal, TextInput, Alert, RefreshControl, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useFoodMerchant } from '../../context/FoodMerchantContext';
import { foodMerchantService } from '../../services/foodMerchantService';

export default function MerchantProfile() {
  const router = useRouter();
  const { 
    restaurant, 
    refreshProfile, 
    toggleOpen,
    updateProfile 
  } = useFoodMerchant();

  const [refreshing, setRefreshing] = useState(false);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [togglingAutoAccept, setTogglingAutoAccept] = useState(false);

  // State Modal chỉnh sửa thông tin quán
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [avatar, setAvatar] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);

  const primaryColor = '#0066FF';

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleToggleOpen = async (val: boolean) => {
    setTogglingOpen(true);
    await toggleOpen(val);
    setTogglingOpen(false);
  };

  const handleToggleAutoAccept = async (val: boolean) => {
    setTogglingAutoAccept(true);
    try {
      await foodMerchantService.toggleOpen(restaurant?.isOpen, val);
      await refreshProfile();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật cấu hình tự động nhận đơn');
    } finally {
      setTogglingAutoAccept(false);
    }
  };

  const openEditModal = () => {
    setName(restaurant?.name || '');
    setAddress(restaurant?.address || '');
    setPhoneNumber(restaurant?.phone || restaurant?.phoneNumber || '');
    setOpeningHours(restaurant?.openingHours || '08:00 - 22:00');
    setAvatar(restaurant?.avatar || '');
    setCoverImage(restaurant?.coverImage || '');
    setBankName(restaurant?.bankName || '');
    setBankCode(restaurant?.bankCode || '');
    setBankAccountNo(restaurant?.bankAccountNumber || restaurant?.bankAccountNo || '');
    setBankAccountHolder(restaurant?.bankAccountName || restaurant?.bankAccountHolder || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Thông báo', 'Tên quán và địa chỉ là bắt buộc');
      return;
    }

    setSubmittingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        openingHours: openingHours.trim(),
        avatar: avatar.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankCode: bankCode.trim() || undefined,
        bankAccountNo: bankAccountNo.trim() || undefined,
        bankAccountHolder: bankAccountHolder.trim() || undefined,
      });
      setEditModalVisible(false);
      await refreshProfile();
    } finally {
      setSubmittingProfile(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hồ Sơ Nhà Hàng</Text>
          <Text style={styles.headerSub}>Thông tin quán & cấu hình vận hành</Text>
        </View>

        <TouchableOpacity style={styles.btnEditProfile} onPress={openEditModal}>
          <Ionicons name="create-outline" size={16} color="#0066FF" />
          <Text style={styles.btnEditProfileText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
      >
        {/* Banner Cover & Avatar */}
        <Animated.View entering={FadeInUp.duration(300)} style={styles.storeCard}>
          <View style={styles.coverWrapper}>
            {restaurant?.coverImage ? (
              <Image source={{ uri: restaurant.coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="images-outline" size={32} color="#94A3B8" />
              </View>
            )}
            <View style={styles.avatarWrapper}>
              {restaurant?.avatar ? (
                <Image source={{ uri: restaurant.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="storefront" size={28} color="#0066FF" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.storeInfoBody}>
            <View style={styles.storeTitleRow}>
              <Text style={styles.storeName}>{restaurant?.name || 'Nhà hàng V-Life'}</Text>
              <View style={[styles.statusPill, { backgroundColor: restaurant?.isOpen ? '#ECFDF5' : '#FEF2F2' }]}>
                <View style={[styles.statusDot, { backgroundColor: restaurant?.isOpen ? '#059669' : '#DC2626' }]} />
                <Text style={[styles.statusPillText, { color: restaurant?.isOpen ? '#059669' : '#DC2626' }]}>
                  {restaurant?.isOpen ? 'Đang mở' : 'Đang đóng'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#64748B" />
              <Text style={styles.infoText}>{restaurant?.address || 'Chưa cập nhật địa chỉ'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color="#64748B" />
              <Text style={styles.infoText}>{restaurant?.phone || restaurant?.phoneNumber || 'Chưa cập nhật hotline'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.infoText}>Giờ mở cửa: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{restaurant?.openingHours || '08:00 - 22:00'}</Text></Text>
            </View>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {restaurant?.rating || '5.0'} ({restaurant?.totalReviews || 0} đánh giá từ khách hàng)
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Thiết lập vận hành (Mở/Đóng cửa, Tự động nhận đơn) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cấu Hình Vận Hành</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Trạng thái mở cửa</Text>
              <Text style={styles.switchSub}>
                {restaurant?.isOpen 
                  ? 'Quán đang hiển thị trên app khách và nhận đơn online' 
                  : 'Quán đang đóng cửa, tạm ngưng nhận đơn mới'}
              </Text>
            </View>
            {togglingOpen ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : (
              <Switch
                value={Boolean(restaurant?.isOpen)}
                onValueChange={handleToggleOpen}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={restaurant?.isOpen ? '#0066FF' : '#94A3B8'}
              />
            )}
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Tự động nhận đơn (Auto-Accept)</Text>
              <Text style={styles.switchSub}>
                Tự động xác nhận đơn mới và chuyển sang chuẩn bị món mà không cần bấm thủ công
              </Text>
            </View>
            {togglingAutoAccept ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : (
              <Switch
                value={Boolean(restaurant?.autoAcceptOrder)}
                onValueChange={handleToggleAutoAccept}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={restaurant?.autoAcceptOrder ? '#0066FF' : '#94A3B8'}
              />
            )}
          </View>
        </View>

        {/* Thông tin tài khoản ngân hàng thụ hưởng */}
        <View style={styles.sectionCard}>
          <View style={styles.bankHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="card" size={20} color="#059669" />
              <Text style={styles.sectionTitle}>Tài Khoản Quyết Toán Ngân Hàng</Text>
            </View>
            <TouchableOpacity onPress={openEditModal}>
              <Text style={styles.bankEditLink}>Đổi số tài khoản</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bankBox}>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Ngân hàng:</Text>
              <Text style={styles.bankValue}>
                {restaurant?.bankName || (restaurant as any)?.bankInfo?.bankName || 'Chưa thiết lập'}
              </Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Số tài khoản:</Text>
              <Text style={[styles.bankValue, { color: '#0066FF', fontSize: 16 }]}>
                {restaurant?.bankAccountNumber || (restaurant as any)?.bankInfo?.bankAccountNo || 'Chưa thiết lập'}
              </Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Chủ tài khoản:</Text>
              <Text style={styles.bankValue}>
                {restaurant?.bankAccountName || (restaurant as any)?.bankInfo?.bankAccountHolder || restaurant?.name}
              </Text>
            </View>
          </View>
          <Text style={styles.bankNote}>
            * Doanh thu (90%) sẽ được quyết toán và chuyển khoản trực tiếp vào tài khoản ngân hàng này.
          </Text>
        </View>

        {/* Nút thoát / chuyển về giao diện người dùng */}
        <TouchableOpacity
          style={styles.exitAppBtn}
          onPress={() => router.replace('/account' as any)}
        >
          <Ionicons name="home-outline" size={18} color="#64748B" />
          <Text style={styles.exitAppText}>Trở về Trang Người Dùng</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL CHỈNH SỬA THÔNG TIN QUÁN */}
      {/* ======================================================== */}
      <Modal visible={editModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.formCloseBtn}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.formTitle}>Chỉnh Sửa Thông Tin Quán</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView style={styles.formScroll}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên quán ăn / nhà hàng <Text style={styles.reqMark}>*</Text></Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên quán..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Địa chỉ quán <Text style={styles.reqMark}>*</Text></Text>
              <TextInput
                style={styles.formInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Địa chỉ số nhà, đường, quận/huyện..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Số điện thoại hotline</Text>
              <TextInput
                style={styles.formInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Số điện thoại liên hệ..."
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giờ mở cửa phục vụ</Text>
              <TextInput
                style={styles.formInput}
                value={openingHours}
                onChangeText={setOpeningHours}
                placeholder="Ví dụ: 08:00 - 22:30"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ảnh đại diện Avatar (URL)</Text>
              <TextInput
                style={styles.formInput}
                value={avatar}
                onChangeText={setAvatar}
                placeholder="https://..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ảnh bìa Cover (URL)</Text>
              <TextInput
                style={styles.formInput}
                value={coverImage}
                onChangeText={setCoverImage}
                placeholder="https://..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Tài khoản ngân hàng */}
            <Text style={[styles.formSectionTitle, { marginTop: 16 }]}>Thông Tin Ngân Hàng Thụ Hưởng</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên ngân hàng (vd: MB Bank, Techcombank, Vietcombank)</Text>
              <TextInput
                style={styles.formInput}
                value={bankName}
                onChangeText={setBankName}
                placeholder="Ví dụ: Ngân hàng Quân Đội (MB)"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mã ngân hàng (Bank Code)</Text>
              <TextInput
                style={styles.formInput}
                value={bankCode}
                onChangeText={setBankCode}
                placeholder="Ví dụ: MB, TCB, VCB"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Số tài khoản ngân hàng</Text>
              <TextInput
                style={styles.formInput}
                value={bankAccountNo}
                onChangeText={setBankAccountNo}
                placeholder="Nhập số tài khoản..."
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên chủ tài khoản</Text>
              <TextInput
                style={styles.formInput}
                value={bankAccountHolder}
                onChangeText={setBankAccountHolder}
                placeholder="NGUYEN VAN A"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.formBottomBar}>
            <TouchableOpacity
              style={styles.formCancelBtn}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.formCancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formSaveBtn}
              onPress={handleSaveProfile}
              disabled={submittingProfile}
            >
              {submittingProfile ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.formSaveText}>Lưu Thay Đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  btnEditProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  btnEditProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0066FF',
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  coverWrapper: {
    height: 120,
    width: '100%',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -30,
    left: 16,
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfoBody: {
    paddingTop: 38,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    paddingRight: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  switchSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bankEditLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066FF',
  },
  bankBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  bankValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  bankNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  exitAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  exitAppText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  formCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  formScroll: {
    padding: 16,
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0066FF',
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  reqMark: {
    color: '#DC2626',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  formBottomBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  formCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  formCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  formSaveBtn: {
    flex: 2,
    backgroundColor: '#0066FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  formSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
