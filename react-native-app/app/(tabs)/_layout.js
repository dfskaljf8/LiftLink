/**
 * Main Tabs Layout
 * Cartoonish animated bottom tab navigation
 */

import { Tabs } from 'expo-router';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Custom tab bar icons with cartoonish style
const TabIcon = ({ name, focused, color }) => {
  const icons = {
    home: (
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Path
          d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z"
          fill={focused ? '#6366f1' : '#64748b'}
          stroke={focused ? '#818cf8' : 'transparent'}
          strokeWidth="1"
        />
        {focused && <Circle cx="12" cy="10" r="2" fill="#fcd34d" />}
      </Svg>
    ),
    trainers: (
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Circle cx="12" cy="8" r="4" fill={focused ? '#10b981' : '#64748b'} />
        <Path
          d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20"
          stroke={focused ? '#10b981' : '#64748b'}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {focused && (
          <>
            <Circle cx="6" cy="10" r="2" fill="#10b981" opacity="0.5" />
            <Circle cx="18" cy="10" r="2" fill="#10b981" opacity="0.5" />
          </>
        )}
      </Svg>
    ),
    fitness: (
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Rect x="3" y="10" width="4" height="8" rx="1" fill={focused ? '#ef4444' : '#64748b'} />
        <Rect x="17" y="10" width="4" height="8" rx="1" fill={focused ? '#ef4444' : '#64748b'} />
        <Rect x="7" y="11" width="10" height="6" rx="1" fill={focused ? '#f87171' : '#94a3b8'} />
        {focused && (
          <>
            <Circle cx="5" cy="8" r="2" fill="#fcd34d" />
            <Circle cx="19" cy="8" r="2" fill="#fcd34d" />
          </>
        )}
      </Svg>
    ),
    tree: (
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Path
          d="M12 2L6 10H9L5 18H10V22H14V18H19L15 10H18L12 2Z"
          fill={focused ? '#22c55e' : '#64748b'}
        />
        <Rect x="11" y="18" width="2" height="4" fill={focused ? '#a16207' : '#64748b'} />
        {focused && (
          <>
            <Circle cx="9" cy="8" r="1" fill="#fcd34d" />
            <Circle cx="14" cy="10" r="1" fill="#fcd34d" />
            <Circle cx="11" cy="13" r="1" fill="#fcd34d" />
          </>
        )}
      </Svg>
    ),
    sessions: (
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Rect x="4" y="5" width="16" height="16" rx="3" fill={focused ? '#8b5cf6' : '#64748b'} />
        <Rect x="8" y="2" width="2" height="5" rx="1" fill={focused ? '#a78bfa' : '#94a3b8'} />
        <Rect x="14" y="2" width="2" height="5" rx="1" fill={focused ? '#a78bfa' : '#94a3b8'} />
        <Rect x="7" y="10" width="10" height="2" rx="1" fill="white" opacity="0.5" />
        <Rect x="7" y="14" width="6" height="2" rx="1" fill="white" opacity="0.5" />
        {focused && <Circle cx="16" cy="15" r="2" fill="#fcd34d" />}
      </Svg>
    ),
    settings: (
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Path
          d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
          fill={focused ? '#f59e0b' : '#64748b'}
        />
        <Path
          d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.85 14.52C2.67 14.66 2.62 14.93 2.73 15.13L4.65 18.45C4.77 18.67 5.02 18.74 5.24 18.67L7.63 17.71C8.13 18.09 8.66 18.41 9.25 18.65L9.61 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94Z"
          stroke={focused ? '#f59e0b' : '#64748b'}
          strokeWidth="1.5"
          fill="none"
        />
        {focused && (
          <>
            <Circle cx="12" cy="12" r="2" fill="white" opacity="0.5" />
          </>
        )}
      </Svg>
    ),
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      {icons[name]}
      {focused && <View style={[styles.focusDot, { backgroundColor: getColorForTab(name) }]} />}
    </View>
  );
};

const getColorForTab = (name) => {
  const colors = {
    home: '#6366f1',
    trainers: '#10b981',
    fitness: '#ef4444',
    tree: '#22c55e',
    sessions: '#8b5cf6',
    settings: '#f59e0b',
  };
  return colors[name] || '#6366f1';
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: '#fff',
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
          title: 'Tree',
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
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 20,
    paddingTop: 10,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  focusDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
