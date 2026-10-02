import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity,
  Modal, TextInput, StatusBar, Platform, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DriverWalletScreen() {
  const router = useRouter();

  // Wallet balances
  const [walletBalance, setWalletBalance] = useState(650000); // Ví ký quỹ
  const [cashInHand, setCashInHand] = useState(420000); // Tiền mặt cầm tay hôm nay
  const [todayNetEarnings, setTodayNetEarnings] = useState(380000); // Thu nhập ròng hôm nay

  // Modals
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('200000');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Active filter for transactions
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EARN' | 'FEE' | 'TOPUP'>('ALL');

  // Transactions ledger
  const [transactions, setTransactions] = useState([
    {
      id: 'TX-901',
      title: 'Trừ chiết khấu cuốc #VR-8899 (Tiền mặt)',
      tripCode: 'VR-8899',
      amount: -15000,
      balanceAfter: 650000,
      time: '14:25 Hôm nay',
      type: 'FEE',
      note: 'Khách trả 75.000đ tiền mặt',
    },
    {
      id: 'TX-902',
      title: 'Cộng cước cuốc #VR-8898 (VNPay)',
      tripCode: 'VR-8898',
      amount: +96000,
      balanceAfter: 665000,
      time: '13:10 Hôm nay',
      type: 'EARN',
      note: 'Khách thanh toán trực tuyến',
    },
    {
      id: 'TX-903',
      title: 'Thưởng mốc 5 cuốc trưa cao điểm',
      tripCode: '',
      amount: +50000,
      balanceAfter: 569000,
      time: '12:30 Hôm nay',
      type: 'EARN',
      note: 'Chương trình Chiến Binh Giờ Vàng',
    },
    {
      id: 'TX-904',
      title: 'Nạp tiền ví ký quỹ qua VietQR',
      tripCode: '',
      amount: +300000,
      balanceAfter: 519000,
      time: '08:00 Hôm nay',
      type: 'TOPUP',
      note: 'Giao dịch NAPAS 247 MB Bank',
    },
    {
      id: 'TX-905',
      title: 'Trừ chiết khấu cuốc #VR-8872 (Tiền mặt)',
      tripCode: 'VR-8872',
      amount: -18000,
      balanceAfter: 219000,
      time: '19:40 Hôm qua',
      type: 'FEE',
      note: 'Khách trả 90.000đ tiền mặt',
    },
  ]);

  const quickTopups = [50000, 100000, 200000, 500000];

  const handleConfirmTopup = () => {
    const val = parseInt(topupAmount, 10);
    if (isNaN(val) || val < 10000) {
      if (Platform.OS === 'web') alert('Vui lòng nhập số tiền hợp lệ (tối thiểu 10.000đ)');
      else Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ (tối thiểu 10.000đ)');
      return;
    }
    const newBal = walletBalance + val;
    setWalletBalance(newBal);
    setTransactions([
      {
        id: `TX-${Date.now().toString().slice(-4)}`,
        title: 'Nạp tiền ví ký quỹ qua VietQR',
        tripCode: '',
        amount: val,
        balanceAfter: newBal,
        time: 'Vừa xong',
        type: 'TOPUP',
        note: 'Giao dịch NAPAS 247 tự động',
      },
      ...transactions,
    ]);
    setShowTopupModal(false);
    if (Platform.OS === 'web') alert(`Đã nạp thành công ${val.toLocaleString('vi-VN')}đ vào ví ký quỹ!`);
    else Alert.alert('Thành công', `Đã nạp thành công ${val.toLocaleString('vi-VN')}đ vào ví ký quỹ!`);
  };

  const handleConfirmWithdraw = () => {
    const val = parseInt(withdrawAmount, 10);
    if (isNaN(val) || val <= 0) {
      if (Platform.OS === 'web') alert('Vui lòng nhập số tiền muốn rút');
      else Alert.alert('Lỗi', 'Vui lòng nhập số tiền muốn rút');
      return;
    }
    if (val > walletBalance - 50000) {
      if (Platform.OS === 'web') alert('Số dư ký quỹ sau khi rút phải giữ tối thiểu 50.000đ');
      else Alert.alert('Số dư không đủ', 'Số dư ký quỹ sau khi rút phải giữ tối thiểu 50.000đ để tiếp tục nhận cuốc.');
      return;
    }
    const newBal = walletBalance - val;
    setWalletBalance(newBal);
    setTransactions([
      {
        id: `TX-${Date.now().toString().slice(-4)}`,
        title: 'Rút tiền về MB Bank (...6789)',
        tripCode: '',
        amount: -val,
        balanceAfter: newBal,
        time: 'Vừa xong',
        type: 'FEE',
        note: 'Lệnh rút tiền 24/7',
      },
      ...transactions,
    ]);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    if (Platform.OS === 'web') alert(`Lệnh rút ${val.toLocaleString('vi-VN')}đ đã được chuyển về tài khoản ngân hàng!`);
    else Alert.alert('Thành công', `Lệnh rút ${val.toLocaleString('vi-VN')}đ đã được chuyển về tài khoản ngân hàng!`);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'EARN') return t.type === 'EARN';
    if (activeFilter === 'FEE') return t.type === 'FEE';
    if (activeFilter === 'TOPUP') return t.type === 'TOPUP';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ví & Thu Nhập Tài Xế</Text>
        <TouchableOpacity style={styles.helpBtn} onPress={() => {
          if (Platform.OS === 'web') alert('Tổng đài hỗ trợ đối tác 24/7: 1900-8888');
          else Alert.alert('Hỗ trợ', 'Tổng đài đối tác: 1900-8888');
        }}>
          <Ionicons name="help-circle-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeaderRow}>
            <View>
              <Text style={styles.walletLabel}>Số dư Ví Ký Quỹ (Escrow Balance)</Text>
              <Text style={styles.walletAmount}>{walletBalance.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.walletBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.walletBadgeText}>Sẵn sàng</Text>
            </View>
          </View>

          {walletBalance < 100000 && (
            <View style={styles.alertNotice}>
              <Ionicons name="warning" size={16} color="#D97706" />
              <Text style={styles.alertNoticeText}>Số dư sắp hết hạn mức khấu trừ. Hãy nạp thêm để tránh gián đoạn nhận cuốc.</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.topupBtn} onPress={() => setShowTopupModal(true)}>
              <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
              <Text style={styles.topupBtnText}>Nạp ví VietQR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdrawModal(true)}>
              <Ionicons name="card-outline" size={20} color="#0F172A" />
              <Text style={styles.withdrawBtnText}>Rút về Bank</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Performance Metrics */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cash" size={20} color="#D97706" />
            </View>
            <Text style={styles.statLabel}>Tiền mặt trong tay</Text>
            <Text style={styles.statValGold}>{cashInHand.toLocaleString('vi-VN')}đ</Text>
            <Text style={styles.statSub}>Đã thu từ khách</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrap, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="trending-up" size={20} color="#059669" />
            </View>
            <Text style={styles.statLabel}>Thu nhập ròng hôm nay</Text>
            <Text style={styles.statValGreen}>{todayNetEarnings.toLocaleString('vi-VN')}đ</Text>
            <Text style={styles.statSub}>Sau trừ 15% phí</Text>
          </View>
        </View>

        {/* Bank Account Info Card */}
        <View style={styles.bankCard}>
          <View style={styles.bankCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="business" size={18} color="#0284C7" />
              <Text style={styles.bankCardTitle}>Tài khoản liên kết nhận tiền</Text>
            </View>
            <Text style={styles.verifiedTag}>ĐÃ XÁC THỰC</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankField}>Ngân hàng:</Text>
            <Text style={styles.bankValue}>MB Bank (Quân Đội)</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankField}>Số tài khoản:</Text>
            <Text style={styles.bankValueBold}>0988 *** 6789</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankField}>Chủ tài khoản:</Text>
            <Text style={styles.bankValue}>NGUYEN VAN TAI XE</Text>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Biến động số dư & Lịch sử cước</Text>
          <Text style={styles.txCount}>{filteredTransactions.length} giao dịch</Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'EARN', label: 'Cộng cước / Thưởng' },
            { id: 'FEE', label: 'Trừ chiết khấu' },
            { id: 'TOPUP', label: 'Nạp ví VietQR' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterChip, activeFilter === item.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(item.id as any)}
            >
              <Text style={[styles.filterChipText, activeFilter === item.id && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions List */}
        {filteredTransactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txLeft}>
              <View
                style={[
                  styles.txIconWrap,
                  tx.amount > 0 ? { backgroundColor: '#ECFDF5' } : { backgroundColor: '#FEF2F2' },
                ]}
              >
                <Ionicons
                  name={tx.amount > 0 ? (tx.type === 'TOPUP' ? 'arrow-down-circle' : 'add-circle') : 'remove-circle'}
                  size={24}
                  color={tx.amount > 0 ? '#10B981' : '#EF4444'}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txNote}>{tx.note}</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
            </View>

            <View style={styles.txRight}>
              <Text style={[styles.txAmount, tx.amount > 0 ? styles.txGreen : styles.txRed]}>
                {tx.amount > 0 ? `+${tx.amount.toLocaleString('vi-VN')}đ` : `${tx.amount.toLocaleString('vi-VN')}đ`}
              </Text>
              <Text style={styles.txBalAfter}>Số dư: {tx.balanceAfter.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* VietQR Topup Modal */}
      <Modal visible={showTopupModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nạp Ví Ký Quỹ Qua VietQR</Text>
              <TouchableOpacity onPress={() => setShowTopupModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              {/* QR Image */}
              <View style={styles.qrContainer}>
                <Image
                  source={{
                    uri: `https://img.vietqr.io/image/MB-0988888888-compact2.png?amount=${topupAmount || '100000'}&addInfo=VDRIVE%20TX8889&accountName=CONG%20TY%20V-LIFE`,
                  }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                <Text style={styles.qrNote}>Quét mã bằng app ngân hàng bất kỳ để cộng tiền tức thì 24/7</Text>
              </View>

              {/* Quick Select Amounts */}
              <Text style={styles.inputSectionLabel}>Chọn nhanh số tiền nạp:</Text>
              <View style={styles.quickGrid}>
                {quickTopups.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickBtn, topupAmount === amt.toString() && styles.quickBtnActive]}
                    onPress={() => setTopupAmount(amt.toString())}
                  >
                    <Text style={[styles.quickBtnText, topupAmount === amt.toString() && styles.quickBtnTextActive]}>
                      {amt.toLocaleString('vi-VN')}đ
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Input */}
              <Text style={styles.inputSectionLabel}>Hoặc nhập số tiền khác:</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={topupAmount}
                  onChangeText={setTopupAmount}
                  placeholder="Nhập số tiền..."
                />
                <Text style={styles.inputUnit}>VNĐ</Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.confirmTopupBtn} onPress={handleConfirmTopup}>
                <Text style={styles.confirmTopupBtnText}>
                  Xác nhận nạp {parseInt(topupAmount || '0', 10).toLocaleString('vi-VN')}đ
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rút Tiền Về Ngân Hàng</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.withdrawTargetBox}>
              <Ionicons name="business" size={24} color="#0088FF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>MB Bank (Quân Đội)</Text>
                <Text style={{ fontSize: 13, color: '#64748B' }}>0988 *** 6789 - NGUYEN VAN TAI XE</Text>
              </View>
            </View>

            <Text style={styles.inputSectionLabel}>Số tiền muốn rút:</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder={`Tối đa ${(walletBalance - 50000).toLocaleString('vi-VN')}đ`}
              />
              <Text style={styles.inputUnit}>VNĐ</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, marginBottom: 20 }}>
              * Số dư tối thiểu cần duy trì trong ví ký quỹ là 50.000đ.
            </Text>

            <TouchableOpacity style={styles.confirmTopupBtn} onPress={handleConfirmWithdraw}>
              <Text style={styles.confirmTopupBtnText}>Xác nhận rút tiền</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  helpBtn: { padding: 4 },
  content: { padding: 16 },

  walletCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 6 },
  walletAmount: { fontSize: 32, fontWeight: '900', color: '#F8FAFC' },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  walletBadgeText: { fontSize: 12, fontWeight: '700', color: '#10B981' },

  alertNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  alertNoticeText: { flex: 1, fontSize: 12, color: '#FCD34D', lineHeight: 16 },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  topupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  topupBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  withdrawBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  statValGold: { fontSize: 18, fontWeight: '800', color: '#D97706', marginTop: 4 },
  statValGreen: { fontSize: 18, fontWeight: '800', color: '#059669', marginTop: 4 },
  statSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  bankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  bankCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  bankCardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginLeft: 8 },
  verifiedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  bankField: { fontSize: 13, color: '#64748B' },
  bankValue: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  bankValueBold: { fontSize: 14, fontWeight: '800', color: '#0F172A' },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  txCount: { fontSize: 12, color: '#94A3B8' },

  filterScroll: { flexDirection: 'row', marginBottom: 16 },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterChipTextActive: { color: '#FFFFFF' },

  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  txIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  txNote: { fontSize: 12, color: '#64748B', marginTop: 2 },
  txTime: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  txRight: { alignItems: 'flex-end', marginLeft: 8 },
  txAmount: { fontSize: 15, fontWeight: '800' },
  txGreen: { color: '#10B981' },
  txRed: { color: '#EF4444' },
  txBalAfter: { fontSize: 11, color: '#94A3B8', marginTop: 4 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrImage: { width: 220, height: 220, borderRadius: 12 },
  qrNote: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 10 },
  inputSectionLabel: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  quickBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickBtnActive: { backgroundColor: '#059669', borderColor: '#059669' },
  quickBtnText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  quickBtnTextActive: { color: '#FFFFFF' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  textInput: { flex: 1, height: 48, fontSize: 16, fontWeight: '700', color: '#0F172A' },
  inputUnit: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  confirmTopupBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmTopupBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  withdrawTargetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
});
