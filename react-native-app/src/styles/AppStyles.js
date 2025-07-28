import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
export const breakpoints = {
  small: 375,
  medium: 414,
  large: 768,
  xlarge: 1024
};

export const deviceSize = {
  isSmall: width < breakpoints.small,
  isMedium: width >= breakpoints.small && width < breakpoints.medium,
  isLarge: width >= breakpoints.medium && width < breakpoints.large,
  isXLarge: width >= breakpoints.large,
  isTablet: width >= breakpoints.large,
  width: width,
  height: height
};

// Responsive scaling functions
export const scale = (size) => {
  if (deviceSize.isSmall) return size * 0.85;
  if (deviceSize.isMedium) return size * 0.95;
  if (deviceSize.isLarge) return size;
  if (deviceSize.isXLarge) return size * 1.1;
  return size;
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
  // Primary Theme Colors
  primary: '#4f46e5',
  secondary: '#10b981',
  accent: '#8b5cf6',
  warning: '#f59e0b',
  error: '#ef4444',
  success: '#10b981',
  
  // Cyberpunk Theme Colors
  cyberpunkPrimary: '#C4D600',
  cyberpunkSecondary: '#00D4AA',
  cyberpunkAccent: '#FFD700',
  
  // Background Colors
  backgroundDark: '#0f172a',
  backgroundLight: '#f8fafc',
  surfaceDark: '#1e293b',
  surfaceLight: '#ffffff',
  
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
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    maxWidth: deviceSize.isTablet ? 400 : width - (spacing.lg * 2),
    width: '100%',
    ...shadows.large,
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
  
  // Header styles
  header: {
    backgroundColor: colors.surfaceDark,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  
  headerTitle: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
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