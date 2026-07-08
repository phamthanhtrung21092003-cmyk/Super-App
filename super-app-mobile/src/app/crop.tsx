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
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { useUser } from '../context/UserContext';

export default function CropScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setAvatarUrl } = useUser();
  const { width: windowWidth } = useWindowDimensions();

  const uri = typeof params.uri === 'string' ? params.uri : '';
  const origW = Number(params.width) || 1;
  const origH = Number(params.height) || 1;

  const [loading, setLoading] = useState(false);

  // Kích thước của khung cắt (Mask hình tròn)
  const BOX_SIZE = Math.min(windowWidth - 40, 300);

  // Tính toán kích thước hiển thị của ảnh sao cho cạnh nhỏ nhất vừa khít khung
  const scale = BOX_SIZE / Math.min(origW, origH);
  const dispW = origW * scale;
  const dispH = origH * scale;

  // Giới hạn kéo thả (Bounding Box)
  const minX = BOX_SIZE - dispW;
  const minY = BOX_SIZE - dispH;
  const maxX = 0;
  const maxY = 0;

  // Animated Values cho việc kéo thả
  const pan = useRef(new Animated.ValueXY({ x: minX / 2, y: minY / 2 })).current; // Default center

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

  const handleCrop = async () => {
    if (!uri) return;
    setLoading(true);
    try {
      // @ts-ignore
      const currentX = pan.x._value;
      // @ts-ignore
      const currentY = pan.y._value;

      // Tính toán tọa độ thực tế trên ảnh gốc
      const cropX = Math.abs(currentX) / scale;
      const cropY = Math.abs(currentY) / scale;
      const cropW = BOX_SIZE / scale;
      const cropH = BOX_SIZE / scale;

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          { 
            crop: { 
              originX: cropX, 
              originY: cropY, 
              width: cropW, 
              height: cropH 
            } 
          }
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      await setAvatarUrl(result.uri);
      router.back();
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const errMsg = err.response?.data?.message || 'Đã xảy ra lỗi khi tải ảnh lên!';
      alert(errMsg);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
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
              source={{ uri }} 
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
