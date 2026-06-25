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
  useWindowDimensions,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const router = useRouter();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

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
          source={require('../../assets/images/premium_auth_bg.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.5)']}
            style={styles.darkOverlay}
          />
          
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Top Logo */}
              <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.logoContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {/* Stylized Diamond V */}
                  <View style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#00c6ff',
                    backgroundColor: 'rgba(0, 198, 255, 0.1)',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: 16,
                    transform: [{ rotate: '45deg' }],
                    shadowColor: '#00c6ff',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                  }}>
                    <Text style={{ 
                      fontFamily: 'Outfit', 
                      fontSize: 30, 
                      fontWeight: '900', 
                      color: '#00c6ff', 
                      transform: [{ rotate: '-45deg' }] 
                    }}>V</Text>
                  </View>
                  
                  {/* Clean Text with Subtle Color */}
                  <Text style={[styles.logoTitle, { 
                    fontFamily: 'Outfit', 
                    fontSize: 42, 
                    letterSpacing: 4, 
                    fontWeight: '800', 
                    textShadowColor: 'rgba(0, 198, 255, 0.3)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 10
                  }]}>
                    <Text style={{ color: '#FFFFFF' }}>L</Text>
                    <Text style={{ color: '#B3E5FC' }}>I</Text>
                    <Text style={{ color: '#4FC3F7' }}>F</Text>
                    <Text style={{ color: '#00C6FF' }}>E</Text>
                  </Text>
                </View>
                <Text style={[styles.logoSubtitle, { fontFamily: 'Outfit' }]}>Kỷ nguyên trải nghiệm mới</Text>
              </Animated.View>

              {/* Main Glassmorphism Card */}
              <Animated.View entering={FadeInUp.duration(1200).springify()} style={styles.cardContainer}>
                <BlurView intensity={70} tint="dark" style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.title, { fontFamily: 'Outfit', color: '#FFF', fontSize: 26 }]}>ĐĂNG NHẬP</Text>
                    <Text style={[styles.subtitle, { fontFamily: 'Outfit' }]}>Chào mừng bạn quay trở lại</Text>
                  </View>

                  <View style={styles.form}>
                    {/* Phone Input */}
                    <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
                    <View style={[
                      styles.inputWrapper, 
                      isPhoneFocused && styles.inputWrapperFocused,
                      phoneError ? styles.inputError : null
                    ]}>
                      <Ionicons name="call-outline" size={20} color={isPhoneFocused ? "#00c6ff" : "#8F9BB3"} />
                      <TextInput
                        style={styles.input}
                        placeholder="0912 345 678"
                        placeholderTextColor="#6B7A90"
                        keyboardType="numeric"
                        value={phone}
                        onChangeText={handlePhoneChange}
                        onFocus={() => setIsPhoneFocused(true)}
                        onBlur={() => setIsPhoneFocused(false)}
                      />
                    </View>
                    {phoneError ? <Animated.Text entering={FadeInDown} style={styles.errorText}>{phoneError}</Animated.Text> : null}

                    {/* Password Input */}
                    <Text style={[styles.label, {marginTop: 20}]}>MẬT KHẨU</Text>
                    <View style={[
                      styles.inputWrapper, 
                      isPasswordFocused && styles.inputWrapperFocused,
                      passwordError ? styles.inputError : null
                    ]}>
                      <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? "#00c6ff" : "#8F9BB3"} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#6B7A90"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={handlePasswordChange}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8F9BB3" />
                      </TouchableOpacity>
                    </View>
                    {passwordError ? <Animated.Text entering={FadeInDown} style={styles.errorText}>{passwordError}</Animated.Text> : null}

                    <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.7}>
                      <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} style={styles.loginButtonWrapper}>
                      <LinearGradient
                        colors={['#00c6ff', '#0072ff']}
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
                      <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#FFFFFF'}]} activeOpacity={0.8}>
                        <AntDesign name="google" size={20} color="#DB4437" />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#1877F2'}]} activeOpacity={0.8}>
                        <FontAwesome5 name="facebook-f" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#000000'}]} activeOpacity={0.8}>
                        <AntDesign name="apple-o" size={22} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.footer}>
                <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
                  <Text style={styles.signUpText}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIconWrapper: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 198, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#00c6ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    marginTop: 6,
    letterSpacing: 2,
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '400',
  },
  form: {
    marginBottom: 28,
  },
  label: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputWrapperFocused: {
    borderColor: '#00c6ff',
    backgroundColor: 'rgba(0, 198, 255, 0.05)',
    shadowColor: '#00c6ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inputError: {
    borderColor: '#FF4D4D',
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 14,
    height: '100%',
    fontWeight: '500',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 16,
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginVertical: 20,
  },
  forgotPasswordText: {
    color: '#00c6ff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButtonWrapper: {
    marginTop: 8,
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
  socialSection: {
    alignItems: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    width: '100%',
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    ...(Platform.OS === 'web' && { gap: 24 }),
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Platform.OS !== 'web' ? 12 : 0, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '500',
  },
  signUpText: {
    fontSize: 15,
    color: '#00c6ff',
    fontWeight: '700',
    marginLeft: 6,
  },
});
