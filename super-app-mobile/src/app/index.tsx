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
  StatusBar
} from 'react-native';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
        <View style={styles.header}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Super-App kết nối mọi người</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Số điện thoại di động</Text>
          
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.countryCode}>
              <Text style={styles.countryCodeText}>VN +84</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#A0AEC0"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoFocus
            />
          </View>

          <TouchableOpacity style={styles.helpTextContainer}>
            <Text style={styles.helpText}>Đăng nhập bằng phương thức khác</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.agreementText}>
            Bằng việc tiếp tục, bạn đồng ý với{' '}
            <Text style={styles.linkText}>Điều khoản dịch vụ</Text> và{' '}
            <Text style={styles.linkText}>Chính sách bảo mật</Text> của chúng tôi.
          </Text>

          <TouchableOpacity 
            style={[styles.button, phoneNumber.length > 8 ? styles.buttonActive : styles.buttonInactive]}
            disabled={phoneNumber.length <= 8}
          >
            <Text style={[styles.buttonText, phoneNumber.length > 8 ? styles.buttonTextActive : styles.buttonTextInactive]}>
              Tiếp tục
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    maxHeight: Platform.OS === 'web' ? 850 : '100%',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
      borderRadius: 24,
    }),
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 24,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  countryCodeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2D3748',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#1A202C',
    fontWeight: '500',
    paddingVertical: 8,
  },
  helpTextContainer: {
    alignSelf: 'flex-start',
  },
  helpText: {
    fontSize: 14,
    color: '#3182CE',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 40,
  },
  agreementText: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  linkText: {
    color: '#3182CE',
  },
  button: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInactive: {
    backgroundColor: '#EDF2F7',
  },
  buttonActive: {
    backgroundColor: '#05C160', // Màu xanh lục đặc trưng của WeChat
    shadowColor: '#05C160',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextInactive: {
    color: '#A0AEC0',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
});
