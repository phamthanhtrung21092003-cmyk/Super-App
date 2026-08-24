import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const QUICK_ACTIONS = [
  { id: '1', name: 'Tạo đơn', icon: 'receipt-outline', color: '#3B82F6' },
  { id: '2', name: 'Quản lý kho', icon: 'cube-outline', color: '#10B981' },
  { id: '3', name: 'Khách hàng', icon: 'people-outline', color: '#8B5CF6' },
  { id: '4', name: 'Báo cáo', icon: 'bar-chart-outline', color: '#F59E0B' },
];

const RECENT_TRANSACTIONS = [
  { id: 't1', title: 'Thanh toán đơn hàng #1029', time: '10 phút trước', amount: '+ 450.000đ', type: 'in' },
  { id: 't2', title: 'Phí vận chuyển AhaMove', time: '1 giờ trước', amount: '- 35.000đ', type: 'out' },
  { id: 't3', title: 'Thanh toán đơn hàng #1028', time: '2 giờ trước', amount: '+ 1.250.000đ', type: 'in' },
  { id: 't4', title: 'Nạp tiền quảng cáo', time: 'Hôm qua', amount: '- 500.000đ', type: 'out' },
];

export default function BusinessScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>Doanh nghiệp</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Revenue Card */}
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.revenueCard}
          >
            <View style={styles.revenueHeader}>
              <Text style={[styles.revenueLabel, { fontFamily: theme.fontFamily }]}>Tổng doanh thu tháng này</Text>
              <TouchableOpacity style={styles.eyeBtn}>
                <Ionicons name="eye-outline" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.revenueAmount, { fontFamily: theme.fontFamily }]}>145.500.000 ₫</Text>
            <View style={styles.revenueGrowth}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text style={[styles.growthText, { fontFamily: theme.fontFamily }]}>+12.5% so với tháng trước</Text>
            </View>
            
            <TouchableOpacity style={[styles.withdrawBtn, { backgroundColor: theme.accentHex }]}>
              <Text style={[styles.withdrawBtnText, { fontFamily: theme.fontFamily }]}>Rút tiền về tài khoản</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Quick Actions */}
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity key={action.id} style={styles.actionItem} onPress={() => window.alert(`Đang mở: ${action.name}`)}>
                <View style={[styles.actionIconWrap, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={[styles.actionText, { fontFamily: theme.fontFamily }]}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={[styles.statLabel, { fontFamily: theme.fontFamily }]}>Đơn hàng mới</Text>
              <Text style={[styles.statValue, { fontFamily: theme.fontFamily }]}>128</Text>
              <Text style={[styles.statSub, { fontFamily: theme.fontFamily, color: '#10B981' }]}>+12 hôm nay</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statLabel, { fontFamily: theme.fontFamily }]}>Lượt truy cập</Text>
              <Text style={[styles.statValue, { fontFamily: theme.fontFamily }]}>2.4K</Text>
              <Text style={[styles.statSub, { fontFamily: theme.fontFamily, color: '#3B82F6' }]}>+5% tuần này</Text>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily }]}>Giao dịch gần đây</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { fontFamily: theme.fontFamily, color: theme.accentHex }]}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.transactionList}>
              {RECENT_TRANSACTIONS.map(tx => (
                <View key={tx.id} style={styles.txItem}>
                  <View style={[styles.txIconWrap, { backgroundColor: tx.type === 'in' ? '#10B98120' : '#EF444420' }]}>
                    <Ionicons 
                      name={tx.type === 'in' ? 'arrow-down' : 'arrow-up'} 
                      size={20} 
                      color={tx.type === 'in' ? '#10B981' : '#EF4444'} 
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txTitle, { fontFamily: theme.fontFamily }]}>{tx.title}</Text>
                    <Text style={[styles.txTime, { fontFamily: theme.fontFamily }]}>{tx.time}</Text>
                  </View>
                  <Text style={[
                    styles.txAmount, 
                    { fontFamily: theme.fontFamily, color: tx.type === 'in' ? '#10B981' : '#EF4444' }
                  ]}>
                    {tx.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#111827',
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
    maxWidth: 390,       
    maxHeight: 844,
    aspectRatio: 390 / 844, 
    borderWidth: 12,     
    borderColor: '#000000',
    borderRadius: 44,    
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  revenueCard: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  revenueLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  eyeBtn: {
    padding: 4,
  },
  revenueAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  revenueGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  growthText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  withdrawBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  withdrawBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  actionItem: {
    width: '25%',
    alignItems: 'center',
    padding: 8,
  },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 8,
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionList: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  txTime: {
    color: '#94A3B8',
    fontSize: 12,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  }
});
