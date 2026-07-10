import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, Platform, TouchableOpacity,
  Modal, TextInput, FlatList, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

export default function WalletScreen() {
  const [filter, setFilter] = useState('Tất cả');
  const [showAi, setShowAi] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [pin, setPin] = useState('');

  const filters = ['Tất cả', 'Thu nhập', 'Rút tiền', 'Thưởng', 'Tip', 'Deal giá', 'Chiết khấu'];
  
  const transactions = [
    { id: 'TX202607030005', type: 'tip', name: 'Tip', price: '+20.000đ', time: '11:30', date: '03/07/2026', color: '#10B981', icon: 'cash' },
    { id: 'TX202607030004', type: 'bonus', name: 'Thưởng', price: '+100.000đ', time: '11:20', date: '03/07/2026', color: '#D97706', icon: 'gift' },
    { id: 'TX202607030003', type: 'withdraw', name: 'Rút tiền', price: '-1.000.000đ', time: '11:05', date: '03/07/2026', color: '#EF4444', icon: 'business' },
    { id: 'TX202607030002', type: 'delivery', name: 'Giao hàng', price: '+68.000đ', time: '10:40', date: '03/07/2026', color: '#F97316', icon: 'cube' },
    { id: 'TX202607030001', type: 'ride', name: 'Chở khách', price: '+96.000đ', time: '09:30', date: '03/07/2026', color: '#3B82F6', icon: 'car', 
      detail: { paid: '120.000đ', discount: '24.000đ', deal: '0đ', tip: '0đ', total: '96.000đ' } 
    },
  ];

  const handleWithdraw = () => {
    if (pin === '123456') {
      alert('Rút tiền thành công!');
      setShowWithdraw(false);
      setPin('');
    } else {
      alert('Mã PIN không đúng!');
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'Tất cả') return true;
    if (filter === 'Thu nhập') return tx.type === 'ride' || tx.type === 'delivery';
    if (filter === 'Rút tiền') return tx.price.includes('-');
    if (filter === 'Thưởng') return tx.type === 'bonus';
    if (filter === 'Tip') return tx.type === 'tip';
    if (filter === 'Deal giá') return tx.type === 'deal';
    if (filter === 'Chiết khấu') return tx.type === 'discount';
    return true;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Wallet Balance Card */}
      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>Số dư khả dụng</Text>
        <Text style={styles.walletBalance}>2.560.000đ</Text>
        
        <View style={styles.walletRow}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="time" size={16} color="#FCD34D" />
            <Text style={styles.walletSubText}> Đang chờ đối soát</Text>
          </View>
          <Text style={styles.walletSubVal}>350.000đ</Text>
        </View>

        <View style={styles.walletRow}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="checkmark-circle" size={16} color="#34D399" />
            <Text style={styles.walletSubText}> Đã rút tháng này</Text>
          </View>
          <Text style={styles.walletSubVal}>15.800.000đ</Text>
        </View>

        <View style={styles.walletActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowWithdraw(true)}>
            <Ionicons name="card" size={20} color="#0F172A" />
            <Text style={styles.actionText}>Rút tiền</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, {backgroundColor: 'transparent', borderWidth: 1, borderColor: '#334155'}]}>
            <Ionicons name="receipt" size={20} color="#FFFFFF" />
            <Text style={[styles.actionText, {color: '#FFFFFF'}]}>Báo cáo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Analytics */}
      <TouchableOpacity style={styles.aiBtn} onPress={() => setShowAi(!showAi)} activeOpacity={0.8}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <Text style={styles.aiBtnText}>AI Phân tích Giao dịch</Text>
        </View>
        <Ionicons name={showAi ? "chevron-up" : "chevron-down"} size={20} color="#FFFFFF" />
      </TouchableOpacity>
      
      {showAi && (
        <Animated.View entering={FadeInUp} layout={Layout} style={styles.aiContent}>
          <Text style={styles.aiTitle}>Tuần này bạn kiếm được <Text style={{color:'#10B981'}}>6.200.000đ</Text> (↑ 12% so với tuần trước).</Text>
          <View style={styles.aiTipRow}>
            <View style={styles.aiDot} />
            <Text style={styles.aiTip}>Thu nhập cao nhất lúc <Text style={{fontWeight: 'bold'}}>11h-13h</Text> và <Text style={{fontWeight: 'bold'}}>17h-20h</Text>.</Text>
          </View>
          <View style={styles.aiTipRow}>
            <View style={styles.aiDot} />
            <Text style={styles.aiTip}>Nếu online thêm 2 giờ vào tối thứ 7, ước tính <Text style={{color:'#10B981', fontWeight: 'bold'}}>+350.000đ</Text>.</Text>
          </View>
        </Animated.View>
      )}

      {/* Filters */}
      <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{gap: 10, paddingRight: 20}}>
        {filters.map(f => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ví tài xế</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy giao dịch nào</Text>
          </View>
        }
        renderItem={({ item: tx }) => (
          <TouchableOpacity style={styles.txItem} onPress={() => setSelectedTx(tx)}>
            <View style={[styles.txIcon, { backgroundColor: tx.color + '20' }]}>
              <Ionicons name={tx.icon as any} size={20} color={tx.color} />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txName}>{tx.name}</Text>
              <Text style={styles.txTime}>{tx.time}</Text>
            </View>
            <Text style={[styles.txPrice, { color: tx.price.includes('-') ? '#0F172A' : '#10B981' }]}>{tx.price}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Transaction Detail Modal */}
      <Modal visible={!!selectedTx} animationType="slide" transparent={true} onRequestClose={() => setSelectedTx(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết giao dịch</Text>
              <TouchableOpacity onPress={() => setSelectedTx(null)}>
                <Ionicons name="close" size={28} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            {selectedTx && (
              <View style={styles.modalBody}>
                <View style={{alignItems: 'center', marginBottom: 24}}>
                  <View style={[styles.txIcon, { backgroundColor: selectedTx.color + '20', width: 64, height: 64, borderRadius: 32, marginBottom: 12 }]}>
                    <Ionicons name={selectedTx.icon as any} size={32} color={selectedTx.color} />
                  </View>
                  <Text style={styles.modalTxName}>{selectedTx.name}</Text>
                  <Text style={[styles.modalTxPrice, { color: selectedTx.price.includes('-') ? '#0F172A' : '#10B981' }]}>{selectedTx.price}</Text>
                  <Text style={styles.modalTxStatus}>Thành công • {selectedTx.time} {selectedTx.date}</Text>
                </View>

                {selectedTx.detail ? (
                  <View style={styles.receiptBox}>
                    <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Mã chuyến</Text><Text style={styles.receiptVal}>{selectedTx.id}</Text></View>
                    <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Khách thanh toán</Text><Text style={styles.receiptVal}>{selectedTx.detail.paid}</Text></View>
                    <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Chiết khấu (20%)</Text><Text style={[styles.receiptVal, {color: '#EF4444'}]}>-{selectedTx.detail.discount}</Text></View>
                    <View style={styles.receiptDivider} />
                    <View style={styles.receiptRow}><Text style={[styles.receiptLabel, {fontWeight:'bold'}]}>Thực nhận</Text><Text style={[styles.receiptVal, {fontWeight:'bold'}]}>{selectedTx.detail.total}</Text></View>
                  </View>
                ) : (
                  <View style={styles.receiptBox}>
                    <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Mã giao dịch</Text><Text style={styles.receiptVal}>{selectedTx.id}</Text></View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdraw} animationType="fade" transparent={true} onRequestClose={() => {setShowWithdraw(false); setPin('');}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ width: '100%' }}
            >
              <View style={[styles.modalContent, {padding: 24}]}>
                <Text style={styles.modalTitle}>Rút tiền về Ngân hàng</Text>
                <Text style={{color: '#64748B', marginBottom: 20}}>Nhập mã PIN (6 số) để xác thực giao dịch rút 2.500.000đ về Vietcombank (****8899).</Text>
                
                <TextInput 
                  style={styles.pinInput}
                  keyboardType="number-pad"
                  secureTextEntry={true}
                  maxLength={6}
                  placeholder="Nhập PIN (123456)"
                  value={pin}
                  onChangeText={setPin}
                  autoFocus
                />

                <View style={{flexDirection: 'row', gap: 12, marginTop: 20}}>
                  <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => {setShowWithdraw(false); setPin('');}}>
                    <Text style={styles.btnCancelText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleWithdraw}>
                    <Text style={styles.btnPrimaryText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  content: { padding: 20 },
  headerContainer: { width: '100%' },
  
  walletCard: { backgroundColor: '#0F172A', padding: 24, borderRadius: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, marginBottom: 16 },
  walletLabel: { color: '#94A3B8', fontSize: 15, marginBottom: 4 },
  walletBalance: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  walletSubText: { color: '#CBD5E1', fontSize: 14 },
  walletSubVal: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  walletActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  actionBtn: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  actionText: { fontWeight: 'bold', color: '#0F172A' },

  aiBtn: { backgroundColor: '#D97706', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, elevation: 4 },
  aiBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  aiContent: { backgroundColor: '#FFFBEB', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 24 },
  aiTitle: { fontSize: 15, color: '#92400E', marginBottom: 12 },
  aiTipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D97706', marginTop: 6, marginRight: 8 },
  aiTip: { flex: 1, color: '#92400E', fontSize: 14, lineHeight: 20 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  filterScroll: { marginBottom: 16, maxHeight: 40 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 10, height: 36, justifyContent: 'center' },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterText: { color: '#475569', fontWeight: '500', fontSize: 14 },
  filterTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

  txList: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  txItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  txInfo: { flex: 1 },
  txName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  txTime: { fontSize: 13, color: '#64748B' },
  txPrice: { fontSize: 16, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: '50%', paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  modalBody: { padding: 20 },
  modalTxName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  modalTxPrice: { fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  modalTxStatus: { fontSize: 14, color: '#64748B' },
  receiptBox: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  receiptLabel: { color: '#64748B', fontSize: 15 },
  receiptVal: { color: '#0F172A', fontSize: 15, fontWeight: '500' },
  receiptDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },

  pinInput: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 16, fontSize: 24, letterSpacing: 8, textAlign: 'center', fontWeight: 'bold', color: '#0F172A' },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnCancel: { backgroundColor: '#F1F5F9' },
  btnCancelText: { color: '#0F172A', fontWeight: 'bold', fontSize: 16 },
  btnPrimary: { backgroundColor: '#0F172A' },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 15 },
});
