import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function BodyContainer() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
});
