/**
 * Custom Illustrations - Hand-crafted SVG graphics
 * Cartoonish, animated fitness illustrations
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { 
  Path, Circle, Rect, G, Defs, LinearGradient, Stop, 
  Ellipse, RadialGradient 
} from 'react-native-svg';
import Animated, { 
  useSharedValue, useAnimatedStyle, withRepeat, 
  withTiming, withSequence, withSpring, withDelay,
  Easing, interpolate
} from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

// ==================== MASCOT CHARACTER ====================
export const LiftLinkMascot = ({ size = 200, mood = 'happy' }) => {
  const bounce = useSharedValue(0);
  const armWave = useSharedValue(0);
  const eyeBlink = useSharedValue(1);

  useEffect(() => {
    // Bouncing animation
    bounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 500, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) })
      ),
      -1,
      true
    );

    // Arm wave animation
    armWave.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 300 }),
        withTiming(-15, { duration: 300 })
      ),
      -1,
      true
    );

    // Eye blink animation
    const blinkLoop = () => {
      eyeBlink.value = withSequence(
        withDelay(2000, withTiming(0.1, { duration: 100 })),
        withTiming(1, { duration: 100 })
      );
      setTimeout(blinkLoop, 3000);
    };
    blinkLoop();
  }, []);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          {/* Body Gradient */}
          <LinearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#6366f1" />
            <Stop offset="100%" stopColor="#4f46e5" />
          </LinearGradient>
          {/* Face Gradient */}
          <RadialGradient id="faceGrad" cx="50%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#fef3c7" />
            <Stop offset="100%" stopColor="#fcd34d" />
          </RadialGradient>
          {/* Dumbbell Gradient */}
          <LinearGradient id="dumbbellGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#374151" />
            <Stop offset="50%" stopColor="#6b7280" />
            <Stop offset="100%" stopColor="#374151" />
          </LinearGradient>
        </Defs>

        {/* Shadow */}
        <Ellipse cx="100" cy="185" rx="50" ry="10" fill="rgba(0,0,0,0.2)" />

        {/* Body */}
        <G>
          {/* Main Body - Rounded Square */}
          <Rect x="50" y="70" width="100" height="100" rx="30" fill="url(#bodyGrad)" />
          
          {/* Belly highlight */}
          <Ellipse cx="100" cy="120" rx="35" ry="30" fill="rgba(255,255,255,0.15)" />

          {/* Face */}
          <Circle cx="100" cy="55" r="45" fill="url(#faceGrad)" />
          
          {/* Cheeks */}
          <Circle cx="70" cy="60" r="10" fill="#fca5a5" opacity="0.6" />
          <Circle cx="130" cy="60" r="10" fill="#fca5a5" opacity="0.6" />

          {/* Eyes */}
          <Ellipse cx="80" cy="50" rx="8" ry="10" fill="#1f2937" />
          <Ellipse cx="120" cy="50" rx="8" ry="10" fill="#1f2937" />
          
          {/* Eye shine */}
          <Circle cx="83" cy="47" r="3" fill="white" />
          <Circle cx="123" cy="47" r="3" fill="white" />

          {/* Smile */}
          <Path
            d="M 80 70 Q 100 90 120 70"
            stroke="#1f2937"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Arms */}
          {/* Left Arm holding dumbbell */}
          <G>
            <Path
              d="M 50 100 Q 20 100 15 80"
              stroke="url(#bodyGrad)"
              strokeWidth="20"
              strokeLinecap="round"
              fill="none"
            />
            {/* Dumbbell */}
            <Rect x="5" y="65" width="25" height="8" rx="2" fill="url(#dumbbellGrad)" />
            <Rect x="0" y="60" width="8" height="18" rx="3" fill="#374151" />
            <Rect x="25" y="60" width="8" height="18" rx="3" fill="#374151" />
          </G>

          {/* Right Arm */}
          <Path
            d="M 150 100 Q 180 100 185 80"
            stroke="url(#bodyGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right Dumbbell */}
          <Rect x="170" y="65" width="25" height="8" rx="2" fill="url(#dumbbellGrad)" />
          <Rect x="167" y="60" width="8" height="18" rx="3" fill="#374151" />
          <Rect x="192" y="60" width="8" height="18" rx="3" fill="#374151" />

          {/* Legs */}
          <Rect x="65" y="160" width="20" height="25" rx="10" fill="url(#bodyGrad)" />
          <Rect x="115" y="160" width="20" height="25" rx="10" fill="url(#bodyGrad)" />
          
          {/* Shoes */}
          <Ellipse cx="75" cy="182" rx="15" ry="8" fill="#ef4444" />
          <Ellipse cx="125" cy="182" rx="15" ry="8" fill="#ef4444" />
          <Rect x="65" y="178" width="8" height="4" rx="2" fill="white" />
          <Rect x="120" y="178" width="8" height="4" rx="2" fill="white" />

          {/* Headband */}
          <Path
            d="M 55 35 Q 100 25 145 35"
            stroke="#ef4444"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
    </View>
  );
};

// ==================== ANIMATED DUMBBELL ====================
export const AnimatedDumbbell = ({ size = 80 }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(15, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="dbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#6366f1" />
            <Stop offset="100%" stopColor="#4338ca" />
          </LinearGradient>
        </Defs>
        <G>
          {/* Bar */}
          <Rect x="20" y="45" width="60" height="10" rx="5" fill="#9ca3af" />
          
          {/* Left weights */}
          <Rect x="10" y="30" width="15" height="40" rx="4" fill="url(#dbGrad)" />
          <Rect x="5" y="35" width="10" height="30" rx="3" fill="url(#dbGrad)" />
          
          {/* Right weights */}
          <Rect x="75" y="30" width="15" height="40" rx="4" fill="url(#dbGrad)" />
          <Rect x="85" y="35" width="10" height="30" rx="3" fill="url(#dbGrad)" />
          
          {/* Shine */}
          <Rect x="12" y="33" width="3" height="15" rx="1" fill="rgba(255,255,255,0.3)" />
          <Rect x="77" y="33" width="3" height="15" rx="1" fill="rgba(255,255,255,0.3)" />
        </G>
      </Svg>
    </View>
  );
};

// ==================== FLOATING PARTICLES ====================
export const FloatingParticles = ({ count = 8 }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
};

const Particle = ({ index }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const color = colors[index % colors.length];
  const size = 8 + (index % 4) * 4;
  const startX = (index * 47) % 100;
  const startY = (index * 31) % 100;

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-50 - index * 10, { duration: 3000 + index * 500 }),
      -1,
      true
    );
    translateX.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 2000 }),
        withTiming(-20, { duration: 2000 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.2, { duration: 1500 })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(0.8, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
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

// ==================== PROGRESS TREE ====================
export const AnimatedTree = ({ stage = 'seed', size = 200 }) => {
  const sway = useSharedValue(0);
  const leafPulse = useSharedValue(1);

  const stages = {
    seed: { height: 20, leaves: 0, trunk: 10 },
    sprout: { height: 40, leaves: 2, trunk: 15 },
    sapling: { height: 70, leaves: 4, trunk: 20 },
    young_tree: { height: 100, leaves: 6, trunk: 25 },
    mature_tree: { height: 130, leaves: 8, trunk: 30 },
  };

  const current = stages[stage] || stages.seed;

  useEffect(() => {
    sway.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    leafPulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(0.95, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#78350f" />
            <Stop offset="50%" stopColor="#a16207" />
            <Stop offset="100%" stopColor="#78350f" />
          </LinearGradient>
          <RadialGradient id="leafGrad" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#4ade80" />
            <Stop offset="100%" stopColor="#16a34a" />
          </RadialGradient>
        </Defs>

        {/* Ground */}
        <Ellipse cx="100" cy="190" rx="80" ry="15" fill="#a16207" />
        <Ellipse cx="100" cy="188" rx="75" ry="12" fill="#84cc16" />

        {/* Trunk */}
        <Path
          d={`M 90 190 Q 85 ${190 - current.height / 2} 95 ${190 - current.height} 
              L 105 ${190 - current.height} Q 115 ${190 - current.height / 2} 110 190 Z`}
          fill="url(#trunkGrad)"
        />

        {/* Leaves/Crown */}
        {current.leaves > 0 && (
          <G>
            <Circle cx="100" cy={190 - current.height - 20} r={current.leaves * 6} fill="url(#leafGrad)" />
            {current.leaves > 2 && (
              <>
                <Circle cx={100 - current.leaves * 4} cy={190 - current.height - 5} r={current.leaves * 4} fill="url(#leafGrad)" />
                <Circle cx={100 + current.leaves * 4} cy={190 - current.height - 5} r={current.leaves * 4} fill="url(#leafGrad)" />
              </>
            )}
            {current.leaves > 4 && (
              <>
                <Circle cx={100 - current.leaves * 3} cy={190 - current.height - 30} r={current.leaves * 3} fill="url(#leafGrad)" />
                <Circle cx={100 + current.leaves * 3} cy={190 - current.height - 30} r={current.leaves * 3} fill="url(#leafGrad)" />
              </>
            )}
          </G>
        )}

        {/* Seed for first stage */}
        {stage === 'seed' && (
          <Ellipse cx="100" cy="180" rx="12" ry="8" fill="#a16207" />
        )}
      </Svg>
    </View>
  );
};

// ==================== PULSING BUTTON BACKGROUND ====================
export const PulsingBackground = ({ color = '#6366f1', children }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.3, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ position: 'relative' }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: color, borderRadius: 16 },
          pulseStyle,
        ]}
      />
      {children}
    </View>
  );
};

// ==================== TRAINER AVATAR ====================
export const TrainerAvatar = ({ name, size = 60, color = '#6366f1' }) => {
  const initial = name?.charAt(0)?.toUpperCase() || 'T';
  
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={color + '99'} />
          </LinearGradient>
        </Defs>
        
        {/* Background */}
        <Circle cx="50" cy="50" r="48" fill="url(#avatarGrad)" />
        
        {/* Body silhouette */}
        <Path
          d="M 50 35 
             C 60 35 68 43 68 53 
             C 68 63 60 68 50 68
             C 40 68 32 63 32 53
             C 32 43 40 35 50 35"
          fill="rgba(255,255,255,0.3)"
        />
        
        {/* Head */}
        <Circle cx="50" cy="40" r="15" fill="rgba(255,255,255,0.9)" />
        
        {/* Simple face */}
        <Circle cx="44" cy="38" r="2" fill="#374151" />
        <Circle cx="56" cy="38" r="2" fill="#374151" />
        <Path d="M 45 45 Q 50 50 55 45" stroke="#374151" strokeWidth="2" fill="none" />
        
        {/* Muscles hint */}
        <Path
          d="M 25 55 Q 20 50 25 45"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 75 55 Q 80 50 75 45"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};

// ==================== STATS ICONS ====================
export const FireIcon = ({ size = 24, color = '#f59e0b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 23C7.58 23 4 19.42 4 15C4 11.83 5.67 9.17 7.5 7.5C7.5 7.5 8.5 11 11 11C11 8.5 9.5 4 12 2C12 2 17 6 17 11C17 11 18 9 18 7C20 8.5 20 11.5 20 15C20 19.42 16.42 23 12 23Z"
      fill={color}
    />
    <Path
      d="M12 23C10 23 8.5 21.5 8.5 19.5C8.5 17.5 10 16 12 15C14 16 15.5 17.5 15.5 19.5C15.5 21.5 14 23 12 23Z"
      fill="#fcd34d"
    />
  </Svg>
);

export const HeartIcon = ({ size = 24, color = '#ef4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
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

export const LightningIcon = ({ size = 24, color = '#8b5cf6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M11 21H8L13 10H10L14 3H17L12 12H15L11 21Z"
      fill={color}
    />
  </Svg>
);

const styles = StyleSheet.create({});
