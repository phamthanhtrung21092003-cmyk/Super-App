import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
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

/**
 * Native Cockpit Map View - Chuẩn Native 100% không phụ thuộc react-native-svg.
 * Hiển thị giao diện radar buồng lái tài xế công nghệ cao với tọa độ GPS,
 * mô phỏng xe xung quanh, điểm đón/trả và đường định tuyến.
 */
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

  // Pulse animation cho điểm đón
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.7);

  // Hiệu ứng xe di chuyển nhẹ
  const driverDrift = useSharedValue(0);

  // Hiệu ứng radar quét buồng lái
  const radarSweep = useSharedValue(0);

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

    radarSweep.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
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

  const animatedRadarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarSweep.value * 360}deg` }],
  }));

  // Ánh xạ tọa độ phẳng trên màn hình
  const baseLat = points.length > 0 ? points[0].lat : centerLat;
  const baseLng = points.length > 0 ? points[0].lng : centerLng;

  const projectToX = (lng: number) => {
    const delta = (lng - baseLng) * 3500;
    return Math.max(30, Math.min(mapWidth - 30, mapWidth / 2 + delta));
  };

  const projectToY = (lat: number) => {
    const delta = (baseLat - lat) * 3500;
    return Math.max(40, Math.min(mapHeight - 40, mapHeight / 2 + delta));
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

  return (
    <View style={[styles.container, { height: mapHeight }]}>
      {/* 1. Nền buồng lái số cao cấp (Dark Cockpit Grid - Native View thuần túy) */}
      <View style={StyleSheet.absoluteFill}>
        {/* Lưới tọa độ bản đồ buồng lái */}
        <View style={styles.gridOverlay}>
          <View style={[styles.gridLineH, { top: mapHeight * 0.25 }]} />
          <View style={[styles.gridLineH, { top: mapHeight * 0.5 }]} />
          <View style={[styles.gridLineH, { top: mapHeight * 0.75 }]} />
          <View style={[styles.gridLineV, { left: mapWidth * 0.25 }]} />
          <View style={[styles.gridLineV, { left: mapWidth * 0.5 }]} />
          <View style={[styles.gridLineV, { left: mapWidth * 0.75 }]} />

          {/* Vòng tròn định vị vệ tinh GPS */}
          <View
            style={[
              styles.radarRing,
              {
                width: mapHeight * 0.7,
                height: mapHeight * 0.7,
                borderRadius: (mapHeight * 0.7) / 2,
                left: (mapWidth - mapHeight * 0.7) / 2,
                top: mapHeight * 0.15,
              },
            ]}
          />
          <View
            style={[
              styles.radarRing,
              {
                width: mapHeight * 0.4,
                height: mapHeight * 0.4,
                borderRadius: (mapHeight * 0.4) / 2,
                left: (mapWidth - mapHeight * 0.4) / 2,
                top: mapHeight * 0.3,
              },
            ]}
          />

          {/* Kim quét Radar xoay động */}
          <Animated.View
            style={[
              styles.radarArm,
              {
                width: mapHeight * 0.35,
                left: mapWidth / 2,
                top: mapHeight / 2,
              },
              animatedRadarStyle,
            ]}
          />
        </View>

        {/* Tuyến đường mô phỏng hiển thị trên Native */}
        {showRoute && points.length >= 2 && (
          <View
            style={[
              styles.routeLine,
              {
                left: Math.min(pickupX, dropX),
                top: Math.min(pickupY, dropY),
                width: Math.max(4, Math.abs(dropX - pickupX)),
                height: Math.max(4, Math.abs(dropY - pickupY)),
                borderColor: routeColor,
              },
            ]}
          />
        )}
      </View>

      {/* 2. Xe mô phỏng xung quanh */}
      {showNearbyDrivers && (
        <>
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

      {/* 3. Marker điểm đón của tài xế */}
      <View style={[styles.markerContainer, { left: pickupX - 22, top: pickupY - 40 }]}>
        <Animated.View style={[styles.pulseCircle, animatedPulseStyle]} />
        <View style={styles.pickupPin}>
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.markerBadge}>
          <Text style={styles.markerText} numberOfLines={1}>
            {pickupPoint.label || 'Vị trí của bạn'}
          </Text>
        </View>
      </View>

      {/* 4. Marker điểm đến nếu có */}
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

      {/* 5. Khối điều khiển bản đồ nổi (GPS Status, Recenter) */}
      {interactive && (
        <View style={styles.topMapControls} pointerEvents="box-none">
          <View style={styles.gpsStatusBadge}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>GPS Radar Buồng Lái • Trực Tuyến</Text>
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
    backgroundColor: '#0A0F1D',
    overflow: 'hidden',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
  radarRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  radarArm: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    transformOrigin: 'left center',
  },
  routeLine: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
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
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
    top: -4,
    left: -4,
  },
  pickupPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#10B981',
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
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
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
    color: '#E2E8F0',
  },
  recenterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
