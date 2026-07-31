import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletActivation, ActivationStep } from '../../../context/WalletActivationContext';
import { walletActivationService } from '../../../modules/wallet/services/walletActivationService';

interface WalletActivationWizardProps {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export const WalletActivationWizard: React.FC<WalletActivationWizardProps> = ({ visible, onComplete, onCancel }) => {
  const {
    currentStep,
    setStep,
    phone,
    ocrData,
    createdPin,
    setCreatedPin,
    enableBiometric,
    setEnableBiometric,
    createdProfile,
    resendOtpCount,
    incrementResendOtp,
    draftProgress,
    resumeDraft,
    processEligibility,
    submitOcrImages,
    verifyFaceLiveness,
    finalizeWalletActivation,
  } = useWalletActivation();

  // Screen States
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [otpFailedCount, setOtpFailedCount] = useState<number>(0);
  
  const [frontCccd, setFrontCccd] = useState<string>('cccd_front_mock_uri');
  const [backCccd, setBackCccd] = useState<string>('cccd_back_mock_uri');
  
  const [faceStep, setFaceStep] = useState<'straight' | 'blink' | 'left' | 'right'>('straight');
  const [faceFailedCount, setFaceFailedCount] = useState<number>(0);
  const [requiresCskh, setRequiresCskh] = useState<boolean>(false);
  
  const [legalAgreed, setLegalAgreed] = useState<boolean>(false);
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // OTP Timer Countdown
  useEffect(() => {
    let interval: any = null;
    if (currentStep === 'OTP' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, otpTimer]);

  if (!visible) return null;

  // Render Step 1: Eligibility Check
  const renderEligibility = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="shield-checkmark" size={60} color="#D8C690" />
      <Text style={styles.stepTitle}>Kiểm tra điều kiện mở Ví</Text>
      <Text style={styles.stepDesc}>Hệ thống đang rà soát thông tin tài khoản V-life của bạn...</Text>

      <View style={styles.eligibilityListBox}>
        <View style={styles.eligibilityItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.eligibilityText}>Đủ từ 16 tuổi trở lên</Text>
        </View>
        <View style={styles.eligibilityItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.eligibilityText}>Tài khoản V-life hoạt động bình thường</Text>
        </View>
        <View style={styles.eligibilityItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.eligibilityText}>Chưa có Ví điện tử được kích hoạt</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep('PERMISSIONS')}
      >
        <Text style={styles.primaryButtonText}>Đủ điều kiện - Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Step 2: Permissions Transparency Notice
  const renderPermissions = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="lock-closed-outline" size={54} color="#D8C690" />
      <Text style={styles.stepTitle}>Minh bạch Quyền Truy cập</Text>
      <Text style={styles.stepDesc}>Ví điện tử V-life sẽ yêu cầu các quyền sau để bảo vệ tài khoản của bạn:</Text>

      <View style={styles.permListBox}>
        <View style={styles.permItem}>
          <Ionicons name="camera-outline" size={24} color="#3B82F6" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.permItemTitle}>Máy ảnh (Camera)</Text>
            <Text style={styles.permItemDesc}>Để chụp ảnh thẻ CCCD và xác minh khuôn mặt eKYC.</Text>
          </View>
        </View>

        <View style={styles.permItem}>
          <Ionicons name="finger-print-outline" size={24} color="#8B5CF6" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.permItemTitle}>Sinh trắc học (Face ID / Vân tay)</Text>
            <Text style={styles.permItemDesc}>Để mở Ví nhanh chóng và bảo mật cao.</Text>
          </View>
        </View>

        <View style={styles.permItem}>
          <Ionicons name="globe-outline" size={24} color="#10B981" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.permItemTitle}>Mạng Internet</Text>
            <Text style={styles.permItemDesc}>Để truyền nhận mã hóa dữ liệu an toàn với Server.</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('WELCOME')}>
        <Text style={styles.primaryButtonText}>Đã hiểu & Bắt đầu</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Step 3: Welcome Screen
  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="wallet" size={72} color="#D8C690" />
      <Text style={styles.stepTitle}>Ví điện tử V-life</Text>
      <Text style={styles.stepDesc}>Thanh toán • Chuyển tiền • Nạp tiền • Rút tiền • Liên kết ngân hàng</Text>

      <View style={styles.welcomeFeatureGrid}>
        <View style={styles.featureBox}>
          <Ionicons name="flash-outline" size={24} color="#F59E0B" />
          <Text style={styles.featureTitle}>Miễn phí 100%</Text>
        </View>
        <View style={styles.featureBox}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
          <Text style={styles.featureTitle}>Bảo mật 2 lớp</Text>
        </View>
      </View>

      {draftProgress && (
        <TouchableOpacity style={styles.draftButton} onPress={resumeDraft}>
          <Ionicons name="time-outline" size={20} color="#D8C690" style={{ marginRight: 8 }} />
          <Text style={styles.draftButtonText}>Tiếp tục bản nháp dở dang (Còn 23 giờ)</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('TERMS')}>
        <Text style={styles.primaryButtonText}>Đăng ký Ví mới ngay</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Step 4: Terms Screen
  const renderTerms = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Điều khoản & Chính sách Ví</Text>

      <ScrollView style={styles.termsScrollBox}>
        <Text style={styles.termsText}>
          1. Quy định chung: Ví điện tử V-life được phát hành và quản lý theo quy định pháp luật về ví điện tử của Ngân hàng Nhà nước.{"\n\n"}
          2. Liên kết tài khoản: Mỗi tài khoản V-life chỉ được kích hoạt một Ví duy nhất gắn liền với số điện thoại tài khoản.{"\n\n"}
          3. Xác thực eKYC: Khách hàng có trách nhiệm cung cấp thông tin CCCD chính xác và chính chủ. 1 mã CCCD chỉ được liên kết 1 Ví V-life.{"\n\n"}
          4. Bảo mật PIN & OTP: Mã PIN 6 số và mã OTP SMS là mật khẩu giao dịch nhạy cảm. Tuyệt đối không chia sẻ cho bất kỳ ai.
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setTermsAgreed(!termsAgreed)}
      >
        <Ionicons
          name={termsAgreed ? 'checkbox' : 'square-outline'}
          size={24}
          color={termsAgreed ? '#D8C690' : '#9CA3AF'}
        />
        <Text style={styles.checkboxLabel}>Tôi đồng ý với Điều khoản sử dụng & Chính sách bảo mật</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, !termsAgreed && styles.buttonDisabled]}
        disabled={!termsAgreed}
        onPress={() => setStep('PHONE_CONFIRM')}
      >
        <Text style={styles.primaryButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Step 5: Phone Confirmation
  const renderPhoneConfirm = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="phone-portrait-outline" size={54} color="#D8C690" />
      <Text style={styles.stepTitle}>Xác nhận số điện thoại</Text>
      <Text style={styles.stepDesc}>
        Ví điện tử sẽ được kích hoạt bằng số điện thoại của tài khoản V-life hiện tại.
      </Text>

      <View style={styles.fixedPhoneBox}>
        <Text style={styles.fixedPhoneLabel}>Số điện thoại Ví (Cố định)</Text>
        <Text style={styles.fixedPhoneValue}>{phone}</Text>
        <Ionicons name="lock-closed" size={18} color="#D8C690" />
      </View>

      <Text style={styles.phoneNoticeText}>
        * Lưu ý: Muốn sử dụng số điện thoại khác, vui lòng thay đổi trong Cài đặt tài khoản V-life trước.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          setOtpTimer(60);
          setStep('OTP');
        }}
      >
        <Text style={styles.primaryButtonText}>Gửi mã OTP xác nhận</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Step 6: OTP Verification
  const renderOtp = () => {
    const handleResend = () => {
      const allowed = incrementResendOtp();
      if (!allowed) {
        Alert.alert('Giới hạn', 'Bạn đã gửi lại OTP quá 3 lần. Vui lòng thử lại sau.');
        return;
      }
      setOtpTimer(60);
      setOtpInput('');
      Alert.alert('Đã gửi lại', 'Mã OTP thử nghiệm là 123456');
    };

    const handleVerifyOtp = () => {
      if (otpInput !== '123456' && otpInput.length !== 6) {
        const nextFailed = otpFailedCount + 1;
        setOtpFailedCount(nextFailed);
        if (nextFailed >= 5) {
          Alert.alert('Khóa tạm thời', 'Bạn đã nhập sai OTP 5 lần. Vui lòng thử lại sau 30 phút.');
        } else {
          setErrorMessage(`Mã OTP không chính xác. Mã thử nghiệm: 123456 (${5 - nextFailed} lần thử)`);
        }
        return;
      }
      setStep('IDENTITY_CCCD');
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Xác thực mã OTP</Text>
        <Text style={styles.stepDesc}>Mã OTP SMS đã được gửi đến số {phone}</Text>
        <Text style={styles.hintText}>Mã OTP thử nghiệm: 123456 (Còn: {otpTimer}s)</Text>

        <View style={styles.otpInputRow}>
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <View key={idx} style={styles.otpCell}>
              <Text style={styles.otpCellText}>{otpInput[idx] || ''}</Text>
            </View>
          ))}
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {/* Custom keypad for OTP */}
        <View style={styles.otpKeypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'c', 0, 'del'].map((k, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.otpKeyBtn}
              onPress={() => {
                if (k === 'del') setOtpInput((p) => p.slice(0, -1));
                else if (k === 'c') setOtpInput('');
                else if (otpInput.length < 6) setOtpInput((p) => p + k);
              }}
            >
              <Text style={styles.otpKeyText}>{k === 'del' ? '⌫' : k === 'c' ? 'C' : k}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.resendRow}>
          <TouchableOpacity onPress={handleResend} disabled={resendOtpCount >= 3}>
            <Text style={[styles.resendText, resendOtpCount >= 3 && { color: '#6B7280' }]}>
              {resendOtpCount >= 3 ? 'Đã hết lượt gửi lại (Tối đa 3 lần)' : `Gửi lại mã (${3 - resendOtpCount} lần còn lại)`}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, otpInput.length !== 6 && styles.buttonDisabled]}
          disabled={otpInput.length !== 6}
          onPress={handleVerifyOtp}
        >
          <Text style={styles.primaryButtonText}>Xác nhận OTP</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Step 7: Identity CCCD Scan
  const renderIdentity = () => {
    const handleScanCccd = async () => {
      setLoading(true);
      const res = await submitOcrImages(frontCccd, backCccd);
      setLoading(false);
      if (res.success) {
        setStep('FACE_VERIFY');
      } else {
        setErrorMessage(res.errorMessage || 'Lỗi đọc thẻ CCCD');
      }
    };

    return (
      <View style={styles.stepContainer}>
        <Ionicons name="card-outline" size={54} color="#D8C690" />
        <Text style={styles.stepTitle}>Chụp ảnh thẻ CCCD</Text>
        <Text style={styles.stepDesc}>Vui lòng chụp rõ 2 mặt thẻ CCCD gắn chip chính chủ</Text>

        <View style={styles.cccdScanGrid}>
          <View style={styles.cccdBox}>
            <Ionicons name="camera" size={32} color="#D8C690" />
            <Text style={styles.cccdBoxText}>Mặt trước CCCD</Text>
            <Text style={styles.cccdStatusText}>✓ Đã quét xong</Text>
          </View>
          <View style={styles.cccdBox}>
            <Ionicons name="camera" size={32} color="#D8C690" />
            <Text style={styles.cccdBoxText}>Mặt sau CCCD</Text>
            <Text style={styles.cccdStatusText}>✓ Đã quét xong</Text>
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleScanCccd} disabled={loading}>
          {loading ? <ActivityIndicator color="#02163B" /> : <Text style={styles.primaryButtonText}>Tiếp tục eKYC Khuôn mặt</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  // Render Step 8: Face Verification
  const renderFaceVerify = () => {
    const handleVerifyLiveness = async () => {
      setLoading(true);
      const res = await verifyFaceLiveness(faceFailedCount);
      setLoading(false);
      if (res.success) {
        setStep('EKYC_PROCESSING');
      } else {
        const nextFailed = faceFailedCount + 1;
        setFaceFailedCount(nextFailed);
        if (res.requiresCskh || nextFailed >= 3) {
          setRequiresCskh(true);
        } else {
          Alert.alert('Thử lại', `Quét mặt chưa đạt (${3 - nextFailed} lần thử còn lại)`);
        }
      }
    };

    if (requiresCskh) {
      return (
        <View style={styles.stepContainer}>
          <Ionicons name="headset-outline" size={60} color="#EF4444" />
          <Text style={styles.stepTitle}>Quét khuôn mặt thất bại 3 lần</Text>
          <Text style={styles.stepDesc}>
            Vui lòng liên hệ Tổng đài CSKH V-life (1900 1234) hoặc hỗ trợ eKYC trực tiếp tại quầy giao dịch.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onCancel}>
            <Text style={styles.primaryButtonText}>Quay lại Trang chủ</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stepContainer}>
        <Ionicons name="scan-circle-outline" size={64} color="#D8C690" />
        <Text style={styles.stepTitle}>Xác minh khuôn mặt Liveness</Text>
        <Text style={styles.stepDesc}>Giữ thẳng camera và thực hiện các động tác hướng dẫn</Text>

        <View style={styles.cameraCircleBox}>
          <Text style={styles.livenessActionText}>
            {faceStep === 'straight' ? '👤 Nhìn thẳng vào camera' : faceStep === 'blink' ? '👁️ Chớp mắt từ từ' : faceStep === 'left' ? '👈 Quay nhẹ sang trái' : '👉 Quay nhẹ sang phải'}
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyLiveness} disabled={loading}>
          {loading ? <ActivityIndicator color="#02163B" /> : <Text style={styles.primaryButtonText}>Hoàn tất quét khuôn mặt</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  // Render Step 9: eKYC Processing & Success
  const renderEkycProcessing = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="checkmark-circle-outline" size={72} color="#10B981" />
      <Text style={styles.stepTitle}>eKYC Xác minh Thành công!</Text>
      <Text style={styles.stepDesc}>Dữ liệu nhân thân và khuôn mặt của bạn đã được đối soát chính xác.</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('REVIEW_INFO')}>
        <Text style={styles.primaryButtonText}>Rà soát thông tin cá nhân</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Step 10: Review Info with Legal Commitment Checkbox
  const renderReviewInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Kiểm tra thông tin cá nhân</Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Họ và tên:</Text>
          <Text style={styles.reviewValue}>{ocrData?.fullName || 'NGUYỄN THÀNH TRUNG'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Ngày sinh:</Text>
          <Text style={styles.reviewValue}>{ocrData?.birthDate || '21/09/2003'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Số CCCD:</Text>
          <Text style={styles.reviewValue}>{ocrData?.cccdNumber || '038203001234'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Số điện thoại Ví:</Text>
          <Text style={styles.reviewValue}>{phone}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setLegalAgreed(!legalAgreed)}>
        <Ionicons name={legalAgreed ? 'checkbox' : 'square-outline'} size={24} color={legalAgreed ? '#D8C690' : '#9CA3AF'} />
        <Text style={styles.checkboxLabel}>
          ☑ Tôi xác nhận mọi thông tin cá nhân trên là hoàn toàn chính xác và chịu trách nhiệm pháp lý.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, !legalAgreed && styles.buttonDisabled]}
        disabled={!legalAgreed}
        onPress={() => setStep('CREATE_PIN')}
      >
        <Text style={styles.primaryButtonText}>Xác nhận & Tạo mã PIN</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Step 11: Create & Confirm PIN
  const renderPinCreation = () => {
    const isConfirming = currentStep === 'CONFIRM_PIN';

    const handlePinKeyPress = (num: string) => {
      if (!isConfirming) {
        if (createdPin.length < 6) {
          const next = createdPin + num;
          setCreatedPin(next);
          if (next.length === 6) {
            const val = walletActivationService.validatePinWithUserData(next, {
              birthDate: ocrData?.birthDate,
              phone,
              cccdNumber: ocrData?.cccdNumber,
            });
            if (!val.isValid) {
              Alert.alert('PIN không hợp lệ', val.reason);
              setCreatedPin('');
            } else {
              setStep('CONFIRM_PIN');
            }
          }
        }
      } else {
        if (confirmPinInput.length < 6) {
          const next = confirmPinInput + num;
          setConfirmPinInput(next);
          if (next.length === 6) {
            if (next !== createdPin) {
              Alert.alert('PIN không khớp', 'Mã PIN xác nhận không trùng khớp. Vui lòng thử lại.');
              setConfirmPinInput('');
            } else {
              setStep('BIOMETRIC');
            }
          }
        }
      }
    };

    const currentVal = isConfirming ? confirmPinInput : createdPin;

    return (
      <View style={styles.stepContainer}>
        <Ionicons name="key-outline" size={54} color="#D8C690" />
        <Text style={styles.stepTitle}>{isConfirming ? 'Xác nhận lại mã PIN 6 số' : 'Tạo mã PIN Ví (6 số)'}</Text>
        <Text style={styles.stepDesc}>
          {isConfirming ? 'Nhập lại mã PIN 6 số vừa tạo để xác nhận' : 'PIN được dùng để đăng nhập Ví và xác thực mọi giao dịch'}
        </Text>

        <View style={styles.pinDotsRow}>
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <View key={idx} style={[styles.pinDot, currentVal.length > idx ? styles.pinDotFilled : styles.pinDotEmpty]} />
          ))}
        </View>

        {/* Security Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['', '0', 'del'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((key, kIdx) => {
                if (key === 'del') {
                  return (
                    <TouchableOpacity
                      key={kIdx}
                      style={styles.keyButton}
                      onPress={() => {
                        if (isConfirming) setConfirmPinInput(confirmPinInput.slice(0, -1));
                        else setCreatedPin(createdPin.slice(0, -1));
                      }}
                    >
                      <Ionicons name="backspace-outline" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                  );
                }
                if (key === '') return <View key={kIdx} style={styles.keyButtonEmpty} />;
                return (
                  <TouchableOpacity key={kIdx} style={styles.keyButton} onPress={() => handlePinKeyPress(key)}>
                    <Text style={styles.keyText}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render Step 12: Biometric Enrollment
  const renderBiometric = () => {
    const handleFinalize = async (enable: boolean) => {
      setEnableBiometric(enable);
      setStep('ACTIVATING');
      setLoading(true);
      await finalizeWalletActivation();
      setLoading(false);
      setStep('SUCCESS');
    };

    return (
      <View style={styles.stepContainer}>
        <Ionicons name="finger-print" size={72} color="#D8C690" />
        <Text style={styles.stepTitle}>Đăng ký Face ID / Vân tay</Text>
        <Text style={styles.stepDesc}>Sử dụng sinh trắc học để mở Ví nhanh chóng và an toàn hơn</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => handleFinalize(true)}>
          <Text style={styles.primaryButtonText}>Bật xác thực ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => handleFinalize(false)}>
          <Text style={styles.secondaryButtonText}>Để sau (Có thể bật trong Cài đặt)</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Step 13: Activating Loading
  const renderActivating = () => (
    <View style={styles.stepContainer}>
      <ActivityIndicator size="large" color="#D8C690" />
      <Text style={[styles.stepTitle, { marginTop: 20 }]}>Đang khởi tạo Ví điện tử V-life...</Text>
      <Text style={styles.stepDesc}>Thiết lập Wallet Profile (PENDING ➔ ACTIVE)...</Text>
    </View>
  );

  // Render Step 14: Activation Success
  const renderSuccess = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="checkmark-done-circle" size={80} color="#10B981" />
      <Text style={styles.stepTitle}>Đăng ký Ví Thành công!</Text>
      <Text style={styles.stepDesc}>Ví điện tử V-life của bạn đã sẵn sàng sử dụng.</Text>

      <View style={styles.successCard}>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Wallet Number:</Text>
          <Text style={styles.reviewValue}>{createdProfile?.walletNumber || '8812 2345 6789'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Wallet Alias (SĐT):</Text>
          <Text style={styles.reviewValue}>{createdProfile?.walletAlias || phone}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Trạng thái:</Text>
          <Text style={[styles.reviewValue, { color: '#10B981' }]}>{createdProfile?.status || 'ACTIVE'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Hạng Ví:</Text>
          <Text style={styles.reviewValue}>{createdProfile?.level || 'Level 1 (eKYC Basic)'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Loại tiền tệ:</Text>
          <Text style={styles.reviewValue}>{createdProfile?.currency || 'VND'}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Số dư ban đầu:</Text>
          <Text style={[styles.reviewValue, { color: '#D8C690', fontWeight: '800' }]}>0 đ</Text>
        </View>
      </View>

      <Text style={styles.quickShortcutsHeader}>Bạn có thể bắt đầu sử dụng ngay các tiện ích:</Text>
      <View style={styles.quickShortcutsRow}>
        <Text style={styles.shortcutTag}>• Nạp tiền</Text>
        <Text style={styles.shortcutTag}>• Liên kết ngân hàng</Text>
        <Text style={styles.shortcutTag}>• Thanh toán QR</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onComplete}>
        <Text style={styles.primaryButtonText}>Mở Ví ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent backdropColor="rgba(0,0,0,0.85)">
      <View style={styles.overlay}>
        <View style={styles.wizardCard}>
          {currentStep !== 'SUCCESS' && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {currentStep === 'ELIGIBILITY_CHECK' && renderEligibility()}
          {currentStep === 'PERMISSIONS' && renderPermissions()}
          {currentStep === 'WELCOME' && renderWelcome()}
          {currentStep === 'TERMS' && renderTerms()}
          {currentStep === 'PHONE_CONFIRM' && renderPhoneConfirm()}
          {currentStep === 'OTP' && renderOtp()}
          {currentStep === 'IDENTITY_CCCD' && renderIdentity()}
          {currentStep === 'FACE_VERIFY' && renderFaceVerify()}
          {currentStep === 'EKYC_PROCESSING' && renderEkycProcessing()}
          {currentStep === 'REVIEW_INFO' && renderReviewInfo()}
          {(currentStep === 'CREATE_PIN' || currentStep === 'CONFIRM_PIN') && renderPinCreation()}
          {currentStep === 'BIOMETRIC' && renderBiometric()}
          {currentStep === 'ACTIVATING' && renderActivating()}
          {currentStep === 'SUCCESS' && renderSuccess()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 22, 59, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  wizardCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#031E4B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(216, 198, 144, 0.3)',
    elevation: 12,
  },
  cancelBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D8C690',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#02163B',
  },
  secondaryButton: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  eligibilityListBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  eligibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eligibilityText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  permListBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginBottom: 20,
  },
  permItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  permItemDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  welcomeFeatureGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  featureBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  featureTitle: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(216, 198, 144, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  draftButtonText: {
    fontSize: 13,
    color: '#D8C690',
    fontWeight: '600',
  },
  termsScrollBox: {
    width: '100%',
    maxHeight: 180,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    width: '100%',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    flex: 1,
  },
  fixedPhoneBox: {
    width: '100%',
    backgroundColor: 'rgba(216, 198, 144, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216, 198, 144, 0.3)',
    marginBottom: 12,
  },
  fixedPhoneLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  fixedPhoneValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D8C690',
    marginBottom: 4,
  },
  phoneNoticeText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  hintText: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 14,
  },
  otpInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  otpCell: {
    width: 38,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpCellText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpKeypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  otpKeyBtn: {
    width: 64,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpKeyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendRow: {
    marginBottom: 14,
  },
  resendText: {
    fontSize: 13,
    color: '#D8C690',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  cccdScanGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cccdBox: {
    flex: 1,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(216, 198, 144, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cccdBoxText: {
    fontSize: 12,
    color: '#E5E7EB',
    marginTop: 4,
  },
  cccdStatusText: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 2,
    fontWeight: '600',
  },
  cameraCircleBox: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 3,
    borderColor: '#D8C690',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
  },
  livenessActionText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  reviewCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pinDotEmpty: {
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  pinDotFilled: {
    backgroundColor: '#D8C690',
  },
  keypad: {
    width: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  keyButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyButtonEmpty: {
    width: 60,
    height: 60,
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successCard: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 14,
  },
  quickShortcutsHeader: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  quickShortcutsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  shortcutTag: {
    fontSize: 12,
    color: '#D8C690',
    backgroundColor: 'rgba(216, 198, 144, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
});
