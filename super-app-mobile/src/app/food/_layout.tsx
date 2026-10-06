import { Stack } from 'expo-router';

export default function FoodLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // We will build custom headers for premium look
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="list" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="orders/[id]" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
    </Stack>
  );
}
