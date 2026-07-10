import React from 'react';
import { StyleSheet, View } from 'react-native';
import OnlineSwitch from './OnlineSwitch';
import OnlineStatus from './OnlineStatus';
import OnlineDuration from './OnlineDuration';
import ServiceSelection from './ServiceSelection';
import GPSWarningBanner from './GPSWarningBanner';
import InternetWarningBanner from './InternetWarningBanner';

export default function OnlineCard() {
  const sampleServices = [
    { id: 'ride', title: 'Chở khách', selected: true },
    { id: 'delivery', title: 'Giao hàng', selected: true },
    { id: 'food', title: 'Giao đồ ăn', selected: false },
  ];

  const showGpsWarning = false;
  const showInternetWarning = false;

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <OnlineSwitch />
        <OnlineStatus />
        <OnlineDuration />
        <ServiceSelection services={sampleServices} />
        {showGpsWarning && <GPSWarningBanner message="Cần bật GPS để nhận chuyến" />}
        {showInternetWarning && <InternetWarningBanner message="Không có kết nối Internet" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  topSection: {
    width: '100%',
  },
});
