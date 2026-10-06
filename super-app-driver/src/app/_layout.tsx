import React, { useState, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar, View, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { SPLASH_IMAGE_BASE64 } from '../constants/splashImageBase64';

import { getBaseURL } from '../services/apiClient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    // Hàm kiểm tra mạng / kết nối thực tế
    const pingNetwork = async (): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const serverUrl = getBaseURL();
        // Kiểm tra kết nối song song tới backend hoặc internet endpoint an toàn
        const response = await Promise.any([
          fetch(`${serverUrl}/health`, {
            method: 'HEAD',
            signal: controller.signal,
          }).catch(() => null),
          fetch('https://www.google.com/generate_204', {
            method: 'HEAD',
            signal: controller.signal,
          }),
          fetch('https://cloudflare.com/cdn-cgi/trace', {
            method: 'HEAD',
            signal: controller.signal,
          }),
        ]);

        clearTimeout(timeoutId);
        return !!response;
      } catch (e) {
        return false;
      }
    };

    const runConnectionCheck = async () => {
      // Vòng lặp: Nếu không có mạng thì cứ ở lại màn hình chờ cho đến khi có mạng!
      while (isMounted) {
        const connected = await pingNetwork();
        if (connected) {
          // Mạng mạnh phản hồi nhanh: Chờ tối thiểu 1800ms để splash hiển thị trọn vẹn, rõ nét
          // Mạng yếu / chậm: Đã tốn thời gian ở bước ping, sẽ vào ngay khi ping xong
          const elapsed = Date.now() - startTime;
          const remainingDelay = Math.max(0, 1800 - elapsed);

          setTimeout(() => {
            if (isMounted) {
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }).start(() => {
                if (isMounted) setShowSplash(false);
              });
            }
          }, remainingDelay);
          break; // Đã kết nối thành công, thoát vòng lặp
        }

        // Nếu KHÔNG CÓ MẠNG: Tiếp tục ở màn hình chờ và thử lại sau 1.5 giây
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    };

    runConnectionCheck();

    return () => {
      isMounted = false;
    };
  }, [fadeAnim]);

  return (
    <View style={styles.rootContainer}>
      <StatusBar
        barStyle={showSplash ? "light-content" : "dark-content"}
        backgroundColor={showSplash ? "#0C68EF" : "#ffffff"}
        translucent={showSplash}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {showSplash && (
        <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]} pointerEvents="none">
          <Image
            source={{ uri: SPLASH_IMAGE_BASE64 }}
            style={styles.splashImage}
            resizeMode="cover"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0C68EF',
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
});

