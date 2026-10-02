import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Line,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  icon?: 'pin' | 'car' | 'flag' | 'location' | 'bike';
}

export interface WebMapProps {
  points?: MapPoint[];
  showRoute?: boolean;
  routeColor?: string;
  height?: number;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  showNearbyDrivers?: boolean;
  interactive?: boolean;
}

export default function WebMap({
  points = [],
  showRoute = true,
  routeColor = '#10B981',
  height = 280,
  centerLat = 21.028511,
  centerLng = 105.804817,
  showNearbyDrivers = true,
  interactive = true,
}: WebMapProps) {
  const { width: screenWidth } = useWindowDimensions();
  const mapWidth = screenWidth || 390;
  const mapHeight = height;

  // Pulse animation for user's pin
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.7);

  // Animated vehicle position drifts
  const driverDrift = useSharedValue(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(2.2, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    driverDrift.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 2500 }),
        withTiming(-8, { duration: 2500 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const animatedDriverStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: driverDrift.value },
      { translateY: driverDrift.value * 0.4 },
    ],
  }));

  // Center coordinate mapping (Normalizing lat/lng into SVG 2D Canvas)
  // Base anchor: Hanoi center (21.0285, 105.8048)
  const baseLat = points.length > 0 ? points[0].lat : centerLat;
  const baseLng = points.length > 0 ? points[0].lng : centerLng;

  const projectToX = (lng: number) => {
    const delta = (lng - baseLng) * 3500;
    return Math.max(20, Math.min(mapWidth - 20, mapWidth / 2 + delta));
  };

  const projectToY = (lat: number) => {
    const delta = (baseLat - lat) * 3500;
    return Math.max(30, Math.min(mapHeight - 30, mapHeight / 2 + delta));
  };

  const pickupPoint = points[0] || {
    lat: baseLat,
    lng: baseLng,
    label: 'Vị trí của bạn',
    color: '#3B82F6',
  };
  const dropPoint = points.length > 1 ? points[1] : null;

  const pickupX = projectToX(pickupPoint.lng);
  const pickupY = projectToY(pickupPoint.lat);

  const dropX = dropPoint ? projectToX(dropPoint.lng) : mapWidth * 0.75;
  const dropY = dropPoint ? projectToY(dropPoint.lat) : mapHeight * 0.28;

  // Bezier curve control points for realistic curved road
  const midX = (pickupX + dropX) / 2 + 35;
  const midY = (pickupY + dropY) / 2 - 25;
  const routePathD = `M ${pickupX} ${pickupY} Q ${midX} ${midY} ${dropX} ${dropY}`;

  return (
    <View style={[styles.container, { height: mapHeight }]}>
      {/* 1. High Performance Vector Background (Streets, Rivers, Urban Blocks) */}
      <Svg width={mapWidth} height={mapHeight} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F1F5F9" />
            <Stop offset="1" stopColor="#E2E8F0" />
          </LinearGradient>
          <LinearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#BAE6FD" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#7DD3FC" stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="routeGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={routeColor} stopOpacity="0.8" />
            <Stop offset="1" stopColor="#059669" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Map Background Base */}
        <Rect x="0" y="0" width={mapWidth} height={mapHeight} fill="url(#bgGrad)" />

        {/* City Blocks (Urban Parks & Neighborhoods) */}
        <Rect x="15" y="25" width={mapWidth * 0.28} height={mapHeight * 0.25} rx="8" fill="#E2E8F0" />
        <Rect x={mapWidth * 0.35} y="15" width={mapWidth * 0.58} height={mapHeight * 0.2} rx="8" fill="#ECFDF5" />
        <Rect x="20" y={mapHeight * 0.55} width={mapWidth * 0.3} height={mapHeight * 0.35} rx="8" fill="#FEF3C7" opacity="0.6" />
        <Rect x={mapWidth * 0.4} y={mapHeight * 0.58} width={mapWidth * 0.52} height={mapHeight * 0.32} rx="8" fill="#E2E8F0" />

        {/* River Water Body (West Lake / Red River style) */}
        <Path
          d={`M -20 ${mapHeight * 0.15} C ${mapWidth * 0.3} ${mapHeight * 0.05}, ${mapWidth * 0.6} ${mapHeight * 0.22}, ${mapWidth + 20} ${mapHeight * 0.08}`}
          stroke="url(#riverGrad)"
          strokeWidth="38"
          fill="none"
          strokeLinecap="round"
        />

        {/* Secondary Road Grid Lines */}
        <Line x1="0" y1={mapHeight * 0.32} x2={mapWidth} y2={mapHeight * 0.32} stroke="#CBD5E1" strokeWidth="4" />
        <Line x1="0" y1={mapHeight * 0.72} x2={mapWidth} y2={mapHeight * 0.72} stroke="#CBD5E1" strokeWidth="4" />
        <Line x1={mapWidth * 0.25} y1="0" x2={mapWidth * 0.25} y2={mapHeight} stroke="#CBD5E1" strokeWidth="4" />
        <Line x1={mapWidth * 0.65} y1="0" x2={mapWidth * 0.65} y2={mapHeight} stroke="#CBD5E1" strokeWidth="4" />

        {/* Major Arterial Highway (Ring Road 3 / Nguyen Trai axis) */}
        <Path
          d={`M -10 ${mapHeight * 0.85} L ${mapWidth * 0.45} ${mapHeight * 0.45} L ${mapWidth + 10} ${mapHeight * 0.2}`}
          stroke="#94A3B8"
          strokeWidth="10"
          fill="none"
        />
        <Path
          d={`M -10 ${mapHeight * 0.85} L ${mapWidth * 0.45} ${mapHeight * 0.45} L ${mapWidth + 10} ${mapHeight * 0.2}`}
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeDasharray="8, 6"
          fill="none"
        />

        {/* Dynamic Route Polyline */}
        {showRoute && points.length >= 2 && (
          <G>
            {/* Route Outer Glow / Shadow */}
            <Path
              d={routePathD}
              stroke="#059669"
              strokeWidth="9"
              strokeOpacity="0.25"
              fill="none"
              strokeLinecap="round"
            />
            {/* Route Main Body */}
            <Path
              d={routePathD}
              stroke="url(#routeGlow)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
          </G>
        )}
      </Svg>

      {/* 2. Simulated Nearby Drivers (Bikes & EV Cars) */}
      {showNearbyDrivers && (
        <>
          {/* Driver 1: EV Taxi near pickup */}
          <Animated.View
            style={[
              styles.nearbyVehicle,
              { left: pickupX - 60, top: pickupY - 45 },
              animatedDriverStyle,
            ]}
          >
            <View style={[styles.vehicleBadge, { backgroundColor: '#10B981' }]}>
              <Ionicons name="car-sport" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.vehicleLabel}>EV Taxi 2p</Text>
          </Animated.View>

          {/* Driver 2: Bike near pickup */}
          <Animated.View
            style={[
              styles.nearbyVehicle,
              { left: pickupX + 48, top: pickupY + 35 },
              animatedDriverStyle,
            ]}
          >
            <View style={[styles.vehicleBadge, { backgroundColor: '#3B82F6' }]}>
              <Ionicons name="bicycle" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.vehicleLabel}>Xe máy 1p</Text>
          </Animated.View>

          {/* Driver 3: Car on main road */}
          <Animated.View
            style={[
              styles.nearbyVehicle,
              { left: mapWidth * 0.68, top: mapHeight * 0.42 },
              animatedDriverStyle,
            ]}
          >
            <View style={[styles.vehicleBadge, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="car" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.vehicleLabel}>7 Chỗ 4p</Text>
          </Animated.View>
        </>
      )}

      {/* 3. User Pickup Point Marker with Pulse Effect */}
      <View style={[styles.markerContainer, { left: pickupX - 22, top: pickupY - 40 }]}>
        <Animated.View style={[styles.pulseCircle, animatedPulseStyle]} />
        <View style={styles.pickupPin}>
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.markerBadge}>
          <Text style={styles.markerText} numberOfLines={1}>
            {pickupPoint.label || 'Điểm đón của bạn'}
          </Text>
        </View>
      </View>

      {/* 4. Destination Marker (If present) */}
      {showRoute && dropPoint && (
        <View style={[styles.markerContainer, { left: dropX - 20, top: dropY - 44 }]}>
          <View style={styles.dropPin}>
            <Ionicons name="location" size={20} color="#FFFFFF" />
          </View>
          <View style={[styles.markerBadge, { backgroundColor: '#EF4444' }]}>
            <Text style={[styles.markerText, { color: '#FFFFFF' }]} numberOfLines={1}>
              {dropPoint.label || 'Điểm đến'}
            </Text>
          </View>
        </View>
      )}

      {/* 5. Map Floating Control Badges (Live GPS, Recenter) */}
      {interactive && (
        <View style={styles.topMapControls} pointerEvents="box-none">
          <View style={styles.gpsStatusBadge}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>GPS Vector Siêu Nhẹ • 60 FPS</Text>
          </View>

          <TouchableOpacity style={styles.recenterBtn}>
            <Ionicons name="locate" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  // Markers
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pulseCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
    top: -4,
    left: -4,
  },
  pickupPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  dropPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  markerBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
    maxWidth: 130,
  },
  markerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Nearby Drivers
  nearbyVehicle: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  vehicleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  vehicleLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Map Controls
  topMapControls: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  gpsStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  gpsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  recenterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
