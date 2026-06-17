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
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const MAIN_ACTIONS = [
  { id: 'topup', title: 'Nạp tiền', icon: 'download-outline', color: '#3B82F6' },
  { id: 'withdraw', title: 'Rút tiền', icon: 'push-outline', color: '#8B5CF6' },
  { id: 'scan', title: 'Quét mã', icon: 'qr-code-outline', color: '#10B981' },
  { id: 'transfer', title: 'Chuyển', icon: 'swap-horizontal-outline', color: '#F59E0B' },
];

const OTHER_SERVICES = [
  { id: 'mobile', title: 'Nạp ĐT', icon: 'phone-portrait-outline', color: '#EF4444' },
  { id: 'bill', title: 'Hóa đơn', icon: 'receipt-outline', color: '#06B6D4' },
  { id: 'receive', title: 'Nhận tiền', icon: 'arrow-down-circle-outline', color: '#14B8A6' },
  { id: 'linkbank', title: 'Liên kết NH', icon: 'card-outline', color: '#6366F1' },
];

const PROMOS = [
  { id: '1', title: 'Gửi Tiết Kiệm', desc: 'Lãi suất tới 8.5%/năm', icon: 'trending-up', color: '#F59E0B', bg: '#FFFBEB' },
  { id: '2', title: 'Hoàn Tiền Đăng Ký', desc: 'Giảm 50% tiền điện', icon: 'flash', color: '#10B981', bg: '#ECFDF5' },
  { id: '3', title: 'Mở Ví Trả Sau', desc: 'Miễn lãi 45 ngày', icon: 'wallet', color: '#8B5CF6', bg: '#F5F3FF' },
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

export default function WalletScreen() {
  const { walletBalance, transactions, addTransaction, linkedBanks, addLinkedBank } = useUser();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [modalType, setModalType] = useState<'topup' | 'withdraw' | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isSelectingBank, setIsSelectingBank] = useState(false);
  
  // States for Add Bank
  const [isAddBankModalVisible, setIsAddBankModalVisible] = useState(false);
  const [searchBankQuery, setSearchBankQuery] = useState('');
  const [selectedBankToLink, setSelectedBankToLink] = useState<any>(null);
  const [newBankAccount, setNewBankAccount] = useState('');

  // Make sure a bank is selected
  useEffect(() => {
    if (!selectedBank && linkedBanks.length > 0) {
      setSelectedBank(linkedBanks[0]);
    }
  }, [linkedBanks]);
  
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const handleAction = (id: string) => {
    if (id === 'topup') {
      setModalType('topup');
      setAmountInput('');
      setIsSelectingBank(false);
    } else if (id === 'withdraw') {
      setModalType('withdraw');
      setAmountInput('');
      setIsSelectingBank(false);
    } else if (id === 'linkbank') {
      setIsAddBankModalVisible(true);
    } else {
      Alert.alert('Thông báo', 'Tính năng đang được phát triển!');
    }
  };

  const handleAddBank = () => {
    if (!selectedBankToLink || !newBankAccount.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin thẻ');
      return;
    }
    addLinkedBank(selectedBankToLink.name, newBankAccount, selectedBankToLink.color, selectedBankToLink.icon);
    setSelectedBankToLink(null);
    setNewBankAccount('');
    setSearchBankQuery('');
    setIsAddBankModalVisible(false);
    Alert.alert('Thành công', `Đã liên kết thành công thẻ ${selectedBankToLink.name}`);
  };

  const submitTransaction = () => {
    if (!selectedBank) {
      Alert.alert('Lỗi', 'Vui lòng chọn nguồn tiền!');
      return;
    }
    const amount = parseInt(amountInput.replace(/[^0-9]/g, ''), 10);
    if (!amount || amount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }
    
    if (modalType === 'withdraw' && amount > walletBalance) {
      Alert.alert('Lỗi', 'Số dư không đủ để rút tiền');
      return;
    }

    if (modalType === 'topup') {
      addTransaction(amount, 'in', 'Nạp tiền vào ví', `Từ ${selectedBank.name} ${selectedBank.account}`, 'download-outline', '#D1FAE5', '#10B981');
      Alert.alert('Thành công', `Đã nạp ${amount.toLocaleString('vi-VN')}đ từ ${selectedBank.name}`);
    } else {
      addTransaction(amount, 'out', 'Rút tiền về thẻ', `Về ${selectedBank.name} ${selectedBank.account}`, 'push-outline', '#FEE2E2', '#EF4444');
      Alert.alert('Thành công', `Đã rút ${amount.toLocaleString('vi-VN')}đ về ${selectedBank.name}`);
    }
    
    setModalType(null);
    setAmountInput('');
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerBackground}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Quay lại</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Ví VN Pay</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Khối Thông tin Ví (Wallet Info Card) */}
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.virtualCard}
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.tierBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.tierText}>Thành viên Vàng</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.qrButton}>
                  <Ionicons name="qr-code" size={16} color="#FFF" />
                  <Text style={styles.qrButtonText}>Mã QR</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardBalanceRow}>
                <View>
                  <Text style={styles.balanceLabelCard}>Số dư ví</Text>
                  <View style={styles.balanceValueContainer}>
                    <Text style={styles.balanceValueCard}>
                      {isBalanceHidden ? '******' : walletBalance.toLocaleString('vi-VN')}
                    </Text>
                    {!isBalanceHidden && <Text style={styles.balanceCurrencyCard}>đ</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={() => setIsBalanceHidden(!isBalanceHidden)} style={styles.eyeBtn}>
                  <Ionicons name={isBalanceHidden ? 'eye-off-outline' : 'eye-outline'} size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardFooter}>
                <Text style={styles.pointText}>🌟 Điểm VN Pay: <Text style={{fontWeight: '700', color: '#FFF'}}>1.280</Text></Text>
              </View>
            </LinearGradient>
          </LinearGradient>
          <View style={styles.floatingCard}>
            {MAIN_ACTIONS.map(action => (
              <TouchableOpacity key={action.id} style={styles.mainActionItem} activeOpacity={0.7} onPress={() => handleAction(action.id)}>
                <View style={[styles.mainActionIconBox, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.mainActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Dịch vụ tiện ích</Text>
          <View style={styles.whiteCard}>
            <View style={styles.featuresGrid}>
              {OTHER_SERVICES.map(service => (
                <TouchableOpacity key={service.id} style={styles.featureItem} activeOpacity={0.6} onPress={() => handleAction(service.id)}>
                  <View style={[styles.featureIconBox, { backgroundColor: `${service.color}15` }]}>
                    <Ionicons name={service.icon as any} size={20} color={service.color} />
                  </View>
                  <Text style={styles.featureText}>{service.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ===== BĂNG CHUYỀN KHUYẾN MÃI ===== */}
          <Text style={styles.sectionTitle}>Khám phá ưu đãi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {PROMOS.map(promo => (
              <TouchableOpacity key={promo.id} style={[styles.promoCard, { backgroundColor: promo.bg }]} activeOpacity={0.8}>
                <View style={[styles.promoIconBox, { backgroundColor: `${promo.color}20` }]}>
                  <Ionicons name={promo.icon as any} size={20} color={promo.color} />
                </View>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={styles.promoDesc}>{promo.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ===== LỊCH SỬ GIAO DỊCH ===== */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleNoMargin}>Biến động số dư</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>Xem tất cả</Text></TouchableOpacity>
          </View>
          
          <View style={styles.whiteCard}>
            {transactions.map((tx, index) => (
              <View key={tx.id} style={[styles.txRow, index !== transactions.length - 1 && styles.txRowBorder]}>
                <View style={[styles.txIconBox, { backgroundColor: tx.bg }]}>
                  <Ionicons name={tx.icon as any} size={20} color={tx.color} />
                </View>
                <View style={styles.txDetails}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  {tx.desc && <Text style={styles.txDesc}>{tx.desc}</Text>}
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'in' ? '#10B981' : '#EF4444' }]}>
                  {tx.amount}
                </Text>
              </View>
            ))}
            {transactions.length === 0 && (
              <Text style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Chưa có giao dịch nào</Text>
            )}
          </View>

          <View style={{height: 50}} />
        </ScrollView>
        
        {/* Modal Nạp/Rút Tiền */}
        <Modal
          visible={modalType !== null}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.actionModal}>
              <View style={styles.actionModalHeader}>
                <Text style={styles.actionModalTitle}>
                  {isSelectingBank 
                    ? 'Chọn Nguồn Tiền' 
                    : modalType === 'topup' ? 'Nạp tiền vào ví' : 'Rút tiền về thẻ'
                  }
                </Text>
                <TouchableOpacity onPress={() => {
                  if (isSelectingBank) setIsSelectingBank(false);
                  else setModalType(null);
                }}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {isSelectingBank ? (
                // --- MÀN HÌNH CHỌN NGÂN HÀNG ---
                <ScrollView style={{ maxHeight: 300 }}>
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
                            <Image source={bank.logo} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
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
                    <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
                    <Text style={styles.addBankText}>Thêm thẻ/tài khoản mới</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                // --- MÀN HÌNH NHẬP SỐ TIỀN ---
                <>
                  <Text style={styles.inputLabel}>{modalType === 'topup' ? 'Từ nguồn tiền' : 'Đến tài khoản'}</Text>
                  {selectedBank ? (
                    <TouchableOpacity style={styles.fundingSourceBox} onPress={() => setIsSelectingBank(true)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.bankIconBoxSmall, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' }]}>
                          {selectedBank.logo ? (
                            <Image source={selectedBank.logo} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
                          ) : (
                            <Ionicons name={selectedBank.icon as any} size={16} color={selectedBank.color} />
                          )}
                        </View>
                        <View>
                          <Text style={styles.bankNameSmall}>{selectedBank.name}</Text>
                          <Text style={styles.bankAccountSmall}>{selectedBank.account}</Text>
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

                  <Text style={styles.inputLabel}>Nhập số tiền (VNĐ)</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    placeholder="VD: 500000"
                    value={amountInput}
                    onChangeText={setAmountInput}
                    autoFocus
                  />
                  
                  <TouchableOpacity style={styles.submitBtn} onPress={submitTransaction}>
                    <Text style={styles.submitBtnText}>Xác nhận</Text>
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
                // BƯỚC 1: TÌM KIẾM NGÂN HÀNG
                <>
                  <View style={styles.actionModalHeader}>
                    <Text style={styles.actionModalTitle}>Chọn Ngân Hàng</Text>
                    <TouchableOpacity onPress={() => setIsAddBankModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
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
                              <Image source={bank.logo} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                            ) : (
                              <Ionicons name={bank.icon as any} size={24} color={bank.color} />
                            )}
                          </View>
                          <View>
                            <Text style={styles.bankName}>{bank.name}</Text>
                            <Text style={styles.bankAccountSmall}>{bank.fullName}</Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : (
                // BƯỚC 2: NHẬP SỐ TÀI KHOẢN
                <>
                  <View style={styles.actionModalHeader}>
                    <TouchableOpacity onPress={() => setSelectedBankToLink(null)}>
                      <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.actionModalTitle}>Liên kết thẻ</Text>
                    <TouchableOpacity onPress={() => {
                      setIsAddBankModalVisible(false);
                      setSelectedBankToLink(null);
                    }}>
                      <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={{ alignItems: 'center', marginVertical: 30 }}>
                    <View style={[styles.bankIconBoxLarge, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' }]}>
                      {selectedBankToLink.logo ? (
                        <Image source={selectedBankToLink.logo} style={{ width: 48, height: 48, resizeMode: 'contain' }} />
                      ) : (
                        <Ionicons name={selectedBankToLink.icon as any} size={48} color={selectedBankToLink.color} />
                      )}
                    </View>
                    <Text style={[styles.bankName, { fontSize: 20, marginTop: 15 }]}>{selectedBankToLink.name}</Text>
                    <Text style={styles.bankAccountSmall}>{selectedBankToLink.fullName}</Text>
                  </View>
                  
                  <Text style={styles.inputLabel}>Số thẻ/Tài khoản</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    placeholder="Nhập số tài khoản của bạn..."
                    value={newBankAccount}
                    onChangeText={setNewBankAccount}
                    autoFocus
                  />
                  
                  <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#10B981', marginTop: 'auto', marginBottom: 20 }]} onPress={handleAddBank}>
                    <Text style={styles.submitBtnText}>Liên kết ngay</Text>
                  </TouchableOpacity>
                </>
              )}
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
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  backButton: {
    paddingVertical: 8,
    width: 80,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  virtualCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: '#F59E0B',
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
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabelCard: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceValueCard: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  balanceCurrencyCard: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 4,
  },
  eyeBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  pointText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
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
    marginTop: -40,
    marginBottom: 25,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  mainActionItem: {
    alignItems: 'center',
    width: '24%',
  },
  mainActionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainActionIcon: {
    fontSize: 22,
  },
  mainActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sectionTitleNoMargin: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  seeAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  promoScroll: {
    marginBottom: 20,
  },
  promoCard: {
    width: 150,
    padding: 16,
    borderRadius: 16,
    marginRight: 15,
    justifyContent: 'center',
  },
  promoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  promoDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 20,
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
    paddingVertical: 12,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  txDesc: {
    fontSize: 13,
    color: '#4B5563',
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
    minHeight: 300,
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
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '600',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fundingSourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  bankIconBoxSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bankNameSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  bankAccountSmall: {
    fontSize: 12,
    color: '#6B7280',
  },
  bankSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  bankSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
  },
  bankIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  bankAccount: {
    fontSize: 13,
    color: '#6B7280',
  },
  addBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'center',
    marginTop: 8,
  },
  addBankText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
  },
  bankIconBoxLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
