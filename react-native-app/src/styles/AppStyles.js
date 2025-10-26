import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints (including iPhone 14-16 Pro Max + Dynamic Island)
export const breakpoints = {
  small: 375,     // iPhone SE, older devices
  medium: 393,    // iPhone 14 Pro, iPhone 15/16 Pro  
  large: 430,     // iPhone 14 Plus, iPhone 15/16 Plus, iPhone 14-16 Pro Max
  xlarge: 440,    // iPhone 16 Pro Max
  tablet: 768     // iPad and larger tablets
};

export const deviceSize = {
  isSmall: width < breakpoints.small,           // iPhone SE, older phones
  isMedium: width >= breakpoints.small && width < breakpoints.medium,  // iPhone 12-13 series
  isLarge: width >= breakpoints.medium && width < breakpoints.large,   // iPhone 14-16 Pro
  isXLarge: width >= breakpoints.large && width < breakpoints.tablet,  // iPhone 14-16 Pro Max, Plus
  isTablet: width >= breakpoints.tablet,        // iPad, Android tablets
  
  // Specific iPhone model detection
  isiPhone14Pro: width >= 393 && width <= 393,      // iPhone 14 Pro (393×852)
  isiPhone14ProMax: width >= 430 && width <= 430,   // iPhone 14 Pro Max (430×932)
  isiPhone15Pro: width >= 393 && width <= 393,      // iPhone 15 Pro (393×852)  
  isiPhone15ProMax: width >= 430 && width <= 430,   // iPhone 15 Pro Max (430×932)
  isiPhone16Pro: width >= 402 && width <= 402,      // iPhone 16 Pro (402×874)
  isiPhone16ProMax: width >= 440 && width <= 440,   // iPhone 16 Pro Max (440×956)
  
  // Dynamic Island detection (iPhone 14 Pro and newer)
  hasDynamicIsland: (width >= 393 && height >= 852) || (width >= 430 && height >= 932) || (width >= 402 && height >= 874) || (width >= 440 && height >= 956),
  
  width: width,
  height: height
};

// Dynamic Island specific measurements
export const dynamicIsland = {
  // Dynamic Island dimensions and positioning
  width: scale(126),
  height: scale(37),
  topOffset: Platform.OS === 'ios' ? scale(11) : 0,
  
  // Safe area adjustments for Dynamic Island
  statusBarHeight: deviceSize.hasDynamicIsland ? scale(54) : (Platform.OS === 'ios' ? scale(44) : scale(24)),
  headerTopPadding: deviceSize.hasDynamicIsland ? scale(59) : (Platform.OS === 'ios' ? scale(44) : scale(24)),
  
  // Modal and overlay positioning
  modalTopOffset: deviceSize.hasDynamicIsland ? scale(70) : scale(50),
  overlayTopOffset: deviceSize.hasDynamicIsland ? scale(65) : scale(50),
  
  // Notification area (around Dynamic Island)
  notificationAreaHeight: deviceSize.hasDynamicIsland ? scale(95) : scale(60),
};

// Enhanced responsive scaling for latest iPhones + Dynamic Island
export const scale = (size) => {
  if (deviceSize.isSmall) return size * 0.85;        // iPhone SE
  if (deviceSize.isMedium) return size * 0.95;       // iPhone 12-13
  if (deviceSize.isLarge) return size;                // iPhone 14-16 Pro
  if (deviceSize.isXLarge) return size * 1.05;       // iPhone 14-16 Pro Max
  if (deviceSize.isTablet) return size * 1.2;        // iPad
  return size;
};

// iPhone Pro Max specific scaling
export const proMaxScale = (size) => {
  if (deviceSize.isiPhone14ProMax || deviceSize.isiPhone15ProMax || deviceSize.isiPhone16ProMax) {
    return size * 1.1; // 10% larger for Pro Max models
  }
  return scale(size);
};

// Dynamic Island aware spacing
export const dynamicIslandSafeSpacing = (baseSpacing) => {
  if (deviceSize.hasDynamicIsland) {
    return baseSpacing + dynamicIsland.headerTopPadding;
  }
  return baseSpacing + (Platform.OS === 'ios' ? scale(44) : scale(24));
};

export const verticalScale = (size) => {
  const baseHeight = 812; // iPhone X height
  return (height / baseHeight) * size;
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// LiftLink React Native Styles
// Fully responsive and optimized for all mobile screen sizes

export const colors = {
  // PRIMARY LIME GREEN/NEON GREEN (Matching Design Mockups)
  limeGreen: '#BFFF00',
  neonGreen: '#CCFF00',
  electricGreen: '#B2FF00',
  primary: '#BFFF00',
  secondary: '#CCFF00',
  accent: '#B2FF00',
  warning: '#FFD700',
  error: '#FF4444',
  success: '#00FF88',
  
  // Cyberpunk Theme Colors
  cyberpunkPrimary: '#C4D600',
  cyberpunkSecondary: '#00D4AA',
  cyberpunkAccent: '#FFD700',
  
  // Background Colors (Matching Dark Design Mockups)
  backgroundDark: '#0A0A0A',
  backgroundLight: '#f8fafc',
  surfaceDark: '#1A1A1A',
  surfaceLight: '#ffffff',
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#1A1A1A',
  
  // Text Colors
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textLight: '#1e293b',
  textLightSecondary: '#64748b',
  
  // Glass Effect Colors
  glassOverlay: 'rgba(255, 255, 255, 0.05)',
  glassOverlayLight: 'rgba(255, 255, 255, 0.9)',
  
  // Border Colors
  borderDark: 'rgba(196, 214, 0, 0.2)',
  borderLight: 'rgba(59, 130, 246, 0.2)',
  
  // Overlay Colors
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(255, 255, 255, 0.95)',
};

export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  
  // Vertical spacing
  vxs: verticalScale(4),
  vsm: verticalScale(8),
  vmd: verticalScale(16),
  vlg: verticalScale(24),
  vxl: verticalScale(32),
  vxxl: verticalScale(48)
};

export const typography = {
  // Responsive font sizes
  h1: moderateScale(32),
  h2: moderateScale(28),
  h3: moderateScale(24),
  h4: moderateScale(20),
  h5: moderateScale(18),
  h6: moderateScale(16),
  
  body: moderateScale(16),
  bodySmall: moderateScale(14),
  caption: moderateScale(12),
  overline: moderateScale(10),
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8
  }
};

export const borderRadius = {
  sm: scale(6),
  md: scale(12),
  lg: scale(16),
  xl: scale(24),
  round: scale(50)
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.2,
    shadowRadius: scale(16),
    elevation: 8,
  }
};

// Responsive styles for common components
const NativeAppStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: spacing.md,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    paddingTop: deviceSize.hasDynamicIsland ? 0 : (Platform.OS === 'ios' ? spacing.lg : 0),
  },
  
  // Dynamic Island aware safe area
  dynamicIslandSafeArea: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    paddingTop: dynamicIsland.statusBarHeight,
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  // Card styles
  card: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.medium,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.small,
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  
  // Text styles
  title: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    fontSize: typography.h4,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  bodyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.body,
  },
  
  captionText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.caption,
  },
  
  // Input styles
  textInput: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderDark,
    marginVertical: spacing.sm,
  },
  
  textInputFocused: {
    borderColor: colors.primary,
    ...shadows.small,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
  },
  
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  
  // Modal styles (Dynamic Island aware)
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: deviceSize.hasDynamicIsland ? dynamicIsland.modalTopOffset : spacing.xl,
  },
  
  modalContent: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    maxWidth: deviceSize.isTablet ? 400 : width - (spacing.lg * 2),
    width: '100%',
    maxHeight: height - (deviceSize.hasDynamicIsland ? dynamicIsland.modalTopOffset * 2 : spacing.xl * 2),
    ...shadows.large,
  },
  
  // Dynamic Island notification area
  notificationOverlay: {
    position: 'absolute',
    top: dynamicIsland.overlayTopOffset,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surfaceDark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.medium,
    zIndex: 1000,
  },
  
  // Tab bar styles
  tabBar: {
    backgroundColor: colors.surfaceDark,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    paddingTop: spacing.sm,
    height: Platform.OS === 'ios' ? verticalScale(84) : verticalScale(60),
  },
  
  // Header styles (Dynamic Island optimized)
  header: {
    backgroundColor: colors.surfaceDark,
    paddingHorizontal: spacing.md,
    paddingTop: dynamicIsland.headerTopPadding,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  
  headerWithDynamicIsland: {
    backgroundColor: colors.surfaceDark,
    paddingHorizontal: spacing.md,
    paddingTop: dynamicIsland.headerTopPadding + spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    minHeight: dynamicIsland.notificationAreaHeight,
  },
  
  headerTitle: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: deviceSize.hasDynamicIsland ? spacing.xs : 0,
  },
  
  // Dynamic Island status bar area
  statusBarArea: {
    height: dynamicIsland.statusBarHeight,
    backgroundColor: colors.backgroundDark,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: spacing.xs,
  },
  
  // List styles
  listItem: {
    backgroundColor: colors.surfaceDark,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  listItemText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  
  listItemSubtext: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  emptyStateText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  
  // Error styles
  errorContainer: {
    backgroundColor: colors.error + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  
  errorText: {
    color: colors.error,
    fontSize: typography.bodySmall,
    fontWeight: '500',
  },
  
  // Success styles
  successContainer: {
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  
  successText: {
    color: colors.success,
    fontSize: typography.bodySmall,
    fontWeight: '500',
  },
});

export default NativeAppStyles;