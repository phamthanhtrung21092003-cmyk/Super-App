import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  StatusBar,
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPLASH_IMAGE_BASE64 } from '../constants/splashImageBase64';
import { AuthProvider, useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, networkError, checkSession } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Xử lý chuyển trang mượt mà sau khi kiểm tra phiên xong
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // Chưa đăng nhập -> Vào màn hình đăng nhập
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Đã đăng nhập -> Vào thẳng buồng lái
      router.replace('/(tabs)');
    }

    // Hiệu ứng mờ dần Splash Screen sau khi xác định xong trạng thái
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [isAuthenticated, isLoading, segments, router, fadeAnim]);

  // Nếu gặp lỗi kết nối máy chủ backend -> Hiển thị màn hình lỗi mạng kèm nút Thử lại
  if (networkError && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorCard}>
          <View style={styles.errorIconWrap}>
            <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Mất kết nối máy chủ</Text>
          <Text style={styles.errorDesc}>{networkError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => checkSession()}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Thử lại kết nối</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
      <StatusBar
        barStyle={isLoading ? 'light-content' : 'dark-content'}
        backgroundColor={isLoading ? '#0C68EF' : '#FFFFFF'}
        translucent={isLoading}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="booking-detail" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
      </Stack>

      {/* Màn hình Splash trong khi đang kiểm tra phiên đăng nhập */}
      {isLoading && (
        <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]} pointerEvents="none">
          <Image
            source={{ uri: SPLASH_IMAGE_BASE64 }}
            style={styles.splashImage}
            resizeMode="cover"
          />
          <View style={styles.splashLoadingWrap}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.splashLoadingText}>Đang khởi động buồng lái...</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splashContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0C68EF',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  splashLoadingWrap: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  splashLoadingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  errorIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C68EF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
