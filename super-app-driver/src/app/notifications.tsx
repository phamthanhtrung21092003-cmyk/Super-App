import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DriverNotificationsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TRIP' | 'WALLET' | 'SYSTEM'>('ALL');

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'TRIP',
      icon: 'car-sport',
      iconColor: '#0088FF',
      iconBg: '#EFF6FF',
      title: 'Đã hoàn thành cuốc xe #VR-8899',
      body: 'Khách hàng Hoàng Linh đã đánh giá bạn 5 sao kèm lời khen: "Lái xe an toàn, lịch sự".',
      time: '14:35 Hôm nay',
      isRead: false,
      tripId: 'VR-8899',
    },
    {
      id: 'notif-2',
      type: 'WALLET',
      icon: 'gift',
      iconColor: '#059669',
      iconBg: '#ECFDF5',
      title: 'Thưởng nóng mốc 5 cuốc trưa cao điểm 🎉',
      body: 'Bạn đã nhận được +50.000đ tiền thưởng vào Ví Ký Quỹ từ chương trình V-Driver Giờ Vàng.',
      time: '12:30 Hôm nay',
      isRead: false,
      action: 'wallet',
    },
    {
      id: 'notif-3',
      type: 'WALLET',
      icon: 'card',
      iconColor: '#10B981',
      iconBg: '#D1FAE5',
      title: 'Cộng tiền cước trực tuyến cuốc #VR-8898',
      body: 'Khách hàng thanh toán qua VNPay. Ví của bạn đã được cộng +96.000đ.',
      time: '13:35 Hôm nay',
      isRead: true,
      tripId: 'VR-8898',
    },
    {
      id: 'notif-4',
      type: 'SYSTEM',
      icon: 'flame',
      iconColor: '#EF4444',
      iconBg: '#FEF2F2',
      title: 'Nhu cầu tăng đột biến tại Quận Cầu Giấy 🔥',
      body: 'Khu vực Duy Tân - Trần Thái Tông đang có hơn 35 đơn chờ. Hệ số nhân giá 1.3x đang kích hoạt.',
      time: '11:45 Hôm nay',
      isRead: true,
      action: 'map',
    },
    {
      id: 'notif-5',
      type: 'SYSTEM',
      icon: 'shield-checkmark',
      iconColor: '#6366F1',
      iconBg: '#EEF2FF',
      title: 'Cập nhật chính sách an toàn tài xế 2026',
      body: 'Bảo hiểm tai nạn tự động kích hoạt cho mọi cuốc xe hợp lệ trên hệ thống.',
      time: 'Hôm qua',
      isRead: true,
      action: 'info',
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handlePressItem = (item: any) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    if (item.tripId) {
      router.push(`/booking-detail?id=${item.tripId}`);
    } else if (item.action === 'wallet') {
      router.push('/(tabs)/wallet');
    } else if (item.action === 'map') {
      router.push('/(tabs)');
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TRIP') return n.type === 'TRIP';
    if (activeFilter === 'WALLET') return n.type === 'WALLET';
    if (activeFilter === 'SYSTEM') return n.type === 'SYSTEM';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông Báo Tài Xế</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllReadText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'TRIP', label: 'Cuốc xe' },
            { id: 'WALLET', label: 'Ví & Thưởng' },
            { id: 'SYSTEM', label: 'Hệ thống' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.id as any)}
            >
              <Text style={[styles.filterChipText, activeFilter === f.id && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
            activeOpacity={0.8}
            onPress={() => handlePressItem(item)}
          >
            <View style={[styles.notifIconWrap, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleBold]}>
                  {item.title}
                </Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  unreadBadge: { backgroundColor: '#EF4444', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  unreadBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  markAllReadText: { fontSize: 13, fontWeight: '700', color: '#0088FF' },
  content: { padding: 16 },

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

  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifCardUnread: {
    backgroundColor: '#F8FAFF',
    borderColor: '#BFDBFE',
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { fontSize: 14, color: '#334155', fontWeight: '600', flex: 1, paddingRight: 8 },
  notifTitleBold: { fontWeight: '800', color: '#0F172A' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0088FF', marginTop: 4 },
  notifBody: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#94A3B8', marginTop: 8 },
});
