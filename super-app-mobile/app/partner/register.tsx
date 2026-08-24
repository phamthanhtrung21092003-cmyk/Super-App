import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions,
  TextInput, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F59E0B'; // Amber

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  // Step 1: Vehicle selection
  const [vehicleType, setVehicleType] = useState('bike_gas');
  const vehicles = [
    { id: 'bike_gas', name: 'Xe máy xăng', desc: 'Chở khách, giao hàng, đồ ăn', icon: 'bicycle-outline' },
    { id: 'bike_ev', name: 'Xe máy điện', desc: 'Chở khách, giao hàng, đồ ăn', icon: 'flash-outline' },
    { id: 'car_4', name: 'Ô tô 4 chỗ', desc: 'Chở khách đô thị', icon: 'car-outline' },
    { id: 'car_7', name: 'Ô tô 7 chỗ', desc: 'Chở khách gia đình/nhóm', icon: 'car-sport-outline' },
    { id: 'van', name: 'Xe Van', desc: 'Giao nhận hàng cồng kềnh', icon: 'bus-outline' },
    { id: 'truck', name: 'Xe tải', desc: 'Vận chuyển hàng hóa lớn', icon: 'shield-outline' },
  ];

  // Step 2: Personal details
  const [fullName, setFullName] = useState('Trần Trung');
  const [cccdNum, setCccdNum] = useState('037095018274');
  const [dob, setDob] = useState('21/09/2003');
  const [gender, setGender] = useState('Nam');
  const [address, setAddress] = useState('Cầu Giấy, Hà Nội');
  const [email, setEmail] = useState('trung.tran@email.com');
  const [phone, setPhone] = useState('0988888888');
  const [emergencyContact, setEmergencyContact] = useState('0912345678 (Mẹ)');

  // Step 3: CCCD OCR state
  const [cccdFrontUploaded, setCccdFrontUploaded] = useState(false);
  const [cccdBackUploaded, setCccdBackUploaded] = useState(false);

  // Step 4: eKYC Selfie state
  const [ekycStage, setEkycStage] = useState<'idle' | 'scanning' | 'blink' | 'turn' | 'success'>('idle');

  // Step 5: GPLX driving license
  const [gplxUploaded, setGplxUploaded] = useState(false);
  const [gplxClass, setGplxClass] = useState('A1');

  // Step 6: Vehicle info
  const [vehicleBrand, setVehicleBrand] = useState('Honda Wave Alpha');
  const [vehicleColor, setVehicleColor] = useState('Đỏ đen');
  const [vehiclePlate, setVehiclePlate] = useState('29-A1 999.99');

  // Step 7: Vehicle paperwork
  const [paperRegUploaded, setPaperRegUploaded] = useState(false);
  const [paperInsUploaded, setPaperInsUploaded] = useState(false);

  // Step 8: Vehicle Photo & Plate Matching
  const [vehiclePhotoUploaded, setVehiclePhotoUploaded] = useState(false);
  const [plateMatched, setPlateMatched] = useState(false);

  // Step 9: Bank Info
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccount, setBankAccount] = useState('102988888');

  // Step 10: Agreement & Submit
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleNextStep = () => {
    if (step === 3 && (!cccdFrontUploaded || !cccdBackUploaded)) {
      setLoading(true);
      setScanStatus('AI đang quét OCR...');
      setTimeout(() => {
        setLoading(false);
        setCccdFrontUploaded(true);
        setCccdBackUploaded(true);
      }, 1500);
      return;
    }

    if (step === 4 && ekycStage !== 'success') {
      setEkycStage('scanning');
      setTimeout(() => {
        setEkycStage('blink');
        setTimeout(() => {
          setEkycStage('turn');
          setTimeout(() => {
            setEkycStage('success');
          }, 1000);
        }, 1000);
      }, 1000);
      return;
    }

    if (step === 5 && !gplxUploaded) {
      setLoading(true);
      setScanStatus('AI đang xác thực GPLX...');
      setTimeout(() => {
        setLoading(false);
        setGplxUploaded(true);
      }, 1200);
      return;
    }

    if (step === 7 && (!paperRegUploaded || !paperInsUploaded)) {
      setPaperRegUploaded(true);
      setPaperInsUploaded(true);
      return;
    }

    if (step === 8 && !vehiclePhotoUploaded) {
      setLoading(true);
      setScanStatus('AI đang quét khớp biển số...');
      setTimeout(() => {
        setLoading(false);
        setVehiclePhotoUploaded(true);
        setPlateMatched(true);
      }, 1200);
      return;
    }

    if (step === 10) {
      setLoading(true);
      setScanStatus('AI đang chấm duyệt hồ sơ tự động...');
      setTimeout(() => {
        setLoading(false);
        router.push('/partner/pending');
      }, 2000);
      return;
    }

    setStep(step + 1);
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <LinearGradient colors={['#0F172A', '#000000']} style={StyleSheet.absoluteFillObject} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBackStep}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Đăng ký Tài xế ({step}/10)</Text>
          <View style={styles.stepProgressBg}>
            <View style={[styles.stepProgressBar, { width: `${step * 10}%` }]} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {loading && (
            <View style={styles.overlayLoading}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text style={styles.overlayText}>{scanStatus}</Text>
            </View>
          )}

          {/* STEP 1: SELECT VEHICLE */}
          {step === 1 && (
            <Animated.View entering={FadeInDown} layout={Layout.springify()}>
              <Text style={styles.sectionTitle}>Chọn phương tiện của bạn</Text>
              <Text style={styles.sectionDesc}>Một tài khoản duy nhất, nhận đơn theo loại xe tương thích.</Text>
              <View style={styles.list}>
                {vehicles.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.cardItem, vehicleType === v.id && styles.cardItemActive]}
                    onPress={() => setVehicleType(v.id)}
                  >
                    <View style={[styles.iconBox, vehicleType === v.id && { backgroundColor: accentColor }]}>
                      <Ionicons name={v.icon as any} size={24} color={vehicleType === v.id ? '#000' : '#8F9BB3'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={[styles.itemName, vehicleType === v.id && { color: '#FFF' }]}>{v.name}</Text>
                      <Text style={styles.itemDesc}>{v.desc}</Text>
                    </View>
                    <Ionicons
                      name={vehicleType === v.id ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={vehicleType === v.id ? accentColor : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* STEP 2: PERSONAL DETAILS */}
          {step === 2 && (
            <Animated.View entering={FadeInDown} layout={Layout.springify()}>
              <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
              <Text style={styles.sectionDesc}>Nhập chính xác theo giấy khai sinh / căn cước công dân.</Text>
              <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Họ và tên" placeholderTextColor="#64748B" value={fullName} onChangeText={setFullName} />
                <TextInput style={styles.input} placeholder="Số CCCD" placeholderTextColor="#64748B" value={cccdNum} onChangeText={setCccdNum} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Ngày sinh (DD/MM/YYYY)" placeholderTextColor="#64748B" value={dob} onChangeText={setDob} />
                <TextInput style={styles.input} placeholder="Giới tính" placeholderTextColor="#64748B" value={gender} onChangeText={setGender} />
                <TextInput style={styles.input} placeholder="Địa chỉ hiện tại" placeholderTextColor="#64748B" value={address} onChangeText={setAddress} />
                <TextInput style={styles.input} placeholder="Địa chỉ Email" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Số điện thoại" placeholderTextColor="#64748B" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <TextInput style={styles.input} placeholder="Người liên hệ khẩn cấp (SĐT + Tên)" placeholderTextColor="#64748B" value={emergencyContact} onChangeText={setEmergencyContact} />
              </View>
            </Animated.View>
          )}

          {/* STEP 3: CCCD OCR */}
          {step === 3 && (
            <Animated.View entering={FadeInDown}>
              <Text style={styles.sectionTitle}>Chụp ảnh CCCD</Text>
              <Text style={styles.sectionDesc}>Chụp rõ nét, không bị lóa sáng hay mất góc. AI OCR sẽ tự động quét thông tin.</Text>
              
              <View style={styles.uploadContainer}>
                <TouchableOpacity style={[styles.uploadBtn, cccdFrontUploaded && styles.uploadBtnSuccess]}>
                  <Ionicons name={cccdFrontUploaded ? "checkmark-circle" : "camera-outline"} size={32} color={cccdFrontUploaded ? accentColor : "#94A3B8"} />
                  <Text style={[styles.uploadBtnText, cccdFrontUploaded && { color: accentColor }]}>
                    {cccdFrontUploaded ? "Mặt trước CCCD: Đã Quét" : "Tải lên Mặt trước CCCD"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.uploadBtn, cccdBackUploaded && styles.uploadBtnSuccess]}>
                  <Ionicons name={cccdBackUploaded ? "checkmark-circle" : "camera-outline"} size={32} color={cccdBackUploaded ? accentColor : "#94A3B8"} />
                  <Text style={[styles.uploadBtnText, cccdBackUploaded && { color: accentColor }]}>
                    {cccdBackUploaded ? "Mặt sau CCCD: Đã Quét" : "Tải lên Mặt sau CCCD"}
                  </Text>
                </TouchableOpacity>
              </View>

              {cccdFrontUploaded && (
                <View style={styles.aiResultBox}>
                  <Text style={styles.aiResultTitle}>🤖 AI OCR Đọc thành công:</Text>
                  <Text style={styles.aiResultText}>• Họ tên: {fullName}</Text>
                  <Text style={styles.aiResultText}>• CCCD: {cccdNum}</Text>
                  <Text style={styles.aiResultText}>• Ngày sinh: {dob}</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* STEP 4: eKYC SELFIE */}
          {step === 4 && (
            <Animated.View entering={FadeInDown}>
              <Text style={styles.sectionTitle}>Xác thực khuôn mặt eKYC</Text>
              <Text style={styles.sectionDesc}>Di chuyển khuôn mặt vào trong khung hình tròn.</Text>

              <View style={styles.cameraFrameWrapper}>
                <View style={[styles.cameraFrame, ekycStage === 'success' && { borderColor: '#10B981' }]}>
                  {ekycStage === 'idle' && <Ionicons name="person-circle-outline" size={120} color="#64748B" />}
                  {ekycStage === 'scanning' && <ActivityIndicator size="large" color={accentColor} />}
                  {ekycStage === 'blink' && <Ionicons name="eye-outline" size={100} color={accentColor} />}
                  {ekycStage === 'turn' && <Ionicons name="arrow-redo-outline" size={100} color={accentColor} />}
                  {ekycStage === 'success' && <Ionicons name="checkmark-circle" size={120} color="#10B981" />}
                </View>
                
                <Text style={styles.cameraStatus}>
                  {ekycStage === 'idle' && 'Bấm Bắt đầu eKYC'}
                  {ekycStage === 'scanning' && 'Đang quét khuôn mặt...'}
                  {ekycStage === 'blink' && 'Nhìn thẳng và CHỚP MẮT 2 lần'}
                  {ekycStage === 'turn' && 'QUAY ĐẦU nhẹ sang phải'}
                  {ekycStage === 'success' && 'Xác thực sinh trắc học thành công! ✓'}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* STEP 5: GPLX DRIVING LICENSE */}
          {step === 5 && (
            <Animated.View entering={FadeInDown}>
              <Text style={styles.sectionTitle}>Tải lên Giấy phép lái xe (GPLX)</Text>
              <Text style={styles.sectionDesc}>Hệ thống AI sẽ tự động kiểm tra thời hạn và phân hạng bằng lái phù hợp.</Text>

              <TouchableOpacity style={[styles.uploadBtn, gplxUploaded && styles.uploadBtnSuccess]}>
                <Ionicons name={gplxUploaded ? "checkmark-circle" : "card-outline"} size={32} color={gplxUploaded ? accentColor : "#94A3B8"} />
                <Text style={[styles.uploadBtnText, gplxUploaded && { color: accentColor }]}>
                  {gplxUploaded ? "GPLX: Đã xác thực thành công" : "Tải lên ảnh chụp GPLX"}
                </Text>
              </TouchableOpacity>

              {gplxUploaded && (
                <View style={styles.aiResultBox}>
                  <Text style={styles.aiResultTitle}>🤖 AI đối soát GPLX:</Text>
                  <Text style={styles.aiResultText}>• Phân hạng: {gplxClass} (Phù hợp {vehicles.find(v => v.id === vehicleType)?.name})</Text>
                  <Text style={styles.aiResultText}>• Thời hạn: Không thời hạn (Vĩnh viễn)</Text>
                  <Text style={styles.aiResultText}>• Trạng thái: Hợp lệ</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* STEP 6: VEHICLE INFO */}
          {step === 6 && (
            <Animated.View entering={FadeInDown}>
              <Text style={styles.sectionTitle}>Thông tin phương tiện</Text>
              <Text style={styles.sectionDesc}>Nhập đúng theo giấy tờ đăng ký xe của bạn.</Text>
              <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Hãng xe & dòng xe (VD: Honda Vision)" placeholderTextColor="#64748B" value={vehicleBrand} onChangeText={setVehicleBrand} />
                <TextInput style={styles.input} placeholder="Màu sắc xe" placeholderTextColor="#64748B" value={vehicleColor} onChangeText={setVehicleColor} />
                <TextInput style={styles.input} placeholder="Biển kiểm soát (VD: 29-H1 123.45)" placeholderTextColor="#64748B" value={vehiclePlate} onChangeText={setVehiclePlate} />
              </View>
            </Animated.View>
          )}

          {/* STEP 7: VEHICLE PAPERWORK */}
          {step === 7 && (
            <Animated.View entering={FadeInDown}>
              <Text style={styles.sectionTitle}>Đăng ký & Bảo hiểm xe</Text>
              <Text style={styles.sectionDesc}>Đăng ký xe chính chủ hoặc giấy ủy quyền hợp pháp.</Text>
              <View style={styles.uploadContainer}>
                <TouchableOpacity style={[styles.uploadBtn, paperRegUploaded && styles.uploadBtnSuccess]}>
                  <Ionicons name={paperRegUploaded ? "checkmark-circle" : "document-text-outline"} size={32} color={paperRegUploaded ? accentColor : "#94A3B8"} />
                  <Text style={[styles.uploadBtnText, paperRegUploaded && { color: accentColor }]}>
                    {paperRegUploaded ? "Đăng ký xe: Đã tải lên" : "Tải lên Đăng ký xe / Cà vẹt"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.uploadBtn, paperInsUploaded && styles.uploadBtnSuccess]}>
                  <Ionicons name={paperInsUploaded ? "checkmark-circle" : "shield-checkmark-outline"} size={32} color={paperInsUploaded ? accentColor : "#94A3B8"} />
                  <Text style={[styles.uploadBtnText, paperInsUploaded && { color: accentColor }]}>
                    {paperInsUploaded ? "Bảo hiểm xe: Đã tải lên" : "Tải lên Bảo hiểm trách nhiệm dân sự"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* STEP 8: VEHICLE PHOTO & PLATE MATCH */}
          {step === 8 && (
            <Animated.View entering={FadeInDown}>
              <Text style={styles.sectionTitle}>Ảnh chụp phương tiện thực tế</Text>
              <Text style={styles.sectionDesc}>Tải lên ảnh chụp thấy rõ biển số xe. AI sẽ kiểm tra tính khớp nối.</Text>

              <TouchableOpacity style={[styles.uploadBtn, vehiclePhotoUploaded && styles.uploadBtnSuccess]}>
                <Ionicons name={vehiclePhotoUploaded ? "checkmark-circle" : "image-outline"} size={32} color={vehiclePhotoUploaded ? accentColor : "#94A3B8"} />
                <Text style={[styles.uploadBtnText, vehiclePhotoUploaded && { color: accentColor }]}>
                  {vehiclePhotoUploaded ? "Ảnh xe: Đã đối chiếu" : "Tải lên ảnh chụp xe thấy rõ biển số"}
                </Text>
              </TouchableOpacity>

              {plateMatched && (
                <View style={[styles.aiResultBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Text style={[styles.aiResultTitle, { color: '#059669' }]}>✓ AI Phát hiện biển số xe:</Text>
                  <Text style={[styles.aiResultText, { color: '#047857' }]}>• Biển số quét được: {vehiclePlate}</Text>
                  <Text style={[styles.aiResultText, { color: '#047857' }]}>• Trạng thái: Trùng khớp 100% với giấy tờ đăng ký xe.</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* STEP 9: BANK DETAILS */}
          {step === 9 && (
            <Animated.View entering={FadeInDown}>
              <Text style={styles.sectionTitle}>Liên kết Tài khoản Ngân hàng</Text>
              <Text style={styles.sectionDesc}>Dùng để rút tiền thu nhập từ Ví tài xế về ví cá nhân.</Text>
              <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Tên ngân hàng (VD: Vietcombank)" placeholderTextColor="#64748B" value={bankName} onChangeText={setBankName} />
                <TextInput style={styles.input} placeholder="Số tài khoản ngân hàng" placeholderTextColor="#64748B" value={bankAccount} onChangeText={setBankAccount} keyboardType="numeric" />
                <TextInput style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }]} value={fullName} editable={false} />
              </View>
            </Animated.View>
          )}

          {/* STEP 10: TERMS & AGREEMENTS */}
          {step === 10 && (
            <Animated.View entering={FadeInDown}>
              <Text style={styles.sectionTitle}>Điều khoản & Cam kết Đối tác</Text>
              <Text style={styles.sectionDesc}>Vui lòng đọc kỹ nghĩa vụ an toàn, quy định chiết khấu dịch vụ.</Text>
              
              <ScrollView style={styles.termsBox}>
                <Text style={styles.termsText}>
                  1. Tài xế cam kết tuân thủ quy tắc an toàn giao thông đường bộ Việt Nam.{'\n\n'}
                  2. Mức chiết khấu hệ thống áp dụng là 20% cho mỗi chuyến xe chở khách, 15% cho giao hàng.{'\n\n'}
                  3. Tiền Tip và Deal thương lượng được hưởng 100% không chịu chiết khấu từ công ty.{'\n\n'}
                  4. Không vận chuyển hàng cấm, vũ khí, chất cháy nổ. Nhận dạng rủi ro và báo cáo SOS ngay khi có sự cố.{'\n\n'}
                  5. Các hành vi quấy rối khách hàng, bùng chuyến liên tục sẽ dẫn đến khóa tài khoản vĩnh viễn.
                </Text>
              </ScrollView>

              <TouchableOpacity style={styles.checkRow} onPress={() => setTermsAgreed(!termsAgreed)}>
                <Ionicons name={termsAgreed ? "checkbox" : "square-outline"} size={22} color={accentColor} />
                <Text style={styles.checkText}>Tôi cam kết đã đọc và đồng ý với tất cả điều khoản trên.</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

        </ScrollView>

        {/* Footer Area */}
        <Animated.View style={styles.footer} entering={FadeInUp}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleNextStep}
            disabled={step === 10 && !termsAgreed}
            style={[styles.nextBtn, step === 10 && !termsAgreed && { opacity: 0.5 }]}
          >
            <LinearGradient
              colors={[accentColor, '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.linearBtn}
            >
              <Text style={styles.nextBtnText}>
                {step === 4 && ekycStage !== 'success' ? 'XÁC THỰC eKYC' : null}
                {step === 3 && (!cccdFrontUploaded || !cccdBackUploaded) ? 'QUÉT ẢNH CCCD' : null}
                {step === 5 && !gplxUploaded ? 'XÁC THỰC GPLX' : null}
                {step === 8 && !vehiclePhotoUploaded ? 'XÁC THỰC BIỂN SỐ' : null}
                {!(step === 4 && ekycStage !== 'success') && 
                 !(step === 3 && (!cccdFrontUploaded || !cccdBackUploaded)) && 
                 !(step === 5 && !gplxUploaded) && 
                 !(step === 8 && !vehiclePhotoUploaded) && 
                 (step === 10 ? 'GỬI HỒ SƠ LÊN AI' : 'TIẾP TỤC')}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#000', width: '100%' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#111', borderRadius: 55, overflow: 'hidden' },

  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, alignSelf: 'flex-start' },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12, marginBottom: 8 },
  stepProgressBg: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  stepProgressBar: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 2 },

  scrollContent: { padding: 24, paddingBottom: 100 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  sectionDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 18, marginBottom: 20 },

  // List Step 1
  list: { gap: 12 },
  cardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14, borderRadius: 16 },
  cardItemActive: { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.08)' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#94A3B8' },
  itemDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },

  // Form Step 2
  form: { gap: 14 },
  input: { backgroundColor: 'rgba(0,0,0,0.4)', borderSize: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, fontSize: 15, color: '#FFFFFF', ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },

  // Upload Box
  uploadContainer: { gap: 14 },
  uploadBtn: { height: 110, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.02)', justifyContent: 'center', alignItems: 'center', gap: 8 },
  uploadBtnSuccess: { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.05)' },
  uploadBtnText: { color: '#94A3B8', fontSize: 13, fontWeight: 'bold' },

  aiResultBox: { backgroundColor: 'rgba(245,158,11,0.05)', borderSize: 1, borderColor: 'rgba(245,158,11,0.2)', padding: 14, borderRadius: 16, marginTop: 16, gap: 6 },
  aiResultTitle: { fontSize: 13, color: '#F59E0B', fontWeight: 'bold', marginBottom: 2 },
  aiResultText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },

  // eKYC Frame
  cameraFrameWrapper: { alignItems: 'center', paddingVertical: 20 },
  cameraFrame: { width: 220, height: 220, borderRadius: 110, borderWidth: 4, borderColor: '#F59E0B', backgroundColor: '#090D16', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#F59E0B', shadowOpacity: 0.2, shadowRadius: 15 },
  cameraStatus: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold', marginTop: 24, textAlign: 'center', paddingHorizontal: 12 },

  // Terms Box
  termsBox: { height: 220, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14, marginBottom: 16 },
  termsText: { color: '#94A3B8', fontSize: 13, lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  checkText: { color: '#FFFFFF', fontSize: 13, flex: 1, fontWeight: '500' },

  // Loading
  overlayLoading: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, justifyContent: 'center', alignItems: 'center', gap: 16 },
  overlayText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', backgroundColor: '#000000' },
  nextBtn: { borderRadius: 16, overflow: 'hidden' },
  linearBtn: { height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.8 },
});
