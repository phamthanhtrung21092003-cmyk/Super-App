import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const T = {
  black: '#0F172A',
  white: '#FFFFFF',
  bg: '#F8FAFC',
  sub: '#64748B',
  border: '#E2E8F0',
  accent: '#E11D48', // Red for admin control feel
};

export default function AdminScreen() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'shops' | 'users' | 'logs'>('shops');

  const [pendingShops, setPendingShops] = useState([
    { id: 'S001', name: 'Mỹ Phẩm Korea Authentic', owner: 'Trần Thị Loan', category: 'Làm đẹp', date: '29/06/2026' },
    { id: 'S002', name: 'Đồ Gia Dụng Cực Rẻ', owner: 'Nguyễn Văn Đạt', category: 'Gia dụng', date: '29/06/2026' }
  ]);

  const [users, setUsers] = useState([
    { id: 'U001', name: 'Phạm Thành Trung', role: 'Khách hàng', status: 'Hoạt động' },
    { id: 'U002', name: 'Apple Premium Store', role: 'Người bán', status: 'Hoạt động' },
    { id: 'U003', name: 'Nguyễn Đức Anh', role: 'Đơn vị vận chuyển', status: 'Bị khoá' }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { time: '11:24:15', msg: 'Người bán Apple Premium vừa đăng bán sản phẩm mới' },
    { time: '10:50:32', msg: 'Hệ thống tự động trừ kho 1 sản phẩm iPhone 15 Pro Max' },
    { time: '09:12:45', msg: 'Khách hàng Phạm Thành Trung thanh toán đơn hàng thành công qua ví' },
    { time: '08:30:10', msg: 'Shop Đồ Gia Dụng Cực Rẻ gửi yêu cầu xét duyệt gian hàng mới' }
  ]);

  const handleApproveShop = (id: string, name: string) => {
    setPendingShops(pendingShops.filter(s => s.id !== id));
    setAuditLogs([
      { time: 'Vừa xong', msg: `Admin duyệt kích hoạt gian hàng: ${name}` },
      ...auditLogs
    ]);
    Alert.alert('Thành công', `Đã duyệt kích hoạt thành công gian hàng ${name}!`);
  };

  const handleRejectShop = (id: string, name: string) => {
    setPendingShops(pendingShops.filter(s => s.id !== id));
    setAuditLogs([
      { time: 'Vừa xong', msg: `Admin từ chối kích hoạt gian hàng: ${name}` },
      ...auditLogs
    ]);
    Alert.alert('Đã từ chối', `Đã từ chối cấp phép xét duyệt gian hàng ${name}`);
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'Hoạt động' ? 'Bị khoá' : 'Hoạt động';
        setAuditLogs([
          { time: 'Vừa xong', msg: `Admin thay đổi trạng thái user ${u.name} thành: ${newStatus}` },
          ...auditLogs
        ]);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  return (
    <View style={S.root}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={T.bg} translucent={false} />
        
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.black} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>HỆ THỐNG ADMIN</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Admin Metric Panel */}
        <View style={S.metricsPanel}>
          <View style={S.metricCard}>
            <Text style={S.metricVal}>384</Text>
            <Text style={S.metricLbl}>Tổng Shop</Text>
          </View>
          <View style={S.metricDivider} />
          <View style={S.metricCard}>
            <Text style={S.metricVal}>2.8 tỷđ</Text>
            <Text style={S.metricLbl}>Tổng GMV</Text>
          </View>
          <View style={S.metricDivider} />
          <View style={S.metricCard}>
            <Text style={[S.metricVal, { color: T.accent }]}>{pendingShops.length}</Text>
            <Text style={S.metricLbl}>Chờ duyệt</Text>
          </View>
        </View>

        {/* Tab Selection */}
        <View style={S.tabBar}>
          {[
            { key: 'shops', label: 'Duyệt Shop', icon: 'business-outline' },
            { key: 'users', label: 'Thành viên', icon: 'people-outline' },
            { key: 'logs', label: 'Audit Logs', icon: 'time-outline' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[S.tabItem, activeTab === tab.key && S.tabItemActive]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? T.accent : T.sub} />
              <Text style={[S.tabText, activeTab === tab.key && { color: T.accent, fontWeight: '700' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* TAB 1: duyệt shop */}
          {activeTab === 'shops' && (
            <View style={{ padding: 20 }}>
              <Text style={S.sectionTitle}>YÊU CẦU DUYỆT GIAN HÀNG ({pendingShops.length})</Text>
              
              {pendingShops.length === 0 ? (
                <Text style={S.emptyText}>Không có yêu cầu duyệt nào chờ xử lý.</Text>
              ) : (
                pendingShops.map(s => (
                  <View key={s.id} style={S.pendingCard}>
                    <View style={S.cardHeader}>
                      <Text style={S.cardTitle}>{s.name}</Text>
                      <Text style={S.cardDate}>{s.date}</Text>
                    </View>
                    <Text style={S.cardText}>Chủ gian hàng: {s.owner}</Text>
                    <Text style={S.cardText}>Ngành hàng: {s.category}</Text>
                    
                    <View style={S.cardActions}>
                      <TouchableOpacity style={[S.actionBtn, { backgroundColor: '#F3F4F6' }]} onPress={() => handleRejectShop(s.id, s.name)}>
                        <Text style={{ color: T.black, fontWeight: '600', fontSize: 12 }}>Từ chối</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[S.actionBtn, { backgroundColor: T.accent }]} onPress={() => handleApproveShop(s.id, s.name)}>
                        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>Phê duyệt</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 2: quản lý thành viên */}
          {activeTab === 'users' && (
            <View style={{ padding: 20 }}>
              <Text style={S.sectionTitle}>QUẢN LÝ THÀNH VIÊN HỆ THỐNG</Text>
              
              {users.map(u => (
                <View key={u.id} style={S.userRow}>
                  <View>
                    <Text style={S.userName}>{u.name}</Text>
                    <Text style={S.userRole}>{u.role}  |  Trạng thái: <Text style={{ color: u.status === 'Hoạt động' ? '#10B981' : '#EF4444', fontWeight: '700' }}>{u.status}</Text></Text>
                  </View>
                  <TouchableOpacity
                    style={[S.lockBtn, u.status === 'Hoạt động' ? { backgroundColor: 'rgba(239,68,68,0.1)' } : { backgroundColor: 'rgba(16,185,129,0.1)' }]}
                    onPress={() => handleToggleUserStatus(u.id)}
                  >
                    <Text style={[S.lockBtnText, u.status === 'Hoạt động' ? { color: '#EF4444' } : { color: '#10B981' }]}>
                      {u.status === 'Hoạt động' ? 'Khoá' : 'Mở khoá'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: audit logs */}
          {activeTab === 'logs' && (
            <View style={{ padding: 20 }}>
              <Text style={S.sectionTitle}>NHẬT KÝ HOẠT ĐỘNG SÀN (AUDIT LOGS)</Text>
              
              <View style={S.logBox}>
                {auditLogs.map((log, i) => (
                  <View key={i} style={S.logRow}>
                    <Text style={S.logTime}>[{log.time}]</Text>
                    <Text style={S.logMsg}>{log.msg}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 2, color: T.black },

  metricsPanel: { flexDirection: 'row', backgroundColor: T.white, margin: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'space-between' },
  metricCard: { flex: 1, alignItems: 'center' },
  metricVal: { fontSize: 18, fontWeight: '800', color: T.black },
  metricLbl: { fontSize: 10, color: T.sub, marginTop: 4, fontWeight: '600' },
  metricDivider: { width: 1, backgroundColor: T.border, height: 24 },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border, backgroundColor: T.white },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: T.accent },
  tabText: { fontSize: 12, color: T.sub, fontWeight: '500' },

  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: T.black, marginBottom: 16 },
  emptyText: { color: T.sub, fontSize: 13, textAlign: 'center', marginTop: 40 },

  // pending card
  pendingCard: { backgroundColor: T.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: T.black },
  cardDate: { fontSize: 10, color: T.sub },
  cardText: { fontSize: 12, color: T.sub, marginTop: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15, borderTopWidth: 1, borderTopColor: T.border, paddingTop: 12 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },

  // User list
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 10 },
  userName: { fontSize: 13, fontWeight: '700', color: T.black },
  userRole: { fontSize: 11, color: T.sub, marginTop: 2 },
  lockBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  lockBtnText: { fontSize: 11, fontWeight: '700' },

  // Logs
  logBox: { backgroundColor: T.black, borderRadius: 12, padding: 16 },
  logRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  logTime: { color: '#10B981', fontSize: 11, fontFamily: 'monospace', width: 80 },
  logMsg: { color: '#E2E8F0', fontSize: 11, flex: 1, fontFamily: 'monospace', lineHeight: 16 }
});
