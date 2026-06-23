import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';
import { ShoppingProvider } from '../context/ShoppingContext';
import { EducationProvider } from '../context/EducationContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ShoppingProvider>
          <EducationProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="social" />
              <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
            </Stack>
          </EducationProvider>
        </ShoppingProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
