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

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
];

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [bgIndex, setBgIndex] = useState(0);
  const [timer, setTimer] = useState(60);
  
  // Refs for auto-focusing next input
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // Giả lập gửi SMS khi vừa vào trang
  useEffect(() => {
    const mockSMS = () => {
      const msg = "HÀNH TRÌNH: Mã OTP xác thực của bạn là 839210. Tuyệt đối không chia sẻ mã này cho bất kỳ ai!";
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

  const changeBackground = () => {
    setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
  };

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
    if (code.length === 6) {
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
        window.alert('Vui lòng nhập đủ 6 số OTP');
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập đủ 6 số OTP');
      }
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60);
      if (Platform.OS === 'web') {
        window.alert('Đã gửi lại mã xác thực mới vào số điện thoại của bạn!');
      } else {
        Alert.alert('Đã gửi', 'Đã gửi lại mã xác thực mới vào số điện thoại của bạn!');
      }
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <ImageBackground 
          source={{ uri: BACKGROUNDS[bgIndex] }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          
          {/* Nút Quay Lại */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Quay lại</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.changeBgButton} onPress={changeBackground}>
            <Text style={styles.changeBgText}>Đổi nền 🖼️</Text>
          </TouchableOpacity>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            {/* Top Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoIconText}>🛡️</Text>
              <Text style={styles.logoTitle}>Xác thực OTP</Text>
            </View>

            {/* Main Glassmorphism Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>Nhập mã xác thực</Text>
                <Text style={styles.subtitle}>
                  Chúng tôi vừa gửi mã gồm 6 chữ số đến số điện thoại của bạn.
                </Text>
              </View>

              <View style={styles.form}>
                
                {/* OTP Inputs */}
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
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
                      selectionColor="#00D8FF"
                    />
                  ))}
                </View>

                {/* Resend Timer */}
                <TouchableOpacity 
                  style={styles.resendContainer} 
                  onPress={handleResend}
                  disabled={timer > 0}
                >
                  <Text style={[styles.resendText, timer === 0 && styles.resendTextActive]}>
                    {timer > 0 ? `Gửi lại mã sau ${timer}s` : 'Gửi lại mã mới'}
                  </Text>
                </TouchableOpacity>

                {/* Verify Button */}
                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={handleVerify}
                >
                  <Text style={styles.loginButtonText}>XÁC NHẬN</Text>
                </TouchableOpacity>
              </View>
            </View>

          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 20 }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 390,       
    maxHeight: 844,
    aspectRatio: 390 / 844, 
    borderWidth: 12,     
    borderColor: '#000000',
    borderRadius: 44,    
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 10,
    zIndex: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    width: 100,
  },
  backButtonText: {
    color: '#00D8FF',
    fontSize: 15,
    fontWeight: '600',
  },
  changeBgButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' }),
  },
  changeBgText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
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
  logoIconText: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: 'rgba(20, 25, 35, 0.15)', 
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)', 
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
    }),
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  form: {
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 216, 255, 0.3)',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  otpInputFilled: {
    borderColor: '#00D8FF',
    backgroundColor: 'rgba(0, 216, 255, 0.1)',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  resendTextActive: {
    color: '#00D8FF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  loginButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0072FF',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(to right, #00D8FF, #8A2BE2)',
      boxShadow: '0 8px 20px rgba(0, 216, 255, 0.4)',
    }),
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
