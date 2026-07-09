import React from 'react';
import { ImageSourcePropType } from 'react-native';
import DriverAvatar from './DriverAvatar';

interface DriverAvatarContainerProps {
  imageSource?: ImageSourcePropType;
}

export default function DriverAvatarContainer({ imageSource }: DriverAvatarContainerProps) {
  return <DriverAvatar imageSource={imageSource} />;
}
