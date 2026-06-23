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
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { setUserName } = useUser();
  
  // States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  // Errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 11) {
      setPhone(numericText);
      setPhoneError('');
    }
  };

  const handleRegister = () => {
    let isValid = true;

    if (!fullName.trim()) {
      setNameError('Vui lòng nhập họ và tên');
      isValid = false;
    } else {
      setNameError('');
    }

    const phoneRegex = /^0[0-9]{9,10}$/;
    if (!phone) {
      setPhoneError('Vui lòng nhập số điện thoại');
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneError('Số điện thoại không hợp lệ');
      isValid = false;
    } else {
      setPhoneError('');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/; 
    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu quá ngắn');
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError('Yêu cầu có hoa, thường và số');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmError('Vui lòng xác nhận mật khẩu');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmError('Mật khẩu không khớp');
      isValid = false;
    } else {
      setConfirmError('');
    }

    if (!agreeTerms) {
      setTermsError('Vui lòng đồng ý với Điều khoản');
      isValid = false;
    } else {
      setTermsError('');
    }

    if (isValid) {
      setUserName(fullName);
      router.push('/');
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
                <View style={styles.logoIconWrapper}>
                  <LinearGradient
                    colors={['rgba(0, 198, 255, 0.2)', 'rgba(0, 114, 255, 0.2)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons name="diamond-outline" size={42} color="#00c6ff" />
                </View>
                <Text style={[styles.logoTitle, { fontFamily: 'Outfit', color: '#00c6ff', fontSize: 28 }]}>SUPER APP</Text>
              </Animated.View>

              {/* Main Glassmorphism Card */}
              <Animated.View entering={FadeInUp.duration(1200).springify()} style={styles.cardContainer}>
                <BlurView intensity={70} tint="dark" style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.title, { fontFamily: 'Outfit', color: '#FFF', fontSize: 26 }]}>ĐĂNG KÝ</Text>
                    <Text style={[styles.subtitle, { fontFamily: 'Outfit' }]}>Tạo tài khoản mới để bắt đầu</Text>
                  </View>

                  <View style={styles.form}>
                    {/* Full Name Input */}
                    <Text style={styles.label}>HỌ VÀ TÊN</Text>
                    <View style={[
                      styles.inputWrapper, 
                      isNameFocused && styles.inputWrapperFocused,
                      nameError ? styles.inputError : null
                    ]}>
                      <Ionicons name="person-outline" size={20} color={isNameFocused ? "#00c6ff" : "#8F9BB3"} />
                      <TextInput
                        style={styles.input}
                        placeholder="Nguyễn Văn A"
                        placeholderTextColor="#6B7A90"
                        value={fullName}
                        onChangeText={(t) => {setFullName(t); setNameError('');}}
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                      />
                    </View>
                    {nameError ? <Animated.Text entering={FadeInDown} style={styles.errorText}>{nameError}</Animated.Text> : null}

                    {/* Phone Input */}
                    <Text style={[styles.label, {marginTop: 20}]}>SỐ ĐIỆN THOẠI</Text>
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
                        onChangeText={(t) => {setPassword(t); setPasswordError('');}}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8F9BB3" />
                      </TouchableOpacity>
                    </View>
                    {passwordError ? <Animated.Text entering={FadeInDown} style={styles.errorText}>{passwordError}</Animated.Text> : null}

                    {/* Confirm Password Input */}
                    <Text style={[styles.label, {marginTop: 20}]}>XÁC NHẬN MẬT KHẨU</Text>
                    <View style={[
                      styles.inputWrapper, 
                      isConfirmFocused && styles.inputWrapperFocused,
                      confirmError ? styles.inputError : null
                    ]}>
                      <Ionicons name="shield-checkmark-outline" size={20} color={isConfirmFocused ? "#00c6ff" : "#8F9BB3"} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#6B7A90"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={(t) => {setConfirmPassword(t); setConfirmError('');}}
                        onFocus={() => setIsConfirmFocused(true)}
                        onBlur={() => setIsConfirmFocused(false)}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8F9BB3" />
                      </TouchableOpacity>
                    </View>
                    {confirmError ? <Animated.Text entering={FadeInDown} style={styles.errorText}>{confirmError}</Animated.Text> : null}

                    {/* Terms Checkbox */}
                    <View style={styles.termsContainer}>
                      <TouchableOpacity 
                        style={styles.checkboxWrapper}
                        onPress={() => {setAgreeTerms(!agreeTerms); setTermsError('');}}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                          {agreeTerms && <Ionicons name="checkmark" size={14} color="#000" />}
                        </View>
                      </TouchableOpacity>
                      <Text style={styles.termsText}>
                        Tôi đồng ý với{' '}
                        <Text style={styles.termsLink} onPress={() => router.push('/terms')}>Điều khoản</Text>
                        {' '}&{' '}
                        <Text style={styles.termsLink} onPress={() => router.push('/privacy')}>Chính sách</Text>
                      </Text>
                    </View>
                    {termsError ? <Animated.Text entering={FadeInDown} style={[styles.errorText, {marginTop: -10, marginBottom: 16}]}>{termsError}</Animated.Text> : null}

                    {/* Register Button */}
                    <TouchableOpacity activeOpacity={0.8} onPress={handleRegister} style={styles.loginButtonWrapper}>
                      <LinearGradient
                        colors={['#00c6ff', '#0072ff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.loginButton}
                      >
                        <Text style={styles.loginButtonText}>TẠO TÀI KHOẢN</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.loginButtonIcon} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>

              {/* Footer */}
              <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.7}>
                  <Text style={styles.signUpText}>Đăng nhập</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '400',
  },
  form: {
    marginBottom: 10,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  checkboxWrapper: {
    padding: 4,
    marginLeft: -4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  checkboxChecked: {
    borderColor: '#00c6ff',
    backgroundColor: '#00c6ff',
  },
  termsText: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
  },
  termsLink: {
    color: '#00c6ff',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
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
