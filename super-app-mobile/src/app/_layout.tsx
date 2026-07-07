import { Stack, useRouter } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider, useUser } from '../context/UserContext';
import { ShoppingProvider } from '../context/ShoppingContext';
import { EducationProvider } from '../context/EducationContext';
import React, { useEffect, useRef } from 'react';

function AppNavigation() {
  const { isLoggedIn } = useUser();
  const router = useRouter();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isLoggedIn) {
      // Sử dụng API chính thức của Expo Router để điều hướng về Login
      router.replace('/');
    }
  }, [isLoggedIn]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="social" />
      <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ShoppingProvider>
          <EducationProvider>
            <AppNavigation />
          </EducationProvider>
        </ShoppingProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
