import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
export const breakpoints = {
  small: 375,
  medium: 393,
  large: 430,
  xlarge: 440,
  tablet: 768
};

export const deviceSize = {
  isSmall: width < breakpoints.small,
  isMedium: width >= breakpoints.small && width < breakpoints.medium,
  isLarge: width >= breakpoints.medium && width < breakpoints.large,
  isXLarge: width >= breakpoints.large && width < breakpoints.tablet,
  isTablet: width >= breakpoints.tablet,
  hasDynamicIsland: (width >= 393 && height >= 852) || (width >= 430 && height >= 932) || (width >= 402 && height >= 874) || (width >= 440 && height >= 956),
  width: width,
  height: height
};

export const scale = (size) => {
  if (deviceSize.isSmall) return size * 0.85;
  if (deviceSize.isMedium) return size * 0.95;
  if (deviceSize.isLarge) return size;
  if (deviceSize.isXLarge) return size * 1.05;
  if (deviceSize.isTablet) return size * 1.2;
  return size;
};

// LiftLink Brand Colors - Matching Your Design Vision
export const colors = {
  // PRIMARY LIME GREEN/NEON GREEN (from your mockups)
  limeGreen: '#BFFF00',        // Primary brand color - vibrant lime
  neonGreen: '#CCFF00',        // Accent lime green
  electricGreen: '#B2FF00',    // Brighter lime green for highlights
  
  // DARK THEME BACKGROUNDS (matching your mockups)
  darkBg: '#0A0A0A',           // Main background - deep black
  darkCard: '#1A1A1A',         // Card backgrounds
  darkOverlay: '#141414',      // Overlay backgrounds
  
  // GLASSMORPHISM COLORS
  glassLight: 'rgba(191, 255, 0, 0.08)',    // Light lime glass
  glassMedium: 'rgba(191, 255, 0, 0.12)',   // Medium lime glass
  glassStrong: 'rgba(191, 255, 0, 0.18)',   // Strong lime glass
  glassDark: 'rgba(10, 10, 10, 0.7)',       // Dark glass backdrop
  
  // NEUMORPHISM COLORS
  neuLight: '#222222',         // Light shadow for neumorphism
  neuDark: '#050505',          // Dark shadow for neumorphism
  neuHighlight: '#2A2A2A',     // Highlight for raised elements
  
  // TEXT COLORS
  textPrimary: '#FFFFFF',      // Primary text - white
  textSecondary: '#B8B8B8',    // Secondary text - light gray
  textTertiary: '#7A7A7A',     // Tertiary text - gray
  
  // STATUS COLORS
  success: '#00FF88',          // Success green
  warning: '#FFD700',          // Warning yellow
  error: '#FF4444',            // Error red
  info: '#00D4FF',             // Info cyan
  
  // MAP & LOCATION COLORS
  mapMarker: '#BFFF00',        // Lime green markers
  userLocation: '#CCFF00',     // User location marker
  
  // GRADIENT COMBINATIONS
  gradientPrimary: ['#BFFF00', '#9ACD32'],    // Lime gradient
  gradientDark: ['#0A0A0A', '#1A1A1A'],       // Dark gradient
  gradientGlass: ['rgba(191, 255, 0, 0.1)', 'rgba(191, 255, 0, 0.05)'], // Glass gradient
};

// GLASSMORPHISM STYLES
export const glassmorphism = {
  light: {
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: 'rgba(191, 255, 0, 0.15)',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
  },
  medium: {
    backgroundColor: colors.glassMedium,
    borderWidth: 1,
    borderColor: 'rgba(191, 255, 0, 0.2)',
    backdropFilter: 'blur(15px)',
    overflow: 'hidden',
  },
  strong: {
    backgroundColor: colors.glassStrong,
    borderWidth: 1.5,
    borderColor: 'rgba(191, 255, 0, 0.25)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
  },
  dark: {
    backgroundColor: colors.glassDark,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    overflow: 'hidden',
  },
};

// NEUMORPHISM STYLES
export const neumorphism = {
  raised: {
    backgroundColor: colors.darkCard,
    shadowColor: colors.neuLight,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pressed: {
    backgroundColor: colors.darkCard,
    shadowColor: colors.neuDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  flat: {
    backgroundColor: colors.darkCard,
    shadowColor: colors.neuLight,
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
};

// MICRO-ANIMATION CONFIGURATIONS
export const animations = {
  // Timing configurations
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Spring configurations
  spring: {
    gentle: { tension: 120, friction: 14 },
    normal: { tension: 180, friction: 12 },
    bouncy: { tension: 240, friction: 10 },
    stiff: { tension: 300, friction: 20 },
  },
  
  // Scale animations
  scale: {
    press: 0.95,
    hover: 1.05,
    tap: 0.9,
  },
  
  // Rotation animations
  rotate: {
    quarter: '90deg',
    half: '180deg',
    full: '360deg',
  },
};

// ENHANCED COMPONENT STYLES MATCHING YOUR DESIGN
export const componentStyles = StyleSheet.create({
  // BUTTONS (Matching your lime green rounded buttons)
  primaryButton: {
    backgroundColor: colors.limeGreen,
    paddingVertical: scale(16),
    paddingHorizontal: scale(40),
    borderRadius: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
    ...neumorphism.raised,
    shadowColor: colors.limeGreen,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  
  primaryButtonText: {
    color: colors.darkBg,
    fontSize: scale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.limeGreen,
    paddingVertical: scale(14),
    paddingHorizontal: scale(36),
    borderRadius: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  outlineButtonText: {
    color: colors.limeGreen,
    fontSize: scale(16),
    fontWeight: '600',
  },
  
  // GLASS BUTTON
  glassButton: {
    ...glassmorphism.medium,
    paddingVertical: scale(16),
    paddingHorizontal: scale(40),
    borderRadius: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // CARDS (Matching your card-based design)
  glassCard: {
    ...glassmorphism.light,
    borderRadius: scale(20),
    padding: scale(20),
    marginBottom: scale(16),
  },
  
  neuCard: {
    ...neumorphism.raised,
    borderRadius: scale(20),
    padding: scale(20),
    marginBottom: scale(16),
  },
  
  // MENTOR CARD (Lime green section from your design)
  mentorCard: {
    backgroundColor: colors.limeGreen,
    borderRadius: scale(20),
    padding: scale(20),
    marginVertical: scale(16),
    ...neumorphism.raised,
    shadowColor: colors.limeGreen,
    shadowOpacity: 0.5,
  },
  
  mentorCardDark: {
    backgroundColor: colors.darkCard,
    borderRadius: scale(20),
    padding: scale(20),
    marginVertical: scale(16),
    ...neumorphism.raised,
    borderWidth: 2,
    borderColor: colors.limeGreen,
  },
  
  // INPUT FIELDS (Dark theme inputs from your mockups)
  inputContainer: {
    ...glassmorphism.dark,
    borderRadius: scale(15),
    paddingHorizontal: scale(16),
    paddingVertical: Platform.OS === 'ios' ? scale(16) : scale(8),
    marginBottom: scale(16),
    borderColor: 'rgba(191, 255, 0, 0.2)',
  },
  
  input: {
    color: colors.textPrimary,
    fontSize: scale(16),
    fontWeight: '400',
  },
  
  inputLabel: {
    color: colors.textSecondary,
    fontSize: scale(14),
    marginBottom: scale(8),
    fontWeight: '500',
  },
  
  // WORKOUT METRICS (From your dashboard design)
  metricCard: {
    ...glassmorphism.medium,
    borderRadius: scale(15),
    padding: scale(16),
    marginRight: scale(12),
    minWidth: scale(140),
  },
  
  metricValue: {
    color: colors.limeGreen,
    fontSize: scale(24),
    fontWeight: '700',
    marginBottom: scale(4),
  },
  
  metricLabel: {
    color: colors.textSecondary,
    fontSize: scale(13),
    fontWeight: '500',
  },
  
  // HEADERS (Matching your design headers)
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? scale(50) : scale(20),
    paddingBottom: scale(16),
    backgroundColor: colors.darkBg,
  },
  
  headerTitle: {
    color: colors.textPrimary,
    fontSize: scale(24),
    fontWeight: '700',
  },
  
  // BOTTOM TAB BAR (From your navigation design)
  tabBar: {
    backgroundColor: colors.darkCard,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: colors.limeGreen,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    height: Platform.OS === 'ios' ? scale(85) : scale(65),
    paddingBottom: Platform.OS === 'ios' ? scale(20) : scale(10),
  },
  
  tabBarIcon: {
    width: scale(24),
    height: scale(24),
  },
  
  // PROFILE PICTURE (Circular from your design)
  profilePicture: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    borderWidth: 2,
    borderColor: colors.limeGreen,
  },
  
  profilePictureLarge: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: 3,
    borderColor: colors.limeGreen,
  },
  
  // MAP MARKER STYLES
  mapMarker: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.limeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.darkBg,
    ...neumorphism.raised,
  },
  
  // RATING STARS (From your mentor cards)
  starsContainer: {
    flexDirection: 'row',
    marginVertical: scale(8),
  },
  
  star: {
    color: colors.limeGreen,
    fontSize: scale(18),
    marginRight: scale(4),
  },
  
  // SECTION CONTAINERS
  sectionContainer: {
    marginBottom: scale(24),
  },
  
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: scale(20),
    fontWeight: '700',
    marginBottom: scale(12),
  },
  
  // GLASSMORPHISM OVERLAY
  glassOverlay: {
    ...glassmorphism.dark,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ANIMATION STYLES
export const animatedStyles = {
  // Fade In
  fadeIn: {
    opacity: 0,
    transform: [{ scale: 0.9 }],
  },
  fadeInActive: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  
  // Slide Up
  slideUp: {
    transform: [{ translateY: 50 }],
    opacity: 0,
  },
  slideUpActive: {
    transform: [{ translateY: 0 }],
    opacity: 1,
  },
  
  // Scale Bounce
  scaleBounce: {
    transform: [{ scale: 0.8 }],
    opacity: 0,
  },
  scaleBounceActive: {
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  
  // Pulse
  pulse: {
    transform: [{ scale: 1 }],
  },
  pulseActive: {
    transform: [{ scale: 1.05 }],
  },
};

export default {
  colors,
  scale,
  deviceSize,
  breakpoints,
  glassmorphism,
  neumorphism,
  animations,
  componentStyles,
  animatedStyles,
};
