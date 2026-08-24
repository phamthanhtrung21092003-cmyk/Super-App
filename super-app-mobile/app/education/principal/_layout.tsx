import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const T = {
  primary: '#0F172A',
  bg: '#F8FAFC',
  border: '#E2E8F0',
  principal: '#6366F1'
};

export default function PrincipalLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: T.principal,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: T.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color }) => <Ionicons name="pie-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage-school"
        options={{
          title: 'Quản lý Trường',
          tabBarIcon: ({ color }) => <Ionicons name="business" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="linking"
        options={{
          title: 'Liên kết ID',
          tabBarIcon: ({ color }) => <Ionicons name="link" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
