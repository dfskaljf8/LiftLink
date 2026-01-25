/**
 * Main Tabs Layout
 * Dark theme with lime green accent navigation
 */

import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import {
  COLORS,
  HomeIcon,
  SearchPersonIcon,
  DumbbellIcon,
  CalendarIcon,
  UserIcon,
} from '../../src/components/CustomIllustrations';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Tab Icons
const TabHomeIcon = ({ focused }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
      fill={focused ? COLORS.primary : '#666'}
    />
  </Svg>
);

const TabSearchIcon = ({ focused }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx="10" cy="8" r="3" stroke={focused ? COLORS.primary : '#666'} strokeWidth="2" fill="none" />
    <Path d="M4 18C4 15 7 13 10 13" stroke={focused ? COLORS.primary : '#666'} strokeWidth="2" fill="none" />
    <Circle cx="17" cy="17" r="4" stroke={focused ? COLORS.primary : '#666'} strokeWidth="2" fill="none" />
    <Path d="M20 20L22 22" stroke={focused ? COLORS.primary : '#666'} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TabLocationIcon = ({ focused }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
      stroke={focused ? COLORS.primary : '#666'}
      strokeWidth="2"
      fill={focused ? COLORS.primary : 'none'}
    />
    {!focused && <Circle cx="12" cy="9" r="2.5" fill="#666" />}
  </Svg>
);

const TabCalendarIcon = ({ focused }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={focused ? COLORS.primary : '#666'} strokeWidth="2" fill="none" />
    <Path d="M3 10H21" stroke={focused ? COLORS.primary : '#666'} strokeWidth="2" />
    <Path d="M8 2V6" stroke={focused ? COLORS.primary : '#666'} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 2V6" stroke={focused ? COLORS.primary : '#666'} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TabProfileIcon = ({ focused }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx="12" cy="8" r="4" stroke={focused ? COLORS.primary : '#666'} strokeWidth="2" fill={focused ? COLORS.primary : 'none'} />
    <Path
      d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20"
      stroke={focused ? COLORS.primary : '#666'}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabHomeIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trainers"
        options={{
          title: 'Find',
          tabBarIcon: ({ focused }) => <TabSearchIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="fitness"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => <TabLocationIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ focused }) => <TabCalendarIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabProfileIcon focused={focused} />,
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen
        name="tree"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
