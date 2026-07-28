import { Stack, useRouter } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider, useUser } from '../context/UserContext';
import { ShoppingProvider } from '../context/ShoppingContext';
import { EducationProvider } from '../context/EducationContext';
import { CinemaProvider } from '../context/CinemaContext';
import React, { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Tự động ẩn Splash Screen ngay khi ứng dụng đã sẵn sàng
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppNavigation() {
  const { isLoggedIn } = useUser();
  const router = useRouter();
  const isFirstRender = useRef(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

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

import { WalletSecurityProvider } from '../context/WalletSecurityContext';
import { WalletActivationProvider } from '../context/WalletActivationContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <WalletSecurityProvider>
          <WalletActivationProvider>
            <ShoppingProvider>
              <EducationProvider>
                <CinemaProvider>
                  <AppNavigation />
                </CinemaProvider>
              </EducationProvider>
            </ShoppingProvider>
          </WalletActivationProvider>
        </WalletSecurityProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
