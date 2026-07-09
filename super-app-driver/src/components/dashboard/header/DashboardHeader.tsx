import React from 'react';
import { StyleSheet, View } from 'react-native';
import DriverAvatar from './DriverAvatar';
import DriverInformation from './DriverInformation';
import NotificationButton from './NotificationButton';
import HotlineButton from './HotlineButton';

export default function DashboardHeader() {
  return (
    <View style={styles.container} accessible={false}>
      <View style={styles.leftSection} accessible={false}>
        <DriverAvatar />
      </View>
      <View style={styles.centerSection} accessible={false}>
        <DriverInformation />
      </View>
      <View style={styles.rightSection} accessible={false}>
        <View style={styles.notificationWrapper} accessible={false}>
          <NotificationButton />
        </View>
        <HotlineButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
    elevation: 2,
  },
  leftSection: {
    marginRight: 12,
  },
  centerSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationWrapper: {
    marginRight: 12,
  },
});
