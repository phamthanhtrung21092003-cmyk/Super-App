import React from 'react';
import { Platform } from 'react-native';
import WebMapNative, { MapPoint, WebMapProps } from './WebMap.native';

export type { MapPoint, WebMapProps };

/**
 * Universal WebMap Component
 * - On Web (Platform.OS === 'web'): Loads SVG vector map from WebMap.web
 * - On Native (Android / iOS): Loads Cockpit Radar Map from WebMap.native without any react-native-svg dependencies
 */
export default function WebMap(props: WebMapProps) {
  if (Platform.OS === 'web') {
    const WebMapWeb = require('./WebMap.web').default;
    return <WebMapWeb {...props} />;
  }
  return <WebMapNative {...props} />;
}
