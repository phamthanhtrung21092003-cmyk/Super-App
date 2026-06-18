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
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'
];

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  // Focus states for input animations
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Validation Error States
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Montserrat', system-ui, -apple-system, sans-serif; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const changeBackground = () => {
    setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
  };

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 11) {
      setPhone(numericText);
      setPhoneError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    if (text.length <= 20) {
      setPassword(text);
      setPasswordError('');
    }
  };

  const handleLogin = () => {
    let isValid = true;
    const phoneRegex = /^0[0-9]{9,10}$/;
    if (!phone) {
      setPhoneError('Vui lòng nhập số điện thoại');
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneError('Số điện thoại không hợp lệ (Bắt đầu bằng 0, gồm 10-11 số)');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu quá ngắn');
      isValid = false;
    }

    if (isValid) {
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
          {/* Subtle global dark overlay */}
          <View style={styles.darkOverlay} />
          
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          
          <TouchableOpacity style={styles.changeBgButton} onPress={changeBackground} activeOpacity={0.7}>
            <BlurView intensity={30} tint="light" style={styles.changeBgBlur}>
              <Ionicons name="images-outline" size={20} color="#FFF" />
            </BlurView>
          </TouchableOpacity>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.logoContainer}>
              <View style={styles.logoIconWrapper}>
                <Ionicons name="infinite" size={48} color="#00D8FF" />
              </View>
              <Text style={styles.logoTitle}>SUPER APP</Text>
              <Text style={styles.logoSubtitle}>Trải nghiệm không giới hạn</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(1000).springify()} style={styles.cardContainer}>
              <BlurView intensity={50} tint="dark" style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>ĐĂNG NHẬP</Text>
                  <Text style={styles.subtitle}>Chào mừng bạn quay trở lại!</Text>
                </View>

                <View style={styles.form}>
                  {/* Phone Input */}
                  <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
                  <View style={[
                    styles.inputWrapper, 
                    isPhoneFocused && styles.inputWrapperFocused,
                    phoneError ? styles.inputError : null
                  ]}>
                    <Ionicons name="call-outline" size={20} color={isPhoneFocused ? "#00D8FF" : "#A0AEC0"} />
                    <TextInput
                      style={styles.input}
                      placeholder="0912 345 678"
                      placeholderTextColor="#718096"
                      keyboardType="numeric"
                      value={phone}
                      onChangeText={handlePhoneChange}
                      onFocus={() => setIsPhoneFocused(true)}
                      onBlur={() => setIsPhoneFocused(false)}
                    />
                  </View>
                  {phoneError ? <Animated.Text entering={FadeInDown} style={styles.errorText}>{phoneError}</Animated.Text> : null}

                  {/* Password Input */}
                  <Text style={[styles.label, {marginTop: 16}]}>MẬT KHẨU</Text>
                  <View style={[
                    styles.inputWrapper, 
                    isPasswordFocused && styles.inputWrapperFocused,
                    passwordError ? styles.inputError : null
                  ]}>
                    <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? "#00D8FF" : "#A0AEC0"} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#718096"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={handlePasswordChange}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#A0AEC0" />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Animated.Text entering={FadeInDown} style={styles.errorText}>{passwordError}</Animated.Text> : null}

                  <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.7}>
                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} style={styles.loginButtonWrapper}>
                    <LinearGradient
                      colors={['#00D8FF', '#0055FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButton}
                    >
                      <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.loginButtonIcon} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Social Login */}
                <View style={styles.socialSection}>
                  <View style={styles.orDivider}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>HOẶC ĐĂNG NHẬP BẰNG</Text>
                    <View style={styles.orLine} />
                  </View>

                  <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#FFFFFF'}]} activeOpacity={0.7}>
                      <AntDesign name="google" size={22} color="#DB4437" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#1877F2'}]} activeOpacity={0.7}>
                      <FontAwesome5 name="facebook-f" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#000000'}]} activeOpacity={0.7}>
                      <AntDesign name="apple-o" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.footer}>
              <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
                <Text style={styles.signUpText}>Đăng ký ngay</Text>
              </TouchableOpacity>
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
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      paddingVertical: 40,
    }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 400,       
    maxHeight: 850,
    aspectRatio: 400 / 850, 
    borderWidth: 8,     
    borderColor: '#1F2937',
    borderRadius: 48,    
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  changeBgButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    zIndex: 10,
    borderRadius: 24,
    overflow: 'hidden',
  },
  changeBgBlur: {
    padding: 10,
    borderRadius: 24,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    marginTop: 4,
    letterSpacing: 1,
    fontWeight: '500',
  },
  cardContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  card: {
    padding: 32,
    ...(Platform.OS === 'web' && {
      backgroundColor: 'rgba(15, 20, 25, 0.45)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }),
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapperFocused: {
    borderColor: '#00D8FF',
    backgroundColor: 'rgba(0, 216, 255, 0.05)',
  },
  inputError: {
    borderColor: '#FF4D4D',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    height: '100%',
    fontWeight: '500',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 16,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginVertical: 16,
  },
  forgotPasswordText: {
    color: '#00D8FF',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButtonWrapper: {
    marginTop: 8,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#00D8FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  loginButton: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  loginButtonIcon: {
    marginLeft: 8,
  },
  socialSection: {
    alignItems: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 1,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    ...(Platform.OS === 'web' && { gap: 20 }),
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Platform.OS !== 'web' ? 10 : 0, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  signUpText: {
    fontSize: 14,
    color: '#00D8FF',
    fontWeight: '800',
    marginLeft: 4,
  },
});
