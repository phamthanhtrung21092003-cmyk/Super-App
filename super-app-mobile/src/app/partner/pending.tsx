import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, withRepeat, withTiming, useAnimatedStyle, useSharedValue, useEffect } from 'react-native-reanimated';

export default function PendingApprovalScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const accentColor = '#F59E0B'; // Amber

  const handleReturnHome = () => {
    router.replace('/home'); // Or wherever traveler app starts
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <LinearGradient
          colors={['#0F172A', '#000000']}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.container}>
          <Animated.View entering={FadeInDown.duration(800)} style={styles.iconContainer}>
            <View style={styles.glowRing}>
              <View style={[styles.iconBox, { borderColor: accentColor }]}>
                <Ionicons name="time-outline" size={48} color={accentColor} />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.textContainer}>
            <Text style={[styles.title, { fontFamily: 'Outfit' }]}>Hồ sơ đang được xét duyệt</Text>
            <Text style={styles.subtitle}>
              Cảm ơn bạn đã đăng ký trở thành Đối tác của Super App!{'\n\n'}
              Chúng tôi đang tiến hành xác minh thông tin và giấy tờ của bạn. Quá trình này thường mất từ 24 - 48 giờ làm việc.{'\n\n'}
              Kết quả sẽ được thông báo qua Ứng dụng và SMS.
            </Text>
          </Animated.View>
        </View>

        {/* Footer Area */}
        <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.footer}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleReturnHome}
            style={styles.btnWrapper}
          >
            <BlurView intensity={20} tint="light" style={styles.btn}>
              <Text style={styles.btnText}>TRỞ VỀ TRANG CHỦ</Text>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#000', width: '100%' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#111', borderRadius: 55, overflow: 'hidden' },
  
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  
  iconContainer: { alignItems: 'center', marginBottom: 40 },
  glowRing: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(245, 158, 11, 0.05)', justifyContent: 'center', alignItems: 'center' },
  iconBox: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 2, justifyContent: 'center', alignItems: 'center', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 },
  
  textContainer: { alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#94A3B8', lineHeight: 24, textAlign: 'center', paddingHorizontal: 10 },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  btnWrapper: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  btn: { height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
});
