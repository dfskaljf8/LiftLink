/**
 * Custom Illustrations - LiftLink Design System
 * Dark theme with lime/neon green accents
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { 
  Path, Circle, Rect, G, Defs, LinearGradient, Stop, 
  Ellipse, Line
} from 'react-native-svg';
import Animated, { 
  useSharedValue, useAnimatedStyle, withRepeat, 
  withTiming, withSequence, withSpring,
  Easing
} from 'react-native-reanimated';

// Brand Colors
export const COLORS = {
  background: '#000000',
  surface: '#111111',
  surfaceLight: '#1a1a1a',
  primary: '#ADFF00', // Lime/neon green
  primaryDark: '#8BC700',
  text: '#FFFFFF',
  textSecondary: '#888888',
  border: '#333333',
  error: '#FF4444',
  success: '#00FF88',
};

// ==================== LIFTLINK LOGO ====================
export const LiftLinkLogo = ({ size = 60 }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    <Defs>
      <LinearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ADFF00" />
        <Stop offset="100%" stopColor="#8BC700" />
      </LinearGradient>
    </Defs>
    {/* Dumbbell icon stylized */}
    <G>
      {/* Center bar */}
      <Rect x="20" y="27" width="20" height="6" rx="3" fill="url(#logoGrad)" />
      {/* Left weight */}
      <Rect x="8" y="20" width="14" height="20" rx="3" fill="url(#logoGrad)" />
      <Line x1="15" y1="22" x2="15" y2="38" stroke="#000" strokeWidth="2" opacity="0.2" />
      {/* Right weight */}
      <Rect x="38" y="20" width="14" height="20" rx="3" fill="url(#logoGrad)" />
      <Line x1="45" y1="22" x2="45" y2="38" stroke="#000" strokeWidth="2" opacity="0.2" />
    </G>
  </Svg>
);

// ==================== MASCOT (Simplified, Modern) ====================
export const LiftLinkMascot = ({ size = 120 }) => {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, animStyle]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="mascotBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#ADFF00" />
            <Stop offset="100%" stopColor="#8BC700" />
          </LinearGradient>
        </Defs>

        {/* Body - Simple circle */}
        <Circle cx="60" cy="65" r="35" fill="url(#mascotBody)" />
        
        {/* Face plate */}
        <Circle cx="60" cy="55" r="25" fill="#111" />
        
        {/* Eyes */}
        <Circle cx="50" cy="52" r="5" fill="#ADFF00" />
        <Circle cx="70" cy="52" r="5" fill="#ADFF00" />
        <Circle cx="51" cy="51" r="2" fill="#fff" />
        <Circle cx="71" cy="51" r="2" fill="#fff" />
        
        {/* Smile */}
        <Path
          d="M 48 62 Q 60 72 72 62"
          stroke="#ADFF00"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Arms holding dumbbells */}
        {/* Left arm */}
        <Path
          d="M 30 60 L 15 50"
          stroke="url(#mascotBody)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Left dumbbell */}
        <Rect x="5" y="42" width="16" height="6" rx="2" fill="#666" />
        <Rect x="3" y="38" width="5" height="14" rx="2" fill="#888" />
        <Rect x="18" y="38" width="5" height="14" rx="2" fill="#888" />

        {/* Right arm */}
        <Path
          d="M 90 60 L 105 50"
          stroke="url(#mascotBody)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Right dumbbell */}
        <Rect x="99" y="42" width="16" height="6" rx="2" fill="#666" />
        <Rect x="97" y="38" width="5" height="14" rx="2" fill="#888" />
        <Rect x="112" y="38" width="5" height="14" rx="2" fill="#888" />

        {/* Legs */}
        <Rect x="48" y="95" width="10" height="15" rx="5" fill="url(#mascotBody)" />
        <Rect x="62" y="95" width="10" height="15" rx="5" fill="url(#mascotBody)" />
      </Svg>
    </Animated.View>
  );
};

// ==================== ICONS ====================
export const UserIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

export const LockIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <Circle cx="12" cy="16" r="1.5" fill={color} />
  </Svg>
);

export const EmailIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M3 7L12 13L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

export const GoogleIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

export const AppleIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      fill={color}
    />
  </Svg>
);

export const HomeIcon = ({ size = 24, color = '#ADFF00', filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 2}
    />
  </Svg>
);

export const SearchPersonIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="10" cy="8" r="3" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M4 18C4 15 7 13 10 13" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <Circle cx="17" cy="17" r="4" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M20 20L22 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const LocationIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <Circle cx="12" cy="9" r="2.5" fill={color} />
  </Svg>
);

export const DumbbellIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="6" y="9" width="12" height="6" rx="1" fill={color} opacity="0.7" />
    <Rect x="2" y="7" width="5" height="10" rx="1" fill={color} />
    <Rect x="17" y="7" width="5" height="10" rx="1" fill={color} />
  </Svg>
);

export const CalendarIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" />
    <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const StarIcon = ({ size = 16, color = '#ADFF00', filled = true }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="2"
    />
  </Svg>
);

export const ChatIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21 11.5C21 16.19 16.97 20 12 20C10.64 20 9.34 19.75 8.14 19.29L3 21L4.71 16.86C3.64 15.36 3 13.5 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

export const TrophyIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 15C15 15 17 12 17 8V4H7V8C7 12 9 15 12 15Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <Path d="M7 4H4V8C4 10 5 11 7 11" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M17 4H20V8C20 10 19 11 17 11" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 15V18" stroke={color} strokeWidth="2" />
    <Path d="M8 21H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M9 18H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const FireIcon = ({ size = 24, color = '#ADFF00' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 22C8 22 5 18.5 5 15C5 11.5 7 9 9 7C9 9 10 10 12 10C12 7 11 4 14 2C14 5 17 7 17 11C19 11 19 14 19 15C19 18.5 16 22 12 22Z"
      fill={color}
    />
  </Svg>
);

const styles = StyleSheet.create({});
