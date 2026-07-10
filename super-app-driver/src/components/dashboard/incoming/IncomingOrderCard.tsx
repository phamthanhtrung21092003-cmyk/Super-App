import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function IncomingOrderCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerSection} />
      <View style={styles.routeSection} />
      <View style={styles.paymentSection} />
      <View style={styles.priceSection} />
      <View style={styles.bottomSection} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
  },
  headerSection: {
    width: '100%',
  },
  routeSection: {
    width: '100%',
    marginTop: 16,
  },
  paymentSection: {
    width: '100%',
    marginTop: 16,
  },
  priceSection: {
    width: '100%',
    marginTop: 16,
  },
  bottomSection: {
    width: '100%',
    marginTop: 16,
  },
});
