import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MerchantMore() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tính năng mở rộng (Kho, Tài chính... - Đang phát triển)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFF', fontSize: 16 }
});
