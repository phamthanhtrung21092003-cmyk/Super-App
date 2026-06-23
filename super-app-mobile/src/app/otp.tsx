import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  useWindowDimensions,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  // Refs for auto-focusing next input
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // Giả lập gửi SMS khi vừa vào trang
  useEffect(() => {
    const mockSMS = () => {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomCode);
      const msg = `SUPER APP: Mã OTP xác thực của bạn là ${randomCode}. Mã này chỉ có hiệu lực trong 60 giây!`;
      if (Platform.OS === 'web') {
        setTimeout(() => window.alert('Tin nhắn SMS mới 💬\n\n' + msg), 500);
      } else {
        setTimeout(() => Alert.alert('Tin nhắn SMS mới 💬', msg), 500);
      }
    };
    mockSMS();
  }, []);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    // Lọc chỉ lấy số
    const numericText = text.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = numericText.substring(0, 1);
    setOtp(newOtp);

    // Tự động nhảy sang ô tiếp theo nếu có nhập chữ
    if (numericText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Xóa lùi tự động về ô trước
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== 6) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập đủ 6 số OTP');
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập đủ 6 số OTP');
      }
      return;
    }

    if (timer === 0) {
      if (Platform.OS === 'web') {
        window.alert('Mã OTP đã hết hạn sau 60s. Vui lòng gửi lại mã mới!');
      } else {
        Alert.alert('Hết hạn', 'Mã OTP đã hết hạn sau 60s. Vui lòng gửi lại mã mới!');
      }
      return;
    }

    if (code === generatedOtp) {
      if (Platform.OS === 'web') {
        window.alert('Xác thực thành công! Đang đăng nhập...');
      } else {
        Alert.alert('Thành công', 'Xác thực thành công! Đang đăng nhập...');
      }
      setTimeout(() => {
        router.push({ pathname: '/home', params: { name: params.name } });
      }, 800);
    } else {
      if (Platform.OS === 'web') {
        window.alert('Mã OTP không chính xác. Vui lòng thử lại!');
      } else {
        Alert.alert('Lỗi', 'Mã OTP không chính xác. Vui lòng thử lại!');
      }
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomCode);
      setTimer(60);
      const msg = `SUPER APP: Mã OTP MỚI của bạn là ${randomCode}. Mã này có hiệu lực trong 60 giây!`;
      if (Platform.OS === 'web') {
        setTimeout(() => window.alert('Tin nhắn SMS mới 💬\n\n' + msg), 500);
      } else {
        setTimeout(() => Alert.alert('Tin nhắn SMS mới 💬', msg), 500);
      }
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <ImageBackground 
          source={require('../../assets/images/premium_auth_bg.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
            style={styles.darkOverlay}
          />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          
          {/* Nút Quay Lại */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={28} color="#00c6ff" style={{marginRight: 4}} />
              <Text style={[styles.backButtonText, { color: '#00c6ff', fontFamily: 'Outfit' }]}>Quay lại</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            {/* Top Logo */}
            <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.logoContainer}>
              <View style={styles.logoIconWrapper}>
                <LinearGradient
                  colors={['rgba(0, 198, 255, 0.2)', 'rgba(0, 114, 255, 0.2)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="shield-checkmark-outline" size={42} color="#00c6ff" />
              </View>
              <Text style={[styles.logoTitle, { fontFamily: 'Outfit', color: '#00c6ff', fontSize: 32 }]}>XÁC THỰC OTP</Text>
              <Text style={[styles.logoSubtitle, { fontFamily: 'Outfit' }]}>Bảo mật đa lớp an toàn</Text>
            </Animated.View>

            {/* Main Glassmorphism Card */}
            <Animated.View entering={FadeInUp.duration(1200).springify()} style={styles.cardContainer}>
              <BlurView intensity={70} tint="dark" style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.title, { fontFamily: 'Outfit', color: '#FFF', fontSize: 24 }]}>Nhập mã xác thực</Text>
                  <Text style={[styles.subtitle, { fontFamily: 'Outfit' }]}>
                    Chúng tôi vừa gửi mã gồm 6 chữ số đến số điện thoại của bạn.
                  </Text>
                </View>

                <View style={styles.form}>
                  
                  {/* OTP Inputs */}
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <View key={index} style={[
                        styles.otpInputWrapper,
                        digit ? styles.otpInputFilledWrapper : null
                      ]}>
                        <TextInput
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          style={[
                            styles.otpInput,
                            digit ? styles.otpInputFilled : null
                          ]}
                          keyboardType="numeric"
                          maxLength={1}
                          value={digit}
                          onChangeText={(text) => handleChange(text, index)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          selectionColor="#00c6ff"
                        />
                      </View>
                    ))}
                  </View>

                  {/* Resend Timer */}
                  <TouchableOpacity 
                    style={styles.resendContainer} 
                    onPress={handleResend}
                    disabled={timer > 0}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.resendText, timer === 0 && styles.resendTextActive]}>
                      {timer > 0 ? `Gửi lại mã sau ${timer}s` : 'Gửi lại mã mới'}
                    </Text>
                  </TouchableOpacity>

                  {/* Verify Button */}
                  <TouchableOpacity activeOpacity={0.8} onPress={handleVerify} style={styles.loginButtonWrapper}>
                    <LinearGradient
                      colors={['#00c6ff', '#0072ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButton}
                    >
                      <Text style={styles.loginButtonText}>XÁC NHẬN</Text>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={styles.loginButtonIcon} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>

          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 40 }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 414,       
    maxHeight: 896,
    aspectRatio: 414 / 896, 
    borderWidth: 10,     
    borderColor: '#111',
    borderRadius: 55,    
    overflow: 'hidden',
    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255,255,255,0.1)',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 10,
    zIndex: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: -8,
    width: 120,
  },
  backButtonText: {
    color: '#00c6ff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingsBlur: {
    padding: 12,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 198, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#00c6ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    marginTop: 6,
    letterSpacing: 1.5,
    fontWeight: '400',
    textTransform: 'uppercase',
  },
  cardContainer: {
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 15,
  },
  card: {
    padding: 32,
    ...(Platform.OS === 'web' && {
      backgroundColor: 'rgba(10, 10, 15, 0.5)',
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
    }),
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  form: {
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 8,
    ...(Platform.OS === 'web' && { gap: 12 }),
  },
  otpInputWrapper: {
    flex: 1,
    aspectRatio: 0.8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  otpInputFilledWrapper: {
    borderColor: '#00c6ff',
    backgroundColor: 'rgba(0, 198, 255, 0.05)',
    shadowColor: '#00c6ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  otpInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  otpInputFilled: {
    color: '#00c6ff',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  resendTextActive: {
    color: '#00c6ff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  loginButtonWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0072ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  loginButton: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  loginButtonIcon: {
    marginLeft: 10,
  },
});
