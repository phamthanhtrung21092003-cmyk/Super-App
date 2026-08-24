import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MerchantMenu() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quản lý Thực đơn (Đang phát triển - Phase 2)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFF', fontSize: 16 }
});
