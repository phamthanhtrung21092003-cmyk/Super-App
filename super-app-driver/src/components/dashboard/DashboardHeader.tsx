import React from 'react';
import { StyleSheet, View } from 'react-native';
import DriverAvatarContainer from './header/DriverAvatarContainer';
import DriverInfoContainer from './header/DriverInfoContainer';
import HeaderActionContainer from './header/HeaderActionContainer';

export default function DashboardHeader() {
  return (
    <View style={styles.container}>
      <DriverAvatarContainer />
      <DriverInfoContainer />
      <HeaderActionContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
});
