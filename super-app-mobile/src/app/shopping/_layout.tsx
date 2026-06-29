import { Stack } from 'expo-router';

export default function ShoppingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="product" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="live" />
      <Stack.Screen name="shorts" />
      <Stack.Screen name="seller" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="brand" />
    </Stack>
  );
}
