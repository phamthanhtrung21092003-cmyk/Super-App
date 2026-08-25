import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TravelTabType = 'explore' | 'search' | 'itinerary' | 'community' | 'profile';

interface TravelBottomNavProps {
  activeTab: TravelTabType;
}

const TABS: { id: TravelTabType; label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { id: 'explore', label: 'Khám phá', icon: 'compass', route: '/travel' },
  { id: 'search', label: 'Tìm kiếm', icon: 'search', route: '/travel/search' },
  { id: 'itinerary', label: 'Lịch trình', icon: 'calendar', route: '/travel/itinerary' },
  { id: 'community', label: 'Cộng đồng', icon: 'people', route: '/travel/community' },
  { id: 'profile', label: 'Hồ sơ', icon: 'person', route: '/travel/profile' },
];

export const TravelBottomNav: React.FC<TravelBottomNavProps> = ({ activeTab }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleTabPress = (tab: typeof TABS[0]) => {
    if (tab.id === activeTab) return;
    router.replace(tab.route as any);
  };

  return (
    <View
      style={[
        styles.bottomNav,
        { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10) },
      ]}
    >
      {TABS.map(tab => {
        const isActive = tab.id === activeTab;
        const iconName = isActive ? tab.icon : (`${tab.icon}-outline` as keyof typeof Ionicons.glyphMap);

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.75}
          >
            {isActive && <View style={styles.navActiveIndicator} />}
            <Ionicons
              name={iconName}
              size={22}
              color={isActive ? '#0284C7' : '#64748B'}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
    paddingVertical: 2,
  },
  navActiveIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0284C7',
  },
  navLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
});
