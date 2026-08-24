import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Modal,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ImageBackground } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useWalletSecurity } from '../context/WalletSecurityContext';
import { DeviceBlockModal } from '../components/wallet/DeviceBlockModal';
import { NetworkOfflineModal } from '../components/wallet/NetworkOfflineModal';
import { WalletAuthModal } from '../components/wallet/WalletAuthModal';
import { TransactionAuthModal } from '../components/wallet/TransactionAuthModal';
import { WalletActivationWizard } from '../components/wallet/activation/WalletActivationWizard';

const MAIN_ACTIONS = [
  { id: 'topup', title: 'Nạp tiền', icon: 'download-outline', color: '#3B82F6' },
  { id: 'withdraw', title: 'Rút tiền', icon: 'push-outline', color: '#8B5CF6' },
  { id: 'transfer', title: 'Chuyển tiền', icon: 'swap-horizontal-outline', color: '#F59E0B' },
  { id: 'scan', title: 'Quét mã', icon: 'qr-code-outline', color: '#10B981' },
];

const UTILITIES = [
  { id: 'mobile', title: 'Nạp ĐT', icon: 'phone-portrait-outline', color: '#D8C690' },
  { id: 'internet', title: 'Internet', icon: 'globe-outline', color: '#3B82F6' },
  { id: 'electric', title: 'Tiền Điện', icon: 'flash-outline', color: '#D8C690' },
  { id: 'water', title: 'Tiền Nước', icon: 'water-outline', color: '#3B82F6' },
  { id: 'data', title: 'Data 3G/4G', icon: 'cellular-outline', color: '#3B82F6' },
  { id: 'tv', title: 'Truyền hình', icon: 'tv-outline', color: '#EC4899' },
  { id: 'apartment', title: 'Chung cư', icon: 'business-outline', color: '#14B8A6' },
  { id: 'school', title: 'Học phí', icon: 'school-outline', color: '#10B981' },
];

const TRAVEL = [
  { id: 'taxi', title: 'Gọi Taxi', icon: 'car-outline', color: '#EAB308' },
  { id: 'flight', title: 'Vé máy bay', icon: 'airplane-outline', color: '#3B82F6' },
  { id: 'train', title: 'Vé tàu hỏa', icon: 'train-outline', color: '#EF4444' },
  { id: 'bus', title: 'Vé xe khách', icon: 'bus-outline', color: '#10B981' },
  { id: 'movie', title: 'Vé xem phim', icon: 'film-outline', color: '#8B5CF6' },
  { id: 'hotel', title: 'Đặt phòng', icon: 'bed-outline', color: '#EC4899' },
  { id: 'food', title: 'Giao đồ ăn', icon: 'fast-food-outline', color: '#F59E0B' },
  { id: 'vetc', title: 'VETC/ePass', icon: 'barcode-outline', color: '#14B8A6' },
];

const PROMOS = [
  { id: '1', title: 'Gửi Tiết Kiệm', desc: 'Lãi suất tới 8.5%/năm', icon: 'trending-up', color: '#F59E0B', bg: '#FFFBEB' },
  { id: '2', title: 'Hoàn Tiền Đăng Ký', desc: 'Giảm 50% tiền điện', icon: 'flash', color: '#10B981', bg: '#ECFDF5' },
  { id: '3', title: 'Mở Ví Trả Sau', desc: 'Miễn lãi 45 ngày', icon: 'wallet', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: '4', title: 'Du Lịch Hè', desc: 'Giảm 2M vé máy bay', icon: 'airplane', color: '#3B82F6', bg: '#EFF6FF' },
];

const ALL_BANKS = [
  { id: '1', name: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại thương VN', color: '#10B981', logo: require('../../assets/banks/vcb.png') },
  { id: '2', name: 'MB Bank', fullName: 'Ngân hàng TMCP Quân đội', color: '#3B82F6', logo: require('../../assets/banks/mb.png') },
  { id: '3', name: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương VN', color: '#EF4444', logo: require('../../assets/banks/tcb.png') },
  { id: '4', name: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển VN', color: '#1D4ED8', logo: require('../../assets/banks/bidv.png') },
  { id: '5', name: 'Agribank', fullName: 'Ngân hàng NN&PTNT VN', color: '#B91C1C', logo: require('../../assets/banks/vba.png') },
  { id: '6', name: 'VietinBank', fullName: 'Ngân hàng TMCP Công thương VN', color: '#2563EB', logo: require('../../assets/banks/ctg.png') },
  { id: '7', name: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', color: '#059669', logo: require('../../assets/banks/vpb.png') },
  { id: '8', name: 'Sacombank', fullName: 'Ngân hàng TMCP Sài Gòn Thương Tín', color: '#2563EB', logo: require('../../assets/banks/stb.png') },
  { id: '9', name: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong', color: '#8B5CF6', logo: require('../../assets/banks/tpb.png') },
  { id: '10', name: 'ACB', fullName: 'Ngân hàng TMCP Á Châu', color: '#1E3A8A', logo: require('../../assets/banks/acb.png') },
];

const getUserTier = (balance: number) => {
  if (balance >= 5000000000) { // 5 Tỷ
    return {
      id: 'black',
      name: 'Đen Quyền Lực',
      icon: 'star',
      headerColors: ['#000000', '#111827', '#1F2937'],
      cardColors: ['rgba(31,41,55,0.9)', 'rgba(0,0,0,0.8)'],
      borderColor: '#F59E0B',
      tierIconColor: '#FBBF24',
      tierTextColor: '#FBBF24',
      balanceColor: '#FDE68A',
      secondaryTextColor: '#D1D5DB',
      mainBg: '#000000',
      sectionBg: 'rgba(24, 24, 27, 0.4)',
      textColor: '#FFFFFF',
      subTextColor: '#A1A1AA',
      iconBoxBg: 'rgba(245, 158, 11, 0.15)',
      isDark: true
    };
  } else if (balance >= 1000000000) { // 1 Tỷ - DIAMOND REPLICA
    return {
      id: 'diamond',
      name: 'Hạng Kim Cương',
      icon: 'diamond',
      headerColors: ['#02163B', '#02163B', '#02163B'],
      cardColors: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)'],
      borderColor: '#D8C690', // Muted Gold
      tierIconColor: '#D8C690',
      tierTextColor: '#D8C690',
      balanceColor: '#FFFFFF',
      secondaryTextColor: 'rgba(255,255,255,0.8)',
      mainBg: '#02163B', // Set to header color so status bar matches
      sectionBg: 'rgba(255, 255, 255, 0.1)',
      textColor: '#111827',
      subTextColor: '#4B5563',
      iconBoxBg: 'rgba(255, 255, 255, 0.1)',
      isDark: false, // Make false so the bottom doesn't use dark text
      isDiamondMockup: true
    };
  } else if (balance >= 200000000) { // 200 Triệu
    return {
      id: 'gold',
      name: 'Hạng Vàng',
      icon: 'star',
      headerColors: ['#B45309', '#D97706', '#F59E0B'],
      cardColors: ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)'],
      borderColor: 'rgba(255,255,255,0.4)',
      tierIconColor: '#FEF3C7',
      tierTextColor: '#FFFFFF',
      balanceColor: '#FFFFFF',
      secondaryTextColor: 'rgba(255,255,255,0.9)',
      mainBg: '#FFFBEB',
      sectionBg: '#FFFFFF',
      textColor: '#1F2937',
      subTextColor: '#6B7280',
      iconBoxBg: 'rgba(245, 158, 11, 0.1)',
      isDark: false
    };
  } else if (balance >= 50000000) { // 50 Triệu
    return {
      id: 'silver',
      name: 'Hạng Bạc',
      icon: 'medal',
      headerColors: ['#4B5563', '#6B7280', '#9CA3AF'],
      cardColors: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)'],
      borderColor: 'rgba(255,255,255,0.3)',
      tierIconColor: '#E5E7EB',
      tierTextColor: '#FFFFFF',
      balanceColor: '#FFFFFF',
      secondaryTextColor: 'rgba(255,255,255,0.8)',
      mainBg: '#F8FAFC',
      sectionBg: '#FFFFFF',
      textColor: '#1E293B',
      subTextColor: '#64748B',
      iconBoxBg: 'rgba(100, 116, 139, 0.1)',
      isDark: false
    };
  } else {
    return {
      id: 'standard',
      name: 'Tiêu Chuẩn',
      icon: 'leaf',
      headerColors: ['#1E3A8A', '#2563EB', '#3B82F6'],
      cardColors: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'],
      borderColor: 'rgba(255,255,255,0.2)',
      tierIconColor: '#60A5FA',
      tierTextColor: '#FFFFFF',
      balanceColor: '#FFFFFF',
      secondaryTextColor: 'rgba(255,255,255,0.8)',
      mainBg: '#F3F4F6',
      sectionBg: '#FFFFFF',
      textColor: '#111827',
      subTextColor: '#4B5563',
      iconBoxBg: 'rgba(59, 130, 246, 0.1)',
      isDark: false
    };
  }
};

export default function WalletScreen() {
  const { walletBalance, paymentTransactions, transactions, addTransaction, linkedBanks, addLinkedBank, hasWallet, setHasWallet, activateWalletProfile } = useUser();
  const {
    isDeviceSecure,
    isNetworkConnected,
    isWalletLocked,
    isBalanceMasked,
    toggleBalanceMask,
    lockWallet,
  } = useWalletSecurity();

  const [isActivationWizardVisible, setIsActivationWizardVisible] = useState(false);

  const handleActivationComplete = () => {
    activateWalletProfile({
      status: 'ACTIVE',
      level: 'Level 1',
      currency: 'VND',
    });
    setIsActivationWizardVisible(false);
    lockWallet();
  };

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [modalType, setModalType] = useState<'topup' | 'withdraw' | 'transfer' | 'bill' | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [extraInput, setExtraInput] = useState(''); // Used for Bank Account or Bill Code
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isSelectingBank, setIsSelectingBank] = useState(false);
  
  // States for Add Bank
  const [isAddBankModalVisible, setIsAddBankModalVisible] = useState(false);
  const [searchBankQuery, setSearchBankQuery] = useState('');
  const [selectedBankToLink, setSelectedBankToLink] = useState<any>(null);
  const [newBankAccount, setNewBankAccount] = useState('');

  // Transaction Auth States
  const [txAuthVisible, setTxAuthVisible] = useState(false);
  const [txAuthData, setTxAuthData] = useState<{ title: string; amount?: number; recipient?: string; actionType: 'submit' | 'add_bank' } | null>(null);

  // Auto lock wallet on screen entry to ALWAYS enforce 2nd layer security prompt (PIN 6 số)
  useEffect(() => {
    lockWallet();
  }, []);

  // Auto select default bank if available
  useEffect(() => {
    if (!selectedBank && linkedBanks.length > 0) {
      setSelectedBank(linkedBanks[0]);
    }
  }, [linkedBanks]);
  
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const handleAction = (id: string) => {
    if (id === 'topup' || id === 'withdraw' || id === 'transfer') {
      setModalType(id as any);
      setAmountInput('');
      setExtraInput('');
      setIsSelectingBank(false);
    } else if (id === 'electric' || id === 'water' || id === 'internet') {
      setModalType('bill');
      setAmountInput('');
      setExtraInput('');
      setIsSelectingBank(false);
    } else if (id === 'linkbank') {
      setIsAddBankModalVisible(true);
    } else {
      Alert.alert('Thông báo', 'Tính năng đang được bảo trì hoặc cập nhật!');
    }
  };

  const handleAddBank = () => {
    if (!selectedBankToLink || !newBankAccount.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin thẻ');
      return;
    }
    // Trigger Security Transaction Auth Modal
    setTxAuthData({
      title: `Thêm liên kết ${selectedBankToLink.name}`,
      recipient: `STK: ${newBankAccount}`,
      actionType: 'add_bank',
    });
    setTxAuthVisible(true);
  };

  const submitTransaction = () => {
    const amount = parseInt(amountInput.replace(/[^0-9]/g, ''), 10);
    
    if (modalType === 'topup' || modalType === 'withdraw') {
      if (!selectedBank) {
        Alert.alert('Lỗi', 'Vui lòng chọn nguồn tiền!');
        return;
      }
      if (!amount || amount <= 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
        return;
      }
      if (modalType === 'withdraw' && amount > walletBalance) {
        Alert.alert('Lỗi', 'Số dư không đủ để rút tiền');
        return;
      }
    } else if (modalType === 'transfer' || modalType === 'bill') {
      if (!extraInput.trim() || !amount || amount <= 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập thông tin đầy đủ');
        return;
      }
      if (amount > walletBalance) {
        Alert.alert('Lỗi', 'Số dư không đủ để thực hiện');
        return;
      }
    }

    // Trigger Security Transaction Auth Modal
    const title = modalType === 'topup' ? 'Nạp tiền vào ví' : modalType === 'withdraw' ? 'Rút tiền về thẻ' : modalType === 'transfer' ? 'Chuyển tiền' : 'Thanh toán hóa đơn';
    setTxAuthData({
      title,
      amount,
      recipient: extraInput ? `Đến: ${extraInput}` : selectedBank ? `${selectedBank.name}` : undefined,
      actionType: 'submit',
    });
    setTxAuthVisible(true);
  };

  const executeConfirmedTransaction = (signaturePkg: any) => {
    setTxAuthVisible(false);
    
    if (txAuthData?.actionType === 'add_bank') {
      addLinkedBank(selectedBankToLink.name, newBankAccount, selectedBankToLink.color, selectedBankToLink.icon);
      setSelectedBankToLink(null);
      setNewBankAccount('');
      setSearchBankQuery('');
      setIsAddBankModalVisible(false);
      Alert.alert('Thành công', `Đã liên kết thành công thẻ ${selectedBankToLink.name}`);
      return;
    }

    const amount = parseInt(amountInput.replace(/[^0-9]/g, ''), 10);
    if (modalType === 'topup') {
      addTransaction(amount, 'in', 'Nạp tiền vào ví', `Từ ${selectedBank.name} ${selectedBank.account}`, 'download-outline', '#D1FAE5', '#10B981');
      Alert.alert('Thành công', `Đã nạp ${amount.toLocaleString('vi-VN')}đ từ ${selectedBank.name}`);
    } else if (modalType === 'withdraw') {
      addTransaction(amount, 'out', 'Rút tiền về thẻ', `Về ${selectedBank.name} ${selectedBank.account}`, 'push-outline', '#FEE2E2', '#EF4444');
      Alert.alert('Thành công', `Đã rút ${amount.toLocaleString('vi-VN')}đ về ${selectedBank.name}`);
    } else if (modalType === 'transfer') {
      addTransaction(amount, 'out', 'Chuyển tiền', `Đến số ${extraInput}`, 'swap-horizontal-outline', '#FEF3C7', '#F59E0B');
      Alert.alert('Thành công', `Đã chuyển ${amount.toLocaleString('vi-VN')}đ đến ${extraInput}`);
    } else if (modalType === 'bill') {
      addTransaction(amount, 'out', 'Thanh toán hóa đơn', `Mã KH: ${extraInput}`, 'receipt-outline', '#E0F2FE', '#0EA5E9');
      Alert.alert('Thành công', `Đã thanh toán hóa đơn thành công`);
    }

    setModalType(null);
    setAmountInput('');
    setExtraInput('');
  };

  const currentTier = getUserTier(walletBalance);

  // Animations
  const glowScale = useSharedValue(1);
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (currentTier.id === 'diamond') {
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      floatY.value = 0;
    } else if (currentTier.id === 'black') {
      floatY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowScale.value = 1;
    } else {
      glowScale.value = 1;
      floatY.value = 0;
    }
  }, [currentTier.id]);

  const animatedCardStyle = useAnimatedStyle(() => {
    if (currentTier.id === 'diamond') {
      return { transform: [{ scale: glowScale.value }] };
    } else if (currentTier.id === 'black') {
      return { transform: [{ translateY: floatY.value }] };
    }
    return { transform: [] };
  });

  return (
    <View style={[styles.webWrapper, { backgroundColor: currentTier.mainBg }]}>
      {/* Background Orbs for Premium Tiers (excluding Diamond Mockup) */}
      {currentTier.isDark && !currentTier.isDiamondMockup && (
        <View style={StyleSheet.absoluteFill}>
          <View style={{position: 'absolute', top: -50, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: currentTier.id === 'black' ? '#F59E0B' : '#4F46E5', opacity: 0.3}} />
          <View style={{position: 'absolute', top: 250, right: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: currentTier.id === 'black' ? '#B45309' : '#7C3AED', opacity: 0.25}} />
          <View style={{position: 'absolute', bottom: 100, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: currentTier.id === 'black' ? '#FCD34D' : '#38BDF8', opacity: 0.2}} />
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        </View>
      )}

      {currentTier.isDiamondMockup && (
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient colors={['#051024', '#1a2a42']} start={{x: 0, y: 0}} end={{x: 0, y: 1}} style={{ flex: 1 }} />
        </View>
      )}

      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame, { backgroundColor: 'transparent' }]}>
        <StatusBar barStyle={currentTier.isDiamondMockup ? "light-content" : "light-content"} backgroundColor="transparent" translucent={true} />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, currentTier.isDiamondMockup && { paddingBottom: 150 }]}>
          
          {/* HEADER & VIRTUAL CARD */}
          <View style={[styles.headerBackground, currentTier.isDiamondMockup && { backgroundColor: 'transparent', borderBottomLeftRadius: 35, borderBottomRightRadius: 35, paddingBottom: 130 }]}>
            {!currentTier.isDiamondMockup && (
              <LinearGradient
                colors={currentTier.headerColors as any}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={[styles.headerTop, currentTier.isDiamondMockup && { paddingTop: Platform.OS === 'ios' ? 50 : 40 }]}>
              <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color="#FFF" />
              </TouchableOpacity>
              
              <View style={[styles.headerSearch, currentTier.isDiamondMockup && { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 24, paddingVertical: 8 }]}>
                <Ionicons name="search" size={20} color={currentTier.isDiamondMockup ? "#D1D5DB" : "#9CA3AF"} />
                <Text style={[styles.headerSearchPlaceholder, currentTier.isDiamondMockup && { color: '#E5E7EB' }]}>Tìm kiếm dịch vụ...</Text>
              </View>
              
              <TouchableOpacity style={styles.bellButton}>
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
                <View style={styles.bellBadge} />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.bellButton, { marginLeft: 8 }]} onPress={lockWallet}>
                <Ionicons name="lock-closed-outline" size={22} color="#D8C690" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.bellButton, { marginLeft: 8 }]} onPress={() => { setHasWallet(false); setIsActivationWizardVisible(true); }}>
                <Ionicons name="person-add-outline" size={22} color="#10B981" />
              </TouchableOpacity>
            </View>

            {/* VIRTUAL CARD */}
            {currentTier.id !== 'standard' && (
              <Animated.View style={[animatedCardStyle, { zIndex: 10 }]}>
                {currentTier.isDiamondMockup ? (
                  <LinearGradient
                    colors={['#1c2b3d', '#0a111a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.virtualCard, { padding: 0, overflow: 'visible', borderWidth: 1, borderColor: '#d4af37', shadowColor: '#d4af37', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.15, shadowRadius: 30, elevation: 10, borderRadius: 20 }]}
                  >
                    <View style={{ flex: 1, padding: 24, borderRadius: 20, overflow: 'hidden' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
                        <Text style={{ color: '#d4af37', fontWeight: '600', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>💎 Hạng Kim Cương</Text>
                        <TouchableOpacity style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(212, 175, 55, 0.5)', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }} onPress={() => handleAction('scan')}>
                          <Text style={{ color: '#d4af37', fontSize: 12 }}>🔳 Mã QR</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={{ marginBottom: 5 }}>
                        <Text style={{ color: '#a0aec0', fontSize: 14 }}>Số dư ví</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                          <Text style={{ color: '#ffffff', fontSize: 40, fontWeight: 'bold', textShadowColor: 'rgba(255, 255, 255, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 }}>
                            {isBalanceMasked ? '************' : walletBalance.toLocaleString('vi-VN')}
                          </Text>
                          {!isBalanceMasked && <Text style={{ color: '#a0aec0', fontSize: 24, marginLeft: 4 }}>đ</Text>}
                        </View>
                        <TouchableOpacity onPress={toggleBalanceMask} style={{ padding: 4 }}>
                          <Ionicons name={isBalanceMasked ? 'eye-off-outline' : 'eye-outline'} size={24} color="#a0aec0" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)', paddingTop: 15 }}>
                        <Text style={{ color: '#e2e8f0', fontSize: 13 }}>⭐ Điểm thưởng: <Text style={{ color: '#d4af37', fontWeight: 'bold' }}>2.450 VPoint</Text></Text>
                        <TouchableOpacity>
                          <Text style={{ color: '#a0aec0', fontSize: 13 }}>Quản lý thẻ {'>'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                ) : (
                  <BlurView intensity={currentTier.isDark ? 50 : 0} tint={currentTier.isDark ? "dark" : "light"} style={[styles.virtualCard, { borderColor: currentTier.borderColor, overflow: 'hidden', padding: 0 }, currentTier.id === 'black' && styles.blackGlow]}>
                    <LinearGradient
                    colors={currentTier.cardColors as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 20, width: '100%' }}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.tierBadge, currentTier.id === 'black' && { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                          <Ionicons name={currentTier.icon as any} size={12} color={currentTier.tierIconColor} />
                          <Text style={[styles.tierText, { color: currentTier.tierTextColor }]}>{currentTier.name}</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                        <Ionicons name="wifi" size={20} color={currentTier.tierTextColor} style={{transform: [{rotate: '90deg'}], opacity: 0.8}} />
                        <Ionicons name="card" size={24} color={currentTier.tierTextColor} style={{opacity: 0.8}} />
                      </View>
                    </View>
                    
                    <View style={styles.cardBalanceRow}>
                      <View>
                        <Text style={[styles.balanceLabelCard, { color: currentTier.secondaryTextColor }]}>Số dư ví</Text>
                        <View style={styles.balanceValueContainer}>
                          <Text style={[styles.balanceValueCard, { color: currentTier.balanceColor }]}>
                            {isBalanceMasked ? '************' : walletBalance.toLocaleString('vi-VN')}
                          </Text>
                          {!isBalanceMasked && <Text style={[styles.balanceCurrencyCard, { color: currentTier.balanceColor }]}>đ</Text>}
                        </View>
                      </View>
                      <TouchableOpacity onPress={toggleBalanceMask} style={styles.eyeBtn}>
                        <Ionicons name={isBalanceMasked ? 'eye-off-outline' : 'eye-outline'} size={24} color={currentTier.balanceColor} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.cardFooter, { borderTopColor: currentTier.id === 'black' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.15)' }]}>
                      <Text style={[styles.pointText, { color: currentTier.secondaryTextColor }]}>🌟 Điểm thưởng: <Text style={{fontWeight: '800', color: currentTier.tierIconColor}}>2.450 VPoint</Text></Text>
                      <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[styles.linkBankText, { color: currentTier.tierTextColor }]}>Quản lý thẻ</Text>
                        <Ionicons name="chevron-forward" size={14} color={currentTier.tierTextColor} />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </BlurView>
              )}
            </Animated.View>
          )}
          </View>

          {/* MAIN ACTIONS - GLASSMORPHISM / DIAMOND METALLIC */}
          {currentTier.isDiamondMockup ? (
            <LinearGradient colors={['#2A3241', '#1C2433']} style={[styles.floatingCard, { marginTop: -110, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.4, shadowRadius: 20, paddingTop: 20, paddingBottom: 20 }]}>
              {MAIN_ACTIONS.map(action => (
                <TouchableOpacity key={action.id} style={styles.mainActionItem} activeOpacity={0.7} onPress={() => handleAction(action.id)}>
                  <View style={[styles.mainActionIconBox, { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(216,198,144,0.4)', borderRadius: 30, width: 52, height: 52, shadowColor: '#FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 8, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name={action.icon as any} size={24} color="#D8C690" />
                  </View>
                  <Text style={[styles.mainActionText, { color: '#E2E8F0', marginTop: 10, fontSize: 12, fontWeight: '400' }]}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </LinearGradient>
          ) : (
            <BlurView intensity={currentTier.isDark ? 60 : 100} tint={currentTier.isDark ? "dark" : "light"} style={[styles.floatingCard, { backgroundColor: currentTier.sectionBg, borderColor: currentTier.isDark ? 'rgba(255,255,255,0.15)' : 'transparent', borderWidth: currentTier.isDark ? 1 : 0, overflow: 'hidden' }]}>
              {MAIN_ACTIONS.map(action => (
                <TouchableOpacity key={action.id} style={styles.mainActionItem} activeOpacity={0.7} onPress={() => handleAction(action.id)}>
                  <View style={[styles.mainActionIconBox, { backgroundColor: currentTier.isDark ? action.color + '25' : action.color + '15', borderWidth: currentTier.isDark ? 1 : 0, borderColor: currentTier.isDark ? action.color + '40' : 'transparent' }]}>
                    <Ionicons name={action.icon as any} size={26} color={action.color} />
                  </View>
                  <Text style={[styles.mainActionText, { color: currentTier.textColor }]}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          )}

          {/* TÀI CHÍNH CÁ NHÂN */}
          <View style={styles.financeOverview}>
            {currentTier.isDiamondMockup ? (
              <>
                <LinearGradient colors={['#0F2040', '#050B14']} style={[styles.financeCard, { borderColor: '#D8C690', borderWidth: 1, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width: 0, height: 5} }]}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                    <Ionicons name="trending-up" size={18} color="#D8C690" />
                    <Text style={[styles.financeCardTitle, { color: '#FFF', fontSize: 13, marginLeft: 6 }]}>Túi Thần Tài</Text>
                  </View>
                  <Text style={[styles.financeCardValue, { color: '#D8C690', fontSize: 17, textShadowColor: 'rgba(216, 198, 144, 0.2)', textShadowRadius: 2, marginBottom: 4 }]}>15.000.000 đ</Text>
                  <Text style={[styles.financeCardDesc, { color: '#FFF', fontSize: 11 }]}>Lợi nhuận <Text style={{ color: '#D8C690' }}>+24.500đ</Text></Text>
                </LinearGradient>
                <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={[styles.financeCard, { borderColor: '#FFF', borderWidth: 1, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: {width: 0, height: 5} }]}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                    <Ionicons name="wallet-outline" size={18} color="#1E293B" />
                    <Text style={[styles.financeCardTitle, { color: '#1E293B', fontSize: 13, marginLeft: 6 }]}>Ví Trả Sau</Text>
                  </View>
                  <Text style={[styles.financeCardValue, { color: '#1E293B', fontSize: 17, marginBottom: 4 }]}>5.000.000 đ</Text>
                  <Text style={[styles.financeCardDesc, { color: '#64748B', fontSize: 11 }]}>Đã dùng 0đ</Text>
                </LinearGradient>
              </>
            ) : (
              <>
                <TouchableOpacity style={[styles.financeCard, { backgroundColor: currentTier.isDark ? 'rgba(253, 230, 138, 0.1)' : '#FFFBEB', borderColor: currentTier.isDark ? 'rgba(253, 230, 138, 0.3)' : '#FDE68A' }]} activeOpacity={0.8}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                    <Ionicons name="trending-up" size={20} color="#D97706" />
                    <Text style={styles.financeCardTitle}>Túi Thần Tài</Text>
                  </View>
                  <Text style={styles.financeCardValue}>15.000.000 đ</Text>
                  <Text style={styles.financeCardDesc}>Lợi nhuận +24.500đ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.financeCard, { backgroundColor: currentTier.isDark ? 'rgba(221, 214, 254, 0.1)' : '#F5F3FF', borderColor: currentTier.isDark ? 'rgba(221, 214, 254, 0.3)' : '#DDD6FE' }]} activeOpacity={0.8}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                    <Ionicons name="wallet-outline" size={20} color={currentTier.isDark ? '#A78BFA' : '#7C3AED'} />
                    <Text style={[styles.financeCardTitle, { color: currentTier.isDark ? '#C4B5FD' : '#6D28D9' }]}>Ví Trả Sau</Text>
                  </View>
                  <Text style={[styles.financeCardValue, { color: currentTier.isDark ? '#C4B5FD' : '#6D28D9' }]}>5.000.000 đ</Text>
                  <Text style={[styles.financeCardDesc, { color: currentTier.isDark ? '#A78BFA' : '#8B5CF6' }]}>Đã dùng 0đ</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* DỊCH VỤ TIỆN ÍCH */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleNoMargin, { color: currentTier.isDiamondMockup ? '#111827' : currentTier.textColor }]}>Thanh toán hóa đơn</Text>
            <TouchableOpacity><Text style={[styles.seeAllText, currentTier.isDiamondMockup && { color: '#1E3A8A' }]}>Xem tất cả {">"}</Text></TouchableOpacity>
          </View>
          {currentTier.isDiamondMockup ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20 }}>
              {UTILITIES.slice(0, 4).map(service => (
                <View key={service.id} style={{ alignItems: 'center', width: '22%' }}>
                  <LinearGradient colors={['#18202F', '#090D14']} style={{ width: '100%', aspectRatio: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 10 }}>
                    {/* Inner top highlight for glassmorphic button effect */}
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                    <Ionicons name={service.icon as any} size={28} color={service.color} style={{ opacity: 0.9 }} />
                  </LinearGradient>
                </View>
              ))}
            </View>
          ) : (
            <BlurView intensity={currentTier.isDark ? 40 : 100} tint={currentTier.isDark ? "dark" : "light"} style={[styles.whiteCard, { backgroundColor: currentTier.sectionBg, borderColor: currentTier.isDark ? 'rgba(255,255,255,0.1)' : 'transparent', borderWidth: currentTier.isDark ? 1 : 0, overflow: 'hidden' }]}>
              <View style={styles.featuresGrid}>
                {UTILITIES.map(service => (
                  <TouchableOpacity key={service.id} style={styles.featureItem} activeOpacity={0.6} onPress={() => handleAction(service.id)}>
                    <View style={[styles.featureIconBox, { backgroundColor: currentTier.isDark ? service.color + '20' : service.color + '15', borderWidth: currentTier.isDark ? 1 : 0, borderColor: currentTier.isDark ? service.color + '30' : 'transparent' }]}>
                      <Ionicons name={service.icon as any} size={24} color={service.color} />
                    </View>
                    <Text style={[styles.featureText, { color: currentTier.textColor }]}>{service.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          )}

          {/* DI CHUYỂN & GIẢI TRÍ */}
          <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
            <Text style={[styles.sectionTitleNoMargin, { color: currentTier.isDiamondMockup ? '#111827' : currentTier.textColor }]}>Di chuyển & Giải trí</Text>
            <TouchableOpacity><Text style={[styles.seeAllText, currentTier.isDiamondMockup && { color: '#1E3A8A' }]}>Mở rộng {">"}</Text></TouchableOpacity>
          </View>
          {currentTier.isDiamondMockup ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20 }}>
              {TRAVEL.map(service => (
                <View key={service.id} style={{ alignItems: 'center', width: '22%' }}>
                  <LinearGradient colors={['#1F2937', '#030712']} style={{ width: '100%', aspectRatio: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 }}>
                    <Ionicons name={service.icon as any} size={28} color="#D8C690" style={{ opacity: 0.9 }} />
                  </LinearGradient>
                </View>
              ))}
            </View>
          ) : (
            <BlurView intensity={currentTier.isDark ? 40 : 100} tint={currentTier.isDark ? "dark" : "light"} style={[styles.whiteCard, { backgroundColor: currentTier.sectionBg, borderColor: currentTier.isDark ? 'rgba(255,255,255,0.1)' : 'transparent', borderWidth: currentTier.isDark ? 1 : 0, overflow: 'hidden' }]}>
              <View style={styles.featuresGrid}>
                {TRAVEL.map(service => (
                  <TouchableOpacity key={service.id} style={styles.featureItem} activeOpacity={0.6} onPress={() => handleAction(service.id)}>
                    <View style={[styles.featureIconBox, { backgroundColor: currentTier.isDark ? service.color + '20' : service.color + '15', borderWidth: currentTier.isDark ? 1 : 0, borderColor: currentTier.isDark ? service.color + '30' : 'transparent' }]}>
                      <Ionicons name={service.icon as any} size={24} color={service.color} />
                    </View>
                    <Text style={[styles.featureText, { color: currentTier.textColor }]}>{service.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          )}

          {/* ===== BĂNG CHUYỀN KHUYẾN MÃI ===== */}
          <Text style={[styles.sectionTitleNoMargin, { marginLeft: 20, marginBottom: 15, marginTop: 5, color: currentTier.textColor }]}>Khám phá ưu đãi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {PROMOS.map(promo => (
              <TouchableOpacity 
                key={promo.id} 
                style={[styles.promoCard, { backgroundColor: currentTier.isDark ? 'rgba(255,255,255,0.05)' : promo.bg }]} 
                activeOpacity={0.8}
                onPress={() => promo.id === '1' ? router.push('/savings') : handleAction(promo.id)}
              >
                <View style={[styles.promoIconBox, { backgroundColor: currentTier.isDark ? promo.color + '30' : promo.color + '20' }]}>
                  <Ionicons name={promo.icon as any} size={24} color={promo.color} />
                </View>
                <Text style={[styles.promoTitle, { color: currentTier.textColor }]}>{promo.title}</Text>
                <Text style={[styles.promoDesc, { color: currentTier.subTextColor }]}>{promo.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ===== LỊCH SỬ GIAO DỊCH ===== */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleNoMargin, { color: currentTier.textColor }]}>Lịch sử giao dịch</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>Chi tiết</Text></TouchableOpacity>
          </View>
          
          <BlurView intensity={currentTier.isDark ? 40 : 100} tint={currentTier.isDark ? "dark" : "light"} style={[styles.whiteCard, { backgroundColor: currentTier.sectionBg, borderColor: currentTier.isDark ? 'rgba(255,255,255,0.1)' : 'transparent', borderWidth: currentTier.isDark ? 1 : 0, overflow: 'hidden' }]}>
            {(paymentTransactions && paymentTransactions.length > 0 ? paymentTransactions : transactions).slice(0, 5).map((tx: any, index: number) => {
              const isAmountString = typeof tx.amount === 'string';
              const isPositive = isAmountString ? tx.amount.startsWith('+') || tx.type === 'in' : tx.type === 'in';
              const displayAmount = isAmountString ? tx.amount : `${isPositive ? '+' : '-'}${Number(tx.amount || 0).toLocaleString('vi-VN')}đ`;
              
              return (
                <View key={tx.id} style={[styles.txRow, index !== Math.min(transactions.length, 5) - 1 && { borderBottomColor: currentTier.isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderBottomWidth: 1 }]}>
                  <View style={[styles.txIconBox, { backgroundColor: currentTier.isDark ? 'rgba(255,255,255,0.05)' : (tx.bg || 'rgba(59, 130, 246, 0.1)'), borderWidth: currentTier.isDark ? 1 : 0, borderColor: currentTier.isDark ? 'rgba(255,255,255,0.1)' : 'transparent' }]}>
                    <Ionicons name={(tx.icon as any) || 'receipt-outline'} size={22} color={currentTier.isDark ? '#E5E7EB' : (tx.color || '#3B82F6')} />
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={[styles.txTitle, { color: currentTier.textColor }]}>{tx.title || tx.description || 'Giao dịch'}</Text>
                    {tx.desc && <Text style={[styles.txDesc, { color: currentTier.subTextColor }]}>{tx.desc}</Text>}
                    <Text style={[styles.txDate, { color: currentTier.subTextColor }]}>{tx.date || 'Hôm nay'}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: isPositive ? '#10B981' : currentTier.textColor }]}>
                    {displayAmount}
                  </Text>
                </View>
              );
            })}
            {(paymentTransactions.length === 0 && transactions.length === 0) && (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Ionicons name="receipt-outline" size={48} color={currentTier.subTextColor} />
                <Text style={{ color: currentTier.subTextColor, marginTop: 10 }}>Chưa có giao dịch nào</Text>
              </View>
            )}
          </BlurView>

          <View style={{height: currentTier.isDiamondMockup ? 120 : 80}} />
        </ScrollView>
      </SafeAreaView>
      
      {/* MOCKUP BOTTOM TAB BAR FOR DIAMOND */}
      {currentTier.isDiamondMockup && (
        <LinearGradient 
          colors={['#E2E8F0', '#F8FAFC', '#CBD5E1']} 
          start={{x: 0, y: 0}} end={{x: 1, y: 0}}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 85, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 25, borderTopWidth: 1, borderTopColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 }}
        >
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <Ionicons name="diamond" size={24} color="#02163B" />
            <Text style={{ fontSize: 12, color: '#02163B', fontWeight: 'bold', marginTop: 4 }}>Hone-Diamond</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <Ionicons name="stats-chart-outline" size={24} color="#475569" />
            <Text style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Invest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <Ionicons name="swap-horizontal-outline" size={24} color="#475569" />
            <Text style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Payments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <Ionicons name="person-outline" size={24} color="#475569" />
            <Text style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Profile</Text>
          </TouchableOpacity>
          <Ionicons name="sparkles" size={40} color="#F8FAFC" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.8 }} />
          <Ionicons name="sparkles" size={20} color="#FFF" style={{ position: 'absolute', right: 30, bottom: 20, opacity: 0.9 }} />
        </LinearGradient>
      )}
      
      {/* MODAL NẠP / RÚT / CHUYỂN / THANH TOÁN */}
        <Modal
          visible={modalType !== null}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.actionModal}>
              <View style={styles.actionModalHeader}>
                <Text style={styles.actionModalTitle}>
                  {isSelectingBank ? 'Chọn Nguồn Tiền' 
                    : modalType === 'topup' ? 'Nạp tiền vào ví' 
                    : modalType === 'withdraw' ? 'Rút tiền về thẻ'
                    : modalType === 'transfer' ? 'Chuyển tiền'
                    : 'Thanh toán hóa đơn'}
                </Text>
                <TouchableOpacity onPress={() => isSelectingBank ? setIsSelectingBank(false) : setModalType(null)}>
                  <Ionicons name="close" size={26} color="#4B5563" />
                </TouchableOpacity>
              </View>
              
              {isSelectingBank ? (
                // --- CHỌN NGÂN HÀNG ---
                <ScrollView style={{ maxHeight: 350 }}>
                  {linkedBanks.map((bank) => (
                    <TouchableOpacity 
                      key={bank.id} 
                      style={[styles.bankSelectRow, selectedBank?.id === bank.id && styles.bankSelected]}
                      onPress={() => {
                        setSelectedBank(bank);
                        setIsSelectingBank(false);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.bankIconBox, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' }]}>
                          {bank.logo ? (
                            <Image source={bank.logo} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
                          ) : (
                            <Ionicons name={bank.icon as any} size={20} color={bank.color} />
                          )}
                        </View>
                        <View>
                          <Text style={styles.bankName}>{bank.name}</Text>
                          <Text style={styles.bankAccount}>{bank.account}</Text>
                        </View>
                      </View>
                      {selectedBank?.id === bank.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                      )}
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity style={styles.addBankBtn} onPress={() => { setIsSelectingBank(false); setModalType(null); setIsAddBankModalVisible(true); }}>
                    <Ionicons name="add-circle-outline" size={26} color="#6B7280" />
                    <Text style={styles.addBankText}>Thêm thẻ/tài khoản mới</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                // --- FORM NHẬP THÔNG TIN ---
                <>
                  {(modalType === 'topup' || modalType === 'withdraw') && (
                    <>
                      <Text style={styles.inputLabel}>{modalType === 'topup' ? 'Từ nguồn tiền' : 'Đến tài khoản'}</Text>
                      {selectedBank ? (
                        <TouchableOpacity style={[styles.fundingSourceBox, { paddingVertical: 16, paddingHorizontal: 12 }]} onPress={() => setIsSelectingBank(true)}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.bankIconBoxSmall, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', width: 40, height: 40, borderRadius: 20 }]}>
                              {selectedBank.logo ? (
                                <Image source={selectedBank.logo} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
                              ) : (
                                <Ionicons name={selectedBank.icon as any} size={20} color={selectedBank.color} />
                              )}
                            </View>
                            <View style={{ marginLeft: 12 }}>
                              <Text style={[styles.bankNameSmall, { fontSize: 15, marginBottom: 2 }]}>{selectedBank.name}</Text>
                              <Text style={[styles.bankAccountSmall, { fontSize: 13, color: '#6B7280' }]}>{selectedBank.account}</Text>
                              {modalType === 'topup' && <Text style={{ fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: '500' }}>Số dư khả dụng: 50.000.000đ</Text>}
                            </View>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.fundingSourceBox} onPress={() => setIsSelectingBank(true)}>
                          <Text style={{ color: '#EF4444', fontWeight: '600' }}>Chưa có thẻ nào. Vui lòng liên kết!</Text>
                          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  {modalType === 'transfer' && (
                    <>
                      <Text style={styles.inputLabel}>Chuyển đến SĐT / Tài khoản</Text>
                      <TextInput
                        style={styles.textInputStyle}
                        placeholder="Nhập SĐT hoặc STK ngân hàng"
                        value={extraInput}
                        onChangeText={setExtraInput}
                      />
                    </>
                  )}

                  {modalType === 'bill' && (
                    <>
                      <Text style={styles.inputLabel}>Mã khách hàng / Mã hợp đồng</Text>
                      <TextInput
                        style={styles.textInputStyle}
                        placeholder="VD: PE123456789"
                        value={extraInput}
                        onChangeText={setExtraInput}
                      />
                    </>
                  )}

                  {modalType === 'topup' ? (
                    <View style={{ marginTop: 15 }}>
                      <Text style={[styles.inputLabel, { marginBottom: 10 }]}>Số tiền nạp (VNĐ)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: amountInput ? '#3B82F6' : '#E5E7EB', paddingBottom: 5, marginBottom: 20 }}>
                        <Text style={{ fontSize: 32, fontWeight: 'bold', color: amountInput ? '#111827' : '#9CA3AF', marginRight: 8 }}>đ</Text>
                        <TextInput
                          style={{ flex: 1, fontSize: 36, fontWeight: 'bold', color: '#111827', paddingVertical: 0 }}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#D1D5DB"
                          value={amountInput}
                          onChangeText={(text) => {
                            const cleaned = text.replace(/\D/g, '');
                            if (cleaned) {
                              setAmountInput(parseInt(cleaned).toLocaleString('vi-VN'));
                            } else {
                              setAmountInput('');
                            }
                          }}
                        />
                      </View>

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
                        {['100.000', '200.000', '500.000', '1.000.000', '2.000.000', '5.000.000'].map(amt => (
                          <TouchableOpacity 
                            key={amt} 
                            style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: amountInput === amt ? '#3B82F6' : '#E5E7EB', backgroundColor: amountInput === amt ? '#EFF6FF' : '#F9FAFB' }}
                            onPress={() => setAmountInput(amt)}
                          >
                            <Text style={{ color: amountInput === amt ? '#3B82F6' : '#4B5563', fontWeight: '600' }}>{amt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 25 }}>
                        <Text style={{ color: '#6B7280', fontSize: 14 }}>Phí giao dịch</Text>
                        <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 14 }}>Miễn phí</Text>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.inputLabel}>Nhập số tiền (VNĐ)</Text>
                      <TextInput
                        style={styles.amountInput}
                        keyboardType="numeric"
                        placeholder="VD: 500.000"
                        value={amountInput}
                        onChangeText={setAmountInput}
                      />
                    </>
                  )}

                  <TouchableOpacity 
                    style={[styles.submitBtn, { opacity: amountInput ? 1 : 0.5, marginTop: 'auto' }]} 
                    disabled={!amountInput}
                    onPress={submitTransaction}
                  >
                    <Text style={styles.submitBtnText}>
                      {modalType === 'topup' && amountInput ? `Nạp ${amountInput}đ` : 'Xác nhận giao dịch'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal Thêm Ngân Hàng */}
        <Modal
          visible={isAddBankModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.actionModal, { height: '90%' }]}>
              {!selectedBankToLink ? (
                <>
                  <View style={styles.actionModalHeader}>
                    <Text style={styles.actionModalTitle}>Chọn Ngân Hàng</Text>
                    <TouchableOpacity onPress={() => setIsAddBankModalVisible(false)}>
                      <Ionicons name="close" size={26} color="#4B5563" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.searchBar}>
                    <Ionicons name="search" size={22} color="#9CA3AF" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Tìm kiếm tên ngân hàng..."
                      value={searchBankQuery}
                      onChangeText={setSearchBankQuery}
                    />
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {ALL_BANKS.filter(bank => 
                      bank.name.toLowerCase().includes(searchBankQuery.toLowerCase()) || 
                      bank.fullName.toLowerCase().includes(searchBankQuery.toLowerCase())
                    ).map((bank) => (
                      <TouchableOpacity 
                        key={bank.id} 
                        style={styles.bankSelectRow}
                        onPress={() => setSelectedBankToLink(bank)}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={[styles.bankIconBox, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' }]}>
                            {bank.logo ? (
                              <Image source={bank.logo} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
                            ) : (
                              <Ionicons name={(bank as any).icon || 'card-outline'} size={24} color={bank.color} />
                            )}
                          </View>
                          <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.bankName}>{bank.name}</Text>
                            <Text style={styles.bankAccountSmall} numberOfLines={1}>{bank.fullName}</Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <>
                  <View style={styles.actionModalHeader}>
                    <TouchableOpacity onPress={() => setSelectedBankToLink(null)}>
                      <Ionicons name="chevron-back" size={28} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.actionModalTitle}>Liên kết thẻ</Text>
                    <TouchableOpacity onPress={() => { setIsAddBankModalVisible(false); setSelectedBankToLink(null); }}>
                      <Ionicons name="close" size={26} color="#4B5563" />
                    </TouchableOpacity>
                  </View>

                  <View style={{ alignItems: 'center', marginVertical: 35 }}>
                    <View style={[styles.bankIconBoxLarge, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6', elevation: 2 }]}>
                      {selectedBankToLink.logo ? (
                        <Image source={selectedBankToLink.logo} style={{ width: 56, height: 56, resizeMode: 'contain' }} />
                      ) : (
                        <Ionicons name={selectedBankToLink.icon as any} size={48} color={selectedBankToLink.color} />
                      )}
                    </View>
                    <Text style={[styles.bankName, { fontSize: 22, marginTop: 15 }]}>{selectedBankToLink.name}</Text>
                    <Text style={[styles.bankAccountSmall, { fontSize: 14, marginTop: 4 }]}>{selectedBankToLink.fullName}</Text>
                  </View>
                  
                  <Text style={styles.inputLabel}>Số thẻ/Tài khoản</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    placeholder="Nhập số tài khoản của bạn..."
                    value={newBankAccount}
                    onChangeText={setNewBankAccount}
                  />
                  
                  <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#10B981', marginTop: 'auto', marginBottom: 20 }]} onPress={handleAddBank}>
                    <Text style={styles.submitBtnText}>Liên kết ngay</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Enterprise Security Modals */}
        <DeviceBlockModal visible={!isDeviceSecure} />
        <NetworkOfflineModal visible={!isNetworkConnected && isDeviceSecure} />
        <WalletAuthModal
          visible={isWalletLocked && isDeviceSecure && isNetworkConnected}
          onClose={() => router.canGoBack() ? router.back() : router.replace('/home')}
          onRegister={() => {
            setHasWallet(false);
            setIsActivationWizardVisible(true);
          }}
        />
        <TransactionAuthModal
          visible={txAuthVisible}
          actionTitle={txAuthData?.title || ''}
          amount={txAuthData?.amount}
          recipientInfo={txAuthData?.recipient}
          onSuccess={executeConfirmedTransaction}
          onCancel={() => setTxAuthVisible(false)}
        />
        <WalletActivationWizard
          visible={isActivationWizardVisible || !hasWallet}
          onComplete={handleActivationComplete}
          onCancel={() => {
            setIsActivationWizardVisible(false);
            if (!hasWallet) setHasWallet(true);
          }}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 20 }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  headerBackground: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerSearch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 10,
  },
  headerSearchPlaceholder: {
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 10,
    fontSize: 14,
  },
  bellButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  virtualCard: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceLabelCard: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceValueCard: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  balanceCurrencyCard: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 4,
  },
  eyeBtn: {
    padding: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 12,
  },
  pointText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  linkBankText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 2,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  floatingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -35,
    marginBottom: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  mainActionItem: {
    alignItems: 'center',
    width: '24%',
  },
  mainActionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainActionText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '700',
  },
  financeOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  financeCard: {
    width: '48%',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
  },
  financeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 6,
  },
  financeCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  financeCardDesc: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sectionTitleNoMargin: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  seeAllText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  promoScroll: {
    marginBottom: 25,
  },
  promoCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    marginRight: 15,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  promoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  promoDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  featureItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIconBox: {
    width: 46,
    height: 46,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    textAlign: 'center',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  txIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  txDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  txDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  actionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 15,
  },
  amountInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  textInputStyle: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  fundingSourceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
  },
  bankSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bankSelected: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  bankIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bankIconBoxSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankIconBoxLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  bankAccount: {
    fontSize: 14,
    color: '#6B7280',
  },
  bankNameSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bankAccountSmall: {
    fontSize: 12,
    color: '#6B7280',
  },
  addBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'center',
  },
  addBankText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 25,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
  },
  blackGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
});
