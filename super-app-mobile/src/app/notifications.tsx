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
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationService, Notification } from '../services/notificationService';

export default function NotificationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobileUA = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isDesktop = Platform.OS === 'web' && width > 768 && !isMobileUA;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications);
    } catch (error) {
      console.log('Fetch notifications error:', error);
      // Fallback mẫu demo
      setNotifications([
        {
          id: 'n-1',
          title: 'Đặt dịch vụ thành công 🎉',
          body: 'Đơn #VL202608031001 đã được xác nhận. Hẹn gặp bạn!',
          data: { bookingId: 'b-1', bookingCode: 'VL202608031001' },
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n-2',
          title: 'Thanh toán thành công',
          body: 'Đơn #VL202608031002 đã được V-life xác nhận thanh toán.',
          data: { bookingId: 'b-2' },
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'n-3',
          title: 'Đơn đặt dịch vụ đã hết hạn',
          body: 'Đơn #VL202608031003 đã hết thời gian giữ chỗ. Vui lòng đặt lại.',
          data: {},
          isRead: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
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
    // Đánh dấu đã đọc
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.id).catch(() => {});
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n));
    }

    // Điều hướng theo loại thông báo
    if (notif.data?.bookingId) {
      router.push(`/travel/checkout?serviceId=${notif.data.serviceId || ''}&price=0`);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={[styles.webWrapper, !isDesktop && styles.mobileFullWrapper]}>
      {Platform.OS === 'web' && (
        <style>{`
          html, body, #root, #root > div {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            background-color: #F8FAFC !important;
          }
        `}</style>
      )}
      <SafeAreaView style={[styles.container, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Thông Báo {unreadCount > 0 ? `(${unreadCount} chưa đọc)` : ''}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.readAllBtn}>
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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
                onPress={() => handleNotifPress(item)}
              >
                <View style={styles.notifLeft}>
                  {!item.isRead && <View style={styles.unreadDot} />}
                  <View style={[styles.notifIconBg, !item.isRead && styles.notifIconBgUnread]}>
                    <Ionicons name="notifications" size={20} color={item.isRead ? '#94A3B8' : '#0088FF'} />
                  </View>
                </View>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                  <Text style={styles.notifTime}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  mobileFullWrapper: {
    alignItems: 'stretch',
    justifyContent: 'stretch',
  },
  desktopFrame: {
    width: 414,
    maxWidth: 414,
    maxHeight: 896,
    height: '100%',
    borderWidth: 10,
    borderColor: '#0F172A',
    borderRadius: 45,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    ...(Platform.OS === 'web' && { marginVertical: 20 }),
  },
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
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: 'bold', color: '#1E293B', marginLeft: 8 },
  readAllBtn: { padding: 8 },
  readAllText: { color: '#0088FF', fontSize: 13, fontWeight: '600' },
  listContent: { padding: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#94A3B8', fontSize: 14, marginTop: 12 },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifCardUnread: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F0F9FF',
  },
  notifLeft: { alignItems: 'center', marginRight: 12, width: 40 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0088FF',
    marginBottom: 4,
  },
  notifIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifIconBgUnread: { backgroundColor: '#E0F2FE' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  notifTitleUnread: { color: '#1E293B', fontWeight: 'bold' },
  notifBody: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
});
