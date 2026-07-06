import React, { useState } from 'react';
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
  useWindowDimensions,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function PartnerLoginScreen() {
  const router = useRouter();
  
  const [phone, setPhone] = useState('0999999999'); // Pre-fill for easy testing
  const [password, setPassword] = useState('123456'); // Pre-fill for easy testing
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const accentColor = '#F59E0B'; // Amber
  const accentColorLight = 'rgba(245, 158, 11, 0.15)';

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 11) {
      setPhone(numericText);
      setPhoneError('');
    }
  };

  const handleLogin = async () => {
    let isValid = true;
    setLoginError('');
    const phoneRegex = /^0[0-9]{9,10}$/;
    
    if (!phone) {
      setPhoneError('Vui lòng nhập số điện thoại');
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneError('Số điện thoại không hợp lệ');
      isValid = false;
    }

    if (loginMethod === 'password') {
      if (!password) {
        setPasswordError('Vui lòng nhập mật khẩu');
        isValid = false;
      } else if (password.length < 6) {
        setPasswordError('Mật khẩu quá ngắn');
        isValid = false;
      }
    }

    if (!isValid) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Easy login for dev/test: allow ANY valid formatting but direct 0999999999 to dashboard
      // If other numbers, tell them they need to register first
      if (phone === '0999999999') {
         router.push('/partner/dashboard');
      } else {
         setLoginError('Tài khoản chưa được kích hoạt hoặc chưa đăng ký. Vui lòng bấm đăng ký bên dưới.');
      }
    }, 1200);
  };

  const handleSocialLogin = (platform: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Direct social logins of test account to dashboard
      router.push('/partner/dashboard');
    }, 1000);
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <LinearGradient
          colors={['#0F172A', '#000000']}
          style={StyleSheet.absoluteFillObject}
        />
        
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/account')}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Top Logo */}
            <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.logoContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <View style={[styles.logoBox, { borderColor: accentColor, backgroundColor: accentColorLight }]}>
                  <Ionicons name="briefcase" size={24} color={accentColor} style={{ transform: [{ rotate: '-45deg' }] }} />
                </View>
                
                <Text style={styles.logoText}>
                  <Text style={{ color: '#FFFFFF' }}>AI DRIVER</Text>
                </Text>
              </View>
              <Text style={styles.logoSubtitle}>Ứng dụng Đối tác Tài xế SuperApp</Text>
            </Animated.View>

            {/* Main Glassmorphism Card */}
            <Animated.View entering={FadeInUp.duration(1000).springify()} style={styles.cardContainer}>
              <BlurView intensity={70} tint="dark" style={styles.card}>
                
                {/* Method selector */}
                <View style={styles.tabRow}>
                  <TouchableOpacity 
                    style={[styles.tabBtn, loginMethod === 'password' && styles.tabBtnActive]} 
                    onPress={() => setLoginMethod('password')}
                  >
                    <Text style={[styles.tabText, loginMethod === 'password' && { color: accentColor }]}>Mật khẩu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tabBtn, loginMethod === 'otp' && styles.tabBtnActive]} 
                    onPress={() => setLoginMethod('otp')}
                  >
                    <Text style={[styles.tabText, loginMethod === 'otp' && { color: accentColor }]}>Mã OTP</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
                  <View style={[
                    styles.inputWrapper, 
                    isPhoneFocused && { borderColor: accentColor, backgroundColor: accentColorLight },
                    phoneError ? styles.inputError : null
                  ]}>
                    <Ionicons name="call-outline" size={20} color={isPhoneFocused ? accentColor : "#8F9BB3"} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số điện thoại tài xế"
                      placeholderTextColor="#6B7A90"
                      keyboardType="numeric"
                      value={phone}
                      onChangeText={handlePhoneChange}
                      onFocus={() => setIsPhoneFocused(true)}
                      onBlur={() => setIsPhoneFocused(false)}
                    />
                  </View>
                  {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                  {loginMethod === 'password' ? (
                    <>
                      <Text style={[styles.label, {marginTop: 16}]}>MẬT KHẨU</Text>
                      <View style={[
                        styles.inputWrapper, 
                        isPasswordFocused && { borderColor: accentColor, backgroundColor: accentColorLight },
                        passwordError ? styles.inputError : null
                      ]}>
                        <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? accentColor : "#8F9BB3"} />
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
                      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                    </>
                  ) : (
                    <View style={styles.otpTipBox}>
                      <Text style={styles.otpTipText}>Hệ thống sẽ gửi mã OTP gồm 6 chữ số qua SMS khi bạn bấm Đăng nhập.</Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.7}>
                    <Text style={[styles.forgotPasswordText, { color: accentColor }]}>Quên mật khẩu?</Text>
                  </TouchableOpacity>

                  {loginError ? (
                    <View style={styles.loginErrorBox}>
                      <Ionicons name="alert-circle-outline" size={16} color="#FF4D4D" />
                      <Text style={styles.loginErrorText}>{loginError}</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} style={styles.loginButtonWrapper} disabled={isLoading}>
                    <LinearGradient
                      colors={isLoading ? ['#444', '#333'] : [accentColor, '#D97706']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <>
                          <Text style={styles.loginButtonText}>ĐĂNG NHẬP NGAY</Text>
                          <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.loginButtonIcon} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Social Logins */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>HOẶC</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('google')}>
                      <Ionicons name="logo-google" size={20} color="#FFF" />
                      <Text style={styles.socialBtnText}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('apple')}>
                      <Ionicons name="logo-apple" size={20} color="#FFF" />
                      <Text style={styles.socialBtnText}>Apple</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.footer}>
              <Text style={styles.footerText}>Bạn là tài xế mới? </Text>
              <TouchableOpacity onPress={() => router.push('/partner/register')} activeOpacity={0.7}>
                <Text style={[styles.signUpText, { color: accentColor }]}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#000', width: '100%' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#111', borderRadius: 55, overflow: 'hidden', boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255,255,255,0.1)' as any },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 24, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoBox: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 16, transform: [{ rotate: '45deg' }],
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  logoText: { fontSize: 32, fontWeight: '800', letterSpacing: 2 },
  logoSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 8, fontWeight: '500', textTransform: 'uppercase' },
  
  cardContainer: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 12 },
  card: { padding: 24, ...(Platform.OS === 'web' && { backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(20px)' } as any) },
  
  tabRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  tabText: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold' },

  form: { marginBottom: 5 },
  label: { fontSize: 11, color: '#E2E8F0', fontWeight: '700', marginBottom: 8, marginLeft: 4, letterSpacing: 1.2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  inputError: { borderColor: '#FF4D4D', backgroundColor: 'rgba(255, 77, 77, 0.05)' },
  input: { flex: 1, fontSize: 15, color: '#FFFFFF', marginLeft: 12, height: '100%', fontWeight: '500', ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  eyeIcon: { padding: 8 },
  errorText: { color: '#FF4D4D', fontSize: 12, marginTop: 6, marginLeft: 12, fontWeight: '500' },
  
  otpTipBox: { backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.15)', marginTop: 12 },
  otpTipText: { color: '#F59E0B', fontSize: 12, lineHeight: 18, fontWeight: '500' },

  forgotPasswordContainer: { alignSelf: 'flex-end', marginVertical: 14 },
  forgotPasswordText: { fontSize: 13, fontWeight: '600' },
  loginErrorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 77, 77, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 77, 77, 0.3)', paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14, gap: 8 },
  loginErrorText: { color: '#FF4D4D', fontSize: 13, fontWeight: '500', flex: 1 },
  loginButtonWrapper: { borderRadius: 16, overflow: 'hidden', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  loginButton: { height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  loginButtonIcon: { marginLeft: 8 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText: { color: '#64748B', fontSize: 11, fontWeight: 'bold', marginHorizontal: 12 },

  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 8 },
  socialBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  signUpText: { fontSize: 14, fontWeight: '700', marginLeft: 4 },
});
