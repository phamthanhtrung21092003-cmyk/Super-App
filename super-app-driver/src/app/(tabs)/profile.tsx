import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DriverProfileScreen() {
  const router = useRouter();

  // Settings states
  const [autoAccept, setAutoAccept] = useState(false);
  const [backToBack, setBackToBack] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Play test chime
  const playTestSound = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        if (Platform.OS === 'web') alert('Đã phát âm thanh thử nghiệm nổ cuốc!');
        else Alert.alert('Âm thanh nổ cuốc', 'Đã kiểm tra chuông báo!');
      }
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ Sơ & Cài Đặt Đối Tác</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.name}>Trần Văn Bình</Text>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            </View>
            <Text style={styles.driverId}>Mã đối tác: #TX-8889 • V-Bike Elite</Text>

            <View style={styles.badgeRow}>
              <View style={styles.badgeGold}>
                <Ionicons name="star" size={14} color="#D97706" />
                <Text style={styles.badgeGoldText}>4.96 (520 cuốc)</Text>
              </View>
              <View style={styles.badgePurple}>
                <Ionicons name="diamond" size={14} color="#7E22CE" />
                <Text style={styles.badgePurpleText}>Tài Xế Kim Cương</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsCard}>
          <Text style={styles.sectionHeaderTitle}>CHỈ SỐ HIỆU SUẤT HOẠT ĐỘNG</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>98%</Text>
              <Text style={styles.metricLabel}>Tỷ lệ nhận cuốc</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>99.2%</Text>
              <Text style={styles.metricLabel}>Tỷ lệ hoàn thành</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>0.5%</Text>
              <Text style={styles.metricLabel}>Tỷ lệ hủy</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.menuGroup}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupHeaderText}>PHƯƠNG TIỆN & HỒ SƠ GIẤY TỜ</Text>
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="bicycle" size={20} color="#0088FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Phương tiện đăng ký</Text>
              <Text style={styles.menuSub}>Honda Wave RSX • 29D1-888.88</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Bảo hiểm & Giấy tờ xe</Text>
              <Text style={styles.menuSubGreen}>Đã xác minh đầy đủ (Hiệu lực 2027)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Dispatch Settings */}
        <View style={styles.menuGroup}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupHeaderText}>CÀI ĐẶT NHẬN CUỐC & ĐIỀU HƯỚNG</Text>
          </View>

          {/* Auto Accept Switch */}
          <View style={styles.menuItem}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flash" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Tự động nhận cuốc (Auto-Accept)</Text>
              <Text style={styles.menuSub}>Tự động chốt khi có cuốc gần nhất</Text>
            </View>
            <Switch value={autoAccept} onValueChange={setAutoAccept} />
          </View>

          <View style={styles.divider} />

          {/* Back to back switch */}
          <View style={styles.menuItem}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="git-merge" size={20} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Nhận cuốc nối tiếp (Back-to-back)</Text>
              <Text style={styles.menuSub}>Nhận cuốc mới khi sắp trả khách cũ</Text>
            </View>
            <Switch value={backToBack} onValueChange={setBackToBack} />
          </View>

          <View style={styles.divider} />

          {/* Test Sound Button */}
          <TouchableOpacity style={styles.menuItem} onPress={playTestSound}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#FDF4FF' }]}>
              <Ionicons name="volume-high" size={20} color="#C026D3" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Kiểm tra loa chuông nổ cuốc</Text>
              <Text style={styles.menuSub}>Phát thử âm báo chuông nổ chuyến</Text>
            </View>
            <Ionicons name="play-circle" size={22} color="#C026D3" />
          </TouchableOpacity>
        </View>

        {/* Support & Logout */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS === 'web') alert('Đang kết nối tổng đài đối tác 1900-8888');
              else Alert.alert('Hỗ trợ', 'Tổng đài đối tác 24/7: 1900-8888');
            }}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="headset" size={20} color="#475569" />
            </View>
            <Text style={[styles.menuTitle, { flex: 1 }]}>Tổng đài hỗ trợ đối tác 24/7</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS === 'web') {
                if (confirm('Bạn có chắc muốn đăng xuất khỏi ứng dụng tài xế?')) {
                  router.push('/(tabs)');
                }
              } else {
                Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi tài khoản?', [
                  { text: 'Hủy', style: 'cancel' },
                  { text: 'Đăng xuất', style: 'destructive', onPress: () => router.push('/(tabs)') },
                ]);
              }
            }}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.menuTitle, { flex: 1, color: '#EF4444' }]}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Phiên bản 2.5.0 (Build 20261002) • V-Life Driver Enterprise</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  content: { padding: 16 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  avatar: { width: 68, height: 68, borderRadius: 34, marginRight: 14 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  driverId: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 8 },
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
  badgeGoldText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
  badgePurple: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  badgePurpleText: { fontSize: 11, fontWeight: '700', color: '#7E22CE' },

  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeaderTitle: { fontSize: 12, fontWeight: '800', color: '#64748B', marginBottom: 12 },
  metricsGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricBox: { flex: 1, alignItems: 'center' },
  metricDivider: { width: 1, height: 32, backgroundColor: '#F1F5F9' },
  metricVal: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  metricLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  groupHeader: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  groupHeaderText: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  menuSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  menuSubGreen: { fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },

  versionText: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 8 },
});
