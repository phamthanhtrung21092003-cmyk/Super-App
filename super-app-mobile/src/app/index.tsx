import React, { useState, useEffect } from 'react';
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
  Image,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';

// Fallback Icons using Emojis/Characters
const GoogleIcon = () => <Text style={{fontSize: 18, fontWeight: 'bold', color: '#EA4335'}}>G</Text>;
const AppleIcon = () => <Text style={{fontSize: 20, color: '#FFFFFF'}}></Text>;
const FacebookIcon = () => <Text style={{fontSize: 18, fontWeight: 'bold', color: '#FFFFFF'}}>f</Text>;
const UserIcon = () => <Text style={{fontSize: 16, color: '#A0AEC0'}}>📞</Text>;
const LockIcon = () => <Text style={{fontSize: 16, color: '#A0AEC0'}}>🔒</Text>;

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80', // Cafe blur
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1000&q=80', // Abstract dark studio
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80', // Beach blur
];

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation Error States
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // Inject a beautiful font on Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Montserrat', system-ui, -apple-system, sans-serif; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const changeBackground = () => {
    setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
  };

  const handlePhoneChange = (text: string) => {
    // Chỉ cho phép nhập số
    const numericText = text.replace(/[^0-9]/g, '');
    // Giới hạn tối đa 11 số
    if (numericText.length <= 11) {
      setPhone(numericText);
      setPhoneError(''); // Xóa lỗi khi đang gõ
    }
  };

  const handlePasswordChange = (text: string) => {
    // Giới hạn tối đa 15 ký tự
    if (text.length <= 15) {
      setPassword(text);
      setPasswordError(''); // Xóa lỗi khi đang gõ
    }
  };

  const handleLogin = () => {
    let isValid = true;

    // Validate Số điện thoại
    const phoneRegex = /^0[0-9]{9,10}$/; // Bắt đầu bằng 0, tổng cộng 10-11 số
    if (!phone) {
      setPhoneError('Vui lòng nhập số điện thoại');
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneError('Số điện thoại phải bắt đầu bằng 0 và có 10-11 số');
      isValid = false;
    }

    // Validate Mật khẩu
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,15}$/; 
    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
      isValid = false;
    }

    if (isValid) {
      // Nếu tất cả đều đúng quy tắc, chuyển trang
      router.push('/otp');
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
          {/* Overlay to darken background slightly */}
          <View style={styles.overlay} />
          
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          
          {/* Button to change background as requested */}
          <TouchableOpacity style={styles.changeBgButton} onPress={changeBackground}>
            <Text style={styles.changeBgText}>Đổi nền 🖼️</Text>
          </TouchableOpacity>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            {/* Top Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoIconText}>🕊️</Text>
              <Text style={styles.logoTitle}>Hành Trình</Text>
            </View>

            {/* Main Glassmorphism Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>ĐĂNG NHẬP</Text>
                <Text style={styles.subtitle}>Chào mừng bạn quay trở lại!</Text>
              </View>

              <View style={styles.form}>
                {/* Phone Input */}
                <Text style={styles.label}>Số điện thoại</Text>
                <View style={[styles.inputWrapper, phoneError ? styles.inputError : null]}>
                  <UserIcon />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập số điện thoại của bạn"
                    placeholderTextColor="#A0AEC0"
                    keyboardType="numeric"
                    value={phone}
                    onChangeText={handlePhoneChange}
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                {/* Password Input */}
                <Text style={[styles.label, {marginTop: 12}]}>Mật khẩu</Text>
                <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                  <LockIcon />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={handlePasswordChange}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.extraIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={handleLogin}
                >
                  <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
                </TouchableOpacity>
              </View>

              {/* Social Login */}
              <View style={styles.socialSection}>
                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>Hoặc đăng nhập bằng</Text>
                  <View style={styles.orLine} />
                </View>

                <View style={styles.socialButtonsContainer}>
                  <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#FFFFFF'}]}>
                    <GoogleIcon />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#1877F2'}]}>
                    <FacebookIcon />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#000000'}]}>
                    <AppleIcon />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.signUpText}>Đăng ký ngay</Text>
              </TouchableOpacity>
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
    ...(Platform.OS === 'web' && {
      paddingVertical: 20,
    }),
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
    backgroundColor: 'rgba(0,0,0,0.2)', // Lightened overlay so background is brighter
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
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
    }),
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
    backgroundColor: 'rgba(20, 25, 35, 0.15)', // Highly transparent
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)', 
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(4px)', // Very light blur
      WebkitBackdropFilter: 'blur(4px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
    }),
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#F8FAFC',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#00D8FF', // Glowing cyan bottom border
    paddingBottom: 8,
    marginBottom: 8, // Giảm margin để nhường chỗ cho dòng báo lỗi
    paddingHorizontal: 4,
  },
  inputError: {
    borderBottomColor: '#FF4D4D', // Màu đỏ khi có lỗi
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginLeft: 4,
    marginBottom: 16,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 12,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  extraIcon: {
    fontSize: 18,
    opacity: 0.8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#00D8FF',
    fontSize: 13,
    fontWeight: '500',
  },
  loginButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    // Fallback to solid color for native if no linear gradient
    backgroundColor: '#0072FF',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(to right, #00D8FF, #8A2BE2)', // Cyan to Purple
      boxShadow: '0 8px 20px rgba(0, 216, 255, 0.4)',
    }),
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  socialSection: {
    alignItems: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    ...(Platform.OS === 'web' && { gap: 16 }),
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Platform.OS !== 'web' ? 8 : 0, 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  signUpText: {
    fontSize: 13,
    color: '#00D8FF',
    fontWeight: '700',
  },
});
