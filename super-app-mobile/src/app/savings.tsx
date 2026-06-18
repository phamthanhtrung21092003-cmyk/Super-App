import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Platform, SafeAreaView, StatusBar, ScrollView, 
  useWindowDimensions, TextInput, Alert, KeyboardAvoidingView,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser, SavingsBook } from '../context/UserContext';

const TERMS = [
  { id: '1m', months: 1, rate: 4.5 },
  { id: '3m', months: 3, rate: 5.0 },
  { id: '6m', months: 6, rate: 6.5 },
  { id: '12m', months: 12, rate: 7.5 },
];

const ANNUITY_TERMS = [
  { id: '5y', years: 5 },
  { id: '10y', years: 10 },
  { id: '15y', years: 15 },
  { id: '20y', years: 20 },
];

export default function SavingsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const { walletBalance, addTransaction, savingsBooks, openSavingsBook, topUpSavingsBook } = useUser();

  const [activeTab, setActiveTab] = useState<'standard' | 'annuity'>('standard');

  // STANDARD SAVINGS STATES
  const [amountInput, setAmountInput] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('6m');

  // ANNUITY STATES
  const [annuityAmountInput, setAnnuityAmountInput] = useState('');
  const [annuityTermId, setAnnuityTermId] = useState('10y');

  // TOP-UP MODAL
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [selectedBookForTopUp, setSelectedBookForTopUp] = useState<SavingsBook | null>(null);
  const [topUpAmountInput, setTopUpAmountInput] = useState('');

  const handleBack = () => {
    router.replace('/wallet');
  };

  // --- STANDARD CALCS ---
  const selectedTerm = useMemo(() => TERMS.find(t => t.id === selectedTermId)!, [selectedTermId]);
  const amount = parseInt(amountInput.replace(/[^0-9]/g, ''), 10) || 0;

  const estimatedProfit = useMemo(() => {
    return Math.floor(amount * (selectedTerm.rate / 100) * (selectedTerm.months / 12));
  }, [amount, selectedTerm]);

  const endDateString = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + selectedTerm.months);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }, [selectedTerm]);

  // --- ANNUITY CALCS ---
  const selectedAnnuityTerm = useMemo(() => ANNUITY_TERMS.find(t => t.id === annuityTermId)!, [annuityTermId]);
  const annuityAmount = parseInt(annuityAmountInput.replace(/[^0-9]/g, ''), 10) || 0;
  
  const annuityResults = useMemo(() => {
    if (annuityAmount <= 0) return { pmt: 0, total: 0 };
    const r = 0.06 / 12; // 6% annual = 0.5% monthly
    const n = selectedAnnuityTerm.years * 12;
    const pmt = annuityAmount * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    return {
      pmt: Math.round(pmt),
      total: Math.round(pmt * n)
    };
  }, [annuityAmount, selectedAnnuityTerm]);

  const handleStandardDeposit = () => {
    if (amount < 100000) {
      Alert.alert('Lỗi', 'Số tiền gửi tối thiểu là 100.000đ');
      return;
    }
    if (amount > walletBalance) {
      Alert.alert('Lỗi', 'Số dư trong ví không đủ!');
      return;
    }
    
    addTransaction(amount, 'out', `Mở sổ tích lũy mới`, `Kỳ hạn ${selectedTerm.months} tháng`, 'trending-up', '#FEF3C7', '#D97706');
    
    const today = new Date();
    openSavingsBook({
      id: Date.now().toString(),
      type: 'standard',
      amount: amount,
      rate: selectedTerm.rate,
      months: selectedTerm.months,
      startDate: `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`,
      endDate: endDateString
    });

    setAmountInput('');
    Alert.alert(
      'Thành công', 
      'Đã tạo sổ tích lũy mới thành công!',
      [{ text: 'Đóng', onPress: handleBack }]
    );

    if (Platform.OS === 'web') {
      setTimeout(handleBack, 500);
    }
  };

  const handleAnnuityDeposit = () => {
    if (annuityAmount < 50000000) {
      Alert.alert('Lỗi', 'Số tiền mở Quỹ Hưu Trí tối thiểu là 50.000.000đ');
      return;
    }
    if (annuityAmount > walletBalance) {
      Alert.alert('Lỗi', 'Số dư trong ví không đủ!');
      return;
    }
    
    addTransaction(annuityAmount, 'out', `Mở Quỹ Hưu Trí`, `Thời gian nhận: ${selectedAnnuityTerm.years} năm`, 'shield-checkmark', '#E0F2FE', '#0284C7');
    
    const today = new Date();
    const d = new Date();
    d.setFullYear(d.getFullYear() + selectedAnnuityTerm.years);

    openSavingsBook({
      id: Date.now().toString(),
      type: 'annuity',
      amount: annuityAmount,
      rate: 6.0,
      months: selectedAnnuityTerm.years * 12,
      startDate: `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`,
      endDate: `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
    });

    setAnnuityAmountInput('');
    Alert.alert(
      'Thành công', 
      'Mở Quỹ Hưu Trí thành công!',
      [{ text: 'Tuyệt vời', onPress: handleBack }]
    );

    if (Platform.OS === 'web') {
      setTimeout(handleBack, 500);
    }
  };

  const handleTopUp = () => {
    const topUpAmount = parseInt(topUpAmountInput.replace(/[^0-9]/g, ''), 10) || 0;
    if (topUpAmount < 10000) {
      Alert.alert('Lỗi', 'Số tiền nộp thêm tối thiểu là 10.000đ');
      return;
    }
    if (topUpAmount > walletBalance) {
      Alert.alert('Lỗi', 'Số dư trong ví không đủ!');
      return;
    }
    if (selectedBookForTopUp) {
      addTransaction(topUpAmount, 'out', `Nộp thêm vào Sổ Tích Lũy`, `Cập nhật số gốc mới`, 'trending-up', '#FEF3C7', '#D97706');
      topUpSavingsBook(selectedBookForTopUp.id, topUpAmount);
      setTopUpModalVisible(false);
      setTopUpAmountInput('');
      setSelectedBookForTopUp(null);
      Alert.alert('Thành công', 'Đã nộp thêm tiền vào sổ!');
    }
  };

  // Tính lại tiền lãi dự kiến của cuốn sổ
  const calcBookProfit = (book: SavingsBook) => {
    if (book.type === 'annuity') return 0;
    return Math.floor(book.amount * (book.rate / 100) * (book.months / 12));
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" translucent={true} />
        
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            
            {/* HEADER */}
            <LinearGradient
              colors={activeTab === 'standard' ? ['#D97706', '#F59E0B'] : ['#0369A1', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerBackground}
            >
              <View style={styles.headerTop}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đầu Tư & Tích Lũy</Text>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'standard' && styles.tabActive]}
                  onPress={() => setActiveTab('standard')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, activeTab === 'standard' && styles.tabTextActive]}>Sổ Gửi Góp</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'annuity' && styles.tabActive]}
                  onPress={() => setActiveTab('annuity')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, activeTab === 'annuity' && styles.tabTextActive]}>Quỹ Hưu Trí</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* MY SAVINGS BOOKS SECTION */}
            {savingsBooks.length > 0 && (
              <View style={styles.myBooksSection}>
                <Text style={styles.sectionLabel}>Sổ Tiết Kiệm Của Bạn</Text>
                {savingsBooks.map(book => (
                  <View key={book.id} style={styles.bookCard}>
                    <View style={styles.bookHeader}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={[styles.bookIcon, { backgroundColor: book.type === 'standard' ? '#FEF3C7' : '#E0F2FE' }]}>
                          <Ionicons name={book.type === 'standard' ? 'wallet' : 'shield-checkmark'} size={20} color={book.type === 'standard' ? '#D97706' : '#0284C7'} />
                        </View>
                        <View style={{marginLeft: 10}}>
                          <Text style={styles.bookTypeTitle}>{book.type === 'standard' ? 'Sổ Gửi Góp Tích Lũy' : 'Quỹ Hưu Trí'}</Text>
                          <Text style={styles.bookDateText}>Đáo hạn: {book.endDate}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.bookDetails}>
                      <View style={styles.bookDetailCol}>
                        <Text style={styles.bookDetailLabel}>Gốc hiện tại</Text>
                        <Text style={styles.bookDetailValue}>{book.amount.toLocaleString('vi-VN')}đ</Text>
                      </View>
                      {book.type === 'standard' ? (
                        <View style={styles.bookDetailCol}>
                          <Text style={styles.bookDetailLabel}>Lãi dự kiến cuối kỳ</Text>
                          <Text style={[styles.bookDetailValue, { color: '#10B981' }]}>+{calcBookProfit(book).toLocaleString('vi-VN')}đ</Text>
                        </View>
                      ) : (
                        <View style={styles.bookDetailCol}>
                          <Text style={styles.bookDetailLabel}>Lương hưu hàng tháng</Text>
                          <Text style={[styles.bookDetailValue, { color: '#0284C7' }]}>
                             {Math.round(book.amount * ((0.06/12) * Math.pow(1.005, book.months)) / (Math.pow(1.005, book.months) - 1)).toLocaleString('vi-VN')}đ
                          </Text>
                        </View>
                      )}
                    </View>

                    {book.type === 'standard' && (
                      <TouchableOpacity 
                        style={styles.topUpButton}
                        onPress={() => {
                          setSelectedBookForTopUp(book);
                          setTopUpModalVisible(true);
                        }}
                      >
                        <Ionicons name="add-circle-outline" size={18} color="#D97706" style={{marginRight: 5}} />
                        <Text style={styles.topUpButtonText}>Nộp thêm tiền (Từ 10.000đ)</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* TAB CONTENT: STANDARD SAVINGS */}
            {activeTab === 'standard' && (
              <View style={styles.contentContainer}>
                <Text style={styles.sectionLabel}>Tạo Sổ Gửi Góp Mới</Text>
                <View style={styles.inputCard}>
                  <Text style={styles.currencyPrefix}>VND</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    placeholder="0"
                    value={amountInput}
                    onChangeText={(val) => {
                      const num = val.replace(/[^0-9]/g, '');
                      setAmountInput(num ? parseInt(num, 10).toLocaleString('vi-VN') : '');
                    }}
                  />
                </View>
                <Text style={styles.balanceText}>Số dư khả dụng: <Text style={{fontWeight: '700'}}>{walletBalance.toLocaleString('vi-VN')}đ</Text></Text>

                {amountInput.length > 0 && (
                  <View style={{flexDirection: 'row', marginTop: 10}}>
                    <TouchableOpacity style={styles.quickAmountBtn} onPress={() => setAmountInput('1000000')}>
                      <Text style={styles.quickAmountText}>1.000.000đ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAmountBtn} onPress={() => setAmountInput(walletBalance.toString())}>
                      <Text style={styles.quickAmountText}>Tất cả số dư</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={[styles.sectionLabel, { marginTop: 25 }]}>Chọn Kỳ hạn</Text>
                <View style={styles.termsGrid}>
                  {TERMS.map(term => (
                    <TouchableOpacity 
                      key={term.id} 
                      style={[styles.termCard, selectedTermId === term.id && styles.termCardSelected]}
                      onPress={() => setSelectedTermId(term.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.termMonths, selectedTermId === term.id && styles.termTextSelected]}>
                        {term.months} tháng
                      </Text>
                      <Text style={[styles.termRate, selectedTermId === term.id && styles.termTextSelected]}>
                        {term.rate}% /năm
                      </Text>
                      {selectedTermId === term.id && (
                        <View style={styles.checkmarkBox}>
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* TÓM TẮT GIAO DỊCH */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Lãi dự kiến cuối kỳ:</Text>
                    <Text style={[styles.summaryValue, { color: '#10B981', fontWeight: '800' }]}>
                      +{estimatedProfit > 0 ? estimatedProfit.toLocaleString('vi-VN') : '0'} đ
                    </Text>
                  </View>
                </View>
                <View style={{height: 100}} />
              </View>
            )}

            {/* TAB CONTENT: ANNUITY / HƯU TRÍ */}
            {activeTab === 'annuity' && (
              <View style={styles.contentContainer}>
                
                <View style={[styles.heroSection, { marginBottom: 20 }]}>
                  <Text style={[styles.heroText, { color: '#0369A1' }]}>Lương Hưu Trí Thụ Động</Text>
                  <Text style={[styles.heroSubText, { color: '#4B5563' }]}>Gửi 1 cục, nhận dòng tiền đều đặn mỗi tháng bao gồm cả gốc lẫn lãi.</Text>
                </View>

                <Text style={styles.sectionLabel}>Tạo Quỹ Mới (Tối thiểu 50tr)</Text>
                <View style={[styles.inputCard, { borderColor: '#E0F2FE' }]}>
                  <Text style={[styles.currencyPrefix, { color: '#0284C7' }]}>VND</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    placeholder="0"
                    value={annuityAmountInput}
                    onChangeText={(val) => {
                      const num = val.replace(/[^0-9]/g, '');
                      setAnnuityAmountInput(num ? parseInt(num, 10).toLocaleString('vi-VN') : '');
                    }}
                  />
                </View>
                <Text style={styles.balanceText}>Số dư khả dụng: <Text style={{fontWeight: '700'}}>{walletBalance.toLocaleString('vi-VN')}đ</Text></Text>

                <Text style={[styles.sectionLabel, { marginTop: 25 }]}>Thời gian nhận lương hằng tháng</Text>
                <View style={styles.termsGrid}>
                  {ANNUITY_TERMS.map(term => (
                    <TouchableOpacity 
                      key={term.id} 
                      style={[styles.termCard, annuityTermId === term.id && { borderColor: '#0EA5E9', backgroundColor: '#F0F9FF' }]}
                      onPress={() => setAnnuityTermId(term.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.termMonths, annuityTermId === term.id && { color: '#0284C7' }]}>
                        {term.years} năm
                      </Text>
                      <Text style={[styles.termRate, annuityTermId === term.id && { color: '#0284C7' }]}>
                        ({term.years * 12} tháng)
                      </Text>
                      {annuityTermId === term.id && (
                        <View style={[styles.checkmarkBox, { backgroundColor: '#0EA5E9' }]}>
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* KẾT QUẢ DÒNG TIỀN */}
                <View style={[styles.summaryCard, { borderColor: '#E0F2FE', backgroundColor: '#F0F9FF' }]}>
                  <View style={styles.summaryHeader}>
                    <Ionicons name="cash-outline" size={24} color="#0284C7" />
                    <Text style={[styles.summaryTitle, { color: '#0284C7', fontSize: 16 }]}>Mỗi tháng bạn nhận về:</Text>
                  </View>
                  <View style={{ alignItems: 'center', marginVertical: 5 }}>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: '#10B981' }}>
                      {annuityResults.pmt.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                </View>
                <View style={{height: 100}} />
              </View>
            )}

          </ScrollView>

          {/* BOTTOM FLOATING BUTTON */}
          <View style={styles.bottomBar}>
            {activeTab === 'standard' ? (
              <TouchableOpacity 
                style={[styles.submitButton, amount < 100000 && { backgroundColor: '#D1D5DB' }]}
                onPress={handleStandardDeposit}
                disabled={amount < 100000}
              >
                <Text style={styles.submitButtonText}>Mở Sổ Tích Lũy Ngay</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: '#0EA5E9' }, annuityAmount < 50000000 && { backgroundColor: '#D1D5DB' }]}
                onPress={handleAnnuityDeposit}
                disabled={annuityAmount < 50000000}
              >
                <Text style={styles.submitButtonText}>Khởi Tạo Quỹ Hưu Trí</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>

        {/* TOP-UP MODAL */}
        <Modal visible={topUpModalVisible} transparent={true} animationType="fade">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nộp thêm tiền vào sổ</Text>
                <TouchableOpacity onPress={() => setTopUpModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {selectedBookForTopUp && (
                <View style={{marginBottom: 20}}>
                  <Text style={{color: '#6B7280', marginBottom: 5}}>Sổ hiện tại đang có: <Text style={{fontWeight: '700', color: '#111827'}}>{selectedBookForTopUp.amount.toLocaleString('vi-VN')}đ</Text></Text>
                  <Text style={{color: '#6B7280', marginBottom: 15}}>Lãi suất: {selectedBookForTopUp.rate}%/năm</Text>
                  
                  <View style={styles.inputCard}>
                    <Text style={styles.currencyPrefix}>VND</Text>
                    <TextInput
                      style={styles.amountInput}
                      keyboardType="numeric"
                      placeholder="0"
                      autoFocus
                      value={topUpAmountInput}
                      onChangeText={(val) => {
                        const num = val.replace(/[^0-9]/g, '');
                        setTopUpAmountInput(num ? parseInt(num, 10).toLocaleString('vi-VN') : '');
                      }}
                    />
                  </View>
                  <Text style={styles.balanceText}>Số dư khả dụng: <Text style={{fontWeight: '700'}}>{walletBalance.toLocaleString('vi-VN')}đ</Text></Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.submitButton, {width: '100%'}]}
                onPress={handleTopUp}
              >
                <Text style={styles.submitButtonText}>Xác nhận nộp thêm</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 20 }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  heroText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 5,
  },
  heroSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  myBooksSection: {
    padding: 20,
    paddingBottom: 0,
  },
  bookCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bookHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  bookIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTypeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  bookDateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bookDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookDetailCol: {
    flex: 1,
  },
  bookDetailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  bookDetailValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  topUpButtonText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 14,
  },
  contentContainer: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    paddingVertical: 15,
  },
  balanceText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 5,
  },
  quickAmountBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  quickAmountText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '600',
  },
  termsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  termCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  termCardSelected: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  termMonths: {
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 4,
  },
  termRate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  termTextSelected: {
    color: '#D97706',
  },
  checkmarkBox: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    padding: 2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
