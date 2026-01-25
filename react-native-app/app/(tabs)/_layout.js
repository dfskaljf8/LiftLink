/**
 * Main Tabs Layout
 * Duolingo-style: Clean, minimal bottom navigation
 */

import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

// Clean, modern tab icons
const TabIcon = ({ name, focused }) => {
  const activeColor = '#6366f1';
  const inactiveColor = '#64748b';
  const color = focused ? activeColor : inactiveColor;

  const icons = {
    home: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
          fill={color}
        />
      </Svg>
    ),
    trainers: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Circle cx="12" cy="8" r="4" fill={color} />
        <Path
          d="M12 14C7.58 14 4 15.79 4 18V20H20V18C20 15.79 16.42 14 12 14Z"
          fill={color}
        />
      </Svg>
    ),
    fitness: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z"
          fill={color}
        />
      </Svg>
    ),
    tree: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          d="M12 2L6 9H9L4 17H11V22H13V17H20L15 9H18L12 2Z"
          fill={color}
        />
      </Svg>
    ),
    sessions: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM9 17H7V10H9V17ZM13 17H11V13H13V17ZM17 17H15V11H17V17Z"
          fill={color}
        />
      </Svg>
    ),
    settings: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z"
          fill={color}
        />
      </Svg>
    ),
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      {icons[name]}
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trainers"
        options={{
          title: 'Trainers',
          tabBarIcon: ({ focused }) => <TabIcon name="trainers" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="fitness"
        options={{
          title: 'Fitness',
          tabBarIcon: ({ focused }) => <TabIcon name="fitness" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          title: 'Growth',
          tabBarIcon: ({ focused }) => <TabIcon name="tree" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ focused }) => <TabIcon name="sessions" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
  },
  iconContainerActive: {
    // Active state styling if needed
  },
});
