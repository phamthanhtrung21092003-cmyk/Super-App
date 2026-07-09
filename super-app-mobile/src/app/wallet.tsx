import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  ImageBackground,
  useWindowDimensions,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

export default function WalletScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { wallet, walletLoading, walletError, refreshWallet, accentHex, accentRgb } = useUser();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const currentBg = theme.backgroundImage || DEFAULT_BACKGROUND;

  useEffect(() => {
    refreshWallet();
  }, []);

  const handleDisabledAction = (featureName: string) => {
    Alert.alert('Thông báo', `Tính năng "${featureName}" đang được phát triển và sẽ sớm ra mắt!`);
  };

  // Định dạng hiển thị tiền Việt Nam Đồng
  const formatVND = (valueStr: string | number) => {
    const val = parseFloat(String(valueStr)) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Tính số dư khả dụng
  const getAvailableBalance = () => {
    if (!wallet) return 0;
    const bal = parseFloat(wallet.balance) || 0;
    const pend = parseFloat(wallet.pendingBalance) || 0;
    return bal - pend;
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <ImageBackground source={{ uri: currentBg }} style={styles.backgroundImage} resizeMode="cover">
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']} style={styles.darkOverlay} />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          {/* ══════════ TOP BAR ══════════ */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBtn} onPress={() => router.back()} disabled={walletLoading}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={[styles.topTitle, { fontFamily: theme.fontFamily }]}>Ví V-Life</Text>
            <TouchableOpacity style={styles.topBtn} onPress={() => refreshWallet()} disabled={walletLoading}>
              <Ionicons name="refresh" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {walletLoading && !wallet ? (
            <View style={styles.centered}>
              <ActivityIndicator color={accentHex} size="large" />
              <Text style={[styles.loadingText, { fontFamily: theme.fontFamily }]}>Đang kết nối ví an toàn...</Text>
            </View>
          ) : walletError && !wallet ? (
            <View style={styles.centered}>
              <Ionicons name="alert-circle-outline" size={64} color="#FF4D4D" />
              <Text style={styles.errorText}>{walletError}</Text>
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: accentHex }]} onPress={() => refreshWallet()}>
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : wallet ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={walletLoading} onRefresh={refreshWallet} tintColor={accentHex} colors={[accentHex]} />
              }
            >
              
              {/* ══════════ PREMIUM WALLET CARD ══════════ */}
              <Animated.View entering={FadeInDown.duration(600)} style={styles.walletCardWrapper}>
                <LinearGradient
                  colors={['rgba(25, 30, 45, 0.95)', 'rgba(10, 12, 22, 0.98)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.walletCard, { borderColor: 'rgba(255,255,255,0.08)' }]}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.cardName}>V-LIFE WALLET</Text>
                      <Text style={styles.walletNumber}>Mã ví: {wallet.walletNumber}</Text>
                    </View>
                    <BlurView intensity={20} tint="light" style={styles.cardChip}>
                      <Ionicons name="hardware-chip-sharp" size={22} color="#D8C690" />
                    </BlurView>
                  </View>

                  {/* Card Balance */}
                  <View style={styles.balanceSection}>
                    <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
                    <Text style={[styles.balanceValue, { color: accentHex }]}>
                      {formatVND(getAvailableBalance())}
                    </Text>
                  </View>

                  {/* Escrow & points status */}
                  <View style={styles.cardStatusRow}>
                    <View style={styles.statusCol}>
                      <Text style={styles.statusLabel}>Tạm giữ</Text>
                      <Text style={styles.statusValue}>{formatVND(wallet.pendingBalance)}</Text>
                    </View>
                    <View style={styles.cardDivider} />
                    <View style={styles.statusCol}>
                      <Text style={styles.statusLabel}>Điểm thưởng</Text>
                      <Text style={styles.statusValue}>{wallet.rewardPoints} điểm</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* ══════════ QUICK ACTIONS ══════════ */}
              <View style={styles.actionsGrid}>
                {[
                  { id: 'topup', label: 'Nạp tiền', icon: 'add-circle-outline' },
                  { id: 'withdraw', label: 'Rút tiền', icon: 'arrow-down-circle-outline' },
                  { id: 'transfer', label: 'Chuyển tiền', icon: 'swap-horizontal-outline' },
                  { id: 'history', label: 'Lịch sử', icon: 'time-outline' }
                ].map((act) => (
                  <TouchableOpacity
                    key={act.id}
                    style={styles.actionBtn}
                    onPress={() => {
                      if (act.id === 'history') {
                        router.push('/transactions' as any);
                      } else {
                        handleDisabledAction(act.label);
                      }
                    }}
                  >
                    <BlurView intensity={20} tint="dark" style={styles.actionIconWrap}>
                      <Ionicons name={act.icon as any} size={22} color={accentHex} />
                    </BlurView>
                    <Text style={styles.actionText}>{act.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ══════════ PROMOTION SECTION ══════════ */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily }]}>Ưu đãi của tôi</Text>
                <TouchableOpacity onPress={() => handleDisabledAction('Xem tất cả')}>
                  <Text style={[styles.seeAllText, { color: accentHex }]}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.promoBanner} onPress={() => handleDisabledAction('Khuyến mãi nạp tiền')}>
                <BlurView intensity={15} tint="dark" style={styles.promoContent}>
                  <View style={[styles.promoIconWrap, { backgroundColor: `rgba(${accentRgb}, 0.15)` }]}>
                    <Ionicons name="gift-outline" size={24} color={accentHex} />
                  </View>
                  <View style={styles.promoTextWrap}>
                    <Text style={styles.promoTitle}>Tặng ngay 50.000đ khi liên kết ngân hàng</Text>
                    <Text style={styles.promoDesc}>Áp dụng cho khách hàng mới mở ví điện tử V-Life.</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                </BlurView>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Đã có lỗi xảy ra. Không tìm thấy thông tin ví.</Text>
            </View>
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
    padding: 24,
    gap: 12,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  retryBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  walletCardWrapper: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  walletCard: {
    padding: 22,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    gap: 4,
  },
  cardName: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  walletNumber: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  balanceSection: {
    marginBottom: 24,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 16,
  },
  statusCol: {
    flex: 1,
    gap: 2,
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '600',
  },
  statusValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  actionIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  promoBanner: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  promoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTextWrap: {
    flex: 1,
    gap: 2,
  },
  promoTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  promoDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    lineHeight: 16,
  },
});
