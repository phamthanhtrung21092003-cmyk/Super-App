import React from 'react';
import { Stack } from 'expo-router';

export default function PartnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register-type" />
      <Stack.Screen name="verify-docs" />
      <Stack.Screen name="pending" />
    </Stack>
  );
}
