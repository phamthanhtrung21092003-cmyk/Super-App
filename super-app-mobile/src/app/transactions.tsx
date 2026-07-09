import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Platform,
  ActivityIndicator,
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
import { Transaction } from '../modules/transaction/types';

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

export default function TransactionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { transactions, transactionsLoading, refreshTransactions, accentHex } = useUser();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const currentBg = theme.backgroundImage || DEFAULT_BACKGROUND;

  useEffect(() => {
    refreshTransactions();
  }, []);

  const formatVND = (valueStr: string | number) => {
    const val = parseFloat(String(valueStr)) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getTransactionInfo = (tx: Transaction) => {
    let title = 'Giao dịch';
    let icon = 'receipt-outline';
    let color = '#FFF';

    switch (tx.type) {
      case 'TOP_UP':
        title = 'Nạp tiền ví V-Life';
        icon = 'card-outline';
        color = '#10B981';
        break;
      case 'WITHDRAW':
        title = 'Rút tiền ngân hàng';
        icon = 'cash-outline';
        color = '#EF4444';
        break;
      case 'RIDE_PAYMENT':
        title = 'Thanh toán V-Ride';
        icon = 'car-outline';
        color = '#3B82F6';
        break;
      case 'FOOD_PAYMENT':
        title = 'Thanh toán V-Food';
        icon = 'restaurant-outline';
        color = '#F97316';
        break;
      case 'SHOP_PAYMENT':
        title = 'Thanh toán V-Shop';
        icon = 'cart-outline';
        color = '#A855F7';
        break;
      case 'DELIVERY_PAYMENT':
        title = 'Thanh toán Giao hàng';
        icon = 'cube-outline';
        color = '#06B6D4';
        break;
      case 'REWARD':
        title = 'Thưởng hoàn tiền';
        icon = 'gift-outline';
        color = '#F59E0B';
        break;
      case 'TRANSFER':
        title = 'Chuyển tiền';
        icon = 'swap-horizontal-outline';
        color = '#E11D48';
        break;
      default:
        if (tx.description) {
          title = tx.description;
        }
        break;
    }

    return { title, icon, color };
  };

  const getStatusBadge = (status: string) => {
    let text = 'Đang xử lý';
    let bgColor = 'rgba(245, 158, 11, 0.15)';
    let textColor = '#F59E0B';

    if (status === 'SUCCESS') {
      text = 'Thành công';
      bgColor = 'rgba(16, 185, 129, 0.15)';
      textColor = '#10B981';
    } else if (status === 'FAILED') {
      text = 'Thất bại';
      bgColor = 'rgba(239, 68, 68, 0.15)';
      textColor = '#EF4444';
    } else if (status === 'CANCELLED') {
      text = 'Đã hủy';
      bgColor = 'rgba(255, 255, 255, 0.1)';
      textColor = 'rgba(255, 255, 255, 0.4)';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.statusText, { color: textColor }]}>{text}</Text>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Transaction; index: number }) => {
    const info = getTransactionInfo(item);
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });

    const isCredit = item.direction === 'CREDIT';

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <BlurView intensity={10} tint="dark" style={styles.itemCard}>
          <View style={styles.cardLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: `${info.color}15` }]}>
              <Ionicons name={info.icon as any} size={22} color={info.color} />
            </View>
            <View style={styles.textWrapper}>
              <Text style={[styles.itemTitle, { fontFamily: theme.fontFamily }]} numberOfLines={1}>
                {info.title}
              </Text>
              <Text style={styles.itemTime}>{formattedDate}</Text>
            </View>
          </View>
          
          <View style={styles.cardRight}>
            <Text style={[
              styles.itemAmount,
              { color: isCredit ? '#10B981' : '#FFF' }
            ]}>
              {isCredit ? '+' : '-'}{formatVND(item.amount)}
            </Text>
            {getStatusBadge(item.status)}
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <ImageBackground source={{ uri: currentBg }} style={styles.backgroundImage} resizeMode="cover">
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']} style={styles.darkOverlay} />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          {/* ══════════ TOP BAR ══════════ */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={[styles.topTitle, { fontFamily: theme.fontFamily }]}>Lịch sử giao dịch</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* ══════════ TRANSACTION LIST ══════════ */}
          {transactionsLoading && transactions.length === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator color={accentHex} size="large" />
              <Text style={[styles.loadingText, { fontFamily: theme.fontFamily }]}>Đang kết nối sổ cái...</Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={transactionsLoading}
                  onRefresh={refreshTransactions}
                  tintColor={accentHex}
                  colors={[accentHex]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <BlurView intensity={15} tint="dark" style={styles.emptyIconWrap}>
                    <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.2)" />
                  </BlurView>
                  <Text style={[styles.emptyText, { fontFamily: theme.fontFamily }]}>
                    Chưa có giao dịch nào được thực hiện
                  </Text>
                  <Text style={styles.emptySubText}>
                    Mọi biến động số dư ví của bạn sẽ được lưu trữ an toàn tại đây.
                  </Text>
                </View>
              }
            />
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  itemTime: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '600',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
