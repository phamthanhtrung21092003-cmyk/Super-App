import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function BottomNavigationContainer() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    minHeight: 80,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
