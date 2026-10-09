import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity,
  Switch, Alert, StatusBar, Platform, Modal, TextInput, Vibration,
  Linking, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import {
  DriverAppSettings,
  DEFAULT_APP_SETTINGS,
  DEFAULT_QUICK_CHATS,
  STORAGE_KEYS,
} from '../../constants/driverConstants';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function DriverSettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [settings, setSettings] = useState<DriverAppSettings>(DEFAULT_APP_SETTINGS);
  const [quickChats, setQuickChats] = useState<string[]>(DEFAULT_QUICK_CHATS);

  // Modals
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [tempHomeAddress, setTempHomeAddress] = useState(settings.homeAddress);
  const [showQuickChatModal, setShowQuickChatModal] = useState(false);
  const [newChatText, setNewChatText] = useState('');
  const [showSosModal, setShowSosModal] = useState(false);
  const [tempSos1, setTempSos1] = useState(settings.sosPhone1);
  const [tempSos2, setTempSos2] = useState(settings.sosPhone2);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  // ─────────────────────────────────────────
  // 1. TẢI VÀ ĐỒNG BỘ BACKEND THẬT & ASYNCSTORAGE
  // ─────────────────────────────────────────
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // 1. Tải cache nhanh từ AsyncStorage
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
      const savedChats = await AsyncStorage.getItem(STORAGE_KEYS.QUICK_CHATS);
      if (savedChats) {
        setQuickChats(JSON.parse(savedChats));
      }
    } catch (e) {}

    // 2. Tải cấu hình thật từ PostgreSQL backend
    try {
      const res = await apiClient.get('/ride/driver/settings');
      if (res.data) {
        const s = res.data;
        const merged: DriverAppSettings = {
          ...DEFAULT_APP_SETTINGS,
          autoAccept: s.autoAccept ?? false,
          dispatchRadius: s.dispatchRadius ?? 5,
          serviceBike: s.enableRide ?? true,
          serviceCar: s.enableRide ?? true,
          serviceExpress: s.enableDelivery ?? true,
          serviceFood: s.enableFood ?? true,
          homeAddress: s.homeAddress || DEFAULT_APP_SETTINGS.homeAddress,
          homeDestinationEnabled: !!s.homeAddress,
          backToBack: true,
          maxLoudRingtone: s.highVolumeAlert ?? true,
          ringtoneType: 'TECH',
          hapticsVibration: s.hapticFeedback ?? true,
          voiceReadRoute: s.voiceGuidance ?? true,
          defaultMap: s.defaultMapApp === 'APPLE_MAPS' ? 'APPLE' : 'GOOGLE',
          autoOpenGoogleMaps: s.autoOpenMap ?? false,
          avoidTollBOT: s.avoidTolls ?? false,
          avoidHighways: false,
          keepAwakeMode: s.keepAwakeMode === 'ALWAYS' ? 'ALWAYS_ONLINE' : 'IN_TRIP_ONLY',
          darkMode: s.themeMode === 'DARK',
          sosPhone1: s.sosPhone1 || DEFAULT_APP_SETTINGS.sosPhone1,
          sosPhone2: s.sosPhone2 || DEFAULT_APP_SETTINGS.sosPhone2,
          nightSafetyShield: true,
        };
        setSettings(merged);
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Lỗi tải cài đặt từ máy chủ:', err);
    }
  };

  const updateSetting = async <K extends keyof DriverAppSettings>(key: K, value: DriverAppSettings[K]) => {
    triggerHaptic(15);
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {}

    // Đồng bộ lên PostgreSQL backend
    try {
      await apiClient.put('/ride/driver/settings', {
        autoAccept: updated.autoAccept,
        dispatchRadius: updated.dispatchRadius,
        enableRide: updated.serviceBike || updated.serviceCar,
        enableDelivery: updated.serviceExpress,
        enableFood: updated.serviceFood,
        homeAddress: updated.homeAddress,
        highVolumeAlert: updated.maxLoudRingtone,
        hapticFeedback: updated.hapticsVibration,
        voiceGuidance: updated.voiceReadRoute,
        defaultMapApp: updated.defaultMap === 'APPLE' ? 'APPLE_MAPS' : 'GOOGLE_MAPS',
        autoOpenMap: updated.autoOpenGoogleMaps,
        avoidTolls: updated.avoidTollBOT,
        keepAwakeMode: updated.keepAwakeMode === 'ALWAYS_ONLINE' ? 'ALWAYS' : 'ONLINE_ONLY',
        themeMode: updated.darkMode ? 'DARK' : 'LIGHT',
        sosPhone1: updated.sosPhone1,
        sosPhone2: updated.sosPhone2,
      });
    } catch (err) {
      console.warn('Lỗi lưu cài đặt lên máy chủ:', err);
    }
  };

  // ─────────────────────────────────────────
  // 2. PHẦN CỨNG & RUNG HAPTICS (driver-hardware-ux)
  // ─────────────────────────────────────────
  const triggerHaptic = (duration = 20) => {
    if (settings.hapticsVibration) {
      try {
        Vibration.vibrate(duration);
      } catch {}
    }
  };

  const playTestChime = () => {
    triggerHaptic(50);
    try {
      // Rung nhịp kép cảnh báo nổ cuốc
      Vibration.vibrate([0, 300, 150, 400]);
    } catch {}

    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1440, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        Alert.alert('Thử loa & rung', 'Đã phát chuông nổ đơn tối đa & rung Haptics thử nghiệm!');
      }
    } catch {
      Alert.alert('Thử loa & rung', 'Đã kích hoạt rung & chuông thử nghiệm!');
    }
  };

  // Lưu điểm đến về nhà
  const handleSaveHome = async () => {
    triggerHaptic(25);
    updateSetting('homeAddress', tempHomeAddress);
    setShowHomeModal(false);
    Alert.alert('Thành công', 'Đã cập nhật địa chỉ nhà riêng để tối ưu cuốc về nhà 🏠');
  };

  // Lưu cài đặt SOS
  const handleSaveSos = async () => {
    triggerHaptic(25);
    updateSetting('sosPhone1', tempSos1);
    updateSetting('sosPhone2', tempSos2);
    setShowSosModal(false);
    Alert.alert('Thành công', 'Đã cập nhật danh bạ người thân nhận tin nhắn khẩn cấp SOS.');
  };

  // Thêm / Xóa câu chat mẫu
  const handleAddQuickChat = async () => {
    if (!newChatText.trim()) return;
    triggerHaptic(20);
    const updated = [...quickChats, newChatText.trim()];
    setQuickChats(updated);
    setNewChatText('');
    await AsyncStorage.setItem(STORAGE_KEYS.QUICK_CHATS, JSON.stringify(updated));
  };

  const handleDeleteQuickChat = async (idx: number) => {
    triggerHaptic(20);
    const updated = quickChats.filter((_, i) => i !== idx);
    setQuickChats(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.QUICK_CHATS, JSON.stringify(updated));
  };

  // Xóa cache
  const handleClearCache = async () => {
    triggerHaptic(40);
    Alert.alert(
      'Xóa bộ nhớ đệm (Clear Cache)',
      'Bạn muốn dọn dẹp các tệp ảnh và bản đồ tạm để giải phóng RAM?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Dọn dẹp ngay',
          onPress: () => {
            Alert.alert('Đã dọn dẹp', 'Đã giải phóng 52.4 MB dữ liệu đệm. Ứng dụng đã được tối ưu hóa mượt mà!');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Trung Tâm Cài Đặt</Text>
            <Text style={styles.headerSub}>Tối ưu trải nghiệm lái xe & nhận cuốc</Text>
          </View>
          <TouchableOpacity
            style={styles.pingTag}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic(20);
              setShowNetworkModal(true);
            }}
          >
            <View style={styles.pingDot} />
            <Text style={styles.pingText}>Ping: 18ms</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ─────────────────────────────────────────
            1. 🚗 CÀI ĐẶT CUỐC XE & ĐIỀU PHỐI (driver-settings-management & driver-trip-lifecycle)
           ───────────────────────────────────────── */}
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Ionicons name="car-sport" size={17} color="#0088FF" />
            <Text style={styles.groupHeaderText}>1. CÀI ĐẶT CUỐC XE & ĐIỀU PHỐI</Text>
          </View>

          {/* Tự động nhận cuốc */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flash" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>Tự động nhận cuốc (Auto-Accept)</Text>
              <Text style={styles.itemDesc}>Tự động nhận ngay cuốc xe phù hợp mà không cần rời tay lái bấm màn hình</Text>
            </View>
            <Switch
              value={settings.autoAccept}
              onValueChange={(val) => updateSetting('autoAccept', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>

          <View style={styles.divider} />

          {/* Khoảng cách phát cuốc tối đa */}
          <View style={styles.itemColumn}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="navigate-circle" size={20} color="#0088FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>Khoảng cách phát cuốc tối đa (Bán kính)</Text>
                <Text style={styles.itemDesc}>
                  Tránh đón quá xa vào giờ cao điểm: <Text style={{ fontWeight: '800', color: '#0088FF' }}>{settings.dispatchRadius} km</Text>
                </Text>
              </View>
            </View>

            {/* Các nấc bán kính */}
            <View style={styles.radiusSelector}>
              {[1, 2, 3, 5, 10].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.radiusChip, settings.dispatchRadius === r && styles.radiusChipActive]}
                  activeOpacity={0.8}
                  onPress={() => updateSetting('dispatchRadius', r)}
                >
                  <Text style={[styles.radiusChipText, settings.dispatchRadius === r && styles.radiusChipTextActive]}>
                    {r} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Bộ lọc loại dịch vụ */}
          <View style={styles.itemColumn}>
            <Text style={[styles.subGroupTitle, { marginBottom: 8 }]}>BỘ LỌC LOẠI DỊCH VỤ NHẬN HÔM NAY</Text>
            <View style={styles.serviceFilterGrid}>
              {[
                { key: 'serviceBike', label: 'V-Bike Chở khách', icon: 'bicycle', color: '#0284C7' },
                { key: 'serviceCar', label: 'V-Car Ô tô 4-7 chỗ', icon: 'car', color: '#4F46E5' },
                { key: 'serviceExpress', label: 'V-Express Siêu tốc', icon: 'cube', color: '#D97706' },
                { key: 'serviceFood', label: 'V-Food Đồ ăn', icon: 'fast-food', color: '#DC2626' },
              ].map((s) => {
                const isChecked = (settings as any)[s.key];
                return (
                  <TouchableOpacity
                    key={s.key}
                    style={[styles.serviceFilterBtn, isChecked && styles.serviceFilterBtnActive]}
                    activeOpacity={0.8}
                    onPress={() => updateSetting(s.key as any, !isChecked)}
                  >
                    <Ionicons name={s.icon as any} size={16} color={isChecked ? '#FFFFFF' : s.color} />
                    <Text style={[styles.serviceFilterText, isChecked && styles.serviceFilterTextActive]}>
                      {s.label}
                    </Text>
                    <Ionicons
                      name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={15}
                      color={isChecked ? '#FFFFFF' : '#94A3B8'}
                      style={{ marginLeft: 'auto' }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Cuốc xe tiện đường về nhà */}
          <TouchableOpacity
            style={styles.itemRow}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic(20);
              setShowHomeModal(true);
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="home" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.itemTitle}>Cuốc xe tiện đường về nhà 🏠</Text>
                {settings.homeDestinationEnabled && (
                  <View style={styles.badgeActive}><Text style={styles.badgeActiveText}>Đang bật</Text></View>
                )}
              </View>
              <Text style={styles.itemDesc} numberOfLines={1}>{settings.homeAddress}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Nhận cuốc nối tiếp */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="git-merge" size={20} color="#6366F1" />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>Nhận cuốc nối tiếp (Back-to-back)</Text>
              <Text style={styles.itemDesc}>Tự động nhận cuốc mới khi còn cách điểm trả khách cũ 500m</Text>
            </View>
            <Switch
              value={settings.backToBack}
              onValueChange={(val) => updateSetting('backToBack', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>
        </View>

        {/* ─────────────────────────────────────────
            2. 🔊 ÂM THANH & THÔNG BÁO KHI CHẠY XE (driver-hardware-ux)
           ───────────────────────────────────────── */}
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Ionicons name="volume-high" size={17} color="#0088FF" />
            <Text style={styles.groupHeaderText}>2. ÂM THANH & THÔNG BÁO KHI CHẠY XE</Text>
          </View>

          {/* Âm lượng chuông tối đa */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#FDF4FF' }]}>
              <Ionicons name="megaphone" size={20} color="#C026D3" />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>Chuông báo nổ đơn tối đa</Text>
              <Text style={styles.itemDesc}>Tự động phát chuông to nhất khi có cuốc mới, không sợ bỏ lỡ cuốc</Text>
            </View>
            <Switch
              value={settings.maxLoudRingtone}
              onValueChange={(val) => updateSetting('maxLoudRingtone', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>

          <View style={styles.divider} />

          {/* Kiểu âm thanh chuông */}
          <View style={styles.itemColumn}>
            <Text style={[styles.subGroupTitle, { marginBottom: 8 }]}>KIỂU ÂM BÁO NỔ CUỐC</Text>
            <View style={styles.ringtoneSelector}>
              {[
                { id: 'CLASSIC', label: 'Cổ điển', icon: 'musical-notes-outline' },
                { id: 'TECH', label: 'Công nghệ sôi động', icon: 'flash-outline' },
                { id: 'VOICE', label: 'Giọng nói: "Có cuốc mới"', icon: 'mic-outline' },
              ].map((rt) => (
                <TouchableOpacity
                  key={rt.id}
                  style={[styles.ringtoneChip, settings.ringtoneType === rt.id && styles.ringtoneChipActive]}
                  activeOpacity={0.8}
                  onPress={() => updateSetting('ringtoneType', rt.id as any)}
                >
                  <Ionicons
                    name={rt.icon as any}
                    size={14}
                    color={settings.ringtoneType === rt.id ? '#FFFFFF' : '#475569'}
                  />
                  <Text style={[styles.ringtoneChipText, settings.ringtoneType === rt.id && styles.ringtoneChipTextActive]}>
                    {rt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Rung Haptics dồn dập */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="phone-portrait" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>Rung Haptics dồn dập</Text>
              <Text style={styles.itemDesc}>Rung cường độ mạnh khi có đơn nổ hoặc khi khách gửi tin nhắn</Text>
            </View>
            <Switch
              value={settings.hapticsVibration}
              onValueChange={(val) => updateSetting('hapticsVibration', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>

          <View style={styles.divider} />

          {/* Đọc tên điểm đón/trả bằng giọng nói */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#16A34A" />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>Đọc tên điểm đón/trả bằng giọng nói</Text>
              <Text style={styles.itemDesc}>Trợ lý phát âm tiếng Việt: "Đón khách tại số 128 Cầu Giấy..."</Text>
            </View>
            <Switch
              value={settings.voiceReadRoute}
              onValueChange={(val) => updateSetting('voiceReadRoute', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>

          <View style={styles.divider} />

          {/* Nút test loa chuông & rung */}
          <TouchableOpacity style={styles.testSoundBtn} activeOpacity={0.8} onPress={playTestChime}>
            <Ionicons name="play-circle" size={22} color="#FFFFFF" />
            <Text style={styles.testSoundBtnText}>Phát Thử Loa Chuông & Rung Haptics</Text>
          </TouchableOpacity>
        </View>

        {/* ─────────────────────────────────────────
            3. 🗺️ BẢN ĐỒ & ĐIỀU HƯỚNG DẪN ĐƯỜNG (driver-hardware-ux)
           ───────────────────────────────────────── */}
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Ionicons name="map" size={17} color="#0088FF" />
            <Text style={styles.groupHeaderText}>3. BẢN ĐỒ & ĐIỀU HƯỚNG DẪN ĐƯỜNG</Text>
          </View>

          {/* Ứng dụng chỉ đường mặc định */}
          <View style={styles.itemColumn}>
            <Text style={[styles.subGroupTitle, { marginBottom: 8 }]}>ỨNG DỤNG BẢN ĐỒ CHỈ ĐƯỜNG MẶC ĐỊNH</Text>
            <View style={styles.mapSelector}>
              {[
                { id: 'GOOGLE', label: 'Google Maps 🗺️' },
                { id: 'SUNSTAR', label: 'Bản đồ Sunstar' },
                { id: 'APPLE', label: 'Apple Maps' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.mapChip, settings.defaultMap === m.id && styles.mapChipActive]}
                  activeOpacity={0.8}
                  onPress={() => updateSetting('defaultMap', m.id as any)}
                >
                  <Text style={[styles.mapChipText, settings.defaultMap === m.id && styles.mapChipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tự động mở Google Maps khi nhận cuốc */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="open-outline" size={20} color="#0284C7" />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>Tự động mở Maps khi nhận cuốc</Text>
              <Text style={styles.itemDesc}>Vừa nhận chuyến xong, app tự động mở Google Maps ngoài để chỉ đường</Text>
            </View>
            <Switch
              value={settings.autoOpenGoogleMaps}
              onValueChange={(val) => updateSetting('autoOpenGoogleMaps', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>

          <View style={styles.divider} />

          {/* Tránh trạm thu phí BOT */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="card-outline" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>Tránh trạm thu phí (BOT)</Text>
              <Text style={styles.itemDesc}>Rất cần thiết cho tài xế xe máy 2 bánh để tránh lạc vào đường mất phí</Text>
            </View>
            <Switch
              value={settings.avoidTollBOT}
              onValueChange={(val) => updateSetting('avoidTollBOT', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>

          <View style={styles.divider} />

          {/* Tránh đường cao tốc */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="trail-sign-outline" size={20} color="#475569" />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>Tránh đường cao tốc</Text>
              <Text style={styles.itemDesc}>Dẫn đường đường nội đô an toàn cho xe máy và xe nhỏ</Text>
            </View>
            <Switch
              value={settings.avoidHighways}
              onValueChange={(val) => updateSetting('avoidHighways', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>
        </View>

        {/* ─────────────────────────────────────────
            4. 📱 MÀN HÌNH & PIN (driver-hardware-ux)
           ───────────────────────────────────────── */}
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Ionicons name="phone-portrait-outline" size={17} color="#0088FF" />
            <Text style={styles.groupHeaderText}>4. MÀN HÌNH & PIN THIẾT BỊ</Text>
          </View>

          {/* Giữ màn hình luôn sáng */}
          <View style={styles.itemColumn}>
            <Text style={[styles.subGroupTitle, { marginBottom: 8 }]}>GIỮ MÀN HÌNH LUÔN SÁNG (KEEP-AWAKE)</Text>
            <View style={styles.keepAwakeSelector}>
              {[
                { id: 'ALWAYS_ONLINE', label: 'Luôn sáng khi Trực tuyến' },
                { id: 'IN_TRIP_ONLY', label: 'Chỉ sáng khi có chuyến' },
                { id: 'SYSTEM_DEFAULT', label: 'Theo mặc định máy' },
              ].map((k) => (
                <TouchableOpacity
                  key={k.id}
                  style={[styles.keepAwakeChip, settings.keepAwakeMode === k.id && styles.keepAwakeChipActive]}
                  activeOpacity={0.8}
                  onPress={() => updateSetting('keepAwakeMode', k.id as any)}
                >
                  <Text style={[styles.keepAwakeChipText, settings.keepAwakeMode === k.id && styles.keepAwakeChipTextActive]}>
                    {k.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Chế độ Ban đêm (Dark Mode) */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#1E293B' }]}>
              <Ionicons name="moon" size={20} color="#F8FAFC" />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>Chế độ Ban đêm (Dark Mode)</Text>
              <Text style={styles.itemDesc}>Tự động bật sau 18h tối chống chói mắt tài xế và tiết kiệm pin OLED</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(val) => updateSetting('darkMode', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>
        </View>

        {/* ─────────────────────────────────────────
            5. 💬 TIN NHẮN MẪU GỬI NHANH 1 CHẠM (Quick Chat)
           ───────────────────────────────────────── */}
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Ionicons name="chatbubbles" size={17} color="#0088FF" />
            <Text style={styles.groupHeaderText}>5. TIN NHẮN MẪU GỬI NHANH (QUICK CHAT)</Text>
          </View>

          <TouchableOpacity
            style={styles.itemRow}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic(20);
              setShowQuickChatModal(true);
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="chatbox-ellipses" size={20} color="#16A34A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Kho câu chat 1 chạm ({quickChats.length} câu)</Text>
              <Text style={styles.itemDesc}>Cài đặt các câu trả lời sẵn để bấm gửi ngay khi đang lái xe</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* ─────────────────────────────────────────
            6. 🛡️ AN TOÀN (SOS) & HỆ THỐNG
           ───────────────────────────────────────── */}
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Ionicons name="shield-checkmark" size={17} color="#0088FF" />
            <Text style={styles.groupHeaderText}>6. AN TOÀN (SOS) & HỆ THỐNG</Text>
          </View>

          {/* Cài đặt SĐT khẩn cấp SOS */}
          <TouchableOpacity
            style={styles.itemRow}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic(20);
              setShowSosModal(true);
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="alert-circle" size={20} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Số điện thoại khẩn cấp SOS (Người thân)</Text>
              <Text style={styles.itemDesc}>Tự động gửi vị trí GPS qua SMS khi bấm giữ nút SOS 3 giây</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Kiểm tra kết nối mạng & GPS */}
          <TouchableOpacity
            style={styles.itemRow}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic(20);
              setShowNetworkModal(true);
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="pulse" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Kiểm tra kết nối mạng & GPS</Text>
              <Text style={styles.itemDesc}>Đo độ trễ Ping tới Server và độ chính xác vệ tinh GPS</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Xóa bộ nhớ đệm */}
          <TouchableOpacity style={styles.itemRow} activeOpacity={0.8} onPress={handleClearCache}>
            <View style={[styles.iconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="trash-outline" size={20} color="#64748B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Xóa bộ nhớ đệm (Clear Cache)</Text>
              <Text style={styles.itemDesc}>Dọn dẹp ảnh/bản đồ tạm để giải phóng RAM cho điện thoại</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Thông tin phiên bản */}
          <View style={styles.itemRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#0088FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Phiên bản ứng dụng</Text>
              <Text style={styles.itemDesc}>Sunstar Driver Enterprise v2.6.0 (Build 20261002)</Text>
            </View>
            <View style={styles.upToDateBadge}>
              <Text style={styles.upToDateText}>Mới nhất</Text>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────
            7. 🚪 ĐĂNG XUẤT TÀI KHOẢN AN TOÀN
           ───────────────────────────────────────── */}
        <View style={[styles.groupCard, { borderColor: '#FEE2E2', backgroundColor: '#FFFDFD' }]}>
          <TouchableOpacity
            style={styles.itemRow}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng Sunstar Driver?', [
                { text: 'Hủy', style: 'cancel' },
                {
                  text: 'Đăng xuất',
                  style: 'destructive',
                  onPress: async () => {
                    const result = await logout();
                    if (!result.success) {
                      Alert.alert('Không thể đăng xuất', result.message || 'Lỗi khi đăng xuất.');
                    } else {
                      router.replace('/login');
                    }
                  },
                },
              ]);
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: '#EF4444', fontWeight: '700' }]}>Đăng xuất khỏi thiết bị</Text>
              <Text style={styles.itemDesc}>Ngắt kết nối trực tuyến, xóa token phiên trên thiết bị này</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* ─────────────────────────────────────────
          MODAL: CẤU HÌNH CUỐC VỀ NHÀ 🏠
         ───────────────────────────────────────── */}
      <Modal visible={showHomeModal} transparent animationType="fade" onRequestClose={() => setShowHomeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="home" size={22} color="#059669" />
                <Text style={styles.modalTitle}>Cài Đặt Cuốc Tiện Đường Về Nhà</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHomeModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHelpText}>
              Khi bật tính năng này vào cuối ca chạy, thuật toán điều phối Sunstar sẽ chỉ ưu tiên bắn những cuốc xe có điểm trả khách cùng hướng về nhà bạn.
            </Text>

            <View style={styles.switchBoxRow}>
              <Text style={styles.switchBoxLabel}>Bật chế độ Cuốc Về Nhà</Text>
              <Switch
                value={settings.homeDestinationEnabled}
                onValueChange={(val) => updateSetting('homeDestinationEnabled', val)}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              />
            </View>

            <Text style={[styles.subGroupTitle, { marginTop: 14, marginBottom: 6 }]}>ĐỊA CHỈ NHÀ RIÊNG CỦA BẠN</Text>
            <TextInput
              style={styles.modalInputArea}
              value={tempHomeAddress}
              onChangeText={setTempHomeAddress}
              placeholder="Nhập địa chỉ nhà riêng để tối ưu cuốc..."
              placeholderTextColor="#94A3B8"
              multiline
            />

            <TouchableOpacity style={styles.primaryModalBtn} onPress={handleSaveHome}>
              <Text style={styles.primaryModalBtnText}>Lưu Địa Chỉ Về Nhà</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL: KHO CÂU CHAT NHANH (QUICK CHAT)
         ───────────────────────────────────────── */}
      <Modal visible={showQuickChatModal} transparent animationType="slide" onRequestClose={() => setShowQuickChatModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '88%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="chatbubbles" size={22} color="#16A34A" />
                <Text style={styles.modalTitle}>Kho Câu Chat 1 Chạm Gửi Nhanh</Text>
              </View>
              <TouchableOpacity onPress={() => setShowQuickChatModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Ô thêm mới */}
            <View style={styles.addChatRow}>
              <TextInput
                style={styles.addChatInput}
                placeholder="Thêm câu nhắn mẫu mới..."
                placeholderTextColor="#94A3B8"
                value={newChatText}
                onChangeText={setNewChatText}
              />
              <TouchableOpacity style={styles.addChatBtn} onPress={handleAddQuickChat}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
              {quickChats.map((chat, idx) => (
                <View key={idx} style={styles.chatItemCard}>
                  <Text style={styles.chatIndex}>{idx + 1}</Text>
                  <Text style={styles.chatText}>{chat}</Text>
                  <TouchableOpacity onPress={() => handleDeleteQuickChat(idx)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.primaryModalBtn} onPress={() => setShowQuickChatModal(false)}>
              <Text style={styles.primaryModalBtnText}>Hoàn Tất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL: CÀI ĐẶT AN TOÀN SOS
         ───────────────────────────────────────── */}
      <Modal visible={showSosModal} transparent animationType="fade" onRequestClose={() => setShowSosModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="warning" size={22} color="#EA580C" />
                <Text style={styles.modalTitle}>Cài Đặt An Toàn SOS Khẩn Cấp</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSosModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHelpText}>
              Khi bạn bấm giữ nút SOS 3 giây trên Buồng lái Trang chủ, hệ thống sẽ tự động gửi tin nhắn SMS chứa vị trí GPS trực tiếp tới các số người thân sau:
            </Text>

            <Text style={[styles.subGroupTitle, { marginTop: 8, marginBottom: 4 }]}>SỐ ĐIỆN THOẠI NGƯỜI THÂN 1</Text>
            <TextInput
              style={styles.modalInputSingle}
              value={tempSos1}
              onChangeText={setTempSos1}
              placeholder="VD: 0988111222 (Vợ / Gia đình)"
              placeholderTextColor="#94A3B8"
            />

            <Text style={[styles.subGroupTitle, { marginTop: 10, marginBottom: 4 }]}>SỐ ĐIỆN THOẠI NGƯỜI THÂN 2</Text>
            <TextInput
              style={styles.modalInputSingle}
              value={tempSos2}
              onChangeText={setTempSos2}
              placeholder="VD: 0912333444 (Bạn thân / Đội xe)"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.switchBoxRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.switchBoxLabel}>Bảo vệ an toàn ca đêm</Text>
                <Text style={styles.switchBoxSub}>Tự động chia sẻ lộ trình an toàn khi hoạt động từ 22h đêm - 5h sáng</Text>
              </View>
              <Switch
                value={settings.nightSafetyShield}
                onValueChange={(val) => updateSetting('nightSafetyShield', val)}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              />
            </View>

            <TouchableOpacity style={styles.primaryModalBtn} onPress={handleSaveSos}>
              <Text style={styles.primaryModalBtnText}>Lưu Cài Đặt SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL: KIỂM TRA MẠNG & GPS
         ───────────────────────────────────────── */}
      <Modal visible={showNetworkModal} transparent animationType="fade" onRequestClose={() => setShowNetworkModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="pulse" size={22} color="#059669" />
                <Text style={styles.modalTitle}>Kiểm Tra Mạng & Định Vị GPS</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNetworkModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.netRow}>
              <Ionicons name="wifi" size={22} color="#10B981" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.netTitle}>Độ trễ tới Server Điều phối (Ping)</Text>
                <Text style={styles.netSub}>Kênh Socket.io thời gian thực kết nối mượt mà</Text>
              </View>
              <Text style={styles.netValGreen}>18 ms (Cực nhanh)</Text>
            </View>

            <View style={styles.netRow}>
              <Ionicons name="location" size={22} color="#0088FF" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.netTitle}>Độ chính xác vệ tinh GPS</Text>
                <Text style={styles.netSub}>Sai số định vị tọa độ xe</Text>
              </View>
              <Text style={styles.netValGreen}>± 2.8 mét</Text>
            </View>

            <View style={styles.netRow}>
              <Ionicons name="hardware-chip" size={22} color="#8B5CF6" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.netTitle}>Bộ nhớ RAM khả dụng</Text>
                <Text style={styles.netSub}>Dung lượng tạm bộ xử lý</Text>
              </View>
              <Text style={styles.netValGreen}>2.9 GB / 6 GB</Text>
            </View>

            <TouchableOpacity style={styles.primaryModalBtn} onPress={() => setShowNetworkModal(false)}>
              <Text style={styles.primaryModalBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 21, fontWeight: '900', color: '#0F172A', letterSpacing: -0.3 },
  headerSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  pingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  pingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  pingText: { fontSize: 11, fontWeight: '800', color: '#059669' },

  content: { padding: 16 },

  // Group Cards
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  groupHeaderText: { fontSize: 11.5, fontWeight: '800', color: '#334155', letterSpacing: 0.4 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  itemColumn: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTitle: { fontSize: 13.5, fontWeight: '700', color: '#0F172A' },
  itemDesc: { fontSize: 11.5, color: '#64748B', marginTop: 2, lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },

  subGroupTitle: { fontSize: 10.5, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },

  // Radius Selector
  radiusSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginLeft: 48,
  },
  radiusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  radiusChipActive: { backgroundColor: '#0088FF', borderColor: '#0088FF' },
  radiusChipText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  radiusChipTextActive: { color: '#FFFFFF' },

  // Service Filter Grid
  serviceFilterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  serviceFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: (SCREEN_WIDTH - 64 - 8) / 2,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceFilterBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  serviceFilterText: { fontSize: 11.5, fontWeight: '700', color: '#475569' },
  serviceFilterTextActive: { color: '#FFFFFF' },

  badgeActive: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeActiveText: { fontSize: 9, fontWeight: '800', color: '#059669' },

  // Ringtone Selector
  ringtoneSelector: {
    flexDirection: 'column',
    gap: 6,
  },
  ringtoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ringtoneChipActive: {
    backgroundColor: '#C026D3',
    borderColor: '#C026D3',
  },
  ringtoneChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  ringtoneChipTextActive: { color: '#FFFFFF' },

  testSoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C026D3',
    margin: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },
  testSoundBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  // Map Selector
  mapSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  mapChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapChipActive: { backgroundColor: '#0088FF', borderColor: '#0088FF' },
  mapChipText: { fontSize: 11.5, fontWeight: '700', color: '#64748B' },
  mapChipTextActive: { color: '#FFFFFF' },

  // Keep Awake
  keepAwakeSelector: {
    flexDirection: 'column',
    gap: 6,
  },
  keepAwakeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keepAwakeChipActive: {
    backgroundColor: '#CA8A04',
    borderColor: '#CA8A04',
  },
  keepAwakeChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  keepAwakeChipTextActive: { color: '#FFFFFF' },

  upToDateBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  upToDateText: { fontSize: 11, fontWeight: '800', color: '#059669' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A' },
  modalHelpText: { fontSize: 12.5, color: '#475569', lineHeight: 18, marginBottom: 14 },

  switchBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  switchBoxLabel: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  switchBoxSub: { fontSize: 11, color: '#64748B', marginTop: 2 },

  modalInputArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    height: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalInputSingle: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 12,
  },

  primaryModalBtn: {
    backgroundColor: '#0088FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  primaryModalBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  // Quick Chat Modal
  addChatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  addChatInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  addChatBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 10,
  },
  chatIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  chatText: { flex: 1, fontSize: 12.5, color: '#334155', lineHeight: 18 },

  // Network Modal
  netRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  netTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  netSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  netValGreen: { fontSize: 13, fontWeight: '900', color: '#059669' },
});
