/**
 * Main Tabs Layout - Futuristic 2050 Design
 * Simplified for stability
 */

import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import {
  FUTURE_COLORS,
  FutureHomeIcon,
  FutureSearchIcon,
  FutureMapIcon,
  FutureCalendarIcon,
  FutureProfileIcon,
} from '../../src/components/FuturisticUI';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: FUTURE_COLORS.primary,
        tabBarInactiveTintColor: FUTURE_COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <FutureHomeIcon focused={focused} size={24} />,
        }}
      />
      <Tabs.Screen
        name="trainers"
        options={{
          title: 'Find',
          tabBarIcon: ({ focused }) => <FutureSearchIcon focused={focused} size={24} />,
        }}
      />
      <Tabs.Screen
        name="fitness"
        options={{
          title: 'Fitness',
          tabBarIcon: ({ focused }) => <FutureMapIcon focused={focused} size={24} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ focused }) => <FutureCalendarIcon focused={focused} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <FutureProfileIcon focused={focused} size={24} />,
        }}
      />
      <Tabs.Screen name="tree" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 12,
    left: 16,
    right: 16,
    height: 70,
    borderRadius: 24,
    backgroundColor: FUTURE_COLORS.surface,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 10,
    shadowColor: FUTURE_COLORS.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
