import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const name = params.name as string || 'Dịch vụ';
  const price = Number(params.price) || 0;
  const type = params.type as string || 'booking';
  const roomName = params.roomName as string;

  const handleConfirm = () => {
    router.replace('/travel');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/travel');
    }
  };

  return (
    <View style={[S.root, { backgroundColor: theme.background || '#F8FAFC' }]}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        
        <LinearGradient colors={['#0F172A', '#1E293B']} style={S.header}>
          <TouchableOpacity onPress={handleBack} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Xác nhận Thanh toán</Text>
          <View style={{ width: 32 }} />
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          
          <View style={S.card}>
            <Text style={S.sectionTitle}>Thông tin đặt chỗ</Text>
            <View style={S.row}>
              <Text style={S.label}>Dịch vụ:</Text>
              <Text style={S.value}>{name}</Text>
            </View>
            {roomName && (
              <View style={S.row}>
                <Text style={S.label}>Loại phòng:</Text>
                <Text style={S.value}>{roomName}</Text>
              </View>
            )}
            <View style={S.row}>
              <Text style={S.label}>Ngày nhận:</Text>
              <Text style={S.value}>Hôm nay</Text>
            </View>
            <View style={S.row}>
              <Text style={S.label}>Ngày trả:</Text>
              <Text style={S.value}>Ngày mai</Text>
            </View>
          </View>

          <View style={S.card}>
            <Text style={S.sectionTitle}>Thông tin liên hệ</Text>
            <View style={S.inputBox}>
              <Ionicons name="person-outline" size={20} color="#64748B" />
              <Text style={S.inputText}>Nguyễn Lý</Text>
            </View>
            <View style={S.inputBox}>
              <Ionicons name="call-outline" size={20} color="#64748B" />
              <Text style={S.inputText}>0912 345 678</Text>
            </View>
            <View style={S.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#64748B" />
              <Text style={S.inputText}>nguyenly@example.com</Text>
            </View>
          </View>

          <View style={S.card}>
            <Text style={S.sectionTitle}>Phương thức thanh toán</Text>
            <View style={S.paymentMethod}>
              <Ionicons name="wallet" size={24} color="#3B82F6" />
              <Text style={S.paymentText}>Ví VNPay</Text>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <View style={S.paymentMethodOff}>
              <Ionicons name="card-outline" size={24} color="#94A3B8" />
              <Text style={S.paymentTextOff}>Thẻ tín dụng / Ghi nợ</Text>
            </View>
          </View>

          <View style={S.summaryCard}>
            <View style={S.summaryRow}>
              <Text style={S.summaryLabel}>Tạm tính</Text>
              <Text style={S.summaryValue}>{price.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={S.summaryRow}>
              <Text style={S.summaryLabel}>Thuế, Phí dịch vụ</Text>
              <Text style={S.summaryValue}>{(price * 0.1).toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={[S.summaryRow, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12, marginTop: 4 }]}>
              <Text style={S.totalLabel}>Tổng cộng</Text>
              <Text style={S.totalValue}>{(price * 1.1).toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>

        </ScrollView>

        <View style={S.bottomBar}>
          <TouchableOpacity style={S.confirmBtn} onPress={handleConfirm}>
            <Text style={S.confirmBtnText}>Thanh toán & Đặt ngay</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#64748B' },
  value: { fontSize: 14, fontWeight: '600', color: '#1E293B', flex: 1, textAlign: 'right' },

  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  inputText: { fontSize: 15, color: '#334155', marginLeft: 12, fontWeight: '500' },

  paymentMethod: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 12 },
  paymentText: { fontSize: 15, fontWeight: '600', color: '#1E3A8A', flex: 1, marginLeft: 12 },
  paymentMethodOff: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  paymentTextOff: { fontSize: 15, fontWeight: '500', color: '#64748B', flex: 1, marginLeft: 12 },

  summaryCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 40, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#475569' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#EF4444' },

  bottomBar: { backgroundColor: '#FFF', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  confirmBtn: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
