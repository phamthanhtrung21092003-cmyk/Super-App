import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType } from 'react-native';
import { ImageAssets } from '../../../constants/images';

interface DriverAvatarProps {
  imageSource?: ImageSourcePropType;
}

export default function DriverAvatar({ imageSource }: DriverAvatarProps) {
  const source = imageSource || ImageAssets.avatarPlaceholder;

  return (
    <View style={styles.container} accessible={false}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel="Ảnh đại diện tài xế"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
