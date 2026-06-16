import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';

const BACKGROUND = 'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1000&q=80';

export default function PrivacyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <ImageBackground 
          source={{ uri: BACKGROUND }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Quay lại</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
          </View>

          <View style={styles.card}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.lastUpdated}>Cập nhật lần cuối: Hôm nay</Text>
              
              <Text style={styles.paragraph}>
                Sự riêng tư của bạn là vô cùng quan trọng đối với chúng tôi. Chính sách Bảo mật này giải thích cách Hành Trình thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
              </Text>

              <Text style={styles.heading}>1. Thu thập thông tin</Text>
              <Text style={styles.paragraph}>
                Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi khi tạo tài khoản, bao gồm họ tên, số điện thoại và mật khẩu. Hệ thống cũng có thể thu thập các dữ liệu sử dụng ẩn danh nhằm mục đích cải thiện dịch vụ.
              </Text>

              <Text style={styles.heading}>2. Sử dụng thông tin</Text>
              <Text style={styles.paragraph}>
                Hành Trình sử dụng thông tin của bạn để:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Cung cấp, duy trì và cải thiện Dịch vụ của chúng tôi.</Text>
                <Text style={styles.bulletItem}>• Xử lý và hoàn thành các giao dịch của bạn một cách an toàn.</Text>
                <Text style={styles.bulletItem}>• Gửi cho bạn các thông báo kỹ thuật, bản cập nhật và cảnh báo bảo mật.</Text>
              </View>

              <Text style={styles.heading}>3. Cam kết bảo mật</Text>
              <Text style={styles.paragraph}>
                Chúng tôi tuyệt đối không bán, cho thuê hoặc chia sẻ dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo thương mại. Dữ liệu của bạn được mã hóa bằng các tiêu chuẩn bảo mật cao nhất hiện nay.
              </Text>

              <Text style={styles.heading}>4. Quyền của người dùng</Text>
              <Text style={styles.paragraph}>
                Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua phần Cài đặt trong ứng dụng. Nếu bạn muốn xóa vĩnh viễn tài khoản, toàn bộ dữ liệu liên quan sẽ bị xóa khỏi hệ thống máy chủ của chúng tôi.
              </Text>

              <Text style={styles.heading}>5. Thay đổi Chính sách</Text>
              <Text style={styles.paragraph}>
                Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng Chính sách bảo mật mới trên trang này và cập nhật ngày ở trên cùng.
              </Text>

              <View style={{height: 40}} />
            </ScrollView>
          </View>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    color: '#00D8FF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 20,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(20, 25, 35, 0.65)', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(0, 255, 255, 0.2)', 
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }),
  },
  scrollContent: {
    padding: 24,
  },
  lastUpdated: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  heading: {
    color: '#00D8FF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bulletItem: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
  },
});
