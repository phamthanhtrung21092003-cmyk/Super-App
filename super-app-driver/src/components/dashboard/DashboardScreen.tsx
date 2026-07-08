import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import DashboardHeader from './DashboardHeader';
import BodyContainer from './BodyContainer';
import BottomNavigationContainer from './BottomNavigationContainer';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader />
      <BodyContainer />
      <BottomNavigationContainer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8FAFC',
  },
});
