import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';

export const imageService = {
  async pickImage(): Promise<{ uri: string; name: string; type: string } | null> {
    try {
      // 1. Xin quyền truy cập thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert(
          'Yêu cầu quyền truy cập',
          'Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt để chọn ảnh đại diện.',
        );
        return null;
      }

      // 2. Mở thư viện chọn ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1, // Lấy chất lượng gốc trước khi nén bằng Manipulator
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const originalUri = result.assets[0].uri;

      // 3. Resize ảnh về 512x512, tự động xoay và nén chất lượng 80% (Tiết kiệm băng thông)
      const manipulated = await ImageManipulator.manipulateAsync(
        originalUri,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
      );

      // Trích xuất tên file từ uri
      const filename = manipulated.uri.split('/').pop() || 'avatar.jpg';

      return {
        uri: manipulated.uri,
        name: filename,
        type: 'image/jpeg',
      };
    } catch (error) {
      console.error('[ImageService] Failed to pick or manipulate image:', error);
      Alert.alert('Lỗi', 'Không thể chọn hoặc xử lý ảnh.');
      return null;
    }
  },
};
