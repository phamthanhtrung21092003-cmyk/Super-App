import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  useWindowDimensions,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

export default function AddressFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const { addresses, addAddress, deleteAddress, accentHex } = useUser();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const addressId = typeof params.id === 'string' ? params.id : '';
  const isEditMode = !!addressId;

  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('Nhà riêng'); // Nhà riêng, Văn phòng, Khác
  const [customLabel, setCustomLabel] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [note, setNote] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const currentBg = theme.backgroundImage || DEFAULT_BACKGROUND;

  useEffect(() => {
    if (isEditMode) {
      const addr = addresses.find(a => a.id === addressId);
      if (addr) {
        if (addr.label === 'Nhà riêng' || addr.label === 'Văn phòng') {
          setLabel(addr.label);
        } else {
          setLabel('Khác');
          setCustomLabel(addr.label);
        }
        setReceiverName(addr.receiverName);
        setReceiverPhone(addr.receiverPhone);
        setProvince(addr.province);
        setDistrict(addr.district);
        setWard(addr.ward);
        setDetailAddress(addr.detailAddress);
        setNote(addr.note || '');
        setIsDefault(addr.isDefault);
      }
    }
  }, [addressId]);

  const handleSave = async () => {
    // 1. Validation rỗng
    if (
      !receiverName.trim() ||
      !receiverPhone.trim() ||
      !province.trim() ||
      !district.trim() ||
      !ward.trim() ||
      !detailAddress.trim()
    ) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc!');
      return;
    }

    // 2. Validation số điện thoại Việt Nam
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(receiverPhone.trim())) {
      Alert.alert('Số điện thoại không hợp lệ', 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng các đầu số Việt Nam (03, 05, 07, 08, 09)');
      return;
    }

    const finalLabel = label === 'Khác' ? (customLabel.trim() || 'Khác') : label;

    setLoading(true);
    try {
      const addressData = {
        label: finalLabel,
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        province: province.trim(),
        district: district.trim(),
        ward: ward.trim(),
        detailAddress: detailAddress.trim(),
        note: note.trim() || undefined,
        isDefault,
        // Dùng tọa độ mock ngẫu nhiên trong Hà Nội / HCM nếu chưa có định vị
        latitude: isEditMode ? addresses.find(a => a.id === addressId)?.latitude : (10.7 + Math.random() * 0.1),
        longitude: isEditMode ? addresses.find(a => a.id === addressId)?.longitude : (106.6 + Math.random() * 0.1),
      };

      if (isEditMode) {
        // Trong repo context chỉ định nghĩa addAddress và deleteAddress.
        // Để không làm phình phức tạp cấu trúc, ta thực hiện cập nhật bằng cách Xóa và Thêm mới (Keep ID).
        // Tuy nhiên, để tối ưu và sạch đẹp nhất, ta xóa cái cũ đi và add cái mới.
        await deleteAddress(addressId);
        await addAddress(addressData);
      } else {
        await addAddress(addressData);
      }

      Alert.alert('Thành công', isEditMode ? 'Đã cập nhật địa chỉ thành công!' : 'Đã thêm địa chỉ thành công!', [
        { text: 'OK', onPress: () => router.replace('/address-list' as any) }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <ImageBackground source={{ uri: currentBg }} style={styles.backgroundImage} resizeMode="cover">
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']} style={styles.darkOverlay} />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          {/* ══════════ TOP BAR ══════════ */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBtn} onPress={() => router.back()} disabled={loading}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={[styles.topTitle, { fontFamily: theme.fontFamily }]}>
              {isEditMode ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </Text>
            <TouchableOpacity style={styles.topBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color={accentHex} size="small" /> : <Ionicons name="checkmark" size={24} color={accentHex} />}
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Nhãn địa chỉ */}
            <Text style={styles.inputLabel}>Nhãn địa chỉ</Text>
            <View style={styles.chipRow}>
              {['Nhà riêng', 'Văn phòng', 'Khác'].map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    label === item && [styles.chipActive, { borderColor: accentHex, backgroundColor: `${accentHex}15` }]
                  ]}
                  onPress={() => setLabel(item)}
                >
                  <Ionicons
                    name={item === 'Nhà riêng' ? 'home-outline' : item === 'Văn phòng' ? 'briefcase-outline' : 'location-outline'}
                    size={14}
                    color={label === item ? accentHex : 'rgba(255,255,255,0.4)'}
                  />
                  <Text style={[styles.chipText, label === item && { color: accentHex, fontWeight: '700' }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {label === 'Khác' && (
              <TextInput
                style={[styles.textInput, { fontFamily: theme.fontFamily, marginTop: 10 }]}
                value={customLabel}
                onChangeText={setCustomLabel}
                placeholder="Ví dụ: Nhà bố mẹ, Kho hàng..."
                placeholderTextColor="#555"
                maxLength={30}
              />
            )}

            {/* Thông tin liên lạc */}
            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Người liên hệ (Bắt buộc)</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: theme.fontFamily }]}
              value={receiverName}
              onChangeText={setReceiverName}
              placeholder="Nhập họ và tên người nhận..."
              placeholderTextColor="#555"
            />

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Số điện thoại nhận hàng (Bắt buộc)</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: theme.fontFamily }]}
              value={receiverPhone}
              onChangeText={setReceiverPhone}
              placeholder="Nhập số điện thoại (ví dụ: 0394562659)..."
              placeholderTextColor="#555"
              keyboardType="phone-pad"
            />

            {/* Địa chỉ */}
            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Tỉnh / Thành phố (Bắt buộc)</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: theme.fontFamily }]}
              value={province}
              onChangeText={setProvince}
              placeholder="Nhập Tỉnh hoặc Thành phố..."
              placeholderTextColor="#555"
            />

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Quận / Huyện (Bắt buộc)</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: theme.fontFamily }]}
              value={district}
              onChangeText={setDistrict}
              placeholder="Nhập Quận hoặc Huyện..."
              placeholderTextColor="#555"
            />

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Phường / Xã (Bắt buộc)</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: theme.fontFamily }]}
              value={ward}
              onChangeText={setWard}
              placeholder="Nhập Phường hoặc Xã..."
              placeholderTextColor="#555"
            />

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Địa chỉ chi tiết (Bắt buộc)</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: theme.fontFamily }]}
              value={detailAddress}
              onChangeText={setDetailAddress}
              placeholder="Số nhà, ngõ ngách, tên đường..."
              placeholderTextColor="#555"
            />

            {/* Ghi chú */}
            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Ghi chú giao hàng (Tùy chọn)</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: theme.fontFamily, height: 80, textAlignVertical: 'top' }]}
              value={note}
              onChangeText={setNote}
              placeholder="Ví dụ: Gọi trước khi giao, Giao giờ hành chính, Nhà màu xanh..."
              placeholderTextColor="#555"
              multiline
              maxLength={100}
            />

            {/* Mặc định Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Đặt làm địa chỉ mặc định</Text>
                <Text style={styles.switchDesc}>Dùng địa chỉ này cho các đơn hàng tiếp theo</Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: '#333', true: `${accentHex}50` }}
                thumbColor={isDefault ? accentHex : '#888'}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accentHex }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={[styles.saveBtnText, { fontFamily: theme.fontFamily }]}>
                  {isEditMode ? 'CẬP NHẬT ĐỊA CHỈ' : 'LƯU ĐỊA CHỈ MỚI'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 20 }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 414,
    maxHeight: 896,
    aspectRatio: 414 / 896,
    borderWidth: 10,
    borderColor: '#111',
    borderRadius: 55,
    overflow: 'hidden',
    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255,255,255,0.1)',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chipActive: {
    borderWidth: 1,
  },
  chipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  switchTextCol: {
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  switchDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  saveBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
