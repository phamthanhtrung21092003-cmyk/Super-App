import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const PREVIEW_DRIVER = {
  name: 'Nguyễn Văn A',
  rating: '4.98',
  id: 'DR000000',
};

export default function DriverInformation() {
  return (
    <View style={styles.container} accessible={false}>
      <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail" accessible={false}>
        {PREVIEW_DRIVER.name}
      </Text>
      <View style={styles.ratingRow} accessible={false}>
        <Text style={styles.ratingText} accessible={false}>
          ⭐ {PREVIEW_DRIVER.rating}
        </Text>
        <Text style={styles.dividerText} accessible={false}>
          •
        </Text>
        <Text style={styles.idText} accessible={false}>
          Mã TX: {PREVIEW_DRIVER.id}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  dividerText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  idText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },
});
