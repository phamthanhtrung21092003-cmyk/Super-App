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
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // Accent Colors for Partner App (Gold/Amber)
  const accentColor = '#F59E0B';
  const accentColorLight = 'rgba(245, 158, 11, 0.15)';

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

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu quá ngắn');
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    // Simulate login API for partner
    setTimeout(() => {
      setIsLoading(false);
      // For now, always fail and ask to register to show the flow
      if (phone === '0999999999') {
         // Mock success
         router.push('/partner/dashboard'); // Will be created later
      } else {
         setLoginError('Tài khoản đối tác không tồn tại hoặc chờ duyệt.');
      }
    }, 1500);
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
          onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Top Logo */}
            <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.logoContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: accentColor,
                  backgroundColor: accentColorLight,
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 16,
                  transform: [{ rotate: '45deg' }],
                  shadowColor: accentColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                }}>
                  <Ionicons name="briefcase" size={24} color={accentColor} style={{ transform: [{ rotate: '-45deg' }] }} />
                </View>
                
                <Text style={[styles.logoTitle, { 
                  fontFamily: 'Outfit', 
                  fontSize: 38, 
                  letterSpacing: 2, 
                  fontWeight: '800', 
                  textShadowColor: 'rgba(245, 158, 11, 0.3)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 10
                }]}>
                  <Text style={{ color: '#FFFFFF' }}>PARTNER</Text>
                </Text>
              </View>
              <Text style={[styles.logoSubtitle, { fontFamily: 'Outfit' }]}>Kênh quản lý dành cho Đối tác</Text>
            </Animated.View>

            {/* Main Glassmorphism Card */}
            <Animated.View entering={FadeInUp.duration(1200).springify()} style={styles.cardContainer}>
              <BlurView intensity={70} tint="dark" style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.title, { fontFamily: 'Outfit' }]}>ĐĂNG NHẬP</Text>
                  <Text style={[styles.subtitle, { fontFamily: 'Outfit' }]}>Quản lý dịch vụ & tăng doanh thu</Text>
                </View>

                <View style={styles.form}>
                  <Text style={styles.label}>SỐ ĐIỆN THOẠI ĐỐI TÁC</Text>
                  <View style={[
                    styles.inputWrapper, 
                    isPhoneFocused && { borderColor: accentColor, backgroundColor: accentColorLight },
                    phoneError ? styles.inputError : null
                  ]}>
                    <Ionicons name="call-outline" size={20} color={isPhoneFocused ? accentColor : "#8F9BB3"} />
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

                  <Text style={[styles.label, {marginTop: 20}]}>MẬT KHẨU</Text>
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
                  {passwordError ? <Animated.Text entering={FadeInDown} style={styles.errorText}>{passwordError}</Animated.Text> : null}

                  <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.7}>
                    <Text style={[styles.forgotPasswordText, { color: accentColor }]}>Quên mật khẩu?</Text>
                  </TouchableOpacity>

                  {loginError ? (
                    <Animated.View entering={FadeInDown} style={styles.loginErrorBox}>
                      <Ionicons name="alert-circle-outline" size={16} color="#FF4D4D" />
                      <Text style={styles.loginErrorText}>{loginError}</Text>
                    </Animated.View>
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
                          <Text style={styles.loginButtonText}>ĐĂNG NHẬP PARTNER</Text>
                          <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.loginButtonIcon} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.footer}>
              <Text style={styles.footerText}>Đối tác mới? </Text>
              <TouchableOpacity onPress={() => router.push('/partner/register-type')} activeOpacity={0.7}>
                <Text style={[styles.signUpText, { color: accentColor }]}>Đăng ký Trở thành Đối tác</Text>
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
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoTitle: { color: '#FFFFFF', letterSpacing: 4, textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 8 },
  logoSubtitle: { fontSize: 14, color: '#E2E8F0', marginTop: 6, letterSpacing: 1, fontWeight: '400', textTransform: 'uppercase' },
  cardContainer: { borderRadius: 36, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', borderTopColor: 'rgba(255, 255, 255, 0.3)', borderLeftColor: 'rgba(255, 255, 255, 0.2)', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 15 },
  card: { padding: 32, ...(Platform.OS === 'web' && { backgroundColor: 'rgba(10, 10, 15, 0.5)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' } as any) },
  cardHeader: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: '#94A3B8', fontWeight: '400' },
  form: { marginBottom: 10 },
  label: { fontSize: 12, color: '#E2E8F0', fontWeight: '700', marginBottom: 10, marginLeft: 4, letterSpacing: 1.2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 20, paddingHorizontal: 18, height: 60, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  inputError: { borderColor: '#FF4D4D', backgroundColor: 'rgba(255, 77, 77, 0.05)' },
  input: { flex: 1, fontSize: 16, color: '#FFFFFF', marginLeft: 14, height: '100%', fontWeight: '500', ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  eyeIcon: { padding: 8 },
  errorText: { color: '#FF4D4D', fontSize: 12, marginTop: 8, marginLeft: 16, fontWeight: '500' },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginVertical: 20 },
  forgotPasswordText: { fontSize: 14, fontWeight: '600' },
  loginErrorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 77, 77, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 77, 77, 0.3)', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, gap: 8 },
  loginErrorText: { color: '#FF4D4D', fontSize: 13, fontWeight: '500', flex: 1 },
  loginButtonWrapper: { marginTop: 8, borderRadius: 20, overflow: 'hidden', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 },
  loginButton: { height: 60, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  loginButtonIcon: { marginLeft: 10 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  footerText: { fontSize: 15, color: '#94A3B8', fontWeight: '500' },
  signUpText: { fontSize: 15, fontWeight: '700', marginLeft: 6 },
});
