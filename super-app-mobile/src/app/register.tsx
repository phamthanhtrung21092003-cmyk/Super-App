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
import { useUser } from '../context/UserContext';

const NameIcon = () => <Text style={{fontSize: 16, color: '#A0AEC0'}}>👤</Text>;
const PhoneIcon = () => <Text style={{fontSize: 16, color: '#A0AEC0'}}>📞</Text>;
const LockIcon = () => <Text style={{fontSize: 16, color: '#A0AEC0'}}>🔒</Text>;

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
];

export default function RegisterScreen() {
  const router = useRouter();
  const { setUserName } = useUser();
  
  // States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

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

  const handleRegister = () => {
    let isValid = true;

    // Validate Name
    if (!fullName.trim()) {
      setNameError('Vui lòng nhập họ và tên');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate Phone
    const phoneRegex = /^0[0-9]{9,10}$/;
    if (!phone) {
      setPhoneError('Vui lòng nhập số điện thoại');
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneError('Số điện thoại phải bắt đầu bằng 0 và có 10-11 số');
      isValid = false;
    } else {
      setPhoneError('');
    }

    // Validate Password
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
    } else {
      setPasswordError('');
    }

    // Validate Confirm Password
    if (!confirmPassword) {
      setConfirmError('Vui lòng xác nhận mật khẩu');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmError('Mật khẩu xác nhận không khớp');
      isValid = false;
    } else {
      setConfirmError('');
    }

    // Validate Terms
    if (!agreeTerms) {
      setTermsError('Bạn phải đồng ý với Điều khoản để tiếp tục');
      isValid = false;
    } else {
      setTermsError('');
    }

    if (isValid) {
      setUserName(fullName);
      router.push({ pathname: '/otp', params: { name: fullName } });
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
          
          <TouchableOpacity style={styles.changeBgButton} onPress={changeBackground}>
            <Text style={styles.changeBgText}>Đổi nền 🖼️</Text>
          </TouchableOpacity>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Top Logo */}
              <View style={styles.logoContainer}>
                <Text style={styles.logoIconText}>🕊️</Text>
                <Text style={styles.logoTitle}>Hành Trình</Text>
              </View>

              {/* Main Glassmorphism Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>ĐĂNG KÝ</Text>
                  <Text style={styles.subtitle}>Tạo tài khoản mới để bắt đầu</Text>
                </View>

                <View style={styles.form}>
                  {/* Full Name Input */}
                  <Text style={styles.label}>Họ và tên</Text>
                  <View style={[styles.inputWrapper, nameError ? styles.inputError : null]}>
                    <NameIcon />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập họ và tên của bạn"
                      placeholderTextColor="#A0AEC0"
                      value={fullName}
                      onChangeText={(t) => {setFullName(t); setNameError('');}}
                    />
                  </View>
                  {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

                  {/* Phone Input */}
                  <Text style={[styles.label, {marginTop: 12}]}>Số điện thoại</Text>
                  <View style={[styles.inputWrapper, phoneError ? styles.inputError : null]}>
                    <PhoneIcon />
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
                      onChangeText={(t) => {setPassword(t); setPasswordError('');}}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.extraIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                  {/* Confirm Password Input */}
                  <Text style={[styles.label, {marginTop: 12}]}>Xác nhận mật khẩu</Text>
                  <View style={[styles.inputWrapper, confirmError ? styles.inputError : null]}>
                    <LockIcon />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#A0AEC0"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={(t) => {setConfirmPassword(t); setConfirmError('');}}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Text style={styles.extraIcon}>{showConfirmPassword ? '👁️' : '🙈'}</Text>
                    </TouchableOpacity>
                  </View>
                  {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

                  {/* Terms Checkbox */}
                  <View style={styles.termsContainer}>
                    <TouchableOpacity 
                      style={styles.checkboxWrapper}
                      onPress={() => {setAgreeTerms(!agreeTerms); setTermsError('');}}
                    >
                      <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                        {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.termsText}>
                      Tôi đồng ý với{' '}
                      <Text style={styles.termsLink} onPress={() => router.push('/terms')}>
                        Điều khoản
                      </Text>
                      {' '}&{' '}
                      <Text style={styles.termsLink} onPress={() => router.push('/privacy')}>
                        Chính sách
                      </Text>
                    </Text>
                  </View>
                  {termsError ? <Text style={[styles.errorText, {marginTop: -16, marginBottom: 16}]}>{termsError}</Text> : null}

                  {/* Register Button */}
                  <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={handleRegister}
                  >
                    <Text style={styles.loginButtonText}>TẠO TÀI KHOẢN</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push('/')}>
                  <Text style={styles.signUpText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(0,0,0,0.2)',
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
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    minHeight: '100%',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 10,
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
    borderBottomColor: '#00D8FF', 
    paddingBottom: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  inputError: {
    borderBottomColor: '#FF4D4D',
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#00D8FF',
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00D8FF',
  },
  checkmark: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },
  termsText: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  termsLink: {
    color: '#00D8FF',
    fontWeight: '600',
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
