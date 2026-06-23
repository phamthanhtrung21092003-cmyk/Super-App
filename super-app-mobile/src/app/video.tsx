import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Share, ScrollView } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withRepeat,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const MOCK_VIDEOS = [
  {
    id: '1',
    uri: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    user: { username: '@nature_vibes', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    caption: 'Vẻ đẹp thiên nhiên rực rỡ! Một buổi chiều thật chill bên những bông hoa vàng. 🌼✨ #nature #chill #flowers',
    music: 'Original Sound - Nature Vibes',
    likes: '124K',
    comments: '4.2K',
    shares: '12K',
    commentsList: [
      { id: 'c1', user: 'Linh Nga', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', text: 'Cảnh đẹp quá! Ở đâu vậy bạn?' },
      { id: 'c2', user: 'Minh Quân', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', text: 'Thật yên bình ❤️' }
    ]
  },
  {
    id: '2',
    uri: 'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
    user: { username: '@family_moments', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
    caption: 'Khoảnh khắc đáng yêu của hai mẹ con cuối tuần. Marshmallow ngon tuyệt! 🥰🍡 #family #cute #weekend',
    music: 'Happy Kids - Background Music',
    likes: '89K',
    comments: '1.5K',
    shares: '5K',
    commentsList: [
      { id: 'c3', user: 'Mẹ Bỉm Sữa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', text: 'Bé cưng quá đi mất thôi 🥰' }
    ]
  },
  {
    id: '3',
    uri: 'https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4',
    user: { username: '@photo_graphy', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100' },
    caption: 'Hậu trường chụp ảnh lookbook siêu ngầu. Góc chụp quyết định tất cả! 📸🔥 #photography #behindthescenes',
    music: 'Trending Song - Beat Drop',
    likes: '250K',
    comments: '10K',
    shares: '45K',
    commentsList: [
      { id: 'c4', user: 'Nhiếp Ảnh Gia', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'Góc máy ảo diệu thật sự!' },
      { id: 'c5', user: 'Mẫu Ảnh HN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', text: 'Tuyệt vờiiii 🔥' }
    ]
  }
];

// Single Video Item Component
const VideoItem = ({ item, isActive, windowHeight, windowWidth, theme, onCommentPress, onSharePress }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [heartCoords, setHeartCoords] = useState<{x: number, y: number} | null>(null);

  // Animations
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const discRotation = useSharedValue(0);
  const playIconOpacity = useSharedValue(0);

  // Video Player Setup
  const player = useVideoPlayer(item.uri, player => {
    player.loop = true;
    player.volume = 1;
  });

  useEffect(() => {
    if (isActive && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPaused, player]);

  // Spinning disc animation
  useEffect(() => {
    if (isActive && !isPaused) {
      discRotation.value = withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1, // Infinite
        false
      );
    } else {
      // Logic pause disc
    }
  }, [isActive, isPaused]);

  const animatedDiscStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${discRotation.value}deg` }]
    };
  });

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      opacity: heartOpacity.value,
      transform: [
        { scale: heartScale.value },
        { translateY: -heartScale.value * 50 }
      ]
    };
  });

  const animatedPlayIconStyle = useAnimatedStyle(() => {
    return {
      opacity: playIconOpacity.value,
      transform: [{ scale: playIconOpacity.value === 0 ? 0.5 : 1 }]
    };
  });

  const scrubberProgress = useSharedValue(0);
  useEffect(() => {
    if (isActive && !isPaused) {
      scrubberProgress.value = withRepeat(
        withTiming(100, { duration: 15000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [isActive, isPaused]);

  const animatedScrubberStyle = useAnimatedStyle(() => {
    return {
      width: `${scrubberProgress.value}%`
    };
  });

  const musicScroll = useSharedValue(0);
  useEffect(() => {
    if (isActive && !isPaused) {
      musicScroll.value = withRepeat(
        withTiming(-100, { duration: 5000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [isActive, isPaused]);

  const animatedMusicStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: musicScroll.value }]
    };
  });

  let lastTap = 0;

  const handlePress = (evt) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double Tap -> Like
      const { locationX, locationY } = evt.nativeEvent;
      handleDoubleTapLike(locationX, locationY);
    } else {
      // Single Tap -> Pause/Play
      setTimeout(() => {
        if (Date.now() - lastTap >= DOUBLE_TAP_DELAY) {
          togglePlayPause();
        }
      }, DOUBLE_TAP_DELAY);
    }
    lastTap = now;
  };

  const handleDoubleTapLike = (x, y) => {
    if (!isLiked) setIsLiked(true);
    
    // Show floating heart
    setHeartCoords({ x: x - 40, y: y - 40 }); // Center the 80x80 heart
    heartScale.value = 0;
    heartOpacity.value = 1;
    
    heartScale.value = withSpring(1.5, { damping: 10 }, () => {
      heartOpacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(setHeartCoords)(null);
      });
    });
  };

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
    playIconOpacity.value = 1;
    playIconOpacity.value = withTiming(0, { duration: 1000 });
  };

  return (
    <View style={{ height: windowHeight, width: windowWidth, backgroundColor: '#000' }}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={StyleSheet.absoluteFill} 
        onPress={handlePress}
      >
        <VideoView 
          style={StyleSheet.absoluteFill} 
          player={player} 
          allowsFullscreen={false} 
          allowsPictureInPicture={false}
          contentFit="cover"
        />

        {/* Play/Pause Center Indicator */}
        <Animated.View style={[styles.centerPlayIcon, animatedPlayIconStyle]}>
          <Ionicons name={isPaused ? "play" : "pause"} size={80} color="rgba(255,255,255,0.6)" />
        </Animated.View>

        {/* Double Tap Floating Heart */}
        {heartCoords && (
          <Animated.View style={[
            { position: 'absolute', left: heartCoords.x, top: heartCoords.y, zIndex: 50 },
            animatedHeartStyle
          ]}>
            <Ionicons name="heart" size={80} color="#FF4D4F" />
          </Animated.View>
        )}

        {/* Dark Gradient Overlay for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomGradient}
        />

        {/* Right Side Actions */}
        <View style={styles.rightOverlay}>
          <TouchableOpacity style={styles.actionItem} onPress={() => setIsFollowing(true)}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
              {!isFollowing && (
                <View style={styles.followButton}>
                  <Ionicons name="add" size={12} color="#FFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => setIsLiked(!isLiked)}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={36} color={isLiked ? "#FF4D4F" : "#FFF"} />
            <Text style={[styles.actionText, { fontFamily: theme.fontFamily }]}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={onCommentPress}>
            <Ionicons name="chatbubble-ellipses-outline" size={36} color="#FFF" />
            <Text style={[styles.actionText, { fontFamily: theme.fontFamily }]}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => setIsSaved(!isSaved)}>
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={32} color={isSaved ? "#FADB14" : "#FFF"} />
            <Text style={[styles.actionText, { fontFamily: theme.fontFamily }]}>{isSaved ? 'Đã lưu' : 'Lưu'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={onSharePress}>
            <Ionicons name="arrow-redo-outline" size={36} color="#FFF" />
            <Text style={[styles.actionText, { fontFamily: theme.fontFamily }]}>{item.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => window.alert('Đang mở Âm thanh nguyên gốc...')}>
            <Animated.View style={[styles.discContainer, animatedDiscStyle]}>
              <Image 
                source={{ uri: item.user.avatar }}
                style={styles.discImage} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Bottom Info Overlay */}
        <View style={styles.bottomOverlay}>
          <TouchableOpacity onPress={() => window.alert(`Đang xem hồ sơ: ${item.user.username}`)}>
            <Text style={[styles.username, { fontFamily: theme.fontFamily }]}>{item.user.username}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setExpandedCaption(!expandedCaption)}>
            <Text 
              style={[styles.caption, { fontFamily: theme.fontFamily }]} 
              numberOfLines={expandedCaption ? 0 : 2}
            >
              {item.caption}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.musicRow} onPress={() => window.alert('Đang mở bài hát gốc...')}>
            <Ionicons name="musical-notes" size={16} color="#FFF" style={{ marginRight: 8, ...styles.shadowIcon }} />
            <View style={{ width: 150, overflow: 'hidden' }}>
              <Animated.Text style={[styles.musicText, { fontFamily: theme.fontFamily }, animatedMusicStyle]} numberOfLines={1}>
                {item.music}    •    {item.music}
              </Animated.Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Animated Scrubber / Progress Bar */}
        <View style={styles.scrubberContainer}>
          <View style={[styles.scrubberTrack, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <Animated.View style={[styles.scrubberFill, { backgroundColor: '#FFF' }, animatedScrubberStyle]} />
        </View>

      </TouchableOpacity>
    </View>
  );
};

export default function VideoScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  
  const windowHeight = Platform.OS === 'web' ? height : height; 
  
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('foryou');

  // Modals state
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  
  // Real Comments State
  const [commentsData, setCommentsData] = useState({});
  const [newCommentText, setNewCommentText] = useState('');

  // Setup initial comments for each video
  useEffect(() => {
    const initialComments = {};
    MOCK_VIDEOS.forEach(v => {
      initialComments[v.id] = [...v.commentsList];
    });
    setCommentsData(initialComments);
  }, []);

  const currentVideo = MOCK_VIDEOS[activeVideoIndex];

  const handleSendComment = () => {
    if (!newCommentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      user: 'Người dùng',
      avatar: 'https://ui-avatars.com/api/?name=User&background=random',
      text: newCommentText
    };
    setCommentsData(prev => ({
      ...prev,
      [currentVideo.id]: [newComment, ...prev[currentVideo.id]]
    }));
    setNewCommentText('');
  };

  const handleShareSystem = async () => {
    try {
      await Share.share({
        message: `Đang xem video cực đỉnh trên Super App! ${currentVideo.caption}\n${currentVideo.uri}`,
      });
      setShowShare(false);
    } catch (error) {
      console.log(error);
    }
  };

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Feed */}
      <FlatList
        data={MOCK_VIDEOS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoItem 
            item={item} 
            isActive={index === activeVideoIndex} 
            windowHeight={windowHeight}
            windowWidth={width}
            theme={theme}
            onCommentPress={() => setShowComments(true)}
            onSharePress={() => setShowShare(true)}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      {/* Top Navigation */}
      <SafeAreaView style={styles.topNavContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.replace('/home')} style={[styles.backBtn, styles.shadowIcon]}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.tabsRow}>
            <TouchableOpacity onPress={() => setActiveTab('following')}>
              <Text style={[styles.tabText, { fontFamily: theme.fontFamily }, activeTab === 'following' && styles.tabTextActive]}>
                Đang theo dõi
              </Text>
            </TouchableOpacity>
            <View style={styles.tabDivider} />
            <TouchableOpacity onPress={() => setActiveTab('foryou')}>
              <Text style={[styles.tabText, { fontFamily: theme.fontFamily }, activeTab === 'foryou' && styles.tabTextActive]}>
                Dành cho bạn
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.searchBtn, styles.shadowIcon]} 
            onPress={() => window.alert('Tính năng Tìm kiếm đang phát triển')}
          >
            <Ionicons name="search" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Comments Bottom Sheet (Real) */}
      <Modal visible={showComments} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowComments(false)} />
          <BlurView intensity={80} tint="dark" style={[styles.sheetContent, { height: height * 0.6 }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>{(commentsData[currentVideo?.id] || []).length} Bình luận</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sheetBody}>
              {(commentsData[currentVideo?.id] || []).map(cmt => (
                <View key={cmt.id} style={styles.commentItem}>
                  <Image source={{ uri: cmt.avatar }} style={styles.commentItemAvatar} />
                  <View style={styles.commentItemContent}>
                    <Text style={[styles.commentItemUser, { fontFamily: theme.fontFamily }]}>{cmt.user}</Text>
                    <Text style={[styles.commentItemText, { fontFamily: theme.fontFamily }]}>{cmt.text}</Text>
                  </View>
                  <Ionicons name="heart-outline" size={16} color="#888" style={{ marginTop: 10 }} />
                </View>
              ))}
            </ScrollView>
            <View style={styles.commentInputRow}>
              <Image source={{ uri: 'https://ui-avatars.com/api/?name=User&background=random' }} style={styles.commentAvatar} />
              <TextInput 
                style={[styles.commentInput, { fontFamily: theme.fontFamily }]} 
                placeholder="Thêm bình luận..." 
                placeholderTextColor="#888"
                value={newCommentText}
                onChangeText={setNewCommentText}
                onSubmitEditing={handleSendComment}
                returnKeyType="send"
              />
              <TouchableOpacity onPress={handleSendComment} style={{ marginLeft: 12 }}>
                <Ionicons name="send" size={24} color={newCommentText.trim() ? theme.accentHex : "#666"} />
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Share Bottom Sheet (Real) */}
      <Modal visible={showShare} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowShare(false)} />
          <BlurView intensity={80} tint="dark" style={[styles.sheetContent, { height: 250 }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Chia sẻ tới</Text>
              <TouchableOpacity onPress={() => setShowShare(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.shareGrid}>
              <TouchableOpacity style={styles.shareItem} onPress={handleShareSystem}>
                <View style={[styles.shareIconWrap, { backgroundColor: '#1877F2' }]}>
                  <Ionicons name="logo-facebook" size={28} color="#FFF" />
                </View>
                <Text style={[styles.shareText, { fontFamily: theme.fontFamily }]}>Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareItem} onPress={handleShareSystem}>
                <View style={[styles.shareIconWrap, { backgroundColor: '#25D366' }]}>
                  <Ionicons name="logo-whatsapp" size={28} color="#FFF" />
                </View>
                <Text style={[styles.shareText, { fontFamily: theme.fontFamily }]}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareItem} onPress={handleShareSystem}>
                <View style={[styles.shareIconWrap, { backgroundColor: '#666' }]}>
                  <Ionicons name="share-social" size={28} color="#FFF" />
                </View>
                <Text style={[styles.shareText, { fontFamily: theme.fontFamily }]}>Khác</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    zIndex: 10,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  rightOverlay: {
    position: 'absolute',
    right: 8,
    bottom: 60,
    alignItems: 'center',
    width: 60,
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFF',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  followButton: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  discImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 80,
  },
  username: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  musicText: {
    color: '#FFF',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scrubberContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  scrubberTrack: {
    ...StyleSheet.absoluteFillObject,
  },
  scrubberFill: {
    height: '100%',
  },
  topNavContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    height: 80,
  },
  backBtn: {
    width: 40,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabTextActive: {
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tabDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 16,
  },
  searchBtn: {
    width: 40,
    alignItems: 'flex-end',
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,20,20,0.85)',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sheetTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetBody: {
    flex: 1,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#FFF',
  },
  shareGrid: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  shareItem: {
    alignItems: 'center',
  },
  shareIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareText: {
    color: '#FFF',
    fontSize: 12,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,
  },
  commentItemAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentItemContent: {
    flex: 1,
  },
  commentItemUser: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginBottom: 4,
  },
  commentItemText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
  }
});
