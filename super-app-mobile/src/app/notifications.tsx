import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  Platform,
  useWindowDimensions
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Types for Notification Data
type NotificationType = 'like' | 'comment' | 'friend_request' | 'friend_accept' | 'mention' | 'birthday' | 'group';

interface NotificationData {
  id: string;
  type: NotificationType;
  userName: string;
  actionText: string;
  time: string;
  avatarUrl: string;
  thumbnailUrl?: string;
  isUnread?: boolean;
}

const MOCK_DATA: NotificationData[] = [
  {
    id: '1',
    type: 'like',
    userName: 'Nguyễn Văn An',
    actionText: 'đã thích ảnh của bạn',
    time: '5 phút',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '2',
    type: 'comment',
    userName: 'Trần Thị Bình',
    actionText: 'đã bình luận: "Tuyệt vời! 👏"',
    time: '30 phút',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '3',
    type: 'friend_request',
    userName: 'Phạm Hồng Đức',
    actionText: 'đã gửi lời mời kết bạn',
    time: '2 giờ',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '4',
    type: 'friend_accept',
    userName: 'Nguyễn Thu Hương',
    actionText: 'đã chấp nhận lời mời kết bạn',
    time: '3 giờ',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
  },
  {
    id: '5',
    type: 'like',
    userName: 'Võ Thị Em và 8 người khác',
    actionText: 'đã thích ảnh',
    time: '5 giờ',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '6',
    type: 'mention',
    userName: 'Lê Minh Châu',
    actionText: 'đã nhắc đến bạn trong bình luận',
    time: '1 ngày',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: '7',
    type: 'birthday',
    userName: 'Hoàng Văn Phong',
    actionText: 'có sinh nhật hôm nay 🎂 Gửi lời chúc nhé!',
    time: '1 ngày',
    avatarUrl: 'https://i.pravatar.cc/150?img=13',
  },
  {
    id: '8',
    type: 'group',
    userName: 'Nhóm Dev Vietnam',
    actionText: 'có 3 bài đăng mới mà bạn chưa xem',
    time: '2 ngày',
    avatarUrl: 'https://i.pravatar.cc/150?img=41', // Pretend this is a group image
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // Add font styling for web to match design
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const renderBadge = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return (
          <View style={[styles.badge, { backgroundColor: '#1877F2' }]}>
            <Ionicons name="thumbs-up" size={10} color="#FFF" />
          </View>
        );
      case 'comment':
        return (
          <View style={[styles.badge, { backgroundColor: '#28B16D' }]}>
            <Ionicons name="chatbubble" size={10} color="#FFF" />
          </View>
        );
      case 'friend_request':
        return (
          <View style={[styles.badge, { backgroundColor: '#1877F2' }]}>
            <Ionicons name="person-add" size={10} color="#FFF" />
          </View>
        );
      case 'friend_accept':
        return (
          <View style={[styles.badge, { backgroundColor: '#28B16D' }]}>
            <Ionicons name="checkmark-sharp" size={10} color="#FFF" />
          </View>
        );
      case 'mention':
        return (
          <View style={[styles.badge, { backgroundColor: '#E4A400' }]}>
            <Ionicons name="pricetag" size={10} color="#FFF" />
          </View>
        );
      case 'birthday':
        return (
          <View style={[styles.badge, { backgroundColor: '#E53E3E' }]}>
            <FontAwesome5 name="birthday-cake" size={9} color="#FFF" />
          </View>
        );
      case 'group':
        return (
          <View style={[styles.badge, { backgroundColor: '#6B46C1' }]}>
            <Ionicons name="people" size={10} color="#FFF" />
          </View>
        );
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: NotificationData }) => {
    return (
      <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          {renderBadge(item.type)}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <Text style={styles.notificationText}>
            <Text style={styles.userName}>{item.userName}</Text> {item.actionText}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>

          {/* Friend Request Action Buttons */}
          {item.type === 'friend_request' && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Right Thumbnail Section */}
        {item.thumbnailUrl && (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => router.replace('/home')} style={{marginRight: 12}} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={26} color="#050505" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thông báo</Text>
          </View>
          <TouchableOpacity style={styles.moreIconContainer}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#050505" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
            onPress={() => setActiveTab('unread')}
          >
            <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
              Chưa đọc
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={MOCK_DATA}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Typical Facebook background for web
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      paddingVertical: 20,
    }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 420,       
    maxHeight: 850,
    aspectRatio: 420 / 850, 
    borderWidth: 1,     
    borderColor: '#E4E6EB',
    borderRadius: 12,    
    overflow: 'hidden',
    boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#050505',
    letterSpacing: -0.5,
  },
  moreIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E4E6EB',
  },
  activeTab: {
    backgroundColor: '#E7F3FF', // Light blue background for active
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050505',
  },
  activeTabText: {
    color: '#1877F2', // Facebook blue
  },
  listContainer: {
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  separator: {
    height: 0, // In standard Facebook design, there's rarely a visible line, just padding
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    width: 60,
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF', // White border to cut into the avatar
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 15,
    color: '#050505',
    lineHeight: 20,
  },
  userName: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 13,
    color: '#65676B',
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1877F2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E4E6EB',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#050505',
    fontWeight: '600',
    fontSize: 14,
  },
  thumbnailContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
});
