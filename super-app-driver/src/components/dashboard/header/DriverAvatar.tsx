import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { ImageAssets } from '../../../constants/images';

interface DriverAvatarProps {
  uri?: string;
}

export default function DriverAvatar({ uri }: DriverAvatarProps) {
  const [isLoading, setIsLoading] = useState(!!uri);

  return (
    <View style={styles.container}>
      {uri ? (
        <>
          <Image
            source={{ uri }}
            style={styles.image}
            onLoadEnd={() => setIsLoading(false)}
            accessibilityLabel="Ảnh đại diện tài xế"
            accessibilityRole="image"
          />
          {isLoading && <View style={styles.skeleton} />}
        </>
      ) : (
        <Image
          source={ImageAssets.avatarPlaceholder}
          style={styles.image}
          accessibilityLabel="Ảnh đại diện tài xế"
          accessibilityRole="image"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    resizeMode: 'cover',
  },
  skeleton: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E2E8F0',
  },
});
