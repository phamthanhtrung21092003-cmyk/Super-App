import React from 'react';
import { StyleSheet, View } from 'react-native';
import IncomingOrderCard from './incoming/IncomingOrderCard';

export default function BodyContainer() {
  const showIncomingOrder = false;

  return (
    <View style={styles.container}>
      {showIncomingOrder && <IncomingOrderCard />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
});
