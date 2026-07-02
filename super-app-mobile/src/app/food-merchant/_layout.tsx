import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useWindowDimensions, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';

export default function FoodMerchantLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const accentColor = '#F97316'; // Orange Dark Theme
  const bgColor = '#020617';

  return (
    <View style={{ flex: 1, backgroundColor: bgColor, ...(isDesktop && { alignItems: 'center', justifyContent: 'center' }) }}>
      <View style={{ flex: 1, width: '100%', ...(isDesktop && { maxWidth: 414, maxHeight: 896, borderWidth: 10, borderColor: '#111', borderRadius: 55, overflow: 'hidden' }) }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: accentColor,
            tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
            tabBarStyle: {
              backgroundColor: 'rgba(2, 6, 23, 0.95)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.05)',
              paddingBottom: Platform.OS === 'ios' ? 25 : 10,
              paddingTop: 10,
              height: Platform.OS === 'ios' ? 85 : 70,
              position: 'absolute',
            },
            tabBarBackground: () => (
              <BlurView tint="dark" intensity={90} style={{ flex: 1 }} />
            ),
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Tổng quan',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="pie-chart" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: 'Đơn hàng',
              tabBarIcon: ({ color, size }) => (
                <View>
                  <Ionicons name="receipt" size={size} color={color} />
                  {/* Badge */}
                  <View style={{ position: 'absolute', top: -4, right: -6, backgroundColor: '#EF4444', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>2</Text>
                  </View>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="menu"
            options={{
              title: 'Thực đơn',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="fast-food" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="more"
            options={{
              title: 'Mở rộng',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="grid" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
