import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { partnerNotificationService, Notification } from '../services/notificationService';

export default function PartnerNotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await partnerNotificationService.getNotifications();
      setNotifications(res.notifications);
    } catch (error) {
      console.log('Fetch partner notifications error:', error);
      setNotifications([
        {
          id: 'pn-1',
          title: 'Bạn đã nhận được tiền 💰',
          body: 'Payout đơn #VL202608031001 thành công. Số tiền: +4.500.000đ',
          data: { bookingCode: 'VL202608031001' },
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'pn-2',
          title: 'Bạn có đơn đặt dịch vụ mới',
          body: 'Đơn #VL202608031002 đang chờ thanh toán từ khách hàng.',
          data: { bookingCode: 'VL202608031002' },
          isRead: false,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'pn-3',
          title: 'Payout của đơn đang gặp lỗi ⚠️',
          body: 'Payout đơn #VL202608031003 thất bại. V-life sẽ xử lý và thử lại.',
          data: { bookingCode: 'VL202608031003' },
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotifPress = async (notif: Notification) => {
    if (!notif.isRead) {
      await partnerNotificationService.markAsRead(notif.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
      );
    }
    if (notif.data?.bookingCode) {
      router.push(`/booking-detail?id=${notif.data.bookingCode}`);
    }
  };

  const handleMarkAllRead = async () => {
    await partnerNotificationService.markAllAsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getNotifIcon = (title: string) => {
    if (title.includes('tiền') || title.includes('Payout')) return 'cash';
    if (title.includes('đơn')) return 'document-text';
    if (title.includes('lỗi') || title.includes('⚠️')) return 'warning';
    return 'notifications';
  };

  const getNotifColor = (title: string, isRead: boolean) => {
    if (isRead) return '#94A3B8';
    if (title.includes('lỗi') || title.includes('⚠️')) return '#EF4444';
    if (title.includes('tiền')) return '#10B981';
    return '#0088FF';
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Thông Báo {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.readAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0088FF" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color="#94A3B8" />
              <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
            </View>
          }
          renderItem={({ item }) => {
            const iconName = getNotifIcon(item.title) as any;
            const iconColor = getNotifColor(item.title, item.isRead);
            return (
              <TouchableOpacity
                style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
                onPress={() => handleNotifPress(item)}
              >
                {!item.isRead && <View style={styles.unreadDot} />}
                <View style={[styles.iconWrap, { backgroundColor: `${iconColor}20` }]}>
                  <Ionicons name={iconName} size={22} color={iconColor} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleBold]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                  <Text style={styles.notifTime}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  readAllText: { color: '#0088FF', fontSize: 13, fontWeight: '600' },
  listContent: { padding: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#94A3B8', fontSize: 14, marginTop: 12 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  notifCardUnread: { borderColor: '#BFDBFE', backgroundColor: '#F0F9FF' },
  unreadDot: {
    position: 'absolute',
    top: 12,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0088FF',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 4,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '500', color: '#64748B', marginBottom: 4 },
  notifTitleBold: { fontWeight: 'bold', color: '#1E293B' },
  notifBody: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
});
