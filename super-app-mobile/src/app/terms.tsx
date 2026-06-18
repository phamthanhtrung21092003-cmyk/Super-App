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

const BACKGROUND = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80';

export default function TermsScreen() {
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
            <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Quay lại</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Điều khoản dịch vụ</Text>
          </View>

          <View style={styles.card}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.lastUpdated}>Cập nhật lần cuối: Hôm nay</Text>
              
              <Text style={styles.paragraph}>
                Chào mừng bạn đến với Hành Trình. Vui lòng đọc kỹ các Điều khoản Dịch vụ này ("Điều khoản", "Điều khoản Dịch vụ") trước khi sử dụng ứng dụng Hành Trình.
              </Text>

              <Text style={styles.heading}>1. Chấp nhận các Điều khoản</Text>
              <Text style={styles.paragraph}>
                Bằng việc truy cập hoặc sử dụng Dịch vụ, bạn đồng ý tuân thủ các Điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản, bạn không thể truy cập Dịch vụ.
              </Text>

              <Text style={styles.heading}>2. Tài khoản của bạn</Text>
              <Text style={styles.paragraph}>
                Khi bạn tạo tài khoản với chúng tôi, bạn phải cung cấp cho chúng tôi thông tin chính xác, đầy đủ và cập nhật mọi lúc. Việc không thực hiện như vậy cấu thành vi phạm Điều khoản, điều này có thể dẫn đến việc chấm dứt ngay lập tức tài khoản của bạn trên Dịch vụ của chúng tôi.
              </Text>

              <Text style={styles.heading}>3. Sở hữu trí tuệ</Text>
              <Text style={styles.paragraph}>
                Dịch vụ và tất cả nội dung, tính năng và chức năng ban đầu của Dịch vụ đều và sẽ vẫn là tài sản độc quyền của Hành Trình và những người cấp phép của Hành Trình. Dịch vụ được bảo vệ bởi bản quyền, nhãn hiệu và các luật khác của cả quốc gia và nước ngoài.
              </Text>

              <Text style={styles.heading}>4. Liên kết đến các trang web khác</Text>
              <Text style={styles.paragraph}>
                Dịch vụ của chúng tôi có thể chứa các liên kết đến các trang web hoặc dịch vụ của bên thứ ba không thuộc sở hữu hoặc kiểm soát của Hành Trình. Chúng tôi không có quyền kiểm soát và không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc hoạt động của bất kỳ trang web hoặc dịch vụ nào của bên thứ ba.
              </Text>

              <Text style={styles.heading}>5. Chấm dứt tài khoản</Text>
              <Text style={styles.paragraph}>
                Chúng tôi có thể chấm dứt hoặc đình chỉ tài khoản của bạn ngay lập tức, mà không cần thông báo trước hoặc chịu trách nhiệm pháp lý, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn ở việc bạn vi phạm Điều khoản.
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
});
