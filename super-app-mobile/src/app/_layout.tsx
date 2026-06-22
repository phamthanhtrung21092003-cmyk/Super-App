import { Stack } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { ShoppingProvider } from '../context/ShoppingContext';
import { EducationProvider } from '../context/EducationContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <ShoppingProvider>
        <EducationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="social" />
          </Stack>
        </EducationProvider>
      </ShoppingProvider>
    </UserProvider>
  );
}
