import { Stack } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { ShoppingProvider } from '../context/ShoppingContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <ShoppingProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="social" />
        </Stack>
      </ShoppingProvider>
    </UserProvider>
  );
}
