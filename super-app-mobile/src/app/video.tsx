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
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    user: { username: '@nature_vibes', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    caption: 'Vẻ đẹp thiên nhiên rực rỡ! Một buổi chiều thật chill bên những bông hoa vàng. 🌼✨ #nature #chill #flowers',
    music: 'Original Sound - Nature Vibes',
    likes: '124K',
    comments: '4.2K',
    shares: '12K',
    location: 'Đà Lạt, Lâm Đồng',
    linkedService: { type: 'tour', title: 'Tour Săn Mây Đà Lạt', price: '450.000đ', icon: '⛺' },
    commentsList: [
      { id: 'c1', user: 'Linh Nga', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', text: 'Cảnh đẹp quá! Ở đâu vậy bạn?' },
      { id: 'c2', user: 'Minh Quân', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', text: 'Thật yên bình ❤️' }
    ]
  },
  {
    id: '2',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    user: { username: '@family_moments', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
    caption: 'Khoảnh khắc đáng yêu của hai mẹ con cuối tuần. Marshmallow ngon tuyệt! 🥰🍡 #family #cute #weekend',
    music: 'Happy Kids - Background Music',
    likes: '89K',
    comments: '1.5K',
    shares: '5K',
    location: 'Quận 1, TP.HCM',
    linkedService: { type: 'food', title: 'Kẹo dẻo Marshmallow', price: '55.000đ', icon: '🍬' },
    commentsList: [
      { id: 'c3', user: 'Mẹ Bỉm Sữa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', text: 'Bé cưng quá đi mất thôi 🥰' }
    ]
  },
  {
    id: '3',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    user: { username: '@photo_graphy', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100' },
    caption: 'Hậu trường chụp ảnh lookbook siêu ngầu. Góc chụp quyết định tất cả! 📸🔥 #photography #behindthescenes',
    music: 'Trending Song - Beat Drop',
    likes: '250K',
    comments: '10K',
    shares: '45K',
    location: 'Hoàn Kiếm, Hà Nội',
    linkedService: { type: 'shopping', title: 'Máy ảnh Film Vintage', price: '1.200.000đ', icon: '📸' },
    commentsList: [
      { id: 'c4', user: 'Nhiếp Ảnh Gia', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'Góc máy ảo diệu thật sự!' },
      { id: 'c5', user: 'Mẫu Ảnh HN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', text: 'Tuyệt vờiiii 🔥' }
    ]
  }
];

// Single Video Item Component
const VideoItem = ({ item, isActive, windowHeight, windowWidth, theme, onCommentPress, onSharePress, onGiftPress, onProfilePress, onAudioPress, onProductPress }) => {
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
    player.muted = true; // Bắt buộc mute trên web để autoplay hoạt động
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
    <View style={{ height: Platform.OS === 'web' ? '100vh' : windowHeight, width: windowWidth, backgroundColor: '#000' }}>
      <VideoView 
        style={StyleSheet.absoluteFill} 
        player={player} 
        allowsFullscreen={false} 
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="cover"
      />

      <TouchableOpacity 
        activeOpacity={1} 
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]} 
        onPress={handlePress}
      >

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

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.bottomGradient}
        />

        {/* --- SUPER APP CUSTOM BOTTOM LAYOUT --- */}
        <SafeAreaView style={styles.superAppLayout} pointerEvents="box-none">
          <View style={styles.contentWrapper}>
            
            {/* Linked Service / Product Card */}
            {item.linkedService && (
              <TouchableOpacity style={styles.linkedServiceCard} onPress={() => onProductPress(item.linkedService)}>
                <Text style={styles.linkedServiceIcon}>{item.linkedService.icon}</Text>
                <View style={styles.linkedServiceInfo}>
                  <Text style={[styles.linkedServiceTitle, { fontFamily: theme.fontFamily }]} numberOfLines={1}>
                    {item.linkedService.title}
                  </Text>
                  <Text style={[styles.linkedServicePrice, { fontFamily: theme.fontFamily }]}>
                    {item.linkedService.price}
                  </Text>
                </View>
                <View style={[styles.buyButton, { backgroundColor: theme.accentHex }]}>
                  <Text style={[styles.buyButtonText, { fontFamily: theme.fontFamily }]}>Mua</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* User Info Card */}
            <View style={styles.userInfoCard}>
              <TouchableOpacity onPress={() => onProfilePress(item.user)}>
                <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
              </TouchableOpacity>
              <View style={styles.userDetails}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.usernameText, { fontFamily: theme.fontFamily }]}>{item.user.username}</Text>
                  {!isFollowing && (
                    <TouchableOpacity style={[styles.followPill, { backgroundColor: theme.accentHex }]} onPress={() => setIsFollowing(true)}>
                      <Text style={[styles.followPillText, { fontFamily: theme.fontFamily }]}>Theo dõi</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {item.location && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Ionicons name="location" size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={[styles.locationText, { fontFamily: theme.fontFamily }]}>{item.location}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Caption */}
            <TouchableOpacity onPress={() => setExpandedCaption(!expandedCaption)} style={styles.captionBlock}>
              <Text style={[styles.captionText, { fontFamily: theme.fontFamily }]} numberOfLines={expandedCaption ? 0 : 2}>
                {item.caption}
              </Text>
            </TouchableOpacity>

            {/* Music */}
            <TouchableOpacity style={styles.musicRow} onPress={onAudioPress}>
              <Ionicons name="musical-notes" size={14} color="rgba(255,255,255,0.7)" style={{ marginRight: 6 }} />
              <View style={{ width: 200, overflow: 'hidden' }}>
                <Animated.Text style={[styles.musicText, { fontFamily: theme.fontFamily }, animatedMusicStyle]} numberOfLines={1}>
                  {item.music}    •    {item.music}
                </Animated.Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Horizontal Action Bar */}
          <View style={styles.horizontalActionBar}>
            <TouchableOpacity style={styles.actionPill} onPress={() => setIsLiked(!isLiked)}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#FF4D4F" : "#FFF"} />
              <Text style={[styles.actionPillText, { fontFamily: theme.fontFamily }]}>{item.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionPill} onPress={onCommentPress}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFF" />
              <Text style={[styles.actionPillText, { fontFamily: theme.fontFamily }]}>{item.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionPill} onPress={onSharePress}>
              <Ionicons name="arrow-redo-outline" size={20} color="#FFF" />
              <Text style={[styles.actionPillText, { fontFamily: theme.fontFamily }]}>{item.shares}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionPill} onPress={() => setIsSaved(!isSaved)}>
              <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? "#FADB14" : "#FFF"} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionPill, { backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' }]} onPress={onGiftPress}>
              <Ionicons name="gift-outline" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>

        </SafeAreaView>

        {/* Animated Scrubber / Progress Bar */}
        <View style={styles.scrubberContainer}>
          <View style={[styles.scrubberTrack, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
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
  const [showGift, setShowGift] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
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
        style={{ flex: 1 }}
        data={activeTab === 'following' ? [MOCK_VIDEOS[0]] : MOCK_VIDEOS}
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
            onGiftPress={() => setShowGift(true)}
            onProfilePress={(user) => { setSelectedUser(user); setShowProfile(true); }}
            onAudioPress={() => setShowAudio(true)}
            onProductPress={(service) => window.alert(`Đang chuyển sang trang Thanh toán: ${service.title}`)}
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
      <SafeAreaView style={styles.topNavContainer} pointerEvents="box-none">
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.replace('/home')} style={styles.glassBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.glassPillContainer}>
            <TouchableOpacity onPress={() => setActiveTab('following')} style={[styles.pillBtn, activeTab === 'following' && styles.pillBtnActive]}>
              <Text style={[styles.pillText, { fontFamily: theme.fontFamily }, activeTab === 'following' && styles.pillTextActive]}>
                Bạn bè
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('foryou')} style={[styles.pillBtn, activeTab === 'foryou' && styles.pillBtnActive]}>
              <Text style={[styles.pillText, { fontFamily: theme.fontFamily }, activeTab === 'foryou' && styles.pillTextActive]}>
                Đề xuất
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.glassBtn} onPress={() => setShowSearch(true)}>
            <Ionicons name="search" size={20} color="#FFF" />
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

      {/* Gift Bottom Sheet */}
      <Modal visible={showGift} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowGift(false)} />
          <BlurView intensity={80} tint="dark" style={[styles.sheetContent, { height: 380 }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Tặng quà cho {currentVideo?.user.username}</Text>
              <TouchableOpacity onPress={() => setShowGift(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 20, justifyContent: 'space-between' }}>
              {[
                { name: 'Hoa hồng', price: '10', icon: '🌹' },
                { name: 'Cà phê', price: '50', icon: '☕' },
                { name: 'Trái tim', price: '99', icon: '💖' },
                { name: 'Tên lửa', price: '299', icon: '🚀' },
                { name: 'Vương miện', price: '500', icon: '👑' },
                { name: 'Siêu xe', price: '1000', icon: '🏎️' },
                { name: 'Biệt thự', price: '5000', icon: '🏡' },
                { name: 'Du thuyền', price: '9999', icon: '🛥️' }
              ].map((gift, i) => (
                <TouchableOpacity key={i} style={{ width: '22%', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>{gift.icon}</Text>
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '600' }} numberOfLines={1}>{gift.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="logo-bitcoin" size={10} color="#FADB14" />
                    <Text style={{ color: '#FADB14', fontSize: 11, marginLeft: 2, fontWeight: 'bold' }}>{gift.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={{ marginHorizontal: 20, backgroundColor: theme.accentHex, padding: 14, borderRadius: 25, alignItems: 'center' }} onPress={() => { window.alert('Nạp thêm xu để tặng quà!'); setShowGift(false); }}>
              <Text style={{ color: '#000', fontWeight: '800', fontSize: 16 }}>Nạp xu</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowProfile(false)} />
          <BlurView intensity={80} tint="dark" style={[styles.sheetContent, { height: height * 0.7 }]}>
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Image source={{ uri: selectedUser?.avatar }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: theme.accentHex, marginBottom: 12 }} />
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>{selectedUser?.username}</Text>
              <Text style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Nhà sáng tạo nội dung</Text>
              
              <View style={{ flexDirection: 'row', marginTop: 24, width: '100%', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>1.2M</Text>
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Đang follow</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>5.8M</Text>
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Follower</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>24M</Text>
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Thích</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', marginTop: 24, width: '100%', justifyContent: 'center', gap: 12 }}>
                <TouchableOpacity style={{ backgroundColor: '#FF4D4F', width: '45%', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Đang theo dõi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: '45%', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Nhắn tin</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flex: 1, backgroundColor: '#000' }}>
              <View style={{ flexDirection: 'row', padding: 16 }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16, borderBottomWidth: 2, borderBottomColor: '#FFF', paddingBottom: 4 }}>Video</Text>
                <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16, marginLeft: 24 }}>Đã thích</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {/* Fake video grid */}
                {[1,2,3].map(i => (
                  <View key={i} style={{ width: '33.3%', height: 160, padding: 1 }}>
                    <Image source={{ uri: currentVideo?.uri }} style={{ width: '100%', height: '100%', backgroundColor: '#333' }} />
                    <View style={{ position: 'absolute', bottom: 4, left: 4, flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="play-outline" size={12} color="#FFF" />
                      <Text style={{ color: '#FFF', fontSize: 10, marginLeft: 2 }}>{100 + i}K</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Audio Modal */}
      <Modal visible={showAudio} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowAudio(false)} />
          <BlurView intensity={80} tint="dark" style={[styles.sheetContent, { height: height * 0.45 }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Âm thanh</Text>
              <TouchableOpacity onPress={() => setShowAudio(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Image source={{ uri: currentVideo?.user.avatar }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#333', marginBottom: 16 }} />
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>{currentVideo?.music}</Text>
              <Text style={{ color: '#888', fontSize: 14, marginTop: 6 }}>150K video đang sử dụng bài hát này</Text>
              <TouchableOpacity style={{ marginTop: 30, backgroundColor: theme.accentHex, width: '90%', padding: 14, borderRadius: 25, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                <Ionicons name="videocam" size={22} color="#000" style={{ marginRight: 8 }} />
                <Text style={{ color: '#000', fontWeight: '800', fontSize: 16 }}>Sử dụng âm thanh này</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal visible={showSearch} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#111', paddingTop: Platform.OS === 'ios' ? 50 : 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60 }}>
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Ionicons name="search" size={20} color="#888" />
              <TextInput autoFocus placeholder="Tìm kiếm video, người dùng..." placeholderTextColor="#888" style={{ flex: 1, marginLeft: 8, color: '#FFF', fontSize: 15 }} />
            </View>
            <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => setShowSearch(false)}>
              <Text style={{ color: theme.accentHex, fontWeight: 'bold', fontSize: 16 }}>Tìm</Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#888', fontWeight: 'bold', marginBottom: 16, fontSize: 15 }}>Tìm kiếm phổ biến</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {['Xu hướng du lịch 2026', 'Review ẩm thực Sài Gòn', 'Outfit of the day', 'Cách chụp ảnh bằng iPhone', 'Nhạc trend tiktok', 'Siêu app 2026'].map((tag, i) => (
                <TouchableOpacity key={i} style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 }}>
                  <Text style={{ color: '#FFF', fontSize: 14 }}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={24} color="rgba(255,255,255,0.6)" />
          <Text style={[styles.tabItemText, { fontFamily: theme.fontFamily }]}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="bag-handle-outline" size={24} color="rgba(255,255,255,0.6)" />
          <Text style={[styles.tabItemText, { fontFamily: theme.fontFamily }]}>Cửa hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItemCenter}>
          <View style={[styles.centerAddBtn, { backgroundColor: theme.accentHex }]}>
            <Ionicons name="add" size={28} color="#000" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbox-ellipses-outline" size={24} color="rgba(255,255,255,0.6)" />
          <Text style={[styles.tabItemText, { fontFamily: theme.fontFamily }]}>Hộp thư</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color="rgba(255,255,255,0.6)" />
          <Text style={[styles.tabItemText, { fontFamily: theme.fontFamily }]}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    ...(Platform.OS === 'web' && { height: '100vh', overflow: 'hidden' }),
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
  superAppLayout: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
  },
  contentWrapper: {
    marginBottom: 16,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FFF',
    marginRight: 12,
  },
  userDetails: {
    justifyContent: 'center',
  },
  usernameText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  followPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  followPillText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  locationText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 4,
  },
  captionBlock: {
    marginBottom: 8,
  },
  captionText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  horizontalActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' }),
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionPillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  linkedServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' }),
  },
  linkedServiceIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  linkedServiceInfo: {
    flex: 1,
  },
  linkedServiceTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  linkedServicePrice: {
    color: '#FADB14',
    fontSize: 13,
    fontWeight: '800',
  },
  buyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  buyButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  musicText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  scrubberContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 50,
  },
  glassBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' }),
  },
  glassPillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' }),
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pillText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFF',
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
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    height: Platform.OS === 'ios' ? 80 : 60,
    zIndex: 50,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabItemText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  tabItemCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  centerAddBtn: {
    width: 44,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
