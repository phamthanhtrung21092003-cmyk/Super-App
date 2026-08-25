import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  TextInput,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { TravelBottomNav } from '../../components/travel/TravelBottomNav';

const COMMUNITY_POSTS = [
  {
    id: 'p1',
    author: 'Minh Tú',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    verified: true,
    time: '2 giờ trước',
    location: 'Vịnh Hạ Long, Quảng Ninh',
    caption: 'Vịnh Hạ Long sau cơn mưa sáng đẹp ngỡ ngàng 😍 Nước biển xanh ngọc bích phẳng lặng như tấm gương khổng lồ! Ai chưa đi mùa thu thì phải thử ngay!',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop',
    likes: 1240,
    comments: 86,
    shares: 24,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'p2',
    author: 'Thu Hà',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b67e?w=100',
    verified: true,
    time: '5 giờ trước',
    location: 'Đồi Chè Cầu Đất, Đà Lạt',
    caption: 'Săn mây Đà Lạt 5h sáng se se lạnh nhưng cực kỳ xứng đáng! Đừng quên ghé thưởng thức một ly cà phê nóng ngắm đồi thông xanh ngát nhé 🌿☕',
    image: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=800&auto=format&fit=crop',
    likes: 890,
    comments: 42,
    shares: 15,
    isLiked: true,
    isSaved: true,
  },
  {
    id: 'p3',
    author: 'Quốc Bảo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    verified: false,
    time: '1 ngày trước',
    location: 'Bãi Sao, Phú Quốc',
    caption: 'Bãi Sao biển trong vắt không một gợn sóng! Nắng vàng và hải sản tươi sống giá siêu hạt dẻ 🏖️☀️',
    image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?q=80&w=800&auto=format&fit=crop',
    likes: 2150,
    comments: 114,
    shares: 38,
    isLiked: false,
    isSaved: false,
  },
];

const COMMUNITY_TABS = ['Dành cho bạn', 'Đang hot 🔥', 'Gần bạn 📍', 'Đang theo dõi'];

export default function TravelCommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { userName, avatarUrl } = useUser();
  const { width } = Dimensions.get('window');
  const isDesktop = Platform.OS === 'web' && width > 768;

  const headerTopPadding = Platform.OS === 'android'
    ? Math.max((StatusBar.currentHeight ?? 0) + 8, insets.top + 6, 40)
    : Math.max(insets.top, 12);

  const [activeTab, setActiveTab] = useState('Dành cho bạn');
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [postContent, setPostContent] = useState('');

  const toggleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const toggleSave = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) return;
    const newPost = {
      id: 'p_' + Date.now(),
      author: userName || 'Tôi',
      avatar: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      verified: true,
      time: 'Vừa xong',
      location: 'Việt Nam',
      caption: postContent,
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop',
      likes: 1,
      comments: 0,
      shares: 0,
      isLiked: true,
      isSaved: false,
    };
    setPosts([newPost, ...posts]);
    setPostContent('');
    setIsModalVisible(false);
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

        {/* ── HEADER ── */}
        <View style={[styles.header, { paddingTop: headerTopPadding }]}>
          <View>
            <Text style={styles.headerTitle}>Cộng đồng du lịch</Text>
            <Text style={styles.headerSubtitle}>Chia sẻ khoảnh khắc & trải nghiệm</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/travel/search' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={20} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/notifications' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SUB NAVIGATION TABS ── */}
        <View style={styles.subTabRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabScroll}>
            {COMMUNITY_TABS.map(t => {
              const isSelected = activeTab === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.subTabPill, isSelected && styles.subTabPillActive]}
                  onPress={() => setActiveTab(t)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.subTabPillText, isSelected && styles.subTabPillTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── FEED LIST ── */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {posts.map(post => (
            <View key={post.id} style={styles.feedCard}>
              {/* Author Row */}
              <View style={styles.authorRow}>
                <Image source={{ uri: post.avatar }} style={styles.authorAvatar} />
                <View style={styles.authorInfo}>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    {post.verified && <Ionicons name="checkmark-circle" size={14} color="#0284C7" />}
                  </View>
                  <View style={styles.authorLocRow}>
                    <Ionicons name="location-sharp" size={11} color="#0284C7" />
                    <Text style={styles.authorLocText}>{post.location}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.postTimeText}>{post.time}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Photo */}
              <Image source={{ uri: post.image }} style={styles.postImage} />

              {/* Caption */}
              <Text style={styles.captionText}>{post.caption}</Text>

              {/* Action Bar */}
              <View style={styles.postActionBar}>
                <View style={styles.actionLeft}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => toggleLike(post.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={post.isLiked ? 'heart' : 'heart-outline'}
                      size={20}
                      color={post.isLiked ? '#EF4444' : '#64748B'}
                    />
                    <Text style={[styles.actionNum, post.isLiked && { color: '#EF4444' }]}>
                      {post.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                    <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
                    <Text style={styles.actionNum}>{post.comments}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                    <Ionicons name="share-social-outline" size={18} color="#64748B" />
                    <Text style={styles.actionNum}>{post.shares}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => toggleSave(post.id)} activeOpacity={0.7}>
                  <Ionicons
                    name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={post.isSaved ? '#0284C7' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── FLOATING POST BUTTON ── */}
        <TouchableOpacity
          style={styles.fabPost}
          activeOpacity={0.88}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.fabPostText}>Đăng bài</Text>
        </TouchableOpacity>

        {/* ── CREATE POST MODAL ── */}
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tạo bài viết du lịch</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Chia sẻ trải nghiệm, kinh nghiệm du lịch của bạn..."
                placeholderTextColor="#94A3B8"
                multiline
                value={postContent}
                onChangeText={setPostContent}
              />

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreatePost}>
                <Text style={styles.modalSubmitBtnText}>Đăng ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TravelBottomNav activeTab="community" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 390,
    maxHeight: 844,
    aspectRatio: 390 / 844,
    borderWidth: 10,
    borderColor: '#1E293B',
    borderRadius: 44,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  subTabRow: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  subTabScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6.5,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subTabPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  subTabPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  subTabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  authorLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  authorLocText: {
    fontSize: 11.5,
    color: '#0284C7',
    fontWeight: '600',
  },
  dot: {
    color: '#CBD5E1',
    marginHorizontal: 3,
  },
  postTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  moreBtn: {
    padding: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  captionText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 12,
  },
  postActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 10,
  },
  actionLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionNum: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  fabPost: {
    position: 'absolute',
    bottom: 78,
    right: 20,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 4,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  fabPostText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    minHeight: 280,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  modalSubmitBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
