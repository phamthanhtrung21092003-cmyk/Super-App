import React from 'react';
import { View, Text } from 'react-native';

export default function MapView(props) {
  return (
    <View style={[{ backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', flex: 1 }, props.style]}>
      <Text style={{ color: '#666' }}>Bản đồ (Chỉ hiển thị trên App)</Text>
      {props.children}
    </View>
  );
}

export const Marker = ({ children }) => <>{children}</>;
export const Polyline = () => null;
export const PROVIDER_GOOGLE = 'google';
