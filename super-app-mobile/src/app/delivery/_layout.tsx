import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function DeliveryLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: '#F8FAFC' }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="create" />
        <Stack.Screen name="package" />
        <Stack.Screen name="service" />
        <Stack.Screen name="tracking" />
      </Stack>
    </>
  );
}
