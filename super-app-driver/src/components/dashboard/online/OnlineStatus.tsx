import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function OnlineStatus() {
  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Đã tắt nhận chuyến</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    width: '100%',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#6B7280',
  },
});
