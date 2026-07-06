import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  color?: string; // hex color for marker
  icon?: 'pin' | 'car' | 'flag' | 'location';
}

interface WebMapProps {
  points: MapPoint[];
  showRoute?: boolean;
  routeColor?: string;
  height?: number;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

export default function WebMap({
  points,
  showRoute = true,
  routeColor = '#3B82F6',
  height = 280,
  centerLat,
  centerLng,
  zoom = 14,
}: WebMapProps) {
  if (Platform.OS !== 'web') {
    return <View style={[styles.fallback, { height }]} />;
  }

  // Calculate center from points if not provided
  const cLat = centerLat ?? (points.reduce((s, p) => s + p.lat, 0) / points.length);
  const cLng = centerLng ?? (points.reduce((s, p) => s + p.lng, 0) / points.length);

  // Build markers JS
  const markersJS = points.map((p, i) => {
    const color = p.color || (i === 0 ? '#3B82F6' : '#EF4444');
    const label = p.label || `Điểm ${i + 1}`;
    const iconSvg = `
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:${color};border:3px solid #fff;
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:bold;font-size:14px;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      ">${i + 1}</div>
    `;
    return `
      L.marker([${p.lat}, ${p.lng}], {
        icon: L.divIcon({
          html: \`${iconSvg.replace(/\n/g, '')}\`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(map).bindPopup('${label.replace(/'/g, "\\'")}');
    `;
  }).join('\n');

  // Build route JS
  const routeJS = showRoute && points.length >= 2
    ? `L.polyline([${points.map(p => `[${p.lat}, ${p.lng}]`).join(',')}], {
        color: '${routeColor}', weight: 4, opacity: 0.8,
        dashArray: null, lineCap: 'round', lineJoin: 'round'
      }).addTo(map);`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .leaflet-control-attribution { font-size: 9px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${cLat}, ${cLng}], ${zoom});
    
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '© Google Maps'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    ${markersJS}
    ${routeJS}

    // Fit bounds to show all markers
    ${points.length >= 2 ? `
    var bounds = L.latLngBounds([${points.map(p => `[${p.lat}, ${p.lng}]`).join(',')}]);
    map.fitBounds(bounds, { padding: [40, 40] });
    ` : ''}
  </script>
</body>
</html>`;

  return (
    <View style={[styles.container, { height }]}>
      <iframe
        srcDoc={html}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 0,
        }}
        title="Map"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fallback: {
    width: '100%',
    backgroundColor: '#E8F0FE',
  },
});
