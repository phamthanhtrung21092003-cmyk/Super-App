import { Stack } from 'expo-router';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';

export default function ShoppingLayout() {
  const { width } = useWindowDimensions();
  const isMobileUA = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isDesktop = Platform.OS === 'web' && width > 768 && !isMobileUA;

  return (
    <View style={[S.webWrapper, !isDesktop && S.mobileFullWrapper]}>
      {Platform.OS === 'web' && (
        <style>{`
          html, body, #root, #root > div {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            background-color: #F8FAFC !important;
          }
        `}</style>
      )}
      <View style={[S.container, isDesktop && S.desktopFrame]}>
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
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  mobileFullWrapper: {
    alignItems: 'stretch',
    justifyContent: 'stretch',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  desktopFrame: {
    width: 414,
    maxWidth: 414,
    maxHeight: 896,
    height: '100%',
    borderWidth: 10,
    borderColor: '#0F172A',
    borderRadius: 45,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    ...(Platform.OS === 'web' && { marginVertical: 20 }),
  },
});
