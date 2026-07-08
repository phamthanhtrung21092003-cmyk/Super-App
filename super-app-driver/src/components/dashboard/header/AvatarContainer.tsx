import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function AvatarContainer() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
});
