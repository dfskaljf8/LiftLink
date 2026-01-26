/**
 * Main Tabs Layout - Futuristic 2050 Design
 * Floating glass navigation with glow effects
 */

import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
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
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <View style={styles.tabBarGlow} />
          </View>
        ),
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
          title: 'Map',
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
      {/* Hidden tabs */}
      <Tabs.Screen
        name="tree"
        options={{
          href: null,
        }}
      />
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
    backgroundColor: `${FUTURE_COLORS.surface}F0`,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    paddingBottom: 8,
    paddingTop: 8,
    // Glass effect shadow
    shadowColor: FUTURE_COLORS.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  tabBarGlow: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 4,
    backgroundColor: FUTURE_COLORS.primary,
    borderRadius: 2,
    opacity: 0.5,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
