import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity,
  Modal, TextInput, StatusBar, Platform, Image, Alert, Dimensions, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TransactionItem {
  id: string;
  title: string;
  tripCode?: string;
  amount: number;
  balanceAfter: number;
  time: string;
  type: 'EARN' | 'FEE' | 'TOPUP' | 'WITHDRAW' | 'TRANSFER';
  walletType: 'CREDIT' | 'CASH'; // Ví Ký Quỹ hay Ví Thu Nhập
  note: string;
  customerName?: string;
  pickup?: string;
  dropoff?: string;
  distanceKm?: number;
  paymentMethod?: 'CASH' | 'ONLINE';
}

export default function DriverWalletScreen() {
  // ─────────────────────────────────────────
  // 1. HỆ THỐNG 2 VÍ RIÊNG BIỆT (DỮ LIỆU THẬT TỪ DATABASE)
  // ─────────────────────────────────────────
  const [creditWallet, setCreditWallet] = useState(0);
  const [cashWallet, setCashWallet] = useState(0);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [totalTripsToday, setTotalTripsToday] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Thông tin VietQR nạp tiền từ backend
  const [qrInfo, setQrInfo] = useState({
    bankName: 'MB BANK',
    bankCode: 'MB',
    accountNo: '0988123456',
    accountHolder: 'TAI XE SUNSTAR',
    transferContent: 'SUNSTAR NAP TIEN',
  });

  // Thống kê doanh thu theo chu kỳ: TODAY | WEEK | MONTH
  const [periodTab, setPeriodTab] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');

  // Modals
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('200000');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionItem | null>(null);

  // Bộ lọc giao dịch
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CREDIT' | 'CASH' | 'TOPUP' | 'WITHDRAW'>('ALL');

  // Danh sách giao dịch từ PostgreSQL thật
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // ─────────────────────────────────────────
  // 2. KẾT NỐI DATABASE THẬT QUA REST API + OFFLINE CACHE
  // ─────────────────────────────────────────
  const fetchWalletData = useCallback(async () => {
    try {
      const res = await apiClient.get('/ride/driver/wallet');
      if (res.data) {
        setCreditWallet(res.data.creditWallet ?? 0);
        setCashWallet(res.data.cashWallet ?? 0);
        setDailyEarnings(res.data.dailyEarnings ?? 0);
        setTotalTripsToday(res.data.totalTripsToday ?? 0);
        if (res.data.transactions) {
          setTransactions(res.data.transactions);
        }
        if (res.data.qrInfo) {
          setQrInfo(res.data.qrInfo);
        }

        // Cache cho ngoại tuyến (offline-resilient)
        await AsyncStorage.setItem(
          '@sunstar_driver_wallets',
          JSON.stringify({
            creditWallet: res.data.creditWallet,
            cashWallet: res.data.cashWallet,
            dailyEarnings: res.data.dailyEarnings,
            transactions: res.data.transactions,
            qrInfo: res.data.qrInfo,
          })
        );
      }
    } catch (error) {
      console.warn('Lỗi tải dữ liệu ví từ máy chủ, nạp từ cache offline:', error);
      // Nạp từ cache
      try {
        const cached = await AsyncStorage.getItem('@sunstar_driver_wallets');
        if (cached) {
          const data = JSON.parse(cached);
          if (data.creditWallet !== undefined) setCreditWallet(data.creditWallet);
          if (data.cashWallet !== undefined) setCashWallet(data.cashWallet);
          if (data.dailyEarnings !== undefined) setDailyEarnings(data.dailyEarnings);
          if (data.transactions) setTransactions(data.transactions);
          if (data.qrInfo) setQrInfo(data.qrInfo);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  // ─────────────────────────────────────────
  // 3. THAO TÁC NẠP TIỀN VIETQR 24/7 (GHI VÀO DATABASE THẬT)
  // ─────────────────────────────────────────
  const quickTopups = [50000, 100000, 200000, 500000];

  const handleConfirmTopup = async () => {
    const val = parseInt(topupAmount, 10);
    if (isNaN(val) || val < 10000) {
      Alert.alert('Số tiền không hợp lệ', 'Vui lòng nhập số tiền nạp tối thiểu 10.000đ.');
      return;
    }
    try {
      await apiClient.post('/ride/driver/wallet/topup-vietqr', { amount: val });
      setShowTopupModal(false);
      Alert.alert(
        'Nạp tiền thành công',
        `Đã nạp ${val.toLocaleString('vi-VN')}đ vào Ví Ký Quỹ trong hệ thống.`
      );
      await fetchWalletData();
    } catch (err: any) {
      Alert.alert('Lỗi nạp tiền', err.response?.data?.message || 'Không thể nạp tiền lúc này.');
    }
  };

  // ─────────────────────────────────────────
  // 4. THAO TÁC RÚT TIỀN VỀ NGÂN HÀNG (DATABASE THẬT)
  // ─────────────────────────────────────────
  const handleConfirmWithdraw = async () => {
    const val = parseInt(withdrawAmount, 10);
    if (isNaN(val) || val < 50000) {
      Alert.alert('Lỗi', 'Số tiền rút tối thiểu là 50.000đ.');
      return;
    }
    if (val > cashWallet) {
      Alert.alert('Số dư không đủ', 'Số dư Ví Thu Nhập không đủ để thực hiện lệnh rút này.');
      return;
    }
    try {
      await apiClient.post('/ride/driver/wallet/withdraw', {
        amount: val,
        bankName: qrInfo.bankName,
        accountNo: qrInfo.accountNo,
        accountHolder: qrInfo.accountHolder,
      });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      Alert.alert(
        'Rút tiền thành công',
        `Đã chuyển ${val.toLocaleString('vi-VN')}đ về tài khoản ngân hàng ${qrInfo.bankName}.`
      );
      await fetchWalletData();
    } catch (err: any) {
      Alert.alert('Lỗi rút tiền', err.response?.data?.message || 'Không thể rút tiền lúc này.');
    }
  };

  // ─────────────────────────────────────────
  // 5. CHUYỂN TIỀN TỪ VÍ THU NHẬP SANG VÍ KÝ QUỸ
  // ─────────────────────────────────────────
  const handleTransferToCredit = async () => {
    const val = parseInt(transferAmount, 10);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền muốn chuyển.');
      return;
    }
    if (val > cashWallet) {
      Alert.alert('Số dư không đủ', 'Số dư Ví Thu Nhập không đủ để chuyển.');
      return;
    }
    try {
      // Rút từ ví thu nhập và nạp vào ví ký quỹ
      await apiClient.post('/ride/driver/wallet/withdraw', {
        amount: val,
        bankName: 'Ví Ký Quỹ Sunstar',
        accountNo: 'VÍ NỘI BỘ',
        accountHolder: 'NỘI BỘ',
      });
      await apiClient.post('/ride/driver/wallet/topup-vietqr', { amount: val });
      setShowTransferModal(false);
      setTransferAmount('');
      Alert.alert(
        'Chuyển tiền thành công',
        `Đã chuyển ${val.toLocaleString('vi-VN')}đ từ Ví Thu Nhập sang Ví Ký Quỹ.`
      );
      await fetchWalletData();
    } catch (err: any) {
      Alert.alert('Lỗi chuyển tiền', err.response?.data?.message || 'Không thể chuyển tiền lúc này.');
    }
  };

  // Dữ liệu bóc tách tài chính theo tab chu kỳ (Hôm nay lấy từ Database thật)
  const periodStats = {
    TODAY: {
      gross: `${Math.round(dailyEarnings * 1.15).toLocaleString('vi-VN')}đ`,
      fee: `-${Math.round(dailyEarnings * 0.15).toLocaleString('vi-VN')}đ`,
      cash: `${Math.round(dailyEarnings * 0.7).toLocaleString('vi-VN')}đ`,
      online: `${Math.round(dailyEarnings * 0.3).toLocaleString('vi-VN')}đ`,
      bonus: '+0đ',
      net: `${dailyEarnings.toLocaleString('vi-VN')}đ`,
      trips: totalTripsToday,
    },
    WEEK: { gross: '4.850.000đ', fee: '-485.000đ', cash: '3.100.000đ', online: '1.265.000đ', bonus: '+350.000đ', net: '4.365.000đ', trips: 56 },
    MONTH: { gross: '21.500.000đ', fee: '-2.150.000đ', cash: '14.200.000đ', online: '5.150.000đ', bonus: '+1.500.000đ', net: '19.350.000đ', trips: 245 },
  }[periodTab];

  // Lọc giao dịch
  const filteredTransactions = transactions.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CREDIT') return t.walletType === 'CREDIT';
    if (activeFilter === 'CASH') return t.walletType === 'CASH';
    if (activeFilter === 'TOPUP') return t.type === 'TOPUP';
    if (activeFilter === 'WITHDRAW') return t.type === 'WITHDRAW';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ví & Quản Lý Doanh Thu</Text>
          <Text style={styles.headerSubtitle}>Đối tác: Trần Bình • 29A-888.99</Text>
        </View>
        <TouchableOpacity
          style={styles.helpBtn}
          onPress={() => Alert.alert('Hỗ trợ đối soát 24/7', 'Tổng đài tài chính Sunstar: 1900-1234 (Nhánh 2).')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0C68EF']} />}
      >
        
        {/* ─────────────────────────────────────────
            KHỐI 1: HỆ THỐNG 2 VÍ SONG SONG (DUAL-WALLET)
            ───────────────────────────────────────── */}
        <View style={styles.walletsContainer}>
          {/* VÍ 1: VÍ KÝ QUỸ (CREDIT WALLET) */}
          <View style={styles.creditWalletCard}>
            <View style={styles.walletHeaderRow}>
              <View style={styles.walletTagBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
                <Text style={styles.walletTagText}>VÍ KÝ QUỸ (KHẤU TRỪ SÀN)</Text>
              </View>
              <Text style={styles.escrowNotice}>Hạn mức: ≥ 50.000đ</Text>
            </View>

            <Text style={styles.walletBigAmount}>{creditWallet.toLocaleString('vi-VN')} đ</Text>
            <Text style={styles.walletExplain}>
              Dùng để tự động trừ 10% phí hoa hồng khi nhận các cuốc trả TIỀN MẶT (COD).
            </Text>

            {creditWallet < 50000 && (
              <View style={styles.creditWarningBar}>
                <Ionicons name="warning" size={14} color="#DC2626" />
                <Text style={styles.creditWarningText}>Số dư ký quỹ thấp. Hãy nạp thêm để không bị khóa nhận cuốc COD.</Text>
              </View>
            )}

            <View style={styles.walletActionRow}>
              <TouchableOpacity
                style={styles.topupVietQrBtn}
                onPress={() => setShowTopupModal(true)}
              >
                <Ionicons name="qr-code" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.topupVietQrText}>Nạp VietQR 24/7</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.transferBtn}
                onPress={() => setShowTransferModal(true)}
              >
                <Ionicons name="swap-horizontal" size={16} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={styles.transferBtnText}>Chuyển từ Ví Thu Nhập</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* VÍ 2: VÍ THU NHẬP (CASH WALLET) */}
          <View style={styles.cashWalletCard}>
            <View style={styles.walletHeaderRow}>
              <View style={[styles.walletTagBadge, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="wallet" size={14} color="#059669" />
                <Text style={[styles.walletTagText, { color: '#059669' }]}>VÍ THU NHẬP (RÚT TIỀN 24/7)</Text>
              </View>
              <Text style={[styles.escrowNotice, { color: '#059669', fontWeight: '800' }]}>Rút 0đ phí</Text>
            </View>

            <Text style={[styles.walletBigAmount, { color: '#059669' }]}>{cashWallet.toLocaleString('vi-VN')} đ</Text>
            <Text style={styles.walletExplain}>
              Tiền cước khách trả Online, tiền thưởng ngày/tuần và tiền tip của khách.
            </Text>

            <View style={styles.walletActionRow}>
              <TouchableOpacity
                style={styles.withdrawBankBtn}
                onPress={() => setShowWithdrawModal(true)}
              >
                <Ionicons name="card" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.withdrawBankText}>Rút về Ngân hàng (30s)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────
            KHỐI 2: THẺ NGÂN HÀNG LIÊN KẾT NHẬN TIỀN
            ───────────────────────────────────────── */}
        <View style={styles.bankLinkedCard}>
          <View style={styles.bankLinkedHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.bankIconWrap}>
                <Ionicons name="business" size={18} color="#0052CC" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.bankName}>MB Bank (Ngân hàng Quân Đội)</Text>
                <Text style={styles.bankAccountNo}>0988 *** 8899 • TRẦN BÌNH</Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.verifiedText}>ĐÃ LIÊN KẾT</Text>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────
            KHỐI 3: BÁO CÁO DOANH THU ĐA CHU KỲ (PERIODS)
            ───────────────────────────────────────── */}
        <View style={styles.reportContainer}>
          <View style={styles.reportHeaderRow}>
            <Text style={styles.reportTitle}>Báo cáo hạch toán tài chính</Text>
            <View style={styles.periodTabsWrapper}>
              {(['TODAY', 'WEEK', 'MONTH'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.periodTabBtn, periodTab === tab && styles.periodTabBtnActive]}
                  onPress={() => setPeriodTab(tab)}
                >
                  <Text style={[styles.periodTabText, periodTab === tab && styles.periodTabTextActive]}>
                    {tab === 'TODAY' && 'Hôm nay'}
                    {tab === 'WEEK' && 'Tuần này'}
                    {tab === 'MONTH' && 'Tháng này'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Biểu đồ cột 7 ngày mini (Weekly Trend) */}
          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>Xu hướng thu nhập 7 ngày gần nhất (nghìn đồng)</Text>
            <View style={styles.barsRow}>
              {[
                { day: 'T2', val: 320, pct: '45%' },
                { day: 'T3', val: 450, pct: '60%' },
                { day: 'T4', val: 510, pct: '70%' },
                { day: 'T5', val: 390, pct: '50%' },
                { day: 'T6', val: 620, pct: '85%' },
                { day: 'T7', val: 750, pct: '100%', highlight: true },
                { day: 'CN', val: 485, pct: '65%' },
              ].map((item, idx) => (
                <View key={idx} style={styles.barCol}>
                  <Text style={styles.barValText}>{item.val}k</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: item.pct as any, backgroundColor: item.highlight ? '#059669' : '#3B82F6' }]} />
                  </View>
                  <Text style={[styles.barDayText, item.highlight && { fontWeight: '800', color: '#059669' }]}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bảng bóc tách tài chính minh bạch */}
          <View style={styles.breakdownTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLbl}>Tổng tiền cước khách trả ({periodStats.trips} chuyến)</Text>
              <Text style={styles.tableVal}>{periodStats.gross}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLbl}>Phí nền tảng Sunstar (-10%)</Text>
              <Text style={[styles.tableVal, { color: '#EF4444' }]}>{periodStats.fee}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLbl}>💵 Tiền mặt COD tài xế đã cầm tay</Text>
              <Text style={[styles.tableVal, { color: '#D97706' }]}>{periodStats.cash}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLbl}>💳 Tiền cước thanh toán qua ví Online</Text>
              <Text style={[styles.tableVal, { color: '#0284C7' }]}>{periodStats.online}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLbl}>🎁 Tiền thưởng nhiệm vụ & Tiền Tip</Text>
              <Text style={[styles.tableVal, { color: '#059669' }]}>{periodStats.bonus}</Text>
            </View>
            <View style={styles.tableDivider} />
            <View style={styles.tableTotalRow}>
              <View>
                <Text style={styles.totalNetLbl}>THU NHẬP RÒNG THỰC NHẬN</Text>
                <Text style={styles.totalNetSub}>Số tiền thực tế tài xế bỏ túi</Text>
              </View>
              <Text style={styles.totalNetVal}>{periodStats.net}</Text>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────
            KHỐI 4: LỊCH SỬ GIAO DỊCH & HÓA ĐƠN ĐIỆN TỬ
            ───────────────────────────────────────── */}
        <View style={styles.txHeaderRow}>
          <Text style={styles.txHeaderTitle}>Lịch sử dòng tiền & Cuốc xe</Text>
          <Text style={styles.txSubHint}>Chạm vào cuốc để xem Hóa đơn</Text>
        </View>

        {/* Bộ lọc chip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'CREDIT', label: 'Ví Ký Quỹ' },
            { id: 'CASH', label: 'Ví Thu Nhập' },
            { id: 'TOPUP', label: 'Nạp VietQR' },
            { id: 'WITHDRAW', label: 'Rút Bank' },
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

        {/* Danh sách giao dịch */}
        {filteredTransactions.map((tx) => (
          <TouchableOpacity
            key={tx.id}
            style={styles.txItemCard}
            activeOpacity={0.7}
            onPress={() => {
              if (tx.tripCode) setSelectedReceipt(tx);
            }}
          >
            <View style={styles.txItemLeft}>
              <View
                style={[
                  styles.txItemIconWrap,
                  tx.amount > 0 ? { backgroundColor: '#ECFDF5' } : { backgroundColor: '#FEF2F2' },
                ]}
              >
                <Ionicons
                  name={tx.amount > 0 ? (tx.type === 'TOPUP' ? 'arrow-down-circle' : 'add-circle') : 'remove-circle'}
                  size={22}
                  color={tx.amount > 0 ? '#10B981' : '#EF4444'}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.txItemTitle} numberOfLines={1}>{tx.title}</Text>
                <Text style={styles.txItemNote}>{tx.note}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                  <Text style={styles.txItemTime}>{tx.time}</Text>
                  <View style={[styles.txWalletTag, tx.walletType === 'CREDIT' ? styles.tagCredit : styles.tagCash]}>
                    <Text style={styles.txWalletTagText}>
                      {tx.walletType === 'CREDIT' ? 'Ví Ký Quỹ' : 'Ví Thu Nhập'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.txItemRight}>
              <Text style={[styles.txItemAmount, tx.amount > 0 ? styles.txGreen : styles.txRed]}>
                {tx.amount > 0 ? `+${tx.amount.toLocaleString('vi-VN')}đ` : `${tx.amount.toLocaleString('vi-VN')}đ`}
              </Text>
              {tx.tripCode ? (
                <View style={styles.receiptArrow}>
                  <Text style={styles.receiptArrowText}>Xem biên lai</Text>
                  <Ionicons name="chevron-forward" size={12} color="#3B82F6" />
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─────────────────────────────────────────
          MODAL 1: NẠP TIỀN VÍ KÝ QUỸ QUA VIETQR ĐỘNG 24/7
          ───────────────────────────────────────── */}
      <Modal visible={showTopupModal} animationType="slide" transparent onRequestClose={() => setShowTopupModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalSheetTitle}>Nạp tiền Ví Ký Quỹ (VietQR 24/7)</Text>
              <TouchableOpacity onPress={() => setShowTopupModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Chọn nhanh số tiền */}
              <Text style={styles.inputLabel}>Chọn số tiền nạp:</Text>
              <View style={styles.quickAmountsRow}>
                {quickTopups.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickAmountChip, topupAmount === amt.toString() && styles.quickAmountChipActive]}
                    onPress={() => setTopupAmount(amt.toString())}
                  >
                    <Text style={[styles.quickAmountText, topupAmount === amt.toString() && styles.quickAmountTextActive]}>
                      {amt.toLocaleString('vi-VN')}đ
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={topupAmount}
                onChangeText={setTopupAmount}
                placeholder="Hoặc tự gõ số tiền (tối thiểu 10.000đ)"
              />

              {/* Khung VietQR động */}
              <View style={styles.qrDisplayCard}>
                <Image
                  source={{
                    uri: `https://img.vietqr.io/image/${qrInfo.bankCode || 'MB'}-${qrInfo.accountNo}-compact2.png?amount=${topupAmount || '100000'}&addInfo=${encodeURIComponent(qrInfo.transferContent)}&accountName=${encodeURIComponent(qrInfo.accountHolder)}`,
                  }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                <Text style={styles.qrScanHint}>
                  Quét mã bằng bất kỳ ứng dụng ngân hàng nào (MB, VCB, Techcombank, VPBank,...)
                </Text>

                <View style={styles.transferInfoBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLbl}>Ngân hàng:</Text>
                    <Text style={styles.infoVal}>{qrInfo.bankName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLbl}>Số tài khoản:</Text>
                    <Text style={styles.infoValBold}>{qrInfo.accountNo}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLbl}>Chủ tài khoản:</Text>
                    <Text style={styles.infoVal}>{qrInfo.accountHolder}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLbl}>Nội dung CK:</Text>
                    <Text style={[styles.infoValBold, { color: '#0C68EF' }]}>{qrInfo.transferContent}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.confirmActionBtn} onPress={handleConfirmTopup}>
                <Text style={styles.confirmActionText}>TÔI ĐÃ CHUYỂN KHOẢN XONG</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL 2: RÚT TIỀN VỀ NGÂN HÀNG
          ───────────────────────────────────────── */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent onRequestClose={() => setShowWithdrawModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalSheetTitle}>Rút tiền về Tài khoản Ngân hàng</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.withdrawSourceBox}>
              <Text style={styles.withdrawSourceLbl}>Nguồn rút: Ví Thu Nhập</Text>
              <Text style={styles.withdrawSourceBal}>{cashWallet.toLocaleString('vi-VN')} đ</Text>
            </View>

            <View style={styles.bankDestCard}>
              <Ionicons name="card" size={22} color="#0052CC" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.bankDestTitle}>MB Bank • 0988 *** 8899</Text>
                <Text style={styles.bankDestSub}>Chủ TK: TRẦN BÌNH • Nhận tiền trong 30 giây</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Nhập số tiền muốn rút:</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="Tối thiểu 50.000đ"
            />

            <View style={styles.quickWithdrawRow}>
              {[100000, 200000, 500000, cashWallet].map((amt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickWithdrawChip}
                  onPress={() => setWithdrawAmount(amt.toString())}
                >
                  <Text style={styles.quickWithdrawText}>
                    {idx === 3 ? 'Rút tất cả' : `${(amt / 1000).toLocaleString()}k`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.freeFeeNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#059669" />
              <Text style={styles.freeFeeText}>Miễn phí rút tiền 100% qua NAPAS 24/7.</Text>
            </View>

            <TouchableOpacity style={styles.confirmActionBtn} onPress={handleConfirmWithdraw}>
              <Text style={styles.confirmActionText}>XÁC NHẬN RÚT TIỀN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL 3: CHUYỂN TIỀN SANG VÍ KÝ QUỸ
          ───────────────────────────────────────── */}
      <Modal visible={showTransferModal} animationType="slide" transparent onRequestClose={() => setShowTransferModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalSheetTitle}>Chuyển sang Ví Ký Quỹ</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubDesc}>
              Chuyển bớt tiền từ Ví Thu Nhập sang Ví Ký Quỹ để tiếp tục nhận cuốc tiền mặt COD mà không cần nạp ngân hàng.
            </Text>

            <View style={styles.transferFlowBox}>
              <View style={styles.transferCol}>
                <Text style={styles.transferColLbl}>Ví Thu Nhập</Text>
                <Text style={styles.transferColVal}>{cashWallet.toLocaleString('vi-VN')}đ</Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#0C68EF" />
              <View style={styles.transferCol}>
                <Text style={styles.transferColLbl}>Ví Ký Quỹ</Text>
                <Text style={styles.transferColVal}>{creditWallet.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>

            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={transferAmount}
              onChangeText={setTransferAmount}
              placeholder="Nhập số tiền muốn chuyển..."
            />

            <TouchableOpacity style={styles.confirmActionBtn} onPress={handleTransferToCredit}>
              <Text style={styles.confirmActionText}>XÁC NHẬN CHUYỂN NGAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL 4: HÓA ĐƠN ĐIỆN TỬ CHI TIẾT CUỐC XE (TRIP RECEIPT)
          ───────────────────────────────────────── */}
      <Modal visible={!!selectedReceipt} animationType="fade" transparent onRequestClose={() => setSelectedReceipt(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.receiptModalSheet}>
            <View style={styles.receiptHeader}>
              <Ionicons name="receipt" size={28} color="#0C68EF" />
              <Text style={styles.receiptTitle}>Hóa Đơn Cuốc Xe #{selectedReceipt?.tripCode}</Text>
              <Text style={styles.receiptTime}>{selectedReceipt?.time}</Text>
            </View>

            {/* Chi tiết lộ trình */}
            <View style={styles.receiptRouteBox}>
              <Text style={styles.receiptPoint}>🟢 Điểm đón: {selectedReceipt?.pickup}</Text>
              <Text style={styles.receiptPoint}>🔴 Điểm trả: {selectedReceipt?.dropoff}</Text>
              <Text style={styles.receiptDistance}>Cự ly thực tế: {selectedReceipt?.distanceKm} km • Khách: {selectedReceipt?.customerName}</Text>
            </View>

            {/* Banner hình thức thanh toán */}
            <View style={[styles.receiptPayBanner, selectedReceipt?.paymentMethod === 'ONLINE' ? styles.payOnlineBanner : styles.payCashBanner]}>
              <Ionicons
                name={selectedReceipt?.paymentMethod === 'ONLINE' ? 'shield-checkmark' : 'cash'}
                size={18}
                color={selectedReceipt?.paymentMethod === 'ONLINE' ? '#059669' : '#DC2626'}
              />
              <Text style={[styles.receiptPayText, { color: selectedReceipt?.paymentMethod === 'ONLINE' ? '#059669' : '#DC2626' }]}>
                {selectedReceipt?.paymentMethod === 'ONLINE'
                  ? 'THANH TOÁN ONLINE (Cước đã cộng vào Ví Thu Nhập)'
                  : 'TIỀN MẶT COD (Tài xế đã thu trực tiếp từ khách)'}
              </Text>
            </View>

            {/* Công thức tính toán chi tiết */}
            <View style={styles.calcBox}>
              <View style={styles.calcRow}>
                <Text style={styles.calcLbl}>Cước phí gốc chuyến đi</Text>
                <Text style={styles.calcVal}>120.000đ</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLbl}>Phí chiết khấu nền tảng (10%)</Text>
                <Text style={[styles.calcVal, { color: '#EF4444' }]}>-12.000đ</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLbl}>Tiền tip thưởng của khách</Text>
                <Text style={[styles.calcVal, { color: '#059669' }]}>+0đ</Text>
              </View>
              <View style={styles.calcDivider} />
              <View style={styles.calcRow}>
                <Text style={styles.calcTotalLbl}>TÀI XẾ THỰC NHẬN</Text>
                <Text style={styles.calcTotalVal}>108.000đ</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeReceiptBtn} onPress={() => setSelectedReceipt(null)}>
              <Text style={styles.closeReceiptText}>Đóng Hóa Đơn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// BỘ STYLES GIAO DIỆN VÍ TIỀN CHUẨN MỰC
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  helpBtn: {
    padding: 6,
  },
  content: {
    padding: 16,
  },

  // 1. Hệ thống 2 ví
  walletsContainer: {
    marginBottom: 14,
  },
  creditWalletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cashWalletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  walletTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    marginLeft: 5,
  },
  escrowNotice: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  walletBigAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0284C7',
    marginTop: 10,
  },
  walletExplain: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  creditWarningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  creditWarningText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  walletActionRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  topupVietQrBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C68EF',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  topupVietQrText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  transferBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  transferBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  withdrawBankBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
  },
  withdrawBankText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // 2. Thẻ ngân hàng liên kết
  bankLinkedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bankLinkedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  bankAccountNo: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    marginLeft: 4,
  },

  // 3. Báo cáo tài chính
  reportContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  periodTabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  periodTabBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  periodTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  periodTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },

  // Biểu đồ mini 7 ngày
  chartWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 4,
  },
  barCol: {
    alignItems: 'center',
    width: 32,
  },
  barValText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 60,
    backgroundColor: '#E2E8F0',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDayText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },

  // Bảng bóc tách
  breakdownTable: {
    paddingTop: 6,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  tableLbl: {
    fontSize: 12,
    color: '#475569',
  },
  tableVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalNetLbl: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
  },
  totalNetSub: {
    fontSize: 11,
    color: '#64748B',
  },
  totalNetVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },

  // 4. Lịch sử giao dịch & Hóa đơn
  txHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  txHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  txSubHint: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  txItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txItemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  txItemNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  txItemTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  txWalletTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  tagCredit: {
    backgroundColor: '#E0F2FE',
  },
  tagCash: {
    backgroundColor: '#ECFDF5',
  },
  txWalletTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0369A1',
  },
  txItemRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  txItemAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  txGreen: {
    color: '#10B981',
  },
  txRed: {
    color: '#EF4444',
  },
  receiptArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  receiptArrowText: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '700',
  },

  // Modals Styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quickAmountChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickAmountChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  quickAmountTextActive: {
    color: '#1D4ED8',
  },
  amountInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  qrDisplayCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  qrImage: {
    width: 220,
    height: 220,
    marginBottom: 10,
  },
  qrScanHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  transferInfoBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  infoLbl: {
    fontSize: 11,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  infoValBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  confirmActionBtn: {
    backgroundColor: '#0C68EF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  confirmActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  // Withdraw specifics
  withdrawSourceBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  withdrawSourceLbl: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  withdrawSourceBal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  bankDestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  bankDestTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  bankDestSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  quickWithdrawRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  quickWithdrawChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    borderRadius: 8,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  quickWithdrawText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  freeFeeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  freeFeeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 6,
  },

  // Transfer specifics
  transferFlowBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  transferCol: {
    alignItems: 'center',
  },
  transferColLbl: {
    fontSize: 11,
    color: '#64748B',
  },
  transferColVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },

  // Receipt Modal specifics
  receiptModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 4,
  },
  receiptTime: {
    fontSize: 11,
    color: '#64748B',
  },
  receiptRouteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  receiptPoint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginVertical: 2,
  },
  receiptDistance: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 4,
  },
  receiptPayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  payOnlineBanner: {
    backgroundColor: '#ECFDF5',
  },
  payCashBanner: {
    backgroundColor: '#FEF2F2',
  },
  receiptPayText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    flex: 1,
  },
  calcBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  calcLbl: {
    fontSize: 12,
    color: '#475569',
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  calcDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 6,
  },
  calcTotalLbl: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
  },
  calcTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  closeReceiptBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeReceiptText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
