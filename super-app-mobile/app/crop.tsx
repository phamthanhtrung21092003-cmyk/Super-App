import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Platform,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  PanResponder,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { useUser } from '../context/UserContext';
import { imageHolderService } from '../services/imageHolderService';

export default function CropScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setAvatarUrl } = useUser();
  const { width: windowWidth } = useWindowDimensions();

  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string>('');
  const [origW, setOrigW] = useState<number>(0);
  const [origH, setOrigH] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  // Kích thước của khung cắt (Mask hình tròn)
  const BOX_SIZE = Math.min(windowWidth - 40, 300);

  // 1. Tải thông tin và kích thước ảnh khi mount
  useEffect(() => {
    let isMounted = true;

    const initImage = async () => {
      const held = imageHolderService.getImage();
      let targetUri = held?.uri || (typeof params.uri === 'string' ? params.uri : '');
      let w = held?.width || Number(params.width) || 0;
      let h = held?.height || Number(params.height) || 0;

      if (!targetUri) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin ảnh để căn chỉnh.');
        router.back();
        return;
      }

      // Nếu thiếu kích thước hoặc kích thước không hợp lệ, lấy kích thước thực tế của ảnh
      if (w <= 1 || h <= 1) {
        const dims = await imageHolderService.getImageDimensions(targetUri);
        w = dims.width || 512;
        h = dims.height || 512;
      }

      if (isMounted) {
        setImageUri(targetUri);
        setOrigW(w);
        setOrigH(h);
        setIsReady(true);
      }
    };

    initImage();

    return () => {
      isMounted = false;
    };
  }, [params.uri, params.width, params.height, router]);

  // Tính toán kích thước hiển thị của ảnh sao cho cạnh nhỏ nhất vừa khít khung
  const safeW = origW > 0 ? origW : 512;
  const safeH = origH > 0 ? origH : 512;
  const scale = BOX_SIZE / Math.min(safeW, safeH);
  const dispW = safeW * scale;
  const dispH = safeH * scale;

  // Giới hạn kéo thả (Bounding Box)
  const minX = BOX_SIZE - dispW;
  const minY = BOX_SIZE - dispH;
  const maxX = 0;
  const maxY = 0;

  // Animated Values cho việc kéo thả
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Reset pan về tâm ảnh khi dimensions đã sẵn sàng
  useEffect(() => {
    if (isReady && origW > 0 && origH > 0) {
      pan.setValue({ x: minX / 2, y: minY / 2 });
    }
  }, [isReady, origW, origH, minX, minY, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // Giới hạn lại không cho kéo tuột khỏi khung
        // @ts-ignore
        let newX = Math.max(minX, Math.min(maxX, pan.x._value));
        // @ts-ignore
        let newY = Math.max(minY, Math.min(maxY, pan.y._value));
        
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
        }).start();
      }
    })
  ).current;

  const handleCancel = () => {
    imageHolderService.clearImage();
    router.back();
  };

  const handleCrop = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      // @ts-ignore
      const currentX = pan.x._value ?? (minX / 2);
      // @ts-ignore
      const currentY = pan.y._value ?? (minY / 2);

      // Tính toán tọa độ thực tế trên ảnh gốc an toàn với Math.floor và bounds clamp
      const rawCropX = Math.abs(currentX) / scale;
      const rawCropY = Math.abs(currentY) / scale;
      const rawCropW = BOX_SIZE / scale;
      const rawCropH = BOX_SIZE / scale;

      const cropX = Math.max(0, Math.min(Math.floor(rawCropX), safeW - 1));
      const cropY = Math.max(0, Math.min(Math.floor(rawCropY), safeH - 1));
      const cropW = Math.max(1, Math.min(Math.floor(rawCropW), safeW - cropX));
      const cropH = Math.max(1, Math.min(Math.floor(rawCropH), safeH - cropY));

      let finalUri = imageUri;

      try {
        const result = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            { 
              crop: { 
                originX: cropX, 
                originY: cropY, 
                width: cropW, 
                height: cropH 
              } 
            },
            {
              resize: {
                width: 512,
                height: 512,
              }
            }
          ],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        if (result) {
          if (result.base64) {
            finalUri = result.base64.startsWith('data:') ? result.base64 : `data:image/jpeg;base64,${result.base64}`;
          } else if (result.uri) {
            finalUri = result.uri;
          }
        }
      } catch (manipError) {
        console.warn('[CropScreen] ImageManipulator failed, fallback to original image:', manipError);
        finalUri = imageUri;
      }

      await setAvatarUrl(finalUri);
      imageHolderService.clearImage();
      router.back();
    } catch (error) {
      console.error('[CropScreen] handleCrop failed:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const errMsg = err.response?.data?.message || 'Đã xảy ra lỗi khi tải ảnh lên!';
      Alert.alert('Thông báo', errMsg);
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00D8FF" />
        <Text style={[styles.instruction, { marginTop: 16 }]}>Đang chuẩn bị ảnh...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerBtn} disabled={loading}>
          <Text style={styles.headerBtnText}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Căn chỉnh ảnh</Text>
        <TouchableOpacity onPress={handleCrop} style={styles.headerBtn} disabled={loading}>
          {loading ? <ActivityIndicator color="#00D8FF" /> : <Text style={styles.headerBtnTextConfirm}>Xong</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.cropArea}>
        {/* Khung chứa ảnh (sẽ bị che bởi mask) */}
        <View style={[styles.imageWrapper, { width: BOX_SIZE, height: BOX_SIZE }]}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              {
                width: dispW,
                height: dispH,
                transform: [{ translateX: pan.x }, { translateY: pan.y }]
              }
            ]}
          >
            <Image 
              source={{ uri: imageUri }} 
              style={{ width: dispW, height: dispH }} 
              resizeMode="cover"
            />
          </Animated.View>
        </View>

        {/* Lớp Mask mờ xung quanh tạo hiệu ứng khung tròn */}
        <View style={styles.maskContainer} pointerEvents="none">
          <View style={[styles.maskCircle, { 
            width: BOX_SIZE + 2000, 
            height: BOX_SIZE + 2000, 
            borderRadius: (BOX_SIZE + 2000) / 2 
          }]} />
        </View>
      </View>

      <Text style={styles.instruction}>Kéo thả để căn chỉnh ảnh vào giữa tâm</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerBtn: {
    padding: 10,
  },
  headerBtnText: {
    color: '#FFF',
    fontSize: 16,
  },
  headerBtnTextConfirm: {
    color: '#00D8FF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cropArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  maskContainer: {
    position: 'absolute',
    top: -1000, bottom: -1000, left: -1000, right: -1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskCircle: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1000,
  },
  instruction: {
    color: '#888',
    textAlign: 'center',
    paddingBottom: 40,
  }
});
