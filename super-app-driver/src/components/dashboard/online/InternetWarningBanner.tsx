import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface InternetWarningBannerProps {
  message: string;
}

export default function InternetWarningBanner({ message }: InternetWarningBannerProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="wifi-off" size={20} color="#DC2626" style={styles.icon} />
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#991B1B',
  },
});
