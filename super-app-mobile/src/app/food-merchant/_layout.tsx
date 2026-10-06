import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useWindowDimensions, View, Text, StyleSheet } from 'react-native';
import { FoodMerchantProvider, useFoodMerchant } from '../../context/FoodMerchantContext';

function MerchantTabNavigator() {
  const { newOrdersCount, isAlarming, isOffline } = useFoodMerchant();
  const primaryColor = '#0066FF'; // V-Life Blue
  const inactiveColor = '#64748B';

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Banner cảnh báo mất kết nối nếu có */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={16} color="#FFF" />
          <Text style={styles.offlineText}>Mất kết nối máy chủ — Đang tự động kết nối lại...</Text>
        </View>
      )}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: primaryColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: -2,
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 84 : 64,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tổng quan',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Đơn hàng',
            tabBarIcon: ({ color, size, focused }) => (
              <View>
                <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
                {newOrdersCount > 0 && (
                  <View
                    style={[
                      styles.orderBadge,
                      { backgroundColor: isAlarming ? '#EF4444' : '#F59E0B' },
                    ]}
                  >
                    <Text style={styles.orderBadgeText}>
                      {newOrdersCount > 99 ? '99+' : newOrdersCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Thực đơn',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'fast-food' : 'fast-food-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="financials"
          options={{
            title: 'Tài chính',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Quán ăn',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={size} color={color} />
            ),
          }}
        />
        {/* Ẩn route more cũ nếu còn file */}
        <Tabs.Screen
          name="more"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}

export default function FoodMerchantLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  return (
    <FoodMerchantProvider>
      <View style={{ flex: 1, backgroundColor: '#F1F5F9', ...(isDesktop && { alignItems: 'center', justifyContent: 'center' }) }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: '#FFFFFF',
            ...(isDesktop && {
              maxWidth: 430,
              maxHeight: 932,
              borderRadius: 36,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              borderWidth: 8,
              borderColor: '#E2E8F0',
            }),
          }}
        >
          <MerchantTabNavigator />
        </View>
      </View>
    </FoodMerchantProvider>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  orderBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
