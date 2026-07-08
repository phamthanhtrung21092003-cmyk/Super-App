import React from 'react';
import DriverAvatar from './DriverAvatar';

interface DriverAvatarContainerProps {
  uri?: string;
}

export default function DriverAvatarContainer({ uri }: DriverAvatarContainerProps) {
  return <DriverAvatar uri={uri} />;
}
