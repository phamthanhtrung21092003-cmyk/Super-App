import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  useWindowDimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

export default function AddressListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { addresses, deleteAddress, setDefaultAddress, refreshAddresses, accentHex, accentRgb } = useUser();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [loading, setLoading] = useState(false);
  const currentBg = theme.backgroundImage || DEFAULT_BACKGROUND;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refreshAddresses();
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = (id: string, label: string) => {
    const performDelete = async () => {
      try {
        setLoading(true);
        await deleteAddress(id);
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể xóa địa chỉ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirm = window.confirm(`Bạn có chắc chắn muốn xóa địa chỉ "${label}" không?`);
      if (confirm) performDelete();
    } else {
      Alert.alert(
        'Xóa địa chỉ',
        `Bạn có chắc chắn muốn xóa địa chỉ "${label}" không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setLoading(true);
      await setDefaultAddress(id);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đặt làm mặc định. Vui lòng thử lại.');
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
            <TouchableOpacity style={styles.topBtn} onPress={() => router.replace('/account' as any)}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={[styles.topTitle, { fontFamily: theme.fontFamily }]}>Địa chỉ của tôi</Text>
            <TouchableOpacity style={styles.topBtn} onPress={() => router.push('/address-form' as any)}>
              <Ionicons name="add" size={26} color={accentHex} />
            </TouchableOpacity>
          </View>

          {loading && addresses.length === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator color={accentHex} size="large" />
            </View>
          ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              
              {/* Header Info */}
              <View style={styles.headerInfo}>
                <Text style={styles.headerDesc}>
                  Quản lý danh sách địa chỉ giao nhận hàng của bạn để thanh toán và đặt dịch vụ nhanh chóng hơn.
                </Text>
              </View>

              {addresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={64} color="rgba(255,255,255,0.15)" />
                  <Text style={styles.emptyText}>Bạn chưa thêm địa chỉ giao hàng nào.</Text>
                  <TouchableOpacity
                    style={[styles.addBtnEmpty, { backgroundColor: accentHex }]}
                    onPress={() => router.push('/address-form' as any)}
                  >
                    <Text style={styles.addBtnEmptyText}>Thêm địa chỉ mới</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                addresses.map((addr, index) => (
                  <Animated.View
                    entering={FadeInDown.delay(index * 100).duration(500)}
                    key={addr.id}
                    style={styles.cardContainer}
                  >
                    <BlurView intensity={25} tint="dark" style={styles.addressCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.labelRow}>
                          <View style={[styles.labelIconWrap, { backgroundColor: `rgba(${accentRgb}, 0.15)` }]}>
                            <Ionicons
                              name={addr.label === 'Nhà riêng' ? 'home' : addr.label === 'Văn phòng' ? 'briefcase' : 'location'}
                              size={16}
                              color={accentHex}
                            />
                          </View>
                          <Text style={styles.labelName}>{addr.label}</Text>
                        </View>

                        {addr.isDefault && (
                          <View style={[styles.defaultBadge, { backgroundColor: `${accentHex}20`, borderColor: accentHex }]}>
                            <Text style={{ color: accentHex, fontSize: 10, fontWeight: '800' }}>Mặc định</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.cardBody}>
                        <Text style={styles.contactName}>{addr.receiverName}</Text>
                        <Text style={styles.contactPhone}>SĐT: {addr.receiverPhone}</Text>
                        <Text style={styles.addressText}>
                          {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                        </Text>
                        {addr.note ? (
                          <View style={styles.noteBox}>
                            <Ionicons name="chatbox-ellipses-outline" size={14} color="#888" style={{ marginRight: 6 }} />
                            <Text style={styles.noteText}>{addr.note}</Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.cardFooter}>
                        <View style={styles.footerLeft}>
                          {!addr.isDefault && (
                            <TouchableOpacity onPress={() => handleSetDefault(addr.id)} style={styles.actionBtn}>
                              <Ionicons name="checkmark-circle-outline" size={14} color={accentHex} style={{ marginRight: 4 }} />
                              <Text style={[styles.actionBtnText, { color: accentHex }]}>Đặt mặc định</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <View style={styles.footerRight}>
                          <TouchableOpacity
                            onPress={() => router.push({ pathname: '/address-form' as any, params: { id: addr.id } })}
                            style={styles.actionBtn}
                          >
                            <Ionicons name="create-outline" size={14} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Sửa</Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => handleDelete(addr.id, addr.label)} style={styles.actionBtn}>
                            <Ionicons name="trash-outline" size={14} color="#FF4D4D" style={{ marginRight: 4 }} />
                            <Text style={[styles.actionBtnText, { color: '#FF4D4D' }]}>Xóa</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </BlurView>
                  </Animated.View>
                ))
              )}

              {addresses.length > 0 && (
                <TouchableOpacity
                  style={[styles.floatingAddBtn, { backgroundColor: accentHex }]}
                  onPress={() => router.push('/address-form' as any)}
                >
                  <Ionicons name="add" size={20} color="#000" style={{ marginRight: 6 }} />
                  <Text style={styles.floatingAddBtnText}>Thêm địa chỉ mới</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  headerInfo: {
    marginBottom: 20,
  },
  headerDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
  },
  addBtnEmpty: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  addBtnEmptyText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  addressCard: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardBody: {
    marginBottom: 16,
    gap: 4,
  },
  contactName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  contactPhone: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  addressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  noteText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 14,
  },
  footerLeft: {
    flexDirection: 'row',
  },
  footerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  floatingAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingAddBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
});
