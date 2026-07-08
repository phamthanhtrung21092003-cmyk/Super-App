import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function DriverInfoContainer() {
  return (
    <View style={styles.container}>
      <View style={styles.namePlaceholder} />
      <View style={styles.idPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
  },
  namePlaceholder: {
    width: 120,
    height: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  idPlaceholder: {
    width: 80,
    height: 12,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
  },
});
