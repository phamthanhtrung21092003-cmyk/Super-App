import React from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';

export default function OnlineSwitch() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhận chuyến</Text>
      <Switch
        value={false}
        disabled={true}
        trackColor={{ false: '#D1D5DB', true: '#22C55E' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
    color: '#111827',
  },
});
