import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function OnlineDuration() {
  return (
    <View style={styles.container}>
      <Text style={styles.durationText}>Đã trực tuyến hôm nay 2 giờ 15 phút</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    width: '100%',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#9CA3AF',
  },
});
