/**
 * Custom Illustrations - Duolingo-style clean graphics
 * Modern, friendly, professional - not childish
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { 
  Path, Circle, Rect, G, Defs, LinearGradient, Stop, 
  Ellipse, ClipPath
} from 'react-native-svg';
import Animated, { 
  useSharedValue, useAnimatedStyle, withRepeat, 
  withTiming, withSequence, withSpring, withDelay,
  Easing, interpolate
} from 'react-native-reanimated';

// ==================== LIFTLINK MASCOT (Duolingo-style) ====================
// A friendly, clean fitness character - think Duo owl but for fitness
export const LiftLinkMascot = ({ size = 120, expression = 'happy' }) => {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
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
          <LinearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#818cf8" />
            <Stop offset="100%" stopColor="#6366f1" />
          </LinearGradient>
          <LinearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#fef3c7" />
            <Stop offset="100%" stopColor="#fde68a" />
          </LinearGradient>
        </Defs>

        {/* Body - Clean rounded shape */}
        <Ellipse cx="60" cy="70" rx="38" ry="42" fill="url(#bodyGradient)" />
        
        {/* Body highlight */}
        <Ellipse cx="60" cy="65" rx="28" ry="30" fill="rgba(255,255,255,0.1)" />

        {/* Face */}
        <Circle cx="60" cy="45" r="32" fill="url(#faceGradient)" />

        {/* Eyes - Clean, expressive */}
        <G>
          {/* Left eye */}
          <Ellipse cx="48" cy="42" rx="7" ry="8" fill="#1e293b" />
          <Circle cx="50" cy="40" r="2.5" fill="white" />
          
          {/* Right eye */}
          <Ellipse cx="72" cy="42" rx="7" ry="8" fill="#1e293b" />
          <Circle cx="74" cy="40" r="2.5" fill="white" />
        </G>

        {/* Friendly smile */}
        <Path
          d="M 48 55 Q 60 65 72 55"
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Subtle blush */}
        <Ellipse cx="38" cy="50" rx="5" ry="3" fill="#fca5a5" opacity="0.4" />
        <Ellipse cx="82" cy="50" rx="5" ry="3" fill="#fca5a5" opacity="0.4" />

        {/* Arms with small dumbbells */}
        {/* Left arm */}
        <Path
          d="M 25 65 L 15 55"
          stroke="url(#bodyGradient)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Left dumbbell */}
        <Rect x="8" y="48" width="16" height="6" rx="3" fill="#64748b" />
        <Rect x="5" y="45" width="6" height="12" rx="2" fill="#475569" />
        <Rect x="21" y="45" width="6" height="12" rx="2" fill="#475569" />

        {/* Right arm */}
        <Path
          d="M 95 65 L 105 55"
          stroke="url(#bodyGradient)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Right dumbbell */}
        <Rect x="96" y="48" width="16" height="6" rx="3" fill="#64748b" />
        <Rect x="93" y="45" width="6" height="12" rx="2" fill="#475569" />
        <Rect x="109" y="45" width="6" height="12" rx="2" fill="#475569" />

        {/* Headband */}
        <Path
          d="M 30 30 Q 60 22 90 30"
          stroke="#10b981"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
};

// ==================== MINI MASCOT (For cards/headers) ====================
export const MiniMascot = ({ size = 40 }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <LinearGradient id="miniBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#818cf8" />
          <Stop offset="100%" stopColor="#6366f1" />
        </LinearGradient>
      </Defs>
      <Circle cx="20" cy="20" r="18" fill="url(#miniBg)" />
      <Circle cx="20" cy="16" r="10" fill="#fde68a" />
      <Circle cx="16" cy="14" r="2" fill="#1e293b" />
      <Circle cx="24" cy="14" r="2" fill="#1e293b" />
      <Path d="M 16 19 Q 20 23 24 19" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  </View>
);

// ==================== PROGRESS TREE (Clean, modern) ====================
export const ProgressTree = ({ stage = 'seed', size = 160 }) => {
  const sway = useSharedValue(0);

  const stages = {
    seed: { crown: 0, trunk: 15, color: '#a16207' },
    sprout: { crown: 20, trunk: 25, color: '#65a30d' },
    sapling: { crown: 35, trunk: 35, color: '#22c55e' },
    young_tree: { crown: 50, trunk: 45, color: '#16a34a' },
    mature_tree: { crown: 65, trunk: 55, color: '#15803d' },
  };

  const current = stages[stage] || stages.seed;

  useEffect(() => {
    if (current.crown > 0) {
      sway.value = withRepeat(
        withSequence(
          withTiming(2, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(-2, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [stage]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 160 160">
        <Defs>
          <LinearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#92400e" />
            <Stop offset="50%" stopColor="#b45309" />
            <Stop offset="100%" stopColor="#92400e" />
          </LinearGradient>
          <LinearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={current.color} />
            <Stop offset="100%" stopColor={current.color + 'cc'} />
          </LinearGradient>
          <LinearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#84cc16" />
            <Stop offset="100%" stopColor="#65a30d" />
          </LinearGradient>
        </Defs>

        {/* Ground */}
        <Ellipse cx="80" cy="145" rx="60" ry="12" fill="url(#groundGrad)" />

        {/* Trunk */}
        {current.trunk > 0 && (
          <Path
            d={`M 72 145 
                Q 70 ${145 - current.trunk / 2} 75 ${145 - current.trunk}
                L 85 ${145 - current.trunk}
                Q 90 ${145 - current.trunk / 2} 88 145 Z`}
            fill="url(#trunkGrad)"
          />
        )}

        {/* Crown */}
        {current.crown > 0 && (
          <G>
            <Circle 
              cx="80" 
              cy={145 - current.trunk - current.crown / 2} 
              r={current.crown / 1.8} 
              fill="url(#crownGrad)" 
            />
            {current.crown > 30 && (
              <>
                <Circle 
                  cx={80 - current.crown / 2.5} 
                  cy={145 - current.trunk - current.crown / 3} 
                  r={current.crown / 2.5} 
                  fill="url(#crownGrad)" 
                />
                <Circle 
                  cx={80 + current.crown / 2.5} 
                  cy={145 - current.trunk - current.crown / 3} 
                  r={current.crown / 2.5} 
                  fill="url(#crownGrad)" 
                />
              </>
            )}
            {/* Highlight */}
            <Circle 
              cx={80 - current.crown / 4} 
              cy={145 - current.trunk - current.crown / 1.5} 
              r={current.crown / 6} 
              fill="rgba(255,255,255,0.2)" 
            />
          </G>
        )}

        {/* Seed */}
        {stage === 'seed' && (
          <Ellipse cx="80" cy="138" rx="8" ry="5" fill="#a16207" />
        )}
      </Svg>
    </View>
  );
};

// ==================== CLEAN STAT ICONS ====================
export const FlameIcon = ({ size = 24, color = '#f59e0b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C12 2 7.5 7 7.5 12C7.5 15.5 9.5 18 12 18C14.5 18 16.5 15.5 16.5 12C16.5 7 12 2 12 2Z"
      fill={color}
    />
    <Path
      d="M12 18C10.5 18 9.5 16.5 9.5 15C9.5 13 11 11.5 12 11C13 11.5 14.5 13 14.5 15C14.5 16.5 13.5 18 12 18Z"
      fill="#fcd34d"
    />
  </Svg>
);

export const HeartIcon = ({ size = 24, color = '#ef4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
      fill={color}
    />
  </Svg>
);

export const TargetIcon = ({ size = 24, color = '#10b981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="12" cy="12" r="2" fill={color} />
  </Svg>
);

export const BoltIcon = ({ size = 24, color = '#8b5cf6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M13 2L4 14H11L10 22L20 10H13L13 2Z"
      fill={color}
    />
  </Svg>
);

export const TrophyIcon = ({ size = 24, color = '#f59e0b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19 5H17V3H7V5H5C3.9 5 3 5.9 3 7V8C3 10.55 4.92 12.63 7.39 12.94C8.02 14.44 9.37 15.57 11 15.9V19H7V21H17V19H13V15.9C14.63 15.57 15.98 14.44 16.61 12.94C19.08 12.63 21 10.55 21 8V7C21 5.9 20.1 5 19 5ZM5 8V7H7V10.82C5.84 10.4 5 9.3 5 8ZM19 8C19 9.3 18.16 10.4 17 10.82V7H19V8Z"
      fill={color}
    />
  </Svg>
);

export const ChatBubbleIcon = ({ size = 24, color = '#6366f1' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"
      fill={color}
    />
    <Path d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" fill={color} opacity="0.5" />
  </Svg>
);

export const SearchIcon = ({ size = 24, color = '#10b981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2.5" fill="none" />
    <Path d="M16 16L21 21" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

export const CalendarIcon = ({ size = 24, color = '#8b5cf6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" />
    <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="8" cy="15" r="1.5" fill={color} />
    <Circle cx="12" cy="15" r="1.5" fill={color} />
    <Circle cx="16" cy="15" r="1.5" fill={color} />
  </Svg>
);

export const GearIcon = ({ size = 24, color = '#64748b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="3" fill={color} />
    <Path
      d="M19.4 15C19.2 15.3 19.1 15.7 19.1 16.1L21 17.9L19.3 20.6L16.8 19.8C16.4 20 16 20.2 15.6 20.3L15 23H11L10.4 20.3C10 20.2 9.6 20 9.2 19.8L6.7 20.6L5 17.9L6.9 16.1C6.9 15.7 6.8 15.3 6.6 15L4.7 13.2L6.4 10.5L8.9 11.3C9.3 11.1 9.7 10.9 10.1 10.8L10.7 8H14.3L14.9 10.7C15.3 10.8 15.7 11 16.1 11.2L18.6 10.4L20.3 13.1L18.4 14.9C18.6 15.3 18.7 15.7 18.9 16.1"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

export const DumbbellIcon = ({ size = 24, color = '#6366f1' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="9" width="4" height="6" rx="1" fill={color} />
    <Rect x="17" y="9" width="4" height="6" rx="1" fill={color} />
    <Rect x="6" y="10" width="12" height="4" rx="1" fill={color} opacity="0.7" />
    <Rect x="1" y="10" width="3" height="4" rx="1" fill={color} opacity="0.5" />
    <Rect x="20" y="10" width="3" height="4" rx="1" fill={color} opacity="0.5" />
  </Svg>
);

export const LeafIcon = ({ size = 24, color = '#22c55e' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.97C7.14 19.69 7.64 19.4 8.16 19.12C9.72 18.31 11.45 17.63 13.23 17.3C13.09 18 13 18.65 13 19C13 21.21 14.79 23 17 23C19.21 23 21 21.21 21 19C21 18.65 20.91 18 20.77 17.3C22.55 17.63 24.28 18.31 25.84 19.12C26.36 19.4 26.86 19.69 27.34 19.97L28.29 22L30.18 21.34C28.1 16.17 26 10 17 8Z"
      fill={color}
      transform="translate(-3, -3) scale(0.85)"
    />
  </Svg>
);

// ==================== FLOATING DOTS (Subtle background) ====================
export const FloatingDots = ({ count = 6 }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <FloatingDot key={i} index={i} />
      ))}
    </View>
  );
};

const FloatingDot = ({ index }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.15);

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];
  const color = colors[index % colors.length];
  const size = 6 + (index % 3) * 2;
  const startX = (index * 53 + 10) % 90;
  const startY = (index * 37 + 15) % 80;

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 4000 + index * 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000 + index * 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 3000 }),
        withTiming(0.1, { duration: 3000 })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${startX}%`,
          top: `${startY}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({});
