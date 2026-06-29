import { Stack } from 'expo-router';

export default function TravelLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="destination" />
      <Stack.Screen name="itinerary" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="community" />
      <Stack.Screen name="diary" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
