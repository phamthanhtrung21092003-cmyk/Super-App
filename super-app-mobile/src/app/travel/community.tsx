import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform, SafeAreaView,
  StatusBar, ScrollView, Image, TextInput, Dimensions, useWindowDimensions, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const POSTS = [
  {
    id: 'p1',
    user: { name: 'Minh Tú', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', followers: '12.5k', verified: true },
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
    caption: '🌊 Vịnh Hạ Long sau cơn mưa — đẹp đến không thở được 😍 Ai chưa đi thì phải đi ngay!!!',
    location: 'Vịnh Hạ Long, Quảng Ninh',
    likes: 3241,
    comments: 182,
    shares: 56,
    saves: 290,
    time: '2 giờ trước',
    tags: ['#HạLong', '#ViệtNam', '#Travel'],
    type: 'image',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'p2',
    user: { name: 'Thu Hà', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b67e?w=100', followers: '8.2k', verified: false },
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    caption: '❄️ Sapa tháng 10 lạnh cực mà đẹp cực! Tip: Đặt phòng homestay với lò sưởi nhé! Mình đặt qua app tiết kiệm được 30% 🎉',
    location: 'Sapa, Lào Cai',
    likes: 1520,
    comments: 94,
    shares: 31,
    saves: 445,
    time: '5 giờ trước',
    tags: ['#Sapa', '#Trekking', '#RetreatVibes'],
    type: 'image',
    isLiked: true,
    isSaved: false,
  },
  {
    id: 'p3',
    user: { name: 'Khánh Duy', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', followers: '45.1k', verified: true },
    image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?w=400',
    caption: '🏖️ Phú Quốc 2024 — Biển trong, cát mịn, cá mực chiên giòn...không muốn về nữa 😭 Ai hỏi gia đình mình đi hết 4 ngày tốn bao nhiêu: 18 triệu 4 người all-inclusive tour. Worth it! ',
    location: 'Phú Quốc, Kiên Giang',
    likes: 8901,
    comments: 521,
    shares: 203,
    saves: 1205,
    time: '1 ngày trước',
    tags: ['#PhuQuoc', '#FamilyTravel', '#Summer2024'],
    type: 'video',
    isLiked: false,
    isSaved: true,
  },
];

export default function CommunityScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [posts, setPosts] = useState(POSTS);
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Nổi bật');

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const toggleSave = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, isSaved: !p.isSaved } : p));
  };

  const fmtNum = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString();

  const FILTERS = ['Nổi bật', 'Theo dõi', 'Gần tôi', 'Video', 'Ảnh'];

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient colors={['#0F172A', '#0F172A']} style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.headerBack}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Cộng đồng</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={S.headerIcon}>
              <Ionicons name="search" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={S.headerIcon}>
              <Ionicons name="add-circle-outline" size={22} color="#0EA5E9" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* FILTER CHIPS */}
        <View style={S.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {FILTERS.map(f => (
              <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[S.filterChip, activeFilter === f && S.filterChipActive]}>
                <Text style={[S.filterChipTxt, activeFilter === f && S.filterChipTxtActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          {/* STORY ROW */}
          <View style={S.storyRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              <TouchableOpacity style={S.addStory}>
                <LinearGradient colors={['#0EA5E9', '#14B8A6']} style={S.addStoryIcon}>
                  <Ionicons name="add" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={S.storyLabel}>Của bạn</Text>
              </TouchableOpacity>
              {POSTS.map(p => (
                <TouchableOpacity key={p.id} style={S.storyItem}>
                  <View style={S.storyRing}>
                    <Image source={{ uri: p.user.avatar }} style={S.storyAvatar} />
                  </View>
                  <Text style={S.storyLabel} numberOfLines={1}>{p.user.name.split(' ').pop()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* POSTS FEED */}
          {posts.map(post => (
            <View key={post.id} style={S.postCard}>
              {/* Post Header */}
              <View style={S.postHeader}>
                <View style={S.postUserRow}>
                  <Image source={{ uri: post.user.avatar }} style={S.postAvatar} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={S.postUserName}>{post.user.name}</Text>
                      {post.user.verified && <Ionicons name="checkmark-circle" size={14} color="#0EA5E9" />}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="location-outline" size={11} color="#64748B" />
                      <Text style={S.postLocation}>{post.location}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={S.followBtn}>
                    <Text style={S.followBtnTxt}>Theo dõi</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Post Image */}
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: post.image }} style={S.postImage} resizeMode="cover" />
                {post.type === 'video' && (
                  <View style={S.playOverlay}>
                    <LinearGradient colors={['rgba(14,165,233,0.8)', 'rgba(20,184,166,0.8)']} style={S.playBtn}>
                      <Ionicons name="play" size={28} color="#FFF" />
                    </LinearGradient>
                    <View style={S.videoBadge}>
                      <Ionicons name="videocam" size={12} color="#FFF" />
                      <Text style={S.videoBadgeTxt}>VIDEO</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Bar */}
              <View style={S.actionBar}>
                <TouchableOpacity onPress={() => toggleLike(post.id)} style={S.actionBtn}>
                  <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={26} color={post.isLiked ? '#EF4444' : '#FFF'} />
                  <Text style={S.actionCount}>{fmtNum(post.likes)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.actionBtn} onPress={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}>
                  <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
                  <Text style={S.actionCount}>{fmtNum(post.comments)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.actionBtn} onPress={() => Alert.alert('Chia sẻ', 'Đã sao chép link!')}>
                  <Ionicons name="share-social-outline" size={24} color="#FFF" />
                  <Text style={S.actionCount}>{fmtNum(post.shares)}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleSave(post.id)} style={[S.actionBtn, { marginLeft: 'auto' }]}>
                  <Ionicons name={post.isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={post.isSaved ? '#F97316' : '#FFF'} />
                </TouchableOpacity>
              </View>

              {/* Caption */}
              <View style={S.captionArea}>
                <Text style={S.captionText} numberOfLines={3}>
                  <Text style={S.captionUser}>{post.user.name} </Text>
                  {post.caption}
                </Text>
                <View style={S.tagRow}>
                  {post.tags.map(tag => (
                    <Text key={tag} style={S.tagText}>{tag} </Text>
                  ))}
                </View>
                <Text style={S.timeText}>{post.time}</Text>
              </View>

              {/* Comment Input */}
              {activeCommentId === post.id && (
                <View style={S.commentInput}>
                  <TextInput
                    style={S.commentTextInput}
                    placeholder="Thêm bình luận..."
                    placeholderTextColor="#475569"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity onPress={() => { Alert.alert('Đã bình luận!'); setCommentText(''); setActiveCommentId(null); }}>
                    <Ionicons name="send" size={22} color="#0EA5E9" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* BOTTOM NAV */}
        <View style={S.bottomNav}>
          {[
            { icon: 'home-outline', label: 'Khám phá', route: '/travel' },
            { icon: 'search-outline', label: 'Tìm kiếm', route: '/travel/search' },
            { icon: 'add-circle', label: 'Đăng', route: null, accent: true },
            { icon: 'people', label: 'Cộng đồng', route: '/travel/community', active: true },
            { icon: 'person-outline', label: 'Hồ sơ', route: '/travel/profile' },
          ].map((tab, i) => (
            <TouchableOpacity key={i} style={S.navTab} onPress={() => tab.route ? router.push(tab.route as any) : Alert.alert('Đăng bài', 'Tính năng sắp ra mắt!')}>
              {tab.accent ? (
                <LinearGradient colors={['#0EA5E9', '#14B8A6']} style={S.navAddBtn}>
                  <Ionicons name={tab.icon as any} size={26} color="#FFF" />
                </LinearGradient>
              ) : (
                <Ionicons name={tab.icon as any} size={24} color={tab.active ? '#0EA5E9' : '#64748B'} />
              )}
              {!tab.accent && <Text style={[S.navLabel, tab.active && { color: '#0EA5E9' }]}>{tab.label}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safe: { flex: 1, backgroundColor: '#0F172A', width: '100%' },
  desktop: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000', borderRadius: 44, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 12, paddingBottom: 12 },
  headerBack: { padding: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  headerIcon: { padding: 6 },
  filterRow: { backgroundColor: '#0F172A', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1E293B' },
  filterChipActive: { backgroundColor: '#0C4A6E', borderWidth: 1, borderColor: '#0EA5E9' },
  filterChipTxt: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  filterChipTxtActive: { color: '#0EA5E9' },

  storyRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  addStory: { alignItems: 'center', width: 60 },
  addStoryIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  storyItem: { alignItems: 'center', width: 60 },
  storyRing: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: '#0EA5E9', padding: 2 },
  storyAvatar: { width: 46, height: 46, borderRadius: 23 },
  storyLabel: { color: '#94A3B8', fontSize: 11, marginTop: 4, textAlign: 'center' },

  postCard: { borderBottomWidth: 8, borderBottomColor: '#1E293B', paddingBottom: 4 },
  postHeader: { padding: 12 },
  postUserRow: { flexDirection: 'row', alignItems: 'center' },
  postAvatar: { width: 40, height: 40, borderRadius: 20 },
  postUserName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  postLocation: { color: '#64748B', fontSize: 11 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5, borderColor: '#0EA5E9' },
  followBtnTxt: { color: '#0EA5E9', fontSize: 13, fontWeight: '600' },
  postImage: { width: '100%', height: 320 },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  videoBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  videoBadgeTxt: { color: '#FFF', fontSize: 10, fontWeight: '700', marginLeft: 4 },
  actionBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionCount: { color: '#E2E8F0', fontSize: 13, fontWeight: '600', marginLeft: 4 },
  captionArea: { paddingHorizontal: 14, paddingBottom: 12 },
  captionUser: { color: '#FFF', fontWeight: '700' },
  captionText: { color: '#E2E8F0', fontSize: 14, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  tagText: { color: '#0EA5E9', fontSize: 13, fontWeight: '600' },
  timeText: { color: '#64748B', fontSize: 11, marginTop: 6 },
  commentInput: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  commentTextInput: { flex: 1, backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, color: '#FFF', fontSize: 14 },

  bottomNav: { flexDirection: 'row', backgroundColor: '#1E293B', borderTopWidth: 1, borderTopColor: '#334155', paddingVertical: 8 },
  navTab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navAddBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  navLabel: { color: '#64748B', fontSize: 10, marginTop: 2 },
});
