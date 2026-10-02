import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity,
  Image, Alert, StatusBar, Platform, Modal, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DriverProfileScreen() {
  const router = useRouter();

  // Modals
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showHonorModal, setShowHonorModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Hồ Sơ Đối Tác</Text>
          <TouchableOpacity
            style={styles.settingsShortcutBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={16} color="#0088FF" />
            <Text style={styles.settingsShortcutText}>Cài đặt ⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. THẺ HỒ SƠ ĐỐI TÁC KIM CƯƠNG */}
        <View style={styles.profileCard}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.driverName}>Trần Văn Bình</Text>
              <Ionicons name="checkmark-circle" size={19} color="#10B981" />
            </View>
            <Text style={styles.driverIdText}>Mã đối tác: #TX-8889 • Đội xe Thủ Đô</Text>

            <View style={styles.badgeRow}>
              <View style={styles.badgeGold}>
                <Ionicons name="star" size={13} color="#D97706" />
                <Text style={styles.badgeGoldText}>4.96 ⭐ (520 cuốc)</Text>
              </View>
              <View style={styles.badgePurple}>
                <Ionicons name="diamond" size={13} color="#7E22CE" />
                <Text style={styles.badgePurpleText}>Tài Xế Kim Cương</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. BỘ CHỈ SỐ HIỆU SUẤT HOẠT ĐỘNG VÀNG */}
        <View style={styles.metricsCard}>
          <View style={styles.metricsHeader}>
            <Text style={styles.sectionHeaderTitle}>CHỈ SỐ HIỆU SUẤT VẬN HÀNH THÁNG 10</Text>
            <View style={styles.reputationBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#059669" />
              <Text style={styles.reputationText}>Uy tín 100/100</Text>
            </View>
          </View>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValGreen}>98.0%</Text>
              <Text style={styles.metricLabel}>Tỷ lệ nhận</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricValGreen}>99.2%</Text>
              <Text style={styles.metricLabel}>Tỷ lệ hoàn thành</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricValRed}>0.5%</Text>
              <Text style={styles.metricLabel}>Tỷ lệ hủy</Text>
            </View>
          </View>
        </View>

        {/* 3. PHƯƠNG TIỆN ĐĂNG KÝ & GIẤY TỜ PHÁP LÝ */}
        <View style={styles.menuGroup}>
          <View style={styles.groupHeader}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#0088FF" />
            <Text style={styles.groupHeaderText}>PHƯƠNG TIỆN & HỒ SƠ PHÁP LÝ ĐỐI TÁC</Text>
          </View>

          {/* Phương tiện đăng ký */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => setShowVehicleModal(true)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="bicycle" size={20} color="#0088FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Phương tiện đăng ký hoạt động</Text>
              <Text style={styles.menuSub}>Honda Wave RSX 110cc • Biển số: 29D1-888.88</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Giấy tờ pháp lý */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => setShowVehicleModal(true)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="document-text" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Giấy tờ pháp lý số hóa</Text>
              <Text style={styles.menuSubGreen}>GPLX, CCCD, Cà vẹt, Bảo hiểm TNDS (Đã duyệt 100%)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 4. TÀI KHOẢN NGÂN HÀNG & THÀNH TÍCH */}
        <View style={styles.menuGroup}>
          <View style={styles.groupHeader}>
            <Ionicons name="card-outline" size={16} color="#0088FF" />
            <Text style={styles.groupHeaderText}>TÀI KHOẢN THỤ HƯỞNG & THÀNH TÍCH</Text>
          </View>

          {/* Tài khoản ngân hàng nhận tiền */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => setShowBankModal(true)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="card" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Tài khoản ngân hàng thụ hưởng</Text>
              <Text style={styles.menuSub}>MB Bank • STK: 999988886666 (TRAN VAN BINH)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Vinh danh thành tích */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => setShowHonorModal(true)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="trophy" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Bảng vàng thành tích & Vinh danh</Text>
              <Text style={styles.menuSub}>Top 5 tài xế xuất sắc nhất khu vực Hà Nội</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 5. PHÍM TẮT ĐI TỚI CÀI ĐẶT & ĐĂNG XUẤT */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="settings" size={20} color="#0088FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Mở Trung Tâm Cài Đặt Hệ Thống</Text>
              <Text style={styles.menuSub}>Bán kính, Auto-Accept, Chuông to, Giữ sáng màn hình, Bản đồ</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#0088FF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Đăng xuất */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng Sunstar Driver?', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', style: 'destructive', onPress: () => router.push('/(tabs)') },
              ]);
            }}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.menuTitle, { flex: 1, color: '#EF4444' }]}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>
          Sunstar Driver v2.6.0 (Build 20261002) • Profile Verified
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─────────────────────────────────────────
          MODAL: PHƯƠNG TIỆN & GIẤY TỜ PHÁP LÝ
         ───────────────────────────────────────── */}
      <Modal visible={showVehicleModal} transparent animationType="slide" onRequestClose={() => setShowVehicleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-checkmark" size={22} color="#10B981" />
                <Text style={styles.modalTitle}>Phương Tiện & Giấy Tờ Số Hóa</Text>
              </View>
              <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.vehicleCardBox}>
                <View style={styles.vehicleIconCircle}>
                  <Ionicons name="bicycle" size={26} color="#0088FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleName}>Honda Wave RSX 110cc</Text>
                  <Text style={styles.vehiclePlate}>Biển số: 29D1-888.88 (Hà Nội)</Text>
                  <Text style={styles.vehicleColor}>Màu sắc: Đỏ Đen • Đăng ký chính chủ</Text>
                </View>
              </View>

              <Text style={[styles.sectionHeaderTitle, { marginTop: 14, marginBottom: 8 }]}>
                DANH MỤC GIẤY TỜ ĐÃ XÁC MINH SỐ HÓA
              </Text>

              {[
                { title: 'Giấy phép lái xe (GPLX A1)', number: '010192837465', status: 'Hợp lệ', exp: 'Vô thời hạn', icon: 'card-outline' },
                { title: 'Căn cước công dân gắn chip', number: '001092837465', status: 'Hợp lệ', exp: 'Đến 2038', icon: 'person-outline' },
                { title: 'Giấy đăng ký xe (Cà vẹt)', number: 'Số khung: 8892182', status: 'Hợp lệ', exp: 'Chính chủ', icon: 'document-text-outline' },
                { title: 'Bảo hiểm TNDS bắt buộc', number: 'Bảo Việt số BV-9921', status: 'Hiệu lực', exp: 'Đến 15/08/2027', icon: 'shield-outline' },
                { title: 'Phù hiệu xe hợp đồng điện tử', number: 'Sở GTVT Hà Nội cấp', status: 'Đang hoạt động', exp: 'Đến 2028', icon: 'checkmark-done-circle-outline' },
              ].map((doc, idx) => (
                <View key={idx} style={styles.docItemRow}>
                  <Ionicons name={doc.icon as any} size={20} color="#0088FF" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.docTitle}>{doc.title}</Text>
                    <Text style={styles.docNumber}>{doc.number}</Text>
                    <Text style={styles.docExp}>Hạn dùng: {doc.exp}</Text>
                  </View>
                  <View style={styles.docStatusBadge}>
                    <Text style={styles.docStatusBadgeText}>{doc.status}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.primaryModalBtn} onPress={() => setShowVehicleModal(false)}>
                <Text style={styles.primaryModalBtnText}>Đóng</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL: TÀI KHOẢN NGÂN HÀNG THỤ HƯỞNG
         ───────────────────────────────────────── */}
      <Modal visible={showBankModal} transparent animationType="fade" onRequestClose={() => setShowBankModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="card" size={22} color="#0088FF" />
                <Text style={styles.modalTitle}>Tài Khoản Ngân Hàng Thụ Hưởng</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBankModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.bankCardBox}>
              <View style={styles.bankHeaderRow}>
                <Text style={styles.bankName}>NGÂN HÀNG QUÂN ĐỘI (MB BANK)</Text>
                <View style={styles.bankActivePill}><Text style={styles.bankActiveText}>Mặc định</Text></View>
              </View>
              <Text style={styles.bankNumber}>9999 8888 6666</Text>
              <Text style={styles.bankOwner}>CHỦ TK: TRAN VAN BINH</Text>
              <Text style={styles.bankBranch}>Chi nhánh: MB Bank Cầu Giấy, Hà Nội</Text>
            </View>

            <Text style={styles.bankDesc}>
              Đây là tài khoản nhận tiền rút siêu tốc 24/7 từ Ví Thu Nhập của tài xế. Tiền sẽ về tài khoản trong 30 giây với phí 0đ.
            </Text>

            <TouchableOpacity style={styles.primaryModalBtn} onPress={() => setShowBankModal(false)}>
              <Text style={styles.primaryModalBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────
          MODAL: BẢNG VÀNG THÀNH TÍCH
         ───────────────────────────────────────── */}
      <Modal visible={showHonorModal} transparent animationType="fade" onRequestClose={() => setShowHonorModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="trophy" size={22} color="#D97706" />
                <Text style={styles.modalTitle}>Bảng Vàng Thành Tích</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHonorModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.honorBadgeBox}>
              <Ionicons name="medal" size={48} color="#D97706" />
              <Text style={styles.honorTitle}>CHIẾN BINH KIM CƯƠNG XUẤT SẮC</Text>
              <Text style={styles.honorSub}>Vinh danh tháng 10/2026 • Khu vực Hà Nội</Text>
            </View>

            <View style={styles.honorMetricsRow}>
              <View style={styles.honorMetricCol}>
                <Text style={styles.honorNum}>520</Text>
                <Text style={styles.honorLabel}>Cuốc hoàn thành</Text>
              </View>
              <View style={styles.honorDivider} />
              <View style={styles.honorMetricCol}>
                <Text style={styles.honorNumGreen}>4.96 ⭐</Text>
                <Text style={styles.honorLabel}>Điểm sao hài lòng</Text>
              </View>
              <View style={styles.honorDivider} />
              <View style={styles.honorMetricCol}>
                <Text style={styles.honorNumBlue}>Top 5</Text>
                <Text style={styles.honorLabel}>Toàn thành phố</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryModalBtn} onPress={() => setShowHonorModal(false)}>
              <Text style={styles.primaryModalBtnText}>Đóng</Text>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 21, fontWeight: '900', color: '#0F172A', letterSpacing: -0.3 },
  settingsShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  settingsShortcutText: { fontSize: 12, fontWeight: '700', color: '#0088FF' },

  content: { padding: 16 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 14, backgroundColor: '#EFF6FF' },
  profileInfo: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  driverIdText: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badgeGold: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  badgeGoldText: { fontSize: 11, fontWeight: '800', color: '#D97706' },
  badgePurple: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  badgePurpleText: { fontSize: 11, fontWeight: '800', color: '#7E22CE' },

  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  reputationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  reputationText: { fontSize: 10.5, fontWeight: '800', color: '#059669' },
  metricsGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricBox: { flex: 1, alignItems: 'center' },
  metricDivider: { width: 1, height: 30, backgroundColor: '#F1F5F9' },
  metricValGreen: { fontSize: 18, fontWeight: '900', color: '#059669' },
  metricValRed: { fontSize: 18, fontWeight: '900', color: '#EF4444' },
  metricLabel: { fontSize: 11, color: '#94A3B8', marginTop: 3 },

  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  groupHeaderText: { fontSize: 11, fontWeight: '800', color: '#475569', letterSpacing: 0.4 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: { fontSize: 13.5, fontWeight: '700', color: '#0F172A' },
  menuSub: { fontSize: 11.5, color: '#64748B', marginTop: 2, lineHeight: 16 },
  menuSubGreen: { fontSize: 11.5, color: '#059669', fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },

  versionText: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 10, marginBottom: 10 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A' },

  vehicleCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
  },
  vehicleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  vehiclePlate: { fontSize: 13, fontWeight: '700', color: '#0088FF', marginTop: 2 },
  vehicleColor: { fontSize: 11, color: '#64748B', marginTop: 2 },

  docItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  docTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  docNumber: { fontSize: 12, color: '#475569', marginTop: 2 },
  docExp: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  docStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  docStatusBadgeText: { fontSize: 11, fontWeight: '800', color: '#15803D' },

  primaryModalBtn: {
    backgroundColor: '#0088FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  primaryModalBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  // Bank Modal
  bankCardBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  bankHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bankName: { color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  bankActivePill: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  bankActiveText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  bankNumber: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  bankOwner: { color: '#E2E8F0', fontSize: 13, fontWeight: '700' },
  bankBranch: { color: '#64748B', fontSize: 11, marginTop: 2 },
  bankDesc: { fontSize: 12, color: '#64748B', lineHeight: 18, marginTop: 4 },

  // Honor Modal
  honorBadgeBox: {
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  honorTitle: { fontSize: 15, fontWeight: '900', color: '#B45309', marginTop: 8 },
  honorSub: { fontSize: 12, color: '#92400E', marginTop: 2 },
  honorMetricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  honorMetricCol: { flex: 1, alignItems: 'center' },
  honorDivider: { width: 1, height: 32, backgroundColor: '#E2E8F0' },
  honorNum: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  honorNumGreen: { fontSize: 16, fontWeight: '900', color: '#059669' },
  honorNumBlue: { fontSize: 16, fontWeight: '900', color: '#0088FF' },
  honorLabel: { fontSize: 10.5, color: '#64748B', marginTop: 2 },
});
