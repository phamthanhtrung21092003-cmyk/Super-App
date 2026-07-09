import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HotlineButton() {
  return (
    <View style={styles.container} accessible={false}>
      <MaterialIcons name="support-agent" size={24} color="#2563EB" accessible={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
