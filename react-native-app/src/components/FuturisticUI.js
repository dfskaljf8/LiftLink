/**
 * Futuristic UI Components - LiftLink 2050
 * Ultra-modern, buttery smooth, cyber-organic aesthetic
 * SIMPLIFIED VERSION FOR STABILITY
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import Svg, { 
  Path, Circle, Rect, G, Defs, LinearGradient, Stop, 
  RadialGradient, Ellipse, Line, Polygon
} from 'react-native-svg';
import Animated, { 
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== FUTURISTIC COLOR SYSTEM ====================
export const FUTURE_COLORS = {
  // Base
  void: '#000000',
  deep: '#050508',
  surface: '#0a0a0f',
  elevated: '#12121a',
  
  // Primary - Electric Cyan
  primary: '#00F0FF',
  primaryGlow: '#00D4E4',
  primaryMuted: '#00A8B8',
  
  // Accent - Bioluminescent Green
  accent: '#00FF94',
  accentGlow: '#00E080',
  
  // Secondary - Plasma Purple
  secondary: '#B44AFF',
  secondaryGlow: '#9933FF',
  
  // Warm accents
  energy: '#FF6B35',
  gold: '#FFD700',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#8888AA',
  textMuted: '#555577',
  
  // Borders & Lines
  border: '#1a1a2e',
  borderGlow: '#00F0FF20',
  
  // States
  success: '#00FF94',
  error: '#FF4466',
  warning: '#FFB800',
};

// ==================== FUTURISTIC LOGO ====================
export const FutureLogo = ({ size = 80 }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Defs>
          <LinearGradient id="logoMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
            <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
          </LinearGradient>
        </Defs>
        
        {/* Hexagonal frame */}
        <Polygon
          points="40,5 70,20 70,60 40,75 10,60 10,20"
          stroke="url(#logoMain)"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Inner dumbbell - stylized */}
        <G transform="translate(40, 40)">
          <Rect x="-15" y="-3" width="30" height="6" rx="3" fill="url(#logoMain)" />
          <Polygon points="-20,-12 -12,-12 -12,12 -20,12" fill="url(#logoMain)" />
          <Polygon points="20,-12 12,-12 12,12 20,12" fill="url(#logoMain)" />
        </G>
        
        {/* Corner accents */}
        <Circle cx="40" cy="5" r="3" fill={FUTURE_COLORS.primary} />
        <Circle cx="40" cy="75" r="3" fill={FUTURE_COLORS.primary} />
      </Svg>
    </View>
  );
};

// ==================== FUTURISTIC MASCOT ====================
export const FutureMascot = ({ size = 160 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 160 160">
        <Defs>
          <LinearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
            <Stop offset="100%" stopColor={FUTURE_COLORS.primaryMuted} />
          </LinearGradient>
          <RadialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="100%" stopColor={FUTURE_COLORS.primary} stopOpacity="0.5" />
          </RadialGradient>
          <LinearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
            <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
          </LinearGradient>
        </Defs>

        {/* Levitation rings */}
        <Ellipse cx="80" cy="145" rx="35" ry="8" fill={FUTURE_COLORS.primary} opacity="0.15" />
        <Ellipse cx="80" cy="145" rx="25" ry="5" fill={FUTURE_COLORS.primary} opacity="0.25" />

        {/* Body */}
        <Path
          d="M 80 40 C 110 40 130 65 130 95 C 130 125 110 140 80 140 C 50 140 30 125 30 95 C 30 65 50 40 80 40"
          fill="url(#bodyGrad)"
        />
        
        {/* Visor/Face plate */}
        <Path
          d="M 45 70 C 45 55 60 50 80 50 C 100 50 115 55 115 70 C 115 95 100 105 80 105 C 60 105 45 95 45 70"
          fill={FUTURE_COLORS.deep}
        />
        
        {/* Eyes */}
        <Circle cx="62" cy="75" r="10" fill="url(#eyeGlow)" />
        <Circle cx="98" cy="75" r="10" fill="url(#eyeGlow)" />
        <Circle cx="62" cy="75" r="5" fill={FUTURE_COLORS.primary} />
        <Circle cx="98" cy="75" r="5" fill={FUTURE_COLORS.primary} />
        
        {/* Smile */}
        <Path
          d="M 65 90 Q 80 100 95 90"
          stroke={FUTURE_COLORS.accent}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Arms */}
        <Path d="M 30 85 Q 15 70 10 60" stroke="url(#armGrad)" strokeWidth="10" strokeLinecap="round" fill="none" />
        <Path d="M 130 85 Q 145 70 150 60" stroke="url(#armGrad)" strokeWidth="10" strokeLinecap="round" fill="none" />

        {/* Chest emblem */}
        <Circle cx="80" cy="120" r="8" fill={FUTURE_COLORS.deep} stroke={FUTURE_COLORS.accent} strokeWidth="1.5" />
        <Circle cx="80" cy="120" r="4" fill={FUTURE_COLORS.accent} opacity="0.7" />
      </Svg>
    </View>
  );
};

// ==================== FUTURISTIC BUTTON ====================
export const FutureButton = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'large',
  icon,
  style,
}) => {
  const variants = {
    primary: { bg: FUTURE_COLORS.primary, text: FUTURE_COLORS.void },
    secondary: { bg: 'transparent', text: FUTURE_COLORS.primary, border: FUTURE_COLORS.primary },
    accent: { bg: FUTURE_COLORS.accent, text: FUTURE_COLORS.void },
    ghost: { bg: 'transparent', text: FUTURE_COLORS.primary },
    glass: { bg: 'rgba(255,255,255,0.05)', text: FUTURE_COLORS.text, border: 'rgba(255,255,255,0.1)' },
  };

  const sizes = {
    small: { height: 44, fontSize: 13, px: 16, radius: 10 },
    medium: { height: 52, fontSize: 15, px: 20, radius: 12 },
    large: { height: 58, fontSize: 16, px: 28, radius: 14 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.large;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.futureButton,
        {
          backgroundColor: isDisabled ? FUTURE_COLORS.elevated : v.bg,
          height: s.height,
          paddingHorizontal: s.px,
          borderRadius: s.radius,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border || 'transparent',
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.buttonIcon}>{icon}</View>}
          <Text style={[styles.buttonText, { fontSize: s.fontSize, color: isDisabled ? FUTURE_COLORS.textMuted : v.text }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

// ==================== SOCIAL BUTTON ====================
export const FutureSocialButton = ({ onPress, title, icon, loading = false, style }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.socialButton,
        { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={FUTURE_COLORS.text} size="small" />
      ) : (
        <>
          <View style={styles.socialIcon}>{icon}</View>
          <Text style={styles.socialText}>{title}</Text>
        </>
      )}
    </Pressable>
  );
};

// ==================== ICONS ====================
export const FutureEmailIcon = ({ size = 24, color = FUTURE_COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="emailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={color} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
      </LinearGradient>
    </Defs>
    <Rect x="2" y="4" width="20" height="16" rx="3" stroke="url(#emailGrad)" strokeWidth="1.5" fill="none" />
    <Path d="M2 7L12 14L22 7" stroke="url(#emailGrad)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);

export const FutureGoogleIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

export const FutureAppleIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      fill={color}
    />
  </Svg>
);

// ==================== TAB BAR ICONS ====================
export const FutureHomeIcon = ({ size = 24, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.55 5.45 21 6 21H9M19 10L21 12M19 10V20C19 20.55 18.55 21 18 21H15M9 21C9.55 21 10 20.55 10 20V16C10 15.45 10.45 15 11 15H13C13.55 15 14 15.45 14 16V20C14 20.55 14.45 21 15 21M9 21H15"
      stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

export const FutureSearchIcon = ({ size = 24, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="10" cy="10" r="6" stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" fill="none" />
    <Path d="M14.5 14.5L20 20" stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const FutureMapIcon = ({ size = 24, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
      stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted}
      strokeWidth="2"
      fill={focused ? `${FUTURE_COLORS.primary}20` : 'none'}
    />
    <Circle cx="12" cy="9" r="3" fill={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} />
  </Svg>
);

export const FutureCalendarIcon = ({ size = 24, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" fill="none" />
    <Path d="M3 10H21" stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" />
    <Path d="M8 2V6" stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 2V6" stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const FutureProfileIcon = ({ size = 24, focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="8" r="4" stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" fill={focused ? `${FUTURE_COLORS.primary}30` : 'none'} />
    <Path
      d="M4 20C4 16.69 7.13 14 12 14C16.87 14 20 16.69 20 20"
      stroke={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

// ==================== SIMPLE PARTICLE FIELD (NO ANIMATION) ====================
export const ParticleField = ({ count = 20 }) => {
  // Static particles - no animation to avoid crashes
  const particles = React.useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * 400,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.3 + 0.1,
    })), [count]
  );

  return (
    <View style={styles.particleContainer} pointerEvents="none">
      {particles.map((p) => (
        <View
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: FUTURE_COLORS.primary,
            opacity: p.opacity,
          }}
        />
      ))}
    </View>
  );
};

// ==================== GLOW RING (STATIC) ====================
export const GlowRing = ({ size = 200, color = FUTURE_COLORS.primary }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="50%" stopColor={color} stopOpacity="0" />
            <Stop offset="100%" stopColor={color} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle cx="100" cy="100" r="90" stroke="url(#ringGrad)" strokeWidth="2" fill="none" strokeDasharray="30 10 60 10" />
        <Circle cx="100" cy="100" r="80" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
      </Svg>
    </View>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  futureButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    backgroundColor: FUTURE_COLORS.elevated,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    width: '100%',
  },
  socialIcon: {
    marginRight: 12,
  },
  socialText: {
    color: FUTURE_COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});

export default {
  FUTURE_COLORS,
  GlowRing,
  FutureLogo,
  FutureMascot,
  FutureButton,
  FutureSocialButton,
  FutureEmailIcon,
  FutureGoogleIcon,
  FutureAppleIcon,
  FutureHomeIcon,
  FutureSearchIcon,
  FutureMapIcon,
  FutureCalendarIcon,
  FutureProfileIcon,
  ParticleField,
};
