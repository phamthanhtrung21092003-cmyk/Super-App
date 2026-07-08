import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function RatingContainer() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
  },
});
