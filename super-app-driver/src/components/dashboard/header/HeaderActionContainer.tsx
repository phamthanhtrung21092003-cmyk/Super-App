import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function HeaderActionContainer() {
  return (
    <View style={styles.container}>
      <View style={styles.actionItem} />
      <View style={styles.actionItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
});
